import {
  Users, Bed, TrendingUp, Search, Briefcase,
  Plane, Bus, Home as HomeIcon, DollarSign,
  BarChart2, MapPin, Activity, ArrowUpRight,
  ArrowDownRight, Minus, Building2, Waves,
} from 'lucide-react'

export {
  Users, Bed, TrendingUp, Search, Briefcase,
  Plane, Bus, HomeIcon, DollarSign,
  BarChart2, MapPin, Activity, Building2, Waves,
}

// ── Vocabulario de íconos — usar SIEMPRE estos para los mismos conceptos ─────
export const ICONS = {
  viajeros:       Users,
  estadia:        Bed,
  ibt:            TrendingUp,
  empleo:         Briefcase,
  aereo:          Plane,
  terrestre:      Bus,
  informal:       HomeIcon,
  adr:            DollarSign,
  pernoctaciones: BarChart2,
  ubicacion:      MapPin,
  pulso:          Activity,
  edificio:       Building2,
  termal:         Waves,
}

// ── TOKENS ───────────────────────────────────────────────────────────────────
export const C = {
  ink: '#0A0A0A', paper: '#FAFAF7', paper2: '#F2F2EE',
  slate: '#3A3A36', stone: '#C8C8BF', volt: '#FFFF00',
}

// ── ATOMS ────────────────────────────────────────────────────────────────────
export const Paralelo = ({ w = 18, h = 8, style = {} }) => (
  <span style={{
    display: 'inline-block', width: w, height: h, flexShrink: 0,
    background: C.volt, transform: 'skewX(-14deg)', ...style,
  }} />
)

export const VoltLine = ({ w = 28 }) => (
  <div style={{ width: w, height: 2, background: C.volt, flexShrink: 0 }} />
)

export const Eyebrow = ({ children, light = false, style = {} }) => (
  <p style={{
    fontSize: 10.5, fontWeight: 600, margin: 0, lineHeight: 1,
    color: light ? C.paper : C.slate,
    opacity: light ? 0.55 : 0.8,
    letterSpacing: '0.2em', textTransform: 'uppercase',
    ...style,
  }}>{children}</p>
)

// ── SECTION TITLE — patrón: contexto pequeño arriba · concepto grande abajo ─
export const SectionTitle = ({ icon: Icon, main, context, light = false, style = {} }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, ...style }}>
    {Icon && (
      <Icon
        size={20} strokeWidth={1.5}
        style={{ color: light ? C.paper : C.slate, opacity: 0.55, flexShrink: 0, marginTop: 14 }}
      />
    )}
    <div>
      {context && (
        <p style={{
          fontSize: 10.5, fontWeight: 600,
          color: light ? C.paper : C.slate,
          opacity: light ? 0.45 : 0.65,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          margin: '0 0 8px', lineHeight: 1,
        }}>{context}</p>
      )}
      <h2 style={{
        fontSize: 'clamp(1.5rem, 3vw, 2.6rem)',
        fontWeight: 300,
        color: light ? C.paper : C.ink,
        letterSpacing: '-0.035em', lineHeight: 1.05,
        margin: 0,
      }}>{main}</h2>
    </div>
  </div>
)

// ── DELTA TAG ─────────────────────────────────────────────────────────────────
export const Delta = ({ value, light = false }) => {
  if (!value) return null
  const n = parseFloat(value)
  const pos = n > 0
  const neg = n < 0
  const Icon = pos ? ArrowUpRight : neg ? ArrowDownRight : Minus
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      fontSize: 11, fontWeight: 600,
      color: light ? C.paper : C.ink,
      opacity: 0.75,
    }}>
      <Icon size={13} strokeWidth={2} />
      {Math.abs(n).toFixed(1)}%
    </span>
  )
}

// ── KPI CARD ──────────────────────────────────────────────────────────────────
export const KPICard = ({ icon: Icon, value, label, delta, light = false, volt = false }) => (
  <div style={{ borderLeft: `1px solid ${light ? 'rgba(250,250,247,0.15)' : C.stone}`, paddingLeft: 'clamp(14px, 2vw, 24px)' }}>
    {Icon && (
      <Icon size={16} strokeWidth={1.5} style={{
        color: volt ? C.volt : (light ? C.paper : C.slate),
        opacity: 0.65, marginBottom: 10, display: 'block',
      }} />
    )}
    <div style={{
      fontSize: 'clamp(1.7rem, 3vw, 3.2rem)',
      fontWeight: 200,
      color: volt ? C.volt : (light ? C.paper : C.ink),
      letterSpacing: '-0.045em', lineHeight: 1, marginBottom: 10,
    }}>{value}</div>
    <VoltLine w={20} />
    <div style={{ fontSize: 12.5, fontWeight: 400, color: light ? C.paper : C.ink, marginTop: 10, marginBottom: 4, lineHeight: 1.3 }}>{label}</div>
    {delta && <div style={{ fontSize: 11, fontWeight: 400, color: light ? C.stone : C.slate, opacity: 0.65 }}>{delta}</div>}
  </div>
)

// ── INTERPRETACIÓN ────────────────────────────────────────────────────────────
export const Interpretacion = ({ texto, children, light = false }) => (
  <p style={{
    fontSize: '0.85rem', fontWeight: 400,
    color: light ? C.paper : C.slate,
    opacity: light ? 0.65 : 0.85,
    lineHeight: 1.75, margin: '20px 0 0 0',
    maxWidth: 640,
    borderLeft: `2px solid ${light ? 'rgba(250,250,247,0.2)' : C.stone}`,
    paddingLeft: 16,
  }}>{texto ?? children}</p>
)

// ── PAGE STUB ─────────────────────────────────────────────────────────────────
export const PageStub = ({ titulo, subtitulo }) => (
  <div style={{
    minHeight: 'calc(100vh - 98px)', background: C.paper,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexDirection: 'column', gap: 20, padding: 'var(--pad)',
  }}>
    <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 200, color: C.ink, letterSpacing: '-0.04em', textAlign: 'center' }}>{titulo}</h1>
    <p style={{ fontSize: '0.9rem', fontWeight: 400, color: C.slate, opacity: 0.65, textAlign: 'center', maxWidth: 380 }}>{subtitulo}</p>
    <VoltLine w={36} />
    <p style={{ fontSize: 10, fontWeight: 600, color: C.stone, letterSpacing: '0.18em', textTransform: 'uppercase' }}>En construcción</p>
  </div>
)

// ── LOADING ───────────────────────────────────────────────────────────────────
export const Loading = () => (
  <div style={{ minHeight: 'calc(100vh - 98px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.paper }}>
    <Eyebrow style={{ opacity: 0.4 }}>Cargando datos</Eyebrow>
  </div>
)
