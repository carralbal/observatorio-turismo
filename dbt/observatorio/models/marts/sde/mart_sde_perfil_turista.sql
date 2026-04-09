WITH turistas_norte AS (
    SELECT
        CAST(indice_tiempo AS DATE)     AS fecha,
        region_destino,
        turistas,
        EXTRACT(YEAR  FROM CAST(indice_tiempo AS DATE)) AS anio,
        EXTRACT(MONTH FROM CAST(indice_tiempo AS DATE)) AS mes
    FROM {{ source('raw', 'raw_evyth_destino') }}
    WHERE region_destino = 'Norte'
),

gasto_norte AS (
    SELECT
        CAST(indice_tiempo AS DATE)     AS fecha,
        ROUND(gasto_promedio, 0)        AS gasto_promedio_ars
    FROM {{ source('raw', 'raw_evyth_gasto_destino') }}
    WHERE region_destino = 'Norte'
),

estadia_norte AS (
    SELECT
        CAST(indice_tiempo AS DATE)     AS fecha,
        ROUND(estadia_media, 2)         AS estadia_media_noches
    FROM {{ source('raw', 'raw_evyth_estadia_destino') }}
    WHERE region_destino = 'Norte'
),

motivo AS (
    SELECT CAST(indice_tiempo AS DATE) AS fecha, motivo, turistas
    FROM {{ source('raw', 'raw_evyth_motivo') }}
),

alojamiento AS (
    SELECT CAST(indice_tiempo AS DATE) AS fecha, tipo_alojamiento, turistas
    FROM {{ source('raw', 'raw_evyth_alojamiento') }}
),

transporte AS (
    SELECT CAST(indice_tiempo AS DATE) AS fecha, tipo_transporte, turistas
    FROM {{ source('raw', 'raw_evyth_transporte') }}
),

tcn AS (
    SELECT
        DATE_TRUNC('month', fecha)  AS fecha,
        AVG(tcn_usd)                AS tcn_usd
    FROM {{ ref('stg_bcra_tcn') }}
    GROUP BY 1
),

motivo_pivot AS (
    SELECT
        fecha,
        SUM(CASE WHEN LOWER(motivo) LIKE '%vacacion%' OR LOWER(motivo) LIKE '%recreac%'
                 THEN turistas END) AS turistas_vacaciones,
        SUM(CASE WHEN LOWER(motivo) LIKE '%visita%' OR LOWER(motivo) LIKE '%familiar%'
                 THEN turistas END) AS turistas_visita_familiar,
        SUM(CASE WHEN LOWER(motivo) LIKE '%trabajo%' OR LOWER(motivo) LIKE '%negocio%'
                 THEN turistas END) AS turistas_trabajo,
        SUM(turistas)               AS turistas_total_motivo
    FROM motivo GROUP BY 1
),

aloj_pivot AS (
    SELECT
        fecha,
        SUM(CASE WHEN LOWER(tipo_alojamiento) LIKE '%hotel%' OR LOWER(tipo_alojamiento) LIKE '%hostel%'
                 THEN turistas END) AS turistas_hotel,
        SUM(CASE WHEN LOWER(tipo_alojamiento) LIKE '%casa%' OR LOWER(tipo_alojamiento) LIKE '%familiar%'
                 THEN turistas END) AS turistas_casa_familiar,
        SUM(turistas)               AS turistas_total_aloj
    FROM alojamiento GROUP BY 1
),

transp_pivot AS (
    SELECT
        fecha,
        SUM(CASE WHEN LOWER(tipo_transporte) LIKE '%auto%' OR LOWER(tipo_transporte) LIKE '%particular%'
                 THEN turistas END) AS turistas_auto,
        SUM(CASE WHEN LOWER(tipo_transporte) LIKE '%omni%' OR LOWER(tipo_transporte) LIKE '%colect%' OR LOWER(tipo_transporte) LIKE '%bus%'
                 THEN turistas END) AS turistas_bus,
        SUM(CASE WHEN LOWER(tipo_transporte) LIKE '%avi%' OR LOWER(tipo_transporte) LIKE '%aer%'
                 THEN turistas END) AS turistas_avion,
        SUM(turistas)               AS turistas_total_transp
    FROM transporte GROUP BY 1
)

SELECT
    t.fecha,
    t.anio,
    t.mes,
    t.turistas                          AS turistas_norte,
    g.gasto_promedio_ars,
    c.tcn_usd,
    ROUND(g.gasto_promedio_ars / NULLIF(c.tcn_usd, 0), 0) AS gasto_promedio_usd,
    e.estadia_media_noches,
    mp.turistas_vacaciones,
    mp.turistas_visita_familiar,
    mp.turistas_trabajo,
    ROUND(mp.turistas_vacaciones / NULLIF(mp.turistas_total_motivo, 0) * 100, 1) AS pct_vacaciones,
    ap.turistas_hotel,
    ap.turistas_casa_familiar,
    ROUND(ap.turistas_hotel / NULLIF(ap.turistas_total_aloj, 0) * 100, 1) AS pct_hotel,
    tp.turistas_auto,
    tp.turistas_bus,
    tp.turistas_avion,
    ROUND(tp.turistas_auto / NULLIF(tp.turistas_total_transp, 0) * 100, 1) AS pct_auto
FROM turistas_norte t
LEFT JOIN gasto_norte   g  USING (fecha)
LEFT JOIN estadia_norte e  USING (fecha)
LEFT JOIN tcn           c  ON DATE_TRUNC('month', t.fecha) = c.fecha
LEFT JOIN motivo_pivot  mp USING (fecha)
LEFT JOIN aloj_pivot    ap USING (fecha)
LEFT JOIN transp_pivot  tp USING (fecha)
ORDER BY t.fecha DESC
