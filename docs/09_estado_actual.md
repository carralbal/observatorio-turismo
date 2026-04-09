# 09 · ESTADO ACTUAL DEL BUILD
## Sesión 9 de abril 2026 — checkpoint final

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

## Variables de entorno requeridas (.env — NO sube a GitHub)

    YOUTUBE_API_KEY=...   # Google Cloud Console
    AIRROI_API_KEY=...    # airroi.com/api/developer

## Pipeline completo

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
    con.execute('SELECT * FROM mart_sde_youtube').df().to_csv('dashboard/data_youtube.csv', index=False)
    con.execute('SELECT * FROM mart_sde_pulso_estimado').df().to_csv('dashboard/data_pulso_estimado.csv', index=False)
    con.execute('SELECT * FROM stg_airdna_sde').df().to_csv('dashboard/data_airdna_sde.csv', index=False)
    con.close()
    "
    streamlit run dashboard/app.py

---

## Conectores activos (9)

| Conector | Fuente | Filas | Período |
|----------|--------|-------|---------|
| sinta_eoh.py | EOH/SINTA | 38.740 | 2004-2025 |
| google_trends.py | Google Trends | 144 | 2014-2025 |
| bcra_fx.py | BCRA | 135 | 2004-2026 |
| anac_sde.py | ANAC/SINTA | 12.496 | 2017-2026 |
| cnrt.py | CNRT/SINTA | 559 | 2019-2024 |
| sinta_eti.py | ETI/SINTA | 12.048 | 2015-2026 |
| indec_ipc.py | INDEC IPC | 111 | 2016-2026 |
| youtube_api.py | YouTube Data API v3 | 517 | 2009-2026 |
| airroi.py | AirROI API | 36 | 2023-2026 |

## Datos manuales en warehouse

| Tabla | Fuente | Filas |
|-------|--------|-------|
| raw_airdna_base | AirDNA xlsx | 4.800 |
| raw_airdna_occupancy | AirDNA xlsx | 4.800 |
| raw_airdna_markets | AirDNA xlsx | 80 mercados |
| raw_airdna_* (8 tablas) | AirDNA xlsx | ~1.920 c/u |

NOTA: Los CSVs de AirDNA van en data/raw/airdna/ — no suben a GitHub.
Para regenerarlos usar el Excel original Base_Relacionada_Airdna_2026.xlsx

## Marts activos (8)

| Mart | Módulo |
|------|--------|
| mart_sde_pulso | M1 Pulso SDE |
| mart_sde_motogp | M5 MotoGP diff-in-diff |
| mart_sde_benchmark | M2 Benchmark pares |
| mart_nacional_macro | M7 Macro Argentina |
| mart_sde_captura_valor | M3 Captura de valor |
| mart_nacional_madurez | M8 Madurez provincial |
| mart_sde_youtube | Imagen de destino |
| mart_sde_pulso_estimado | EOH estimada 2026 |

## Dashboard — 9 páginas en producción

| Página | Módulo | Acceso |
|--------|--------|--------|
| app.py | M1 Pulso SDE | Público |
| 01_MotoGP.py | M5 MotoGP | Público |
| 02_Señal_Anticipada.py | M4 IBT | Público |
| 03_Benchmark.py | M2 Pares | Público |
| 04_Nacional.py | M7 Macro | Público |
| 07_Imagen_Destino.py | YouTube | Público |
| 08_Pulso_Estimado.py | EOH 2026 | Público |
| 05_Captura_de_Valor.py | M3 | Gestores |
| 06_Madurez.py | M8 | Gestores |

## Automatización

GitHub Actions: .github/workflows/update_data.yml
Cron: dia 25 de cada mes 6am UTC

---

## Hallazgos confirmados con datos reales

1. Termas estadia 2.84n — mayor del grupo de pares
2. Pico termal julio 2025: 87.658 viajeros (3x enero)
3. IBT julio 49/100 — confirma predictor estacional
4. MotoGP 2025: +13.745 viajeros vs. baseline 2024
5. TCN feb 2026: $1.427 ARS/USD
6. Pasajeros aereos SDE 2025: 242.599 — casi record
7. Deficit turistico en todos los meses 2025-2026
8. Marzo 2025: deficit 894.717 turistas
9. SDE 4 en madurez nacional — 1 del NOA
10. ICV estimado 38% — 14pp bajo Tucuman
11. IPC hoteles NOA supera al nacional desde 2023
12. YouTube: 517 videos, canal MotoGP domina historico
13. Sector informal Termas: estadia promedio 10 noches ene 2026
14. AirROI marzo 2026: occ 16%, ADR $137.131 ARS

---

## Pendiente

- OEDE empleo — reintentar (cdn.produccion.gob.ar caido)
- EVyTH perfil turista interno
- Estrategia entrada SDE — acuerdo N2 DGR SDE
- MotherDuck — warehouse en cloud
- Boletin PDF Quarto

---

## Notas tecnicas

