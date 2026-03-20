import { useState, useMemo } from 'react'
import { useData } from '../context/DataContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import * as api from '../services/api'
import { useToast } from '../context/ToastContext'
import StatCard from '../components/ui/StatCard'
import { 
  ShieldAlert, Award, Search, Filter, Plus, 
  CheckCircle, AlertOctagon, Star,
  Trash2, Send, MessageSquare, TrendingUp,
  ChevronLeft, ChevronRight, X,
  Fingerprint, FileSignature, ShieldCheck,
  Zap, Compass, Target
} from 'lucide-react'
import { Link } from 'react-router-dom'

export default function DisciplinaryExcellence() {
  const { employees, governance, loading, error, refresh } = useData()
  const { showToast } = useToast()
  
  const [activeTab, setActiveTab] = useState('excellence') // 'excellence' or 'disciplinary'
  const [search, setSearch] = useState('')
  const [showDrawer, setShowDrawer] = useState(false)
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 6
  
  // Form State
  const [formData, setFormData] = useState({
    empId: '',
    title: '',
    type: 'excellence',
    description: '',
    severity: 'standard', // standard, elevated, critical
    date: new Date().toISOString().split('T')[0]
  })

  // Executive Intelligence
  const stats = useMemo(() => {
    const all = governance || []
    const excellence = all.filter(r => r.type === 'excellence').length
    const disciplinary = all.filter(r => r.type === 'disciplinary').length
    
    // Compliance Index Mocked based on ratio
    const index = all.length === 0 ? 100 : Math.max(70, 100 - (disciplinary * 5))
    
    return { excellence, disciplinary, index }
  }, [governance])

  const filtered = useMemo(() => {
    return (governance || []).filter(r => 
      r.type === activeTab && 
      (r.empName?.toLowerCase().includes(search.toLowerCase()) || 
       r.title?.toLowerCase().includes(search.toLowerCase()))
    ).sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [governance, activeTab, search])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!formData.empId) return showToast('Lead personnel selection required', 'warning')
    
    try {
      const emp = employees.find(h => h.id === formData.empId)
      if (!emp) return showToast('Personnel record missing', 'error')
      
      await api.addGovernance({
        ...formData,
        empName: emp.name,
        issuedBy: 'HR Admin',
        verifiedAt: new Date().toISOString()
      })
      
      showToast('Governance record committed', 'success')
      setShowDrawer(false)
      setFormData({ empId: '', title: '', type: activeTab, description: '', severity: 'standard', date: new Date().toISOString().split('T')[0] })
      refresh()
    } catch (err) {
      showToast('Governance commitment failed', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Definitively purge this governance record?')) return
    try {
      await api.deleteGovernance(id)
      showToast('Record purged from archives', 'info')
      refresh()
    } catch (err) {
      showToast('Purge sequence failed', 'error')
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <div className="p-6">Error: {error}</div>

  const severityColors = {
    standard: { bg: 'var(--green-dim)', text: 'var(--green)', label: 'STANDARD' },
    elevated: { bg: 'var(--amber-dim)', text: 'var(--amber)', label: 'ELEVATED' },
    critical: { bg: 'var(--red-dim)', text: 'var(--red)', label: 'CRITICAL' }
  }

  return (
    <div className="animate-in" style={{ padding: '32px', maxWidth: 1600, margin: '0 auto' }}>
      {/* Executive Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-end',
        marginBottom: 48,
        gap: 24
      }}>
        <div>
          <h1 style={{ fontSize: 48, fontWeight: 900, letterSpacing: -2, margin: 0 }}>Governance Hub</h1>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--muted)', marginTop: 4, letterSpacing: 0.5 }}>Institutional ledger of achievements & compliance</p>
        </div>

        <button 
          onClick={() => setShowDrawer(true)}
          className="btn"
          style={{ 
            display: 'flex', alignItems: 'center', gap: 10, padding: '12px 24px', 
            borderRadius: 16, background: activeTab === 'excellence' ? 'var(--green)' : 'var(--red)', color: '#fff', 
            fontWeight: 900, fontSize: 13,
            boxShadow: `0 8px 24px ${activeTab === 'excellence' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`
          }}
        >
          <Plus size={20} /> New Issuance
        </button>
      </div>

      {/* Governance Pulse */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: 20, 
        marginBottom: 48 
      }}>
        <StatCard title="Excellence Velocity" value={stats.excellence} icon={Award} color="var(--green)" trend={[10, 12, 14, 13, 15, 18, stats.excellence]} />
        <StatCard title="Disciplinary Risk" value={stats.disciplinary} icon={ShieldAlert} color="var(--red)" trend={[5, 4, 3, 4, 2, 1, stats.disciplinary]} />
        <StatCard title="Compliance Index" value={`${stats.index}%`} icon={ShieldCheck} color="var(--accent)" trend={[90, 92, 91, 93, 94, 95, stats.index]} />
      </div>

      {/* Segmented Controller & Orchestration */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 20 }}>
          <div style={{ 
            display: 'flex', 
            background: 'rgba(0,0,0,0.05)', 
            padding: 6, 
            borderRadius: 18,
            gap: 4
          }}>
            <button 
              onClick={() => { setActiveTab('excellence'); setCurrentPage(1); }}
              style={{ 
                padding: '10px 24px', borderRadius: 14, border: 'none',
                background: activeTab === 'excellence' ? '#fff' : 'transparent',
                color: activeTab === 'excellence' ? 'var(--text)' : 'var(--muted)',
                fontWeight: 800, fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 10,
                boxShadow: activeTab === 'excellence' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <Award size={18} /> Excellence Board
            </button>
            <button 
              onClick={() => { setActiveTab('disciplinary'); setCurrentPage(1); }}
              style={{ 
                padding: '10px 24px', borderRadius: 14, border: 'none',
                background: activeTab === 'disciplinary' ? '#fff' : 'transparent',
                color: activeTab === 'disciplinary' ? 'var(--text)' : 'var(--muted)',
                fontWeight: 800, fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 10,
                boxShadow: activeTab === 'disciplinary' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <ShieldAlert size={18} /> Disciplinary Log
            </button>
          </div>

          <div style={{ flex: 1, maxWidth: 400, position: 'relative' }}>
             <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
             <input 
                type="text" 
                placeholder="Search archives by personnel or record..." 
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: 16, background: 'rgba(0,0,0,0.03)', border: 'none', fontSize: 14, fontWeight: 700, outline: 'none' }}
             />
          </div>
      </div>

      {/* Records Vault */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24, marginBottom: 32 }}>
        {filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(record => {
          const isExcellence = record.type === 'excellence'
          const color = isExcellence ? 'var(--green)' : 'var(--red)'
          const dimColor = isExcellence ? 'var(--green-dim)' : 'var(--red-dim)'
          const sev = severityColors[record.severity || 'standard']

          return (
            <div key={record.id} className="card-premium super-glass animate-in" style={{ 
              padding: 0, borderRadius: 28, overflow: 'hidden',
              border: `1px solid ${dimColor}`,
              display: 'flex', flexDirection: 'column'
            }}>
                {/* Visual Stamp */}
                <div style={{ padding: '12px 24px', background: dimColor, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
                        <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: 1, color: color }}>
                            {isExcellence ? 'COMMENDATION' : 'NOTICE'}
                        </span>
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 800, color: color, opacity: 0.6 }}>SIS-AUDIT-ID: {record.id?.substring(0,8).toUpperCase()}</span>
                </div>

                <div style={{ padding: 24, flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                        <div style={{ 
                            width: 48, height: 48, borderRadius: 16, background: isExcellence ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)', 
                            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: `0 8px 16px ${dimColor}`
                        }}>
                             {isExcellence ? <Award size={24} /> : <AlertOctagon size={24} />}
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <div style={{ padding: '6px 12px', borderRadius: 8, background: sev.bg, color: sev.text, fontSize: 9, fontWeight: 900 }}>
                                {sev.label}
                            </div>
                            <button className="btn-icon" onClick={() => handleDelete(record.id)} style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(239, 68, 68, 0.05)', color: 'var(--red)' }}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>

                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: 'var(--text)', lineHeight: 1.3 }}>{record.title}</h3>
                    <p style={{ marginTop: 12, fontSize: 13, fontWeight: 600, color: 'var(--muted)', opacity: 0.8, lineHeight: 1.5 }}>
                        "{record.description}"
                    </p>

                    <div style={{ marginTop: 20, padding: 16, background: 'rgba(255,255,255,0.4)', borderRadius: 20, border: '1px solid rgba(0,0,0,0.02)' }}>
                        <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>Subject Personnel</div>
                        <Link to={`/employees/${record.empId}`} style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'inherit' }}>
                             <div style={{ width: 36, height: 36, borderRadius: 12, background: 'var(--bg-elevated)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: color }}>
                                 {record.empName?.charAt(0)}
                             </div>
                             <div>
                                 <div style={{ fontSize: 14, fontWeight: 800 }}>{record.empName}</div>
                                 <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)' }}>Official Registry Link</div>
                             </div>
                        </Link>
                    </div>
                </div>

                <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(0,0,0,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Fingerprint size={12} color="var(--muted)" />
                        <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--muted)' }}>VERIFIED BY SISTEM</span>
                     </div>
                     <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--muted)' }}>
                        {new Date(record.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                     </span>
                </div>
            </div>
          )
        })}
      </div>

      {/* Pagination Controller */}
      {filtered.length > pageSize && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 40 }}>
            <button className="btn-glass" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={{ padding: '10px 20px', borderRadius: 14 }}>Prev</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 800 }}>
                {currentPage} <span style={{ opacity: 0.4 }}>/</span> {Math.ceil(filtered.length / pageSize)}
            </div>
            <button className="btn-glass" disabled={currentPage >= Math.ceil(filtered.length / pageSize)} onClick={() => setCurrentPage(p => p + 1)} style={{ padding: '10px 20px', borderRadius: 14 }}>Next</button>
        </div>
      )}

      {filtered.length === 0 && (
         <div style={{ padding: 120, textAlign: 'center', opacity: 0.4 }}>
            <Compass size={64} style={{ marginBottom: 24 }} />
            <h2 style={{ fontSize: 24, fontWeight: 900 }}>Empty Archives</h2>
            <p style={{ fontWeight: 700, maxWidth: 400, margin: '12px auto' }}>Governance parameters are currently stable. No records found match your intelligence query.</p>
         </div>
      )}

      {/* Premium record Drawer */}
      {showDrawer && (
        <div className="modal-overlay" onClick={() => setShowDrawer(false)} style={{ backdropFilter: 'blur(8px)', zIndex: 1000 }}>
          <div 
            className="modal-drawer super-glass animate-in" 
            onClick={e => e.stopPropagation()} 
            style={{ 
                position: 'fixed', right: 0, top: 0, bottom: 0, width: 500,
                background: '#fff', padding: 40, borderLeft: '1px solid rgba(0,0,0,0.1)',
                display: 'flex', flexDirection: 'column', height: '100vh', zIndex: 1001
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: -1, margin: 0 }}>Record Issuance</h2>
                <div style={{ fontSize: 11, fontWeight: 900, color: activeTab === 'excellence' ? 'var(--green)' : 'var(--red)', marginTop: 4 }}>
                    GOVERNANCE PROTOCOL: {activeTab?.toUpperCase()}
                </div>
              </div>
              <button 
                onClick={() => setShowDrawer(false)}
                className="btn-icon" 
                style={{ background: 'rgba(0,0,0,0.05)', borderRadius: 14 }}
              >
                  <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ flex: 1, overflowY: 'auto', paddingRight: 8, display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Personnel Select */}
                <div>
                   <label style={{ display: 'block', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>Personnel Selection</label>
                   <select 
                        value={formData.empId} 
                        onChange={e => setFormData({...formData, empId: e.target.value})}
                        style={{ width: '100%', padding: '16px 20px', borderRadius: 16, background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', fontSize: 14, fontWeight: 700, outline: 'none' }}
                        required
                    >
                        <option value="">Awaiting selection...</option>
                        {employees.map(e => (
                            <option key={e.id} value={e.id}>{e.name} ({e.dept})</option>
                        ))}
                   </select>
                </div>

                {/* Title */}
                <div>
                   <label style={{ display: 'block', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>Record Title</label>
                   <input 
                    type="text" 
                    placeholder="E.g., Star Performer Commendation..." 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    style={{ width: '100%', padding: '16px 20px', borderRadius: 16, background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', fontSize: 15, fontWeight: 700, outline: 'none' }} 
                    required
                   />
                </div>

                {/* Severity Tier */}
                <div>
                   <label style={{ display: 'block', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>Severity Tier</label>
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                        {Object.entries(severityColors).map(([key, val]) => (
                            <button 
                                key={key}
                                type="button"
                                onClick={() => setFormData({...formData, severity: key})}
                                style={{ 
                                    padding: '12px', borderRadius: 12, border: formData.severity === key ? `2px solid ${val.text}` : '1px solid rgba(0,0,0,0.05)',
                                    background: formData.severity === key ? val.bg : 'transparent',
                                    color: formData.severity === key ? val.text : 'var(--muted)',
                                    fontSize: 10, fontWeight: 900, cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                {val.label}
                            </button>
                        ))}
                   </div>
                </div>

                {/* Description */}
                <div>
                   <label style={{ display: 'block', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>Factual Rationale</label>
                   <textarea 
                    rows={5}
                    placeholder="Provide a detailed strategic overview of this issuance..." 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    style={{ width: '100%', padding: '16px 20px', borderRadius: 16, background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', fontSize: 14, fontWeight: 600, outline: 'none', resize: 'none' }} 
                    required
                   />
                </div>

                {/* Date */}
                <div>
                   <label style={{ display: 'block', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>Effective Date</label>
                   <input 
                    type="date" 
                    value={formData.date} 
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    style={{ width: '100%', padding: '16px 20px', borderRadius: 16, background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', fontSize: 14, fontWeight: 700, outline: 'none' }} 
                    required
                   />
                </div>

                <div style={{ marginTop: 24, display: 'flex', gap: 16 }}>
                    <button type="button" className="btn-glass" style={{ flex: 1, padding: 18, borderRadius: 18 }} onClick={() => setShowDrawer(false)}>Cancel</button>
                    <button type="submit" className="btn" style={{ flex: 1.5, padding: 18, borderRadius: 18, background: activeTab === 'excellence' ? 'var(--green)' : 'var(--red)', color: '#fff', fontWeight: 900 }}>Commit Issuance</button>
                </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .modal-drawer {
            animation: slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
