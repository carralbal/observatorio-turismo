#!/usr/bin/env python3
"""
Proxy local para el bot del Observatorio de Turismo SDE.
Corre en puerto 8765. Inicia con: python3 etl/bot_proxy.py
"""
import json, os
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib import request as urllib_request
import duckdb
from pathlib import Path

WAREHOUSE = Path(__file__).parent.parent / "warehouse/observatorio.duckdb"
API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")

def get_context():
    try:
        con = duckdb.connect(str(WAREHOUSE), read_only=True)
        ctx = {}
        ctx['pulso'] = con.execute("SELECT localidad,anio,mes,viajeros_total,pernoctes_total,estadia_promedio FROM mart_sde_pulso WHERE flag_covid=0 ORDER BY fecha DESC LIMIT 24").df().to_dict('records')
        ctx['aereo'] = con.execute("SELECT anio,SUM(pasajeros) as pasajeros,SUM(asientos) as asientos FROM mart_infra_aereo WHERE origen_provincia='Santiago del Estero' OR destino_provincia='Santiago del Estero' GROUP BY anio ORDER BY anio DESC LIMIT 8").df().to_dict('records')
        ctx['terrestre'] = con.execute("SELECT anio,SUM(pasajeros) as pasajeros,SUM(asientos) as asientos FROM mart_infra_terrestre WHERE flag_sde=1 GROUP BY anio ORDER BY anio DESC LIMIT 6").df().to_dict('records')
        ctx['empleo'] = con.execute("SELECT provincia,fecha,empleo_registrado FROM mart_infra_empleo_hyg WHERE fecha=(SELECT MAX(fecha) FROM mart_infra_empleo_hyg) ORDER BY empleo_registrado DESC LIMIT 10").df().to_dict('records')
        ctx['informal'] = con.execute("SELECT fecha,occ_pct_airroi,adr_ars,listings,los_dias FROM mart_infra_informal_termas ORDER BY fecha DESC LIMIT 12").df().to_dict('records')
        ctx['captura'] = con.execute("SELECT fecha,anio,viajeros_total,icv_pct,ingreso_potencial_usd FROM mart_sde_captura_valor WHERE flag_covid=0 ORDER BY fecha DESC LIMIT 12").df().to_dict('records')
        ctx['estimado'] = con.execute("SELECT fecha,localidad,viajeros,viajeros_ic_low,viajeros_ic_high,fuente FROM mart_sde_pulso_estimado ORDER BY fecha DESC LIMIT 8").df().to_dict('records')
        ctx['madurez'] = con.execute("SELECT provincia,score_madurez,nivel_label,ranking FROM mart_nacional_madurez ORDER BY score_madurez DESC").df().to_dict('records')
        con.close()
        return ctx
    except Exception as e:
        return {"error": str(e)}

SYSTEM = """Sos el asistente del Observatorio de Turismo de Santiago del Estero (Argentina).
Respondés preguntas sobre los datos turísticos usando los datos reales del warehouse DuckDB.
Sos conciso, preciso y usás los datos del contexto. Citás fuente y período al dar números.
Si no tenés el dato exacto, decilo y sugerí cómo obtenerlo. No inventés datos.
Respondés siempre en español rioplatense."""

class Handler(BaseHTTPRequestHandler):
    ctx = None

    def log_message(self, *args): pass

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        if self.path != '/chat':
            self.send_response(404); self.end_headers(); return

        length = int(self.headers.get('Content-Length', 0))
        body = json.loads(self.rfile.read(length))
        messages = body.get('messages', [])

        if Handler.ctx is None:
            Handler.ctx = get_context()

        ctx_str = json.dumps(Handler.ctx, ensure_ascii=False, default=str)[:14000]
        system = SYSTEM + '\n\nDATOS ACTUALES DEL WAREHOUSE:\n' + ctx_str

        try:
            payload = json.dumps({
                'model': 'claude-sonnet-4-20250514',
                'max_tokens': 1024,
                'system': system,
                'messages': messages,
            }).encode()

            req = urllib_request.Request(
                'https://api.anthropic.com/v1/messages',
                data=payload,
                headers={
                    'Content-Type': 'application/json',
                    'x-api-key': API_KEY,
                    'anthropic-version': '2023-06-01',
                }
            )
            with urllib_request.urlopen(req, timeout=30) as resp:
                result = json.loads(resp.read())
                answer = result['content'][0]['text']
        except Exception as e:
            answer = f"Error al consultar: {e}"

        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({'answer': answer}).encode())

if __name__ == '__main__':
    if not API_KEY:
        print("⚠️  ANTHROPIC_API_KEY no encontrada en .env")
        print("   Cargala con: export ANTHROPIC_API_KEY=sk-ant-...")
    else:
        print(f"✅  API key cargada")
    print("🤖  Bot proxy corriendo en http://localhost:8765")
    print("   Presioná Ctrl+C para detener\n")
    Handler.ctx = get_context()
    print(f"📊  Contexto cargado: {sum(len(v) if isinstance(v,list) else 0 for v in Handler.ctx.values())} registros")
    HTTPServer(('localhost', 8765), Handler).serve_forever()
