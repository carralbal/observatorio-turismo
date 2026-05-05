import { usePeriodo } from '../context/PeriodoContext'
import { C, Eyebrow } from './Atoms'

const Pill = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{
    background: 'none', border: 'none', cursor: 'pointer',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontSize: 10.5, fontWeight: active ? 700 : 500,
    color: active ? C.volt : C.paper,
    opacity: active ? 1 : 0.38,
    letterSpacing: '0.1em', textTransform: 'uppercase',
    padding: '4px 6px',
    borderBottom: active ? `1px solid ${C.volt}` : '1px solid transparent',
    transition: 'all 0.15s ease',
    lineHeight: 1.4,
  }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.opacity = 0.7 }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.opacity = 0.38 }}
  >
    {label}
  </button>
)

export default function PeriodBar() {
  const { anio, mes, setAnio, setMes, MESES, AÑOS } = usePeriodo()

  return (
    <div style={{
      position: 'fixed', top: 60, left: 0, right: 0, zIndex: 190,
      background: 'rgba(10,10,10,0.97)',
      borderBottom: `0.5px solid rgba(250,250,247,0.08)`,
      padding: '0 var(--pad)',
      display: 'flex', alignItems: 'center', gap: 24,
      height: 38,
      backdropFilter: 'blur(12px)',
    }}>
      {/* Label */}
      <Eyebrow light style={{ opacity: 0.35, flexShrink: 0, fontSize: 9.5 }}>Período</Eyebrow>

      {/* Separador */}
      <div style={{ width: 1, height: 14, background: 'rgba(250,250,247,0.12)', flexShrink: 0 }} />

      {/* Años */}
      <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        {AÑOS.map(a => (
          <Pill key={a} label={a} active={anio === a}
            onClick={() => setAnio(anio === a ? null : a)} />
        ))}
      </div>

      {/* Separador */}
      <div style={{ width: 1, height: 14, background: 'rgba(250,250,247,0.12)', flexShrink: 0 }} />

      {/* Meses */}
      <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        {MESES.map((m, i) => (
          <Pill key={m} label={m} active={mes === i + 1}
            onClick={() => setMes(mes === i + 1 ? null : i + 1)} />
        ))}
      </div>

      {/* Reset + hint */}
      <div style={{ marginLeft: 'auto', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 14 }}>
        {(anio || mes) && (
          <span style={{
            fontSize: 9.5, fontWeight: 400, color: C.stone,
            opacity: 0.55, letterSpacing: '0.08em',
          }}>
            {anio && mes ? 'Mes específico' : anio ? 'Todos los meses del año' : 'Todos los años del mes'}
          </span>
        )}
        {!anio && !mes && (
          <span style={{
            fontSize: 9.5, fontWeight: 400, color: C.stone,
            opacity: 0.45, letterSpacing: '0.08em',
          }}>
            KPIs: último dato disponible · Gráficos: serie completa
          </span>
        )}
        <Pill label="Todo" active={!anio && !mes}
          onClick={() => { setAnio(null); setMes(null) }} />
      </div>
    </div>
  )
}
