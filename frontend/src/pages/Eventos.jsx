import { useMemo, useState } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import { useCSV, fmt } from '../hooks/useCSV'
import { C, Paralelo, VoltLine, Eyebrow, SectionTitle, Interpretacion, Loading, ICONS } from '../components/Atoms'

const VIDEO_URL = 'https://www.pexels.com/es-es/download/video/30323199/'

function KPICard({ icon: Icon, value, label, delta, dark }) {
  const color = dark ? C.paper : C.ink
  const border = dark ? 'rgba(250,250,247,0.15)' : C.stone
  return (
    <div style={{ borderLeft: '1px solid '+border, paddingLeft: 'clamp(14px,2vw,24px)' }}>
      {Icon && <Icon size={23} strokeWidth={1.4} style={{ color: dark?C.stone:C.slate, opacity: 0.6, marginBottom: 12, display: 'block' }} />}
      <div style={{ fontSize: 'clamp(1.7rem,3vw,3rem)', fontWeight: 200, color, letterSpacing: '-0.045em', lineHeight: 1, marginBottom: 10 }}>{value}</div>
      <VoltLine w={20} />
      <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 400, color, marginTop: 10, marginBottom: 4 }}>{label}</div>
      {delta && <div style={{ fontSize: 'var(--fs-xs)', color: dark?C.stone:C.slate, opacity: 0.65 }}>{delta}</div>}
    </div>
  )
}

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#111', border: '1px solid rgba(250,250,247,0.1)', padding: '10px 14px', fontFamily: 'Plus Jakarta Sans' }}>
      <Eyebrow light style={{ marginBottom: 6 }}>{label}</Eyebrow>
      {payload.map((p,i) => <div key={i} style={{ fontSize: 'var(--fs-sm)', color: p.color||C.paper, fontWeight: 300 }}>{p.name}: {fmt(p.value)}</div>)}
    </div>
  )
}

const TipPaper = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: C.paper, border: '1px solid '+C.stone, padding: '10px 14px', fontFamily: 'Plus Jakarta Sans' }}>
      <Eyebrow style={{ marginBottom: 6 }}>{label}</Eyebrow>
      {payload.map((p,i) => <div key={i} style={{ fontSize: 'var(--fs-sm)', color: C.ink, fontWeight: 300 }}>{p.name}: {fmt(p.value)}</div>)}
    </div>
  )
}

// Custom dot: volt large for MotoGP, small stone for non-MotoGP
const CustomDot = (props) => {
  const { cx, cy, payload } = props
  if (payload.tiene_motogp) {
    return <circle key={cx+cy} cx={cx} cy={cy} r={7} fill={C.volt} stroke={C.ink} strokeWidth={2} />
  }
  return <circle key={cx+cy} cx={cx} cy={cy} r={3} fill={C.stone} stroke="none" opacity={0.5} />
}

const CustomActiveDot = (props) => {
  const { cx, cy } = props
  return <circle key={cx+cy} cx={cx} cy={cy} r={8} fill={C.volt} stroke={C.ink} strokeWidth={2} />
}

