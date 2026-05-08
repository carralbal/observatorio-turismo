/*
  mart_infra_empleo_hyg
  Empleo registrado en Hotelería y Gastronomía por provincia
  Fuente: SIPA-AFIP / OEDE · Serie trimestral HyG 2005-2025
  Fix: usar raw_sipa_empleo_trimestral_hyg en vez de mensual
  (mensual tenía datos incorrectos para Salta: 251 en vez de ~6.000)
*/

WITH trimestral AS (
    SELECT
        provincia,
        anio,
        trimestre,
        empleo_hyg AS empleo_registrado,
        -- Expandir trimestre a 3 meses para compatibilidad con visualizaciones mensuales
        CASE trimestre
            WHEN 1 THEN DATE_TRUNC('month', MAKE_DATE(anio, 1, 1))
            WHEN 2 THEN DATE_TRUNC('month', MAKE_DATE(anio, 4, 1))
            WHEN 3 THEN DATE_TRUNC('month', MAKE_DATE(anio, 7, 1))
            WHEN 4 THEN DATE_TRUNC('month', MAKE_DATE(anio, 10, 1))
        END AS fecha
    FROM {{ source('raw', 'raw_sipa_empleo_trimestral_hyg') }}
    WHERE empleo_hyg > 0
      AND anio IS NOT NULL
)

SELECT
    fecha,
    anio,
    EXTRACT(MONTH FROM fecha)::INTEGER   AS mes,
    CASE provincia
        WHEN 'CÃ³rdoba'         THEN 'Córdoba'
        WHEN 'Entre RÃ­os'      THEN 'Entre Ríos'
        WHEN 'NeuquÃ©n'         THEN 'Neuquén'
        WHEN 'RÃ­o Negro'       THEN 'Río Negro'
        WHEN 'TucumÃ¡n'         THEN 'Tucumán'
        ELSE provincia
    END                                  AS provincia,
    empleo_registrado,
    'HyG'                                AS sector,
    'SIPA-AFIP/OEDE'                     AS fuente
FROM trimestral
ORDER BY fecha DESC, provincia
