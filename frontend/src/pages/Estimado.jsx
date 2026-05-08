import { useMemo } from 'react'
import { ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { useCSV, fmt } from '../hooks/useCSV'
import { C, Paralelo, VoltLine, Eyebrow, SectionTitle, Interpretacion, Loading, ICONS } from '../components/Atoms'

const VIDEO_URL = 'https://www.pexels.com/es-es/download/video/9365669/'

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
      {payload.filter(p => !['ic_high','ic_low'].includes(p.dataKey)).map((p,i) => (
        <div key={i} style={{ fontSize: 'var(--fs-sm)', color: p.color||C.paper, fontWeight: 300, marginBottom: 2 }}>
          {p.name}: {fmt(p.value)}
        </div>
      ))}
    </div>
  )
}

export default function Estimado() {
  const { data: rawEst, loading: l1 } = useCSV('/data/data_pulso_estimado.csv')
  const { data: rawObs, loading: l2 } = useCSV('/data/data_pulso.csv')

  const obs = useMemo(() => rawObs
    .filter(r => r.localidad === 'Termas' && Number(r.flag_covid) === 0)
    .map(r => ({
      fecha: r.fecha,
      label: new Date(r.fecha+'T12:00:00').toLocaleDateString('es-AR', { month: 'short', year: '2-digit' }),
      viajeros_obs: Number(r.viajeros_total) || null,
      anio: Number(r.anio),
    }))
    .sort((a,b) => a.fecha > b.fecha ? 1 : -1)
  , [rawObs])

  const est = useMemo(() => rawEst
    .filter(r => r.localidad === 'Termas')
    .map(r => ({
      fecha: r.fecha,
      label: new Date(r.fecha+'T12:00:00').toLocaleDateString('es-AR', { month: 'short', year: '2-digit' }),
      viajeros_est: Number(r.viajeros) || null,
      ic_low: Number(r.viajeros_ic_low) || null,
      ic_high: Number(r.viajeros_ic_high) || null,
      viajeros_fit: Number(r.viajeros_fit) || null,
      anio: Number(r.anio),
    }))
    .sort((a,b) => a.fecha > b.fecha ? 1 : -1)
  , [rawEst])

  // EOH cutoff — last observed data point
  const corte = obs.length ? obs[obs.length - 1].fecha : null

  const serie = useMemo(() => {
    const map = {}
    obs.forEach(r => { map[r.fecha] = { ...r } })
    est.forEach(r => {
      if (!map[r.fecha]) map[r.fecha] = { fecha: r.fecha, label: r.label, anio: r.anio }
      map[r.fecha].viajeros_est = r.viajeros_est
      map[r.fecha].ic_low = r.ic_low
      map[r.fecha].ic_high = r.ic_high
      map[r.fecha].viajeros_fit = r.viajeros_fit
    })
    return Object.values(map)
      .sort((a,b) => a.fecha > b.fecha ? 1 : -1)
      .filter(r => r.anio >= 2018)
      .map(r => ({
        ...r,
        // Only show estimated line AFTER EOH cutoff — avoids overlap with observed
        viajeros_est: (!corte || r.fecha > corte) ? r.viajeros_est : null,
        ic_low:       (!corte || r.fecha > corte) ? r.ic_low  : null,
        ic_high:      (!corte || r.fecha > corte) ? r.ic_high : null,
        // In-sample fit — only BEFORE cutoff
        viajeros_fit: (corte && r.fecha <= corte) ? (Number(r.viajeros_fit) || null) : null,
      }))
  }, [obs, est, corte])

  const ultimoEst = est.length ? est[est.length - 1] : {}
  const metrica = rawEst.find(r => r.localidad === 'Termas' && r.modelo_r2) || {}
  const fechaEst = ultimoEst.fecha ? new Date(ultimoEst.fecha).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }) : '—'

  if (l1 || l2) return <Loading />

  return (
    <>
      <section style={{ position: 'relative', minHeight: '42vh', overflow: 'hidden', padding: 'clamp(64px,8vw,96px) var(--pad) clamp(48px,6vw,72px)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <video autoPlay loop muted playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}>
          <source src={VIDEO_URL} type="video/mp4" />
        </video>
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to right, rgba(10,10,10,0.93) 0%, rgba(10,10,10,0.78) 35%, rgba(10,10,10,0.38) 65%, rgba(10,10,10,0.10) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 3 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <Paralelo /><Eyebrow light>Modelo OLS · Capa 4 · Decisión</Eyebrow>
          </div>
          <h1 style={{ fontSize: 'clamp(2.4rem,5vw,5rem)', fontWeight: 200, color: C.paper, letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 16px' }}>Pulso<br />Estimado.</h1>
          <p style={{ fontSize: '0.9rem', fontWeight: 300, color: C.paper, opacity: 0.6, maxWidth: 480, lineHeight: 1.65, margin: 0 }}>Extensión del pulso turístico via modelo OLS calibrado con ANAC, AirROI, IPC y Google Trends. Permite estimar viajeros hoteleros post-discontinuación de la EOH (INDEC, dic 2025).</p>
        </div>
      </section>

      <section style={{ background: C.paper, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <Eyebrow style={{ marginBottom: 52 }}>Estimación · Termas de Río Hondo · {fechaEst}</Eyebrow>
        <div className="grid-kpi">
          <KPICard icon={ICONS.viajeros} value={fmt(ultimoEst.viajeros_est ?? 0)} label="Viajeros estimados" delta={'IC: '+fmt(ultimoEst.ic_low)+' — '+fmt(ultimoEst.ic_high)} />
          <KPICard icon={ICONS.ibt} value={metrica.modelo_r2 ? 'R²='+Number(metrica.modelo_r2).toFixed(3) : '—'} label="Ajuste del modelo" delta="regresión OLS · Termas" />
          <KPICard icon={ICONS.ibt} value={metrica.modelo_mae ? fmt(Number(metrica.modelo_mae),0) : '—'} label="Error medio (MAE)" delta="en número de viajeros" />
          <KPICard icon={ICONS.pernoctaciones} value="Nov 2025" label="Último dato observado" delta="EOH INDEC discontinuada" />
        </div>
        <Interpretacion texto={'El modelo estima '+fmt(ultimoEst.viajeros_est)+' viajeros hoteleros en Termas de Río Hondo en '+fechaEst+'. Intervalo de confianza: ['+fmt(ultimoEst.ic_low)+', '+fmt(ultimoEst.ic_high)+']. El modelo tiene R²='+Number(metrica.modelo_r2||0).toFixed(3)+' calibrado sobre la serie EOH 2018–2025.'} />
      </section>

      <section style={{ background: C.ink, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 48, flexWrap: 'wrap', gap: 20 }}>
          <SectionTitle icon={ICONS.viajeros} context="Serie observada EOH + estimada OLS" main="Viajeros hoteleros Termas" light />
          <div style={{ display: 'flex', gap: 20, paddingTop: 4, flexWrap: 'wrap' }}>
            {[
              {c: C.paper,    l: 'Observado (EOH)', dash: false},
              {c: C.volt,     l: 'Estimado (OLS)',  dash: true},
              {c: `${C.volt}80`, l: 'Ajuste histórico', dash: true},
              {c: 'rgba(255,255,0,0.12)', l: 'IC 80%', area: true},
            ].map((x,i) => (
              <div key={i} style={{ display:'flex', gap:7, alignItems:'center' }}>
                {x.area
                  ? <div style={{ width:16, height:10, background:x.c, borderRadius:2 }} />
                  : <div style={{ width:16, height:1.5, background:x.c, opacity:x.dash?0.9:0.7,
                      borderTopStyle:x.dash?'dashed':'solid', borderTopWidth:2, borderTopColor:x.c }} />
                }
                <Eyebrow light style={{ opacity:0.45 }}>{x.l}</Eyebrow>
              </div>
            ))}
          </div>
        </div>
        <div style={{ height: 'clamp(220px,28vw,340px)' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={serie} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gIC" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.volt} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={C.volt} stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fill: C.stone, fontSize: 10, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} interval={5} />
              <YAxis tick={{ fill: C.stone, fontSize: 10, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} tickFormatter={v => fmt(v)} width={56} />
              <Tooltip content={<Tip />} cursor={{ stroke: 'rgba(250,250,247,0.07)', strokeWidth: 1 }} />
              {corte && (
                <ReferenceLine
                  x={new Date(corte).toLocaleDateString('es-AR', { month: 'short', year: '2-digit' })}
                  stroke="rgba(250,250,247,0.35)" strokeDasharray="4 3"
                  label={{ value: 'EOH off', fill: C.stone, fontSize: 9, fontFamily: 'Plus Jakarta Sans', position: 'insideTopRight' }}
                />
              )}
              {/* IC band — only after cutoff */}
              <Area type="monotone" dataKey="ic_high" fill="url(#gIC)" stroke="none" legendType="none" />
              <Area type="monotone" dataKey="ic_low" fill={C.ink} stroke="none" legendType="none" />
              {/* Observed line — full history */}
              <Line type="monotone" dataKey="viajeros_obs" stroke={C.paper} strokeWidth={2.5} dot={false} name="Observado" connectNulls={false} activeDot={{ r:3, fill:C.paper, strokeWidth:0 }} />
              {/* In-sample fit — historical period only */}
              <Line type="monotone" dataKey="viajeros_fit" stroke={C.volt} strokeWidth={1.5} dot={false} strokeDasharray="3 3" strokeOpacity={0.55} name="Ajuste histórico" connectNulls activeDot={{ r:3, fill:C.volt, strokeWidth:0 }} />
              {/* Estimated line — only after cutoff (null before) */}
              <Line type="monotone" dataKey="viajeros_est" stroke={C.volt} strokeWidth={2.5} dot={false} strokeDasharray="6 3" name="Estimado" connectNulls activeDot={{ r:4, fill:C.volt, strokeWidth:0 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <Interpretacion light texto="La línea blanca muestra viajeros observados (EOH INDEC, hasta nov 2025). La línea amarilla es la extensión estimada por el modelo OLS desde dic 2025. La banda sombreada representa el intervalo de confianza del 80%. La línea vertical marca el corte de la EOH." />
      </section>

      <section style={{ background: C.paper, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <SectionTitle icon={ICONS.ibt} context="Metodología" main="Cómo funciona el modelo" style={{ marginBottom: 40 }} />
        <div className="grid-3col">
          {[
            { num: '01', titulo: 'Predictores', desc: 'Pasajeros aéreos (ANAC), ocupación informal (AirROI), IBT Google Trends, IPC R+H NOA, tipo de cambio (BCRA), estacionalidad y empleo HyG (SIPA).' },
            { num: '02', titulo: 'Calibración', desc: 'Regresión OLS entrenada sobre la serie EOH 2018–2025 con exclusión del período COVID (2020–2021). R²=0.868 en Termas, R²=0.808 en Santiago Capital.' },
            { num: '03', titulo: 'Limitaciones', desc: 'El modelo es un proxy operacional. No reemplaza la medición directa. La amplitud del IC refleja la incertidumbre real. Se recalibra cuando vuelva información oficial.' },
          ].map((item, i) => (
            <div key={i} style={{ borderTop: '2px solid '+C.stone, paddingTop: 20 }}>
              <div style={{ fontSize: 'clamp(2rem,3vw,3.5rem)', fontWeight: 200, color: C.stone, letterSpacing: '-0.05em', opacity: 0.25, marginBottom: 12 }}>{item.num}</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 500, color: C.ink, marginBottom: 10 }}>{item.titulo}</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 300, color: C.slate, lineHeight: 1.65 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: C.paper, padding: 'clamp(40px,5vw,64px) var(--pad)' }}>
        <Interpretacion>
          El modelo OLS estima para Termas en abril 2026: 24.769 viajeros (IC 11.000–38.538).
          El intervalo de confianza refleja la alta variabilidad del destino termal —
          más sensible a eventos, clima y estacionalidad que la Capital, cuyo IC es más acotado.
          El modelo opera con R²=0.868 sobre datos históricos EOH 2018–2025.
          La estimación es el único indicador que cubre el período post-EOH (desde dic 2025).
          Incorporar N2 fiscal y encuesta directa en terminales podría acotar el IC a ±20–25%.
        </Interpretacion>
      </section>
    </>
  )
}
