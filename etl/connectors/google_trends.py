import pandas as pd
import duckdb
from pathlib import Path
from loguru import logger
from pytrends.request import TrendReq
import time

RAW_DIR   = Path("data/raw/trends")
RAW_DIR.mkdir(parents=True, exist_ok=True)
WAREHOUSE = "warehouse/observatorio.duckdb"

TERMINOS = [
    "Termas de Río Hondo",
    "Santiago del Estero turismo",
    "MotoGP Argentina",
]

def fetch_trends():
    logger.info("Descargando Google Trends...")
    pytrends = TrendReq(hl="es-AR", tz=180)

    pytrends.build_payload(
        TERMINOS,
        timeframe="2014-01-01 " + __import__("datetime").date.today().strftime("%Y-%m-%d"),
        geo="AR"
    )

    df = pytrends.interest_over_time()

    if df.empty:
        logger.error("Google Trends devolvió datos vacíos")
        return None

    df = df.drop(columns=["isPartial"], errors="ignore")
    df.index.name = "fecha"
    df = df.reset_index()

    path = RAW_DIR / "trends_sde.parquet"
    df.to_parquet(path, index=False)
    logger.success(f"Guardado: {path} ({len(df)} filas)")

    con = duckdb.connect(WAREHOUSE)
    con.execute(f"""
        CREATE OR REPLACE TABLE raw_trends_sde AS
        SELECT * FROM read_parquet('{path}')
    """)
    n = con.execute("SELECT COUNT(*) FROM raw_trends_sde").fetchone()[0]
    con.close()
    logger.success(f"DuckDB: raw_trends_sde → {n} semanas")

    return df

if __name__ == "__main__":
    df = fetch_trends()
    if df is not None:
        print(df.tail(8))
        print(f"\nPeríodo: {df['fecha'].min()} → {df['fecha'].max()}")
