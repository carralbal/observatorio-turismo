# HANDOFF COMPLETO — OBSERVATORIO TURISMO SDE
**8 de mayo 2026 · para retomar en chat nuevo**

---

## REPO Y ACCESO

```
GitHub:  https://github.com/carralbal/observatorio-turismo (público temporalmente)
Local:   /Users/diegocarralbal/observatorio-turismo
Vercel:  https://observatorio-sde-carralbals-projects.vercel.app  ← USAR ESTA (estable)
Dev:     cd frontend && npm run dev → localhost:5173
```

**Deploy:** `cd frontend && vercel deploy --prod` (NO conectado a GitHub auto-deploy)

---

## MODO DE TRABAJO

- Un comando de terminal a la vez. Diego corre, pega output, Claude analiza.
- Diego no edita código directamente — Claude implementa y entrega archivos.
- Archivos descargados van a ~/Downloads/ (a veces ~/Downloads/files 2/ si hay duplicados).
- **BACKLOG:** instalar Claude in Chrome para editar archivos directamente en GitHub sin descargas.

---

## REGLA CRÍTICA

**NUNCA mencionar "FEHGRA"** — datos se atribuyen exclusivamente a INDEC / SIPA-AFIP / ANAC / CNRT / AirDNA / OEDE.

---

## STACK

```
Frontend:  React 18 + Vite + Recharts + Papaparse + Lucide React
Warehouse: DuckDB (warehouse/observatorio.duckdb) — ESTE es el real
dbt:       dbt run → cd dbt/observatorio && dbt run
Deploy:    Vercel (frontend) via CLI
```

**Warehouse correcto:** `warehouse/observatorio.duckdb` (hay también `data/warehouse.duckdb` vacío, ignorar)

---

## DESIGN SYSTEM — ADDFISH

```
Ink:    #0A0A0A    Paper:  #FAFAF7    Slate: #3A3A36
Stone:  #C8C8BF   Volt:   #FFFF00    Paper2: #F2F2EE
Font:   Plus Jakarta Sans
```

**Sin colores externos** — sistema estrictamente monocromático (no rojo, no verde, no azul).

**CSS variables (global.css):**
```
--fs-2xs: 9px (mobile: 12px)
--fs-xs:  10.5px (mobile: 14px)
--fs-sm:  13px (mobile: 15px)
--fs-base: 14px (mobile: 16px)
--fs-md:  15px (mobile: 17px)
--fs-lg:  17px (mobile: 20px)
--fs-xl:  22px (mobile: 26px)
--fs-2xl: 30px (mobile: 36px)
--pad:    clamp(20px,6vw,96px) (mobile: 18px)
```

**Grid utilities:** `.grid-kpi` (4→2 cols mobile), `.grid-2col` (1 col mobile), `.grid-donut` (1 col mobile), `.grid-3col` (1 col mobile)

---

## PÁGINAS — 15 COMPLETADAS ✅

| Ruta | Estado | Notas |
|------|--------|-------|
| `/` Home / Pulso SDE | ✅ | Usa data_pulso_estimado.csv — viajeros hasta abr 2026 con badge "est." |
| `/aerea` | ✅ | Logos aerolíneas locales, LF texto profundo |
| `/terrestre` | ✅ | LF texto profundo benchmark NOA |
| `/empleo` | ✅ | |
| `/informal` | ✅ | |
| `/imagen` | ✅ | YouTube |
| `/estimado` | ✅ | OLS, línea estimada solo post-corte EOH (sin overlap) |
| `/motogp` | ✅ | Line chart con dots diferenciados (volt=MotoGP, grey=sin) |
| `/señal` | ✅ | IBT Google Trends |
| `/benchmark` | ✅ | Trayectoria en fondo ink (línea visible) |
| `/captura` | ✅ | ICV, brecha de valor |
| `/madurez` | ⚠️ | DATOS FABRICADOS — ver backlog crítico |
| `/perfil` | ✅ | EVyTH |
| `/nacional` | ✅ | Saldo divisas con barras slate/paper, sin rojo |
| `/fuentes` | ✅ | página premium |

**NAV — 4 capas (overlay fullscreen):**
- Botón hamburger/X en navbar → overlay ink fullscreen
- CAPA 1 ACTIVIDAD: Pulso SDE, Aérea, Terrestre, MotoGP
- CAPA 2 SEÑALES: Señal IBT, Informal, Imagen Destino
- CAPA 3 ESTRUCTURA Y VALOR: Empleo, Captura, Perfil, Benchmark
- CAPA 4 DECISIÓN: Estimado OLS, Madurez, Nacional

**PeriodBar — dos filas:**
- Fila 1: Años (desktop: 2019-2025, mobile: '19-'25) + TODO
- Fila 2: Meses (desktop: ENE-DIC, mobile: E-D)
- Scroll horizontal en mobile, sin scrollbar visible

---

