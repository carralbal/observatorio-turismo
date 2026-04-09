
import duckdb
import pandas as pd
import numpy as np
import pickle
from pathlib import Path
from loguru import logger

WAREHOUSE = "warehouse/observatorio.duckdb"
MODEL_PATH = Path("models/modelos_eoh.pkl")

def generar_estimados():
    modelos = pickle.load(open(MODEL_PATH, "rb"))
    con = duckdb.connect(WAREHOUSE, read_only=True)

    # Datos para prediccion — meses sin EOH
    df_pred = con.execute("""
        WITH meses AS (
            SELECT UNNEST([
                DATE '2025-12-01', DATE '2026-01-01',
                DATE '2026-02-01', DATE '2026-03-01'
            ]) AS fecha
        ),
        locs AS (
            SELECT UNNEST(['Termas','Santiago del Estero']) AS localidad
        ),
        combos AS (
            SELECT m.fecha, l.localidad
            FROM meses m CROSS JOIN locs l
        ),
        anac AS (
            SELECT DATE_TRUNC('month', fecha) AS fecha, SUM(pasajeros) AS pasajeros_anac
            FROM stg_anac_sde WHERE clasificacion_vuelo = 'Cabotaje'
            GROUP BY 1
        ),
        trends AS (SELECT fecha, ibt_compuesto FROM stg_trends_sde),
        tcn    AS (SELECT fecha, tcn_usd FROM stg_bcra_tcn),
        ipc    AS (
            SELECT DATE_TRUNC('month', indice_tiempo) AS fecha,
                   ipc_restaurantes_hoteles_noa
            FROM raw_ipc_capitulos
        ),
        airdna AS (SELECT fecha, mercado, occ_informal_pct FROM stg_airdna_sde)

        SELECT c.fecha, c.localidad,
               a.pasajeros_anac, t.ibt_compuesto, tc.tcn_usd,
               i.ipc_restaurantes_hoteles_noa, d.occ_informal_pct,
               SIN(2*3.14159*EXTRACT(MONTH FROM c.fecha)/12.0) AS mes_sin,
               COS(2*3.14159*EXTRACT(MONTH FROM c.fecha)/12.0) AS mes_cos,
               EXTRACT(YEAR  FROM c.fecha) AS anio,
               EXTRACT(MONTH FROM c.fecha) AS mes
        FROM combos c
        LEFT JOIN anac   a  USING (fecha)
        LEFT JOIN trends t  USING (fecha)
        LEFT JOIN tcn    tc USING (fecha)
        LEFT JOIN ipc    i  USING (fecha)
        LEFT JOIN airdna d  ON c.fecha = d.fecha
            AND ((c.localidad = 'Termas' AND d.mercado = 'Termas de Rio Hondo')
              OR (c.localidad = 'Santiago del Estero' AND d.mercado = 'Santiago del Estero'))
        ORDER BY c.fecha, c.localidad
    """).df()
    con.close()

    rows = []
    for loc in ["Termas", "Santiago del Estero"]:
        if loc not in modelos:
            continue
        m = modelos[loc]
        features = m["metricas"]["features"]
        d = df_pred[df_pred["localidad"] == loc].copy()
        X = d[features].fillna(d[features].median())
        Xs = m["scaler"].transform(X)
        yp = m["modelo"].predict(Xs)
        rmse = m["metricas"]["rmse"]
        mae  = m["metricas"]["mae"]
        r2   = m["metricas"]["r2"]

        for i, row in d.iterrows():
            rows.append({
                "fecha":              row["fecha"],
                "localidad":          loc,
                "viajeros":           round(max(yp[list(d.index).index(i)], 0)),
                "viajeros_ic_low":    round(max(yp[list(d.index).index(i)] - 1.28*rmse, 0)),
                "viajeros_ic_high":   round(yp[list(d.index).index(i)] + 1.28*rmse),
                "occ_informal_pct":   row.get("occ_informal_pct"),
                "ibt_compuesto":      row.get("ibt_compuesto"),
                "tcn_usd":            row.get("tcn_usd"),
                "anio":               int(row["anio"]),
                "mes":                int(row["mes"]),
                "fuente":             "ESTIMADO_OLS",
                "flag_estimado":      1,
                "modelo_r2":          round(r2, 3),
                "modelo_mae":         round(mae),
                "modelo_rmse":        round(rmse),
            })

    return pd.DataFrame(rows)

if __name__ == "__main__":
    df_est = generar_estimados()
    print(df_est[["fecha","localidad","viajeros","viajeros_ic_low","viajeros_ic_high","fuente"]].to_string())

    # Guardar para verificacion
    df_est.to_csv("/tmp/estimados_ols.csv", index=False)
    print(f"\nGuardado en /tmp/estimados_ols.csv")
