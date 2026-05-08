import pandas as pd
import duckdb
from pathlib import Path
from loguru import logger

RAW_DIR   = Path("data/raw/cnrt")
RAW_DIR.mkdir(parents=True, exist_ok=True)
WAREHOUSE = "warehouse/observatorio.duckdb"

URL = "https://datos.yvera.gob.ar/dataset/b18f1c90-0c66-4771-8bd8-289e5cfa6e60/resource/0e8a61b7-8127-41a4-8e83-a37f50e24d1f/download/magnitudes_por_ruta.csv"

PROVINCIAS_PARES = ["Tucum", "La Rioja", "Catamarca", "San Luis", "Jujuy",
                    "Salta", "Santiago", "Termas"]

def fetch_cnrt():
    logger.info("Descargando CNRT — magnitudes por ruta...")
    df = pd.read_csv(URL)

    # Filtrar rutas relevantes (SDE + provincias pares)
    patron = "|".join(PROVINCIAS_PARES)
    mask = df["par_origen_destino"].str.contains(patron, case=False, na=False)
    df_sde = df[mask].copy()

    logger.info(f"Total filas raw: {len(df)} → filtrado NOA+pares: {len(df_sde)}")

    path = RAW_DIR / "cnrt_noa_pares.parquet"
    df_sde.to_parquet(path, index=False)

    con = duckdb.connect(WAREHOUSE)
    con.execute(f"""
        CREATE OR REPLACE TABLE raw_cnrt_pares AS
        SELECT * FROM read_parquet('{path}')
    """)
    n = con.execute("SELECT COUNT(*) FROM raw_cnrt_pares").fetchone()[0]
    con.close()

    logger.success(f"DuckDB: raw_cnrt_pares → {n} filas")
    return df_sde

if __name__ == "__main__":
    df = fetch_cnrt()
    print(df.groupby("indice_tiempo")["pasajeros"].sum().tail(8))