## ESTADO DE DATOS — 8 MAY 2026

| Fuente | Tabla DuckDB | Hasta | Estado |
|--------|-------------|-------|--------|
| EOH viajeros (SINTA) | raw_eoh_viajeros_localidad | nov 2025 | 🔴 DISCONTINUADA |
| ANAC pasajeros | raw_anac_sde | mar 2026 | ✅ |
| CNRT terrestre | raw_cnrt_pares | 2024 | ✅ anual |
| AirROI informal | raw_airroi_termas | abr 2026 | ✅ |
| Google Trends IBT | raw_trends_sde | may 2026 | ✅ importado manual |
| OLS estimado | raw_estimados_ols | abr 2026 | ✅ |
| Empleo HyG (SIPA) | raw_sipa_empleo_trimestral_hyg | Q3 2025 | ✅ |
| BCRA / IPC | raw_bcra_tcn / raw_ipc_capitulos | mar 2026 | ✅ |
| ETI turismo intl | raw_eti_* | mar 2026 | ✅ |
| YouTube | raw_youtube_sde | may 2026 | ✅ 510 videos |

**Google Trends — workflow manual mensual:**
1. Descargar 3 CSVs de trends.google.com (Termas, SDE turismo, MotoGP Argentina)
2. Colocar en `data/raw/trends/manual/`
3. Correr: `python3 etl/connectors/google_trends.py --manual`
4. Correr `dbt run` + `python3 etl/aplicar_modelo_eoh.py`

---

## PIPELINE — CRON 3AM

```bash
# Crontab configurado:
0 3 * * * /Users/diegocarralbal/observatorio-turismo/etl/update_all.sh
```

`update_all.sh` actualizado (8 may 2026):
- Corre todos los connectors → dbt run → aplicar_modelo_eoh.py → export CSVs → git push → vercel deploy --prod
- Si dbt falla, aborta sin exportar datos rotos

**Warehouse path para scripts:** `warehouse/observatorio.duckdb`

---

## ⚠️ BACKLOG CRÍTICO — DATOS FABRICADOS

**MADUREZ / ISTP — URGENTE:**
- Los scores actuales en `data_madurez.csv` son INVENTADOS (escala 0-5, ranking 4°, etc.)
- El ISTP real viene del TFM de Diego (MBA, dic 2025): "Índice de Salud Turística Provincial"
- Escala real: 0-100. SDE real: 57.92/100, ranking 12° de 24
- TFM subido como PDF en este chat — todos los Anexos C y G tienen los datos reales

**SDE valores reales (TFM):**
- NIVEL 2025: 57.92 / 100 (ranking 12° de 24)
- TRAYECTORIA 2025: 90.79 (base 2019=100)
- Cuadrante 2025: I — Alto nivel + Alta trayectoria (consolidación con recuperación)
- NIVEL 2019: 51.67 (ranking 13°)

**Tareas pendientes Madurez/ISTP:**
1. Generar `data_madurez.csv` con datos reales del TFM (24 provincias × 7 años)
2. Separar en DOS páginas: ISTP (salud turística 0-100) y Madurez Observatorio (capacidades 0-9)
3. Rediseñar página ISTP: cuadrantes nivel vs trayectoria, mapa provincial, descomposición
4. Los datos de todos los componentes están en los Anexos C y G del TFM

---

## BACKLOG UI/UX COMPLETO

### Home (Pulso SDE)
- [ ] Evaluar agregar indicadores adicionales al bloque KPIs

### Aérea
- [ ] Verificar que logo Flybondi (FO.png) carga correctamente

### Terrestre
- [ ] Datos mensuales 2019-2026 (CNRT solo publica anual por ruta — verificar si hay mensual agregado)
- [ ] Rediseñar gráfico barras pasajeros anuales con datos mensuales si están disponibles

### MotoGP
- [ ] Agregar pasajeros terrestres al gráfico ANAC (requiere join con CNRT mensual)

### Señal IBT
- [ ] Textos cajas "Guía de interpretación" más grandes (font pequeño)
- [ ] Panel de señales anticipadas: mostrar IBT + occ informal + occ formal + viajeros estimados juntos

### Informal (Alquiler Temporario)
- [ ] No mostrar períodos en 0 antes de mar 2023
- [ ] Todos los datos hasta abril 2026

### Empleo
- [ ] Video hero +20% brillo
- [ ] Todos los datos hasta abril 2026

### Captura de Valor
- [ ] ICV 38% constante — evaluar si mostrar línea plana o solo número
- [ ] Hoja de ruta N1-N3 letra más grande
- [ ] Agregar párrafo explicativo a "La brecha de valor"
- [ ] Explicar mejor estimación proxy ICV: EOH + gasto medio EVyTH
- [ ] Todos los datos hasta abril 2026

