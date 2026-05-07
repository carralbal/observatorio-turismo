import { C, Paralelo, VoltLine, Eyebrow, SectionTitle, Interpretacion } from '../components/Atoms'
import { useCSV } from '../hooks/useCSV'

const VIDEO_URL = 'https://www.pexels.com/es-es/download/video/30712308/'

function lastFecha(data, col = 'fecha') {
  if (!data?.length) return '—'
  const vals = data.map(r => r[col]).filter(Boolean).sort()
  const v = vals[vals.length - 1]
  if (!v || v === '—') return '—'
  if (String(v).length === 4) return String(v)
  try {
    return new Date(v).toLocaleDateString('es-AR', { month: 'short', year: 'numeric' })
  } catch { return String(v) }
}

const INDICADORES = [
  { sigla: 'IBT', nombre: 'Índice de Búsqueda Turística',
    formula: 'Interés de búsqueda / pico histórico × 100',
    descripcion: 'Proxy de intención de viaje basado en volumen de búsquedas Google por "Termas de Río Hondo". IBT>60 anticipa alta demanda hotelera con 4–8 semanas de anticipación.',
    desarrollo: 'De Google Trends se extrae la serie histórica mensual del término "Termas de Río Hondo" en Argentina, normalizada en escala 0–100 relativa al pico histórico. El IBT compuesto combina tres términos (alojamiento termal, destino general, MotoGP) ponderados según correlación histórica con viajeros EOH. Se usa como predictor adelantado en el modelo OLS y como señal independiente en el tablero de demanda digital.',
    fuente: 'Google Trends', paginas: '/señal · /estimado',
    cuidado: 'Sensible a eventos puntuales. Comparar siempre contra igual período año anterior.' },
  { sigla: 'ICV', nombre: 'Índice de Captura de Valor',
    formula: '(ingreso capturado / ingreso potencial) × 100',
    descripcion: 'ICV 38% = de cada $100 de gasto turístico potencial, $38 quedan registrados formalmente. El resto: economía informal, consumo fuera del destino, alojamiento no registrado.',
    desarrollo: 'El ingreso potencial se estima multiplicando los viajeros (EOH/OLS) por la estadía media y el gasto promedio por turista de la EVyTH deflactado por IPC NOA. El ingreso capturado se aproxima mediante el gasto declarado en el sector formal, ajustado por ocupación AirROI para incluir el alquiler temporario. La diferencia revela la magnitud de la fuga de valor. Es un proxy N1: cuando el Observatorio acceda a datos fiscales de IIBB HyG (N2), el error se reducirá de 20–35% a 8–15%.',
    fuente: 'EOH + EVyTH + AirROI', paginas: '/captura',
    cuidado: 'Nivel N1 (proxy): error 20–35%. Requiere convenio DGR para dato fiscal real (N2).' },
  { sigla: 'ISTP', nombre: 'Índice de Salud Turística Provincial',
    formula: 'Score 0–100 · ponderación 50/30/20 (demanda/ocupación/habilitantes)',
    descripcion: 'Clasifica las 24 provincias según madurez del ecosistema turístico. No mide volumen sino salud estructural. SDE 2025: 57.92/100 · Cuadrante I · ranking 12°.',
    desarrollo: 'Integra datos de ANAC (conectividad aérea), CNRT (terrestre), SIPA-AFIP (empleo HyG), AirDNA (informal) y EOH (ocupación hotelera) para las 24 provincias entre 2019 y 2025. Cada dimensión se normaliza 0–100 y se agrega con ponderación 50% demanda, 30% ocupación, 20% habilitantes. La trayectoria (pendiente 2019–2025) determina el cuadrante: score bajo con trayectoria ascendente (Cuadrante I) implica oportunidad estructural.',
    fuente: 'ANAC, CNRT, SIPA-AFIP, AirDNA, EOH · elaboración propia', paginas: '/salud',
    cuidado: 'Corte anual. La trayectoria tiene más valor diagnóstico que el score puntual.' },
  { sigla: 'OLS', nombre: 'Estimado OLS',
    formula: 'Viajeros = f(ANAC, AirROI, IBT, IPC NOA, BCRA, SIPA, estacionalidad)',
    descripcion: 'Modelo de regresión que reemplaza la EOH desde dic 2025. R²=0.868 Termas · R²=0.808 Capital. Estimación mensual con intervalo de confianza 90%.',
    desarrollo: 'Entrenado sobre la serie EOH 2018–2025. Los predictores seleccionados por correlación y significancia son: pasajeros ANAC (demanda directa), ocupación AirROI (señal informal), IBT (intención anticipada), IPC NOA restaurantes y hoteles (competitividad precio), tipo de cambio BCRA (atractivo turístico), empleo SIPA-AFIP (capacidad instalada) y dummies de estacionalidad mensual. Genera punto de estimación e intervalo de confianza al 90% para Termas y Capital por separado.',
    fuente: 'Entrenado sobre EOH 2018–2025', paginas: '/estimado · /',
    cuidado: 'Shocks externos no anticipados (nueva ruta, evento masivo) pueden generar desvío transitorio.' },
  { sigla: 'LF', nombre: 'Load Factor',
    formula: 'pasajeros / asientos × 100',
    descripcion: 'Porcentaje de asientos ocupados. LF>80% en vuelos = alta demanda. LF>70% en buses = alta ocupación.',
    desarrollo: 'ANAC publica mensualmente los movimientos aéreos por ruta y aerolínea con apertura de pasajeros y asientos. El LF aéreo se calcula para el par SDE–Buenos Aires y otras rutas de cabotaje. La CNRT publica anualmente los viajes, asientos y pasajeros por par origen–destino para servicios regulares; el LF terrestre se calcula para rutas con al menos un viaje semanal con origen o destino en Termas o Santiago del Estero capital.',
    fuente: 'ANAC (aéreo) · CNRT (terrestre)', paginas: '/aerea · /terrestre',
    cuidado: null },
  { sigla: 'EM', nombre: 'Estadía Media',
    formula: 'pernoctes totales / viajeros totales',
    descripcion: 'Noches promedio por visita. Termas histórico EOH: ~3.8 noches. AirROI captura el segmento informal.',
    desarrollo: 'La EOH registraba mensualmente viajeros y pernoctaciones por localidad y categoría. AirROI complementa con la estadía del alquiler temporario (tiende a ser más larga: 4–6 noches). La serie se filtra excluyendo el bache COVID 2020–2021 y registros AirROI con ocupación inferior al 10% o estadía superior a 8 noches, tratados como outliers.',
    fuente: 'EOH INDEC (hasta nov 2025) · AirROI', paginas: '/',
    cuidado: 'Serie filtrada: sin bache COVID, sin outliers AirROI (occ<10%, cap 8n).' },
]

