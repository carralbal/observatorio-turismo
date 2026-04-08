import requests
import pandas as pd
import duckdb
import io
from pathlib import Path
from loguru import logger

RAW_DIR   = Path("data/raw/ipc")
RAW_DIR.mkdir(parents=True, exist_ok=True)
WAREHOUSE = "warehouse/observatorio.duckdb"

URL = "https://infra.datos.gob.ar/catalog/sspm/dataset/145/distribution/145.5/download/indice-precios-al-consumidor-apertura-por-capitulos-base-diciembre-2016-mensual.csv"

def fetch_ipc():
    logger.info("Descargando IPC por capítulos...")
    r = requests.get(URL, timeout=30)
    r.raise_for_status()

    df = pd.read_csv(io.StringIO(r.text))
    df["indice_tiempo"] = pd.to_datetime(df["indice_tiempo"])

    # Quedarnos solo con las columnas relevantes
    cols = ["indice_tiempo",
            "ipc_restaurantes_hoteles_nacional",
            "ipc_restaurantes_hoteles_noa",
            "ipc_alimentos_bebidas_no_alcoholicas_nacional",
            "ipc_transporte_nacional"]
    df = df[cols].dropna()

    path = RAW_DIR / "ipc_capitulos.parquet"
    df.to_parquet(path, index=False)

    con = duckdb.connect(WAREHOUSE)
    con.execute(f"""
        CREATE OR REPLACE TABLE raw_ipc_capitulos AS
        SELECT * FROM read_parquet('{path}')
    """)
    n = con.execute("SELECT COUNT(*) FROM raw_ipc_capitulos").fetchone()[0]
    ultimo = df["ipc_restaurantes_hoteles_nacional"].iloc[-1]
    fecha  = df["indice_tiempo"].iloc[-1].strftime("%Y-%m")
    con.close()

    logger.success(f"DuckDB: raw_ipc_capitulos → {n} meses")
    logger.info(f"IPC Restaurantes/Hoteles nacional: {ultimo:.1f} ({fecha})")
    return df

if __name__ == "__main__":
    df = fetch_ipc()
    print(df.tail(6).to_string())
