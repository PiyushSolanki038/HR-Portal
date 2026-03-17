import { useState } from 'react'
import { useData } from '../context/DataContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import * as api from '../services/api'
import { useToast } from '../context/ToastContext'
import { 
  ShieldAlert, Award, Search, Filter, Plus, 
  MoreVertical, CheckCircle, AlertOctagon, Star,
  Trash2, Send, MessageSquare
} from 'lucide-react'

export default function DisciplinaryExcellence() {
  const { employees, governance, loading, error, refresh } = useData()
  const { showToast } = useToast()
  
  const [activeTab, setActiveTab] = useState('excellence') // 'excellence' or 'disciplinary'
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  
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
    <div className="animate-in" style={{ paddingBottom: 40 }}>
      <div className="page-header">
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 800 }}>Governance & Awards</h1>
          <p className="subtitle">Manage organizational discipline and celebrate excellence</p>
        </div>
        <button className="btn btn-premium" onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Record
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button 
          className={`btn ${activeTab === 'excellence' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => { setActiveTab('excellence'); setFormData(f => ({...f, type: 'excellence'})); }}
          style={{ position: 'relative' }}
        >
          <Award size={16} /> Excellence Board
          {activeTab === 'excellence' && <div style={{ position: 'absolute', bottom: -12, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)' }} />}
        </button>
        <button 
          className={`btn ${activeTab === 'disciplinary' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => { setActiveTab('disciplinary'); setFormData(f => ({...f, type: 'disciplinary'})); }}
          style={{ position: 'relative' }}
        >
          <ShieldAlert size={16} /> Disciplinary Log
          {activeTab === 'disciplinary' && <div style={{ position: 'absolute', bottom: -12, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)' }} />}
        </button>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input 
              className="input" 
              placeholder="Search by name or title..." 
              style={{ paddingLeft: 40 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-secondary"><Filter size={16} /> Filter</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
        {filtered.map(record => {
          const Icon = getIcon(record.type)
          const color = getColor(record.type)
          return (
            <div key={record.id} className="card card-glass animate-in" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div style={{ 
                  width: 48, height: 48, borderRadius: 14, 
                  background: `${color}20`, 
                  color: color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Icon size={24} />
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleDelete(record.id)}><Trash2 size={16} color="var(--red)" /></button>
                </div>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{record.title}</h3>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginBottom: 12 }}>{record.empName}</div>
              
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 20 }}>
                {record.description}
              </p>

              <div style={{ borderTop: '1px solid var(--line)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
                  {new Date(record.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-xs btn-ghost" title="Notify Employee"><Send size={14} /></button>
                  <button className="btn btn-xs btn-ghost" title="Add Note"><MessageSquare size={14} /></button>
                </div>
              </div>
            </div>
          )
        })}
        
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px 0', opacity: 0.5 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
            <h3>No records found</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      {/* Summary Insights */}
      <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
        <div className="card" style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--green)' }}>
            {(governance || []).filter(r => r.type === 'excellence').length}
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginTop: 4 }}>Total Awards</div>
        </div>
        <div className="card" style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--red)' }}>
             {(governance || []).filter(r => r.type === 'disciplinary').length}
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginTop: 4 }}>Active Warnings</div>
        </div>
        <div className="card" style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--accent)' }}>94%</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginTop: 4 }}>Compliance Rate</div>
        </div>
      </div>

      {/* New Record Modal */}
      {showModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }} onClick={() => setShowModal(false)}>
          <div className="modal-content card animate-in" style={{ width: '100%', maxWidth: 500, padding: 32, borderRadius: 24, background: 'var(--bg-card)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>Add New Record</h2>
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
