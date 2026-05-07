# HANDOFF — OBSERVATORIO TURISMO SDE
**9 de mayo 2026 · para retomar en chat nuevo**

---

## ACCESO RÁPIDO

```
GitHub:  https://github.com/carralbal/observatorio-turismo
Local:   /Users/diegocarralbal/observatorio-turismo
Vercel:  https://observatorio-sde-carralbals-projects.vercel.app  ← SIEMPRE ESTA
Bot:     python3 etl/bot_proxy.py  (localhost:8765)
```

**Deploy:** `cd frontend && vercel deploy --prod`
**Git+deploy:** `git add -A && git commit -m "msg" && git push && cd frontend && vercel deploy --prod`

---

## REGLAS CRÍTICAS

1. **NUNCA mencionar "FEHGRA"** — atribuir solo a INDEC/SIPA-AFIP/ANAC/CNRT/AirDNA/OEDE
2. **Siempre actualizar Fuentes.jsx y handoff** cuando cambian datos o estado de fuentes
3. **Después de cada deploy** recordar: `python3 etl/bot_proxy.py`
4. **Un comando a la vez** — Diego corre, pega output, Claude analiza

---

## STACK

```
Frontend:  React 18 + Vite + Recharts + Papaparse + Lucide React
Warehouse: DuckDB → warehouse/observatorio.duckdb
dbt:       cd dbt/observatorio && dbt run
Pipeline:  bash etl/update_all.sh  (cron 3am)
Deploy:    Vercel (frontend) via CLI
Bot:       python3 etl/bot_proxy.py → localhost:8765
```

---

## DESIGN SYSTEM

```
Ink:    #0A0A0A  Paper: #FAFAF7  Slate: #3A3A36
Stone:  #C8C8BF  Volt:  #FFFF00  Paper2: #F2F2EE
Font:   Plus Jakarta Sans
SIN colores externos (no rojo, no verde, no azul)
```

---

## PÁGINAS — ESTADO ACTUAL (9 mayo 2026)

| Ruta | Nombre | Estado |
|------|--------|--------|
| `/` | Pulso SDE | ✅ viajeros OLS abr 2026, estadía EOH+AirROI, IBT |
| `/aerea` | Aérea | ✅ |
| `/terrestre` | Terrestre | ✅ |
| `/informal` | Alquiler Temporario | ✅ |
| `/empleo` | Empleo | ✅ |
| `/fuentes` | Fuentes | ✅ Google Trends activo may 2026 |
| `/nacional` | Nacional | ✅ saldo divisas dark/slate |
| `/motogp` | MotoGP | ✅ line chart dots diferenciados |
| `/señal` | Señal IBT | ✅ |
| `/benchmark` | Benchmark | ✅ trayectoria dark |
| `/captura` | Captura de Valor | ✅ |
| `/salud` | Salud Turística (ISTP) | ✅ datos reales TFM, cuadrantes, scatter |
| `/madurez` | Madurez del Observatorio | ✅ N1/N2/N3, video 6804654 |
| `/imagen` | Imagen Destino | ✅ |
| `/estimado` | Estimado OLS | ✅ hasta abr 2026, sin overlap |
| `/perfil` | Perfil del Turista | ✅ |

**NAV Capa 4:** Estimado OLS · Salud Turística (/salud) · Madurez Obs. (/madurez) · Nacional

---

## ⚠️ BUG ACTIVO AL CIERRE

**Home.jsx crashea con `Can't find variable: lastOLS`**

Fix aplicado (sed en repo) pero verificar que deployó:
```bash
# Verificar que el fix está aplicado:
grep "termasLast?.fecha" frontend/src/pages/Home.jsx
```
Si no aparece, correr manualmente:
```bash
# Buscar y reemplazar en Home.jsx la línea del IBT delta — 
# cambiar referencia a lastOLS/lastEOH por termasLast?.fecha
```

También hubo `Can't find variable: YAxis` — fix: agregar YAxis al import recharts de Home.jsx:
```bash
grep "import.*recharts" frontend/src/pages/Home.jsx
# Debe incluir YAxis. Si no: sed -i '' 's/XAxis, Tooltip/XAxis, YAxis, Tooltip/' frontend/src/pages/Home.jsx
```

---

## DATOS — ESTADO AL 9 MAY 2026

| Fuente | Hasta | Estado |
|--------|-------|--------|
| ANAC pasajeros | Mar 2026 | ✅ |
| AirROI informal | Abr 2026 | ✅ |
| Google Trends IBT | May 2026 | ✅ manual |
| OLS estimado | Abr 2026 | ✅ |
| EOH viajeros | Nov 2025 | 🔴 DISCONTINUADA |
| CNRT terrestre | 2024 anual | ⚠️ 2025 no publicado |
| Empleo SIPA | Q3 2025 | ✅ |
| BCRA/IPC | Mar 2026 | ✅ |
| YouTube | May 2026 | ✅ |

**data_madurez.csv** → reconstruido con datos reales del TFM (ISTP 0-100, 24 provincias, 2019-2025)

