import { useMemo } from 'react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useCSV, fmt } from '../hooks/useCSV'
import { usePeriodo } from '../context/PeriodoContext'
import { C, Paralelo, VoltLine, Eyebrow, SectionTitle, Interpretacion, Loading, ICONS } from '../components/Atoms'

const VIDEO_URL = 'https://www.pexels.com/download/video/7577972/'

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

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#111', border: '1px solid rgba(250,250,247,0.1)', padding: '10px 14px', fontFamily: 'Plus Jakarta Sans' }}>
      <Eyebrow light style={{ marginBottom: 6 }}>{label}</Eyebrow>
      {payload.map((p, i) => <div key={i} style={{ fontSize: 12, color: C.paper, fontWeight: 300 }}>{p.name}: {p.value}{p.name.includes('Ocup') ? '%' : ''}</div>)}
    </div>
  )
}

export default function Informal() {
  const { anio } = usePeriodo()
  const { data: rawTermas, loading: l1 } = useCSV('/data/data_informal_termas.csv')
  const { data: rawAirdna, loading: l2 } = useCSV('/data/data_airdna_sde.csv')

  const serie = useMemo(() => rawTermas
    .map(r => ({
      fecha: r.fecha,
      label: new Date(r.fecha).toLocaleDateString('es-AR', { month: 'short', year: '2-digit' }),
      occ: Math.round(Number(r.occ_pct_airroi) * 100) / 100,
      adr_ars: Math.round(Number(r.adr_ars)),
      revenue_ars: Math.round(Number(r.revenue_ars)),
      listings: Number(r.listings),
      los: Number(r.los_dias),
      p25: Number(r.adr_p25), p50: Number(r.adr_p50), p75: Number(r.adr_p75),
      anio: Number(r.anio),
    }))
    .filter(r => r.occ !== null && r.occ > 0)
    .sort((a,b) => a.fecha > b.fecha ? 1 : -1)
  , [rawTermas])

  const comparativa = useMemo(() => {
    if (!rawAirdna.length) return []
    const maxFecha = rawAirdna.reduce((a,b) => a.fecha > b.fecha ? a : b).fecha
    return rawAirdna.filter(r => r.fecha === maxFecha)
  }, [rawAirdna])

  const actual = serie.length ? serie[serie.length - 1] : {}
  const prev = serie.length > 1 ? serie[serie.length - 2] : {}
  const fechaActual = actual.fecha ? new Date(actual.fecha).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }) : '—'
  const deltaOcc = prev.occ ? ((actual.occ - prev.occ)).toFixed(1) : null
  const maxOcc = serie.length ? Math.max(...serie.map(s => s.occ)) : 0
  const mesMaxOcc = serie.find(s => s.occ === maxOcc)

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
            <Paralelo /><Eyebrow light>AirDNA + AirROI · Capa 2 · Señales</Eyebrow>
          </div>
          <h1 style={{ fontSize: 'clamp(2.4rem,5vw,5rem)', fontWeight: 200, color: C.paper, letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 16px' }}>Alquiler<br />Temporario.</h1>
          <p style={{ fontSize: '0.9rem', fontWeight: 300, color: C.paper, opacity: 0.6, maxWidth: 440, lineHeight: 1.65, margin: 0 }}>Ocupacion, tarifa y revenue del mercado informal de alquiler temporario en Termas de Rio Hondo. Fuentes: AirDNA y AirROI.</p>
        </div>
      </section>

      <section style={{ background: C.paper, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <Eyebrow style={{ marginBottom: 52 }}>Indicadores · {fechaActual}</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0 clamp(14px,4vw,56px)' }}>
          <KPICard icon={ICONS.informal} value={(actual.occ ?? 0)+'%'} label="Tasa de ocupacion" delta={deltaOcc ? (deltaOcc > 0 ? '+' : '')+deltaOcc+' pp vs mes anterior' : 'AirROI · Termas'} />
          <KPICard icon={ICONS.informal} value={'$'+fmt(actual.adr_ars ?? 0)} label="Tarifa media diaria" delta={'ADR en ARS · '+fechaActual} />
          <KPICard icon={ICONS.informal} value={actual.listings ?? 0} label="Propiedades activas" delta="listings AirDNA en el mercado" />
          <KPICard icon={ICONS.informal} value={(actual.los ?? 0)+' dias'} label="Estadia media" delta="promedio de noches por reserva" />
        </div>
        <Interpretacion texto={'En '+fechaActual+', el mercado de alquiler temporario de Termas de Rio Hondo registra una ocupacion del '+actual.occ+'% con una tarifa media de $'+fmt(actual.adr_ars)+' ARS/noche ('+actual.listings+' propiedades activas). Estadia media: '+actual.los+' noches. Fuente: AirDNA + AirROI.'} />
      </section>

      <section style={{ background: C.ink, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 48, flexWrap: 'wrap', gap: 20 }}>
          <SectionTitle icon={ICONS.informal} context="Serie mensual may 2023 - abr 2026" main="Evolucion de la ocupacion" light />
          {mesMaxOcc && <div style={{ textAlign: 'right' }}>
            <Eyebrow light style={{ opacity: 0.4, marginBottom: 4 }}>Pico historico</Eyebrow>
            <div style={{ fontSize: 'clamp(1.4rem,2vw,2rem)', fontWeight: 200, color: C.volt }}>{maxOcc}%</div>
            <Eyebrow light style={{ opacity: 0.4, marginTop: 4 }}>{mesMaxOcc.label}</Eyebrow>
          </div>}
        </div>
        <div style={{ height: 'clamp(200px,26vw,300px)' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={serie} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gOcc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.volt} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={C.volt} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fill: C.stone, fontSize: 10, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} interval={2} />
              <YAxis tick={{ fill: C.stone, fontSize: 10, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} width={36} tickFormatter={v => v+'%'} />
              <Tooltip content={<Tip />} cursor={{ stroke: 'rgba(250,250,247,0.07)', strokeWidth: 1 }} />
              <Area type="monotone" dataKey="occ" name="Ocupacion %" stroke={C.volt} strokeWidth={1.5} fill="url(#gOcc)" dot={false} activeDot={{ r: 3, fill: C.volt, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <Interpretacion light texto={'La ocupacion del alquiler temporario en Termas de Rio Hondo muestra marcada estacionalidad con picos en temporada termal (abril-agosto). Pico historico: '+maxOcc+'% en '+mesMaxOcc?.label+'. El mercado tiene '+actual.listings+' propiedades activas segun AirDNA.'} />
      </section>

      <section style={{ background: C.paper, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px,5vw,72px)', alignItems: 'flex-start' }}>
          <div>
            <SectionTitle icon={ICONS.informal} context={fechaActual} main="Evolucion de la tarifa" style={{ marginBottom: 36 }} />
            <div style={{ height: 'clamp(180px,22vw,260px)' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={serie} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gAdr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={C.ink} stopOpacity={0.1} />
                      <stop offset="100%" stopColor={C.ink} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" tick={{ fill: C.stone, fontSize: 9, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} interval={4} />
                  <YAxis tick={{ fill: C.stone, fontSize: 9, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} tickFormatter={v => '$'+fmt(v)} width={64} />
                  <Tooltip content={({ active, payload, label: l }) => active && payload?.length ? (
                    <div style={{ background: C.paper, border: '0.5px solid '+C.stone, padding: '8px 12px', fontFamily: 'Plus Jakarta Sans' }}>
                      <div style={{ fontSize: 10, color: C.slate, marginBottom: 3 }}>{l}</div>
                      <div style={{ fontSize: 13, color: C.ink, fontWeight: 200 }}>${fmt(payload[0].value)}/noche</div>
                    </div>
                  ) : null} />
                  <Area type="monotone" dataKey="adr_ars" name="ADR ARS" stroke={C.ink} strokeWidth={1.5} fill="url(#gAdr)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <Interpretacion texto={'Tarifa media diaria en ARS. La inflacion impacta la serie nominal — el valor real en USD es mas estable. ADR actual: $'+fmt(actual.adr_ars)+' ARS/noche.'} />
          </div>

          <div>
            <SectionTitle icon={ICONS.informal} context={fechaActual} main="Distribucion de precios" style={{ marginBottom: 36 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { label: 'Percentil 25', value: actual.p25, desc: '25% cobra menos de este valor' },
                { label: 'Mediana (P50)', value: actual.p50, desc: 'precio tipico del mercado' },
                { label: 'Percentil 75', value: actual.p75, desc: '25% cobra mas de este valor' },
                { label: 'ADR promedio', value: actual.adr_ars, desc: 'tarifa media ponderada', accent: true },
              ].map((item, i) => {
                const max = actual.p75 || 1
                const pct = Math.min(Math.round((item.value / max) * 100), 100)
                return (
                  <div key={i} style={{ padding: '14px 0', borderBottom: '0.5px solid '+C.stone }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div>
                        <span style={{ fontSize: 12, fontWeight: item.accent ? 500 : 400, color: C.ink }}>{item.label}</span>
                        <div style={{ fontSize: 10, color: C.slate, opacity: 0.6, marginTop: 2 }}>{item.desc}</div>
                      </div>
                      <span style={{ fontSize: 'clamp(1rem,1.5vw,1.4rem)', fontWeight: 200, color: item.accent ? C.ink : C.ink, letterSpacing: '-0.02em' }}>${fmt(item.value)}</span>
                    </div>
                    <div style={{ height: 2, background: C.stone, borderRadius: 1, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: pct+'%', background: item.accent ? C.volt : C.ink, opacity: item.accent ? 1 : 0.4 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section style={{ background: C.ink, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
          <SectionTitle icon={ICONS.informal} context={comparativa[0]?.fecha ? new Date(comparativa[0].fecha).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }) : '—'} main="Termas vs Santiago Capital" light />
          <Eyebrow light style={{ opacity: 0.4 }}>Mercados AirDNA · ultimo dato disponible</Eyebrow>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 'clamp(24px,4vw,64px)' }}>
          {comparativa.map((m, i) => (
            <div key={i} style={{ padding: 'clamp(24px,3vw,40px)', border: '0.5px solid rgba(250,250,247,0.1)', borderTop: '2px solid '+(i===0?C.volt:C.stone) }}>
              <Eyebrow light style={{ marginBottom: 16, opacity: 0.5 }}>{m.mercado}</Eyebrow>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 32px', marginBottom: 20 }}>
                {[
                  { v: m.occ_informal_pct+'%', l: 'Ocupacion' },
                  { v: '$'+fmt(Math.round(Number(m.adr_usd)*1300)), l: 'ADR est. ARS' },
                  { v: m.listings_activos, l: 'Listings activos' },
                  { v: m.estadia_informal+' dias', l: 'Estadia media' },
                ].map((kv, j) => (
                  <div key={j}>
                    <div style={{ fontSize: 'clamp(1.2rem,2vw,1.8rem)', fontWeight: 200, color: i===0?C.volt:C.paper, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 6 }}>{kv.v}</div>
                    <Eyebrow light style={{ opacity: 0.4, fontSize: 9 }}>{kv.l}</Eyebrow>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <Interpretacion light texto="Comparativa de los dos principales mercados de alquiler temporario de Santiago del Estero segun AirDNA. Termas de Rio Hondo domina en volumen de listings por su perfil termal y estacional. Santiago Capital muestra mayor estabilidad de demanda." />
      </section>
      <section style={{ background: 'var(--paper, #FAFAF7)', padding: 'clamp(40px,5vw,64px) var(--pad)' }}>
        <Interpretacion>
        El mercado de alquiler temporario en Termas registra entre 20 y 34 propiedades activas
        (AirDNA, mar 2026), con tarifa media de $97.109 ARS/noche y ocupación del 15% en
        verano — subiendo al 28% en temporada media (octubre). El bajo volumen de listings
        confirma que Termas no es un destino de alquiler informal masivo: el turismo termal
        se canaliza principalmente por el sector hotelero formal. El dato vale como señal
        anticipada: cuando la ocupación AirROI sube, la demanda hotelera lo sigue en 2–4
        semanas. Una ocupación informal superior al 35% en temporada alta es umbral de
        alerta para sobrecarga del destino.
          </Interpretacion>
      </section>

    </>
  )
}
