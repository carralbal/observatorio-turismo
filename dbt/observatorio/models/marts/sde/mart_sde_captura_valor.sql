WITH eoh_sde AS (
    SELECT
        CAST(v.indice_tiempo AS DATE)                            AS fecha,
        SUM(CAST(v.viajeros AS INTEGER))                         AS viajeros_total,
        SUM(CAST(p.pernoctes AS INTEGER))                        AS pernoctes_total,
        ROUND(SUM(CAST(p.pernoctes AS FLOAT)) /
              NULLIF(SUM(CAST(v.viajeros AS FLOAT)), 0), 2)      AS estadia_promedio,
        EXTRACT(YEAR FROM CAST(v.indice_tiempo AS DATE))         AS anio
    FROM {{ source('raw', 'raw_eoh_viajeros_localidad') }} v
    LEFT JOIN {{ source('raw', 'raw_eoh_pernoctes_localidad') }} p
        ON v.indice_tiempo    = p.indice_tiempo
        AND v.localidad       = p.localidad
        AND v.origen_viajeros = p.origen_pernoctes
    WHERE v.localidad IN ('Santiago del Estero', 'Termas')
      AND v.origen_viajeros = 'Total'
    GROUP BY 1, 5
),

tcn AS (
    SELECT fecha, tcn_usd
    FROM {{ ref('stg_bcra_tcn') }}
)

SELECT
    e.fecha,
    e.anio,
    e.viajeros_total,
    e.pernoctes_total,
    e.estadia_promedio,
    t.tcn_usd,
    15000                                                        AS gasto_diario_ars,
    ROUND(e.viajeros_total * e.estadia_promedio * 15000)         AS ingreso_potencial_ars,
    ROUND(e.viajeros_total * e.estadia_promedio * 15000
          / NULLIF(t.tcn_usd, 0))                               AS ingreso_potencial_usd,
    ROUND(e.viajeros_total * e.estadia_promedio * 15000 * 0.38) AS ingreso_capturado_ars,
    38.0                                                         AS icv_pct,
    'N1 estimación — con IIBB SDE (N2) se convierte en dato real' AS nota_calidad,
    CASE WHEN e.fecha BETWEEN '2020-03-01' AND '2021-10-31'
         THEN 1 ELSE 0 END                                       AS flag_covid
FROM eoh_sde e
LEFT JOIN tcn t USING (fecha)
ORDER BY e.fecha DESC
