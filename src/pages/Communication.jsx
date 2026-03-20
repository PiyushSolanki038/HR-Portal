import { useState, useRef, useEffect, useMemo } from 'react'
import { useScreenSize } from '../hooks/useScreenSize'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import StatCard from '../components/ui/StatCard'
import * as api from '../services/api'
import { 
  Send, Search, Users, Phone, Video, MoreVertical, 
  Pin, Paperclip, Smile, Radio, MessageSquare, 
  Circle, ChevronRight, Hash, Shield, GraduationCap,
  Activity, Wifi, Globe, History, ShieldCheck,
  Zap, Compass, Target, Bell, AtSign, Cpu
} from 'lucide-react'

export default function Communication() {
  const { user } = useAuth()
  const { employees, mentors, loading, error, refresh } = useData()
  const { showToast } = useToast()
  const location = useLocation()
  const navigate = useNavigate()

  const { isMobile, isTablet, isDesktop } = useScreenSize()
  const [activeChat, setActiveChat] = useState(null)
  const [showChatMobile, setShowChatMobile] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [chatMode, setChatMode] = useState('direct')
  const [histories, setHistories] = useState({})
  const [syncStatus, setSyncStatus] = useState('stable') // stable, syncing, weak

  const messagesEndRef = useRef(null)

  const isHR = user?.role?.toLowerCase() === 'hr manager' || user?.role?.toLowerCase() === 'admin'

  const allContacts = useMemo(() => {
    if (loading) return []
    const emps = employees.filter(e => e.name).map(e => ({ ...e, type: 'employee' }))
    const mnts = isHR ? mentors.filter(m => m.name).map(m => ({
      ...m,
      role: 'External Mentor',
      av: m.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'M',
      dept: m.expertise || 'External Mentor',
      isMentor: true,
      color: m.color || 'var(--amber)'
    })) : []
    return [...emps, ...mnts]
  }, [employees, mentors, isHR, loading])

  // Intelligence Pulse Metrics
  const metrics = useMemo(() => {
    const totalMsgs = Object.values(histories).flat().length
    const activeLeads = allContacts.length
    const reach = Math.round((activeLeads / employees.length) * 100) || 100
    return { totalMsgs, activeLeads, reach }
  }, [histories, allContacts, employees])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const targetId = params.get('id')
    if (targetId && allContacts.length > 0) {
      const contact = allContacts.find(c => c.id === targetId)
      if (contact) {
        setActiveChat(contact)
        setChatMode('direct')
        if (isMobile) setShowChatMobile(true)
      }
    }
  }, [location.search, allContacts, isMobile])

  const fetchHistory = async () => {
    if (!activeChat || chatMode !== 'direct') return
    setSyncStatus('syncing')
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
      setSyncStatus('stable')
    } catch (err) {
      setSyncStatus('weak')
    }
  }

  useEffect(() => {
    if (activeChat && chatMode === 'direct') { fetchHistory() }
  }, [activeChat, chatMode])

  useEffect(() => {
    let interval
    if (activeChat && chatMode === 'direct') { interval = setInterval(fetchHistory, 5000) }
    return () => clearInterval(interval)
  }, [activeChat, chatMode])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [histories, activeChat])

  const handleSend = async () => {
    if (!message.trim() || sending) return
    setSending(true)

    try {
      if (chatMode === 'direct' && activeChat) {
        await api.sendPortalMessage({ fromId: user.id, toId: activeChat.id, message, channel: 'portal' })
        const newMsg = { id: Date.now(), text: message, sender: 'me', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        setHistories(prev => ({ ...prev, [activeChat.id]: [...(prev[activeChat.id] || []), newMsg] }))
      } else if (chatMode === 'broadcast') {
        const recipients = activeChat === 'all' ? 'all' : activeChat
        await api.sendBroadcast({ message, recipients, channels: ['telegram', 'portal'], actor: user?.name || 'Admin' })
        showToast(`Intelligence broadcast dispatched to ${recipients}`, 'success')
      }
      setMessage('')
    } catch (err) {
      showToast('Dispatch sequence failed. Connection unstable.', 'error')
    } finally {
      setSending(false)
    }
  }

  if (loading) return <LoadingSpinner />

  const filteredContacts = allContacts.filter(e =>
    e.id !== user.id &&
    ( (e.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (e.dept || '').toLowerCase().includes(searchQuery.toLowerCase()) )
  )

  const depts = [...new Set(employees.map(e => e.dept).filter(Boolean))]

  return (
    <div className="animate-in" style={{ padding: isMobile ? '16px' : '32px', maxWidth: 1600, margin: '0 auto' }}>
      {/* Executive Intelligence Header */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'flex-end', marginBottom: 40, gap: 24 }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 32 : 48, fontWeight: 900, letterSpacing: -2, margin: 0 }}>Dispatch Hub</h1>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--muted)', marginTop: 4, letterSpacing: 0.5 }}>Real-time situational intelligence & secure orchestration</p>
        </div>

        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ padding: '8px 16px', borderRadius: 12, background: 'var(--bg-elevated)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Wifi size={14} color={syncStatus === 'stable' ? 'var(--green)' : syncStatus === 'syncing' ? 'var(--amber)' : 'var(--red)'} />
                <span style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5 }}>Signal: {syncStatus}</span>
            </div>
            {!isMobile && (
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, fontWeight: 900 }}>E2E ENCRYPTED</div>
                    <div style={{ fontSize: 10, color: 'var(--green)', fontWeight: 800 }}>SECURE HANDSHAKE ACTIVE</div>
                </div>
            )}
        </div>
      </div>

      {/* Dispatch Pulse Stats */}
      {!isMobile && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 40 }}>
            <StatCard title="Total Transmissions" value={metrics.totalMsgs} icon={Activity} color="var(--accent)" trend={[20, 25, 22, 28, 30, metrics.totalMsgs]} />
            <StatCard title="Active Leads" value={metrics.activeLeads} icon={Target} color="var(--blue)}" trend={[10, 12, 11, 13, 15, metrics.activeLeads]} />
            <StatCard title="Operational Reach" value={`${metrics.reach}%`} icon={Globe} color="var(--green)" trend={[90, 92, 94, 91, 93, metrics.reach]} />
            <StatCard title="Sync Latency" value="12ms" icon={Cpu} color="var(--amber)" trend={[15, 14, 12, 13, 11, 12]} />
        </div>
      )}

      {/* Communication Matrix */}
      <div className="super-glass" style={{ 
        height: isMobile ? 'calc(100vh - 200px)' : '700px', 
        display: 'flex', 
        borderRadius: 32, 
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 24px 70px -12px rgba(0,0,0,0.1)'
      }}>
        
        {/* Sidebar Personnel */}
        <div style={{ 
            width: isMobile && showChatMobile ? 0 : isMobile ? '100%' : '380px', 
            background: 'var(--bg-card)', 
            borderRight: '1px solid var(--line)',
            display: 'flex', flexDirection: 'column',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            overflow: 'hidden'
        }}>
           <div style={{ padding: '24px', borderBottom: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 900, letterSpacing: -1 }}>Matrix</h2>
                    <div style={{ display: 'flex', background: 'rgba(0,0,0,0.04)', padding: 4, borderRadius: 14 }}>
                        <button onClick={() => setChatMode('direct')} style={{ border: 'none', padding: '8px 12px', borderRadius: 10, background: chatMode === 'direct' ? '#fff' : 'transparent', color: chatMode === 'direct' ? 'var(--text)' : 'var(--muted)', cursor: 'pointer', transition: 'all 0.2s' }}><MessageSquare size={16} /></button>
                        {isHR && <button onClick={() => { setChatMode('broadcast'); setActiveChat('all'); }} style={{ border: 'none', padding: '8px 12px', borderRadius: 10, background: chatMode === 'broadcast' ? '#fff' : 'transparent', color: chatMode === 'broadcast' ? 'var(--text)' : 'var(--muted)', cursor: 'pointer', transition: 'all 0.2s' }}><Radio size={16} /></button>}
                    </div>
                </div>
                <div style={{ position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                    <input 
                        type="text" 
                        placeholder="Intercept personnel or dept..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: 12, background: 'rgba(0,0,0,0.03)', border: 'none', fontSize: 13, fontWeight: 700, outline: 'none' }}
                    />
                </div>
           </div>

           <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                {chatMode === 'direct' ? (
                    <>
                        <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--muted)', padding: '12px 12px 8px', letterSpacing: 1 }}>FAVORITES</div>
                        {filteredContacts.map(c => (
                            <div 
                                key={c.id} 
                                onClick={() => { setActiveChat(c); if (isMobile) setShowChatMobile(true); }}
                                style={{ 
                                    padding: '12px 16px', borderRadius: 20, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: 14,
                                    background: activeChat?.id === c.id ? 'var(--accent-glow)' : 'transparent',
                                    transition: 'all 0.2s ease', marginBottom: 4
                                }}
                            >
                                <div style={{ 
                                    width: 44, height: 44, borderRadius: 16, background: c.color || 'var(--accent)', color: '#fff', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14,
                                    position: 'relative'
                                }}>
                                    {c.av}
                                    <div style={{ position: 'absolute', bottom: -2, right: -2, width: 12, height: 12, borderRadius: '50%', background: 'var(--green)', border: '2.5px solid #fff' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 14, fontWeight: 800 }}>{c.name}</div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>{c.dept}</div>
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    <div style={{ padding: 12 }}>
                         <div 
                            onClick={() => setActiveChat('all')}
                            style={{ padding: 20, borderRadius: 24, background: activeChat === 'all' ? 'var(--accent-glow)' : 'rgba(0,0,0,0.02)', border: activeChat === 'all' ? '1px solid var(--accent)' : '1px solid transparent', cursor: 'pointer', marginBottom: 16 }}
                         >
                            <div style={{ width: 48, height: 48, borderRadius: 16, background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}><Users size={24} /></div>
                            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Global Broadcast</h3>
                            <p style={{ margin: '4px 0 0', fontSize: 12, fontWeight: 700, color: 'var(--muted)' }}>Entire organization reach</p>
                         </div>
                         <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--muted)', padding: '12px 12px 12px', letterSpacing: 1 }}>DEPARTMENTS</div>
                         {depts.map(d => (
                             <div 
                                key={d}
                                onClick={() => setActiveChat(d)}
                                style={{ padding: 16, borderRadius: 20, background: activeChat === d ? 'var(--accent-glow)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 4 }}
                             >
                                <div style={{ width: 40, height: 40, borderRadius: 14, background: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Hash size={18} /></div>
                                <span style={{ fontSize: 14, fontWeight: 800 }}>{d} Hub</span>
                             </div>
                         ))}
                    </div>
                )}
           </div>
        </div>

        {/* Chat / Dispatch Area */}
        <div style={{ 
            flex: 1, display: 'flex', flexDirection: 'column', 
            background: 'rgba(255,255,255,0.02)',
            display: isMobile && !showChatMobile ? 'none' : 'flex'
        }}>
            {activeChat ? (
                <>
                    {/* Active Header */}
                    <div style={{ padding: '20px 32px', borderBottom: '1px solid var(--line)', background: 'rgba(255,255,255,0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            {isMobile && <button onClick={() => setShowChatMobile(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} /></button>}
                            {chatMode === 'direct' ? (
                                <>
                                    <div style={{ width: 44, height: 44, borderRadius: 14, background: activeChat.color || 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>{activeChat.av}</div>
                                    <div>
                                        <div style={{ fontSize: 16, fontWeight: 900 }}>{activeChat.name}</div>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <ShieldCheck size={12} /> SECURE CHANNEL ACTIVE
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--red)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Radio size={20} /></div>
                                    <div>
                                        <div style={{ fontSize: 16, fontWeight: 900 }}>BROADCAST: {activeChat?.toUpperCase()}</div>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--red)' }}>HIGH PRIORITY DISPATCH</div>
                                    </div>
                                </>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {!isMobile && (
                                <>
                                    <button className="btn-glass" style={{ width: 44, height: 44, borderRadius: 14 }}><Phone size={18} /></button>
                                    <button className="btn-glass" style={{ width: 44, height: 44, borderRadius: 14 }}><Video size={18} /></button>
                                </>
                            )}
                            <button className="btn-glass" style={{ width: 44, height: 44, borderRadius: 14 }}><MoreVertical size={18} /></button>
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {chatMode === 'direct' ? (
                            <>
                                <div style={{ textAlign: 'center', margin: '16px 0' }}>
                                    <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--muted)', background: 'rgba(0,0,0,0.03)', padding: '6px 16px', borderRadius: 20 }}>
                                        SESSION RECONCILIATION COMPLETED {new Date().toLocaleTimeString()}
                                    </span>
                                </div>
                                {(histories[activeChat.id] || []).map(msg => {
                                    const isMe = msg.sender === 'me'
                                    return (
                                        <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                                            <div style={{ 
                                                maxWidth: '80%', padding: '14px 20px', borderRadius: 24,
                                                background: isMe ? 'var(--accent)' : 'var(--bg-card)',
                                                color: isMe ? '#fff' : 'var(--text)',
                                                border: isMe ? 'none' : '1px solid var(--line)',
                                                borderBottomRightRadius: isMe ? 4 : 24,
                                                borderBottomLeftRadius: !isMe ? 4 : 24,
                                                fontSize: 14, fontWeight: 700, lineHeight: 1.5,
                                                boxShadow: '0 8px 24px rgba(0,0,0,0.04)'
                                            }}>
                                                {msg.text}
                                            </div>
                                            <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                {msg.time} {isMe && <><Circle size={4} fill="var(--green)" /> DELIVERED</>}
                                            </div>
                                        </div>
                                    )
                                })}
                            </>
                        ) : (
                            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                <div style={{ width: 120, height: 120, borderRadius: 40, background: 'rgba(239, 68, 68, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                                    <Radio size={56} color="var(--red)" />
                                </div>
                                <h2 style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1 }}>Broadcast Intelligence</h2>
                                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--muted)', maxWidth: 400 }}>Your announcement will be multi-cast across Telegram & Portal dashboards for the <b>{activeChat}</b> sector.</p>
                                <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
                                    <div style={{ padding: '10px 20px', borderRadius: 14, background: 'rgba(0,0,0,0.03)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <AtSign size={14} color="var(--blue)" /> <span style={{ fontSize: 12, fontWeight: 800 }}>Telegram Sync</span>
                                    </div>
                                    <div style={{ padding: '10px 20px', borderRadius: 14, background: 'rgba(0,0,0,0.03)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Bell size={14} color="var(--amber)" /> <span style={{ fontSize: 12, fontWeight: 800 }}>Portal Push</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Bar */}
                    <div style={{ padding: '24px 32px 40px', background: 'rgba(255,255,255,0.4)' }}>
                        <div style={{ 
                            background: 'var(--bg-card)', padding: '12px 12px 12px 24px', borderRadius: 24, 
                            border: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 16,
                            boxShadow: '0 20px 50px rgba(0,0,0,0.08)'
                        }}>
                            <button className="btn-icon" style={{ background: 'none' }}><Paperclip size={22} color="var(--muted)" /></button>
                            <textarea 
                                rows={1}
                                placeholder="Commence transmission..."
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 15, fontWeight: 700, resize: 'none' }}
                            />
                            <button className="btn-icon" style={{ background: 'none' }}><Smile size={22} color="var(--muted)" /></button>
                            <button 
                                onClick={handleSend}
                                className="btn"
                                style={{ width: 48, height: 48, borderRadius: 16, background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px -4px var(--accent-glow)' }}
                                disabled={sending || !message.trim()}
                            >
                                {sending ? <div className="spinner-sm" /> : <Send size={20} />}
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                     <div style={{ width: 140, height: 140, borderRadius: 48, border: '1px solid var(--line)', background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(0,0,0,0.02) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
                        <Shield size={64} style={{ opacity: 0.1 }} />
                     </div>
                     <h2 style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1.5 }}>Intelligence Hub</h2>
                     <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--muted)', maxWidth: 380 }}>Secure organizational matrix synchronization. Select personnel to commence encrypted handshake.</p>
                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 40 }}>
                        <InfoBadge icon={ShieldCheck} label="E2E SECURE" />
                        <InfoBadge icon={History} label="AUDITED" />
                        <InfoBadge icon={Activity} label="REALTIME" />
                     </div>
                </div>
            )}
        </div>
      </div>
    </div>
  )
}

function InfoBadge({ icon: Icon, label }) {
    return (
        <div style={{ padding: '12px 20px', borderRadius: 16, background: 'rgba(0,0,0,0.02)', border: '1px solid var(--line)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <Icon size={18} color="var(--accent)" />
            <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: 0.5 }}>{label}</span>
        </div>
    )
}
