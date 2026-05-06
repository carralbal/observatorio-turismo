import { useState, useRef, useEffect } from 'react'
import { C, Eyebrow } from './Atoms'

const SYSTEM_PROMPT = `Sos el asistente del Observatorio de Turismo de Santiago del Estero (Argentina).
Respondés preguntas sobre los datos turísticos de la provincia usando los datos reales del warehouse.
Sos conciso, preciso y usás los datos provistos en el contexto.
Cuando cites números, especificá la fuente y el período.
Si no tenés el dato, decilo claramente y sugerí cómo obtenerlo.
No inventes datos. No respondas sobre temas que no sean turismo de SDE.
Respondés siempre en español.`

const SUGERENCIAS = [
  '¿Cuántos viajeros tuvo Termas en 2025?',
  '¿Cómo está el empleo hotelero en SDE vs NOA?',
  '¿Cuál es el índice de captura de valor?',
  '¿Qué dice la señal anticipada para los próximos meses?',
  '¿Cómo se compara SDE con otras provincias?',
]

export default function ObservatoryBot({ onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hola, soy el asistente del Observatorio de Turismo SDE. Puedo responder preguntas sobre los datos de la provincia. ¿En qué te ayudo?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [context, setContext] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    fetch('/data/observatory_context.json')
      .then(r => r.json())
      .then(setContext)
      .catch(() => setContext({}))
  }, [])

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
      const contextStr = context ? JSON.stringify(context, null, 1).slice(0, 12000) : ''
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: SYSTEM_PROMPT + '\n\nDATOS DEL OBSERVATORIO:\n' + contextStr,
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        })
      })
      const data = await response.json()
      const answer = data.content?.[0]?.text || 'No pude procesar la respuesta.'
      setMessages(prev => [...prev, { role: 'assistant', content: answer }])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error al conectar con el asistente. Verificá la conexión.' }])
    }
    setLoading(false)
  }

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 999,
      width: 'clamp(300px, 90vw, 420px)',
      background: C.paper,
      border: '0.5px solid '+C.stone,
      borderTop: '2px solid '+C.volt,
      display: 'flex', flexDirection: 'column',
      maxHeight: '70vh',
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
    }}>
      {/* Header */}
      <div style={{ padding: '14px 18px', borderBottom: '0.5px solid '+C.stone, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.volt, animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: C.ink, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Asistente · Observatorio SDE</span>
        </div>
        {onClose && <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.slate, fontSize: 18, lineHeight: 1, padding: 0 }}>×</button>}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '85%',
              padding: '10px 14px',
              background: m.role === 'user' ? C.ink : C.paper2 || '#F2F2EE',
              border: m.role === 'user' ? 'none' : '0.5px solid '+C.stone,
              borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
              fontSize: 13, fontWeight: 300, color: m.role === 'user' ? C.paper : C.ink,
              lineHeight: 1.55, fontFamily: 'Plus Jakarta Sans, sans-serif',
              whiteSpace: 'pre-wrap',
            }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: 4, padding: '10px 14px', alignItems: 'center' }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: C.stone, animation: `bounce 1.2s ${i*0.2}s infinite` }} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Sugerencias */}
      {messages.length <= 1 && (
        <div style={{ padding: '0 18px 12px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {SUGERENCIAS.map((s, i) => (
            <button key={i} onClick={() => send(s)} style={{
              background: 'none', border: '0.5px solid '+C.stone, borderRadius: 20, padding: '5px 10px',
              fontSize: 10.5, color: C.slate, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
              transition: 'border-color 0.15s', whiteSpace: 'nowrap',
            }}>{s}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '12px 18px', borderTop: '0.5px solid '+C.stone, display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Preguntá sobre los datos..."
          disabled={loading}
          style={{
            flex: 1, padding: '9px 12px', border: '0.5px solid '+C.stone,
            background: C.paper, color: C.ink, fontSize: 13, fontFamily: 'Plus Jakarta Sans, sans-serif',
            outline: 'none', borderRadius: 2,
          }}
        />
        <button onClick={() => send()} disabled={loading || !input.trim()} style={{
          padding: '9px 14px', background: C.ink, color: C.paper, border: 'none',
          cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
          opacity: loading || !input.trim() ? 0.4 : 1,
          fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', fontFamily: 'Plus Jakarta Sans, sans-serif',
          transition: 'opacity 0.15s',
        }}>→</button>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
      `}</style>
    </div>
  )
}
