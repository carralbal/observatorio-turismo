/*
  mart_infra_informal_termas
  Serie completa del mercado informal de Termas de Río Hondo
  Combina AirDNA (ocupación 2021-2026) + AirROI (ADR/revenue/LOS/listings 2023-2026)
  Período: abr 2021 → presente
*/

WITH airdna AS (
    SELECT
        CAST(date || '-01' AS DATE)     AS fecha,
        occupancy_rate                  AS occ_pct,
        adr                             AS adr_usd,
        revenue                         AS revenue_usd,
        days_avg                        AS los_dias,
        listing_count                   AS listings
    FROM {{ source('raw', 'raw_airdna_base') }}
    WHERE name = 'Termas de Rio Hondo'
),

airroi AS (
    SELECT
        DATE_TRUNC('month', fecha)      AS fecha,
        occ_avg * 100                   AS occ_pct_roi,
        adr_avg                         AS adr_ars,
        rev_avg                         AS revenue_ars,
        los_avg                         AS los_dias_roi,
        listings_count                  AS listings_roi,
        -- Percentiles ADR
        adr_p25, adr_p50, adr_p75, adr_p90,
        -- Percentiles ocupación
        occ_p25 * 100 AS occ_p25, occ_p50 * 100 AS occ_p50,
        occ_p75 * 100 AS occ_p75, occ_p90 * 100 AS occ_p90,
        -- Percentiles revenue
        rev_p25, rev_p50, rev_p75, rev_p90
    FROM {{ source('raw', 'raw_airroi_termas') }}
),

tcn AS (
    SELECT fecha, tcn_usd
    FROM {{ ref('stg_bcra_tcn') }}
)

SELECT
    a.fecha,
    EXTRACT(YEAR  FROM a.fecha)         AS anio,
    EXTRACT(MONTH FROM a.fecha)         AS mes,
    -- Ocupación — AirDNA es la fuente principal (serie más larga)
    a.occ_pct                           AS occ_pct,
    r.occ_pct_roi                       AS occ_pct_airroi,
    r.occ_p25, r.occ_p50, r.occ_p75, r.occ_p90,
    -- ADR — AirROI en ARS convertido a USD, o AirDNA donde disponible
    a.adr_usd                           AS adr_usd_airdna,
    ROUND(r.adr_ars / NULLIF(t.tcn_usd, 0), 0) AS adr_usd_airroi,
    COALESCE(a.adr_usd,
             ROUND(r.adr_ars / NULLIF(t.tcn_usd, 0), 0)) AS adr_usd,
    r.adr_ars,
    r.adr_p25, r.adr_p50, r.adr_p75, r.adr_p90,
    -- Revenue
    a.revenue_usd                       AS revenue_usd_airdna,
    ROUND(r.revenue_ars / NULLIF(t.tcn_usd, 0), 0) AS revenue_usd_airroi,
    COALESCE(a.revenue_usd,
             ROUND(r.revenue_ars / NULLIF(t.tcn_usd, 0), 0)) AS revenue_usd,
    r.revenue_ars,
    r.rev_p25, r.rev_p50, r.rev_p75, r.rev_p90,
    -- LOS y listings
    COALESCE(a.los_dias, r.los_dias_roi) AS los_dias,
    COALESCE(a.listings, r.listings_roi) AS listings,
    -- TCN
    t.tcn_usd,
    -- Flag fuente
    CASE
        WHEN r.adr_ars IS NOT NULL THEN 'AirDNA+AirROI'
        ELSE 'AirDNA'
    END AS fuente
FROM airdna a
LEFT JOIN airroi r USING (fecha)
LEFT JOIN tcn    t USING (fecha)
ORDER BY a.fecha DESC
