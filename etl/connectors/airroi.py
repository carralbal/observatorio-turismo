import os
import requests
import pandas as pd
import duckdb
from pathlib import Path
from loguru import logger
from dotenv import load_dotenv

load_dotenv()
API_KEY   = os.getenv("AIRROI_API_KEY")
RAW_DIR   = Path("data/raw/airroi")
RAW_DIR.mkdir(parents=True, exist_ok=True)
WAREHOUSE = "warehouse/observatorio.duckdb"
BASE_URL  = "https://api.airroi.com"
HEADERS   = {"x-api-key": API_KEY, "Content-Type": "application/json"}

MARKET = {
    "country":  "Argentina",
    "region":   "Santiago del Estero",
    "locality": "Termas de Río Hondo"
}

METRICAS = {
    "occupancy":          "occ",
    "average-daily-rate": "adr",
    "length-of-stay":     "los",
    "revenue":            "rev",
    "active-listings":    "listings",
}

def get_metric(endpoint: str, num_months: int = 36) -> pd.DataFrame:
    r = requests.post(
        f"{BASE_URL}/markets/metrics/{endpoint}",
        headers=HEADERS,
        json={"market": MARKET, "num_months": num_months},
        timeout=30
    )
    r.raise_for_status()
    # La API devuelve los datos en "results", no en "data"
    results = r.json().get("results", [])
    return pd.DataFrame(results)

def fetch_airroi():
    logger.info("Descargando AirROI — Termas de Río Hondo...")
    dfs = {}

    for endpoint, nombre in METRICAS.items():
        try:
            df = get_metric(endpoint, num_months=36)
            if not df.empty:
                # Renombrar columnas con prefijo
                df = df.rename(columns={
                    c: f"{nombre}_{c}" if c != "date" else "fecha"
                    for c in df.columns
                })
                dfs[nombre] = df
                logger.success(f"  {nombre} → {len(df)} meses · {df.columns.tolist()}")
            else:
                logger.warning(f"  {nombre} → vacío")
        except Exception as e:
            logger.warning(f"  {nombre} error: {e}")

    if not dfs:
        logger.error("Sin datos")
        return None

    # Merge todo usando fecha como clave
    df_final = list(dfs.values())[0]
    for nombre, df in list(dfs.items())[1:]:
        df_final = df_final.merge(df, on="fecha", how="outer")

    df_final["fecha"] = pd.to_datetime(df_final["fecha"])
    df_final["mercado"] = "Termas de Río Hondo"
    df_final = df_final.sort_values("fecha")

    path = RAW_DIR / "airroi_termas.parquet"
    df_final.to_parquet(path, index=False)

    con = duckdb.connect(WAREHOUSE)
    con.execute(f"""
        CREATE OR REPLACE TABLE raw_airroi_termas AS
        SELECT * FROM read_parquet('{path}')
    """)
    n = con.execute("SELECT COUNT(*) FROM raw_airroi_termas").fetchone()[0]
    con.close()

    logger.success(f"DuckDB: raw_airroi_termas → {n} meses")
    return df_final

if __name__ == "__main__":
    df = fetch_airroi()
    if df is not None:
        print(f"\nColumnas: {df.columns.tolist()}")
        print(f"Período: {df['fecha'].min().strftime('%Y-%m')} → {df['fecha'].max().strftime('%Y-%m')}")
        print(df[["fecha","occ_avg","adr_avg","los_avg"]].tail(8).to_string())
