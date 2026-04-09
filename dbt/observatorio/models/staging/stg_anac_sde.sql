/*
  stg_anac_sde
  Vista filtrada de stg_anac_nacional para Santiago del Estero
  Aeropuertos: SANE (Capital) · SANH (Termas de Río Hondo)
  Para análisis específicos de SDE — el mart nacional usa stg_anac_nacional
*/

SELECT
    *,
    CASE
        WHEN destino_oaci IN ('SANE','SANH') THEN destino_oaci
        WHEN origen_oaci  IN ('SANE','SANH') THEN origen_oaci
    END AS aeropuerto_sde,
    CASE
        WHEN destino_oaci IN ('SANE','SANH') THEN destino_aeropuerto
        WHEN origen_oaci  IN ('SANE','SANH') THEN origen_aeropuerto
    END AS nombre_aeropuerto_sde,
    CASE
        WHEN destino_oaci IN ('SANE','SANH') THEN 'Entrada'
        WHEN origen_oaci  IN ('SANE','SANH') THEN 'Salida'
    END AS direccion,
    CASE
        WHEN destino_oaci IN ('SANE','SANH') THEN origen_aeropuerto
        WHEN origen_oaci  IN ('SANE','SANH') THEN destino_aeropuerto
    END AS hub_contraparte,
    CASE
        WHEN destino_oaci IN ('SANE','SANH') THEN origen_provincia
        WHEN origen_oaci  IN ('SANE','SANH') THEN destino_provincia
    END AS provincia_contraparte,
    CASE
        WHEN destino_oaci IN ('SANE','SANH') THEN origen_pais
        WHEN origen_oaci  IN ('SANE','SANH') THEN destino_pais
    END AS pais_contraparte
FROM {{ ref('stg_anac_nacional') }}
WHERE origen_oaci  IN ('SANE','SANH')
   OR destino_oaci IN ('SANE','SANH')
