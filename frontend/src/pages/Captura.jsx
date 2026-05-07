import { useMemo } from 'react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { useCSV, fmt } from '../hooks/useCSV'
import { usePeriodo } from '../context/PeriodoContext'
import { C, Paralelo, VoltLine, Eyebrow, SectionTitle, Interpretacion, Loading, ICONS } from '../components/Atoms'

const VIDEO_URL = 'https://www.pexels.com/es-es/download/video/5651781/'

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
      {payload.map((p,i) => <div key={i} style={{ fontSize: 12, color: p.color||C.paper, fontWeight: 300 }}>{p.name}: {fmt(p.value)}</div>)}
    </div>
  )
}

export default function Captura() {
  const { anio } = usePeriodo()
  const { data: raw, loading } = useCSV('/data/data_captura.csv')

  const datos = useMemo(() => raw
    .filter(r => Number(r.flag_covid) === 0)
    .map(r => ({
      fecha: r.fecha,
      label: new Date(r.fecha).toLocaleDateString('es-AR', { month: 'short', year: '2-digit' }),
      anio: Number(r.anio),
      viajeros: Number(r.viajeros_total) || 0,
      potencial_usd: Number(r.ingreso_potencial_usd) || 0,
      capturado_ars: Number(r.ingreso_capturado_ars) || 0,
      icv: Number(r.icv_pct) || 0,
      estadia: Number(r.estadia_promedio) || 0,
      gasto_diario: Number(r.gasto_diario_ars) || 0,
      tcn: Number(r.tcn_usd) || 1,
      nota: r.nota_calidad || '',
    }))
    .sort((a,b) => a.fecha > b.fecha ? 1 : -1)
  , [raw])

  const filtrado = useMemo(() => anio ? datos.filter(r => r.anio === anio) : datos, [datos, anio])
  const ultimo = datos.length ? datos[datos.length - 1] : {}
  const fechaActual = ultimo.fecha ? new Date(ultimo.fecha).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }) : '—'
  const capturado_usd = ultimo.capturado_ars && ultimo.tcn ? Math.round(ultimo.capturado_ars / ultimo.tcn) : 0
  const potencial_usd = ultimo.potencial_usd || 0
  const brecha_usd = potencial_usd - capturado_usd
  const icvPromedio = datos.length ? Math.round(datos.reduce((a,b) => a + b.icv, 0) / datos.length) : 0

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
            <Paralelo /><Eyebrow light>EOH + IIBB · Capa 3 · Estructura y Valor</Eyebrow>
          </div>
          <h1 style={{ fontSize: 'clamp(2.4rem,5vw,5rem)', fontWeight: 200, color: C.paper, letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 16px' }}>Captura<br />de Valor.</h1>
          <p style={{ fontSize: '0.9rem', fontWeight: 300, color: C.paper, opacity: 0.6, maxWidth: 480, lineHeight: 1.65, margin: 0 }}>Cuanto del gasto turistico potencial queda realmente en el territorio. Indice de Captura de Valor (ICV) calculado con EOH + IIBB SDE.</p>
        </div>
      </section>

      <section style={{ background: C.paper, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <Eyebrow style={{ marginBottom: 52 }}>Indicadores · {fechaActual}</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0 clamp(14px,4vw,56px)' }}>
          <KPICard icon={ICONS.ibt} value={ultimo.icv+'%'} label="Indice de Captura de Valor" delta="ICV = capturado / potencial" />
          <KPICard icon={ICONS.ibt} value={'USD '+fmt(capturado_usd)} label="Ingreso capturado estimado" delta={fechaActual+' · N1 estimacion'} />
          <KPICard icon={ICONS.ibt} value={'USD '+fmt(potencial_usd)} label="Ingreso potencial" delta={'pernoctes x gasto diario estimado'} />
          <KPICard icon={ICONS.ibt} value={'USD '+fmt(brecha_usd)} label="Brecha no capturada" delta={'ICV promedio historico: '+icvPromedio+'%'} />
        </div>
        <div style={{ marginTop: 32, padding: 'clamp(16px,2vw,24px)', background: 'rgba(255,255,0,0.04)', border: '0.5px solid rgba(255,255,0,0.15)', borderLeft: '2px solid '+C.volt }}>
          <Eyebrow style={{ marginBottom: 8, color: C.volt, opacity: 0.8 }}>Nota de calidad</Eyebrow>
          <p style={{ fontSize: 12, color: C.slate, margin: 0, lineHeight: 1.6 }}>{ultimo.nota || 'N1 estimacion — con IIBB SDE (N2) se convierte en dato real.'}</p>
        </div>
      </section>

      <section style={{ background: C.ink, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <SectionTitle icon={ICONS.ibt} context="Evolucion del ICV · serie historica" main="Indice de Captura de Valor" light style={{ marginBottom: 48 }} />
        <div style={{ height: 'clamp(200px,26vw,300px)' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={datos} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gICV" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.volt} stopOpacity={0.18} />
                  <stop offset="100%" stopColor={C.volt} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fill: C.stone, fontSize: 10, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} interval={5} />
              <YAxis tick={{ fill: C.stone, fontSize: 10, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} tickFormatter={v => v+'%'} width={40} />
              <Tooltip content={<Tip />} cursor={{ stroke: 'rgba(250,250,247,0.07)', strokeWidth: 1 }} />
              <ReferenceLine y={icvPromedio} stroke="rgba(250,250,247,0.2)" strokeDasharray="4 3" />
              <Area type="monotone" dataKey="icv" name="ICV %" stroke={C.volt} strokeWidth={1.5} fill="url(#gICV)" dot={false} activeDot={{ r: 3, fill: C.volt, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <Interpretacion light texto={'El ICV mide que porcentaje del gasto potencial de los turistas se materializa como ingreso registrado en el territorio. Un ICV bajo indica fuga hacia economia informal, alojamiento no registrado o consumo fuera del destino. Promedio historico: '+icvPromedio+'%. Para elevar el ICV a datos N2 se requiere convenio con DGR SDE (IIBB).'} />
      </section>

      <section style={{ background: C.paper, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px,5vw,72px)' }}>
          <div>
            <SectionTitle icon={ICONS.ibt} context="Ingreso potencial vs capturado USD" main="La brecha de valor" style={{ marginBottom: 36 }} />
            <div style={{ height: 'clamp(180px,22vw,240px)' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datos.filter(r => r.anio >= 2022)} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                  <XAxis dataKey="label" tick={{ fill: C.stone, fontSize: 9, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} interval={2} />
                  <YAxis tick={{ fill: C.stone, fontSize: 9, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} tickFormatter={v => fmt(v)} width={60} />
                  <Tooltip content={<Tip />} cursor={{ fill: 'rgba(10,10,10,0.04)' }} />
                  <Bar dataKey="potencial_usd" name="Potencial USD" fill={C.stone} fillOpacity={0.35} radius={[2,2,0,0]} />
                  <Bar dataKey="capturado_ars" name="Capturado ARS" fill={C.ink} radius={[2,2,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <SectionTitle icon={ICONS.ibt} context="Niveles de calidad de datos" main="Hoja de ruta N1 a N3" style={{ marginBottom: 36 }} />
            {[
              { n: 'N1', label: 'Estimacion proxy', desc: 'EOH + gasto medio EVyTH. Disponible hoy. Error estimado 20-35%.', active: true },
              { n: 'N2', label: 'Dato fiscal directo', desc: 'IIBB SDE por rubro HyG. Requiere convenio DGR. Error estimado 8-15%.', active: false },
              { n: 'N3', label: 'Medicion directa', desc: 'Encuesta de gasto en aeropuerto + terminal. Requiere operativo. Error estimado 3-7%.', active: false },
            ].map((item, i) => (
              <div key={i} style={{ padding: 'clamp(14px,2vw,20px)', marginBottom: 8, border: '0.5px solid '+C.stone, borderLeft: '2px solid '+(item.active ? C.volt : C.stone), background: item.active ? 'rgba(255,255,0,0.02)' : 'transparent' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: item.active ? C.volt : C.stone, letterSpacing: '0.1em' }}>{item.n}</span>
                  <span style={{ fontSize: 15, fontWeight: 500, color: C.ink }}>{item.label}</span>
                  {item.active && <span style={{ fontSize: 9, padding: '2px 6px', background: C.volt, color: C.ink, fontWeight: 600, letterSpacing: '0.1em' }}>ACTIVO</span>}
                </div>
                <p style={{ fontSize: 13, color: C.slate, margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section style={{ background: 'var(--paper, #FAFAF7)', padding: 'clamp(40px,5vw,64px) var(--pad)' }}>
        <Interpretacion>
        El ICV del 38% es estable a lo largo de toda la serie disponible — lo que significa
        que no hubo cambios en la política de formalización: el número no mejora solo.
        De cada $100 de gasto potencial que genera el turismo en SDE, $38 quedan en el
        circuito formal y $62 se reparten entre economía informal, consumo fuera del destino
        y alojamiento no habilitado. Para subirlo, el camino es el N2: un convenio con la
        DGR-SDE para acceder a datos de IIBB del sector reduciría el error de estimación
        del 20–35% actual al 8–15%, y daría base para una política activa de formalización
        sectorial. Cada punto adicional de ICV equivale a mayor recaudación provincial y
        mayor empleo registrado en el sector.
          </Interpretacion>
      </section>

    </>
  )
}
