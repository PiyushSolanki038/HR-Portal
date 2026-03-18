import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import PerformanceRing from '../components/ui/PerformanceRing'
import { Search, Users, Filter, UserPlus, Mail, Phone, Briefcase, Calendar, DollarSign, Send, X, Plus, Radio, Trash2, MessageSquare, KeyRound } from 'lucide-react'
import * as api from '../services/api'
import { useToast } from '../context/ToastContext'

export default function Employees() {
  const { employees, leaves, attendanceSummary, loading, error, refresh } = useData()
  const { user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState('list')
  const [deptFilter, setDeptFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showMsgModal, setShowMsgModal] = useState(false)
  const [newEmp, setNewEmp] = useState({
    name: '', role: '', dept: '', email: '', wa: '', tg: '',
    joining: new Date().toISOString().split('T')[0], salary: '', telegramChatId: ''
  })
  const [msgTarget, setMsgTarget] = useState(null)
  const [msgText, setMsgText] = useState('')
  const [msgChannel, setMsgChannel] = useState('portal')
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetTarget, setResetTarget] = useState(null)
  const [tempPassword, setTempPassword] = useState('')
  const [resettingPass, setResettingPass] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [sendingBulk, setSendingBulk] = useState(false)

  const depts = ['Developer', 'Marketing', 'HR', 'Design', 'Operations', 'Sales', 'Admin', 'Engineering']

  const filtered = employees.filter(e => {
    const matchSearch = (e.name || '').toLowerCase().includes(search.toLowerCase()) ||
                        (e.role || '').toLowerCase().includes(search.toLowerCase()) ||
                        (e.id || '').toLowerCase().includes(search.toLowerCase())
    const matchDept = deptFilter === 'all' || e.dept === deptFilter
    return matchSearch && matchDept
  })

  const handleAddEmployee = async () => {
    if (!newEmp.name || !newEmp.role || !newEmp.dept) {
      showToast('Name, Role, and Department are required', 'error')
      return
    }

    try {
      const colors = ['#4f6ef7', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#f97316']
      const randomColor = colors[Math.floor(Math.random() * colors.length)]
      
      const prefix = newEmp.dept.substring(0, 3).toUpperCase()
      const id = `${prefix}${Date.now().toString().slice(-4)}`

      await api.addEmployee({
        ...newEmp,
        id,
        color: randomColor,
        av: newEmp.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
      })

      showToast('Employee added successfully', 'success')
      setShowAddModal(false)
      setNewEmp({
        name: '', role: '', dept: '', email: '', wa: '', tg: '',
        joining: new Date().toISOString().split('T')[0], salary: ''
      })
      refresh()
    } catch (err) {
      showToast('Failed to add employee', 'error')
    }
  }

  const handleDeleteEmployee = async (id) => {
    if (!confirm('Are you sure you want to remove this employee?')) return
    try {
      await api.deleteEmployee(id)
      showToast('Employee removed successfully', 'success')
      refresh()
    } catch {
      showToast('Failed to remove employee', 'error')
    }
  }

  const handleSendMessage = async () => {
    if (!msgText.trim()) return
    try {
      if (msgTarget === 'broadcast') {
        await api.sendBroadcast({ 
          message: msgText, 
          recipients: 'all', 
          channels: [msgChannel],
          actor: user?.name || 'HR Manager'
        })
        showToast('Broadcast sent successfully', 'success')
      } else {
        if (msgChannel === 'portal') {
          await api.sendPortalMessage({
            fromId: user?.id || 'HR',
            toId: msgTarget.id,
            message: msgText,
            channel: 'portal'
          })
        } else {
          await api.sendDirectMessage({
            empId: msgTarget.id,
            message: msgText,
            channel: msgChannel,
            actor: user?.name || 'HR Manager'
          })
        }
        showToast(`Message sent to ${msgTarget.name} via ${msgChannel}`, 'success')
      }
      setShowMsgModal(false)
      setMsgText('')
    } catch {
      showToast('Failed to deliver message', 'error')
    }
  }

  const handleSendSingleCredentials = async (empId, empName) => {
    try {
      await api.sendCredentialsSingle({ empId })
      showToast(`Credentials sent to ${empName}`, 'success')
    } catch (err) {
      showToast('Failed to send credentials', 'error')
    }
  }
    setSendingBulk(true)
    try {
      const data = await api.sendCredentialsToAll()
      showToast(`Credentials sent to ${data.sent} employees. (${data.failed} skipped/failed)`, 'success')
      setShowBulkModal(false)
    } catch {
      showToast('Failed to send credentials', 'error')
    } finally {
      setSendingBulk(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <div className="empty-state">Error: {error}</div>

  return (
    <div className="animate-in" style={{ paddingBottom: 60 }}>
      <div className="page-header">
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 32 }}>Staff Directory</h1>
          <p className="subtitle">{employees.length} enterprise team members linked</p>
        </div>
        <div className="page-header-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', width: '100%', justifyContent: 'flex-start' }}>
          <div style={{ background: 'var(--bg-elevated)', padding: 4, borderRadius: 12, display: 'flex', border: '1px solid var(--line)' }}>
            <button 
              onClick={() => setViewMode('list')}
              style={{ padding: '8px 12px', borderRadius: 8, background: viewMode === 'list' ? 'var(--bg-card)' : 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', boxShadow: viewMode === 'list' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
            >
               <Users size={16} color={viewMode === 'list' ? 'var(--accent)' : 'var(--muted)'} />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              style={{ padding: '8px 12px', borderRadius: 8, background: viewMode === 'grid' ? 'var(--bg-card)' : 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', boxShadow: viewMode === 'grid' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
            >
               <Plus size={16} color={viewMode === 'grid' ? 'var(--accent)' : 'var(--muted)'} style={{ transform: 'rotate(45deg)' }} />
            </button>
          </div>
          <button 
            className="btn btn-secondary" 
            style={{ flex: '1 1 auto', display: 'flex', alignItems: 'center', gap: 8 }}
            onClick={() => setShowBulkModal(true)}
          >
            <MessageSquare size={16} /> 📨 Send Login Credentials
          </button>
          <button className="btn btn-secondary" style={{ flex: '1 1 auto' }} onClick={() => { setMsgTarget('broadcast'); setShowMsgModal(true); }}>
            <Radio size={16} /> Broadcast
          </button>
          <button className="btn btn-primary" style={{ flex: '1 1 auto' }} onClick={() => setShowAddModal(true)}>
            <UserPlus size={18} /> Add Employee
          </button>
        </div>
      </div>

      <div className="filter-bar" style={{ background: 'var(--bg-card)', padding: '16px 24px', borderRadius: 20, border: '1px solid var(--line)', marginBottom: 32 }}>
        <div className="search-bar" style={{ flex: 1 }}>
          <Search size={16} className="search-icon" />
          <input placeholder="Search by name, role, ID or handle…" value={search} onChange={e => setSearch(e.target.value)} style={{ border: 'none', background: 'transparent' }} />
        </div>
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} style={{ width: 'auto', border: 'none', fontWeight: 700, color: 'var(--text-dim)' }}>
          <option value="all">All Departments</option>
          {depts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {viewMode === 'list' ? (
        <div className="table-container" style={{ borderRadius: 24 }}>
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th className="hidden-mobile">ID</th>
                <th>Role</th>
                <th className="hidden-mobile">Department</th>
                <th className="hidden-mobile">Score</th>
                <th>Stats (P/L)</th>
                <th className="hidden-mobile">Leaves</th>
                <th className="hidden-mobile">Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(emp => {
                const empLeaves = (leaves || []).filter(l => {
                  const isApproved = l.status?.toLowerCase() === 'approved' || l.status?.includes('day') || l.approvedBy;
                  return l.empId?.toLowerCase() === emp.id?.toLowerCase() && isApproved;
                }).length
                const stats = attendanceSummary[emp.id] || { present: 0, late: 0, score: 0 }
                return (
                  <tr key={emp.id} style={{ cursor: 'pointer' }}>
                    <td onClick={() => navigate(`/employees/${emp.id}`)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className="avatar avatar-sm" style={{ background: emp.color || 'var(--accent)', borderRadius: 10 }}>
                          {emp.av || emp.name?.substring(0,2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{emp.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{emp.email || '@' + (emp.tg || 'handle')}</div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden-mobile" style={{ color: 'var(--muted)', fontFamily: 'monospace', fontSize: 11 }}>{emp.id}</td>
                    <td style={{ fontWeight: 600 }}>{emp.role}</td>
                    <td className="hidden-mobile" style={{ color: 'var(--text-dim)' }}>{emp.dept}</td>
                    <td className="hidden-mobile">
                      <PerformanceRing score={parseInt(stats.score) || 0} size={32} strokeWidth={3} />
                    </td>
                    <td>
                      <span style={{ color: 'var(--green)', fontWeight: 700 }}>{stats.present || 0}</span>
                      <span style={{ color: 'var(--line)', margin: '0 4px' }}>/</span>
                      <span style={{ color: 'var(--amber)', fontWeight: 700 }}>{stats.late || 0}</span>
                    </td>
                    <td className="hidden-mobile" style={{ color: 'var(--blue)', fontWeight: 700 }}>{empLeaves}</td>
                    <td className="hidden-mobile">
                      <span className={`badge ${emp.status === 'active' ? 'badge-green' : 'badge-red'}`} style={{ borderRadius: 8 }}>
                        {emp.status || 'active'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
                        <button 
                          onClick={() => { setMsgTarget(emp); setShowMsgModal(true); }}
                          style={{ border: 'none', background: 'var(--bg-elevated)', color: 'var(--accent)', padding: 7, borderRadius: 8, cursor: 'pointer', display: 'flex' }}
                        >
                          <MessageSquare size={14} />
                        </button>
                        <button 
                          onClick={() => handleSendSingleCredentials(emp.id, emp.name)}
                          style={{ border: 'none', background: 'var(--bg-elevated)', color: 'var(--blue)', padding: 7, borderRadius: 8, cursor: 'pointer', display: 'flex' }}
                          title="Send Credentials"
                        >
                          <Mail size={14} />
                        </button>
                        <button 
                          onClick={() => { setResetTarget(emp); setShowResetModal(true); }}
                          style={{ border: 'none', background: 'var(--bg-elevated)', color: 'var(--amber)', padding: 7, borderRadius: 8, cursor: 'pointer', display: 'flex' }}
                          title="Reset Password"
                        >
                          <KeyRound size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteEmployee(emp.id)}
                          style={{ border: 'none', background: 'var(--bg-elevated)', color: 'var(--red)', padding: 7, borderRadius: 8, cursor: 'pointer', display: 'flex' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={9}>
                  <div className="empty-state">
                    <Users size={40} />
                    <h3>No employees found</h3>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {filtered.map(emp => {
              const stats = attendanceSummary[emp.id] || { present: 0, late: 0, score: 0 }
              return (
                <div key={emp.id} className="card hover-scale" style={{ padding: 24, borderRadius: 24, background: 'var(--bg-card)', border: '1px solid var(--line)', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <div className="avatar avatar-lg" style={{ background: emp.color || 'var(--accent)', borderRadius: 16 }}>
                        {emp.av || emp.name?.substring(0,2).toUpperCase()}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <PerformanceRing score={parseInt(stats.score) || 0} size={44} strokeWidth={4} />
                        <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--muted)', marginTop: 4, textTransform: 'uppercase' }}>Reliability</div>
                    </div>
                  </div>
                  
                  <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 4px 0' }}>{emp.name}</h3>
                  <p style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700, margin: 0 }}>{emp.role}</p>
                  <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{emp.dept} • {emp.id}</p>

                  <div style={{ marginTop: 20, padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 16, display: 'flex', justifyContent: 'space-around' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--green)' }}>{stats.present || 0}</div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Present</div>
                      </div>
                      <div style={{ width: 1, height: 20, background: 'var(--line)', alignSelf: 'center' }} />
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--amber)' }}>{stats.late || 0}</div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Late</div>
                      </div>
                  </div>

                  <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
                    <button 
                      onClick={() => navigate(`/employees/${emp.id}`)}
                      className="btn btn-secondary btn-sm" style={{ flex: 1, borderRadius: 10, fontWeight: 800 }}
                    >
                      PROFILE
                    </button>
                    <button 
                      onClick={() => handleSendSingleCredentials(emp.id, emp.name)}
                      className="btn btn-ghost btn-sm" style={{ borderRadius: 10, padding: 8, color: 'var(--blue)' }}
                      title="Send Credentials"
                    >
                      <Mail size={16} />
                    </button>
                    <button 
                      onClick={() => { setResetTarget(emp); setShowResetModal(true); }}
                      className="btn btn-ghost btn-sm" style={{ borderRadius: 10, padding: 8, color: 'var(--amber)' }}
                      title="Reset Password"
                    >
                      <KeyRound size={16} />
                    </button>
                    <button 
                      onClick={() => { setMsgTarget(emp); setShowMsgModal(true); }}
                      className="btn btn-primary btn-sm" style={{ flex: 1, borderRadius: 10, fontWeight: 800 }}
                    >
                      MESSAGE
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          {filtered.length === 0 && (
            <div className="empty-state" style={{ marginTop: 60 }}>
              <Users size={40} />
              <h3>No employees found</h3>
            </div>
          )}
        </>
      )}
      {/* Add Employee Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }} onClick={() => setShowAddModal(false)}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '520px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: 'var(--shadow-xl)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', margin: 0, fontSize: '24px', fontWeight: 800 }}>Enlist Team Member</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', marginBottom: '6px', display: 'block', textTransform: 'uppercase' }}>Full Name</label>
                <input style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }} 
                  value={newEmp.name} onChange={e => setNewEmp({...newEmp, name: e.target.value})} placeholder="E.g. John Doe" />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', marginBottom: '6px', display: 'block', textTransform: 'uppercase' }}>Role</label>
                <input style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }} 
                  value={newEmp.role} onChange={e => setNewEmp({...newEmp, role: e.target.value})} placeholder="E.g. Senior Developer" />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', marginBottom: '6px', display: 'block', textTransform: 'uppercase' }}>Department</label>
                <select style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }} 
                  value={newEmp.dept} onChange={e => setNewEmp({...newEmp, dept: e.target.value})}>
                  <option value="">Select Dept</option>
                  {depts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', marginBottom: '6px', display: 'block', textTransform: 'uppercase' }}>Email</label>
                <input style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }} 
                  value={newEmp.email} onChange={e => setNewEmp({...newEmp, email: e.target.value})} placeholder="john@company.com" />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', marginBottom: '6px', display: 'block', textTransform: 'uppercase' }}>WhatsApp</label>
                <input style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }} 
                  value={newEmp.wa} onChange={e => setNewEmp({...newEmp, wa: e.target.value})} placeholder="+91..." />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', marginBottom: '6px', display: 'block', textTransform: 'uppercase' }}>Telegram Handle</label>
                <input style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }} 
                  value={newEmp.tg} onChange={e => setNewEmp({...newEmp, tg: e.target.value})} placeholder="@username" />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', marginBottom: '6px', display: 'block', textTransform: 'uppercase' }}>Telegram Chat ID</label>
                <input style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }} 
                  value={newEmp.telegramChatId} onChange={e => setNewEmp({...newEmp, telegramChatId: e.target.value})} placeholder="e.g. 123456789" />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', marginBottom: '6px', display: 'block', textTransform: 'uppercase' }}>Joining Date</label>
                <input type="date" style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }} 
                  value={newEmp.joining} onChange={e => setNewEmp({...newEmp, joining: e.target.value})} />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', marginBottom: '6px', display: 'block', textTransform: 'uppercase' }}>Salary (CTC Yearly)</label>
                <input type="number" style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }} 
                  value={newEmp.salary} onChange={e => setNewEmp({...newEmp, salary: e.target.value})} placeholder="E.g. 1200000" />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
              <button className="btn btn-ghost" style={{ padding: '12px 24px' }} onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ padding: '12px 28px' }} onClick={handleAddEmployee}>Enlist Member</button>
            </div>
          </div>
        </div>
      )}
      {/* Quick Message Modal */}
      {showMsgModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }} onClick={() => setShowMsgModal(false)}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: 'var(--shadow-xl)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', margin: 0, fontSize: '24px', fontWeight: 800 }}>
                {msgTarget === 'broadcast' ? 'Broadcast Message' : `Message to ${msgTarget?.name}`}
              </h2>
              <button onClick={() => setShowMsgModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              {['telegram', 'wa', 'portal'].map(ch => (
                <button 
                  key={ch} 
                  onClick={() => setMsgChannel(ch)}
                  style={{ 
                    flex: 1, padding: 10, borderRadius: 12, border: msgChannel === ch ? '2px solid var(--accent)' : '1px solid var(--border)',
                    background: msgChannel === ch ? 'var(--accent-glow)' : 'var(--bg-elevated)',
                    color: msgChannel === ch ? 'var(--text)' : 'var(--muted)',
                    fontSize: 12, fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize'
                  }}
                >
                  {ch}
                </button>
              ))}
            </div>

            <textarea 
              rows={5} 
              style={{ width: '100%', padding: '14px', borderRadius: '16px', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none', resize: 'none' }}
              placeholder="Type your message here..."
              value={msgText}
              onChange={e => setMsgText(e.target.value)}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
              <button className="btn btn-ghost" onClick={() => setShowMsgModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSendMessage} style={{ gap: 8 }}>
                <Send size={16} /> Send Message
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Reset Password Modal */}
      {showResetModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }} onClick={() => setShowResetModal(false)}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: 'var(--shadow-xl)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ padding: 8, background: 'var(--bg-elevated)', borderRadius: 10, color: 'var(--amber)' }}>
                  <KeyRound size={20} />
                </div>
                <h2 style={{ fontFamily: 'Syne, sans-serif', margin: 0, fontSize: '20px', fontWeight: 800 }}>Reset Password</h2>
              </div>
              <button onClick={() => setShowResetModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <p style={{ fontSize: 13, color: 'var(--text-dim)', margin: 0 }}>
              Setting a temporary password for <b>{resetTarget?.name}</b>. They will be forced to change it upon next login.
            </p>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', marginBottom: '6px', display: 'block', textTransform: 'uppercase' }}>Temporary Password</label>
              <input 
                autoFocus
                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }} 
                value={tempPassword} onChange={e => setTempPassword(e.target.value)} placeholder="e.g. WelcomeSISWIT123" 
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
              <button className="btn btn-ghost" onClick={() => setShowResetModal(false)}>Cancel</button>
              <button 
                className="btn btn-primary" 
                onClick={handleResetPassword} 
                disabled={resettingPass || !tempPassword.trim()}
                style={{ background: 'var(--amber)', color: '#000' }}
              >
                {resettingPass ? 'SETTING...' : 'SET PASSWORD'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Bulk Send Credentials Confirmation */}
      {showBulkModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }} onClick={() => setShowBulkModal(false)}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: 'var(--shadow-xl)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ padding: 8, background: 'var(--bg-elevated)', borderRadius: 10, color: 'var(--accent)' }}>
                  <MessageSquare size={20} />
                </div>
                <h2 style={{ fontFamily: 'Syne, sans-serif', margin: 0, fontSize: '20px', fontWeight: 800 }}>Bulk Send Credentials</h2>
              </div>
              <button onClick={() => setShowBulkModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <p style={{ fontSize: 13, color: 'var(--text-dim)', margin: 0, lineHeight: 1.6 }}>
              Send login credentials to all <b>{employees.length}</b> employees via Telegram? This will notify everyone with their Employee ID and Temporary Password.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
              <button className="btn btn-ghost" onClick={() => setShowBulkModal(false)}>Cancel</button>
              <button 
                className="btn btn-primary" 
                onClick={handleSendAllCredentials} 
                disabled={sendingBulk}
              >
                {sendingBulk ? 'SENDING...' : 'CONFIRM & SEND'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
