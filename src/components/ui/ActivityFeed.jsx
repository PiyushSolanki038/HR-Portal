import { useNavigate } from 'react-router-dom'
import { 
  Zap, UserCheck, Calendar, ShieldAlert, Award, ArrowRight
} from 'lucide-react'

export default function ActivityFeed({ activities }) {
  const navigate = useNavigate()
  
  const getRoute = (type) => {
    const t = type?.toLowerCase()
    if (t?.includes('hiring') || t?.includes('candidate')) return '/hiring'
    if (t?.includes('attendance')) return '/attendance'
    if (t?.includes('leave')) return '/leaves'
    if (t?.includes('disciplinary') || t?.includes('excellence') || t?.includes('award')) return '/disciplinary'
    return '/disciplinary'
  }
  const getIcon = (type) => {
    const t = type?.toLowerCase()
    if (t?.includes('hiring') || t?.includes('candidate')) return Zap
    if (t?.includes('attendance')) return UserCheck
    if (t?.includes('leave')) return Calendar
    if (t?.includes('disciplinary')) return ShieldAlert
    if (t?.includes('excellence') || t?.includes('award')) return Award
    return Zap
  }

  const getColor = (type) => {
    const t = type?.toLowerCase()
    if (t?.includes('hiring')) return 'var(--amber)'
    if (t?.includes('attendance')) return 'var(--green)'
    if (t?.includes('leave')) return 'var(--blue)'
    if (t?.includes('disciplinary')) return 'var(--red)'
    if (t?.includes('excellence')) return 'var(--purple)'
    return 'var(--accent)'
  }

  const formatTime = (iso) => {
    if (!iso) return 'Recent'
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return new Date(iso).toLocaleDateString()
  }

  const feed = (activities || []).slice(0, 5).map(a => ({
    id: a.id,
    text: a.description || a.text,
    time: formatTime(a.timestamp || a.createdAt),
    icon: getIcon(a.type),
    color: getColor(a.type),
    route: getRoute(a.type)
  }))

  if (feed.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)', fontSize: 13 }}>
        No recent activities found.
      </div>
    )
  }

  return (
    <div className="activity-feed">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {feed.map((item, i) => (
          <div key={item.id} style={{ 
            display: 'flex', gap: '16px', position: 'relative',
            paddingBottom: i === feed.length - 1 ? 0 : '16px'
          }}>
            {i !== feed.length - 1 && (
              <div style={{ 
                position: 'absolute', left: '16px', top: '32px', bottom: 0, 
                width: '2px', background: 'var(--line)', opacity: 0.5 
              }} />
            )}
            
            <div style={{ 
              width: '34px', height: '34px', borderRadius: '10px', 
              background: item.color + '15', color: item.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, zIndex: 1
            }}>
              <item.icon size={16} />
            </div>

            <div style={{ flex: 1, paddingTop: '4px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                {item.text}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px', fontWeight: 500 }}>
                {item.time}
              </div>
            </div>
            
            <button 
              onClick={() => navigate(item.route)}
              style={{ 
                background: 'none', border: 'none', color: 'var(--muted)', 
                cursor: 'pointer', padding: '4px' 
              }}
            >
              <ArrowRight size={14} />
            </button>
          </div>
        ))}
      </div>
      
      <button 
        className="btn btn-ghost" 
        onClick={() => navigate('/audit')}
        style={{ width: '100%', marginTop: '20px', fontSize: '12px', fontWeight: 700 }}
      >
        VIEW ALL LOGS
      </button>
    </div>
  )
}
