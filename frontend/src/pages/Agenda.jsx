import { useState, useMemo } from 'react'
import { C, Paralelo, Eyebrow } from '../components/Atoms'

const VIDEO_URL = 'https://www.pexels.com/es-es/download/video/29167798/'
const ACTORES = ['Todos', 'Gobierno', 'Cámara', 'Sindicato HyG', 'Municipio', 'Inversor']

const PRESCRIPCIONES = [
  { capa: 'Conectividad Aérea', señal: 'Load Factor aéreo sostenido por encima del 85%', brecha: 'Demanda supera la capacidad instalada. Cada pasajero que no vuela es ingreso que no llega al destino ni al hotel.', prescripcion: 'Gestionar frecuencia adicional ante ANAC. Negociar con Flybondi y Aerolíneas Argentinas un acuerdo de capacidad garantizada.', actores: ['Gobierno', 'Municipio'], dias: 30 },
  { capa: 'Conectividad Aérea', señal: 'Load Factor aéreo por debajo del 60% durante dos meses', brecha: 'La ruta no es rentable para la aerolínea. El riesgo de discontinuación es real y el impacto sobre la hotelería sería inmediato.', prescripcion: 'Programa de garantía de ingresos para la ruta. Evento âncora para generar ocupación de vuelos. Subsidio cruzado con turismo de reuniones.', actores: ['Gobierno', 'Municipio'], dias: 30 },
  { capa: 'Conectividad Aérea', señal: 'Un carrier concentra más del 60% de los pasajeros', brecha: 'Dependencia crítica. Si ese carrier discontinúa la ruta, el impacto es inmediato sobre toda la oferta hotelera del destino.', prescripcion: 'Negociar acuerdo de continuidad con el carrier dominante. Iniciar proceso de atracción de tercer operador. Crear fondo de estabilización de ruta.', actores: ['Gobierno'], dias: 60 },
  { capa: 'Demanda y Ocupación', señal: 'Viajeros en caída mayor al 10% interanual', brecha: 'SDE pierde participación frente a Salta, Jujuy y Tucumán. El NOA crece pero el destino no captura su parte.', prescripcion: 'Auditoría de posicionamiento en OTAs. Revisión de pricing hotelero. Análisis de causa raíz frente a movimientos de competidores NOA.', actores: ['Gobierno', 'Cámara'], dias: 30 },
  { capa: 'Demanda y Ocupación', señal: 'IBT anticipado por encima de 60 con 4 a 6 semanas de adelanto', brecha: 'El pico de demanda llegará sin que la oferta esté preparada. Se llena solo pero no se monetiza adecuadamente.', prescripcion: 'Sistema de alerta temprana a hoteleros. Activar pauta digital en OTAs con creatividades listas. Revenue management preventivo en establecimientos ancla.', actores: ['Cámara', 'Municipio'], dias: 30 },
  { capa: 'Demanda y Ocupación', señal: 'IBT cayendo durante tres meses consecutivos', brecha: 'El destino está perdiendo posicionamiento digital orgánico. Desaparece de las búsquedas antes de que el turista decida viajar.', prescripcion: 'Campaña de contenido + SEO especializado en turismo termal. Acuerdo con influencers de wellness y turismo de bienestar.', actores: ['Gobierno', 'Municipio'], dias: 30 },
  { capa: 'Demanda y Ocupación', señal: 'Estadía media cayendo por debajo de 2.5 noches', brecha: 'El destino captura menos valor por visitante. Más tránsito que turismo. El gasto total baja aunque lleguen más personas.', prescripcion: 'Paquetes de 3 o más noches como estándar en acuerdos con OTAs. Actividades mid-week. Agenda cultural y termal permanente.', actores: ['Cámara', 'Municipio'], dias: 60 },
  { capa: 'Captura de Valor', señal: 'ICV estancado en 38% sin mejora en los últimos dos años', brecha: '62 de cada 100 pesos de gasto turístico potencial no quedan en el territorio. Se fugan a plataformas, intermediarios y economía informal.', prescripcion: 'Avanzar convenio con DGR para dato fiscal real (N2). Mapa de fuga por rubro. Campaña de formalización hotelera con incentivo fiscal diferencial.', actores: ['Gobierno'], dias: 90 },
  { capa: 'Captura de Valor', señal: 'Listings de alquiler informal crecen más del 15% interanual', brecha: 'El sector formal pierde mercado y base imponible mientras el informal crece sin controles ni aportes.', prescripcion: 'Programa de formalización con incentivo fiscal. Registro obligatorio de alquileres temporarios. Equiparación gradual de cargas.', actores: ['Municipio', 'Gobierno'], dias: 90 },
  { capa: 'Empleo y Formalización', señal: 'Empleo HyG estancado mientras la demanda turística crece', brecha: 'El turismo crece pero no genera trabajo registrado. La recuperación es real pero sin empleo formal. Hay precarización oculta.', prescripcion: 'Auditoría de ratio empleados por plaza hotelera por categoría. Plan de registración con reducción transitoria de aportes patronales.', actores: ['Sindicato HyG', 'Gobierno'], dias: 60 },
  { capa: 'Empleo y Formalización', señal: 'Empleo HyG cae en temporada alta', brecha: 'Precarización estacional sistemática. El trabajo de temporada no se registra. El sector crece en negro durante los meses de mayor demanda.', prescripcion: 'Programa de empleo estacional registrado. Incentivo patronal para contrataciones formales de 30 a 90 días. Convenio sectorial específico.', actores: ['Sindicato HyG', 'Gobierno'], dias: 30 },
  { capa: 'Salud Turística', señal: 'Provincia del NOA sube dos o más posiciones en el ranking ISTP', brecha: 'SDE pierde posición competitiva regional. Otro destino está ejecutando mejor. La brecha puede ampliarse si no se actúa.', prescripcion: 'Benchmarking urgente. Identificar la variable que explica el salto del competidor. Plan de respuesta en 30 días con acción concreta.', actores: ['Gobierno'], dias: 30 },
  { capa: 'Salud Turística', señal: 'SDE en Cuadrante I con score por debajo de 60 puntos', brecha: 'La trayectoria es positiva pero la base estructural es débil. El riesgo de estancamiento en ese cuadrante es real si no se fortalecen las dimensiones rezagadas.', prescripcion: 'Plan de salto de cuadrante: identificar las tres dimensiones más débiles del ISTP e implementar una acción concreta por dimensión en 90 días.', actores: ['Gobierno', 'Cámara', 'Sindicato HyG'], dias: 90 },
]

