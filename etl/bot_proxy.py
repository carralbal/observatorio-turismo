#!/usr/bin/env python3
"""Bot proxy — SQL dinámico. GPT genera query → DuckDB ejecuta → GPT interpreta. Puerto 8765."""
import json, os, re
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib import request as urllib_request
import duckdb
from pathlib import Path

BASE = Path(__file__).parent.parent
WAREHOUSE = BASE / "warehouse/observatorio.duckdb"
API_KEY = os.environ.get("OPENAI_API_KEY", "")

DEFINICIONES = """
IBT = Índice de Búsqueda Turística. Proxy de demanda basado en Google Trends. Mide interés de búsqueda por "Termas de Río Hondo", escala 0-100. IBT>60 anticipa alta demanda en 4-8 semanas. NO es bienestar ni satisfacción.

ICV = Índice de Captura de Valor = (ingreso capturado / ingreso potencial) × 100. ICV 38% = de cada $100 potenciales, $38 quedan registrados formalmente. Resto = economía informal, consumo fuera del destino o alojamiento no registrado.

ISTP = Índice de Salud Turística Provincial. Ranking 24 provincias por madurez del ecosistema de datos turísticos. 9 dimensiones binarias. Score_madurez escala 1-5.

OLS = Modelo de regresión lineal que estima viajeros hoteleros. Predictores: ANAC, AirROI, IBT, IPC NOA, BCRA, estacionalidad, empleo SIPA. R²=0.868 Termas, R²=0.808 Capital. Vigente desde dic 2025 cuando INDEC discontinuó la EOH.

EOH = Encuesta de Ocupación Hotelera (INDEC). DISCONTINUADA diciembre 2025. Último dato: noviembre 2025.

Load Factor = pasajeros / asientos × 100. LF>80% aéreo = alta demanda. LF>70% buses = alto.
Estadía media = pernoctes totales / viajeros totales (noches promedio por visita).
N1/N2/N3 = niveles ICV. N1=proxy estimado (error 20-35%). N2=dato fiscal IIBB (error 8-15%). N3=encuesta directa (error 3-7%).

FUENTES: ANAC=pasajeros aéreos, CNRT=buses (hasta 2024), SIPA-AFIP/OEDE=empleo HyG (hasta Q3 2025), AirDNA+AirROI=alquiler temporario, Google Trends=IBT, BCRA=tipo de cambio, INDEC ETI=turismo internacional, EVyTH=perfil turista interno.
NUNCA mencionar FEHGRA. Atribuir datos a INDEC/SIPA-AFIP/ANAC/CNRT/AirDNA/OEDE según corresponda.
"""

def get_schema():
    try:
        con = duckdb.connect(str(WAREHOUSE), read_only=True)
        tables = con.execute(
            "SELECT table_name FROM information_schema.tables WHERE table_schema='main' ORDER BY table_name"
        ).fetchall()
        schema = {}
        for (t,) in tables:
            cols = con.execute(f"DESCRIBE {t}").fetchall()
            schema[t] = [c[0] for c in cols]
        con.close()
        return schema
    except Exception as e:
        return {"error": str(e)}

def run_query(sql, max_rows=50):
    try:
        con = duckdb.connect(str(WAREHOUSE), read_only=True)
        df = con.execute(sql).df().head(max_rows)
        con.close()
        if df.empty:
            return "Sin resultados."
        return df.to_string(index=False)
    except Exception as e:
        return f"ERROR SQL: {e}"

def gpt(messages, max_tokens=600):
    payload = json.dumps({
        'model': 'gpt-4o-mini',
        'max_tokens': max_tokens,
        'messages': messages
    }).encode()
    req = urllib_request.Request(
        'https://api.openai.com/v1/chat/completions',
        data=payload,
        headers={'Content-Type': 'application/json', 'Authorization': 'Bearer ' + API_KEY}
    )
    with urllib_request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())['choices'][0]['message']['content']

SCHEMA = {}
SCHEMA_STR = ""


