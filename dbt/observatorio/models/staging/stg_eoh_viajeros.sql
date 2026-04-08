SELECT
    CAST(indice_tiempo AS DATE)          AS fecha,
    localidad,
    origen_viajeros,
    CAST(viajeros AS INTEGER)            AS viajeros
FROM {{ source('raw', 'raw_eoh_viajeros_localidad') }}
WHERE viajeros IS NOT NULL
  AND localidad IS NOT NULL
