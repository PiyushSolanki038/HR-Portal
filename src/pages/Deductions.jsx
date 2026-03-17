import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Navigate } from 'react-router-dom'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import * as api from '../services/api'
import { TrendingDown, AlertCircle, History, Settings, XCircle } from 'lucide-react'

export default function Deductions() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [payroll, setPayroll] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getPayroll().then(data => {
      // PRD Deduction Rule Engine
      const processed = data.map(p => {
        const leaves = parseInt(p.emp?.leaves || 0)
        const lates = parseInt(p.emp?.late || 0)
        
        let leaveDeduction = leaves > 3 ? (leaves - 3) * 500 : 0
        let lateDeduction = lates > 5 ? 200 : 0
        let otherDeductions = (p.deductions || 0) > (leaveDeduction + lateDeduction) ? (p.deductions || 0) - (leaveDeduction + lateDeduction) : 0
        
        const total = leaveDeduction + lateDeduction + otherDeductions
        
        return {
          ...p,
          deductionBreakdown: {
            leavesUsed: leaves,
            lates: lates,
            leaveDeduction,
            lateDeduction,
            other: otherDeductions,
            total
          }
        }
      })
      setPayroll(processed)
    }).catch(() => {
      showToast('Failed to load deduction data', 'error')
    }).finally(() => setLoading(false))
  }, [showToast])

  const role = user?.role?.toLowerCase() || ''
  const canAccess = role === 'hr manager' || role === 'admin' || user?.id?.startsWith('FIN') || role === 'finance'
  
  if (!canAccess) {
    return <Navigate to="/" replace />
  }

  if (loading) return <LoadingSpinner />

  const withDeductions = payroll.filter(p => p.deductionBreakdown.total > 0)
  
  const totalDeductionsAmount = withDeductions.reduce((s, p) => s + p.deductionBreakdown.total, 0)
  const totalLeaveDeductions = withDeductions.reduce((s, p) => s + p.deductionBreakdown.leaveDeduction, 0)
  const totalLateDeductions = withDeductions.reduce((s, p) => s + p.deductionBreakdown.lateDeduction, 0)
  const totalOtherDeductions = withDeductions.reduce((s, p) => s + p.deductionBreakdown.other, 0)

  const handleWaive = (empId) => {
    setPayroll(prev => prev.map(p => {
      if (p.emp?.id === empId) {
        return {
          ...p,
          deductionBreakdown: { ...p.deductionBreakdown, total: 0, leaveDeduction: 0, lateDeduction: 0, other: 0 }
        }
      }
      return p
    }))
    showToast(`Deduction waived for ${empId}`, 'success')
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1>Deductions & Penalties</h1>
          <p className="subtitle">
            {withDeductions.length} employees penalized this cycle
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary"><Settings size={16} /> Deduction Rules</button>
          <button className="btn btn-secondary"><History size={16} /> History</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 24 }}>
        <div className="card">
          <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 8 }}>Total Deductions Amount</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 700, color: 'var(--red)' }}>₹{totalDeductionsAmount.toLocaleString('en-IN')}</div>
          
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: 'var(--muted)' }}>Extra Leaves (&gt;3)</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>₹{totalLeaveDeductions.toLocaleString('en-IN')}</span>
              </div>
              <div className="progress-bar-bg" style={{ height: 6 }}>
                <div className="progress-bar-fill" style={{ width: `${(totalLeaveDeductions/totalDeductionsAmount)*100 || 0}%`, background: 'var(--red)' }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: 'var(--muted)' }}>Late Arrivals (&gt;5)</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>₹{totalLateDeductions.toLocaleString('en-IN')}</span>
              </div>
              <div className="progress-bar-bg" style={{ height: 6 }}>
                <div className="progress-bar-fill" style={{ width: `${(totalLateDeductions/totalDeductionsAmount)*100 || 0}%`, background: 'var(--amber)' }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: 'var(--muted)' }}>TDS / PF / Other</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>₹{totalOtherDeductions.toLocaleString('en-IN')}</span>
              </div>
              <div className="progress-bar-bg" style={{ height: 6 }}>
                <div className="progress-bar-fill" style={{ width: `${(totalOtherDeductions/totalDeductionsAmount)*100 || 0}%`, background: 'var(--accent)' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            <AlertCircle size={20} color="var(--amber)" />
            Active Deduction Rules
          </h3>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 12, border: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ background: 'var(--green-dim)', color: 'var(--green)', padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 700 }}>FREE</div>
              <div style={{ fontSize: 14 }}>up to 3 Leaves per month</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ background: 'var(--red-dim)', color: 'var(--red)', padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 700 }}>₹500</div>
              <div style={{ fontSize: 14 }}>per additional Leave taking</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ background: 'var(--amber-dim)', color: 'var(--amber)', padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 700 }}>₹200</div>
              <div style={{ fontSize: 14 }}>flat penalty for &gt;5 lates</div>
            </div>
          </div>
          <button className="btn btn-secondary" style={{ marginTop: 'auto', borderStyle: 'dashed', width: '100%' }}>
             + Add Manual Deduction
          </button>
        </div>
      </div>

      {withDeductions.length === 0 ? (
        <div className="card empty-state" style={{ padding: '60px 20px' }}>
          <TrendingDown size={64} style={{ color: 'var(--muted)', opacity: 0.5, marginBottom: 16 }} />
          <h3>No Pending Deductions</h3>
          <p style={{ color: 'var(--muted)', maxWidth: 400 }}>
            All employees have remained within their permitted leave quotas and punctuality boundaries for this period.
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 20px 0' }}>Affected Employees</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leaves</th>
                  <th>Lates</th>
                  <th>Leave Ded.</th>
                  <th>Late Ded.</th>
                  <th style={{ textAlign: 'right' }}>Total Ded.</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {withDeductions.map((p, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className="avatar avatar-sm" style={{ background: p.emp?.color || 'var(--accent)' }}>
                          {p.emp?.av || '??'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{p.emp?.name}</div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{p.emp?.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ color: p.deductionBreakdown.leavesUsed > 3 ? 'var(--red)' : 'var(--text)' }}>
                        {p.deductionBreakdown.leavesUsed}/3 Limit
                      </span>
                    </td>
                    <td>
                      <span style={{ color: p.deductionBreakdown.lates > 5 ? 'var(--amber)' : 'var(--text)' }}>
                        {p.deductionBreakdown.lates} Lates
                      </span>
                    </td>
                    <td style={{ color: p.deductionBreakdown.leaveDeduction > 0 ? 'var(--red)' : 'var(--muted)' }}>
                      {p.deductionBreakdown.leaveDeduction > 0 ? `₹${p.deductionBreakdown.leaveDeduction}` : '—'}
                    </td>
                    <td style={{ color: p.deductionBreakdown.lateDeduction > 0 ? 'var(--amber)' : 'var(--muted)' }}>
                      {p.deductionBreakdown.lateDeduction > 0 ? `₹${p.deductionBreakdown.lateDeduction}` : '—'}
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--red)', fontSize: 15, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                      ₹{p.deductionBreakdown.total.toLocaleString('en-IN')}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleWaive(p.emp?.id)}
                      >
                        <XCircle size={14} /> Waive
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
