import { useMemo } from 'react'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { useCSV, fmt } from '../hooks/useCSV'
import { usePeriodo } from '../context/PeriodoContext'
import {
  C, Paralelo, VoltLine, Eyebrow, SectionTitle,
  Interpretacion, Loading, ICONS,
} from '../components/Atoms'

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const isSDE = r =>
  r.destino_provincia === 'Santiago del Estero' ||
  r.origen_provincia  === 'Santiago del Estero'

function agruparPorFecha(rows) {
  const m = {}
  rows.forEach(r => {
    const k = r.fecha
    if (!m[k]) m[k] = { fecha: k, anio: r.anio, mes: r.mes, pasajeros: 0, asientos: 0, vuelos: 0, cab: 0, intl: 0 }
    m[k].pasajeros += r.pasajeros || 0
    m[k].asientos  += r.asientos  || 0
    m[k].vuelos    += r.vuelos    || 0
    if (r.flag_cabotaje     === 1) m[k].cab  += r.pasajeros || 0
    if (r.flag_internacional === 1) m[k].intl += r.pasajeros || 0
  })
  return Object.values(m)
    .map(x => ({
      ...x,
      load_factor: x.asientos > 0 ? Math.round((x.pasajeros / x.asientos) * 100) : 0,
      label: new Date(x.fecha).toLocaleDateString('es-AR', { month: 'short', year: '2-digit' }),
    }))
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
}

function agruparPorAerolinea(rows) {
  const m = {}
  rows.forEach(r => {
    const k = r.aerolinea || 'Sin datos'
    if (!m[k]) m[k] = { aerolinea: k, pasajeros: 0, vuelos: 0 }
    m[k].pasajeros += r.pasajeros || 0
    m[k].vuelos    += r.vuelos    || 0
  })
  return Object.values(m).sort((a, b) => b.pasajeros - a.pasajeros).slice(0, 8)
}

function agruparPorRuta(rows) {
  const m = {}
  rows.forEach(r => {
    const k = r.ruta_provincia || r.ruta_oaci || '—'
    if (!m[k]) m[k] = { ruta: k, pasajeros: 0, vuelos: 0, asientos: 0 }
    m[k].pasajeros += r.pasajeros || 0
    m[k].vuelos    += r.vuelos    || 0
    m[k].asientos  += r.asientos  || 0
  })
  return Object.values(m).sort((a, b) => b.pasajeros - a.pasajeros).slice(0, 6)
}

// ─── TOOLTIPS ────────────────────────────────────────────────────────────────
const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#111', border: `1px solid rgba(250,250,247,0.1)`, padding: '10px 14px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      <Eyebrow light style={{ marginBottom: 8 }}>{label}</Eyebrow>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 3 }}>
          <div style={{ width: 8, height: 2, background: p.color || C.paper }} />
          <span style={{ fontSize: 12, color: C.paper, fontWeight: 300 }}>{p.name}: {fmt(p.value)}</span>
        </div>
      ))}
    </div>
  )
}
const BarTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#111', border: `1px solid rgba(250,250,247,0.1)`, padding: '8px 12px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      <span style={{ fontSize: 12, color: C.paper, fontWeight: 300 }}>{fmt(payload[0]?.value)} pasajeros</span>
    </div>
  )
}

// ─── KPI CARD ────────────────────────────────────────────────────────────────
function KPICard({ icon: Icon, value, label, delta }) {
  return (
    <div style={{ borderLeft: `1px solid ${C.stone}`, paddingLeft: 'clamp(14px, 2vw, 24px)' }}>
      {Icon && <Icon size={18} strokeWidth={1.5} style={{ color: C.slate, opacity: 0.6, marginBottom: 12, display: 'block' }} />}
      <div style={{ fontSize: 'clamp(1.7rem, 3vw, 3rem)', fontWeight: 200, color: C.ink, letterSpacing: '-0.045em', lineHeight: 1, marginBottom: 10 }}>{value}</div>
      <VoltLine w={20} />
      <div style={{ fontSize: 12.5, fontWeight: 400, color: C.ink, marginTop: 10, marginBottom: 4 }}>{label}</div>
      {delta && <div style={{ fontSize: 11, color: C.slate, opacity: 0.65 }}>{delta}</div>}
    </div>
  )
}

