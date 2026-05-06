import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useCSV, fmt } from '../hooks/useCSV'
import { usePeriodo } from '../context/PeriodoContext'
import { C, Paralelo, VoltLine, Eyebrow, SectionTitle, Interpretacion, Loading, ICONS } from '../components/Atoms'

const VIDEO_URL = 'https://www.pexels.com/download/video/19104264/'

function agruparPorAnio(rows) {
  const m = {}
  rows.forEach(r => {
    const k = Number(r.anio)
    if (!m[k]) m[k] = { anio: k, pasajeros: 0, asientos: 0, viajes: 0 }
    m[k].pasajeros += Number(r.pasajeros) || 0
    m[k].asientos  += Number(r.asientos)  || 0
    m[k].viajes    += Number(r.viajes)    || 0
  })
  return Object.values(m)
    .map(x => ({ ...x, load_factor: x.asientos > 0 ? Math.round((x.pasajeros / x.asientos) * 100) : 0, label: String(x.anio) }))
    .sort((a, b) => a.anio - b.anio)
}

function agruparPorRuta(rows) {
  const m = {}
  rows.forEach(r => {
    const o = r.origen || '', d = r.destino || ''
    const k = d < o ? d+'-'+o : o+'-'+d
    if (!m[k]) m[k] = { ruta: k, origen: o, destino: d, pasajeros: 0, asientos: 0, viajes: 0 }
    m[k].pasajeros += Number(r.pasajeros) || 0
    m[k].asientos  += Number(r.asientos)  || 0
    m[k].viajes    += Number(r.viajes)    || 0
  })
  return Object.values(m)
    .map(x => ({
      ...x,
      load_factor: x.asientos > 0 ? Math.round((x.pasajeros / x.asientos) * 100) : 0,
      label: x.ruta.split('-').map(s =>
        s.replace('Santiago Del Estero','SDE')
         .replace('Ciudad Autónoma De Buenos Aires','CABA')
         .replace('San Miguel De Tucumán','Tucumán')
      ).join(' ↔ ')
    }))
    .sort((a, b) => b.pasajeros - a.pasajeros).slice(0, 8)
}

const BarTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#111', border: '1px solid rgba(250,250,247,0.1)', padding: '10px 14px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      <Eyebrow light style={{ marginBottom: 6 }}>{label}</Eyebrow>
      {payload.map((p, i) => <div key={i} style={{ fontSize: 12, color: C.paper, fontWeight: 300 }}>{p.name}: {fmt(p.value)}</div>)}
    </div>
  )
}

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

