# OBSERVATORIO DE TURISMO · SDE — Estado al 6 de mayo 2026

## REPO Y ACCESO
- GitHub: https://github.com/carralbal/observatorio-turismo (privado)
- Local: /Users/diegocarralbal/observatorio-turismo
- Frontend: cd frontend && npm run dev → localhost:5173
- Streamlit legacy: streamlit run dashboard/app.py

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
- Datos: frontend/public/data/*.csv (exportados desde DuckDB)
- Deploy: PENDIENTE — Vercel o Netlify (no hay URL pública)

### PÁGINAS — 15 COMPLETADAS ✅
| Ruta | Archivo | Estado |
|------|---------|--------|
| / | Home.jsx | ✅ hero video+escudo, KPIs, BrechaSection, donut IBT, dark metrics, CTA volt |
| /aerea | Aerea.jsx | ✅ KPIs, trend, aerolíneas, rutas, load factor |
| /terrestre | Terrestre.jsx | ✅ KPIs, barras anuales, rutas, load factor |
| /empleo | Empleo.jsx | ✅ |
| /informal | Informal.jsx | ✅ |
| /imagen | Imagen.jsx | ✅ YouTube vistas, categorías, top contenido |
| /estimado | Estimado.jsx | ✅ OLS, serie obs+estimada, IC, metodología |
| /motogp | MotoGP.jsx | ✅ diff-in-diff, uplift por edición |
| /señal | Senal.jsx | ✅ IBT Google Trends |
| /benchmark | Benchmark.jsx | ✅ |
| /captura | Captura.jsx | ✅ ICV, brecha de valor, hoja de ruta |
| /madurez | Madurez.jsx | ✅ ISTP ranking 24 provincias |
| /perfil | Perfil.jsx | ✅ EVyTH perfil turista NOA |
| /nacional | Nacional.jsx | ✅ macro, balanza turística |
| /fuentes | Fuentes.jsx | ✅ 377 líneas — página premium de fuentes |

### BOT NLP
- Proxy Python: etl/bot_proxy.py (puerto 8765)
- Modelo: OpenAI gpt-4o-mini
- Definiciones hardcodeadas: IBT, ICV, ISTP, OLS
- Ícono: robot negro sobre volt
- Estado: funcional — pendiente enriquecer knowledge base

### ARQUITECTURA CLAVE
- Atoms.jsx: C={ink,paper,paper2,slate,stone,volt}, Paralelo, VoltLine, Eyebrow, SectionTitle, Interpretacion, Loading, ICONS
- Layout.jsx: nav fijo con blur + dropdown capas + footer ticker
- PeriodoContext.jsx: selector anio/mes global, default TODO
- useCSV.js: hook papaparse → {data, loading}
- App.jsx: router con todas las rutas activas

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

### DATOS EN WAREHOUSE
- AirDNA xlsx — 80 mercados · data/raw/airdna/
- SIPA/OEDE — 11 tablas · data/raw/sipa/
- Argendata TURISM — 6 tablas · data/raw/argendata/
  raw_argendata_empleo_provincial (25 filas)
  raw_argendata_pernoctes_provincia (24 filas)
  raw_argendata_pib_turismo_comparado (1243 filas)
  raw_argendata_pasajeros_avion (276 filas)
  raw_argendata_turismo_interno_receptivo (28 filas)
  raw_argendata_balanza_turistica (147 filas)

---

## ESTADO DE FUENTES — 6 MAY 2026

### CAPA 1 · ACTIVIDAD
| Fuente | Tabla | Desde | Hasta | Estado |
|--------|-------|-------|-------|--------|
| EOH viajeros (SINTA) | mart_sde_pulso | ene 2018 | nov 2025 | DISCONTINUADA — definitivo |
| Pasajeros aéreos (ANAC) | mart_infra_aereo | ene 2017 | mar 2026 | OK |
| Tráfico terrestre (CNRT) | mart_infra_terrestre | 2019 | 2024 | anual — CNRT no publica mensual por ruta |
| Alquiler informal (AirROI) | mart_infra_informal_termas | abr 2021 | abr 2026 | OK — al día |
| Google Trends IBT | stg_trends_sde | ene 2014 | dic 2025 | RATE LIMIT — correr de madrugada |
| Pulso estimado OLS | mart_sde_pulso_estimado | ene 2018 | mar 2026 | OK — 1 mes de gap |

### CAPA 2 · ESTRUCTURA Y VALOR
| Fuente | Tabla | Desde | Hasta | Estado |
|--------|-------|-------|-------|--------|
| Empleo HyG (SIPA-AFIP) | mart_infra_empleo_hyg | ene 2019 | Q3 2025 | OK |
| Macro BCRA / IPC | mart_nacional_macro | dic 2014 | mar 2026 | OK |
| ETI turismo intl | stg_eti_serie | ene 2016 | mar 2026 | OK |
| EVyTH perfil turista | mart_sde_perfil_turista | — | abr 2024 | OK — lag normal |
| Imagen destino (YouTube) | mart_sde_youtube | 2009 | may 2026 | OK — 521 videos |

### CAPA 3 · DECISIÓN Y BENCHMARK
| Fuente | Tabla | Desde | Hasta | Estado |
|--------|-------|-------|-------|--------|
| Benchmark interprovincial | mart_sde_benchmark | 2018 | nov 2025 | BLOQUEADO — depende EOH |
| Argendata empleo | raw_argendata_empleo_provincial | — | 2022 | MANUAL — 3 años de gap |
| Argendata pernoctes | raw_argendata_pernoctes_provincia | — | 2024 | MANUAL — falta 2025 |

---

## FUENTES POTENCIALES — IDENTIFICADAS, NO CONECTADAS

### BLOQUE A · Demanda
| Fuente | Qué mide | Acceso | Frecuencia | Prioridad |
|--------|----------|--------|-----------|-----------|
| PUNA (SINTA) | Plazas hoteleras formales por provincia/categoría | datos.yvera.gob.ar CSV | Estático 2020 | 🔴 URGENTE — slide Smart City |
| Inside Airbnb | Listings, precios, reviews BsAs | insideairbnb.com CSV libre | Trimestral | 🟡 |
| TripAdvisor Content API | Reseñas, ratings, atracciones | API REST gratuita con clave | Continuo | 🟡 |
| Google Destination Insights | Búsquedas de vuelos/alojamiento por destino | Web gratuita, sin API | Real time | 🟡 Manual |
| Parques Nacionales (APN) | Visitas 35 parques por residencia | API REST + CSV SINTA | Mensual | 🔵 SDE no tiene parques |

### BLOQUE B · Macro adicional
| Fuente | Qué mide | Acceso | Frecuencia | Prioridad |
|--------|----------|--------|-----------|-----------|
| BCRA MULC Turismo | Ingresos/egresos divisas por turismo en mercado oficial | tableros.yvera.tur.ar | Mensual | 🟡 |
| INDEC Balanza de Pagos rubro Viajes | Turismo receptivo/emisivo en USD | indec.gob.ar trimestral | Trimestral | 🟡 |
| Ferroviario | Pasajeros larga distancia | argentina.gob.ar | Mensual | 🔵 Baja prioridad SDE |

### BLOQUE C · Oferta / Pricing
| Fuente | Qué mide | Acceso | Frecuencia | Prioridad |
|--------|----------|--------|-----------|-----------|
| Booking.com scraping | Pricing diario, disponibilidad, ocupación proxy | Scraping (sin API pública) | Diario | 🟡 |
| Google Flights / Skyscanner | Tarifas aéreas SDE | Scraping / API paga | Diario | 🟡 |
| SACT | Establecimientos con certificación de calidad | datos.yvera.gob.ar CSV | Variable | 🔵 |

### BLOQUE D · Señales digitales adicionales
| Fuente | Qué mide | Acceso | Frecuencia | Prioridad |
|--------|----------|--------|-----------|-----------|
| Mobile positioning (Telco) | Origen de visitantes, estadía, movilidad interna | Acuerdo comercial telco | Mensual | 🔵 Requiere convenio |
| Instagram / TikTok mentions | Volumen de contenido generado sobre destino | API (limitada) | Semanal | 🔵 |

---

## PENDIENTES — PRIORIZADOS

### 🔴 URGENTE — Smart City Expo 20-21 mayo
1. Deploy frontend en Vercel o Netlify — no hay URL pública
2. PUNA: descargar plazas hoteleras SDE para slide brecha conectividad/alojamiento
3. Google Trends: correr de madrugada — python3 etl/connectors/google_trends.py
4. Actualizar conectores: anac_sde · bcra_fx · airroi · sinta_eti

### 🟡 BACKLOG UI/UX — PULSO SDE
- Título hero → "Pulso Santiago del Estero"
- PARADOJA ESTRUCTURAL: textos más grandes
- CTA "EXPLORÁ LAS DIMENSIONES": font light, 40% más pequeña
- Escudo: 50% más pequeño, relleno 100% sin transparencia, al lado del título hero

### 🟡 BACKLOG UI/UX — AÉREA
- Reemplazar gráfico barras aerolíneas → logos flat gris transparente

### 🟡 BACKLOG UI/UX — TERRESTRE
- Rediseñar gráfico barras pasajeros por año — evaluar datos mensuales 2019-2026

### 🟡 BACKLOG UI/UX — MOTOGP
- Rediseñar gráfico impacto por edición y gráfico pasajeros ANAC — sin barras ni colores actuales

### 🟡 BACKLOG UI/UX — SEÑAL IBT
- Textos cajas "Guía de interpretación": incrementar tamaño

### 🟡 BACKLOG UI/UX — INFORMAL
- No mostrar períodos en 0 antes de mar 2023 — arrancar desde primer dato real

### 🟡 BACKLOG UI/UX — EMPLEO
- Video hero muy oscuro — incrementar brillo +20%

### 🟡 BACKLOG UI/UX — CAPTURA
- ICV 38% constante — evaluar línea plana vs solo mostrar número
- Hoja de ruta N1-N3: letra muy pequeña
- Agregar párrafo explicativo a "La brecha de valor"

### 🟡 BACKLOG UI/UX — PERFIL
- Modo transporte y motivo del viaje: incrementar font + ícono flat blanco por item

### 🟡 BACKLOG UI/UX — BENCHMARK
- Rediseñar gráfico trayectoria histórica — sin barras gruesas ni colores actuales

### 🟡 BACKLOG UI/UX — ESTIMADO
- Extender estimación a abril 2026
- Solucionar superposición líneas observado vs estimado

### 🟡 BACKLOG UI/UX — MADUREZ
- Reemplazar gráfico ranking ISTP — evaluar mapa, cuadrantes u otro
- Agregar fecha de cálculo ISTP
- Agregar evolución 2019-2026 por provincia
- Hoja de ruta: cajas y textos muy pequeños
- Agregar explicación de cómo se calcula el ISTP

### 🟡 BACKLOG UI/UX — NACIONAL
- Balanza deficitaria mostrar en negativo
- Datos solo hasta feb 2026 — buscar más actualizados
- Rediseñar gráfico saldo divisas

### 🟡 BACKLOG UI/UX — GENERAL
- Íconos flat blanco/volt en todas las secciones
- Carrusel fuentes: logos entidad gris flat en vez de texto
- Contraste textos: usar C.slate mínimo para texto secundario sobre paper
- Agregar sección ALOJAMIENTO FORMAL (plazas hoteleras PUNA)

### 🟡 BACKLOG CONTENIDO
- Interpretaciones profundas por indicador: composición del valor + benchmark + implicancia
  Ejemplo: ICV 38% — ¿qué es? ¿bueno/malo vs otras provincias? ¿qué acción implica?
- Bot NLP: enriquecer knowledge base con benchmarks interprovinciales

### 🔵 PENDIENTE ESTRATÉGICO
- Toggle HISTÓRICO / HOY por página
- Nav capas: rediseñar dropdown — no es forma definitiva
- Deploy frontend URL pública (Vercel/Netlify)
- Benchmarks interprovinciales + mapa coroplético (sipa_panel_provincias disponible)
- Documento N2 — acuerdo DGR SDE para IIBB HyG
- MotherDuck warehouse en cloud
- Bot NLP v2: RAG sobre knowledge base expandido
- Boletín PDF Quarto mensual
- Nueva página /alojamiento (PUNA)

---

## REGLA CRÍTICA
NUNCA mencionar "FEHGRA" — datos se atribuyen a INDEC/SIPA-AFIP/ANAC/CNRT/AirDNA/OEDE

---

## PIPELINE COMPLETO PARA ACTUALIZAR
    cd /Users/diegocarralbal/observatorio-turismo && source .venv/bin/activate
    python3 etl/connectors/google_trends.py   # solo de madrugada — rate limit
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
