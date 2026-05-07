import { C, Paralelo, Eyebrow, SectionTitle, VoltLine } from '../components/Atoms'

const VIDEO_URL = 'https://www.pexels.com/es-es/download/video/8387491/'

const FUENTES = [
  {
    id: 'anac',
    nombre: 'Pasajeros Aéreos',
    entidad: 'ANAC',
    entidad_full: 'Administración Nacional de Aviación Civil',
    frecuencia: 'Mensual',
    cobertura: 'Nacional · rutas · aerolíneas',
    provee: 'Pasajeros, asientos, vuelos y load factor por ruta, aerolínea y aeropuerto. Desagregación cabotaje/internacional.',
    desde: 'Ene 2017',
    hasta: 'Mar 2026',
    estado: 'activo',
    paginas: ['/aerea'],
  },
  {
    id: 'sipa',
    nombre: 'Empleo Registrado HyG',
    entidad: 'SIPA-AFIP / OEDE',
    entidad_full: 'Sistema Integrado Previsional Argentino · Observatorio de Empleo',
    frecuencia: 'Trimestral',
    cobertura: '24 provincias · sector HyG',
    provee: 'Puestos de trabajo registrados en Hotelería y Gastronomía por provincia y trimestre.',
    desde: 'Ene 1996',
    hasta: 'Q3 2025',
    estado: 'activo',
    paginas: ['/empleo'],
  },
  {
    id: 'airdna',
    nombre: 'Alquiler Temporario',
    entidad: 'AirDNA · AirROI',
    entidad_full: 'AirDNA Market Data · AirROI Analytics',
    frecuencia: 'Mensual',
    cobertura: 'Termas de Río Hondo · Capital',
    provee: 'Ocupación, tarifa diaria promedio (ADR), estadía media y cantidad de listings activos del mercado informal.',
    desde: 'Abr 2021',
    hasta: 'Mar 2026',
    estado: 'activo',
    paginas: ['/informal'],
  },
  {
    id: 'bcra',
    nombre: 'Tipo de Cambio',
    entidad: 'BCRA',
    entidad_full: 'Banco Central de la República Argentina',
    frecuencia: 'Mensual',
    cobertura: 'Nacional',
    provee: 'Tipo de cambio nominal ARS/USD oficial. Predictor del modelo OLS y contexto macro para captura de valor.',
    desde: 'Ene 2016',
    hasta: 'Mar 2026',
    estado: 'activo',
    paginas: ['/nacional', '/estimado'],
  },
  {
    id: 'eti',
    nombre: 'Turismo Internacional',
    entidad: 'INDEC · ETI',
    entidad_full: 'Instituto Nacional de Estadística y Censos · Encuesta de Turismo Internacional',
    frecuencia: 'Mensual',
    cobertura: 'Nacional · receptivo y emisivo',
    provee: 'Turistas receptivos, emisivos y balanza turística en divisas. Desglose por medio de transporte y país de origen/destino.',
    desde: 'Ene 2016',
    hasta: 'Mar 2026',
    estado: 'activo',
    paginas: ['/nacional'],
  },
  {
    id: 'ipc',
    nombre: 'Índice de Precios al Consumidor',
    entidad: 'INDEC',
    entidad_full: 'Instituto Nacional de Estadística y Censos',
    frecuencia: 'Mensual',
    cobertura: 'Nacional · regional NOA',
    provee: 'IPC capítulos Restaurantes/Hoteles y Transporte. Deflactor del modelo OLS y referencia de competitividad precio.',
    desde: 'Dic 2016',
    hasta: 'Mar 2026',
    estado: 'activo',
    paginas: ['/estimado', '/captura'],
  },
  {
    id: 'evyth',
    nombre: 'Perfil del Turista Interno',
    entidad: 'INDEC · EVyTH',
    entidad_full: 'Encuesta de Viajes y Turismo de los Hogares',
    frecuencia: 'Trimestral',
    cobertura: 'Nacional · NOA',
    provee: 'Motivo de viaje, modo de transporte, tipo de alojamiento, gasto promedio y estadía media por región de destino.',
    desde: 'Ene 2012',
    hasta: 'Abr 2024',
    estado: 'activo',
    paginas: ['/perfil'],
  },
  {
    id: 'trends',
    nombre: 'Índice de Búsqueda Turística',
    entidad: 'Google Trends',
    entidad_full: 'Google LLC · Trends API',
    frecuencia: 'Mensual',
    cobertura: 'Argentina · "Termas de Río Hondo"',
    provee: 'IBT: índice de interés de búsqueda relativo al pico histórico (escala 0-100). Anticipa demanda hotelera 4-8 semanas.',
    desde: 'Ene 2014',
    hasta: 'Dic 2025',
    estado: 'alerta',
    nota: 'Rate limit frecuente · cron 3am',
    paginas: ['/señal'],
  },
  {
    id: 'youtube',
    nombre: 'Imagen Destino · YouTube',
    entidad: 'YouTube Data API',
    entidad_full: 'Google LLC · YouTube Data API v3',
    frecuencia: 'Mensual',
    cobertura: 'Global · contenido sobre SDE',
    provee: 'Videos publicados, vistas acumuladas, canales y categorías de contenido sobre Santiago del Estero y Termas.',
    desde: 'Oct 2009',
    hasta: 'May 2026',
    estado: 'activo',
    paginas: ['/imagen'],
  },
  {
    id: 'cnrt',
    nombre: 'Tráfico Terrestre',
    entidad: 'CNRT',
    entidad_full: 'Comisión Nacional de Regulación del Transporte',
    frecuencia: 'Anual',
    cobertura: 'Nacional · rutas interurbanas',
    provee: 'Pasajeros, asientos y viajes de ómnibus de larga distancia por par origen-destino. Load factor por ruta.',
    desde: '2019',
    hasta: '2024',
    estado: 'alerta',
    nota: '2025 no publicado aún',
    paginas: ['/terrestre'],
  },
  {
    id: 'eoh',
    nombre: 'Ocupación Hotelera',
    entidad: 'INDEC · EOH',
    entidad_full: 'Encuesta de Ocupación Hotelera',
    frecuencia: 'Mensual',
    cobertura: 'Nacional · localidades turísticas',
    provee: 'Viajeros hospedados, pernoctes y estadía media por localidad y categoría hotelera.',
    desde: 'Ene 2018',
    hasta: 'Nov 2025',
    estado: 'discontinuado',
    nota: 'Discontinuada dic 2025 — reemplazada por modelo OLS',
    paginas: ['/estimado'],
  },
  {
    id: 'puna',
    nombre: 'Padrón de Alojamientos',
    entidad: 'SINTA · PUNA',
    entidad_full: 'Sistema de Información Turística de la Argentina · Padrón Único Nacional de Alojamientos',
    frecuencia: 'Anual',
    cobertura: 'Nacional · 1.265 localidades',
    provee: 'Plazas hoteleras, establecimientos y categorías por localidad. SDE: 13.055 plazas, 7° lugar nacional.',
    desde: '—',
    hasta: '2024',
    estado: 'pendiente',
    nota: 'Descarga manual pendiente',
    paginas: ['/alojamiento'],
  },
  {
    id: 'dgr',
    nombre: 'IIBB SDE · Sector HyG',
    entidad: 'DGR Santiago del Estero',
    entidad_full: 'Dirección General de Rentas · Provincia de Santiago del Estero',
    frecuencia: 'Mensual',
    cobertura: 'SDE · sector Hotelería y Gastronomía',
    provee: 'Ingresos Brutos declarados por empresas del sector HyG. Base del ICV nivel N2 (error 8-15%).',
    desde: '—',
    hasta: '—',
    estado: 'convenio',
    nota: 'Requiere convenio DGR-SDE',
    paginas: ['/captura'],
  },
]

