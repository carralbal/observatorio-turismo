import pandas as pd
import duckdb
from pathlib import Path
from loguru import logger

RAW_DIR   = Path("data/raw/anac")
RAW_DIR.mkdir(parents=True, exist_ok=True)
WAREHOUSE = "warehouse/observatorio.duckdb"

URL = "https://datos.yvera.gob.ar/dataset/c0e7bc3d-553c-405c-8b32-79282b28ffd5/resource/aab49234-28c9-48ab-a978-a83485139290/download/base_microdatos.csv"

def fetch_anac_sde():
    logger.info("Descargando microdatos ANAC (puede tardar)...")

    # Leer en chunks para no saturar memoria
    chunks = []
    for chunk in pd.read_csv(URL, chunksize=50000):
        sde = chunk[
            (chunk["origen_provincia"] == "Santiago del Estero") |
            (chunk["destino_provincia"] == "Santiago del Estero")
        ]
        if len(sde) > 0:
            chunks.append(sde)

    df = pd.concat(chunks, ignore_index=True)
    df["indice_tiempo"] = pd.to_datetime(df["indice_tiempo"])

    path = RAW_DIR / "anac_sde.parquet"
    df.to_parquet(path, index=False)

    con = duckdb.connect(WAREHOUSE)
    con.execute(f"""
        CREATE OR REPLACE TABLE raw_anac_sde AS
        SELECT * FROM read_parquet('{path}')
    """)
    n = con.execute("SELECT COUNT(*) FROM raw_anac_sde").fetchone()[0]
    con.close()

    logger.success(f"DuckDB: raw_anac_sde → {n} filas")
    logger.info(f"Período: {df['indice_tiempo'].min()} → {df['indice_tiempo'].max()}")
    return df

if __name__ == "__main__":
    df = fetch_anac_sde()
    print(df.groupby(df["indice_tiempo"].dt.year)["pasajeros"].sum())
