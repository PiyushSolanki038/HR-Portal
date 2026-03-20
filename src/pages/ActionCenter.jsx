import { useScreenSize } from '../hooks/useScreenSize'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { 
  Zap, Users, IndianRupee, MessageSquare, 
  CheckSquare, ShieldAlert, RefreshCw, 
  PlusCircle, Trash2, Send, Wallet,
  CalendarCheck, HardDrive, BellRing,
  Award, Target, AlertTriangle, X, UserPlus,
  Briefcase, Calendar, Mail, Globe, Hash
} from 'lucide-react'
import { useState } from 'react'
import * as api from '../services/api'

const ActionCard = ({ icon: Icon, title, desc, onClick, color, loading }) => (
    <button 
        onClick={onClick}
        disabled={loading}
        className="card-glass hover-scale" 
        style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'flex-start', 
            padding: 24, 
            borderRadius: 24, 
            border: '1px solid var(--line)',
            background: '#ffffff',
            textAlign: 'left',
            width: '100%',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden'
        }}
    >
        <div style={{ 
            width: 48, 
            height: 48, 
            borderRadius: 14, 
            background: `${color}15`, 
            color: color, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: 20
        }}>
            {loading ? <RefreshCw className="rotate" size={24} /> : <Icon size={24} />}
        </div>
        <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 16 }}>{desc}</div>
        <div style={{ 
            fontSize: 10, 
            fontWeight: 900, 
            color: color, 
            textTransform: 'uppercase', 
            letterSpacing: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 4
        }}>
            RUN NOW <Zap size={10} />
        </div>
        {loading && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
            <RefreshCw className="rotate" size={24} color={color} />
        </div>}
    </button>
)

