import { useState } from 'react'
import ObservatoryBot from './ObservatoryBot'
import { C } from './Atoms'

const RobotIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="8" width="18" height="12" rx="2" />
    <path d="M9 12h.01M15 12h.01" strokeWidth="2.5" />
    <path d="M9 16h6" />
    <path d="M12 8V5" />
    <circle cx="12" cy="4" r="1.2" fill="#0A0A0A" stroke="none" />
    <path d="M2 14h1M21 14h1" />
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
          position: 'fixed', bottom: 28, right: 28, zIndex: 998,
          width: 62, height: 62, borderRadius: '50%',
          background: open ? C.stone : C.volt,
          border: 'none',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.25s ease',
          boxShadow: open ? 'none' : '0 4px 24px rgba(255,255,0,0.35)',
        }}>
        {open
          ? <span style={{ fontSize: 24, color: C.ink, lineHeight: 1 }}>×</span>
          : <RobotIcon />
        }
      </button>
    </>
  )
}
