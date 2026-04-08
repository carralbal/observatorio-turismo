SELECT
    CAST(fecha AS DATE)                        AS fecha,
    "Termas de Río Hondo"                      AS ibt_termas,
    "Santiago del Estero turismo"              AS ibt_sde,
    "MotoGP Argentina"                         AS ibt_motogp,
    ROUND(
        "Termas de Río Hondo" * 0.5 +
        "Santiago del Estero turismo" * 0.3 +
        "MotoGP Argentina" * 0.2
    , 1)                                       AS ibt_compuesto
FROM {{ source('raw', 'raw_trends_sde') }}
