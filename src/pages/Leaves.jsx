import { useState } from 'react'
import { useScreenSize } from '../hooks/useScreenSize'
import { useData } from '../context/DataContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { Search, CalendarOff } from 'lucide-react'

const STATUS_BADGES = { pending: 'badge-amber', approved: 'badge-green', rejected: 'badge-red' }

export default function Leaves() {
  const { isMobile, isTablet, isDesktop } = useScreenSize()
  const { leaves, loading, error } = useData()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  if (loading) return <LoadingSpinner />
  if (error) return <div className="empty-state">Error: {error}</div>

  const filtered = leaves.filter(l => {
    const matchSearch = (l.empName || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || (l.status || '').toLowerCase() === filterStatus
    return matchSearch && matchStatus
  })

  return (
    <div className="animate-in" style={{ padding: isMobile ? 12 : 28, maxWidth: '100%', overflowX: 'hidden' }}>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 24 : 32, fontWeight: 800 }}>Leaves</h1>
          <p className="subtitle" style={{ fontSize: isMobile ? 12 : 14 }}>All leave requests across the organization</p>
        </div>
      </div>

      <div className="filter-bar" style={{ 
        flexDirection: isMobile ? 'column' : 'row', 
        alignItems: isMobile ? 'stretch' : 'center',
        padding: isMobile ? 12 : 16,
        marginBottom: 24,
        gap: 12
      }}>
        <div className="search-bar" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Search size={16} className="search-icon" style={{ minWidth: 16 }} />
          <input 
            placeholder="Search by employeeâ€¦" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            style={{ width: '100%', fontSize: 16, background: 'transparent', border: 'none', outline: 'none' }} 
          />
        </div>
        <select 
          value={filterStatus} 
          onChange={e => setFilterStatus(e.target.value)} 
          style={{ width: isMobile ? '100%' : 'auto', fontSize: 16, border: isMobile ? '1px solid var(--line)' : 'none', borderRadius: isMobile ? 10 : 0, padding: isMobile ? 10 : 0, fontWeight: 700 }}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="table-container" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', borderRadius: 16 }}>
        <table style={{ minWidth: 800 }}>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Duration</th>
              <th>Type</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Approved By</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l, i) => {
              const statusKey = l.status?.toLowerCase() || 'pending'
              return (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{l.empName || 'â€”'}</td>
                  <td style={{ color: 'var(--muted)' }}>{l.dept || 'â€”'}</td>
                  <td>{l.startDate || l.date || 'â€”'}</td>
                  <td>{l.endDate || l.date || 'â€”'}</td>
                  <td>{l.duration || '1 day'}</td>
                  <td><span className="badge badge-blue">{l.type || 'casual'}</span></td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-dim)' }}>{l.reason || 'â€”'}</td>
                  <td>
                    <span className={`badge ${STATUS_BADGES[statusKey] || 'badge-muted'}`}>
                      {statusKey.charAt(0).toUpperCase() + statusKey.slice(1)}
                    </span>
                  </td>
                  <td style={{ color: 'var(--muted)' }}>{l.approvedBy || 'â€”'}</td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9}>
                  <div className="empty-state">
                    <CalendarOff size={40} />
                    <h3>No leaves found</h3>
                    <p>No leave requests match your filters</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
