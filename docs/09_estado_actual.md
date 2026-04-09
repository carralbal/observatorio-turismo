# OBSERVATORIO DE TURISMO · SDE — Estado al 9 de abril 2026 — HANDOFF

## REPO Y ACCESO
- GitHub: https://github.com/carralbal/observatorio-turismo (privado)
- Local: /Users/diegocarralbal/observatorio-turismo
- Streamlit Cloud: share.streamlit.io

## PARA RETOMAR
    cd /Users/diegocarralbal/observatorio-turismo
    source .venv/bin/activate
    streamlit run dashboard/app.py

## VARIABLES DE ENTORNO (.env)
    YOUTUBE_API_KEY=...
    AIRROI_API_KEY=...

---

## LO QUE HAY HOY

### DASHBOARD — 14 PÁGINAS EN PRODUCCIÓN
- app.py — Pulso SDE (EN REDISEÑO — identidad visual monocromática)
- 01_MotoGP.py
- 02_Señal_Anticipada.py
- 03_Benchmark.py
- 04_Nacional.py
- 05_Captura_de_Valor.py
- 06_Madurez.py
- 07_Imagen_Destino.py
- 08_Pulso_Estimado.py
- 09_Perfil_Turista.py
- 10_Infraestructura_Aerea.py
- 11_Infraestructura_Terrestre.py
- 12_Infraestructura_Informal.py
- 13_Empleo_HyG.py

### MÓDULOS COMPARTIDOS
- dashboard/style.py — identidad visual monocromática (EN DESARROLLO)
- dashboard/lecturas.py — cuadros azules interpretación contextual

### CONECTORES (11)
sinta_eoh · google_trends · bcra_fx · anac_sde · cnrt · sinta_eti
indec_ipc · youtube_api · airroi · sinta_evyth · sipa_empleo

### DATOS EN WAREHOUSE
- AirDNA xlsx — 80 mercados · data/raw/airdna/
- SIPA/OEDE — 11 tablas · data/raw/sipa/
(estos directorios NO suben a GitHub — regenerar con los conectores)

### MODELOS DBT (23)
Staging: stg_eoh_viajeros · stg_eoh_pernoctes · stg_trends_sde
stg_bcra_tcn · stg_anac_sde · stg_anac_nacional · stg_eti_serie · stg_airdna_sde

Marts SDE: mart_sde_pulso · mart_sde_motogp · mart_sde_benchmark
mart_nacional_macro · mart_sde_captura_valor · mart_nacional_madurez
mart_sde_youtube · mart_sde_pulso_estimado · mart_sde_perfil_turista

Marts Infraestructura: mart_infra_aereo · mart_infra_terrestre
mart_infra_informal_termas · mart_infra_empleo_hyg

### MODELO OLS
- Termas: R²=0.865 · Capital: R²=0.804
- models/modelos_eoh.pkl

---

## EN CURSO AL MOMENTO DEL HANDOFF

### IDENTIDAD VISUAL — PRIORIDAD 1
Replicar estilo PDF monocromático al 100%:
- Paleta: negro #0F0F0F · gris #555555 · blanco #FFFFFF
- Sin color en gráficos — todo negro/gris
- Tipografía: Inter · títulos 900 · cuerpo 400 · TODO 50% más grande
- Portadas: foto full-bleed oscura + overlay negro + texto blanco
- KPIs: número grande bold en caja gris (#F5F5F5)
- Gráficos donuts para indicadores circulares
- Secciones con fondo negro (#0F0F0F) y texto blanco
- Iconos flat (emojis estilizados)
- Imágenes Unsplash libres (hoteles, gastronomía, transporte, destinos)

ESTADO: app.py tiene una primera versión del rediseño.
style.py tiene la base CSS + PLOTLY_LAYOUT + apply_layout() + lectura_destacada()
TAREA: revisar app.py, aprobar el look, y extender a las otras 13 páginas.

REGLA IMPORTANTE — FUENTES PROHIBIDAS:
- NUNCA mencionar "FEHGRA" — los datos se atribuyen a INDEC/SIPA-AFIP/ANAC/CNRT

---

## PENDIENTE

### Alta prioridad
1. Completar identidad visual en las 14 páginas (continuar desde app.py)
2. Capa Federal — mart_nacional_benchmark_interprovincial
   - Dashboard con selector de provincia
   - Mapa coroplético 24 provincias
   - Datos ya en warehouse: sipa_panel_provincias · sipa_eoh_provincia
     sipa_cabotaje_provincia · sipa_terrestre_prov · mart_infra_empleo_hyg
3. Estrategia entrada SDE (N2) — documento político DGR SDE

### Media prioridad
- Tarifas aéreas (Google Flights / Skyscanner)
- AirROI multi-mercado
- MotherDuck warehouse en cloud
- Boletín PDF Quarto mensual

### Baja prioridad
- Recalibrar OLS cuando vuelva EOH
- Replicar para otra provincia NOA
- EVyTH microdatos

---

## PIPELINE COMPLETO PARA REGENERAR TODO
    source .venv/bin/activate
    python3 etl/connectors/sinta_eoh.py
    python3 etl/connectors/google_trends.py
    python3 etl/connectors/bcra_fx.py
    python3 etl/connectors/anac_sde.py
    python3 etl/connectors/cnrt.py
    python3 etl/connectors/sinta_eti.py
    python3 etl/connectors/indec_ipc.py
    python3 etl/connectors/youtube_api.py
    python3 etl/connectors/airroi.py
    python3 etl/connectors/sinta_evyth.py
    python3 etl/connectors/sipa_empleo.py
    python3 etl/modelo_eoh.py
    python3 etl/aplicar_modelo_eoh.py
    cd dbt/observatorio && dbt run && cd ../..
    python3 -c "
    import duckdb
    con = duckdb.connect('warehouse/observatorio.duckdb', read_only=True)
    exports = {
        'mart_sde_pulso':             'dashboard/data_pulso.csv',
        'mart_sde_motogp':            'dashboard/data_motogp.csv',
        'mart_sde_benchmark':         'dashboard/data_benchmark.csv',
        'mart_nacional_macro':        'dashboard/data_macro.csv',
        'mart_sde_captura_valor':     'dashboard/data_captura.csv',
        'mart_nacional_madurez':      'dashboard/data_madurez.csv',
        'mart_sde_youtube':           'dashboard/data_youtube.csv',
        'mart_sde_pulso_estimado':    'dashboard/data_pulso_estimado.csv',
        'stg_airdna_sde':             'dashboard/data_airdna_sde.csv',
        'mart_sde_perfil_turista':    'dashboard/data_perfil_turista.csv',
        'mart_infra_aereo':           'dashboard/data_aereo.csv',
        'mart_infra_terrestre':       'dashboard/data_terrestre.csv',
        'raw_airdna_base':            'dashboard/data_informal.csv',
        'mart_infra_informal_termas': 'dashboard/data_informal_termas.csv',
        'mart_infra_empleo_hyg':      'dashboard/data_empleo_hyg.csv',
    }
    for tabla, csv in exports.items():
        con.execute(f'SELECT * FROM {tabla}').df().to_csv(csv, index=False)
        print(f'{tabla} → {csv}')
    con.close()
    "
