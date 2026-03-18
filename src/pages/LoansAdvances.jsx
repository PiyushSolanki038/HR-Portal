import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import { HandCoins, Check, X, ShieldAlert, Plus, Banknote } from 'lucide-react'

export default function LoansAdvances() {
  const { user } = useAuth()
  const [loans, setLoans] = useState([
     { id: 'L-101', empId: 'EMP-012', name: 'Rahul Verma', amount: 50000, emi: 5000, tenure: 10, remaining: 25000, status: 'Active' },
     { id: 'L-102', empId: 'EMP-045', name: 'Sneha Patel', amount: 120000, emi: 10000, tenure: 12, remaining: 120000, status: 'Pending Approval' }
  ])

  const role = user?.role?.toLowerCase() || ''
  const canAccess = role === 'hr manager' || role === 'admin' || user?.id?.startsWith('FIN') || role === 'finance'
  
  if (!canAccess) {
    return <Navigate to="/" replace />
  }

  const totalOutstanding = loans.filter(l => l.status === 'Active').reduce((s,l) => s + l.remaining, 0)

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1>Loans & Advances</h1>
          <p className="subtitle">Manage employee financial assistance and EMI tracking.</p>
        </div>
        <button className="btn btn-primary"><Plus size={16} /> New Loan Entry</button>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="card">
           <div style={{ color: 'var(--muted)', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
             <Banknote size={16} color="var(--accent)"/> Total Outstanding
           </div>
           <div style={{ fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 700, margin: '12px 0' }}>
             ₹{totalOutstanding.toLocaleString('en-IN')}
           </div>
           <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>Sum of all active loan balances.</p>
        </div>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <div className="table-container">
          <table style={{ minWidth: 600, width: '100%' }}>
             <thead>
                <tr>
                   <th>Loan ID</th>
                   <th>Employee</th>
                   <th>Principal</th>
                   <th>EMI / Mo.</th>
                   <th>Remaining</th>
                   <th>Status</th>
                   <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
             </thead>
             <tbody>
                {loans.map((l, i) => (
                   <tr key={i}>
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>{l.id}</td>
                      <td>
                         <div style={{ fontWeight: 600 }}>{l.name}</div>
                         <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>{l.empId}</div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>₹{l.amount.toLocaleString('en-IN')}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>₹{l.emi.toLocaleString('en-IN')}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--red)' }}>₹{l.remaining.toLocaleString('en-IN')}</td>
                      <td>
                         <span className={`badge ${l.status === 'Active' ? 'badge-green' : 'badge-amber'}`}>
                            {l.status}
                         </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                         {l.status === 'Pending Approval' ? (
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                               <button className="btn btn-icon btn-sm" style={{ background: 'var(--green-dim)', color: 'var(--green)' }}><Check size={14} /></button>
                               <button className="btn btn-icon btn-sm" style={{ background: 'var(--red-dim)', color: 'var(--red)' }}><X size={14} /></button>
                            </div>
                         ) : (
                            <button className="btn btn-secondary btn-sm">Details</button>
                         )}
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
