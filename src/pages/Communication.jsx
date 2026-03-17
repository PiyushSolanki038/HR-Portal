import { useState, useRef, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import * as api from '../services/api'
import { 
  Send, Search, Users, Phone, Video, MoreVertical, 
  Pin, Paperclip, Smile, Radio, MessageSquare, 
  Circle, ChevronRight, Hash, Shield, GraduationCap
} from 'lucide-react'

const theme = {
  bg: 'var(--bg)',
  accent: 'var(--accent)',
  accentGlow: 'var(--accent-glow)',
  panelBg: 'var(--bg-card)',
  cardBg: 'var(--bg-elevated)',
  border: 'var(--border)',
  glass: 'blur(20px)',
  text: 'var(--text)',
  muted: 'var(--muted)',
  green: 'var(--green)',
  amber: 'var(--amber)',
  red: 'var(--red)',
  blue: 'var(--blue)',
  fontHeading: 'var(--font-heading)',
  fontBody: 'var(--font)'
}

const styles = {
  wrapper: {
    height: 'calc(100vh - 180px)', 
    display: 'flex',
    background: theme.panelBg,
    borderRadius: '24px',
    border: theme.border,
    overflow: 'hidden',
    boxShadow: 'var(--shadow-lg)',
    animation: 'fadeIn 0.5s ease-out',
    maxWidth: '100%'
  },
  sidebar: {
    width: '320px',
    borderRight: theme.border,
    display: 'flex',
    flexDirection: 'column',
    background: 'rgba(0,0,0,0.02)',
  },
  chatArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    background: 'rgba(255,255,255,0.01)',
    position: 'relative'
  },
  searchWrapper: {
    padding: '24px 20px 16px',
    borderBottom: theme.border
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'var(--bg-elevated)',
    padding: '12px 16px',
    borderRadius: '16px',
    border: '1px solid var(--line)',
    transition: 'all 0.3s ease'
  },
  searchInput: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text)',
    outline: 'none',
    width: '100%',
    fontSize: '14px',
    fontWeight: 500
  },
  contactList: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px'
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    marginBottom: '4px',
    position: 'relative'
  },
  avatar: {
    width: '44px',
    height: '44px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  statusIndicator: {
    position: 'absolute',
    bottom: '-2px',
    right: '-2px',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    border: '2px solid white',
    background: theme.green
  },
  messageArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px 32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  bubble: {
    maxWidth: '85%',
    padding: '12px 16px',
    borderRadius: '20px',
    fontSize: '13px',
    lineHeight: 1.6,
    position: 'relative',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  inputSurface: {
    padding: '20px 32px 32px',
    background: 'transparent'
  },
  inputBar: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '12px',
    background: 'var(--bg-card)',
    padding: '12px 16px',
    borderRadius: '24px',
    border: '1px solid var(--line)',
    boxShadow: 'var(--shadow-md)',
    transition: 'transform 0.3s ease'
  },
  sendBtn: {
    width: '44px',
    height: '44px',
    borderRadius: '14px',
    background: theme.accent,
    color: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    flexShrink: 0,
    boxShadow: `0 4px 15px ${theme.accentGlow}`
  }
}

