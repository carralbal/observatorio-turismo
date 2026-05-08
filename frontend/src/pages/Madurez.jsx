import { C, Paralelo, VoltLine, Eyebrow, SectionTitle, Interpretacion, ICONS } from '../components/Atoms'
import { CheckCircle, Circle, Clock } from 'lucide-react'

const VIDEO_URL = 'https://www.pexels.com/es-es/download/video/36262413/'

const NIVELES = [
  {
    num: 'N1',
    titulo: 'Datos básicos conectados',
    descripcion: 'El observatorio tiene acceso a fuentes oficiales clave y las publica con actualización regular.',
    dimensiones: [
      { label: 'Pasajeros aéreos (ANAC)',            estado: 'activo',   nota: 'hasta mar 2026' },
      { label: 'Pasajeros terrestres (CNRT)',         estado: 'activo',   nota: 'hasta 2024 anual' },
      { label: 'Viajeros hoteleros (EOH/estimado)',   estado: 'activo',   nota: 'EOH hasta nov 2025 · OLS hasta abr 2026' },
      { label: 'Tablero público de datos',            estado: 'activo',   nota: 'observatorio-sde.vercel.app' },
      { label: 'Actualización mensual automatizada',  estado: 'activo',   nota: 'cron 3am + Vercel deploy' },
      { label: 'Empleo registrado HyG (SIPA)',        estado: 'activo',   nota: 'hasta Q3 2025' },
    ],
  },
  {
    num: 'N2',
    titulo: 'Sistema integrado con fuente fiscal',
    descripcion: 'El observatorio incorpora datos fiscales propios que permiten estimar actividad económica del sector sin depender de encuestas nacionales.',
    dimensiones: [
      { label: 'IIBB SDE sector HyG (DGR)',          estado: 'pendiente', nota: 'requiere convenio DGR — documento N2 en elaboración' },
      { label: 'Empleo desagregado OEDE',             estado: 'pendiente', nota: 'pendiente gestión de acceso' },
      { label: 'Encuesta directa viajeros (terminal)',estado: 'pendiente', nota: 'diseño de formulario pendiente' },
      { label: 'Ciclo institucional formalizado',     estado: 'pendiente', nota: 'requiere acto administrativo provincial' },
      { label: 'Acuerdo directo con hoteleros',       estado: 'pendiente', nota: 'N2.5 — 8-10 hoteles ancla Termas' },
    ],
  },
  {
    num: 'N3',
    titulo: 'Anticipación y optimización',
    descripcion: 'El observatorio no solo describe — anticipa, modela y genera valor estratégico para la toma de decisiones.',
    dimensiones: [
      { label: 'Señales anticipadas IBT (Google Trends)', estado: 'activo',  nota: 'hasta may 2026' },
      { label: 'Medición de impacto de eventos (DiD)',    estado: 'activo',  nota: 'MotoGP 2014-2025' },
      { label: 'Modelo estimado OLS post-EOH',            estado: 'activo',  nota: 'hasta abr 2026 · R²=0.868' },
      { label: 'Alquiler temporario (AirROI)',            estado: 'activo',  nota: 'hasta abr 2026' },
      { label: 'Benchmark interprovincial ISTP',          estado: 'activo',  nota: 'TFM D. Carralbal · 24 provincias' },
      { label: 'Imagen destino (YouTube)',                estado: 'activo',  nota: '521 videos · may 2026' },
      { label: 'Modelo predictivo avanzado (ML)',         estado: 'futuro',  nota: 'requiere N2 fiscal + encuesta directa' },
      { label: 'API pública de datos',                    estado: 'futuro',  nota: 'pendiente MotherDuck cloud' },
    ],
  },
]

const STATUS = {
  activo:   { icon: CheckCircle, color: C.volt,  label: 'Activo'   },
  pendiente:{ icon: Clock,       color: C.stone, label: 'Pendiente'},
  futuro:   { icon: Circle,      color: 'rgba(200,200,191,0.35)', label: 'Futuro' },
}

