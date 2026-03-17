import { useState } from 'react'
import { useData } from '../context/DataContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { Search, CalendarOff } from 'lucide-react'

const STATUS_BADGES = { pending: 'badge-amber', approved: 'badge-green', rejected: 'badge-red' }

export default function Leaves() {
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
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1>Leaves</h1>
          <p className="subtitle">All leave requests across the organization</p>
        </div>
      </div>

      <div className="filter-bar" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        <div className="search-bar" style={{ maxWidth: '100%' }}>
          <Search size={16} className="search-icon" />
          <input placeholder="Search by employee…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%' }} />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ maxWidth: '100%' }}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="table-container">
        <table>
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
                  <td style={{ fontWeight: 500 }}>{l.empName || '—'}</td>
                  <td style={{ color: 'var(--muted)' }}>{l.dept || '—'}</td>
                  <td>{l.startDate || l.date || '—'}</td>
                  <td>{l.endDate || l.date || '—'}</td>
                  <td>{l.duration || '1 day'}</td>
                  <td><span className="badge badge-blue">{l.type || 'casual'}</span></td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-dim)' }}>{l.reason || '—'}</td>
                  <td>
                    <span className={`badge ${STATUS_BADGES[statusKey] || 'badge-muted'}`}>
                      {statusKey.charAt(0).toUpperCase() + statusKey.slice(1)}
                    </span>
                  </td>
                  <td style={{ color: 'var(--muted)' }}>{l.approvedBy || '—'}</td>
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
