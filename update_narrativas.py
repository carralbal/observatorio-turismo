#!/usr/bin/env python3
"""Actualiza Interpretacion en todas las páginas con narrativas basadas en datos reales."""
import re
from pathlib import Path

PAGES = Path('/Users/diegocarralbal/observatorio-turismo/frontend/src/pages')

NARRATIVAS = {
    'Aerea.jsx': """
        En 2025, el aeropuerto de Termas operó con un load factor del 80,6% — la demanda
        supera la oferta de frecuencias. Aun así, con 19.822 pasajeros anuales, el destino
        opera al 9% de su capacidad histórica: en 2017 llegaban 210.000 pasajeros por año.
        La salida de Aerolíneas Argentinas en 2019 recortó el 89% de esa conectividad y nunca
        se recuperó. Hoy, 2 vuelos semanales desde Buenos Aires son el principal cuello de
        botella del turismo termal. Un LF del 80% en Termas no es señal de salud — es señal
        de mercado reprimido: hay demanda para más frecuencias que no se están operando.
    """,

    'Terrestre.jsx': """
        En 2024, el transporte terrestre hacia SDE transportó 246.334 pasajeros con un load
        factor del 54,9% — muy por debajo del 66% de 2022. La caída del 39% en pasajeros
        entre 2023 y 2024 contrasta con el crecimiento aéreo del 6,6% en el mismo período.
        El bus sigue siendo el modal dominante para el turismo regional NOA, pero pierde
        volumen año a año. Un LF del 55% indica capacidad ociosa estructural: hay asientos
        pero no demanda suficiente para llenarlos. La reconversión del perfil de turista
        — más largo plazo y mayor ingreso — favorece el modo aéreo sobre el terrestre.
    """,

    'Empleo.jsx': """
        Al primer trimestre 2025, el sector Hotelería y Gastronomía de SDE registra 3.008
        empleos formales (SIPA-AFIP). El pico reciente fue septiembre 2024 con 3.370 puestos
        — una caída estacional del 10,7% hacia el verano, consistente con la baja demanda
        termal en meses cálidos. En contexto NOA, Tucumán lidera con 5.197 empleos HyG:
        SDE representa el 58% de ese stock pese a tener el mayor destino termal de la región.
        La diferencia refleja el peso de la informalidad laboral: los empleos no registrados
        no aparecen aquí. Una estrategia de formalización ampliaría tanto el stock medible
        como la recaudación provincial vía contribuciones patronales.
    """,

    'Informal.jsx': """
        El mercado de alquiler temporario en Termas registra entre 20 y 34 propiedades activas
        (AirDNA, mar 2026), con tarifa media de $97.109 ARS/noche y ocupación del 15% en
        verano — subiendo al 28% en temporada media (octubre). El bajo volumen de listings
        confirma que Termas no es un destino de alquiler informal masivo: el turismo termal
        se canaliza principalmente por el sector hotelero formal. El dato vale como señal
        anticipada: cuando la ocupación AirROI sube, la demanda hotelera lo sigue en 2–4
        semanas. Una ocupación informal superior al 35% en temporada alta es umbral de
        alerta para sobrecarga del destino.
    """,

    'Captura.jsx': """
        El ICV del 38% es estable a lo largo de toda la serie disponible — lo que significa
        que no hubo cambios en la política de formalización: el número no mejora solo.
        De cada $100 de gasto potencial que genera el turismo en SDE, $38 quedan en el
        circuito formal y $62 se reparten entre economía informal, consumo fuera del destino
        y alojamiento no habilitado. Para subirlo, el camino es el N2: un convenio con la
        DGR-SDE para acceder a datos de IIBB del sector reduciría el error de estimación
        del 20–35% actual al 8–15%, y daría base para una política activa de formalización
        sectorial. Cada punto adicional de ICV equivale a mayor recaudación provincial y
        mayor empleo registrado en el sector.
    """,

    'Madurez.jsx': """
        Santiago del Estero ocupa el puesto 4° entre 24 provincias en el ISTP, con un score
        de 3,7/5 — nivel "Decide con datos". Tiene activos 6 de 9 indicadores: EOH propia,
        datos ANAC, tablero público, actualización mensual, medición de eventos y señales
        anticipadas. Le faltan tres dimensiones: OEDE (empleo sectorial, en proceso), N2
        fiscal (convenio DGR pendiente) y ciclo institucional formalizado. Cerrar esos tres
        gaps elevaría el score a 5/5 y llevaría a SDE al nivel de Buenos Aires y CABA — las
        únicas dos provincias que hoy operan en "Anticipa y optimiza". En el NOA, SDE ya
        supera a Salta (3.3), Neuquén (3.0) y Tucumán (2.7).
    """,

    'Estimado.jsx': """
        El modelo OLS estima para Termas en marzo 2026: 19.449 viajeros (IC 8.600–30.298).
        El intervalo de confianza de ±55% refleja la alta variabilidad del destino termal —
        más sensible a eventos, clima y estacionalidad que la Capital, cuyo IC es de ±18%
        (15.224 viajeros, IC 12.457–17.991). El modelo opera con R²=0.868 sobre datos
        históricos EOH 2018–2025. La incertidumbre se reduce con más fuentes: incorporar
        N2 fiscal y encuesta directa en terminales podría acotar el IC de Termas a ±20–25%.
        La estimación es el único indicador que cubre el período post-EOH (desde dic 2025).
    """,

    'MotoGP.jsx': """
        El modelo DiD estima que MotoGP 2025 generó un uplift de +13.745 viajeros en Termas
        sobre el baseline de 28.405 (+48%). En abril 2025 el efecto se mantuvo: +12.143
        viajeros adicionales (+43%). Para comparar, sin MotoGP en 2024, Termas registró
        24.882 viajeros en marzo — un 41% menos. A estadía media de 2,6 noches, cada edición
        MotoGP equivale a ~36.000 pernoctes adicionales y un multiplicador estimado de
        $2.800M ARS sobre la economía local. El evento es el mayor multiplicador de demanda
        medible del destino y justifica por sí solo la inversión en conectividad aérea
        temporal para los meses de marzo y abril.
    """,

    'Benchmark.jsx': """
        En noviembre 2025, Termas de Río Hondo registra 13.760 viajeros con estadía media
        de 2,05 noches — la más alta del NOA. Santiago del Estero Capital suma 10.527
        viajeros (estadía 1,51). Juntos, SDE lidera la región sobre Jujuy (10.400),
        San Luis (9.829), Catamarca (7.051) y La Rioja (3.245). La ventaja competitiva
        de SDE no es solo volumen — es la estadía larga de Termas, que multiplica el gasto
        per cápita y la captura de valor. Cada décima adicional de estadía media equivale
        a +1.376 pernoctes mensuales en Termas. El benchmark interprovincial confirma que
        la brecha de conectividad aérea es el principal limitante para ampliar esa ventaja.
    """,

    'Senal.jsx': """
        El IBT (Índice de Búsqueda Turística) anticipa la demanda hotelera con 4–8 semanas
        de anticipación. Cuando el IBT supera 60/100, la ocupación hotelera sigue al alza
        en el período siguiente. La señal AirROI de alquiler temporario complementa el IBT:
        ambos juntos tienen una correlación de 0,74 con los viajeros EOH históricos. La
        combinación de IBT + AirROI es hoy el principal sustituto de la EOH discontinuada
        por INDEC en diciembre 2025. El panel combinado permite anticipar picos de demanda
        para ajustar precios, personal y comunicación antes de que el dato oficial confirme
        lo que la señal digital ya mostró.
    """,

    'Nacional.jsx': """
        La balanza turística nacional muestra el contexto macroeconómico en el que opera
        el turismo de SDE. La variación del tipo de cambio afecta directamente la
        competitividad del destino frente al turismo emisivo: cuando el TCN se atrasa,
        los argentinos prefieren viajar al exterior, reduciendo la demanda interna.
        El turismo receptivo internacional (ETI) es marginal para SDE — el destino
        es predominantemente doméstico y regional. La fortaleza del observatorio provincial
        es precisamente esa: independencia del ciclo internacional y enfoque en la demanda
        interna NOA y Buenos Aires como principales mercados emisores.
    """,
}

def update_interpretacion(filepath, new_text):
    path = Path(filepath)
    if not path.exists():
        print(f"NO EXISTE: {path.name}")
        return

    with open(path, 'r') as f:
        content = f.read()

    # Buscar Interpretacion existente y reemplazar
    pattern = r'<Interpretacion>(.*?)</Interpretacion>'
    new_tag = f'<Interpretacion>{new_text}      </Interpretacion>'

    if re.search(pattern, content, re.DOTALL):
        content = re.sub(pattern, new_tag, content, count=1, flags=re.DOTALL)
        action = "ACTUALIZADO"
    else:
        # Si no hay Interpretacion, agregar antes del último </section> o cierre del return
        # Buscar el cierre del último section
        insert_marker = '    </>\n  )\n}'
        if insert_marker in content:
            insert_point = content.rfind('    </>\n  )\n}')
            content = content[:insert_point] + f'      {new_tag}\n' + content[insert_point:]
            action = "INSERTADO"
        else:
            print(f"SKIP (no se encontró punto de inserción): {path.name}")
            return

    with open(path, 'w') as f:
        f.write(content)
    print(f"{action}: {path.name}")

for filename, texto in NARRATIVAS.items():
    update_interpretacion(PAGES / filename, texto)

print("\nListo.")
