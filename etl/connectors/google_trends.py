"""
Google Trends connector — versión robusta
Estrategia:
  1. Intenta descargar via pytrends (solo últimos 6 meses, incremental)
  2. Si falla, importa desde CSV manual en data/raw/trends/manual/
  3. Merge con datos históricos existentes en DuckDB
"""
from pathlib import Path
import time, random, datetime, sys
import duckdb
import pandas as pd
from loguru import logger

WAREHOUSE  = "data/warehouse.duckdb"
RAW_DIR    = Path("data/raw/trends")
MANUAL_DIR = RAW_DIR / "manual"
RAW_DIR.mkdir(parents=True, exist_ok=True)
MANUAL_DIR.mkdir(parents=True, exist_ok=True)

TERMINOS = {
    "ibt_termas":   "Termas de Río Hondo",
    "ibt_santiago": "Santiago del Estero turismo",
    "ibt_motogp":   "MotoGP Argentina",
}

PESOS = {"ibt_termas": 0.6, "ibt_santiago": 0.3, "ibt_motogp": 0.1}

# ── Último mes disponible en warehouse ──────────────────────────────────────
def ultimo_mes_en_db():
    try:
        con = duckdb.connect(WAREHOUSE)
        r = con.execute(
            "SELECT MAX(fecha) FROM raw_google_trends WHERE tabla='trends_sde'"
        ).fetchone()[0]
        con.close()
        return r
    except Exception:
        return None

