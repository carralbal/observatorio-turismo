#!/usr/bin/env python3
"""Bot cloud — lee CSVs del repo en lugar del warehouse local."""
import json, os, re, sys
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib import request as urllib_request
from pathlib import Path
import duckdb

API_KEY  = os.environ.get("OPENAI_API_KEY", "")
PORT     = int(os.environ.get("PORT", 8765))
BASE     = Path(__file__).parent.parent
DATA_DIR = BASE / "frontend/public/data"

CSV_TABLES = {
    "mart_sde_pulso":               "data_pulso.csv",
    "mart_sde_pulso_estimado":      "data_pulso_estimado.csv",
    "mart_infra_aereo":             "data_aereo.csv",
    "mart_infra_terrestre":         "data_terrestre.csv",
    "mart_infra_empleo_hyg":        "data_empleo_hyg.csv",
    "mart_infra_informal_termas":   "data_informal_termas.csv",
    "mart_sde_captura_valor":       "data_captura.csv",
    "mart_nacional_madurez":        "data_madurez.csv",
    "mart_nacional_macro":          "data_macro.csv",
    "mart_sde_benchmark":           "data_benchmark.csv",
    "mart_sde_motogp":              "data_motogp.csv",
    "mart_sde_youtube":             "data_youtube.csv",
    "mart_sde_perfil_turista":      "data_perfil_turista.csv",
    "raw_trends_sde":               "data_trends.csv",
    "stg_airdna_sde":               "data_airdna_sde.csv",
}

DEFINICIONES = """
IBT = Índice de Búsqueda Turística. Proxy de demanda basado en Google Trends. Mide interés de búsqueda por "Termas de Río Hondo", escala 0-100. IBT>60 anticipa alta demanda en 4-8 semanas.

ICV = Índice de Captura de Valor = (ingreso capturado / ingreso potencial) × 100. ICV 38% = de cada $100 potenciales, $38 quedan registrados formalmente.

ISTP = Índice de Salud Turística Provincial. Ranking 24 provincias. Score 0-100. SDE 2025: 57.92, ranking 12°.

OLS = Modelo de regresión lineal que estima viajeros hoteleros. R²=0.868 Termas, R²=0.808 Capital. Vigente desde dic 2025 cuando INDEC discontinuó la EOH.

EOH = Encuesta de Ocupación Hotelera (INDEC). DISCONTINUADA diciembre 2025. Último dato: noviembre 2025.

Load Factor = pasajeros / asientos × 100. LF>80% aéreo = alta demanda.
Estadía media = pernoctes totales / viajeros totales.

FUENTES: ANAC=pasajeros aéreos, CNRT=buses (hasta 2024), SIPA-AFIP/OEDE=empleo HyG, AirDNA+AirROI=alquiler temporario, Google Trends=IBT, BCRA=tipo de cambio, INDEC ETI=turismo internacional.
NUNCA mencionar FEHGRA. Atribuir a INDEC/SIPA-AFIP/ANAC/CNRT/AirDNA/OEDE según corresponda.
"""

TABLE_DESCRIPTIONS = """
mart_sde_pulso: viajeros y pernoctes hoteleros mensuales (Termas / Capital). Fuente EOH. Hasta nov 2025.
mart_sde_pulso_estimado: estimación OLS de viajeros post-EOH. Incluye flag_estimado, intervalo de confianza.
mart_infra_aereo: pasajeros y asientos aéreos por ruta y aerolínea. Fuente ANAC.
mart_infra_terrestre: pasajeros y asientos de ómnibus por ruta. Fuente CNRT. Anual hasta 2024.
mart_infra_empleo_hyg: empleo registrado HyG por provincia y mes. Fuente SIPA-AFIP/OEDE.
mart_infra_informal_termas: alquiler temporario en Termas. Ocupación, ADR, listings. Fuente AirDNA/AirROI.
mart_sde_captura_valor: ICV mensual. Ingreso potencial vs capturado.
mart_nacional_madurez: ISTP 24 provincias. Score, ranking, trayectoria. SDE = es_sde=1 o provincia LIKE '%Santiago%'.
mart_nacional_macro: macro nacional, tipo de cambio, turismo emisivo/receptivo ETI, balanza turística.
mart_sde_benchmark: comparativa interprovincial NOA. Viajeros, pernoctes, estadía.
mart_sde_motogp: impacto MotoGP por edición.
mart_sde_youtube: imagen destino. Vistas, videos YouTube SDE.
mart_sde_perfil_turista: perfil EVyTH. Motivo, transporte, gasto del turista interno.
raw_trends_sde: IBT Google Trends mensual para Termas. Escala 0-100.
stg_airdna_sde: datos AirDNA por zona para Termas y Capital.
"""

