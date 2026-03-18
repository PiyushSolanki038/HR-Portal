import { useState, useEffect } from 'react'
import { useScreenSize } from '../hooks/useScreenSize'
import { useAuth } from '../context/AuthContext'
import { Navigate, useNavigate } from 'react-router-dom'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import StatCard from '../components/ui/StatCard'
import * as api from '../services/api'
import { Wallet, Users, FileText, AlertCircle, ArrowRight, TrendingUp, BookOpen } from 'lucide-react'

export default function FinanceDashboard() {
  const { isMobile, isTablet, isDesktop } = useScreenSize()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [payroll, setPayroll] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getPayroll().then(setPayroll).catch(console.error).finally(() => setLoading(false))
  }, [])

  // Allow HR Manager, Admin, and Finance roles
  const role = user?.role?.toLowerCase() || ''
  const canAccess = role === 'hr manager' || role === 'admin' || user?.id?.startsWith('FIN') || role === 'finance'
  
  if (!canAccess) {
    return <Navigate to="/" replace />
  }

  if (loading) return <LoadingSpinner />

  const greeting = () => {
    const hr = new Date().getHours()
    if (hr < 12) return 'Good morning'
    if (hr < 17) return 'Good afternoon'
    return 'Good evening'
  }
  
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const gross = payroll.reduce((s, p) => s + (p.gross || 0), 0)
  const deducs = payroll.reduce((s, p) => s + (p.deductions || 0), 0)
  const net = payroll.reduce((s, p) => s + (p.net || 0), 0)

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1>{greeting()}, {user?.name}</h1>
          <p className="subtitle" style={{ fontFamily: 'var(--font-mono)' }}>{today}</p>
        </div>
        <div className="badge badge-purple" style={{ padding: '8px 16px', fontSize: '12px' }}>
          Finance Hub
        </div>
      </div>

      <div className={isMobile ? 'flex-col' : 'grid-2'} style={{ marginBottom: 24, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20 }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)', fontSize: 13, fontWeight: 600, textTransform: 'uppercase' }}>
            <Wallet size={16} color="var(--accent)" /> Period Payroll Summary
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 24 }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>Total Gross Payroll</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700 }}>₹{gross.toLocaleString('en-IN')}</div>
            </div>
            <div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>Total Deductions</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, color: 'var(--red)' }}>-₹{deducs.toLocaleString('en-IN')}</div>
            </div>
          </div>
          
          <div style={{ borderTop: '1px solid var(--line)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>Net Payable Output</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 800, color: 'var(--green)' }}>₹{net.toLocaleString('en-IN')}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>Processing Date</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600 }}>01 {(new Date(new Date().setMonth(new Date().getMonth()+1))).toLocaleString('en-IN', {month:'short'})}</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate('/payroll')}>Process Payroll Now</button>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate('/salary')}>Dispatch All Slips</button>
          </div>
        </div>

        <div className="stats-grid" style={{ margin: 0 }}>
          <StatCard
            title="Slips Pending"
            value={payroll.length}
            icon={FileText}
            color="var(--amber)"
            bgColor="var(--amber-dim)"
          />
          <StatCard
            title="Deductions This Mo."
            value={`₹${deducs.toLocaleString('en-IN')}`}
            icon={TrendingUp}
            color="var(--red)"
            bgColor="var(--red-dim)"
          />
          <StatCard
            title="Tax Deducted (YTD)"
            value="₹0.00"
            icon={TrendingUp}
            color="var(--purple)"
            bgColor="var(--purple-dim)"
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20 }}>
        {/* Payroll Processing Queue Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: 20, borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)', fontSize: 13, fontWeight: 600, textTransform: 'uppercase' }}>
              <Users size={16} color="var(--accent)" /> Latest Payroll Queue
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/payroll')}>
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table style={{ minWidth: 600, width: '100%' }}>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Gross</th>
                  <th>Net</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payroll.slice(0, 5).map((p, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className="avatar avatar-sm" style={{ background: p.emp?.color || 'var(--accent)' }}>
                          {p.emp?.av || '??'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{p.emp?.name}</div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>{p.emp?.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>₹{p.gross.toLocaleString('en-IN')}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--green)', fontWeight: 600 }}>₹{p.net.toLocaleString('en-IN')}</td>
                    <td>
                      <span className="badge badge-muted">Pending</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Links & Deduction Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', marginBottom: 20 }}>
              <AlertCircle size={16} color="var(--amber)" /> Deduction Breakdown
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)' }} /> Extra Leaves
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>₹{deducs.toLocaleString('en-IN')}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--amber)' }} /> Late Arrivals
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>₹0</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--purple)' }} /> TDS / Tax
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>₹0</div>
              </div>
            </div>
            <button className="btn btn-secondary" style={{ marginTop: 20, width: '100%' }} onClick={() => navigate('/deductions')}>View Deductions Report</button>
          </div>

          <div className="card">
             <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', marginBottom: 20 }}>
              <BookOpen size={16} color="var(--accent)" /> Quick Navigation
            </div>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Financial Reports', to: '/financial-reports' },
                  { label: 'Tax Management', to: '/tax-management' },
                  { label: 'Loans & Advances', to: '/loans-advances' },
                  { label: 'Finance Audit Log', to: '/finance-audit' }
                ].map((link, idx) => (
                  <div 
                    key={idx} 
                    className="sidebar-link" 
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--line)', justifyContent: 'center', fontSize: 12, borderRadius: 8 }}
                    onClick={() => navigate(link.to)}
                  >
                    {link.label}
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
