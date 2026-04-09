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

def get_metric(endpoint: str, num_months: int = 36) -> list:
    r = requests.post(
        f"{BASE_URL}/markets/metrics/{endpoint}",
        headers=HEADERS,
        json={"market": MARKET, "num_months": num_months},
        timeout=30
    )
    r.raise_for_status()
    data = r.json()
    return data.get("data", data.get("entries", []))

def fetch_airroi():
    logger.info("Descargando métricas AirROI — Termas de Río Hondo...")
    dfs = {}

    metricas = {
        "occupancy":          "occupancy",
        "average-daily-rate": "adr",
        "length-of-stay":     "los",
        "revenue":            "revenue",
        "active-listings":    "active_listings",
    }

    for endpoint, nombre in metricas.items():
        try:
            data = get_metric(endpoint, num_months=36)
            df = pd.DataFrame(data)
            dfs[nombre] = df
            logger.success(f"  {nombre} → {len(df)} meses · cols: {df.columns.tolist()}")
        except Exception as e:
            logger.warning(f"  {nombre} error: {e}")

    if not dfs:
        logger.error("No se obtuvieron datos")
        return None

    # Combinar en un solo DataFrame usando la primera como base
    base_key = list(dfs.keys())[0]
    df_final = dfs[base_key].copy()
    date_col = [c for c in df_final.columns if "date" in c.lower() or "month" in c.lower()][0]
    df_final = df_final.rename(columns={date_col: "fecha"})

    for nombre, df in dfs.items():
        if nombre == base_key:
            continue
        date_col_other = [c for c in df.columns if "date" in c.lower() or "month" in c.lower()][0]
        df = df.rename(columns={date_col_other: "fecha"})
        metric_col = [c for c in df.columns if c != "fecha"][0]
        df_final = df_final.merge(
            df[["fecha", metric_col]].rename(columns={metric_col: nombre}),
            on="fecha", how="left"
        )

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
        print(f"Período: {df['fecha'].min()} → {df['fecha'].max()}")
        print(df.tail(8).to_string())
