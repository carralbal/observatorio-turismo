SELECT
    CAST(indice_tiempo AS DATE)                     AS fecha,
    EXTRACT(YEAR FROM CAST(indice_tiempo AS DATE))  AS anio,
    EXTRACT(MONTH FROM CAST(indice_tiempo AS DATE)) AS mes,
    -- Receptivo total (suma todas las vías y destinos)
    COALESCE(receptivo_aerea_europa, 0) +
    COALESCE(receptivo_aerea_brasil, 0) +
    COALESCE(receptivo_aerea_chile, 0) +
    COALESCE(receptivo_aerea_uruguay, 0) +
    COALESCE(receptivo_aerea_ee_uu_y_canada, 0) +
    COALESCE(receptivo_aerea_resto_del_mundo, 0) +
    COALESCE(receptivo_aerea_resto_de_america, 0) +
    COALESCE(receptivo_terrestre_chile, 0) +
    COALESCE(receptivo_terrestre_brasil, 0) +
    COALESCE(receptivo_terrestre_uruguay, 0) +
    COALESCE(receptivo_terrestre_bolivia, 0) +
    COALESCE(receptivo_terrestre_paraguay, 0) +
    COALESCE(receptivo_terrestre_resto_de_america, 0) +
    COALESCE(receptivo_fluvial_maritima_uruguay, 0) +
    COALESCE(receptivo_fluvial_maritima_brasil, 0)  AS receptivo_total,
    -- Emisivo total
    COALESCE(emisivo_aerea_europa, 0) +
    COALESCE(emisivo_aerea_brasil, 0) +
    COALESCE(emisivo_aerea_chile, 0) +
    COALESCE(emisivo_aerea_uruguay, 0) +
    COALESCE(emisivo_aerea_ee_uu_y_canada, 0) +
    COALESCE(emisivo_aerea_resto_del_mundo, 0) +
    COALESCE(emisivo_aerea_resto_de_america, 0) +
    COALESCE(emisivo_terrestre_chile, 0) +
    COALESCE(emisivo_terrestre_brasil, 0) +
    COALESCE(emisivo_terrestre_uruguay, 0) +
    COALESCE(emisivo_terrestre_bolivia, 0) +
    COALESCE(emisivo_terrestre_paraguay, 0) +
    COALESCE(emisivo_terrestre_resto_de_america, 0) +
    COALESCE(emisivo_fluvial_maritima_uruguay, 0) +
    COALESCE(emisivo_fluvial_maritima_brasil, 0)    AS emisivo_total
FROM {{ source('raw', 'raw_eti_serie_mensual') }}
WHERE indice_tiempo IS NOT NULL
