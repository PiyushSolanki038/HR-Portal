import { useState, useMemo } from 'react'
import { useScreenSize } from '../hooks/useScreenSize'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import StatCard from '../components/ui/StatCard'
import * as api from '../services/api'
import {
  CheckSquare,
  Search,
  Filter,
  Plus,
  Bell,
  Trash2,
  Edit,
  ChevronRight,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Briefcase,
  LayoutGrid,
  Layers,
  ListTodo,
  TrendingUp,
  ArrowRight,
  MoreVertical,
  Flag,
  Zap,
  Target
} from 'lucide-react'
import { Link } from 'react-router-dom'

const isTaskDone = (t) => t && (t.done === true || String(t.done).toLowerCase() === 'true')

export default function TaskManager() {
  const { isMobile, isTablet, isDesktop } = useScreenSize()
  const { tasks, employees, loading, error, refresh } = useData()
  const { user } = useAuth()
  const { showToast } = useToast()

  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [updating, setUpdating] = useState(null)
  const [showDrawer, setShowDrawer] = useState(false)
  const [taskEditingId, setTaskEditingId] = useState(null)
  const [newTask, setNewTask] = useState({ title: '', desc: '', deadline: '', priority: 'med', tag: 'General', assignedTo: '' })

  const depts = ['Developer', 'Marketing', 'HR', 'Design', 'Operations', 'Sales', 'Admin', 'Engineering']

  // Analytical Pulse
  const stats = useMemo(() => {
    const total = tasks.length
    const pending = tasks.filter(t => !isTaskDone(t)).length
    
    const today = new Date(); today.setHours(0,0,0,0)
    const overdue = tasks.filter(t => {
      if (isTaskDone(t) || !t.deadline) return false
      const [y, m, d] = t.deadline.split('-').map(Number)
      return new Date(y, m - 1, d) < today
    }).length

    const completed = total - pending

    return { total, pending, overdue, completed }
  }, [tasks])

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const emp = employees.find(e => e.id === t.assignedTo) || {}
      const matchSearch = (t.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (emp.name || '').toLowerCase().includes(search.toLowerCase())
      const matchDept = deptFilter === 'all' || emp.dept === deptFilter
      const matchStatus = statusFilter === 'all' ||
        (statusFilter === 'done' && isTaskDone(t)) ||
        (statusFilter === 'pending' && !isTaskDone(t))

      return matchSearch && matchDept && matchStatus
    })
    .sort((a, b) => {
        if (isTaskDone(a) && !isTaskDone(b)) return 1
        if (!isTaskDone(a) && isTaskDone(b)) return -1
        const pMap = { high: 0, med: 1, low: 2 }
        return (pMap[a.priority] || 1) - (pMap[b.priority] || 1)
    })
  }, [tasks, employees, search, deptFilter, statusFilter])

  const handleToggleTask = async (taskId) => {
    setUpdating(taskId)
    try {
      await api.toggleTask(taskId)
      showToast('Objective status synchronized', 'success')
      refresh()
    } catch (err) {
      showToast('Failed to synchronize status', 'error')
    } finally {
      setUpdating(null)
    }
  }

  const handleRemind = async (taskId) => {
    try {
      await api.remindTask(taskId)
      showToast('Telegram dispatch successful', 'success')
    } catch (err) {
      showToast('Failed to dispatch reminder', 'error')
    }
  }

  const deleteWithConfirm = (id) => {
    if (window.confirm('Definitively delete this organizational objective?')) {
        handleDeleteTask(id)
    }
  }

  const handleDeleteTask = async (taskId) => {
    setUpdating(taskId)
    try {
      await api.deleteTask(taskId)
      showToast('Objective purged successfully', 'info')
      refresh()
    } catch (err) {
      showToast('Failed to purge objective', 'error')
    } finally {
      setUpdating(null)
    }
  }

  const openEditDrawer = (task) => {
    setNewTask({
      title: task.title,
      desc: task.desc || task.description || '',
      deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
      priority: task.priority || 'med',
      tag: task.tag || 'General',
      assignedTo: task.assignedTo
    })
    setTaskEditingId(task.id)
    setShowDrawer(true)
  }

  const openCreateDrawer = () => {
    setNewTask({ title: '', desc: '', deadline: '', priority: 'med', tag: 'General', assignedTo: '' })
    setTaskEditingId(null)
    setShowDrawer(true)
  }

  const handleSaveTask = async () => {
    if (!newTask.title.trim()) return showToast('Objective title required', 'warning')
    if (!newTask.assignedTo) return showToast('Lead assignment required', 'warning')
    
    setUpdating('save')
    try {
      if (taskEditingId) {
        await api.updateTask(taskEditingId, newTask)
        showToast('Objective refined successfully', 'success')
      } else {
        await api.addTask(newTask)
        showToast('New objective commissioned', 'success')
      }
      setShowDrawer(false)
      refresh()
    } catch (err) {
      showToast('Failed to commit objective', 'error')
    } finally {
      setUpdating(null)
    }
  }

  const handleRemindAll = async () => {
    if (!window.confirm('Commence mass Telegram reminder sequence for all pending objectives?')) return
    try {
      showToast('Commencing broadcast...', 'info')
      const res = await api.remindAllTasks()
      showToast(`Broadcast completed: ${res.employeesReminded} leads notified`, 'success')
    } catch (err) {
      showToast('Broadcast sequence failed', 'error')
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <div className="p-6">Error: {error}</div>

  return (
    <div className="animate-in" style={{ padding: isMobile ? '16px 12px' : '32px', maxWidth: 1600, margin: '0 auto' }}>
      {/* Executive Header */}
      <div style={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row', 
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'flex-start' : 'flex-end',
        marginBottom: 48,
        gap: 24
      }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 32 : 48, fontWeight: 900, letterSpacing: -2, margin: 0 }}>Task Hub</h1>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--muted)', marginTop: 4, letterSpacing: 0.5 }}>Strategic orchestration of organizational objectives</p>
        </div>

        <div style={{ display: 'flex', gap: 16, width: isMobile ? '100%' : 'auto' }}>
          <button 
            onClick={handleRemindAll}
            className="btn-glass"
            style={{ 
              display: 'flex', alignItems: 'center', gap: 10, padding: isMobile ? '12px' : '12px 24px', 
              borderRadius: 16, fontWeight: 800, fontSize: 13, flex: 1, justifyContent: 'center'
            }}
          >
            <Bell size={18} /> {isMobile ? 'Remind' : 'Remind All Pending'}
          </button>
          <button 
            onClick={openCreateDrawer}
            className="btn"
            style={{ 
              display: 'flex', alignItems: 'center', gap: 10, padding: isMobile ? '12px' : '12px 24px', 
              borderRadius: 16, background: 'var(--accent)', color: '#fff', 
              fontWeight: 900, fontSize: 13, flex: 1, justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(var(--accent-rgb), 0.2)'
            }}
          >
            <Plus size={20} /> New Objective
          </button>
        </div>
      </div>

      {/* Executive Task Pulse */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', 
        gap: 20, 
        marginBottom: 48 
      }}>
        <StatCard title="At Stake" value={stats.total} icon={Target} color="var(--accent)" trend={[30, 35, 32, 38, 42, 40, stats.total]} />
        <StatCard title="Active Ops" value={stats.pending} icon={Zap} color="var(--amber)" trend={[12, 15, 14, 18, 16, 15, stats.pending]} />
        <StatCard title="Critical Needs" value={stats.overdue} icon={AlertTriangle} color="var(--red)" trend={[2, 4, 1, 3, 5, 2, stats.overdue]} />
        <StatCard title="Confirmed Done" value={stats.completed} icon={CheckCircle2} color="var(--green)" trend={[18, 20, 18, 20, 26, 25, stats.completed]} />
      </div>

      {/* Orchestration Controls */}
      <div className="super-glass" style={{ 
        padding: 16, borderRadius: 24, marginBottom: 32, 
        display: 'flex', gap: 16, alignItems: 'center',
        flexWrap: 'wrap', border: '1px solid rgba(0,0,0,0.05)'
      }}>
        <div style={{ flex: 1, minWidth: 280, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
          <input 
            type="text" 
            placeholder="Search objectives, leads or tags…" 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ 
              width: '100%', padding: '14px 14px 14px 48px', borderRadius: 16, 
              background: 'rgba(0,0,0,0.03)', border: 'none', 
              fontSize: 14, fontWeight: 700, outline: 'none' 
            }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <Filter size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
            <select 
              value={deptFilter} 
              onChange={e => setDeptFilter(e.target.value)}
              style={{ padding: '12px 12px 12px 36px', borderRadius: 14, background: 'rgba(0,0,0,0.03)', border: 'none', fontWeight: 800, fontSize: 13, outline: 'none', appearance: 'none', cursor: 'pointer' }}
            >
              <option value="all">Everywhere</option>
              {depts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            style={{ padding: '12px 20px', borderRadius: 14, background: 'rgba(0,0,0,0.03)', border: 'none', fontWeight: 800, fontSize: 13, outline: 'none', appearance: 'none', cursor: 'pointer' }}
          >
            <option value="all">All States</option>
            <option value="pending">Active</option>
            <option value="done">Resolved</option>
          </select>
        </div>
      </div>

      {/* Orchestration Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : isTablet ? 'repeat(2, 1fr)' : '1fr', 
        gap: 24 
      }}>
        {filteredTasks.map((task, i) => {
          const emp = employees.find(e => e.id === task.assignedTo)
          const isDone = isTaskDone(task)
          const today = new Date(); today.setHours(0,0,0,0)
          let isOverdue = false
          let deadlineFmt = 'No Deadline'
          
          if (task.deadline) {
            const [y, m, d] = task.deadline.split('-').map(Number)
            const dl = new Date(y, m - 1, d)
            isOverdue = !isDone && dl < today
            deadlineFmt = dl.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
          }

          const priorityColors = {
            high: { bg: 'var(--red-dim)', text: 'var(--red)', icon: <TrendingUp size={14} /> },
            med: { bg: 'var(--amber-dim)', text: 'var(--amber)', icon: <Flag size={14} /> },
            low: { bg: 'var(--green-dim)', text: 'var(--green)', icon: <ArrowRight size={14} /> }
          }
          const p = priorityColors[task.priority] || priorityColors.med

          return (
            <div key={task.id} className={`card-premium super-glass ${isOverdue ? 'urgent-glow' : ''}`} style={{ 
              padding: 0, borderRadius: 28, overflow: 'hidden',
              transform: updating === task.id ? 'scale(0.98)' : 'none',
              opacity: updating === task.id ? 0.7 : 1,
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              border: isOverdue ? '2px solid var(--red)' : '1px solid rgba(255,255,255,0.5)',
              display: 'flex', flexDirection: 'column'
            }}>
                {/* Card Header */}
                <div style={{ padding: 24, paddingBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                       <div style={{ padding: '6px 12px', borderRadius: 8, background: p.bg, color: p.text, fontSize: 10, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6 }}>
                          {p.icon} {task.priority?.toUpperCase()}
                       </div>
                       <div style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.04)', color: 'var(--muted)', fontSize: 10, fontWeight: 900 }}>
                          {task.tag || 'GENERAL'}
                       </div>
                    </div>
                    {isDone && (
                        <div style={{ width: 28, height: 28, borderRadius: 20, background: 'var(--green)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckCircle2 size={16} />
                        </div>
                    )}
                </div>

                {/* Objective Info */}
                <div style={{ padding: '0 24px', flex: 1 }}>
                    <h3 style={{ 
                        margin: 0, fontSize: 18, fontWeight: 900, 
                        color: isDone ? 'var(--muted)' : 'var(--text)',
                        textDecoration: isDone ? 'line-through' : 'none',
                        lineHeight: 1.4
                    }}>{task.title}</h3>
                    <p style={{ marginTop: 8, fontSize: 13, fontWeight: 600, color: 'var(--muted)', opacity: 0.8, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {task.desc || task.description || 'No strategic overview provided for this objective.'}
                    </p>
                </div>

                {/* Metadata Floor */}
                <div style={{ padding: 24, paddingTop: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.4)', borderRadius: 20, border: '1px solid rgba(0,0,0,0.02)' }}>
                        <Link to={emp ? `/employees/${emp.id}` : '#'} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}>
                            <div style={{ width: 36, height: 36, borderRadius: 12, background: emp?.color || 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 12 }}>
                                {emp?.av || '?'}
                            </div>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 900 }}>{emp?.name || 'Unassigned'}</div>
                                <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>{emp?.dept || 'Lead'}</div>
                            </div>
                        </Link>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 9, fontWeight: 900, color: isOverdue ? 'var(--red)' : 'var(--muted)', textTransform: 'uppercase' }}>Deadline</div>
                            <div style={{ fontSize: 12, fontWeight: 800, color: isOverdue ? 'var(--red)' : 'inherit' }}>{deadlineFmt}</div>
                        </div>
                    </div>

                    {/* Actions Row */}
                    <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                        <button 
                            onClick={() => handleToggleTask(task.id)}
                            className="btn" 
                            style={{ 
                                flex: 2, padding: 12, borderRadius: 14, 
                                background: isDone ? 'var(--green-dim)' : 'var(--accent)', 
                                color: isDone ? 'var(--green)' : '#fff',
                                fontWeight: 900, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                            }}
                        >
                            {isDone ? <CheckSquare size={16} /> : <CheckCircle2 size={16} />}
                            {isDone ? 'Mark Active' : 'Commit Done'}
                        </button>
                        <button 
                            onClick={() => handleRemind(task.id)}
                            className="btn-glass" 
                            disabled={isDone}
                            style={{ width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Bell size={18} />
                        </button>
                        <button 
                            onClick={() => openEditDrawer(task)}
                            className="btn-glass" 
                            style={{ width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Edit size={18} />
                        </button>
                        <button 
                            onClick={() => deleteWithConfirm(task.id)}
                            className="btn-glass" 
                            style={{ width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--red)' }}
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            </div>
          )
        })}
      </div>

      {filteredTasks.length === 0 && (
        <div style={{ padding: 80, textAlign: 'center', opacity: 0.4 }}>
            <Target size={48} style={{ marginBottom: 20 }} />
            <h2 style={{ fontSize: 24, fontWeight: 900 }}>No Objectives Found</h2>
            <p style={{ fontWeight: 700 }}>Refine your intelligence parameters or commission a new objective.</p>
        </div>
      )}

      {/* Premium Side-Drawer for Task Management */}
      {showDrawer && (
        <div className="modal-overlay" onClick={() => setShowDrawer(false)} style={{ backdropFilter: 'blur(8px)', zIndex: 1000 }}>
          <div 
            className="modal-drawer super-glass animate-in" 
            onClick={e => e.stopPropagation()} 
            style={{ 
                position: 'fixed', right: 0, top: 0, bottom: 0, width: isMobile ? '100%' : 500,
                background: '#fff', padding: 40, borderLeft: '1px solid rgba(0,0,0,0.1)',
                display: 'flex', flexDirection: 'column', height: '100vh', zIndex: 1001
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: -1, margin: 0 }}>
                    {taskEditingId ? 'Refine Objective' : 'New Objective'}
                </h2>
                <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--accent)', marginTop: 4 }}>TASK ORCHESTRATION PROTOCOL</div>
              </div>
              <button 
                onClick={() => setShowDrawer(false)}
                className="btn-icon" 
                style={{ background: 'rgba(0,0,0,0.05)', borderRadius: 14 }}
              >
                  <X size={20} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', paddingRight: 8, display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Title */}
                <div>
                   <label style={{ display: 'block', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>Objective Title</label>
                   <input 
                    type="text" 
                    placeholder="E.g., Quarterly Audit Sequence..." 
                    value={newTask.title} 
                    onChange={e => setNewTask({...newTask, title: e.target.value})}
                    style={{ width: '100%', padding: '16px 20px', borderRadius: 16, background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', fontSize: 15, fontWeight: 700, outline: 'none' }} 
                   />
                </div>

                {/* Description */}
                <div>
                   <label style={{ display: 'block', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>Strategic Overview</label>
                   <textarea 
                    rows={4}
                    placeholder="Detailed tactical breakdown of this objective..." 
                    value={newTask.desc} 
                    onChange={e => setNewTask({...newTask, desc: e.target.value})}
                    style={{ width: '100%', padding: '16px 20px', borderRadius: 16, background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', fontSize: 14, fontWeight: 600, outline: 'none', resize: 'none' }} 
                   />
                </div>

                {/* Assignment */}
                <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>Lead Assignment</label>
                    <select 
                        value={newTask.assignedTo} 
                        onChange={e => setNewTask({...newTask, assignedTo: e.target.value})}
                        style={{ width: '100%', padding: '16px 20px', borderRadius: 16, background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', fontSize: 14, fontWeight: 700, outline: 'none', appearance: 'none' }}
                    >
                        <option value="">Select Personnel...</option>
                        {employees
                            .filter(e => e.role?.toLowerCase() !== 'admin' && !e.id?.toUpperCase().startsWith('ADM'))
                            .map(e => (
                                <option key={e.id} value={e.id}>{e.name} ({e.dept})</option>
                            ))}
                    </select>
                </div>

                {/* Grid Params */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>Criticality</label>
                        <select 
                            value={newTask.priority} 
                            onChange={e => setNewTask({...newTask, priority: e.target.value})}
                            style={{ width: '100%', padding: '16px 20px', borderRadius: 16, background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', fontSize: 13, fontWeight: 800, outline: 'none' }}
                        >
                            <option value="high">HIGH (URGENT)</option>
                            <option value="med">STANDARD</option>
                            <option value="low">LOW PRIORITY</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>Absolute Deadline</label>
                        <input 
                            type="date" 
                            value={newTask.deadline} 
                            onChange={e => setNewTask({...newTask, deadline: e.target.value})}
                            style={{ width: '100%', padding: '16px 20px', borderRadius: 16, background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', fontSize: 13, fontWeight: 800, outline: 'none' }} 
                        />
                    </div>
                </div>

                {/* Tag */}
                <div>
                   <label style={{ display: 'block', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>Category / Tag</label>
                   <input 
                    type="text" 
                    placeholder="E.g., Fiscal, Operational..." 
                    value={newTask.tag} 
                    onChange={e => setNewTask({...newTask, tag: e.target.value})}
                    style={{ width: '100%', padding: '16px 20px', borderRadius: 16, background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', fontSize: 14, fontWeight: 700, outline: 'none' }} 
                   />
                </div>
            </div>

            <div style={{ marginTop: 40, borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: 24, display: 'flex', gap: 16 }}>
              <button 
                onClick={() => setShowDrawer(false)}
                className="btn-glass" 
                style={{ flex: 1, padding: 18, borderRadius: 18, fontWeight: 800, border: 'none' }}
              >
                  Cancel
              </button>
              <button 
                onClick={handleSaveTask}
                className="btn" 
                disabled={updating === 'save'}
                style={{ 
                    flex: 1.5, padding: 18, borderRadius: 18, 
                    background: 'var(--accent)', color: '#fff', 
                    fontWeight: 900, boxShadow: '0 8px 24px rgba(var(--accent-rgb), 0.2)'
                }}
              >
                  {updating === 'save' ? <LoadingSpinner size="sm" /> : (taskEditingId ? 'Synchronize' : 'Commission')}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse-red {
          0% { border-color: rgba(239,68,68, 0.4); box-shadow: 0 0 0 0 rgba(239,68,68, 0.1); }
          70% { border-color: rgba(239,68,68, 1); box-shadow: 0 0 0 10px rgba(239,68,68, 0); }
          100% { border-color: rgba(239,68,68, 0.4); box-shadow: 0 0 0 0 rgba(239,68,68, 0); }
        }
        .urgent-glow { animation: pulse-red 2s infinite; }
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

function X({ size }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg> }
