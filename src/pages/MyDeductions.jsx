import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import * as api from '../services/api'
import { 
  TrendingUp, 
  AlertCircle, 
  History, 
  Info,
  Calendar,
  IndianRupee,
  FileText
} from 'lucide-react'

export default function MyDeductions() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [mySlips, setMySlips] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState('')

  useEffect(() => {
    if (user?.id) {
       api.getEmployeeSalaries(user.id)
         .then(data => {
            setMySlips(data)
            if (data.length > 0) {
              setSelectedMonth(data[0].month)
            }
         })
         .catch(err => {
            console.error('Failed to load deductions:', err)
            showToast('Failed to load deduction data', 'error')
         })
         .finally(() => setLoading(false))
    }
  }, [user?.id, showToast])

  if (loading) return <LoadingSpinner />

  const currentSlip = mySlips.find(s => s.month === selectedMonth) || mySlips[0]

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0)
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1>My Deductions</h1>
          <p className="subtitle">View your penalties and statutory deductions.</p>
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
            {mySlips.length === 0 && <option>No data available</option>}
          </select>
        </div>
      </div>

      {!currentSlip ? (
        <div className="card empty-state" style={{ padding: '60px 20px' }}>
          <TrendingUp size={64} style={{ color: 'var(--muted)', opacity: 0.5, marginBottom: 16 }} />
          <h3>No Records Found</h3>
          <p style={{ color: 'var(--muted)', maxWidth: 400 }}>
            You don't have any recorded deductions or salary slips for the selected period.
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 24 }}>
            <div className="card" style={{ borderLeft: '4px solid var(--red)' }}>
              <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 8, fontWeight: 600, textTransform: 'uppercase' }}>Total Deductions ({currentSlip.month})</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 800, color: 'var(--red)' }}>
                {formatCurrency(currentSlip.deductions)}
              </div>
              
              <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
                    <span style={{ color: 'var(--text)' }}>Statutory (PF/Tax)</span>
                    <span style={{ fontWeight: 700 }}>{formatCurrency((currentSlip.pf || 0) + (currentSlip.tax || 0))}</span>
                  </div>
                  <div className="progress-bar-bg" style={{ height: 6 }}>
                    <div className="progress-bar-fill" style={{ width: '100%', background: 'var(--accent)' }} />
                  </div>
                </div>
                
                {currentSlip.leaveDeduction > 0 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
                      <span style={{ color: 'var(--red)' }}>Extra Leaves Penalty</span>
                      <span style={{ fontWeight: 700, color: 'var(--red)' }}>{formatCurrency(currentSlip.leaveDeduction)}</span>
                    </div>
                    <div className="progress-bar-bg" style={{ height: 6 }}>
                      <div className="progress-bar-fill" style={{ width: '100%', background: 'var(--red)' }} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 16px 0' }}>
                <AlertCircle size={20} color="var(--amber)" />
                Company Policy
              </h3>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 12, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ background: 'rgba(163, 230, 53, 0.1)', color: '#A3E635', padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 800 }}>QUOTA</div>
                  <div style={{ fontSize: 13 }}>3 Free leaves permitted / month</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 800 }}>PENALTY</div>
                  <div style={{ fontSize: 13 }}>₹500 per additional leave</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 800 }}>LATE</div>
                  <div style={{ fontSize: 13 }}>Punctuality impacts annual score</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="card-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Deduction History</h3>
               <button className="btn btn-ghost btn-sm">Download All</button>
            </div>
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table style={{ minWidth: 600, width: '100%' }}>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>PF Contribution</th>
                    <th>Prof. Tax</th>
                    <th>Leave Penalties</th>
                    <th style={{ textAlign: 'right' }}>Total Deducted</th>
                  </tr>
                </thead>
                <tbody>
                  {mySlips.map((slip, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{slip.month}</td>
                      <td>{formatCurrency(slip.pf)}</td>
                      <td>{formatCurrency(slip.tax)}</td>
                      <td style={{ color: slip.leaveDeduction > 0 ? 'var(--red)' : 'var(--text)' }}>
                        {slip.leaveDeduction > 0 ? formatCurrency(slip.leaveDeduction) : '₹0'}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>
                        {formatCurrency(slip.deductions)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <div className="card" style={{ marginTop: 24, borderLeft: '4px solid var(--blue)' }}>
         <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Info size={18} color="var(--blue)" />
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
              Need clarification on a specific deduction? Please contact the HR department or raise a ticket in the communication module.
            </p>
         </div>
      </div>
    </div>
  )
}
