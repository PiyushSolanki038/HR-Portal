import Sparkline from './Sparkline'

export default function StatCard({ title, value, change, icon: Icon, color, bgColor, trend = [] }) {
  return (
    <div className="stat-card card-glass hover-scale" style={{ '--stat-accent': color, borderRadius: 20, position: 'relative', overflow: 'hidden' }}>
      <div className="stat-info" style={{ position: 'relative', zIndex: 1 }}>
        <h3 style={{ fontSize: 11, letterSpacing: 1, fontWeight: 800, textTransform: 'uppercase', opacity: 0.7 }}>{title}</h3>
        <div className="stat-value" style={{ fontSize: 32, fontWeight: 900, margin: '4px 0' }}>{value}</div>
        {change && (
          <div className="stat-change" style={{ fontSize: 11, fontWeight: 900, color: change.includes('+') ? 'var(--green)' : change.includes('-') ? 'var(--red)' : 'inherit' }}>
            {change}
          </div>
        )}
        <div style={{ marginTop: 12 }}>
          <Sparkline data={trend.length > 0 ? trend : [0, 2, 1, 4, 3, 5, 4]} color={color} width={80} height={24} />
        </div>
      </div>
      {Icon && (
        <div className="stat-icon" style={{ 
          background: bgColor || 'var(--accent-glow)', 
          color: color || 'var(--accent)',
          width: 52, height: 52, borderRadius: 14,
          boxShadow: `0 8px 16px ${color}20`,
          position: 'absolute',
          right: 20,
          top: 20
        }}>
          <Icon size={26} />
        </div>
      )}
    </div>
  )
}
