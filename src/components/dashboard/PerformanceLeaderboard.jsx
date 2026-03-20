import { Trophy, TrendingDown, Star, AlertCircle } from 'lucide-react'

export default function PerformanceLeaderboard({ leaderboard }) {
  const top5 = leaderboard.slice(0, 5)
  const bottom5 = leaderboard.slice(-5).reverse()

  return (
    <div className="card-premium super-glass" style={{ padding: '24px', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h3 style={{ margin: 0, fontSize: 13, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
          <Trophy size={16} color="var(--accent)" /> Team Analytics
        </h3>
        <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 8px var(--green)' }} />
          LIVE RANKINGS
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, flex: 1 }}>
        {/* Top Performers */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <p style={{ fontSize: 10, fontWeight: 900, color: 'var(--accent)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1.5, opacity: 0.7 }}>Top Performers</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
            {top5.map((emp, i) => (
              <div key={emp.id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '10px 16px', 
                background: 'rgba(255,255,255,0.4)', 
                borderRadius: 12, 
                border: '1px solid rgba(255,255,255,0.5)',
                flex: 1
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--muted)', width: 14 }}>{i + 1}</span>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{emp.name}</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--green)' }}>{emp.score}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Performers / Coaching */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <p style={{ fontSize: 10, fontWeight: 900, color: 'var(--red)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1.5, opacity: 0.7 }}>Optimization Required</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
            {bottom5.map((emp, i) => (
              <div key={emp.id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '10px 16px', 
                background: 'rgba(255,255,255,0.25)', 
                borderRadius: 12, 
                border: '1px solid rgba(255,255,255,0.3)',
                flex: 1
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <TrendingDown size={14} color="var(--red)" />
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{emp.name}</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--red)', opacity: 0.8 }}>{emp.score}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