// ─── PAGE ────────────────────────────────────────────────────────────────────
export default function Aerea() {
  const { anio, mes } = usePeriodo()
  const { data: raw, loading } = useCSV('/data/data_aereo.csv')

  const sde = useMemo(() => raw.filter(isSDE), [raw])

  const sdeFilt = useMemo(() => {
    if (!anio && !mes) return sde
    return sde.filter(r => {
      const d = new Date(r.fecha)
      return (anio ? d.getFullYear() === anio : true) && (mes ? d.getMonth() + 1 === mes : true)
    })
  }, [sde, anio, mes])

  const serie = useMemo(() => {
    const base = anio ? sde.filter(r => new Date(r.fecha).getFullYear() === anio) : sde
    return agruparPorFecha(base)
  }, [sde, anio])

  const ultimo     = useMemo(() => { const ag = agruparPorFecha(sdeFilt); return ag[ag.length - 1] ?? null }, [sdeFilt])
  const aereolineas = useMemo(() => agruparPorAerolinea(sdeFilt), [sdeFilt])
  const rutas       = useMemo(() => agruparPorRuta(sdeFilt), [sdeFilt])

  const periodoStr = ultimo?.fecha
    ? new Date(ultimo.fecha).toLocaleDateString('es-AR', { month: 'short', year: 'numeric' })
    : (anio ? String(anio) : 'Último disponible')

  const pctCab = ultimo?.pasajeros > 0 ? Math.round((ultimo.cab / ultimo.pasajeros) * 100) : 0
  const lf     = ultimo?.load_factor ?? 0
  const r = 72, cx = 90, cy = 90, circ = 2 * Math.PI * r
  const filled = (lf / 100) * circ

  if (loading) return <Loading />

  return (
    <>
      {/* ── HERO ── */}
      <section style={{
        position: 'relative', minHeight: '42vh', overflow: 'hidden',
        padding: 'clamp(64px, 8vw, 96px) var(--pad) clamp(48px, 6vw, 72px)',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      }}>
        <video autoPlay loop muted playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}>
          <source src="https://www.pexels.com/es-es/download/video/11044451/" type="video/mp4" />
        </video>
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to right, rgba(10,10,10,0.93) 0%, rgba(10,10,10,0.78) 35%, rgba(10,10,10,0.38) 65%, rgba(10,10,10,0.10) 100%)' }} />

        <div style={{ position: 'relative', zIndex: 3 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <Paralelo />
            <Eyebrow light>ANAC · Capa 1 · Actividad básica</Eyebrow>
          </div>
          <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 5rem)', fontWeight: 200, color: C.paper, letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 16px' }}>
            Infraestructura<br />Aérea.
          </h1>
          <p style={{ fontSize: '0.9rem', fontWeight: 300, color: C.paper, opacity: 0.6, maxWidth: 400, lineHeight: 1.65, margin: 0 }}>
            Pasajeros, vuelos y load factor en el aeropuerto de Santiago del Estero. Datos por ruta y aerolínea.
          </p>
        </div>
      </section>

      {/* ── KPIS ── */}
      <section style={{ background: C.paper, padding: 'clamp(56px, 7vw, 80px) var(--pad)' }}>
        <Eyebrow style={{ marginBottom: 52 }}>Indicadores · {periodoStr}</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0 clamp(14px, 4vw, 56px)' }}>
          <KPICard icon={ICONS.aereo}          value={fmt(ultimo?.pasajeros ?? 0)}     label="Pasajeros totales"    delta={`${pctCab}% cabotaje`} />
          <KPICard icon={ICONS.aereo}          value={fmt(ultimo?.vuelos ?? 0, 0)}     label="Vuelos operados"      delta={periodoStr} />
          <KPICard icon={ICONS.ibt}            value={`${lf}%`}                        label="Load factor"          delta="eficiencia de ocupación" />
          <KPICard icon={ICONS.pernoctaciones} value={fmt(ultimo?.asientos ?? 0)}      label="Asientos ofrecidos"   delta="capacidad total instalada" />
        </div>
        <Interpretacion texto={
          ultimo
            ? `En ${periodoStr}, el aeropuerto de SDE registró ${fmt(ultimo.pasajeros)} pasajeros en ${fmt(ultimo.vuelos, 0)} vuelos (${fmt(ultimo.asientos)} asientos ofrecidos). Load factor: ${lf}%. El ${pctCab}% del tráfico es cabotaje${ultimo.intl > 0 ? ` y el ${100 - pctCab}% internacional.` : ', sin operaciones internacionales en el período.'}`
            : 'Sin datos para el período seleccionado.'
        } />
      </section>

      {/* ── TREND ── */}
      <section style={{ background: C.ink, padding: 'clamp(56px, 7vw, 80px) var(--pad)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 48, flexWrap: 'wrap', gap: 20 }}>
          <SectionTitle icon={ICONS.aereo} context={anio ? `Evolución mensual · ${anio}` : 'Serie histórica'} main="Pasajeros aéreos" light />
          <div style={{ display: 'flex', gap: 20, paddingTop: 4 }}>
            {[{ c: C.paper, l: 'Cabotaje' }, { c: C.stone, l: 'Internacional', dash: true }].map((x, i) => (
              <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
                <div style={{ width: 16, height: 1.5, background: x.c, opacity: x.dash ? 0.5 : 1 }} />
                <Eyebrow light style={{ opacity: 0.42 }}>{x.l}</Eyebrow>
              </div>
            ))}
          </div>
        </div>
        <div style={{ height: 'clamp(200px, 26vw, 300px)' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={serie} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gC2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.paper} stopOpacity={0.14} />
                  <stop offset="100%" stopColor={C.paper} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gI2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.stone} stopOpacity={0.1} />
                  <stop offset="100%" stopColor={C.stone} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fill: C.stone, fontSize: 10, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} interval={anio ? 1 : 5} />
              <Tooltip content={<ChartTip />} cursor={{ stroke: 'rgba(250,250,247,0.07)', strokeWidth: 1 }} />
              <Area type="monotone" dataKey="cab"  name="Cabotaje"      stroke={C.paper} strokeWidth={2}   fill="url(#gC2)" dot={false} activeDot={{ r: 3, fill: C.volt, strokeWidth: 0 }} />
              <Area type="monotone" dataKey="intl" name="Internacional" stroke={C.stone} strokeWidth={1.5} fill="url(#gI2)" dot={false} strokeDasharray="5 4" strokeOpacity={0.55} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <Interpretacion light texto={
          serie.length > 0
            ? `Pico histórico: ${fmt(Math.max(...serie.map(s => s.pasajeros)))} pasajeros mensuales. El cabotaje domina el tráfico. La estacionalidad muestra concentración en temporada alta (enero–marzo, julio).`
            : 'Sin serie disponible para el período.'
        } />
      </section>

      {/* ── AEROLÍNEAS ── */}
      <section style={{ background: C.paper, padding: 'clamp(56px, 7vw, 80px) var(--pad)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
          <SectionTitle icon={ICONS.aereo} context={periodoStr} main="Por aerolínea" />
          <Eyebrow style={{ opacity: 0.5 }}>{aereolineas.length} empresas activas · {periodoStr}</Eyebrow>
        </div>
        <div style={{ height: 'clamp(240px, 30vw, 360px)' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={aereolineas} margin={{ top: 0, right: 100, left: 0, bottom: 0 }}>
              <XAxis type="number" tick={{ fill: C.stone, fontSize: 10, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} tickFormatter={v => fmt(v)} />
              <YAxis type="category" dataKey="aerolinea" tick={{ fill: C.ink, fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: 400 }} tickLine={false} axisLine={false} width={120} />
              <Tooltip content={<BarTip />} cursor={{ fill: 'rgba(10,10,10,0.04)' }} />
              <Bar dataKey="pasajeros" name="Pasajeros" radius={[0, 3, 3, 0]}>
                {aereolineas.map((_, i) => <Cell key={i} fill={i === 0 ? C.ink : i === 1 ? C.slate : C.stone} fillOpacity={i === 0 ? 1 : 0.55} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <Interpretacion texto={aereolineas.length > 0 ? `${aereolineas[0].aerolinea} lidera el mercado con ${fmt(aereolineas[0].pasajeros)} pasajeros en ${periodoStr}. Operan ${aereolineas.length} aerolíneas con servicios a Santiago del Estero.` : 'Sin datos.'} />
      </section>

      {/* ── RUTAS PREMIUM ── */}
      <section style={{ background: C.ink, padding: 'clamp(56px, 7vw, 80px) var(--pad)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
          <SectionTitle icon={ICONS.aereo} context={periodoStr} main="Rutas principales" light />
          <Eyebrow light style={{ opacity: 0.4 }}>Pasajeros por ruta · {periodoStr}</Eyebrow>
        </div>
        <div>
          {(() => {
            const totalPax = rutas.reduce((a, b) => a + b.pasajeros, 0)
            return rutas.map((r, i) => {
              const maxPax = rutas[0]?.pasajeros || 1
              const pct    = Math.round((r.pasajeros / maxPax) * 100)
              const parts  = r.ruta.split('↔').map(s => s.trim())
              const label  = parts.find(p => !p.includes('Santiago del Estero')) || r.ruta
              const lfRuta = r.asientos > 0 ? Math.round((r.pasajeros / r.asientos) * 100) : 0
              const pctTot = totalPax > 0 ? Math.round((r.pasajeros / totalPax) * 100) : 0
              return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: 'clamp(32px,4vw,56px) 1fr clamp(80px,12vw,160px)', gap: 'clamp(16px,3vw,40px)', alignItems: 'center', padding: 'clamp(18px,2.5vw,28px) 0', borderBottom: '0.5px solid rgba(250,250,247,0.1)' }}>
                  <div style={{ fontSize: 'clamp(2rem,3.5vw,4rem)', fontWeight: 200, color: i === 0 ? C.paper : C.stone, letterSpacing: '-0.05em', lineHeight: 1, opacity: i === 0 ? 1 : 0.28 }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <div style={{ fontSize: 'clamp(0.9rem,1.3vw,1.15rem)', fontWeight: 400, color: C.paper, marginBottom: 10, lineHeight: 1.3 }}>{label}</div>
                    <div style={{ display: 'flex', gap: 'clamp(12px,2vw,24px)', marginBottom: 12, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, color: C.stone, opacity: 0.7 }}>{fmt(r.vuelos, 0)} vuelos</span>
                      <span style={{ fontSize: 11, color: C.stone, opacity: 0.7 }}>LF: {lfRuta}%</span>
                      <span style={{ fontSize: 11, color: C.stone, opacity: 0.7 }}>{fmt(r.asientos)} asientos</span>
                    </div>
                    <div style={{ height: 2, background: 'rgba(250,250,247,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: pct + '%', background: i === 0 ? C.paper : C.stone, opacity: i === 0 ? 1 : 0.4 }} />
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 'clamp(1.4rem,2.5vw,2.5rem)', fontWeight: 200, color: C.paper, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 6 }}>{fmt(r.pasajeros)}</div>
                    <div style={{ fontSize: 10, color: C.stone, opacity: 0.55, marginBottom: 8 }}>pasajeros</div>
                    <div style={{ display: 'inline-block', padding: '4px 10px', background: i === 0 ? C.paper : 'rgba(250,250,247,0.08)', borderRadius: 2 }}>
                      <span style={{ fontSize: 10, fontWeight: 500, color: i === 0 ? C.ink : C.stone, letterSpacing: '0.05em' }}>{pctTot}%</span>
                    </div>
                  </div>
                </div>
              )
            })
          })()}
        </div>
        <Interpretacion light texto={rutas.length > 0 ? `La ruta hacia ${rutas[0]?.ruta.split('\u2194').find(s => !s.includes('Santiago del Estero'))?.trim() ?? rutas[0]?.ruta} lidera el tráfico aéreo de SDE. Fuente: ANAC — datos de vuelos regulares de cabotaje e internacionales.` : 'Sin datos de rutas para el período.'} />
      </section>
      {/* ── LOAD FACTOR ── */}
      <section style={{
        background: C.ink, padding: 'clamp(56px, 7vw, 80px) var(--pad)',
        display: 'grid', gridTemplateColumns: 'minmax(150px, 190px) 1fr',
        gap: 'clamp(36px, 5vw, 88px)', alignItems: 'center',
      }}>
        <div>
          <svg viewBox="0 0 180 180" width="100%" style={{ maxWidth: 190 }}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(250,250,247,0.1)" strokeWidth={5} />
            <circle cx={cx} cy={cy} r={r} fill="none"
              stroke={lf >= 75 ? C.volt : C.paper} strokeWidth={5} strokeLinecap="round"
              strokeDasharray={`${filled} ${circ - filled}`}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
            <g transform={`translate(${cx}, ${cy})`}>
              <text textAnchor="middle" dominantBaseline="middle" y="-12"
                fill={lf >= 75 ? C.volt : C.paper} fontSize={38} fontWeight={200}
                fontFamily="Plus Jakarta Sans" letterSpacing="-1.5">{lf}</text>
              <text textAnchor="middle" dominantBaseline="middle" y="16"
                fill={C.stone} fontSize={12} fontWeight={400}
                fontFamily="Plus Jakarta Sans">%</text>
            </g>
          </svg>
          <div style={{ marginTop: 16 }}>
            <VoltLine w={18} />
            <Eyebrow light style={{ marginTop: 8, fontSize: 9.5 }}>Load Factor · {periodoStr}</Eyebrow>
          </div>
        </div>
        <div>
          <SectionTitle icon={ICONS.ibt} context="Eficiencia de ocupación" main="Load factor aéreo." light />
          <Interpretacion light texto={
            `El load factor del ${lf}% indica que por cada 100 asientos disponibles, ${lf} fueron ocupados. ` +
            (lf >= 80
              ? 'Un LF alto sugiere que la oferta de vuelos es ajustada — oportunidad para nuevas frecuencias o mayor capacidad.'
              : lf >= 60
              ? 'Un LF moderado indica equilibrio entre oferta y demanda de asientos.'
              : 'Un LF bajo sugiere exceso de capacidad instalada respecto a la demanda efectiva.')
          } />
        </div>
      </section>
      <section style={{ background: 'var(--paper, #FAFAF7)', padding: 'clamp(40px,5vw,64px) var(--pad)' }}>
        <Interpretacion>
        En 2025, el aeropuerto de Termas operó con un load factor del 80,6% — la demanda
        supera la oferta de frecuencias. Aun así, con 19.822 pasajeros anuales, el destino
        opera al 9% de su capacidad histórica: en 2017 llegaban 210.000 pasajeros por año.
        La salida de Aerolíneas Argentinas en 2019 recortó el 89% de esa conectividad y nunca
        se recuperó. Hoy, 2 vuelos semanales desde Buenos Aires son el principal cuello de
        botella del turismo termal. Un LF del 80% en Termas no es señal de salud — es señal
        de mercado reprimido: hay demanda para más frecuencias que no se están operando.
          </Interpretacion>
      </section>

    </>
  )
}
