import { useState } from 'react'
import ObservatoryBot from './ObservatoryBot'
import { C } from './Atoms'

const RobotIcon = ({ size = 20, color = '#FAFAF7' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="8" width="18" height="12" rx="2" />
    <path d="M9 12h.01M15 12h.01" strokeWidth="2" />
    <path d="M9 16h6" />
    <path d="M12 8V5" />
    <circle cx="12" cy="4" r="1" />
    <path d="M3 14h-1M22 14h-1" />
  </svg>
)

export default function BotToggle() {
  const [open, setOpen] = useState(false)
  return (
    <>
      {open && <ObservatoryBot onClose={() => setOpen(false)} />}
      <button
        onClick={() => setOpen(v => !v)}
        title="Asistente del Observatorio"
        style={{
          position: 'fixed',
          bottom: 28,
          right: 28,
          zIndex: 998,
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: open ? C.stone : C.ink,
          border: '1.5px solid ' + (open ? C.stone : C.volt),
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.25s ease',
          boxShadow: open ? 'none' : '0 4px 20px rgba(0,0,0,0.25)',
        }}>
        {open
          ? <span style={{ fontSize: 20, color: C.ink, lineHeight: 1, fontWeight: 300 }}>×</span>
          : <RobotIcon size={22} color={C.paper} />
        }
      </button>
    </>
  )
}
