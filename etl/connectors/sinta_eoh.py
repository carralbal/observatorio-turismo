import requests
import pandas as pd
import duckdb
from pathlib import Path
from loguru import logger
from datetime import datetime

RAW_DIR   = Path("data/raw/eoh")
RAW_DIR.mkdir(parents=True, exist_ok=True)
WAREHOUSE = "warehouse/observatorio.duckdb"

ARCHIVOS = {
    "viajeros_localidad":   "https://datos.yvera.gob.ar/dataset/93db331e-6970-4d74-8589-c1223ac9c282/resource/57b5deae-026e-4413-9f90-89a428496bfb/download/viajeros_por_localidad_segun_residencia.csv",
    "pernoctes_localidad":  "https://datos.yvera.gob.ar/dataset/93db331e-6970-4d74-8589-c1223ac9c282/resource/7b6ba47f-4aa9-4743-96be-d0e6157cfc5e/download/pernoctes_por_localidad_segun_residencia.csv",
    "estadia_destino":      "https://datos.yvera.gob.ar/dataset/93db331e-6970-4d74-8589-c1223ac9c282/resource/46a0b45c-9f22-455a-9328-6c8bd51710b2/download/estadia-media-residentes-y-no-residentes-por-destino.csv",
    "toh_region_categoria": "https://datos.yvera.gob.ar/dataset/93db331e-6970-4d74-8589-c1223ac9c282/resource/e465c1a9-1564-4747-9500-3bf6aa36b87a/download/tasas-de-ocupacion-habitacion-por-region-y-categoria.csv",
}

def fetch_eoh():
    con = duckdb.connect(WAREHOUSE)

    for nombre, url in ARCHIVOS.items():
        logger.info(f"Descargando {nombre}...")
        df = pd.read_csv(url)
        path = RAW_DIR / f"{nombre}.parquet"
        df.to_parquet(path, index=False)
        con.execute(f"""
            CREATE OR REPLACE TABLE raw_eoh_{nombre} AS
            SELECT * FROM read_parquet('{path}')
        """)
        n = con.execute(f"SELECT COUNT(*) FROM raw_eoh_{nombre}").fetchone()[0]
        logger.success(f"  raw_eoh_{nombre} → {n} filas")

    con.close()
    logger.success("EOH completo en DuckDB")

if __name__ == "__main__":
    fetch_eoh()
