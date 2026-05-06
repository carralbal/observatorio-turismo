import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useCSV, fmt } from '../hooks/useCSV'
import { C, Paralelo, VoltLine, Eyebrow, SectionTitle, Interpretacion, Loading, ICONS } from '../components/Atoms'

const VIDEO_URL = 'https://www.pexels.com/download/video/36865241/'

const NIVELES = [
  { n: 1, label: 'Sin sistema', color: 'rgba(250,250,247,0.15)' },
  { n: 2, label: 'Datos dispersos', color: 'rgba(250,250,247,0.3)' },
  { n: 3, label: 'Sistema basico', color: 'rgba(250,250,247,0.5)' },
  { n: 4, label: 'Sistema integrado', color: 'rgba(250,250,247,0.7)' },
  { n: 5, label: 'Anticipa y optimiza', color: C.paper },
]

const DIMENSIONES = [
  { key: 'tiene_eoh', label: 'EOH / encuesta hotelera' },
  { key: 'tiene_anac', label: 'Conectividad aerea' },
  { key: 'tiene_oede', label: 'Empleo registrado (OEDE)' },
  { key: 'tiene_tablero', label: 'Tablero publico de datos' },
  { key: 'actualiza_mensual', label: 'Actualizacion mensual' },
  { key: 'tiene_n2', label: 'Fuente fiscal propia (N2)' },
  { key: 'mide_eventos', label: 'Medicion de eventos' },
  { key: 'tiene_anticipacion', label: 'Senales anticipadas' },
  { key: 'ciclo_institucional', label: 'Ciclo institucionalizado' },
]

