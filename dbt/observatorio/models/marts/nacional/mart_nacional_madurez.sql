/*
  M8 — Índice de Madurez Turística Provincial
  Escala 1-5 basada en capacidades observables
  Actualización: semestral

  Variables (binarias 0/1):
  V1 tiene_eoh          peso 1.0
  V2 tiene_anac         peso 0.5
  V3 tiene_oede         peso 0.5
  V4 tiene_tablero      peso 1.0
  V5 actualiza_mensual  peso 0.5
  V6 tiene_n2           peso 1.0
  V7 mide_eventos       peso 0.5
  V8 tiene_anticipacion peso 0.5
  V9 ciclo_institucional peso 0.5

  Score bruto máximo: 6.0
  Score normalizado: (bruto/6.0)*4+1 → escala 1-5
*/

WITH provincias AS (
    SELECT * FROM (VALUES
        -- (provincia, eoh, anac, oede, tablero, mensual, n2, eventos, anticipacion, ciclo)
        ('Buenos Aires',          1, 1, 1, 1, 1, 1, 1, 1, 1),
        ('CABA',                  1, 1, 1, 1, 1, 1, 1, 1, 1),
        ('Córdoba',               1, 1, 1, 1, 1, 0, 1, 1, 0),
        ('Mendoza',               1, 1, 1, 1, 1, 0, 1, 0, 0),
        ('Salta',                 1, 1, 0, 1, 1, 0, 1, 0, 0),
        ('Tucumán',               1, 1, 0, 1, 0, 0, 0, 0, 0),
        ('Neuquén',               1, 1, 0, 1, 0, 0, 1, 0, 0),
        ('Río Negro',             1, 1, 0, 1, 0, 0, 0, 0, 0),
        ('Santa Cruz',            1, 1, 0, 0, 0, 0, 0, 0, 0),
        ('Tierra del Fuego',      1, 1, 0, 0, 0, 0, 0, 0, 0),
        ('Entre Ríos',            1, 0, 0, 1, 0, 0, 0, 0, 0),
        ('Misiones',              1, 0, 0, 1, 0, 0, 1, 0, 0),
        ('Chubut',                1, 1, 0, 0, 0, 0, 0, 0, 0),
        ('San Luis',              1, 0, 0, 0, 0, 0, 0, 0, 0),
        ('Jujuy',                 1, 1, 0, 0, 0, 0, 0, 0, 0),
        ('La Rioja',              1, 0, 0, 0, 0, 0, 0, 0, 0),
        ('Catamarca',             1, 0, 0, 0, 0, 0, 0, 0, 0),
        ('San Juan',              1, 0, 0, 0, 0, 0, 0, 0, 0),
        ('Chaco',                 1, 0, 0, 0, 0, 0, 0, 0, 0),
        ('Corrientes',            1, 0, 0, 0, 0, 0, 0, 0, 0),
        ('Formosa',               1, 0, 0, 0, 0, 0, 0, 0, 0),
        ('La Pampa',              1, 0, 0, 0, 0, 0, 0, 0, 0),
        ('Santa Fe',              1, 1, 0, 1, 0, 0, 0, 0, 0),
        -- Santiago del Estero CON observatorio activo
        ('Santiago del Estero',   1, 1, 0, 1, 1, 0, 1, 1, 0)
    ) AS t(provincia, v1, v2, v3, v4, v5, v6, v7, v8, v9)
),

scores AS (
    SELECT
        provincia,
        v1, v2, v3, v4, v5, v6, v7, v8, v9,
        -- Score bruto ponderado
        v1*1.0 + v2*0.5 + v3*0.5 + v4*1.0 + v5*0.5 +
        v6*1.0 + v7*0.5 + v8*0.5 + v9*0.5             AS score_bruto,
        -- Score normalizado 1-5
        ROUND(((v1*1.0 + v2*0.5 + v3*0.5 + v4*1.0 + v5*0.5 +
                v6*1.0 + v7*0.5 + v8*0.5 + v9*0.5) / 6.0) * 4 + 1, 1)
                                                        AS score_madurez,
        CASE
            WHEN provincia = 'Santiago del Estero' THEN 1
            ELSE 0
        END AS es_sde
    FROM provincias
)

SELECT
    provincia,
    score_bruto,
    score_madurez,
    CASE
        WHEN score_madurez < 1.8 THEN '1 — No mide'
        WHEN score_madurez < 2.6 THEN '2 — Mide básico'
        WHEN score_madurez < 3.4 THEN '3 — Mide e interpreta'
        WHEN score_madurez < 4.2 THEN '4 — Decide con datos'
        ELSE                          '5 — Anticipa y optimiza'
    END AS nivel_label,
    v1 AS tiene_eoh,
    v2 AS tiene_anac,
    v3 AS tiene_oede,
    v4 AS tiene_tablero,
    v5 AS actualiza_mensual,
    v6 AS tiene_n2,
    v7 AS mide_eventos,
    v8 AS tiene_anticipacion,
    v9 AS ciclo_institucional,
    es_sde,
    RANK() OVER (ORDER BY score_madurez DESC) AS ranking
FROM scores
ORDER BY score_madurez DESC
