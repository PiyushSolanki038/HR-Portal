import { Search, Bell, Menu, RefreshCw } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { useNavigate } from 'react-router-dom'

export default function Topbar({ onMenuToggle }) {
  const { user } = useAuth()
  const { refresh, loading } = useData()
  const navigate = useNavigate()

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="btn-icon menu-toggle" onClick={onMenuToggle}>
          <Menu size={18} />
        </button>
        <div className="topbar-search">
          <Search />
          <input type="text" placeholder="Search employees, commands..." />
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
            <div className="topbar-user-name">{user?.name || 'Admin'}</div>
            <div className="topbar-user-role">{user?.role || 'HR Manager'}</div>
          </div>
          <div className="avatar" style={{ background: user?.color || 'var(--accent)' }}>
            {user?.av || 'AD'}
          </div>
        </div>
      </div>
    </header>
  )
}
