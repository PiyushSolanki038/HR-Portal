import { useState, useMemo } from 'react'
import { useScreenSize } from '../hooks/useScreenSize'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import StatCard from '../components/ui/StatCard'
import * as api from '../services/api'
import { 
  Check, 
  X, 
  Clock, 
  AlertTriangle, 
  User,
  ChevronRight,
  ShieldCheck,
  ThumbsUp,
  ThumbsDown,
  History as HistoryIcon,
  Search,
  CheckCircle2,
  XCircle,
  Calendar,
  Filter,
  ArrowRight
} from 'lucide-react'

export default function Approvals() {
  const { isMobile } = useScreenSize()
  const { leaves, loading, error, refresh } = useData()
  const { showToast } = useToast()
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [processingId, setProcessingId] = useState(null)
  const [activeTab, setActiveTab] = useState('pending') // 'pending' | 'history'
  const [searchQuery, setSearchQuery] = useState('')

  // Intelligence Layer: Derived Data
  const data = useMemo(() => {
    const all = leaves || []
    const pending = all.filter(l => l.status?.toLowerCase() === 'pending')
    const resolved = all.filter(l => l.status?.toLowerCase() !== 'pending')
    
    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
    
    // Urgent: Pending and starts today or tomorrow
    const urgent = pending.filter(l => (l.startDate || l.date) <= tomorrow).length
    
    // History Filtering
    const filteredHistory = resolved
      .filter(l => 
        l.empName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.dept?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.type?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => new Date(b.approvedAt || 0) - new Date(a.approvedAt || 0))

    return {
      pending: pending.length,
      urgent,
      resolved: resolved.length,
      pendingList: pending.sort((a, b) => new Date(a.startDate || a.date) - new Date(b.startDate || b.date)),
      historyList: filteredHistory
    }
  }, [leaves, searchQuery])

  const handleApprove = async (id) => {
    setProcessingId(id)
    try {
      await api.approveLeave(id, { approvedBy: 'HR Admin' })
      showToast('Strategic approval dispatched', 'success')
      refresh()
    } catch (err) {
      showToast('Approval sequence failed', 'error')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async () => {
    if (!rejectModal) return
    setProcessingId(rejectModal)
    try {
      await api.rejectLeave(rejectModal, { rejectedBy: 'HR Admin', reason: rejectReason })
      showToast('Request declined definitively', 'info')
      setRejectModal(null)
      setRejectReason('')
      refresh()
    } catch (err) {
      showToast('Rejection failed to process', 'error')
    } finally {
      setProcessingId(null)
    }
  }

  const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A'
    try {
      const date = new Date(isoString)
      return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(date)
    } catch (e) {
      return isoString
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <div className="p-6">Error: {error}</div>

  return (
    <div className="animate-in" style={{ padding: isMobile ? '16px 12px' : '32px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Executive Header */}
      <div style={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row', 
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'flex-start' : 'flex-end',
        marginBottom: 40,
        gap: 24
      }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 32 : 48, fontWeight: 900, letterSpacing: -2, margin: 0 }}>Decision Hub</h1>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--muted)', marginTop: 4, letterSpacing: 0.5 }}>Presence & absence adjudication center</p>
        </div>

        {/* Tab Switcher */}
        <div style={{ 
          display: 'flex', 
          background: 'rgba(0,0,0,0.05)', 
          padding: 6, 
          borderRadius: 18,
          gap: 4
        }}>
          <button 
            onClick={() => setActiveTab('pending')}
            style={{ 
              padding: '10px 20px', borderRadius: 14, border: 'none',
              background: activeTab === 'pending' ? '#fff' : 'transparent',
              color: activeTab === 'pending' ? 'var(--text)' : 'var(--muted)',
              fontWeight: 800, fontSize: 13, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: activeTab === 'pending' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Clock size={16} /> Pending
            <span style={{ 
              background: activeTab === 'pending' ? 'var(--accent)' : 'rgba(0,0,0,0.1)',
              color: activeTab === 'pending' ? '#fff' : 'inherit',
              padding: '2px 8px', borderRadius: 6, fontSize: 10
            }}>{data.pending}</span>
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            style={{ 
              padding: '10px 20px', borderRadius: 14, border: 'none',
              background: activeTab === 'history' ? '#fff' : 'transparent',
              color: activeTab === 'history' ? 'var(--text)' : 'var(--muted)',
              fontWeight: 800, fontSize: 13, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: activeTab === 'history' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <HistoryIcon size={16} /> History
          </button>
        </div>
      </div>

      {activeTab === 'pending' ? (
        <>
          {/* Executive Pulse */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', 
            gap: 20, 
            marginBottom: 40 
          }}>
            <StatCard title="Awaiting" value={data.pending} icon={Clock} color="var(--amber)" trend={[8, 12, 11, 4, 14, 10, data.pending]} />
            <StatCard title="Critical ( <24h )" value={data.urgent} icon={AlertTriangle} color="var(--red)" trend={[2, 4, 1, 3, 5, 2, data.urgent]} />
            <StatCard title="Resolved All-Time" value={data.resolved} icon={ShieldCheck} color="var(--green)" trend={[40, 45, 42, 48, 50, 55, data.resolved]} />
          </div>

          <div style={{ display: 'grid', gap: 20 }}>
            {data.pendingList.map((leave, i) => {
              const today = new Date().toISOString().split('T')[0]
              const isUrgent = (leave.startDate || leave.date) <= today
              const isDeduction = leave.deductionAmount && parseInt(leave.deductionAmount) > 0

              return (
                <div key={i} className={`card-premium super-glass ${isUrgent ? 'urgent-glow' : ''}`} style={{ 
                  padding: 0, borderRadius: 24, overflow: 'hidden',
                  border: isUrgent ? '2px solid var(--red)' : '1px solid rgba(255,255,255,0.5)',
                  transform: processingId === leave.id ? 'scale(0.98)' : 'none',
                  opacity: processingId === leave.id ? 0.7 : 1,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                  <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'stretch' }}>
                    <div style={{ padding: 24, flex: 1.2, borderRight: isMobile ? 'none' : '1px solid rgba(0,0,0,0.05)', background: isUrgent ? 'rgba(239, 68, 68, 0.03)' : 'transparent', display: 'flex', gap: 20 }}>
                      <div style={{ width: 56, height: 56, borderRadius: 18, background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(var(--accent-rgb), 0.2)' }}>
                        <User size={28} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>{leave.empName}</h3>
                        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>{leave.dept} • {leave.role || 'Team Member'}</div>
                        <div style={{ marginTop: 12, display: 'flex', gap: 8, padding: '6px 10px', background: 'rgba(0,0,0,0.04)', borderRadius: 10, width: 'fit-content' }}>
                           <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--muted)' }}>LVID: {leave.leaveNumber || 'UNK'}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ padding: 24, flex: 2, display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 2 }}>From</div>
                            <div style={{ fontSize: 13, fontWeight: 800 }}>{leave.startDate || leave.date}</div>
                          </div>
                          <ArrowRight size={14} style={{ opacity: 0.3 }} />
                          <div>
                            <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 2 }}>To</div>
                            <div style={{ fontSize: 13, fontWeight: 800 }}>{leave.endDate}</div>
                          </div>
                          <div style={{ marginLeft: 12, paddingLeft: 12, borderLeft: '1px solid rgba(0,0,0,0.1)' }}>
                            <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 2 }}>Net Cycle</div>
                            <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--accent)' }}>{leave.duration}</div>
                          </div>
                        </div>
                        <div style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.05)', fontSize: 10, fontWeight: 900 }}>{leave.type?.toUpperCase()}</div>
                      </div>
                      <div style={{ padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(0,0,0,0.02)', fontSize: 13, fontWeight: 600, color: 'var(--text)', opacity: 0.8 }}>
                        "{leave.reason}"
                      </div>
                    </div>

                    <div style={{ padding: isMobile ? 24 : 32, flex: 1, display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: 12, justifyContent: 'center', background: 'rgba(0,0,0,0.015)' }}>
                      {isDeduction && (
                         <div style={{ marginBottom: 4, padding: '8px 12px', borderRadius: 10, background: 'var(--red)', color: '#fff', textAlign: 'center' }}>
                            <div style={{ fontSize: 9, fontWeight: 900 }}>₹{leave.deductionAmount} PENALTY</div>
                         </div>
                      )}
                      <button className="btn" onClick={() => handleApprove(leave.id)} style={{ background: 'var(--green)', color: '#fff', fontWeight: 900, borderRadius: 14, padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 20px rgba(34,197,94,0.15)' }}>
                        <ThumbsUp size={16} /> Approve
                      </button>
                      <button className="btn-glass" onClick={() => setRejectModal(leave.id)} style={{ fontWeight: 800, borderRadius: 14, padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--red)', border: '1px solid rgba(239,68,68,0.1)' }}>
                        <ThumbsDown size={16} /> Decline
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
            {data.pending === 0 && (
              <div className="card-premium super-glass" style={{ padding: 80, textAlign: 'center', borderRadius: 32 }}>
                <ShieldCheck size={48} color="var(--green)" style={{ marginBottom: 20 }} />
                <h2 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>All Requests Adjudicated</h2>
                <p style={{ color: 'var(--muted)', fontWeight: 700, marginTop: 8 }}>The command center is stable. No pending task found.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        /* History View */
        <div className="animate-in">
          {/* History Search */}
          <div className="super-glass" style={{ 
            padding: 20, borderRadius: 24, marginBottom: 32, 
            display: 'flex', gap: 16, alignItems: 'center',
            border: '1px solid rgba(0,0,0,0.05)'
          }}>
            <Search size={20} color="var(--muted)" />
            <input 
              type="text" 
              placeholder="Search history by name, department or category…" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 16, fontWeight: 600 }}
            />
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            {data.historyList.map((leave, i) => {
              const isApproved = leave.status?.toLowerCase() === 'approved'
              return (
                <div key={i} className="super-glass" style={{ 
                  padding: 20, borderRadius: 20, display: 'flex', 
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  gap: 20, border: '1px solid rgba(0,0,0,0.03)'
                }}>
                  {/* Status Indicator */}
                  <div style={{ 
                    width: 48, height: 48, borderRadius: 14,
                    background: isApproved ? 'var(--green-dim)' : 'var(--red-dim)',
                    color: isApproved ? 'var(--green)' : 'var(--red)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {isApproved ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                  </div>

                  <div style={{ flex: 1.5 }}>
                    <div style={{ fontWeight: 900, fontSize: 16 }}>{leave.empName}</div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', marginTop: 2 }}>{leave.dept} • {leave.type}</div>
                  </div>

                  <div style={{ flex: 1, color: 'var(--muted)' }}>
                    <div style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase' }}>Resolution Period</div>
                    <div style={{ fontSize: 12, fontWeight: 700, marginTop: 2 }}>{leave.startDate} → {leave.endDate}</div>
                  </div>

                  <div style={{ flex: 1.5, padding: '8px 16px', borderRadius: 12, background: 'rgba(0,0,0,0.02)' }}>
                    <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--muted)', textTransform: 'uppercase' }}>Audit Payload</div>
                    <div style={{ fontSize: 12, fontWeight: 800, marginTop: 2 }}>
                      {isApproved ? (
                        <span style={{ color: 'var(--green)' }}>Adjudicated by {leave.approvedBy || 'Admin'}</span>
                      ) : (
                        <span style={{ color: 'var(--red)' }}>Declined: {leave.approvedBy || 'Admin'}</span>
                      )}
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 700, marginTop: 2, opacity: 0.6 }}>
                      Resolved on {formatDateTime(leave.approvedAt)}
                    </div>
                  </div>
                  
                  {!isApproved && leave.reason && (
                    <div style={{ 
                      flex: 1.2, fontSize: 11, fontWeight: 600, fontStyle: 'italic', 
                      color: 'var(--muted)', borderLeft: '2px solid var(--red-dim)', paddingLeft: 12 
                    }}>
                      Reason: "{leave.reason}"
                    </div>
                  )}
                </div>
              )
            })}
            
            {data.historyList.length === 0 && (
              <div style={{ padding: 60, textAlign: 'center', opacity: 0.4 }}>
                <Filter size={40} style={{ marginBottom: 16 }} />
                <p style={{ fontWeight: 800 }}>No matching audit records found.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Premium Rejection Drawer */}
      {rejectModal && (
        <div className="modal-overlay" onClick={() => setRejectModal(null)} style={{ backdropFilter: 'blur(8px)', zIndex: 1000 }}>
          <div className="modal-drawer super-glass animate-in" onClick={e => e.stopPropagation()} style={{ 
            maxWidth: 480, borderRadius: 28, padding: 32, 
            background: '#fff', border: '1px solid rgba(0,0,0,0.1)',
            boxShadow: '0 32px 64px rgba(0,0,0,0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: -1, margin: 0 }}>Decline Request</h2>
                <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--red)', marginTop: 4 }}>REJECTION PROTOCOL ACTIVATED</div>
              </div>
              <button className="btn-icon" onClick={() => setRejectModal(null)} style={{ background: 'rgba(0,0,0,0.05)', borderRadius: 14 }}>×</button>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>Strategic Rationale</label>
              <textarea placeholder="Briefly state why this request is being declined…" style={{ width: '100%', minHeight: 120, padding: 20, borderRadius: 20, background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', fontSize: 14, fontWeight: 600, outline: 'none', resize: 'none' }} value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <button className="btn-glass" style={{ flex: 1, padding: 16, borderRadius: 16, fontWeight: 800 }} onClick={() => setRejectModal(null)}>Cancel</button>
              <button className="btn" style={{ flex: 1.5, padding: 16, borderRadius: 16, fontWeight: 900, background: 'var(--red)', color: '#fff', boxShadow: '0 8px 20px rgba(239,68,68,0.2)' }} onClick={handleReject} disabled={processingId === rejectModal}>Confirm Decline</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse-red {
          0% { border-color: rgba(239,68,68, 0.4); box-shadow: 0 0 0 0 rgba(239,68,68, 0.1); }
          70% { border-color: rgba(239,68,68, 1); box-shadow: 0 0 0 10px rgba(239,68,68, 0); }
          100% { border-color: rgba(239,68,68, 0.4); box-shadow: 0 0 0 0 rgba(239,68,68, 0); }
        }
        .urgent-glow { animation: pulse-red 2s infinite; }
      `}</style>
    </div>
  )
}
