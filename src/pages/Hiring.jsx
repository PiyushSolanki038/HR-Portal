import { useState, useEffect } from 'react'
import { useScreenSize } from '../hooks/useScreenSize'
import { useToast } from '../context/ToastContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Modal from '../components/ui/Modal'
import * as api from '../services/api'
import { UserPlus, Search, ChevronRight } from 'lucide-react'

const STAGES = ['applied', 'shortlisted', 'interviewed', 'selected', 'rejected']
const STAGE_COLORS = {
  applied: 'badge-blue',
  shortlisted: 'badge-purple',
  interviewed: 'badge-amber',
  selected: 'badge-green',
  rejected: 'badge-red',
}

export default function Hiring() {
  const { isMobile, isTablet, isDesktop } = useScreenSize()
  const { showToast } = useToast()
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [view, setView] = useState('pipeline')
  const [form, setForm] = useState({ name: '', appliedFor: '', dept: '', contact: '' })

  const load = async () => {
    try {
      setLoading(true)
      setCandidates(await api.getCandidates())
    } catch (err) {
      showToast('Failed to load candidates', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleAdd = async () => {
    try {
      await api.addCandidate(form)
      showToast('Candidate added', 'success')
      setShowAdd(false)
      setForm({ name: '', appliedFor: '', dept: '', contact: '' })
      load()
    } catch (err) {
      showToast('Failed to add candidate', 'error')
    }
  }

  const handleStageChange = async (id, stage) => {
    try {
      await api.updateCandidateStage(id, stage)
      showToast(`Stage updated to ${stage}`, 'success')
      load()
    } catch (err) {
      showToast('Failed to update stage', 'error')
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="animate-in" style={{ padding: isMobile ? 12 : 28, maxWidth: '100%', overflowX: 'hidden' }}>
      <div className="page-header" style={{ flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? 16 : 24, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 24 : 32, fontWeight: 800 }}>Hiring Pipeline</h1>
          <p className="subtitle" style={{ fontSize: isMobile ? 12 : 14 }}>{candidates.length} candidates in pipeline</p>
        </div>
        <div style={{ display: 'flex', gap: 8, width: isMobile ? '100%' : 'auto', flexWrap: 'wrap' }}>
          <button className={`btn ${view === 'pipeline' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: isMobile ? 1 : 'none', fontSize: isMobile ? 12 : 14 }} onClick={() => setView('pipeline')}>Pipeline</button>
          <button className={`btn ${view === 'table' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: isMobile ? 1 : 'none', fontSize: isMobile ? 12 : 14 }} onClick={() => setView('table')}>Table</button>
          <button className="btn btn-primary" style={{ flex: isMobile ? '1 1 100%' : 'none', fontSize: isMobile ? 12 : 14, justifyContent: 'center', marginTop: isMobile ? 4 : 0 }} onClick={() => setShowAdd(true)}>
            <UserPlus size={16} /> Add Candidate
          </button>
        </div>
      </div>

      {view === 'pipeline' && (
        <div className="pipeline">
          {STAGES.filter(s => s !== 'rejected').map(stage => {
            const stageCands = candidates.filter(c => c.stage === stage)
            return (
              <div key={stage} className="pipeline-column">
                <div className="pipeline-column-header">
                  <h3>{stage}</h3>
                  <span className="count">{stageCands.length}</span>
                </div>
                {stageCands.map(c => (
                  <div key={c.id} className="pipeline-card">
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>{c.appliedFor} • {c.dept}</div>
                    {c.contact && <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{c.contact}</div>}
                    <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                      {STAGES.filter(s => s !== stage).map(s => (
                        <button key={s} className="btn btn-ghost btn-sm" onClick={() => handleStageChange(c.id, s)} style={{ fontSize: 10 }}>
                          <ChevronRight size={10} /> {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {stageCands.length === 0 && <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', padding: 16 }}>No candidates</p>}
              </div>
            )
          })}
        </div>
      )}

      {view === 'table' && (
        <div className="table-container" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', borderRadius: 16 }}>
          <table style={{ minWidth: 800 }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Position</th>
                <th>Department</th>
                <th>Contact</th>
                <th>Stage</th>
                <th>Score</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td>{c.appliedFor}</td>
                  <td style={{ color: 'var(--muted)' }}>{c.dept}</td>
                  <td style={{ color: 'var(--text-dim)' }}>{c.contact}</td>
                  <td>
                    <select
                      value={c.stage}
                      onChange={e => handleStageChange(c.id, e.target.value)}
                      style={{ maxWidth: 140, padding: '4px 8px', fontSize: 12 }}
                    >
                      {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>{c.score || '—'}</td>
                  <td style={{ color: 'var(--muted)', fontSize: 12 }}>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && (
        <Modal
          title="Add Candidate"
          onClose={() => setShowAdd(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdd}>Add Candidate</button>
            </>
          }
        >
          <div className="form-group">
            <label style={{ fontSize: 13, fontWeight: 600 }}>Full Name</label>
            <input 
              value={form.name} 
              onChange={e => setForm({...form, name: e.target.value})} 
              placeholder="John Doe" 
              style={{ fontSize: 16, width: '100%', padding: '12px', borderRadius: '10px' }}
            />
          </div>
          <div className="form-row" style={{ gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label style={{ fontSize: 13, fontWeight: 600 }}>Applied For</label>
              <input 
                value={form.appliedFor} 
                onChange={e => setForm({...form, appliedFor: e.target.value})} 
                placeholder="Frontend Developer" 
                style={{ fontSize: 16, width: '100%', padding: '12px', borderRadius: '10px' }}
              />
            </div>
            <div className="form-group">
              <label style={{ fontSize: 13, fontWeight: 600 }}>Department</label>
              <input 
                value={form.dept} 
                onChange={e => setForm({...form, dept: e.target.value})} 
                placeholder="Engineering" 
                style={{ fontSize: 16, width: '100%', padding: '12px', borderRadius: '10px' }}
              />
            </div>
          </div>
          <div className="form-group">
            <label style={{ fontSize: 13, fontWeight: 600 }}>Contact</label>
            <input 
              value={form.contact} 
              onChange={e => setForm({...form, contact: e.target.value})} 
              placeholder="email or phone" 
              style={{ fontSize: 16, width: '100%', padding: '12px', borderRadius: '10px' }}
            />
          </div>
        </Modal>
      )}
    </div>
  )
}
