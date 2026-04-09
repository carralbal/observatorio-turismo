/*
  mart_infra_empleo_hyg
  Empleo registrado en Hotelería y Gastronomía por provincia
  Fuente: SIPA-AFIP / INDEC · Serie mensual 1996-2025
*/

SELECT
    CAST(date AS DATE)                  AS fecha,
    year                                AS anio,
    month                               AS mes,
    -- Normalizar nombres de provincia con encoding correcto
    CASE provincia
        WHEN 'CÃ³rdoba'         THEN 'Córdoba'
        WHEN 'Entre RÃ­os'      THEN 'Entre Ríos'
        WHEN 'NeuquÃ©n'         THEN 'Neuquén'
        WHEN 'RÃ­o Negro'       THEN 'Río Negro'
        WHEN 'TucumÃ¡n'         THEN 'Tucumán'
        ELSE provincia
    END                                 AS provincia,
    empleo                              AS empleo_registrado,
    'HyG'                               AS sector,
    'SIPA-AFIP'                         AS fuente
FROM {{ source('raw', 'raw_sipa_empleo_mensual') }}
WHERE date IS NOT NULL
  AND empleo > 0
ORDER BY fecha DESC, provincia
