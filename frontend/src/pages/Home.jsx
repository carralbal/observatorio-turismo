import { useMemo, useState, useEffect } from 'react'
import { ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useCSV, fmt } from '../hooks/useCSV'
import { usePeriodo, filterByPeriodo } from '../context/PeriodoContext'
import { C, Paralelo, VoltLine, Eyebrow, SectionTitle, Interpretacion, Loading, ICONS } from '../components/Atoms'

const ESCUDO = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Escudo_de_la_Provincia_de_Santiago_del_Estero.svg/250px-Escudo_de_la_Provincia_de_Santiago_del_Estero.svg.png'

const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#111', border: '1px solid rgba(250,250,247,0.1)', padding: '10px 14px', fontFamily: 'Plus Jakarta Sans' }}>
      <Eyebrow light style={{ marginBottom: 8 }}>{payload[0]?.payload.label}</Eyebrow>
      {payload.filter(p => p.value != null).map((p, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 3 }}>
          <div style={{ width: 8, height: 2, background: p.color }} />
          <span style={{ fontSize: 'var(--fs-sm)', color: C.paper, fontWeight: 300 }}>{p.name}: {fmt(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

function KPICardHome({ icon: Icon, value, label, delta, light = false, volt = false, estimated = false, subValue = null, subLabel = null }) {
  return (
    <div style={{ borderLeft: `1px solid ${light ? 'rgba(250,250,247,0.15)' : C.stone}`, paddingLeft: 'clamp(14px,2vw,24px)' }}>
      {Icon && <Icon size={23} strokeWidth={1.4} style={{ color: volt ? C.volt : (light ? C.paper : C.slate), opacity: 0.6, marginBottom: 12, display: 'block' }} />}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <div style={{ fontSize: 'clamp(1.7rem,3vw,3.2rem)', fontWeight: 200, color: volt ? C.volt : (light ? C.paper : C.ink), letterSpacing: '-0.045em', lineHeight: 1, marginBottom: 10 }}>
          {value}
        </div>
        {estimated && (
          <span style={{ fontSize: 9, fontWeight: 600, color: C.volt, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.8, paddingBottom: 2 }}>est.</span>
        )}
      </div>
      <VoltLine w={20} />
      <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 400, color: light ? C.paper : C.ink, marginTop: 10, marginBottom: 4, lineHeight: 1.3 }}>{label}</div>
      {delta && <div style={{ fontSize: 'var(--fs-xs)', color: light ? C.stone : C.slate, opacity: 0.65 }}>{delta}</div>}
      {subValue && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `0.5px solid ${light ? 'rgba(250,250,247,0.12)' : C.stone+'40'}` }}>
          <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 300, color: light ? C.stone : C.slate }}>{subValue}</div>
          {subLabel && <div style={{ fontSize: 'var(--fs-xs)', color: light ? C.stone : C.slate, opacity: 0.55, marginTop: 2 }}>{subLabel}</div>}
        </div>
      )}
    </div>
  )
}

function Hero() {
  return (
    <section className="grain" style={{ position: 'relative', minHeight: '42vh', padding: '48px var(--pad) 0', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <video autoPlay loop muted playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}>
        <source src="https://www.pexels.com/es-es/download/video/6320380/" type="video/mp4" />
      </video>
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to right, rgba(10,10,10,0.94) 0%, rgba(10,10,10,0.80) 30%, rgba(10,10,10,0.42) 58%, rgba(10,10,10,0.14) 100%)' }} />
      <div style={{ position: 'relative', zIndex: 3 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 44, animation: 'fadeUp 0.7s ease both' }}>
          <Paralelo /><Eyebrow light>Observatorio de Turismo · Santiago del Estero</Eyebrow>
        </div>
        <h1 style={{ fontSize: 'clamp(3rem,7.5vw,7rem)', fontWeight: 200, color: C.paper, lineHeight: 0.92, letterSpacing: '-0.045em', margin: '0 0 28px', maxWidth: 780, animation: 'fadeUp 0.8s 0.08s ease both' }}>
          Pulso Santiago<br />del Estero.
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, margin: '0 0 72px' }}>
          <p style={{ fontSize: 'clamp(0.85rem,1.3vw,1rem)', fontWeight: 300, color: C.paper, opacity: 0.62, maxWidth: 400, lineHeight: 1.72, margin: 0, animation: 'fadeUp 0.8s 0.22s ease both' }}>
            El sistema de indicadores turísticos de Santiago del Estero. Datos oficiales actualizados mensualmente.
          </p>
          <img src={ESCUDO} alt="Escudo Santiago del Estero" style={{ height: 'clamp(48px,6.4vw,72px)', width: 'auto', objectFit: 'contain', flexShrink: 0, filter: 'grayscale(1) brightness(2.5) opacity(0.7)' }} />
        </div>
      </div>
    </section>
  )
}

