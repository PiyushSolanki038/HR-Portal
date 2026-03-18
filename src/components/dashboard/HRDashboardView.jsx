import { Link } from 'react-router-dom'
import StatCard from '../ui/StatCard'
import ActivityFeed from '../ui/ActivityFeed'
import { 
  Users, Clock, CalendarOff, AlertTriangle, CheckCircle, 
  TrendingUp, Bell, Zap, Star, Award, UserPlus, FileText, Send
} from 'lucide-react'

export default function HRDashboardView({ stats, employees, attendance, leaves, onLeaveIds, onRemindAbsent, onRemindAllAbsent, onApproveLeave, onRejectLeave }) {
  const { total, present, late, absent, onLeave, pendingLeaves } = stats

  const activeLeaves = (employees || []).filter(e => onLeaveIds?.has(e.id?.toLowerCase()))
  
  // Dynamic Spotlight: Find Top Performer
  const topEmp = [...(employees || [])].sort((a,b) => (parseFloat(b.score) || 0) - (parseFloat(a.score) || 0))[0] || { name: '—', av: '??', role: '—', score: 0, color: 'var(--accent)' }

  return (
    <div className="hr-dashboard animate-in" style={{ paddingBottom: 40 }}>
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div>
          <h1 className="glow-text" style={{ fontSize: 32, fontWeight: 900 }}>HR Command Center</h1>
          <p className="subtitle">Real-time organizational intelligence — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" onClick={onRemindAllAbsent}>
            <Bell size={16} /> Remind Absent
          </button>
          <button className="btn btn-primary" style={{ boxShadow: 'var(--shadow-glow)' }}>
            <Send size={16} /> Broadcast Hub
          </button>
        </div>
      </div>

      {/* Premium Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Register Employee', icon: UserPlus, to: '/employees', color: 'var(--accent)' },
          { label: 'Review Leaves', icon: AlertTriangle, to: '/leaves', color: 'var(--blue)' },
          { label: 'Payroll Run', icon: FileText, to: '/finance', color: 'var(--green)' },
          { label: 'Governance', icon: Zap, to: '/disciplinary', color: 'var(--purple)' },
        ].map(action => (
          <Link key={action.label} to={action.to} className="card-premium" style={{ 
            padding: '20px', display: 'flex', alignItems: 'center', gap: 16, border: '1px solid var(--line)'
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
          title="Total Force"
          value={total}
          icon={Users}
          color="var(--accent)"
          bgColor="var(--accent-glow)"
        />
        <StatCard
          title="Active Now"
          value={present}
          change={`${total ? Math.round((present / total) * 100) : 0}% rate`}
          icon={CheckCircle}
          color="var(--green)"
          bgColor="var(--green-dim)"
        />
        <StatCard
          title="Late Alerts"
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
        <StatCard
          title="On Leave"
          value={onLeave}
          icon={CalendarOff}
          color="var(--blue)"
          bgColor="var(--blue-dim)"
        />
        <StatCard
          title="Leave Queue"
          value={pendingLeaves}
          icon={TrendingUp}
          color="var(--purple)"
          bgColor="var(--purple-dim)"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32 }}>
        {/* Left Column: Spotlight & Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* Spotlight Section */}
          <div className="card-premium" style={{ 
            padding: 40, background: 'var(--text)', color: 'var(--bg)', border: 'none'
          }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent)', marginBottom: 24 }}>
                 <Star size={16} fill="var(--accent)" />
                 <span style={{ fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5 }}>Employee Spotlight</span>
               </div>
               <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
                  <div style={{ width: 100, height: 100, borderRadius: 32, background: topEmp.color || 'var(--accent)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 900 }}>
                    {topEmp.av || topEmp.name?.substring(0,2).toUpperCase()}
                  </div>
                  <div>
                    <h2 style={{ fontSize: 32, fontWeight: 900, margin: 0 }}>{topEmp.name}</h2>
                    <p style={{ color: 'var(--accent)', margin: '8px 0 0 0', fontWeight: 700, fontSize: 16 }}>{topEmp.role}</p>
                  </div>
               </div>
               <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
                 <div className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>{topEmp.score}% Performance</div>
                 <div className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>Top Contributor</div>
               </div>
            </div>
            <Award size={200} style={{ position: 'absolute', right: -40, bottom: -40, opacity: 0.1, transform: 'rotate(-15deg)', color: '#fff' }} />
          </div>

          <div className="card-premium">
            <h3 style={{ margin: '0 0 24px 0', fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Zap size={20} color="var(--purple)" /> Intelligence Stream
            </h3>
            <ActivityFeed />
          </div>
        </div>

        {/* Right Column: Critical Attention & Leaves */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div className="card-premium">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertTriangle size={18} color="var(--red)" /> Critical Attention
              </h3>
            </div>
            <div className="table-container" style={{ border: 'none' }}>
               <table style={{ minWidth: 0 }}>
                  <tbody style={{ background: 'transparent' }}>
                    {attendance
                      .filter(a => a.status === 'a' && !onLeaveIds?.has(a.empId?.toLowerCase()))
                      .slice(0, 5)
                      .map((rec, i) => (
                        <tr key={i} style={{ background: 'transparent' }}>
                          <td style={{ padding: '12px 0', fontWeight: 700 }}>{rec.empName}</td>
                          <td style={{ padding: '12px 0', color: 'var(--muted)', fontSize: 12 }}>{rec.dept}</td>
                          <td style={{ padding: '12px 0', textAlign: 'right' }}>
                            <button className="btn btn-icon btn-sm" onClick={() => onRemindAbsent(rec.empId)}><Bell size={14} /></button>
                          </td>
                        </tr>
                      ))}
                    {attendance.filter(a => a.status === 'a' && !onLeaveIds?.has(a.empId?.toLowerCase())).length === 0 && (
                      <tr style={{ background: 'transparent' }}><td colSpan={3} style={{ textAlign: 'center', color: 'var(--muted)', padding: 40 }}>All clear today!</td></tr>
                    )}
                  </tbody>
               </table>
            </div>
          </div>

          <div className="card-premium">
            <h3 style={{ margin: '0 0 24px 0', fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Users size={18} color="var(--blue)" /> Currently Out
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {activeLeaves.map(emp => (
                <div key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="avatar avatar" style={{ background: emp.color || 'var(--accent)', borderRadius: 12, fontWeight: 800 }}>
                    {emp.av || emp.name?.substring(0,2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{emp.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{emp.dept} • On Leave</div>
                  </div>
                </div>
              ))}
              {activeLeaves.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)', fontSize: 13 }}>
                  No one is out today.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