# ── Intentar pytrends (incremental) ─────────────────────────────────────────
def fetch_via_pytrends(desde: str):
    try:
        from pytrends.request import TrendReq
        import requests
    except ImportError:
        logger.warning("pytrends no instalado")
        return None

    hasta = datetime.date.today().strftime("%Y-%m-%d")
    timeframe = f"{desde} {hasta}"
    logger.info(f"pytrends: {timeframe}")

    # Session con headers de browser real
    session = requests.Session()
    session.headers.update({
        "User-Agent": (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36"
        ),
        "Accept-Language": "es-AR,es;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    })

    pytrends = TrendReq(
        hl="es-AR", tz=180,
        timeout=(15, 45),
        retries=1,
        backoff_factor=2.0,
        requests_args={"headers": session.headers},
    )

    dfs = []
    for col, termino in TERMINOS.items():
        logger.info(f"  Descargando: {termino}")
        for intento in range(3):
            try:
                pytrends.build_payload([termino], timeframe=timeframe, geo="AR", cat=0)
                time.sleep(random.uniform(3, 6))
                df = pytrends.interest_over_time()
                if df.empty:
                    logger.warning(f"  Sin datos: {termino}")
                    break
                df = df.reset_index()[["date", termino]]
                df.columns = ["fecha", col]
                df["fecha"] = pd.to_datetime(df["fecha"]).dt.to_period("M").dt.to_timestamp()
                df = df.groupby("fecha")[col].mean().round().reset_index()
                dfs.append(df)
                logger.success(f"  OK: {col} — {len(df)} meses")
                break
            except Exception as e:
                wait = 600 + random.randint(0, 300)  # 10-15 min entre reintentos
                logger.warning(f"  Intento {intento+1} falló: {e} — esperando {wait}s")
                if intento < 2:
                    time.sleep(wait)
                else:
                    logger.error(f"  Falló definitivamente: {termino}")
                    return None

        if len(dfs) < len(TERMINOS):
            wait = random.randint(900, 1800)  # 15-30 min entre términos
            logger.info(f"  Pausa {wait//60} min antes del próximo término...")
            time.sleep(wait)

    if len(dfs) < len(TERMINOS):
        return None

    result = dfs[0]
    for df in dfs[1:]:
        result = result.merge(df, on="fecha", how="outer")
    return result

# ── Importar desde CSV manual ────────────────────────────────────────────────
def import_manual_csv():
    """
    Busca CSVs en data/raw/trends/manual/ con formato Google Trends
    Acepta: raw_google_trends_manual.csv (ya procesado) o los 3 originales
    """
    # Opción A: CSV ya procesado (generado por Claude)
    processed = MANUAL_DIR / "raw_google_trends_manual.csv"
    if processed.exists():
        logger.info(f"Importando CSV procesado: {processed}")
        df = pd.read_csv(processed, parse_dates=["fecha"])
        return df[["fecha", "ibt_termas", "ibt_santiago", "ibt_motogp", "ibt_compuesto"]]

    # Opción B: 3 CSVs originales de Google Trends
    files = {
        "ibt_termas":   MANUAL_DIR / "trends_termas.csv",
        "ibt_santiago": MANUAL_DIR / "trends_santiago.csv",
        "ibt_motogp":   MANUAL_DIR / "trends_motogp.csv",
    }
    if not all(f.exists() for f in files.values()):
        logger.warning("No hay CSVs manuales disponibles")
        return None

    dfs = []
    for col, path in files.items():
        raw = pd.read_csv(path, skiprows=3, header=0, names=["fecha", col])
        raw = raw.dropna()
        raw[col] = pd.to_numeric(raw[col].replace("<1", "0"), errors="coerce").fillna(0).astype(int)
        raw["fecha"] = pd.to_datetime(raw["fecha"] + "-01")
        dfs.append(raw)

    df = dfs[0]
    for d in dfs[1:]:
        df = df.merge(d, on="fecha", how="outer")
    df = df.sort_values("fecha").reset_index(drop=True)
    df["ibt_compuesto"] = (
        df["ibt_termas"] * 0.6 +
        df["ibt_santiago"] * 0.3 +
        df["ibt_motogp"] * 0.1
    ).round().astype(int)
    return df

# ── Merge con histórico y guardar ────────────────────────────────────────────
def upsert_warehouse(df_nuevo: pd.DataFrame):
    con = duckdb.connect(WAREHOUSE)

    # Traer existente
    try:
        df_old = con.execute(
            "SELECT fecha, ibt_termas, ibt_santiago, ibt_motogp, ibt_compuesto "
            "FROM raw_google_trends ORDER BY fecha"
        ).df()
        df_old["fecha"] = pd.to_datetime(df_old["fecha"])
    except Exception:
        df_old = pd.DataFrame()

    # Merge: nuevo sobreescribe existente por fecha
    if df_old.empty:
        df_final = df_nuevo
    else:
        df_final = pd.concat([df_old, df_nuevo]).drop_duplicates(
            subset="fecha", keep="last"
        ).sort_values("fecha").reset_index(drop=True)

    df_final["anio"] = df_final["fecha"].dt.year
    df_final["mes"]  = df_final["fecha"].dt.month

    con.execute("DROP TABLE IF EXISTS raw_google_trends")
    con.execute("CREATE TABLE raw_google_trends AS SELECT * FROM df_final")
    n = con.execute("SELECT COUNT(*) FROM raw_google_trends").fetchone()[0]
    ultimo = con.execute("SELECT MAX(fecha) FROM raw_google_trends").fetchone()[0]
    con.close()

    logger.success(f"DuckDB: raw_google_trends → {n} meses · hasta {ultimo}")
    return n

# ── Main ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    force_manual = "--manual" in sys.argv

    df_nuevo = None

    if not force_manual:
        # Calcular desde cuándo necesitamos datos
        ultimo = ultimo_mes_en_db()
        if ultimo:
            desde = (pd.to_datetime(ultimo) - pd.DateOffset(months=2)).strftime("%Y-%m-%d")
            logger.info(f"Datos existentes hasta {ultimo} — descargando desde {desde}")
        else:
            desde = "2014-01-01"
            logger.info("Primera carga — descargando desde 2014")

        df_nuevo = fetch_via_pytrends(desde)

    if df_nuevo is None:
        logger.info("pytrends falló o --manual — intentando CSV manual...")
        df_nuevo = import_manual_csv()

    if df_nuevo is None:
        logger.error("Sin datos disponibles. Colocá CSVs en data/raw/trends/manual/")
        sys.exit(1)

    upsert_warehouse(df_nuevo)
