"""
Conector SIPA/OEDE — Empleo Hotelería y Gastronomía
Fuente: SIPA-AFIP / INDEC
Datos: empleo registrado HyG por provincia · mensual · trimestral
Archivos fuente: data/raw/sipa/
Nota: los CSVs van en data/raw/sipa/ — no suben a GitHub
"""
import pandas as pd
import duckdb
from pathlib import Path
from loguru import logger

RAW_DIR   = Path("data/raw/sipa")
WAREHOUSE = "warehouse/observatorio.duckdb"

ARCHIVOS = {
    "sipa_empleo_mensual":    "sipa_empleo_mensual.csv",
    "sipa_empleo_trimestral": "sipa_empleo_trimestral.csv",
    "sipa_panel_provincias":  "sipa_panel_provincias.csv",
    "sipa_eoh_provincia":     "sipa_eoh_provincia.csv",
    "sipa_cabotaje_provincia":"sipa_cabotaje_provincia.csv",
    "sipa_terrestre_prov":    "sipa_terrestre_prov.csv",
    "sipa_gastro_provincia":  "sipa_gastro_provincia.csv",
    "sipa_establecimientos":  "sipa_establecimientos.csv",
    "sipa_pbi":               "sipa_pbi.csv",
    "sipa_exportaciones":     "sipa_exportaciones.csv",
    "sipa_empleo_tipos":      "sipa_empleo_tipos.csv",
}

def load_sipa():
    con = duckdb.connect(WAREHOUSE)
    for tabla, archivo in ARCHIVOS.items():
        path = RAW_DIR / archivo
        if not path.exists():
            logger.warning(f"  {archivo} no encontrado — skip")
            continue
        try:
            try:
                df = pd.read_csv(path, encoding='utf-8')
            except:
                df = pd.read_csv(path, encoding='latin1')
            con.execute(f"CREATE OR REPLACE TABLE raw_{tabla} AS SELECT * FROM df")
            n = con.execute(f"SELECT COUNT(*) FROM raw_{tabla}").fetchone()[0]
            logger.success(f"  raw_{tabla} → {n} filas")
        except Exception as e:
            logger.error(f"  {tabla}: {e}")
    con.close()

if __name__ == "__main__":
    logger.info("Cargando datos SIPA/OEDE — Empleo HyG...")
    load_sipa()
    logger.success("Listo")
