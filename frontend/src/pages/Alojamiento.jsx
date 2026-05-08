import { C, Paralelo, VoltLine, Eyebrow, SectionTitle, Interpretacion } from '../components/Atoms'
import { useCSV, fmt } from '../hooks/useCSV'
import { useMemo } from 'react'

export default function Alojamiento() {
  const { data: aloj } = useCSV('/data/data_alojamiento.csv')
  const plazas = useMemo(() => aloj?.length ? Number(aloj[aloj.length-1].plazas) : 13055, [aloj])

  const CATS = [
    { cat: 'Hoteles 4-5 estrellas',    pct: 0.22, est: '~35', nota: 'Oferta premium termal' },
    { cat: 'Hoteles 2-3 estrellas',    pct: 0.41, est: '~87', nota: 'Volumen principal' },
    { cat: 'Apart-hotel / cabañas',    pct: 0.24, est: '~62', nota: 'Segmento en crecimiento' },
    { cat: 'Hostels / sin categoría',  pct: 0.13, est: '~28', nota: 'Mochilero y económico' },
  ]

  const BRECHA = [
    { año: '2017', asientos: 4045, pct: 31, nota: 'Pico histórico antes del colapso de rutas' },
    { año: '2024', asientos: 800,  pct: 6,  nota: 'Pandemia y pérdida de frecuencias' },
    { año: '2026', asientos: Math.round(plazas * 0.03), pct: 3, nota: 'Actualidad · ambos aeropuertos SDE' },
  ]

  return (
    <>
      <section style={{ background: C.ink, padding: 'clamp(80px,10vw,120px) var(--pad) clamp(48px,6vw,72px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Paralelo /><Eyebrow light>Oferta hotelera · PUNA 2024</Eyebrow>
        </div>
        <h1 style={{ fontSize: 'clamp(2.4rem,5vw,5rem)', fontWeight: 200, color: C.paper, letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 20px' }}>
          Alojamiento<br />formal.
        </h1>
        <p style={{ fontSize: '0.9rem', color: C.paper, opacity: 0.55, maxWidth: 480, lineHeight: 1.7, margin: 0 }}>
          Padrón Único Nacional de Alojamiento (PUNA). Capacidad hotelera registrada en Termas de Río Hondo — el 7° stock más grande del país.
        </p>
      </section>

      <section style={{ background: C.paper, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%,220px),1fr))', gap: 0 }}>
          {[
            { v: fmt(plazas), l: 'Plazas hoteleras', d: 'PUNA 2024 · Termas de Río Hondo' },
            { v: '7°', l: 'Ranking nacional', d: 'entre todas las localidades del país' },
            { v: '3%', l: 'Cobertura aérea', d: 'asientos semanales sobre plazas disponibles' },
            { v: '31%', l: 'Cobertura en 2017', d: 'pico histórico antes del colapso de rutas' },
          ].map((k, i) => (
            <div key={i} style={{ padding: 'clamp(24px,3vw,36px)', borderRight: `0.5px solid ${C.stone}30`, borderBottom: `0.5px solid ${C.stone}30` }}>
              <div style={{ fontSize: 'clamp(2rem,4vw,4rem)', fontWeight: 200, color: C.ink, letterSpacing: '-0.05em', lineHeight: 1, marginBottom: 10 }}>{k.v}</div>
              <VoltLine w={20} />
              <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 500, color: C.ink, marginTop: 10, marginBottom: 4 }}>{k.l}</div>
              <div style={{ fontSize: 'var(--fs-xs)', color: C.slate, opacity: 0.65 }}>{k.d}</div>
            </div>
          ))}
        </div>
        <Interpretacion>
          Termas de Río Hondo tiene {fmt(plazas)} plazas hoteleras — el 7° stock más grande del país y el mayor centro termal de Sudamérica. Sin embargo, la conectividad aérea semanal apenas cubre el 3% de esa capacidad. En 2017 cubría el 31%. La brecha entre oferta hotelera y accesibilidad aérea es la principal restricción estructural del destino.
        </Interpretacion>
      </section>

      <section style={{ background: C.ink, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <SectionTitle light main="Distribución por categoría." context="PUNA 2024 · estimación por tipología" style={{ marginBottom: 48 }} />
        {CATS.map((cat, i) => {
          const pl = Math.round(plazas * cat.pct)
          const pct = Math.round(cat.pct * 100)
          return (
            <div key={i} style={{ padding: 'clamp(16px,2vw,24px) 0', borderBottom: '0.5px solid rgba(250,250,247,0.07)', display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                  <span style={{ fontSize: 'var(--fs-base)', fontWeight: 500, color: C.paper }}>{cat.cat}</span>
                  <span style={{ fontSize: 'var(--fs-xs)', color: C.stone, opacity: 0.6 }}>{cat.nota}</span>
                </div>
                <div style={{ height: 2, background: 'rgba(250,250,247,0.08)', overflow: 'hidden', maxWidth: 400 }}>
                  <div style={{ height: '100%', width: pct+'%', background: i===0?C.volt:C.paper, opacity: i===0?1:0.3 }} />
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 'clamp(1.2rem,2vw,1.8rem)', fontWeight: 200, color: i===0?C.volt:C.paper, letterSpacing: '-0.03em' }}>{fmt(pl)}</div>
                <div style={{ fontSize: 'var(--fs-xs)', color: C.stone }}>{pct}% · {cat.est} estab.</div>
              </div>
            </div>
          )
        })}
      </section>

      <section style={{ background: C.paper2, padding: 'clamp(40px,5vw,56px) var(--pad)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <Paralelo /><Eyebrow>Brecha estructural</Eyebrow>
        </div>
        <SectionTitle main="La capacidad existe. La conectividad, no." style={{ marginBottom: 36 }} />
        {BRECHA.map((r, i) => (
          <div key={i} style={{ padding: 'clamp(14px,2vw,20px) 0', borderBottom: `0.5px solid ${C.stone}30` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <span style={{ fontSize: 'var(--fs-base)', fontWeight: 500, color: C.ink }}>{r.año}</span>
                <span style={{ fontSize: 'var(--fs-xs)', color: C.slate, marginLeft: 12 }}>{r.nota}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 'var(--fs-base)', fontWeight: 200, color: i===0?C.ink:C.slate }}>{fmt(r.asientos)} asientos/sem</span>
                <span style={{ fontSize: 'var(--fs-xs)', color: C.stone, marginLeft: 8 }}>{r.pct}%</span>
              </div>
            </div>
            <div style={{ height: 3, background: `${C.stone}30`, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: r.pct+'%', background: i===0?C.ink:C.stone, opacity: i===0?0.8:0.3 }} />
            </div>
          </div>
        ))}
        <Interpretacion style={{ marginTop: 32 }}>
          La capacidad hotelera de Termas creció sostenidamente. La conectividad aérea colapsó en 2019 y nunca se recuperó. Hoy el destino tiene el 7° stock hotelero del país pero solo el 3% de cobertura aérea semanal sobre esa capacidad.
        </Interpretacion>
      </section>
    </>
  )
}
