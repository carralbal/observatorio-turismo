from pathlib import Path
import time
import random
import duckdb
import pandas as pd
from pytrends.request import TrendReq
from loguru import logger

RAW_DIR   = Path("data/raw/trends")
RAW_DIR.mkdir(parents=True, exist_ok=True)
WAREHOUSE = "warehouse/observatorio.duckdb"

TERMINOS = [
    "Termas de Río Hondo",
    "Santiago del Estero turismo",
    "MotoGP Argentina",
]

TIMEFRAME = "2014-01-01 " + __import__("datetime").date.today().strftime("%Y-%m-%d")

def fetch_term(pytrends, termino, retries=5):
    for intento in range(retries):
        try:
            pytrends.build_payload([termino], timeframe=TIMEFRAME, geo="AR")
            df = pytrends.interest_over_time()
            if df.empty:
                logger.warning(f"  Sin datos: {termino}")
                return None
            df = df.drop(columns=["isPartial"], errors="ignore")
            df.index.name = "fecha"
            df = df.reset_index()[["fecha", termino]]
            logger.success(f"  OK: {termino} ({len(df)} semanas)")
            return df
        except Exception as e:
            wait = (2 ** intento) * 30 + random.randint(10, 30)
            logger.warning(f"  Error intento {intento+1}: {e} — esperando {wait}s")
            time.sleep(wait)
    logger.error(f"  Falló tras {retries} intentos: {termino}")
    return None

def fetch_trends():
    logger.info("Descargando Google Trends — un término a la vez...")
    pytrends = TrendReq(hl="es-AR", tz=180, timeout=(10, 30), retries=2, backoff_factor=0.5)

    dfs = []
    for i, termino in enumerate(TERMINOS):
        logger.info(f"  [{i+1}/{len(TERMINOS)}] {termino}")
        df = fetch_term(pytrends, termino)
        if df is not None:
            dfs.append(df)
        if i < len(TERMINOS) - 1:
            wait = random.randint(45, 90)
            logger.info(f"  Pausa {wait}s antes del próximo término...")
            time.sleep(wait)

    if not dfs:
        logger.error("No se pudo obtener ningún término")
        return None

    result = dfs[0]
    for df in dfs[1:]:
        result = result.merge(df, on="fecha", how="outer")

    result = result.sort_values("fecha").reset_index(drop=True)
    result.columns = [c.replace(" ", "_").lower() for c in result.columns]

    path = RAW_DIR / "trends_sde.parquet"
    result.to_parquet(path, index=False)

    con = duckdb.connect(WAREHOUSE)
    con.execute(f"CREATE OR REPLACE TABLE raw_trends_sde AS SELECT * FROM read_parquet('{path}')")
    n = con.execute("SELECT COUNT(*) FROM raw_trends_sde").fetchone()[0]
    con.close()
    logger.success(f"DuckDB: raw_trends_sde → {n} semanas · {result['fecha'].min()} → {result['fecha'].max()}")
    return result

if __name__ == "__main__":
    df = fetch_trends()
    if df is not None:
        print(df.tail(6))
