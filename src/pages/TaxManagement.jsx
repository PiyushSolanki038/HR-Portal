import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import { FileText, Download, TrendingUp, Calculator, ShieldCheck } from 'lucide-react'

export default function TaxManagement() {
  const { user } = useAuth()
  
  const role = user?.role?.toLowerCase() || ''
  const canAccess = role === 'hr manager' || role === 'admin' || user?.id?.startsWith('FIN') || role === 'finance'
  
  if (!canAccess) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1>Tax Management</h1>
          <p className="subtitle">TDS Calculations, Form 16 & Investment Declarations</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary"><Calculator size={16} /> Auto-Compute TDS</button>
          <button className="btn btn-secondary"><Download size={16} /> Generate Form 16</button>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="card">
           <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)', fontWeight: 600, fontSize: 13, textTransform: 'uppercase' }}>
             <ShieldCheck size={16} color="var(--accent)"/> YTD Tax Collection
           </div>
           <div style={{ fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 700, margin: '12px 0' }}>₹0.00</div>
           <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>Total TDS collected this financial year.</p>
        </div>
        
        <div className="card">
           <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)', fontWeight: 600, fontSize: 13, textTransform: 'uppercase' }}>
             <FileText size={16} color="var(--amber)"/> Employee Declarations
           </div>
           <div style={{ fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 700, margin: '12px 0' }}>0 / 0</div>
           <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>Investment proofs submitted vs pending.</p>
        </div>

        <div className="card">
           <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)', fontWeight: 600, fontSize: 13, textTransform: 'uppercase' }}>
             <TrendingUp size={16} color="var(--green)"/> Tax Reports
           </div>
           <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
              <button className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }}>
                <FileText size={14} /> Monthly TDS Register
              </button>
              <button className="btn btn-secondary btn-sm" style={{ justifyContent: 'flex-start' }}>
                <FileText size={14} /> Q3 Challan Report
              </button>
           </div>
        </div>
      </div>
      
      <div className="card empty-state" style={{ minHeight: 300 }}>
        <div style={{ maxWidth: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <Calculator size={48} style={{ opacity: 0.5, color: 'var(--muted)' }} />
            <h3 style={{ margin: 0 }}>Tax Engine Dashboard</h3>
            <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0, lineHeight: 1.5 }}>
              The comprehensive tax processing grid will be mapped here once employee taxation slabs are finalized in the settings.
            </p>
        </div>
      </div>
    </div>
  )
}
