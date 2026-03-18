import { useState, useEffect } from 'react'
import { useScreenSize } from '../hooks/useScreenSize'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
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
  Stethoscope
} from 'lucide-react'

const LEAVE_TYPES = [
  { id: 'casual', label: 'Casual Leave', icon: Briefcase, color: 'var(--amber)' },
  { id: 'sick', label: 'Sick Leave', icon: Stethoscope, color: 'var(--red)' },
  { id: 'earned', label: 'Earned Leave', icon: CheckCircle, color: 'var(--green)' },
]

export default function MyLeaves() {
  const { isMobile, isTablet, isDesktop } = useScreenSize()
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

  if (loading) return <LoadingSpinner />
  if (error) return <div className="p-6">Error: {error}</div>

  const myLeaves = leaves.filter(l => l.empId === user?.id)
  
  // Calculate balances using real data
  const quota = parseInt(user?.leavesQuota) || 12 // Default 12 if not set
  const approvedCount = myLeaves.filter(l => l.status?.toLowerCase() === 'approved').length
  const pendingCount = myLeaves.filter(l => l.status?.toLowerCase() === 'pending').length
  
  const stats = {
    total: quota,
    used: approvedCount,
    pending: pendingCount,
    available: Math.max(0, quota - approvedCount)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.startDate || !formData.endDate || !formData.reason) {
      showToast('Please fill all fields', 'error')
      return
    }

    setSubmitting(true)
    try {
      await api.applyLeave({
        empId: user.id,
        empName: user.name,
        dept: user.dept,
        ...formData
      })
      showToast('Leave application submitted successfully', 'success')
      setShowApplyModal(false)
      setFormData({ type: 'casual', startDate: '', endDate: '', reason: '' })
      refresh() // Trigger global data refresh
    } catch (err) {
      showToast(err.message || 'Failed to submit application', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'badge-green'
      case 'rejected': return 'badge-red'
      default: return 'badge-amber'
    }
  }

  return (
    <div className="animate-in" style={{ padding: isMobile ? 12 : 28, maxWidth: '100%', overflowX: 'hidden' }}>
      <div className="page-header" style={{ flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? 16 : 24, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 24 : 32, fontWeight: 800 }}>My Leaves</h1>
          <p className="subtitle" style={{ fontSize: isMobile ? 12 : 14 }}>Manage leave balances and applications.</p>
        </div>
        <button className="btn btn-primary" style={{ width: isMobile ? '100%' : 'auto', justifyContent: 'center' }} onClick={() => setShowApplyModal(true)}>
          <Plus size={16} /> Apply for Leave
        </button>
      </div>

      <div className="stats-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', 
        gap: 16, 
        marginBottom: 32 
      }}>
        {[
          { label: 'Available', value: stats.available, icon: CheckCircle, color: 'var(--green)', bg: 'var(--green-dim)' },
          { label: 'Used', value: stats.used, icon: Briefcase, color: 'var(--blue)', bg: 'var(--blue-dim)' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'var(--amber)', bg: 'var(--amber-dim)' },
          { label: 'Total Quota', value: stats.total, icon: CalendarDays, color: 'var(--purple)', bg: 'var(--purple-dim)' },
        ].map((stat, i) => (
          <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
             <div style={{ width: 40, height: 40, borderRadius: 10, background: stat.bg, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <stat.icon size={20} />
             </div>
             <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{stat.label}</div>
                <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-mono)', marginTop: 2 }}>{stat.value}</div>
             </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="card-header" style={{ padding: '16px 20px', borderBottom: 'var(--border)', background: 'var(--bg-elevated)' }}>
           <h3 style={{ fontSize: 16, fontWeight: 700 }}>Leave History</h3>
        </div>
        <div className="table-container" style={{ border: 'none', borderRadius: 0, overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
          <table style={{ minWidth: 600 }}> cotton
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>Starting</th>
                <th>Ending</th>
                <th>Duration</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {myLeaves.map((leave, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                       <div style={{ width: 8, height: 8, borderRadius: '50%', background: LEAVE_TYPES.find(t => t.id === leave.type?.toLowerCase())?.color || 'var(--muted)' }}></div>
                       {leave.type}
                    </div>
                  </td>
                  <td>{leave.startDate}</td>
                  <td>{leave.endDate}</td>
                  <td>{leave.duration || '1 day'}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-dim)' }}>
                    {leave.reason}
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(leave.status)}`}>{leave.status}</span>
                  </td>
                </tr>
              ))}
              {myLeaves.length === 0 && (
                <tr><td colSpan={6} className="empty-state">No leave applications found</td></tr>
              )}
            </tbody>
          </table>
      </div>

      {showApplyModal && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.4)', display: 'flex', 
          alignItems: isMobile ? 'flex-end' : 'center', 
          justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' 
        }} onClick={() => setShowApplyModal(false)}>
           <div className="card" onClick={e => e.stopPropagation()} style={{ 
             maxWidth: isMobile ? '100%' : 500, 
             width: isMobile ? '100%' : '90%',
             borderRadius: isMobile ? '24px 24px 0 0' : '24px',
             padding: isMobile ? '20px' : '32px',
             maxHeight: isMobile ? '90vh' : 'auto',
             overflowY: 'auto'
           }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                 <h2 style={{ fontSize: 20, fontWeight: 700 }}>Apply for Leave</h2>
                 <button className="btn-icon btn-sm" onClick={() => setShowApplyModal(false)}>×</button>
              </div>

              <form onSubmit={handleSubmit}>
                 <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: 13, color: 'var(--text-dim)', marginBottom: 8 }}>Leave Type</label>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 10 }}>
                       {LEAVE_TYPES.map(type => (
                         <div 
                           key={type.id}
                           onClick={() => setFormData({ ...formData, type: type.id })}
                           style={{ 
                             padding: 12, borderRadius: 8, border: `1px solid ${formData.type === type.id ? type.color : 'var(--line)'}`,
                             background: formData.type === type.id ? `${type.color}10` : 'transparent',
                             cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                             display: 'flex', flexDirection: isMobile ? 'row' : 'column', alignItems: 'center', justifyContent: isMobile ? 'flex-start' : 'center', gap: isMobile ? 12 : 6
                           }}
                         >
                            <type.icon size={18} color={formData.type === type.id ? type.color : 'var(--muted)'} style={{ margin: isMobile ? '0' : '0 auto 6px' }} />
                            <div style={{ fontSize: 12, fontWeight: 700, color: formData.type === type.id ? type.color : 'var(--muted)' }}>{type.label}</div>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16, marginBottom: 20 }}>
                    <div>
                       <label style={{ display: 'block', fontSize: 13, color: 'var(--text-dim)', marginBottom: 8 }}>Start Date</label>
                       <input 
                         type="date" 
                         className="input" 
                         value={formData.startDate}
                         onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                         style={{ fontSize: 16, width: '100%' }}
                       />
                    </div>
                    <div>
                       <label style={{ display: 'block', fontSize: 13, color: 'var(--text-dim)', marginBottom: 8 }}>End Date</label>
                       <input 
                         type="date" 
                         className="input" 
                         value={formData.endDate}
                         onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                         style={{ fontSize: 16, width: '100%' }}
                       />
                    </div>
                 </div>

                 <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', fontSize: 13, color: 'var(--text-dim)', marginBottom: 8 }}>Reason for Leave</label>
                    <textarea 
                      className="input" 
                      placeholder="e.g. Family event, medical checkup, etc." 
                      style={{ minHeight: 100, fontSize: 16, width: '100%', padding: 12, borderRadius: 12 }}
                      value={formData.reason}
                      onChange={e => setFormData({ ...formData, reason: e.target.value })}
                    />
                 </div>

                 <div style={{ display: 'flex', gap: 12, flexDirection: isMobile ? 'column-reverse' : 'row' }}>
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      style={{ flex: 1, justifyContent: 'center' }}
                      onClick={() => setShowApplyModal(false)}
                    >
                       Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      style={{ flex: 1, justifyContent: 'center' }}
                      disabled={submitting}
                    >
                       {submitting ? 'Submitting...' : 'Submit Application'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  )
}
