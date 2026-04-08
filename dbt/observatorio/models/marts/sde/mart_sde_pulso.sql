WITH viajeros AS (
    SELECT
        fecha,
        localidad,
        SUM(viajeros) AS viajeros_total,
        SUM(CASE WHEN origen_viajeros = 'Residentes'    THEN viajeros END) AS viajeros_res,
        SUM(CASE WHEN origen_viajeros = 'No residentes' THEN viajeros END) AS viajeros_no_res
    FROM {{ ref('stg_eoh_viajeros') }}
    WHERE localidad IN ('Santiago del Estero', 'Termas')
    GROUP BY 1, 2
),

pernoctes AS (
    SELECT
        fecha,
        localidad,
        SUM(pernoctes) AS pernoctes_total
    FROM {{ ref('stg_eoh_pernoctes') }}
    WHERE localidad IN ('Santiago del Estero', 'Termas')
    GROUP BY 1, 2
),

trends AS (
    SELECT fecha, ibt_termas, ibt_sde, ibt_motogp, ibt_compuesto
    FROM {{ ref('stg_trends_sde') }}
),

tcn AS (
    SELECT fecha, tcn_usd
    FROM {{ ref('stg_bcra_tcn') }}
)

SELECT
    v.fecha,
    v.localidad,
    v.viajeros_total,
    v.viajeros_res,
    v.viajeros_no_res,
    p.pernoctes_total,
    ROUND(p.pernoctes_total::FLOAT / NULLIF(v.viajeros_total, 0), 2) AS estadia_promedio,
    t.ibt_termas,
    t.ibt_sde,
    t.ibt_motogp,
    t.ibt_compuesto,
    tcn.tcn_usd,
    EXTRACT(YEAR  FROM v.fecha) AS anio,
    EXTRACT(MONTH FROM v.fecha) AS mes,
    CASE WHEN v.fecha BETWEEN '2020-03-01' AND '2021-10-31'
         THEN 1 ELSE 0 END     AS flag_covid

FROM viajeros v
LEFT JOIN pernoctes p USING (fecha, localidad)
LEFT JOIN trends    t USING (fecha)
LEFT JOIN tcn         USING (fecha)
ORDER BY v.fecha DESC, v.localidad
