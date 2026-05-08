import { useMemo, useState } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import { useCSV, fmt } from '../hooks/useCSV'
import { C, Paralelo, VoltLine, Eyebrow, SectionTitle, Interpretacion, Loading, ICONS } from '../components/Atoms'

const VIDEO_MOTOGP = 'https://www.pexels.com/es-es/download/video/30323199/'
const VIDEO_PUMAS  = 'https://www.pexels.com/es-es/download/video/32469685/'

function KPICard({ icon: Icon, value, label, delta, dark }) {
  const color  = dark ? C.paper : C.ink
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

const CustomDot = ({ cx, cy, payload }) => {
  if (payload.tiene_motogp) return <circle key={cx+cy} cx={cx} cy={cy} r={7} fill={C.volt} stroke={C.ink} strokeWidth={2} />
  return <circle key={cx+cy} cx={cx} cy={cy} r={3} fill={C.stone} stroke="none" opacity={0.5} />
}

const CustomActiveDot = ({ cx, cy }) =>
  <circle key={cx+cy} cx={cx} cy={cy} r={8} fill={C.volt} stroke={C.ink} strokeWidth={2} />

export default function Eventos() {
  const [evento, setEvento] = useState('motogp')
  const { data: raw, loading } = useCSV('/data/data_motogp.csv')
  const { data: trends }  = useCSV('/data/data_trends.csv')
  const { data: olaRaw }  = useCSV('/data/data_motogp_ola.csv')

  const termas = useMemo(() => (raw || []).filter(r => Number(r.es_termas) === 1), [raw])

  const porAnio = useMemo(() => termas
    .map(r => ({
      anio:         Number(r.anio),
      label:        String(r.anio),
      viajeros:     Number(r.viajeros_total) || 0,
      estadia:      Number(r.estadia_promedio) || 0,
      tiene_motogp: Number(r.tiene_motogp) === 1,
      uplift:       Number(r.uplift_vs_baseline) || 0,
      baseline:     Number(r.baseline_viajeros_termas) || 0,
      pasajeros_sde:Number(r.pasajeros_sde) || 0,
    }))
    .sort((a,b) => a.anio - b.anio)
  , [termas])

  const motogpAnios     = porAnio.filter(r => r.tiene_motogp)
  const promBaseline    = porAnio.length ? Math.round(porAnio.reduce((a,b) => a+b.baseline,0)/porAnio.length) : 0
  const upliftPromedio  = motogpAnios.length ? Math.round(motogpAnios.reduce((a,b) => a+b.uplift,0)/motogpAnios.length) : 0
  const upliftPct       = promBaseline > 0 ? Math.round((upliftPromedio/promBaseline)*100) : 0
  const mejorAnio       = motogpAnios.reduce((a,b) => b.viajeros > a.viajeros ? b : a, motogpAnios[0] || {})
  const totalViajeros   = motogpAnios.reduce((a,b) => a+b.viajeros, 0)

  const MOTOGP_FECHAS = ['2018-03-01','2018-04-01','2019-03-01','2019-04-01','2022-03-01','2023-03-01','2024-02-01']
  const ibtSerie = useMemo(() => {
    if (!trends?.length) return []
    return trends
      .filter(r => r.fecha >= '2017-01-01')
      .map(r => ({
        fecha:    r.fecha,
        label:    new Date(r.fecha+'T12:00:00').toLocaleDateString('es-AR', { month:'short', year:'2-digit' }),
        ibt:      Number(r.ibt_termas),
        motogp:   Number(r.ibt_motogp),
        esMotoGP: MOTOGP_FECHAS.includes(r.fecha),
      }))
  }, [trends])

  const olaData = useMemo(() => {
    if (!olaRaw?.length) return []
    return olaRaw
      .filter(r => Number(r.dia_rel) >= -21 && Number(r.dia_rel) <= 16)
      .map(r => ({ label: r.label, dia_rel: Number(r.dia_rel), ibt: Number(r.ibt), fase: r.fase }))
  }, [olaRaw])

  if (loading) return <Loading />

  const videoURL = evento === 'pumas' ? VIDEO_PUMAS : VIDEO_MOTOGP

  return (
    <>
      {/* HERO */}
      <section style={{ position:'relative', minHeight:'44vh', overflow:'hidden', padding:'clamp(64px,8vw,96px) var(--pad) clamp(48px,6vw,72px)', display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
        <video key={videoURL} autoPlay loop muted playsInline style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', zIndex:0 }}>
          <source src={videoURL} type="video/mp4" />
        </video>
        <div style={{ position:'absolute', inset:0, zIndex:1, background:'linear-gradient(to right, rgba(10,10,10,0.93) 0%, rgba(10,10,10,0.78) 35%, rgba(10,10,10,0.38) 65%, rgba(10,10,10,0.10) 100%)' }} />
        <div style={{ position:'relative', zIndex:3 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28 }}>
            <Paralelo /><Eyebrow light>EOH · ANAC · Google Trends · Capa 1 · Actividad</Eyebrow>
          </div>
          <h1 style={{ fontSize:'clamp(2.4rem,5vw,5rem)', fontWeight:200, color:C.paper, letterSpacing:'-0.04em', lineHeight:1, margin:'0 0 16px' }}>
            Impacto<br />de eventos.
          </h1>
          <p style={{ fontSize:'0.9rem', fontWeight:300, color:C.paper, opacity:0.6, maxWidth:440, lineHeight:1.65, margin:'0 0 32px' }}>
            Medición del impacto turístico de eventos internacionales en Santiago del Estero. Método diferencias en diferencias (DiD).
          </p>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {[
              { id:'motogp', label:'🏁  MotoGP',                sub:'10 ediciones · 2014–2025' },
              { id:'pumas',  label:'🏉  Los Pumas vs Inglaterra', sub:'18 jul 2026 · PRE-EVENTO' },
            ].map(ev => (
              <button key={ev.id} onClick={() => setEvento(ev.id)} style={{
                background: evento===ev.id ? C.volt : 'rgba(250,250,247,0.08)',
                color:      evento===ev.id ? C.ink  : C.paper,
                border:     `0.5px solid ${evento===ev.id ? C.volt : 'rgba(250,250,247,0.2)'}`,
                padding:'10px 18px', cursor:'pointer', fontFamily:'Plus Jakarta Sans',
                transition:'all 0.15s', textAlign:'left',
              }}>
                <div style={{ fontSize:'var(--fs-sm)', fontWeight:600 }}>{ev.label}</div>
                <div style={{ fontSize:9, opacity:0.7, marginTop:2 }}>{ev.sub}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── MOTOGP ─────────────────────────────── */}
      {evento === 'motogp' && <>

        <section style={{ background:C.paper, padding:'clamp(56px,7vw,80px) var(--pad)' }}>
          <Eyebrow style={{ marginBottom:52 }}>Impacto acumulado · {motogpAnios.length} ediciones · 2014–2025</Eyebrow>
          <div className="grid-kpi">
            <KPICard icon={ICONS.viajeros} value={fmt(totalViajeros)}        label="Viajeros en ediciones MotoGP" delta={'promedio '+fmt(Math.round(totalViajeros/Math.max(motogpAnios.length,1)))+'/edición'} />
            <KPICard icon={ICONS.viajeros} value={'+'+upliftPct+'%'}         label="Uplift vs baseline"           delta={'promedio '+fmt(upliftPromedio)+' viajeros extra'} />
            <KPICard icon={ICONS.aereo}    value={mejorAnio.anio||'—'}        label="Mejor edición"               delta={mejorAnio.viajeros ? fmt(mejorAnio.viajeros)+' viajeros' : '—'} />
            <KPICard icon={ICONS.pernoctaciones} value={motogpAnios.length>0 ? motogpAnios[motogpAnios.length-1].estadia.toFixed(1)+' noches' : '—'} label="Estadía media última ed." delta="vs 1.8 promedio anual SDE" />
          </div>
          <Interpretacion texto={'En los '+motogpAnios.length+' años con MotoGP (2014–2019, 2023–2025), Termas registró un uplift promedio del '+upliftPct+'% respecto al baseline estimado sin evento. La mejor edición fue '+mejorAnio.anio+' con '+fmt(mejorAnio.viajeros)+' viajeros. Fuente: EOH INDEC + ANAC, método DiD.'} />
        </section>

        <section style={{ background:C.ink, padding:'clamp(56px,7vw,80px) var(--pad)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:48, flexWrap:'wrap', gap:20 }}>
            <SectionTitle icon={ICONS.viajeros} context="Viajeros en marzo por año" main="Impacto por edición" light />
            <div style={{ display:'flex', gap:24, paddingTop:4, flexWrap:'wrap' }}>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <div style={{ width:12, height:12, borderRadius:'50%', background:C.volt, flexShrink:0 }} />
                <Eyebrow light style={{ opacity:0.6 }}>Con MotoGP</Eyebrow>
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:C.stone, opacity:0.5, flexShrink:0 }} />
                <Eyebrow light style={{ opacity:0.45 }}>Sin MotoGP</Eyebrow>
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <div style={{ width:16, height:1, background:'rgba(250,250,247,0.3)', borderTop:'1px dashed rgba(250,250,247,0.3)' }} />
                <Eyebrow light style={{ opacity:0.35 }}>Baseline estimado</Eyebrow>
              </div>
            </div>
          </div>
          <div style={{ height:'clamp(220px,28vw,340px)' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={porAnio} margin={{ top:16, right:16, left:0, bottom:0 }}>
                <XAxis dataKey="label" tick={{ fill:C.stone, fontSize:11, fontFamily:'Plus Jakarta Sans' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill:C.stone, fontSize:10, fontFamily:'Plus Jakarta Sans' }} tickLine={false} axisLine={false} tickFormatter={v=>fmt(v)} width={56} />
                <Tooltip content={<Tip />} cursor={{ stroke:'rgba(250,250,247,0.07)', strokeWidth:1 }} />
                <ReferenceLine y={promBaseline} stroke="rgba(250,250,247,0.25)" strokeDasharray="5 4"
                  label={{ value:'baseline sin evento', fill:C.stone, fontSize:9, fontFamily:'Plus Jakarta Sans', position:'insideTopRight' }} />
                <Line type="monotone" dataKey="viajeros" name="Viajeros" stroke="rgba(250,250,247,0.4)" strokeWidth={1.5} connectNulls dot={<CustomDot />} activeDot={<CustomActiveDot />} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <Interpretacion light texto="Cada punto representa los viajeros de Termas en el mes del evento. Los puntos volt corresponden a ediciones MotoGP — todos superan el baseline. La diferencia visual confirma el impacto causal. Ediciones canceladas 2020–2022: COVID. Fuente: EOH INDEC, cálculo propio." />
        </section>

        <section style={{ background:C.paper, padding:'clamp(56px,7vw,80px) var(--pad)' }}>
          <SectionTitle icon={ICONS.aereo} context="Conectividad aérea · año del evento" main="Pasajeros ANAC por edición" style={{ marginBottom:40 }} />
          <div style={{ height:'clamp(180px,22vw,260px)' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={porAnio} margin={{ top:16, right:16, left:0, bottom:0 }}>
                <XAxis dataKey="label" tick={{ fill:C.slate, fontSize:11, fontFamily:'Plus Jakarta Sans' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill:C.slate, fontSize:10, fontFamily:'Plus Jakarta Sans' }} tickLine={false} axisLine={false} tickFormatter={v=>fmt(v)} width={60} />
                <Tooltip content={<TipPaper />} cursor={{ stroke:'rgba(10,10,10,0.1)', strokeWidth:1 }} />
                <Line type="monotone" dataKey="pasajeros_sde" name="Pasajeros aéreos" stroke={C.slate} strokeWidth={1.5} connectNulls
                  dot={(props) => {
                    const { cx, cy, payload } = props
                    return payload.tiene_motogp
                      ? <circle key={cx} cx={cx} cy={cy} r={7} fill={C.ink} stroke={C.stone} strokeWidth={2} />
                      : <circle key={cx} cx={cx} cy={cy} r={3} fill={C.stone} stroke="none" opacity={0.5} />
                  }}
                  activeDot={{ r:6, fill:C.ink, strokeWidth:0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <Interpretacion texto="Pasajeros aéreos anuales en el aeropuerto de SDE. Los puntos oscuros corresponden a años con MotoGP — el evento genera un pico de conectividad medible. Fuente: ANAC." />
        </section>

        <section style={{ background:C.paper, padding:'clamp(40px,5vw,64px) var(--pad)' }}>
          <Interpretacion>
            El modelo DiD estima que MotoGP 2025 generó un uplift de +13.745 viajeros en Termas sobre el baseline de 28.405 (+48%). En abril 2025 el efecto se mantuvo: +12.143 viajeros adicionales (+43%). A estadía media de 2,6 noches, cada edición MotoGP equivale a ~36.000 pernoctes adicionales y un multiplicador estimado de $2.800M ARS sobre la economía local.
          </Interpretacion>
        </section>

        {/* IBT POSICIONAMIENTO */}
        <section style={{ background:'#111827', padding:'clamp(56px,7vw,80px) var(--pad)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
            <Paralelo /><Eyebrow light>Google Trends · IBT mensual</Eyebrow>
          </div>
          <SectionTitle light main="El evento posiciona el destino." context="IBT Termas de Río Hondo · 2017–2026" style={{ marginBottom:16 }} />
          <p style={{ fontSize:'var(--fs-sm)', color:'rgba(250,250,247,0.5)', maxWidth:600, lineHeight:1.7, marginBottom:40 }}>
            Cada edición del MotoGP genera un spike de búsquedas digitales. El impacto no es solo económico — el evento posiciona el destino ante millones de personas que no vinieron pero lo conocieron.
          </p>
          <div style={{ height:'clamp(180px,22vw,280px)', marginBottom:16 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ibtSerie} margin={{ top:8, right:0, left:0, bottom:0 }}>
                <XAxis dataKey="label" tick={{ fill:C.stone, fontSize:10, fontFamily:'Plus Jakarta Sans' }} tickLine={false} axisLine={false} interval={11} />
                <YAxis tick={{ fill:C.stone, fontSize:10 }} tickLine={false} axisLine={false} width={28} domain={[0,100]} />
                <Tooltip contentStyle={{ background:'#111', border:'1px solid rgba(250,250,247,0.1)', fontFamily:'Plus Jakarta Sans', fontSize:12 }} labelStyle={{ color:C.stone }} formatter={(v,n) => [v, n==='ibt'?'IBT Termas':'IBT MotoGP']} />
                {ibtSerie.filter(r => r.esMotoGP).map((r,i) => (
                  <ReferenceLine key={i} x={r.label} stroke={C.volt} strokeDasharray="3 3" strokeWidth={1.5} />
                ))}
                <Line type="monotone" dataKey="ibt"    name="ibt"    stroke={C.paper} strokeWidth={2}   dot={false} />
                <Line type="monotone" dataKey="motogp" name="motogp" stroke={C.volt}  strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display:'flex', gap:24, marginBottom:8 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:24, height:2, background:C.paper }} />
              <span style={{ fontSize:'var(--fs-xs)', color:C.stone }}>IBT Termas</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:24, height:2, background:C.volt }} />
              <span style={{ fontSize:'var(--fs-xs)', color:C.stone }}>Búsqueda "MotoGP"</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:2, height:16, background:C.volt, opacity:0.6 }} />
              <span style={{ fontSize:'var(--fs-xs)', color:C.stone }}>Edición MotoGP</span>
            </div>
          </div>
          <Interpretacion light>
            Las líneas verticales marcan cada edición. El IBT sube en los meses del evento y en algunos casos el efecto se mantiene 1-2 meses después — el destino queda en la memoria del buscador.
          </Interpretacion>
        </section>

        {/* OLA DE ARRASTRE */}
        <section style={{ background:C.paper, padding:'clamp(56px,7vw,80px) var(--pad)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
            <Paralelo /><Eyebrow>Google Trends · Diario · 2025</Eyebrow>
          </div>
          <SectionTitle main="La ola de arrastre." context="IBT diario Termas de Río Hondo · 21 días antes y 16 días después de la carrera" style={{ marginBottom:16 }} />
          <p style={{ fontSize:'var(--fs-sm)', color:C.slate, maxWidth:640, lineHeight:1.7, marginBottom:40 }}>
            El evento no termina el día de la carrera. El interés digital se construye dos semanas antes y se mantiene elevado una semana después. La carrera 2025 multiplicó por 3.3x el nivel de búsquedas baseline.
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0 clamp(14px,4vw,40px)', marginBottom:40 }}>
            {[
              { v:'23.8', l:'Baseline',       d:'promedio sin evento' },
              { v:'+63%', l:'Build-up',        d:'2 semanas antes' },
              { v:'3.3×', l:'Pico carrera',    d:'día de la carrera' },
              { v:'+12%', l:'Arrastre',         d:'10 días post-evento' },
            ].map((k,i) => (
              <div key={i} style={{ borderLeft:`1px solid ${C.stone}`, paddingLeft:'clamp(10px,1.5vw,20px)' }}>
                <div style={{ fontSize:'clamp(1.4rem,2.5vw,2.2rem)', fontWeight:200, color:C.ink, letterSpacing:'-0.04em', lineHeight:1, marginBottom:8 }}>{k.v}</div>
                <VoltLine w={16} />
                <div style={{ fontSize:'var(--fs-xs)', fontWeight:500, color:C.ink, marginTop:8, marginBottom:2 }}>{k.l}</div>
                <div style={{ fontSize:'var(--fs-xs)', color:C.slate, opacity:0.7 }}>{k.d}</div>
              </div>
            ))}
          </div>
          <div style={{ height:'clamp(200px,25vw,300px)', marginBottom:16 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={olaData} margin={{ top:8, right:0, left:0, bottom:0 }}>
                <XAxis dataKey="label" tick={{ fill:C.stone, fontSize:9, fontFamily:'Plus Jakarta Sans' }} tickLine={false} axisLine={false} interval={6} />
                <YAxis tick={{ fill:C.stone, fontSize:9 }} tickLine={false} axisLine={false} width={24} domain={[0,105]} />
                <Tooltip contentStyle={{ background:C.paper2, border:`1px solid ${C.stone}30`, fontFamily:'Plus Jakarta Sans', fontSize:11 }} formatter={v => [v,'IBT']} />
                <ReferenceLine x="D+0"  stroke={C.volt} strokeWidth={2} label={{ value:'Carrera', fill:C.ink, fontSize:9, fontFamily:'Plus Jakarta Sans' }} />
                <ReferenceLine y={23.8} stroke={C.stone} strokeDasharray="4 3" strokeWidth={1} />
                <Line type="monotone" dataKey="ibt" stroke={C.ink} strokeWidth={2.5}
                  dot={(p) => p.payload.dia_rel === 0 ? <circle key={p.key} cx={p.cx} cy={p.cy} r={5} fill={C.volt} stroke="none" /> : null}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <Interpretacion>
            La curva muestra el interés orgánico construyéndose en las 2 semanas previas a la carrera, pico de 100 el día del evento, y cola elevada por 10 días adicionales. Esto es el activo intangible del MotoGP: posicionamiento que ninguna campaña publicitaria puede comprar. Fuente: Google Trends · elaboración propia.
          </Interpretacion>
        </section>

      </>}

      {/* ── LOS PUMAS ──────────────────────────── */}
      {evento === 'pumas' && <>

        <section style={{ background:C.paper, padding:'clamp(56px,7vw,80px) var(--pad)' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#FFF3CD', padding:'6px 14px', marginBottom:32 }}>
            <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.12em', color:'#856404' }}>⏳ PRE-EVENTO · PROYECCIÓN</span>
          </div>
          <SectionTitle main="Los Pumas vs Inglaterra." context="Nations Championship · 18 julio 2026 · Estadio Madre de Ciudades" style={{ marginBottom:40 }} />
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,220px),1fr))', gap:0 }}>
            {[
              { v:'18 jul', l:'Fecha del evento',   d:'2026 · 16hs · Santiago del Estero' },
              { v:'30K',    l:'Capacidad estadio',   d:'ampliable a 42.000 espectadores' },
              { v:'Capital',l:'Sede',                d:'Estadio Único Madre de Ciudades' },
              { v:'Julio',  l:'Temporada',           d:'pico histórico · 88K viajeros/mes' },
            ].map((k,i) => (
              <div key={i} style={{ padding:'clamp(24px,3vw,36px)', borderRight:`0.5px solid ${C.stone}30`, borderBottom:`0.5px solid ${C.stone}30` }}>
                <div style={{ fontSize:'clamp(1.7rem,3vw,3rem)', fontWeight:200, color:C.ink, letterSpacing:'-0.045em', lineHeight:1, marginBottom:10 }}>{k.v}</div>
                <VoltLine w={20} />
                <div style={{ fontSize:'var(--fs-sm)', fontWeight:400, color:C.ink, marginTop:10, marginBottom:4 }}>{k.l}</div>
                <div style={{ fontSize:'var(--fs-xs)', color:C.slate, opacity:0.65 }}>{k.d}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ background:C.ink, padding:'clamp(56px,7vw,80px) var(--pad)' }}>
          <SectionTitle light main="Comparativa vs MotoGP." context="Diferencias que afectan el cálculo de impacto" style={{ marginBottom:40 }} />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:1, marginBottom:32 }}>
            {[
              ['Variable',       'MotoGP',               'Los Pumas'],
              ['Sede',           'Termas (13K plazas)',   'Capital (~3K plazas)'],
              ['Mes',            'Marzo (temporada baja)','Julio (pico máximo)'],
              ['Duración',       '3-4 días',              '1 día'],
              ['Uplift esperado','+17% sobre baseline',   'Difícil aislar en pico'],
              ['IBT esperado',   '3.3× baseline',         '2-4× en Capital'],
              ['Arrastre digital','+12% · 10 días',       'A medir post-evento'],
            ].map((r,i) => r.map((cell,j) => (
              <div key={i+'-'+j} style={{
                padding:'clamp(10px,1.5vw,16px) clamp(14px,2vw,22px)',
                background: i===0 ? 'rgba(250,250,247,0.06)' : j===2 ? 'rgba(255,255,0,0.04)' : 'transparent',
                fontSize: i===0 ? 9 : 'var(--fs-sm)',
                color: i===0 ? C.stone : j===2 ? C.paper : 'rgba(250,250,247,0.6)',
                fontWeight: i===0 ? 700 : 400,
                letterSpacing: i===0 ? '0.1em' : 0,
                textTransform: i===0 ? 'uppercase' : 'none',
                borderBottom:'0.5px solid rgba(250,250,247,0.06)',
              }}>{cell}</div>
            )))}
          </div>
          <Interpretacion light>
            El partido de julio cae en pico de temporada — aislar el uplift requiere comparar contra semanas sin evento del mismo mes en años anteriores. La metodología DiD aplica, pero el contrafactual debe ajustarse por estacionalidad.
          </Interpretacion>
        </section>

        <section style={{ background:C.paper2, padding:'clamp(56px,7vw,80px) var(--pad)' }}>
          <SectionTitle main="Plan de medición." context="Variables · ventana temporal · fuentes" style={{ marginBottom:40 }} />
          {[
            { fase:'PRE-EVENTO',  dias:'11–17 jul', items:['IBT "Santiago del Estero" baseline semanal','Ocupación hotelera Capital semanas previas','Pasajeros ANAC entrada semanas J-2 y J-1'] },
            { fase:'EVENTO',      dias:'18 jul',    items:['IBT peak día del partido','Pasajeros ANAC día del partido vs días normales','Búsquedas "Los Pumas" + "Santiago del Estero"'] },
            { fase:'POST-EVENTO', dias:'19–31 jul', items:['Ola de arrastre IBT: días D+1 a D+14','Ocupación hotelera semanas siguientes','Uplift vs misma semana 2025 y 2024 (sin evento)'] },
          ].map((f,i) => (
            <div key={i} style={{ marginBottom:28 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:C.volt, background:C.ink, padding:'3px 10px' }}>{f.fase}</span>
                <span style={{ fontSize:'var(--fs-xs)', color:C.slate }}>{f.dias}</span>
              </div>
              {f.items.map((item,j) => (
                <div key={j} style={{ display:'flex', gap:12, marginBottom:8, alignItems:'flex-start' }}>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:C.stone, flexShrink:0, marginTop:6 }} />
                  <span style={{ fontSize:'var(--fs-sm)', color:C.slate, lineHeight:1.6 }}>{item}</span>
                </div>
              ))}
            </div>
          ))}
          <div style={{ padding:'clamp(18px,2.5vw,28px)', background:C.paper, border:`1px solid ${C.stone}30`, marginTop:8 }}>
            <div style={{ fontSize:9, color:C.volt, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:8, background:C.ink, display:'inline-block', padding:'2px 8px' }}>Pendiente post-evento</div>
            <p style={{ fontSize:'var(--fs-sm)', color:C.slate, lineHeight:1.7, margin:0 }}>
              Los resultados reales se cargarán después del 18 de julio de 2026. El análisis post-evento comparará las proyecciones con los datos reales de ANAC, IBT y OLS.
            </p>
          </div>
        </section>

      </>}
    </>
  )
}
