import React from 'react'
import StatCard from '../ui/StatCard'
import AttendanceHeatmap from '../ui/AttendanceHeatmap'
import { 
  Clock, 
  Calendar, 
  CheckSquare, 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle,
  ArrowRight,
  Plus,
  Send
} from 'lucide-react'
import { Link } from 'react-router-dom'

export default function EmployeeDashboardView({ user, stats, tasks, history, messages = [], leaves = [], onStartBot }) {
  const firstName = user?.name?.split(' ')[0]
  const today = new Date()
  const todayStr = today.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  const dayName = today.toLocaleDateString('en-IN', { weekday: 'long' })

  // Check if attendance is submitted today
  const hasSubmittedToday = history.some(rec => {
    const recDate = new Date(rec.date).toDateString()
    return recDate === today.toDateString()
  })
  
  const todayRecord = history.find(rec => new Date(rec.date).toDateString() === today.toDateString())

  return (
    <div className="employee-dashboard animate-in">
      <div className="page-header">
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif' }}>
            {today.getHours() < 12 ? 'Good morning' : today.getHours() < 17 ? 'Good afternoon' : 'Good evening'}, {firstName}
          </h1>
          <p className="subtitle">{dayName}, {todayStr}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="badge badge-green" style={{ textTransform: 'none', padding: '6px 14px' }}>
            👤 Employee
          </span>
          {!hasSubmittedToday && (
            <Link to="/my-attendance" className="btn btn-primary btn-sm">
              <Clock size={14} /> Mark Attendance
            </Link>
          )}
        </div>
      </div>

      {/* Today's Status Card */}
      <div className="card" style={{ marginBottom: 24, border: hasSubmittedToday ? 'var(--border)' : '1px solid var(--amber)' }}>
        {!hasSubmittedToday ? (
          <div style={{ padding: '8px 4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--amber-dim)', color: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>You haven't submitted attendance today</h3>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
                  On Time: 1:00 AM to 11:58 PM
                </p>
              </div>
            </div>
            <Link to="/my-attendance" className="btn btn-primary">
              <CheckCircle size={16} /> Mark Attendance Now
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ 
                width: 48, height: 48, borderRadius: 12, 
                background: todayRecord?.status === 'l' ? 'var(--amber-dim)' : 'var(--green-dim)', 
                color: todayRecord?.status === 'l' ? 'var(--amber)' : 'var(--green)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                <CheckCircle size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>
                  {todayRecord?.status === 'l' ? 'Late Submission' : "You're On Time!"}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
                  {todayStr} • {todayRecord?.time || '--:--'}
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 4, fontStyle: 'italic' }}>
                  "{todayRecord?.report || 'No report provided'}"
                </p>
              </div>
            </div>
            <Link to="/my-attendance" className="btn btn-ghost btn-sm">View Details</Link>
          </div>
        )}
      </div>

      <div className="stats-grid">
        <div className="card" style={{ padding: 16 }}>
          <div style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Attendance</div>
          <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{stats.attendance} Days</div>
          <div style={{ marginTop: 8, fontSize: 12, display: 'flex', gap: 12 }}>
            <span style={{ color: 'var(--green)' }}>{stats.onTime} On Time</span>
            <span style={{ color: 'var(--amber)' }}>{stats.late} Late</span>
          </div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Leaves Balance</div>
          <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{stats.leavesTotal - stats.leavesUsed} Left</div>
          <div style={{ marginTop: 8, fontSize: 12, display: 'flex', gap: 12 }}>
            <span style={{ color: 'var(--blue)' }}>{stats.leavesUsed} Used</span>
            <span style={{ color: 'var(--muted)' }}>{stats.leavesTotal} Total</span>
          </div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Pending Tasks</div>
          <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{stats.pendingTasks} Tasks</div>
          <div style={{ marginTop: 8, fontSize: 12, display: 'flex', gap: 12 }}>
            <span style={{ color: 'var(--red)' }}>{stats.dueToday} Due Today</span>
            <span style={{ color: 'var(--muted)' }}>{stats.pendingTasks - stats.dueToday} Upcoming</span>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: 24 }}>
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Attendance Heatmap</h3>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: 'var(--muted)' }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--green)' }}></div> Present
              <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--amber)' }}></div> Late
              <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--red)' }}></div> Absent
            </div>
          </div>
          <AttendanceHeatmap records={history} />
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: 'var(--border)' }}>
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>
              Daily log across the month. Green marks represent on-time, amber for late.
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>My Tasks Preview</h3>
            <Link to="/my-tasks" className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {tasks.slice(0, 3).map((task, i) => (
              <div key={i} className="card-glass" style={{ padding: 12, background: 'var(--bg-elevated)', borderLeft: `4px solid var(--${task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'amber' : 'green'})` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600 }}>{task.title}</h4>
                  <span className={`badge badge-${task.priority === 'high' ? 'red' : 'amber'}`} style={{ fontSize: 10 }}>{task.priority || 'low'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>Due: {task.deadline}</span>
                  <Link to="/my-tasks" className="btn btn-icon btn-sm" style={{ width: 24, height: 24 }}><CheckCircle size={14} /></Link>
                </div>
              </div>
            ))}
            {tasks.length === 0 && (
              <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--muted)' }}>
                No active tasks found
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Recent Messages</h3>
            <Link to="/communication" className="btn btn-ghost btn-sm">Open Chat</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {messages.slice(0, 3).map((msg, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: i < 2 ? 16 : 0, borderBottom: i < 2 ? 'var(--border)' : 'none' }}>
                <div className="avatar avatar-sm" style={{ background: 'var(--accent)' }}>
                  {msg.fromId === user.id ? 'M' : 'S'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{msg.fromId === user.id ? 'Me' : msg.fromId}</span>
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '250px' }}>
                    {msg.message}
                  </p>
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--muted)' }}>No recent messages</div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>My Leaves</h3>
            <Link to="/my-leaves" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {leaves.slice(0, 2).map((leave, i) => (
              <div key={i} className="card-glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-elevated)' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{leave.date} — {leave.type}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{leave.reason}</div>
                </div>
                <span className={`badge badge-${leave.status === 'approved' ? 'green' : leave.status === 'pending' ? 'amber' : 'red'}`}>
                  {leave.status}
                </span>
              </div>
            ))}
            {leaves.length === 0 && (
              <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--muted)' }}>No leave requests found</div>
            )}
            <Link to="/my-leaves" className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              <Plus size={14} /> Apply for Leave
            </Link>
          </div>
        </div>
      </div>

      <div className="grid-2-mobile" style={{ marginTop: 32, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <Link to="/my-attendance" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', background: 'var(--green-dim)', border: '1px solid var(--green)' }}>
          <Clock size={16} /> Mark Attendance
        </Link>
        <Link to="/my-leaves" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', background: 'var(--blue-dim)', border: '1px solid var(--blue)' }}>
          <Calendar size={16} /> Apply Leave
        </Link>
        <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', background: 'var(--purple-dim)', border: '1px solid var(--purple)' }}>
          <ArrowRight size={16} /> View My Report
        </button>
        <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', background: 'var(--amber-dim)', border: '1px solid var(--amber)' }} onClick={onStartBot}>
          <Send size={16} /> Message HR
        </button>
      </div>
    </div>
  )
}
