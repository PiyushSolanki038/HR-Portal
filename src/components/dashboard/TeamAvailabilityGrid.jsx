import { Calendar, Users, Info } from 'lucide-react'

export default function TeamAvailabilityGrid({ availabilityMap, totalEmployees }) {
  return (
    <div className="card-premium super-glass" style={{ padding: '24px', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h3 style={{ margin: 0, fontSize: 13, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
          <Calendar size={16} color="var(--accent)" /> 7-Day Coverage
        </h3>
        <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--blue)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--blue)', boxShadow: '0 0 8px var(--blue)' }} />
          LIVE CALENDAR
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12, flex: 1 }}>
        {availabilityMap.map((day, i) => {
          const availabilityPercent = Math.round(((totalEmployees - day.onLeave) / totalEmployees) * 100)
          const isLow = availabilityPercent < 70

          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'center', lineHeight: 1.2 }}>
                {day.label.split(' ')[0]}
                <div style={{ fontSize: 12, color: 'var(--text)', fontWeight: 800 }}>{day.label.split(' ')[1]}</div>
              </div>
              
              <div 
                style={{ 
                  width: '100%', 
                  flex: 1,
                  minHeight: 100,
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  background: isLow ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255,255,255,0.4)',
                  border: isLow ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255,255,255,0.5)',
                  borderRadius: 16,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ fontSize: 20, fontWeight: 900, color: isLow ? 'var(--red)' : 'var(--text)', letterSpacing: -1 }}>
                  {availabilityPercent}%
                </div>
                {/* Visual indicator bar */}
                <div style={{ 
                  position: 'absolute', 
                  bottom: 0, 
                  left: 0, 
                  height: 4, 
                  width: `${availabilityPercent}%`, 
                  background: isLow ? 'var(--red)' : 'var(--green)',
                  transition: 'width 1s ease-in-out',
                  opacity: 0.8
                }} />
              </div>

              <div style={{ fontSize: 10, fontWeight: 800, color: day.onLeave > 0 ? 'var(--amber)' : 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {day.onLeave > 0 ? `${day.onLeave} Leave` : 'Full'}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 24, padding: '12px 18px', borderRadius: 14, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Info size={16} color="var(--accent)" />
        <p style={{ margin: 0, fontSize: 11, color: 'var(--muted)', fontWeight: 700, lineHeight: 1.4 }}>
          {availabilityMap.some(d => Math.round(((totalEmployees - d.onLeave) / totalEmployees) * 100) < 70) 
            ? "CRITICAL: Significant coverage variances detected in the next 7 days."
            : "Strategic alignment: Team coverage remains optimal for the coming cycle."}
        </p>
      </div>
    </div>
  )
}
