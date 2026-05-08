import { useMemo } from 'react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useCSV, fmt } from '../hooks/useCSV'
import { usePeriodo } from '../context/PeriodoContext'
import { C, Paralelo, VoltLine, Eyebrow, SectionTitle, Interpretacion, Loading, ICONS } from '../components/Atoms'

const VIDEO_URL = 'https://www.pexels.com/download/video/7616840/'

function KPICard({ icon: Icon, value, label, delta }) {
  return (
    <div style={{ borderLeft: '1px solid '+C.stone, paddingLeft: 'clamp(14px,2vw,24px)' }}>
      {Icon && <Icon size={23} strokeWidth={1.4} style={{ color: C.slate, opacity: 0.6, marginBottom: 12, display: 'block' }} />}
      <div style={{ fontSize: 'clamp(1.7rem,3vw,3rem)', fontWeight: 200, color: C.ink, letterSpacing: '-0.045em', lineHeight: 1, marginBottom: 10 }}>{value}</div>
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
      {payload.map((p, i) => <div key={i} style={{ fontSize: 'var(--fs-sm)', color: C.paper, fontWeight: 300 }}>{p.name}: {fmt(p.value)}</div>)}
    </div>
  )
}

const CATS = ['MotoGP','Termas','Santiago','Otro']
const CAT_COLORS = { MotoGP: C.volt, Termas: C.paper, Santiago: C.stone, Otro: 'rgba(250,250,247,0.2)' }

