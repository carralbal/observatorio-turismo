#!/usr/bin/env python3
"""Bot proxy — gpt-4o-mini + definiciones hardcoded + datos warehouse. Puerto 8765."""
import json, os
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib import request as urllib_request
import duckdb
from pathlib import Path

BASE = Path(__file__).parent.parent
WAREHOUSE = BASE / "warehouse/observatorio.duckdb"
API_KEY = os.environ.get("OPENAI_API_KEY", "")

DEFINICIONES = """
DEFINICIONES EXACTAS DEL OBSERVATORIO (usá SOLO estas, nunca tu conocimiento general):

IBT = Índice de Búsqueda Turística. Es un proxy de demanda basado en Google Trends. Mide el interés de búsqueda en Google por "Termas de Río Hondo", escala 0-100 relativa al pico histórico. NO es bienestar, NO es satisfacción. IBT>60 anticipa alta demanda en 4-8 semanas.

ICV = Índice de Captura de Valor = (ingreso capturado / ingreso potencial) × 100. Ingreso potencial = pernoctes × gasto diario medio EVyTH. Ingreso capturado = estimación de IIBB SDE sector turismo. Un ICV de 38% significa que de cada $100 potenciales, $38 quedan registrados formalmente. El resto es economía informal, consumo fuera del destino o alojamiento no registrado.

ISTP = Índice de Salud Turística Provincial. Ranking de las 24 provincias argentinas por madurez de su ecosistema de datos turísticos. Se construye evaluando 9 dimensiones binarias (0=no tiene, 1=tiene): 1) EOH o encuesta hotelera propia, 2) Datos de conectividad aérea, 3) Empleo registrado OEDE, 4) Tablero público de datos, 5) Actualización mensual, 6) Fuente fiscal propia N2 (IIBB), 7) Medición de eventos, 8) Señales anticipadas, 9) Ciclo institucional. El score_bruto es la suma de estas 9 dimensiones (máximo 9). El score_madurez normaliza ese score en escala 1-5.

OLS = Modelo de regresión lineal calibrado con datos EOH 2018-2025. Estima viajeros hoteleros usando predictores: pasajeros ANAC, ocupación AirROI, IBT Google Trends, IPC R+H NOA, tipo de cambio BCRA, estacionalidad y empleo SIPA. R²=0.868 Termas, R²=0.808 Capital. Vigente desde dic 2025 cuando INDEC discontinuó la EOH.

EOH = Encuesta de Ocupación Hotelera. Publicada por INDEC. DISCONTINUADA en diciembre 2025. Último dato: noviembre 2025.

Load Factor = pasajeros / asientos × 100. LF>80% en aéreo es alta demanda. LF>70% en buses es alto.

Estadía media = pernoctes totales / viajeros totales (noches promedio por visita).

N1/N2/N3 = niveles de calidad del ICV. N1=estimación proxy (disponible hoy, error 20-35%). N2=dato fiscal IIBB SDE (requiere convenio DGR, error 8-15%). N3=encuesta directa aeropuerto/terminal (error 3-7%).

FUENTES: ANAC=pasajeros aéreos, CNRT=buses larga distancia (datos hasta 2024), SIPA-AFIP/OEDE=empleo HyG (hasta Q3 2025), AirDNA+AirROI=alquiler temporario, Google Trends=IBT, BCRA=tipo de cambio, INDEC ETI=turismo internacional, EVyTH=perfil turista interno NOA.
"""

