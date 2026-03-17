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

      <div className="card" style={{ padding: 24 }}>
        <div className="table-container">
          <table>
             <thead>
                <tr>
                   <th>Timestamp</th>
                   <th>Actor</th>
                   <th>Action Event</th>
                   <th>Description</th>
                   <th>IP Address</th>
                </tr>
             </thead>
             <tbody>
                {logs.map((log, i) => (
                   <tr key={i}>
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: 12 }}>
                        {new Date(log.timestamp).toLocaleString('en-IN', { hour12: false })}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{log.actor}</td>
                      <td>
                         <span className={`badge ${getSeverityClass(log.severity)}`}>
                            {log.action}
                         </span>
                      </td>
                      <td style={{ fontSize: 13 }}>{log.desc}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: 12 }}>{log.ip}</td>
                   </tr>
                ))}
             </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
