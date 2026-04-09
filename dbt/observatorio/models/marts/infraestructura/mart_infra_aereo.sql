/*
  mart_infra_aereo
  Capa de Infraestructura — Transporte Aéreo Nacional
  Cobertura: todos los aeropuertos Argentina 2017-2026
  Granularidad: mes × aeropuerto × ruta × aerolínea × dirección
  Filtrar por provincia, aeropuerto o ruta en el dashboard
*/

SELECT
    DATE_TRUNC('month', fecha)          AS fecha,
    anio, mes,
    clasificacion_vuelo,
    clase_vuelo,
    flag_cabotaje,
    flag_internacional,
    flag_regular,
    aerolinea,
    -- Origen
    origen_oaci,
    origen_aeropuerto,
    origen_localidad,
    origen_provincia,
    origen_pais,
    origen_continente,
    -- Destino
    destino_oaci,
    destino_aeropuerto,
    destino_localidad,
    destino_provincia,
    destino_pais,
    destino_continente,
    -- Rutas
    ruta_oaci,
    ruta_provincia,
    -- Métricas agregadas
    SUM(pasajeros)                      AS pasajeros,
    SUM(asientos)                       AS asientos,
    SUM(vuelos)                         AS vuelos,
    ROUND(SUM(pasajeros)::DOUBLE /
          NULLIF(SUM(asientos), 0) * 100, 1) AS load_factor_pct,
    -- Pasajeros por dirección (útil para turismo receptivo)
    SUM(CASE WHEN destino_pais = 'Argentina'
             AND origen_pais != 'Argentina'
             THEN pasajeros END)        AS pax_internacionales_entrantes,
    SUM(CASE WHEN origen_pais = 'Argentina'
             AND destino_pais != 'Argentina'
             THEN pasajeros END)        AS pax_internacionales_salientes

FROM {{ ref('stg_anac_nacional') }}
GROUP BY
    DATE_TRUNC('month', fecha), anio, mes,
    clasificacion_vuelo, clase_vuelo,
    flag_cabotaje, flag_internacional, flag_regular,
    aerolinea,
    origen_oaci, origen_aeropuerto, origen_localidad,
    origen_provincia, origen_pais, origen_continente,
    destino_oaci, destino_aeropuerto, destino_localidad,
    destino_provincia, destino_pais, destino_continente,
    ruta_oaci, ruta_provincia
ORDER BY fecha DESC, pasajeros DESC
