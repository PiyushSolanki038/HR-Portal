import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import BottomNav from './BottomNav'
import ForcePasswordModal from '../auth/ForcePasswordModal'

export default function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()

  return (
    <div className={`app-shell ${sidebarOpen ? 'sidebar-is-open' : ''}`}>
      {user?.mustChangePassword && <ForcePasswordModal />}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />
      
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="main-content">
        <Topbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="page">
          {children}
        </main>
      </div>

      <BottomNav />
    </div>
  )
}
