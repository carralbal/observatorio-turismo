# OBSERVATORIO DE TURISMO · SDE — Estado al 9 de abril 2026

## REPO Y ACCESO
- GitHub: https://github.com/carralbal/observatorio-turismo (privado)
- Local: /Users/diegocarralbal/observatorio-turismo
- Streamlit Cloud: URL pública deployada

## PARA RETOMAR
    git clone https://github.com/carralbal/observatorio-turismo
    cd observatorio-turismo
    python3 -m venv .venv && source .venv/bin/activate
    pip install -r requirements.txt
    streamlit run dashboard/app.py

## VARIABLES DE ENTORNO (.env — no sube a GitHub)
    YOUTUBE_API_KEY=...
    AIRROI_API_KEY=...

---

## PIPELINE COMPLETO
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
    python3 etl/modelo_eoh.py
    python3 etl/aplicar_modelo_eoh.py
    cd dbt/observatorio && dbt run && cd ../..
    python3 -c "
    import duckdb
    con = duckdb.connect('warehouse/observatorio.duckdb', read_only=True)
    tablas = {
        'mart_sde_pulso':               'dashboard/data_pulso.csv',
        'mart_sde_motogp':              'dashboard/data_motogp.csv',
        'mart_sde_benchmark':           'dashboard/data_benchmark.csv',
        'mart_nacional_macro':          'dashboard/data_macro.csv',
        'mart_sde_captura_valor':       'dashboard/data_captura.csv',
        'mart_nacional_madurez':        'dashboard/data_madurez.csv',
        'mart_sde_youtube':             'dashboard/data_youtube.csv',
        'mart_sde_pulso_estimado':      'dashboard/data_pulso_estimado.csv',
        'stg_airdna_sde':               'dashboard/data_airdna_sde.csv',
        'mart_sde_perfil_turista':      'dashboard/data_perfil_turista.csv',
        'mart_infra_aereo':             'dashboard/data_aereo.csv',
        'mart_infra_terrestre':         'dashboard/data_terrestre.csv',
        'raw_airdna_base':              'dashboard/data_informal.csv',
        'mart_infra_informal_termas':   'dashboard/data_informal_termas.csv',
    }
    for tabla, csv in tablas.items():
        con.execute(f'SELECT * FROM {tabla}').df().to_csv(csv, index=False)
        print(f'{tabla} → {csv}')
    con.close()
    "

---

## CONECTORES ACTIVOS (10)
| Conector | Fuente | Período |
|----------|--------|---------|
| sinta_eoh.py | EOH/SINTA | 2004-2025 |
| google_trends.py | Google Trends | 2014-2025 |
| bcra_fx.py | BCRA | 2004-2026 |
| anac_sde.py | ANAC/SINTA | 2017-2026 |
| cnrt.py | CNRT/SINTA | 2019-2024 |
| sinta_eti.py | ETI/SINTA | 2015-2026 |
| indec_ipc.py | INDEC IPC | 2016-2026 |
| youtube_api.py | YouTube Data API v3 | 2009-2026 |
| airroi.py | AirROI API | 2023-2026 |
| sinta_evyth.py | EVyTH/SINTA | 2012-2024 |

## DATOS MANUALES EN WAREHOUSE
- AirDNA xlsx — 80 mercados Argentina 2021-2026 (10 tablas)
- Archivos CSV en data/raw/airdna/ — NO suben a GitHub

---

## WAREHOUSE DUCKDB — MODELOS DBT (22 total)

### Staging (9)
stg_eoh_viajeros · stg_eoh_pernoctes · stg_trends_sde · stg_bcra_tcn
stg_anac_sde · stg_anac_nacional · stg_eti_serie · stg_airdna_sde · stg_ipc

### Marts SDE (8)
| Mart | Módulo |
|------|--------|
| mart_sde_pulso | M1 Pulso mensual |
| mart_sde_motogp | M5 Diff-in-diff MotoGP |
| mart_sde_benchmark | M2 Benchmark pares |
| mart_nacional_macro | M7 Receptivo/emisivo/balanza |
| mart_sde_captura_valor | M3 ICV estimado |
| mart_nacional_madurez | M8 Ranking 24 provincias |
| mart_sde_youtube | Imagen de destino |
| mart_sde_pulso_estimado | EOH estimada OLS 2026 |
| mart_sde_perfil_turista | M6 EVyTH perfil turista Norte |

### Marts Infraestructura (3)
| Mart | Descripción |
|------|-------------|
| mart_infra_aereo | Capa aérea nacional · ANAC 2017-2026 |
| mart_infra_terrestre | Capa terrestre · CNRT 2019-2024 |
| mart_infra_informal_termas | Informal Termas · AirDNA+AirROI 2021-2026 |

---

## MODELO OLS CALIBRADO
- Termas: R²=0.865 · MAE=6.570 · Variables: ANAC+Trends+TCN+IPC+AirDNA+estacionalidad
- Capital: R²=0.804 · MAE=1.738
- Modelos: models/modelos_eoh.pkl
- Scripts: etl/modelo_eoh.py · etl/aplicar_modelo_eoh.py

---

