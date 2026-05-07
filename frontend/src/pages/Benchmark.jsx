import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts'
import { useCSV, fmt } from '../hooks/useCSV'
import { usePeriodo } from '../context/PeriodoContext'
import { C, Paralelo, VoltLine, Eyebrow, SectionTitle, Interpretacion, Loading, ICONS } from '../components/Atoms'

const VIDEO_URL = 'https://www.pexels.com/download/video/9590940/'

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#111', border: '1px solid rgba(250,250,247,0.1)', padding: '10px 14px', fontFamily: 'Plus Jakarta Sans' }}>
      <Eyebrow light style={{ marginBottom: 6 }}>{label}</Eyebrow>
      {payload.map((p,i) => <div key={i} style={{ fontSize: 'var(--fs-sm)', color: p.color||C.paper, fontWeight: 300 }}>{p.name}: {fmt(p.value)}</div>)}
    </div>
  )
}

export default function Benchmark() {
  const { anio } = usePeriodo()
  const { data: raw, loading } = useCSV('/data/data_benchmark.csv')

  const datos = useMemo(() => raw
    .filter(r => Number(r.flag_covid) === 0)
    .map(r => ({ ...r, anio: Number(r.anio), viajeros: Number(r.viajeros_total)||0, pernoctes: Number(r.pernoctes_total)||0, estadia: Number(r.estadia_promedio)||0, es_sde: Number(r.es_sde)===1 }))
  , [raw])

  const anioSel = anio ?? (datos.length ? Math.max(...datos.map(r=>r.anio)) : 2025)
  const corte = datos.filter(r => r.anio === anioSel)
  const localidades = [...new Set(corte.map(r => r.localidad))].sort()

  const sde_corte = corte.filter(r => r.es_sde)
  const sdeViajeros = sde_corte.reduce((a,b) => a + b.viajeros, 0)
  const ranking = [...corte.reduce((m,r) => {
    const k = r.localidad
    if (!m.has(k)) m.set(k, { localidad: k, viajeros: 0, pernoctes: 0, es_sde: r.es_sde })
    m.get(k).viajeros += r.viajeros
    m.get(k).pernoctes += r.pernoctes
    return m
  }, new Map()).values()].sort((a,b) => b.viajeros - a.viajeros)

  const sdePosicion = ranking.findIndex(r => r.es_sde) + 1

  const serieSde = datos.filter(r => r.es_sde)
    .reduce((m,r) => {
      if (!m[r.anio]) m[r.anio] = { anio: r.anio, label: String(r.anio), viajeros: 0, pernoctes: 0 }
      m[r.anio].viajeros += r.viajeros
      m[r.anio].pernoctes += r.pernoctes
      return m
    }, {})
  const serieSdeArr = Object.values(serieSde).sort((a,b) => a.anio - b.anio)

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
            <Paralelo /><Eyebrow light>EOH · Capa 3 · Estructura y Valor</Eyebrow>
          </div>
          <h1 style={{ fontSize: 'clamp(2.4rem,5vw,5rem)', fontWeight: 200, color: C.paper, letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 16px' }}>Benchmark<br />Interprovincial.</h1>
          <p style={{ fontSize: '0.9rem', fontWeight: 300, color: C.paper, opacity: 0.6, maxWidth: 480, lineHeight: 1.65, margin: 0 }}>SDE frente a otros destinos de la region NOA. Viajeros, pernoctes y estadia media comparados. Fuente: EOH INDEC (hasta nov 2025).</p>
        </div>
      </section>

      <section style={{ background: C.paper, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <Eyebrow style={{ marginBottom: 52 }}>SDE vs destinos NOA · {anioSel}</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0 clamp(14px,4vw,56px)' }}>
          {[
            { v: fmt(sdeViajeros), l: 'Viajeros SDE', d: String(anioSel)+' acumulado' },
            { v: sdePosicion+'° / '+ranking.length, l: 'Posicion en ranking NOA', d: 'por viajeros hoteleros' },
            { v: sde_corte.length ? sde_corte.reduce((a,b)=>a+b.estadia,0)/sde_corte.length > 0 ? (sde_corte.reduce((a,b)=>a+b.estadia,0)/sde_corte.length).toFixed(1)+' noches' : '—' : '—', l: 'Estadia media SDE', d: 'promedio '+anioSel },
            { v: ranking[0]?.localidad || '—', l: 'Lider de la region', d: ranking[0] ? fmt(ranking[0].viajeros)+' viajeros' : '—' },
          ].map((kv,i) => (
            <div key={i} style={{ borderLeft: '1px solid '+C.stone, paddingLeft: 'clamp(14px,2vw,24px)' }}>
              <div style={{ fontSize: 'clamp(1.4rem,2.5vw,2.8rem)', fontWeight: 200, color: C.ink, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 10 }}>{kv.v}</div>
              <VoltLine w={20} />
              <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 400, color: C.ink, marginTop: 10, marginBottom: 4 }}>{kv.l}</div>
              <div style={{ fontSize: 'var(--fs-xs)', color: C.slate, opacity: 0.65 }}>{kv.d}</div>
            </div>
          ))}
        </div>
        <Interpretacion texto={'En '+anioSel+', Santiago del Estero (Termas + Capital) acumula '+fmt(sdeViajeros)+' viajeros hoteleros, ocupando el puesto '+sdePosicion+' en la region NOA. Nota: la EOH INDEC fue discontinuada en diciembre 2025 — los datos 2025 corresponden al acumulado hasta noviembre.'} />
      </section>

      <section style={{ background: C.ink, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
          <SectionTitle icon={ICONS.viajeros} context={String(anioSel)+' · viajeros acumulados'} main="Ranking destinos NOA" light />
        </div>
        <div>
          {ranking.map((r,i) => {
            const maxV = ranking[0]?.viajeros || 1
            const pct = Math.round((r.viajeros/maxV)*100)
            const pctTotal = ranking.reduce((a,b)=>a+b.viajeros,0) > 0 ? Math.round((r.viajeros/ranking.reduce((a,b)=>a+b.viajeros,0))*100) : 0
            return (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: 'clamp(28px,3.5vw,48px) 1fr clamp(80px,12vw,140px)', gap: 'clamp(12px,2.5vw,36px)', alignItems: 'center', padding: 'clamp(16px,2vw,24px) 0', borderBottom: '0.5px solid rgba(250,250,247,0.08)' }}>
                <div style={{ fontSize: 'clamp(1.6rem,3vw,3.5rem)', fontWeight: 200, color: r.es_sde?C.volt:C.stone, letterSpacing: '-0.05em', lineHeight: 1, opacity: r.es_sde?0.9:0.2 }}>
                  {String(i+1).padStart(2,'0')}
                </div>
                <div>
                  <div style={{ fontSize: 'clamp(0.85rem,1.2vw,1rem)', fontWeight: r.es_sde?500:400, color: r.es_sde?C.volt:C.paper, marginBottom: 8 }}>
                    {r.localidad}{r.es_sde && <span style={{ marginLeft: 8, fontSize: 'var(--fs-2xs)', color: C.volt, letterSpacing: '0.1em' }}>SDE</span>}
                  </div>
                  <div style={{ height: 2, background: 'rgba(250,250,247,0.08)', borderRadius: 1, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: pct+'%', background: r.es_sde?C.volt:C.paper, opacity: r.es_sde?1:0.3 }} />
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 'clamp(1rem,1.8vw,1.8rem)', fontWeight: 200, color: r.es_sde?C.volt:C.paper, letterSpacing: '-0.03em' }}>{fmt(r.viajeros)}</div>
                  <div style={{ fontSize: 'var(--fs-xs)', color: C.stone, opacity: 0.55 }}>{pctTotal}% del total</div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section style={{ background: C.paper, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <SectionTitle icon={ICONS.viajeros} context="Evolucion SDE · 2018-2025" main="Trayectoria historica" style={{ marginBottom: 40 }} />
        <div style={{ height: 'clamp(180px,22vw,260px)' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={serieSdeArr} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fill: C.stone, fontSize: 11, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: C.stone, fontSize: 10, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} tickFormatter={v=>fmt(v)} width={56} />
              <Tooltip content={<Tip />} cursor={{ fill: 'rgba(10,10,10,0.04)' }} />
              <Line type="monotone" dataKey="viajeros" name="Viajeros SDE" stroke={C.volt} strokeWidth={2} dot={{ fill: C.volt, r: 3, strokeWidth: 0 }} activeDot={{ r: 4 }} connectNulls >
                {serieSdeArr.map((s,i) => <Cell key={i} fill={s.anio===anioSel?C.volt:C.ink} fillOpacity={s.anio===anioSel?1:0.5} />)}
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </div>
        <Interpretacion texto={'La trayectoria de SDE muestra la recuperacion post-COVID y el impacto de la discontinuacion de la EOH en 2025. Para un benchmark robusto con datos actualizados se requiere el acuerdo con el sector hotelero para recepcion directa de estadisticas provinciales.'} />
      </section>
      <section style={{ background: 'var(--paper, #FAFAF7)', padding: 'clamp(40px,5vw,64px) var(--pad)' }}>
        <Interpretacion>
        En noviembre 2025, Termas de Río Hondo registra 13.760 viajeros con estadía media
        de 2,05 noches — la más alta del NOA. Santiago del Estero Capital suma 10.527
        viajeros (estadía 1,51). Juntos, SDE lidera la región sobre Jujuy (10.400),
        San Luis (9.829), Catamarca (7.051) y La Rioja (3.245). La ventaja competitiva
        de SDE no es solo volumen — es la estadía larga de Termas, que multiplica el gasto
        per cápita y la captura de valor. Cada décima adicional de estadía media equivale
        a +1.376 pernoctes mensuales en Termas. El benchmark interprovincial confirma que
        la brecha de conectividad aérea es el principal limitante para ampliar esa ventaja.
          </Interpretacion>
      </section>

    </>
  )
}
