/*
  M2 — Benchmark de provincias pares
  SDE vs Tucumán, La Rioja, Catamarca, San Luis, Jujuy
  Métrica: viajeros totales y estadía promedio por localidad capital
*/

WITH viajeros AS (
    SELECT
        CAST(indice_tiempo AS DATE)             AS fecha,
        localidad,
        SUM(viajeros)                           AS viajeros_total,
        EXTRACT(YEAR FROM CAST(indice_tiempo AS DATE)) AS anio
    FROM {{ source('raw', 'raw_eoh_viajeros_localidad') }}
    WHERE origen_viajeros = 'Total'
      AND localidad IN (
          'Santiago del Estero', 'Termas',
          'Tucumán', 'Salta', 'La Rioja', 'Catamarca',
          'San Luis', 'Jujuy'
      )
    GROUP BY 1, 2, 4
),

pernoctes AS (
    SELECT
        CAST(indice_tiempo AS DATE)             AS fecha,
        localidad,
        SUM(pernoctes)                          AS pernoctes_total
    FROM {{ source('raw', 'raw_eoh_pernoctes_localidad') }}
    WHERE origen_pernoctes = 'Total'
      AND localidad IN (
          'Santiago del Estero', 'Termas',
          'Tucumán', 'Salta', 'La Rioja', 'Catamarca',
          'San Luis', 'Jujuy'
      )
    GROUP BY 1, 2
),

cnrt AS (
    SELECT
        CAST(indice_tiempo AS INTEGER)          AS anio,
        SUM(CASE WHEN par_origen_destino ILIKE '%Santiago Del Estero%'
                  OR par_origen_destino ILIKE '%Termas De Rio Hondo%'
                 THEN pasajeros ELSE 0 END)     AS pasajeros_bus_sde,
        SUM(CASE WHEN par_origen_destino ILIKE '%Tucumán%'
                 THEN pasajeros ELSE 0 END)     AS pasajeros_bus_tucuman,
        SUM(CASE WHEN par_origen_destino ILIKE '%Salta%'
                 THEN pasajeros ELSE 0 END)     AS pasajeros_bus_salta,
        SUM(CASE WHEN par_origen_destino ILIKE '%La Rioja%'
                 THEN pasajeros ELSE 0 END)     AS pasajeros_bus_la_rioja,
        SUM(CASE WHEN par_origen_destino ILIKE '%Catamarca%'
                 THEN pasajeros ELSE 0 END)     AS pasajeros_bus_catamarca,
        SUM(CASE WHEN par_origen_destino ILIKE '%San Luis%'
                 THEN pasajeros ELSE 0 END)     AS pasajeros_bus_san_luis,
        SUM(CASE WHEN par_origen_destino ILIKE '%Jujuy%'
                 THEN pasajeros ELSE 0 END)     AS pasajeros_bus_jujuy
    FROM {{ source('raw', 'raw_cnrt_pares') }}
    GROUP BY 1
)

SELECT
    v.fecha,
    v.localidad,
    v.anio,
    v.viajeros_total,
    p.pernoctes_total,
    ROUND(p.pernoctes_total::FLOAT / NULLIF(v.viajeros_total, 0), 2) AS estadia_promedio,
    -- Conectividad bus por destino
    CASE
        WHEN v.localidad IN ('Santiago del Estero','Termas') THEN c.pasajeros_bus_sde
        WHEN v.localidad = 'Tucumán'   THEN c.pasajeros_bus_tucuman
        WHEN v.localidad = 'Salta'     THEN c.pasajeros_bus_salta
        WHEN v.localidad = 'La Rioja'  THEN c.pasajeros_bus_la_rioja
        WHEN v.localidad = 'Catamarca' THEN c.pasajeros_bus_catamarca
        WHEN v.localidad = 'San Luis'  THEN c.pasajeros_bus_san_luis
        WHEN v.localidad = 'Jujuy'     THEN c.pasajeros_bus_jujuy
    END                                                             AS pasajeros_bus_anual,
    CASE WHEN v.localidad IN ('Santiago del Estero','Termas')
         THEN 1 ELSE 0 END                                          AS es_sde,
    CASE WHEN v.fecha BETWEEN '2020-03-01' AND '2021-10-31'
         THEN 1 ELSE 0 END                                          AS flag_covid

FROM viajeros v
LEFT JOIN pernoctes p USING (fecha, localidad)
LEFT JOIN cnrt       c USING (anio)
ORDER BY v.fecha DESC, v.localidad
