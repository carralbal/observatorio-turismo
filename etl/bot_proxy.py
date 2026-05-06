#!/usr/bin/env python3
"""Bot proxy — usa OpenAI gpt-4o-mini (barato). Puerto 8765."""
import json, os
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib import request as urllib_request
import duckdb
from pathlib import Path

WAREHOUSE = Path(__file__).parent.parent / "warehouse/observatorio.duckdb"
API_KEY = os.environ.get("OPENAI_API_KEY", "")

def get_context():
    try:
        con = duckdb.connect(str(WAREHOUSE), read_only=True)
        ctx = {}
        ctx['pulso'] = con.execute("SELECT localidad,anio,mes,viajeros_total,pernoctes_total FROM mart_sde_pulso WHERE flag_covid=0 ORDER BY fecha DESC LIMIT 24").df().to_dict('records')
        ctx['aereo'] = con.execute("SELECT anio,SUM(pasajeros) as pasajeros,SUM(asientos) as asientos FROM mart_infra_aereo WHERE origen_provincia='Santiago del Estero' OR destino_provincia='Santiago del Estero' GROUP BY anio ORDER BY anio DESC LIMIT 8").df().to_dict('records')
        ctx['terrestre'] = con.execute("SELECT anio,SUM(pasajeros) as pasajeros FROM mart_infra_terrestre WHERE flag_sde=1 GROUP BY anio ORDER BY anio DESC LIMIT 6").df().to_dict('records')
        ctx['empleo'] = con.execute("SELECT provincia,fecha,empleo_registrado FROM mart_infra_empleo_hyg WHERE fecha=(SELECT MAX(fecha) FROM mart_infra_empleo_hyg) ORDER BY empleo_registrado DESC LIMIT 10").df().to_dict('records')
        ctx['informal'] = con.execute("SELECT fecha,occ_pct_airroi,adr_ars,listings FROM mart_infra_informal_termas ORDER BY fecha DESC LIMIT 6").df().to_dict('records')
        ctx['captura'] = con.execute("SELECT fecha,viajeros_total,icv_pct FROM mart_sde_captura_valor WHERE flag_covid=0 ORDER BY fecha DESC LIMIT 6").df().to_dict('records')
        ctx['estimado'] = con.execute("SELECT fecha,localidad,viajeros,fuente FROM mart_sde_pulso_estimado ORDER BY fecha DESC LIMIT 6").df().to_dict('records')
        ctx['madurez'] = con.execute("SELECT provincia,score_madurez,ranking FROM mart_nacional_madurez ORDER BY score_madurez DESC").df().to_dict('records')
        con.close()
        return ctx
    except Exception as e:
        return {"error": str(e)}

SYSTEM = """Sos el asistente del Observatorio de Turismo de Santiago del Estero (Argentina).
Respondés preguntas sobre los datos turísticos usando los datos reales provistos.
Sos conciso y preciso. Citás fuente y período. No inventés datos. Respondés en español rioplatense."""

class Handler(BaseHTTPRequestHandler):
    ctx = None
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
        if Handler.ctx is None: Handler.ctx = get_context()
        ctx_str = json.dumps(Handler.ctx, ensure_ascii=False, default=str)[:10000]
        system_msg = SYSTEM + '\n\nDATOS:\n' + ctx_str
        messages = [{'role':'system','content':system_msg}] + body.get('messages',[])
        try:
            payload = json.dumps({'model':'gpt-4o-mini','max_tokens':600,'messages':messages}).encode()
            req = urllib_request.Request('https://api.openai.com/v1/chat/completions', data=payload,
                headers={'Content-Type':'application/json','Authorization':'Bearer '+API_KEY})
            with urllib_request.urlopen(req, timeout=30) as r:
                answer = json.loads(r.read())['choices'][0]['message']['content']
        except Exception as e:
            answer = f"Error: {e}"
        self.send_response(200)
        self.send_header('Content-Type','application/json')
        self.send_header('Access-Control-Allow-Origin','*')
        self.end_headers()
        self.wfile.write(json.dumps({'answer':answer}).encode())

if __name__ == '__main__':
    print(f"🤖  Bot proxy (gpt-4o-mini) en http://localhost:8765")
    if not API_KEY: print("⚠️  OPENAI_API_KEY no encontrada")
    else: print(f"✅  API key cargada")
    Handler.ctx = get_context()
    print(f"📊  Contexto: {sum(len(v) if isinstance(v,list) else 0 for v in Handler.ctx.values())} registros\n")
    HTTPServer(('localhost', 8765), Handler).serve_forever()