const ADVERTENCIAS = [
  {
    titulo: 'EOH discontinuada desde dic 2025',
    texto: 'El INDEC dejó de publicar la Encuesta de Ocupación Hotelera en diciembre de 2025 por falta de financiamiento de la Secretaría de Turismo. Último dato: noviembre 2025. No hay reemplazo oficial anunciado. El Observatorio compensa con el modelo OLS.',
  },
  {
    titulo: 'Termas de Río Hondo ≠ provincia SDE',
    texto: 'La mayoría de indicadores refieren a Termas como destino principal. Los datos provinciales agregados tienen menor granularidad y dependen de fuentes nacionales. El Observatorio trabaja activamente para incorporar datos subnacionales propios.',
  },
  {
    titulo: 'ICV nivel N1 es un proxy con margen amplio',
    texto: 'En nivel N1 el ICV combina estimaciones con error 20–35%. Para dato fiscal real se requiere convenio con la DGR provincial (N2, error 8–15%). El proceso está en elaboración.',
  },
  {
    titulo: 'CNRT sin datos 2025 en formato abierto',
    texto: 'El dataset de conectividad terrestre de la DNMyE tiene rezago de ~12 meses. Los datos de 2025 existen en PDFs trimestrales de CNRT pero sin desglose por par de ruta. El CSV descargable llega hasta 2024.',
  },
  {
    titulo: 'Google Trends: actualización manual mensual',
    texto: 'El IBT se carga manualmente cada mes. La automatización nocturna falla por rate limits de la API pública. El desfase máximo respecto al dato real es de 30 días.',
  },
  {
    titulo: 'AirROI: proxy del sector informal',
    texto: 'AirDNA/AirROI captura el mercado de alquiler temporario (Airbnb-style) pero no cubre la economía informal en sentido amplio. El ICV usa este dato como proxy de la dimensión no registrada.',
  },
]

