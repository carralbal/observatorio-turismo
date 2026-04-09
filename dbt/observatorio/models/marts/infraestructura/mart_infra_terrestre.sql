/*
  mart_infra_terrestre
  Capa de Infraestructura — Transporte Terrestre Nacional
  Fuente: CNRT microdatos 2019-2024
  Granularidad: año × par origen-destino
*/

WITH base AS (
    SELECT
        CAST(indice_tiempo AS INTEGER)  AS anio,
        par_origen_destino,
        viajes,
        asientos,
        pasajeros,
        ROUND(pasajeros::DOUBLE / NULLIF(asientos, 0) * 100, 1) AS load_factor_pct,
        -- Extraer origen y destino
        SPLIT_PART(par_origen_destino, '-', 1)  AS origen,
        SPLIT_PART(par_origen_destino, '-', 2)  AS destino,
        -- Flags SDE
        CASE WHEN par_origen_destino ILIKE '%santiago del estero%'
              OR par_origen_destino ILIKE '%termas%'
             THEN 1 ELSE 0 END AS flag_sde
    FROM {{ source('raw', 'raw_cnrt_pares') }}
)

SELECT * FROM base
ORDER BY anio DESC, pasajeros DESC
