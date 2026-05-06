import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import { useCSV, fmt } from '../hooks/useCSV'
import { usePeriodo } from '../context/PeriodoContext'
import { C, Paralelo, VoltLine, Eyebrow, SectionTitle, Interpretacion, Loading, ICONS } from '../components/Atoms'

const VIDEO_URL = 'https://www.pexels.com/es-es/download/video/13277310/'

function KPICard({ icon: Icon, value, label, delta, dark }) {
  const color = dark ? C.paper : C.ink
  const border = dark ? 'rgba(250,250,247,0.15)' : C.stone
  return (
    <div style={{ borderLeft: '1px solid '+border, paddingLeft: 'clamp(14px,2vw,24px)' }}>
      {Icon && <Icon size={18} strokeWidth={1.5} style={{ color: dark?C.stone:C.slate, opacity: 0.6, marginBottom: 12, display: 'block' }} />}
      <div style={{ fontSize: 'clamp(1.7rem,3vw,3rem)', fontWeight: 200, color, letterSpacing: '-0.045em', lineHeight: 1, marginBottom: 10 }}>{value}</div>
      <VoltLine w={20} />
      <div style={{ fontSize: 12.5, fontWeight: 400, color, marginTop: 10, marginBottom: 4 }}>{label}</div>
      {delta && <div style={{ fontSize: 11, color: dark?C.stone:C.slate, opacity: 0.65 }}>{delta}</div>}
    </div>
  )
}

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#111', border: '1px solid rgba(250,250,247,0.1)', padding: '10px 14px', fontFamily: 'Plus Jakarta Sans' }}>
      <Eyebrow light style={{ marginBottom: 6 }}>{label}</Eyebrow>
      {payload.map((p,i) => <div key={i} style={{ fontSize: 12, color: p.color||C.paper, fontWeight: 300 }}>{p.name}: {fmt(p.value)}</div>)}
    </div>
  )
}

const ANOS_MOTOGP = [2014,2015,2016,2017,2018,2019,2023,2024,2025]