const ESTADO_CONFIG = {
  activo:       { label: 'Activo',        color: C.volt,  textColor: C.ink  },
  alerta:       { label: 'Con alertas',   color: C.stone, textColor: C.ink  },
  discontinuado:{ label: 'Discontinuado', color: C.slate, textColor: C.paper},
  pendiente:    { label: 'Pendiente',     color: C.paper2,textColor: C.slate },
  convenio:     { label: 'Requiere convenio', color: C.paper2, textColor: C.slate },
}

function EstadoBadge({ estado }) {
  const cfg = ESTADO_CONFIG[estado] || ESTADO_CONFIG.activo
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      background: cfg.color,
      color: cfg.textColor,
      borderRadius: 0,
    }}>
      {cfg.label}
    </span>
  )
}

function FuenteCard({ f, index }) {
  const dark = index % 2 === 0
  const bg = dark ? C.ink : C.paper
  const fg = dark ? C.paper : C.ink
  const fgDim = dark ? 'rgba(250,250,247,0.45)' : C.slate

  return (
    <div style={{
      background: bg,
      padding: 'clamp(32px,4vw,52px)',
      borderBottom: `0.5px solid ${dark ? 'rgba(250,250,247,0.08)' : C.stone}`,
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 'clamp(24px,3vw,48px)',
      alignItems: 'start',
    }}>
      {/* Col 1: Nombre + entidad */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <EstadoBadge estado={f.estado} />
          {f.nota && (
            <span style={{ fontSize: 10, color: fgDim, fontWeight: 400 }}>{f.nota}</span>
          )}
        </div>
        <div style={{
          fontSize: 'clamp(1.4rem,2.2vw,2rem)',
          fontWeight: 200,
          color: fg,
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          marginBottom: 10,
        }}>
          {f.nombre}
        </div>
        <VoltLine w={20} style={{ marginBottom: 12 }} />
        <div style={{ fontSize: 13, fontWeight: 600, color: dark ? C.volt : C.ink, marginBottom: 4 }}>
          {f.entidad}
        </div>
        <div style={{ fontSize: 11, color: fgDim, lineHeight: 1.5 }}>
          {f.entidad_full}
        </div>
      </div>

      {/* Col 2: Qué provee */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 600, color: fgDim, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
          Qué provee
        </div>
        <div style={{ fontSize: '0.88rem', color: fg, lineHeight: 1.7, opacity: 0.85 }}>
          {f.provee}
        </div>
        <div style={{ marginTop: 16, fontSize: 10, color: fgDim, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Cobertura · {f.cobertura}
        </div>
      </div>

      {/* Col 3: Metadatos */}
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: fgDim, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Frecuencia</div>
            <div style={{ fontSize: '1rem', fontWeight: 300, color: fg }}>{f.frecuencia}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: fgDim, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Desde</div>
            <div style={{ fontSize: '1rem', fontWeight: 300, color: fg }}>{f.desde}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: fgDim, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Último dato</div>
            <div style={{ fontSize: '1rem', fontWeight: 300, color: dark ? C.volt : C.ink }}>{f.hasta}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: fgDim, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Páginas</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {f.paginas.map(p => (
                <span key={p} style={{ fontSize: 10, color: fgDim, background: dark ? 'rgba(250,250,247,0.06)' : C.paper2, padding: '2px 8px' }}>{p}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Fuentes() {
  const activas = FUENTES.filter(f => f.estado === 'activo').length
  const alertas = FUENTES.filter(f => f.estado === 'alerta').length
  const discontinuadas = FUENTES.filter(f => f.estado === 'discontinuado').length
  const pendientes = FUENTES.filter(f => ['pendiente','convenio'].includes(f.estado)).length

  return (
    <>
      <section style={{ position: 'relative', minHeight: '42vh', overflow: 'hidden', padding: 'clamp(64px,8vw,96px) var(--pad) clamp(48px,6vw,72px)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <video autoPlay loop muted playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, filter: 'grayscale(1)' }}>
          <source src={VIDEO_URL} type="video/mp4" />
        </video>
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to right, rgba(10,10,10,0.93) 0%, rgba(10,10,10,0.78) 35%, rgba(10,10,10,0.38) 65%, rgba(10,10,10,0.10) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <Paralelo />
          <Eyebrow light>Infraestructura de datos · Observatorio SDE</Eyebrow>
        </div>
        <h1 style={{
          fontSize: 'clamp(2.4rem,5vw,5rem)',
          fontWeight: 200,
          color: C.paper,
          letterSpacing: '-0.04em',
          lineHeight: 1,
          margin: '0 0 24px',
        }}>
          Fuentes<br />de datos.
        </h1>
        <p style={{
          fontSize: '0.9rem',
          color: C.paper,
          opacity: 0.55,
          maxWidth: 480,
          lineHeight: 1.7,
          margin: '0 0 52px',
        }}>
          {FUENTES.length} fuentes integradas. Cada indicador del observatorio tiene trazabilidad completa hasta su origen oficial.
        </p>

        {/* KPIs */}
        <div style={{ display: 'flex', gap: 'clamp(24px,4vw,56px)', flexWrap: 'wrap' }}>
          {[
            { v: activas,       l: 'Fuentes activas'     },
            { v: alertas,       l: 'Con alertas'         },
            { v: discontinuadas,l: 'Discontinuadas'      },
            { v: pendientes,    l: 'Pendientes'          },
          ].map((k, i) => (
            <div key={i} style={{ borderLeft: `2px solid ${i === 0 ? C.volt : 'rgba(250,250,247,0.15)'}`, paddingLeft: 20 }}>
              <div style={{ fontSize: 'clamp(2rem,3vw,2.8rem)', fontWeight: 200, color: i === 0 ? C.volt : C.paper, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 6 }}>
                {k.v}
              </div>
              <div style={{ fontSize: 11, color: C.paper, opacity: 0.45, fontWeight: 400, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {k.l}
              </div>
            </div>
          ))}
        </div>
        </div>
      </section>

      {/* Lista de fuentes */}
      <div>
        {FUENTES.map((f, i) => (
          <FuenteCard key={f.id} f={f} index={i} />
        ))}
      </div>

      {/* Footer note */}
      <section style={{ background: C.paper, padding: 'clamp(40px,5vw,64px) var(--pad)' }}>
        <div style={{ maxWidth: 640 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: C.stone, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
            Nota metodológica
          </div>
          <p style={{ fontSize: '0.85rem', color: C.slate, lineHeight: 1.75, margin: 0 }}>
            Todos los datos provienen de fuentes oficiales públicas o contratos de datos privados (AirDNA/AirROI).
            Los marts del warehouse son transformaciones reproducibles sobre los datos crudos mediante dbt.
            El modelo OLS de estimación de viajeros reemplaza la EOH desde diciembre 2025, fecha en que INDEC
            discontinuó la encuesta sin anuncio de reemplazo.
          </p>
        </div>
      </section>
    </>
  )
}