def build_con():
    con = duckdb.connect()
    for table, csv_file in CSV_TABLES.items():
        path = DATA_DIR / csv_file
        if path.exists():
            con.execute(f"CREATE VIEW {table} AS SELECT * FROM read_csv_auto('{path}')")
    return con

def get_schema(con):
    tables = con.execute("SHOW TABLES").fetchall()
    schema = {}
    for (t,) in tables:
        try:
            cols = con.execute(f"DESCRIBE {t}").fetchall()
            schema[t] = [c[0] for c in cols]
        except:
            schema[t] = []
    return "\n".join(f"{t}: {', '.join(cols)}" for t, cols in schema.items())

def run_query(con, sql, max_rows=50):
    try:
        df = con.execute(sql).df().head(max_rows)
        return "Sin resultados." if df.empty else df.to_string(index=False)
    except Exception as e:
        return f"ERROR SQL: {e}"

def gpt(messages, max_tokens=600):
    payload = json.dumps({"model": "gpt-4o-mini", "max_tokens": max_tokens, "messages": messages}).encode()
    req = urllib_request.Request(
        "https://api.openai.com/v1/chat/completions", data=payload,
        headers={"Content-Type": "application/json", "Authorization": "Bearer " + API_KEY}
    )
    with urllib_request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())["choices"][0]["message"]["content"]

CON = build_con()
SCHEMA_STR = get_schema(CON)

SYSTEM_SQL = """Sos un generador de SQL para DuckDB. Dado un esquema y una pregunta, generás UNA query SQL válida.

DESCRIPCIÓN DE TABLAS:
""" + TABLE_DESCRIPTIONS + """

ESQUEMA COMPLETO:
{schema}

REGLAS:
- Respondé SOLO con SQL, sin explicaciones ni backticks.
- Si no requiere SQL, respondé: NO_SQL
- LIMIT 30 máximo.
- Si no hay tabla que responda la pregunta: NO_SQL
"""

SYSTEM_RESPUESTA = f"""Sos el asistente del Observatorio de Turismo de Santiago del Estero.

{DEFINICIONES}

REGLAS:
- Usá los datos para responder. Sé conciso y directo.
- Interpretá los números: si es bueno/malo, si mejoró/empeoró.
- Respondé en español rioplatense.
- Si el resultado es error o vacío: "no encontré ese dato".
- NUNCA menciones SQL ni queries.
"""

class Handler(BaseHTTPRequestHandler):
    def log_message(self, *a): pass

    def do_OPTIONS(self):
        self.send_response(200)
        for h, v in [("Access-Control-Allow-Origin","*"),("Access-Control-Allow-Methods","POST,OPTIONS"),("Access-Control-Allow-Headers","Content-Type")]:
            self.send_header(h, v)
        self.end_headers()

    def do_POST(self):
        if self.path != "/chat":
            self.send_response(404); self.end_headers(); return
        body    = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))))
        msgs    = body.get("messages", [])
        ultima  = msgs[-1]["content"] if msgs else ""
        sep     = "\n"
        ctx_str = sep.join(m["role"].upper()+": "+m["content"][:200] for m in msgs[-8:-1])
        pregunta = ("Historial:\n"+ctx_str+"\n\nPREGUNTA: "+ultima) if ctx_str else ultima
        try:
            sql_raw = gpt([{"role":"system","content":SYSTEM_SQL.format(schema=SCHEMA_STR)},{"role":"user","content":pregunta}], 300)
            sql     = re.sub(r"```sql|```","",sql_raw.strip()).strip()
            datos   = "(sin datos — pregunta conceptual)" if sql == "NO_SQL" or not sql else run_query(CON, sql)
            answer  = gpt([{"role":"system","content":SYSTEM_RESPUESTA},{"role":"user","content":f"Pregunta: {ultima}\n\nResultado:\n{datos}"}], 600)
        except Exception as e:
            answer = f"Error: {e}"
        self.send_response(200)
        self.send_header("Content-Type","application/json")
        self.send_header("Access-Control-Allow-Origin","*")
        self.end_headers()
        self.wfile.write(json.dumps({"answer": answer}).encode())

if __name__ == "__main__":
    print(f"✅ API key OK" if API_KEY else "⚠️ Sin OPENAI_API_KEY")
    print(f"📊 {len(CSV_TABLES)} tablas cargadas desde CSVs")
    print(f"🤖 Bot cloud en puerto {PORT}")
    HTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
