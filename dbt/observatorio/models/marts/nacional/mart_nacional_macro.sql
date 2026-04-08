WITH eti AS (
    SELECT
        fecha, anio, mes,
        receptivo_total,
        emisivo_total,
        receptivo_total - emisivo_total AS saldo_balanza
    FROM {{ ref('stg_eti_serie') }}
),

tcn AS (
    SELECT fecha, tcn_usd
    FROM {{ ref('stg_bcra_tcn') }}
)

SELECT
    e.fecha,
    e.anio,
    e.mes,
    e.receptivo_total,
    e.emisivo_total,
    e.saldo_balanza,
    t.tcn_usd,
    ROUND((e.receptivo_total /
        NULLIF(LAG(e.receptivo_total, 12) OVER (ORDER BY e.fecha), 0) - 1) * 100, 1)
        AS var_receptivo_ia,
    ROUND((e.emisivo_total /
        NULLIF(LAG(e.emisivo_total, 12) OVER (ORDER BY e.fecha), 0) - 1) * 100, 1)
        AS var_emisivo_ia,
    CASE WHEN e.fecha BETWEEN '2020-03-01' AND '2021-10-31'
         THEN 1 ELSE 0 END AS flag_covid
FROM eti e
LEFT JOIN tcn t USING (fecha)
ORDER BY e.fecha
