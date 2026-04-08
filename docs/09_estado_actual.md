# 09 · ESTADO ACTUAL DEL BUILD
## Sesión 8 de abril 2026 — checkpoint final 18:30hs

---

## Repo

GitHub: https://github.com/carralbal/observatorio-turismo (privado)
Local:  /Users/diegocarralbal/observatorio-turismo
Branch: main

## Para retomar en cualquier Mac

    git clone https://github.com/carralbal/observatorio-turismo
    cd observatorio-turismo
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
    streamlit run dashboard/app.py

## Para correr el pipeline completo

    source .venv/bin/activate
    python3 etl/connectors/sinta_eoh.py
    python3 etl/connectors/google_trends.py
    python3 etl/connectors/bcra_fx.py
    python3 etl/connectors/anac_sde.py
    python3 etl/connectors/cnrt.py
    python3 etl/connectors/sinta_eti.py
    cd dbt/observatorio && dbt run && cd ../..
    python3 -c "
    import duckdb
    con = duckdb.connect('warehouse/observatorio.duckdb', read_only=True)
    con.execute('SELECT * FROM mart_sde_pulso').df().to_csv('dashboard/data_pulso.csv', index=False)
    con.execute('SELECT * FROM mart_sde_motogp').df().to_csv('dashboard/data_motogp.csv', index=False)
    con.execute('SELECT * FROM mart_sde_benchmark').df().to_csv('dashboard/data_benchmark.csv', index=False)
    con.execute('SELECT * FROM mart_nacional_macro').df().to_csv('dashboard/data_macro.csv', index=False)
    con.execute('SELECT * FROM mart_sde_captura_valor').df().to_csv('dashboard/data_captura.csv', index=False)
    con.execute('SELECT * FROM mart_nacional_madurez').df().to_csv('dashboard/data_madurez.csv', index=False)
    con.close()
    "
    streamlit run dashboard/app.py

---

## Warehouse — tablas en DuckDB

### Raw (12 tablas)
| Tabla | Filas | Período |
|-------|-------|---------|
| raw_eoh_viajeros_localidad | 14.064 | 2004-2025 |
| raw_eoh_pernoctes_localidad | 14.064 | 2004-2025 |
| raw_eoh_estadia_destino | 4.767 | 2004-2025 |
| raw_eoh_toh_region_categoria | 5.845 | 2004-2025 |
| raw_trends_sde | 144 | 2014-2025 |
| raw_bcra_tcn | 135 | 2004-2026 |
| raw_anac_sde | 12.496 | 2017-2026 |
| raw_cnrt_pares | 559 | 2019-2024 |
| raw_eti_receptivo | 5.238 | 2004-2025 |
| raw_eti_emisivo | 3.294 | 2004-2025 |
| raw_eti_balanza | 3.294 | 2004-2025 |
| raw_eti_serie_mensual | 122 | 2015-2026 |

### Staging (6 modelos)
stg_eoh_viajeros · stg_eoh_pernoctes · stg_trends_sde · stg_bcra_tcn · stg_anac_sde · stg_eti_serie

### Marts (6 modelos)
| Mart | Módulo | Descripción |
|------|--------|-------------|
| mart_sde_pulso | M1 | Pulso mensual Termas + Capital |
| mart_sde_motogp | M5 | Diff-in-diff MotoGP 2018-2025 |
| mart_sde_benchmark | M2 | SDE vs 6 provincias pares |
| mart_nacional_macro | M7 | Receptivo · emisivo · balanza · TCN |
| mart_sde_captura_valor | M3 | ICV estimado 38% |
| mart_nacional_madurez | M8 | Ranking 24 provincias — SDE 4° nacional |

---

## Dashboard — 7 páginas en producción (Streamlit Cloud)

| Página | Módulo | Acceso |
|--------|--------|--------|
| app.py — Pulso SDE | M1 | Público |
| 01_MotoGP.py | M5 | Público |
| 02_Señal_Anticipada.py | M4 | Público |
| 03_Benchmark.py | M2 | Público |
| 04_Nacional.py | M7 | Público |
| 05_Captura_de_Valor.py | M3 | 🔒 Gestores |
| 06_Madurez.py | M8 | 🔒 Gestores |

---

## Hallazgos confirmados con datos reales

1. Termas estadía promedio 2.84 noches — mayor del grupo de pares
2. Pico termal julio 2025: 87.658 viajeros (3x enero)
3. IBT julio 2025: 49/100 — confirma predictor estacional
4. MotoGP 2025 uplift: +13.745 viajeros vs. baseline 2024
5. TCN febrero 2026: $1.427 ARS/USD
6. Pasajeros aéreos SDE 2025: 242.599 — casi récord
7. Balanza turística: déficit en todos los meses 2025-2026
8. Marzo 2025: peor mes — déficit 894.717 turistas
9. SDE 4° en madurez nacional con 3.7/5 — 1° del NOA
10. ICV estimado SDE: 38% — 14pp por debajo de Tucumán (52%)

---

## Pendiente

### Alta prioridad
- [ ] GitHub Actions — cron mensual automático
- [ ] MotherDuck — warehouse en cloud
- [ ] requirements.txt completo

### Media prioridad
- [ ] OEDE empleo (servidor caído — reintentar)
- [ ] IPC Restaurantes y Hoteles
- [ ] EVyTH — perfil turista interno
- [ ] Boletín PDF Quarto

### N2 — Acuerdo SDE
- [ ] Estrategia entrada Secretaría de Turismo SDE
- [ ] Acuerdo DGR SDE — IIBB por rubro
- [ ] Calendario de eventos SDE

---

## Notas técnicas

- .venv y warehouse/ NO se suben a GitHub (.gitignore)
- CSVs del dashboard SÍ se suben (bridge para Streamlit Cloud)
- Nuevo conector: seguir patrón de etl/connectors/sinta_eoh.py
- dbt corre desde dbt/observatorio/ con dbt run
- Streamlit Cloud se actualiza automáticamente al hacer push
