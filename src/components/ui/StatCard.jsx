import Sparkline from './Sparkline'

export default function StatCard({ title, value, change, icon: Icon, color, bgColor, trend = [] }) {
  return (
    <div className="stat-card" style={{ 
      '--stat-accent': color, 
      borderRadius: 20, 
      position: 'relative', 
      overflow: 'hidden',
      padding: '24px',
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.45) 100%)',
      backdropFilter: 'blur(40px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.6)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: 140,
      boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.08)',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      <div className="stat-info" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ 
              fontSize: 11, 
              letterSpacing: 2, 
              fontWeight: 800, 
              textTransform: 'uppercase', 
              color: 'var(--text)', 
              opacity: 0.5, 
              margin: 0 
            }}>{title}</h3>
            <div className="stat-value" style={{ 
              fontSize: 36, 
              fontWeight: 900, 
              margin: '8px 0', 
              letterSpacing: -1,
              color: 'var(--text)',
              lineHeight: 1
            }}>{value}</div>
            
            {change && (
              <div className="stat-change" style={{ 
                fontSize: 12, 
                fontWeight: 800, 
                color: change.includes('+') ? 'var(--green)' : 'var(--muted)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                marginTop: 4
              }}>
                {change}
                <span style={{ fontSize: 10, opacity: 0.6, fontWeight: 700 }}>VS LAST WEEK</span>
              </div>
            )}
          </div>
          
          {Icon && (
            <div className="stat-icon" style={{ 
              background: bgColor || `${color}15`, 
              color: color || 'var(--accent)',
              width: 48, height: 48, borderRadius: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 8px 24px ${color}20`,
              border: `1px solid ${color}30`
            }}>
              <Icon size={24} strokeWidth={2.5} />
            </div>
          )}
        </div>
      </div>

      {/* Immersive Full-Width Sparkline */}
      <div style={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        height: '45%', 
        pointerEvents: 'none',
        zIndex: 1,
        opacity: 0.8
      }}>
        <Sparkline data={trend.length > 0 ? trend : [0, 2, 1, 4, 3, 5, 4]} color={color} width={300} height={60} />
      </div>

      {/* Luxury Inner Glows */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        background: 'radial-gradient(circle at top left, rgba(255,255,255,0.5) 0%, transparent 50%)',
        zIndex: 0
      }} />
      
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 4,
        background: color,
        opacity: 0.4
      }} />
    </div>
  )
}