**Google Trends — workflow manual mensual:**
1. Descargar 3 CSVs de trends.google.com
2. Colocar en `data/raw/trends/manual/`
3. `python3 etl/connectors/google_trends.py --manual`
4. `dbt run` → `python3 etl/aplicar_modelo_eoh.py`

---

## BACKLOG CRÍTICO

### 🔴 BUGS PENDIENTES DE VERIFICAR
- [ ] `lastOLS` scope error en Home.jsx — fix enviado, verificar
- [ ] `YAxis` import en Home.jsx — verificar que está incluido

### 🟡 RAILWAY DEPLOY (pendiente)
Bot del observatorio necesita deploy a Railway para que Florencia (socia) pueda acceder desde otro lugar.
- Trial gratis $5/30 días, luego $1/mes gratis permanente
- Requiere cuenta railway.com + tarjeta
- ~15 minutos para configurar

### 🟡 PLAZAS HOTELERAS
- BrechaSection muestra 13,055 de PUNA 2024 (hardcoded)
- Diego confirmó que no hay datos más recientes de PUNA
- EOH tiene `plazas_prom_dia` y `establecimientos` hasta nov 2025 — pendiente cargar dinámicamente
- Verificar columnas: `python3 -c "import pandas as pd; df=pd.read_csv('frontend/public/data/data_pulso.csv'); print(df.columns.tolist())"`

### 🟡 ESTADÍA MEDIA CHART
- Gráfico en Home.jsx — verificar que el fix del bache COVID y filtro AirROI (occ<10%, cap 8n) quedó aplicado correctamente tras los múltiples deploys

---

## BACKLOG UI/UX COMPLETO

### Señal IBT
- [ ] Textos "Guía de interpretación" más grandes
- [ ] Panel unificado: IBT + occ informal + occ formal + viajeros estimados

### Informal (Alquiler Temporario)
- [ ] No mostrar períodos en 0 antes de mar 2023

### Empleo
- [ ] Video hero +20% brillo

### Captura de Valor
- [ ] ICV línea plana — evaluar mostrar solo número
- [ ] Hoja de ruta N1-N3 letra más grande
- [ ] Explicar proxy ICV: EOH + gasto medio EVyTH

### Perfil del Turista
- [ ] Íconos flat white para transporte y motivo de viaje

### Benchmark
- [ ] Datos hasta abr 2026 (limitado por EOH discontinuada)

### Madurez / Salud Turística
- [ ] Evolución ISTP 2019-2025: verificar que línea es visible
- [ ] Componentes chart: verificar render en mobile

### General
- [ ] Íconos flat blanco/volt en todos los indicadores
- [ ] Carrusel fuentes: logos en lugar de texto
- [ ] Nueva sección /alojamiento (PUNA)
- [ ] Toggle HISTÓRICO / HOY por página

---

## NUEVA PÁGINA PENDIENTE: DATABOOK

Ícono "i" en navbar junto a Fuentes. Cuatro apartados:
1. Definiciones de indicadores
2. Períodos y criterios de comparación
3. Metodología de construcción
4. Fuentes oficiales y advertencias

---

## ISTP — DATOS REALES TFM

**SDE 2025:** nivel 57.92/100 · ranking 12° de 24 · trayectoria 90.79 · Cuadrante I
- El TFM completo (179 páginas) fue subido como PDF en este chat
- Todos los Anexos C y G están incorporados en `data_madurez.csv`
- Escala 0-100, ponderación 50/30/20 (demanda/ocupación/habilitantes)

**Diferencia conceptual:**
- `/salud` = ISTP (salud turística, datos TFM reales)
- `/madurez` = Madurez del Observatorio (capacidades N1/N2/N3)

---

## COMANDOS CLAVE

```bash
# Activar entorno
cd /Users/diegocarralbal/observatorio-turismo && source .venv/bin/activate

# Pipeline completo
bash etl/update_all.sh

# Solo OLS + export
python3 etl/aplicar_modelo_eoh.py
python3 -c "import duckdb; con=duckdb.connect('warehouse/observatorio.duckdb',read_only=True); [con.execute(f'SELECT * FROM {t}').df().to_csv(f'frontend/public/data/{c}',index=False) for t,c in {'mart_sde_pulso':'data_pulso.csv','mart_sde_pulso_estimado':'data_pulso_estimado.csv'}.items()]; con.close()"

# Verificar imports Home.jsx
grep "import.*recharts" frontend/src/pages/Home.jsx

# Deploy
cd frontend && vercel deploy --prod

# Bot
python3 etl/bot_proxy.py

# Google Trends manual
python3 etl/connectors/google_trends.py --manual
```

---

## AL INICIAR SESIÓN NUEVA

```bash
cd /Users/diegocarralbal/observatorio-turismo && git log --oneline -5
# Verificar que Home.jsx no tiene bugs activos
grep "YAxis" frontend/src/pages/Home.jsx
grep "termasLast?.fecha" frontend/src/pages/Home.jsx
```
