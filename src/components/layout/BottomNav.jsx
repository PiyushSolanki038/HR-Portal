import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Clock, MessageSquare, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'

export default function BottomNav() {
  const { user } = useAuth()
  const { notifications } = useData()
  const role = user?.role?.toLowerCase() || ''
  
  const unreadNotifs = notifications.filter(n => n.read === 'false' || n.read === false).length

  const links = [
    { to: role === 'employee' ? '/dashboard' : '/', icon: LayoutDashboard, label: 'Home' },
    { to: role === 'employee' ? '/my-attendance' : '/attendance', icon: Clock, label: 'Attend' },
    { to: '/communication', icon: MessageSquare, label: 'Chat', badge: unreadNotifs > 0 ? unreadNotifs : null },
    { to: role === 'employee' ? '/my-profile' : '/settings', icon: User, label: 'Account' },
  ]

  return (
    <nav className="bottom-nav">
      {links.map(link => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) => `bottom-nav-link ${isActive ? 'active' : ''}`}
        >
          <div className="bottom-nav-icon-wrapper">
            <link.icon />
            {link.badge && <span className="bottom-nav-badge">{link.badge}</span>}
          </div>
          <span>{link.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
