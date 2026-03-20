import { useData } from '../context/DataContext'
import { useScreenSize } from '../hooks/useScreenSize'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { 
  Users, Clock, Calendar, CalendarOff, TrendingUp, Award, Activity, 
  CheckCircle, Target, Briefcase, Zap, Star, ArrowUpRight,
  ShieldCheck, AlertTriangle, IndianRupee, BarChart3, PieChart,
  ZapOff, MoreVertical, RefreshCw
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import { useMemo } from 'react'

const StatRing = ({ value, label, sub, color, size = 120 }) => {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;

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
          <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--text)' }}>{value}{value <= 100 ? '%' : ''}</div>
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
  if (!data?.length) return null;
  const max = Math.max(...data, 1);
  const points = data.map((d, i) => `${(i / (data.length - 1)) * 100},${100 - (d / max) * 100}`).join(' ');
  
  return (
    <svg width="100%" height={height} viewBox="0 0 100 100" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
      <path d={`M ${points}`} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M ${points} V 100 H 0 Z`} fill={`url(#grad-${color.replace('#','')})`} opacity="0.15" />
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
  const { isMobile, isTablet, isDesktop } = useScreenSize()
  const { user } = useAuth()
  const { 
    employees, attendance, leaves, tasks, 
    governance, waivers, attendanceSummary, 
    loading, error, refresh 
  } = useData()

  const role = user?.role?.toLowerCase() || ''
  const canAccess = role === 'hr manager' || role === 'admin'
  
  const analyticsData = useMemo(() => {
    if (loading) return null;

    const activeEmps = employees.filter(e => {
        const r = (e.role || '').toLowerCase()
        const n = (e.name || '').toLowerCase()
        const isExcluded = r.includes('admin') || r.includes('head') || r.includes('owner') || r.includes('hr manager') || n.includes('shreyansh') || n.includes('ankur')
        return e.status !== 'inactive' && !isExcluded
    })
    const total = activeEmps.length
    const now = new Date()
    const currentMonthLabel = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    
    // 1. Attendance Intelligence
    const filteredSummaries = activeEmps.map(e => attendanceSummary[e.id] || { score: 0 })
    const avgAttendance = total ? Math.round(filteredSummaries.reduce((s, a) => s + (a.score || 0), 0) / total) : 0
    const organizationHealth = avgAttendance

    // 2. Financial Pulse (Fiscal Discipline)
    const currentMonthGov = governance.filter(g => {
        const d = new Date(g.date)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && g.type === 'disciplinary'
    })
    const totalPenalties = currentMonthGov.reduce((sum, g) => sum + (parseFloat(g.penalty) || 0), 0)
    
    const currentMonthWaivers = waivers.filter(w => String(w.month).trim() === currentMonthLabel)
    const totalWaivers = currentMonthWaivers.reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0)
    
    const fiscalRecoveryRate = totalPenalties > 0 
        ? Math.round(((totalPenalties - totalWaivers) / totalPenalties) * 100) 
        : 100

    // 3. Operational Velocity
    const completedTasks = tasks.filter(t => t.status?.toLowerCase() === 'completed').length
    const totalTasks = tasks.length
    const taskVelocity = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    
    // 4. Workforce Attendance Heatmap (Last 14 Days)
    const heatmapDays = []
    const dh = new Date()
    for (let i = 0; i < 14; i++) {
        const dateStr = dh.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
        heatmapDays.unshift({
            date: dateStr,
            label: dh.toLocaleDateString('en-IN', { weekday: 'narrow' }),
            dayNum: dh.getDate()
        })
        dh.setDate(dh.getDate() - 1)
    }

    const heatmapData = activeEmps.map(emp => {
        const summary = attendanceSummary[emp.id] || { score: 0 }
        const days = heatmapDays.map(hd => {
            const rec = attendance.find(a => a.empId === emp.id && a.date === hd.date)
            const onLeave = leaves.find(l => 
                l.empId === emp.id && 
                (l.status?.toLowerCase() === 'approved' || l.approvedBy) &&
                hd.date >= l.startDate && hd.date <= l.endDate
            )
            
            let status = 'none'
            if (rec) status = rec.status === 'p' ? 'present' : 'late'
            else if (onLeave) status = 'leave'
            else if (hd.date < new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })) status = 'absent'
            
            return { date: hd.date, status }
        })
        return { id: emp.id, name: emp.name, av: emp.av, score: summary.score, days }
    })

    // 5. Intelligent Performance Scoring (Composite)
    const topPerformers = activeEmps
        .map(e => {
            const summary = attendanceSummary[e.id] || {}
            const empTasks = tasks.filter(t => t.assignedTo === e.name || t.id === e.id)
            const empCompleted = empTasks.filter(t => t.status?.toLowerCase() === 'completed').length
            const taskRate = empTasks.length > 0 ? Math.round((empCompleted / empTasks.length) * 100) : 100
            const lRate = leaves.filter(l => l.empId === e.id && (l.status?.toLowerCase() === 'approved' || l.approvedBy)).length
            
            const attendanceWeight = (summary.score || 0) * 0.4
            const taskWeight = taskRate * 0.4
            const leavePenalty = Math.max(0, 20 - (lRate * 5))
            
            const composite = Math.round(attendanceWeight + taskWeight + leavePenalty)
            
            // Build Verdict Reasoning
            let reason = "Exceptional all-rounder"
            let digest = "Demonstrating consistent operational synergy across all key performance indicators."
            
            if (taskRate >= 95 && (summary.score || 0) >= 95) {
                reason = "Pillar of Excellence"
                digest = `${e.name} has achieved a near-perfect equilibrium between mission-critical task execution and unwavering physical presence.`
            } else if (taskRate >= 90) {
                reason = "Execution Specialist"
                digest = "Primary driver of departmental velocity with a high volume of successfully closed operations."
            } else if ((summary.score || 0) >= 95) {
                reason = "Attendance Anchor"
                digest = "Providing a stable operational foundation for the team through flawless reliability and presence."
            } else if (lRate === 0) {
                reason = "Maximum Availability"
                digest = "Exceptional commitment to system availability with zero recorded downtime or leaves this cycle."
            }

            return { 
                ...e, 
                score: composite, 
                reason,
                digest,
                metrics: { att: summary.score || 0, task: taskRate, leaves: lRate } 
            }
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)

    return {
        total, avgAttendance, organizationHealth, taskVelocity,
        totalPenalties, totalWaivers, fiscalRecoveryRate,
        topPerformers, heatmapData, heatmapDays,
        pendingLeaves: leaves.filter(l => l.status?.toLowerCase() === 'pending').length
    }
  }, [employees, attendance, leaves, tasks, governance, waivers, attendanceSummary, loading])

  const handleGenerateReport = () => {
    if (!analyticsData) return;

    const rows = [];
    
    // 1. KPI SECTION
    rows.push(['ADMIN INTELLIGENCE SYSTEM REPORT']);
    rows.push([`Generated on: ${new Date().toLocaleString()}`]);
    rows.push([]);
    rows.push(['KPI OVERVIEW']);
    rows.push(['Metric', 'Value', 'Context']);
    rows.push(['Workforce Strength', analyticsData.total, 'Active Personnel']);
    rows.push(['Attendance Pulse', `${analyticsData.avgAttendance}%`, 'Organization-wide Presence']);
    rows.push(['Fiscal Pipeline', `INR ${analyticsData.totalPenalties}`, 'Monthly Penalties']);
    rows.push(['Fiscal Recovery', `${analyticsData.fiscalRecoveryRate}%`, 'Effective Recovery']);
    rows.push(['Operational Velocity', `${analyticsData.taskVelocity}%`, 'Project Efficiency']);
    rows.push([]);
    
    // 2. TOP PERFORMERS section
    rows.push(['ELITE PERFORMANCE CLUSTER']);
    rows.push(['Rank', 'Name', 'Score', 'Verdict', 'Attendance', 'Tasks', 'Leaves']);
    analyticsData.topPerformers.forEach((emp, i) => {
        rows.push([
            i + 1,
            emp.name,
            emp.score,
            emp.reason,
            `${emp.metrics.att}%`,
            `${emp.metrics.task}%`,
            emp.metrics.leaves
        ]);
    });
    rows.push([]);
    
    // 3. HEATMAP SUMMARY section
    rows.push(['14-DAY ATTENDANCE DIAGNOSTIC']);
    const headerRow = ['Employee', 'Att %'];
    analyticsData.heatmapDays.forEach(d => headerRow.push(d.date));
    rows.push(headerRow);
    
    analyticsData.heatmapData.forEach(emp => {
        const row = [emp.name, `${emp.score}%`];
        emp.days.forEach(d => row.push(d.status.toUpperCase()));
        rows.push(row);
    });

    const csvContent = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Intelligence_Report_${new Date().toLocaleDateString('en-CA')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!canAccess) return <Navigate to="/" replace />
  if (loading || !analyticsData) return <LoadingSpinner />
  if (error) return <div className="p-6">Error: {error}</div>

  const {
    total, avgAttendance, organizationHealth, taskVelocity,
    totalPenalties, totalWaivers, fiscalRecoveryRate,
    topPerformers, pendingLeaves, heatmapData, heatmapDays
  } = analyticsData

  return (
    <div className="animate-in" style={{ padding: isMobile ? 16 : 32, paddingBottom: 100, background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Dynamic Command Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, flexWrap: 'wrap', gap: 20 }}>
        <div>
          <h1 className="glow-text" style={{ fontSize: isMobile ? 26 : 40, fontWeight: 900, letterSpacing: -1 }}>Admin Intelligence</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, fontWeight: 600, marginTop: 4 }}>
            System Diagnostic: <span style={{ color: 'var(--green)' }}>Operational</span> • Last Sync: {new Date().toLocaleTimeString()}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => refresh()} className="btn btn-secondary" style={{ borderRadius: 14, padding: '12px 20px' }}>
                <RefreshCw size={18} />
            </button>
            <button onClick={handleGenerateReport} className="btn btn-primary" style={{ borderRadius: 14, padding: '12px 24px', fontWeight: 800 }}>
                <Activity size={18} /> GENERATE REPORT
            </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: 24, marginBottom: 24 }}>
          {[
              { label: 'Workforce Hub', val: total, sub: 'Active Personnel', icon: Users, color: 'var(--blue)' },
              { label: 'Fiscal Pipeline', val: `₹${totalPenalties.toLocaleString('en-IN')}`, sub: 'Monthly Penalties', icon: IndianRupee, color: 'var(--red)' },
              { label: 'Pardon Flow', val: `₹${totalWaivers.toLocaleString('en-IN')}`, sub: 'Active Waivers', icon: ShieldCheck, color: 'var(--green)' },
              { label: 'Operational Sync', val: `${taskVelocity}%`, sub: 'Project Velocity', icon: Zap, color: 'var(--purple)' },
          ].map((kpi, idx) => (
              <div key={idx} className="super-glass" style={{ padding: 24, borderRadius: 24, border: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${kpi.color}15`, color: kpi.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <kpi.icon size={22} />
                      </div>
                      <MoreVertical size={16} color="var(--muted)" style={{ cursor: 'pointer' }} />
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 900 }}>{kpi.val}</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>{kpi.label}</div>
                  <div style={{ fontSize: 11, color: kpi.color, fontWeight: 700, marginTop: 12 }}>{kpi.sub}</div>
              </div>
          ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.8fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Behavior & Presence Dashboard */}
        <div className="card-premium" style={{ background: '#fff', border: '1px solid var(--line)', padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
                <div>
                    <h3 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>Operational Health Index</h3>
                    <p style={{ fontSize: 13, color: 'var(--muted)', margin: '4px 0 0 0' }}>Behavioral consistency vs presence rate</p>
                </div>
                <div style={{ display: 'flex', gap: 24 }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)' }}>STABILITY</div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--green)' }}>HIGH</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)' }}>TREND</div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--accent)' }}>+4.2%</div>
                    </div>
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: isMobile ? 32 : 16, flexWrap: 'wrap' }}>
                <StatRing value={avgAttendance} label="Attendance Pulse" sub="Presence Velocity" color="var(--accent)" />
                <StatRing value={organizationHealth} label="Behavioral Score" sub="Compliance Rating" color="var(--green)" />
                <StatRing value={fiscalRecoveryRate} label="Fiscal Recovery" sub="Penalties Recouped" color="var(--red)" />
                <StatRing value={taskVelocity} label="Task Momentum" sub="Completion Index" color="var(--purple)" />
            </div>
        </div>

        {/* Critical Intervention Module */}
        <div className="card-premium" style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', color: '#fff' }}>
           <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', opacity: 0.8 }}>
                <Zap size={14} /> Intelligence Alert
              </div>
              <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1 }}>{pendingLeaves}</div>
              <div style={{ fontSize: 18, fontWeight: 800, marginTop: 8 }}>Requests Pending Approval</div>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.2)', margin: '20px 0' }} />
              <p style={{ fontSize: 13, opacity: 0.9, lineHeight: 1.6 }}>System suggests immediate processing to avoid departmental burnout and maintain velocity.</p>
              <button className="btn" style={{ background: '#fff', color: '#2563eb', fontWeight: 900, marginTop: 24, borderRadius: 12, width: '100%' }}>REVIEW PIPELINE</button>
           </div>
           <PieChart size={180} style={{ position: 'absolute', right: -40, bottom: -40, opacity: 0.15, transform: 'rotate(-20deg)' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr', gap: 24, marginBottom: 24 }}>
          {/* Workforce Attendance Heatmap - ELITE EDITION */}
          <div className="super-glass" style={{ padding: 24, borderRadius: 28, border: '1px solid var(--line)', background: 'var(--bg-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Calendar size={18} color="var(--accent)" /> Workforce Diagnostic Heatmap
                    </h3>
                    <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, fontWeight: 600 }}>14-Day Presence & Velocity Analysis</p>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                    {[
                        { label: 'Pres', color: '#22c55e' },
                        { label: 'Late', color: '#f59e0b' },
                        { label: 'Abs', color: '#ef4444' },
                        { label: 'Lv', color: '#8b5cf6' }
                    ].map(s => (
                        <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.color }} />
                            <span style={{ fontSize: 8, fontWeight: 900, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ overflowY: 'auto', maxHeight: 420, paddingRight: 4 }} className="custom-scrollbar">
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '0 0 8px 4px', fontSize: 9, fontWeight: 900, color: 'var(--muted)', textTransform: 'uppercase' }}>Personnel</th>
                            <th style={{ textAlign: 'right', padding: '0 12px 8px 0', fontSize: 9, fontWeight: 900, color: 'var(--muted)', textTransform: 'uppercase' }}>Att %</th>
                            <th style={{ padding: '0 0 8px 0', textAlign: 'right' }}>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 3 }}>
                                    {heatmapDays.map((d, di) => (
                                        <div key={di} style={{ width: 14, textAlign: 'center', fontSize: 8, fontWeight: 900, color: 'var(--muted)', opacity: 0.5 }}>{d.label}</div>
                                    ))}
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {heatmapData.map(emp => (
                            <tr key={emp.id} style={{ background: 'rgba(0,0,0,0.02)', borderRadius: 12 }} className="hover-scale">
                                <td style={{ padding: '10px 12px', borderRadius: '12px 0 0 12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--bg-elevated)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900 }}>
                                            {emp.av}
                                        </div>
                                        <span style={{ fontSize: 12, fontWeight: 800 }}>{emp.name}</span>
                                    </div>
                                </td>
                                <td style={{ textAlign: 'right', padding: '0 12px' }}>
                                    <span style={{ fontSize: 11, fontWeight: 900, color: emp.score >= 90 ? 'var(--green)' : emp.score >= 75 ? 'var(--orange)' : 'var(--red)' }}>
                                        {emp.score}%
                                    </span>
                                </td>
                                <td style={{ padding: '10px 4px', borderRadius: '0 12px 12px 0', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 3 }}>
                                        {emp.days.map((day, di) => (
                                            <div 
                                                key={di} 
                                                title={`${day.date}: ${day.status}`}
                                                style={{ 
                                                    width: 14, height: 14, borderRadius: 3,
                                                    background: day.status === 'present' ? '#22c55e' : 
                                                                day.status === 'late' ? '#f59e0b' : 
                                                                day.status === 'absent' ? '#ef4444' : 
                                                                day.status === 'leave' ? '#8b5cf6' : 'rgba(0,0,0,0.05)',
                                                    boxShadow: day.status !== 'none' ? `0 2px 4px ${day.status === 'present' ? '#22c55e20' : '#0001'}` : 'none'
                                                }}
                                            />
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>

          {/* Performance Cluster */}
          <div className="super-glass" style={{ padding: 24, borderRadius: 28, border: '1px solid var(--line)', background: 'var(--bg-card)' }}>
            <h3 style={{ margin: '0 0 24px 0', fontSize: 16, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Award size={20} color="var(--accent)" /> Elite Performance Cluster
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {topPerformers.map((emp, i) => (
                    <div key={emp.id} style={{ 
                        display: 'flex', 
                        flexDirection: i === 0 ? 'column' : 'row', 
                        gap: i === 0 ? 12 : 12, 
                        padding: i === 0 ? '20px' : '12px 16px', 
                        background: i === 0 ? 'var(--bg-elevated)' : 'rgba(0,0,0,0.015)', 
                        borderRadius: 16, 
                        border: i === 0 ? '1.5px solid var(--accent)' : '1px solid var(--line)', 
                        position: 'relative', 
                        overflow: 'hidden',
                        transition: 'all 0.3s'
                    }} className="hover-scale">
                        {i === 0 && <div style={{ position: 'absolute', top: 0, right: 0, padding: '4px 10px', background: 'var(--accent)', color: '#fff', fontSize: 8, fontWeight: 900, borderRadius: '0 0 0 10px', letterSpacing: 1 }}>SYSTEM MVP</div>}
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                            <div style={{ width: i === 0 ? 36 : 30, height: i === 0 ? 36 : 30, borderRadius: 10, background: emp.color || 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: i === 0 ? 14 : 12 }}>
                                {emp.av}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 14, fontWeight: 900 }}>{emp.name}</div>
                                <div style={{ fontSize: 8, color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 1 }}>{emp.reason}</div>
                            </div>
                            {i !== 0 && (
                                <div style={{ textAlign: 'right', display: 'flex', gap: 12, marginRight: 16 }}>
                                    <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--green)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <span>{emp.metrics?.att}%</span>
                                        <span style={{ fontSize: 6, opacity: 0.6 }}>PRESENCE</span>
                                    </div>
                                    <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--purple)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <span>{emp.metrics?.task}%</span>
                                        <span style={{ fontSize: 6, opacity: 0.6 }}>VELOCITY</span>
                                    </div>
                                </div>
                            )}
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: i === 0 ? 20 : 16, fontWeight: 900, color: 'var(--green)', letterSpacing: -1 }}>{emp.score}</div>
                            </div>
                        </div>

                        {i === 0 && (
                             <div style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.03)', borderRadius: 12, border: '1px solid var(--line)' }}>
                                <p style={{ fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.5, margin: 0, fontWeight: 500 }}>{emp.digest}</p>
                             </div>
                        )}
                        
                        {i === 0 && (
                            <div style={{ display: 'flex', gap: 12 }}>
                                <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--muted)' }}>ATT: {emp.metrics?.att}%</span>
                                <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--muted)' }}>TASKS: {emp.metrics?.task}%</span>
                                <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--red)' }}>LEAVES: {emp.metrics?.leaves}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
          </div>
      </div>
    </div>
  )
}
