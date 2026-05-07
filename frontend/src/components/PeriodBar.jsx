import { useState, useEffect } from 'react'
import { usePeriodo } from '../context/PeriodoContext'
import { C } from './Atoms'

function useIsMobile() {
  const [v, setV] = useState(() => window.innerWidth < 640)
  useEffect(() => {
    const h = () => setV(window.innerWidth < 640)
    window.addEventListener('resize', h, { passive: true })
    return () => window.removeEventListener('resize', h)
  }, [])
  return v
}

const Pill = ({ label, active, onClick, volt }) => (
  <button onClick={onClick} style={{
    background: 'none', border: 'none', cursor: 'pointer',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontSize: 'var(--fs-xs)',
    fontWeight: active ? 700 : 500,
    color: active ? (volt ? C.volt : C.paper) : C.paper,
    opacity: active ? 1 : 0.38,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    padding: '4px 7px',
    borderBottom: active ? `1.5px solid ${volt ? C.volt : C.paper}` : '1.5px solid transparent',
    transition: 'all 0.15s',
    flexShrink: 0,
    lineHeight: 1.4,
    WebkitTapHighlightColor: 'transparent',
  }}>
    {label}
  </button>
)

const Sep = () => (
  <div style={{ width: 1, height: 12, background: 'rgba(250,250,247,0.12)', flexShrink: 0, alignSelf: 'center' }} />
)

const ROW = {
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  padding: '0 var(--pad)',
  height: 34,
  borderBottom: '0.5px solid rgba(250,250,247,0.06)',
  overflowX: 'auto',
  overflowY: 'hidden',
  WebkitOverflowScrolling: 'touch',
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
}

export default function PeriodBar() {
  const { anio, mes, setAnio, setMes, MESES, AÑOS } = usePeriodo()
  const isMobile = useIsMobile()

  const MESES_SHORT = ['E','F','M','A','M','J','J','A','S','O','N','D']
  const mesLabels = isMobile ? MESES_SHORT : MESES
  const anioLabels = isMobile
    ? AÑOS.map(a => `'${String(a).slice(2)}`)
    : AÑOS

  return (
    <div style={{
      position: 'fixed', top: 60, left: 0, right: 0, zIndex: 190,
      background: 'rgba(10,10,10,0.97)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
    }}>
      {/* ── Fila 1: Años ── */}
      <div style={{ ...ROW, borderBottom: '0.5px solid rgba(250,250,247,0.06)' }}>
        <span style={{
          fontSize: 'var(--fs-2xs)', color: C.paper, opacity: 0.28,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          flexShrink: 0, marginRight: 4,
        }}>Año</span>
        <Sep />
        {AÑOS.map((a, i) => (
          <Pill
            key={a}
            label={anioLabels[i]}
            active={anio === a}
            volt
            onClick={() => { setAnio(anio === a ? null : a); setMes(null) }}
          />
        ))}
        <Sep />
        <Pill
          label="Todo"
          active={!anio && !mes}
          onClick={() => { setAnio(null); setMes(null) }}
        />
      </div>

      {/* ── Fila 2: Meses ── */}
      <div style={{ ...ROW, borderBottom: 'none' }}>
        <span style={{
          fontSize: 'var(--fs-2xs)', color: C.paper, opacity: 0.28,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          flexShrink: 0, marginRight: 4,
        }}>Mes</span>
        <Sep />
        {MESES.map((m, i) => (
          <Pill
            key={m}
            label={mesLabels[i]}
            active={mes === i + 1}
            onClick={() => setMes(mes === i + 1 ? null : i + 1)}
          />
        ))}
      </div>
    </div>
  )
}
