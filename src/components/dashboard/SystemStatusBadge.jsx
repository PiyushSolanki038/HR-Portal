import { Activity, ShieldCheck, ShieldAlert, Cpu } from 'lucide-react'

export default function SystemStatusBadge({ health }) {
  const isHealthy = health?.status === 'healthy'
  
  return (
    <div className="card-premium" style={{ 
      padding: '10px 16px', 
      display: 'flex', 
      alignItems: 'center', 
      gap: 12,
      background: 'var(--bg-elevated)',
      border: `1px solid ${isHealthy ? 'var(--green-dim)' : 'var(--red-dim)'}`
    }}>
      <div style={{ position: 'relative' }}>
        <Cpu size={18} color={isHealthy ? 'var(--green)' : 'var(--red)'} />
        <div style={{ 
          position: 'absolute', 
          top: -2, 
          right: -2, 
          width: 8, 
          height: 8, 
          borderRadius: '50%', 
          background: isHealthy ? 'var(--green)' : 'var(--red)',
          boxShadow: `0 0 10px ${isHealthy ? 'var(--green)' : 'var(--red)'}`,
          animation: 'pulse 2s infinite'
        }} />
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Systems: {isHealthy ? 'Operational' : 'Degraded'}
          </span>
        </div>
        <div style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 700 }}>
          Google Sheets: {health?.latency || '0ms'} latency
        </div>
      </div>

      <div style={{ marginLeft: 8, paddingLeft: 12, borderLeft: '1px solid var(--line)', display: 'flex', gap: 8 }}>
        {isHealthy ? (
          <ShieldCheck size={14} color="var(--green)" />
        ) : (
          <ShieldAlert size={14} color="var(--red)" />
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 0.4; }
          50% { opacity: 1; }
          100% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
