"""
Módulo de lecturas prominentes para el dashboard.
Genera el cuadro azul con interpretación contextual para cada página.
"""
import streamlit as st

ESTILO = "background:#F0F9FF;border-left:4px solid #0891B2;padding:16px 20px;border-radius:6px;margin:12px 0"
TITULO = "font-size:1.05rem;font-weight:700;color:#0F172A;margin:0 0 8px 0"
TEXTO  = "color:#334155;margin:0;font-size:0.95rem"

def lectura(titulo: str, texto: str):
    st.markdown(f"""
<div style='{ESTILO}'>
<p style='{TITULO}'>{titulo}</p>
<p style='{TEXTO}'>{texto}</p>
</div>
""", unsafe_allow_html=True)

def pulso(ultimo_t, ultimo_c):
    mes = ultimo_t.fecha.strftime("%b %Y")
    ibt = int(ultimo_t.ibt_compuesto) if ultimo_t.ibt_compuesto == ultimo_t.ibt_compuesto else 0
    señal = ("baja — se esperan semanas de demanda moderada" if ibt < 25
             else "alta — se anticipan semanas de alta ocupación" if ibt > 40
             else "normal — en línea con el promedio estacional")
    lectura("¿Cómo está el turismo en SDE hoy?",
        f"En <strong>{mes}</strong>, Termas recibió <strong>{int(ultimo_t.viajeros_total):,} viajeros</strong> "
        f"con estadía de <strong>{ultimo_t.estadia_promedio:.2f} noches</strong>. "
        f"La Capital sumó <strong>{int(ultimo_c.viajeros_total):,} viajeros</strong>. "
        f"La señal de búsquedas digitales (IBT) está en <strong>{ibt}/100</strong> — señal {señal}. "
        f"Termas mantiene la estadía más larga del grupo de pares (2.84n) — cada turista deja más dinero en destino.")

def motogp(uplift, baseline, r2):
    lectura("¿Cuánto vale el MotoGP para Termas?",
        f"El modelo estima que cada edición del MotoGP en Termas genera "
        f"<strong>+{int(uplift):,} viajeros adicionales</strong> sobre el baseline sin evento ({int(baseline):,}). "
        f"Eso equivale a entre <strong>USD 8-12M de derrame económico</strong> por edición. "
        f"Con el traslado a Buenos Aires en 2026, SDE pierde ese impacto anualmente. "
        f"El modelo tiene un R²={r2:.2f} — explica bien la diferencia entre años con y sin carrera.")

def senal_anticipada(ibt, anomalia, mes):
    if anomalia > 20:
        interpretacion = f"está <strong>{anomalia:.0f}% por encima</strong> del promedio — se anticipa alta ocupación en 4-8 semanas."
    elif anomalia < -10:
        interpretacion = f"está <strong>{abs(anomalia):.0f}% por debajo</strong> del promedio — semanas de baja demanda esperadas."
    else:
        interpretacion = f"está en línea con el promedio estacional — demanda normal esperada."
    lectura("¿Qué dice la señal digital de demanda?",
        f"En <strong>{mes}</strong> el índice de búsquedas turísticas (IBT) es <strong>{ibt}/100</strong> y "
        f"{interpretacion} "
        f"Este indicador anticipa la ocupación hotelera con 4-8 semanas de adelanto — "
        f"permite activar comunicación o ajustar precios antes de que llegue la demanda.")

def benchmark(termas_viajeros, capital_viajeros, termas_estadia, pos_termas, pos_capital):
    lectura("¿Dónde está SDE respecto a sus pares?",
        f"Termas ocupa el <strong>puesto {pos_termas} de 7</strong> en viajeros ({int(termas_viajeros):,}/mes promedio) "
        f"y lidera en estadía con <strong>{termas_estadia:.2f} noches</strong> — la más alta del grupo. "
        f"La Capital está en el puesto {pos_capital}° con {int(capital_viajeros):,} viajeros/mes. "
        f"La brecha con Tucumán no es de demanda sino de <strong>conectividad y oferta hotelera</strong>. "
        f"Más estadía con menos viajeros = oportunidad de captura de valor, no de volumen.")

def nacional(deficit_ultimo, mes, receptivo, emisivo):
    lectura("¿Cómo está Argentina en el mapa turístico mundial?",
        f"En <strong>{mes}</strong>, Argentina recibió <strong>{int(receptivo):,} turistas extranjeros</strong> "
        f"mientras <strong>{int(emisivo):,} argentinos</strong> viajaron al exterior — "
        f"un déficit de <strong>{abs(int(deficit_ultimo)):,} turistas</strong>. "
        f"Argentina es estructuralmente deficitaria en turismo: el emisivo supera al receptivo en casi todos los meses. "
        f"Cada turista extranjero que viene es una exportación de servicios. "
        f"El tipo de cambio es la variable que más explica el ciclo: peso fuerte = más argentinos afuera.")

def captura(icv, pot_usd, cap_usd, fuga_usd):
    lectura("¿Cuánto se queda y cuánto se va?",
        f"De cada USD 100 que un turista podría gastar en SDE, solo <strong>USD {icv:.0f} se quedan en la economía local</strong>. "
        f"El <strong>ingreso potencial anual es USD {pot_usd/1e6:.1f}M</strong> pero se captura solo USD {cap_usd/1e6:.1f}M. "
        f"La fuga estimada de <strong>USD {fuga_usd/1e6:.1f}M</strong> se va a OTAs internacionales, cadenas externas "
        f"y al alojamiento informal sin registro. "
        f"La palanca más directa: formalizar el alojamiento y desarrollar gastronomía local.")

def madurez(score, pos, nivel):
    lectura("¿Dónde está SDE institucionalmente?",
        f"SDE alcanzó un score de <strong>{score}/5</strong> en el índice de madurez turística — "
        f"posición <strong>{pos}° de 24 provincias</strong>, nivel <strong>'{nivel}'</strong>. "
        f"Es la única provincia del NOA en nivel 4. Ocho provincias argentinas todavía están en nivel 1 — no miden nada. "
        f"El salto al nivel 5 requiere dos cosas: datos N2 de la DGR provincial (IIBB por rubro) "
        f"y un ciclo mensual dato → decisión institucionalizado.")

def youtube(vistas_total, videos_total, categoria_top):
    lectura("¿Cómo aparece SDE en el mundo digital?",
        f"SDE y Termas acumulan más de <strong>{vistas_total/1e6:.1f}M de vistas</strong> en {videos_total} videos únicos. "
        f"El contenido de <strong>{categoria_top}</strong> domina el alcance histórico — "
        f"el canal oficial de MotoGP generó millones de vistas orgánicas sobre Termas sin costo para la provincia. "
        f"Ese awareness internacional se pierde con el traslado del evento a Buenos Aires. "
        f"La oportunidad: desarrollar contenido propio sobre el termalismo para compensar.")

def perfil_turista(pct_auto, pct_hotel, gasto_usd, estadia, mes):
    lectura("¿Quién viene y qué deja?",
        f"El turista del Norte llega principalmente en <strong>auto propio ({pct_auto:.0f}%)</strong> "
        f"y solo <strong>1 de cada 5 ({pct_hotel:.0f}%) duerme en hotel</strong> — "
        f"el resto usa casa de familiares o alojamiento informal. "
        f"Esto explica el bajo índice de captura de valor del sector formal. "
        f"El gasto promedio por viaje es <strong>USD {int(gasto_usd)}</strong> ({mes}) "
        f"con una estadía de <strong>{estadia:.1f} noches</strong>. "
        f"La oportunidad: convertir más de esas noches en consumo formal.")