### Perfil del Turista
- [ ] Modo de transporte (auto, ómnibus) — font más grande + ícono flat white representativo
- [ ] Motivo de viaje (vacaciones, familia, trabajo) — íconos flat white o volt
- [ ] Todos los datos hasta abril 2026

### Benchmark
- [ ] Todos los datos hasta abril 2026 (limitado por EOH discontinuada — usar OLS?)
- [ ] Gráfico trayectoria: etiquetas eje en gris muy claro → ya corregido (dark bg), verificar

### Estimado OLS
- [ ] Extender a abril 2026 ✅ HECHO
- [ ] Superposición curvas ✅ CORREGIDO (solo muestra estimado post-corte)

### Madurez
- [ ] RECONSTRUIR COMPLETO con datos TFM ⚠️ CRÍTICO
- [ ] Gráfico cuadrantes nivel vs trayectoria (2019 → 2025)
- [ ] Agregar fecha de cálculo ISTP
- [ ] Agregar evolución 2019-2026 por provincia
- [ ] Separar ISTP de Madurez Observatorio
- [ ] Hoja de ruta: textos más grandes

### Nacional
- [ ] Todos los datos hasta abril 2026
- [ ] Gráfico saldo divisas ✅ CORREGIDO (barras slate/paper, ink background, eje en 0)

### General — todas las secciones
- [ ] Íconos flat blanco o volt donde quede bien (todos los conceptos e items)
- [ ] Carrusel fuentes: reemplazar textos por logos de cada entidad
- [ ] **NUEVA SECCIÓN: /alojamiento** (plazas hoteleras PUNA)
- [ ] Toggle HISTÓRICO / HOY por página (backlog grande)
- [ ] Selector año: cuando se elige año → mostrar acumulado/promedio del año (no último mes)
- [ ] Nav capas dropdown: rediseño ✅ HECHO (overlay fullscreen)

### Imagen Destino
- [ ] Explorar redes sociales adicionales: X, Instagram, Facebook, TikTok

---

## BACKLOG NUEVA PÁGINA: DATABOOK / METODOLOGÍA

**Concepto:** página premium accesible desde ícono "i" en navbar (junto a Fuentes).

Cuatro apartados:
1. Definiciones de indicadores utilizados
2. Períodos y criterios de comparación
3. Metodología de construcción y procesamiento de datos
4. Fuentes oficiales y advertencias de uso

**Objetivo:** transparencia metodológica para investigadores, cámaras, gobierno.
**Cada vez que se actualicen fuentes o Databook → actualizar esa página.**

---

## BACKLOG DATOS

- Google Trends: correr manual mensualmente (rate limit nocturno no funciona)
- Para OLS llegar a mayo 2026 necesita: ANAC abr 2026 + Google Trends may 2026 ✅
- Fuente fiscal N2: IIBB SDE HyG (requiere convenio DGR) — camino más corto al dato real de viajeros
- Empleo registrado OEDE: pendiente descarga
- Acuerdo hotelero directo (Camino B): 8-10 hoteles ancla en Termas para ocupación mensual
- Lighthouse/STR: cotizar para datos OTA de mercado (no precio público, contactar sales)

---

## PENDIENTES ESTRATÉGICOS

- **Smart City Expo 20-21 mayo** — presentación v5.4. Pendiente: slide plazas hoteleras vs asientos aéreos vs ómnibus
- **Documento N2** — acuerdo DGR SDE para IIBB HyG
- **Bot NLP** — consume warehouse en tiempo real, no requiere actualización
- **MotherDuck** — warehouse en cloud (pendiente largo plazo)

---

## COMANDOS FRECUENTES

```bash
# Activar entorno
cd /Users/diegocarralbal/observatorio-turismo && source .venv/bin/activate

# Correr pipeline completo
bash etl/update_all.sh

# Solo dbt
cd dbt/observatorio && dbt run && cd ../..

# Solo OLS + export
python3 etl/aplicar_modelo_eoh.py
python3 -c "import duckdb; con=duckdb.connect('warehouse/observatorio.duckdb',read_only=True); [con.execute(f'SELECT * FROM {t}').df().to_csv(f'frontend/public/data/{c}',index=False) for t,c in {'mart_sde_pulso':'data_pulso.csv','mart_sde_pulso_estimado':'data_pulso_estimado.csv','mart_infra_aereo':'data_aereo.csv'}.items()]; con.close()"

# Deploy Vercel
cd frontend && vercel deploy --prod

# Git + deploy (todo junto)
git add -A && git commit -m "mensaje" && git push && cd frontend && vercel deploy --prod

# Verificar warehouse
python3 -c "import duckdb; con=duckdb.connect('warehouse/observatorio.duckdb',read_only=True); print(con.execute('SELECT MAX(fecha) FROM raw_trends_sde').fetchone()[0]); con.close()"
```

---

## PARA VERIFICAR AL INICIO DE SESIÓN

```bash
cd /Users/diegocarralbal/observatorio-turismo && git log --oneline -5
```
