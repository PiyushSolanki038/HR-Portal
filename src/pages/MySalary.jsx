import { useState, useEffect } from 'react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import * as api from '../services/api'
import { 
  Wallet, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Info, 
  CreditCard,
  Building,
  ShieldCheck,
  FileText
} from 'lucide-react'

export default function MySalary() {
  const { user } = useAuth()
  const { salaries, refresh, loading, error } = useData()
  const { showToast } = useToast()
  const [selectedMonth, setSelectedMonth] = useState('2026-03')
  const [mySlips, setMySlips] = useState([])

  useEffect(() => {
    if (user?.id) {
       api.getEmployeeSalaries(user.id).then(setMySlips).catch(console.error)
    }
  }, [user?.id, salaries])

  if (loading) return <LoadingSpinner />
  if (error) return <div className="p-6">Error: {error}</div>

  const sortedSlips = [...mySlips].sort((a, b) => b.month.localeCompare(a.month))
  const latestSlip = sortedSlips.find(s => s.month === selectedMonth) || sortedSlips[0]

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0)
  }

  const handleDownload = (slipId) => {
    showToast('Generating PDF slip...', 'info')
    setTimeout(() => {
       showToast('Salary slip downloaded', 'success')
    }, 1500)
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1>My Salary Slips</h1>
          <p className="subtitle">View your monthly earnings and deductions.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <select 
            className="btn btn-secondary btn-sm" 
            value={selectedMonth} 
            onChange={e => setSelectedMonth(e.target.value)}
            style={{ width: 'auto' }}
          >
            {mySlips.map(s => (
              <option key={s.month} value={s.month}>{s.month}</option>
            ))}
            {mySlips.length === 0 && <option>No slips available</option>}
          </select>
        </div>
      </div>

      {latestSlip && (
        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24, marginBottom: 32 }}>
           <div className="card" style={{ background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-elevated) 100%)', border: '1px solid var(--accent-glow)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                 <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--accent-glow)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Wallet size={24} />
                 </div>
                 <span className="badge badge-green" style={{ height: 'fit-content' }}>Paid</span>
              </div>
              
              <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Net Salary</div>
              <div style={{ fontSize: 36, fontWeight: 800, marginTop: 4, letterSpacing: -1 }}>{formatCurrency(latestSlip.netSalary)}</div>
              
              <div style={{ marginTop: 24, display: 'flex', gap: 16 }}>
                 <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>GROSS</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{formatCurrency(latestSlip.grossSalary)}</div>
                 </div>
                 <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>DEDUCTIONS</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--red)' }}>{formatCurrency(latestSlip.deductions)}</div>
                 </div>
              </div>

              <button className="btn btn-primary" style={{ width: '100%', marginTop: 32, justifyContent: 'center' }} onClick={() => handleDownload(latestSlip.id)}>
                 <Download size={16} /> Download {latestSlip.month} Slip
              </button>
           </div>

           <div className="card">
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Earnings Breakdown</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                       <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Building size={16} color="var(--blue)" />
                       </div>
                       <div>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>Basic Salary</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>50% of CTC</div>
                       </div>
                    </div>
                    <div style={{ fontWeight: 700 }}>{formatCurrency(latestSlip.basic)}</div>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                       <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <CreditCard size={16} color="var(--purple)" />
                       </div>
                       <div>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>HRA</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>House Rent Allowance</div>
                       </div>
                    </div>
                    <div style={{ fontWeight: 700 }}>{formatCurrency(latestSlip.hra)}</div>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                       <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <TrendingUp size={16} color="var(--green)" />
                       </div>
                       <div>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>Special Allowance</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>Performance linked</div>
                       </div>
                    </div>
                    <div style={{ fontWeight: 700 }}>{formatCurrency(latestSlip.specialAllowance)}</div>
                 </div>
              </div>

              <h3 style={{ fontSize: 16, fontWeight: 700, margin: '24px 0 20px' }}>Deductions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                       <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ShieldCheck size={16} color="var(--red)" />
                       </div>
                       <div style={{ fontSize: 14, fontWeight: 600 }}>Provident Fund (PF)</div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--red)' }}>- {formatCurrency(latestSlip.pf)}</div>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                       <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <TrendingDown size={16} color="var(--amber)" />
                       </div>
                       <div style={{ fontSize: 14, fontWeight: 600 }}>Professional Tax & Leaves</div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--red)' }}>- {formatCurrency(latestSlip.tax + (latestSlip.leaveDeduction || 0))}</div>
                 </div>
              </div>
           </div>
        </div>
      )}

      <div className="card" style={{ marginBottom: 32, borderLeft: '4px solid var(--amber)' }}>
         <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ color: 'var(--amber)', marginTop: 2 }}><Info size={18} /></div>
            <div>
               <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Note on Deductions</h4>
               <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
                  Deductions for extra leaves and late submissions are calculated automatically. 
                  Each additional leave beyond quota results in 1 day salary deduction. 
                  Multiple late marks may also incur minor penalties as per company policy.
               </p>
            </div>
         </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="card-header" style={{ padding: '16px 20px', borderBottom: 'var(--border)', background: 'var(--bg-elevated)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <h3 style={{ fontSize: 16, fontWeight: 700 }}>Salary History</h3>
           <button className="btn btn-ghost btn-sm">View Full Year</button>
        </div>
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Period</th>
                <th>Gross Salary</th>
                <th>Total Deductions</th>
                <th>Net Paid</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Slip</th>
              </tr>
            </thead>
            <tbody>
              {mySlips.map((slip, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{slip.month}</td>
                  <td>{formatCurrency(slip.grossSalary)}</td>
                  <td style={{ color: 'var(--red)' }}>{formatCurrency(slip.deductions)}</td>
                  <td style={{ fontWeight: 700, color: 'var(--green)' }}>{formatCurrency(slip.netSalary)}</td>
                  <td><span className="badge badge-green">Paid</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-icon btn-sm" onClick={() => handleDownload(slip.id)}>
                      <Download size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {mySlips.length === 0 && (
                <tr><td colSpan={6} className="empty-state">No salary history found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
