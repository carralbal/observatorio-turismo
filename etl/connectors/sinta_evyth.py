import pandas as pd
import duckdb
from pathlib import Path
from loguru import logger

RAW_DIR   = Path("data/raw/evyth")
RAW_DIR.mkdir(parents=True, exist_ok=True)
WAREHOUSE = "warehouse/observatorio.duckdb"

ARCHIVOS = {
    "destino":        "https://datos.yvera.gob.ar/dataset/945e10f1-eee7-48a2-b0ef-8aff11df8814/resource/b8f0f46d-eb2f-4d68-a182-e66778bbf89a/download/tur_int_turistas_residentes_destino_serie.csv",
    "origen":         "https://datos.yvera.gob.ar/dataset/945e10f1-eee7-48a2-b0ef-8aff11df8814/resource/678a669c-9fd0-4e46-a519-32d8acdf3b81/download/tur_int_turistas_residentes_origen_serie.csv",
    "motivo":         "https://datos.yvera.gob.ar/dataset/945e10f1-eee7-48a2-b0ef-8aff11df8814/resource/54779849-690a-49da-a7c7-8d2f4e70d83f/download/tur_int_turistas_residentes_motivo_serie.csv",
    "alojamiento":    "https://datos.yvera.gob.ar/dataset/945e10f1-eee7-48a2-b0ef-8aff11df8814/resource/eab20d9c-137f-4a56-8140-cb035848c057/download/tur_int_turistas_residentes_tipo_alojamiento_serie.csv",
    "edad":           "https://datos.yvera.gob.ar/dataset/945e10f1-eee7-48a2-b0ef-8aff11df8814/resource/abdacfcd-4a6c-4283-9abb-c1352def52e1/download/tur_int_turistas_residentes_edad_serie.csv",
    "sexo":           "https://datos.yvera.gob.ar/dataset/945e10f1-eee7-48a2-b0ef-8aff11df8814/resource/f5e38aa3-e038-4cf1-89f8-973d03e20fd7/download/tur_int_turistas_residentes_sexo_serie.csv",
    "transporte":     "https://datos.yvera.gob.ar/dataset/945e10f1-eee7-48a2-b0ef-8aff11df8814/resource/5895fdf2-7b50-484f-9305-b368b8744423/download/tur_int_turistas_residentes_tipo_transporte_serie.csv",
    "quintil":        "https://datos.yvera.gob.ar/dataset/945e10f1-eee7-48a2-b0ef-8aff11df8814/resource/1c9e99b6-e5aa-44e5-80cb-52c01d8295a5/download/tur_int_turistas_residentes_quintil_serie.csv",
    "gasto_destino":  "https://datos.yvera.gob.ar/dataset/945e10f1-eee7-48a2-b0ef-8aff11df8814/resource/9e4c5e37-fea0-4028-ac0f-53bd60cca9a9/download/tur_int_turistas_residentes_gasto_promedio_trim_destino_serie.csv",
    "estadia_destino":"https://datos.yvera.gob.ar/dataset/945e10f1-eee7-48a2-b0ef-8aff11df8814/resource/1c866310-7f11-45bd-b2b5-5f13ce1a0d46/download/tur_int_turistas_residentes_estadia_media_trim_destino_serie.csv",
    "serie_trimestral":"https://datos.yvera.gob.ar/dataset/945e10f1-eee7-48a2-b0ef-8aff11df8814/resource/873f216b-131b-4d43-b136-b232fff1e44e/download/serie-tiempo-turismo-interno-trimestral.csv",
}

def fetch_evyth():
    con = duckdb.connect(WAREHOUSE)
    for nombre, url in ARCHIVOS.items():
        logger.info(f"Descargando EVyTH — {nombre}...")
        try:
            df = pd.read_csv(url)
            path = RAW_DIR / f"evyth_{nombre}.parquet"
            df.to_parquet(path, index=False)
            con.execute(f"""
                CREATE OR REPLACE TABLE raw_evyth_{nombre} AS
                SELECT * FROM read_parquet('{path}')
            """)
            n = con.execute(f"SELECT COUNT(*) FROM raw_evyth_{nombre}").fetchone()[0]
            logger.success(f"  raw_evyth_{nombre} → {n} filas · cols: {df.columns.tolist()[:4]}")
        except Exception as e:
            logger.warning(f"  Error {nombre}: {e}")
    con.close()

if __name__ == "__main__":
    fetch_evyth()
