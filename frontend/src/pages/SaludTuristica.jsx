import { useMemo } from 'react'
import { ScatterChart, Scatter, LineChart, Line, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts'
import { useCSV, fmt } from '../hooks/useCSV'
import { C, Paralelo, VoltLine, Eyebrow, SectionTitle, Interpretacion, Loading, ICONS } from '../components/Atoms'

const VIDEO_URL = 'https://www.pexels.com/download/video/853889/'

const CUADRANTES = {
  'I':   { label: 'Alto nivel + Alta trayectoria',     sub: 'Consolidación con recuperación' },
  'II':  { label: 'Alto nivel + Baja trayectoria',     sub: 'Liderazgo con estancamiento relativo' },
  'III': { label: 'Bajo nivel + Alta trayectoria',     sub: 'Mejora desde base menor' },
  'IV':  { label: 'Bajo nivel + Baja trayectoria',     sub: 'Rezago persistente' },
}

const COMPONENTES = [
  { key: 'comp_demanda',           label: 'Demanda (pernoctes)',       peso: '50%' },
  { key: 'comp_ocupacion',         label: 'Ocupación hotelera (TOP)',  peso: '30%' },
  { key: 'comp_aerea',             label: 'Conectividad aérea',        peso: '5%'  },
  { key: 'comp_terrestre',         label: 'Conectividad terrestre',    peso: '5%'  },
  { key: 'comp_plazas',            label: 'Oferta · plazas',           peso: '5%'  },
  { key: 'comp_establecimientos',  label: 'Oferta · establecimientos', peso: '5%'  },
]

const ScatterTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  return (
    <div style={{ background: '#111', border: '1px solid rgba(250,250,247,0.1)', padding: '10px 14px', fontFamily: 'Plus Jakarta Sans' }}>
      <div style={{ fontSize: 'var(--fs-sm)', color: C.paper, fontWeight: 500, marginBottom: 6 }}>{d?.provincia}</div>
      <div style={{ fontSize: 'var(--fs-xs)', color: C.stone }}>Nivel 2025: {d?.nivel}</div>
      <div style={{ fontSize: 'var(--fs-xs)', color: C.stone }}>Trayectoria: {d?.tray} (base 2019=100)</div>
      <div style={{ fontSize: 'var(--fs-xs)', color: C.volt, marginTop: 4 }}>Cuadrante {d?.cuad}</div>
    </div>
  )
}

