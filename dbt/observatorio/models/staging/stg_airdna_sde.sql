/*
  Staging AirDNA — sector informal SDE
  Fuente: AirDNA xlsx 80 mercados Argentina 2021-2026
*/
SELECT
    CAST(date || '-01' AS DATE)         AS fecha,
    market_id,
    name                                AS mercado,
    ROUND(occupancy_rate, 2)            AS occ_informal_pct,
    ROUND(adr, 2)                       AS adr_usd,
    ROUND(revpar, 2)                    AS revpar_usd,
    ROUND(revenue, 2)                   AS revenue_usd,
    CAST(listing_count AS INTEGER)      AS listings_activos,
    ROUND(days_avg, 2)                  AS estadia_informal,
    CAST(available_listings AS INTEGER) AS listings_disponibles,
    CAST(booked_listings AS INTEGER)    AS listings_ocupados,
    EXTRACT(YEAR  FROM CAST(date || '-01' AS DATE)) AS anio,
    EXTRACT(MONTH FROM CAST(date || '-01' AS DATE)) AS mes
FROM {{ source('raw', 'raw_airdna_base') }}
WHERE name IN ('Termas de Rio Hondo', 'Santiago del Estero')
  AND date IS NOT NULL
