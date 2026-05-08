const VIDEO_URL = 'https://www.pexels.com/es-es/download/video/29167798/'

import { useState, useMemo } from 'react'
import { C, Paralelo, VoltLine, Eyebrow, SectionTitle } from '../components/Atoms'

const ACTORES = ['Todos', 'Gobierno', 'Cámara', 'Sindicato HyG', 'Municipio', 'Inversor']

const PRESCRIPCIONES = [
  { capa: 'Conectividad Aérea', señal: 'Load Factor aéreo >85% por 3+ meses', brecha: 'Demanda supera capacidad instalada de asientos — cada pasajero que no vuela es ingreso que no llega al destino', prescripcion: 'Gestionar frecuencia adicional ante ANAC · negociar con Flybondi y Aerolíneas Argentinas un acuerdo de capacidad garantizada', actores: ['Gobierno', 'Municipio'], dias: 30, urgencia: 'alta' },
  { capa: 'Conectividad Aérea', señal: 'Load Factor aéreo <60% por 2+ meses', brecha: 'Ruta en riesgo de discontinuación — la aerolínea no tiene incentivo para mantenerla', prescripcion: 'Programa de garantía de ingresos · eventos âncora para generar ocupación en vuelos · subsidio cruzado con turismo de reuniones', actores: ['Gobierno', 'Municipio'], dias: 30, urgencia: 'alta' },
  { capa: 'Conectividad Aérea', señal: 'Un carrier opera >60% de los pasajeros', brecha: 'Dependencia crítica de un operador — si discontinúa, el impacto es inmediato sobre toda la hotelería', prescripcion: 'Negociar acuerdo de continuidad con carrier dominante · atraer tercer operador · crear fondo de estabilización de ruta', actores: ['Gobierno'], dias: 60, urgencia: 'alta' },
  { capa: 'Conectividad Aérea', señal: 'Aeropuerto Termas (SANH) <500 pax/mes', brecha: 'Infraestructura pública ociosa vs inversión ya realizada', prescripcion: 'Revisión de política de incentivos a aerolíneas para SANH · programa de vuelos charter termales en temporada alta', actores: ['Gobierno', 'Municipio'], dias: 60, urgencia: 'media' },
  { capa: 'Demanda y Ocupación', señal: 'Viajeros cayendo >10% interanual', brecha: 'Pérdida de participación frente a Salta, Jujuy y Tucumán — el NOA está creciendo pero SDE no captura su parte', prescripcion: 'Auditoría de posicionamiento en OTAs · revisión de pricing hotelero · análisis de causa raíz vs movimientos de competidores', actores: ['Gobierno', 'Cámara'], dias: 30, urgencia: 'alta' },
  { capa: 'Demanda y Ocupación', señal: 'IBT anticipado >60 con 4-6 semanas de adelanto', brecha: 'Pico de demanda sin preparación de oferta — se llena solo sin monetizar adecuadamente', prescripcion: 'Sistema de alerta temprana a hoteleros · activar pauta digital en OTAs con creatividades listas · revenue management preventivo', actores: ['Cámara', 'Municipio'], dias: 30, urgencia: 'alta' },
  { capa: 'Demanda y Ocupación', señal: 'IBT cayendo 3 meses consecutivos', brecha: 'Pérdida de posicionamiento digital orgánico — el destino desaparece de las búsquedas', prescripcion: 'Campaña de contenido + SEO especializado + acuerdo con influencers de turismo termal y wellness', actores: ['Gobierno', 'Municipio'], dias: 30, urgencia: 'alta' },
  { capa: 'Demanda y Ocupación', señal: 'Estadía media cayendo por debajo de 2.5 noches', brecha: 'Destino captura menos valor por visitante — más tránsito que turismo', prescripcion: 'Paquetes 3+ noches como estándar en acuerdos con OTAs · actividades mid-week · agenda cultural y termal permanente', actores: ['Cámara', 'Municipio'], dias: 60, urgencia: 'media' },
  { capa: 'Demanda y Ocupación', señal: 'Ratio pico/valle estacional >4x', brecha: 'Modelo de negocio frágil — alta dependencia de temporada termal y eventos puntuales', prescripcion: 'Programa de eventos de bajo costo en baja temporada · turismo de reuniones y congresos · paquetes de salud y bienestar', actores: ['Gobierno', 'Municipio', 'Cámara'], dias: 60, urgencia: 'media' },
  { capa: 'Captura de Valor', señal: 'ICV estancado en 38% sin mejora histórica', brecha: '62% del gasto potencial no queda en el territorio — se fuga a plataformas, intermediarios y economía informal', prescripcion: 'Avanzar convenio DGR para dato fiscal real (N2) · mapeo de fuga por rubro · campaña de formalización hotelera con incentivo', actores: ['Gobierno'], dias: 90, urgencia: 'alta' },
  { capa: 'Captura de Valor', señal: 'Listings informales crecen >15% interanual', brecha: 'Sector formal pierde mercado y base imponible mientras el informal crece sin controles', prescripcion: 'Programa de formalización con incentivo fiscal · registro obligatorio de alquileres temporarios · equiparación de cargas', actores: ['Municipio', 'Gobierno'], dias: 90, urgencia: 'media' },
  { capa: 'Captura de Valor', señal: 'Precio OTA >30% sobre precio directo del hotel', brecha: 'El margen que genera el destino se va a intermediarios digitales externos', prescripcion: 'Capacitación en revenue management · implementar motor de reservas directo · negociar paridad con OTAs', actores: ['Cámara'], dias: 30, urgencia: 'baja' },
  { capa: 'Empleo y Formalización', señal: 'Empleo HyG estancado con demanda creciente', brecha: 'El turismo crece pero no genera trabajo registrado — la recuperación es sin empleo formal', prescripcion: 'Auditoría de ratio empleados/plazas por categoría · plan de registración con reducción transitoria de aportes patronales', actores: ['Sindicato HyG', 'Gobierno'], dias: 60, urgencia: 'alta' },
  { capa: 'Empleo y Formalización', señal: 'Empleo HyG cae en temporada que debería subir', brecha: 'Precarización estacional sistemática — el trabajo temporal no se registra', prescripcion: 'Programa de empleo estacional registrado · incentivo patronal para contrataciones formales de 30-90 días · convenio sectorial', actores: ['Sindicato HyG', 'Gobierno'], dias: 30, urgencia: 'alta' },
  { capa: 'Empleo y Formalización', señal: 'SDE ranking empleo HyG bajo vs NOA', brecha: 'Estructura laboral turística subdesarrollada respecto al tamaño e importancia del destino', prescripcion: 'Plan de formación sectorial + convenio INET/ministerio educación · certificación de competencias termales y hoteleras', actores: ['Sindicato HyG', 'Gobierno'], dias: 90, urgencia: 'media' },
  { capa: 'Salud Turística', señal: 'SDE Cuadrante I pero score <60/100', brecha: 'Trayectoria positiva pero base estructural débil — el riesgo de estancamiento es real', prescripcion: 'Plan de salto de cuadrante: identificar las 3 dimensiones más débiles e implementar una acción por dimensión en 90 días', actores: ['Gobierno', 'Cámara', 'Sindicato HyG'], dias: 90, urgencia: 'media' },
  { capa: 'Salud Turística', señal: 'Provincia NOA sube 2+ posiciones en ranking ISTP', brecha: 'Pérdida de posición competitiva regional — otro destino está ejecutando mejor', prescripcion: 'Benchmarking urgente · identificar variable que explica el salto del competidor · plan de respuesta en 30 días', actores: ['Gobierno'], dias: 30, urgencia: 'alta' },
]