- .venv y warehouse/ NO se suben a GitHub
- data/raw/airdna/ NO sube a GitHub (datos manuales)
- CSVs del dashboard SI suben (bridge para Streamlit Cloud)
- dbt corre desde dbt/observatorio/ con dbt run
- Streamlit Cloud se actualiza automaticamente al hacer push
- GitHub Actions corre el dia 25 de cada mes

---

## AGENDA PRÓXIMA SESIÓN

### OEDE Empleo turístico provincial
- cdn.produccion.gob.ar caído — reintentar mañana
- URL objetivo: puestos_priv.csv por provincia y clae2
- CLAE2 55 = alojamiento · 56 = gastronomía
- Alternativa disponible: infra.datos.gob.ar (nacional sin provincia)
- Alternativa disponible: SINTA tableros.yvera.tur.ar/empleo.html

### CAPA NACIONAL / FEDERAL — prioridad alta próxima sesión
Revisar que todas las fuentes tengan cobertura nacional completa:

FUENTES YA NACIONALES (✅ listas para capa federal):
- EOH — 51 destinos · todas las provincias
- ETI — total país
- ANAC — todos los aeropuertos Argentina
- CNRT — todos los corredores Argentina
- BCRA — nacional
- IPC — nacional + regiones (NOA, Pampeana, etc)
- AirDNA xlsx — 80 mercados Argentina (ya en warehouse)
- AirROI API — cualquier mercado Argentina
- YouTube — búsquedas nacionales ampliables
- mart_nacional_madurez — ya tiene 24 provincias

FUENTES QUE NECESITAN REVISIÓN PARA CAPA FEDERAL:
- ANAC microdatos — filtrar por provincia origen/destino (no solo SDE)
- CNRT — ampliar filtro más allá del NOA
- Google Trends — agregar queries para otras provincias
- AirROI — agregar connectors para cada provincia

MARTS A CONSTRUIR PARA CAPA FEDERAL:
- mart_nacional_benchmark_interprovincial (24 provincias)
- mart_nacional_empleo_turismo (cuando vuelva OEDE)
- mart_nacional_conectividad (ANAC + CNRT todas las provincias)
- mart_nacional_informal (AirDNA 80 mercados)

DASHBOARD FEDERAL:
- Página nacional con selector de provincia
- Ranking interprovincial de todos los indicadores
- Mapa coroplético de madurez + ocupación + viajeros


---

## AGENDA PRÓXIMA SESIÓN

### OEDE Empleo turístico provincial
- cdn.produccion.gob.ar caído — reintentar mañana
- URL objetivo: puestos_priv.csv por provincia y clae2
- CLAE2 55 = alojamiento · 56 = gastronomía
- Alternativa disponible: infra.datos.gob.ar (hoteleria_restaurantes nacional)
- Alternativa disponible: SINTA tableros.yvera.tur.ar/empleo.html (manual)

### CAPA NACIONAL / FEDERAL — prioridad alta próxima sesión
Revisar cobertura nacional de todas las fuentes:

FUENTES YA NACIONALES (listas):
- EOH — 51 destinos · todas las provincias
- ETI — total país receptivo/emisivo
- ANAC microdatos — todos los aeropuertos Argentina
- CNRT — todos los corredores Argentina
- BCRA — nacional
- IPC — nacional + NOA + regiones
- AirDNA xlsx — 80 mercados Argentina (en warehouse)
- AirROI API — cualquier mercado Argentina on demand
- mart_nacional_madurez — ya tiene 24 provincias

FUENTES A AMPLIAR PARA CAPA FEDERAL:
- ANAC — hoy filtrado solo SDE, ampliar a todas las provincias
- CNRT — hoy filtrado NOA+pares, ampliar a todo el país
- Google Trends — agregar queries por provincia
- AirROI — connector multi-mercado

MARTS A CONSTRUIR:
- mart_nacional_benchmark_interprovincial
- mart_nacional_empleo_turismo (cuando vuelva OEDE)
- mart_nacional_conectividad (ANAC + CNRT todas las provincias)
- mart_nacional_informal (AirDNA 80 mercados ya disponibles)

DASHBOARD FEDERAL:
- Selector de provincia interactivo
- Ranking interprovincial de todos los indicadores
- Mapa coroplético madurez + ocupación + viajeros

## SESIÓN 9 ABRIL 2026 — RESUMEN FINAL

CONSTRUIDO HOY:
- Modelo OLS calibrado R²=0.865 Termas / R²=0.804 Capital
- EOH estimada dic 2025 → mar 2026 con IC 80%
- AirDNA 80 mercados → warehouse (10 tablas)
- AirROI conector corregido — 36 meses con percentiles
- EVyTH + mart_perfil_turista — 2012-2024
- Gasto turista deflactado a USD por TCN
- Lecturas prominentes en todas las páginas
- Filtros de fecha funcionales en todas las páginas
- Reescritura completa de las 10 páginas del dashboard

