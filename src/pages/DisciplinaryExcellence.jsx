import { useState } from 'react'
import { useData } from '../context/DataContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import * as api from '../services/api'
import { useToast } from '../context/ToastContext'
import { 
  ShieldAlert, Award, Search, Filter, Plus, 
  MoreVertical, CheckCircle, AlertOctagon, Star,
  Trash2, Send, MessageSquare, TrendingUp,
  ChevronLeft, ChevronRight
} from 'lucide-react'

export default function DisciplinaryExcellence() {
  const { employees, governance, loading, error, refresh } = useData()
  const { showToast } = useToast()
  
  const [activeTab, setActiveTab] = useState('excellence') // 'excellence' or 'disciplinary'
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 6
  
  // Form State
  const [formData, setFormData] = useState({
    empId: '',
    title: '',
    type: 'excellence',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })

  if (loading) return <LoadingSpinner />
  if (error) return <div className="p-6">Error: {error}</div>

  const filtered = (governance || []).filter(r => 
    r.type === activeTab && 
    (r.empName?.toLowerCase().includes(search.toLowerCase()) || 
     r.title?.toLowerCase().includes(search.toLowerCase()))
  )

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const emp = employees.find(h => h.id === formData.empId)
      if (!emp) return showToast('Please select an employee', 'error')
      
      await api.addGovernance({
        ...formData,
        empName: emp.name
      })
      showToast('Record created successfully', 'success')
      setShowModal(false)
      setFormData({ empId: '', title: '', type: activeTab, description: '', date: new Date().toISOString().split('T')[0] })
      refresh()
    } catch (err) {
      showToast('Failed to create record', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return
    try {
      await api.deleteGovernance(id)
      showToast('Record deleted', 'success')
      refresh()
    } catch (err) {
      showToast('Deletion failed', 'error')
    }
  }

  const getIcon = (type) => {
    if (type === 'excellence') return Award
    return AlertOctagon
  }

  const getColor = (type) => {
    if (type === 'excellence') return '#10b981'
    return '#ef4444'
  }

  return (
    <div className="animate-in" style={{ paddingBottom: 100, width: '100%', minHeight: 'fit-content', overflow: 'visible' }}>
      {/* Institutional Header */}
      <div className="page-header" style={{ marginBottom: 40, position: 'relative' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 className="glow-text" style={{ fontFamily: 'var(--font-heading)', fontSize: 34, fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Governance & Excellence
          </h1>
          <p className="subtitle" style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)', marginTop: 6 }}>
            Official ledger of organizational achievements and compliance standards
          </p>
        </div>
        <button className="btn btn-premium" onClick={() => setShowModal(true)} style={{ boxShadow: '0 10px 20px -5px var(--accent-glow)' }}>
          <Plus size={18} /> ISSUANCE HUB
        </button>
        {/* Background ambient glow */}
        <div style={{ position: 'absolute', top: -100, left: -50, width: 300, height: 300, background: 'var(--accent-glow)', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.3, zIndex: 0 }} />
      </div>

      {/* Modern Segmented Tabs */}
      <div style={{ 
        display: 'flex', 
        background: 'var(--bg-elevated)', 
        padding: 6, 
        borderRadius: 16, 
        width: 'fit-content', 
        marginBottom: 32,
        border: '1px solid var(--line)',
        position: 'relative',
        zIndex: 10
      }}>
        <button 
          className="btn"
          onClick={(e) => { 
            e.preventDefault();
            setActiveTab('excellence'); 
            setCurrentPage(1);
          }}
          style={{ 
            borderRadius: 12, 
            padding: '10px 24px', 
            fontWeight: 800,
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s ease',
            background: activeTab === 'excellence' ? 'var(--accent)' : 'transparent',
            color: activeTab === 'excellence' ? '#000' : 'var(--muted)',
            border: 'none',
            boxShadow: activeTab === 'excellence' ? '0 4px 12px var(--accent-glow)' : 'none',
            pointerEvents: 'auto'
          }}
        >
          <Award size={16} /> Excellence Board
        </button>
        <button 
          className="btn"
          onClick={(e) => { 
            e.preventDefault();
            setActiveTab('disciplinary'); 
            setCurrentPage(1);
          }}
          style={{ 
            borderRadius: 12, 
            padding: '10px 24px', 
            fontWeight: 800,
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s ease',
            background: activeTab === 'disciplinary' ? 'var(--accent)' : 'transparent',
            color: activeTab === 'disciplinary' ? '#000' : 'var(--muted)',
            border: 'none',
            boxShadow: activeTab === 'disciplinary' ? '0 4px 12px var(--accent-glow)' : 'none',
            pointerEvents: 'auto'
          }}
        >
          <ShieldAlert size={16} /> Disciplinary Log
        </button>
      </div>

      {/* Glassmorphic Search container */}
      <div className="card-glass" style={{ padding: '16px 20px', marginBottom: 32, borderRadius: 20 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--accent)' }} />
            <input 
              className="input" 
              placeholder="Filter archives by personnel or record title..." 
              style={{ 
                paddingLeft: 48, 
                height: 52, 
                background: 'var(--bg-card)', 
                border: '1px solid var(--line)',
                fontSize: 14,
                fontWeight: 600
              }}
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <button className="btn btn-secondary" style={{ height: 52, padding: '0 24px', borderRadius: 12, fontWeight: 700 }}>
            <Filter size={18} /> ADVANCED FILTERS
          </button>
        </div>
      </div>

      {/* Paginated Card Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
        {filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(record => {
          const Icon = getIcon(record.type)
          const color = getColor(record.type)
          const isExcellence = record.type === 'excellence'
          
          return (
            <div key={record.id} className="card-premium animate-in" style={{ 
              padding: 0, 
              border: `1px solid ${color}30`,
              background: `linear-gradient(165deg, var(--bg-card) 0%, ${color}08 100%)`,
              boxShadow: `0 12px 24px -12px ${color}20`,
              borderRadius: 20,
              maxWidth: 400
            }}>
              {/* Slip Header/Stamp */}
              <div style={{ 
                padding: '10px 16px', 
                borderBottom: `1px dashed ${color}30`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: `${color}05`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
                  <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: 1, color: color, textTransform: 'uppercase' }}>
                    {isExcellence ? 'OFFICIAL COMMENDATION' : 'DISCIPLINARY NOTICE'}
                  </span>
                </div>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                  REF: {record.id?.substring(0,8).toUpperCase() || 'SIS-2026-X'}
                </div>
              </div>

              <div style={{ padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ 
                    width: 40, height: 40, borderRadius: 12, 
                    background: isExcellence ? 'linear-gradient(135deg, #F59E0B, #D97706)' : 'linear-gradient(135deg, #EF4444, #B91C1C)', 
                    color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 6px 12px ${color}15`,
                    position: 'relative'
                  }}>
                    <Icon size={20} />
                    <div style={{ position: 'absolute', bottom: -3, right: -3, width: 16, height: 16, borderRadius: '50%', background: '#fff', border: `1.5px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
                      <CheckCircle size={10} fill={color} color="#fff" />
                    </div>
                  </div>
                  <button className="btn btn-ghost btn-icon" onClick={() => handleDelete(record.id)} style={{ width: 32, height: 32, borderRadius: 8 }}>
                    <Trash2 size={15} color="var(--red)" />
                  </button>
                </div>
  
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Subject Personnel</div>
                  <div style={{ 
                    display: 'flex', alignItems: 'center', gap: 10, 
                    background: 'var(--bg-elevated)', padding: '6px 10px', borderRadius: 12, border: '1px solid var(--line)'
                  }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--bg-card)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color: color }}>
                      {record.empName?.charAt(0)}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>{record.empName}</div>
                  </div>
                </div>

                <h3 style={{ fontSize: 15, fontWeight: 900, marginBottom: 6, color: 'var(--text)', letterSpacing: '-0.01em' }}>{record.title}</h3>
                <p style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.4, marginBottom: 16, minHeight: 40, fontWeight: 500 }}>
                  "{record.description}"
                </p>
  
                <div style={{ 
                  display: 'flex', gap: 8, paddingTop: 12, borderTop: '1px solid var(--line)' 
                }}>
                  <button className="btn btn-sm btn-premium" style={{ flex: 1.2, borderRadius: 8, height: 34, fontSize: 11 }}>
                    <Send size={12} /> DISPATCH
                  </button>
                  <button className="btn btn-sm btn-secondary" style={{ flex: 1, borderRadius: 8, height: 34, fontWeight: 700, fontSize: 11 }}>
                    <MessageSquare size={12} /> DISCUSS
                  </button>
                </div>

                <div style={{ marginTop: 16, textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  RECORDED ON {new Date(record.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Carousel Navigation */}
      {filtered.length > pageSize && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: 20, 
          marginBottom: 40,
          background: 'var(--bg-elevated)',
          padding: '12px 24px',
          borderRadius: 20,
          width: 'fit-content',
          margin: '0 auto 40px',
          border: '1px solid var(--line)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <button 
            className="btn btn-icon btn-secondary" 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{ width: 40, height: 40, borderRadius: 12, opacity: currentPage === 1 ? 0.5 : 1 }}
          >
            <ChevronLeft size={20} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>Page {currentPage}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)' }}>of {Math.ceil(filtered.length / pageSize)}</span>
          </div>

          <button 
            className="btn btn-icon btn-secondary" 
            onClick={() => setCurrentPage(p => Math.min(Math.ceil(filtered.length / pageSize), p + 1))}
            disabled={currentPage === Math.ceil(filtered.length / pageSize)}
            style={{ width: 40, height: 40, borderRadius: 12, opacity: currentPage === Math.ceil(filtered.length / pageSize) ? 0.5 : 1 }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
        
      {filtered.length === 0 && (
        <div className="card-glass" style={{ textAlign: 'center', padding: '120px 40px', borderRadius: 32, border: '2px dashed var(--line)', marginBottom: 32 }}>
          <div style={{ 
            width: 100, height: 100, borderRadius: '50%', background: 'var(--bg-elevated)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
            border: '1px solid var(--line)'
          }}>
            <ShieldAlert size={48} color="var(--line)" />
          </div>
          <h3 style={{ fontSize: 26, fontWeight: 900, color: 'var(--text)' }}>Nulla Recorda</h3>
          <p style={{ color: 'var(--muted)', maxWidth: 460, margin: '12px auto 0', fontSize: 15, fontWeight: 500, lineHeight: 1.6 }}>
            The organizational archives are currently clear for this category. Recognized excellence or maintaining standards leads to a clean slate.
          </p>
        </div>
      )}
  
      {/* Verified Analytics Section */}
      <div style={{ marginTop: 60, padding: '40px 0', borderTop: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ padding: 8, background: 'var(--accent-glow)', borderRadius: 12 }}>
              <Star size={22} color="var(--accent)" fill="var(--accent)" />
            </div>
            Governance Analytics
          </h2>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
            LIVE RECONCILIATION • {new Date().toLocaleTimeString()}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          <div className="card-premium" style={{ padding: 24, borderRadius: 24, border: '1px solid var(--green-dim)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Hall of Fame</div>
              <div style={{ color: 'var(--green)', padding: 5, background: 'var(--green-dim)', borderRadius: 7 }}><Award size={16} /></div>
            </div>
            <div style={{ fontSize: 38, fontWeight: 950, color: 'var(--text)', lineHeight: 1, marginBottom: 8 }}>
              {(governance || []).filter(r => r.type === 'excellence').length}
            </div>
            <div style={{ fontSize: 12, color: 'var(--green)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
              <TrendingUp size={13} /> +12.4%
            </div>
          </div>

          <div className="card-premium" style={{ padding: 24, borderRadius: 24, border: '1px solid var(--red-dim)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Active Warnings</div>
              <div style={{ color: 'var(--red)', padding: 5, background: 'var(--red-dim)', borderRadius: 7 }}><ShieldAlert size={16} /></div>
            </div>
            <div style={{ fontSize: 38, fontWeight: 950, color: 'var(--text)', lineHeight: 1, marginBottom: 8 }}>
               {(governance || []).filter(r => r.type === 'disciplinary').length}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 800 }}>-3 this quarter</div>
          </div>

          <div className="card-premium" style={{ padding: 24, borderRadius: 24, border: '1px solid var(--accent-glow)', background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--accent-glow) 100%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Compliance Index</div>
              <div style={{ color: 'var(--accent)', padding: 5, background: 'var(--accent-glow)', borderRadius: 7 }}><CheckCircle size={16} /></div>
            </div>
            <div style={{ fontSize: 38, fontWeight: 950, color: 'var(--text)', lineHeight: 1, marginBottom: 8 }}>94.2%</div>
            <div style={{ width: '100%', height: 5, background: 'var(--bg-elevated)', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ width: '94.2%', height: '100%', background: 'var(--accent)' }} />
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-drawer" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
               <h2 style={{ fontSize: 24, fontWeight: 800 }}>Add New Record</h2>
            </div>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label className="label">Category</label>
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button type="button" onClick={() => setFormData({...formData, type: 'excellence'})} className={`btn btn-sm ${formData.type === 'excellence' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1 }}>Excellence</button>
                  <button type="button" onClick={() => setFormData({...formData, type: 'disciplinary'})} className={`btn btn-sm ${formData.type === 'disciplinary' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1 }}>Disciplinary</button>
                </div>
              </div>
              <div>
                <label className="label">Select Employee</label>
                <select className="input" value={formData.empId} onChange={e => setFormData({...formData, empId: e.target.value})} required>
                  <option value="">Choose an employee...</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.dept})</option>)}
                </select>
              </div>
              <div>
                <label className="label">Record Title</label>
                <input className="input" placeholder="e.g. Star Performer or Late Submission" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div>
                <label className="label">Date</label>
                <input type="date" className="input" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input" rows={4} placeholder="Provide details about this record..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Process Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
