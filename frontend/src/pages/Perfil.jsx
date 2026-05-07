import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useCSV, fmt } from '../hooks/useCSV'
import { usePeriodo } from '../context/PeriodoContext'
import { C, Paralelo, VoltLine, Eyebrow, SectionTitle, Interpretacion, Loading, ICONS } from '../components/Atoms'

const VIDEO_URL = 'https://www.pexels.com/download/video/37130584/'

function KPICard({ value, label, delta }) {
  return (
    <div style={{ borderLeft: '1px solid '+C.stone, paddingLeft: 'clamp(14px,2vw,24px)' }}>
      <div style={{ fontSize: 'clamp(1.7rem,3vw,3rem)', fontWeight: 200, color: C.ink, letterSpacing: '-0.045em', lineHeight: 1, marginBottom: 10 }}>{value}</div>
      <VoltLine w={20} />
      <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 400, color: C.ink, marginTop: 10, marginBottom: 4 }}>{label}</div>
      {delta && <div style={{ fontSize: 'var(--fs-base)', color: C.slate, opacity: 0.65 }}>{delta}</div>}
    </div>
  )
}

export default function Perfil() {
  const { data: raw, loading } = useCSV('/data/data_perfil_turista.csv')

  const datos = useMemo(() => raw
    .map(r => ({ ...r, anio: Number(r.anio), mes: Number(r.mes) }))
    .sort((a,b) => a.fecha > b.fecha ? 1 : -1)
  , [raw])

  const ultimo = datos.length ? datos[datos.length - 1] : {}
  const fechaActual = ultimo.fecha ? new Date(ultimo.fecha).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }) : '—'

  const gastoUsd = Math.round(Number(ultimo.gasto_promedio_usd) || 0)
  const estadiaMedia = Number(ultimo.estadia_media_noches || 0).toFixed(1)
  const pctVacaciones = Number(ultimo.pct_vacaciones || 0).toFixed(1)
  const pctHotel = Number(ultimo.pct_hotel || 0).toFixed(1)
  const pctAuto = Number(ultimo.pct_auto || 0).toFixed(1)

  const transporteData = [
    { modo: 'Auto', pct: Number(ultimo.pct_auto || 0) },
    { modo: 'Omnibus', pct: Number(ultimo.turistas_bus || 0) / (Number(ultimo.turistas_norte || 1) / 100) },
    { modo: 'Avion', pct: 100 - Number(ultimo.pct_auto || 0) - (Number(ultimo.turistas_bus || 0) / (Number(ultimo.turistas_norte || 1) / 100)) },
  ].filter(r => r.pct > 0)

  const motivoData = [
    { motivo: 'Vacaciones/ocio', pct: Number(ultimo.pct_vacaciones || 0) },
    { motivo: 'Visita familiar', pct: 100 - Number(ultimo.pct_vacaciones || 0) - (Number(ultimo.turistas_trabajo || 0) / (Number(ultimo.turistas_norte || 1) / 100)) },
    { motivo: 'Trabajo/negocios', pct: Number(ultimo.turistas_trabajo || 0) / (Number(ultimo.turistas_norte || 1) / 100) },
  ].filter(r => r.pct > 0)

  const serieGasto = datos.map(r => ({
    label: new Date(r.fecha).toLocaleDateString('es-AR', { month: 'short', year: '2-digit' }),
    gasto: Number(r.gasto_promedio_usd) || 0,
    estadia: Number(r.estadia_media_noches) || 0,
  }))

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
            <Paralelo /><Eyebrow light>EVyTH · Capa 3 · Estructura y Valor</Eyebrow>
          </div>
          <h1 style={{ fontSize: 'clamp(2.4rem,5vw,5rem)', fontWeight: 200, color: C.paper, letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 16px' }}>Perfil<br />del Turista.</h1>
          <p style={{ fontSize: '0.9rem', fontWeight: 300, color: C.paper, opacity: 0.6, maxWidth: 480, lineHeight: 1.65, margin: 0 }}>Caracteristicas del turista interno que visita la region NOA. Gasto, estadia, motivo y transporte. Fuente: EVyTH INDEC — datos trimestrales.</p>
        </div>
      </section>

      <section style={{ background: C.paper, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <Eyebrow style={{ marginBottom: 52 }}>Perfil promedio · Region NOA · {fechaActual}</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0 clamp(14px,4vw,56px)' }}>
          <KPICard value={'USD '+gastoUsd} label="Gasto promedio por viaje" delta={'ARS '+fmt(Number(ultimo.gasto_promedio_ars||0))} />
          <KPICard value={estadiaMedia+' noches'} label="Estadia media" delta="noches por viaje region NOA" />
          <KPICard value={pctVacaciones+'%'} label="Viajan por vacaciones" delta={'resto: visita familiar y trabajo'} />
          <KPICard value={pctHotel+'%'} label="Se alojan en hotel" delta={'auto: '+pctAuto+'% del transporte'} />
        </div>
        <Interpretacion texto={'El turista tipico de la region NOA gasta USD '+gastoUsd+' por viaje con una estadia de '+estadiaMedia+' noches. El '+pctVacaciones+'% viaja por vacaciones y el '+pctHotel+'% elige alojamiento hotelero. El auto es el medio de transporte dominante ('+pctAuto+'%). Fuente: EVyTH INDEC — encuesta trimestral de viajes y turismo de los hogares.'} />
      </section>

      <section style={{ background: C.ink, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px,5vw,72px)' }}>
          <div>
            <SectionTitle icon={ICONS.terrestre} context={fechaActual} main="Modo de transporte" light style={{ marginBottom: 36 }} />
            <div>
              {transporteData.map((t,i) => (
                <div key={i} style={{ padding: '14px 0', borderBottom: '0.5px solid rgba(250,250,247,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 'var(--fs-base)', fontWeight: 400, color: C.paper }}>{t.modo}</span>
                    <span style={{ fontSize: 'var(--fs-base)', fontWeight: 200, color: i===0?C.volt:C.paper }}>{t.pct.toFixed(1)}%</span>
                  </div>
                  <div style={{ height: 2, background: 'rgba(250,250,247,0.1)', borderRadius: 1, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: t.pct+'%', background: i===0?C.volt:C.paper, opacity: i===0?1:0.4 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <SectionTitle icon={ICONS.viajeros} context={fechaActual} main="Motivo del viaje" light style={{ marginBottom: 36 }} />
            <div>
              {motivoData.map((m,i) => (
                <div key={i} style={{ padding: '14px 0', borderBottom: '0.5px solid rgba(250,250,247,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 'var(--fs-base)', fontWeight: 400, color: C.paper }}>{m.motivo}</span>
                    <span style={{ fontSize: 'var(--fs-base)', fontWeight: 200, color: i===0?C.volt:C.paper }}>{m.pct.toFixed(1)}%</span>
                  </div>
                  <div style={{ height: 2, background: 'rgba(250,250,247,0.1)', borderRadius: 1, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: Math.min(m.pct,100)+'%', background: i===0?C.volt:C.paper, opacity: i===0?1:0.4 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ background: C.paper, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <SectionTitle icon={ICONS.ibt} context="Evolucion trimestral · EVyTH" main="Gasto y estadia en el tiempo" style={{ marginBottom: 40 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px,5vw,72px)' }}>
          <div>
            <Eyebrow style={{ marginBottom: 16, opacity: 0.5 }}>Gasto promedio USD</Eyebrow>
            <div style={{ height: 'clamp(140px,16vw,200px)' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={serieGasto} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                  <XAxis dataKey="label" tick={{ fill: C.stone, fontSize: 9, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} interval={2} />
                  <YAxis tick={{ fill: C.stone, fontSize: 9, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} tickFormatter={v => 'USD'+v} width={52} />
                  <Tooltip content={({ active, payload, label: l }) => active && payload?.length ? (
                    <div style={{ background: C.paper, border: '0.5px solid '+C.stone, padding: '6px 10px', fontFamily: 'Plus Jakarta Sans' }}>
                      <div style={{ fontSize: 'var(--fs-base)', color: C.ink }}>{l}: USD {payload[0].value}</div>
                    </div>
                  ) : null} />
                  <Bar dataKey="gasto" radius={[2,2,0,0]}>
                    {serieGasto.map((_,i) => <Cell key={i} fill={i===serieGasto.length-1?C.volt:C.ink} fillOpacity={i===serieGasto.length-1?1:0.5} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <Eyebrow style={{ marginBottom: 16, opacity: 0.5 }}>Estadia media (noches)</Eyebrow>
            <div style={{ height: 'clamp(140px,16vw,200px)' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={serieGasto} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                  <XAxis dataKey="label" tick={{ fill: C.stone, fontSize: 9, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} interval={2} />
                  <YAxis tick={{ fill: C.stone, fontSize: 9, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} width={32} />
                  <Tooltip content={({ active, payload, label: l }) => active && payload?.length ? (
                    <div style={{ background: C.paper, border: '0.5px solid '+C.stone, padding: '6px 10px', fontFamily: 'Plus Jakarta Sans' }}>
                      <div style={{ fontSize: 'var(--fs-base)', color: C.ink }}>{l}: {payload[0].value} noches</div>
                    </div>
                  ) : null} />
                  <Bar dataKey="estadia" radius={[2,2,0,0]}>
                    {serieGasto.map((_,i) => <Cell key={i} fill={i===serieGasto.length-1?C.volt:C.ink} fillOpacity={i===serieGasto.length-1?1:0.5} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <Interpretacion texto="Los datos de perfil corresponden a la region NOA (proxy para SDE). La EVyTH tiene frecuencia trimestral con lag de 6-12 meses. Para datos especificos de SDE se requiere encuesta propia en aeropuerto y terminal de omnibus." />
      </section>
    </>
  )
}
