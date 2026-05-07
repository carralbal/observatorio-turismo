import { useState, useEffect } from 'react'
import { usePeriodo } from '../context/PeriodoContext'
import { C, Eyebrow } from './Atoms'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640)
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', h, { passive: true })
    return () => window.removeEventListener('resize', h)
  }, [])
  return isMobile
}

const Pill = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{
    background: 'none', border: 'none', cursor: 'pointer',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontSize: 'var(--fs-xs)', fontWeight: active ? 700 : 500,
    color: active ? C.volt : C.paper,
    opacity: active ? 1 : 0.38,
    letterSpacing: '0.1em', textTransform: 'uppercase',
    padding: '6px 8px',
    borderBottom: active ? `1px solid ${C.volt}` : '1px solid transparent',
    transition: 'all 0.15s ease',
    lineHeight: 1.4,
    flexShrink: 0,
    WebkitTapHighlightColor: 'transparent',
  }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.opacity = 0.7 }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.opacity = 0.38 }}
  >
    {label}
  </button>
)

const Sep = () => (
  <div style={{ width: 1, height: 14, background: 'rgba(250,250,247,0.12)', flexShrink: 0 }} />
)

export default function PeriodBar() {
  const { anio, mes, setAnio, setMes, MESES, AÑOS } = usePeriodo()
  const isMobile = useIsMobile()

  return (
    <div style={{
      position: 'fixed', top: 60, left: 0, right: 0, zIndex: 190,
      background: 'rgba(10,10,10,0.97)',
      borderBottom: `0.5px solid rgba(250,250,247,0.08)`,
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
    }}>
      <div className="period-bar-scroll" style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        height: 38,
        padding: '0 var(--pad)',
      }}>

        {!isMobile && (
          <>
            <Eyebrow light style={{ opacity: 0.35, flexShrink: 0, fontSize: 'var(--fs-2xs)' }}>
              Período
            </Eyebrow>
            <Sep />
          </>
        )}

        {/* Años */}
        <div style={{ display: 'flex', gap: 0, alignItems: 'center', flexShrink: 0 }}>
          {AÑOS.map(a => (
            <Pill key={a} label={a} active={anio === a}
              onClick={() => setAnio(anio === a ? null : a)} />
          ))}
        </div>

        <Sep />

        {/* Meses */}
        <div style={{ display: 'flex', gap: 0, alignItems: 'center', flexShrink: 0 }}>
          {MESES.map((m, i) => (
            <Pill key={m} label={m} active={mes === i + 1}
              onClick={() => setMes(mes === i + 1 ? null : i + 1)} />
          ))}
        </div>

        <Sep />

        {/* TODO + hint */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          {!isMobile && (anio || mes) && (
            <span style={{
              fontSize: 'var(--fs-2xs)', fontWeight: 400, color: C.stone,
              opacity: 0.55, letterSpacing: '0.08em', whiteSpace: 'nowrap',
            }}>
              {anio && mes ? 'Mes específico' : anio ? 'Todos los meses del año' : 'Todos los años del mes'}
            </span>
          )}
          {!isMobile && !anio && !mes && (
            <span style={{
              fontSize: 'var(--fs-2xs)', fontWeight: 400, color: C.stone,
              opacity: 0.45, letterSpacing: '0.08em', whiteSpace: 'nowrap',
            }}>
              KPIs: último dato disponible · Gráficos: serie completa
            </span>
          )}
          <Pill label="TODO" active={!anio && !mes}
            onClick={() => { setAnio(null); setMes(null) }} />
        </div>

      </div>
    </div>
  )
}
