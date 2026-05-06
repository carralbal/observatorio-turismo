import { useState, useRef, useEffect } from 'react'
import { C, Eyebrow } from './Atoms'

const BOT_URL = 'http://localhost:8765/chat'

const SUGERENCIAS = [
  '¿Cuántos viajeros tuvo Termas en 2025?',
  '¿Cómo está el empleo HyG en SDE?',
  '¿Qué es el índice de captura de valor?',
  '¿Qué dice la señal anticipada?',
  '¿Cómo se ubica SDE en el ranking nacional?',
]

export default function ObservatoryBot({ onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hola, soy el asistente del Observatorio de Turismo SDE. Puedo responder preguntas sobre los datos de la provincia. ¿En qué te ayudo?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text) => {
    const q = text || input.trim()
    if (!q || loading) return
    setInput('')
    const newMessages = [...messages, { role: 'user', content: q }]
    setMessages(newMessages)
    setLoading(true)
    try {
      const res = await fetch(BOT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer || 'Sin respuesta.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ El servidor del bot no responde. Inicialo con:\n\npython3 etl/bot_proxy.py' }])
    }
    setLoading(false)
  }

  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 999,
      width: 'clamp(360px, 90vw, 520px)',
      background: C.paper,
      border: '0.5px solid '+C.stone,
      borderTop: '2.5px solid '+C.volt,
      display: 'flex', flexDirection: 'column',
      maxHeight: '75vh',
      boxShadow: '0 12px 40px rgba(0,0,0,0.22)',
    }}>
      <div style={{ padding: '16px 20px', borderBottom: '0.5px solid '+C.stone, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.volt }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: C.ink, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Asistente · Observatorio SDE</span>
        </div>
        {onClose && <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.slate, fontSize: 20, lineHeight: 1, padding: 0 }}>×</button>}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '88%', padding: '11px 15px',
              background: m.role === 'user' ? C.ink : '#F2F2EE',
              border: m.role === 'user' ? 'none' : '0.5px solid '+C.stone,
              borderRadius: m.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
              fontSize: 13.5, fontWeight: 300, color: m.role === 'user' ? C.paper : C.ink,
              lineHeight: 1.6, fontFamily: 'Plus Jakarta Sans, sans-serif',
              whiteSpace: 'pre-wrap',
            }}>{m.content}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: 5, padding: '12px 15px', alignItems: 'center' }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: C.stone, animation: `bBot 1.2s ${i*0.2}s infinite` }} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length <= 1 && (
        <div style={{ padding: '0 20px 14px', display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {SUGERENCIAS.map((s, i) => (
            <button key={i} onClick={() => send(s)} style={{
              background: 'none', border: '0.5px solid '+C.stone, borderRadius: 20, padding: '6px 12px',
              fontSize: 11, color: C.slate, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
            }}>{s}</button>
          ))}
        </div>
      )}

      <div style={{ padding: '13px 20px', borderTop: '0.5px solid '+C.stone, display: 'flex', gap: 9 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Preguntá sobre los datos..."
          disabled={loading}
          style={{
            flex: 1, padding: '10px 14px', border: '0.5px solid '+C.stone,
            background: C.paper, color: C.ink, fontSize: 13.5,
            fontFamily: 'Plus Jakarta Sans, sans-serif', outline: 'none', borderRadius: 2,
          }}
        />
        <button onClick={() => send()} disabled={loading || !input.trim()} style={{
          padding: '10px 16px', background: C.ink, color: C.paper, border: 'none',
          cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
          opacity: loading || !input.trim() ? 0.4 : 1,
          fontSize: 14, fontFamily: 'Plus Jakarta Sans, sans-serif',
        }}>→</button>
      </div>
      <style>{`@keyframes bBot{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}`}</style>
    </div>
  )
}