def get_warehouse_data():
    try:
        con = duckdb.connect(str(WAREHOUSE), read_only=True)
        ctx = {}
        ctx['pulso'] = con.execute("SELECT localidad,anio,mes,viajeros_total,pernoctes_total,estadia_promedio FROM mart_sde_pulso WHERE flag_covid=0 ORDER BY fecha DESC LIMIT 12").df().to_dict('records')
        ctx['aereo'] = con.execute("SELECT anio,SUM(pasajeros) as pasajeros,SUM(asientos) as asientos FROM mart_infra_aereo WHERE origen_provincia='Santiago del Estero' OR destino_provincia='Santiago del Estero' GROUP BY anio ORDER BY anio DESC LIMIT 8").df().to_dict('records')
        ctx['terrestre'] = con.execute("SELECT anio,SUM(pasajeros) as pasajeros FROM mart_infra_terrestre WHERE flag_sde=1 GROUP BY anio ORDER BY anio DESC LIMIT 6").df().to_dict('records')
        ctx['empleo'] = con.execute("SELECT provincia,fecha,empleo_registrado FROM mart_infra_empleo_hyg WHERE fecha=(SELECT MAX(fecha) FROM mart_infra_empleo_hyg) ORDER BY empleo_registrado DESC LIMIT 10").df().to_dict('records')
        ctx['informal'] = con.execute("SELECT fecha,occ_pct_airroi,adr_ars,listings FROM mart_infra_informal_termas ORDER BY fecha DESC LIMIT 6").df().to_dict('records')
        ctx['captura'] = con.execute("SELECT fecha,viajeros_total,icv_pct FROM mart_sde_captura_valor WHERE flag_covid=0 ORDER BY fecha DESC LIMIT 6").df().to_dict('records')
        ctx['estimado'] = con.execute("SELECT fecha,localidad,viajeros,viajeros_ic_low,viajeros_ic_high FROM mart_sde_pulso_estimado ORDER BY fecha DESC LIMIT 6").df().to_dict('records')
        ctx['madurez'] = con.execute("SELECT provincia,score_bruto,score_madurez,nivel_label,tiene_eoh,tiene_anac,tiene_oede,tiene_tablero,actualiza_mensual,tiene_n2,mide_eventos,tiene_anticipacion,ciclo_institucional,es_sde,ranking FROM mart_nacional_madurez ORDER BY score_madurez DESC").df().to_dict('records')
        ctx['ibt'] = con.execute("SELECT fecha,\"Termas de Río Hondo\" as ibt_termas FROM raw_trends_sde ORDER BY fecha DESC LIMIT 6").df().to_dict('records')
        con.close()
        return ctx
    except Exception as e:
        return {"error": str(e)}

SYSTEM = f"""Sos el asistente del Observatorio de Turismo de Santiago del Estero (Argentina).

{DEFINICIONES}

REGLAS CRÍTICAS:
- Cuando pregunten qué es algo (IBT, ICV, ISTP, OLS, etc): usá EXACTAMENTE las definiciones de arriba. NUNCA uses tu conocimiento general.
- Cuando pregunten cómo se calcula algo: usá las fórmulas y metodologías de arriba.
- Cuando pregunten valores o datos: usá los datos del warehouse.
- Respondé en español rioplatense, de forma concisa.
- Si el dato no está ni en las definiciones ni en el warehouse, decí "esa información no está disponible en el observatorio actualmente".

DATOS DEL WAREHOUSE (valores actuales):
{{datos}}
"""

class Handler(BaseHTTPRequestHandler):
    warehouse_data = None
    def log_message(self, *a): pass
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin','*')
        self.send_header('Access-Control-Allow-Methods','POST,OPTIONS')
        self.send_header('Access-Control-Allow-Headers','Content-Type')
        self.end_headers()
    def do_POST(self):
        if self.path != '/chat': self.send_response(404); self.end_headers(); return
        body = json.loads(self.rfile.read(int(self.headers.get('Content-Length',0))))
        datos_str = json.dumps(Handler.warehouse_data, ensure_ascii=False, default=str)[:10000]
        system = SYSTEM.format(datos=datos_str)
        try:
            payload = json.dumps({'model':'gpt-4o-mini','max_tokens':800,
                'messages':[{'role':'system','content':system}]+body.get('messages',[])}).encode()
            req = urllib_request.Request('https://api.openai.com/v1/chat/completions',data=payload,
                headers={'Content-Type':'application/json','Authorization':'Bearer '+API_KEY})
            with urllib_request.urlopen(req,timeout=30) as r:
                answer = json.loads(r.read())['choices'][0]['message']['content']
        except Exception as e:
            answer = f"Error: {e}"
        self.send_response(200)
        self.send_header('Content-Type','application/json')
        self.send_header('Access-Control-Allow-Origin','*')
        self.end_headers()
        self.wfile.write(json.dumps({'answer':answer}).encode())

if __name__ == '__main__':
    print("✅ API key cargada" if API_KEY else "⚠️ OPENAI_API_KEY no encontrada")
    Handler.warehouse_data = get_warehouse_data()
    total = sum(len(v) if isinstance(v,list) else 0 for v in Handler.warehouse_data.values())
    print(f"📊 Warehouse: {total} registros")
    print("🤖 Bot proxy (gpt-4o-mini) en http://localhost:8765\n")
    HTTPServer(('localhost',8765),Handler).serve_forever()
