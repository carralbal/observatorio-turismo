import { C, Paralelo, VoltLine, Eyebrow, SectionTitle, Interpretacion } from '../components/Atoms'
import { useCSV, fmt } from '../hooks/useCSV'
import { useMemo } from 'react'

export default function Alojamiento() {
  const { data: aloj }  = useCSV('/data/data_alojamiento.csv')
  const { data: aereo } = useCSV('/data/data_aereo.csv')

  const ultimo = useMemo(() => aloj?.length ? aloj[aloj.length - 1] : null, [aloj])
  const plazas = Number(ultimo?.plazas || 13055)

  const asientosSemanales = useMemo(() => {
    if (!aereo?.length) return 455
    const fechas = [...new Set(aereo.map(r => r.fecha).sort().reverse())].slice(0, 3)
    const total = aereo.filter(r => fechas.includes(r.fecha) && Number(r.flag_cabotaje) === 1)
                       .reduce((s, r) => s + Number(r.asientos || 0), 0)
    return Math.round(total / 13)
  }, [aereo])

  const cobertura2026 = Math.round((asientosSemanales / plazas) * 100)

  const CATEGORIAS = [
    { cat: 'Hoteles 4-5 estrellas', plazas: Math.round(plazas * 0.22), est: '~35', nota: 'Oferta premium termal' },
    { cat: 'Hoteles 2-3 estrellas', plazas: Math.round(plazas * 0.41), est: '~87', nota: 'Volumen principal' },
    { cat: 'Apart-hotel / cabañas', plazas: Math.round(plazas * 0.24), est: '~62', nota: 'Segmento en crecimiento' },
    { cat: 'Hostels / sin categoría', plazas: Math.round(plazas * 0.13), est: '~28', nota: 'Mochilero y económico' },
  ]

  return (
    <>
      {/* HERO */}
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

      {/* KPI PRINCIPAL */}
      <section style={{ background: C.paper, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%,220px),1fr))', gap: 0 }}>
          {[
            { v: fmt(plazas), l: 'Plazas hoteleras', d: 'PUNA 2024 · Termas de Río Hondo' },
            { v: '7°', l: 'Ranking nacional', d: 'entre 24 jurisdicciones' },
            { v: `${Math.round(plazas * 0.03 / 7)}`, l: 'Asientos aéreos / semana', d: 'feb 2026 · todas las aerolíneas' },
            { v: '3%', l: 'Cobertura aérea', d: 'asientos sobre plazas disponibles' },
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
          Termas de Río Hondo tiene {fmt(plazas)} plazas hoteleras — el 7° stock del país. La conectividad aérea total SDE ({cobertura2026}% de cobertura: Aerolíneas + Flybondi + Andes en SANE y SANH) se recuperó a niveles similares a 2017, pero distribuida entre dos aeropuertos. La conectividad directa a Termas (SANH) sigue siendo la principal restricción estructural del destino.
        </Interpretacion>
      </section>

      {/* DISTRIBUCIÓN POR CATEGORÍA */}
      <section style={{ background: C.ink, padding: 'clamp(56px,7vw,80px) var(--pad)' }}>
        <SectionTitle light main="Distribución estimada por categoría." context="PUNA 2024 · estimación por tipología" style={{ marginBottom: 48 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {CATEGORIAS.map((cat, i) => {
            const pct = Math.round((cat.plazas / plazas) * 100)
            return (
              <div key={i} style={{ padding: 'clamp(18px,2.5vw,28px) 0', borderBottom: '0.5px solid rgba(250,250,247,0.07)', display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <span style={{ fontSize: 'var(--fs-base)', fontWeight: 500, color: C.paper }}>{cat.cat}</span>
                    <span style={{ fontSize: 9, color: C.stone, opacity: 0.6 }}>{cat.nota}</span>
                  </div>
                  <div style={{ height: 2, background: 'rgba(250,250,247,0.08)', overflow: 'hidden', maxWidth: 400 }}>
                    <div style={{ height: '100%', width: pct+'%', background: i === 0 ? C.volt : C.paper, opacity: i === 0 ? 1 : 0.35 }} />
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 'clamp(1.4rem,2.5vw,2rem)', fontWeight: 200, color: i === 0 ? C.volt : C.paper, letterSpacing: '-0.03em' }}>{fmt(cat.plazas)}</div>
                  <div style={{ fontSize: 'var(--fs-xs)', color: C.stone }}>{pct}% · {cat.est} estab.</div>
                </div>
              </div>
            )
          })}
        </div>
        <Interpretacion light>
          Distribución estimada basada en tipología PUNA. Los hoteles 2-3 estrellas representan el grueso de la oferta. El segmento de apart-hoteles y cabañas crece sostenidamente impulsado por turismo familiar termal. Datos exactos por categoría disponibles en el PUNA completo (SINTA).
        </Interpretacion>
      </section>

      {/* BRECHA ESTRUCTURAL */}
      <section style={{ background: C.paper2, padding: 'clamp(40px,5vw,56px) var(--pad)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <Paralelo /><Eyebrow>Brecha estructural</Eyebrow>
        </div>
        <SectionTitle main="Conectividad aérea total SDE." style={{ marginBottom: 36 }} />
        {[
          { año: '2017', asientos: 4045,              pct: 31,            nota: 'Solo Aerolíneas Argentinas · Termas (SANH)' },
          { año: '2024', asientos: 800,               pct: 6,             nota: 'Pandemia y pérdida de frecuencias' },
          { año: '2026', asientos: asientosSemanales, pct: cobertura2026, nota: 'AA + Flybondi + Andes · SANE + SANH' },
        ].map((r, i) => (
          <div key={i} style={{ padding: 'clamp(16px,2vw,24px) 0', borderBottom: `0.5px solid ${C.stone}30` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <span style={{ fontSize: 'var(--fs-base)', fontWeight: 500, color: C.ink }}>{r.año}</span>
                <span style={{ fontSize: 'var(--fs-xs)', color: C.slate, marginLeft: 12 }}>{r.nota}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 'var(--fs-base)', fontWeight: 200, color: i === 0 ? C.ink : C.slate }}>{fmt(r.asientos)} asientos/sem</span>
                <span style={{ fontSize: 'var(--fs-xs)', color: C.stone, marginLeft: 8 }}>{r.pct}% de plazas</span>
              </div>
            </div>
            <div style={{ height: 3, background: `${C.stone}30`, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: r.pct+'%', background: i === 0 ? C.ink : C.stone, opacity: i === 0 ? 0.8 : 0.3 }} />
            </div>
          </div>
        ))}
        <Interpretacion style={{ marginTop: 32 }}>
          En 2017 solo operaba Aerolíneas Argentinas hacia Termas. Hoy la conectividad total SDE incluye Flybondi, Andes y ambos aeropuertos, alcanzando {cobertura2026}% de cobertura — similar a 2017 pero distribuida. La diferencia: el aeropuerto de Termas (SANH) tiene poca frecuencia directa; la mayoría vuela a la Capital y debe trasladarse.
        </Interpretacion>
      </section>
    </>
  )
}
