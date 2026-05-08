import { useState, useMemo } from 'react'
import { C, Paralelo, VoltLine, Eyebrow, SectionTitle, Interpretacion } from '../components/Atoms'

const VIDEO_URL = 'https://www.pexels.com/es-es/download/video/29167798/'
const ACTORES = ['Todos', 'Gobierno', 'Cámara', 'Sindicato HyG', 'Municipio', 'Inversor']

const PRESCRIPCIONES = [
  { capa: 'Conectividad Aérea', señal: 'Load Factor aéreo sostenido por encima del 85%', brecha: 'Demanda supera la capacidad instalada. Cada pasajero que no vuela es ingreso que no llega al destino ni al hotel.', prescripcion: 'Gestionar frecuencia adicional ante ANAC. Negociar con Flybondi y Aerolíneas Argentinas un acuerdo de capacidad garantizada.', actores: ['Gobierno', 'Municipio'], dias: 30 },
  { capa: 'Conectividad Aérea', señal: 'Load Factor aéreo por debajo del 60% durante dos meses', brecha: 'La ruta no es rentable para la aerolínea. El riesgo de discontinuación es real y el impacto sobre la hotelería sería inmediato.', prescripcion: 'Programa de garantía de ingresos para la ruta. Evento âncora para generar ocupación de vuelos. Subsidio cruzado con turismo de reuniones.', actores: ['Gobierno', 'Municipio'], dias: 30 },
  { capa: 'Conectividad Aérea', señal: 'Un carrier concentra más del 60% de los pasajeros', brecha: 'Dependencia crítica. Si ese carrier discontinúa la ruta, el impacto es inmediato sobre toda la oferta hotelera del destino.', prescripcion: 'Negociar acuerdo de continuidad con el carrier dominante. Iniciar proceso de atracción de tercer operador. Crear fondo de estabilización de ruta.', actores: ['Gobierno'], dias: 60 },
  { capa: 'Demanda y Ocupación', señal: 'Viajeros en caída mayor al 10% interanual', brecha: 'El destino pierde participación frente a Salta, Jujuy y Tucumán. El NOA crece pero el destino no captura su parte.', prescripcion: 'Auditoría de posicionamiento en OTAs. Revisión de pricing hotelero. Análisis de causa raíz frente a movimientos de competidores del NOA.', actores: ['Gobierno', 'Cámara'], dias: 30 },
  { capa: 'Demanda y Ocupación', señal: 'IBT anticipado por encima de 60 con 4-6 semanas de adelanto', brecha: 'El pico de demanda llegará sin que la oferta esté preparada. Se llena solo pero no se monetiza adecuadamente.', prescripcion: 'Sistema de alerta temprana a hoteleros. Activar pauta digital en OTAs con creatividades listas. Revenue management preventivo en establecimientos ancla.', actores: ['Cámara', 'Municipio'], dias: 30 },
  { capa: 'Demanda y Ocupación', señal: 'IBT cayendo durante tres meses consecutivos', brecha: 'El destino está perdiendo posicionamiento digital orgánico. Desaparece de las búsquedas antes de que el turista decida viajar.', prescripcion: 'Campaña de contenido + SEO especializado en turismo termal. Acuerdo con influencers de wellness y turismo de bienestar.', actores: ['Gobierno', 'Municipio'], dias: 30 },
  { capa: 'Demanda y Ocupación', señal: 'Estadía media cayendo por debajo de 2.5 noches', brecha: 'El destino captura menos valor por visitante. Más tránsito que turismo. El gasto total baja aunque lleguen más personas.', prescripcion: 'Paquetes de 3 o más noches como estándar en acuerdos con OTAs. Actividades mid-week. Agenda cultural y termal permanente.', actores: ['Cámara', 'Municipio'], dias: 60 },
  { capa: 'Captura de Valor', señal: 'ICV estancado en 38% sin mejora en los últimos dos años', brecha: '62 de cada 100 pesos de gasto potencial no quedan en el territorio. Se fugan a plataformas, intermediarios y economía informal.', prescripcion: 'Avanzar convenio con DGR para dato fiscal real (N2). Mapa de fuga por rubro. Campaña de formalización hotelera con incentivo fiscal diferencial.', actores: ['Gobierno'], dias: 90 },
  { capa: 'Captura de Valor', señal: 'Listings de alquiler informal crecen más del 15% interanual', brecha: 'El sector formal pierde mercado y base imponible mientras el informal crece sin controles ni aportes.', prescripcion: 'Programa de formalización con incentivo fiscal. Registro obligatorio de alquileres temporarios. Equiparación gradual de cargas.', actores: ['Municipio', 'Gobierno'], dias: 90 },
  { capa: 'Empleo y Formalización', señal: 'Empleo HyG estancado mientras la demanda turística crece', brecha: 'El turismo crece pero no genera trabajo registrado. La recuperación es real pero sin empleo formal. Hay precarización oculta.', prescripcion: 'Auditoría de ratio empleados por plaza hotelera por categoría. Plan de registración con reducción transitoria de aportes patronales.', actores: ['Sindicato HyG', 'Gobierno'], dias: 60 },
  { capa: 'Empleo y Formalización', señal: 'Empleo HyG cae en temporada alta', brecha: 'Precarización estacional sistemática. El trabajo de temporada no se registra. El sector crece en negro durante los meses de mayor demanda.', prescripcion: 'Programa de empleo estacional registrado. Incentivo patronal para contrataciones formales de 30 a 90 días. Convenio sectorial específico.', actores: ['Sindicato HyG', 'Gobierno'], dias: 30 },
  { capa: 'Salud Turística', señal: 'Provincia del NOA sube dos o más posiciones en el ranking ISTP', brecha: 'El destino pierde posición competitiva regional. Otro destino está ejecutando mejor. La brecha puede ampliarse si no se actúa.', prescripcion: 'Benchmarking urgente. Identificar la variable que explica el salto del competidor. Plan de respuesta en 30 días con acción concreta.', actores: ['Gobierno'], dias: 30 },
  { capa: 'Salud Turística', señal: 'Score ISTP por debajo de 60 puntos con Cuadrante I', brecha: 'La trayectoria es positiva pero la base estructural es débil. El riesgo de estancamiento en ese cuadrante es real.', prescripcion: 'Plan de salto de cuadrante: identificar las tres dimensiones más débiles del ISTP e implementar una acción por dimensión en 90 días.', actores: ['Gobierno', 'Cámara', 'Sindicato HyG'], dias: 90 },
]

