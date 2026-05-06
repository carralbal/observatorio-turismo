import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { useCSV, fmt } from '../hooks/useCSV'
import { usePeriodo } from '../context/PeriodoContext'
import { C, Paralelo, VoltLine, Eyebrow, SectionTitle, Interpretacion, Loading, ICONS } from '../components/Atoms'

const VIDEO_URL = 'https://www.pexels.com/download/video/4694346/'
const NOA = ['Santiago del Estero','Tucumán','Salta','Jujuy','Catamarca','La Rioja']

function KPICard({ icon: Icon, value, label, delta }) {
  return (
    <div style={{ borderLeft: '1px solid '+C.stone, paddingLeft: 'clamp(14px,2vw,24px)' }}>
      {Icon && <Icon size={18} strokeWidth={1.5} style={{ color: C.slate, opacity: 0.6, marginBottom: 12, display: 'block' }} />}
      <div style={{ fontSize: 'clamp(1.7rem,3vw,3rem)', fontWeight: 200, color: C.ink, letterSpacing: '-0.045em', lineHeight: 1, marginBottom: 10 }}>{value}</div>
      <VoltLine w={20} />
      <div style={{ fontSize: 12.5, fontWeight: 400, color: C.ink, marginTop: 10, marginBottom: 4 }}>{label}</div>
      {delta && <div style={{ fontSize: 11, color: C.slate, opacity: 0.65 }}>{delta}</div>}
    </div>
  )
}

const AreaTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#111', border: '1px solid rgba(250,250,247,0.1)', padding: '10px 14px', fontFamily: 'Plus Jakarta Sans' }}>
      <Eyebrow light style={{ marginBottom: 6 }}>{label}</Eyebrow>
      {payload.map((p, i) => <div key={i} style={{ fontSize: 12, color: C.paper, fontWeight: 300 }}>{p.name}: {fmt(p.value)}</div>)}
    </div>
  )
}

