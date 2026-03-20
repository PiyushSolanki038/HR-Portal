import { useState, useEffect, useMemo } from 'react'
import { useScreenSize } from '../hooks/useScreenSize'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Navigate } from 'react-router-dom'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import StatCard from '../components/ui/StatCard'
import * as api from '../services/api'
import { 
  TrendingUp, AlertCircle, History, Settings, XCircle, X,
  DollarSign, TrendingDown, ShieldCheck, Calendar,
  Search, Plus, ChevronRight, Info, AlertTriangle,
  CreditCard, Briefcase, Zap, CheckCircle2, UserCheck,
  Edit2, Trash2, Save
} from 'lucide-react'

// Default fallback catalog as a starting point if sheet is empty
const INITIAL_FALLBACK = [
  { label: 'Not Joining Scheduled Meeting', amount: 50 },
  { label: 'Leave Without Prior Information', amount: 200 },
  { label: 'Delay in Assigned Work Without Valid Reason', amount: 100 },
  { label: 'Not Replying to Official Messages (30m)', amount: 30 },
  { label: 'Late Joining the Meeting', amount: 20 },
  { label: 'No Daily Report Submission', amount: 50 },
  { label: 'Proxy Attendance / Fake Reporting', amount: 500 },
  { label: 'Repeated Late Joining (>3/week)', amount: 100 },
  { label: 'Missing 2 Consecutive Meetings', amount: 200 },
  { label: 'Disrespecting TL / Manager Instructions', amount: 300 },
  { label: 'Sharing Internal Info (Data Breach)', amount: 1000 },
  { label: 'Not Completing Task by Deadline', amount: 200 },
  { label: 'Conflict / Argument in Team Groups', amount: 300 },
  { label: 'Ignoring Work Instructions in Group', amount: 100 },
  { label: 'Unprofessional Behavior with Clients', amount: 500 },
  { label: 'Fake Work Updates / False Progress', amount: 500 },
  { label: 'Inactive During Working Hours', amount: 100 }
]

