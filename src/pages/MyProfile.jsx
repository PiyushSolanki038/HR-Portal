import { useState } from 'react'
import { useScreenSize } from '../hooks/useScreenSize'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import * as api from '../services/api'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Building, 
  Calendar, 
  Shield, 
  Bell, 
  Edit2,
  Lock,
  Star,
  CheckCircle,
  Clock,
  Send,
  ExternalLink
} from 'lucide-react'
import ChangePasswordModal from '../components/auth/ChangePasswordModal'

export default function MyProfile() {
  const { isMobile, isTablet, isDesktop } = useScreenSize()
  const { user } = useAuth()
  const { employees, loading, error, refresh } = useData()
  const { showToast } = useToast()
  
  const [isEditing, setIsEditing] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    address: '',
    telegramChatId: ''
  })

  const fullUser = employees.find(e => e.id === user?.id) || user

  const startEditing = () => {
    setFormData({
      email: fullUser?.email || '',
      phone: fullUser?.phone || '',
      address: fullUser?.address || '',
      telegramChatId: fullUser?.telegramChatId || ''
    })
    setIsEditing(true)
  }

  const handleUpdateProfile = async () => {
    setUpdating(true)
    try {
      await api.updateEmployee(fullUser.id, formData)
      await refresh()
      showToast('Profile updated successfully', 'success')
      setIsEditing(false)
    } catch (err) {
      showToast('Failed to update profile. Please check your connection.', 'error')
    } finally {
      setUpdating(false)
    }
  }

  const handleChangePassword = () => {
    setIsPasswordModalOpen(true)
  }

  if (loading && employees.length === 0) return <LoadingSpinner />
  if (error) return <div className="p-6">Error: {error}</div>

  return (
    <div className="animate-in" style={{ padding: isMobile ? 12 : 28, maxWidth: '100%', overflowX: 'hidden' }}>
      <div className="page-header" style={{ flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? 16 : 24, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 24 : 32, fontWeight: 800 }}>My Profile</h1>
          <p className="subtitle" style={{ fontSize: isMobile ? 12 : 14 }}>Manage your personal and professional information.</p>
        </div>
        {!isEditing ? (
          <button className="btn btn-secondary" style={{ width: isMobile ? '100%' : 'auto', justifyContent: 'center' }} onClick={startEditing}>
            <Edit2 size={16} /> Edit Profile
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 12, width: isMobile ? '100%' : 'auto' }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setIsEditing(false)} disabled={updating}>
              Cancel
            </button>
            <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleUpdateProfile} disabled={updating}>
              {updating ? <LoadingSpinner size={16} /> : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '320px 1fr', gap: 24, marginBottom: 24 }}>
        {/* Sidebar Profile Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
              <div className="avatar avatar-xl" style={{ margin: '0 auto', background: 'var(--accent)', fontSize: 32 }}>
                {fullUser?.name?.[0]}
              </div>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800 }}>{fullUser?.name}</h2>
            <p style={{ color: 'var(--accent)', fontWeight: 600, fontSize: 13, marginTop: 4 }}>{fullUser?.designation || 'Specialist'}</p>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>{fullUser?.department || fullUser?.dept} Department</p>
            
            <div style={{ marginTop: 24, paddingTop: 24, borderTop: 'var(--border)', display: 'flex', justifyContent: 'center', gap: 20 }}>
               <div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>4.8</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>RATING</div>
               </div>
               <div style={{ width: 1, background: 'var(--line)' }}></div>
               <div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>98%</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>ATTENDANCE</div>
               </div>
            </div>
          </div>

          <div className="card">
             <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Star size={16} color="var(--amber)" /> Performance Badges
             </h3>
             <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <span className="badge badge-green" style={{ textTransform: 'none' }}>Early Bird</span>
                <span className="badge badge-blue" style={{ textTransform: 'none' }}>Team Player</span>
                <span className="badge badge-purple" style={{ textTransform: 'none' }}>Top Performer</span>
             </div>
          </div>
        </div>

        {/* Main Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card" style={{ padding: isMobile ? 20 : 32, border: isEditing ? '1px solid var(--accent)' : 'var(--border)', transition: 'all 0.3s ease' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Personal Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 24 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 6, fontWeight: 600 }}>EMAIL ADDRESS</label>
                {!isEditing ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Mail size={16} color="var(--muted)" />
                    <span style={{ fontSize: 14 }}>{fullUser?.email || 'N/A'}</span>
                  </div>
                ) : (
                  <input 
                    className="input" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                    placeholder="example@company.com"
                  />
                )}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 6, fontWeight: 600 }}>PHONE NUMBER</label>
                {!isEditing ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Phone size={16} color="var(--muted)" />
                    <span style={{ fontSize: 14 }}>{fullUser?.phone || '+91 XXXXX XXXX'}</span>
                  </div>
                ) : (
                  <input 
                    className="input" 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                    placeholder="+91 00000 00000"
                  />
                )}
              </div>
              <div style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 6, fontWeight: 600 }}>TELEGRAM CHAT ID</label>
                {!isEditing ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Send size={16} color="var(--muted)" />
                    <span style={{ fontSize: 14 }}>{fullUser?.telegramChatId || 'Not linked'}</span>
                  </div>
                ) : (
                  <div>
                    <input 
                      className="input" 
                      value={formData.telegramChatId} 
                      onChange={e => setFormData({...formData, telegramChatId: e.target.value})} 
                      placeholder="Enter your Telegram Chat ID (e.g. 123456789)"
                    />
                    <div style={{ marginTop: 8, padding: '10px 14px', borderRadius: 12, background: 'var(--bg-elevated)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
                      <div style={{ fontSize: 11.5, color: 'var(--text-dim)', lineHeight: 1.4 }}>
                        Find your ID via <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>@userinfobot <ExternalLink size={10} /></a> to receive all portal notifications on Telegram.
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 6, fontWeight: 600 }}>RESIDENTIAL ADDRESS</label>
                {!isEditing ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <MapPin size={16} color="var(--muted)" />
                    <span style={{ fontSize: 14 }}>{fullUser?.address || 'City Center, Corporate Hub'}</span>
                  </div>
                ) : (
                  <textarea 
                    className="input" 
                    rows={2}
                    value={formData.address} 
                    onChange={e => setFormData({...formData, address: e.target.value})} 
                    placeholder="Enter your full address..."
                    style={{ resize: 'none' }}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: isMobile ? 20 : 32 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Employment Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', gap: isMobile ? 16 : 24 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 6, fontWeight: 600 }}>EMPLOYEE ID</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Shield size={16} color="var(--muted)" />
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{fullUser?.id}</span>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 6, fontWeight: 600 }}>JOINING DATE</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Calendar size={16} color="var(--muted)" />
                  <span style={{ fontSize: 14 }}>{fullUser?.joiningDate || 'TBD'}</span>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 6, fontWeight: 600 }}>REPORTING MANAGER</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <User size={16} color="var(--muted)" />
                  <span style={{ fontSize: 14 }}>{fullUser?.manager || 'HR Admin'}</span>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 6, fontWeight: 600 }}>WORK MODE</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Building size={16} color="var(--muted)" />
                  <span style={{ fontSize: 14 }}>{fullUser?.workMode || 'Office'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 24 }}>
             <div className="card">
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Bell size={18} /> Notifications
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                   <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                      <span style={{ fontSize: 14 }}>Email Notifications</span>
                      <input type="checkbox" defaultChecked />
                   </label>
                   <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                      <span style={{ fontSize: 14 }}>Monthly Salary Alert</span>
                      <input type="checkbox" defaultChecked />
                   </label>
                   <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                      <span style={{ fontSize: 14 }}>Task Deadlines</span>
                      <input type="checkbox" defaultChecked />
                   </label>
                </div>
             </div>

             <div className="card">
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Lock size={18} /> Account Security
                </h3>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
                   Update your password regularly to keep your account secure.
                </p>
                <button className="btn btn-secondary btn-sm" onClick={handleChangePassword}>
                   Change Password
                </button>
             </div>
          </div>
        </div>
      </div>
      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />
    </div>
  )
}
