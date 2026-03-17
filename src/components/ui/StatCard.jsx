export default function StatCard({ title, value, change, icon: Icon, color, bgColor }) {
  return (
    <div className="stat-card card-glass" style={{ '--stat-accent': color, borderRadius: 20 }}>
      <div className="stat-info">
        <h3 style={{ fontSize: 11, letterSpacing: 1, fontWeight: 800 }}>{title}</h3>
        <div className="stat-value" style={{ fontSize: 32 }}>{value}</div>
        {change && (
          <div className="stat-change" style={{ fontSize: 11, fontWeight: 700, opacity: 0.8 }}>
            {change}
          </div>
        )}
      </div>
      {Icon && (
        <div className="stat-icon" style={{ 
          background: bgColor || 'var(--accent-glow)', 
          color: color || 'var(--accent)',
          width: 52, height: 52, borderRadius: 14,
          boxShadow: `0 8px 16px ${color}20`
        }}>
          <Icon size={26} />
        </div>
      )}
    </div>
  )
}
