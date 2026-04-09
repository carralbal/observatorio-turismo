/*
  mart_sde_pulso_estimado
  Serie completa EOH = real (hasta nov 2025) + OLS calibrado (dic 2025 en adelante)
  Modelo: R²=0.865 Termas · R²=0.804 Capital
  Variables: ANAC + Google Trends + BCRA + IPC NOA + AirDNA informal
*/

WITH eoh_real AS (
    SELECT
        fecha, localidad,
        viajeros_total          AS viajeros,
        pernoctes_total         AS pernoctes,
        estadia_promedio        AS estadia,
        viajeros_total * 0.8   AS viajeros_ic_low,
        viajeros_total * 1.2   AS viajeros_ic_high,
        NULL::DOUBLE            AS occ_informal_pct,
        ibt_termas, ibt_compuesto, tcn_usd,
        anio, mes,
        'EOH_REAL'              AS fuente,
        0                       AS flag_estimado,
        NULL::DOUBLE            AS modelo_r2,
        NULL::DOUBLE            AS modelo_mae,
        NULL::DOUBLE            AS modelo_rmse
    FROM {{ ref('mart_sde_pulso') }}
    WHERE flag_covid = 0
      AND fecha <= '2025-11-01'
),

estimados AS (
    SELECT
        fecha,
        localidad,
        viajeros,
        viajeros * 1.5          AS pernoctes,
        1.8                     AS estadia,
        viajeros_ic_low,
        viajeros_ic_high,
        occ_informal_pct,
        ibt_compuesto,
        NULL::DOUBLE            AS ibt_termas,
        tcn_usd,
        anio, mes,
        fuente,
        flag_estimado,
        modelo_r2,
        modelo_mae,
        modelo_rmse
    FROM {{ source('raw', 'raw_estimados_ols') }}
    WHERE viajeros IS NOT NULL
),

combinado AS (
    SELECT
        fecha, localidad, viajeros, pernoctes, estadia,
        viajeros_ic_low, viajeros_ic_high,
        occ_informal_pct, ibt_termas, ibt_compuesto, tcn_usd,
        anio, mes, fuente, flag_estimado,
        modelo_r2, modelo_mae, modelo_rmse
    FROM eoh_real

    UNION ALL

    SELECT
        fecha, localidad, viajeros, pernoctes, estadia,
        viajeros_ic_low, viajeros_ic_high,
        occ_informal_pct, ibt_termas, ibt_compuesto, tcn_usd,
        anio, mes, fuente, flag_estimado,
        modelo_r2, modelo_mae, modelo_rmse
    FROM estimados
    WHERE viajeros IS NOT NULL
)

SELECT * FROM combinado
ORDER BY fecha DESC, localidad