export default function Madurez() {
  const { data: raw, loading } = useCSV('/data/data_salud.csv')

  // Last year data (2025)
  const datos2025 = useMemo(() => raw
    .filter(r => Number(r.anio) === 2025)
    .map(r => ({
      ...r,
      nivel:    Number(r.istp_nivel),
      ranking:  Number(r.istp_ranking),
      tray:     Number(r.istp_trayectoria),
      es_sde:   Number(r.es_sde) === 1,
      cuad:     r.cuadrante_2025,
    }))
    .sort((a, b) => a.ranking - b.ranking)
  , [raw])

  // SDE evolution 2019-2025
  const sdeEvol = useMemo(() => raw
    .filter(r => Number(r.es_sde) === 1)
    .map(r => ({ anio: Number(r.anio), label: String(r.anio), nivel: Number(r.istp_nivel), tray: Number(r.istp_trayectoria), ranking: Number(r.istp_ranking) }))
    .sort((a, b) => a.anio - b.anio)
  , [raw])

  const sde = datos2025.find(r => r.es_sde) || {}
  const promedio = datos2025.length ? (datos2025.reduce((a, b) => a + b.nivel, 0) / datos2025.length).toFixed(1) : 0

  // Scatter data
  const scatterData = datos2025.map(r => ({ provincia: r.provincia, nivel: r.nivel, tray: r.tray, cuad: r.cuad, es_sde: r.es_sde }))
  const medNivel = 56.25
  const medTray  = 85.43

  if (loading) return <Loading />

  return (
    <>
      {/* HERO */}
      <section style={{ position: 'relative', minHeight: '42vh', overflow: 'hidden', padding: 'clamp(64px,8vw,96px) var(--pad) clamp(48px,6vw,72px)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <video autoPlay loop muted playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}>
          <source src={VIDEO_URL} type="video/mp4" />
        </video>
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to right, rgba(10,10,10,0.93) 0%, rgba(10,10,10,0.78) 35%, rgba(10,10,10,0.38) 65%, rgba(10,10,10,0.10) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 3 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <Paralelo /><Eyebrow light>ISTP · Salud Turística · 24 jurisdicciones</Eyebrow>
          </div>
          <h1 style={{ fontSize: 'clamp(2.4rem,5vw,5rem)', fontWeight: 200, color: C.paper, letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 16px' }}>Salud Turística<br />Provincial.</h1>
          <p style={{ fontSize: '0.9rem', fontWeight: 300, color: C.paper, opacity: 0.6, maxWidth: 520, lineHeight: 1.65, margin: 0 }}>Índice de Salud Turística Provincial (ISTP). Comparación de las 24 jurisdicciones argentinas por nivel y trayectoria. Escala 0-100. Elaboración propia.</p>
        </div>
      </section>

      {/* KPIs */}
      <section style={{ background: C.paper, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <Eyebrow style={{ marginBottom: 52 }}>SDE vs 24 jurisdicciones · ISTP 2025</Eyebrow>
        <div className="grid-kpi">
          {[
            { v: `${sde.nivel?.toFixed(1)} / 100`, l: 'Score ISTP nivel SDE', d: 'escala 0-100 · posición relativa' },
            { v: `${sde.ranking}° / ${datos2025.length}`, l: 'Ranking nacional', d: 'entre 24 jurisdicciones 2025' },
            { v: `${sde.tray?.toFixed(1)}`, l: 'Trayectoria 2025', d: 'base 2019 = 100' },
            { v: `Cuad. ${sde.cuad}`, l: CUADRANTES[sde.cuad]?.sub || '—', d: CUADRANTES[sde.cuad]?.label || '—' },
          ].map((kv, i) => (
            <div key={i} style={{ borderLeft: '1px solid '+C.stone, paddingLeft: 'clamp(14px,2vw,24px)' }}>
              <div style={{ fontSize: 'clamp(1.4rem,2.5vw,2.8rem)', fontWeight: 200, color: C.ink, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 10 }}>{kv.v}</div>
              <VoltLine w={20} />
              <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 400, color: C.ink, marginTop: 10, marginBottom: 4 }}>{kv.l}</div>
              <div style={{ fontSize: 'var(--fs-xs)', color: C.slate, opacity: 0.65 }}>{kv.d}</div>
            </div>
          ))}
        </div>
        <Interpretacion texto={`Santiago del Estero obtiene un ISTP de nivel de ${sde.nivel?.toFixed(1)}/100 en 2025, ocupando el puesto ${sde.ranking}° de 24 jurisdicciones. Su trayectoria respecto a 2019 es ${sde.tray?.toFixed(1)} (base 100). Se ubica en el Cuadrante I: alto nivel relativo + recuperación por encima de la mediana. Promedio nacional: ${promedio}/100. Fuente: ISTP · elaboración propia.`} />
      </section>

      {/* RANKING */}
      <section style={{ background: C.ink, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <SectionTitle icon={ICONS.ibt} context="Score nivel 0-100 · 24 jurisdicciones" main="Ranking nacional ISTP 2025" light style={{ marginBottom: 48 }} />
        <div>
          {datos2025.map((d, i) => (
            <div key={d.provincia} style={{
              display: 'flex', alignItems: 'center', gap: 16, padding: '10px 0',
              borderBottom: `0.5px solid ${d.es_sde ? C.volt+'30' : 'rgba(250,250,247,0.07)'}`,
              background: d.es_sde ? 'rgba(255,255,0,0.03)' : 'transparent',
            }}>
              <span style={{ fontSize: 'var(--fs-xs)', fontWeight: 600, color: d.es_sde ? C.volt : C.stone, width: 28, textAlign: 'right', flexShrink: 0 }}>{d.ranking}°</span>
              <span style={{ fontSize: 'var(--fs-base)', color: d.es_sde ? C.paper : 'rgba(250,250,247,0.65)', fontWeight: d.es_sde ? 600 : 400, flex: 1 }}>{d.provincia}</span>
              <div style={{ width: 100, height: 3, background: 'rgba(250,250,247,0.08)', borderRadius: 1, flexShrink: 0 }}>
                <div style={{ height: '100%', width: `${d.nivel}%`, background: d.es_sde ? C.volt : 'rgba(250,250,247,0.25)', borderRadius: 1 }} />
              </div>
              <span style={{ fontSize: 'var(--fs-sm)', fontWeight: d.es_sde ? 600 : 300, color: d.es_sde ? C.volt : C.stone, width: 40, textAlign: 'right', flexShrink: 0 }}>{d.nivel.toFixed(1)}</span>
            </div>
          ))}
        </div>
        <Interpretacion light texto={`Ranking basado en ISTP de nivel 2025 (escala 0-100, normalización por ranking anual). SDE en ${sde.ranking}° de 24, con ${sde.nivel?.toFixed(1)} puntos. Promedio nacional: ${promedio}. Fuente: ISTP · elaboración propia.`} />
      </section>

      {/* CUADRANTES nivel vs trayectoria */}
      <section style={{ background: C.ink, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <SectionTitle icon={ICONS.ibt} context="Nivel 2025 vs Trayectoria (base 2019=100)" main="Cuadrantes de posicionamiento" light style={{ marginBottom: 16 }} />
        <div style={{ display: 'flex', gap: 24, marginBottom: 40, flexWrap: 'wrap' }}>
          {Object.entries(CUADRANTES).map(([q, info]) => (
            <div key={q} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, color: q === sde.cuad ? C.volt : C.stone, flexShrink: 0 }}>C{q}</span>
              <span style={{ fontSize: 'var(--fs-xs)', color: q === sde.cuad ? C.paper : 'rgba(250,250,247,0.55)', fontWeight: q === sde.cuad ? 500 : 400 }}>{info.sub}</span>
            </div>
          ))}
        </div>
        <div style={{ height: 'clamp(280px,40vw,460px)' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 16, right: 16, bottom: 16, left: 16 }}>
              <XAxis type="number" dataKey="nivel" name="Nivel" domain={[0, 105]} tick={{ fill: C.stone, fontSize: 10, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} label={{ value: 'ISTP Nivel 2025 →', position: 'insideBottomRight', offset: -8, fill: C.stone, fontSize: 9 }} />
              <YAxis type="number" dataKey="tray" name="Trayectoria" domain={[40, 210]} tick={{ fill: C.stone, fontSize: 10, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} label={{ value: '↑ Trayectoria', angle: -90, position: 'insideLeft', fill: C.stone, fontSize: 9 }} />
              <ZAxis range={[40, 40]} />
              <Tooltip content={<ScatterTip />} cursor={{ strokeDasharray: '3 3' }} />
              {/* Median reference lines */}
              <ReferenceLine x={medNivel} stroke="rgba(250,250,247,0.2)" strokeDasharray="4 3" />
              <ReferenceLine y={100}     stroke="rgba(250,250,247,0.2)" strokeDasharray="4 3" label={{ value: '100', position: 'right', fill: C.stone, fontSize: 9 }} />
              <Scatter data={scatterData} shape={(props) => {
                const { cx, cy, payload } = props
                const isSDE = payload.es_sde
                return (
                  <g key={`${cx}-${cy}`}>
                    <circle cx={cx} cy={cy} r={isSDE ? 9 : 5}
                      fill={isSDE ? C.volt : 'rgba(200,200,191,0.75)'}
                      fillOpacity={1}
                      stroke={isSDE ? C.ink : 'none'}
                      strokeWidth={isSDE ? 2 : 0}
                    />
                    {isSDE && (
                      <text x={cx + 12} y={cy + 4} fill={C.paper} fontSize={10} fontFamily="Plus Jakarta Sans" fontWeight={600}>SDE</text>
                    )}
                  </g>
                )
              }} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <Interpretacion light texto={`Cada punto representa una provincia. El eje horizontal muestra el nivel ISTP 2025 (posición relativa actual). El eje vertical muestra la trayectoria respecto a 2019 (base=100). La línea vertical punteada marca la mediana de nivel. SDE se ubica en el Cuadrante I: nivel por encima de la mediana y recuperación sólida respecto a 2019.`} />
      </section>

      {/* COMPONENTES SDE 2025 */}
      <section style={{ background: C.ink, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <SectionTitle icon={ICONS.ibt} context="Descomposición ISTP · SDE 2025" main="Por componente" light style={{ marginBottom: 40 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 600 }}>
          {COMPONENTES.map((comp, i) => {
            const val = Number(sde[comp.key]) || 0
            return (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
                    <span style={{ fontSize: 'var(--fs-base)', color: C.paper, fontWeight: 400 }}>{comp.label}</span>
                    <span style={{ fontSize: 'var(--fs-2xs)', color: C.stone, opacity: 0.6 }}>peso {comp.peso}</span>
                  </div>
                  <span style={{ fontSize: 'clamp(1.1rem,1.8vw,1.5rem)', fontWeight: 200, color: C.paper, letterSpacing: '-0.03em' }}>{val.toFixed(1)}</span>
                </div>
                <div style={{ height: 3, background: 'rgba(250,250,247,0.08)', borderRadius: 2 }}>
                  <div style={{ height: '100%', width: `${val}%`, background: val >= 50 ? C.volt : 'rgba(250,250,247,0.4)', borderRadius: 2, transition: 'width 0.8s ease' }} />
                </div>
              </div>
            )
          })}
        </div>
        <Interpretacion light texto={`La demanda (pernoctes, peso 50%) y la ocupación (TOP, peso 30%) explican el 80% del ISTP. SDE tiene fortaleza en ocupación (${Number(sde.comp_ocupacion||0).toFixed(1)}/100) y conectividad terrestre (${Number(sde.comp_terrestre||0).toFixed(1)}/100). La brecha de conectividad aérea (${Number(sde.comp_aerea||0).toFixed(1)}/100) es el componente habilitante más débil. Metodología: ponderación 50/30/20 · TFM D. Carralbal MBA UBA 2025.`} />
      </section>

      {/* EVOLUCIÓN SDE 2019-2025 */}
      <section style={{ background: C.paper, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <SectionTitle icon={ICONS.ibt} context="Evolución SDE · 2019–2025" main="Nivel e trayectoria" style={{ marginBottom: 40 }} />
        <div style={{ height: 'clamp(180px,22vw,260px)' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sdeEvol} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fill: C.slate, fontSize: 11, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: C.slate, fontSize: 10, fontFamily: 'Plus Jakarta Sans' }} tickLine={false} axisLine={false} width={40} />
              <Tooltip formatter={(v, n) => [v.toFixed(1), n]} contentStyle={{ background: C.ink, border: '1px solid rgba(250,250,247,0.1)', fontFamily: 'Plus Jakarta Sans', fontSize: 12, color: C.paper }} />
              <ReferenceLine y={100} stroke={C.stone} strokeOpacity={0.3} strokeDasharray="4 3" />
              <Line type="monotone" dataKey="nivel"   name="Nivel (0-100)"        stroke={C.ink}   strokeWidth={2.5} dot={{ fill: C.ink,  r: 4, strokeWidth: 0 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="ranking" name="Ranking (°)"           stroke={C.slate} strokeWidth={1.5} dot={{ fill: C.slate, r: 3, strokeWidth: 0 }} strokeDasharray="5 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <Interpretacion texto={`SDE mejoró de 51.67/100 (ranking 13°) en 2019 a 57.92/100 (ranking 12°) en 2025. La trayectoria de 90.79 indica que la recuperación post-COVID es sólida pero aún por debajo del nivel prepandemia (base 100). El pico de la serie fue 2019 previo al COVID.`} />
      </section>

      <section style={{ background: C.paper, padding: 'clamp(40px,5vw,64px) var(--pad)' }}>
        <Interpretacion>
          Santiago del Estero ocupa el puesto 12° entre 24 provincias con un ISTP de nivel
          de 57,9/100 — en el Cuadrante I (alto nivel + alta trayectoria). La fortaleza
          principal es la demanda hotelera de Termas de Río Hondo, el mayor centro termal
          de Sudamérica. La debilidad estructural es la conectividad aérea (32,8/100):
          recuperar frecuencias hacia el nivel de 2019 es la palanca con mayor impacto
          potencial sobre el ISTP. Fuente: ISTP · elaboración propia · TFM D. Carralbal MBA UBA 2025.
        </Interpretacion>
      </section>

      {/* METODOLOGÍA ISTP */}
      <section style={{ background: C.paper2, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <SectionTitle main="Cómo se calcula el ISTP." context="Índice de Salud Turística Provincial · metodología" style={{ marginBottom: 48 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,420px),1fr))', gap: 40, marginBottom: 48 }}>
          <div>
            <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: C.ink, marginBottom: 16 }}>¿Qué mide?</div>
            <p style={{ fontSize: 'var(--fs-sm)', color: C.slate, lineHeight: 1.75, margin: '0 0 16px' }}>
              El ISTP mide la salud real del sistema turístico provincial: demanda efectiva, ocupación hotelera, conectividad e infraestructura de oferta. No mide el potencial sino el desempeño observado en datos oficiales.
            </p>
            <p style={{ fontSize: 'var(--fs-sm)', color: C.slate, lineHeight: 1.75, margin: 0 }}>
              Fue desarrollado en el TFM de Diego Carralbal (MBA UBA, 2025) y calibrado sobre las 24 jurisdicciones argentinas usando datos EOH, ANAC, CNRT e INDEC. Escala 0–100, ponderación basada en impacto económico de cada componente.
            </p>
          </div>
          <div>
            <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: C.ink, marginBottom: 16 }}>Ponderación</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[
                { comp: 'Demanda (pernoctes EOH)',       peso: '50%', sde: 57.5,  color: C.volt },
                { comp: 'Ocupación hotelera (TOP)',       peso: '30%', sde: 66.2,  color: C.volt },
                { comp: 'Conectividad aérea (ANAC)',      peso: '5%',  sde: 32.8,  color: C.stone },
                { comp: 'Conectividad terrestre (CNRT)',  peso: '5%',  sde: 64.1,  color: C.volt },
                { comp: 'Oferta — plazas hoteleras',      peso: '5%',  sde: 58.3,  color: C.volt },
                { comp: 'Oferta — establecimientos',      peso: '5%',  sde: 54.7,  color: C.volt },
              ].map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: C.paper }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: C.stone, letterSpacing: '0.1em', width: 32, flexShrink: 0 }}>{c.peso}</span>
                  <span style={{ fontSize: 'var(--fs-sm)', color: C.ink, flex: 1 }}>{c.comp}</span>
                  <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: c.sde < 45 ? C.stone : C.ink }}>{c.sde}</span>
                  <div style={{ width: 48, height: 4, background: `${C.stone}30`, borderRadius: 2 }}>
                    <div style={{ width: `${c.sde}%`, height: '100%', background: c.sde < 45 ? C.stone : C.volt, borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 'var(--fs-xs)', color: C.slate, marginTop: 12, opacity: 0.7 }}>Columna derecha: score SDE 2025 (0–100)</div>
          </div>
        </div>
      </section>
    </>
  )
}