export default function Terrestre() {
  const { anio } = usePeriodo()
  const { data: raw, loading } = useCSV('/data/data_terrestre.csv')
  const sde     = useMemo(() => raw.filter(r => Number(r.flag_sde) === 1), [raw])
  const sdeFilt = useMemo(() => anio ? sde.filter(r => Number(r.anio) === anio) : sde, [sde, anio])
  const serie   = useMemo(() => agruparPorAnio(sde), [sde])
  const rutas   = useMemo(() => agruparPorRuta(sdeFilt), [sdeFilt])
  const anioSel = anio ?? (serie.length > 0 ? Math.max(...serie.map(s => s.anio)) : 2024)
  const actual  = serie.find(s => s.anio === anioSel) ?? serie[serie.length - 1] ?? {}
  const prev    = serie.find(s => s.anio === anioSel - 1)
  const lf      = actual.load_factor ?? 0
  const deltaPax = prev?.pasajeros > 0 ? ((actual.pasajeros - prev.pasajeros) / prev.pasajeros * 100).toFixed(1) : null
  const rc = 72, cx = 90, cy = 90, circ = 2 * Math.PI * rc, filled = (lf / 100) * circ
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
            <Paralelo /><Eyebrow light>CNRT · Capa 1 · Actividad básica</Eyebrow>
          </div>
          <h1 style={{ fontSize: 'clamp(2.4rem,5vw,5rem)', fontWeight: 200, color: C.paper, letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 16px' }}>Infraestructura<br />Terrestre.</h1>
          <p style={{ fontSize: '0.9rem', fontWeight: 300, color: C.paper, opacity: 0.6, maxWidth: 400, lineHeight: 1.65, margin: 0 }}>Pasajeros, asientos y load factor de ómnibus de larga distancia con origen o destino en Santiago del Estero. Datos anuales CNRT.</p>
        </div>
      </section>

      <section style={{ background: C.paper, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <Eyebrow style={{ marginBottom: 52 }}>Indicadores · {anioSel}</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0 clamp(14px,4vw,56px)' }}>
          <KPICard icon={ICONS.terrestre} value={fmt(actual.pasajeros??0)} label="Pasajeros transportados" delta={deltaPax ? `${deltaPax>0?'+':''}${deltaPax}% vs ${anioSel-1}` : 'datos hasta 2024'} />
          <KPICard icon={ICONS.terrestre} value={fmt(actual.asientos??0)} label="Asientos ofrecidos" delta="capacidad total anual" />
          <KPICard icon={ICONS.terrestre} value={fmt(actual.viajes??0,0)} label="Servicios operados" delta="viajes regulares CNRT" />
          <KPICard icon={ICONS.ibt} value={`${lf}%`} label="Load factor" delta="eficiencia de ocupación" />
        </div>
        <Interpretacion texto={actual.pasajeros ? `En ${anioSel}, los servicios regulares de larga distancia transportaron ${fmt(actual.pasajeros)} pasajeros en ${fmt(actual.viajes,0)} servicios (${fmt(actual.asientos)} asientos ofrecidos). Load factor: ${lf}%.${deltaPax ? ` Variación interanual: ${deltaPax>0?'+':''}${deltaPax}% respecto a ${anioSel-1}.` : ''}` : 'Sin datos para el período seleccionado.'} />
      </section>

      <section style={{ background: C.ink, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <SectionTitle icon={ICONS.terrestre} context="Serie histórica 2019–2024" main="Pasajeros por año" light style={{ marginBottom: 48 }} />
        <div style={{ height: 'clamp(200px,26vw,300px)' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={serie} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fill: C.stone, fontSize: 11, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: C.stone, fontSize: 10, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} tickFormatter={v => fmt(v)} width={60} />
              <Tooltip content={<BarTip />} cursor={{ fill: 'rgba(250,250,247,0.04)' }} />
              <Bar dataKey="pasajeros" name="Pasajeros" radius={[2,2,0,0]}>
                {serie.map((s,i) => <Cell key={i} fill={s.anio===anioSel ? C.volt : C.paper} fillOpacity={s.anio===anioSel ? 1 : 0.3} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <Interpretacion light texto={serie.length > 1 ? `Pico histórico: ${fmt(Math.max(...serie.map(s=>s.pasajeros)))} pasajeros en ${serie.reduce((a,b)=>a.pasajeros>b.pasajeros?a:b).anio}. La pandemia de 2020 impactó fuertemente el tráfico terrestre. Fuente: CNRT.` : 'Sin serie disponible.'} />
      </section>

      <section style={{ background: C.paper, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
          <SectionTitle icon={ICONS.terrestre} context={String(anioSel)} main="Rutas principales" />
          <Eyebrow style={{ opacity: 0.4 }}>Servicios regulares jurisdicción nacional · CNRT</Eyebrow>
        </div>
        <div>
          {(() => {
            const totalPax = rutas.reduce((a, b) => a + b.pasajeros, 0)
            return rutas.map((r,i) => {
              const maxPax = rutas[0]?.pasajeros||1
              const pct = Math.round((r.pasajeros/maxPax)*100)
              const pctTot = totalPax > 0 ? Math.round((r.pasajeros/totalPax)*100) : 0
              return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: 'clamp(32px,4vw,56px) 1fr clamp(80px,12vw,160px)', gap: 'clamp(16px,3vw,40px)', alignItems: 'center', padding: 'clamp(18px,2.5vw,28px) 0', borderBottom: '0.5px solid '+C.stone }}>
                  <div style={{ fontSize: 'clamp(2rem,3.5vw,4rem)', fontWeight: 200, color: C.ink, letterSpacing: '-0.05em', lineHeight: 1, opacity: i===0?0.9:0.2 }}>
                    {String(i+1).padStart(2,'0')}
                  </div>
                  <div>
                    <div style={{ fontSize: 'clamp(0.9rem,1.3vw,1.15rem)', fontWeight: 400, color: C.ink, marginBottom: 10, lineHeight: 1.3 }}>{r.label}</div>
                    <div style={{ display: 'flex', gap: 'clamp(12px,2vw,24px)', marginBottom: 12, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, color: C.slate, opacity: 0.65 }}>{fmt(r.viajes,0)} servicios/año</span>
                      <span style={{ fontSize: 11, color: C.slate, opacity: 0.65 }}>LF: {r.load_factor}%</span>
                      <span style={{ fontSize: 11, color: C.slate, opacity: 0.65 }}>{fmt(r.asientos)} asientos</span>
                    </div>
                    <div style={{ height: 2, background: C.stone, borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: pct+'%', background: i===0?C.ink:C.slate, opacity: i===0?1:0.35 }} />
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 'clamp(1.4rem,2.5vw,2.5rem)', fontWeight: 200, color: C.ink, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 6 }}>{fmt(r.pasajeros)}</div>
                    <div style={{ fontSize: 10, color: C.slate, opacity: 0.55, marginBottom: 8 }}>pasajeros</div>
                    <div style={{ display: 'inline-block', padding: '4px 10px', background: i===0?C.ink:C.stone, borderRadius: 2 }}>
                      <span style={{ fontSize: 10, fontWeight: 500, color: i===0?C.paper:C.ink, letterSpacing: '0.05em' }}>{pctTot}%</span>
                    </div>
                  </div>
                </div>
              )
            })
          })()}
        </div>
        <Interpretacion texto={rutas.length>0 ? `La ruta ${rutas[0]?.label} concentra el ${Math.round((rutas[0]?.pasajeros/rutas.reduce((a,b)=>a+b.pasajeros,0))*100)}% del tráfico total con ${fmt(rutas[0]?.pasajeros)} pasajeros en ${anioSel}. Fuente: CNRT.` : 'Sin datos de rutas para el período.'} />
      </section>
      <section style={{ background: C.ink, padding: 'clamp(56px,7vw,80px) var(--pad)', display: 'grid', gridTemplateColumns: 'minmax(150px,190px) 1fr', gap: 'clamp(36px,5vw,88px)', alignItems: 'center' }}>
        <div>
          <svg viewBox="0 0 180 180" width="100%" style={{ maxWidth: 190 }}>
            <circle cx={cx} cy={cy} r={rc} fill="none" stroke="rgba(250,250,247,0.1)" strokeWidth={5} />
            <circle cx={cx} cy={cy} r={rc} fill="none" stroke={lf>=70?C.volt:C.paper} strokeWidth={5} strokeLinecap="round" strokeDasharray={`${filled} ${circ-filled}`} transform={`rotate(-90 ${cx} ${cy})`} />
            <g transform={`translate(${cx},${cy})`}>
              <text textAnchor="middle" dominantBaseline="middle" y="-12" fill={lf>=70?C.volt:C.paper} fontSize={38} fontWeight={200} fontFamily="Plus Jakarta Sans" letterSpacing="-1.5">{lf}</text>
              <text textAnchor="middle" dominantBaseline="middle" y="16" fill={C.stone} fontSize={12} fontWeight={400} fontFamily="Plus Jakarta Sans">%</text>
            </g>
          </svg>
          <div style={{ marginTop: 16 }}><VoltLine w={18} /><Eyebrow light style={{ marginTop: 8, fontSize: 9.5 }}>Load Factor · {anioSel}</Eyebrow></div>
        </div>
        <div>
          <SectionTitle icon={ICONS.ibt} context="Eficiencia de ocupación" main="Load factor terrestre." light />
          <Interpretacion light texto={`El load factor del ${lf}% indica que por cada 100 asientos de ómnibus disponibles, ${lf} fueron ocupados en ${anioSel}. `+(lf>=70?'Un LF alto sugiere que la demanda terrestre es sólida.':lf>=50?'Un LF moderado indica equilibrio oferta-demanda.':'Un LF bajo puede reflejar exceso de oferta respecto al mercado.')+' Fuente: CNRT.'} />
        </div>
      </section>
      <section style={{ background: 'var(--paper, #FAFAF7)', padding: 'clamp(40px,5vw,64px) var(--pad)' }}>
        <Interpretacion>
        En 2024, el transporte terrestre hacia SDE transportó 246.334 pasajeros con un load
        factor del 54,9% — muy por debajo del 66% de 2022. La caída del 39% en pasajeros
        entre 2023 y 2024 contrasta con el crecimiento aéreo del 6,6% en el mismo período.
        El bus sigue siendo el modal dominante para el turismo regional NOA, pero pierde
        volumen año a año. Un LF del 55% indica capacidad ociosa estructural: hay asientos
        pero no demanda suficiente para llenarlos. La reconversión del perfil de turista
        — más largo plazo y mayor ingreso — favorece el modo aéreo sobre el terrestre.
          </Interpretacion>
      </section>

    </>
  )
}