export default function Communication() {
  const { user } = useAuth()
  const { employees, mentors, loading, error } = useData()
  const { showToast } = useToast()
  const location = useLocation()
  const navigate = useNavigate()

  const [activeChat, setActiveChat] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [chatMode, setChatMode] = useState('direct')
  const [histories, setHistories] = useState({})

  const messagesEndRef = useRef(null)

  const isHR = user?.role?.toLowerCase() === 'hr manager' || user?.role?.toLowerCase() === 'admin'

  const allContacts = useMemo(() => {
    if (loading) return []
    const emps = employees.filter(e => e.name).map(e => ({ ...e, type: 'employee' }))
    const mnts = isHR ? mentors.filter(m => m.name).map(m => ({
      ...m,
      type: 'mentor',
      role: 'External Mentor',
      av: m.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'M',
      dept: m.expertise || 'External Mentor',
      isMentor: true,
      color: m.color || 'linear-gradient(135deg, #f59e0b, #d97706)'
    })) : []
    return [...emps, ...mnts]
  }, [employees, mentors, isHR, loading])

  // Handle URL deep linking
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const targetId = params.get('id')
    if (targetId && allContacts.length > 0) {
      const contact = allContacts.find(c => c.id === targetId)
      if (contact) {
        setActiveChat(contact)
        setChatMode('direct')
      }
    }
  }, [location.search, allContacts])

  // Fetch history for active chat
  const fetchHistory = async () => {
    if (!activeChat || chatMode !== 'direct') return
    try {
      const history = await api.getPortalHistory(user.id, activeChat.id)
      setHistories(prev => ({
        ...prev,
        [activeChat.id]: (history || []).map(m => ({
          id: m.id,
          text: m.message,
          sender: m.fromId === user.id ? 'me' : 'them',
          time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }))
      }))
    } catch (err) {
      console.error('History fetch failed:', err)
    }
  }

  // Initial fetch on chat change
  useEffect(() => {
    if (activeChat && chatMode === 'direct') {
      fetchHistory()
    }
  }, [activeChat, chatMode])

  // Polling for new messages
  useEffect(() => {
    let interval
    if (activeChat && chatMode === 'direct') {
      interval = setInterval(fetchHistory, 5000)
    }
    return () => clearInterval(interval)
  }, [activeChat, chatMode])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [histories, activeChat])

  if (loading) return <LoadingSpinner />
  if (error) return <div style={{ padding: '24px' }}>Error: {error}</div>

  const dynamicAccent = user?.role?.toLowerCase() === 'employee' ? '#10b981' : '#4f6ef7'
  const accentGlow = user?.role?.toLowerCase() === 'employee' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(79, 110, 247, 0.15)'

  const filteredContacts = allContacts.filter(e =>
    e.id !== user.id &&
    (
      (e.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.dept || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  const handleSend = async () => {
    if (!message.trim() || sending) return
    setSending(true)

    try {
      if (chatMode === 'direct' && activeChat) {
        await api.sendPortalMessage({ 
          fromId: user.id,
          toId: activeChat.id, 
          message, 
          channel: 'portal'
        })
        
        // Optimistic update
        const newMsg = { 
          id: Date.now(), 
          text: message, 
          sender: 'me', 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }
        setHistories(prev => ({
          ...prev,
          [activeChat.id]: [...(prev[activeChat.id] || []), newMsg]
        }))
      } else if (chatMode === 'broadcast') {
        const recipients = activeChat === 'all' ? 'all' : activeChat
        await api.sendBroadcast({ 
          message, 
          recipients, 
          channels: ['telegram'], // Broadcasts can stay on telegram or move later
          actor: user?.name || 'Administrator' 
        })
        showToast(`Broadcast sent to ${recipients}`, 'success')
      }
      setMessage('')
    } catch (err) {
      showToast('Delivery failed. Could not reach portal gateway.', 'error')
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const depts = [...new Set(employees.map(e => e.dept).filter(Boolean))]

  return (
    <div style={styles.wrapper}>
      
      {/* ─── SIDEBAR ─── */}
      <div style={styles.sidebar}>
        <div style={{ padding: '24px 20px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: theme.fontHeading, fontSize: '24px', fontWeight: 800 }}>Hub</h2>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '12px' }}>
              <button 
                onClick={() => setChatMode('direct')}
                style={{ ...styles.iconBtn, background: chatMode === 'direct' ? dynamicAccent : 'transparent', color: chatMode === 'direct' ? '#fff' : theme.muted, borderRadius: '8px', padding: '6px 10px' }}
              >
                <MessageSquare size={16} />
              </button>
              {user?.role?.toLowerCase() !== 'employee' && (
                <button 
                  onClick={() => { setChatMode('broadcast'); setActiveChat('all'); }}
                  style={{ ...styles.iconBtn, background: chatMode === 'broadcast' ? dynamicAccent : 'transparent', color: chatMode === 'broadcast' ? '#fff' : theme.muted, borderRadius: '8px', padding: '6px 10px' }}
                >
                  <Radio size={16} />
                </button>
              )}
            </div>
          </div>

          <div style={styles.searchBox}>
            <Search size={18} color={theme.muted} />
            <input 
              style={styles.searchInput} 
              placeholder="Find anyone..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
            />
          </div>
        </div>

        <div style={styles.contactList}>
          {chatMode === 'direct' ? (
            <>
              <div style={{ padding: '16px 8px 8px', fontSize: '11px', fontWeight: 700, color: theme.muted, textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Pin size={12} /> Pinned
              </div>
              {filteredContacts.slice(0, 3).map(emp => (
                <div 
                  key={emp.id} 
                  style={{ 
                    ...styles.contactItem, 
                    background: activeChat?.id === emp.id ? 'rgba(255,255,255,0.06)' : 'transparent',
                    boxShadow: activeChat?.id === emp.id ? 'inset 0 0 0 1px rgba(255,255,255,0.05)' : 'none'
                  }}
                  onClick={() => setActiveChat(emp)}
                >
                  <div style={{ ...styles.avatar, background: emp.color || `linear-gradient(135deg, ${dynamicAccent}, #1e3a8a)`, position: 'relative' }}>
                    {emp.av}
                    <div style={styles.statusIndicator} />
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600 }}>{emp.name}</span>
                      <span style={{ fontSize: '11px', color: theme.muted }}>10:45</span>
                    </div>
                    <div style={{ fontSize: '12px', color: theme.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {emp.dept} • {emp.id}
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ padding: '24px 8px 8px', fontSize: '11px', fontWeight: 700, color: theme.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Team Members
              </div>
              {filteredContacts.slice(3).map(emp => (
                <div 
                  key={emp.id} 
                  style={{ 
                    ...styles.contactItem, 
                    background: activeChat?.id === emp.id ? 'rgba(255,255,255,0.06)' : 'transparent'
                  }}
                  onClick={() => setActiveChat(emp)}
                >
                  <div style={{ ...styles.avatar, background: emp.color || 'var(--accent)', boxShadow: `0 4px 12px ${emp.color || 'var(--accent)'}40` }}>
                    {emp.av}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{emp.name}</div>
                    <div style={{ fontSize: '12px', color: theme.muted }}>{emp.role}</div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div style={{ padding: '12px' }}>
               <div 
                style={{ ...styles.contactItem, borderRadius: '20px', border: activeChat === 'all' ? `1px solid ${dynamicAccent}` : theme.border, background: activeChat === 'all' ? accentGlow : 'rgba(255,255,255,0.02)', padding: '20px' }}
                onClick={() => setActiveChat('all')}
               >
                 <div style={{ ...styles.avatar, background: dynamicAccent }}><Users size={20} /></div>
                 <div>
                    <div style={{ fontWeight: 700, fontSize: '15px' }}>Whole Company</div>
                    <div style={{ fontSize: '12px', color: theme.muted }}>{employees.length} team members</div>
                 </div>
               </div>
               <div style={{ padding: '24px 8px 12px', fontSize: '11px', fontWeight: 700, color: theme.muted, textTransform: 'uppercase' }}>Departments</div>
               {depts.map(d => (
                 <div 
                    key={d} 
                    style={{ ...styles.contactItem, borderRadius: '20px', border: activeChat === d ? `1px solid ${dynamicAccent}` : theme.border, background: activeChat === d ? accentGlow : 'rgba(255,255,255,0.02)', padding: '16px', marginBottom: '8px' }}
                    onClick={() => setActiveChat(d)}
                 >
                    <div style={{ ...styles.avatar, background: 'rgba(255,255,255,0.1)' }}><Hash size={18} /></div>
                    <div style={{ fontWeight: 600 }}>{d}</div>
                 </div>
               ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── CHAT AREA ─── */}
      <div style={styles.chatArea}>
        {activeChat ? (
          <>
            {/* Header */}
            <div style={{ padding: '24px 32px', borderBottom: theme.border, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {chatMode === 'direct' ? (
                  <>
                    <div style={{ ...styles.avatar, background: activeChat.color || dynamicAccent, width: '48px', height: '48px' }}>
                      {activeChat.av}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>{activeChat.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: theme.green, fontWeight: 500 }}>
                        <Circle size={8} fill={theme.green} /> Secured Proxy Gateway
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ ...styles.avatar, background: `linear-gradient(45deg, ${dynamicAccent}, ${theme.blue})`, width: '48px', height: '48px' }}>
                      <Radio size={24} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Broadcast Intelligence</h3>
                      <div style={{ fontSize: '13px', color: theme.muted }}>Targeting: {activeChat === 'all' ? 'Entire Organization' : `${activeChat} Team`}</div>
                    </div>
                  </>
                )}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button style={{ ...styles.iconBtn, width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', border: 'none' }}><Phone size={18} /></button>
                <button style={{ ...styles.iconBtn, width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', border: 'none' }}><Video size={18} /></button>
                <button style={{ ...styles.iconBtn, width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', border: 'none' }}><MoreVertical size={18} /></button>
              </div>
            </div>

            {/* Messages */}
            <div style={styles.messageArea}>
              {chatMode === 'direct' ? (
                <>
                   <div style={{ textAlign: 'center', margin: '10px 0 20px' }}>
                     <span style={{ background: 'rgba(255,255,255,0.04)', padding: '6px 14px', borderRadius: '12px', fontSize: '11px', color: theme.muted, fontWeight: 600, border: theme.border }}>ENCRYPTED SESSION STARTED</span>
                   </div>
                   { (histories[activeChat.id] || []).map(msg => {
                     const isMe = msg.sender === 'me'
                     return (
                       <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                          <div style={{ ...styles.bubble, background: isMe ? dynamicAccent : 'var(--bg-elevated)', color: isMe ? '#000' : 'var(--text)', borderBottomRightRadius: isMe ? '4px' : '20px', borderBottomLeftRadius: !isMe ? '4px' : '20px', border: isMe ? 'none' : '1px solid var(--line)' }}>
                            {msg.text}
                          </div>
                          <div style={{ fontSize: '10px', color: theme.muted, marginTop: '4px', fontWeight: 600 }}>{msg.time} {isMe && '• DELIVERED'}</div>
                       </div>
                     )
                   })}
                </>
              ) : (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: theme.muted }}>
                   <div style={{ width: '100px', height: '100px', borderRadius: '30px', background: accentGlow, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                      <Radio size={48} color={dynamicAccent} />
                   </div>
                   <h2 style={{ fontFamily: theme.fontHeading, color: 'var(--text)', fontSize: '28px', marginBottom: '12px' }}>Broadcast Center</h2>
                   <p style={{ maxWidth: '400px', lineHeight: 1.6 }}>Your announcement will be sent to the <b>{activeChat}</b> department and pinned to their portal dashboards.</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={styles.inputSurface}>
              <div style={styles.inputBar}>
                <button style={{ background: 'transparent', border: 'none', color: theme.muted, cursor: 'pointer' }}><Smile size={22} /></button>
                <button style={{ background: 'transparent', border: 'none', color: theme.muted, cursor: 'pointer' }}><Paperclip size={22} /></button>
                <textarea 
                  rows={1}
                  style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text)', outline: 'none', fontSize: '15px', padding: '10px 0', resize: 'none' }}
                  placeholder={chatMode === 'direct' ? `Message ${activeChat.name}...` : "Type broadcast announcement..."}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button 
                  style={{ ...styles.sendBtn, opacity: message.trim() ? 1 : 0.5, background: dynamicAccent }} 
                  onClick={handleSend}
                >
                  {sending ? <LoadingSpinner size={20} /> : <Send size={20} />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px' }}>
            <div style={{ width: '120px', height: '120px', borderRadius: '40px', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px', border: theme.border }}>
               <Shield size={64} style={{ opacity: 0.1 }} />
            </div>
            <h2 style={{ fontFamily: theme.fontHeading, fontSize: '32px', marginBottom: '12px' }}>SISWIT Secure Hub</h2>
            <p style={{ color: theme.muted, maxWidth: '360px', lineHeight: 1.6 }}>Select a contact or start a broadcast to begin. Your communications are audited and secured by corporate policy.</p>
            <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
               <div style={{ padding: '12px 20px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: theme.border, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Shield size={16} color={theme.green} /> <span style={{ fontSize: '13px', fontWeight: 600 }}>E2E Encrypted</span>
               </div>
               <div style={{ padding: '12px 20px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: theme.border, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Circle size={10} fill={theme.green} /> <span style={{ fontSize: '13px', fontWeight: 600 }}>Sync Stable</span>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