const CAPA_COLOR = {
  'Conectividad Aérea': C.ink, 'Demanda y Ocupación': C.ink,
  'Captura de Valor': C.ink, 'Empleo y Formalización': C.ink, 'Salud Turística': C.ink,
}
const DIAS_BG = { 30: C.ink, 60: C.paper2, 90: C.paper2 }
const DIAS_FG = { 30: C.volt, 60: C.slate, 90: C.slate }

export default function Agenda() {
  const [actor, setActor] = useState('Todos')
  const [capa, setCapa]   = useState('Todas')
  const capas = ['Todas', ...new Set(PRESCRIPCIONES.map(p => p.capa))]
  const items = useMemo(() => PRESCRIPCIONES.filter(p =>
    (actor === 'Todos' || p.actores.includes(actor)) &&
    (capa  === 'Todas' || p.capa === capa)
  ), [actor, capa])

  const urgentes = items.filter(p => p.dias === 30).length

  const btnActor = (active) => ({
    background: active ? C.ink : 'transparent',
    color: active ? C.paper : C.slate,
    border: `0.5px solid ${active ? C.ink : `${C.stone}80`}`,
    padding: '6px 14px', cursor: 'pointer',
    fontSize: 'var(--fs-xs)', fontFamily: 'Plus Jakarta Sans', letterSpacing: '0.06em',
  })
  const btnCapa = (active) => ({
    background: active ? C.ink : 'transparent',
    color: active ? C.paper : C.slate,
    border: `0.5px solid ${active ? C.ink : `${C.stone}80`}`,
    padding: '6px 14px', cursor: 'pointer',
    fontSize: 'var(--fs-xs)', fontFamily: 'Plus Jakarta Sans', letterSpacing: '0.06em',
  })

  return (
    <>
      {/* HERO — mismo patrón que Aérea */}
      <section style={{
        position: 'relative', minHeight: '44vh', overflow: 'hidden',
        padding: 'clamp(64px,8vw,96px) var(--pad) clamp(48px,6vw,72px)',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      }}>
        <video autoPlay loop muted playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}>
          <source src={VIDEO_URL} type="video/mp4" />
        </video>
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to right, rgba(10,10,10,0.93) 0%, rgba(10,10,10,0.78) 35%, rgba(10,10,10,0.38) 65%, rgba(10,10,10,0.10) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 3 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <Paralelo /><Eyebrow light>Tablero de decisiones · Capa 4 · Decisión</Eyebrow>
          </div>
          <h1 style={{ fontSize: 'clamp(2.4rem,5vw,5rem)', fontWeight: 200, color: C.paper, letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 16px' }}>
            Del dato<br />a la acción.
          </h1>
          <p style={{ fontSize: '0.9rem', fontWeight: 300, color: C.paper, opacity: 0.6, maxWidth: 420, lineHeight: 1.65, margin: 0 }}>
            Cada señal del observatorio deriva en una prescripción concreta con actor responsable y horizonte definido.
          </p>
        </div>
      </section>

      {/* KPIs en paper */}
      <section style={{ background: C.paper, padding: 'clamp(40px,5vw,64px) var(--pad)' }}>
        <Eyebrow style={{ marginBottom: 40 }}>Resumen · {items.length} prescripciones activas</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0 clamp(14px,4vw,56px)' }}>
          {[
            { v: items.filter(p=>p.dias===30).length, l: 'Acción inmediata', d: '30 días · urgente' },
            { v: items.filter(p=>p.dias===60).length, l: 'Mediano plazo',    d: '60 días' },
            { v: items.filter(p=>p.dias===90).length, l: 'Estructural',      d: '90 días' },
          ].map((k,i) => (
            <div key={i} style={{ borderLeft: `1px solid ${C.stone}`, paddingLeft: 'clamp(14px,2vw,24px)' }}>
              <div style={{ fontSize: 'clamp(1.7rem,3vw,3rem)', fontWeight: 200, color: C.ink, letterSpacing: '-0.045em', lineHeight: 1, marginBottom: 10 }}>{k.v}</div>
              <VoltLine w={20} />
              <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 400, color: C.ink, marginTop: 10, marginBottom: 4 }}>{k.l}</div>
              <div style={{ fontSize: 'var(--fs-xs)', color: C.slate, opacity: 0.65 }}>{k.d}</div>
            </div>
          ))}
        </div>
        <Interpretacion>
          {urgentes} prescripciones requieren acción en los próximos 30 días. Usá los filtros para ver solo las que corresponden a tu área de responsabilidad.
        </Interpretacion>
      </section>

      {/* FILTROS en paper2 */}
      <section style={{ background: C.paper2, padding: 'clamp(20px,2.5vw,28px) var(--pad)', borderTop: `0.5px solid ${C.stone}30`, borderBottom: `0.5px solid ${C.stone}30`, position: 'sticky', top: 108, zIndex: 50 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 9, color: C.stone, letterSpacing: '0.14em', textTransform: 'uppercase', marginRight: 6 }}>Actor</span>
            {ACTORES.map(a => <button key={a} onClick={() => setActor(a)} style={btnActor(actor===a)}>{a}</button>)}
          </div>
          <div style={{ width: '0.5px', height: 20, background: `${C.stone}50` }} />
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 9, color: C.stone, letterSpacing: '0.14em', textTransform: 'uppercase', marginRight: 6 }}>Capa</span>
            {capas.map(cp => <button key={cp} onClick={() => setCapa(cp)} style={btnCapa(capa===cp)}>{cp}</button>)}
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 'var(--fs-xs)', color: C.slate }}>{items.length} prescripciones</div>
        </div>
      </section>

      {/* PRESCRIPCIONES en ink (dark) */}
      <section style={{ background: C.ink }}>
        {items.map((p, i) => (
          <div key={i} style={{
            padding: 'clamp(28px,4vw,48px) var(--pad)',
            borderBottom: '0.5px solid rgba(250,250,247,0.07)',
            display: 'grid',
            gridTemplateColumns: 'clamp(48px,6vw,80px) 1fr',
            gap: 'clamp(20px,3vw,40px)',
            alignItems: 'start',
          }}>
            {/* Días */}
            <div style={{ textAlign: 'center', paddingTop: 4 }}>
              <div style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 200, color: p.dias===30?C.volt:'rgba(250,250,247,0.25)', letterSpacing: '-0.05em', lineHeight: 1 }}>{p.dias}</div>
              <div style={{ fontSize: 8, color: p.dias===30?C.volt:'rgba(250,250,247,0.2)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 4 }}>días</div>
            </div>

            <div>
              {/* Capa + actores */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.volt, padding: '3px 10px', border: `0.5px solid rgba(255,255,0,0.2)` }}>
                  {p.capa}
                </span>
                <div style={{ display: 'flex', gap: 5, marginLeft: 'auto', flexWrap: 'wrap' }}>
                  {p.actores.map(a => (
                    <span key={a} style={{ fontSize: 9, color: 'rgba(250,250,247,0.35)', border: '0.5px solid rgba(250,250,247,0.1)', padding: '2px 8px', letterSpacing: '0.04em' }}>{a}</span>
                  ))}
                </div>
              </div>

              {/* Señal */}
              <h3 style={{ fontSize: 'clamp(1rem,1.6vw,1.2rem)', fontWeight: 400, color: C.paper, margin: '0 0 22px', lineHeight: 1.45 }}>
                {p.señal}
              </h3>

              {/* Brecha / Prescripción */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(16px,2.5vw,40px)' }}>
                <div>
                  <div style={{ fontSize: 9, color: 'rgba(250,250,247,0.2)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Por qué importa</div>
                  <p style={{ fontSize: 'var(--fs-sm)', color: 'rgba(250,250,247,0.5)', lineHeight: 1.75, margin: 0 }}>{p.brecha}</p>
                </div>
                <div style={{ paddingLeft: 'clamp(14px,2vw,28px)', borderLeft: '1px solid rgba(250,250,247,0.1)' }}>
                  <div style={{ fontSize: 9, color: C.stone, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Prescripción</div>
                  <p style={{ fontSize: 'var(--fs-sm)', color: C.paper, lineHeight: 1.75, margin: 0 }}>{p.prescripcion}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section style={{ background: C.paper, padding: 'clamp(32px,4vw,48px) var(--pad)' }}>
        <Interpretacion>
          Las prescripciones se derivan de las señales activas del observatorio. Cada decisión requiere validación con el actor responsable. El horizonte es orientativo.
        </Interpretacion>
      </section>
    </>
  )
}
