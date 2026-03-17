import { useState } from 'react'
import { useData } from '../context/DataContext'
import * as api from '../services/api'
import { Bell, Check, Filter, CalendarDays, Zap, AlertCircle, MessageCircle } from 'lucide-react'

const theme = {
  bg: 'var(--bg)', 
  accent: 'var(--accent)', 
  cardBg: 'var(--bg-card)',
  cardBorder: 'var(--border)', 
  glass: 'blur(16px)',
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
  container: { minHeight: '100vh', backgroundColor: theme.bg, color: theme.text, fontFamily: theme.fontBody, padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' },
  title: { fontFamily: theme.fontHeading, fontSize: '32px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' },
  btnSecondary: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--bg-elevated)', color: 'var(--text)', border: theme.cardBorder, padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: theme.fontBody, fontSize: '13px', fontWeight: 600, transition: 'all 0.2s' },
  filterTab: { padding: '8px 16px', borderRadius: '100px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', border: 'none' },
  notifCard: { background: theme.cardBg, border: theme.cardBorder, borderRadius: '16px', padding: '20px', display: 'flex', gap: '16px', transition: 'all 0.3s ease', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }
}

export default function NotificationsView() {
  const { notifications, refresh } = useData()
  const [filter, setFilter] = useState('all')

  const filtered = notifications.filter(n => {
     if (filter === 'unread') return n.read === 'false' || n.read === false
     return true
  })

  const markRead = async (id) => {
     try {
        await api.markNotificationRead(id)
        refresh()
     } catch (err) {
        console.error(err)
     }
  }

  const markAllRead = async () => {
     const unread = notifications.filter(n => n.read === 'false' || n.read === false)
     try {
        await Promise.all(unread.map(n => api.markNotificationRead(n.id)))
        refresh()
     } catch (err) {
        console.error(err)
     }
  }

  const formatTime = (ts) => {
    if (!ts) return ''
    const diff = Date.now() - new Date(ts).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return new Date(ts).toLocaleDateString()
  }

  const getIcon = (type) => {
     switch (type) {
        case 'alert': return <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', color: theme.red, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AlertCircle size={20} /></div>
        case 'payroll': return <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: theme.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CalendarDays size={20} /></div>
        case 'system': return <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(79, 110, 247, 0.15)', color: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Zap size={20} /></div>
        default: return <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.15)', color: theme.amber, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MessageCircle size={20} /></div>
     }
  }

  return (
    <div style={styles.container} className="animate-in">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Notifications Center</h1>
          <p style={{ color: theme.muted, fontSize: '14px', marginTop: '6px' }}>View all system alerts, logs, and incoming structural flags.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
           <button style={styles.btnSecondary} onClick={markAllRead}><Check size={16} /> Mark all read</button>
           <button style={styles.btnSecondary}><Filter size={16} /> Settings</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', borderBottom: theme.cardBorder, paddingBottom: '16px' }}>
         <button style={{ ...styles.filterTab, background: filter === 'all' ? theme.text : 'transparent', color: filter === 'all' ? theme.bg : theme.muted }} onClick={() => setFilter('all')}>All Notifications</button>
         <button style={{ ...styles.filterTab, background: filter === 'unread' ? theme.accent : 'transparent', color: filter === 'unread' ? '#fff' : theme.muted }} onClick={() => setFilter('unread')}>Unread Only</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
         {filtered.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: theme.muted }}>
               <Bell size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
               <h3 style={{ margin: 0, fontSize: '20px', color: theme.text }}>You're all caught up!</h3>
               <p style={{ marginTop: '8px' }}>No pending notifications to review.</p>
            </div>
          ) : filtered.map(n => {
            const isRead = n.read === 'true' || n.read === true
            return (
              <div 
                 key={n.id} 
                 style={{ ...styles.notifCard, opacity: isRead ? 0.6 : 1, background: isRead ? theme.cardBg : 'rgba(255, 255, 255, 0.06)' }}
                 onClick={() => !isRead && markRead(n.id)}
              >
                 {getIcon(n.type || 'message')}
                 <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                       <div style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {n.title || (n.channel === 'broadcast' ? 'Broadcast' : 'Direct Message')}
                          {!isRead && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.accent, display: 'inline-block' }} />}
                       </div>
                       <div style={{ fontSize: '12px', color: theme.muted, fontWeight: 500 }}>{formatTime(n.timestamp)}</div>
                    </div>
                    <div style={{ fontSize: '14px', color: theme.muted, lineHeight: 1.5 }}>
                       {n.message}
                    </div>
                 </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}
