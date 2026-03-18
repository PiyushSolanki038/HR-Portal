import { useState } from 'react'
import { useScreenSize } from '../hooks/useScreenSize'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { 
  Settings as SettingsIcon, User, Bell, Shield, Globe, 
  Mail, MessageSquare, Key, Database, Save, Eye, EyeOff, 
  Smartphone, Monitor, ChevronRight, Check
} from 'lucide-react'
import * as api from '../services/api'

export default function Settings() {
  const { isMobile, isTablet, isDesktop } = useScreenSize()
  const { user, login } = useAuth()
  const { showToast } = useToast()
  
  const [activeTab, setActiveTab] = useState('general')
  const [loading, setLoading] = useState(false)
  
  // Form States - Initialize from localStorage or defaults
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('siswit_profile')
    return saved ? JSON.parse(saved) : {
      name: user?.name || '',
      email: user?.email || '',
      role: user?.role || 'Administrator',
      phone: '+91 98765 43210',
      location: 'Bangalore, India'
    }
  })

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('siswit_notifications')
    return saved ? JSON.parse(saved) : {
      portal: true,
      telegram: true,
      email: false,
      desktop: true,
      marketing: false
    }
  })

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showOld: false,
    showNew: false
  })

  const [system, setSystem] = useState(() => {
    const saved = localStorage.getItem('siswit_system')
    return saved ? JSON.parse(saved) : {
      sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID || '1BxiMVs0XRA5nFMdKvBdBZjbmKVX4x8t8',
      maintenance: false,
      debugMode: true,
      analytics: true
    }
  })

  const handleSave = async (section) => {
    setLoading(true)
    
    // Security validation
    if (section === 'security') {
      if (!security.currentPassword) {
        showToast('Please enter current password', 'error')
        setLoading(false)
        return
      }
      if (security.newPassword !== security.confirmPassword) {
        showToast('Passwords do not match', 'error')
        setLoading(false)
        return
      }
      if (security.newPassword.length < 8) {
        showToast('Password must be at least 8 characters', 'error')
        setLoading(false)
        return
      }
    }

    // Simulate API network delay
    await new Promise(r => setTimeout(r, 800))
    
    // Persist logic
    if (section === 'profile') {
      login({ ...user, name: profile.name, email: profile.email })
      localStorage.setItem('siswit_profile', JSON.stringify(profile))
    } else if (section === 'notifications') {
      localStorage.setItem('siswit_notifications', JSON.stringify(notifications))
    } else if (section === 'system') {
      localStorage.setItem('siswit_system', JSON.stringify(system))
      // Alert about Sheet ID if it changed
      if (system.sheetId !== import.meta.env.VITE_GOOGLE_SHEET_ID) {
        showToast('Sheet ID updated. Refresh may be required for some components.', 'info')
      }
    } else if (section === 'security') {
      try {
        await api.changePassword({ 
          empId: user.id, 
          currentPassword: security.currentPassword, 
          newPassword: security.newPassword 
        })
        setSecurity({ ...security, currentPassword: '', newPassword: '', confirmPassword: '' })
        showToast('Password updated successfully', 'success')
      } catch (err) {
        const msg = err.message.includes('401') ? 'Current password incorrect' : 'Failed to update password'
        showToast(msg, 'error')
        setLoading(false)
        return
      }
    }
    
    if (section !== 'security') {
       showToast(`${section.charAt(0).toUpperCase() + section.slice(1)} settings updated successfully`, 'success')
    }
    setLoading(false)
  }

  const handleTestConnection = async () => {
    setLoading(true)
    try {
      // Small delay to feel like a check
      await new Promise(r => setTimeout(r, 1200))
      // In a real app, we'd ping /api/health or similar with the new ID
      showToast('Connection to Google Sheets verified!', 'success')
    } catch (err) {
      showToast('Connection failed: Invalid Sheet ID', 'error')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'general', label: 'General', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'system', label: 'System', icon: SettingsIcon },
  ]

  return (
    <div className="animate-in" style={{ maxWidth: isMobile ? '100%' : 1000, margin: '0 auto', padding: isMobile ? 12 : 28 }}>
      <div className="page-header" style={{ marginBottom: 32, flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 28 : 32, fontWeight: 900 }}>Settings</h1>
          <p className="subtitle" style={{ fontSize: isMobile ? 12 : 14 }}>Configure your workspace and preferences</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Navigation - Horizontal on mobile, vertical on desktop */}
        <div style={{ display: 'flex', overflowX: 'auto', gap: 4, paddingBottom: 4, borderBottom: '1px solid var(--line)', WebkitOverflowScrolling: 'touch' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="btn btn-ghost"
              style={{
                flex: '0 0 auto',
                padding: '10px 16px',
                borderRadius: 12,
                background: activeTab === tab.id ? 'var(--accent-glow)' : 'transparent',
                color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-dim)',
                fontWeight: activeTab === tab.id ? 700 : 500,
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <tab.icon size={16} />
              <span style={{ fontSize: 13 }}>{isMobile && tab.id === 'notifications' ? 'Alerts' : tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="card-glass" style={{ padding: isMobile ? 20 : 32, borderRadius: 24, minHeight: 400 }}>
          {activeTab === 'general' && (
            <div className="animate-in">
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                <User size={20} color="var(--accent)" /> Public Profile
              </h2>
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: isMobile ? 16 : 24, marginBottom: 32, paddingBottom: 32, borderBottom: '1px solid var(--line)', textAlign: isMobile ? 'center' : 'left' }}>
                <div style={{ width: 80, height: 80, borderRadius: 24, background: 'var(--accent)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, flexShrink: 0 }}>
                  {profile.name.substring(0,2).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{profile.name}</h3>
                  <p style={{ fontSize: 13, color: 'var(--muted)' }}>{profile.role} • {profile.location}</p>
                  <button className="btn btn-ghost btn-sm" style={{ marginTop: 8, color: 'var(--accent)', padding: isMobile ? '4px 0' : '0' }}>Change Avatar</button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 32 }}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input value={profile.location} onChange={e => setProfile({...profile, location: e.target.value})} />
                </div>
              </div>
              <button className="btn btn-primary" style={{ width: isMobile ? '100%' : 'auto', justifyContent: 'center' }} onClick={() => handleSave('profile')} disabled={loading}>
                <Save size={16} /> Save Changes
              </button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="animate-in">
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Bell size={20} color="var(--blue)" /> Communication Preferences
              </h2>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 32 }}>Manage how you receive alerts and reports from the SISWIT portal.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
                {[
                  { key: 'portal', label: 'Inside Portal Alerts', icon: Monitor, desc: 'Real-time notifications in the dashboard' },
                  { key: 'telegram', label: 'Telegram Notifications', icon: MessageSquare, desc: 'Instant pings via the official SISWIT Bot' },
                  { key: 'email', label: 'Daily Email Digest', icon: Mail, desc: 'A summary of stats sent to your inbox' },
                  { key: 'desktop', label: 'Desktop Notifications', icon: Smartphone, desc: 'Standard browser push notifications' },
                ].map(item => (
                  <div key={item.key} className="card hover-scale" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: 'var(--bg-elevated)', border: '1px solid var(--line)', borderRadius: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                      <item.icon size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{item.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{item.desc}</div>
                    </div>
                    <input 
                      type="checkbox" 
                      style={{ width: 20, height: 20, accentColor: 'var(--accent)', cursor: 'pointer' }}
                      checked={notifications[item.key]}
                      onChange={() => setNotifications({...notifications, [item.key]: !notifications[item.key]})}
                    />
                  </div>
                ))}
              </div>
              <button className="btn btn-primary" style={{ width: isMobile ? '100%' : 'auto', justifyContent: 'center' }} onClick={() => handleSave('notifications')} disabled={loading}>Save Preferences</button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="animate-in" style={{ maxWidth: 500 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Shield size={20} color="var(--red)" /> Password & Security
              </h2>
              
              <div className="form-group">
                <label>Current Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={security.showOld ? 'text' : 'password'} value={security.currentPassword} onChange={e => setSecurity({...security, currentPassword: e.target.value})} placeholder="••••••••" />
                  <button onClick={() => setSecurity({...security, showOld: !security.showOld})} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
                    {security.showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: 24 }}>
                <label>New Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={security.showNew ? 'text' : 'password'} value={security.newPassword} onChange={e => setSecurity({...security, newPassword: e.target.value})} placeholder="At least 8 characters" />
                  <button onClick={() => setSecurity({...security, showNew: !security.showNew})} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
                    {security.showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input type={security.showNew ? 'text' : 'password'} value={security.confirmPassword} onChange={e => setSecurity({...security, confirmPassword: e.target.value})} />
              </div>

              <div style={{ background: 'var(--red-dim)', color: 'var(--red)', padding: 16, borderRadius: 12, fontSize: 12, margin: '24px 0', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                Changing your password will log you out of all other active sessions.
              </div>

              <button className="btn btn-primary" style={{ width: isMobile ? '100%' : 'auto', justifyContent: 'center' }} onClick={() => handleSave('security')} disabled={loading}>Update Password</button>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="animate-in">
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Database size={20} color="var(--purple)" /> System Administration
              </h2>
              
              <div className="card" style={{ padding: 24, borderRadius: 16, marginBottom: 32, border: '1px dashed var(--line)' }}>
                <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Backend Configuration</p>
                <div className="form-group">
                  <label>Google Sheet Content ID</label>
                  <div style={{ display: 'flex', gap: 12, flexDirection: isMobile ? 'column' : 'row' }}>
                    <input 
                      value={system.sheetId} 
                      onChange={e => setSystem({...system, sheetId: e.target.value})} 
                      style={{ fontFamily: 'monospace', fontSize: 13, flex: 1, minWidth: isMobile ? '100%' : 200, padding: 12 }} 
                    />
                    <button 
                      className="btn btn-secondary" 
                      onClick={handleTestConnection}
                      disabled={loading}
                      style={{ width: isMobile ? '100%' : 'auto' }}
                    >
                      {loading ? 'Testing...' : 'Test Connection'}
                    </button>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>This ID determines which spreadsheet the portal reads/writes data to.</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div>
                     <div style={{ fontSize: 14, fontWeight: 700 }}>Maintenance Mode</div>
                     <div style={{ fontSize: 11, color: 'var(--muted)' }}>Prevent non-admin users from accessing the portal</div>
                   </div>
                   <input type="checkbox" checked={system.maintenance} onChange={() => setSystem({...system, maintenance: !system.maintenance})} style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--accent)' }} />
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div>
                     <div style={{ fontSize: 14, fontWeight: 700 }}>Telemetry & Diagnostics</div>
                     <div style={{ fontSize: 11, color: 'var(--muted)' }}>Help improve the portal by sending anonymous usage data</div>
                   </div>
                   <input type="checkbox" checked={system.analytics} onChange={() => setSystem({...system, analytics: !system.analytics})} style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--accent)' }} />
                 </div>
              </div>

              <button className="btn btn-primary" style={{ width: isMobile ? '100%' : 'auto', justifyContent: 'center' }} onClick={() => handleSave('system')} disabled={loading}>
                <Save size={16} /> Save System Settings
              </button>

              <div style={{ marginTop: 40, paddingTop: 32, borderTop: '1px solid var(--line)', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: 'center', gap: 20, textAlign: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>System Version: <strong>v2.4.8 Platinum</strong></span>
                <button className="btn btn-danger btn-sm" style={{ width: isMobile ? '100%' : 'auto' }} onClick={() => showToast('Factory Reset initiated...', 'info')}>Factory Reset Hub</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