function KPIStrip({ termasLast, capitalLast, periodoStr, isEstimated, lastEOHEstadia, estadiaInformal, estadiaInformalPeriodo }) {
  if (!termasLast) return null
  const viajeros_termas  = termasLast.viajeros_total ?? termasLast.viajeros ?? 0
  const viajeros_capital = capitalLast?.viajeros_total ?? capitalLast?.viajeros ?? 0
  // Estadía: use EOH value when estimated (OLS doesn't produce estadía)
  const estadia = isEstimated ? lastEOHEstadia : termasLast.estadia_promedio
  const estadiaDelta = isEstimated ? 'último EOH · nov 2025' : 'Termas · EOH'
  const ibt = termasLast.ibt_compuesto

  const kpis = [
    { icon: ICONS.viajeros, value: fmt(viajeros_termas),    label: 'Viajeros · Termas',   delta: periodoStr,    estimated: isEstimated },
    { icon: ICONS.viajeros, value: fmt(viajeros_capital),   label: 'Viajeros · Capital',  delta: periodoStr,    estimated: isEstimated },
    estadiaInformal
      ? { icon: ICONS.estadia, value: `${estadiaInformal.toFixed(1)}n`, label: 'Estadía media · informal', delta: `AirROI · ${estadiaInformalPeriodo}`, estimated: false, subValue: estadia ? `${Number(estadia).toFixed(2)}n formal` : null, subLabel: estadia ? 'EOH · nov 2025' : null }
      : { icon: ICONS.estadia, value: estadia ? `${Number(estadia).toFixed(2)}n` : '—', label: 'Estadía media · EOH', delta: estadiaDelta, estimated: false },
    { icon: ICONS.ibt,      value: `${ibt ?? '—'}/100`,    label: 'IBT · Señal digital',  delta: `índice de búsqueda · ${termasLast?.fecha ? new Date(termasLast.fecha+'T12:00:00').toLocaleDateString('es-AR', { month: 'short', year: 'numeric' }) : '—'}`, estimated: false },
  ]
  return (
    <section style={{ background: C.paper, padding: 'clamp(56px,7vw,88px) var(--pad)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 56, flexWrap: 'wrap', gap: 12 }}>
        <Eyebrow>Indicadores · {periodoStr}</Eyebrow>
        {isEstimated && (
          <span style={{ fontSize: 'var(--fs-2xs)', color: C.slate, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            est. = estimación OLS · post EOH
          </span>
        )}
      </div>
      <div className="grid-kpi">
        {kpis.map((k, i) => <KPICardHome key={i} {...k} />)}
      </div>
      <Interpretacion texto={
        `En ${periodoStr}, Termas de Río Hondo ${isEstimated ? 'estimó' : 'registró'} ${fmt(viajeros_termas)} viajeros${isEstimated ? ' (modelo OLS)' : ''}. ` +
        `La Capital sumó ${fmt(viajeros_capital)} viajeros. ` +
        (estadia ? `Estadía media: ${Number(estadia).toFixed(2)} noches${isEstimated ? ' (último EOH disponible, nov 2025)' : ''}. ` : '') +
        (ibt ? `IBT: ${ibt}/100 — ${ibt < 25 ? 'señal baja.' : ibt > 40 ? 'señal alta.' : 'señal media.'}` : '')
      } />
    </section>
  )
}

function ChartSection({ trend }) {
  const allTermas = trend.map(r => r.termas ?? r.termasEst ?? 0).filter(Boolean)
  const maxTermas = allTermas.length ? Math.max(...allTermas) : 0
  const maxRow = trend.find(r => (r.termas ?? r.termasEst) === maxTermas)

  return (
    <section style={{ background: C.ink, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 48, flexWrap: 'wrap', gap: 24 }}>
        <SectionTitle icon={ICONS.viajeros} context="Termas vs. Capital · EOH + estimado" main="Viajeros hospedados" light />
        <div style={{ display: 'flex', gap: 20, paddingTop: 4, flexWrap: 'wrap' }}>
          {[
            { c: C.paper,  l: 'Termas · EOH'     },
            { c: C.stone,  l: 'Capital · EOH'     },
            { c: C.volt,   l: 'Termas · est.',  dash: true },
            { c: 'rgba(200,200,191,0.6)', l: 'Capital · est.', dash: true },
          ].map((x, i) => (
            <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
              <div style={{ width: 16, height: x.dash ? 0 : 1.5, borderTop: x.dash ? `1.5px dashed ${x.c}` : 'none', background: x.dash ? 'none' : x.c }} />
              <Eyebrow light style={{ opacity: 0.42 }}>{x.l}</Eyebrow>
            </div>
          ))}
        </div>
      </div>
      <div style={{ height: 'clamp(200px,26vw,320px)' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={trend} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
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
            {/* EOH observed lines */}
            <Area type="monotone" dataKey="termas"    name="Termas · EOH"    stroke={C.paper} strokeWidth={2}   fill="url(#gT)" dot={false} activeDot={{ r:3, fill:C.volt, strokeWidth:0 }} connectNulls={false} />
            <Area type="monotone" dataKey="capital"   name="Capital · EOH"   stroke={C.stone} strokeWidth={1.5} strokeDasharray="5 4" strokeOpacity={0.5} fill="url(#gC)" dot={false} connectNulls={false} />
            {/* OLS estimated lines — only post-cutoff */}
            <Line  type="monotone" dataKey="termasEst"  name="Termas · est."   stroke={C.volt}  strokeWidth={2}   strokeDasharray="6 3" dot={false} activeDot={{ r:3, fill:C.volt,  strokeWidth:0 }} connectNulls />
            <Line  type="monotone" dataKey="capitalEst" name="Capital · est."  stroke="rgba(200,200,191,0.7)" strokeWidth={1.5} strokeDasharray="6 3" dot={false} activeDot={{ r:3, fill:C.stone, strokeWidth:0 }} connectNulls />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <Interpretacion light texto={`Termas supera sistemáticamente a la Capital. Pico histórico: ${fmt(maxTermas)} viajeros en ${maxRow?.label ?? '—'}. Las líneas punteadas extienden la serie con estimaciones OLS desde dic 2025 — permiten ver la continuidad del pulso turístico más allá del corte de la EOH.`} />
    </section>
  )
}

function DonutSection({ termasLast }) {
  const [progress, setProgress] = useState(0)
  const ibt = termasLast?.ibt_compuesto ?? 0
  const r = 72, cx = 90, cy = 90, circ = 2 * Math.PI * r

  useEffect(() => {
    const t = setTimeout(() => setProgress(ibt), 400)
    return () => clearTimeout(t)
  }, [ibt])

  const filled = (progress / 100) * circ
  const señal = ibt < 25 ? 'baja' : ibt > 40 ? 'alta' : 'media'

  return (
    <section className="grid-donut" style={{ background: C.paper, padding: 'clamp(56px,7vw,88px) var(--pad)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 16 }}>
        <svg viewBox="0 0 180 180" width="100%" style={{ maxWidth: 190 }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.stone} strokeWidth={5} />
          <circle className="donut-fill" cx={cx} cy={cy} r={r} fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round"
            strokeDasharray={`${filled} ${circ - filled}`} transform={`rotate(-90 ${cx} ${cy})`} />
          <g transform={`translate(${cx}, ${cy})`}>
            <text textAnchor="middle" dominantBaseline="middle" y="-12" fill={C.ink} fontSize={38} fontWeight={200} fontFamily="Plus Jakarta Sans" letterSpacing="-1.5">{ibt}</text>
            <text textAnchor="middle" dominantBaseline="middle" y="16" fill={C.slate} fontSize={12} fontWeight={400} fontFamily="Plus Jakarta Sans">/100</text>
          </g>
        </svg>
        <div>
          <VoltLine w={18} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <ICONS.ibt size={12} style={{ color: C.slate, opacity: 0.65 }} />
            <Eyebrow style={{ fontSize: 'var(--fs-2xs)' }}>IBT · Señal {señal}</Eyebrow>
          </div>
        </div>
      </div>
      <div>
        <SectionTitle icon={ICONS.ibt} context="Google Trends · señal anticipada"
          main={señal === 'baja' ? 'Demanda digital en zona baja.' : señal === 'alta' ? 'Demanda digital en zona alta.' : 'Demanda digital en zona media.'} />
        <Interpretacion texto={`El Índice de Búsqueda Turística (IBT) mide el interés de búsqueda online por alojamiento en Termas de Río Hondo. En este período se ubica en ${ibt}/100, ${señal === 'baja' ? 'por debajo del umbral de señal activa (40/100).' : señal === 'alta' ? 'por encima del umbral activo (40/100). Anticipa alta demanda.' : 'en zona media. Señal moderada.'}`} />
      </div>
    </section>
  )
}

function BrechaSection({ plazasData, aereoData }) {
  const plazas = plazasData ?? 13055

  // Calcular asientos reales desde ANAC — últimos 3 meses disponibles
  const aereoReciente = useMemo(() => {
    if (!aereoData?.length) return null
    const ultimos3 = [...new Set(aereoData.map(r => r.fecha).sort().reverse())].slice(0, 3)
    const filtrado = aereoData.filter(r => ultimos3.includes(r.fecha) && Number(r.flag_cabotaje) === 1)
    const totalAsientos = filtrado.reduce((s, r) => s + Number(r.asientos || 0), 0)
    const totalPax = filtrado.reduce((s, r) => s + Number(r.pasajeros || 0), 0)
    const totalVuelos = filtrado.reduce((s, r) => s + Number(r.vuelos || 0), 0)
    // Asientos semanales promedio (÷ semanas en 3 meses ≈ 13)
    const asientosSemanales = Math.round(totalAsientos / 13)
    const aereolineas = [...new Set(filtrado.map(r => r.aerolinea).filter(Boolean))]
    return { asientosSemanales, totalPax, totalVuelos, aereolineas, ultimos3 }
  }, [aereoData])

  const aereo2025 = aereoReciente?.asientosSemanales ?? 455
  const aereo2017 = 4045
  const cobertura  = Math.round((aereo2025 / plazas) * 100)
  const aereolineasStr = aereoReciente?.aereolineas?.join(' · ') ?? 'Aerolíneas Argentinas'
  const fechaRef = aereoReciente?.ultimos3?.[0] ? new Date(aereoReciente.ultimos3[0]+'T12:00:00').toLocaleDateString('es-AR', { month: 'short', year: '2-digit' }) : '2025'

  const items = [
    { label: 'Plazas hoteleras',         sub: 'PUNA · 7° lugar nacional · Termas de Río Hondo', value: plazas,    pct: 100 },
    { label: `Asientos aéreos · ${fechaRef}`, sub: aereolineasStr + ' · ambos aeropuertos SDE',       value: aereo2025, pct: Math.round((aereo2025/plazas)*100) },
    { label: 'Asientos aéreos 2017',     sub: 'pico histórico · antes del colapso',               value: aereo2017, pct: Math.round((aereo2017/plazas)*100) },
  ]
  return (
    <section style={{ background: C.paper, padding: 'clamp(56px,7vw,88px) var(--pad)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <Paralelo /><Eyebrow>Paradoja estructural</Eyebrow>
      </div>
      <SectionTitle>Capacidad sin<br />conectividad.</SectionTitle>
      <p style={{ fontSize: '1rem', color: C.slate, maxWidth: 560, margin: '0 0 52px', lineHeight: 1.7 }}>
        Termas de Río Hondo tiene <strong style={{ color: C.ink }}>{fmt(plazas)} plazas hoteleras</strong> — el 7° stock más grande del país.
        Pero la conectividad aérea semanal alcanza apenas <strong style={{ color: C.ink }}>{aereo2025} asientos</strong>: el {cobertura}% de su capacidad.
        En 2017 eran 4.045 asientos semanales. Una decisión política en 2019 recortó el 89% — y nunca se recuperó.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 640 }}>
        {items.map((item, i) => (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <div>
                <span style={{ fontSize: 'var(--fs-lg)', fontWeight: 600, color: C.ink, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</span>
                <span style={{ fontSize: 'var(--fs-base)', color: C.slate, marginLeft: 12 }}>{item.sub}</span>
              </div>
              <span style={{ fontSize: 'clamp(1.2rem,2vw,1.6rem)', fontWeight: 200, color: C.ink, letterSpacing: '-0.03em' }}>{fmt(item.value)}</span>
            </div>
            <div style={{ height: 5, background: C.paper2 }}>
              <div style={{ height: '100%', width: `${item.pct}%`, background: i === 0 ? C.slate : C.volt }} />
            </div>
            <div style={{ fontSize: 'var(--fs-base)', color: C.slate, marginTop: 6 }}>{item.pct}% de la capacidad hotelera</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 52, paddingTop: 32, borderTop: `0.5px solid ${C.stone}40`, display: 'flex', alignItems: 'baseline', gap: 20 }}>
        <span style={{ fontSize: 'clamp(3rem,6vw,5rem)', fontWeight: 200, color: C.ink, letterSpacing: '-0.05em', lineHeight: 1 }}>−89%</span>
        <div>
          <div style={{ fontSize: 'var(--fs-lg)', fontWeight: 600, color: C.ink, textTransform: 'uppercase', letterSpacing: '0.06em' }}>caída de conectividad aérea 2017→2025</div>
          <div style={{ fontSize: 'var(--fs-sm)', color: C.slate, marginTop: 4 }}>de 4.045 a {fmt(aereo2025)} asientos semanales · {cobertura}% de cobertura actual</div>
        </div>
      </div>
      <Interpretacion>
        Con {fmt(plazas)} plazas, Termas es el centro termal más grande de Sudamérica en oferta hotelera.
        Recuperar el nivel de 2017 implicaría multiplicar por 9 el flujo aéreo actual.
      </Interpretacion>
    </section>
  )
}

function CTAVolt() {
  return (
    <section style={{ background: C.volt, padding: 'clamp(52px,8vw,96px) var(--pad)', textAlign: 'center' }}>
      <h2 style={{ fontSize: 'clamp(1rem,2.7vw,2.4rem)', fontWeight: 100, color: C.ink, letterSpacing: '-0.04em', lineHeight: 0.92, textTransform: 'uppercase', margin: '0 0 16px' }}>
        Explorá<br />las otras dimensiones.
      </h2>
      <p style={{ fontSize: '0.88rem', fontWeight: 400, color: C.ink, opacity: 0.7, maxWidth: 340, margin: '0 auto', lineHeight: 1.65 }}>
        14 indicadores · datos oficiales al cierre del período seleccionado.
      </p>
    </section>
  )
}


function ChartEstadia({ termasAll, airdnaTermas, corte }) {
  // Use ALL EOH data (no COVID filter) for continuous estadía series
  const eohSerie = termasAll
    .filter(r => r.estadia_promedio && Number(r.estadia_promedio) > 0)
    .map(r => ({
      fecha: r.fecha,
      label: new Date(r.fecha+'T12:00:00').toLocaleDateString('es-AR', { month: 'short', year: '2-digit' }),
      year: new Date(r.fecha+'T12:00:00').getFullYear(),
      estadia_eoh:      Number(r.estadia_promedio),
      estadia_informal: null,
    }))

  const airMap = {}
  airdnaTermas
    .filter(r => Number(r.occ_avg ?? r.occ_informal_pct ?? 1) > 0.10) // filter low-occ outliers
    .forEach(r => {
      const val = Number(r.estadia_informal) || null
      if (val && val <= 8) airMap[r.fecha] = val // cap at 8n max
    })

  // Merge: add informal to existing dates or create new ones post-cutoff
  const merged = {}
  eohSerie.forEach(r => { merged[r.fecha] = { ...r } })
  Object.entries(airMap).forEach(([fecha, val]) => {
    if (!merged[fecha]) {
      const d = new Date(fecha+'T12:00:00')
      merged[fecha] = { fecha, label: d.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' }), year: d.getFullYear(), estadia_eoh: null, estadia_informal: null }
    }
    // Only show informal after EOH cutoff
    if (!corte || fecha > corte) merged[fecha].estadia_informal = val
  })

  const serie = Object.values(merged).sort((a, b) => a.fecha > b.fecha ? 1 : -1).filter(r => r.year >= 2019)

  const ChartTip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background: '#111', border: '1px solid rgba(250,250,247,0.1)', padding: '10px 14px', fontFamily: 'Plus Jakarta Sans' }}>
        <Eyebrow light style={{ marginBottom: 8 }}>{payload[0]?.payload.label}</Eyebrow>
        {payload.filter(p => p.value != null).map((p, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 3 }}>
            <div style={{ width: 8, height: 2, background: p.color }} />
            <span style={{ fontSize: 'var(--fs-sm)', color: C.paper, fontWeight: 300 }}>{p.name}: {Number(p.value).toFixed(1)}n</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <section style={{ background: C.paper, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 48, flexWrap: 'wrap', gap: 24 }}>
        <SectionTitle icon={ICONS.estadia} context="Termas · EOH + AirROI" main="Estadía media" />
        <div style={{ display: 'flex', gap: 20, paddingTop: 4, flexWrap: 'wrap' }}>
          {[
            { c: C.ink,   l: 'Formal · EOH' },
            { c: C.stone, l: 'Informal · AirROI', dash: true },
          ].map((x, i) => (
            <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
              <div style={{ width: 16, height: x.dash ? 0 : 1.5, borderTop: x.dash ? `1.5px dashed ${x.c}` : 'none', background: x.dash ? 'none' : x.c }} />
              <Eyebrow style={{ opacity: 0.55 }}>{x.l}</Eyebrow>
            </div>
          ))}
        </div>
      </div>
      <div style={{ height: 'clamp(180px,22vw,260px)' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={serie} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
            <XAxis dataKey="label" tick={{ fill: C.slate, fontSize: 10, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} interval={5} />
            <YAxis tick={{ fill: C.slate, fontSize: 10, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} tickFormatter={v => v.toFixed(1)+'n'} width={42} domain={[0, 'auto']} />
            <Tooltip content={<ChartTip />} cursor={{ stroke: 'rgba(10,10,10,0.08)', strokeWidth: 1 }} />
            <Line type="monotone" dataKey="estadia_eoh"      name="Formal · EOH"    stroke={C.ink}   strokeWidth={2}   dot={false} activeDot={{ r:3, fill:C.ink,   strokeWidth:0 }} connectNulls={false} />
            <Line type="monotone" dataKey="estadia_informal" name="Informal · AirROI" stroke={C.slate} strokeWidth={1.5} dot={false} strokeDasharray="5 3" activeDot={{ r:3, fill:C.slate, strokeWidth:0 }} connectNulls />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <Interpretacion texto="La estadía formal (EOH) mide noches promedio en hoteles y establecimientos relevados — disponible hasta nov 2025. La estadía informal (AirROI) refleja el sector de alquiler temporario y se extiende hasta abr 2026. Termas muestra estadías formales más largas que la Capital, confirmando su perfil termal de descanso prolongado." />
    </section>
  )
}

export default function Home() {
  const { anio, mes } = usePeriodo()
  const { data: pulso,       loading: l1 } = useCSV('/data/data_pulso.csv', { filter: r => r.flag_covid === 0 })
  const { data: estimado,    loading: l2 } = useCSV('/data/data_pulso_estimado.csv')
  const { data: airdna }                   = useCSV('/data/data_airdna_sde.csv')
  const { data: alojamiento }              = useCSV('/data/data_alojamiento.csv')
  const { data: aereo }                    = useCSV('/data/data_aereo.csv')

  const termasEOH   = pulso.filter(r => r.localidad === 'Termas').sort((a,b) => new Date(a.fecha+'T12:00:00') - new Date(b.fecha+'T12:00:00'))
  const capitalEOH  = pulso.filter(r => r.localidad === 'Santiago del Estero').sort((a,b) => new Date(a.fecha+'T12:00:00') - new Date(b.fecha+'T12:00:00'))
  const termasOLS   = estimado.filter(r => r.localidad === 'Termas'                && Number(r.flag_estimado) === 1).sort((a,b) => new Date(a.fecha+'T12:00:00') - new Date(b.fecha+'T12:00:00'))
  const capitalOLS  = estimado.filter(r => r.localidad === 'Santiago del Estero'   && Number(r.flag_estimado) === 1).sort((a,b) => new Date(a.fecha+'T12:00:00') - new Date(b.fecha+'T12:00:00'))

  // Last EOH estadía for when showing estimates
  const lastEOHEstadia = termasEOH[termasEOH.length - 1]?.estadia_promedio

  // AirROI estadía informal — latest Termas value
  const airdnaTermas = airdna
    .filter(r => r.mercado && r.mercado.toLowerCase().includes('termas'))
    .sort((a,b) => a.fecha > b.fecha ? 1 : -1)
  const lastAirROI = airdnaTermas[airdnaTermas.length - 1]
  const estadiaInformal = lastAirROI ? Number(lastAirROI.estadia_informal) : null
  const estadiaInformalPeriodo = lastAirROI?.fecha ? new Date(lastAirROI.fecha+'T12:00:00').toLocaleDateString('es-AR', { month: 'short', year: 'numeric' }) : ''

  // EOH cutoff
  const corte = termasEOH.length ? termasEOH[termasEOH.length - 1].fecha : null

  const termasFilt  = (anio || mes) ? filterByPeriodo(termasEOH, anio, mes) : termasEOH
  const capitalFilt = (anio || mes) ? filterByPeriodo(capitalEOH, anio, mes) : capitalEOH

  const lastEOH = termasFilt[termasFilt.length - 1]
  const lastOLS = (!anio && !mes) ? termasOLS[termasOLS.length - 1] : null
  const termasLast   = lastOLS ?? lastEOH
  const capitalLastOLS = (!anio && !mes) ? capitalOLS[capitalOLS.length - 1] : null
  const capitalLast  = capitalLastOLS ?? capitalFilt[capitalFilt.length - 1]
  const isEstimated  = !!lastOLS

  const periodoStr = (() => {
    const src = isEstimated ? lastOLS : lastEOH
    const fecha = src?.fecha ? new Date(src.fecha+'T12:00:00').toLocaleDateString('es-AR', { month: 'short', year: 'numeric' }) : '—'
    return (anio || mes) ? fecha : `Último disponible · ${fecha}`
  })()

  // Build merged trend array
  const eohMap = {}
  termasEOH.forEach(t => {
    const d = new Date(t.fecha+'T12:00:00')
    const cap = capitalEOH.find(c => c.fecha === t.fecha)
    eohMap[t.fecha] = {
      fecha: t.fecha,
      label: d.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' }),
      year: d.getFullYear(),
      termas: Number(t.viajeros_total) || null,
      capital: cap ? Number(cap.viajeros_total) || null : null,
      termasEst: null,
      capitalEst: null,
    }
  })

  // Add OLS estimates — only after cutoff
  termasOLS.forEach(t => {
    if (!eohMap[t.fecha]) {
      const d = new Date(t.fecha+'T12:00:00')
      eohMap[t.fecha] = { fecha: t.fecha, label: d.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' }), year: d.getFullYear(), termas: null, capital: null, termasEst: null, capitalEst: null }
    }
    if (!corte || t.fecha > corte) eohMap[t.fecha].termasEst = Number(t.viajeros) || null
  })
  capitalOLS.forEach(t => {
    if (!eohMap[t.fecha]) {
      const d = new Date(t.fecha+'T12:00:00')
      eohMap[t.fecha] = { fecha: t.fecha, label: d.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' }), year: d.getFullYear(), termas: null, capital: null, termasEst: null, capitalEst: null }
    }
    if (!corte || t.fecha > corte) eohMap[t.fecha].capitalEst = Number(t.viajeros) || null
  })

  const allTrend = Object.values(eohMap).sort((a,b) => a.fecha > b.fecha ? 1 : -1)
  const trend = anio ? allTrend.filter(r => r.year === anio) : allTrend

  if (l1 || l2) return <Loading />

  return (
    <>
      <Hero />
      <KPIStrip termasLast={termasLast} capitalLast={capitalLast} periodoStr={periodoStr} isEstimated={isEstimated} lastEOHEstadia={lastEOHEstadia} estadiaInformal={estadiaInformal} estadiaInformalPeriodo={estadiaInformalPeriodo} />
      <ChartSection trend={trend} />
      <DonutSection termasLast={termasLast} />
      <ChartEstadia termasAll={[...pulso].filter(r => r.localidad === 'Termas').sort((a,b) => new Date(a.fecha+'T12:00:00') - new Date(b.fecha+'T12:00:00'))} airdnaTermas={airdnaTermas} corte={corte} />
      <BrechaSection plazasData={alojamiento.length ? Number(alojamiento[alojamiento.length - 1].plazas) : 13055} aereoData={aereo} />
      <CTAVolt />
    </>
  )
}