PENDIENTE PRÓXIMA SESIÓN:
- OEDE empleo (reintentar — servidor caído)
- Capa Nacional / Federal
- Estrategia entrada SDE (N2)
- Boletín PDF Quarto

### CAPA DE INFRAESTRUCTURA — agenda futura

Vistas temáticas profundas, cada una como módulo independiente.

#### 1. TRANSPORTE AÉREO
Fuentes: ANAC microdatos · IATA · Aeropuertos Argentina
Variables: vuelos, asientos ofrecidos, pasajeros, load factor,
frecuencias, hubs de origen, rutas, tarifas, cabotaje vs internacional,
residentes vs no residentes, estacionalidad por ruta
Filtros: aeropuerto origen/destino, aerolínea, período (día/semana/mes/año),
tipo de vuelo, tipo de pasajero
Análisis: conectividad, dependencia de hubs, rutas faltantes,
comparación con pares, evolución post-COVID

#### 2. TRANSPORTE TERRESTRE
Fuentes: CNRT microdatos · OpenStreetMap
Variables: frecuencias, empresas, rutas, pasajeros, tarifas,
tiempos de viaje, origen/destino, corredores
Filtros: corredor, empresa, período, origen/destino
Análisis: accesibilidad terrestre, competencia modal,
rutas sin servicio, estacionalidad

#### 3. SECTOR INFORMAL / ALQUILER TEMPORARIO
Fuentes: AirDNA (80 mercados) · AirROI · EVyTH
Variables: listings activos, ocupación, ADR, RevPAR, LOS,
lead time, revenue, precio percentiles, estacionalidad,
comparación mercados, crecimiento del inventario
Filtros: mercado, período, métrica
Análisis: tamaño del informal vs formal, perfil del huésped,
pricing strategy, comparación con EOH

#### 4. PLAZAS HOTELERAS
Fuentes: EOH (plazas disponibles) · SINTA establecimientos
Variables: plazas totales, habitaciones, categoría estrella,
tasa de ocupación plazas, tasa ocupación habitaciones,
RevPAR, tarifa media diaria, evolución del stock
Filtros: destino, categoría, período
Análisis: oferta vs demanda, inversión hotelera,
brechas de categoría, comparación pares

#### 5. GASTRONOMÍA
Fuentes: OEDE (CLAE2 56) · AFIP monotributo · OpenStreetMap
Variables: establecimientos activos, empleo, ventas estimadas,
densidad gastronómica, categorías (resto/bar/fast food),
estacionalidad, apertura/cierre de locales
Filtros: municipio, tipo, período
Análisis: capacidad gastronómica vs flujo turístico,
formalización, empleo sectorial

#### 6. CONECTIVIDAD DIGITAL
Fuentes: ENACOM · ITU
Variables: cobertura 4G/5G, velocidad banda ancha,
penetración smartphone, cobertura en destinos turísticos
Análisis: infraestructura digital para turismo,
brechas de conectividad en zonas turísticas

IMPLEMENTACIÓN SUGERIDA:
- Cada tema = una página del dashboard
- Datos ya disponibles: aéreo (ANAC) + terrestre (CNRT) + informal (AirDNA/AirROI)
- Datos a conseguir: plazas hoteleras detalle + gastronomía OEDE
- Prioridad: Aéreo primero (más datos disponibles y más impacto)

### IDENTIDAD VISUAL FEHGRA — REPLICAR EN DASHBOARD
Prioridad: Alta — próxima sesión de diseño

Objetivo: replicar al 100% el estilo visual del informe FEHGRA 2025
(PDFs: Informe Hotelería Gastronomía + Empleo + Clase Zero)

PALETA MONOCROMÁTICA:
- Fondo portadas: #000000 (negro puro)
- Fondo contenido: #FFFFFF
- Texto principal: #0F0F0F
- Texto secundario: #555555
- Gráficos primarios: #1A1A1A
- Gráficos secundarios: #4A4A4A
- Cero color — 100% blanco/negro/gris

TIPOGRAFÍA:
- Familia: Inter (Google Fonts) o Helvetica Neue
- Títulos portada: 64-80px · weight 900 · blanco
- Títulos contenido: 32-40px · weight 700
- Subtítulos: 20-24px · weight 600
- Cuerpo: 16px · weight 400 · line-height 1.6
- KPIs: 48-72px · weight 900

GRÁFICOS:
- Barras horizontales/verticales negras o gris oscuro
- Sin grillas · fondo blanco puro
- Donut/gauge: negro + gris claro · número grande al centro
- Líneas con puntos marcados
- Tablas sin bordes verticales · header negrita

LAYOUT:
- Una columna central · márgenes generosos
- Portadas sección: foto full-bleed oscura + overlay + texto blanco centrado
- KPIs en 3-4 columnas
- Footer fuentes en gris claro pequeño

APLICAR EN:
- Todas las páginas del dashboard
- Futura capa de informes PDF Quarto
- Presentaciones institucionales
