SELECT
    CAST(fecha AS DATE)         AS fecha,
    ROUND(tcn_usd, 2)           AS tcn_usd
FROM {{ source('raw', 'raw_bcra_tcn') }}
WHERE tcn_usd IS NOT NULL
