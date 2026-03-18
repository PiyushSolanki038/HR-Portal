import { useState, useEffect } from 'react'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import * as api from '../services/api'
import { Shield, Search } from 'lucide-react'

const TYPE_BADGES = {
  approval: 'badge-green',
  warning: 'badge-amber',
  update: 'badge-blue',
  dispatch: 'badge-purple',
  creation: 'badge-blue',
  login: 'badge-muted',
}

export default function Audit() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    api.getAuditLog().then(setEvents).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  const types = [...new Set(events.map(e => e.type).filter(Boolean))]
  const filtered = events.filter(e => {
    const ms = (e.description || '').toLowerCase().includes(search.toLowerCase())
    const mt = typeFilter === 'all' || e.type === typeFilter
    return ms && mt
  })

  return (
    <div className="animate-in">
      <div className="page-header">
        <div><h1>Audit Log</h1><p className="subtitle">{events.length} events</p></div>
      </div>
      <div className="filter-bar">
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="all">All Types</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div className="table-container">
        <table style={{ minWidth: 600, width: '100%' }}>
          <thead><tr><th>Type</th><th>Description</th><th>Actor</th><th>Time</th></tr></thead>
          <tbody>
            {filtered.map((evt, i) => (
              <tr key={i}>
                <td><span className={`badge ${TYPE_BADGES[evt.type] || 'badge-muted'}`}>{evt.type}</span></td>
                <td style={{ maxWidth: 400 }}>{evt.description}</td>
                <td style={{ color: 'var(--text-dim)' }}>{evt.actor}</td>
                <td style={{ color: 'var(--muted)', fontSize: 12 }}>{evt.timestamp ? new Date(evt.timestamp).toLocaleString('en-IN') : '—'}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={4}><div className="empty-state"><Shield size={40} /><h3>No events</h3></div></td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
