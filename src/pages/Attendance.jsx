import { useState, useEffect } from 'react'
import { useData } from '../context/DataContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import * as api from '../services/api'
import { Clock, Search } from 'lucide-react'

const STATUS_LABELS = { p: 'Present', l: 'Late', a: 'Absent', x: 'Leave' }
const STATUS_BADGES = { p: 'badge-green', l: 'badge-amber', a: 'badge-red', x: 'badge-blue' }

export default function Attendance() {
  const { attendance, employees, loading, error } = useData()
  const [weeklyGrid, setWeeklyGrid] = useState([])
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('today')

  useEffect(() => {
    api.getWeeklyGrid().then(setWeeklyGrid).catch(() => {})
  }, [])

  if (loading) return <LoadingSpinner />
  if (error) return <div className="empty-state">Error: {error}</div>

  const filtered = attendance.filter(a =>
    (a.empName || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.dept || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1>Attendance</h1>
          <p className="subtitle">Track daily attendance and work reports</p>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'today' ? 'active' : ''}`} onClick={() => setTab('today')}>Today</button>
        <button className={`tab ${tab === 'weekly' ? 'active' : ''}`} onClick={() => setTab('weekly')}>Weekly Grid</button>
      </div>

      {tab === 'today' && (
        <>
          <div className="filter-bar" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
            <div className="search-bar" style={{ maxWidth: '100%' }}>
              <Search size={16} className="search-icon" />
              <input placeholder="Search by name or department…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%' }} />
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Work Report</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((rec, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar avatar-sm" style={{ background: employees.find(e => e.id === rec.empId)?.color || 'var(--accent)' }}>
                          {(rec.empName || '').split(' ').map(w => w[0]).join('').slice(0,2)}
                        </div>
                        {rec.empName}
                      </div>
                    </td>
                    <td style={{ color: 'var(--muted)' }}>{rec.dept}</td>
                    <td><Clock size={14} style={{ marginRight: 4, verticalAlign: 'middle', opacity: 0.5 }} />{rec.time}</td>
                    <td><span className={`badge ${STATUS_BADGES[rec.status] || 'badge-muted'}`}>{STATUS_LABELS[rec.status] || rec.status}</span></td>
                    <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-dim)' }}>{rec.report}</td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={5} className="empty-state">No records found</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'weekly' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Last 5 Working Days</h3>
          {weeklyGrid.length > 0 && (
            <div className="table-container">
              <div className="weekly-grid">
                <div className="grid-row" style={{ marginBottom: 4 }}>
                  <div className="grid-name" style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 600 }}>EMPLOYEE</div>
                  {weeklyGrid[0]?.dates?.map((d, i) => (
                    <div key={i} className="grid-cell" style={{ fontSize: 10, color: 'var(--muted)', background: 'transparent', fontWeight: 600 }}>
                      {new Date(d).toLocaleDateString('en-IN', { weekday: 'short' })}
                    </div>
                  ))}
                </div>
                {weeklyGrid.map((row, i) => (
                  <div key={i} className="grid-row">
                    <div className="grid-name">{row.empName}</div>
                    {row.days.map((status, j) => (
                      <div key={j} className={`grid-cell ${status}`}>
                        {status === 'p' ? '✓' : status === 'l' ? 'L' : status === 'x' ? '✕' : '—'}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
          {weeklyGrid.length === 0 && <p style={{ color: 'var(--muted)', textAlign: 'center', padding: 24 }}>No weekly data available</p>}
        </div>
      )}
    </div>
  )
}