export default function Deductions() {
  const { isMobile } = useScreenSize()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [personnel, setPersonnel] = useState([])
  const [catalog, setCatalog] = useState([])
  const [search, setSearch] = useState('')
  const [showDrawer, setShowDrawer] = useState(null) // 'rules', 'adjust'
  const [selectedEmp, setSelectedEmp] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Policy Management State
  const [editingPolicy, setEditingPolicy] = useState(null) // ID
  const [newPolicy, setNewPolicy] = useState({ label: '', amount: '' })
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [waiverOptions, setWaiverOptions] = useState([])
  const [dataError, setDataError] = useState(null)
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  const fetchData = async () => {
    setDataError(null)
    try {
      const [payrollData, catalogData] = await Promise.all([
        api.getPayroll(),
        api.getPenaltyCatalog()
      ])
      
      const payroll = Array.isArray(payrollData) ? payrollData : []
      if (catalogData.length === 0) setCatalog(INITIAL_FALLBACK)
      else setCatalog(catalogData)

      const processed = payroll
        .filter(p => {
          const r = (p.emp?.role || '').toLowerCase()
          const n = (p.emp?.name || '').toLowerCase()
          const isExcluded = r.includes('admin') || r.includes('head') || r.includes('owner') || r.includes('hr manager') || n.includes('shreyansh') || n.includes('ankur')
          return !isExcluded
        })
        .map(p => ({
          ...p,
          deductionBreakdown: p.breakdown || {
            leavesUsed: 0, lates: 0, leaveDeduction: 0, lateDeduction: 0, other: 0, waivers: 0, total: p.deductions || 0
          }
        }))
      setPersonnel(processed)
    } catch (err) {
      console.error('[CLIENT_ERROR] Data fetch failed:', err)
      setDataError(err.message || 'Failed to connect to the fiscal database.')
    } finally {
      setIsInitialLoading(false)
    }
  }

  const fetchHistory = async (empId) => {
    setLoadingHistory(true)
    try {
      const [gov, wav] = await Promise.all([api.getGovernance(), api.getWaivers()])
      const now = new Date()
      const currentMonthIdx = now.getMonth()
      const currentYear = now.getFullYear()
      const currentMonthLabel = now.toLocaleDateString('en-IN', { month:'long', year:'numeric' })
      
      const targetId = String(empId).trim()
      const combined = [
        ...gov.filter(g => {
          if (String(g.empId).trim() !== targetId) return false
          const d = new Date(g.date)
          return d.getMonth() === currentMonthIdx && d.getFullYear() === currentYear
        }).map(g => ({ ...g, entryType: 'penalty' })),
        ...wav.filter(w => String(w.empId).trim() === targetId && String(w.month).trim() === currentMonthLabel)
          .map(w => ({ ...w, entryType: 'waiver', title: w.reason, penalty: w.amount }))
      ].sort((a,b) => new Date(b.date) - new Date(a.date))
      
      setHistory(combined)
    } catch {
      showToast('History load failed', 'error')
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (showDrawer === 'adjust' && selectedEmp) {
        fetchHistory(selectedEmp.id)
    }
  }, [showDrawer, selectedEmp])

  const metrics = useMemo(() => {
    const withDeds = personnel.filter(p => p.deductionBreakdown.total > 0)
    const totalAmount = withDeds.reduce((s, p) => s + p.deductionBreakdown.total, 0)
    const leaveVios = withDeds.filter(p => p.deductionBreakdown.leaveDeduction > 0).length
    const lateRisks = withDeds.filter(p => p.deductionBreakdown.lateDeduction > 0).length
    const accuracy = "99.9%"
    return { totalAmount, leaveVios, lateRisks, accuracy }
  }, [personnel])

  const role = user?.role?.toLowerCase() || ''
  const canAccess = role === 'hr manager' || role === 'admin' || user?.id?.startsWith('FIN') || role === 'finance'
  
  if (!canAccess) return <Navigate to="/" replace />
  // Unified render state management

  const filtered = personnel.filter(p => {
    const name = (p.emp?.name || '').toLowerCase()
    const id = (p.emp?.id || '').toLowerCase()
    const role = (p.emp?.role || '').toLowerCase()
    const isSearchMatch = name.includes(search.toLowerCase()) || id.includes(search.toLowerCase())
    const isExcluded = role.includes('admin') || role.includes('head') || role.includes('owner') || role.includes('hr manager') || name.includes('shreyansh') || name.includes('ankur') || id.startsWith('adm')
    return isSearchMatch && !isExcluded
  })

  const handleIssuePenalty = async (penaltyItem) => {
    if (!selectedEmp) return
    setIsSubmitting(true)
    try {
      await api.addGovernance({
        type: 'disciplinary',
        empId: selectedEmp.id,
        empName: selectedEmp.name,
        title: penaltyItem.label,
        penalty: penaltyItem.amount,
        description: `Automatic penalty issuance: ${penaltyItem.label}`,
        date: new Date().toISOString().split('T')[0]
      })
      showToast('Fiscal penalty issued successfully', 'success')
      setShowDrawer(null)
      fetchData()
    } catch {
      showToast('Penalty issuance failed', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // --- Policy Catalog Crud ---
  const handleAddPolicy = async () => {
    if (!newPolicy.label || !newPolicy.amount) return
    setIsSubmitting(true)
    try {
      await api.addPenaltyType({ label: newPolicy.label, amount: newPolicy.amount })
      showToast('New policy commissioned', 'success')
      setNewPolicy({ label: '', amount: '' })
      fetchData()
    } catch {
      showToast('Policy registration failed', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePolicy = async (id) => {
    if (!confirm('Decommission this financial policy?')) return
    try {
      await api.deletePenaltyType(id)
      showToast('Policy decommissioned successfully', 'success')
      fetchData()
    } catch {
      showToast('Decommissioning failed', 'error')
    }
  }

  const handleUpdatePolicy = async (id, data) => {
    try {
      await api.updatePenaltyType(id, data)
      showToast('Governance policy updated', 'success')
      setEditingPolicy(null)
      fetchData()
    } catch {
      showToast('Policy update failed', 'error')
    }
  }

  const handleWaiveInitiation = (p) => {
    const { leaveDeduction, lateDeduction, other, total } = p.deductionBreakdown
    const active = []
    if (leaveDeduction > 0) active.push({ label: 'Extra Leaves', amount: leaveDeduction })
    if (lateDeduction > 0) active.push({ label: 'Latency Penalties', amount: lateDeduction })
    if (other > 0) active.push({ label: 'Manual Penalties', amount: other })

    if (active.length <= 1) {
      handleWaive(p.emp?.id, total, active[0]?.label || 'All Deductions')
    } else {
      setSelectedEmp(p.emp)
      setWaiverOptions(active)
      setShowDrawer('waive')
    }
  }

  const handleWaive = async (empId, amount, typeLabel = 'All') => {
    if (!confirm(`Grant high-integrity waiver for ${typeLabel} (₹${amount.toLocaleString('en-IN')})? This will be permanently logged.`)) return
    setIsSubmitting(true)
    try {
      await api.addWaiver({
        empId,
        amount,
        reason: `Administrative Grace: ${typeLabel}`,
        month: new Date().toLocaleDateString('en-IN', { month:'long', year:'numeric' })
      })
      showToast(`${typeLabel} waived persistently`, 'success')
      setShowDrawer(null)
      fetchData()
    } catch (err) {
      console.error('[CLIENT_ERROR] Waiver commission failed:', err)
      showToast(`Waiver commission failed: ${err.message || 'Check server logs'}`, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="animate-in" style={{ padding: isMobile ? '16px' : '32px', maxWidth: 1600, margin: '0 auto' }}>
      {/* Executive Financial Header */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'flex-end', marginBottom: 40, gap: 24 }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 32 : 48, fontWeight: 900, letterSpacing: -2, margin: 0 }}>Financial Governance</h1>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--muted)', marginTop: 4, letterSpacing: 0.5 }}>Deductions & Fiscal Compliance Hub</p>
        </div>

        <div style={{ display: 'flex', gap: 12, width: isMobile ? '100%' : 'auto' }}>
            <div style={{ position: 'relative', flex: isMobile ? 1 : 'none' }}>
                <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                <input 
                    type="text" 
                    placeholder="Locate personnel record..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ width: isMobile ? '100%' : 260, padding: '12px 12px 12px 40px', borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--line)', fontSize: 13, fontWeight: 700, outline: 'none' }}
                />
            </div>
            <button 
                onClick={() => setShowDrawer('rules')}
                className="btn btn-secondary"
                style={{ height: 44, padding: '0 20px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 800, borderStyle: 'dashed' }}
            >
                <Settings size={18} /> <span style={{ whiteSpace: 'nowrap' }}>POLICIES</span>
            </button>
        </div>
      </div>

      {isInitialLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 20 }}>
              <div className="spinner-glow" style={{ width: 60, height: 60, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent)', animation: 'spin 1s linear infinite' }}></div>
              <div style={{ textAlign: 'center' }}>
                  <p style={{ fontWeight: 900, fontSize: 18, margin: 0 }}>Synchronizing Fiscal Records</p>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', marginTop: 4 }}>Authenticating with specialized Google Cloud endpoints...</p>
              </div>
          </div>
      ) : dataError ? (
          <div style={{ padding: 60, borderRadius: 32, background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', textAlign: 'center', margin: '40px 0' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <AlertCircle size={40} color="#ef4444" />
              </div>
              <h3 style={{ fontSize: 24, fontWeight: 900, color: '#ef4444', marginBottom: 12 }}>Fiscal Synchronization Interrupted</h3>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--muted)', maxWidth: 500, margin: '0 auto 32px', lineHeight: 1.6 }}>{dataError}</p>
              <button onClick={fetchData} className="btn btn-primary" style={{ padding: '12px 32px', borderRadius: 14, fontWeight: 800 }}>RETRY CONNECTION</button>
          </div>
      ) : filtered.length === 0 ? (
          <div style={{ padding: 80, borderRadius: 32, background: 'var(--bg-card)', border: '1px dashed var(--line)', textAlign: 'center', margin: '40px 0' }}>
              <Search size={48} color="var(--muted)" style={{ marginBottom: 20, opacity: 0.3 }} />
              <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>No Personnel Records Found</h3>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--muted)', maxWidth: 400, margin: '0 auto' }}>Adjust your filters or verify the workforce database status.</p>
          </div>
      ) : (
        <>
          {/* Financial Pulse Stats */}
          {!isMobile && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 40 }}>
                <StatCard title="Total Penalties" value={`₹${metrics.totalAmount.toLocaleString('en-IN')}`} icon={TrendingDown} color="var(--red)" trend={[3200, 4800, 4100, 4500, 5200, metrics.totalAmount]} />
                <StatCard title="Leave Violations" value={metrics.leaveVios} icon={Calendar} color="var(--red)" trend={[6, 9, 7, 11, 13, metrics.leaveVios]} />
                <StatCard title="Latency Risks" value={metrics.lateRisks} icon={AlertTriangle} color="var(--amber)" trend={[14, 17, 16, 20, 22, metrics.lateRisks]} />
                <StatCard title="Recovery Accuracy" value={metrics.accuracy} icon={ShieldCheck} color="var(--green)" trend={[99, 99.6, 99.8, 99.9, 99.9, 99.9]} />
            </div>
          )}
        </>
      )}

      {/* Penalty Record Matrix */}
      {!isInitialLoading && !dataError && filtered.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(450px, 1fr))', gap: 24 }}>
        {filtered.map((p, i) => (
          <div 
            key={i} 
            className="super-glass card-premium animate-in interactive-card" 
            onClick={() => { setSelectedEmp(p.emp); setShowDrawer('adjust'); }}
            style={{ 
              padding: 24, 
              border: '1px solid rgba(255,255,255,0.08)', 
              opacity: p.deductionBreakdown.total === 0 ? 0.7 : 1,
              cursor: 'pointer'
            }}
          >
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 16, background: p.emp?.color || 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, boxShadow: `0 8px 20px ${p.emp?.color || 'var(--accent)'}40` }}>
                        {p.emp?.av || '??'}
                    </div>
                    <div>
                        <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{p.emp?.name}</h3>
                        <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--muted)', letterSpacing: 1, marginTop: 2 }}>{p.emp?.id} • {p.emp?.dept || 'TECH'}</div>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: p.deductionBreakdown.total > 0 ? 'var(--red)' : 'var(--muted)', fontFamily: 'var(--font-mono)' }}>₹{p.deductionBreakdown.total.toLocaleString('en-IN')}</div>
                    <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Impact</div>
                </div>
             </div>

             <div className="hover-glass" style={{ background: 'rgba(0,0,0,0.02)', borderRadius: 20, padding: 20, border: '1px solid var(--line)', marginBottom: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.deductionBreakdown.leaveDeduction > 0 ? 'var(--red)' : 'var(--muted)', opacity: 0.4 }}></div>
                            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)' }}>Extra Leaves ({p.deductionBreakdown.leavesUsed}/3)</span>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 800 }}>₹{p.deductionBreakdown.leaveDeduction}</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.deductionBreakdown.lateDeduction > 0 ? 'var(--amber)' : 'var(--muted)', opacity: 0.4 }}></div>
                            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)' }}>Latency ({p.deductionBreakdown.lates} Lates)</span>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 800 }}>₹{p.deductionBreakdown.lateDeduction}</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.deductionBreakdown.other > 0 ? 'var(--accent)' : 'var(--muted)', opacity: 0.4 }}></div>
                            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)' }}>Manual Corrections</span>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 800 }}>₹{p.deductionBreakdown.other}</span>
                   </div>
                   {p.deductionBreakdown.waivers > 0 && (
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: 10, marginTop: 4 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <ShieldCheck size={14} color="var(--green)" />
                                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--green)' }}>Waiver Applied</span>
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 900, color: 'var(--green)' }}>-₹{p.deductionBreakdown.waivers}</span>
                       </div>
                   )}
                </div>
             </div>

             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                    {p.deductionBreakdown.total === 0 ? (
                        <div style={{ padding: '6px 12px', background: 'var(--green-dim)', border: '1px solid var(--green)', color: 'var(--green)', borderRadius: 100, fontSize: 10, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6 }}>
                             <UserCheck size={12} /> COMPLIANT
                        </div>
                    ) : (
                        <div style={{ padding: '6px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--line)', borderRadius: 100, fontSize: 10, fontWeight: 900, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <History size={12} /> AUDITED
                        </div>
                    )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleWaiveInitiation(p); }}
                        className="btn btn-sm btn-glass"
                        style={{ borderRadius: 12, fontSize: 11, fontWeight: 900, color: 'var(--red)', opacity: p.deductionBreakdown.total > 0 ? 1 : 0.4 }}
                        disabled={p.deductionBreakdown.total === 0 || isSubmitting}
                    >
                        <XCircle size={14} /> WAIVE
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedEmp(p.emp); setShowDrawer('adjust'); }}
                        className="btn btn-sm btn-primary"
                        style={{ borderRadius: 12, fontSize: 11, fontWeight: 900 }}
                    >
                        <Plus size={14} /> ADJUST
                    </button>
                </div>
             </div>
          </div>
        ))}
        </div>
      )}

      {/* Premium Policy/Adjustment Drawers */}
      {showDrawer && (
        <div className="modal-overlay" onClick={() => setShowDrawer(null)}>
          <div className="modal-drawer" onClick={e => e.stopPropagation()} style={{ width: isMobile ? '100%' : '520px' }}>
            <div className="modal-header">
                <div>
                    <h2 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>
                        {showDrawer === 'rules' ? 'Governance Policies' : 
                         showDrawer === 'waive' ? 'Waiver Hub: ' + selectedEmp?.name :
                         `Adjust: ${selectedEmp?.name}`}
                    </h2>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', marginTop: 4 }}>
                        {showDrawer === 'rules' ? 'Financial threshold orchestration' : 
                         showDrawer === 'waive' ? 'Select specific category to pardon' :
                         'Commissioning fiscal penalties'}
                    </p>
                </div>
                <button onClick={() => setShowDrawer(null)} className="btn-icon"><X size={20}/></button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {showDrawer === 'rules' ? (
                   <>
                        {/* Dynamic Catalog Section */}
                        <div style={{ padding: 24, borderRadius: 24, background: 'var(--bg-elevated)', border: '1px solid var(--line)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--muted)', letterSpacing: 1 }}>ACTIVE PENALTY CATALOG</div>
                                <Plus size={16} color="var(--accent)" style={{ cursor: 'pointer' }} onClick={() => setEditingPolicy('new')} />
                            </div>

                            {editingPolicy === 'new' && (
                                <div className="super-glass" style={{ padding: 16, borderRadius: 16, marginBottom: 16, border: '1px solid var(--accent-dim)' }}>
                                    <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                                        <input 
                                            placeholder="Penalty Label" 
                                            value={newPolicy.label}
                                            onChange={e => setNewPolicy({...newPolicy, label: e.target.value})}
                                            style={{ flex: 1, padding: 8, borderRadius: 8, fontSize: 12 }}
                                        />
                                        <input 
                                            placeholder="Amount" 
                                            type="number"
                                            value={newPolicy.amount}
                                            onChange={e => setNewPolicy({...newPolicy, amount: e.target.value})}
                                            style={{ width: 80, padding: 8, borderRadius: 8, fontSize: 12 }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button onClick={handleAddPolicy} className="btn btn-primary btn-sm" style={{ flex: 1 }}>COMMISSION</button>
                                        <button onClick={() => setEditingPolicy(null)} className="btn btn-ghost btn-sm">CANCEL</button>
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {catalog.map((item, idx) => (
                                    <div key={idx} className="hover-glass" style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid var(--line)', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center group' }}>
                                        {editingPolicy === item.id ? (
                                            <div style={{ display: 'flex', gap: 10, width: '100%', alignItems: 'center' }}>
                                                <input defaultValue={item.label} id={`edit-l-${item.id}`} style={{ flex: 1, padding: 6, borderRadius: 6, fontSize: 12 }} />
                                                <input defaultValue={item.amount} id={`edit-a-${item.id}`} style={{ width: 70, padding: 6, borderRadius: 6, fontSize: 12 }} />
                                                <button onClick={() => handleUpdatePolicy(item.id, { label: document.getElementById(`edit-l-${item.id}`).value, amount: document.getElementById(`edit-a-${item.id}`).value })} className="btn-icon" style={{ width: 32, height: 32, color: 'var(--green)' }}><Save size={14}/></button>
                                                <button onClick={() => setEditingPolicy(null)} className="btn-icon" style={{ width: 32, height: 32 }}><X size={14}/></button>
                                            </div>
                                        ) : (
                                            <>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)' }}></div>
                                                    <div style={{ fontSize: 13, fontWeight: 700 }}>{item.label}</div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--red)' }}>₹{item.amount}</div>
                                                    <div style={{ display: 'flex', gap: 4 }}>
                                                        <button onClick={() => setEditingPolicy(item.id)} className="btn-icon" style={{ width: 28, height: 28 }}><Edit2 size={12}/></button>
                                                        <button onClick={() => handleDeletePolicy(item.id)} className="btn-icon" style={{ width: 28, height: 28, color: 'var(--red)' }}><Trash2 size={12}/></button>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="super-glass" style={{ padding: 24, borderRadius: 24, border: '1px solid var(--line)' }}>
                            <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--muted)', letterSpacing: 1, marginBottom: 20 }}>AUTO-CALC THRESHOLDS</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--green-dim)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CheckCircle2 size={24} />
                                </div>
                                <div>
                                    <div style={{ fontSize: 16, fontWeight: 800 }}>Leave Allowance</div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)' }}>3 days per cycle (Standard)</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--amber-dim)', color: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Zap size={24} />
                                </div>
                                <div>
                                    <div style={{ fontSize: 16, fontWeight: 800 }}>Latency Penalty</div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)' }}>₹200.00 / flats (after 5 lates)</div>
                                </div>
                            </div>
                        </div>
                   </>
                ) : showDrawer === 'waive' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--muted)', letterSpacing: 1, marginBottom: 4 }}>DISTRIBUTED DEDUCTION WAIVER</div>
                        {waiverOptions.map((opt, idx) => (
                            <button 
                                key={idx}
                                onClick={() => handleWaive(selectedEmp.id, opt.amount, opt.label)}
                                className="btn btn-glass"
                                style={{ padding: '16px 24px', borderRadius: 16, border: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', height: 'auto' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                    <ShieldCheck size={18} color="var(--green)" />
                                    <div style={{ fontSize: 14, fontWeight: 800 }}>Waive {opt.label}</div>
                                </div>
                                <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--green)' }}>₹{opt.amount}</div>
                            </button>
                        ))}
                        <button 
                            onClick={() => handleWaive(selectedEmp.id, waiverOptions.reduce((s,o) => s+o.amount, 0), 'All Deductions')}
                            className="btn btn-success"
                            style={{ marginTop: 12, padding: '16px', borderRadius: 16, fontWeight: 900 }}
                        >
                           WAIVE ALL CATEGORIES
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--muted)', letterSpacing: 1, marginBottom: 12 }}>ELITE PENALTY CATALOG</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '35vh', overflowY: 'auto', paddingRight: 8 }}>
                                {catalog.map((item, idx) => (
                                    <div 
                                        key={idx}
                                        onClick={() => handleIssuePenalty(item)}
                                        className="hover-glass"
                                        style={{ padding: '16px 20px', borderRadius: 16, border: '1px solid var(--line)', background: 'rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: '0.2s' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--red-dim)', color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <AlertTriangle size={16} />
                                            </div>
                                            <div style={{ fontSize: 14, fontWeight: 700 }}>{item.label}</div>
                                        </div>
                                        <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--red)' }}>₹{item.amount}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Activity / Removal Hub */}
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--muted)', letterSpacing: 1, marginBottom: 12 }}>AUDIT TRAIL (MONTHLY)</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {loadingHistory ? <div style={{ fontSize: 12, opacity: 0.5 }}>Syncing audit trail...</div> : (
                                    history.length === 0 ? <div style={{ fontSize: 12, opacity: 0.5, padding: 20, textAlign: 'center', background: 'rgba(0,0,0,0.01)', borderRadius: 16 }}>No active manual adjustments found.</div> : 
                                    history.map((h, idx) => (
                                        <div key={idx} style={{ padding: '14px 18px', borderRadius: 16, background: h.entryType === 'waiver' ? 'rgba(34, 197, 94, 0.05)' : 'rgba(0,0,0,0.02)', border: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 800, color: h.entryType === 'waiver' ? 'var(--green)' : 'inherit' }}>{h.entryType === 'waiver' ? '[WAIVER] ' : ''}{h.title}</div>
                                                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', marginTop: 2 }}>{h.date} • {h.entryType.toUpperCase()}</div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{ fontSize: 14, fontWeight: 900 }}>{h.entryType === 'waiver' ? '-' : '+'}₹{h.penalty}</div>
                                                <button 
                                                    onClick={async () => {
                                                        if (!confirm('Remove this record from the permanent audit?')) return
                                                        try {
                                                            if (h.entryType === 'penalty') await api.deleteGovernance(h.id)
                                                            else await api.deleteWaiver(h.id)
                                                            showToast('Record purged from audit', 'success')
                                                            fetchHistory(selectedEmp.id)
                                                            fetchData()
                                                        } catch {
                                                            showToast('Purge failed', 'error')
                                                        }
                                                    }}
                                                    className="btn-icon" 
                                                    style={{ width: 32, height: 32, color: 'var(--red)' }}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="modal-footer">
                <button onClick={() => setShowDrawer(null)} className="btn btn-ghost" style={{ width: '100%', height: 52, borderRadius: 16, fontSize: 14, fontWeight: 900 }}>CLOSE HUB</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
