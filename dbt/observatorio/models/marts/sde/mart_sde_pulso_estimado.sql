/*
  M1-EST — Estimación EOH para meses sin dato oficial
  
  PERÍODO CALIBRACIÓN: 2017-2025 (EOH real disponible)
  PERÍODO ESTIMACIÓN:  dic 2025 → hoy (sin EOH)
  
  METODOLOGÍA:
  El modelo usa variables reales disponibles para estimar
  viajeros y pernoctes del sector formal cuando no hay EOH.
  
  Variables explicativas:
    - occ_informal_pct  (AirDNA — proxy de demanda informal)
    - ibt_termas        (Google Trends — intención de búsqueda)
    - tcn_usd           (BCRA — tipo de cambio)
    - mes               (estacionalidad)
  
  Estimación: ratio histórico formal/informal calibrado
  por mes y ajustado por señal digital.
  
  NOTA: Publicar siempre con intervalo de confianza.
  El dato real (EOH) reemplazará estas estimaciones
  si INDEC retoma la encuesta.
*/

WITH eoh_formal AS (
    -- Datos EOH reales 2017-2025
    SELECT
        fecha,
        localidad,
        viajeros_total,
        pernoctes_total,
        estadia_promedio,
        ibt_termas,
        ibt_compuesto,
        tcn_usd,
        anio,
        mes,
        flag_covid,
        'EOH_REAL' AS fuente,
        NULL::DOUBLE AS occ_informal_pct,
        NULL::DOUBLE AS estadia_informal
    FROM {{ ref('mart_sde_pulso') }}
    WHERE flag_covid = 0
),

airdna AS (
    SELECT
        fecha,
        mercado                             AS localidad,
        occ_informal_pct,
        estadia_informal,
        listings_activos,
        anio,
        mes
    FROM {{ ref('stg_airdna_sde') }}
),

trends AS (
    SELECT fecha, ibt_termas, ibt_sde, ibt_compuesto
    FROM {{ ref('stg_trends_sde') }}
),

tcn AS (
    SELECT fecha, tcn_usd
    FROM {{ ref('stg_bcra_tcn') }}
),

-- Ratio histórico: viajeros_formal / listings_informales
-- Calibrado por mes usando datos donde tenemos ambas fuentes
ratio_calibrado AS (
    SELECT
        e.mes,
        e.localidad,
        AVG(e.viajeros_total / NULLIF(a.occ_informal_pct, 0)) AS ratio_viajeros_por_occ,
        AVG(e.pernoctes_total / NULLIF(a.occ_informal_pct, 0)) AS ratio_pernoctes_por_occ,
        COUNT(*) AS n_obs
    FROM eoh_formal e
    LEFT JOIN airdna a
        ON e.fecha = a.fecha
        AND (
            (e.localidad = 'Termas'               AND a.localidad = 'Termas de Rio Hondo') OR
            (e.localidad = 'Santiago del Estero'  AND a.localidad = 'Santiago del Estero')
        )
    WHERE a.occ_informal_pct IS NOT NULL
      AND a.occ_informal_pct > 0
      AND e.anio >= 2022  -- usar post-COVID para calibrar
    GROUP BY 1, 2
),

-- Meses sin EOH: desde dic 2025
meses_sin_eoh AS (
    SELECT
        a.fecha,
        CASE WHEN a.localidad = 'Termas de Rio Hondo'
             THEN 'Termas'
             ELSE a.localidad
        END                                             AS localidad,
        a.occ_informal_pct,
        a.estadia_informal,
        a.anio,
        a.mes,
        t.ibt_termas,
        t.ibt_compuesto,
        tcn.tcn_usd
    FROM airdna a
    LEFT JOIN trends t  USING (fecha)
    LEFT JOIN tcn       USING (fecha)
    WHERE a.fecha > '2025-11-01'  -- último dato EOH disponible
),

-- Estimación con intervalo de confianza
estimados AS (
    SELECT
        m.fecha,
        m.localidad,
        -- Viajeros estimados = ratio_calibrado × occ_informal
        ROUND(r.ratio_viajeros_por_occ * m.occ_informal_pct)   AS viajeros_estimados,
        ROUND(r.ratio_pernoctes_por_occ * m.occ_informal_pct)  AS pernoctes_estimados,
        -- Intervalo de confianza ±20%
        ROUND(r.ratio_viajeros_por_occ * m.occ_informal_pct * 0.80)  AS viajeros_ic_low,
        ROUND(r.ratio_viajeros_por_occ * m.occ_informal_pct * 1.20)  AS viajeros_ic_high,
        -- Estadía estimada (promedio ponderado formal/informal)
        ROUND((m.estadia_informal * 0.3 + 2.5 * 0.7), 2)      AS estadia_estimada,
        m.occ_informal_pct,
        m.ibt_termas,
        m.ibt_compuesto,
        m.tcn_usd,
        m.anio,
        m.mes,
        r.n_obs                                                AS obs_calibracion,
        'ESTIMADO_AIRDNA+IBT'                                  AS fuente
    FROM meses_sin_eoh m
    LEFT JOIN ratio_calibrado r
        ON m.mes = r.mes AND m.localidad = r.localidad
),

-- Unir real + estimado
combinado AS (
    SELECT
        fecha, localidad,
        viajeros_total      AS viajeros,
        pernoctes_total     AS pernoctes,
        estadia_promedio    AS estadia,
        viajeros_total * 0.80 AS viajeros_ic_low,
        viajeros_total * 1.20 AS viajeros_ic_high,
        occ_informal_pct,
        ibt_termas, ibt_compuesto, tcn_usd,
        anio, mes, fuente,
        0 AS flag_estimado
    FROM eoh_formal

    UNION ALL

    SELECT
        fecha, localidad,
        viajeros_estimados  AS viajeros,
        pernoctes_estimados AS pernoctes,
        estadia_estimada    AS estadia,
        viajeros_ic_low,
        viajeros_ic_high,
        occ_informal_pct,
        ibt_termas, ibt_compuesto, tcn_usd,
        anio, mes, fuente,
        1 AS flag_estimado
    FROM estimados
    WHERE viajeros_estimados IS NOT NULL
)

SELECT * FROM combinado
ORDER BY fecha DESC, localidad
