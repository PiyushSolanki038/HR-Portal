import { useState } from 'react'
import { useScreenSize } from '../hooks/useScreenSize'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Modal from '../components/ui/Modal'
import * as api from '../services/api'
import { Check, X, Clock } from 'lucide-react'

export default function Approvals() {
  const { isMobile, isTablet, isDesktop } = useScreenSize()
  const { leaves, loading, error, refresh } = useData()
  const { showToast } = useToast()
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  if (loading) return <LoadingSpinner />
  if (error) return <div className="empty-state">Error: {error}</div>

  const pending = leaves.filter(l => l.status?.toLowerCase() === 'pending')

  const handleApprove = async (id) => {
    try {
      await api.approveLeave(id, { approvedBy: 'HR Admin' })
      showToast('Leave approved successfully', 'success')
      refresh()
    } catch (err) {
      showToast('Failed to approve leave', 'error')
    }
  }

  const handleReject = async () => {
    if (!rejectModal) return
    try {
      await api.rejectLeave(rejectModal, { rejectedBy: 'HR Admin', reason: rejectReason })
      showToast('Leave rejected', 'success')
      setRejectModal(null)
      setRejectReason('')
      refresh()
    } catch (err) {
      showToast('Failed to reject leave', 'error')
    }
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1>Approvals</h1>
          <p className="subtitle">{pending.length} pending approval{pending.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {pending.length === 0 ? (
        <div className="empty-state">
          <Check size={48} />
          <h3>All caught up!</h3>
          <p>No pending approvals at the moment</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {pending.map((leave, i) => (
            <div key={i} className="card" style={{ 
              display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', 
              justifyContent: 'space-between', gap: 16, 
              flexDirection: isMobile ? 'column' : 'row' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
                <div className="avatar" style={{ background: 'var(--amber-dim)', color: 'var(--amber)' }}>
                  <Clock size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{leave.empName}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {leave.dept} • {leave.startDate || leave.date || '—'} • {leave.type || 'Casual Leave'}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 4 }}>
                    {leave.reason}
                  </div>
                  {leave.deductionAmount && parseInt(leave.deductionAmount) > 0 && (
                    <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 4 }}>
                      ₹{leave.deductionAmount} deduction applies (Leave #{leave.leaveNumber})
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, width: isMobile ? '100%' : 'auto' }}>
                <button className="btn btn-success btn-sm" style={{ flex: isMobile ? 1 : 'none', justifyContent: 'center' }} onClick={() => handleApprove(leave.id)}>
                  <Check size={14} /> Approve
                </button>
                <button className="btn btn-danger btn-sm" style={{ flex: isMobile ? 1 : 'none', justifyContent: 'center' }} onClick={() => setRejectModal(leave.id)}>
                  <X size={14} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {rejectModal && (
        <Modal
          title="Reject Leave"
          onClose={() => { setRejectModal(null); setRejectReason('') }}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => { setRejectModal(null); setRejectReason('') }}>Cancel</button>
              <button className="btn btn-danger" onClick={handleReject}>Reject Leave</button>
            </>
          }
        >
          <div className="form-group">
            <label>Reason for Rejection (Optional)</label>
            <textarea
              placeholder="Provide a reason…"
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
        </Modal>
      )}
    </div>
  )
}
