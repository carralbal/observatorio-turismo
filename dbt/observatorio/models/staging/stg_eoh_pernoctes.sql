SELECT
    CAST(indice_tiempo AS DATE)          AS fecha,
    localidad,
    origen_pernoctes,
    CAST(pernoctes AS INTEGER)           AS pernoctes
FROM {{ source('raw', 'raw_eoh_pernoctes_localidad') }}
WHERE pernoctes IS NOT NULL
  AND localidad IS NOT NULL
