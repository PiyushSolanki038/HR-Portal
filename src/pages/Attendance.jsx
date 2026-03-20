import { useState, useEffect, useMemo } from 'react'
import { useScreenSize } from '../hooks/useScreenSize'
import { useData } from '../context/DataContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import StatCard from '../components/ui/StatCard'
import * as api from '../services/api'
import { Clock, Search, Users, CheckCircle, AlertCircle, Calendar, Download, Filter, ChevronRight } from 'lucide-react'

const STATUS_LABELS = { p: 'Present', l: 'Late', a: 'Absent', x: 'Leave' }
const STATUS_COLORS = { p: 'var(--green)', l: 'var(--amber)', a: 'var(--red)', x: 'var(--blue)' }

export default function Attendance() {
  const { isMobile } = useScreenSize()
  const { attendance, employees, loading, error } = useData()
  const [weeklyGrid, setWeeklyGrid] = useState([])
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('today')
  const [deptFilter, setDeptFilter] = useState('All Departments')

  const ADMIN_NAMES = ['Shreyansh', 'Ankur']

  useEffect(() => {
    api.getWeeklyGrid().then(setWeeklyGrid).catch(() => { })
  }, [])

  // Filter out admins from workforce
  const workforce = useMemo(() => 
    employees.filter(e => {
      const r = e.role?.toLowerCase() || ''
      const n = e.name?.toLowerCase() || ''
      return !r.includes('admin') && !r.includes('head') && !r.includes('owner') && !r.includes('hr manager') && !n.includes('shreyansh') && !n.includes('ankur')
    }),
    [employees]
  )

  const stats = useMemo(() => {
    const today = attendance.filter(a => {
      const n = (a.empName || '').toLowerCase()
      return !n.includes('shreyansh') && !n.includes('ankur')
    })
    const present = today.filter(a => a.status === 'p' || a.status === 'l').length
    const late = today.filter(a => a.status === 'l').length
    const absent = workforce.length - today.length
    
    return {
      total: workforce.length,
      present,
      late,
      absent: Math.max(0, absent)
    }
  }, [attendance, workforce])

  const departments = useMemo(() => 
    ['All Departments', ...new Set(workforce.map(e => e.department).filter(Boolean))],
    [workforce]
  )

  const filtered = attendance.filter(a => {
    const matchesSearch = (a.empName || '').toLowerCase().includes(search.toLowerCase()) ||
                         (a.dept || '').toLowerCase().includes(search.toLowerCase())
    const matchesDept = deptFilter === 'All Departments' || a.dept === deptFilter
    const nameLower = (a.empName || '').toLowerCase()
    const notAdmin = !nameLower.includes('shreyansh') && !nameLower.includes('ankur')
    return matchesSearch && matchesDept && notAdmin
  })

  if (loading) return <LoadingSpinner />
  if (error) return <div className="empty-state">Error: {error}</div>

  return (
    <div className="animate-in" style={{ padding: isMobile ? '16px 12px' : '32px', maxWidth: 1600, margin: '0 auto' }}>
      {/* Executive Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 28 : 42, fontWeight: 900, letterSpacing: -1.5, margin: 0 }}>Workforce Pulse</h1>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--muted)', marginTop: 4, letterSpacing: 0.5 }}>Real-time attendance & operational tracking</p>
        </div>
        {!isMobile && (
          <button className="btn-glass" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12 }}>
            <Download size={16} /> Export Logs
          </button>
        )}
      </div>

      {/* Summary Stat Bar */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', 
        gap: 20, 
        marginBottom: 32 
      }}>
        <StatCard title="Active Workforce" value={stats.total} icon={Users} color="var(--accent)" trend={[45, 48, 47, 50, 49, 52, stats.total]} />
        <StatCard title="Present Today" value={stats.present} icon={CheckCircle} color="var(--green)" trend={[40, 42, 38, 44, 45, 43, stats.present]} />
        <StatCard title="Delayed / Late" value={stats.late} icon={Clock} color="var(--amber)" trend={[2, 4, 1, 3, 2, 5, stats.late]} />
        <StatCard title="Not Reported" value={stats.absent} icon={AlertCircle} color="var(--red)" trend={[8, 6, 9, 5, 4, 7, stats.absent]} />
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
            placeholder="Search by name or department…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', fontSize: 14, fontWeight: 700, background: 'transparent', border: 'none', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, width: isMobile ? '100%' : 'auto', overflowX: 'auto', paddingBottom: isMobile ? 8 : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', color: 'var(--muted)', fontSize: 12, fontWeight: 900 }}>
            <Filter size={14} /> SEGMENT:
          </div>
          {departments.slice(0, 4).map(dept => (
            <button 
              key={dept} 
              className={`btn-tag ${deptFilter === dept ? 'active' : ''}`}
              onClick={() => setDeptFilter(dept)}
              style={{ 
                whiteSpace: 'nowrap',
                padding: '8px 16px',
                borderRadius: 10,
                fontSize: 11,
                fontWeight: 800,
                background: deptFilter === dept ? 'var(--accent)' : 'rgba(255,255,255,0.5)',
                color: deptFilter === dept ? '#fff' : 'var(--text)',
                border: '1px solid rgba(255,255,255,0.8)'
              }}
            >
              {dept.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="tabs" style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button className={`tab-elite ${tab === 'today' ? 'active' : ''}`} onClick={() => setTab('today')}>
          Today's Roster
        </button>
        <button className={`tab-elite ${tab === 'weekly' ? 'active' : ''}`} onClick={() => setTab('weekly')}>
          Coverage Heatmap
        </button>
      </div>

      {tab === 'today' && (
        <div className="card-premium super-glass animate-in" style={{ padding: 0, borderRadius: 24, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ minWidth: 800, borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr>
                  <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--muted)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>Employee Name</th>
                  <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--muted)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>Department</th>
                  <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--muted)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>Arrival Time</th>
                  <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--muted)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>Status Badge</th>
                  <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--muted)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>Operations Report</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((rec, i) => (
                  <tr key={i} className="row-hover" style={{ transition: 'all 0.2s' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ 
                          width: 40, height: 40, borderRadius: 12, 
                          background: employees.find(e => e.id === rec.empId)?.color || 'var(--accent)', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontSize: 14, fontWeight: 900,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}>
                          {(rec.empName || '').split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 800 }}>{rec.empName}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>ID: {rec.empId}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)' }}>{rec.dept}</span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 750 }}>
                        <Clock size={14} style={{ opacity: 0.5 }} />{rec.time}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ 
                        display: 'flex', alignItems: 'center', gap: 10, 
                        padding: '6px 14px', borderRadius: 10, 
                        background: `${STATUS_COLORS[rec.status]}15`,
                        width: 'fit-content',
                        border: `1px solid ${STATUS_COLORS[rec.status]}25`
                      }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[rec.status], boxShadow: `0 0 8px ${STATUS_COLORS[rec.status]}` }} />
                        <span style={{ fontSize: 11, fontWeight: 900, color: STATUS_COLORS[rec.status], textTransform: 'uppercase' }}>{STATUS_LABELS[rec.status] || rec.status}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ 
                        maxWidth: 350, fontSize: 12, fontWeight: 600, color: 'var(--text)', 
                        opacity: 0.8, lineHeight: 1.5,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }} title={rec.report}>
                        {rec.report || <span style={{ fontStyle: 'italic', opacity: 0.5 }}>No report submitted</span>}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: 64, textAlign: 'center' }}>
                      <CheckCircle size={48} color="var(--accent)" style={{ opacity: 0.1, marginBottom: 16 }} />
                      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--muted)' }}>No records matching your criteria</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'weekly' && (
        <div className="card-premium super-glass animate-in" style={{ padding: 32, borderRadius: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, letterSpacing: -0.5 }}>Rolling 5-Day Insight</h3>
            <div style={{ display: 'flex', gap: 16 }}>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 800, color: 'var(--muted)' }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: STATUS_COLORS[key] || 'var(--muted)' }} />
                  {label.toUpperCase()}
                </div>
              ))}
            </div>
          </div>

          <div style={{ overflowX: 'auto', paddingBottom: 16 }}>
            <div style={{ minWidth: 800 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) repeat(5, 80px)', gap: 12, marginBottom: 12 }}>
                <div style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5 }}>Personnel</div>
                {weeklyGrid[0]?.dates?.map((d, i) => (
                  <div key={i} style={{ textAlign: 'center', fontSize: 11, fontWeight: 900, color: 'var(--accent)', textTransform: 'uppercase' }}>
                    {new Date(d).toLocaleDateString('en-IN', { weekday: 'short' })}
                    <div style={{ fontSize: 9, opacity: 0.5 }}>{new Date(d).getDate()} {new Date(d).toLocaleString('default', { month: 'short' })}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {weeklyGrid.map((row, i) => (
                  <div key={i} style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'minmax(200px, 1fr) repeat(5, 80px)', 
                    gap: 12,
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: '1px solid rgba(0,0,0,0.03)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', opacity: 0.3 }} />
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{row.empName}</div>
                    </div>
                    {row.days.map((status, j) => (
                      <div key={j} style={{ 
                        height: 36, 
                        borderRadius: 10, 
                        background: status === 'p' ? `${STATUS_COLORS.p}15` : 
                                  status === 'l' ? `${STATUS_COLORS.l}15` : 
                                  status === 'x' ? `${STATUS_COLORS.x}15` : 
                                  status === 'a' ? `${STATUS_COLORS.a}15` : 'rgba(0,0,0,0.05)',
                        border: `1px solid ${status === 'p' ? `${STATUS_COLORS.p}20` : 
                                            status === 'l' ? `${STATUS_COLORS.l}20` : 
                                            status === 'x' ? `${STATUS_COLORS.x}20` : 
                                            status === 'a' ? `${STATUS_COLORS.a}20` : 'transparent'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: STATUS_COLORS[status] || 'var(--muted)'
                      }}>
                        {status === 'p' ? <CheckCircle size={14} strokeWidth={3} /> : 
                         status === 'l' ? <Clock size={14} strokeWidth={3} /> : 
                         status === 'x' ? <Calendar size={14} strokeWidth={3} /> : 
                         status === 'a' ? <AlertCircle size={14} strokeWidth={3} /> : 
                         <span style={{ fontSize: 14, opacity: 0.2 }}>—</span>}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .tab-elite {
          padding: 12px 24px;
          border-radius: 12px;
          font-size: 13px;
          fontWeight: 900;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          transition: all 0.3s;
          background: rgba(255,255,255,0.2);
          color: var(--muted);
          border: 1px solid rgba(255,255,255,0.4);
        }
        .tab-elite.active {
          background: var(--accent);
          color: #fff;
          border-color: var(--accent);
          box-shadow: 0 8px 16px rgba(var(--accent-rgb), 0.2);
        }
        .row-hover:hover {
          background: rgba(var(--accent-rgb), 0.02) !important;
          transform: translateX(4px);
        }
        .btn-tag {
          transition: all 0.2s;
        }
        .btn-tag:hover:not(.active) {
          background: rgba(255,255,255,0.8) !important;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  )
}