export default function Empleo() {
  const { anio } = usePeriodo()
  const { data: raw, loading } = useCSV('/data/data_empleo_hyg.csv')

  const sde = useMemo(() => raw.filter(r => r.provincia === 'Santiago del Estero'), [raw])

  const noa = useMemo(() => {
    if (!raw.length) return []
    const maxFecha = raw.reduce((a,b) => a.fecha > b.fecha ? a : b).fecha
    const ultimo = raw.filter(r => r.fecha === maxFecha)
    return NOA.map(p => ({
      provincia: p.replace('Santiago del Estero','SDE'),
      empleo: Number(ultimo.find(r => r.provincia === p)?.empleo_registrado ?? 0)
    })).sort((a,b) => b.empleo - a.empleo)
  }, [raw])

  const serieSde = useMemo(() => sde
    .filter(r => Number(r.anio) >= 2015)
    .map(r => ({
      fecha: r.fecha,
      label: new Date(r.fecha).toLocaleDateString('es-AR', { month: 'short', year: '2-digit' }),
      empleo: Number(r.empleo_registrado) || 0,
      anio: Number(r.anio),
    }))
    .sort((a,b) => a.fecha > b.fecha ? 1 : -1)
  , [sde])

  const ultimo = sde.length ? sde.reduce((a,b) => a.fecha > b.fecha ? a : b, {}) : {}
  const empActual = Number(ultimo.empleo_registrado) || 0
  const fechaActual = ultimo.fecha ? new Date(ultimo.fecha).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }) : '—'
  const prevAnio = sde.find(r => Number(r.anio) === Number(ultimo.anio)-1 && Number(r.mes) === Number(ultimo.mes))
  const deltaAnual = prevAnio ? ((empActual - Number(prevAnio.empleo_registrado)) / Number(prevAnio.empleo_registrado) * 100).toFixed(1) : null
  const base2019 = sde.find(r => Number(r.anio) === 2019 && Number(r.mes) === Number(ultimo.mes))
  const emp2019 = Number(base2019?.empleo_registrado) || 1
  const deltaVs2019 = base2019 ? ((empActual - emp2019) / emp2019 * 100).toFixed(1) : null
  const rankingReal = noa.findIndex(r => r.provincia === 'SDE') + 1
  const indice = serieSde.map(r => ({ ...r, indice: Math.round((r.empleo / emp2019) * 100) }))
  const covid2020 = serieSde.find(s => s.anio === 2020)?.label

  if (loading) return <Loading />

  return (
    <>
      <section style={{ position: 'relative', minHeight: '42vh', overflow: 'hidden', padding: 'clamp(64px,8vw,96px) var(--pad) clamp(48px,6vw,72px)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <video autoPlay loop muted playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}>
          <source src={VIDEO_URL} type="video/mp4" />
        </video>
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to right, rgba(10,10,10,0.93) 0%, rgba(10,10,10,0.78) 35%, rgba(10,10,10,0.38) 65%, rgba(10,10,10,0.10) 100%)' }} />
        <div style={{ position: 'absolute', top: '8%', right: 'var(--pad)', zIndex: 2, fontSize: 'clamp(7rem,18vw,16rem)', fontWeight: 200, color: C.paper, opacity: 0.05, letterSpacing: '-0.06em', lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>EMPLEO</div>
        <div style={{ position: 'relative', zIndex: 3 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <Paralelo /><Eyebrow light>SIPA-AFIP / OEDE · Capa 3 · Estructura y Valor</Eyebrow>
          </div>
          <h1 style={{ fontSize: 'clamp(2.4rem,5vw,5rem)', fontWeight: 200, color: C.paper, letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 16px' }}>Empleo<br />Hotelería y Gastronomía.</h1>
          <p style={{ fontSize: '0.9rem', fontWeight: 300, color: C.paper, opacity: 0.6, maxWidth: 440, lineHeight: 1.65, margin: 0 }}>Trabajadores registrados en HyG en Santiago del Estero. Datos mensuales SIPA-AFIP, serie desde 1996.</p>
        </div>
      </section>

      <section style={{ background: C.paper, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <Eyebrow style={{ marginBottom: 52 }}>Indicadores · {fechaActual}</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0 clamp(14px,4vw,56px)' }}>
          <KPICard icon={ICONS.empleo} value={fmt(empActual)} label="Empleados HyG registrados" delta={'SIPA-AFIP · '+fechaActual} />
          <KPICard icon={ICONS.empleo} value={deltaAnual ? (deltaAnual > 0 ? '+' : '')+deltaAnual+'%' : '—'} label="Variación interanual" delta={'vs mismo mes '+(Number(ultimo.anio)-1)} />
          <KPICard icon={ICONS.empleo} value={rankingReal+'° / '+NOA.length} label="Posición en NOA" delta="por empleos HyG registrados" />
          <KPICard icon={ICONS.empleo} value={deltaVs2019 ? (deltaVs2019 > 0 ? '+' : '')+deltaVs2019+'%' : '—'} label="Variación vs 2019" delta="recuperación post-pandemia" />
        </div>
        <Interpretacion texto={'En '+fechaActual+', el sector de hotelería y gastronomía de Santiago del Estero registra '+fmt(empActual)+' trabajadores formales según SIPA-AFIP.'+(deltaAnual ? ' Variación interanual: '+(deltaAnual > 0 ? '+' : '')+deltaAnual+'%.' : '')+(deltaVs2019 ? ' Respecto a 2019: '+(deltaVs2019 > 0 ? '+' : '')+deltaVs2019+'%.' : '')+' SDE ocupa el puesto '+rankingReal+'° en la NOA por empleo HyG registrado.'} />
      </section>

      <section style={{ background: C.ink, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <SectionTitle icon={ICONS.empleo} context="Serie mensual 2015-2025 · SIPA-AFIP" main="Evolución del empleo HyG" light style={{ marginBottom: 48 }} />
        <div style={{ height: 'clamp(200px,26vw,300px)' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={serieSde} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gEmp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.volt} stopOpacity={0.18} />
                  <stop offset="100%" stopColor={C.volt} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fill: C.stone, fontSize: 10, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} interval={11} />
              <YAxis tick={{ fill: C.stone, fontSize: 10, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} tickFormatter={v => fmt(v)} width={52} />
              <Tooltip content={<AreaTip />} cursor={{ stroke: 'rgba(250,250,247,0.07)', strokeWidth: 1 }} />
              {covid2020 && <ReferenceLine x={covid2020} stroke="rgba(250,250,247,0.2)" strokeDasharray="4 3" />}
              <Area type="monotone" dataKey="empleo" name="Empleados" stroke={C.volt} strokeWidth={1.5} fill="url(#gEmp)" dot={false} activeDot={{ r: 3, fill: C.volt, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <Interpretacion light texto={serieSde.length > 0 ? 'Pico histórico: '+fmt(Math.max(...serieSde.map(s=>s.empleo)))+' empleados. La pandemia de 2020 generó una caída abrupta con recuperación gradual. El empleo HyG en SDE muestra estacionalidad marcada con picos en temporada termal (otoño-invierno). Fuente: SIPA-AFIP / OEDE.' : 'Sin datos.'} />
      </section>

      <section style={{ background: C.paper, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
          <SectionTitle icon={ICONS.empleo} context={fechaActual} main="Comparativa NOA" />
          <Eyebrow style={{ opacity: 0.45 }}>Empleados HyG registrados por provincia</Eyebrow>
        </div>
        <div>
          {noa.map((p, i) => {
            const maxEmp = noa[0]?.empleo || 1
            const pct = Math.round((p.empleo / maxEmp) * 100)
            const isSDE = p.provincia === 'SDE'
            return (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: 'clamp(32px,4vw,56px) 1fr clamp(80px,12vw,140px)', gap: 'clamp(16px,3vw,40px)', alignItems: 'center', padding: 'clamp(16px,2vw,24px) 0', borderBottom: '0.5px solid '+C.stone }}>
                <div style={{ fontSize: 'clamp(1.8rem,3vw,3.5rem)', fontWeight: 200, color: isSDE ? C.ink : C.stone, letterSpacing: '-0.05em', lineHeight: 1, opacity: isSDE ? 0.9 : 0.22 }}>
                  {String(i+1).padStart(2,'0')}
                </div>
                <div>
                  <div style={{ fontSize: 'clamp(0.9rem,1.3vw,1.1rem)', fontWeight: isSDE ? 500 : 400, color: C.ink, marginBottom: 10 }}>
                    {p.provincia}{isSDE && <span style={{ marginLeft: 8, fontSize: 9, letterSpacing: '0.1em', color: C.volt, fontWeight: 600 }}>SDE</span>}
                  </div>
                  <div style={{ height: 2, background: C.stone, borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: pct+'%', background: isSDE ? C.volt : C.ink, opacity: isSDE ? 1 : 0.35 }} />
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 'clamp(1.2rem,2vw,2rem)', fontWeight: 200, color: C.ink, letterSpacing: '-0.03em' }}>{fmt(p.empleo)}</div>
                  <div style={{ fontSize: 10, color: C.slate, opacity: 0.5 }}>empleados</div>
                </div>
              </div>
            )
          })}
        </div>
        <Interpretacion texto={'Santiago del Estero ocupa el puesto '+rankingReal+'° en la NOA con '+fmt(empActual)+' empleados HyG registrados al '+fechaActual+'. Fuente: SIPA-AFIP / OEDE — empleo asalariado registrado del sector privado, rama hotelería y gastronomía (CIIU 55).'} />
      </section>

      <section style={{ background: C.ink, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <SectionTitle icon={ICONS.empleo} context="Indice base 100 = promedio 2019" main="Recuperacion post-pandemia" light style={{ marginBottom: 48 }} />
        <div style={{ height: 'clamp(180px,22vw,260px)' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={indice.filter(r => r.anio >= 2018)} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gIdx" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.paper} stopOpacity={0.12} />
                  <stop offset="100%" stopColor={C.paper} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fill: C.stone, fontSize: 10, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} interval={5} />
              <YAxis tick={{ fill: C.stone, fontSize: 10, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} width={40} />
              <Tooltip content={({ active, payload, label: l }) => active && payload?.length ? (
                <div style={{ background: '#111', border: '1px solid rgba(250,250,247,0.1)', padding: '8px 12px', fontFamily: 'Plus Jakarta Sans' }}>
                  <div style={{ fontSize: 11, color: C.stone, marginBottom: 3 }}>{l}</div>
                  <div style={{ fontSize: 13, color: C.paper, fontWeight: 200 }}>Indice: {payload[0].value}</div>
                </div>
              ) : null} cursor={{ stroke: 'rgba(250,250,247,0.07)', strokeWidth: 1 }} />
              <ReferenceLine y={100} stroke="rgba(255,255,0,0.3)" strokeDasharray="4 3" />
              <Area type="monotone" dataKey="indice" name="Indice" stroke={C.paper} strokeWidth={1.5} fill="url(#gIdx)" dot={false} activeDot={{ r: 3, fill: C.volt, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <Interpretacion light texto={'El indice de empleo HyG (base 100 = promedio 2019) permite visualizar la recuperacion post-pandemia. Un valor por encima de 100 indica superacion del nivel prepandemia. SDE alcanza indice '+Math.round((empActual/emp2019)*100)+' en '+fechaActual+'. Fuente: SIPA-AFIP.'} />
      </section>
    </>
  )
}