function DimRow({ label, estado, nota, dark = true }) {
  const s = STATUS[estado]
  const Icon = s.icon
  const textColor = estado === 'activo' ? (dark ? C.paper : C.ink) : (dark ? 'rgba(250,250,247,0.45)' : C.slate)
  const borderColor = dark ? 'rgba(250,250,247,0.06)' : `${C.stone}40`
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: `0.5px solid ${borderColor}` }}>
      <Icon size={15} strokeWidth={1.5} style={{ color: s.color, flexShrink: 0, marginTop: 2 }} />
      <div style={{ flex: 1 }}>
        <span style={{ fontSize: 'var(--fs-base)', color: textColor, fontWeight: estado === 'activo' ? 400 : 300 }}>{label}</span>
        {nota && <div style={{ fontSize: 'var(--fs-xs)', color: dark ? C.stone : C.slate, opacity: 0.7, marginTop: 2 }}>{nota}</div>}
      </div>
      <span style={{ fontSize: 'var(--fs-2xs)', color: s.color, letterSpacing: '0.1em', textTransform: 'uppercase', flexShrink: 0 }}>{s.label}</span>
    </div>
  )
}

export default function Madurez() {
  const activos    = NIVELES.flatMap(n => n.dimensiones).filter(d => d.estado === 'activo').length
  const total      = NIVELES.flatMap(n => n.dimensiones).length
  const n1Completo = NIVELES[0].dimensiones.every(d => d.estado === 'activo')
  const n2Activos  = NIVELES[1].dimensiones.filter(d => d.estado === 'activo').length
  const n3Activos  = NIVELES[2].dimensiones.filter(d => d.estado === 'activo').length

  return (
    <>
      <section style={{ position: 'relative', minHeight: '42vh', overflow: 'hidden', padding: 'clamp(64px,8vw,96px) var(--pad) clamp(48px,6vw,72px)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <video autoPlay loop muted playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}>
          <source src={VIDEO_URL} type="video/mp4" />
        </video>
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to right, rgba(10,10,10,0.93) 0%, rgba(10,10,10,0.78) 35%, rgba(10,10,10,0.38) 65%, rgba(10,10,10,0.10) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 3 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <Paralelo /><Eyebrow light>Observatorio · Capa 4 · Decisión</Eyebrow>
          </div>
          <h1 style={{ fontSize: 'clamp(2.4rem,5vw,5rem)', fontWeight: 200, color: C.paper, letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 16px' }}>Madurez<br />del Observatorio.</h1>
          <p style={{ fontSize: '0.9rem', fontWeight: 300, color: C.paper, opacity: 0.6, maxWidth: 480, lineHeight: 1.65, margin: 0 }}>Capacidades instaladas y hoja de ruta del Observatorio de Turismo de Santiago del Estero. Tres niveles: datos básicos → sistema integrado → anticipación.</p>
        </div>
      </section>

      {/* KPIs */}
      <section style={{ background: C.paper, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <Eyebrow style={{ marginBottom: 52 }}>Estado actual del observatorio</Eyebrow>
        <div className="grid-kpi">
          {[
            { v: `${activos} / ${total}`, l: 'Capacidades activas',   d: 'dimensiones operativas hoy' },
            { v: n1Completo ? '✓ N1' : 'N1 parcial', l: 'Datos básicos conectados', d: n1Completo ? 'nivel completo' : 'en progreso' },
            { v: `${n2Activos} / ${NIVELES[1].dimensiones.length}`, l: 'Sistema integrado (N2)', d: 'pendiente convenio DGR y encuesta' },
            { v: `${n3Activos} / ${NIVELES[2].dimensiones.length}`, l: 'Anticipación activa (N3)', d: 'IBT, OLS, DiD, AirROI, ISTP' },
          ].map((kv, i) => (
            <div key={i} style={{ borderLeft: '1px solid '+C.stone, paddingLeft: 'clamp(14px,2vw,24px)' }}>
              <div style={{ fontSize: 'clamp(1.4rem,2.5vw,2.8rem)', fontWeight: 200, color: C.ink, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 10 }}>{kv.v}</div>
              <VoltLine w={20} />
              <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 400, color: C.ink, marginTop: 10, marginBottom: 4 }}>{kv.l}</div>
              <div style={{ fontSize: 'var(--fs-xs)', color: C.slate, opacity: 0.65 }}>{kv.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* EXPLICACIÓN ISTP */}
      <section style={{ background: C.paper2, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <SectionTitle main="Cómo se calcula el ISTP." context="Índice de Salud Turística Provincial · metodología" style={{ marginBottom: 48 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,420px),1fr))', gap: 40, marginBottom: 48 }}>
          <div>
            <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: C.ink, marginBottom: 16, letterSpacing: '0.02em' }}>¿Qué mide?</div>
            <p style={{ fontSize: 'var(--fs-sm)', color: C.slate, lineHeight: 1.75, margin: '0 0 16px' }}>
              El ISTP evalúa la capacidad institucional de cada provincia para medir, analizar y anticipar su actividad turística. No mide cuántos turistas recibe sino qué tan bien está equipada para conocer esa realidad y tomar decisiones basadas en datos.
            </p>
            <p style={{ fontSize: 'var(--fs-sm)', color: C.slate, lineHeight: 1.75, margin: 0 }}>
              Fue desarrollado en el TFM de Diego Carralbal (2025) y aplicado a 24 provincias argentinas. El ranking posiciona a SDE 4° a nivel nacional, por encima de la mayoría de las provincias del NOA.
            </p>
          </div>
          <div>
            <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: C.ink, marginBottom: 16, letterSpacing: '0.02em' }}>Fórmula</div>
            <div style={{ background: C.paper, padding: 'clamp(16px,2vw,24px)', borderLeft: `2px solid ${C.volt}`, marginBottom: 16 }}>
              <div style={{ fontSize: 'var(--fs-xs)', color: C.slate, lineHeight: 2 }}>
                <span style={{ fontWeight: 600, color: C.ink }}>Score bruto</span> = Σ (indicador × peso)<br />
                <span style={{ color: C.stone }}>máximo = 6.0 puntos</span><br /><br />
                <span style={{ fontWeight: 600, color: C.ink }}>Score madurez</span> = normalización 0–5<br />
                <span style={{ color: C.stone }}>determina nivel 1 a 5</span>
              </div>
            </div>
            <div style={{ fontSize: 'var(--fs-xs)', color: C.slate, lineHeight: 1.6 }}>
              SDE: score bruto <strong style={{ color: C.ink }}>4.0 / 6.0</strong> · score madurez <strong style={{ color: C.ink }}>3.7</strong> · Nivel 4 · Ranking <strong style={{ color: C.ink }}>4° nacional</strong>
            </div>
          </div>
        </div>

        {/* Tabla de dimensiones con pesos */}
        <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: C.ink, marginBottom: 20, letterSpacing: '0.02em' }}>Las 9 dimensiones del índice</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,280px),1fr))', gap: 1 }}>
          {[
            { dim: 'Viajeros hoteleros (EOH)', peso: 1.0, sde: true,  nota: 'fuente primaria de demanda' },
            { dim: 'N2 fiscal (IIBB HyG)',     peso: 1.0, sde: false, nota: 'autonomía de fuente fiscal' },
            { dim: 'Medición de eventos (DiD)', peso: 1.0, sde: true,  nota: 'capacidad analítica avanzada' },
            { dim: 'Pasajeros aéreos (ANAC)',   peso: 0.5, sde: true,  nota: 'conectividad y acceso' },
            { dim: 'Empleo desagregado (OEDE)', peso: 0.5, sde: false, nota: 'mercado laboral sectorial' },
            { dim: 'Tablero público de datos',  peso: 0.5, sde: true,  nota: 'transparencia y acceso' },
            { dim: 'Actualización mensual',     peso: 0.5, sde: true,  nota: 'regularidad operativa' },
            { dim: 'Señales anticipadas (IBT)', peso: 0.5, sde: true,  nota: 'anticipación de demanda' },
            { dim: 'Ciclo institucional formal',peso: 0.5, sde: false, nota: 'acto administrativo provincial' },
          ].map((d, i) => (
            <div key={i} style={{ background: C.paper, padding: 'clamp(14px,2vw,20px)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.sde ? C.volt : C.stone, flexShrink: 0, marginTop: 5, opacity: d.sde ? 1 : 0.5 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 'var(--fs-sm)', color: d.sde ? C.ink : C.slate, fontWeight: d.sde ? 500 : 400, marginBottom: 3 }}>{d.dim}</div>
                <div style={{ fontSize: 'var(--fs-xs)', color: C.slate, opacity: 0.65 }}>{d.nota}</div>
              </div>
              <div style={{ flexShrink: 0, textAlign: 'right' }}>
                <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: d.peso === 1 ? C.ink : C.slate }}>{d.peso.toFixed(1)}</div>
                <div style={{ fontSize: 9, color: C.stone, letterSpacing: '0.08em', textTransform: 'uppercase' }}>pts</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 20, marginTop: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: C.volt }} /><span style={{ fontSize: 10, color: C.slate, letterSpacing: '0.1em', textTransform: 'uppercase' }}>SDE activo</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: C.stone, opacity: 0.5 }} /><span style={{ fontSize: 10, color: C.slate, letterSpacing: '0.1em', textTransform: 'uppercase' }}>SDE pendiente</span></div>
        </div>
      </section>

      {/* NIVELES */}
      {NIVELES.map((nivel, ni) => (
        <section key={nivel.num} style={{ background: ni % 2 === 0 ? C.ink : C.paper, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, marginBottom: 40, flexWrap: 'wrap' }}>
            <div style={{ flexShrink: 0 }}>
              <span style={{ fontSize: 'clamp(2.5rem,4vw,4rem)', fontWeight: 200, color: ni % 2 === 0 ? C.volt : C.ink, letterSpacing: '-0.05em', lineHeight: 1 }}>{nivel.num}</span>
            </div>
            <div>
              <div style={{ fontSize: 'clamp(1rem,1.8vw,1.4rem)', fontWeight: 500, color: ni % 2 === 0 ? C.paper : C.ink, marginBottom: 8 }}>{nivel.titulo}</div>
              <div style={{ fontSize: 'var(--fs-base)', color: ni % 2 === 0 ? 'rgba(250,250,247,0.55)' : C.slate, maxWidth: 560, lineHeight: 1.65 }}>{nivel.descripcion}</div>
            </div>
          </div>
          <div style={{ maxWidth: 640 }}>
            {nivel.dimensiones.map((dim, di) => <DimRow key={di} {...dim} dark={ni % 2 === 0} />)}
          </div>
        </section>
      ))}

      <section style={{ background: C.paper, padding: 'clamp(40px,5vw,64px) var(--pad)' }}>
        <Interpretacion>
          El Observatorio de Turismo SDE tiene N1 completamente operativo y avanza en N3
          con señales anticipadas, modelo OLS y benchmark ISTP. El cuello de botella para
          escalar a N2 es el convenio con la DGR provincial para acceder a datos de IIBB
          del sector HyG — la única fuente que permitiría medir actividad económica real
          sin depender de encuestas nacionales discontinuadas. Cerrar N2 desbloquea la
          posibilidad de un modelo predictivo de alta precisión (±15%) y posiciona al
          observatorio como referencia nacional en sistemas de información turística provincial.
        </Interpretacion>
      </section>
    </>
  )
}
