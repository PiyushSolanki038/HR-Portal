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
  const { attendance, employees, loading, error, refresh } = useData()
  const [weeklyGrid, setWeeklyGrid] = useState([])
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('today')
  const [deptFilter, setDeptFilter] = useState('All Departments')
  const [historyDate, setHistoryDate] = useState('') // New: for filtering history by date
  const [processing, setProcessing] = useState(false) // New: loading state for actions

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

  // New: Filter for Today (IST)
  const todayIST = useMemo(() => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }), [])
  
  const todayRecords = useMemo(() => 
    filtered.filter(a => a.date === todayIST),
    [filtered, todayIST]
  )

  const historyRecords = useMemo(() => {
    let sorted = [...filtered].sort((a, b) => {
      // Sort by date desc, then time desc
      if (b.date !== a.date) return b.date.localeCompare(a.date)
      return (b.time || '').localeCompare(a.time || '')
    })
    if (historyDate) {
      sorted = sorted.filter(a => a.date === historyDate)
    }
    return sorted
  }, [filtered, historyDate])

  const notReported = useMemo(() => {
    return workforce.filter(emp => !todayRecords.some(rec => rec.empId === emp.id))
  }, [workforce, todayRecords])

  const handleRemindAll = async () => {
    if (notReported.length === 0) return
    if (!window.confirm(`Send Telegram reminders to ${notReported.length} employees?`)) return
    
    setProcessing(true)
    try {
      await api.remindAbsent({ empIds: notReported.map(e => e.id) })
      alert('Reminders sent successfully!')
    } catch (err) {
      alert('Failed to send reminders: ' + err.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleMarkManual = async (emp) => {
    if (!window.confirm(`Mark ${emp.name} as Present manually?`)) return
    
    setProcessing(true)
    try {
      await api.markAttendance({ 
        empId: emp.id, 
        empName: emp.name, 
        dept: emp.department, 
        report: 'Manually marked by HR',
        source: 'HR_PORTAL_MANUAL'
      })
      await refresh()
      alert(`${emp.name} marked as present.`)
    } catch (err) {
      alert('Failed to mark attendance: ' + err.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleRefresh = async () => {
    setProcessing(true)
    await refresh()
    setProcessing(false)
  }

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

        <button 
          className="btn-glass" 
          onClick={handleRefresh}
          disabled={processing}
          style={{ 
            padding: '10px 16px', 
            borderRadius: 12, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8,
            fontSize: 12,
            fontWeight: 800,
            opacity: processing ? 0.5 : 1
          }}
        >
          <Clock size={16} className={processing ? 'animate-spin' : ''} />
          {processing ? 'SYNCING...' : 'REFRESH'}
        </button>
      </div>

      <div className="tabs" style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button className={`tab-elite ${tab === 'today' ? 'active' : ''}`} onClick={() => setTab('today')}>
          Today's Roster
        </button>
        <button className={`tab-elite ${tab === 'weekly' ? 'active' : ''}`} onClick={() => setTab('weekly')}>
          Coverage Heatmap
        </button>
        <button className={`tab-elite ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>
          Attendance History
        </button>
        <button className={`tab-elite ${tab === 'missing' ? 'active' : ''}`} onClick={() => setTab('missing')}>
          Not Reported ({notReported.length})
        </button>
      </div>

      {tab === 'today' && (
        <div className="card-premium super-glass animate-in" style={{ padding: 0, borderRadius: 24, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Personnel Active Today</h3>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent)', background: 'var(--accent)15', padding: '4px 12px', borderRadius: 8 }}>
              {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ minWidth: 800, borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr>
                  <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--muted)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>Date</th>
                  <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--muted)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>Employee Name</th>
                  <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--muted)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>Department</th>
                  <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--muted)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>Arrival Time</th>
                  <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--muted)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>Status Badge</th>
                  <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--muted)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>Operations Report</th>
                </tr>
              </thead>
              <tbody>
                {todayRecords.map((rec, i) => (
                  <tr key={i} className="row-hover" style={{ transition: 'all 0.2s' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent)' }}>
                        {new Date(rec.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </div>
                    </td>
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
                {todayRecords.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: 64, textAlign: 'center' }}>
                      <CheckCircle size={48} color="var(--accent)" style={{ opacity: 0.1, marginBottom: 16 }} />
                      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--muted)' }}>No personnel reporting yet for today.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="card-premium super-glass animate-in" style={{ padding: 0, borderRadius: 24, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.3)' }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Complete Attendance Archives</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--muted)', textTransform: 'uppercase' }}>FILTER BY DATE:</div>
              <input 
                type="date" 
                value={historyDate}
                onChange={e => setHistoryDate(e.target.value)}
                style={{ 
                  padding: '8px 12px', 
                  borderRadius: 8, 
                  border: '1px solid rgba(0,0,0,0.1)', 
                  fontSize: 12, 
                  fontWeight: 700,
                  outline: 'none',
                  background: '#fff'
                }}
              />
              {historyDate && (
                <button 
                  onClick={() => setHistoryDate('')}
                  style={{ fontSize: 11, fontWeight: 800, color: 'var(--red)', cursor: 'pointer', background: 'none', border: 'none' }}
                >
                  CLEAR
                </button>
              )}
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ minWidth: 900, borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr>
                  <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--muted)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>Date</th>
                  <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--muted)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>Employee Name</th>
                  <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--muted)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>Department</th>
                  <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--muted)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>Time</th>
                  <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--muted)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {historyRecords.map((rec, i) => (
                  <tr key={i} className="row-hover" style={{ transition: 'all 0.1s' }}>
                    <td style={{ padding: '14px 24px' }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent)' }}>
                        {new Date(rec.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td style={{ padding: '14px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900 }}>
                          {(rec.empName || '').split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>{rec.empName}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 24px' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>{rec.dept}</span>
                    </td>
                    <td style={{ padding: '14px 24px' }}>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{rec.time}</span>
                    </td>
                    <td style={{ padding: '14px 24px' }}>
                       <span style={{ 
                        fontSize: 10, fontWeight: 900, color: STATUS_COLORS[rec.status], 
                        textTransform: 'uppercase', padding: '4px 10px', borderRadius: 6,
                        background: `${STATUS_COLORS[rec.status]}12`,
                        border: `1px solid ${STATUS_COLORS[rec.status]}20`
                      }}>
                        {STATUS_LABELS[rec.status] || rec.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'missing' && (
        <div className="card-premium super-glass animate-in" style={{ padding: 0, borderRadius: 24, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: 'var(--red)' }}>Personnel Not Reported Yet</h3>
              {notReported.length > 0 && (
                <button 
                  className="btn-premium"
                  onClick={handleRemindAll}
                  disabled={processing}
                  style={{ 
                    padding: '6px 16px', borderRadius: 8, fontSize: 11, fontWeight: 900,
                    background: 'var(--red)', color: '#fff', border: 'none', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
                  }}
                >
                  REMIND ALL ABSENT
                </button>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', background: 'rgba(0,0,0,0.05)', padding: '4px 12px', borderRadius: 8 }}>
                {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
              </span>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--red)', background: 'rgba(239, 68, 68, 0.1)', padding: '4px 12px', borderRadius: 8 }}>
                {notReported.length} Employees Missing
              </span>
            </div>
          </div>
          <div style={{ padding: '24px' }}>
            {notReported.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <CheckCircle size={48} color="var(--green)" style={{ marginBottom: 16, opacity: 0.5 }} />
                <div style={{ fontSize: 18, fontWeight: 800 }}>Full Attendance Reached!</div>
                <p style={{ color: 'var(--muted)', fontWeight: 600 }}>Everyone in the workforce has reported today.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {notReported.map(emp => (
                  <div key={emp.id} className="card-glass" style={{ 
                    padding: 16, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 16,
                    background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0,0,0,0.05)'
                  }}>
                    <div style={{ 
                      width: 48, height: 48, borderRadius: 14, 
                      background: emp.color || 'var(--accent)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 16, fontWeight: 900,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                      {(emp.name || '').split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800 }}>{emp.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, marginBottom: 8 }}>{emp.department} • {emp.id}</div>
                      <button 
                        onClick={() => handleMarkManual(emp)}
                        disabled={processing}
                        style={{ 
                          fontSize: 10, fontWeight: 900, color: 'var(--green)',
                          background: 'var(--green)15', border: '1px solid var(--green)30',
                          padding: '4px 10px', borderRadius: 6, cursor: 'pointer'
                        }}
                      >
                        MARK PRESENT
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