export default function Databook() {
  const { data: aereo }    = useCSV('/data/data_aereo.csv')
  const { data: trends }   = useCSV('/data/data_trends.csv')
  const { data: pulso }    = useCSV('/data/data_pulso.csv')
  const { data: estimado } = useCSV('/data/data_pulso_estimado.csv')
  const { data: empleo }   = useCSV('/data/data_empleo_hyg.csv')
  const { data: airdna }   = useCSV('/data/data_airdna_sde.csv')
  const { data: macro }    = useCSV('/data/data_macro.csv')
  const { data: terrestre }= useCSV('/data/data_terrestre.csv')
  const { data: youtube }  = useCSV('/data/data_youtube.csv')
  const { data: perfil }   = useCSV('/data/data_perfil_turista.csv')
  const { data: madurez }  = useCSV('/data/data_madurez.csv')

  const FUENTES = [
    { nombre: 'ANAC · Pasajeros aéreos',        entidad: 'ANAC',           hasta: lastFecha(aereo),    frec: 'Mensual',    estado: 'activo',        pagina: '/aerea' },
    { nombre: 'SIPA-AFIP/OEDE · Empleo HyG',    entidad: 'SIPA-AFIP',      hasta: lastFecha(empleo),   frec: 'Trimestral', estado: 'activo',        pagina: '/empleo' },
    { nombre: 'AirDNA/AirROI · Informal',        entidad: 'AirDNA',         hasta: lastFecha(airdna),   frec: 'Mensual',    estado: 'activo',        pagina: '/informal' },
    { nombre: 'BCRA · Tipo de cambio',           entidad: 'BCRA',           hasta: lastFecha(macro),    frec: 'Mensual',    estado: 'activo',        pagina: '/nacional' },
    { nombre: 'INDEC ETI · Turismo int.',        entidad: 'INDEC',          hasta: lastFecha(macro),    frec: 'Mensual',    estado: 'activo',        pagina: '/nacional' },
    { nombre: 'Google Trends · IBT',             entidad: 'Google',         hasta: lastFecha(trends),   frec: 'Mensual',    estado: 'activo',        pagina: '/señal' },
    { nombre: 'YouTube Data API · Imagen',       entidad: 'YouTube',        hasta: lastFecha(youtube),  frec: 'Mensual',    estado: 'activo',        pagina: '/imagen' },
    { nombre: 'INDEC EVyTH · Perfil turista',    entidad: 'INDEC',          hasta: lastFecha(perfil),   frec: 'Trimestral', estado: 'activo',        pagina: '/perfil' },
    { nombre: 'OLS · Estimado viajeros',         entidad: 'Observatorio',   hasta: lastFecha(estimado), frec: 'Mensual',    estado: 'activo',        pagina: '/estimado' },
    { nombre: 'CNRT · Terrestre',                entidad: 'CNRT',           hasta: lastFecha(terrestre, 'anio'), frec: 'Anual', estado: 'alerta',   pagina: '/terrestre' },
    { nombre: 'INDEC EOH · Ocupación hotelera',  entidad: 'INDEC',          hasta: lastFecha(pulso),    frec: 'Mensual',    estado: 'discontinuado', pagina: '/estimado' },
    { nombre: 'ISTP · Salud turística',          entidad: 'Observatorio',   hasta: lastFecha(madurez, 'anio'), frec: 'Anual', estado: 'activo',    pagina: '/salud' },
    { nombre: 'SINTA PUNA · Plazas hoteleras',   entidad: 'SINTA',          hasta: '2024',              frec: 'Anual',      estado: 'pendiente',     pagina: '/alojamiento' },
    { nombre: 'DGR SDE · IIBB HyG',             entidad: 'DGR SDE',        hasta: '—',                 frec: 'Mensual',    estado: 'convenio',      pagina: '/captura' },
  ]

  const estadoColor = {
    activo:       { bg: C.volt,   fg: C.ink   },
    alerta:       { bg: C.stone,  fg: C.ink   },
    discontinuado:{ bg: C.slate,  fg: C.paper },
    pendiente:    { bg: C.paper2, fg: C.slate },
    convenio:     { bg: C.paper2, fg: C.slate },
  }
  const estadoLabel = {
    activo: 'Activo', alerta: 'Con alerta', discontinuado: 'Discontinuado',
    pendiente: 'Pendiente', convenio: 'Requiere convenio',
  }

  return (
    <>
      {/* HERO */}
      <section style={{ position: 'relative', minHeight: '44vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 'clamp(64px,8vw,96px) var(--pad) clamp(48px,6vw,72px)' }}>
        <video autoPlay loop muted playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, filter: 'grayscale(1)' }}>
          <source src={VIDEO_URL} type="video/mp4" />
        </video>
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to right, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.75) 50%, rgba(10,10,10,0.2) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <Paralelo /><Eyebrow light>Documentación · Observatorio SDE</Eyebrow>
          </div>
          <h1 style={{ fontSize: 'clamp(2.4rem,5vw,5rem)', fontWeight: 200, color: C.paper, letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 20px' }}>
            DataBook.<br />Metodología<br />y definiciones.
          </h1>
          <p style={{ fontSize: '0.9rem', color: C.paper, opacity: 0.55, maxWidth: 480, lineHeight: 1.7, margin: 0 }}>
            Definiciones precisas de cada indicador, períodos de cobertura, metodología de construcción y advertencias de uso. Última actualización sincronizada con los datos del warehouse.
          </p>
        </div>
      </section>

      {/* INDICADORES */}
      <section style={{ background: C.ink, padding: 'clamp(56px,7vw,88px) var(--pad)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <Paralelo /><Eyebrow light>01 · Definiciones</Eyebrow>
        </div>
        <SectionTitle light main="Indicadores del observatorio." style={{ marginBottom: 48 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%,480px),1fr))', gap: 1 }}>
          {INDICADORES.map(ind => (
            <div key={ind.sigla} style={{ background: 'rgba(250,250,247,0.03)', padding: 'clamp(24px,3vw,36px)', borderLeft: `2px solid ${C.volt}` }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 12 }}>
                <span style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 200, color: C.volt, letterSpacing: '-0.04em', lineHeight: 1 }}>{ind.sigla}</span>
                <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 500, color: C.paper, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{ind.nombre}</span>
              </div>
              <div style={{ fontSize: 'var(--fs-xs)', fontFamily: 'monospace', color: C.stone, background: 'rgba(250,250,247,0.04)', padding: '6px 10px', marginBottom: 14, letterSpacing: '0.02em' }}>
                {ind.formula}
              </div>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'rgba(250,250,247,0.7)', lineHeight: 1.7, margin: '0 0 12px' }}>{ind.descripcion}</p>
              {ind.desarrollo && <p style={{ fontSize: 'var(--fs-xs)', color: 'rgba(250,250,247,0.45)', lineHeight: 1.75, margin: '0 0 12px', borderLeft: `2px solid rgba(250,250,247,0.1)`, paddingLeft: 12 }}>{ind.desarrollo}</p>}
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: ind.cuidado ? 12 : 0 }}>
                <div>
                  <div style={{ fontSize: 9, color: C.stone, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>Fuente</div>
                  <div style={{ fontSize: 'var(--fs-xs)', color: C.paper, opacity: 0.6 }}>{ind.fuente}</div>
                </div>
                <div>
                  <div style={{ fontSize: 9, color: C.stone, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>Páginas</div>
                  <div style={{ fontSize: 'var(--fs-xs)', color: C.paper, opacity: 0.6 }}>{ind.paginas}</div>
                </div>
              </div>
              {ind.cuidado && (
                <div style={{ borderTop: '0.5px solid rgba(250,250,247,0.08)', paddingTop: 12, marginTop: 4 }}>
                  <span style={{ fontSize: 9, color: C.volt, letterSpacing: '0.1em', textTransform: 'uppercase', marginRight: 8 }}>⚠ Cuidado</span>
                  <span style={{ fontSize: 'var(--fs-xs)', color: 'rgba(250,250,247,0.45)' }}>{ind.cuidado}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* PERÍODOS Y COBERTURA */}
      <section style={{ background: C.paper, padding: 'clamp(56px,7vw,88px) var(--pad)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <Paralelo /><Eyebrow>02 · Períodos y cobertura</Eyebrow>
        </div>
        <SectionTitle main="Estado de cada fuente." style={{ marginBottom: 48 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {FUENTES.map((f, i) => {
            const ec = estadoColor[f.estado]
            return (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 'clamp(12px,2vw,32px)', alignItems: 'center', padding: '14px 0', borderBottom: `0.5px solid ${C.stone}30` }}>
                <div>
                  <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 500, color: C.ink }}>{f.nombre}</div>
                  <div style={{ fontSize: 'var(--fs-xs)', color: C.slate, marginTop: 2 }}>{f.entidad} · {f.pagina}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 9, color: C.stone, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>Frecuencia</div>
                  <div style={{ fontSize: 'var(--fs-xs)', color: C.slate }}>{f.frec}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 9, color: C.stone, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>Último dato</div>
                  <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 300, color: C.ink, letterSpacing: '-0.02em' }}>{f.hasta}</div>
                </div>
                <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', background: ec.bg, color: ec.fg, padding: '3px 8px', whiteSpace: 'nowrap' }}>
                  {estadoLabel[f.estado]}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      {/* METODOLOGÍA */}
      <section style={{ background: C.ink, padding: 'clamp(56px,7vw,88px) var(--pad)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <Paralelo /><Eyebrow light>03 · Metodología</Eyebrow>
        </div>
        <SectionTitle light main="Cómo se construye cada dato." style={{ marginBottom: 48 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%,360px),1fr))', gap: 32, maxWidth: 1100 }}>
          {[
            { num: '01', titulo: 'Ingestión de fuentes', texto: 'Pipeline nocturno (bash etl/update_all.sh) descarga datos de ANAC, SIPA-AFIP, AirROI, BCRA, INDEC e integra Google Trends de forma manual mensual. Todo ingresa al warehouse DuckDB local.' },
            { num: '02', titulo: 'Transformación dbt', texto: 'Los datos crudos se transforman en marts analíticos usando dbt. Cada mart tiene una capa de staging (limpieza) y una de marts (indicadores finales). Los modelos son reproducibles y versionados.' },
            { num: '03', titulo: 'Modelo OLS de estimación', texto: 'Desde dic 2025 (cierre EOH), un modelo de regresión lineal entrenado sobre 2018–2025 estima mensualmente los viajeros hoteleros. Variables: ANAC, AirROI, IBT, IPC NOA, BCRA, empleo, estacionalidad.' },
            { num: '04', titulo: 'Exportación a CSVs', texto: 'Los marts se exportan a CSVs en frontend/public/data/ para consumo del dashboard React. Esta capa de bridge garantiza que Vercel sirva datos actualizados sin acceso directo al warehouse.' },
            { num: '05', titulo: 'Cálculo del ICV', texto: 'Ingreso potencial = viajeros EOH/OLS × estadía media × gasto promedio EVyTH deflactado. Ingreso capturado = estimación proxy de gasto en sector formal registrado. ICV = capturado / potencial × 100.' },
            { num: '06', titulo: 'Cálculo del ISTP', texto: 'Índice compuesto en 4 cuadrantes: demanda (viajeros, pernoctes, estacionalidad), ocupación (hotelera, informal), habilitantes (empleo, conectividad, datos). Ponderación 50/30/20. 24 provincias, datos 2019–2025.' },
          ].map(m => (
            <div key={m.num} style={{ borderTop: `1px solid rgba(250,250,247,0.1)`, paddingTop: 24 }}>
              <span style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 200, color: C.volt, letterSpacing: '-0.05em', lineHeight: 1, display: 'block', marginBottom: 12 }}>{m.num}</span>
              <div style={{ fontSize: 'var(--fs-base)', fontWeight: 500, color: C.paper, marginBottom: 10 }}>{m.titulo}</div>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'rgba(250,250,247,0.55)', lineHeight: 1.75, margin: 0 }}>{m.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ADVERTENCIAS */}
      <section style={{ background: C.paper, padding: 'clamp(56px,7vw,88px) var(--pad)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <Paralelo /><Eyebrow>04 · Advertencias de uso</Eyebrow>
        </div>
        <SectionTitle main="Limitaciones y criterios." style={{ marginBottom: 48 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, maxWidth: 760 }}>
          {ADVERTENCIAS.map((a, i) => (
            <div key={i} style={{ padding: '24px 0', borderBottom: `0.5px solid ${C.stone}40` }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 'var(--fs-xs)', color: C.volt, background: C.ink, padding: '2px 8px', fontWeight: 600, letterSpacing: '0.08em', flexShrink: 0, marginTop: 2 }}>⚠</span>
                <div>
                  <div style={{ fontSize: 'var(--fs-base)', fontWeight: 500, color: C.ink, marginBottom: 8 }}>{a.titulo}</div>
                  <p style={{ fontSize: 'var(--fs-sm)', color: C.slate, lineHeight: 1.75, margin: 0 }}>{a.texto}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Interpretacion>
          Este DataBook se actualiza automáticamente con cada ciclo de pipeline. Las fechas de último dato en la sección de Períodos se leen directamente del warehouse exportado. Para metodología detallada del ISTP referirse al elaboración propia.
        </Interpretacion>
      </section>
    </>
  )
}
