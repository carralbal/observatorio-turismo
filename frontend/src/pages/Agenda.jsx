import { useState } from 'react'
import { C, Paralelo, Eyebrow } from '../components/Atoms'

const ACTORES = ['Todos', 'Gobierno', 'Cámara', 'Sindicato HyG', 'Municipio', 'Inversor']

const PRESCRIPCIONES = [
  { capa: 'Conectividad Aérea', señal: 'Load Factor aéreo >85% por 3+ meses', brecha: 'Demanda supera capacidad instalada de asientos', prescripcion: 'Gestionar frecuencia adicional ante ANAC · negociar con Flybondi y Aerolíneas Argentinas', actores: ['Gobierno', 'Municipio'], dias: 30, urgencia: 'alta' },
  { capa: 'Conectividad Aérea', señal: 'Load Factor aéreo <60% por 2+ meses', brecha: 'Ruta en riesgo de discontinuación por baja rentabilidad', prescripcion: 'Programa de garantía de ingresos · subsidio vía eventos y convenios', actores: ['Gobierno', 'Municipio'], dias: 30, urgencia: 'alta' },
  { capa: 'Conectividad Aérea', señal: 'Un carrier opera >60% de los pasajeros', brecha: 'Dependencia crítica de un operador · riesgo de desconexión total', prescripcion: 'Negociar acuerdo de continuidad + atraer tercer operador · diversificar rutas', actores: ['Gobierno'], dias: 60, urgencia: 'alta' },
  { capa: 'Demanda y Ocupación', señal: 'Viajeros cayendo >10% interanual', brecha: 'Pérdida de participación vs competidores NOA', prescripcion: 'Auditoría de posicionamiento en OTAs · revisión de pricing hotelero', actores: ['Gobierno', 'Cámara'], dias: 30, urgencia: 'alta' },
  { capa: 'Demanda y Ocupación', señal: 'IBT anticipado >60 con 4-6 semanas de adelanto', brecha: 'Pico de demanda sin preparación de oferta', prescripcion: 'Alerta temprana a hoteleros · activar pauta digital · revenue management preventivo', actores: ['Cámara', 'Municipio'], dias: 30, urgencia: 'alta' },
  { capa: 'Demanda y Ocupación', señal: 'IBT cayendo 3 meses consecutivos', brecha: 'Pérdida de posicionamiento digital orgánico', prescripcion: 'Campaña de contenido + SEO + acuerdo con influencers de turismo termal', actores: ['Gobierno', 'Municipio'], dias: 30, urgencia: 'alta' },
  { capa: 'Demanda y Ocupación', señal: 'Estadía media cayando por debajo de 2.5 noches', brecha: 'Destino captura menos valor por visitante', prescripcion: 'Paquetes 3+ noches en OTAs · actividades mid-week · agenda cultural permanente', actores: ['Cámara', 'Municipio'], dias: 60, urgencia: 'media' },
  { capa: 'Demanda y Ocupación', señal: 'Ratio pico/valle >4x estacional', brecha: 'Modelo frágil dependiente de temporada alta', prescripcion: 'Programa de eventos en temporada baja · turismo de reuniones y convenciones', actores: ['Gobierno', 'Municipio', 'Cámara'], dias: 60, urgencia: 'media' },
  { capa: 'Captura de Valor', señal: 'ICV estancado en 38% sin mejora histórica', brecha: '62% del gasto potencial no queda en el territorio formal', prescripcion: 'Avanzar convenio DGR para dato fiscal real (N2) · mapa de fuga por rubro', actores: ['Gobierno'], dias: 90, urgencia: 'alta' },
  { capa: 'Captura de Valor', señal: 'Listings informales crecen >15% interanual', brecha: 'Sector formal pierde mercado · erosión de base imponible', prescripcion: 'Programa de formalización con incentivo fiscal · registro obligatorio', actores: ['Municipio', 'Gobierno'], dias: 90, urgencia: 'media' },
  { capa: 'Captura de Valor', señal: 'Precio OTA >30% sobre precio directo del hotel', brecha: 'El destino no captura el margen que se va a intermediarios', prescripcion: 'Capacitación en revenue management · canal de venta directa para hoteleros', actores: ['Cámara'], dias: 30, urgencia: 'baja' },
  { capa: 'Empleo y Formalización', señal: 'Empleo HyG estancado con demanda creciente', brecha: 'El turismo crece sin generar trabajo registrado · precariedad oculta', prescripcion: 'Auditoría ratio empleados/plazas · plan de registración con reducción de aportes', actores: ['Sindicato HyG', 'Gobierno'], dias: 60, urgencia: 'alta' },
  { capa: 'Empleo y Formalización', señal: 'Empleo HyG cae en temporada que debería subir', brecha: 'Precarización estacional no registrada · trabajo informal de temporada', prescripcion: 'Programa de empleo estacional registrado · incentivo patronal para contrataciones formales', actores: ['Sindicato HyG', 'Gobierno'], dias: 30, urgencia: 'alta' },
  { capa: 'Empleo y Formalización', señal: 'SDE ranking empleo HyG bajo vs NOA', brecha: 'Estructura laboral turística subdesarrollada vs tamaño del destino', prescripcion: 'Plan de formación sectorial + convenio INET · certificación de competencias termales', actores: ['Sindicato HyG', 'Gobierno'], dias: 90, urgencia: 'media' },
  { capa: 'Conectividad Terrestre', señal: 'Pasajeros buses cayendo >15% interanual', brecha: 'Pérdida de accesibilidad terrestre al destino', prescripcion: 'Subsidio diferencial de tarifa en rutas estratégicas · programa de conectividad social', actores: ['Gobierno'], dias: 90, urgencia: 'media' },
  { capa: 'Salud Turística', señal: 'SDE Cuadrante I pero score <60/100', brecha: 'Trayectoria positiva pero base estructural débil · riesgo de estancamiento', prescripcion: 'Plan de salto de cuadrante: 3 acciones estructurales en 90 días por dimensión más débil', actores: ['Gobierno', 'Cámara', 'Sindicato HyG'], dias: 90, urgencia: 'media' },
  { capa: 'Salud Turística', señal: 'Provincia NOA sube 2+ posiciones en ranking ISTP', brecha: 'Pérdida de posición competitiva regional · brecha ampliándose', prescripcion: 'Benchmarking urgente · identificar variable que explica el salto del competidor', actores: ['Gobierno'], dias: 30, urgencia: 'alta' },
]

