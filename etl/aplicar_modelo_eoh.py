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

    df_pred = con.execute("""
        WITH meses AS (
            SELECT UNNEST([
                DATE '2025-12-01', DATE '2026-01-01',
                DATE '2026-02-01', DATE '2026-03-01',
                DATE '2026-04-01'
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
        airdna AS (SELECT fecha, mercado, occ_informal_pct FROM stg_airdna_sde),
        sipa AS (
            SELECT anio, trimestre, empleo_hyg
            FROM raw_sipa_empleo_trimestral_hyg
            WHERE provincia = 'Santiago del Estero'
        )

        SELECT c.fecha, c.localidad,
               a.pasajeros_anac, t.ibt_compuesto, tc.tcn_usd,
               i.ipc_restaurantes_hoteles_noa, d.occ_informal_pct,
               SIN(2*3.14159*EXTRACT(MONTH FROM c.fecha)/12.0) AS mes_sin,
               COS(2*3.14159*EXTRACT(MONTH FROM c.fecha)/12.0) AS mes_cos,
               EXTRACT(YEAR  FROM c.fecha) AS anio,
               EXTRACT(MONTH FROM c.fecha) AS mes,
               sp.empleo_hyg
        FROM combos c
        LEFT JOIN anac   a  USING (fecha)
        LEFT JOIN trends t  USING (fecha)
        LEFT JOIN tcn    tc USING (fecha)
        LEFT JOIN ipc    i  USING (fecha)
        LEFT JOIN airdna d  ON c.fecha = d.fecha
            AND ((c.localidad = 'Termas' AND d.mercado = 'Termas de Rio Hondo')
              OR (c.localidad = 'Santiago del Estero' AND d.mercado = 'Santiago del Estero'))
        LEFT JOIN sipa sp ON EXTRACT(YEAR FROM c.fecha) = sp.anio
            AND CAST(CEIL(CAST(EXTRACT(MONTH FROM c.fecha) AS FLOAT)/3) AS INTEGER) = sp.trimestre
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
        X = d[features].ffill().bfill().fillna(0)
        Xs = m["scaler"].transform(X)
        yp = m["modelo"].predict(Xs)
        rmse = m["metricas"]["rmse"]
        mae  = m["metricas"]["mae"]
        r2   = m["metricas"]["r2"]

        for i, row in d.iterrows():
            idx = list(d.index).index(i)
            rows.append({
                "fecha":           row["fecha"],
                "localidad":       loc,
                "viajeros":        round(max(yp[idx], 0)),
                "viajeros_ic_low": round(max(yp[idx] - 1.28*rmse, 0)),
                "viajeros_ic_high":round(yp[idx] + 1.28*rmse),
                "occ_informal_pct":row.get("occ_informal_pct"),
                "ibt_compuesto":   row.get("ibt_compuesto"),
                "tcn_usd":         row.get("tcn_usd"),
                "anio":            int(row["anio"]),
                "mes":             int(row["mes"]),
                "fuente":          "ESTIMADO_OLS",
                "flag_estimado":   1,
                "modelo_r2":       round(r2, 3),
                "modelo_mae":      round(mae),
                "modelo_rmse":     round(rmse),
            })

    return pd.DataFrame(rows)

def generar_fitted():
    """Genera predicciones del modelo sobre el período histórico (in-sample fit)."""
    modelos = pickle.load(open(MODEL_PATH, "rb"))
    con = duckdb.connect(WAREHOUSE, read_only=True)

    df_hist = con.execute("""
        WITH anac AS (
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
        airdna AS (SELECT fecha, mercado, occ_informal_pct FROM stg_airdna_sde),
        sipa AS (
            SELECT anio, trimestre, empleo_hyg
            FROM raw_sipa_empleo_trimestral_hyg
            WHERE provincia = 'Santiago del Estero'
        ),
        pulso AS (
            SELECT fecha, localidad,
                   EXTRACT(YEAR  FROM fecha) AS anio,
                   EXTRACT(MONTH FROM fecha) AS mes
            FROM mart_sde_pulso
            WHERE flag_covid = 0
              AND fecha <= '2025-11-01'
              AND localidad IN ('Termas', 'Santiago del Estero')
        )
        SELECT p.fecha, p.localidad, p.anio, p.mes,
               a.pasajeros_anac, t.ibt_compuesto, tc.tcn_usd,
               i.ipc_restaurantes_hoteles_noa, d.occ_informal_pct,
               SIN(2*3.14159*p.mes/12.0) AS mes_sin,
               COS(2*3.14159*p.mes/12.0) AS mes_cos,
               sp.empleo_hyg
        FROM pulso p
        LEFT JOIN anac   a  USING (fecha)
        LEFT JOIN trends t  USING (fecha)
        LEFT JOIN tcn    tc USING (fecha)
        LEFT JOIN ipc    i  USING (fecha)
        LEFT JOIN airdna d  ON p.fecha = d.fecha
            AND ((p.localidad = 'Termas' AND d.mercado = 'Termas de Rio Hondo')
              OR (p.localidad = 'Santiago del Estero' AND d.mercado = 'Santiago del Estero'))
        LEFT JOIN sipa sp ON p.anio = sp.anio
            AND CAST(CEIL(CAST(p.mes AS FLOAT)/3) AS INTEGER) = sp.trimestre
        ORDER BY p.fecha, p.localidad
    """).df()
    con.close()

    rows = []
    for loc in ["Termas", "Santiago del Estero"]:
        if loc not in modelos:
            continue
        m = modelos[loc]
        features = m["metricas"]["features"]
        d = df_hist[df_hist["localidad"] == loc].copy()
        X = d[features].ffill().bfill().fillna(0)
        Xs = m["scaler"].transform(X)
        yp = m["modelo"].predict(Xs)
        for i, row in d.iterrows():
            idx = list(d.index).index(i)
            rows.append({
                "fecha":     row["fecha"],
                "localidad": loc,
                "viajeros_fit": round(max(yp[idx], 0)),
            })
    return pd.DataFrame(rows)

if __name__ == "__main__":
    df_est = generar_estimados()
    print(df_est[["fecha","localidad","viajeros","ibt_compuesto","fuente"]].to_string())

    df_fit = generar_fitted()

    # Escribir al warehouse
    con = duckdb.connect(WAREHOUSE)
    con.execute("CREATE OR REPLACE TABLE raw_estimados_ols AS SELECT * FROM df_est")
    con.execute("CREATE OR REPLACE TABLE raw_fitted_ols AS SELECT * FROM df_fit")
    n = con.execute("SELECT COUNT(*) FROM raw_estimados_ols").fetchone()[0]
    n2 = con.execute("SELECT COUNT(*) FROM raw_fitted_ols").fetchone()[0]
    hasta = con.execute("SELECT MAX(fecha) FROM raw_estimados_ols").fetchone()[0]
    con.close()
    logger.success(f"raw_estimados_ols → {n} filas · hasta {hasta}")
    logger.success(f"raw_fitted_ols → {n2} filas (in-sample fit)")