export default function Madurez() {
  const { data: raw, loading } = useCSV('/data/data_madurez.csv')

  const datos = useMemo(() => raw
    .map(r => ({ ...r, score: Number(r.score_madurez) || 0, ranking: Number(r.ranking) || 99, es_sde: Number(r.es_sde) === 1 }))
    .sort((a,b) => b.score - a.score)
  , [raw])

  const sde = datos.find(r => r.es_sde) || {}
  const rankingSde = datos.findIndex(r => r.es_sde) + 1
  const promedio = datos.length ? (datos.reduce((a,b) => a + b.score, 0) / datos.length).toFixed(1) : 0

  if (loading) return <Loading />

  return (
    <>
      <section style={{ position: 'relative', minHeight: '42vh', overflow: 'hidden', padding: 'clamp(64px,8vw,96px) var(--pad) clamp(48px,6vw,72px)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <video autoPlay loop muted playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}>
          <source src={VIDEO_URL} type="video/mp4" />
        </video>
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to right, rgba(10,10,10,0.93) 0%, rgba(10,10,10,0.78) 35%, rgba(10,10,10,0.38) 65%, rgba(10,10,10,0.10) 100%)' }} />
        <div style={{ position: 'absolute', top: '8%', right: 'var(--pad)', zIndex: 2, fontSize: 'clamp(7rem,18vw,16rem)', fontWeight: 200, color: C.paper, opacity: 0.05, letterSpacing: '-0.06em', lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>MADUREZ</div>
        <div style={{ position: 'relative', zIndex: 3 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <Paralelo /><Eyebrow light>ISTP · Capa 4 · Decision</Eyebrow>
          </div>
          <h1 style={{ fontSize: 'clamp(2.4rem,5vw,5rem)', fontWeight: 200, color: C.paper, letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 16px' }}>Madurez<br />del Destino.</h1>
          <p style={{ fontSize: '0.9rem', fontWeight: 300, color: C.paper, opacity: 0.6, maxWidth: 480, lineHeight: 1.65, margin: 0 }}>Indice de Salud Turistica Provincial (ISTP). Nivel de desarrollo del ecosistema de datos turisticos por provincia argentina.</p>
        </div>
      </section>

      <section style={{ background: C.paper, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <Eyebrow style={{ marginBottom: 52 }}>SDE vs 24 jurisdicciones · ISTP</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0 clamp(14px,4vw,56px)' }}>
          <div style={{ borderLeft: '1px solid '+C.stone, paddingLeft: 'clamp(14px,2vw,24px)' }}>
            <div style={{ fontSize: 'clamp(1.7rem,3vw,3rem)', fontWeight: 200, color: C.ink, letterSpacing: '-0.045em', lineHeight: 1, marginBottom: 10 }}>{sde.score_madurez || '—'} / 5</div>
            <VoltLine w={20} />
            <div style={{ fontSize: 12.5, fontWeight: 400, color: C.ink, marginTop: 10, marginBottom: 4 }}>Score de madurez SDE</div>
            <div style={{ fontSize: 11, color: C.slate, opacity: 0.65 }}>{sde.nivel_label || '—'}</div>
          </div>
          <div style={{ borderLeft: '1px solid '+C.stone, paddingLeft: 'clamp(14px,2vw,24px)' }}>
            <div style={{ fontSize: 'clamp(1.7rem,3vw,3rem)', fontWeight: 200, color: C.ink, letterSpacing: '-0.045em', lineHeight: 1, marginBottom: 10 }}>{rankingSde}° / {datos.length}</div>
            <VoltLine w={20} />
            <div style={{ fontSize: 12.5, fontWeight: 400, color: C.ink, marginTop: 10, marginBottom: 4 }}>Ranking nacional</div>
            <div style={{ fontSize: 11, color: C.slate, opacity: 0.65 }}>entre 24 jurisdicciones</div>
          </div>
          <div style={{ borderLeft: '1px solid '+C.stone, paddingLeft: 'clamp(14px,2vw,24px)' }}>
            <div style={{ fontSize: 'clamp(1.7rem,3vw,3rem)', fontWeight: 200, color: C.ink, letterSpacing: '-0.045em', lineHeight: 1, marginBottom: 10 }}>{promedio}</div>
            <VoltLine w={20} />
            <div style={{ fontSize: 12.5, fontWeight: 400, color: C.ink, marginTop: 10, marginBottom: 4 }}>Promedio nacional</div>
            <div style={{ fontSize: 11, color: C.slate, opacity: 0.65 }}>score medio 24 provincias</div>
          </div>
          <div style={{ borderLeft: '1px solid '+C.stone, paddingLeft: 'clamp(14px,2vw,24px)' }}>
            <div style={{ fontSize: 'clamp(1.7rem,3vw,3rem)', fontWeight: 200, color: C.ink, letterSpacing: '-0.045em', lineHeight: 1, marginBottom: 10 }}>{DIMENSIONES.filter(d => Number(sde[d.key]) === 1).length} / {DIMENSIONES.length}</div>
            <VoltLine w={20} />
            <div style={{ fontSize: 12.5, fontWeight: 400, color: C.ink, marginTop: 10, marginBottom: 4 }}>Dimensiones activas</div>
            <div style={{ fontSize: 11, color: C.slate, opacity: 0.65 }}>capacidades instaladas</div>
          </div>
        </div>
      </section>

      <section style={{ background: C.ink, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <SectionTitle icon={ICONS.ibt} context="Score por provincia · 24 jurisdicciones" main="Ranking nacional ISTP" light style={{ marginBottom: 48 }} />
        <div style={{ height: 'clamp(300px,40vw,500px)' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={datos} margin={{ top: 0, right: 60, left: 0, bottom: 0 }}>
              <XAxis type="number" domain={[0,5]} tick={{ fill: C.stone, fontSize: 10, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="provincia" tick={{ fill: C.stone, fontSize: 10, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} width={120} />
              <Tooltip content={({ active, payload }) => active && payload?.length ? (
                <div style={{ background: '#111', border: '1px solid rgba(250,250,247,0.1)', padding: '8px 12px', fontFamily: 'Plus Jakarta Sans' }}>
                  <div style={{ fontSize: 12, color: C.paper }}>{payload[0]?.payload?.provincia}: {payload[0]?.value} / 5</div>
                  <div style={{ fontSize: 11, color: C.stone }}>{payload[0]?.payload?.nivel_label}</div>
                </div>
              ) : null} cursor={{ fill: 'rgba(250,250,247,0.04)' }} />
              <Bar dataKey="score" radius={[0,2,2,0]}>
                {datos.map((d,i) => <Cell key={i} fill={d.es_sde ? C.volt : C.paper} fillOpacity={d.es_sde ? 1 : 0.25} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <Interpretacion light texto={'Santiago del Estero ocupa el puesto '+rankingSde+' de 24 jurisdicciones con score '+sde.score_madurez+'/5. El promedio nacional es '+promedio+'. Las provincias lideres tienen sistemas integrados con actualizacion mensual y fuentes propias. Fuente: ISTP, calculo propio basado en capacidades observadas.'} />
      </section>

      <section style={{ background: C.paper, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <SectionTitle icon={ICONS.ibt} context="Capacidades instaladas en SDE" main="Hoja de ruta" style={{ marginBottom: 40 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'clamp(8px,1.5vw,16px)' }}>
          {DIMENSIONES.map((dim, i) => {
            const tiene = Number(sde[dim.key]) === 1
            return (
              <div key={i} style={{ padding: 'clamp(14px,2vw,20px)', border: '0.5px solid '+C.stone, borderLeft: '2px solid '+(tiene ? C.volt : C.stone), background: tiene ? 'rgba(255,255,0,0.02)' : 'transparent' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: tiene ? C.volt : C.stone, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, fontWeight: tiene ? 500 : 400, color: tiene ? C.ink : C.slate }}>{dim.label}</span>
                </div>
              </div>
            )
          })}
        </div>
        <Interpretacion texto={'Las dimensiones marcadas son capacidades ya instaladas en SDE. Las pendientes representan la hoja de ruta del observatorio: fuente fiscal propia (N2) via DGR, medicion de eventos y ciclo institucional son las proximas prioridades.'} />
      </section>
    </>
  )
}
