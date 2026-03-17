import { useState } from 'react'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Modal from '../components/ui/Modal'
import * as api from '../services/api'
import { UserPlus, CheckCircle, Circle, ArrowRight } from 'lucide-react'

const STEPS = [
  'Documents Collected',
  'System Access Created',
  'Team Introduction Done',
  'Training Scheduled',
  'Probation Period Set',
]

export default function Onboarding() {
  const { employees, loading, error, refresh } = useData()
  const { showToast } = useToast()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    id: '', name: '', role: '', dept: '', email: '', salary: '', telegramChatId: '', joining: ''
  })

  if (loading) return <LoadingSpinner />
  if (error) return <div className="empty-state">Error: {error}</div>

  // Show recent employees (joined in last 30 days) as "onboarding"
  const recent = employees.filter(e => {
    if (!e.joining) return false
    const joinDate = new Date(e.joining)
    const daysAgo = (Date.now() - joinDate) / (1000 * 60 * 60 * 24)
    return daysAgo <= 30
  })

  const handleAdd = async () => {
    try {
      const empId = `EMP${Date.now().toString().slice(-6)}`
      await api.addEmployee({ ...form, id: empId, joining: form.joining || new Date().toISOString().split('T')[0] })
      showToast('Employee onboarded successfully', 'success')
      setShowAdd(false)
      setForm({ id: '', name: '', role: '', dept: '', email: '', salary: '', telegramChatId: '', joining: '' })
      refresh()
    } catch (err) {
      showToast('Failed to onboard employee', 'error')
    }
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1>Onboarding</h1>
          <p className="subtitle">New employee onboarding tracker</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <UserPlus size={16} /> Onboard Employee
        </button>
      </div>

      {recent.length === 0 ? (
        <div className="empty-state">
          <UserPlus size={48} />
          <h3>No recent onboardings</h3>
          <p>Click "Onboard Employee" to add a new team member</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
          {recent.map(emp => (
            <div key={emp.id} className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div className="avatar" style={{ background: emp.color || 'var(--accent)' }}>
                  {emp.av || emp.name?.slice(0,2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{emp.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{emp.role} • {emp.dept}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
                Joined: {emp.joining}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {STEPS.map((step, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    {i < 3 ? (
                      <CheckCircle size={16} style={{ color: 'var(--green)' }} />
                    ) : (
                      <Circle size={16} style={{ color: 'var(--muted)' }} />
                    )}
                    <span style={{ color: i < 3 ? 'var(--text)' : 'var(--muted)' }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <Modal
          title="Onboard New Employee"
          onClose={() => setShowAdd(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdd}>Onboard</button>
            </>
          }
        >
          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Full Name" />
            </div>
            <div className="form-group">
              <label>Role</label>
              <input value={form.role} onChange={e => setForm({...form, role: e.target.value})} placeholder="Developer" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Department</label>
              <input value={form.dept} onChange={e => setForm({...form, dept: e.target.value})} placeholder="Engineering" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="email@company.com" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Salary</label>
              <input type="number" value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} placeholder="45000" />
            </div>
            <div className="form-group">
              <label>Telegram Chat ID</label>
              <input value={form.telegramChatId} onChange={e => setForm({...form, telegramChatId: e.target.value})} placeholder="123456789" />
            </div>
          </div>
          <div className="form-group">
            <label>Joining Date</label>
            <input type="date" value={form.joining} onChange={e => setForm({...form, joining: e.target.value})} />
          </div>
        </Modal>
      )}
    </div>
  )
}
