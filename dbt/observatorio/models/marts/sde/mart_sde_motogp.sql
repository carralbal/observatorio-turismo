/*
  Modelo diff-in-diff: efecto MotoGP sobre viajeros en Termas
  Tratamiento : Termas en marzo/abril con MotoGP
  Control     : Santiago del Estero capital mismo mes
  Excluir     : 2020-2021 (COVID)

  Años con MotoGP en Termas: 2014 2015 2016 2017 2018 2019 2022 2023 2025
  Año sin MotoGP (control perfecto): 2024
*/

WITH eoh_base AS (
    SELECT
        fecha, localidad,
        viajeros_total, pernoctes_total, estadia_promedio,
        anio, mes, flag_covid
    FROM {{ ref('mart_sde_pulso') }}
    WHERE flag_covid = 0
      AND mes IN (3, 4)                         -- solo marzo y abril
      AND localidad IN ('Termas', 'Santiago del Estero')
),

anac_mensual AS (
    SELECT
        DATE_TRUNC('month', fecha)              AS fecha,
        SUM(pasajeros)                          AS pasajeros_sde
    FROM {{ ref('stg_anac_sde') }}
    WHERE clasificacion_vuelo = 'Cabotaje'
    GROUP BY 1
),

motogp_calendario AS (
    SELECT anio,
        CASE WHEN anio IN (2014,2015,2016,2017,2018,2019,2022,2023,2025)
             THEN 1 ELSE 0
        END AS tiene_motogp
    FROM (
        SELECT DISTINCT anio FROM eoh_base
    )
)

SELECT
    e.fecha,
    e.localidad,
    e.anio,
    e.mes,
    e.viajeros_total,
    e.pernoctes_total,
    e.estadia_promedio,
    m.tiene_motogp,
    a.pasajeros_sde,
    -- Variables del modelo diff-in-diff
    CASE WHEN e.localidad = 'Termas' THEN 1 ELSE 0 END          AS es_termas,
    CASE WHEN m.tiene_motogp = 1 THEN 1 ELSE 0 END              AS es_motogp,
    CASE WHEN e.localidad = 'Termas'
          AND m.tiene_motogp = 1 THEN 1 ELSE 0 END              AS interaccion_did,
    -- Baseline: promedio sin MotoGP (2024)
    AVG(CASE WHEN e.localidad = 'Termas' AND m.tiene_motogp = 0
             THEN e.viajeros_total END)
        OVER ()                                                  AS baseline_viajeros_termas,
    -- Uplift estimado (diferencia con baseline)
    e.viajeros_total - AVG(
        CASE WHEN e.localidad = 'Termas' AND m.tiene_motogp = 0
             THEN e.viajeros_total END)
        OVER ()                                                  AS uplift_vs_baseline

FROM eoh_base e
LEFT JOIN motogp_calendario m USING (anio)
LEFT JOIN anac_mensual       a USING (fecha)
ORDER BY e.anio, e.mes, e.localidad
