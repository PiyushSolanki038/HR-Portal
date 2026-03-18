import { Search, Bell, Menu, RefreshCw } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { useNavigate } from 'react-router-dom'
import { useScreenSize } from '../../hooks/useScreenSize'

export default function Topbar({ onMenuToggle }) {
  const { user } = useAuth()
  const { refresh, loading } = useData()
  const navigate = useNavigate()
  const { isMobile } = useScreenSize()

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="btn-icon menu-toggle" onClick={onMenuToggle}>
          <Menu size={18} />
        </button>
        <div className="topbar-search" style={{ flex: isMobile ? 1 : 'none', minWidth: 0, padding: isMobile ? '8px 12px' : '8px 16px', display: 'flex', gap: 8, background: 'var(--bg-elevated)', borderRadius: '100px' }}>
          <Search size={isMobile ? 16 : 18} style={{ color: 'var(--muted)', flexShrink: 0 }} />
          <input type="text" placeholder="Search..." style={{ minWidth: 0, border: 'none', background: 'transparent', outline: 'none', color: 'var(--text)', flex: 1, fontSize: isMobile ? 14 : 15 }} />
        </div>
      </div>

      <div className="topbar-right">
        <button
          className="btn-icon"
          onClick={refresh}
          title="Refresh data from Sheets"
          style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}
        >
          <RefreshCw size={16} />
        </button>
        <button className="btn-icon" onClick={() => navigate('/notifications')}>
          <Bell size={16} />
        </button>
        <div className="topbar-user">
          <div className="topbar-user-info">
            <div className="topbar-user-name" style={{ maxWidth: isMobile ? 70 : 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Admin'}</div>
            <div className="topbar-user-role" style={{ display: isMobile ? 'none' : 'block' }}>{user?.role || 'HR Manager'}</div>
          </div>
          <div className="avatar" style={{ 
            background: user?.color || 'var(--accent)',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#fff'
          }}>
            {user?.av || 'AD'}
          </div>
        </div>
      </div>
    </header>
  )
}
