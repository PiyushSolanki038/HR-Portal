import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useToast } from '../../context/ToastContext'
import * as api from '../../services/api'
import StatCard from '../ui/StatCard'
import ActivityFeed from '../ui/ActivityFeed'
import { 
  Users, Clock, AlertTriangle, CheckCircle, 
  TrendingUp, Bell, Zap, Award, Send, UserPlus, FileText, Star, Activity
} from 'lucide-react'

export default function HRDashboardView({ user, stats, employees, attendance, leaves, governance, auditLogs, onLeaveIds, onRemindAbsent, onRemindAllAbsent, onApproveLeave, onRejectLeave }) {
  const { total, present, late, absent, onLeave, pendingLeaves } = stats
  const stabilityScore = total ? Math.round(((present + onLeave) / total) * 100) : 0
  const { showToast } = useToast()
  const navigate = useNavigate()
  
  const [showBroadcast, setShowBroadcast] = useState(false)
  const [broadcastData, setBroadcastData] = useState({
    message: '',
    recipients: 'all',
    channels: ['telegram']
  })

  const activeLeaves = employees.filter(e => onLeaveIds?.has(e.id?.toLowerCase()))

  // Find Employee of the Quarter (latest excellence record)
  const latestAward = (governance || [])
    .filter(r => r.type === 'excellence')
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0]
  
  const spotlightEmp = latestAward ? employees.find(e => e.id === latestAward.empId) : null

  const handleBroadcast = async (e) => {
    e.preventDefault()
    if (!broadcastData.message) return showToast('Please enter a message', 'error')
    try {
      await api.sendBroadcast({
        ...broadcastData,
        actor: user?.name || 'Admin'
      })
      showToast(`Broadcast sent to ${broadcastData.recipients === 'all' ? 'all staff' : broadcastData.recipients + ' department'}`, 'success')
      setShowBroadcast(false)
      setBroadcastData({ message: '', recipients: 'all', channels: ['telegram'] })
    } catch (err) {
      showToast('Failed to send broadcast', 'error')
    }
  }

  return (
    <div className="hr-dashboard animate-in" style={{ paddingBottom: 40 }}>
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div>
          <h1 className="glow-text" style={{ fontSize: 32, fontWeight: 900, color: 'var(--text)' }}>HR Command Center</h1>
          <p className="subtitle">Real-time organizational intelligence — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" onClick={onRemindAllAbsent}>
            <Bell size={16} /> Remind Absent
          </button>
          <button className="btn btn-premium" onClick={() => setShowBroadcast(true)}>
            <Send size={16} /> Broadcast Hub
          </button>
        </div>
      </div>

      {/* Advanced Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Register Employee', icon: UserPlus, to: '/employees', color: 'var(--accent)' },
          { label: 'Review Leaves', icon: AlertTriangle, to: '/leaves', color: 'var(--blue)' },
          { label: 'Payroll Management', icon: FileText, to: '/payroll', color: 'var(--green)' },
          { label: 'Governance', icon: Zap, to: '/disciplinary', color: 'var(--purple)' },
        ].map(action => (
          <Link key={action.label} to={action.to} className="card hover-scale" style={{ 
            padding: '20px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 16, 
            textDecoration: 'none', color: 'inherit', background: 'var(--bg-card)', border: '1px solid var(--line)'
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: `${action.color}15`, color: action.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <action.icon size={22} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>{action.label}</span>
          </Link>
        ))}
      </div>

      <div className="stats-grid" style={{ marginBottom: 32 }}>
        <StatCard
          title="Presence Rate"
          value={`${present}/${total}`}
          change={`${total ? Math.round((present / total) * 100) : 0}% active now`}
          icon={CheckCircle}
          color="var(--green)"
          bgColor="var(--green-dim)"
        />
        <StatCard
          title="Org Stability"
          value={`${stabilityScore}%`}
          change="Attendance + Approved Leaves"
          icon={Activity}
          color="var(--accent)"
          bgColor="var(--accent-glow)"
        />
        <StatCard
          title="Late Warnings"
          value={late}
          icon={Clock}
          color="var(--amber)"
          bgColor="var(--amber-dim)"
        />
        <StatCard
          title="Attention Reqd"
          value={absent}
          icon={AlertTriangle}
          color="var(--red)"
          bgColor="var(--red-dim)"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32 }}>
        {/* Left Column: Spotlight & Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* Spotlight Section - Black Design Hub */}
          <div className="card" style={{ 
            padding: 32, background: '#000', color: '#fff', borderRadius: 24,
            position: 'relative', overflow: 'hidden', border: 'none'
          }}>
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--amber)', marginBottom: 20 }}>
                    <Star size={18} fill="var(--amber)" />
                    <span style={{ fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5 }}>Employee of the Quarter</span>
                  </div>
                  <h2 style={{ fontSize: 42, fontWeight: 950, marginBottom: 8, color: '#fff', letterSpacing: '-0.02em' }}>{spotlightEmp?.name || 'Awaiting Selection'}</h2>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--amber)', opacity: 0.9, marginBottom: 28 }}>{spotlightEmp?.role || 'Excellence in Action'} • {latestAward?.title || 'Consistency & Delivery'}</p>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn" onClick={() => navigate('/disciplinary')} style={{ borderRadius: 14, background: 'var(--amber)', color: '#000', fontWeight: 900, padding: '12px 24px', fontSize: 12, border: 'none' }}>VIEW ACHIEVEMENT</button>
                    <button className="btn" onClick={() => showToast(`Congratulation sent to ${spotlightEmp?.name || 'employee'}!`, 'success')} style={{ borderRadius: 14, background: '#fff', color: '#000', fontWeight: 900, padding: '12px 24px', fontSize: 12, border: 'none' }}>CONGRATULATE</button>
                  </div>
               </div>
               <div style={{ width: 130, height: 130, borderRadius: 32, background: 'rgba(255,255,255,0.05)', color: spotlightEmp?.color || 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 42, fontWeight: 950, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 0 40px rgba(0,0,0,0.5)' }}>
                  {spotlightEmp?.av ? (
                    <img src={spotlightEmp.av} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    spotlightEmp?.name?.substring(0,2).toUpperCase() || 'SIS'
                  )}
               </div>
            </div>
            {/* Ambient Background Graphic */}
            <Award size={280} style={{ position: 'absolute', right: -60, bottom: -60, opacity: 0.08, transform: 'rotate(-15deg)', color: '#fff' }} />
          </div>

          <div className="card" style={{ padding: 24, borderRadius: 24 }}>
            <h3 style={{ margin: '0 0 24px 0', fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Zap size={20} color="var(--purple)" /> Intelligence Stream
            </h3>
            <ActivityFeed activities={auditLogs} />
          </div>
        </div>

        {/* Right Column: Original Critical Attention & Leaves */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div className="card" style={{ padding: 24, borderRadius: 24 }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertTriangle size={18} color="var(--red)" /> Critical Attention
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {attendance
                .filter(a => a.status === 'a' && !onLeaveIds?.has(a.empId?.toLowerCase()))
                .slice(0, 5)
                .map((rec, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 16, border: '1px solid var(--line)' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)' }} />
                    <div style={{ flex: 1 }}>
                      <Link to={`/employees/${rec.empId}`} style={{ fontSize: 13, fontWeight: 700, textDecoration: 'none', color: 'inherit' }}>{rec.empName}</Link>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{rec.dept} • Missing</div>
                    </div>
                    <button className="btn btn-sm btn-ghost" onClick={() => onRemindAbsent(rec.empId)}><Bell size={14} /></button>
                  </div>
                ))}
              {attendance.filter(a => a.status === 'a' && !onLeaveIds?.has(a.empId?.toLowerCase())).length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', fontSize: 13 }}>
                   <CheckCircle size={24} color="var(--green)" style={{ display: 'block', margin: '0 auto 8px' }} />
                   No critical absentees.
                </div>
              )}
            </div>
          </div>

          {/* New Active Leaves Section */}
          <div className="card" style={{ padding: 24, borderRadius: 24 }}>
            <h3 style={{ margin: '0 0 24px 0', fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Users size={18} color="var(--blue)" /> Currently On Leave
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {activeLeaves.map(emp => (
                <Link to={`/employees/${emp.id}`} key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'inherit' }}>
                  <div className="avatar avatar-sm" style={{ background: emp.color || 'var(--accent)', borderRadius: 10 }}>
                    {emp.av || emp.name?.substring(0,2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{emp.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{emp.dept} • On Leave</div>
                  </div>
                </Link>
              ))}
              {activeLeaves.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)', fontSize: 12 }}>
                  No employees are out on leave today.
                </div>
              )}
            </div>
          </div>

          <div className="card" style={{ padding: 24, borderRadius: 24 }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Clock size={18} color="var(--blue)" /> Leave Queue
              </h3>
              <Link to="/leaves" style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', textDecoration: 'none' }}>All ({pendingLeaves})</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {leaves.filter(l => l.status?.toLowerCase() === 'pending').slice(0, 3).map((leave, i) => (
                <div key={i} style={{ padding: 14, background: 'var(--bg-elevated)', borderRadius: 16, border: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{leave.empName}</div>
                    <div style={{ display: 'flex', gap: 4 }}>
                       <button className="btn btn-icon btn-sm" style={{ width: 28, height: 28, background: 'var(--green-dim)', color: 'var(--green)' }} onClick={() => onApproveLeave(leave.id)}><CheckCircle size={14} /></button>
                       <button className="btn btn-icon btn-sm" style={{ width: 28, height: 28, background: 'var(--red-dim)', color: 'var(--red)' }} onClick={() => onRejectLeave(leave.id)}><AlertTriangle size={14} /></button>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontStyle: 'italic' }}>"{leave.reason}"</div>
                </div>
              ))}
              {pendingLeaves === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px' }}>
                  No pending requests.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Broadcast Modal */}
      {showBroadcast && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }} onClick={() => setShowBroadcast(false)}>
          <div className="modal-content card animate-in" style={{ width: '100%', maxWidth: 500, padding: 32, borderRadius: 24, background: 'var(--bg-card)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
               <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--accent-glow)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Send size={22} />
               </div>
               <div>
                  <h2 style={{ fontSize: 24, fontWeight: 800 }}>Broadcast Hub</h2>
                  <p style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>Send instant message to all verified employees</p>
               </div>
            </div>

            <form onSubmit={handleBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label className="label">Recipients Scope</label>
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button type="button" onClick={() => setBroadcastData({...broadcastData, recipients: 'all'})} className={`btn btn-sm ${broadcastData.recipients === 'all' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1 }}>All Staff</button>
                  <button type="button" onClick={() => setBroadcastData({...broadcastData, recipients: 'developer'})} className={`btn btn-sm ${broadcastData.recipients === 'developer' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1 }}>Developers</button>
                  <button type="button" onClick={() => setBroadcastData({...broadcastData, recipients: 'operations'})} className={`btn btn-sm ${broadcastData.recipients === 'operations' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1 }}>Operations</button>
                </div>
              </div>

              <div>
                <label className="label">Your Announcement</label>
                <textarea 
                  className="input" 
                  rows={5} 
                  placeholder="Type your message here... emojis and HTML tags supported." 
                  value={broadcastData.message}
                  onChange={e => setBroadcastData({...broadcastData, message: e.target.value})}
                  required 
                  style={{ resize: 'none', padding: 16 }}
                />
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8, fontWeight: 600 }}>Message will be delivered via Telegram to {broadcastData.recipients === 'all' ? 'all' : broadcastData.recipients} registered members.</div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowBroadcast(false)}>Discard</button>
                <button type="submit" className="btn btn-premium" style={{ flex: 1.5 }}>
                  <Send size={16} /> DISPATCH MESSAGE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
