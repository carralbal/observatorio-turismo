import requests
import pandas as pd
import duckdb
from pathlib import Path
from loguru import logger

RAW_DIR   = Path("data/raw/bcra")
RAW_DIR.mkdir(parents=True, exist_ok=True)
WAREHOUSE = "warehouse/observatorio.duckdb"

def fetch_bcra_fx():
    logger.info("Descargando tipo de cambio BCRA...")

    url = "https://apis.datos.gob.ar/series/api/series/"
    params = {
        "ids":                    "168.1_T_CAMBIOR_D_0_0_26",
        "collapse":               "month",
        "collapse_aggregation":   "avg",
        "start_date":             "2004-01-01",
        "limit":                  500,
        "format":                 "json",
    }

    r = requests.get(url, params=params, timeout=30)
    r.raise_for_status()

    data = r.json()["data"]
    df = pd.DataFrame(data, columns=["fecha", "tcn_usd"])
    df["fecha"] = pd.to_datetime(df["fecha"])
    df = df.dropna()

    path = RAW_DIR / "bcra_tcn.parquet"
    df.to_parquet(path, index=False)

    con = duckdb.connect(WAREHOUSE)
    con.execute(f"""
        CREATE OR REPLACE TABLE raw_bcra_tcn AS
        SELECT * FROM read_parquet('{path}')
    """)
    n = con.execute("SELECT COUNT(*) FROM raw_bcra_tcn").fetchone()[0]
    con.close()

    logger.success(f"DuckDB: raw_bcra_tcn → {n} meses · último: {df['tcn_usd'].iloc[-1]:.1f} ARS/USD ({df['fecha'].iloc[-1].strftime('%Y-%m')})")
    return df

if __name__ == "__main__":
    df = fetch_bcra_fx()
    print(df.tail(6).to_string())
