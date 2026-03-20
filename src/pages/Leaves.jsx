import { useState, useMemo } from 'react'
import { useScreenSize } from '../hooks/useScreenSize'
import { useData } from '../context/DataContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import StatCard from '../components/ui/StatCard'
import * as api from '../services/api'
import { useToast } from '../context/ToastContext'
import { 
  Search, 
  CalendarOff, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Filter, 
  Download, 
  Calendar,
  AlertCircle,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react'

const STATUS_COLORS = { pending: 'var(--amber)', approved: 'var(--green)', rejected: 'var(--red)' }

export default function Leaves() {
  const { isMobile } = useScreenSize()
  const { leaves, refresh, loading, error } = useData()
  const { showToast } = useToast()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const stats = useMemo(() => {
    const pending = leaves.filter(l => l.status?.toLowerCase() === 'pending').length
    const approved = leaves.filter(l => l.status?.toLowerCase() === 'approved').length
    
    // Active Today: start <= today <= end
    const today = new Date().toISOString().split('T')[0]
    const active = leaves.filter(l => 
      l.status?.toLowerCase() === 'approved' && 
      (l.startDate || l.date) <= today && 
      (l.endDate || l.date) >= today
    ).length

    return { pending, approved, active }
  }, [leaves])

  const handleAction = async (id, action) => {
    try {
      if (action === 'approve') {
        await api.approveLeave(id, { approvedBy: 'Admin' })
        showToast('Leave request approved', 'success')
      } else {
        await api.rejectLeave(id, { rejectedBy: 'Admin' })
        showToast('Leave request rejected', 'info')
      }
      refresh()
    } catch (err) {
      showToast('Operation failed', 'error')
    }
  }

  const filtered = leaves.filter(l => {
    const matchSearch = (l.empName || '').toLowerCase().includes(search.toLowerCase()) ||
                        (l.dept || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || (l.status || '').toLowerCase() === filterStatus
    return matchSearch && matchStatus
  })

  if (loading) return <LoadingSpinner />
  if (error) return <div className="empty-state">Error: {error}</div>

  return (
    <div className="animate-in" style={{ padding: isMobile ? '16px 12px' : '32px', maxWidth: 1600, margin: '0 auto' }}>
      {/* Executive Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 28 : 42, fontWeight: 900, letterSpacing: -1.5, margin: 0 }}>Absence Command</h1>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--muted)', marginTop: 4, letterSpacing: 0.5 }}>Strategic leave oversight and manpower planning</p>
        </div>
        {!isMobile && (
          <button className="btn-glass" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 14 }}>
            <Download size={16} /> Audit Export
          </button>
        )}
      </div>

      {/* Summary Stat Bar */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', 
        gap: 20, 
        marginBottom: 32 
      }}>
        <StatCard title="Pending Approvals" value={stats.pending} icon={Clock} color="var(--amber)" trend={[5, 8, 4, 10, 6, 7, stats.pending]} />
        <StatCard title="Approved Leaves" value={stats.approved} icon={CheckCircle} color="var(--green)" trend={[45, 48, 47, 50, 49, 52, stats.approved]} />
        <StatCard title="Away Today" value={stats.active} icon={Calendar} color="var(--accent)" trend={[2, 4, 3, 5, 2, 6, stats.active]} />
      </div>

      {/* Modern Management Toolbar */}
      <div className="card-glass" style={{ 
        padding: 12, 
        borderRadius: 20, 
        marginBottom: 24, 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        gap: 16,
        alignItems: 'center',
        background: 'rgba(255,255,255,0.4)',
        border: '1px solid rgba(255,255,255,0.5)'
      }}>
        <div className="search-bar" style={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 12, 
          padding: '10px 20px',
          background: 'rgba(255,255,255,0.6)',
          borderRadius: 14,
          width: isMobile ? '100% ' : 'auto'
        }}>
          <Search size={18} color="var(--accent)" />
          <input
            placeholder="Search by employee or department…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', fontSize: 14, fontWeight: 700, background: 'transparent', border: 'none', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, width: isMobile ? '100%' : 'auto', overflowX: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', color: 'var(--muted)', fontSize: 12, fontWeight: 900 }}>
            <Filter size={14} /> STATUS:
          </div>
          {['all', 'pending', 'approved', 'rejected'].map(st => (
            <button 
              key={st} 
              className={`btn-tag ${filterStatus === st ? 'active' : ''}`}
              onClick={() => setFilterStatus(st)}
              style={{ 
                whiteSpace: 'nowrap',
                padding: '8px 16px',
                borderRadius: 10,
                fontSize: 11,
                fontWeight: 800,
                background: filterStatus === st ? 'var(--accent)' : 'rgba(255,255,255,0.5)',
                color: filterStatus === st ? '#fff' : 'var(--text)',
                border: '1px solid rgba(255,255,255,0.8)'
              }}
            >
              {st.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="card-premium super-glass animate-in" style={{ padding: 0, borderRadius: 24, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ minWidth: 1000, borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>
                <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--muted)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>Personnel</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--muted)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>Date Range</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--muted)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>Duration</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--muted)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>Category</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--muted)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>Rationale</th>
                <th style={{ padding: '20px 24px', textAlign: 'center', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--muted)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>Status</th>
                <th style={{ padding: '20px 24px', textAlign: 'right', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--muted)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l, i) => {
                const status = l.status?.toLowerCase() || 'pending'
                const statusColor = STATUS_COLORS[status] || 'var(--muted)'
                const isPending = status === 'pending'

                return (
                  <tr key={i} className="row-hover" style={{ transition: 'all 0.2s' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontSize: 14, fontWeight: 800 }}>{l.empName}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>{l.dept}</div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 750 }}>
                        <span style={{ opacity: 0.8 }}>{l.startDate || l.date}</span>
                        <span style={{ opacity: 0.3 }}>→</span>
                        <span style={{ opacity: 0.8 }}>{l.endDate || l.date}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: 13, fontWeight: 800 }}>{l.duration || '1 day'}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span className="badge-glass" style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--text)', fontSize: 10, fontWeight: 900, padding: '4px 10px', borderRadius: 8 }}>{l.type?.toUpperCase()}</span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ maxWidth: 250, fontSize: 12, fontWeight: 600, color: 'var(--text)', opacity: 0.7, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={l.reason}>
                        {l.reason || '—'}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ 
                        margin: '0 auto',
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
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      {isPending ? (
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button 
                            className="btn-glass" 
                            onClick={() => handleAction(l.id, 'approve')}
                            style={{ padding: 8, borderRadius: 10, color: 'var(--green)', background: 'rgba(34,197,94,0.1)' }}
                            title="Approve Request"
                          >
                            <ThumbsUp size={16} />
                          </button>
                          <button 
                            className="btn-glass" 
                            onClick={() => handleAction(l.id, 'reject')}
                            style={{ padding: 8, borderRadius: 10, color: 'var(--red)', background: 'rgba(239,68,68,0.1)' }}
                            title="Reject Request"
                          >
                            <ThumbsDown size={16} />
                          </button>
                        </div>
                      ) : (
                         <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--muted)', paddingRight: 8 }}>
                           BY {l.approvedBy || l.rejectedBy || 'SYSTEM'}
                         </div>
                      )}
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: 64, textAlign: 'center' }}>
                    <CalendarOff size={48} color="var(--accent)" style={{ opacity: 0.1, marginBottom: 16 }} />
                    <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--muted)' }}>No absence requests found</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .row-hover:hover {
          background: rgba(var(--accent-rgb), 0.02) !important;
          transform: translateX(4px);
        }
        .btn-tag {
          transition: all 0.2s;
        }
        .btn-tag:hover:not(.active) {
          background: rgba(255,255,255,0.8) !important;
        }
        .badge-glass {
          border: 1px solid rgba(0,0,0,0.05);
        }
      `}</style>
    </div>
  )
}