const CAPA_COLOR = {
  'Conectividad Aérea': C.volt,
  'Demanda y Ocupación': 'rgba(250,250,247,0.8)',
  'Captura de Valor': 'rgba(200,200,191,0.8)',
  'Empleo y Formalización': 'rgba(250,250,247,0.6)',
  'Conectividad Terrestre': 'rgba(200,200,191,0.6)',
  'Salud Turística': C.volt,
}
const URG = { alta: '🔴', media: '🟡', baja: '⚪' }

export default function Agenda() {
  const [actor, setActor] = useState('Todos')
  const [capa, setCapa]   = useState('Todas')
  const capas = ['Todas', ...new Set(PRESCRIPCIONES.map(p => p.capa))]
  const items = PRESCRIPCIONES.filter(p =>
    (actor === 'Todos' || p.actores.includes(actor)) &&
    (capa  === 'Todas' || p.capa === capa)
  )
  const btnStyle = (active) => ({
    background: active ? C.ink : 'transparent',
    color: active ? C.paper : C.slate,
    border: `0.5px solid ${active ? C.ink : C.stone}`,
    padding: '5px 12px', cursor: 'pointer',
    fontSize: 'var(--fs-xs)', fontFamily: 'Plus Jakarta Sans',
  })

  return (
    <>
      <section style={{ background: C.ink, padding: 'clamp(80px,10vw,120px) var(--pad) clamp(48px,6vw,72px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Paralelo /><Eyebrow light>Capa de Decisión · Observatorio SDE</Eyebrow>
        </div>
        <h1 style={{ fontSize: 'clamp(2.4rem,5vw,5rem)', fontWeight: 200, color: C.paper, letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 20px' }}>
          Del dato<br />a la decisión.
        </h1>
        <p style={{ fontSize: '0.9rem', color: C.paper, opacity: 0.55, maxWidth: 520, lineHeight: 1.7, margin: 0 }}>
          Prescripciones accionables para cada señal del observatorio. Cada indicador tiene un dueño, un horizonte y una acción concreta.
        </p>
      </section>

      <section style={{ background: C.paper2, padding: 'clamp(20px,3vw,32px) var(--pad)', borderBottom: `0.5px solid ${C.stone}30` }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 9, color: C.stone, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>Actor</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {ACTORES.map(a => <button key={a} onClick={() => setActor(a)} style={btnStyle(actor===a)}>{a}</button>)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 9, color: C.stone, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>Capa</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {capas.map(cp => <button key={cp} onClick={() => setCapa(cp)} style={btnStyle(capa===cp)}>{cp}</button>)}
            </div>
          </div>
        </div>
        <div style={{ fontSize: 'var(--fs-xs)', color: C.slate }}>{items.length} prescripciones · {items.filter(p => p.dias <= 30).length} urgentes (30 días)</div>
      </section>

      <section style={{ background: C.paper, padding: 'clamp(32px,5vw,56px) var(--pad)' }}>
        {items.map((p, i) => (
          <div key={i} style={{ padding: 'clamp(18px,2.5vw,28px) 0', borderBottom: `0.5px solid ${C.stone}30`, display: 'grid', gap: 12 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: CAPA_COLOR[p.capa] || C.stone, background: C.ink, padding: '2px 8px' }}>{p.capa}</span>
              <span style={{ fontSize: 9, color: C.stone }}>{URG[p.urgencia]} {p.dias} días</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginLeft: 'auto' }}>
                {p.actores.map(a => <span key={a} style={{ fontSize: 9, color: C.slate, border: `0.5px solid ${C.stone}60`, padding: '1px 6px' }}>{a}</span>)}
              </div>
            </div>
            <div style={{ fontSize: 'var(--fs-base)', fontWeight: 500, color: C.ink }}>{p.señal}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ fontSize: 9, color: C.stone, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Brecha</div>
                <div style={{ fontSize: 'var(--fs-sm)', color: C.slate, lineHeight: 1.6 }}>{p.brecha}</div>
              </div>
              <div style={{ borderLeft: `2px solid ${C.volt}`, paddingLeft: 12 }}>
                <div style={{ fontSize: 9, color: C.volt, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Prescripción</div>
                <div style={{ fontSize: 'var(--fs-sm)', color: C.ink, lineHeight: 1.6 }}>{p.prescripcion}</div>
              </div>
            </div>
          </div>
        ))}
      </section>
    </>
  )
}
