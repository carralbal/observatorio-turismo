#!/bin/bash
# Observatorio de Turismo SDE — pipeline de actualización automática
# Cron: 0 3 * * * cd /Users/diegocarralbal/observatorio-turismo && bash etl/update_all.sh

cd /Users/diegocarralbal/observatorio-turismo
source .venv/bin/activate

LOG="logs/update_$(date +%Y%m%d_%H%M%S).log"
mkdir -p logs

echo "=== INICIO $(date) ===" | tee -a $LOG

# ── 1. Connectors ────────────────────────────────────────────────────────────
python3 etl/connectors/google_trends.py   >> $LOG 2>&1
python3 etl/connectors/anac_sde.py        >> $LOG 2>&1
python3 etl/connectors/bcra_fx.py         >> $LOG 2>&1
python3 etl/connectors/airroi.py          >> $LOG 2>&1
python3 etl/connectors/cnrt.py            >> $LOG 2>&1
python3 etl/connectors/indec_ipc.py       >> $LOG 2>&1
python3 etl/connectors/sinta_eti.py       >> $LOG 2>&1
python3 etl/connectors/youtube_api.py     >> $LOG 2>&1
python3 etl/connectors/sinta_evyth.py     >> $LOG 2>&1
python3 etl/connectors/sinta_eoh.py       >> $LOG 2>&1
python3 etl/connectors/sipa_empleo_oede.py >> $LOG 2>&1

# ── 2. dbt ───────────────────────────────────────────────────────────────────
echo "--- dbt run ---" | tee -a $LOG
cd dbt/observatorio && dbt run >> $LOG 2>&1
if [ $? -ne 0 ]; then
    echo "ERROR: dbt falló. Abortando." | tee -a $LOG
    exit 1
fi
cd ../..

# ── 3. Modelo OLS (debe correr DESPUÉS de dbt) ───────────────────────────────
echo "--- modelo OLS ---" | tee -a $LOG
python3 etl/aplicar_modelo_eoh.py >> $LOG 2>&1

# ── 4. Exportar CSVs al frontend ─────────────────────────────────────────────
echo "--- export CSVs ---" | tee -a $LOG
python3 -c "
import duckdb
con = duckdb.connect('warehouse/observatorio.duckdb', read_only=True)
exports = {
    'mart_sde_pulso':             'frontend/public/data/data_pulso.csv',
    'mart_sde_motogp':            'frontend/public/data/data_motogp.csv',
    'mart_sde_benchmark':         'frontend/public/data/data_benchmark.csv',
    'mart_nacional_macro':        'frontend/public/data/data_macro.csv',
    'mart_sde_captura_valor':     'frontend/public/data/data_captura.csv',
    'mart_nacional_madurez':      'frontend/public/data/data_madurez.csv',
    'mart_sde_youtube':           'frontend/public/data/data_youtube.csv',
    'mart_sde_pulso_estimado':    'frontend/public/data/data_pulso_estimado.csv',
    'mart_sde_perfil_turista':    'frontend/public/data/data_perfil_turista.csv',
    'mart_infra_aereo':           'frontend/public/data/data_aereo.csv',
    'mart_infra_terrestre':       'frontend/public/data/data_terrestre.csv',
    'mart_infra_informal_termas': 'frontend/public/data/data_informal_termas.csv',
    'mart_infra_empleo_hyg':      'frontend/public/data/data_empleo_hyg.csv',
    'stg_airdna_sde':             'frontend/public/data/data_airdna_sde.csv',
}
for tabla, csv in exports.items():
    try:
        df = con.execute(f'SELECT * FROM {tabla}').df()
        df.to_csv(csv, index=False)
        print(f'  ✓ {tabla} → {len(df)} filas')
    except Exception as e:
        print(f'  ✗ {tabla}: {e}')
con.close()
" >> $LOG 2>&1

# ── 5. Git commit + push ─────────────────────────────────────────────────────
echo "--- git push ---" | tee -a $LOG
git add frontend/public/data/ etl/ >> $LOG 2>&1
git diff --cached --quiet || git commit -m "data: actualización automática $(date +%Y-%m-%d)" >> $LOG 2>&1
git push >> $LOG 2>&1

# ── 6. Deploy Vercel ─────────────────────────────────────────────────────────
echo "--- vercel deploy ---" | tee -a $LOG
cd frontend && vercel deploy --prod >> $LOG 2>&1
cd ..

echo "=== FIN $(date) ===" | tee -a $LOG