TABLE_DESCRIPTIONS = """
mart_sde_pulso: viajeros y pernoctes hoteleros mensuales por localidad (Termas / Capital). Fuente EOH INDEC. Hasta nov 2025.
mart_sde_pulso_estimado: estimación OLS de viajeros post-EOH. Incluye IBT, ocupación informal, intervalo de confianza.
mart_infra_aereo: pasajeros y asientos aéreos por ruta, aerolínea, origen/destino. Fuente ANAC.
mart_infra_terrestre: pasajeros y asientos de ómnibus por ruta. Fuente CNRT. Datos anuales hasta 2024.
mart_infra_empleo_hyg: empleo registrado en Hotelería y Gastronomía por provincia y mes. Fuente SIPA-AFIP/OEDE.
mart_infra_informal_termas: alquiler temporario en Termas. Ocupación, ADR, listings. Fuente AirDNA/AirROI.
mart_sde_captura_valor: ICV (Índice de Captura de Valor) mensual. Ingreso potencial vs capturado.
mart_nacional_madurez: RANKING NACIONAL de las 24 provincias por madurez de datos turísticos (ISTP). Incluye score, nivel, ranking, dimensiones activas. SDE = es_sde=1.
mart_nacional_macro: macro nacional, tipo de cambio, turismo emisivo/receptivo ETI, balanza turística.
mart_sde_benchmark: comparativa interprovincial NOA. Viajeros, pernoctes, estadía por provincia.
mart_sde_motogp: impacto MotoGP. Uplift DiD vs baseline, viajeros por edición.
mart_sde_youtube: imagen destino. Vistas, videos, categorías YouTube SDE.
mart_sde_perfil_turista: perfil EVyTH. Motivo, transporte, gasto, estadía del turista interno.
raw_trends_sde: IBT Google Trends mensual para Termas de Río Hondo. Escala 0-100.
stg_airdna_sde: datos AirDNA crudos por barrio/zona para Termas y Capital.
stg_eti_serie: serie ETI turismo internacional Argentina.
"""

SYSTEM_SQL = """Sos un generador de SQL para DuckDB. Dado un esquema de tablas y una pregunta, generás UNA query SQL válida para responderla.

DESCRIPCIÓN DE TABLAS (usá esto para mapear preguntas a tablas):
""" + TABLE_DESCRIPTIONS + """

ESQUEMA COMPLETO (columnas):
{schema}

REGLAS:
- Respondé SOLO con la query SQL, sin explicaciones, sin markdown, sin backticks.
- Si la pregunta no requiere SQL (saludos, preguntas sobre definiciones, etc), respondé exactamente: NO_SQL
- Usá LIMIT 30 máximo.
- Para comparaciones temporales usá LAG() o subconsultas.
- Para año anterior calculá diferencia interanual.
- Fechas en formato DATE. Provincias con tildes como están en la tabla.
- Si no hay tabla que responda la pregunta, respondé: NO_SQL
"""

SYSTEM_RESPUESTA = f"""Sos el asistente del Observatorio de Turismo de Santiago del Estero (Argentina).

{DEFINICIONES}

REGLAS:
- Usá los datos del resultado para responder. Sé conciso y directo.
- Interpretá los números: decí si es bueno/malo, si mejoró/empeoró, comparalo con contexto.
- Respondé en español rioplatense.
- Si el resultado es error o vacío, decí "no encontré ese dato en el warehouse".
- NUNCA menciones SQL ni queries en tu respuesta.
"""

class Handler(BaseHTTPRequestHandler):
    def log_message(self, *a): pass

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST,OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        if self.path != '/chat':
            self.send_response(404)
            self.end_headers()
            return

        body = json.loads(self.rfile.read(int(self.headers.get('Content-Length', 0))))
        messages = body.get('messages', [])
        ultima_pregunta = messages[-1]['content'] if messages else ''

        # Construir contexto conversacional (ultimas 4 interacciones)
        historial = messages[-8:] if len(messages) > 1 else messages
        sep = chr(10)
        ctx_str = sep.join(m["role"].upper() + ": " + m["content"][:200] for m in historial[:-1])
        pregunta_con_ctx = ("Historial:" + sep + ctx_str + sep + sep + "PREGUNTA ACTUAL: " + ultima_pregunta) if ctx_str else ultima_pregunta

        try:
            sql_raw = gpt([
                {'role': 'system', 'content': SYSTEM_SQL.format(schema=SCHEMA_STR)},
                {'role': 'user', 'content': pregunta_con_ctx}
            ], max_tokens=300)

            sql = sql_raw.strip()

            if sql == 'NO_SQL' or not sql:
                datos_ctx = "(sin datos — pregunta conceptual)"
            else:
                sql = re.sub(r'```sql|```', '', sql).strip()
                datos_ctx = run_query(sql)

            answer = gpt([
                {'role': 'system', 'content': SYSTEM_RESPUESTA},
                {'role': 'user', 'content': f"Pregunta: {ultima_pregunta}\n\nResultado del warehouse:\n{datos_ctx}"}
            ], max_tokens=600)

        except Exception as e:
            answer = f"Error: {e}"

        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({'answer': answer}).encode())


if __name__ == '__main__':
    print("✅ API key cargada" if API_KEY else "⚠️ OPENAI_API_KEY no encontrada")
    print("📂 Cargando esquema del warehouse...")
    SCHEMA = get_schema()
    if "error" in SCHEMA:
        print(f"⚠️  Error esquema: {SCHEMA['error']}")
    else:
        SCHEMA_STR = "\n".join(
            f"{t}: {', '.join(cols)}" for t, cols in SCHEMA.items()
        )
        print(f"📊 {len(SCHEMA)} tablas disponibles")
    print("🤖 Bot proxy SQL dinámico (gpt-4o-mini) en http://localhost:8765\n")
    HTTPServer(('localhost', 8765), Handler).serve_forever()
