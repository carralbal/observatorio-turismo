# OBSERVATORIO DE TURISMO · SDE — Estado al 7 de mayo 2026

## REPO Y ACCESO
- GitHub: https://github.com/carralbal/observatorio-turismo (privado)
- Local: /Users/diegocarralbal/observatorio-turismo
- Vercel: https://observatorio-e7nz8fzpj-carralbals-projects.vercel.app
- Frontend dev: cd frontend && npm run dev → localhost:5173

## PARA RETOMAR
    cd /Users/diegocarralbal/observatorio-turismo
    source .venv/bin/activate
    cd frontend && npm run dev

## VARIABLES DE ENTORNO (.env)
    YOUTUBE_API_KEY=...
    AIRROI_API_KEY=...
    OPENAI_API_KEY=...  ← bot proxy

---

## FRONTEND REACT — ESTADO ACTUAL

### STACK
- React 18 + Vite + Recharts + Papaparse + Lucide React
- Design system: ADDFISH — Plus Jakarta Sans · Ink #0A0A0A · Paper #FAFAF7 · Slate #3A3A36 · Stone #C8C8BF · Volt #FFFF00
- Datos: frontend/public/data/*.csv
- Logos aerolíneas: frontend/public/logos/ (AR, AV, FO, JA, LA, OY — PNG locales)
- Logos fuentes: frontend/public/logos/fuentes/ (indec, sipa, anac, cnrt, google, bcra, airdna, oede)

### PÁGINAS — 15 COMPLETADAS ✅
| Ruta | Archivo | Estado |
|------|---------|--------|
| / | Home.jsx | ✅ hero+escudo, KPIs, BrechaSection, donut IBT, CTA volt. DarkMetrics eliminado. |
| /aerea | Aerea.jsx | ✅ KPIs, trend, ranking aerolíneas con logos flat, rutas, LF con texto profundo |
| /terrestre | Terrestre.jsx | ✅ KPIs, barras anuales, rutas, LF con texto profundo |
| /empleo | Empleo.jsx | ✅ |
| /informal | Informal.jsx | ✅ |
| /imagen | Imagen.jsx | ✅ |
| /estimado | Estimado.jsx | ✅ |
| /motogp | MotoGP.jsx | ✅ |
| /señal | Senal.jsx | ✅ |
| /benchmark | Benchmark.jsx | ✅ |
| /captura | Captura.jsx | ✅ |
| /madurez | Madurez.jsx | ✅ |
| /perfil | Perfil.jsx | ✅ |
| /nacional | Nacional.jsx | ✅ |
| /fuentes | Fuentes.jsx | ✅ página premium de fuentes |

### CAMBIOS SESIÓN 7-MAY-2026
- DarkMetrics eliminado de Home (duplicaba KPIs)
- Ranking aerolíneas: BarChart reemplazado por lista premium con logos locales (Google Flights CDN descargados)
- Logos aerolíneas: AR, FO, LA, AV, JA, OY en frontend/public/logos/
- LF aéreo: texto profundo con benchmark industria argentina (75-78%) + implicancia gestión
- LF terrestre: texto profundo con benchmark NOA (55-65%) + contraste vs LF aéreo + multimodalidad
- Íconos KPI: size 18→23 (+30%) en todas las páginas
- Ticker fuentes: revertido a texto (logos favicon no legibles a ese tamaño)

### BOT NLP
- Proxy Python: etl/bot_proxy.py (puerto 8765)
- Modelo: OpenAI gpt-4o-mini
- Ícono: robot negro sobre volt, flotante
- Definiciones: IBT, ICV, ISTP, OLS hardcodeadas
- Pendiente: enriquecer knowledge base

### ARQUITECTURA CLAVE
- Atoms.jsx: C={ink,paper,paper2,slate,stone,volt}, Paralelo, VoltLine, Eyebrow, SectionTitle, Interpretacion, Loading, ICONS
- Layout.jsx: nav fijo + dropdown 4 capas + footer ticker fuentes
- PeriodoContext.jsx: selector anio/mes global, default TODO
- useCSV.js: hook papaparse → {data, loading}
- App.jsx: router completo 15 rutas

### NAV — 4 CAPAS
- CAPA 1 ACTIVIDAD: Pulso SDE, Aérea, Terrestre, MotoGP
- CAPA 2 SEÑALES: Señal IBT, Informal, Imagen Destino
- CAPA 3 ESTRUCTURA Y VALOR: Empleo, Captura, Perfil, Benchmark
- CAPA 4 DECISIÓN: Estimado OLS, Madurez, Nacional

---

## BACKEND — WAREHOUSE

### CONECTORES ACTIVOS (11)
sinta_eoh · google_trends · bcra_fx · anac_sde · cnrt
sinta_eti · indec_ipc · youtube_api · airroi · sinta_evyth · sipa_empleo

### MODELOS DBT (23)
Staging: stg_eoh_viajeros · stg_eoh_pernoctes · stg_trends_sde
stg_bcra_tcn · stg_anac_sde · stg_anac_nacional · stg_eti_serie · stg_airdna_sde

Marts SDE: mart_sde_pulso · mart_sde_motogp · mart_sde_benchmark
mart_nacional_macro · mart_sde_captura_valor · mart_nacional_madurez
mart_sde_youtube · mart_sde_pulso_estimado · mart_sde_perfil_turista

Marts Infra: mart_infra_aereo · mart_infra_terrestre
mart_infra_informal_termas · mart_infra_empleo_hyg

### MODELO OLS
- Termas: R²=0.865 · Capital: R²=0.804
- models/modelos_eoh.pkl

### DATOS ARGENDATA (cargados manualmente)
- raw_argendata_empleo_provincial (25 filas)
- raw_argendata_pernoctes_provincia (24 filas)
- raw_argendata_pib_turismo_comparado (1243 filas)
- raw_argendata_pasajeros_avion (276 filas)
- raw_argendata_turismo_interno_receptivo (28 filas)
- raw_argendata_balanza_turistica (147 filas)

---

## ESTADO DE FUENTES — 7 MAY 2026

| Fuente | Tabla | Hasta | Estado |
|--------|-------|-------|--------|
| EOH viajeros (SINTA) | mart_sde_pulso | nov 2025 | DISCONTINUADA definitivo |
| Pasajeros aéreos (ANAC) | mart_infra_aereo | mar 2026 | OK — actualizado hoy |
| Tráfico terrestre (CNRT) | mart_infra_terrestre | 2024 | anual — sin mensual por ruta |
| Alquiler informal (AirROI) | mart_infra_informal_termas | abr 2026 | OK |
| Google Trends IBT | stg_trends_sde | dic 2025 | RATE LIMIT — correr madrugada |
| Pulso estimado OLS | mart_sde_pulso_estimado | mar 2026 | OK — gap 1 mes |
| Empleo HyG (SIPA) | mart_infra_empleo_hyg | Q3 2025 | OK |
| Macro BCRA/IPC | mart_nacional_macro | mar 2026 | OK |
| ETI turismo intl | stg_eti_serie | mar 2026 | OK |
| EVyTH perfil turista | mart_sde_perfil_turista | abr 2024 | OK — lag normal |
| Imagen destino (YouTube) | mart_sde_youtube | may 2026 | OK — 521 videos |

---

## BACKLOG UI/UX — PENDIENTES

### PULSO SDE (Home)
- Título hero → "Pulso Santiago del Estero"
- PARADOJA ESTRUCTURAL: textos más grandes
- CTA "EXPLORÁ LAS DIMENSIONES": font light, 40% más pequeña
- Escudo: 50% más pequeño, sin transparencia, al lado del título hero
- EVALUAR: agregar indicador(es) adicionales al bloque KPIs

### AÉREA
- Flybondi logo: verificar que carga (FO.png descargado pero podría no matchear nombre exacto en datos)

### TERRESTRE
- Rediseñar gráfico barras pasajeros anuales — evaluar tipo de gráfico alternativo

### MOTOGP
- Rediseñar gráfico impacto por edición y gráfico ANAC — sin barras ni colores actuales

### SEÑAL IBT
- Textos cajas "Guía de interpretación": más grandes

### INFORMAL
- No mostrar períodos en 0 antes de mar 2023

### EMPLEO
- Video hero: +20% brillo

### CAPTURA
- ICV 38% constante: evaluar línea plana vs solo número
- Hoja de ruta N1-N3: letra más grande
- Párrafo explicativo en "La brecha de valor"

### PERFIL
- Modo transporte y motivo: font más grande + ícono flat blanco por item

### BENCHMARK
- Rediseñar gráfico trayectoria — sin barras gruesas ni colores actuales

### ESTIMADO
- Extender a abril 2026
- Fix superposición observado vs estimado

### MADUREZ
- Reemplazar ranking ISTP (mapa o cuadrantes)
- Agregar fecha de cálculo, evolución 2019-2026, explicación ISTP
- Hoja de ruta: texto más grande

### NACIONAL
- Balanza deficitaria en negativo
- Datos hasta feb 2026 — buscar actualizados
- Rediseñar gráfico saldo divisas

### GENERAL — TODAS LAS SECCIONES
- Íconos flat blanco/volt en conceptos, indicadores, items
- Contraste: C.slate mínimo para texto secundario sobre paper
- Carrusel fuentes: evaluar alternativa a texto (logos no funcionaron con favicons)
- Nueva sección ALOJAMIENTO FORMAL (PUNA)

### CONTENIDO
- Interpretaciones profundas por indicador (composición + benchmark + implicancia)
- Bot NLP: enriquecer knowledge base con benchmarks

---

## PENDIENTES ESTRATÉGICOS

### 🔴 Smart City Expo 20-21 mayo
- Datos para actualizar: Google Trends (madrugada), airroi, bcra, eti
- Presentación v5.5 — 29 slides, 5 actos

### 🔵 Mediano plazo
- Toggle HISTÓRICO / HOY por página
- Nav capas: rediseñar dropdown
- Deploy auto: Vercel conectado a GitHub (push = deploy automático) ✅
- Benchmarks interprovinciales + mapa coroplético
- Documento N2 — acuerdo DGR SDE para IIBB HyG
- MotherDuck warehouse en cloud
- Bot NLP v2: RAG
- Boletín PDF Quarto mensual

---

## REGLA CRÍTICA
NUNCA mencionar "FEHGRA" — datos se atribuyen a INDEC/SIPA-AFIP/ANAC/CNRT/AirDNA/OEDE

---

## PIPELINE PARA ACTUALIZAR DATOS
    cd /Users/diegocarralbal/observatorio-turismo && source .venv/bin/activate
    python3 etl/connectors/google_trends.py   # solo madrugada — rate limit
    python3 etl/connectors/anac_sde.py
    python3 etl/connectors/bcra_fx.py
    python3 etl/connectors/airroi.py
    python3 etl/connectors/cnrt.py
    python3 etl/connectors/indec_ipc.py
    python3 etl/connectors/sinta_eti.py
    python3 etl/connectors/youtube_api.py
    python3 etl/connectors/sinta_evyth.py
    python3 etl/connectors/sinta_eoh.py
    python3 etl/connectors/sipa_empleo.py
    cd dbt/observatorio && dbt run && cd ../..
    # re-exportar CSVs a frontend/public/data/
