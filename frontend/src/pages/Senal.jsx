import { useMemo } from 'react'
import { ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { useCSV, fmt } from '../hooks/useCSV'
import { C, Paralelo, VoltLine, Eyebrow, SectionTitle, Interpretacion, Loading, ICONS } from '../components/Atoms'

const VIDEO_URL = 'https://www.pexels.com/es-es/download/video/17599627/'

function KPICard({ value, label, delta, accent }) {
  return (
    <div style={{ borderLeft: '1px solid '+C.stone, paddingLeft: 'clamp(14px,2vw,24px)' }}>
      <div style={{ fontSize: 'clamp(1.7rem,3vw,3rem)', fontWeight: 200, color: accent ? C.volt : C.ink, letterSpacing: '-0.045em', lineHeight: 1, marginBottom: 10 }}>{value}</div>
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
      {payload.filter(p => p.dataKey !== 'ic_high').map((p,i) => (
        <div key={i} style={{ fontSize: 'var(--fs-sm)', color: p.color||C.paper, fontWeight: 300 }}>{p.name}: {fmt(p.value)}</div>
      ))}
    </div>
  )
}

export default function Senal() {
  const { data: rawEst, loading } = useCSV('/data/data_pulso_estimado.csv')

  const termas = useMemo(() => rawEst
    .filter(r => r.localidad === 'Termas')
    .map(r => ({
      fecha: r.fecha,
      label: new Date(r.fecha+'T12:00:00').toLocaleDateString('es-AR', { month: 'short', year: '2-digit' }),
      ibt: Number(r.ibt_termas) || null,
      ibt_comp: Number(r.ibt_compuesto) || null,
      occ: Number(r.occ_informal_pct) || null,
      viajeros: Number(r.viajeros) || null,
      ic_low: Number(r.viajeros_ic_low) || null,
      ic_high: Number(r.viajeros_ic_high) || null,
      flag_est: Number(r.flag_estimado) === 1,
      anio: Number(r.anio),
    }))
    .sort((a,b) => a.fecha > b.fecha ? 1 : -1)
  , [rawEst])

  const ultimo = termas.length ? termas[termas.length - 1] : {}
  const ultimoIbt = [...termas].reverse().find(r => r.ibt !== null) || {}
  const fechaActual = ultimo.fecha ? new Date(ultimo.fecha).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }) : '—'
  const tendencia = termas.slice(-3).filter(r => r.occ !== null)
  const occTrend = tendencia.length >= 2 ? tendencia[tendencia.length-1].occ - tendencia[0].occ : 0

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
            <Paralelo /><Eyebrow light>Google Trends + AirROI · Capa 2 · Senales</Eyebrow>
          </div>
          <h1 style={{ fontSize: 'clamp(2.4rem,5vw,5rem)', fontWeight: 200, color: C.paper, letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 16px' }}>Señal<br />Anticipada.</h1>
          <p style={{ fontSize: '0.9rem', fontWeight: 300, color: C.paper, opacity: 0.6, maxWidth: 480, lineHeight: 1.65, margin: 0 }}>Indicadores adelantados de demanda turistica. El IBT (Indice de Busqueda Turistica) y la ocupacion informal anticipan la actividad hotelera 4-8 semanas antes.</p>
        </div>
      </section>

      <section style={{ background: C.paper, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <Eyebrow style={{ marginBottom: 52 }}>Senales · {fechaActual}</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0 clamp(14px,4vw,56px)' }}>
          <KPICard value={ultimoIbt.ibt !== null ? ultimoIbt.ibt : '—'} label="IBT Termas (Google Trends)" delta={'ultimo dato: '+( ultimoIbt.fecha ? new Date(ultimoIbt.fecha).toLocaleDateString('es-AR',{month:'short',year:'numeric'}) : '—')} />
          <KPICard value={ultimo.occ !== null ? ultimo.occ+'%' : '—'} label="Ocupacion informal Termas" delta={'AirROI · '+fechaActual} accent={ultimo.occ > 40} />
          <KPICard value={occTrend !== 0 ? (occTrend > 0 ? '+' : '')+occTrend.toFixed(1)+' pp' : '—'} label="Tendencia ocupacion" delta="variacion ultimos 3 meses" accent={occTrend > 0} />
          <KPICard value={ultimo.viajeros ? fmt(ultimo.viajeros) : '—'} label="Viajeros estimados" delta={'IC: '+fmt(ultimo.ic_low)+' — '+fmt(ultimo.ic_high)} />
        </div>
        <Interpretacion texto={'El IBT mide el interes de busqueda en Google por "Termas de Rio Hondo" (escala 0-100, relativa al pico historico). Un IBT elevado anticipa mayor demanda hotelera en las proximas 4-8 semanas. La ocupacion informal de AirROI complementa la señal digital con comportamiento real del mercado de alquiler temporario.'} />
      </section>

      <section style={{ background: C.ink, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 48, flexWrap: 'wrap', gap: 20 }}>
          <SectionTitle icon={ICONS.ibt} context="IBT + ocupacion informal + viajeros estimados" main="Panel de señales anticipadas" light />
          <div style={{ display: 'flex', gap: 20, paddingTop: 4 }}>
            {[{c:C.volt,l:'IBT'},{c:'rgba(250,250,247,0.5)',l:'Occ. informal'},{c:C.paper,l:'Viajeros est.'}].map((x,i)=>(
              <div key={i} style={{ display:'flex', gap:6, alignItems:'center' }}>
                <div style={{ width:12, height:2, background:x.c }} />
                <Eyebrow light style={{ opacity:0.45 }}>{x.l}</Eyebrow>
              </div>
            ))}
          </div>
        </div>
        <div style={{ height: 'clamp(220px,28vw,340px)' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={termas.filter(r => r.anio >= 2021)} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gIBT" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.volt} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={C.volt} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fill: C.stone, fontSize: 10, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} interval={3} />
              <YAxis yAxisId="ibt" tick={{ fill: C.stone, fontSize: 10, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} width={32} />
              <YAxis yAxisId="viajeros" orientation="right" tick={{ fill: C.stone, fontSize: 10, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} tickFormatter={v => fmt(v)} width={52} />
              <Tooltip content={<Tip />} cursor={{ stroke: 'rgba(250,250,247,0.07)', strokeWidth: 1 }} />
              <Area yAxisId="ibt" type="monotone" dataKey="ibt" name="IBT" stroke={C.volt} strokeWidth={1.5} fill="url(#gIBT)" dot={false} connectNulls />
              <Line yAxisId="ibt" type="monotone" dataKey="occ" name="Occ. informal %" stroke="rgba(250,250,247,0.45)" strokeWidth={1.5} dot={false} connectNulls strokeDasharray="4 2" />
              <Line yAxisId="viajeros" type="monotone" dataKey="viajeros" name="Viajeros est." stroke={C.paper} strokeWidth={1} dot={false} connectNulls strokeOpacity={0.6} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <Interpretacion light texto="Las tres señales actuan en capas: el IBT (Google Trends) detecta interes 4-8 semanas antes del viaje. La ocupacion informal de AirROI confirma la señal 2-4 semanas antes. El estimado OLS integra ambas señales para proyectar viajeros hoteleros. La convergencia de las tres señales al alza es la señal mas robusta de alta temporada." />
      </section>

      <section style={{ background: C.paper, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <SectionTitle icon={ICONS.ibt} context="Como leer las senales" main="Guia de interpretacion" style={{ marginBottom: 40 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'clamp(16px,2.5vw,40px)' }}>
          {[
            { n: '01', titulo: 'IBT alto (>60)', señal: 'Alta demanda en 4-8 semanas', accion: 'Verificar disponibilidad. Anticipar precios. Comunicar al sector.', color: C.volt },
            { n: '02', titulo: 'Occ. informal >35%', señal: 'Mercado alternativo saturado', accion: 'Señal de desborde hacia hoteles. Revisar tarifas. Abrir disponibilidad.', color: C.paper },
            { n: '03', titulo: 'Ambas señales bajas', señal: 'Temporada baja confirmada', accion: 'Oportunidad para mantenimiento, capacitacion y preparacion de temporada.', color: C.stone },
          ].map((item,i) => (
            <div key={i} style={{ padding: 'clamp(20px,2.5vw,32px)', border: '0.5px solid '+C.stone, borderTop: '2px solid '+item.color }}>
              <div style={{ fontSize: 'clamp(1.5rem,2.5vw,3rem)', fontWeight: 200, color: C.stone, letterSpacing: '-0.05em', opacity: 0.2, marginBottom: 12 }}>{item.n}</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 500, color: C.ink, marginBottom: 10 }}>{item.titulo}</div>
              <div style={{ fontSize: 'var(--fs-base)', color: C.slate, marginBottom: 14, lineHeight: 1.6 }}>{item.señal}</div>
              <div style={{ fontSize: 'var(--fs-base)', color: C.ink, lineHeight: 1.6, borderLeft: '2px solid '+item.color, paddingLeft: 10 }}>{item.accion}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
