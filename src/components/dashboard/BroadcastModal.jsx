import { useState } from 'react'
import { Send, Users, X, Info } from 'lucide-react'

export default function BroadcastModal({ isOpen, onClose, onSend, allEmployees }) {
  const [group, setGroup] = useState('all')
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  if (!isOpen) return null

  const departments = [...new Set(allEmployees.map(e => e.department || e.dept || 'Other'))]
  
  const getRecipientCount = () => {
    if (group === 'all') return allEmployees.length
    if (group === 'pending_attendance') return '?' // Calculated on backend
    if (group.startsWith('dept:')) {
      const d = group.split(':')[1]
      return allEmployees.filter(e => String(e.department || e.dept).toLowerCase() === d.toLowerCase()).length
    }
    return 0
  }

  const handleSend = async () => {
    if (!message.trim()) return
    setIsSending(true)
    const success = await onSend({ group, message })
    setIsSending(false)
    if (success) {
      setMessage('')
      onClose()
    }
  }

  return (
    <div className="modal-overlay animate-in" style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 2000, 
      background: 'rgba(0,0,0,0.4)', 
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }}>
      <div className="modal-content" style={{ 
        maxWidth: 440, 
        width: '100%',
        maxHeight: 'min(700px, 90vh)',
        display: 'flex',
        flexDirection: 'column',
        padding: 0, 
        overflow: 'hidden',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        borderRadius: 28,
        boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.4)'
      }}>
        <div style={{ padding: '20px 28px', background: 'rgba(255,255,255,0.3)', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#111', letterSpacing: -0.5 }}>Broadcast Hub</h2>
            <p style={{ margin: 0, fontSize: 11, color: 'var(--muted)', fontWeight: 700, opacity: 0.8 }}>Telegram Global Messaging</p>
          </div>
          <button className="btn-icon" onClick={onClose} style={{ background: 'rgba(0,0,0,0.05)', width: 32, height: 32 }}><X size={16} /></button>
        </div>

        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }} className="custom-scrollbar">
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 900, marginBottom: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Target Audience</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button 
                onClick={() => setGroup('all')}
                style={{ 
                  padding: '14px 16px', 
                  textAlign: 'left', 
                  borderRadius: 14,
                  cursor: 'pointer',
                  background: group === 'all' ? 'var(--accent)' : 'rgba(0,0,0,0.03)',
                  border: '1px solid ' + (group === 'all' ? 'var(--accent)' : 'rgba(0,0,0,0.05)'),
                  color: group === 'all' ? '#fff' : 'inherit',
                  transition: 'all 0.2s'
                }}
              >
                <Users size={16} color={group === 'all' ? '#fff' : 'var(--accent)'} style={{ marginBottom: 6 }} />
                <div style={{ fontSize: 13, fontWeight: 800 }}>Global</div>
                <div style={{ fontSize: 10, opacity: 0.7 }}>All Staff</div>
              </button>
              <button 
                onClick={() => setGroup('pending_attendance')}
                style={{ 
                  padding: '14px 16px', 
                  textAlign: 'left', 
                  borderRadius: 14,
                  cursor: 'pointer',
                  background: group === 'pending_attendance' ? 'var(--amber)' : 'rgba(0,0,0,0.03)',
                  border: '1px solid ' + (group === 'pending_attendance' ? 'var(--amber)' : 'rgba(0,0,0,0.05)'),
                  color: group === 'pending_attendance' ? '#fff' : 'inherit',
                  transition: 'all 0.2s'
                }}
              >
                <Info size={16} color={group === 'pending_attendance' ? '#fff' : 'var(--amber)'} style={{ marginBottom: 6 }} />
                <div style={{ fontSize: 13, fontWeight: 800 }}>Pending</div>
                <div style={{ fontSize: 10, opacity: 0.7 }}>Attendance</div>
              </button>
            </div>
            
            <select 
              className="input" 
              style={{ 
                marginTop: 12, 
                width: '100%', 
                height: 42, 
                borderRadius: 12, 
                border: '1px solid rgba(0,0,0,0.08)',
                background: 'rgba(255,255,255,0.4)',
                fontWeight: 700,
                fontSize: 12,
                padding: '0 12px'
              }}
              value={group.startsWith('dept:') ? group : ''}
              onChange={(e) => setGroup(e.target.value)}
            >
              <option value="">By Department...</option>
              {departments.map(d => (
                <option key={d} value={`dept:${d}`}>{d} Teaam</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 900, marginBottom: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Message Composer</label>
            <textarea 
              className="input"
              rows={5}
              placeholder="Type your alert here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ 
                width: '100%', 
                resize: 'none', 
                padding: 14, 
                borderRadius: 14, 
                border: '1px solid rgba(0,0,0,0.08)',
                background: 'rgba(255,255,255,0.4)',
                fontSize: 13,
                lineHeight: 1.5,
                minHeight: 120
              }}
            />
            <div style={{ marginTop: 10, fontSize: 10, color: 'var(--muted)', fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={10} /> Recipient Count: ~{getRecipientCount()}</span>
              <span>Rich Text Ready</span>
            </div>
          </div>
        </div>

        <div style={{ padding: '20px 28px', background: 'rgba(255,255,255,0.3)', borderTop: '1px solid rgba(0,0,0,0.05)', flexShrink: 0 }}>
          <button 
            className="btn btn-primary" 
            style={{ 
              width: '100%', 
              height: 48, 
              borderRadius: 12,
              gap: 8, 
              boxShadow: '0 8px 16px -4px var(--accent-glow)',
              fontSize: 14,
              fontWeight: 900
            }}
            disabled={isSending || !message.trim()}
            onClick={handleSend}
          >
            {isSending ? 'SENDING...' : <><Send size={16} /> BROADCAST NOW</>}
          </button>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
      `}</style>
    </div>
  )
}
