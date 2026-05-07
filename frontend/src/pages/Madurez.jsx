import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useCSV, fmt } from '../hooks/useCSV'
import { C, Paralelo, VoltLine, Eyebrow, SectionTitle, Interpretacion, Loading, ICONS } from '../components/Atoms'

const VIDEO_URL = 'https://www.pexels.com/download/video/36878094/'

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
            <div style={{ fontSize: 13, color: C.slate, opacity: 0.65 }}>{sde.nivel_label || '—'}</div>
          </div>
          <div style={{ borderLeft: '1px solid '+C.stone, paddingLeft: 'clamp(14px,2vw,24px)' }}>
            <div style={{ fontSize: 'clamp(1.7rem,3vw,3rem)', fontWeight: 200, color: C.ink, letterSpacing: '-0.045em', lineHeight: 1, marginBottom: 10 }}>{rankingSde}° / {datos.length}</div>
            <VoltLine w={20} />
            <div style={{ fontSize: 12.5, fontWeight: 400, color: C.ink, marginTop: 10, marginBottom: 4 }}>Ranking nacional</div>
            <div style={{ fontSize: 13, color: C.slate, opacity: 0.65 }}>entre 24 jurisdicciones</div>
          </div>
          <div style={{ borderLeft: '1px solid '+C.stone, paddingLeft: 'clamp(14px,2vw,24px)' }}>
            <div style={{ fontSize: 'clamp(1.7rem,3vw,3rem)', fontWeight: 200, color: C.ink, letterSpacing: '-0.045em', lineHeight: 1, marginBottom: 10 }}>{promedio}</div>
            <VoltLine w={20} />
            <div style={{ fontSize: 12.5, fontWeight: 400, color: C.ink, marginTop: 10, marginBottom: 4 }}>Promedio nacional</div>
            <div style={{ fontSize: 13, color: C.slate, opacity: 0.65 }}>score medio 24 provincias</div>
          </div>
          <div style={{ borderLeft: '1px solid '+C.stone, paddingLeft: 'clamp(14px,2vw,24px)' }}>
            <div style={{ fontSize: 'clamp(1.7rem,3vw,3rem)', fontWeight: 200, color: C.ink, letterSpacing: '-0.045em', lineHeight: 1, marginBottom: 10 }}>{DIMENSIONES.filter(d => Number(sde[d.key]) === 1).length} / {DIMENSIONES.length}</div>
            <VoltLine w={20} />
            <div style={{ fontSize: 12.5, fontWeight: 400, color: C.ink, marginTop: 10, marginBottom: 4 }}>Dimensiones activas</div>
            <div style={{ fontSize: 13, color: C.slate, opacity: 0.65 }}>capacidades instaladas</div>
          </div>
        </div>
      </section>

      <section style={{ background: C.ink, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <SectionTitle icon={ICONS.ibt} context="Score por provincia · 24 jurisdicciones" main="Ranking nacional ISTP" light style={{ marginBottom: 48 }} />
        <div style={{ height: 'clamp(300px,40vw,500px)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {datos.map((d, i) => (
                  <div key={d.provincia} style={{
                    display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0',
                    borderBottom: `0.5px solid ${d.es_sde ? C.volt+'30' : 'rgba(250,250,247,0.07)'}`,
                    background: d.es_sde ? 'rgba(255,255,0,0.03)' : 'transparent',
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: d.es_sde ? C.volt : C.stone, width: 28, textAlign: 'right', flexShrink: 0 }}>{d.ranking}°</span>
                    <span style={{ fontSize: 13, color: d.es_sde ? C.paper : 'rgba(250,250,247,0.65)', fontWeight: d.es_sde ? 600 : 400, flex: 1, letterSpacing: d.es_sde ? '0.02em' : 0 }}>{d.provincia}</span>
                    <div style={{ width: 80, height: 3, background: 'rgba(250,250,247,0.08)', borderRadius: 1, flexShrink: 0 }}>
                      <div style={{ height: '100%', width: `${(d.score/5)*100}%`, background: d.es_sde ? C.volt : 'rgba(250,250,247,0.25)', borderRadius: 1 }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: d.es_sde ? 600 : 300, color: d.es_sde ? C.volt : C.stone, width: 28, textAlign: 'right', flexShrink: 0 }}>{(+d.score).toFixed(1)}</span>
                  </div>
                ))}
              </div>
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
                  <span style={{ fontSize: 13, fontWeight: tiene ? 500 : 400, color: tiene ? C.ink : C.slate }}>{dim.label}</span>
                </div>
              </div>
            )
          })}
        </div>
        <Interpretacion texto={'Las dimensiones marcadas son capacidades ya instaladas en SDE. Las pendientes representan la hoja de ruta del observatorio: fuente fiscal propia (N2) via DGR, medicion de eventos y ciclo institucional son las proximas prioridades.'} />
      </section>
      <section style={{ background: 'var(--paper, #FAFAF7)', padding: 'clamp(40px,5vw,64px) var(--pad)' }}>
        <Interpretacion>
        Santiago del Estero ocupa el puesto 4° entre 24 provincias en el ISTP, con un score
        de 3,7/5 — nivel "Decide con datos". Tiene activos 6 de 9 indicadores: EOH propia,
        datos ANAC, tablero público, actualización mensual, medición de eventos y señales
        anticipadas. Le faltan tres dimensiones: OEDE (empleo sectorial, en proceso), N2
        fiscal (convenio DGR pendiente) y ciclo institucional formalizado. Cerrar esos tres
        gaps elevaría el score a 5/5 y llevaría a SDE al nivel de Buenos Aires y CABA — las
        únicas dos provincias que hoy operan en "Anticipa y optimiza". En el NOA, SDE ya
        supera a Salta (3.3), Neuquén (3.0) y Tucumán (2.7).
          </Interpretacion>
      </section>

    </>
  )
}