const CAPA_META = {
  'Conectividad Aérea':    { color: C.volt,                        n: '01' },
  'Demanda y Ocupación':   { color: 'rgba(250,250,247,0.85)',       n: '02' },
  'Captura de Valor':      { color: 'rgba(200,200,191,0.85)',       n: '03' },
  'Empleo y Formalización':{ color: 'rgba(250,250,247,0.65)',       n: '04' },
  'Salud Turística':       { color: C.volt,                        n: '05' },
}
const URG_LABEL = { alta: '🔴 Alta', media: '🟡 Media', baja: '⚪ Baja' }

function BtnFiltro({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: active ? C.ink : 'transparent',
      color: active ? C.paper : C.slate,
      border: `0.5px solid ${active ? C.ink : `${C.stone}80`}`,
      padding: '6px 14px', cursor: 'pointer',
      fontSize: 'var(--fs-xs)', fontFamily: 'Plus Jakarta Sans',
      letterSpacing: '0.06em', transition: 'all 0.15s',
    }}>{label}</button>
  )
}

export default function Agenda() {
  const [actor, setActor] = useState('Todos')
  const [capa, setCapa]   = useState('Todas')

  const capas = ['Todas', ...Object.keys(CAPA_META)]

  const items = useMemo(() => PRESCRIPCIONES.filter(p =>
    (actor === 'Todos' || p.actores.includes(actor)) &&
    (capa  === 'Todas' || p.capa === capa)
  ), [actor, capa])

  const urgentes  = items.filter(p => p.dias <= 30).length
  const mediano   = items.filter(p => p.dias === 60).length
  const largo     = items.filter(p => p.dias === 90).length

  return (
    <>
      {/* HERO */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: 'clamp(80px,10vw,120px) var(--pad) clamp(56px,7vw,80px)' }}>
        <video autoPlay loop muted playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, filter: 'brightness(0.35)' }}>
          <source src={VIDEO_URL} type="video/mp4" />
        </video>
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to right, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.6) 60%, rgba(10,10,10,0.2) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <Paralelo /><Eyebrow light>Capa de Decisión · Observatorio SDE</Eyebrow>
        </div>
        <h1 style={{ fontSize: 'clamp(3rem,7vw,7rem)', fontWeight: 200, color: C.paper, letterSpacing: '-0.05em', lineHeight: 0.95, margin: '0 0 28px' }}>
          Del dato<br />a la decisión.
        </h1>
        <p style={{ fontSize: 'clamp(0.9rem,1.2vw,1.05rem)', color: C.paper, opacity: 0.5, maxWidth: 560, lineHeight: 1.75, margin: 0 }}>
          Cada señal del observatorio tiene un dueño, un horizonte y una prescripción concreta. El dato sin decisión es decoración.
        </p>

        </div>
        {/* CONTADORES */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, auto)', gap: 0, marginTop: 48, maxWidth: 480 }}>
          {[
            { v: urgentes,  l: 'Acciones urgentes', d: '30 días', color: C.volt },
            { v: mediano,   l: 'Acciones mediano', d: '60 días', color: 'rgba(250,250,247,0.6)' },
            { v: largo,     l: 'Acciones estructurales', d: '90 días', color: 'rgba(250,250,247,0.4)' },
          ].map((k, i) => (
            <div key={i} style={{ padding: 'clamp(16px,2.5vw,28px)', borderRight: i<2?'0.5px solid rgba(250,250,247,0.08)':undefined }}>
              <div style={{ fontSize: 'clamp(2rem,5vw,4rem)', fontWeight: 200, color: k.color, letterSpacing: '-0.05em', lineHeight: 1, marginBottom: 8 }}>{k.v}</div>
              <div style={{ fontSize: 9, color: C.stone, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{k.l}</div>
              <div style={{ fontSize: 9, color: 'rgba(250,250,247,0.25)', letterSpacing: '0.1em' }}>{k.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FILTROS */}
      <section style={{ background: C.paper2, padding: 'clamp(20px,3vw,28px) var(--pad)', borderBottom: `0.5px solid ${C.stone}25`, position: 'sticky', top: 108, zIndex: 50 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 9, color: C.stone, letterSpacing: '0.14em', textTransform: 'uppercase', marginRight: 4 }}>Actor</span>
            {ACTORES.map(a => <BtnFiltro key={a} label={a} active={actor===a} onClick={() => setActor(a)} />)}
          </div>
          <div style={{ width: '0.5px', height: 24, background: `${C.stone}40`, flexShrink: 0 }} />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 9, color: C.stone, letterSpacing: '0.14em', textTransform: 'uppercase', marginRight: 4 }}>Capa</span>
            {capas.map(cp => <BtnFiltro key={cp} label={cp} active={capa===cp} onClick={() => setCapa(cp)} />)}
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 'var(--fs-xs)', color: C.stone }}>{items.length} prescripciones</div>
        </div>
      </section>

      {/* LISTA PREMIUM */}
      <section style={{ background: C.paper }}>
        {items.map((p, i) => {
          const meta = CAPA_META[p.capa] || { color: C.stone, n: '--' }
          return (
            <div key={i} style={{
              padding: 'clamp(28px,4vw,48px) var(--pad)',
              borderBottom: `0.5px solid ${C.stone}25`,
              display: 'grid',
              gridTemplateColumns: 'clamp(32px,4vw,56px) 1fr',
              gap: 'clamp(20px,3vw,40px)',
            }}>
              {/* Número */}
              <div style={{ paddingTop: 4 }}>
                <span style={{ fontSize: 'clamp(1.4rem,3vw,2.2rem)', fontWeight: 200, color: `${C.stone}60`, letterSpacing: '-0.04em', lineHeight: 1 }}>
                  {String(items.indexOf(p)+1).padStart(2,'0')}
                </span>
              </div>

              {/* Contenido */}
              <div>
                {/* Capa + urgencia + actores */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: meta.color, background: C.ink, padding: '3px 10px' }}>
                    {p.capa}
                  </span>
                  <span style={{ fontSize: 9, color: C.stone, letterSpacing: '0.06em' }}>
                    {URG_LABEL[p.urgencia]} · {p.dias} días
                  </span>
                  <div style={{ display: 'flex', gap: 5, marginLeft: 'auto', flexWrap: 'wrap' }}>
                    {p.actores.map(a => (
                      <span key={a} style={{ fontSize: 9, color: C.slate, border: `0.5px solid ${C.stone}50`, padding: '2px 8px', letterSpacing: '0.06em' }}>{a}</span>
                    ))}
                  </div>
                </div>

                {/* Señal */}
                <h3 style={{ fontSize: 'clamp(1rem,1.6vw,1.25rem)', fontWeight: 500, color: C.ink, margin: '0 0 20px', lineHeight: 1.4 }}>
                  {p.señal}
                </h3>

                {/* Brecha + Prescripción */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(16px,2.5vw,32px)' }}>
                  <div style={{ paddingTop: 4 }}>
                    <div style={{ fontSize: 9, color: C.stone, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
                      Por qué importa
                    </div>
                    <p style={{ fontSize: 'var(--fs-sm)', color: C.slate, lineHeight: 1.7, margin: 0 }}>{p.brecha}</p>
                  </div>
                  <div style={{ borderLeft: `3px solid ${C.volt}`, paddingLeft: 'clamp(14px,2vw,24px)', paddingTop: 4 }}>
                    <div style={{ fontSize: 9, color: C.volt, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
                      Prescripción
                    </div>
                    <p style={{ fontSize: 'var(--fs-sm)', color: C.ink, lineHeight: 1.7, margin: 0, fontWeight: 400 }}>{p.prescripcion}</p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </section>

      {/* FOOTER */}
      <section style={{ background: C.ink, padding: 'clamp(40px,5vw,56px) var(--pad)' }}>
        <p style={{ fontSize: 'var(--fs-sm)', color: 'rgba(250,250,247,0.35)', maxWidth: 600, lineHeight: 1.75, margin: 0 }}>
          Las prescripciones se derivan de las señales activas del observatorio. Cada decisión requiere validación con el actor responsable antes de ejecutarse. El horizonte es orientativo — algunas acciones pueden adelantarse o dependen de condiciones externas.
        </p>
      </section>
    </>
  )
}
