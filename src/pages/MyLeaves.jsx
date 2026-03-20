import { useState, useMemo } from 'react'
import { useScreenSize } from '../hooks/useScreenSize'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import StatCard from '../components/ui/StatCard'
import * as api from '../services/api'
import { 
  Calendar, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Info,
  CalendarDays,
  Briefcase,
  Stethoscope,
  Download,
  AlertCircle
} from 'lucide-react'

const LEAVE_TYPES = [
  { id: 'casual', label: 'Casual Leave', icon: Briefcase, color: 'var(--amber)' },
  { id: 'sick', label: 'Sick Leave', icon: Stethoscope, color: 'var(--red)' },
  { id: 'earned', label: 'Earned Leave', icon: CheckCircle, color: 'var(--green)' },
]

export default function MyLeaves() {
  const { isMobile } = useScreenSize()
  const { user } = useAuth()
  const { leaves, refresh, loading, error } = useData()
  const { showToast } = useToast()
  
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [formData, setFormData] = useState({
    type: 'casual',
    startDate: '',
    endDate: '',
    reason: ''
  })
  const [submitting, setSubmitting] = useState(false)

  // Memoized stats calculation
  const stats = useMemo(() => {
    const myLeaves = leaves.filter(l => l.empId === user?.id)
    const quota = parseInt(user?.leavesQuota) || 12
    const approvedCount = myLeaves.filter(l => l.status?.toLowerCase() === 'approved').length
    const pendingCount = myLeaves.filter(l => l.status?.toLowerCase() === 'pending').length
    
    return {
      total: quota,
      used: approvedCount,
      pending: pendingCount,
      available: Math.max(0, quota - approvedCount),
      history: myLeaves.sort((a, b) => new Date(b.startDate || b.date) - new Date(a.startDate || a.date))
    }
  }, [leaves, user])

  if (loading) return <LoadingSpinner />
  if (error) return <div className="p-6">Error: {error}</div>

  const calculateDuration = (start, end) => {
    if (!start || !end) return 0
    const s = new Date(start)
    const e = new Date(end)
    const diffTime = e - s
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays > 0 ? diffDays : 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.startDate || !formData.endDate || !formData.reason) {
      showToast('Please fill all fields', 'error')
      return
    }

    const durationNum = calculateDuration(formData.startDate, formData.endDate)
    if (durationNum <= 0) {
      showToast('End date must be after start date', 'error')
      return
    }

    setSubmitting(true)
    try {
      await api.applyLeave({
        empId: user.id,
        empName: user.name,
        dept: user.dept,
        ...formData,
        duration: `${durationNum} day${durationNum > 1 ? 's' : ''}`
      })
      showToast('Leave application submitted successfully', 'success')
      setShowApplyModal(false)
      setFormData({ type: 'casual', startDate: '', endDate: '', reason: '' })
      refresh()
    } catch (err) {
      showToast(err.message || 'Failed to submit application', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="animate-in" style={{ padding: isMobile ? '16px 12px' : '32px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Premium Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 32 : 48, fontWeight: 900, letterSpacing: -2, margin: 0 }}>My Time Off</h1>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--muted)', marginTop: 4, letterSpacing: 0.5 }}>Manage your leave cycles and track balances</p>
        </div>
        {!isMobile && (
          <button className="btn-glass" onClick={() => setShowApplyModal(true)} style={{ 
            display: 'flex', alignItems: 'center', gap: 10, 
            padding: '12px 24px', borderRadius: 14, 
            background: 'var(--accent)', color: '#fff',
            boxShadow: '0 8px 24px rgba(var(--accent-rgb), 0.3)'
          }}>
            <Plus size={18} strokeWidth={3} /> Apply for Leave
          </button>
        )}
      </div>

      {/* Leave Balance Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', 
        gap: 20, 
        marginBottom: 40 
      }}>
        <StatCard title="Available Quota" value={stats.available} icon={CheckCircle} color="var(--green)" trend={[12, 11, 11, 10, 10, 9, stats.available]} />
        <StatCard title="Total Days Used" value={stats.used} icon={Briefcase} color="var(--blue)" trend={[0, 1, 1, 2, 2, 3, stats.used]} />
        <StatCard title="Pending Review" value={stats.pending} icon={Clock} color="var(--amber)" trend={[0, 1, 0, 1, 0, 1, stats.pending]} />
        <StatCard title="Annual Limit" value={stats.total} icon={CalendarDays} color="var(--purple)" trend={[12, 12, 12, 12, 12, 12, stats.total]} />
      </div>

      {isMobile && (
        <button className="btn" onClick={() => setShowApplyModal(true)} style={{ 
          width: '100%', padding: '16px', borderRadius: 16, marginBottom: 32,
          background: 'var(--accent)', color: '#fff', fontWeight: 900
        }}>
          Apply for New Leave
        </button>
      )}

      {/* History Table */}
      <div className="card-premium super-glass" style={{ padding: 0, borderRadius: 24, overflow: 'hidden' }}>
        <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, letterSpacing: -0.5 }}>Leave History</h3>
          <Download size={18} color="var(--muted)" style={{ cursor: 'pointer' }} />
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ minWidth: 800, borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>
                <th style={{ padding: '16px 32px', textAlign: 'left', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--muted)' }}>Type</th>
                <th style={{ padding: '16px 32px', textAlign: 'left', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--muted)' }}>Duration</th>
                <th style={{ padding: '16px 32px', textAlign: 'left', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--muted)' }}>Start Date</th>
                <th style={{ padding: '16px 32px', textAlign: 'left', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--muted)' }}>End Date</th>
                <th style={{ padding: '16px 32px', textAlign: 'left', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--muted)' }}>Status</th>
                <th style={{ padding: '16px 32px', textAlign: 'left', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--muted)' }}>Reason</th>
              </tr>
            </thead>
            <tbody>
              {stats.history.map((leave, i) => {
                const typeInfo = LEAVE_TYPES.find(t => t.id === leave.type?.toLowerCase())
                const status = leave.status?.toLowerCase() || 'pending'
                const statusColor = status === 'approved' ? 'var(--green)' : status === 'rejected' ? 'var(--red)' : 'var(--amber)'

                return (
                  <tr key={i} className="row-hover">
                    <td style={{ padding: '16px 32px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ 
                          width: 32, height: 32, borderRadius: 10, 
                          background: `${typeInfo?.color || 'var(--muted)'}15`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: typeInfo?.color || 'var(--muted)'
                        }}>
                          {typeInfo ? <typeInfo.icon size={16} /> : <Calendar size={16} />}
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 800 }}>{leave.type}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 32px', fontSize: 13, fontWeight: 700 }}>{leave.duration || '1 day'}</td>
                    <td style={{ padding: '16px 32px', fontSize: 13, fontWeight: 700, opacity: 0.8 }}>{leave.startDate || leave.date}</td>
                    <td style={{ padding: '16px 32px', fontSize: 13, fontWeight: 700, opacity: 0.8 }}>{leave.endDate || leave.date}</td>
                    <td style={{ padding: '16px 32px' }}>
                      <div style={{ 
                        display: 'flex', alignItems: 'center', gap: 8, 
                        padding: '6px 12px', borderRadius: 10, 
                        background: `${statusColor}15`,
                        width: 'fit-content',
                        border: `1px solid ${statusColor}25`
                      }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor, boxShadow: `0 0 8px ${statusColor}` }} />
                        <span style={{ fontSize: 10, fontWeight: 900, color: statusColor, textTransform: 'uppercase' }}>{status}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 32px' }}>
                      <div style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 12, fontWeight: 600, opacity: 0.6 }} title={leave.reason}>
                        {leave.reason}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {stats.history.length === 0 && (
                <tr><td colSpan={6} style={{ padding: 64, textAlign: 'center', color: 'var(--muted)', fontWeight: 800 }}>LEGENDARY: NO LEAVES LOGGED YET</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Application Drawer (Modal) */}
      {showApplyModal && (
        <div className="modal-overlay" onClick={() => setShowApplyModal(false)} style={{ backdropFilter: 'blur(8px)', zIndex: 1000 }}>
          <div className="modal-drawer super-glass animate-in" onClick={e => e.stopPropagation()} style={{ 
            maxWidth: 540, borderRadius: 28, padding: 32, 
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
            boxShadow: '0 32px 64px rgba(0,0,0,0.15)',
            border: '1px solid rgba(255,255,255,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <div>
                <h2 style={{ fontSize: 28, fontWeight: 900, letterSpacing: -1, margin: 0 }}>Request Absence</h2>
                <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--accent)', marginTop: 4 }}>PLAN YOUR CYCLE STRATEGICALLY</div>
              </div>
              <button className="btn-icon" onClick={() => setShowApplyModal(false)} style={{ background: 'rgba(0,0,0,0.05)', borderRadius: 14 }}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--muted)', marginBottom: 12 }}>Leave Category</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {LEAVE_TYPES.map(type => (
                    <div 
                      key={type.id}
                      onClick={() => setFormData({ ...formData, type: type.id })}
                      style={{ 
                        padding: '16px 8px', borderRadius: 16, border: `2px solid ${formData.type === type.id ? type.color : 'transparent'}`,
                        background: formData.type === type.id ? `${type.color}15` : 'rgba(0,0,0,0.03)',
                        cursor: 'pointer', textAlign: 'center', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                        transform: formData.type === type.id ? 'translateY(-4px)' : 'none',
                        boxShadow: formData.type === type.id ? `0 8px 16px ${type.color}20` : 'none'
                      }}
                    >
                      <type.icon size={24} color={formData.type === type.id ? type.color : 'var(--muted)'} />
                      <div style={{ fontSize: 10, fontWeight: 900, color: formData.type === type.id ? type.color : 'var(--muted)', textTransform: 'uppercase' }}>{type.label.split(' ')[0]}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                <div className="input-group">
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--muted)', marginBottom: 8 }}>Activation Date</label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                    <input 
                      type="date" 
                      className="input-premium" 
                      value={formData.startDate}
                      onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                      style={{ width: '100%', paddingLeft: 40, background: 'rgba(255,255,255,0.5)', borderRadius: 14, height: 48, fontSize: 14, fontWeight: 700, border: '1px solid rgba(0,0,0,0.1)' }}
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--muted)', marginBottom: 8 }}>Conclusion Date</label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                    <input 
                      type="date" 
                      className="input-premium" 
                      value={formData.endDate}
                      onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                      style={{ width: '100%', paddingLeft: 40, background: 'rgba(255,255,255,0.5)', borderRadius: 14, height: 48, fontSize: 14, fontWeight: 700, border: '1px solid rgba(0,0,0,0.1)' }}
                    />
                  </div>
                </div>
              </div>

              {formData.startDate && formData.endDate && (
                <div style={{ 
                  marginBottom: 24, padding: '12px 20px', borderRadius: 12, 
                  background: 'var(--accent)', color: '#fff', fontSize: 12, fontWeight: 900,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  boxShadow: '0 8px 16px rgba(var(--accent-rgb), 0.2)'
                }}>
                  <span>TOTAL ESTIMATED DURATION:</span>
                  <span style={{ fontSize: 16 }}>{calculateDuration(formData.startDate, formData.endDate)} DAYS</span>
                </div>
              )}

              <div style={{ marginBottom: 32 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--muted)', marginBottom: 8 }}>Strategic Rationale</label>
                <textarea 
                  className="input-premium" 
                  placeholder="Provide brief context for this absence request..." 
                  style={{ minHeight: 100, width: '100%', padding: 16, borderRadius: 18, fontSize: 14, fontWeight: 600, background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0,0,0,0.1)', resize: 'none' }}
                  value={formData.reason}
                  onChange={e => setFormData({ ...formData, reason: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                <button 
                  type="button" 
                  className="btn-glass" 
                  style={{ flex: 1, padding: 16, borderRadius: 16, fontWeight: 800 }}
                  onClick={() => setShowApplyModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn" 
                  style={{ 
                    flex: 1.5, padding: 16, borderRadius: 16, fontWeight: 900, 
                    background: 'var(--accent)', color: '#fff',
                    boxShadow: '0 8px 20px rgba(var(--accent-rgb), 0.3)'
                  }}
                  disabled={submitting}
                >
                  {submitting ? 'PROCESSING...' : 'DISPATCH REQUEST'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .row-hover:hover {
          background: rgba(var(--accent-rgb), 0.02) !important;
          transform: translateX(4px);
          transition: all 0.2s;
        }
        .input-premium:focus {
          border-color: var(--accent) !important;
          box-shadow: 0 0 0 4px rgba(var(--accent-rgb), 0.1);
          outline: none;
        }
      `}</style>
    </div>
  )
}
