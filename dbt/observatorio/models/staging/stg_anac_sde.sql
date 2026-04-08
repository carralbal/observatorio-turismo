SELECT
    CAST(indice_tiempo AS DATE)              AS fecha,
    clasificacion_vuelo,
    clase_vuelo,
    aerolinea,
    origen_provincia,
    destino_provincia,
    CAST(pasajeros AS INTEGER)               AS pasajeros,
    CAST(asientos  AS INTEGER)               AS asientos,
    CAST(vuelos    AS INTEGER)               AS vuelos,
    EXTRACT(YEAR  FROM indice_tiempo::DATE)  AS anio,
    EXTRACT(MONTH FROM indice_tiempo::DATE)  AS mes
FROM {{ source('raw', 'raw_anac_sde') }}
WHERE pasajeros IS NOT NULL
