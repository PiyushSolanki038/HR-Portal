import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useScreenSize } from '../../hooks/useScreenSize'
import StatCard from '../ui/StatCard'
import ActivityFeed from '../ui/ActivityFeed'
import AIInsightEngine from './AIInsightEngine'
import TeamAvailabilityGrid from './TeamAvailabilityGrid'
import PerformanceLeaderboard from './PerformanceLeaderboard'
import BroadcastModal from './BroadcastModal'
import SystemStatusBadge from './SystemStatusBadge'
import GlobalSearch from './GlobalSearch'
import { 
  Users, Clock, CalendarOff, AlertTriangle, CheckCircle, 
  TrendingUp, Bell, Zap, Star, Award, UserPlus, FileText, Send,
  Search, Shield, Settings, Database, Heart, MessageSquare
} from 'lucide-react'

export default function HRDashboardView({ 
  stats, employees, allEmployees, attendance, leaves, onLeaveIds, 
  presentToday = [], remainingToday = [], systemHealth, availabilityMap, leaderboard, sentimentStats,
  onRemindAbsent, onRemindAllAbsent, onApproveLeave, onRejectLeave, onBroadcast, onSentimentSurvey
}) {
  const { isMobile, isTablet, isDesktop } = useScreenSize()
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false)
  
  const { total, present, late, absent, pending, onLeave, pendingLeaves } = stats

  const activeLeaves = (employees || []).filter(e => onLeaveIds?.has(e.id?.toLowerCase()))
  
  // Dynamic Spotlight: Find Top Performer
  const topEmp = [...(employees || [])].sort((a,b) => (parseFloat(b.score) || 0) - (parseFloat(a.score) || 0))[0] || { name: '—', av: '??', role: '—', score: 0, color: 'var(--accent)' }

  return (
    <div className="hr-dashboard animate-in" style={{ paddingBottom: 60, padding: isMobile ? 12 : 32, maxWidth: '1440px', margin: '0 auto' }}>
      {/* ─── Executive Top Bar ─── */}
      <div style={{ marginBottom: 40, display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: 'center', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <h1 className="glow-text" style={{ fontSize: isMobile ? 24 : 32, fontWeight: 900, margin: 0, letterSpacing: -1 }}>COMMAND CENTER 4.0</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
            <p className="subtitle" style={{ fontSize: 11, fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.6 }}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 10px var(--accent)' }} />
            <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1 }}>Security Level: Administrator</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexShrink: 0 }}>
          {!isMobile && (
            <div style={{ width: 340 }}>
              <GlobalSearch allEmployees={allEmployees} />
            </div>
          )}
          {!isMobile && <SystemStatusBadge health={systemHealth} />}
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary btn-icon" onClick={onRemindAllAbsent} title="Nudge All"><Bell size={18} /></button>
            <button className="btn btn-primary" onClick={() => setIsBroadcastOpen(true)} style={{ padding: '0 24px', height: 44, borderRadius: 12, gap: 10, fontWeight: 900, fontSize: 13 }}>
              <Send size={16} /> BROADCAST
            </button>
          </div>
        </div>
      </div>

      {/* ─── Vital Stats ─── */}
      <div className="stats-grid" style={{ 
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 16,
        marginBottom: 40 
      }}>
        <StatCard title="WORKFORCE" value={total} icon={Users} color="var(--accent)" />
        <StatCard title="ACTIVE" value={present} change={`${total ? Math.round((present / total) * 100) : 0}%`} icon={CheckCircle} color="var(--green)" />
        <StatCard title="LATE" value={late} icon={Clock} color="var(--amber)" />
        <StatCard title="ABSENT" value={absent} icon={AlertTriangle} color="var(--red)" />
        <StatCard title="PENDING" value={pending} icon={Clock} color="var(--purple)" />
        <StatCard title="ON LEAVE" value={onLeave} icon={CalendarOff} color="var(--blue)" />
      </div>

      {/* ─── Strategic Split Grid ─── */}
      <div className={isMobile ? '' : 'layout-grid-desktop'}>
        
        {/* Left Column: Strategic Intelligence Hub */}
        <div className="intelligence-hub">
          <div className="section-header">
            <Zap size={16} color="var(--accent)" />
            <h2>Strategic Intelligence</h2>
            <div className="line" />
          </div>

          <AIInsightEngine 
            stats={stats} 
            employees={employees} 
            attendance={attendance} 
            leaves={leaves} 
            onLeaveIds={onLeaveIds} 
          />

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1.2fr', gap: 24 }}>
            <div className="card-premium super-glass" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Heart size={16} color="var(--purple)" /> Sentiment Pulse
                </h3>
                <div className="badge" style={{ background: 'var(--purple-dim)', color: 'var(--purple)', fontSize: 9 }}>REALTIME</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                 {[
                   { label: 'Pos', val: sentimentStats?.positive, color: 'var(--green)' },
                   { label: 'Neu', val: sentimentStats?.neutral, color: 'var(--amber)' },
                   { label: 'Con', val: sentimentStats?.concerned, color: 'var(--red)' }
                 ].map(s => (
                   <div key={s.label} style={{ flex: 1, textAlign: 'center', padding: '12px 8px', background: 'rgba(0,0,0,0.03)', borderRadius: 12 }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: s.color }}>{s.val || 0}</div>
                      <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>{s.label}</div>
                   </div>
                 ))}
              </div>
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>Performance Index:</span>
                <span style={{ fontSize: 14, fontWeight: 900 }}>{sentimentStats?.overall || 0}%</span>
              </div>
            </div>
            
            <PerformanceLeaderboard leaderboard={leaderboard} />
          </div>

          <TeamAvailabilityGrid 
            availabilityMap={availabilityMap} 
            totalEmployees={allEmployees.length}
          />
        </div>

        {/* Right Column: Operational Pulse Center */}
        <div className="operations-pulse">
          <div className="section-header">
            <Clock size={16} color="var(--blue)" />
            <h2>Operational Pulse</h2>
            <div className="line" />
          </div>

          {/* Daily Oversight Tab-Card */}
          <div className="card-premium" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>ATTENDANCE OVERSIGHT</h3>
              <div style={{ display: 'flex', gap: 6 }}>
                <div className="badge badge-green" style={{ fontSize: 9 }}>{presentToday.length} P</div>
                <div className="badge badge-amber" style={{ fontSize: 9 }}>{remainingToday.length} W</div>
              </div>
            </div>
            <div style={{ padding: 20, maxHeight: 400, overflowY: 'auto' }} className="custom-scrollbar">
              {remainingToday.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 10, fontWeight: 900, color: 'var(--amber)', marginBottom: 12, textTransform: 'uppercase' }}>Missing Reports</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {remainingToday.slice(0, 8).map(emp => (
                      <div key={emp.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 10, background: 'rgba(217, 119, 6, 0.05)', border: '1px solid rgba(217, 119, 6, 0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: emp.color || 'var(--muted)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800 }}>{emp.av || emp.name?.[0]}</div>
                          <span style={{ fontSize: 12, fontWeight: 700 }}>{emp.name}</span>
                        </div>
                        <button onClick={() => onRemindAbsent(emp.id)} style={{ padding: '4px 8px', fontSize: 9, fontWeight: 900, color: 'var(--amber)', background: 'transparent', border: '1px solid var(--amber)', borderRadius: 6 }}>NUDGE</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {presentToday.length > 0 && (
                <div>
                  <p style={{ fontSize: 10, fontWeight: 900, color: 'var(--green)', marginBottom: 12, textTransform: 'uppercase' }}>Recent Check-ins</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {presentToday.slice(0, 10).map(emp => (
                      <div key={emp.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 10, background: 'rgba(22, 163, 74, 0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: emp.color || 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800 }}>{emp.av || emp.name?.[0]}</div>
                          <span style={{ fontSize: 12, fontWeight: 600 }}>{emp.name}</span>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 800, color: emp.status === 'l' ? 'var(--amber)' : 'var(--green)' }}>{emp.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Nav Executive Hub */}
          <div className="card-premium super-glass" style={{ padding: 24 }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: 14, fontWeight: 800 }}>QUICK NAVIGATION</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Employees', to: '/employees', icon: Users, color: 'var(--accent)' },
                { label: 'Approvals', to: '/leaves', icon: CheckCircle, color: 'var(--blue)' },
                { label: 'Audit Logs', to: '/audit', icon: Database, color: 'var(--amber)' },
                { label: 'Messaging', onClick: () => setIsBroadcastOpen(true), icon: Send, color: 'var(--purple)' },
              ].map(action => (
                action.to ? (
                  <Link key={action.label} to={action.to} style={{ 
                    padding: 16, display: 'flex', flexDirection: 'column', gap: 12, background: 'rgba(255,255,255,0.4)', borderRadius: 16, border: '1px solid var(--line)'
                  }}>
                    <action.icon size={18} color={action.color} />
                    <span style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text)' }}>{action.label}</span>
                  </Link>
                ) : (
                  <div key={action.label} onClick={action.onClick} style={{ 
                    padding: 16, display: 'flex', flexDirection: 'column', gap: 12, background: 'rgba(255,255,255,0.4)', borderRadius: 16, border: '1px solid var(--line)', cursor: 'pointer'
                  }}>
                    <action.icon size={18} color={action.color} />
                    <span style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text)' }}>{action.label}</span>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Activity Mini Feed */}
          <div className="card-premium" style={{ padding: 24 }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: 14, fontWeight: 800 }}>LIVE ACTIVITY</h3>
            <ActivityFeed limit={4} />
          </div>
        </div>
      </div>

      <BroadcastModal 
        isOpen={isBroadcastOpen} 
        onClose={() => setIsBroadcastOpen(false)}
        onSend={onBroadcast}
        allEmployees={allEmployees}
      />
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
      `}</style>
    </div>
  )
}