export default function MotoGP() {
  const [evento, setEvento] = useState('motogp')
  const { data: raw, loading } = useCSV('/data/data_motogp.csv')
  const { data: trends } = useCSV('/data/data_trends.csv')
  const { data: olaRaw } = useCSV('/data/data_motogp_ola.csv')
  const termas = useMemo(() => raw.filter(r => Number(r.es_termas) === 1), [raw])

  const porAnio = useMemo(() => termas
    .map(r => ({
      anio: Number(r.anio),
      label: String(r.anio),
      viajeros: Number(r.viajeros_total) || 0,
      estadia: Number(r.estadia_promedio) || 0,
      tiene_motogp: Number(r.tiene_motogp) === 1,
      uplift: Number(r.uplift_vs_baseline) || 0,
      baseline: Number(r.baseline_viajeros_termas) || 0,
      pasajeros_sde: Number(r.pasajeros_sde) || 0,
    }))
    .sort((a,b) => a.anio - b.anio)
  , [termas])

  const motogpAnios = porAnio.filter(r => r.tiene_motogp)
  const promBaseline = porAnio.length ? Math.round(porAnio.reduce((a,b) => a+b.baseline, 0) / porAnio.length) : 0
  const upliftPromedio = motogpAnios.length ? Math.round(motogpAnios.reduce((a,b) => a+b.uplift, 0) / motogpAnios.length) : 0
  const upliftPct = promBaseline > 0 ? Math.round((upliftPromedio/promBaseline)*100) : 0
  const mejorAnio = motogpAnios.reduce((a,b) => b.viajeros > a.viajeros ? b : a, motogpAnios[0] || {})
  const totalViajerosMotoGP = motogpAnios.reduce((a,b) => a+b.viajeros, 0)


  // OLA DE ARRASTRE — datos diarios relativos al evento
  const olaData = useMemo(() => {
    if (!olaRaw?.length) return []
    return olaRaw
      .filter(r => Number(r.dia_rel) >= -21 && Number(r.dia_rel) <= 16)
      .map(r => ({
        label:   r.label,
        dia_rel: Number(r.dia_rel),
        ibt:     Number(r.ibt),
        fase:    r.fase,
      }))
  }, [olaRaw])

  // IBT serie con markers de eventos MotoGP
  const MOTOGP_FECHAS = ['2018-03-01','2018-04-01','2019-03-01','2019-04-01','2022-03-01','2023-03-01','2024-02-01']
  const ibtSerie = useMemo(() => {
    if (!trends?.length) return []
    return trends
      .filter(r => r.fecha >= '2017-01-01')
      .map(r => ({
        fecha:   r.fecha,
        label:   new Date(r.fecha + 'T12:00:00').toLocaleDateString('es-AR', { month: 'short', year: '2-digit' }),
        ibt:     Number(r.ibt_termas),
        motogp:  Number(r.ibt_motogp),
        esMotoGP: MOTOGP_FECHAS.includes(r.fecha),
      }))
  }, [trends])

  if (loading) return <Loading />

  return (
    <>
      <section style={{ position: 'relative', minHeight: '42vh', overflow: 'hidden', padding: 'clamp(64px,8vw,96px) var(--pad) clamp(48px,6vw,72px)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <video autoPlay loop muted playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}>
          <source src={VIDEO_URL} type="video/mp4" />
        </video>
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to right, rgba(10,10,10,0.93) 0%, rgba(10,10,10,0.78) 35%, rgba(10,10,10,0.38) 65%, rgba(10,10,10,0.10) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 3 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <Paralelo /><Eyebrow light>EOH · ANAC · Capa 1 · Actividad</Eyebrow>
          </div>
          <h1 style={{ fontSize: 'clamp(2.4rem,5vw,5rem)', fontWeight: 200, color: C.paper, letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 16px' }}>MotoGP<br />como Evento.</h1>
          <p style={{ fontSize: '0.9rem', fontWeight: 300, color: C.paper, opacity: 0.6, maxWidth: 480, lineHeight: 1.65, margin: 0 }}>Impacto del Gran Premio de Argentina en la demanda turística de Termas de Río Hondo. Método de diferencias en diferencias (DiD) 2014–2025.</p>
        </div>
      </section>

      {evento === 'motogp' && <>

      <section style={{ background: C.paper, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <Eyebrow style={{ marginBottom: 52 }}>Impacto acumulado · {motogpAnios.length} ediciones · 2014–2025</Eyebrow>
        <div className="grid-kpi">
          <KPICard icon={ICONS.viajeros} value={fmt(totalViajerosMotoGP)} label="Viajeros en ediciones MotoGP" delta={'promedio '+fmt(Math.round(totalViajerosMotoGP/Math.max(motogpAnios.length,1)))+'/edición'} />
          <KPICard icon={ICONS.viajeros} value={'+'+upliftPct+'%'} label="Uplift vs baseline" delta={'promedio '+fmt(upliftPromedio)+' viajeros extra'} />
          <KPICard icon={ICONS.aereo} value={mejorAnio.anio || '—'} label="Mejor edición" delta={mejorAnio.viajeros ? fmt(mejorAnio.viajeros)+' viajeros' : '—'} />
          <KPICard icon={ICONS.pernoctaciones} value={motogpAnios.length > 0 ? motogpAnios[motogpAnios.length-1].estadia.toFixed(1)+' noches' : '—'} label="Estadía media última ed." delta="vs 1.8 promedio anual SDE" />
        </div>
        <Interpretacion texto={'En los '+motogpAnios.length+' años con MotoGP (2014–2019, 2023–2025), Termas registró un uplift promedio del '+upliftPct+'% respecto al baseline estimado sin evento. La mejor edición fue '+mejorAnio.anio+' con '+fmt(mejorAnio.viajeros)+' viajeros. Fuente: EOH INDEC + ANAC, método DiD.'} />
      </section>

      {/* IMPACTO POR EDICIÓN — LineChart con dots diferenciados */}
      <section style={{ background: C.ink, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 48, flexWrap: 'wrap', gap: 20 }}>
          <SectionTitle icon={ICONS.viajeros} context="Viajeros en marzo por año" main="Impacto por edición" light />
          <div style={{ display: 'flex', gap: 24, paddingTop: 4, flexWrap: 'wrap' }}>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <circle r={6} style={{ display:'inline-block', width:12, height:12, borderRadius:'50%', background:C.volt }} />
              <div style={{ width:12, height:12, borderRadius:'50%', background:C.volt, flexShrink:0 }} />
              <Eyebrow light style={{ opacity:0.6 }}>Con MotoGP</Eyebrow>
            </div>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:C.stone, opacity:0.5, flexShrink:0 }} />
              <Eyebrow light style={{ opacity:0.45 }}>Sin MotoGP</Eyebrow>
            </div>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <div style={{ width:16, height:1.5, background:'rgba(250,250,247,0.3)', borderTopStyle:'dashed', borderTopWidth:1, borderTopColor:'rgba(250,250,247,0.3)' }} />
              <Eyebrow light style={{ opacity:0.35 }}>Baseline estimado</Eyebrow>
            </div>
          </div>
        </div>
        <div style={{ height: 'clamp(220px,28vw,340px)' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={porAnio} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fill: C.stone, fontSize: 11, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: C.stone, fontSize: 10, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} tickFormatter={v => fmt(v)} width={56} />
              <Tooltip content={<Tip />} cursor={{ stroke: 'rgba(250,250,247,0.07)', strokeWidth: 1 }} />
              <ReferenceLine y={promBaseline} stroke="rgba(250,250,247,0.25)" strokeDasharray="5 4"
                label={{ value: 'baseline sin evento', fill: C.stone, fontSize: 9, fontFamily: 'Plus Jakarta Sans', position: 'insideTopRight' }} />
              <Line
                type="monotone" dataKey="viajeros" name="Viajeros"
                stroke="rgba(250,250,247,0.4)" strokeWidth={1.5} connectNulls
                dot={<CustomDot />} activeDot={<CustomActiveDot />}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <Interpretacion light texto={'Cada punto de la línea representa los viajeros de Termas en marzo. Los puntos amarillos (grandes) corresponden a ediciones con MotoGP — todos superan claramente el baseline estimado (línea punteada). Los puntos grises (pequeños) son años sin evento. La diferencia visual entre ambos confirma el impacto causal del evento. Ediciones canceladas 2020–2022: COVID. Fuente: EOH INDEC, cálculo propio.'} />
      </section>

      {/* PASAJEROS ANAC — LineChart */}
      <section style={{ background: C.paper, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <SectionTitle icon={ICONS.aereo} context="Conectividad aérea · año del evento" main="Pasajeros ANAC por edición" style={{ marginBottom: 40 }} />
        <div style={{ height: 'clamp(180px,22vw,260px)' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={porAnio} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fill: C.slate, fontSize: 11, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: C.slate, fontSize: 10, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} tickFormatter={v => fmt(v)} width={60} />
              <Tooltip content={<TipPaper />} cursor={{ stroke: 'rgba(10,10,10,0.1)', strokeWidth: 1 }} />
              <Line
                type="monotone" dataKey="pasajeros_sde" name="Pasajeros aéreos"
                stroke={C.slate} strokeWidth={1.5} connectNulls
                dot={(props) => {
                  const { cx, cy, payload } = props
                  return payload.tiene_motogp
                    ? <circle key={cx} cx={cx} cy={cy} r={7} fill={C.ink} stroke={C.stone} strokeWidth={2} />
                    : <circle key={cx} cx={cx} cy={cy} r={3} fill={C.stone} stroke="none" opacity={0.5} />
                }}
                activeDot={{ r: 6, fill: C.ink, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <Interpretacion texto={'Pasajeros aéreos anuales en el aeropuerto de SDE. Los puntos oscuros (grandes) corresponden a años con MotoGP — el evento genera un pico de conectividad medible. La caída 2019–2022 refleja la salida de Aerolíneas Argentinas y la pandemia. Fuente: ANAC.'} />
      </section>

      <section style={{ background: C.paper, padding: 'clamp(40px,5vw,64px) var(--pad)' }}>
        <Interpretacion>
          El modelo DiD estima que MotoGP 2025 generó un uplift de +13.745 viajeros en Termas
          sobre el baseline de 28.405 (+48%). En abril 2025 el efecto se mantuvo: +12.143
          viajeros adicionales (+43%). Para comparar, sin MotoGP en 2024, Termas registró
          24.882 viajeros en marzo — un 41% menos. A estadía media de 2,6 noches, cada edición
          MotoGP equivale a ~36.000 pernoctes adicionales y un multiplicador estimado de
          $2.800M ARS sobre la economía local.
        </Interpretacion>
      </section>
      {/* POSICIONAMIENTO DIGITAL */}
      <section style={{ background: C.ink, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <Paralelo /><Eyebrow light>Google Trends · IBT</Eyebrow>
        </div>
        <SectionTitle light main="El evento posiciona el destino." context="IBT Termas de Río Hondo · 2017–2026" style={{ marginBottom: 16 }} />
        <p style={{ fontSize: 'var(--fs-sm)', color: 'rgba(250,250,247,0.5)', maxWidth: 600, lineHeight: 1.7, marginBottom: 40 }}>
          Cada edición del MotoGP genera un spike de búsquedas digitales por "Termas de Río Hondo". El impacto no es solo económico — el evento posiciona el destino ante millones de personas que no vinieron pero lo conocieron.
        </p>
        <div style={{ height: 'clamp(180px,22vw,280px)', marginBottom: 16 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ibtSerie} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fill: C.stone, fontSize: 10, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} interval={11} />
              <YAxis tick={{ fill: C.stone, fontSize: 10, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} width={28} domain={[0,100]} />
              <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(250,250,247,0.1)', fontFamily: 'Plus Jakarta Sans', fontSize: 12 }} labelStyle={{ color: C.stone }} formatter={(v, n) => [v, n === 'ibt' ? 'IBT Termas' : 'IBT MotoGP']} />
              {ibtSerie.filter(r => r.esMotoGP).map((r, i) => (
                <ReferenceLine key={i} x={r.label} stroke={C.volt} strokeDasharray="3 3" strokeWidth={1.5} />
              ))}
              <Line type="monotone" dataKey="ibt" name="ibt" stroke={C.paper} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="motogp" name="motogp" stroke={C.volt} strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 2, background: C.paper }} />
            <span style={{ fontSize: 'var(--fs-xs)', color: C.stone }}>IBT Termas de Río Hondo</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 2, background: C.volt, borderTop: '2px dashed '+C.volt }} />
            <span style={{ fontSize: 'var(--fs-xs)', color: C.stone }}>Búsqueda "MotoGP"</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 2, height: 16, background: C.volt, opacity: 0.6 }} />
            <span style={{ fontSize: 'var(--fs-xs)', color: C.stone }}>Edición MotoGP</span>
          </div>
        </div>
        <Interpretacion light>
          Las líneas verticales marcan cada edición del MotoGP en Termas. El IBT sube sistemáticamente en los meses del evento — y en algunos casos el efecto se mantiene 1-2 meses después. El "MotoGP IBT" (línea volt) muestra el interés específico por la carrera: pico en el mes del evento y caída rápida. El IBT de Termas, en cambio, tiene una cola más larga — el destino queda en la memoria del buscador.
        </Interpretacion>
      </section>

      {/* OLA DE ARRASTRE */}
      <section style={{ background: C.paper, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <Paralelo /><Eyebrow>Google Trends · Diario · 2025</Eyebrow>
        </div>
        <SectionTitle main="La ola de arrastre." context="IBT diario Termas de Río Hondo · 21 días antes y 16 días después de la carrera" style={{ marginBottom: 16 }} />
        <p style={{ fontSize: 'var(--fs-sm)', color: C.slate, maxWidth: 640, lineHeight: 1.7, marginBottom: 40 }}>
          El evento no termina el día de la carrera. El interés digital se construye dos semanas antes y se mantiene elevado una semana después. La carrera 2025 multiplicó por 3.3x el nivel de búsquedas baseline. El arrastre post-evento equivale a +12% sobre el baseline por 10 días adicionales.
        </p>

        {/* Stats rápidos */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0 clamp(14px,4vw,40px)', marginBottom: 40 }}>
          {[
            { v: '23.8', l: 'Baseline', d: 'promedio sin evento' },
            { v: '+63%', l: 'Build-up', d: '2 semanas antes' },
            { v: '3.3×', l: 'Pico carrera', d: 'día de la carrera' },
            { v: '+12%', l: 'Arrastre', d: '10 días post-evento' },
          ].map((k, i) => (
            <div key={i} style={{ borderLeft: `1px solid ${C.stone}`, paddingLeft: 'clamp(10px,1.5vw,20px)' }}>
              <div style={{ fontSize: 'clamp(1.4rem,2.5vw,2.2rem)', fontWeight: 200, color: C.ink, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 8 }}>{k.v}</div>
              <VoltLine w={16} />
              <div style={{ fontSize: 'var(--fs-xs)', fontWeight: 500, color: C.ink, marginTop: 8, marginBottom: 2 }}>{k.l}</div>
              <div style={{ fontSize: 'var(--fs-xs)', color: C.slate, opacity: 0.7 }}>{k.d}</div>
            </div>
          ))}
        </div>

        {/* Gráfico */}
        <div style={{ height: 'clamp(200px,25vw,300px)', marginBottom: 16 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={olaData} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="olaGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={C.stone} stopOpacity={0.1} />
                  <stop offset="40%" stopColor={C.volt} stopOpacity={0.15} />
                  <stop offset="55%" stopColor={C.volt} stopOpacity={0.4} />
                  <stop offset="70%" stopColor={C.volt} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={C.stone} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fill: C.stone, fontSize: 9, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} interval={6} />
              <YAxis tick={{ fill: C.stone, fontSize: 9 }} tickLine={false} axisLine={false} width={24} domain={[0,105]} />
              <Tooltip contentStyle={{ background: C.paper2, border: `1px solid ${C.stone}30`, fontFamily: 'Plus Jakarta Sans', fontSize: 11 }} formatter={(v) => [v, 'IBT']} />
              <ReferenceLine x="D+0" stroke={C.volt} strokeWidth={2} label={{ value: 'Carrera', fill: C.ink, fontSize: 9, fontFamily: 'Plus Jakarta Sans' }} />
              <ReferenceLine y={23.8} stroke={C.stone} strokeDasharray="4 3" strokeWidth={1} />
              <Line type="monotone" dataKey="ibt" stroke={C.ink} strokeWidth={2.5} dot={(p) => p.payload.dia_rel === 0 ? <circle key={p.key} cx={p.cx} cy={p.cy} r={5} fill={C.volt} stroke="none" /> : null} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 20, height: 2, background: C.ink }} />
            <span style={{ fontSize: 'var(--fs-xs)', color: C.slate }}>IBT Termas · diario</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 20, height: '1px', background: C.stone, borderTop: '1px dashed' }} />
            <span style={{ fontSize: 'var(--fs-xs)', color: C.slate }}>Baseline promedio (23.8)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.volt }} />
            <span style={{ fontSize: 'var(--fs-xs)', color: C.slate }}>Día de la carrera</span>
          </div>
        </div>
        <Interpretacion style={{ marginTop: 24 }}>
          La curva muestra cómo el interés por "Termas de Río Hondo" se construye orgánicamente en las 2 semanas previas a la carrera, alcanza un pico de 100 el día del evento, y sostiene niveles elevados por 10 días adicionales. Esto es el activo intangible del MotoGP: posicionamiento de destino que ninguna campaña publicitaria puede comprar. Fuente: Google Trends · elaboración propia.
        </Interpretacion>
      </section>

      </>
      }

      {/* ── LOS PUMAS PRE-EVENTO ── */}
      {evento === 'pumas' && <>

        <section style={{ background: C.paper, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#FFF3CD', padding: '6px 14px', marginBottom: 32 }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: '#856404' }}>⏳ PRE-EVENTO · PROYECCIÓN</span>
          </div>
          <SectionTitle main="Los Pumas vs Inglaterra." context="Nations Championship · 18 julio 2026 · Estadio Madre de Ciudades" style={{ marginBottom: 40 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,220px),1fr))', gap: 0 }}>
            {[
              { v: '18 jul', l: 'Fecha del evento', d: '2026 · 16hs' },
              { v: '30K', l: 'Capacidad estadio', d: 'ampliable a 42.000' },
              { v: 'Capital', l: 'Sede', d: 'Estadio Madre de Ciudades' },
              { v: 'Julio', l: 'Temporada', d: 'pico histórico · 88K viajeros' },
            ].map((k,i) => (
              <div key={i} style={{ padding: 'clamp(24px,3vw,36px)', borderRight: `0.5px solid ${C.stone}30`, borderBottom: `0.5px solid ${C.stone}30` }}>
                <div style={{ fontSize: 'clamp(1.7rem,3vw,3rem)', fontWeight: 200, color: C.ink, letterSpacing: '-0.045em', lineHeight: 1, marginBottom: 10 }}>{k.v}</div>
                <VoltLine w={20} />
                <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 400, color: C.ink, marginTop: 10, marginBottom: 4 }}>{k.l}</div>
                <div style={{ fontSize: 'var(--fs-xs)', color: C.slate, opacity: 0.65 }}>{k.d}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ background: C.ink, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
          <SectionTitle light main="Comparativa vs MotoGP." context="Diferencias que afectan el cálculo de impacto" style={{ marginBottom: 40 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1 }}>
            {[
              { v: 'Variable', a: 'MotoGP', b: 'Los Pumas' },
              { v: 'Sede', a: 'Termas (13K plazas)', b: 'Capital (~3K plazas)' },
              { v: 'Mes', a: 'Marzo (temporada baja)', b: 'Julio (pico máximo)' },
              { v: 'Duración', a: '3-4 días', b: '1 día' },
              { v: 'Uplift esperado', a: '+17% sobre baseline', b: 'Difícil aislar en pico' },
              { v: 'IBT esperado', a: '3.3× baseline', b: '2-4× en Capital' },
              { v: 'Arrastre digital', a: '+12% · 10 días', b: 'A medir post-evento' },
            ].map((r,i) => (
              <div key={i} style={{
                display: 'contents',
              }}>
                <div style={{ padding: 'clamp(12px,1.5vw,18px) clamp(16px,2vw,24px)', background: i===0?'rgba(250,250,247,0.05)':'transparent', fontSize: i===0?9:'var(--fs-sm)', color: i===0?C.stone:C.paper, fontWeight: i===0?700:400, letterSpacing: i===0?'0.1em':'0', textTransform: i===0?'uppercase':'none', borderBottom: '0.5px solid rgba(250,250,247,0.06)' }}>{r.v}</div>
                <div style={{ padding: 'clamp(12px,1.5vw,18px) clamp(16px,2vw,24px)', background: i===0?'rgba(250,250,247,0.05)':'rgba(250,250,247,0.03)', fontSize: i===0?9:'var(--fs-sm)', color: i===0?C.stone:'rgba(250,250,247,0.6)', fontWeight: i===0?700:400, letterSpacing: i===0?'0.1em':'0', textTransform: i===0?'uppercase':'none', borderBottom: '0.5px solid rgba(250,250,247,0.06)' }}>{r.a}</div>
                <div style={{ padding: 'clamp(12px,1.5vw,18px) clamp(16px,2vw,24px)', background: i===0?'rgba(255,255,0,0.08)':'rgba(255,255,0,0.04)', fontSize: i===0?9:'var(--fs-sm)', color: i===0?C.volt:C.paper, fontWeight: i===0?700:400, letterSpacing: i===0?'0.1em':'0', textTransform: i===0?'uppercase':'none', borderBottom: '0.5px solid rgba(250,250,247,0.06)' }}>{r.b}</div>
              </div>
            ))}
          </div>
          <Interpretacion light style={{ marginTop: 32 }}>
            El partido de julio cae en pico de temporada — aislar el uplift turístico del evento requiere comparar contra semanas sin evento del mismo mes en años anteriores. La metodología DiD aplica, pero el counterfactual debe ajustarse por estacionalidad.
          </Interpretacion>
        </section>

        <section style={{ background: C.paper2, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
          <SectionTitle main="Plan de medición." context="Variables · ventana temporal · fuentes" style={{ marginBottom: 40 }} />
          {[
            { fase: 'PRE-EVENTO', dias: '11–17 jul', items: ['IBT "Santiago del Estero" baseline semanal', 'Ocupación hotelera Capital semanas previas', 'Pasajeros ANAC entrada semanas J-2 y J-1'] },
            { fase: 'EVENTO', dias: '18 jul', items: ['IBT peak día del partido', 'Pasajeros ANAC día del partido vs días normales', 'Búsquedas "Los Pumas" + "Santiago del Estero"'] },
            { fase: 'POST-EVENTO', dias: '19–31 jul', items: ['Ola de arrastre IBT: días D+1 a D+14', 'Ocupación hotelera semanas siguientes', 'Uplift vs misma semana 2025 y 2024 (sin evento)'] },
          ].map((f,i) => (
            <div key={i} style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.volt, background: C.ink, padding: '3px 10px' }}>{f.fase}</span>
                <span style={{ fontSize: 'var(--fs-xs)', color: C.slate }}>{f.dias}</span>
              </div>
              {f.items.map((item,j) => (
                <div key={j} style={{ display: 'flex', gap: 12, marginBottom: 10, alignItems: 'flex-start' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.stone, flexShrink: 0, marginTop: 6 }} />
                  <span style={{ fontSize: 'var(--fs-sm)', color: C.slate, lineHeight: 1.6 }}>{item}</span>
                </div>
              ))}
            </div>
          ))}
          <div style={{ padding: 'clamp(20px,2.5vw,28px)', background: C.paper, border: `1px solid ${C.stone}30`, marginTop: 16 }}>
            <div style={{ fontSize: 9, color: C.volt, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8, background: C.ink, display: 'inline-block', padding: '2px 8px' }}>Pendiente post-evento</div>
            <p style={{ fontSize: 'var(--fs-sm)', color: C.slate, lineHeight: 1.7, margin: 0 }}>
              Los resultados reales se cargarán después del 18 de julio de 2026. El análisis post-evento comparará las proyecciones con los datos reales de ANAC, IBT y EOH/OLS — completando la ficha con el impacto medido.
            </p>
          </div>
        </section>

      </>}

    </>
  )
}
