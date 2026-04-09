/*
  M6 — Imagen de destino SDE en YouTube
  Indicadores: volumen de contenido, vistas totales, engagement
  Filtros: excluir videos no relevantes para turismo SDE
*/

WITH base AS (
    SELECT
        video_id,
        titulo,
        canal,
        fecha_publi,
        vistas,
        likes,
        comentarios,
        url,
        tag,
        query,
        EXTRACT(YEAR  FROM fecha_publi) AS anio,
        EXTRACT(MONTH FROM fecha_publi) AS mes,
        -- Clasificar por tipo de contenido
        CASE
            WHEN LOWER(titulo) LIKE '%motogp%'
              OR LOWER(titulo) LIKE '%moto gp%'
              OR LOWER(titulo) LIKE '%argentina gp%'
              OR LOWER(titulo) LIKE '%argentinagp%'
            THEN 'MotoGP'
            WHEN LOWER(titulo) LIKE '%termas%'
            THEN 'Termas'
            WHEN LOWER(titulo) LIKE '%santiago del estero%'
              OR LOWER(titulo) LIKE '%santiagueño%'
              OR LOWER(titulo) LIKE '%sde%'
            THEN 'SDE Capital'
            ELSE 'Otro'
        END AS categoria,
        -- Engagement rate proxy
        ROUND((likes + comentarios)::FLOAT / NULLIF(vistas, 0) * 100, 2) AS engagement_pct
    FROM {{ source('raw', 'raw_youtube_sde') }}
    -- Filtrar ruido — videos no relevantes para turismo SDE
    WHERE NOT (
        LOWER(titulo) LIKE '%aeropuerto%' AND LOWER(canal) NOT LIKE '%santiago%'
        AND LOWER(titulo) NOT LIKE '%termas%'
    )
    AND vistas > 100  -- excluir videos sin audiencia
),

-- Agregar por mes para análisis de tendencia
mensual AS (
    SELECT
        DATE_TRUNC('month', fecha_publi)    AS fecha,
        anio,
        mes,
        categoria,
        COUNT(*)                            AS videos_publicados,
        SUM(vistas)                         AS vistas_totales,
        SUM(likes)                          AS likes_totales,
        SUM(comentarios)                    AS comentarios_totales,
        ROUND(AVG(engagement_pct), 2)       AS engagement_promedio,
        MAX(vistas)                         AS max_vistas_video,
        FIRST(titulo ORDER BY vistas DESC)  AS titulo_mas_visto
    FROM base
    GROUP BY 1, 2, 3, 4
)

SELECT * FROM mensual
ORDER BY fecha DESC, vistas_totales DESC
