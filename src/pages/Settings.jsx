import { useState, useMemo } from 'react'
import { useScreenSize } from '../hooks/useScreenSize'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useData } from '../context/DataContext'
import { 
  Settings as SettingsIcon, User, Bell, Shield, Globe, 
  Mail, MessageSquare, Key, Database, Save, Eye, EyeOff, 
  Smartphone, Monitor, ChevronRight, Check, Zap, AlertTriangle,
  RefreshCw, History, ShieldAlert, IndianRupee, Clock, CalendarDays,
  Lock, Terminal, Cpu, HardDrive
} from 'lucide-react'
import * as api from '../services/api'

export default function Settings() {
  const { isMobile, isTablet, isDesktop } = useScreenSize()
  const { user, login } = useAuth()
  const { showToast } = useToast()
  const { refresh } = useData()
  
  const [activeTab, setActiveTab] = useState('governance')
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  
  // Profile State
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

  // Governance & Thresholds
  const [governance, setGovernance] = useState(() => {
    const saved = localStorage.getItem('siswit_governance')
    return saved ? JSON.parse(saved) : {
      gracePeriod: 15,
      maxLeaves: 2,
      approvalRequired: true,
      autoAssignTasks: false,
      lateThreshold: 3
    }
  })

  // Fiscal Policies
  const [financials, setFinancials] = useState(() => {
    const saved = localStorage.getItem('siswit_financials')
    return saved ? JSON.parse(saved) : {
      lateDeduction: 100,
      absentMultiplier: 1.0,
      overtimeRate: 1.5,
      payrollDay: 1,
      currency: 'INR'
    }
  })

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('siswit_notifications')
    return saved ? JSON.parse(saved) : {
      portal: true,
      telegram: true,
      email: false,
      desktop: true
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
      botToken: '6892341...',
      botOnline: true
    }
  })

  const handleDeepSync = async () => {
    setSyncing(true)
    try {
      await refresh()
      showToast('System-wide deep sync complete!', 'success')
    } catch (err) {
      showToast('Deep sync failed. Check sheet connection.', 'error')
    } finally {
      setSyncing(false)
    }
  }

  const handleSave = async (section) => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    
    const data = {
        profile, governance, financials, notifications, system
    }

    localStorage.setItem(`siswit_${section}`, JSON.stringify(data[section]))
    
    if (section === 'security') {
        // Implement security specific save logic if needed
    }

    showToast(`${section.charAt(0).toUpperCase() + section.slice(1)} configurations updated`, 'success')
    setLoading(false)
  }

  const tabs = [
    { id: 'governance', label: 'Governance', icon: ShieldAlert },
    { id: 'financials', label: 'Financials', icon: IndianRupee },
    { id: 'system', label: 'System Hub', icon: Terminal },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'general', label: 'Profile', icon: User },
  ]

  const ControlGroup = ({ title, desc, children }) => (
    <div style={{ marginBottom: 40 }}>
        <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 900, margin: 0 }}>{title}</h3>
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: '4px 0 0 0' }}>{desc}</p>
        </div>
        <div className="card-glass" style={{ padding: 24, borderRadius: 20 }}>
            {children}
        </div>
    </div>
  )

  const SettingRow = ({ label, desc, children }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--line)', gap: 20 }}>
        <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 800 }}>{label}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{desc}</div>
        </div>
        <div>
            {children}
        </div>
    </div>
  )

  return (
    <div className="animate-in" style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? 12 : 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 20 }}>
        <div>
          <h1 className="glow-text" style={{ fontSize: isMobile ? 28 : 40, fontWeight: 900, letterSpacing: -1 }}>Admin Settings</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, fontWeight: 600, marginTop: 4 }}>Control every internal mechanism of the SISWIT ecosystem.</p>
        </div>
        <button onClick={handleDeepSync} disabled={syncing} className="btn btn-secondary" style={{ borderRadius: 14, padding: '12px 24px', fontWeight: 800, background: 'var(--bg-elevated)' }}>
            <RefreshCw size={18} className={syncing ? 'rotate' : ''} /> {syncing ? 'SYNCING...' : 'DEEP RE-SYNC'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '260px 1fr', gap: 40 }}>
        {/* Navigation Sidebar */}
        <div style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: 6, overflowX: isMobile ? 'auto' : 'visible', paddingBottom: isMobile ? 12 : 0 }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="btn btn-ghost"
              style={{
                justifyContent: 'flex-start',
                padding: '14px 20px',
                borderRadius: 16,
                background: activeTab === tab.id ? 'var(--bg-elevated)' : 'transparent',
                color: activeTab === tab.id ? 'var(--text)' : 'var(--muted)',
                fontWeight: activeTab === tab.id ? 800 : 600,
                border: activeTab === tab.id ? '1px solid var(--line)' : '1px solid transparent',
                minWidth: isMobile ? 140 : 'auto'
              }}
            >
              <tab.icon size={18} color={activeTab === tab.id ? 'var(--accent)' : 'var(--muted)'} />
              <span style={{ fontSize: 14 }}>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="animate-in">
          {activeTab === 'governance' && (
            <div>
              <ControlGroup title="Attendance Governance" desc="Configure logic for presence and punctuality detection.">
                <SettingRow label="Lateness Grace Period" desc="Minutes allowed after shift start before recording 'Late'.">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input type="number" className="input-sm" value={governance.gracePeriod} onChange={e => setGovernance({...governance, gracePeriod: parseInt(e.target.value)})} style={{ width: 80, padding: '8px 12px', textAlign: 'center' }} />
                        <span style={{ fontSize: 11, fontWeight: 800 }}>MINS</span>
                    </div>
                </SettingRow>
                <SettingRow label="Leave Policy Threshold" desc="Maximum unpenalized approved leaves per month.">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input type="number" className="input-sm" value={governance.maxLeaves} onChange={e => setGovernance({...governance, maxLeaves: parseInt(e.target.value)})} style={{ width: 80, padding: '8px 12px', textAlign: 'center' }} />
                        <span style={{ fontSize: 11, fontWeight: 800 }}>DAYS</span>
                    </div>
                </SettingRow>
                <SettingRow label="Approval Protocol" desc="Require explicit admin sign-off for all leave applications.">
                    <input type="checkbox" className="toggle" checked={governance.approvalRequired} onChange={() => setGovernance({...governance, approvalRequired: !governance.approvalRequired})} />
                </SettingRow>
              </ControlGroup>

              <ControlGroup title="Task Governance" desc="Automation and priority management for operational workflows.">
                <SettingRow label="Auto-Assignment Engine" desc="Automatically assign tasks based on employee load and availability.">
                    <input type="checkbox" className="toggle" checked={governance.autoAssignTasks} onChange={() => setGovernance({...governance, autoAssignTasks: !governance.autoAssignTasks})} />
                </SettingRow>
              </ControlGroup>

              <button className="btn btn-primary" onClick={() => handleSave('governance')} disabled={loading} style={{ padding: '16px 32px', borderRadius: 14, fontWeight: 900 }}>
                <Save size={18} /> SAVE GOVERNANCE CONFIG
              </button>
            </div>
          )}

          {activeTab === 'financials' && (
            <div>
              <ControlGroup title="Fiscal Thresholds" desc="Global deduction rates and multiplier settings for payroll.">
                <SettingRow label="Lateness Penalty" desc="Fixed deduction amount per 'Late' record (INR).">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <IndianRupee size={14} />
                        <input type="number" className="input-sm" value={financials.lateDeduction} onChange={e => setFinancials({...financials, lateDeduction: parseInt(e.target.value)})} style={{ width: 80, padding: '8px 12px', textAlign: 'center' }} />
                    </div>
                </SettingRow>
                <SettingRow label="Absenteeism Multiplier" desc="Day-salary multiplier for unapproved absences (e.g. 1.0 = one day pay).">
                    <input type="number" step="0.5" className="input-sm" value={financials.absentMultiplier} onChange={e => setFinancials({...financials, absentMultiplier: parseFloat(e.target.value)})} style={{ width: 80, padding: '8px 12px', textAlign: 'center' }} />
                </SettingRow>
                <SettingRow label="Payroll Disbursal Day" desc="Target day of the month for automated payroll calculation.">
                     <select className="select-sm" value={financials.payrollDay} onChange={e => setFinancials({...financials, payrollDay: parseInt(e.target.value)})} style={{ padding: '8px 12px' }}>
                        {[...Array(28)].map((_, i) => <option key={i+1} value={i+1}>{i+1}{i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'}</option>)}
                     </select>
                </SettingRow>
              </ControlGroup>

              <button className="btn btn-primary" onClick={() => handleSave('financials')} disabled={loading} style={{ padding: '16px 32px', borderRadius: 14, fontWeight: 900 }}>
                <Save size={18} /> SAVE FISCAL POLICIES
              </button>
            </div>
          )}

          {activeTab === 'system' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20, marginBottom: 40 }}>
                  <div className="card-glass" style={{ padding: 24, borderRadius: 24, border: '1px solid var(--line)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <MessageSquare size={18} color="var(--accent)" />
                            <span style={{ fontSize: 13, fontWeight: 900 }}>Telegram Bot</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: system.botOnline ? 'var(--green)' : 'var(--red)' }} />
                            <span style={{ fontSize: 10, fontWeight: 800 }}>{system.botOnline ? 'ONLINE' : 'OFFLINE'}</span>
                        </div>
                    </div>
                    <div className="form-group">
                        <label style={{ fontSize: 10 }}>Bot Integration API Token</label>
                        <input type="password" value={system.botToken} readOnly style={{ fontSize: 11, fontFamily: 'monospace', opacity: 0.5 }} />
                    </div>
                    <button className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: 12, border: '1px solid var(--line)' }}>RESTART TELEGRAM SERVICE</button>
                  </div>

                  <div className="card-glass" style={{ padding: 24, borderRadius: 24, border: '1px solid var(--line)' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <HardDrive size={18} color="var(--purple)" />
                        <span style={{ fontSize: 13, fontWeight: 900 }}>Sheet Infrastructure</span>
                    </div>
                    <div className="form-group">
                        <label style={{ fontSize: 10 }}>Google Sheet ID</label>
                        <input value={system.sheetId} onChange={e => setSystem({...system, sheetId: e.target.value})} style={{ fontSize: 11, fontFamily: 'monospace' }} />
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={handleDeepSync} style={{ width: '100%', marginTop: 12, border: '1px solid var(--line)' }}>TEST CONNECTION</button>
                  </div>
              </div>

              <ControlGroup title="System Audit Log" desc="Latest high-level administrative activity across the system.">
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', fontSize: 12 }}>
                        <thead>
                            <tr style={{ color: 'var(--muted)', textAlign: 'left' }}>
                                <th style={{ padding: '8px 0' }}>TIMESTAMP</th>
                                <th>ACTION</th>
                                <th>TARGET</th>
                                <th style={{ textAlign: 'right' }}>STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { t: '2 mins ago', a: 'Update Lateness Filter', tg: 'Governance', s: 'SUCCESS' },
                                { t: '14 mins ago', a: 'Deep Sync Triggered', tg: 'Infrastructure', s: 'SUCCESS' },
                                { t: '1h ago', a: 'User Role Promotion', tg: 'Sunny (Employee)', s: 'PENDING' },
                            ].map((log, i) => (
                                <tr key={i} style={{ borderTop: '1px solid var(--line)' }}>
                                    <td style={{ padding: '12px 0', color: 'var(--muted)' }}>{log.t}</td>
                                    <td style={{ fontWeight: 800 }}>{log.a}</td>
                                    <td>{log.tg}</td>
                                    <td style={{ textAlign: 'right', fontWeight: 900, fontSize: 10, color: log.s === 'SUCCESS' ? 'var(--green)' : 'var(--orange)' }}>{log.s}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
              </ControlGroup>

              <div className="card" style={{ padding: 24, borderRadius: 20, background: 'var(--red-dim)', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--red)' }}>Critical Disaster Recovery</div>
                    <p style={{ fontSize: 11, color: 'var(--red)', margin: '4px 0 0 0', opacity: 0.8 }}>Wipe all local configuration and reset system to baseline.</p>
                </div>
                <button className="btn btn-danger" style={{ borderRadius: 12 }}>FACTORY RESET</button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
             <div className="animate-in" style={{ maxWidth: 500 }}>
                <ControlGroup title="Access Control" desc="Revise your administrative credentials periodically.">
                    <div className="form-group">
                        <label>Current Master Password</label>
                        <input type="password" placeholder="••••••••" />
                    </div>
                    <div className="form-group" style={{ marginTop: 24 }}>
                        <label>New Administrative Password</label>
                        <input type="password" placeholder="At least 12 characters" />
                    </div>
                    <button className="btn btn-primary" style={{ marginTop: 20, width: '100%', justifyContent: 'center' }}>UPDATE CREDENTIALS</button>
                </ControlGroup>

                <div className="card-glass" style={{ padding: 24, borderRadius: 20, display: 'flex', gap: 16 }}>
                    <Shield size={32} color="var(--accent)" />
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 900 }}>Session Management</div>
                        <p style={{ fontSize: 11, color: 'var(--muted)', margin: '4px 0 12px 0' }}>There are 3 active administrative sessions on this account.</p>
                        <button className="btn btn-outline btn-sm" style={{ borderColor: 'var(--line)' }}>REVOKE ALL OTHER SESSIONS</button>
                    </div>
                </div>
             </div>
          )}

          {activeTab === 'notifications' && (
             <div className="animate-in">
                <ControlGroup title="Global Intelligence Routing" desc="Control how the system communicates with stakeholders.">
                    <SettingRow label="System Bot Integration" desc="Allow the bot to send real-time alerts to the telegram channel.">
                        <input type="checkbox" className="toggle" checked={notifications.telegram} onChange={() => setNotifications({...notifications, telegram: !notifications.telegram})} />
                    </SettingRow>
                    <SettingRow label="User Portal Alerts" desc="Enable real-time push-notifications for employees.">
                        <input type="checkbox" className="toggle" checked={notifications.portal} onChange={() => setNotifications({...notifications, portal: !notifications.portal})} />
                    </SettingRow>
                </ControlGroup>
                <button className="btn btn-primary" onClick={() => handleSave('notifications')} style={{ padding: '16px 32px', borderRadius: 14, fontWeight: 900 }}>SAVE ALERTS CONFIG</button>
             </div>
          )}

          {activeTab === 'general' && (
             <div className="animate-in">
                <ControlGroup title="Admin Identity" desc="Update your public-facing metadata within the system.">
                    <div style={{ display: 'flex', gap: 24, marginBottom: 32, alignItems: 'center' }}>
                        <div style={{ width: 80, height: 80, borderRadius: 24, background: 'var(--accent)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900 }}>
                            {profile.name.substring(0,2).toUpperCase()}
                        </div>
                        <div>
                             <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 4 }}>{profile.name}</h3>
                             <p style={{ fontSize: 12, color: 'var(--muted)' }}>Global Root Administrator</p>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20 }}>
                         <div className="form-group">
                            <label>Full Name</label>
                            <input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
                         </div>
                         <div className="form-group">
                            <label>Primary Email</label>
                            <input value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} />
                         </div>
                    </div>
                    <button className="btn btn-primary" onClick={() => handleSave('profile')} style={{ marginTop: 24 }}>UPDATE PROFILE</button>
                </ControlGroup>
             </div>
          )}
        </div>
      </div>
    </div>
  )
}
