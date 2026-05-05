"""
Descarga y parsea el xlsx de empleo trimestral por provincia (OEDE)
Fuente: SIPA-AFIP / OEDE — Ministerio de Capital Humano
"""
from pathlib import Path
import requests
import pandas as pd
import duckdb
import warnings
from loguru import logger

warnings.filterwarnings("ignore")

RAW_DIR   = Path("data/raw/sipa")
RAW_DIR.mkdir(parents=True, exist_ok=True)
WAREHOUSE = "warehouse/observatorio.duckdb"
URL_2DIG  = "https://www.argentina.gob.ar/sites/default/files/provinciales_serie_empleo_trimestral_2dig_5.xlsx"
XLSX_PATH = RAW_DIR / "sipa_empleo_trimestral_2dig.xlsx"

SKIP_SHEETS = {"Carátula", "Indice", "Descriptores de actividad"}

TRIM_MAP = {"1°": 1, "2°": 2, "3°": 3, "4°": 4}

def download():
    logger.info("Descargando xlsx OEDE empleo trimestral...")
    r = requests.get(URL_2DIG, timeout=60)
    r.raise_for_status()
    XLSX_PATH.write_bytes(r.content)
    logger.success(f"  Descargado: {XLSX_PATH} ({XLSX_PATH.stat().st_size/1024:.0f} KB)")

def parse_sheet(xl, sheet):
    df = xl.parse(sheet, header=None)
    header_row = df.iloc[3, 2:]
    fila_hyg = df[df[0] == "H"]
    if fila_hyg.empty:
        return None
    valores = fila_hyg.iloc[0, 2:].tolist()
    registros = []
    for h, v in zip(header_row, valores):
        h = str(h)
        if "Trim" not in h or v == "s.d." or pd.isna(v):
            continue
        partes = h.split()  # ej: ['1°', 'Trim', '2024']
        if len(partes) < 3:
            continue
        trimestre = TRIM_MAP.get(partes[0], None)
        anio = int(partes[2])
        if trimestre is None:
            continue
        registros.append({
            "provincia": sheet,
            "anio": anio,
            "trimestre": trimestre,
            "periodo": f"{anio}-T{trimestre}",
            "empleo_hyg": int(v),
        })
    return pd.DataFrame(registros) if registros else None

def load():
    download()
    xl = pd.ExcelFile(XLSX_PATH)
    sheets = [s for s in xl.sheet_names if s not in SKIP_SHEETS]
    logger.info(f"Procesando {len(sheets)} provincias...")
    dfs = []
    for sheet in sheets:
        df = parse_sheet(xl, sheet)
        if df is not None:
            dfs.append(df)
            logger.success(f"  {sheet}: {len(df)} trimestres · último: {df['periodo'].iloc[-1]} = {df['empleo_hyg'].iloc[-1]}")
    result = pd.concat(dfs, ignore_index=True)
    csv_path = RAW_DIR / "sipa_empleo_trimestral_hyg.csv"
    result.to_csv(csv_path, index=False)
    con = duckdb.connect(WAREHOUSE)
    con.execute(f"CREATE OR REPLACE TABLE raw_sipa_empleo_trimestral_hyg AS SELECT * FROM read_csv_auto('{csv_path}')")
    n = con.execute("SELECT COUNT(*) FROM raw_sipa_empleo_trimestral_hyg").fetchone()[0]
    ultimo = con.execute("SELECT MAX(periodo) FROM raw_sipa_empleo_trimestral_hyg").fetchone()[0]
    con.close()
    logger.success(f"DuckDB: raw_sipa_empleo_trimestral_hyg → {n} filas · último período: {ultimo}")
    return result

if __name__ == "__main__":
    df = load()
    print(df[df["provincia"] == "Santiago del Estero"].tail(6).to_string())
