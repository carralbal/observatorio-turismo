import { useState, useEffect, useRef } from 'react'
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useCSV, fmt } from '../hooks/useCSV'
import { usePeriodo, filterByPeriodo, periodoLabel } from '../context/PeriodoContext'
import {
  C, Paralelo, VoltLine, Eyebrow, SectionTitle, Interpretacion, Loading,
  ICONS,
} from '../components/Atoms'
import { MapPin } from 'lucide-react'

const ESCUDO = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Escudo_de_la_Provincia_de_Santiago_del_Estero.svg/250px-Escudo_de_la_Provincia_de_Santiago_del_Estero.svg.png'

// ─── TOOLTIP ─────────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#111', border: `1px solid rgba(250,250,247,0.1)`, padding: '10px 14px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      <Eyebrow light style={{ marginBottom: 8 }}>{payload[0]?.payload.label}</Eyebrow>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 3 }}>
          <div style={{ width: 8, height: 2, background: p.color }} />
          <span style={{ fontSize: 12, color: C.paper, fontWeight: 300 }}>{p.name}: {fmt(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

// ─── KPI CARD CON ÍCONO ───────────────────────────────────────────────────────
function KPICardHome({ icon: Icon, value, label, delta, light = false, volt = false }) {
  return (
    <div style={{ borderLeft: `1px solid ${light ? 'rgba(250,250,247,0.15)' : C.stone}`, paddingLeft: 'clamp(14px, 2vw, 24px)' }}>
      {Icon && (
        <Icon size={18} strokeWidth={1.5} style={{
          color: volt ? C.volt : (light ? C.paper : C.slate),
          opacity: 0.6, marginBottom: 12, display: 'block',
        }} />
      )}
      <div style={{
        fontSize: 'clamp(1.7rem, 3vw, 3.2rem)', fontWeight: 200,
        color: volt ? C.volt : (light ? C.paper : C.ink),
        letterSpacing: '-0.045em', lineHeight: 1, marginBottom: 10,
      }}>{value}</div>
      <VoltLine w={20} />
      <div style={{ fontSize: 12.5, fontWeight: 400, color: light ? C.paper : C.ink, marginTop: 10, marginBottom: 4, lineHeight: 1.3 }}>{label}</div>
      {delta && <div style={{ fontSize: 11, fontWeight: 400, color: light ? C.stone : C.slate, opacity: 0.65 }}>{delta}</div>}
    </div>
  )
}

// ─── HERO ────────────────────────────────────────────────────────────────────
function Hero({ termasLast, capitalLast, periodoStr }) {
  return (
    <section className="grain" style={{
      position: 'relative', minHeight: '100vh',
      padding: '48px var(--pad) 0', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
    }}>
      <video autoPlay loop muted playsInline style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0,
      }}>
        <source src="https://www.pexels.com/es-es/download/video/13277310/" type="video/mp4" />
      </video>
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to right, rgba(10,10,10,0.94) 0%, rgba(10,10,10,0.80) 30%, rgba(10,10,10,0.42) 58%, rgba(10,10,10,0.14) 100%)' }} />
      <img src={ESCUDO} alt="" aria-hidden="true" style={{
        position: 'absolute', right: 'clamp(32px, 8vw, 96px)', top: '50%',
        transform: 'translateY(-50%)',
        height: 'clamp(160px, 26vw, 320px)',
        filter: 'grayscale(1) brightness(8) contrast(0.25)',
        opacity: 0.07, zIndex: 2,
        userSelect: 'none', pointerEvents: 'none', objectFit: 'contain',
      }} />

      <div style={{ position: 'relative', zIndex: 3 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 44, animation: 'fadeUp 0.7s ease both' }}>
          <Paralelo />
          <Eyebrow light>Observatorio de Turismo · Santiago del Estero</Eyebrow>
        </div>
        <h1 style={{
          fontSize: 'clamp(3rem, 7.5vw, 7rem)', fontWeight: 200, color: C.paper,
          lineHeight: 0.92, letterSpacing: '-0.045em', margin: '0 0 28px', maxWidth: 780,
          animation: 'fadeUp 0.8s 0.08s ease both',
        }}>Termas<br />y Capital.</h1>
        <div style={{ width: 44, height: 2, background: C.volt, marginBottom: 24, animation: 'slideRight 0.8s 0.18s ease both', transformOrigin: 'left' }} />
        <p style={{
          fontSize: 'clamp(0.85rem, 1.3vw, 1rem)', fontWeight: 300, color: C.paper, opacity: 0.62,
          maxWidth: 400, lineHeight: 1.72, margin: '0 0 72px',
          animation: 'fadeUp 0.8s 0.22s ease both',
        }}>
          El sistema de indicadores turísticos de Santiago del Estero. Datos oficiales actualizados mensualmente.
        </p>
        <div style={{
          borderTop: `0.5px solid rgba(250,250,247,0.12)`,
          paddingTop: 26, paddingBottom: 40,
          display: 'flex', gap: 48, flexWrap: 'wrap', alignItems: 'flex-end',
          animation: 'fadeUp 0.8s 0.3s ease both',
        }}>
          {[
            { v: termasLast ? fmt(termasLast.viajeros_total) : '—', l: 'viajeros · Termas' },
            { v: capitalLast ? fmt(capitalLast.viajeros_total) : '—', l: 'viajeros · Capital' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <span style={{ fontSize: 'clamp(1.3rem, 2vw, 1.8rem)', fontWeight: 200, color: C.paper, letterSpacing: '-0.04em', lineHeight: 1 }}>{s.v}</span>
              <Eyebrow light style={{ opacity: 0.45 }}>{s.l}</Eyebrow>
            </div>
          ))}
          <div style={{ marginLeft: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <MapPin size={11} style={{ color: C.volt, opacity: 0.8 }} />
              <Eyebrow light style={{ opacity: 0.5, fontSize: 9.5 }}>{periodoStr}</Eyebrow>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── KPI STRIP ───────────────────────────────────────────────────────────────
function KPIStrip({ termasLast, capitalLast, periodoStr }) {
  if (!termasLast) return null
  const kpis = [
    { icon: ICONS.viajeros,       value: fmt(termasLast.viajeros_total),             label: 'Viajeros · Termas',     delta: periodoStr },
    { icon: ICONS.viajeros,       value: fmt(capitalLast?.viajeros_total ?? 0),      label: 'Viajeros · Capital',    delta: periodoStr },
    { icon: ICONS.estadia,        value: `${termasLast.estadia_promedio?.toFixed(2) ?? '—'}n`, label: 'Estadía media', delta: 'Termas de Río Hondo' },
    { icon: ICONS.ibt,            value: `${termasLast.ibt_compuesto ?? '—'}/100`,  label: 'IBT · Señal digital',   delta: 'índice de búsqueda' },
  ]
  return (
    <section style={{ background: C.paper, padding: 'clamp(56px, 7vw, 88px) var(--pad)' }}>
      <Eyebrow style={{ marginBottom: 56 }}>Indicadores · {periodoStr}</Eyebrow>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0 clamp(14px, 4vw, 56px)' }}>
        {kpis.map((k, i) => <KPICardHome key={i} {...k} />)}
      </div>
      <Interpretacion texto={
        `En ${periodoStr}, Termas de Río Hondo registró ${fmt(termasLast.viajeros_total)} viajeros con una estadía media de ${termasLast.estadia_promedio?.toFixed(2)} noches. ` +
        `La Capital sumó ${fmt(capitalLast?.viajeros_total ?? 0)} viajeros. ` +
        `La señal de búsqueda digital (IBT) se ubica en ${termasLast.ibt_compuesto}/100 — ` +
        `${termasLast.ibt_compuesto < 25 ? 'zona baja, por debajo del umbral de señal activa (40/100).' : termasLast.ibt_compuesto > 40 ? 'zona alta, señal activa de demanda.' : 'zona media, señal moderada.'}`
      } />
    </section>
  )
}

// ─── CHART ───────────────────────────────────────────────────────────────────
function ChartSection({ trend, termasLast, capitalLast }) {
  const maxTermas = trend.reduce((m, r) => Math.max(m, r.termas ?? 0), 0)
  const maxMes    = trend.find(r => r.termas === maxTermas)

  const interp = termasLast && capitalLast
    ? `Termas supera sistemáticamente a la Capital en volumen de viajeros hospedados. El pico histórico de la serie es de ${fmt(maxTermas)} viajeros, registrado en ${maxMes?.label ?? '—'}. La curva muestra marcada estacionalidad, con temporada alta en verano y julio.`
    : 'Cargando interpretación...'

  return (
    <section style={{ background: C.ink, padding: 'clamp(56px, 7vw, 80px) var(--pad)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 48, flexWrap: 'wrap', gap: 24 }}>
        <SectionTitle
          icon={ICONS.viajeros}
          context="Termas vs. Capital · serie histórica"
          main="Viajeros hospedados"
          light
        />
        <div style={{ display: 'flex', gap: 20, paddingTop: 4 }}>
          {[{ c: C.paper, l: 'Termas' }, { c: C.stone, l: 'Capital', dash: true }].map((x, i) => (
            <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
              <div style={{ width: 16, height: 1.5, background: x.c, opacity: x.dash ? 0.5 : 1 }} />
              <Eyebrow light style={{ opacity: 0.42, letterSpacing: '0.12em' }}>{x.l}</Eyebrow>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: 'clamp(200px, 26vw, 320px)' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trend} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gT" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.paper} stopOpacity={0.12} />
                <stop offset="100%" stopColor={C.paper} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.stone} stopOpacity={0.08} />
                <stop offset="100%" stopColor={C.stone} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" tick={{ fill: C.stone, fontSize: 10, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} interval={5} />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(250,250,247,0.07)', strokeWidth: 1 }} />
            <Area type="monotone" dataKey="termas" name="Termas" stroke={C.paper} strokeWidth={2} fill="url(#gT)" dot={false} activeDot={{ r: 3, fill: C.volt, strokeWidth: 0 }} />
            <Area type="monotone" dataKey="capital" name="Capital" stroke={C.stone} strokeWidth={1.5} strokeDasharray="5 4" strokeOpacity={0.5} fill="url(#gC)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <Interpretacion texto={interp} light />
    </section>
  )
}

// ─── DONUT ───────────────────────────────────────────────────────────────────
function DonutSection({ termasLast }) {
  const [progress, setProgress] = useState(0)
  const ibt = termasLast?.ibt_compuesto ?? 0
  const r = 72, cx = 90, cy = 90
  const circ = 2 * Math.PI * r

  useEffect(() => {
    const t = setTimeout(() => setProgress(ibt), 400)
    return () => clearTimeout(t)
  }, [ibt])

  const filled = (progress / 100) * circ
  const señal = ibt < 25 ? 'baja' : ibt > 40 ? 'alta' : 'media'

  return (
    <section style={{
      background: C.paper, padding: 'clamp(56px, 7vw, 88px) var(--pad)',
      display: 'grid', gridTemplateColumns: 'minmax(150px, 200px) 1fr',
      gap: 'clamp(36px, 5vw, 88px)', alignItems: 'center',
    }}>
      {/* Donut con número perfectamente centrado */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 16 }}>
        <svg viewBox="0 0 180 180" width="100%" style={{ maxWidth: 190 }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.stone} strokeWidth={5} />
          <circle
            className="donut-fill"
            cx={cx} cy={cy} r={r}
            fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round"
            strokeDasharray={`${filled} ${circ - filled}`}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
          {/* Grupo centrado verticalmente: número + /100 */}
          <g transform={`translate(${cx}, ${cy})`}>
            <text
              textAnchor="middle" dominantBaseline="middle"
              y="-12"
              fill={C.ink} fontSize={38} fontWeight={200}
              fontFamily="Plus Jakarta Sans" letterSpacing="-1.5"
            >{ibt}</text>
            <text
              textAnchor="middle" dominantBaseline="middle"
              y="16"
              fill={C.slate} fontSize={12} fontWeight={400}
              fontFamily="Plus Jakarta Sans"
            >/100</text>
          </g>
        </svg>
        <div>
          <VoltLine w={18} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <ICONS.ibt size={12} style={{ color: C.slate, opacity: 0.65 }} />
            <Eyebrow style={{ fontSize: 9.5 }}>IBT · Señal {señal}</Eyebrow>
          </div>
        </div>
      </div>

      <div>
        <SectionTitle
          icon={ICONS.ibt}
          context="Google Trends · señal anticipada"
          main={señal === 'baja' ? 'Demanda digital en zona baja.' : señal === 'alta' ? 'Demanda digital en zona alta.' : 'Demanda digital en zona media.'}
        />
        <Interpretacion texto={
          `El Índice de Búsqueda Turística (IBT) mide el interés de búsqueda online por alojamiento en Termas de Río Hondo. ` +
          `En este período se ubica en ${ibt}/100, ${señal === 'baja' ? 'por debajo del umbral de señal activa (40/100). Anticipa una demanda moderada para el período próximo.' : señal === 'alta' ? 'por encima del umbral de señal activa (40/100). Anticipa alta demanda para el período próximo.' : 'en zona media. Señal moderada para el período próximo.'}`
        } />
      </div>
    </section>
  )
}

// ─── DARK METRICS ────────────────────────────────────────────────────────────
function DarkMetrics({ termasLast, capitalLast, periodoStr }) {
  if (!termasLast) return null
  const metrics = [
    { icon: ICONS.ibt,       value: `${termasLast.ibt_compuesto ?? '—'}/100`,           label: 'IBT',             desc: 'señal digital Google Trends' },
    { icon: ICONS.estadia,   value: `${termasLast.estadia_promedio?.toFixed(1) ?? '—'}n`, label: 'Estadía media',   desc: 'noches · Termas' },
    { icon: ICONS.viajeros,  value: fmt(termasLast.viajeros_total),                      label: 'Viajeros',        desc: 'Termas de Río Hondo' },
    { icon: ICONS.viajeros,  value: fmt(capitalLast?.viajeros_total ?? 0),               label: 'Viajeros',        desc: 'Capital · Santiago del Estero' },
  ]

  return (
    <section style={{ background: C.ink, padding: 'clamp(56px, 7vw, 80px) var(--pad)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 52 }}>
        <Paralelo />
        <Eyebrow light>Resumen · {periodoStr}</Eyebrow>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0 clamp(12px, 3vw, 44px)' }}>
        {metrics.map((m, i) => (
          <div key={i} style={{ borderTop: `0.5px solid rgba(250,250,247,0.1)`, paddingTop: 24 }}>
            {/* Ícono grande y visible */}
            <m.icon size={24} strokeWidth={1.5} style={{ color: C.volt, opacity: 0.8, marginBottom: 14, display: 'block' }} />
            <div style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.8rem)', fontWeight: 200, color: C.volt, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 10 }}>{m.value}</div>
            <div style={{ width: 14, height: 1, background: C.volt, opacity: 0.4, marginBottom: 10 }} />
            <div style={{ fontSize: 12, fontWeight: 400, color: C.paper, opacity: 0.8, lineHeight: 1.4 }}>
              {m.label}<br />
              <span style={{ opacity: 0.55, fontSize: 11, fontWeight: 300 }}>{m.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── CTA ─────────────────────────────────────────────────────────────────────
function CTAVolt() {
  return (
    <section style={{ background: C.volt, padding: 'clamp(52px, 8vw, 96px) var(--pad)', textAlign: 'center' }}>
      <h2 style={{ fontSize: 'clamp(1.7rem, 4.5vw, 4rem)', fontWeight: 800, color: C.ink, letterSpacing: '-0.04em', lineHeight: 0.92, textTransform: 'uppercase', margin: '0 0 16px' }}>
        Explorá<br />las dimensiones.
      </h2>
      <p style={{ fontSize: '0.88rem', fontWeight: 400, color: C.ink, opacity: 0.7, maxWidth: 340, margin: '0 auto', lineHeight: 1.65 }}>
        14 indicadores · datos oficiales al cierre del período seleccionado.
      </p>
    </section>
  )
}

// ─── PAGE ────────────────────────────────────────────────────────────────────
export default function Home() {
  const { anio, mes, MESES } = usePeriodo()
  const { data: pulso, loading } = useCSV('/data/data_pulso.csv', { filter: r => r.flag_covid === 0 })
  const { data: empleo } = useCSV('/data/data_empleo_hyg.csv')

  const termas  = pulso.filter(r => r.localidad === 'Termas').sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
  const capital = pulso.filter(r => r.localidad === 'Santiago del Estero').sort((a, b) => new Date(a.fecha) - new Date(b.fecha))

  // Si hay período seleccionado, filtrar; si no, usar último disponible
  const termasFilt  = (anio || mes) ? filterByPeriodo(termas, anio, mes) : termas
  const capitalFilt = (anio || mes) ? filterByPeriodo(capital, anio, mes) : capital

  const termasLast  = termasFilt[termasFilt.length - 1]
  const capitalLast = capitalFilt[capitalFilt.length - 1]

  const fechaUltimo = termasLast?.fecha
    ? new Date(termasLast.fecha).toLocaleDateString('es-AR', { month: 'short', year: 'numeric' })
    : '—'
  const periodoStr = (anio || mes)
    ? fechaUltimo
    : `Último disponible · ${fechaUltimo}`

  const trendAll = termas.map(t => {
    const d = new Date(t.fecha)
    const cap = capital.find(c => c.fecha === t.fecha)
    return {
      label: t.fecha ? d.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' }) : '',
      year: d.getFullYear(),
      termas: t.viajeros_total,
      capital: cap?.viajeros_total ?? null,
    }
  })
  // Chart: filtra por año seleccionado; si TODO → serie completa
  const trend = anio ? trendAll.filter(t => t.year === anio) : trendAll

  if (loading) return <Loading />

  return (
    <>
      <Hero termasLast={termasLast} capitalLast={capitalLast} periodoStr={periodoStr} />
      <KPIStrip termasLast={termasLast} capitalLast={capitalLast} periodoStr={periodoStr} />
      <ChartSection trend={trend} termasLast={termasLast} capitalLast={capitalLast} />
      <DonutSection termasLast={termasLast} />
      <DarkMetrics termasLast={termasLast} capitalLast={capitalLast} periodoStr={periodoStr} />
      <CTAVolt />
    </>
  )
}