export default function Imagen() {
  const { anio } = usePeriodo()
  const { data: raw, loading } = useCSV('/data/data_youtube.csv')

  const datos = useMemo(() => raw.map(r => ({
    ...r,
    fecha: r.fecha,
    label: new Date(r.fecha+'T12:00:00').toLocaleDateString('es-AR', { month: 'short', year: '2-digit' }),
    videos: Number(r.videos_publicados) || 0,
    vistas: Number(r.vistas_totales) || 0,
    likes: Number(r.likes_totales) || 0,
    comentarios: Number(r.comentarios_totales) || 0,
    engagement: Number(r.engagement_promedio) || 0,
    anio: Number(r.anio),
    mes: Number(r.mes),
  })), [raw])

  const filtrado = useMemo(() => anio ? datos.filter(r => r.anio === anio) : datos, [datos, anio])

  const porFecha = useMemo(() => {
    const m = {}
    filtrado.forEach(r => {
      if (!m[r.fecha]) m[r.fecha] = { fecha: r.fecha, label: r.label, anio: r.anio, vistas: 0, videos: 0, likes: 0 }
      m[r.fecha].vistas += r.vistas
      m[r.fecha].videos += r.videos
      m[r.fecha].likes += r.likes
    })
    return Object.values(m).sort((a,b) => a.fecha > b.fecha ? 1 : -1)
  }, [filtrado])

  const porCategoria = useMemo(() => {
    const m = {}
    filtrado.forEach(r => {
      if (!m[r.categoria]) m[r.categoria] = { categoria: r.categoria, vistas: 0, videos: 0 }
      m[r.categoria].vistas += r.vistas
      m[r.categoria].videos += r.videos
    })
    return Object.values(m).sort((a,b) => b.vistas - a.vistas)
  }, [filtrado])

  const totales = useMemo(() => ({
    vistas: filtrado.reduce((a,b) => a + b.vistas, 0),
    videos: filtrado.reduce((a,b) => a + b.videos, 0),
    likes: filtrado.reduce((a,b) => a + b.likes, 0),
    engagement: filtrado.length ? (filtrado.reduce((a,b) => a + b.engagement, 0) / filtrado.length).toFixed(2) : 0,
  }), [filtrado])

  const ultimo = porFecha.length ? porFecha[porFecha.length - 1] : {}
  const fechaActual = ultimo.fecha ? new Date(ultimo.fecha).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }) : 'Todo el periodo'
  const topTitulo = filtrado.reduce((a,b) => (Number(b.max_vistas_video)||0) > (Number(a.max_vistas_video)||0) ? b : a, {})

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
            <Paralelo /><Eyebrow light>YouTube · Capa 2 · Senales</Eyebrow>
          </div>
          <h1 style={{ fontSize: 'clamp(2.4rem,5vw,5rem)', fontWeight: 200, color: C.paper, letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 16px' }}>Imagen<br />del Destino.</h1>
          <p style={{ fontSize: '0.9rem', fontWeight: 300, color: C.paper, opacity: 0.6, maxWidth: 440, lineHeight: 1.65, margin: 0 }}>Presencia digital de Santiago del Estero y Termas de Rio Hondo en YouTube. Proxies de imagen, interes y narrativa del destino.</p>
        </div>
      </section>

      <section style={{ background: C.paper, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <Eyebrow style={{ marginBottom: 52 }}>Indicadores · {anio ? String(anio) : '2009-2026'}</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0 clamp(14px,4vw,56px)' }}>
          <KPICard icon={ICONS.ibt} value={fmt(totales.vistas)} label="Vistas totales" delta={anio ? String(anio) : 'serie completa 2009-2026'} />
          <KPICard icon={ICONS.ibt} value={fmt(totales.videos,0)} label="Videos publicados" delta="contenido sobre SDE en YouTube" />
          <KPICard icon={ICONS.ibt} value={fmt(totales.likes,0)} label="Likes acumulados" delta="engagement de la audiencia" />
          <KPICard icon={ICONS.ibt} value={totales.engagement+'%'} label="Engagement promedio" delta="likes+comentarios / vistas" />
        </div>
        <Interpretacion texto={'YouTube registra '+fmt(totales.videos,0)+' videos sobre Santiago del Estero y Termas de Rio Hondo'+(anio ? ' en '+anio : ' desde 2009')+', con '+fmt(totales.vistas)+' vistas totales. El engagement promedio es del '+totales.engagement+'%. Fuente: YouTube Data API v3.'} />
      </section>

      <section style={{ background: C.ink, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <SectionTitle icon={ICONS.ibt} context={anio ? 'Evolucion mensual '+anio : 'Serie 2009-2026'} main="Vistas en el tiempo" light style={{ marginBottom: 48 }} />
        <div style={{ height: 'clamp(200px,26vw,300px)' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={porFecha} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gYT" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.paper} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={C.paper} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fill: C.stone, fontSize: 10, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} interval={anio ? 1 : 11} />
              <YAxis tick={{ fill: C.stone, fontSize: 10, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} tickFormatter={v => fmt(v)} width={52} />
              <Tooltip content={<Tip />} cursor={{ stroke: 'rgba(250,250,247,0.07)', strokeWidth: 1 }} />
              <Area type="monotone" dataKey="vistas" name="Vistas" stroke={C.paper} strokeWidth={1.5} fill="url(#gYT)" dot={false} activeDot={{ r: 3, fill: C.volt, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <Interpretacion light texto="Los picos de vistas coinciden con los eventos MotoGP (2014-2019, 2023-2025) y con viralidad organica de videos de turismo termal. La serie permite detectar momentos de alta visibilidad del destino." />
      </section>

      <section style={{ background: C.paper, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px,5vw,72px)', alignItems: 'flex-start' }}>
          <div>
            <SectionTitle icon={ICONS.ibt} context={anio ? String(anio) : 'Serie completa'} main="Por categoria" style={{ marginBottom: 36 }} />
            <div>
              {porCategoria.map((cat, i) => {
                const maxV = porCategoria[0]?.vistas || 1
                const pct = Math.round((cat.vistas / maxV) * 100)
                const totalV = porCategoria.reduce((a,b) => a + b.vistas, 0)
                const pctTotal = totalV > 0 ? Math.round((cat.vistas / totalV) * 100) : 0
                const color = CAT_COLORS[cat.categoria] || C.stone
                return (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: 'clamp(28px,3vw,44px) 1fr clamp(60px,8vw,100px)', gap: 'clamp(12px,2vw,28px)', alignItems: 'center', padding: 'clamp(14px,2vw,20px) 0', borderBottom: '0.5px solid '+C.stone }}>
                    <div style={{ fontSize: 'clamp(1.5rem,2.5vw,3rem)', fontWeight: 200, color: C.stone, letterSpacing: '-0.05em', lineHeight: 1, opacity: 0.25 }}>
                      {String(i+1).padStart(2,'0')}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 400, color: C.ink, marginBottom: 8 }}>{cat.categoria}</div>
                      <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
                        <span style={{ fontSize: 'var(--fs-xs)', color: C.slate, opacity: 0.65 }}>{fmt(cat.videos,0)} videos</span>
                      </div>
                      <div style={{ height: 2, background: C.stone, borderRadius: 1, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: pct+'%', background: color }} />
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 'clamp(1rem,1.5vw,1.4rem)', fontWeight: 200, color: C.ink, letterSpacing: '-0.03em' }}>{fmt(cat.vistas)}</div>
                      <div style={{ fontSize: 'var(--fs-xs)', color: C.slate, opacity: 0.5 }}>{pctTotal}% del total</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <SectionTitle icon={ICONS.ibt} context="Video mas visto del periodo" main="Top contenido" style={{ marginBottom: 36 }} />
            {topTitulo.titulo_mas_visto && (
              <div style={{ padding: 'clamp(20px,3vw,36px)', border: '0.5px solid '+C.stone, borderTop: '2px solid '+C.volt }}>
                <Eyebrow style={{ marginBottom: 12, opacity: 0.5 }}>{topTitulo.categoria}</Eyebrow>
                <div style={{ fontSize: 'clamp(0.9rem,1.3vw,1.1rem)', fontWeight: 400, color: C.ink, lineHeight: 1.4, marginBottom: 20 }}>"{topTitulo.titulo_mas_visto}"</div>
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 'clamp(1.4rem,2.5vw,2.2rem)', fontWeight: 200, color: C.ink, letterSpacing: '-0.04em' }}>{fmt(topTitulo.max_vistas_video)}</div>
                    <Eyebrow style={{ opacity: 0.45, marginTop: 4 }}>vistas</Eyebrow>
                  </div>
                  <div>
                    <div style={{ fontSize: 'clamp(1.4rem,2.5vw,2.2rem)', fontWeight: 200, color: C.ink, letterSpacing: '-0.04em' }}>{topTitulo.engagement}%</div>
                    <Eyebrow style={{ opacity: 0.45, marginTop: 4 }}>engagement</Eyebrow>
                  </div>
                </div>
              </div>
            )}
            <Interpretacion texto="El contenido mas visto refleja la narrativa dominante del destino en el periodo. MotoGP genera picos de visibilidad global mientras el turismo termal sostiene una presencia organica continua." />
          </div>
        </div>
      </section>
    </>
  )
}
