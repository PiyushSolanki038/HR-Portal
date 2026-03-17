import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Clock, CalendarOff, CheckSquare,
  MessageSquare, UserPlus, FileCheck, FileText,
  Users, Wallet, TrendingUp, Shield, Settings,
  LogOut, Briefcase, ShieldAlert, Award
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'

const ADMIN_NAV = [
  { section: 'Overview', items: [
    { to: '/',            icon: LayoutDashboard, label: 'Dashboard' },
  ]},
  { section: 'HR Operations', items: [
    { to: '/attendance',  icon: Clock,         label: 'Attendance' },
    { to: '/leaves',      icon: CalendarOff,   label: 'Leaves' },
    { to: '/approvals',   icon: CheckSquare,   label: 'Approvals', badge: 'pendingLeaves' },
    { to: '/tasks',       icon: CheckSquare,   label: 'Task Manager' },
    { to: '/disciplinary', icon: ShieldAlert,   label: 'Disciplinary' },
    { to: '/communication', icon: MessageSquare, label: 'Communication', badge: 'unreadNotifs' },
    { to: '/mentors',     icon: Users,         label: 'Mentors' },
  ]},
  { section: 'Talent', items: [
    { to: '/hiring',      icon: UserPlus,      label: 'Hiring' },
    { to: '/onboarding',  icon: FileCheck,     label: 'Onboarding' },
    { to: '/documents',   icon: FileText,      label: 'Documents' },
  ]},
  { section: 'People', items: [
    { to: '/employees',   icon: Users,         label: 'Employees' },
  ]},
  { section: 'Finance', items: [
    { to: '/finance-dashboard', icon: LayoutDashboard, label: 'Finance Hub' },
    { to: '/payroll',     icon: Wallet,        label: 'Payroll' },
    { to: '/salary',      icon: Briefcase,     label: 'Salary Slips' },
    { to: '/deductions',  icon: TrendingUp,    label: 'Deductions' },
    { to: '/tax-management', icon: FileText,   label: 'Tax & Form 16' },
    { to: '/financial-reports', icon: FileCheck, label: 'Reports' },
    { to: '/loans-advances', icon: Users,      label: 'Loans & EMI' },
    { to: '/finance-audit', icon: Shield,      label: 'Audit Log' },
  ]},
  { section: 'System', items: [
    { to: '/analytics',   icon: TrendingUp,    label: 'Analytics' },
    { to: '/audit',       icon: Shield,        label: 'Audit Log' },
    { to: '/settings',    icon: Settings,      label: 'Settings', roles: ['Admin'] },
  ]},
]

const EMPLOYEE_NAV = [
  {
    section: 'MY WORKSPACE',
    items: [
      { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/my-attendance',  icon: Clock,          label: 'My Attendance' },
      { to: '/my-tasks',       icon: CheckSquare,    label: 'My Tasks', badge: 'myTasks' },
      { to: '/my-leaves',      icon: CalendarOff,    label: 'My Leaves', badge: 'myLeaves' },
    ]
  },
  {
    section: 'COMMUNICATION',
    items: [
      { to: '/communication', icon: MessageSquare,   label: 'Chat', badge: 'unreadNotifs' },
    ]
  },
  {
    section: 'PERSONAL',
    items: [
      { to: '/my-salary',      icon: Wallet,         label: 'My Salary' },
      { to: '/my-profile',     icon: UserPlus,       label: 'My Profile' },
    ]
  },
]

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const { notifications, leaves, tasks } = useData()
  const location = useLocation()

  const role = user?.role?.toLowerCase() || ''
  const isHR = role === 'hr manager' || role === 'admin'
  const activeNav = role === 'employee' ? EMPLOYEE_NAV : ADMIN_NAV

  const getBadgeValue = (type) => {
    switch (type) {
      case 'unreadNotifs':
        const unread = notifications.filter(n => n.read === 'false' || n.read === false).length
        return unread > 0 ? unread : null
      case 'pendingLeaves':
        const pending = leaves.filter(l => l.status === 'pending').length
        return pending > 0 ? pending : null
      case 'myTasks':
        const myTasks = tasks.filter(t => t.assignedTo === user.id && String(t.done) !== 'true').length
        return myTasks > 0 ? myTasks : null
      case 'myLeaves':
        const myPendingLeaves = leaves.filter(l => l.empId === user.id && l.status === 'pending').length
        return myPendingLeaves > 0 ? true : null // Show dot for personal pending leaves
      default:
        return null
    }
  }

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`} data-role={role}>
      <div className="sidebar-header" onClick={() => (window.location.href = '/')}>
        <div className="sidebar-logo">S</div>
        <span className="sidebar-brand">SISWIT</span>
      </div>

      <nav className="sidebar-nav">
        {activeNav.map(section => {
          const filteredItems = section.items.filter(item => {
            if (!item.roles) return true
            return item.roles.some(r => r.toLowerCase() === role)
          })

          if (filteredItems.length === 0) return null

          return (
            <div key={section.section} className="sidebar-section">
              <div className="sidebar-section-label">{section.section}</div>
              {filteredItems.map(item => {
                const badge = getBadgeValue(item.badge)
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `sidebar-link ${isActive ? 'active' : ''}`
                    }
                    onClick={onClose}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                    {badge && (
                      <span className={`sidebar-badge ${badge === true ? 'dot' : ''}`}>
                        {badge !== true ? badge : ''}
                      </span>
                    )}
                  </NavLink>
                )
              })}
            </div>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-link" onClick={logout} style={{ width: '100%' }}>
          <LogOut />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
