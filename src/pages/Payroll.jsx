import { useState, useEffect } from 'react'
import { useScreenSize } from '../hooks/useScreenSize'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Navigate } from 'react-router-dom'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import * as api from '../services/api'
import { Download, PlayCircle, Eye, History, CheckSquare, Search, Filter } from 'lucide-react'

export default function Payroll() {
  const { isMobile, isTablet, isDesktop } = useScreenSize()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [payroll, setPayroll] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    api.getPayroll().then(data => {
      // Enhanced data with exact PRD deduction logic
      const enhanced = data.map(p => {
        const leaves = parseInt(p.emp?.leaves || 0)
        const lates = parseInt(p.emp?.late || 0)
        
        let calculatedDeduction = 0
        if (leaves > 3) calculatedDeduction += (leaves - 3) * 500
        if (lates > 5) calculatedDeduction += 200
        
        return {
          ...p,
          deductions: Math.max(p.deductions || 0, calculatedDeduction),
          net: (p.gross || 0) - Math.max(p.deductions || 0, calculatedDeduction),
          status: p.status || 'Pending'
        }
      })
      setPayroll(enhanced)
    }).catch(() => {
      showToast('Failed to load payroll data', 'error')
    }).finally(() => setLoading(false))
  }, [showToast])

  const role = user?.role?.toLowerCase() || ''
  const canAccess = role === 'hr manager' || role === 'admin' || user?.id?.startsWith('FIN') || role === 'finance'
  
  if (!canAccess) {
    return <Navigate to="/" replace />
  }

  if (loading) return <LoadingSpinner />

  const filtered = payroll.filter(p => 
    p.emp?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.emp?.id?.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  const totalGross = filtered.reduce((s, p) => s + (p.gross || 0), 0)
  const totalDeductions = filtered.reduce((s, p) => s + (p.deductions || 0), 0)
  const totalNet = filtered.reduce((s, p) => s + (p.net || 0), 0)
  const monthStr = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(filtered.map(p => p.emp?.id))
    } else {
      setSelected([])
    }
  }

  const handleProcessSelected = async () => {
    if (selected.length === 0) return showToast('Select employees to process', 'error')
    try {
      showToast(`Processing payroll for ${selected.length} employees...`, 'success')
      // Simulate API call
      setTimeout(() => {
        setPayroll(prev => prev.map(p => selected.includes(p.emp?.id) ? { ...p, status: 'Processed' } : p))
        setSelected([])
        showToast('Payroll processed successfully', 'success')
      }, 1000)
    } catch {
      showToast('Processing failed', 'error')
    }
  }

  return (
    <div className="animate-in" style={{ padding: isMobile ? 12 : 28, maxWidth: '100%', overflowX: 'hidden' }}>
      <div className="page-header" style={{ flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? 16 : 24, marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 24 : 32, fontWeight: 800 }}>Payroll Processing</h1>
          <p className="subtitle" style={{ fontSize: isMobile ? 12 : 14 }}>Monthly precision register for {monthStr}</p>
        </div>
        <div className="page-header-actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', width: isMobile ? '100%' : 'auto', justifyContent: 'flex-start' }}>
          <button className="btn btn-secondary" style={{ flex: '1 1 auto' }}>
            <Eye size={16} /> Preview
          </button>
          <button className="btn btn-secondary" style={{ flex: '1 1 auto' }}>
            <Download size={16} /> CSV
          </button>
          <button className="btn btn-primary" style={{ flex: '1 1 auto' }} onClick={handleProcessSelected}>
            <PlayCircle size={16} /> Run Payroll
          </button>
        </div>
      </div>

      <div className="stats-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', 
        gap: 16, 
        marginBottom: 32 
      }}>
        <div className="card">
          <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 8 }}>Total Payroll (Gross)</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 600 }}>₹{totalGross.toLocaleString('en-IN')}</div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 8 }}>Total Deductions</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 600, color: 'var(--red)' }}>₹{totalDeductions.toLocaleString('en-IN')}</div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 8 }}>Net Payable</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 600, color: 'var(--green)' }}>₹{totalNet.toLocaleString('en-IN')}</div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 8 }}>Pay Date</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 600, color: 'var(--accent)' }}>
            01 {(new Date(new Date().setMonth(new Date().getMonth()+1))).toLocaleString('en-IN', {month:'short', year:'numeric'})}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: isMobile ? 16 : 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div className="search-bar" style={{ flex: 1, maxWidth: '100%', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Search size={16} className="search-icon" style={{ minWidth: 16 }} />
            <input 
              type="text" 
              placeholder="Search ID or Name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', fontSize: 16, border: 'none', background: 'transparent', outline: 'none' }}
            />
          </div>
          <button className="btn btn-secondary">
            <Filter size={16} /> Filter
          </button>
        </div>

        <div className="table-container" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', borderRadius: 16 }}>
          <table style={{ minWidth: 600 }}>
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={handleSelectAll} style={{ width: 'auto' }} />
                </th>
                <th>Employee</th>
                <th className="hidden-mobile">Dept</th>
                <th>Gross</th>
                <th className="hidden-mobile">Deduction</th>
                <th>Net</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={i}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selected.includes(p.emp?.id)} 
                      onChange={(e) => {
                        if(e.target.checked) setSelected([...selected, p.emp?.id])
                        else setSelected(selected.filter(id => id !== p.emp?.id))
                      }}
                      style={{ width: 'auto' }}
                    />
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="avatar avatar-sm" style={{ background: p.emp?.color || 'var(--accent)', boxShadow: `0 2px 8px ${p.emp?.color}60` }}>
                        {p.emp?.av || p.emp?.name?.substring(0,2).toUpperCase() || '??'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{p.emp?.name}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: 11 }}>{p.emp?.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden-mobile" style={{ color: 'var(--muted)' }}>{p.emp?.dept}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>₹{p.gross.toLocaleString('en-IN')}</td>
                  <td className="hidden-mobile" style={{ fontFamily: 'var(--font-mono)', color: p.deductions > 0 ? 'var(--red)' : 'var(--muted)' }}>
                    {p.deductions > 0 ? `-₹${p.deductions.toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--green)', fontWeight: 700 }}>₹{p.net.toLocaleString('en-IN')}</td>
                  <td>
                    <span className={`badge ${p.status === 'Processed' ? 'badge-green' : 'badge-muted'}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7">
                    <div className="empty-state">
                      <CheckSquare size={48} />
                      <h3>No records found</h3>
                      <p>Try adjusting your search or filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
      </div>
    </div>
  )
}
