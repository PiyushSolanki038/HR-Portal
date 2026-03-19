import { useState, useEffect } from 'react'
import { useScreenSize } from '../hooks/useScreenSize'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import * as api from '../services/api'
import { Clock, Download, Calendar, ArrowRight, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react'
import AttendanceHeatmap from '../components/ui/AttendanceHeatmap'

const STATUS_LABELS = { p: 'Present', l: 'Late', a: 'Absent', x: 'On Leave' }
const STATUS_BADGES = { p: 'badge-green', l: 'badge-amber', a: 'badge-red', x: 'badge-blue' }

export default function MyAttendance() {
  const { isMobile, isTablet, isDesktop } = useScreenSize()
  const { user } = useAuth()
  const { employees, attendance, refresh, loading, error } = useData()
  const { showToast } = useToast()
  const [history, setHistory] = useState([])
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [reportText, setReportText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)

  // Generate last 6 months for the selector
  const months = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    return {
      value: d.toISOString().slice(0, 7),
      label: d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    }
  })

  useEffect(() => {
    if (user?.id) {
      api.getEmployeeAttendance(user.id).then(setHistory).catch(console.error)
    }
  }, [user?.id, attendance])

  if (loading) return <LoadingSpinner />
  if (error) return <div className="p-6">Error: {error}</div>

  const today = new Date()
  const todayStr = today.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }) // YYYY-MM-DD
  const todayRecord = history.find(rec => rec.date === todayStr)
  const hasSubmittedToday = !!todayRecord
  
  const monthHistory = history.filter(rec => rec.date.startsWith(month))
  
  const stats = {
    present: monthHistory.filter(r => r.status === 'p').length,
    late: monthHistory.filter(r => r.status === 'l').length,
    absent: monthHistory.filter(r => r.status === 'a').length,
    onLeave: monthHistory.filter(r => r.status === 'x').length
  }

  const handleSubmit = async () => {
    if (reportText.trim().length < 10) {
      showToast('Min 10 characters required', 'error')
      return
    }
    setSubmitting(true)
    try {
      await api.markAttendance({
        empId: user.id,
        empName: user.name,
        dept: user.dept,
        report: reportText,
        source: 'Web Portals'
      })
      showToast('Attendance recorded successfully', 'success')
      setReportText('')
      refresh()
    } catch (err) {
      showToast(err.message || 'Failed to mark attendance', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleExport = () => {
    showToast('Preparing report for download...', 'info')
  }

  return (
    <div className="animate-in" style={{ padding: isMobile ? 12 : 28, maxWidth: '100%', overflowX: 'hidden' }}>
      <div className="page-header" style={{ flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? 16 : 24, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 24 : 32, fontWeight: 800 }}>My Attendance</h1>
          <p className="subtitle" style={{ fontSize: isMobile ? 12 : 14 }}>Detailed presence logs and history tracking.</p>
        </div>
        <div style={{ display: 'flex', gap: 12, width: isMobile ? '100%' : 'auto', flexWrap: 'wrap' }}>
          <select 
            className="btn btn-secondary btn-sm" 
            value={month} 
            onChange={e => setMonth(e.target.value)}
            style={{ flex: isMobile ? 1 : 'none', fontSize: 16, height: 'auto', padding: '8px 12px' }}
          >
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <button className="btn btn-secondary btn-sm" style={{ flex: isMobile ? 1 : 'none', height: 'auto', padding: '8px 12px' }} onClick={handleExport}>
            <Download size={14} /> {isMobile ? 'Export' : 'Export Report'}
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24, border: hasSubmittedToday ? 'var(--border)' : '1px solid var(--accent)', padding: isMobile ? 16 : 24 }}>
        {hasSubmittedToday ? (
          <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ 
                width: 48, height: 48, borderRadius: 12, 
                background: todayRecord.status === 'l' ? 'var(--amber-dim)' : 'var(--green-dim)', 
                color: todayRecord.status === 'l' ? 'var(--amber)' : 'var(--green)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 48
              }}>
                <CheckCircle size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>
                  {todayRecord.status === 'l' ? 'Late Submission Recorded' : "Today's Attendance Marked"}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
                  {todayRecord.time} • {todayRecord.status === 'l' ? 'Late Arrival' : 'On Time'}
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 8, fontStyle: 'italic' }}>
                  "{todayRecord.report}"
                </p>
              </div>
            </div>
            <span className={`badge ${STATUS_BADGES[todayRecord.status]}`} style={{ width: isMobile ? '100%' : 'auto', textAlign: 'center' }}>{STATUS_LABELS[todayRecord.status]}</span>
          </div>
        ) : (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={18} color="var(--accent)" /> Mark Today's Attendance
            </h3>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
              {today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            
            <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-dim)', marginBottom: 8 }}>
                    What did you work on today? (min 10 characters)
                </label>
                <textarea 
                  className="input" 
                  placeholder="Describe your work for the day..." 
                  value={reportText}
                  onChange={e => setReportText(e.target.value)}
                  style={{ 
                    minHeight: 100, 
                    fontSize: 16,
                    borderColor: reportText.length > 0 && reportText.trim().length < 10 ? 'var(--red)' : 'var(--line)',
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px'
                  }}
                />
                {reportText.length > 0 && reportText.trim().length < 10 && (
                  <p style={{ color: 'var(--red)', fontSize: 11, marginTop: 4 }}>
                    Character count: {reportText.trim().length}/10 (Required)
                  </p>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 24 }}>
                <div style={{ padding: 12, borderRadius: 8, background: 'var(--bg-elevated)', border: 'var(--border)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)', marginBottom: 4 }}>ON TIME</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>01:00 AM — 11:58 PM</div>
                </div>
                <div style={{ padding: 12, borderRadius: 8, background: 'var(--bg-elevated)', border: 'var(--border)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--amber)', marginBottom: 4 }}>LATE</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>11:59 PM — 00:59 AM</div>
                </div>
            </div>

            <button 
              className="btn btn-primary" 
              onClick={handleSubmit} 
              disabled={submitting || reportText.trim().length < 10}
              style={{ width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}
            >
                {submitting ? 'Submitting...' : 'Submit Attendance'}
            </button>
          </div>
        )}
      </div>

      <div className="stats-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', 
        gap: 16, 
        marginBottom: 32 
      }}>
        {[
          { label: 'Present', value: stats.present, icon: CheckCircle, color: 'var(--green)', bg: 'var(--green-dim)' },
          { label: 'Late', value: stats.late, icon: Clock, color: 'var(--amber)', bg: 'var(--amber-dim)' },
          { label: 'Absent', value: stats.absent, icon: XCircle, color: 'var(--red)', bg: 'var(--red-dim)' },
          { label: 'On Leave', value: stats.onLeave, icon: Calendar, color: 'var(--blue)', bg: 'var(--blue-dim)' },
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

      <div className="card" style={{ marginBottom: 24, padding: isMobile ? 12 : 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Attendance Heatmap</h3>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
          <AttendanceHeatmap records={history} />
        </div>
        <div style={{ marginTop: 20, display: 'flex', gap: 12, fontSize: 11, color: 'var(--muted)', flexWrap: 'wrap' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--blue)' }}></div> Present
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--amber)' }}></div> Late
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--red)' }}></div> Absent
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--bg-elevated)', border: 'var(--border)' }}></div> Weekend/Holiday
           </div>
        </div>
      </div>

      <div className="table-container" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', borderRadius: 16 }}>
        <table style={{ minWidth: 700 }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Day</th>
              <th>Time</th>
              <th>Status</th>
              <th>Work Report</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {monthHistory.map((rec, i) => (
              <tr key={i}>
                <td>{new Date(rec.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                <td style={{ color: 'var(--text-dim)' }}>{new Date(rec.date).toLocaleDateString('en-IN', { weekday: 'short' })}</td>
                <td>{rec.time || '--:--'}</td>
                <td><span className={`badge ${STATUS_BADGES[rec.status]}`}>{STATUS_LABELS[rec.status]}</span></td>
                <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-dim)' }}>
                  {rec.report}
                </td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => setSelectedRecord(rec)}>
                    View Details
                  </button>
                </td>
              </tr>
            ))}
            {monthHistory.length === 0 && (
              <tr><td colSpan={6} className="empty-state">No attendance records for this month</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedRecord && (
        <div className="modal-overlay" onClick={() => setSelectedRecord(null)}>
          <div className="modal-drawer" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <h3 style={{ fontSize: 20, fontWeight: 800 }}>Record Details</h3>
                 <button className="btn-icon btn-sm" onClick={() => setSelectedRecord(null)}>×</button>
              </div>
              
              <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                 <div style={{ 
                   width: 64, height: 64, borderRadius: 16, 
                   background: STATUS_BADGES[selectedRecord.status].includes('green') ? 'var(--green-dim)' : 'var(--amber-dim)',
                   color: STATUS_BADGES[selectedRecord.status].includes('green') ? 'var(--green)' : 'var(--amber)',
                   display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 64
                 }}>
                    <CheckCircle size={32} />
                 </div>
                 <div>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>{STATUS_LABELS[selectedRecord.status]}</div>
                    <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>
                       {new Date(selectedRecord.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                 </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16, marginBottom: 24 }}>
                 <div className="card-glass" style={{ padding: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>Time</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{selectedRecord.time || '--:--'}</div>
                 </div>
                 <div className="card-glass" style={{ padding: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>Submitted From</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{selectedRecord.source || 'Web Portal'}</div>
                 </div>
              </div>

              <div>
                 <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Info size={12} /> Work Report
                 </div>
                 <div className="card-glass" style={{ padding: 16, fontSize: 14, lineHeight: 1.6, color: 'var(--text-dim)', whiteSpace: 'pre-wrap' }}>
                    {selectedRecord.report}
                 </div>
              </div>

              <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                 <button className="btn btn-secondary" style={{ width: isMobile ? '100%' : 'auto', justifyContent: 'center' }} onClick={() => setSelectedRecord(null)}>Close</button>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}