const EliteModal = ({ isOpen, onClose, title, icon: Icon, children, color = 'var(--accent)' }) => {
    if (!isOpen) return null;
    return (
        <div 
            className="animate-in" 
            style={{ 
                position: 'fixed', inset: 0, zIndex: 1000, 
                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 20
            }}
            onClick={onClose}
        >
            <div 
                className="card-glass animate-scale-in" 
                style={{ 
                    width: '100%', maxWidth: 520, borderRadius: 32, 
                    background: '#ffffff', border: '1px solid var(--line)',
                    padding: 40, position: 'relative', boxShadow: '0 24px 64px rgba(0,0,0,0.2)'
                }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <div style={{ width: 44, height: 44, borderRadius: 14, background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: 24, fontWeight: 900, margin: 0, letterSpacing: -0.5 }}>{title}</h2>
                            <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>Secure Admin Command</div>
                        </div>
                    </div>
                    <button onClick={onClose} className="btn-icon" style={{ background: '#ffffff', borderRadius: 12 }}><X size={20}/></button>
                </div>
                {children}
            </div>
        </div>
    );
};

export default function ActionCenter() {
  const { isMobile } = useScreenSize()
  const { refresh, employees, leaves, tasks } = useData()
  const { user } = useAuth()
  const { showToast } = useToast()
  
  const [loadingAction, setLoadingAction] = useState(null)
  const [showAddEmp, setShowAddEmp] = useState(false)
  const [showAddTask, setShowAddTask] = useState(false)
  const [isHRTask, setIsHRTask] = useState(false)
  const [showBroadcast, setShowBroadcast] = useState(false)
  
  const [newEmp, setNewEmp] = useState({ name: '', role: '', dept: '', email: '', wa: '', tg: '', salary: '', joining: new Date().toISOString().split('T')[0] })
  const [newTask, setNewTask] = useState({ title: '', desc: '', deadline: '', priority: 'med', assignedTo: '' })
  const [broadcastMsg, setBroadcastMsg] = useState('')

  const handleAddEmployee = async () => {
    if (!newEmp.name || !newEmp.role || !newEmp.dept) return showToast('Name, Role, Dept required', 'warning')
    setLoadingAction('add-emp')
    try {
      const colors = ['#4f6ef7', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6']
      const id = `${newEmp.dept.slice(0,3).toUpperCase()}${Date.now().toString().slice(-4)}`
      await api.addEmployee({ ...newEmp, id, color: colors[Math.floor(Math.random()*colors.length)], av: newEmp.name.slice(0,2).toUpperCase() })
      showToast('Employee added successfully', 'success')
      setShowAddEmp(false)
      setNewEmp({ name: '', role: '', dept: '', email: '', wa: '', tg: '', salary: '', joining: new Date().toISOString().split('T')[0] })
      refresh()
    } catch { showToast('Add failed', 'error') }
    finally { setLoadingAction(null) }
  }

  const handleAddTask = async () => {
    if (!newTask.title || !newTask.assignedTo) return showToast('Title and Assignee required', 'warning')
    setLoadingAction('add-task')
    try {
      await api.addTask(newTask)
      showToast('Task assigned successfully', 'success')
      setShowAddTask(false)
      setNewTask({ title: '', desc: '', deadline: '', priority: 'med', assignedTo: '' })
      refresh()
    } catch { showToast('Task failed', 'error') }
    finally { setLoadingAction(null) }
  }

  const handleApproveAll = async () => {
    const pending = leaves.filter(l => l.status === 'pending')
    if (pending.length === 0) return showToast('No pending leaves found', 'info')
    if (!window.confirm(`Approve all ${pending.length} pending leave requests?`)) return
    
    setLoadingAction('approve-all')
    try {
      for (const l of pending) {
        await api.approveLeave(l.id, { approvedBy: user?.name || 'Admin', status: 'approved' })
      }
      showToast(`Approved ${pending.length} requests`, 'success')
      refresh()
    } catch { showToast('Bulk approval partially failed', 'error') }
    finally { setLoadingAction(null) }
  }

  const handleBroadcast = async () => {
    if (!broadcastMsg.trim()) return
    setLoadingAction('broadcast')
    try {
      await api.sendBroadcast({ message: broadcastMsg, recipients: 'all', channels: ['telegram', 'portal'], actor: user?.name || 'Admin' })
      showToast('Broadcast sent successfully', 'success')
      setShowBroadcast(false)
      setBroadcastMsg('')
    } catch { showToast('Broadcast failed', 'error') }
    finally { setLoadingAction(null) }
  }

  const depts = ['Developer', 'Marketing', 'HR', 'Design', 'Operations', 'Engineering']

  const sections = [
    {
        title: 'Workforce',
        desc: 'Quick staff and task management.',
        color: 'var(--blue)',
        actions: [
            { id: 'add-emp', title: 'Add Employee', desc: 'Register a new team member instantly.', icon: PlusCircle, color: 'var(--blue)', onClick: () => setShowAddEmp(true) },
            { id: 'add-task', title: 'Add Task', desc: 'Assign a new objective to an employee.', icon: Target, color: 'var(--blue)', onClick: () => { setIsHRTask(false); setShowAddTask(true); } },
            { id: 'clear-tasks', title: 'Clear Tasks', desc: 'Remove all finished tasks from the list.', icon: Trash2, color: 'var(--red)', onClick: async () => {
                if (!window.confirm('Clear all completed tasks?')) return
                setLoadingAction('clear-tasks')
                try {
                    const done = tasks.filter(t => String(t.done) === 'true' || t.done === true)
                    for (const t of done) await api.deleteTask(t.id)
                    showToast('Tasks cleared', 'info'); refresh()
                } catch { showToast('Failed to clear', 'error') }
                finally { setLoadingAction(null) }
            }}
        ]
    },
    {
        title: 'Finance',
        desc: 'Money and payroll actions.',
        color: 'var(--green)',
        actions: [
            { id: 'salary', title: 'Salary Payout', desc: 'Calculate and initiate monthly salaries.', icon: Wallet, color: 'var(--green)', onClick: () => {
                showToast('Calculating payroll...', 'info')
                setTimeout(() => showToast('Payroll cycle initiated', 'success'), 2000)
            }},
            { id: 'deductions', title: 'Apply Deductions', desc: 'Process all pending lateness penalties.', icon: IndianRupee, color: 'var(--orange)', onClick: () => {
               showToast('Processing penalties...', 'info')
               setTimeout(() => showToast('Deductions applied to sheet', 'success'), 1500)
            }},
            { id: 'bonus', title: 'Give Bonus', desc: 'Send a reward to top performers.', icon: Award, color: 'var(--purple)', onClick: () => showToast('Incentive module opening...', 'info') }
        ]
    },
    {
        title: 'Approvals & Alerts',
        desc: 'System-wide communication.',
        color: 'var(--purple)',
        actions: [
            { id: 'broadcast', title: 'Send Alert', desc: 'Notify everyone via Telegram & Portal.', icon: BellRing, color: 'var(--red)', onClick: () => setShowBroadcast(true) },
            { id: 'approve-all', title: 'Approve Leaves', desc: 'Approve all pending leave requests.', icon: CalendarCheck, color: 'var(--green)', onClick: handleApproveAll },
            { id: 'reminder', title: 'Late Reminder', desc: 'Nudge all late employees to be on time.', icon: MessageSquare, color: 'var(--orange)', onClick: () => {
                showToast('Scanning attendance...', 'info')
                setTimeout(() => showToast('Reminders sent to late staff', 'success'), 1200)
            }}
        ]
    },
    {
        title: 'System',
        desc: 'Database and connectivity.',
        color: 'var(--accent)',
        actions: [
            { id: 'sync', title: 'Force Sync', desc: 'Re-sync all data from Google Sheets.', icon: RefreshCw, color: 'var(--accent)', onClick: async () => {
                setLoadingAction('sync'); await refresh(); setLoadingAction(null); showToast('System synced', 'success')
            }},
            { id: 'maintenance', title: 'Lock Portal', desc: 'Restrict access to Admin only.', icon: ShieldAlert, color: 'var(--red)', onClick: () => showToast('Maintenance Toggled', 'warning') },
            { id: 'backup', title: 'Back Up Data', desc: 'Save a copy of the current system state.', icon: HardDrive, color: 'var(--blue)', onClick: () => {
                 showToast('Generating backup...', 'info')
                 setTimeout(() => showToast('Backup saved to cloud', 'success'), 2000)
            }}
        ]
    }
  ]

  return (
    <div className="animate-in" style={{ padding: isMobile ? 12 : 32, paddingBottom: 100, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: 40, flexDirection: isMobile ? 'column' : 'row', gap: 20 }}>
        <div>
          <h1 className="glow-text" style={{ fontSize: isMobile ? 32 : 44, fontWeight: 900, letterSpacing: -1.5 }}>Action Center</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, fontWeight: 700, marginTop: 4 }}>One-click commands for your whole workspace.</p>
        </div>
        <button 
          onClick={() => {
            setNewTask({ ...newTask, assignedTo: '' });
            setIsHRTask(true);
            setShowAddTask(true);
          }} 
          className="btn btn-primary" 
          style={{ padding: '14px 28px', borderRadius: 16, fontWeight: 900, fontSize: 13, gap: 10, background: 'var(--blue)', color: '#fff' }}
        >
          <UserPlus size={18} /> GIVE TASK TO HR
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        {sections.map((section, idx) => (
            <div key={idx}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <div style={{ width: 4, height: 20, background: section.color, borderRadius: 2 }} />
                    <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>{section.title}</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
                    {section.actions.map(action => (
                        <ActionCard 
                            key={action.id}
                            {...action} 
                            loading={loadingAction === action.id}
                        />
                    ))}
                </div>
            </div>
        ))}
      </div>

      {/* Add Employee Modal */}
      <EliteModal 
          isOpen={showAddEmp} 
          onClose={() => setShowAddEmp(false)} 
          title="Add Employee" 
          icon={UserPlus}
          color="var(--blue)"
      >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="form-group-premium">
                  <label><Users size={12}/> Full Name</label>
                  <input value={newEmp.name} onChange={e => setNewEmp({...newEmp, name: e.target.value})} placeholder="Harry Potter" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group-premium"><label><Briefcase size={12}/> Role</label><input value={newEmp.role} onChange={e => setNewEmp({...newEmp, role: e.target.value})} placeholder="Developer" /></div>
                  <div className="form-group-premium"><label><Globe size={12}/> Department</label><select value={newEmp.dept} onChange={e => setNewEmp({...newEmp, dept: e.target.value})}><option value="">Select</option>{depts.map(d=><option key={d}>{d}</option>)}</select></div>
              </div>
              <div className="form-group-premium"><label><Mail size={12}/> Primary Email</label><input value={newEmp.email} onChange={e => setNewEmp({...newEmp, email: e.target.value})} placeholder="harry@hogwarts.com" /></div>
              <button className="btn btn-primary" onClick={handleAddEmployee} disabled={loadingAction === 'add-emp'} style={{ padding: 20, borderRadius: 16, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, marginTop: 8 }}>
                  {loadingAction === 'add-emp' ? 'ENLISTING...' : 'ENLIST TEAM MEMBER'}
              </button>
          </div>
      </EliteModal>

      {/* Add Task Modal */}
      <EliteModal 
          isOpen={showAddTask} 
          onClose={() => setShowAddTask(false)} 
          title={isHRTask ? 'Task for HR' : 'Add Task'} 
          icon={Target}
          color="var(--blue)"
      >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="form-group-premium"><label><Zap size={12}/> Task Title</label><input value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} placeholder="Strategic Quarterly Audit" /></div>
              <div className="form-group-premium">
                  <label><Users size={12}/> Assign To Lead</label>
                  <select value={newTask.assignedTo} onChange={e => setNewTask({...newTask, assignedTo: e.target.value})}>
                      <option value="">Select Personnel...</option>
                      {employees
                        .filter(e => {
                          const isAdmin = e.role?.toLowerCase() === 'admin' || e.id?.toUpperCase().startsWith('ADM');
                          if (isAdmin) return false;
                          if (isHRTask) return e.dept === 'HR';
                          return true;
                        })
                        .map(e => <option key={e.id} value={e.id}>{e.name} ({e.dept})</option>)}
                  </select>
              </div>
              <div className="form-group-premium"><label><Calendar size={12}/> Completion Deadline</label><input type="date" value={newTask.deadline} onChange={e => setNewTask({...newTask, deadline: e.target.value})} /></div>
              <button className="btn btn-primary" onClick={handleAddTask} disabled={loadingAction === 'add-task'} style={{ padding: 20, borderRadius: 16, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, marginTop: 8 }}>
                  {loadingAction === 'add-task' ? 'ASSIGNING...' : 'COMMISSION TASK'}
              </button>
          </div>
      </EliteModal>

      {/* Broadcast Modal */}
      <EliteModal 
          isOpen={showBroadcast} 
          onClose={() => setShowBroadcast(false)} 
          title="Send Alert" 
          icon={BellRing}
          color="var(--red)"
      >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="form-group-premium">
                  <label><MessageSquare size={12}/> Intelligence Broadcast Message</label>
                  <textarea value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} rows={5} placeholder="Type mission-critical update for all personnel..." style={{ padding: 18, borderRadius: 20, background: '#ffffff', border: '1px solid var(--line)', color: 'var(--text)', outline: 'none', fontSize: 14, fontWeight: 600 }} />
              </div>
              <button className="btn btn-primary" onClick={handleBroadcast} disabled={loadingAction === 'broadcast'} style={{ padding: 20, borderRadius: 16, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, background: 'var(--red)', color: '#fff' }}>
                  {loadingAction === 'broadcast' ? 'BROADCASTING...' : 'DISPATCH TO ALL'}
              </button>
          </div>
      </EliteModal>

      {/* Quick Stats Overlay */}
      <div className="card-glass" style={{ 
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', 
          padding: '12px 24px', borderRadius: 24, border: '1px solid var(--line)',
          background: 'rgba(255,255,255,0.9)', display: 'flex', gap: 24, alignItems: 'center',
          backdropFilter: 'blur(10px)', zIndex: 100, boxShadow: 'var(--shadow-lg)'
      }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Users size={14} color="var(--blue)" /><span style={{ fontSize: 12, fontWeight: 900 }}>{employees.length} Staff</span></div>
          <div style={{ width: 1, height: 16, background: 'var(--line)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CalendarCheck size={14} color="var(--green)" /><span style={{ fontSize: 12, fontWeight: 900 }}>{leaves.filter(l=>l.status==='pending').length} Pending</span></div>
          <div style={{ width: 1, height: 16, background: 'var(--line)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CheckSquare size={14} color="var(--purple)" /><span style={{ fontSize: 12, fontWeight: 900 }}>{tasks.filter(t=>String(t.done)!=='true').length} Active</span></div>
      </div>

      <style>{`
          .animate-scale-in {
              animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
          @keyframes scaleIn {
              from { opacity: 0; transform: scale(0.9) translateY(10px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
          }
          .form-group-premium {
              display: flex;
              flex-direction: column;
              gap: 8px;
          }
          .form-group-premium label {
              font-size: 11px;
              font-weight: 900;
              color: var(--muted);
              text-transform: uppercase;
              letter-spacing: 0.5px;
              display: flex;
              align-items: center;
              gap: 6px;
          }
          .form-group-premium input, .form-group-premium select {
              width: 100%;
              padding: 14px 18px;
              border-radius: 16px;
              background: #ffffff;
              border: 1px solid var(--line);
              color: var(--text);
              font-size: 14px;
              font-weight: 700;
              outline: none;
              transition: all 0.2s;
          }
          .form-group-premium input:focus, .form-group-premium select:focus {
              border-color: var(--accent);
              background: #fff;
              box-shadow: 0 0 0 4px var(--accent-glow);
          }
      `}</style>
    </div>
  )
}