const CAPA_COLOR = {
  'Conectividad Aérea':    C.volt,
  'Demanda y Ocupación':   'rgba(250,250,247,0.75)',
  'Captura de Valor':      'rgba(200,200,191,0.75)',
  'Empleo y Formalización':'rgba(250,250,247,0.55)',
  'Salud Turística':       C.volt,
}

const DIAS_LABEL = { 30: 'Acción inmediata', 60: 'Mediano plazo', 90: 'Estructural' }

export default function Agenda() {
  const [actor, setActor] = useState('Todos')
  const [capa, setCapa]   = useState('Todas')
  const capas = ['Todas', ...Object.keys(CAPA_COLOR)]
  const items = useMemo(() => PRESCRIPCIONES.filter(p =>
    (actor === 'Todos' || p.actores.includes(actor)) &&
    (capa  === 'Todas' || p.capa === capa)
  ), [actor, capa])

  const btn = (active) => ({
    background: active ? C.volt : 'transparent',
    color: active ? C.ink : 'rgba(250,250,247,0.4)',
    border: `0.5px solid ${active ? C.volt : 'rgba(250,250,247,0.1)'}`,
    padding: '8px 18px', cursor: 'pointer',
    fontSize: 'var(--fs-xs)', fontFamily: 'Plus Jakarta Sans',
    fontWeight: active ? 600 : 400,
    letterSpacing: '0.08em', textTransform: 'uppercase',
    transition: 'all 0.15s',
  })

  return (
    <>
      {/* HERO */}
      <section style={{ position: 'relative', minHeight: '60vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 'clamp(80px,10vw,120px) var(--pad) clamp(56px,7vw,80px)' }}>
        <video autoPlay loop muted playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, filter: 'brightness(0.3)' }}>
          <source src={VIDEO_URL} type="video/mp4" />
        </video>
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(160deg, rgba(10,10,10,0.98) 0%, rgba(10,10,10,0.85) 50%, rgba(10,10,10,0.5) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <Paralelo /><Eyebrow light>Tablero de decisiones · Observatorio</Eyebrow>
          </div>
          <h1 style={{ fontSize: 'clamp(3.5rem,8vw,8rem)', fontWeight: 200, color: C.paper, letterSpacing: '-0.05em', lineHeight: 0.9, margin: '0 0 32px' }}>
            Del dato<br /><span style={{ color: C.volt }}>a la acción.</span>
          </h1>
          <p style={{ fontSize: 'clamp(1rem,1.4vw,1.2rem)', color: C.paper, opacity: 0.45, maxWidth: 520, lineHeight: 1.7, margin: '0 0 56px' }}>
            Cada señal del observatorio deriva en una prescripción concreta con actor responsable y horizonte definido.
          </p>
          {/* Contadores grandes */}
          <div style={{ display: 'flex', gap: 0 }}>
            {[
              { v: items.filter(p=>p.dias===30).length,  l: 'Acción inmediata', d: '30 días',  col: C.volt },
              { v: items.filter(p=>p.dias===60).length,  l: 'Mediano plazo',    d: '60 días',  col: 'rgba(250,250,247,0.5)' },
              { v: items.filter(p=>p.dias===90).length,  l: 'Estructural',      d: '90 días',  col: 'rgba(250,250,247,0.3)' },
            ].map((k, i) => (
              <div key={i} style={{ paddingRight: 'clamp(24px,4vw,56px)', borderRight: i<2?'0.5px solid rgba(250,250,247,0.1)':undefined, marginRight: 'clamp(24px,4vw,56px)' }}>
                <div style={{ fontSize: 'clamp(3rem,7vw,6rem)', fontWeight: 200, color: k.col, letterSpacing: '-0.06em', lineHeight: 1 }}>{k.v}</div>
                <div style={{ fontSize: 'var(--fs-xs)', color: 'rgba(250,250,247,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 6 }}>{k.l}</div>
                <div style={{ fontSize: 9, color: 'rgba(250,250,247,0.2)', letterSpacing: '0.08em' }}>{k.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FILTROS */}
      <section style={{ background: '#0D0D0D', padding: 'clamp(20px,3vw,28px) var(--pad)', borderBottom: '0.5px solid rgba(250,250,247,0.06)', position: 'sticky', top: 108, zIndex: 50 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 9, color: 'rgba(250,250,247,0.2)', letterSpacing: '0.14em', textTransform: 'uppercase', marginRight: 8 }}>Actor</span>
            {ACTORES.map(a => <button key={a} onClick={() => setActor(a)} style={btn(actor===a)}>{a}</button>)}
          </div>
          <div style={{ width: '0.5px', height: 24, background: 'rgba(250,250,247,0.07)' }} />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 9, color: 'rgba(250,250,247,0.2)', letterSpacing: '0.14em', textTransform: 'uppercase', marginRight: 8 }}>Capa</span>
            {capas.map(cp => <button key={cp} onClick={() => setCapa(cp)} style={btn(capa===cp)}>{cp}</button>)}
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 'var(--fs-sm)', color: 'rgba(250,250,247,0.2)' }}>{items.length} prescripciones</div>
        </div>
      </section>

      {/* PRESCRIPCIONES */}
      <section style={{ background: C.ink }}>
        {items.map((p, i) => (
          <div key={i} style={{
            display: 'grid',
            gridTemplateColumns: 'clamp(80px,8vw,120px) 1fr',
            borderBottom: '0.5px solid rgba(250,250,247,0.06)',
          }}>
            {/* Panel izquierdo — días */}
            <div style={{
              background: p.dias===30 ? 'rgba(255,255,0,0.04)' : 'rgba(250,250,247,0.02)',
              borderRight: p.dias===30 ? `2px solid ${C.volt}` : '0.5px solid rgba(250,250,247,0.06)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: 'clamp(24px,3vw,40px) clamp(12px,2vw,20px)',
              gap: 4,
            }}>
              <span style={{ fontSize: 'clamp(2rem,4vw,3.5rem)', fontWeight: 200, color: p.dias===30 ? C.volt : 'rgba(250,250,247,0.2)', letterSpacing: '-0.05em', lineHeight: 1 }}>{p.dias}</span>
              <span style={{ fontSize: 9, color: p.dias===30 ? C.volt : 'rgba(250,250,247,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.4 }}>días</span>
              <span style={{ fontSize: 8, color: 'rgba(250,250,247,0.15)', letterSpacing: '0.06em', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.4, marginTop: 4 }}>{DIAS_LABEL[p.dias]}</span>
            </div>

            {/* Panel derecho — contenido */}
            <div style={{ padding: 'clamp(28px,4vw,48px) clamp(24px,3vw,40px)' }}>
              {/* Capa + Actores */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: CAPA_COLOR[p.capa] || C.stone, border: `0.5px solid ${CAPA_COLOR[p.capa] || C.stone}30`, padding: '4px 12px' }}>
                  {p.capa}
                </span>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {p.actores.map(a => (
                    <span key={a} style={{ fontSize: 'var(--fs-xs)', color: 'rgba(250,250,247,0.4)', border: '0.5px solid rgba(250,250,247,0.12)', padding: '3px 10px', letterSpacing: '0.04em' }}>{a}</span>
                  ))}
                </div>
              </div>

              {/* Señal — grande */}
              <h2 style={{ fontSize: 'clamp(1.1rem,1.8vw,1.5rem)', fontWeight: 400, color: C.paper, lineHeight: 1.4, margin: '0 0 28px' }}>
                {p.señal}
              </h2>

              {/* Brecha / Prescripción */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(20px,3vw,48px)' }}>
                <div>
                  <div style={{ fontSize: 9, color: 'rgba(250,250,247,0.2)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 12 }}>Por qué importa</div>
                  <p style={{ fontSize: 'clamp(0.85rem,1.1vw,0.95rem)', color: 'rgba(250,250,247,0.5)', lineHeight: 1.75, margin: 0 }}>{p.brecha}</p>
                </div>
                <div style={{ paddingLeft: 'clamp(16px,2.5vw,32px)', borderLeft: `3px solid ${C.volt}` }}>
                  <div style={{ fontSize: 9, color: C.volt, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 12 }}>Prescripción</div>
                  <p style={{ fontSize: 'clamp(0.85rem,1.1vw,0.95rem)', color: C.paper, lineHeight: 1.75, margin: 0 }}>{p.prescripcion}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section style={{ background: '#080808', padding: 'clamp(32px,4vw,48px) var(--pad)', borderTop: '0.5px solid rgba(250,250,247,0.04)' }}>
        <p style={{ fontSize: 'var(--fs-xs)', color: 'rgba(250,250,247,0.15)', maxWidth: 640, lineHeight: 1.8, margin: 0 }}>
          Prescripciones derivadas de las señales activas del observatorio. Cada decisión requiere validación con el actor responsable antes de ejecutarse. El horizonte es orientativo.
        </p>
      </section>
    </>
  )
}
