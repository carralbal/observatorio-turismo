
import duckdb
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
from sklearn.preprocessing import StandardScaler
import pickle
from pathlib import Path
from loguru import logger

WAREHOUSE = "warehouse/observatorio.duckdb"
MODEL_DIR = Path("models")
MODEL_DIR.mkdir(exist_ok=True)

def cargar_datos():
    con = duckdb.connect(WAREHOUSE, read_only=True)
    df = con.execute("""
        WITH eoh AS (
            SELECT fecha, localidad, viajeros_total, anio, mes
            FROM mart_sde_pulso
            WHERE flag_covid = 0
              AND localidad IN ('Termas', 'Santiago del Estero')
              AND viajeros_total > 0
        ),
        anac AS (
            SELECT DATE_TRUNC('month', fecha) AS fecha, SUM(pasajeros) AS pasajeros_anac
            FROM stg_anac_sde WHERE clasificacion_vuelo = 'Cabotaje'
            GROUP BY 1
        ),
        trends AS (SELECT fecha, ibt_compuesto FROM stg_trends_sde),
        tcn AS (SELECT fecha, tcn_usd FROM stg_bcra_tcn),
        ipc AS (
            SELECT DATE_TRUNC('month', indice_tiempo) AS fecha,
                   ipc_restaurantes_hoteles_noa
            FROM raw_ipc_capitulos
        ),
        airdna AS (
            SELECT fecha, mercado, occ_informal_pct
            FROM stg_airdna_sde
        )
        SELECT e.fecha, e.localidad, e.viajeros_total, e.anio, e.mes,
               a.pasajeros_anac, t.ibt_compuesto, c.tcn_usd,
               i.ipc_restaurantes_hoteles_noa, d.occ_informal_pct,
               SIN(2*3.14159*e.mes/12.0) AS mes_sin,
               COS(2*3.14159*e.mes/12.0) AS mes_cos
        FROM eoh e
        LEFT JOIN anac   a USING (fecha)
        LEFT JOIN trends t USING (fecha)
        LEFT JOIN tcn    c USING (fecha)
        LEFT JOIN ipc    i USING (fecha)
        LEFT JOIN airdna d ON e.fecha = d.fecha
            AND ((e.localidad = 'Termas' AND d.mercado = 'Termas de Rio Hondo')
              OR (e.localidad = 'Santiago del Estero' AND d.mercado = 'Santiago del Estero'))
        ORDER BY e.fecha, e.localidad
    """).df()
    con.close()
    return df

def entrenar(df, localidad):
    logger.info(f"Entrenando {localidad}...")
    d = df[df["localidad"] == localidad].copy()
    FEATURES = ["pasajeros_anac","ibt_compuesto","tcn_usd",
                "ipc_restaurantes_hoteles_noa","mes_sin","mes_cos"]
    if d["occ_informal_pct"].notna().sum() > 5:
        FEATURES.append("occ_informal_pct")
    d = d[FEATURES + ["viajeros_total"]].dropna()
    if len(d) < 20:
        logger.warning(f"  Solo {len(d)} filas")
        return None, None, None
    X = d[FEATURES]
    y = d["viajeros_total"]
    scaler = StandardScaler()
    Xs = scaler.fit_transform(X)
    m = LinearRegression().fit(Xs, y)
    yp = m.predict(Xs)
    r2   = r2_score(y, yp)
    mae  = mean_absolute_error(y, yp)
    rmse = np.sqrt(mean_squared_error(y, yp))
    logger.success(f"  R²={r2:.3f} MAE={mae:.0f} RMSE={rmse:.0f} n={len(d)}")
    for f, c in zip(FEATURES, m.coef_):
        logger.info(f"    {f}: {c:+.1f}")
    return m, scaler, {"r2":r2,"mae":mae,"rmse":rmse,"features":FEATURES}

if __name__ == "__main__":
    df = cargar_datos()
    logger.info(f"Dataset: {len(df)} filas")
    res = {}
    for loc in ["Termas","Santiago del Estero"]:
        m, s, met = entrenar(df, loc)
        if m: res[loc] = {"modelo":m,"scaler":s,"metricas":met}
    pickle.dump(res, open(MODEL_DIR/"modelos_eoh.pkl","wb"))
    print("\n=== RESUMEN ===")
    for loc, r in res.items():
        met = r["metricas"]
        print(f"\n{loc}: R²={met['r2']:.3f} MAE={met['mae']:.0f} RMSE={met['rmse']:.0f}")
