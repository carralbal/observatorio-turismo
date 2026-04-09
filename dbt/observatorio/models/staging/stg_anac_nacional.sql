/*
  stg_anac_nacional
  Todos los vuelos de Argentina — cobertura nacional completa
  Fuente: ANAC microdatos 2017-2026
  Granularidad: vuelo × día × ruta × aerolínea
  Uso: filtrar por aeropuerto, provincia, región en capa de visualización
*/

SELECT
    CAST(indice_tiempo AS DATE)         AS fecha,
    EXTRACT(YEAR  FROM CAST(indice_tiempo AS DATE)) AS anio,
    EXTRACT(MONTH FROM CAST(indice_tiempo AS DATE)) AS mes,
    clasificacion_vuelo,
    clase_vuelo,
    aerolinea,
    -- Origen completo
    origen_oaci,
    origen_aeropuerto,
    origen_localidad,
    origen_provincia,
    origen_pais,
    origen_continente,
    -- Destino completo
    destino_oaci,
    destino_aeropuerto,
    destino_localidad,
    destino_provincia,
    destino_pais,
    destino_continente,
    -- Métricas
    pasajeros,
    asientos,
    vuelos,
    ROUND(pasajeros::DOUBLE / NULLIF(asientos, 0) * 100, 1) AS load_factor_pct,
    -- Ruta normalizada bidireccional
    CASE
        WHEN origen_oaci < destino_oaci
        THEN origen_oaci || ' ↔ ' || destino_oaci
        ELSE destino_oaci || ' ↔ ' || origen_oaci
    END AS ruta_oaci,
    CASE
        WHEN origen_provincia < destino_provincia
        THEN origen_provincia || ' ↔ ' || destino_provincia
        ELSE destino_provincia || ' ↔ ' || origen_provincia
    END AS ruta_provincia,
    -- Flags útiles
    CASE WHEN clasificacion_vuelo = 'Cabotaje' THEN 1 ELSE 0 END AS flag_cabotaje,
    CASE WHEN clasificacion_vuelo = 'Internacional' THEN 1 ELSE 0 END AS flag_internacional,
    CASE WHEN clase_vuelo = 'Regular' THEN 1 ELSE 0 END AS flag_regular
FROM raw_anac_sde

