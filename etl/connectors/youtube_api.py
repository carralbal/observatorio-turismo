import os
import requests
import pandas as pd
import duckdb
from pathlib import Path
from loguru import logger
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()
API_KEY   = os.getenv("YOUTUBE_API_KEY")
RAW_DIR   = Path("data/raw/youtube")
RAW_DIR.mkdir(parents=True, exist_ok=True)
WAREHOUSE = "warehouse/observatorio.duckdb"
BASE_URL  = "https://www.googleapis.com/youtube/v3"

# Dos estrategias de búsqueda: recientes + relevantes históricos
SEARCHES = [
    # Recientes — últimos 12 meses
    {"q": "Termas de Río Hondo turismo",    "order": "date",      "tag": "reciente"},
    {"q": "Termas de Río Hondo hotel",      "order": "date",      "tag": "reciente"},
    {"q": "Santiago del Estero turismo",    "order": "date",      "tag": "reciente"},
    {"q": "MotoGP Termas Argentina",        "order": "date",      "tag": "reciente"},
    {"q": "Termas de Río Hondo 2026",       "order": "date",      "tag": "reciente"},
    # Históricos por relevancia — captura los más vistos de todos los tiempos
    {"q": "Termas de Río Hondo",            "order": "viewCount", "tag": "historico"},
    {"q": "MotoGP Argentina Termas",        "order": "viewCount", "tag": "historico"},
    {"q": "Termas Río Hondo MotoGP 2014",   "order": "viewCount", "tag": "historico"},
    {"q": "Termas Río Hondo MotoGP 2015",   "order": "viewCount", "tag": "historico"},
    {"q": "Termas Río Hondo MotoGP 2019",   "order": "viewCount", "tag": "historico"},
    {"q": "Santiago del Estero viaje",      "order": "viewCount", "tag": "historico"},
    {"q": "turismo termal Argentina",       "order": "viewCount", "tag": "historico"},
]

def search_videos(query: str, order: str, max_results: int = 50) -> list:
    params = {
        "part":       "snippet",
        "q":          query,
        "type":       "video",
        "maxResults": max_results,
        "order":      order,
        "key":        API_KEY,
    }
    r = requests.get(f"{BASE_URL}/search", params=params, timeout=30)
    r.raise_for_status()
    return r.json().get("items", [])

def get_video_stats(video_ids: list) -> dict:
    params = {
        "part": "statistics,snippet,contentDetails",
        "id":   ",".join(video_ids),
        "key":  API_KEY,
    }
    r = requests.get(f"{BASE_URL}/videos", params=params, timeout=30)
    r.raise_for_status()
    return {item["id"]: item for item in r.json().get("items", [])}

def fetch_youtube():
    logger.info("Descargando datos YouTube — recientes + históricos...")
    all_rows = []

    for search in SEARCHES:
        logger.info(f"  [{search['tag']}] '{search['q']}' (order={search['order']})...")
        try:
            items = search_videos(search["q"], search["order"], max_results=50)
            if not items:
                continue

            video_ids = [i["id"]["videoId"] for i in items if i["id"].get("videoId")]
            stats = get_video_stats(video_ids)

            for item in items:
                vid_id = item["id"].get("videoId")
                if not vid_id:
                    continue
                snip = item["snippet"]
                stat = stats.get(vid_id, {}).get("statistics", {})

                all_rows.append({
                    "video_id":      vid_id,
                    "query":         search["q"],
                    "tag":           search["tag"],
                    "order_usado":   search["order"],
                    "titulo":        snip.get("title", ""),
                    "canal":         snip.get("channelTitle", ""),
                    "fecha_publi":   snip.get("publishedAt", "")[:10],
                    "descripcion":   snip.get("description", "")[:300],
                    "vistas":        int(stat.get("viewCount", 0)),
                    "likes":         int(stat.get("likeCount", 0)),
                    "comentarios":   int(stat.get("commentCount", 0)),
                    "url":           f"https://youtube.com/watch?v={vid_id}",
                    "descargado_en": datetime.now().strftime("%Y-%m-%d"),
                })
        except Exception as e:
            logger.warning(f"  Error: {e}")

    df = pd.DataFrame(all_rows).drop_duplicates("video_id")
    df["fecha_publi"] = pd.to_datetime(df["fecha_publi"])
    df = df.sort_values("vistas", ascending=False)

    path = RAW_DIR / f"youtube_sde_{datetime.now().strftime('%Y%m%d')}.parquet"
    df.to_parquet(path, index=False)

    con = duckdb.connect(WAREHOUSE)
    con.execute(f"""
        CREATE OR REPLACE TABLE raw_youtube_sde AS
        SELECT * FROM read_parquet('{path}')
    """)
    n = con.execute("SELECT COUNT(*) FROM raw_youtube_sde").fetchone()[0]
    con.close()

    logger.success(f"DuckDB: raw_youtube_sde → {n} videos únicos")
    return df

if __name__ == "__main__":
    df = fetch_youtube()
    if df is not None:
        print(f"\nTotal: {len(df)} videos únicos")
        print(f"Período: {df['fecha_publi'].min().year} → {df['fecha_publi'].max().year}")
        print(f"\nTop 10 por vistas:")
        print(df.nlargest(10, "vistas")[
            ["titulo","canal","vistas","fecha_publi","tag"]
        ].to_string())
        print(f"\nPor tag:")
        print(df.groupby("tag")["video_id"].count())
