import { useMemo } from 'react'
import { ComposedChart, Area, Bar, Line, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { useCSV, fmt } from '../hooks/useCSV'
import { C, Paralelo, VoltLine, Eyebrow, SectionTitle, Interpretacion, Loading, ICONS } from '../components/Atoms'

const VIDEO_URL = 'https://www.pexels.com/download/video/36865241/'

function KPICard({ value, label, delta, positive }) {
  const color = positive === undefined ? C.ink : positive ? C.ink : C.slate
  return (
    <div style={{ borderLeft: '1px solid '+C.stone, paddingLeft: 'clamp(14px,2vw,24px)' }}>
      <div style={{ fontSize: 'clamp(1.7rem,3vw,3rem)', fontWeight: 200, color, letterSpacing: '-0.045em', lineHeight: 1, marginBottom: 10 }}>{value}</div>
      <VoltLine w={20} />
      <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 400, color: C.ink, marginTop: 10, marginBottom: 4 }}>{label}</div>
      {delta && <div style={{ fontSize: 'var(--fs-xs)', color: C.slate, opacity: 0.65 }}>{delta}</div>}
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

export default function Nacional() {
  const { data: raw, loading } = useCSV('/data/data_macro.csv')

  const datos = useMemo(() => raw
    .filter(r => Number(r.flag_covid) === 0)
    .map(r => ({
      fecha: r.fecha,
      label: new Date(r.fecha).toLocaleDateString('es-AR', { month: 'short', year: '2-digit' }),
      anio: Number(r.anio),
      receptivo: Number(r.receptivo_total) || 0,
      emisivo: Number(r.emisivo_total) || 0,
      saldo: Number(r.saldo_balanza) || 0,
      tcn: Number(r.tcn_usd) || 0,
    }))
    .sort((a,b) => a.fecha > b.fecha ? 1 : -1)
  , [raw])

  const ultimo = datos.length ? datos[datos.length - 1] : {}
  const fechaActual = ultimo.fecha ? new Date(ultimo.fecha).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }) : '—'
  const saldoPositivo = (ultimo.saldo || 0) > 0

  const serieAnual = useMemo(() => {
    const m = {}
    datos.forEach(r => {
      if (!m[r.anio]) m[r.anio] = { anio: r.anio, label: String(r.anio), receptivo: 0, emisivo: 0, saldo: 0 }
      m[r.anio].receptivo += r.receptivo
      m[r.anio].emisivo += r.emisivo
      m[r.anio].saldo += r.saldo
    })
    return Object.values(m).sort((a,b) => a.anio - b.anio)
  }, [datos])

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
            <Paralelo /><Eyebrow light>ETI + BCRA · Capa 4 · Decisión</Eyebrow>
          </div>
          <h1 style={{ fontSize: 'clamp(2.4rem,5vw,5rem)', fontWeight: 200, color: C.paper, letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 16px' }}>Contexto<br />Nacional.</h1>
          <p style={{ fontSize: '0.9rem', fontWeight: 300, color: C.paper, opacity: 0.6, maxWidth: 480, lineHeight: 1.65, margin: 0 }}>Turismo receptivo y emisivo de Argentina. Balanza turística, tipo de cambio y contexto macro. Fuentes: ETI INDEC + BCRA.</p>
        </div>
      </section>

      <section style={{ background: C.paper, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <Eyebrow style={{ marginBottom: 52 }}>Contexto macro · {fechaActual}</Eyebrow>
        <div className="grid-kpi">
          <KPICard value={fmt(ultimo.receptivo)} label="Turistas receptivos" delta={'extranjeros que entran · '+fechaActual} />
          <KPICard value={fmt(ultimo.emisivo)} label="Turistas emisivos" delta={'argentinos que salen · '+fechaActual} />
          <KPICard
            value={(ultimo.saldo < 0 ? '−' : '+') + fmt(Math.abs(ultimo.saldo||0))}
            label={'Balanza '+(saldoPositivo ? 'superavitaria' : 'deficitaria')}
            delta={'saldo '+(saldoPositivo ? 'positivo' : 'negativo')+' de divisas'}
            positive={saldoPositivo}
          />
          <KPICard value={'$'+fmt(ultimo.tcn||0)} label="Tipo de cambio oficial" delta={'ARS/USD · '+fechaActual} />
        </div>
        <Interpretacion texto={'En '+fechaActual+', Argentina recibe '+fmt(ultimo.receptivo)+' turistas internacionales y '+fmt(ultimo.emisivo)+' argentinos viajan al exterior. La balanza turística es '+(saldoPositivo?'superavitaria':'deficitaria')+'. El tipo de cambio oficial es $'+fmt(ultimo.tcn)+' ARS/USD. Fuente: ETI INDEC + BCRA.'} />
      </section>

      {/* RECEPTIVO VS EMISIVO */}
      <section style={{ background: C.ink, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 48, flexWrap: 'wrap', gap: 20 }}>
          <SectionTitle icon={ICONS.viajeros} context="Serie mensual ETI · 2016–2026" main="Receptivo vs Emisivo" light />
          <div style={{ display: 'flex', gap: 20, paddingTop: 4 }}>
            {[{c:C.paper,l:'Receptivo'},{c:C.stone,l:'Emisivo',dash:true}].map((x,i)=>(
              <div key={i} style={{ display:'flex', gap:6, alignItems:'center' }}>
                <div style={{ width:16, height:1.5, background:x.c, opacity:x.dash?0.5:1 }} />
                <Eyebrow light style={{ opacity:0.45 }}>{x.l}</Eyebrow>
              </div>
            ))}
          </div>
        </div>
        <div style={{ height: 'clamp(200px,26vw,300px)' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={datos} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gRec" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.paper} stopOpacity={0.12} />
                  <stop offset="100%" stopColor={C.paper} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fill: C.stone, fontSize: 10, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} interval={11} />
              <YAxis tick={{ fill: C.stone, fontSize: 10, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} tickFormatter={v=>fmt(v)} width={56} />
              <Tooltip content={<Tip />} cursor={{ stroke: 'rgba(250,250,247,0.07)', strokeWidth: 1 }} />
              <Area type="monotone" dataKey="receptivo" name="Receptivo" stroke={C.paper} strokeWidth={1.5} fill="url(#gRec)" dot={false} activeDot={{ r:3, fill:C.volt, strokeWidth:0 }} />
              <Line type="monotone" dataKey="emisivo" name="Emisivo" stroke={C.stone} strokeWidth={1.5} dot={false} strokeDasharray="5 3" strokeOpacity={0.6} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <Interpretacion light texto="El turismo receptivo internacional es un indicador de competitividad de Argentina. Cuando el peso se deprecia, Argentina se vuelve barata en dólares y aumenta el receptivo. Esta dinámica define el entorno macro en el que opera el turismo interno de SDE." />
      </section>

      {/* SALDO DIVISAS — dark, barras paper=superávit / slate=déficit, eje en 0 */}
      <section style={{ background: C.ink, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <SectionTitle icon={ICONS.ibt} context="Balanza turística anual" main="Saldo divisas turísticas" light style={{ marginBottom: 40 }} />
        <div style={{ height: 'clamp(200px,26vw,300px)' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={serieAnual} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fill: C.stone, fontSize: 11, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: C.stone, fontSize: 10, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} tickFormatter={v=>fmt(v)} width={60} />
              <Tooltip content={<Tip />} cursor={{ fill: 'rgba(250,250,247,0.04)' }} />
              <ReferenceLine y={0} stroke="rgba(250,250,247,0.4)" strokeWidth={1.5} />
              <Bar dataKey="saldo" name="Saldo" radius={[3,3,0,0]}>
                {serieAnual.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.saldo >= 0 ? 'rgba(250,250,247,0.55)' : C.slate}
                    fillOpacity={0.9}
                  />
                ))}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
          {[{c:'rgba(250,250,247,0.55)',l:'Superávit'},{c:C.slate,l:'Déficit'}].map((x,i)=>(
            <div key={i} style={{ display:'flex', gap:6, alignItems:'center' }}>
              <div style={{ width:10, height:10, background:x.c, borderRadius:2 }} />
              <Eyebrow light style={{ opacity:0.55 }}>{x.l}</Eyebrow>
            </div>
          ))}
        </div>
        <Interpretacion light texto='La balanza turística mide el saldo entre ingresos (turistas extranjeros en Argentina) y egresos (argentinos en el exterior). Las barras oscuras (déficit) indican que Argentina pierde divisas por turismo ese año. El eje en cero marca el punto de equilibrio. Fuente: ETI INDEC.' />
      </section>

      <section style={{ background: C.paper, padding: 'clamp(40px,5vw,64px) var(--pad)' }}>
        <Interpretacion>
          La balanza turística nacional muestra el contexto macroeconómico en el que opera
          el turismo de SDE. La variación del tipo de cambio afecta directamente la
          competitividad frente al turismo emisivo. El turismo receptivo internacional
          es marginal para SDE — el destino es predominantemente doméstico y regional.
          La fortaleza del observatorio provincial es precisamente esa: independencia del
          ciclo internacional y enfoque en la demanda interna NOA y Buenos Aires.
        </Interpretacion>
      </section>
    </>
  )
}