export default function MotoGP() {
  const { data: raw, loading } = useCSV('/data/data_motogp.csv')

  const termas = useMemo(() => raw.filter(r => Number(r.es_termas) === 1), [raw])

  const porAnio = useMemo(() => termas
    .map(r => ({
      anio: Number(r.anio),
      mes: Number(r.mes),
      fecha: r.fecha,
      viajeros: Number(r.viajeros_total) || 0,
      pernoctes: Number(r.pernoctes_total) || 0,
      estadia: Number(r.estadia_promedio) || 0,
      tiene_motogp: Number(r.tiene_motogp) === 1,
      uplift: Number(r.uplift_vs_baseline) || 0,
      baseline: Number(r.baseline_viajeros_termas) || 0,
      pasajeros_sde: Number(r.pasajeros_sde) || 0,
    }))
    .sort((a,b) => a.anio - b.anio)
  , [termas])

  const motogpAnios = porAnio.filter(r => r.tiene_motogp)
  const sinMotogp = porAnio.filter(r => !r.tiene_motogp)

  const promBaseline = porAnio.length ? Math.round(porAnio.reduce((a,b) => a + b.baseline, 0) / porAnio.length) : 0
  const upliftPromedio = motogpAnios.length ? Math.round(motogpAnios.reduce((a,b) => a + b.uplift, 0) / motogpAnios.length) : 0
  const upliftPct = promBaseline > 0 ? Math.round((upliftPromedio / promBaseline) * 100) : 0
  const mejorAnio = motogpAnios.reduce((a,b) => b.viajeros > a.viajeros ? b : a, motogpAnios[0] || {})
  const totalViajerosMotoGP = motogpAnios.reduce((a,b) => a + b.viajeros, 0)

  const barData = porAnio.map(r => ({
    label: String(r.anio),
    viajeros: r.viajeros,
    uplift: r.uplift > 0 ? r.uplift : 0,
    tiene_motogp: r.tiene_motogp,
  }))

  if (loading) return <Loading />

  return (
    <>
      <section style={{ position: 'relative', minHeight: '42vh', overflow: 'hidden', padding: 'clamp(64px,8vw,96px) var(--pad) clamp(48px,6vw,72px)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <video autoPlay loop muted playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}>
          <source src={VIDEO_URL} type="video/mp4" />
        </video>
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to right, rgba(10,10,10,0.93) 0%, rgba(10,10,10,0.78) 35%, rgba(10,10,10,0.38) 65%, rgba(10,10,10,0.10) 100%)' }} />
        <div style={{ position: 'absolute', top: '8%', right: 'var(--pad)', zIndex: 2, fontSize: 'clamp(7rem,18vw,16rem)', fontWeight: 200, color: C.paper, opacity: 0.05, letterSpacing: '-0.06em', lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>MOTOGP</div>
        <div style={{ position: 'relative', zIndex: 3 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <Paralelo /><Eyebrow light>EOH · ANAC · Capa 1 · Actividad</Eyebrow>
          </div>
          <h1 style={{ fontSize: 'clamp(2.4rem,5vw,5rem)', fontWeight: 200, color: C.paper, letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 16px' }}>MotoGP<br />como Evento.</h1>
          <p style={{ fontSize: '0.9rem', fontWeight: 300, color: C.paper, opacity: 0.6, maxWidth: 480, lineHeight: 1.65, margin: 0 }}>Impacto del Gran Premio de Argentina en la demanda turistica de Termas de Rio Hondo. Metodo de diferencias en diferencias (DiD) 2014-2025.</p>
        </div>
      </section>

      <section style={{ background: C.paper, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <Eyebrow style={{ marginBottom: 52 }}>Impacto acumulado · {motogpAnios.length} ediciones · 2014-2025</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0 clamp(14px,4vw,56px)' }}>
          <KPICard icon={ICONS.viajeros} value={fmt(totalViajerosMotoGP)} label="Viajeros en ediciones MotoGP" delta={'promedio '+fmt(Math.round(totalViajerosMotoGP/motogpAnios.length))+'/edicion'} />
          <KPICard icon={ICONS.viajeros} value={'+'+upliftPct+'%'} label="Uplift vs baseline" delta={'promedio '+fmt(upliftPromedio)+' viajeros extra'} />
          <KPICard icon={ICONS.aereo} value={mejorAnio.anio || '—'} label="Mejor edicion" delta={mejorAnio.viajeros ? fmt(mejorAnio.viajeros)+' viajeros' : '—'} />
          <KPICard icon={ICONS.pernoctaciones} value={motogpAnios.length > 0 ? motogpAnios[motogpAnios.length-1].estadia.toFixed(1)+' noches' : '—'} label="Estadia media ultima ed." delta="vs 1.8 promedio anual SDE" />
        </div>
        <Interpretacion texto={'En los '+motogpAnios.length+' anos con MotoGP (2014-2019, 2023-2025), Termas registro un uplift promedio del '+upliftPct+'% respecto al baseline estimado sin evento. La mejor edicion fue '+mejorAnio.anio+' con '+fmt(mejorAnio.viajeros)+' viajeros. Fuente: EOH INDEC + ANAC, metodo DiD.'} />
      </section>

      <section style={{ background: C.ink, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 48, flexWrap: 'wrap', gap: 20 }}>
          <SectionTitle icon={ICONS.viajeros} context="Viajeros en marzo por ano" main="Impacto por edicion" light />
          <div style={{ display: 'flex', gap: 20, paddingTop: 4 }}>
            {[{c:C.volt,l:'Con MotoGP'},{c:'rgba(250,250,247,0.3)',l:'Sin MotoGP'}].map((x,i) => (
              <div key={i} style={{ display:'flex', gap:7, alignItems:'center' }}>
                <div style={{ width:12, height:12, background:x.c, borderRadius:2 }} />
                <Eyebrow light style={{ opacity:0.5 }}>{x.l}</Eyebrow>
              </div>
            ))}
          </div>
        </div>
        <div style={{ height: 'clamp(220px,28vw,340px)' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fill: C.stone, fontSize: 11, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: C.stone, fontSize: 10, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} tickFormatter={v => fmt(v)} width={56} />
              <Tooltip content={<Tip />} cursor={{ fill: 'rgba(250,250,247,0.04)' }} />
              <ReferenceLine y={promBaseline} stroke="rgba(250,250,247,0.2)" strokeDasharray="4 3" label={{ value: 'baseline', fill: C.stone, fontSize: 9 }} />
              <Bar dataKey="viajeros" name="Viajeros" radius={[2,2,0,0]}>
                {barData.map((d,i) => <Cell key={i} fill={d.tiene_motogp ? C.volt : 'rgba(250,250,247,0.25)'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <Interpretacion light texto={'La linea punteada representa el baseline (demanda esperada sin MotoGP, estimada por DiD). Las barras amarillas muestran el exceso de demanda atribuible al evento. Ediciones canceladas: 2020-2022 (COVID). Fuente: EOH INDEC, calculo propio.'} />
      </section>

      <section style={{ background: C.paper, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <SectionTitle icon={ICONS.aereo} context="Conectividad aerea en ediciones MotoGP" main="Pasajeros ANAC en ano del evento" style={{ marginBottom: 40 }} />
        <div style={{ height: 'clamp(180px,22vw,260px)' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fill: C.stone, fontSize: 11, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: C.stone, fontSize: 10, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} tickFormatter={v => fmt(v)} width={56} />
              <Tooltip content={<Tip />} cursor={{ fill: 'rgba(10,10,10,0.04)' }} />
              <Bar dataKey="uplift" name="Uplift viajeros" radius={[2,2,0,0]}>
                {barData.map((d,i) => <Cell key={i} fill={d.tiene_motogp ? C.ink : C.stone} fillOpacity={d.tiene_motogp ? 1 : 0.3} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <Interpretacion texto={'El uplift positivo en anos con MotoGP confirma el efecto causal del evento sobre la demanda hotelera. El metodo DiD controla por estacionalidad y tendencia usando Santiago Capital como grupo de control. Fuente: EOH INDEC + ANAC, calculo propio.'} />
      </section>
    </>
  )
}
