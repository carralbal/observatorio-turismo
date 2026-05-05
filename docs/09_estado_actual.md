# OBSERVATORIO DE TURISMO · SDE — Estado al 5 de mayo 2026

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
- app.py — Pulso SDE (REDISEÑADA: hero, donuts, deltas interanuales)
- 01_MotoGP.py
- 02_Señal_Anticipada.py
- 03_Benchmark.py
- 04_Nacional.py
- 05_Captura_de_Valor.py
- 06_Madurez.py
- 07_Imagen_Destino.py
- 08_Pulso_Estimado.py
- 09_Perfil_Turista.py
- 10_Infraestructura_Aerea.py (REDISEÑADA: donuts KPI, barras progreso, hero)
- 11_Infraestructura_Terrestre.py
- 12_Infraestructura_Informal.py
- 13_Empleo_HyG.py

### MÓDULOS COMPARTIDOS
- dashboard/style.py — CSS Inter, PLOTLY_LAYOUT, apply_layout(), apply_layout_dark(),
  lectura_destacada(), slider negro, constantes BAR_COLOR/LINE_COLOR/FILL_COLOR
- dashboard/lecturas.py — cuadros interpretación (legacy, no usado en páginas rediseñadas)

### CONECTORES (11)
sinta_eoh · google_trends · bcra_fx · anac_sde · cnrt · sinta_eti
indec_ipc · youtube_api · airroi · sinta_evyth · sipa_empleo

### DATOS EN WAREHOUSE (DuckDB local)
- AirDNA xlsx — 80 mercados · data/raw/airdna/
- SIPA/OEDE — 11 tablas · data/raw/sipa/
- Argendata TURISM — 6 tablas · data/raw/argendata/ (NUEVO 5-may-2026)
  raw_argendata_empleo_provincial (25 filas)
  raw_argendata_pernoctes_provincia (24 filas)
  raw_argendata_pib_turismo_comparado (1243 filas)
  raw_argendata_pasajeros_avion (276 filas)
  raw_argendata_turismo_interno_receptivo (28 filas)
  raw_argendata_balanza_turistica (147 filas)
(data/ es gitignored — regenerar con conectores o script de descarga)

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

## IDENTIDAD VISUAL — ESTADO

Estilo monocromático editorial (referencia: PDF Informe HyG 2019-2025):
- Paleta: #0F0F0F · #555555 · #FFFFFF
- Tipografía: Inter 900/400, tamaños grandes (4rem títulos hero)
- Hero: foto full-bleed + overlay + texto blanco (#hero-aerea con CSS scoped)
- KPIs: donuts SVG con número centrado + barras de progreso horizontales
- Gráficos: barras negro/gris, sin color, apply_layout() estándar
- Secciones fondo gris #F5F5F5 para encabezados de gráficos
- Slider: CSS forzado negro (pendiente: no toma en todas las versiones de Streamlit)

COMPLETADO:
- style.py: base completa con apply_layout, apply_layout_dark, slider CSS
- app.py: rediseñada (hero, lectura_destacada, KPIs con deltas, donut IBT)
- 10_Infraestructura_Aerea.py: rediseñada (donuts, barras progreso, hero con #hero-aerea)

PENDIENTE VISUAL:
- Hero de app.py: texto aparece negro por CSS global !important (mismo bug que Aerea tenía)
- Slider rojo: el CSS inyectado no toma en todas las instancias de Streamlit
- 12 páginas restantes sin rediseñar (01 a 09, 11, 12, 13)

---

## PENDIENTE — PRIORIZADO

### P0 — Bugs visuales activos
1. Hero app.py: aplicar fix #hero-pulso con CSS scoped (igual que #hero-aerea)
2. Slider rojo: investigar override CSS de Streamlit 1.x theme config (config.toml)

### P1 — Rediseño visual (12 páginas restantes)
3. Extender identidad a páginas 01-09, 11, 12, 13
   Patrón: hero + lectura_destacada + donuts/KPIs + apply_layout + caption fuentes
   Orden sugerido: 11_Terrestre → 12_Informal → 13_Empleo → 01-09

### P2 — Capa Federal + Argendata
4. Modelos dbt para raw_argendata_* (staging + mart)
5. mart_nacional_benchmark_interprovincial
   - Combinar: sipa_panel_provincias + sipa_eoh_provincia + argendata empleo/pernoctes
   - Dashboard con selector de provincia + mapa coroplético 24 provincias
6. Exportar nuevos marts a dashboard/*.csv

### P3 — Presentación Smart City Expo (20-21 mayo 2026)
7. Localizar proyecto React/Vite en Mac
8. Incorporar slide comparativa: Observatorio SDE vs otras iniciativas AR
   (Argendata, SINTA/Yvera, SIT Buenos Aires, Obs. Chubut, datos.gob.ar)
9. Incorporar datos Argendata como evidencia (PIB turístico comparado)
10. Construir panel de presenter notes

### P4 — Estrategia política
11. Documento N2 para acuerdo DGR SDE

### P5 — Media prioridad
- Tarifas aéreas (Google Flights / Skyscanner)
- AirROI multi-mercado
- MotherDuck warehouse en cloud
- Boletín PDF Quarto mensual

### P6 — Baja prioridad
- Recalibrar OLS cuando vuelva EOH
- Replicar para otra provincia NOA
- EVyTH microdatos

---

## REGLA CRÍTICA
NUNCA mencionar "FEHGRA" — datos se atribuyen a INDEC/SIPA-AFIP/ANAC/CNRT

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
    python3 /tmp/load_argendata.py
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