## DASHBOARD — 13 PÁGINAS EN PRODUCCIÓN
| Página | Módulo | Acceso |
|--------|--------|--------|
| app.py | M1 Pulso SDE | Público |
| 01_MotoGP.py | M5 MotoGP | Público |
| 02_Señal_Anticipada.py | M4 IBT | Público |
| 03_Benchmark.py | M2 Pares | Público |
| 04_Nacional.py | M7 Macro | Público |
| 05_Captura_de_Valor.py | M3 | Gestores |
| 06_Madurez.py | M8 | Gestores |
| 07_Imagen_Destino.py | YouTube | Público |
| 08_Pulso_Estimado.py | EOH 2026 | Público |
| 09_Perfil_Turista.py | M6 EVyTH | Público |
| 10_Infraestructura_Aerea.py | Capa aérea | Público |
| 11_Infraestructura_Terrestre.py | Capa terrestre | Público |
| 12_Infraestructura_Informal.py | Alquiler temporario | Público |

### Módulos compartidos
- dashboard/lecturas.py — cuadros azules con interpretación contextual
- Todas las páginas tienen: lectura prominente + filtro de fecha funcional

---

## HALLAZGOS CONFIRMADOS (15)
1. Termas estadía 2.84n — mayor del grupo de pares
2. Pico termal julio 2025: 87.658 viajeros (3× enero)
3. IBT julio 49/100 — predictor estacional confirmado
4. MotoGP 2025: +13.745 viajeros vs. baseline 2024
5. TCN feb 2026: $1.427 ARS/USD
6. Pasajeros aéreos SDE 2025: 242.599 — casi récord
7. Déficit turístico estructural — todos los meses 2025-2026
8. Marzo 2025: déficit 894.717 turistas
9. SDE 4° nacional en madurez — 1° del NOA
10. ICV estimado 38% — 14pp bajo Tucumán
11. IPC hoteles NOA supera al nacional desde 2023
12. YouTube: 517 videos · canal MotoGP domina histórico
13. Informal Termas: estadía 10 noches ene 2026
14. EOH estimada dic 2025: Termas 20.632 [9.783-31.482]
15. Corredor Tucumán-SDE cayó de 278K (2022) a 113K (2024) pasajeros terrestres
16. Flybondi CABA→SDE feb 2026: load factor 90.7% — ruta con demanda no satisfecha
17. SDE y Termas: +31% y +38% en asientos aéreos vs 2019 — entre los ganadores nacionales

---

## AUTOMATIZACIÓN
- GitHub Actions: .github/workflows/update_data.yml — cron día 25 cada mes 6am UTC
- Streamlit Cloud: actualización automática al hacer push

---

## PENDIENTE — PRIORIZADO

### EN CURSO (última sesión)
- [ ] Corregir KeyError listing_count en 12_Infraestructura_Informal.py
      rename faltó incluir listings → listing_count en el bloque de Termas
      FIX: agregar "listings": "listing_count" al dict del rename

### Alta prioridad
- [ ] OEDE empleo turístico provincial — cdn.produccion.gob.ar caído, reintentar
- [ ] Estrategia entrada SDE — documento político para acuerdo N2 DGR SDE
- [ ] Capa Federal — ampliar ANAC y CNRT a todas las provincias
      mart_nacional_benchmark_interprovincial
      Dashboard con selector de provincia + mapa coroplético

### Media prioridad
- [ ] Tarifas aéreas — Google Flights / Skyscanner API (pendiente investigación)
- [ ] AirROI multi-mercado — ampliar connector a otras provincias
- [ ] MotherDuck — warehouse en cloud
- [ ] Boletín PDF Quarto mensual
- [ ] TripAdvisor reviews como variable adicional del modelo OLS

### Baja prioridad
- [ ] Recalibrar modelo OLS cuando vuelva EOH oficial
- [ ] Replicar observatorio para otra provincia NOA
- [ ] EVyTH microdatos (dataset 2 — más granular)

### IDENTIDAD VISUAL FEHGRA — aplicar en próxima sesión
Replicar al 100% el estilo del informe FEHGRA 2025:
- Paleta 100% monocromática: negro #0F0F0F · gris #555555 · blanco #FFFFFF
- Sin color — gráficos en negro y gris oscuro únicamente
- Tipografía: Inter o Helvetica Neue · títulos 900 · cuerpo 400 · line-height 1.6
- KPIs grandes: 48-72px bold centrados con label descriptivo debajo
- Gráficos barras: negro/gris sin bordes · fondo blanco puro · sin grillas llamativas
- Donut/gauge: número grande al centro
- Portadas de sección: foto full-bleed oscura + overlay + texto blanco centrado
- Tablas sin bordes verticales · header negrita
- Footer fuentes en gris claro pequeño

### AGENDA CAPA FEDERAL (próxima sesión grande)
Fuentes ya nacionales listas:
- EOH 51 destinos · ETI · ANAC (mart_infra_aereo ya nacional)
- CNRT (mart_infra_terrestre ya tiene 131 pares)
- BCRA · IPC · AirDNA 80 mercados · AirROI
- mart_nacional_madurez 24 provincias

Fuentes a ampliar:
- ANAC — agregar queries por provincia al conector
- Google Trends — agregar queries por provincia
- AirROI — connector multi-mercado

Marts a construir:
- mart_nacional_benchmark_interprovincial
- mart_nacional_empleo_turismo (cuando vuelva OEDE)
- mart_nacional_conectividad (ANAC + CNRT consolidado)

---

## NOTAS TÉCNICAS
- .venv y warehouse/ NO suben a GitHub
- data/raw/airdna/ NO sube a GitHub
- CSVs del dashboard SÍ suben (bridge Streamlit Cloud)
- dbt corre desde dbt/observatorio/ con dbt run
- IBT = nombre propio para Google Trends procesado
- mart_infra_informal_termas combina AirDNA (occ 2021-2026) + AirROI (adr/rev/los/listings 2023-2026)
- AirDNA xlsx: occupancy desde 2021 · resto de variables solo desde 2024
