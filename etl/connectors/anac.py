import requests
import pandas as pd
import duckdb
from pathlib import Path
from loguru import logger

RAW_DIR   = Path("data/raw/anac")
RAW_DIR.mkdir(parents=True, exist_ok=True)
WAREHOUSE = "warehouse/observatorio.duckdb"

URL = "https://datos.yvera.gob.ar/dataset/c0e7bc3d-553c-405c-8b32-79282b28ffd5/resource/03b4176f-a065-450a-b411-101d2a884720/download/vuelos_asientos_pasajeros.csv"

def fetch_anac():
    logger.info("Descargando ANAC — vuelos, asientos y pasajeros por día...")
    df = pd.read_csv(URL)
    
    logger.info(f"Columnas: {df.columns.tolist()}")
    logger.info(f"Total filas: {len(df)}")
    
    path = RAW_DIR / "vuelos_asientos_pasajeros.parquet"
    df.to_parquet(path, index=False)

    con = duckdb.connect(WAREHOUSE)
    con.execute(f"""
        CREATE OR REPLACE TABLE raw_anac_vuelos AS
        SELECT * FROM read_parquet('{path}')
    """)
    n = con.execute("SELECT COUNT(*) FROM raw_anac_vuelos").fetchone()[0]
    con.close()
    logger.success(f"DuckDB: raw_anac_vuelos → {n} filas")
    return df

if __name__ == "__main__":
    df = fetch_anac()
    print(df.head(5).to_string())
