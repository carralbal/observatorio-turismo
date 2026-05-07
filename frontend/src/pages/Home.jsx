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
        <Icon size={23} strokeWidth={1.4} style={{
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
      position: 'relative', minHeight: '42vh',
      padding: '48px var(--pad) 0', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
    }}>
      <video autoPlay loop muted playsInline style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0,
      }}>
        <source src="https://www.pexels.com/es-es/download/video/35840960/" type="video/mp4" />
      </video>
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to right, rgba(10,10,10,0.94) 0%, rgba(10,10,10,0.80) 30%, rgba(10,10,10,0.42) 58%, rgba(10,10,10,0.14) 100%)' }} />


      <div style={{ position: 'relative', zIndex: 3 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 44, animation: 'fadeUp 0.7s ease both' }}>
          <Paralelo />
          <Eyebrow light>Observatorio de Turismo · Santiago del Estero</Eyebrow>
        </div>
        <h1 style={{
          fontSize: 'clamp(3rem, 7.5vw, 7rem)', fontWeight: 200, color: C.paper,
          lineHeight: 0.92, letterSpacing: '-0.045em', margin: '0 0 28px', maxWidth: 780,
          animation: 'fadeUp 0.8s 0.08s ease both',
        }}>Pulso Santiago<br />del Estero.</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, margin: '0 0 72px' }}>
          <p style={{
            fontSize: 'clamp(0.85rem, 1.3vw, 1rem)', fontWeight: 300, color: C.paper, opacity: 0.62,
            maxWidth: 400, lineHeight: 1.72, margin: 0,
            animation: 'fadeUp 0.8s 0.22s ease both',
          }}>
            El sistema de indicadores turísticos de Santiago del Estero. Datos oficiales actualizados mensualmente.
          </p>
          <img src={ESCUDO} alt="Escudo Santiago del Estero" style={{
            height: 'clamp(48px,6.4vw,72px)', width: 'auto',
            objectFit: 'contain', flexShrink: 0,
            filter: 'brightness(0) invert(1)',
          }} />
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

// ─── BRECHA ──────────────────────────────────────────────────────────────────
function BrechaSection() {
  const plazas    = 13055
  const aereo2025 = 455
  const aereo2017 = 4045
  const cobertura = Math.round((aereo2025 / plazas) * 100)

  const items = [
    { label: 'Plazas hoteleras',      sub: 'PUNA 2024 · 7° lugar nacional · Termas de Río Hondo',  value: plazas,   pct: 100 },
    { label: 'Asientos aéreos 2025',  sub: 'Aerolíneas Argentinas · 2 vuelos/semana',               value: aereo2025, pct: Math.round((aereo2025 / plazas) * 100) },
    { label: 'Asientos aéreos 2017',  sub: 'pico histórico · antes del colapso',                    value: aereo2017, pct: Math.round((aereo2017 / plazas) * 100) },
  ]

  return (
    <section style={{ background: C.paper, padding: 'clamp(56px, 7vw, 88px) var(--pad)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <Paralelo />
        <Eyebrow>Paradoja estructural</Eyebrow>
      </div>
      <SectionTitle>Capacidad sin<br />conectividad.</SectionTitle>
      <p style={{ fontSize: '1rem', color: C.slate, maxWidth: 560, margin: '0 0 52px', lineHeight: 1.7 }}>
        Termas de Río Hondo tiene <strong style={{ color: C.ink }}>13.055 plazas hoteleras</strong> — el 7° stock más grande del país.
        Pero la conectividad aérea semanal alcanza apenas <strong style={{ color: C.ink }}>{aereo2025} asientos</strong>: el {cobertura}% de su capacidad.
        En 2017 eran 4.045 asientos semanales. Una decisión política en 2019
        recortó el 89% de esa conectividad — y nunca se recuperó.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 640 }}>
        {items.map((item, i) => (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <div>
                <span style={{ fontSize: 15, fontWeight: 600, color: C.ink, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</span>
                <span style={{ fontSize: 13, color: C.slate, marginLeft: 12 }}>{item.sub}</span>
              </div>
              <span style={{ fontSize: 'clamp(1.2rem, 2vw, 1.6rem)', fontWeight: 200, color: C.ink, letterSpacing: '-0.03em' }}>{fmt(item.value)}</span>
            </div>
            <div style={{ height: 5, background: C.paper2 }}>
              <div style={{ height: '100%', width: `${item.pct}%`, background: i === 0 ? C.slate : C.volt }} />
            </div>
            <div style={{ fontSize: 13, color: C.slate, marginTop: 6 }}>{item.pct}% de la capacidad hotelera</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 52, paddingTop: 32, borderTop: `0.5px solid ${C.stone}40`, display: 'flex', alignItems: 'baseline', gap: 20 }}>
        <span style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', fontWeight: 200, color: C.ink, letterSpacing: '-0.05em', lineHeight: 1 }}>−89%</span>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.ink, textTransform: 'uppercase', letterSpacing: '0.06em' }}>caída de conectividad aérea 2017→2025</div>
          <div style={{ fontSize: 12, color: C.slate, marginTop: 4 }}>de 4.045 a {fmt(aereo2025)} asientos semanales · {cobertura}% de cobertura actual</div>
        </div>
      </div>

      <Interpretacion>
        Con 13.055 plazas, Termas es el centro termal más grande de Sudamérica en oferta hotelera.
        Pero solo 2 vuelos semanales desde Buenos Aires limitan estructuralmente la demanda lejana.
        Recuperar el nivel de conectividad de 2017 implicaría multiplicar por 9 el flujo aéreo
        actual — y con ello, la ocupación, la estadía media y la captura de valor del destino.
      </Interpretacion>
    </section>
  )
}

// ─── CTA ─────────────────────────────────────────────────────────────────────
function CTAVolt() {
  return (
    <section style={{ background: C.volt, padding: 'clamp(52px, 8vw, 96px) var(--pad)', textAlign: 'center' }}>
      <h2 style={{ fontSize: 'clamp(1rem, 2.7vw, 2.4rem)', fontWeight: 100, color: C.ink, letterSpacing: '-0.04em', lineHeight: 0.92, textTransform: 'uppercase', margin: '0 0 16px' }}>
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
      <BrechaSection />
      <CTAVolt />
    </>
  )
}
