import pandas as pd
import duckdb
from pathlib import Path
from loguru import logger

RAW_DIR   = Path("data/raw/eti")
RAW_DIR.mkdir(parents=True, exist_ok=True)
WAREHOUSE = "warehouse/observatorio.duckdb"

ARCHIVOS = {
    "receptivo": "https://datos.yvera.gob.ar/dataset/4cbf7d4a-702a-4911-8c1e-717a45214902/resource/fdfe0ae4-4acc-4421-aa48-6149a02bc615/download/turistas-no-residentes-serie.csv",
    "emisivo":   "https://datos.yvera.gob.ar/dataset/4cbf7d4a-702a-4911-8c1e-717a45214902/resource/fd710cb7-1981-43ea-aba3-7a14c356446b/download/turistas-residentes-serie.csv",
    "balanza":   "https://datos.yvera.gob.ar/dataset/4cbf7d4a-702a-4911-8c1e-717a45214902/resource/7f96ec00-9300-4ea3-88b4-073fd4fa6d71/download/saldo-turistas-serie.csv",
    "serie_mensual": "https://datos.yvera.gob.ar/dataset/4cbf7d4a-702a-4911-8c1e-717a45214902/resource/39455901-5488-4a01-8594-7b2b0a1e85a1/download/serie-tiempo-turismo-internacional.csv",
}

def fetch_eti():
    con = duckdb.connect(WAREHOUSE)
    for nombre, url in ARCHIVOS.items():
        logger.info(f"Descargando ETI — {nombre}...")
        df = pd.read_csv(url)
        logger.info(f"  Columnas: {df.columns.tolist()}")
        path = RAW_DIR / f"eti_{nombre}.parquet"
        df.to_parquet(path, index=False)
        con.execute(f"""
            CREATE OR REPLACE TABLE raw_eti_{nombre} AS
            SELECT * FROM read_parquet('{path}')
        """)
        n = con.execute(f"SELECT COUNT(*) FROM raw_eti_{nombre}").fetchone()[0]
        logger.success(f"  raw_eti_{nombre} → {n} filas")
    con.close()

if __name__ == "__main__":
    fetch_eti()
