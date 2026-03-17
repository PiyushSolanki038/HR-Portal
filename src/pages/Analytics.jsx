import { useData } from '../context/DataContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { 
  Users, Clock, CalendarOff, TrendingUp, Award, Activity, 
  CheckCircle, Target, Briefcase, Zap, Star, ArrowUpRight
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'

const StatRing = ({ value, label, sub, color, size = 120 }) => {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="var(--bg-hover)" strokeWidth="8" />
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth="8" 
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--text)' }}>{value}%</div>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{label}</div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  )
}

const TrendLine = ({ data, color, height = 60 }) => {
  const max = Math.max(...data, 1);
  const points = data.map((d, i) => `${(i / (data.length - 1)) * 100},${100 - (d / max) * 100}`).join(' ');
  
  return (
    <svg width="100%" height={height} viewBox="0 0 100 100" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
      <path d={`M ${points}`} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M ${points} V 100 H 0 Z`} fill={`url(#grad-${color.replace('#','')})`} opacity="0.1" />
      <defs>
        <linearGradient id={`grad-${color.replace('#','')}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default function Analytics() {
  const { user } = useAuth()
  const { employees, attendance, leaves, attendanceSummary, loading, error } = useData()

  const role = user?.role?.toLowerCase() || ''
  const canAccess = role === 'hr manager' || role === 'admin'
  
  if (!canAccess) return <Navigate to="/" replace />
  if (loading) return <LoadingSpinner />
  if (error) return <div className="p-6">Error: {error}</div>

  const activeEmps = employees.filter(e => e.status !== 'inactive')
  const total = activeEmps.length
  const summaryList = Object.values(attendanceSummary || {})
  
  const avgOrgScore = total ? Math.round(summaryList.reduce((s, a) => s + (a.score || 0), 0) / total) : 0
  const avgAttendance = total ? Math.round(summaryList.reduce((s, a) => s + (a.presentRate || 0), 0) / total) : 0
  const pendingLeaves = leaves.filter(l => l.status?.toLowerCase() === 'pending').length
  
  const depts = [...new Set(activeEmps.map(e => e.dept).filter(Boolean))]
  const deptStats = depts.map(dept => {
    const deptEmps = activeEmps.filter(e => e.dept === dept)
    const deptScores = deptEmps.map(e => attendanceSummary[e.id]?.score || 0)
    const avg = deptScores.length ? Math.round(deptScores.reduce((a, b) => a + b, 0) / deptScores.length) : 0
    return { name: dept, count: deptEmps.length, avg }
  }).sort((a,b) => b.avg - a.avg)

  const topPerformers = [...activeEmps]
    .map(e => ({ ...e, score: attendanceSummary[e.id]?.score || 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  // Mock trend data
  const trendData = [65, 78, 72, 85, 82, 90, 88]

  return (
    <div className="animate-in" style={{ paddingBottom: 40 }}>
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div>
          <h1 className="glow-text" style={{ fontSize: 32, fontWeight: 900 }}>KPI & Intelligence</h1>
          <p className="subtitle">Real-time organizational performance & behavioral analytics</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
           <button className="btn btn-secondary"><Clock size={16} /> History</button>
           <button className="btn btn-premium"><Target size={16} /> Export Intelligence</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: 24, marginBottom: 24 }}>
        <div className="card card-glass" style={{ padding: 40, display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          <StatRing value={avgAttendance} label="Global Attendance" sub="Avg Present %" color="var(--accent)" />
          <div style={{ width: 1, height: 100, background: 'var(--line)', opacity: 0.5 }} />
          <StatRing value={avgOrgScore} label="Organization Score" sub="Health Index" color="var(--green)" />
          <div style={{ width: 1, height: 100, background: 'var(--line)', opacity: 0.5 }} />
          <StatRing value={92} label="Task Velocity" sub="On-time completion" color="var(--purple)" />
        </div>
        
        <div className="card card-glass" style={{ padding: 24, background: 'linear-gradient(135deg, var(--accent), #6366f1)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', opacity: 0.9 }}>
              <Zap size={14} /> Critical Alert
            </div>
            <div style={{ fontSize: 44, fontWeight: 900, marginBottom: 4 }}>{pendingLeaves}</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Leaves Awaiting Review</div>
            <p style={{ fontSize: 13, marginTop: 16, opacity: 0.9, lineHeight: 1.6 }}>Direct impact on departmental peak capacity detected. Review recommended within 2 hours.</p>
            <button className="btn btn-sm" style={{ marginTop: 24, background: '#fff', color: 'var(--accent)', fontWeight: 800 }}>TAKE ACTION</button>
          </div>
          <CalendarOff size={160} style={{ position: 'absolute', right: -30, bottom: -30, opacity: 0.1, transform: 'rotate(-15deg)' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Dept Matrix */}
        <div className="card card-glass" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Activity size={20} color="var(--accent)" /> Dept. Efficiency Matrix
            </h3>
            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', background: 'var(--bg-elevated)', padding: '6px 12px', borderRadius: 8 }}>MARCH 2026</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {deptStats.map(dept => (
              <div key={dept.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14 }}>
                  <div>
                    <span style={{ fontWeight: 800 }}>{dept.name}</span>
                    <span style={{ color: 'var(--muted)', marginLeft: 12, fontSize: 12, fontWeight: 600 }}>{dept.count} Active Members</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 900, color: dept.avg >= 80 ? 'var(--green)' : 'var(--amber)' }}>
                    {dept.avg}% <ArrowUpRight size={14} />
                  </div>
                </div>
                <div style={{ height: 8, background: 'var(--bg-elevated)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', width: `${dept.avg}%`, 
                    background: dept.avg >= 80 ? 'var(--green)' : dept.avg >= 60 ? 'var(--accent)' : 'var(--red)',
                    boxShadow: `0 0 10px ${dept.avg >= 80 ? 'var(--green)' : 'var(--accent)'}40`,
                    transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Trend */}
        <div className="card card-glass" style={{ padding: 24 }}>
           <h3 style={{ margin: '0 0 32px 0', fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
            <TrendingUp size={20} color="var(--purple)" /> Growth Velocity
          </h3>
          
          <div style={{ margin: '40px 0' }}>
            <TrendLine data={trendData} color="var(--accent)" height={120} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
             <div style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Avg Gain</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--green)', marginTop: 4 }}>+12.4%</div>
             </div>
             <div style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Stability</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--accent)', marginTop: 4 }}>High</div>
             </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24 }}>
        {/* Global Leaderboard */}
        <div className="card card-glass" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Star size={20} color="#FFD700" /> Elite Performance Circle
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {topPerformers.map((emp, i) => (
              <div key={emp.id} style={{ 
                display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', 
                background: i === 0 ? 'var(--accent-glow)' : 'var(--bg-elevated)', 
                borderRadius: 20, border: i === 0 ? '1px solid var(--accent)' : '1px solid var(--line)',
                transition: 'transform 0.2s'
              }} className="hover-scale">
                <div style={{ width: 40, height: 40, borderRadius: 12, background: emp.color || 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff' }}>
                  {emp.av || emp.name?.substring(0,2).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>{emp.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2, fontWeight: 600 }}>{emp.role}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: emp.score >= 80 ? 'var(--green)' : 'var(--accent)' }}>{emp.score || 0}</div>
                  <div style={{ fontSize: 9, fontWeight: 800, opacity: 0.6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Behavior Score</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Predictive Load */}
        <div className="card card-glass" style={{ padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h4 style={{ margin: 0, fontSize: 13, fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: 2 }}>System Presence Distribution</h4>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
            {[
              { label: 'Verified', val: attendance.filter(a => a.status === 'p').length, icon: CheckCircle, color: 'var(--green)' },
              { label: 'Delayed', val: attendance.filter(a => a.status === 'l').length, icon: Clock, color: 'var(--amber)' },
              { label: 'Approved', val: attendance.filter(a => a.status === 'leave').length, icon: Briefcase, color: 'var(--blue)' },
              { label: 'Idle', val: total - attendance.filter(a => a.status === 'p' || a.status === 'l' || a.status === 'leave').length, icon: Activity, color: 'var(--red)' },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div className="animate-float" style={{ color: stat.color, marginBottom: 12, display: 'flex', justifyContent: 'center' }}><stat.icon size={28} /></div>
                <div style={{ fontSize: 32, fontWeight: 900 }}>{stat.val}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8, fontWeight: 800, textTransform: 'uppercase' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
