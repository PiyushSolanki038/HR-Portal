import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import { ShieldCheck, Download, Search } from 'lucide-react'
import * as api from '../services/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function FinanceAudit() {
  const { user } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Generating mock audit logs matching the PRD instructions for Finance Events
  useEffect(() => {
    setTimeout(() => {
      setLogs([
         { id: 'AUD-091', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), actor: 'FIN-001', action: 'PAYROLL_PROCESSED', desc: 'Processed monthly payroll for 84 employees.', ip: '192.168.1.45', severity: 'low' },
         { id: 'AUD-090', timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(), actor: 'FIN-001', action: 'SLIPS_DISPATCHED', desc: 'Bulk dispatched salary slips via Telegram.', ip: '192.168.1.45', severity: 'low' },
         { id: 'AUD-089', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), actor: 'FIN-002', action: 'DEDUCTION_WAIVED', desc: 'Waived ₹500 leave deduction for EMP-015', ip: '10.0.0.22', severity: 'medium' },
         { id: 'AUD-088', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), actor: 'ADM-001', action: 'TAX_RULE_CHANGED', desc: 'Modified active TDS percentage computation parameters.', ip: '203.0.113.50', severity: 'high' }
      ])
      setLoading(false)
    }, 800)
  }, [])

  const role = user?.role?.toLowerCase() || ''
  const canAccess = role === 'hr manager' || role === 'admin' || user?.id?.startsWith('FIN') || role === 'finance'
  
  if (!canAccess) {
    return <Navigate to="/" replace />
  }
  
  if (loading) return <LoadingSpinner />

  const getSeverityClass = (sev) => {
    switch(sev) {
      case 'high': return 'badge-red'
      case 'medium': return 'badge-amber'
      default: return 'badge-green'
    }
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1>Finance Audit Log</h1>
          <p className="subtitle">Immutable ledger for all critical finance operations.</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
           <div className="search-bar" style={{ minWidth: 250 }}>
                <Search size={16} className="search-icon" />
                <input type="text" placeholder="Search logs..." />
           </div>
           <button className="btn btn-secondary"><Download size={16} /> Export CSV</button>
        </div>
      </div>

      <div className="card-premium" style={{ padding: 0 }}>
        <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-elevated)' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--accent-glow)', color: 'var(--accent-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <ShieldCheck size={20} />
              </div>
              <div>
                 <div style={{ fontSize: 14, fontWeight: 800 }}>Verified Audit Trail</div>
                 <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>SYSTEM VERSION 4.2.0 • AGENT: {user?.name || 'ADMIN'}</div>
              </div>
           </div>
           <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)' }}>
              LAST RECONCILIATION: {new Date().toLocaleDateString('en-IN')}
           </div>
        </div>
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table style={{ minWidth: 600, width: '100%' }}>
             <thead>
                <tr style={{ background: 'transparent' }}>
                   <th style={{ background: 'transparent', padding: '12px 16px' }}>Timestamp</th>
                   <th style={{ background: 'transparent', padding: '12px 16px' }}>Actor</th>
                   <th style={{ background: 'transparent', padding: '12px 16px' }}>Action Event</th>
                   <th style={{ background: 'transparent', padding: '12px 16px' }}>Detailed Description</th>
                   <th style={{ background: 'transparent', padding: '12px 16px' }}>Network IP</th>
                </tr>
             </thead>
             <tbody>
                {logs.map((log, i) => (
                   <tr key={i} style={{ background: 'var(--bg-card)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', transition: 'all 0.2s' }} className="hover-elevate">
                      <td style={{ padding: '16px', borderRadius: '12px 0 0 12px', border: '1px solid var(--line)', borderRight: 'none' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: 11 }}>{new Date(log.timestamp).toLocaleDateString()}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13, marginTop: 2 }}>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                      </td>
                      <td style={{ padding: '16px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, border: '1px solid var(--line)' }}>{log.actor.charAt(0)}</div>
                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13 }}>{log.actor}</span>
                         </div>
                      </td>
                      <td style={{ padding: '16px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                         <span className={`badge ${getSeverityClass(log.severity)}`} style={{ padding: '6px 12px', borderRadius: 8, fontSize: 10 }}>
                            {log.action}
                         </span>
                      </td>
                      <td style={{ padding: '16px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                         <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-dim)', maxWidth: 400, whiteSpace: 'normal', lineHeight: 1.5 }}>{log.desc}</div>
                      </td>
                      <td style={{ padding: '16px', borderRadius: '0 12px 12px 0', border: '1px solid var(--line)', borderLeft: 'none' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: 12 }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />
                            {log.ip}
                         </div>
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
        </div>
        <div style={{ padding: '24px 32px', borderTop: '1px solid var(--line)', textAlign: 'center' }}>
           <button className="btn btn-ghost" style={{ fontSize: 12, fontWeight: 700 }}>
              LOAD ARCHIVED RECORDS
           </button>
        </div>
      </div>
    </div>
  )
}
