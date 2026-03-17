import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import { FileBarChart2, Download, Filter, FileSpreadsheet } from 'lucide-react'

export default function FinancialReports() {
  const { user } = useAuth()
  
  const role = user?.role?.toLowerCase() || ''
  const canAccess = role === 'hr manager' || role === 'admin' || user?.id?.startsWith('FIN') || role === 'finance'
  
  if (!canAccess) {
    return <Navigate to="/" replace />
  }

  const reportsList = [
    { title: 'Monthly Payroll Summary', desc: 'Detailed aggregation of all gross, net, and deduction payouts.' },
    { title: 'YTD Analysis', desc: 'Year-to-date comprehensive analytics of company expenditure.' },
    { title: 'Department-wise Cost', desc: 'Payroll distribution categorized by company department tags.' },
    { title: 'Month-over-month Comparison', desc: 'Trend tracking comparing current month with past periods.' },
    { title: 'Bank Export Files', desc: 'Standardized CSV export formats for bulk bank transactions.' }
  ]

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1>Financial Reports</h1>
          <p className="subtitle">Generate and export critical payroll analytics arrays.</p>
        </div>
        <button className="btn btn-secondary"><Filter size={16} /> Filter Date Range</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
        {reportsList.map((rep, i) => (
           <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--accent)', fontWeight: 600 }}>
                 <FileBarChart2 size={20} /> {rep.title}
              </div>
              <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.5, margin: 0, flex: 1 }}>{rep.desc}</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                 <button className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}><FileSpreadsheet size={14} /> View</button>
                 <button className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}><Download size={14} /> CSV / Bank</button>
              </div>
           </div>
        ))}
      </div>
    </div>
  )
}
