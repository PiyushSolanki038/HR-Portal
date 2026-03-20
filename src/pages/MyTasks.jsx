import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import * as api from '../services/api'
import { 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  Filter, 
  CheckCircle2, 
  MessageSquare,
  ChevronRight,
  User,
  Tag,
  Calendar
} from 'lucide-react'

export default function MyTasks() {
  const { user } = useAuth()
  const { tasks, refresh, loading, error } = useData()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [selectedTask, setSelectedTask] = useState(null)
  const [updating, setUpdating] = useState(null)

  const isValidTask = (task) => {
    return task && task.id && task.title && task.title.trim().length > 0 && task.title !== 'Invalid Date'
  }

  const getPriorityBadgeColor = (priority) => {
    if (priority === 'high') return 'red'
    if (priority === 'med') return 'amber'
    if (priority === 'low') return 'green'
    return 'amber'
  }

  const isDone = (t) => t && (t.done === true || String(t.done).toLowerCase() === 'true')

  const getTaskStatusInfo = (task) => {
    if (isDone(task)) return { label: 'Done', color: 'var(--green)', icon: CheckCircle2 }
    
    if (!task.deadline) return { label: 'No deadline', color: 'var(--muted)', icon: Calendar }
    const [y, m, d] = task.deadline.split('-').map(Number)
    const deadline = new Date(y, m - 1, d)
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diff = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24))

    if (diff < 0) return { label: `Overdue ${Math.abs(diff)}d`, color: 'var(--red)', icon: AlertCircle }
    if (diff === 0) return { label: 'Due Today!', color: 'var(--amber)', icon: Clock }
    if (diff <= 2) return { label: `Due in ${diff}d`, color: 'var(--amber)', icon: Clock }
    const fmt = deadline.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
    return { label: fmt, color: 'var(--blue)', icon: Calendar }
  }

  const getFormattedDeadline = (task) => {
    if (!task.deadline) return 'No deadline set'
    const deadline = new Date(task.deadline)
    if (isNaN(deadline.getTime())) return 'Invalid deadline'
    return deadline.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  if (loading) return <LoadingSpinner />
  if (error) return <div className="p-6">Error: {error}</div>

  const myTasks = tasks.filter(t => t.assignedTo?.toLowerCase() === user?.id?.toLowerCase())
  const validTasks = myTasks.filter(isValidTask)
  const completedCount = validTasks.filter(isDone).length
  const completionRate = validTasks.length ? Math.round((completedCount / validTasks.length) * 100) : 0

  const categories = [
    { key: 'all', label: `All (${validTasks.length})`, color: 'var(--accent)' },
    { key: 'overdue', label: 'Overdue', color: 'var(--red)' },
    { key: 'dueSoon', label: 'Due Soon', color: 'var(--amber)' },
    { key: 'onTrack', label: 'On Track', color: 'var(--blue)' },
    { key: 'done', label: 'Done', color: 'var(--green)' },
  ]

  const filteredTasks = validTasks.filter(t => {
    if (filter === 'all') return true
    if (filter === 'done') return isDone(t)
    if (isDone(t)) return false // Don't show completed tasks in other filters
    
    const deadline = new Date(t.deadline)
    if (isNaN(deadline.getTime())) return true 
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diff = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24))

    if (filter === 'overdue') return diff < 0
    if (filter === 'dueSoon') return diff >= 0 && diff <= 2
    if (filter === 'onTrack') return diff > 2
    return true
  })

  const handleToggleComplete = async (taskId) => {
    setUpdating(taskId)
    try {
      const task = validTasks.find(t => t.id === taskId)
      await api.toggleTask(taskId)
      showToast(isDone(task) ? 'Task reopened' : 'Completed: ' + (task.title || 'Task'), 'success')
      refresh()
    } catch (err) {
      showToast('Failed to update task', 'error')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1>My Tasks</h1>
          <p className="subtitle">Manage deadlines and track completion.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
           <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{completedCount}/{validTasks.length} tasks</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>Completed this month</div>
           </div>
           <div style={{ width: 44, height: 44, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="44" height="44" viewBox="0 0 44 44">
                 <circle cx="22" cy="22" r="18" fill="none" stroke="var(--bg-elevated)" strokeWidth="4" />
                 <circle cx="22" cy="22" r="18" fill="none" stroke="var(--green)" strokeWidth="4" 
                    strokeDasharray={`${(completionRate / 100) * 113} 113`} 
                    transform="rotate(-90 22 22)"
                    strokeLinecap="round"
                 />
              </svg>
              <span style={{ position: 'absolute', fontSize: 10, fontWeight: 800 }}>{completionRate}%</span>
           </div>
        </div>
      </div>

      <div className="filter-bar" style={{ marginBottom: 24 }}>
         <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button 
                key={cat.key}
                className={`btn ${filter === cat.key ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => setFilter(cat.key)}
                style={{ 
                   background: filter === cat.key ? cat.color : '',
                   borderColor: filter === cat.key ? cat.color : ''
                }}
              >
                {cat.label}
              </button>
            ))}
         </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filteredTasks.map(task => {
          const status = getTaskStatusInfo(task)
          const isTaskDone = isDone(task)
          
          return (
            <div 
              key={task.id} 
              className="card-premium" 
              style={{ 
                padding: 0, 
                borderLeft: `6px solid ${status.color}`,
                cursor: 'pointer',
                marginBottom: 4
              }}
              onClick={() => setSelectedTask(task)}
            >
              <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                 <div style={{ flexShrink: 0 }} onClick={e => { e.stopPropagation(); handleToggleComplete(task.id); }}>
                    {updating === task.id ? (
                      <div className="spinner-sm"></div>
                    ) : (
                      <div style={{ 
                        width: 22, height: 22, borderRadius: 4, 
                        border: `2px solid ${isTaskDone ? 'var(--green)' : 'var(--muted)'}`,
                        background: isTaskDone ? 'var(--green)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', transition: 'all 0.2s'
                      }}>
                         {isTaskDone && <CheckCircle2 size={16} />}
                      </div>
                    )}
                 </div>
                 
                 <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      fontSize: 15, 
                      fontWeight: 600, 
                      textDecoration: isTaskDone ? 'line-through' : 'none',
                      color: isTaskDone ? 'var(--muted)' : 'var(--text)'
                    }}>
                      {task.title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginTop: 4 }}>
                       <span style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <User size={12} /> {task.assignedBy || 'HR Team'}
                       </span>
                       <span style={{ fontSize: 12, color: status.color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <status.icon size={12} /> {status.label}
                       </span>
                       <span className={`badge badge-${getPriorityBadgeColor(task.priority)}`} style={{ fontSize: 10 }}>
                          {(task.priority || 'med').toUpperCase()}
                       </span>
                    </div>
                 </div>

                 <div style={{ display: 'flex', gap: 8 }}>
                    <button 
                      className="btn btn-icon btn-sm"
                      onClick={e => { e.stopPropagation(); navigate('/communication'); }}
                    >
                       <MessageSquare size={14} />
                    </button>
                    <ChevronRight size={18} color="var(--muted)" />
                 </div>
              </div>
            </div>
          )
        })}

        {filteredTasks.length === 0 && (
          <div className="empty-state">
             <CheckSquare size={48} />
             <h3>No tasks found</h3>
             <p>Change your filter or check back later for new assignments.</p>
          </div>
        )}
      </div>

      {selectedTask && (
        <div className="modal-overlay" onClick={() => setSelectedTask(null)}>
           <div 
             className="modal-drawer" 
             onClick={e => e.stopPropagation()} 
             style={{ maxWidth: '500px' }}
           >
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className={`badge badge-${getPriorityBadgeColor(selectedTask.priority)}`} style={{ padding: '6px 12px', fontSize: 10 }}>
                     {(selectedTask.priority || 'med').toUpperCase()} PRIORITY
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: -12, marginBottom: 24 }}>
                <div style={{ width: 1, height: 16, background: 'var(--line)' }} />
                <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>TASK ID: #{selectedTask.id?.substring(0,8)}</div>
              </div>

              <h2 className="glow-text" style={{ fontSize: 28, fontWeight: 900, marginBottom: 16, lineHeight: 1.2 }}>
                {selectedTask.title || 'Untitled Task'}
              </h2>
              
              <div style={{ padding: '0 4px', marginBottom: '32px' }}>
                <p style={{ fontSize: '15px', color: 'var(--text-dim)', lineHeight: '1.7', margin: 0 }}>
                   {selectedTask.description || 'No detailed description provided for this task.'}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
                 <div>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '1px' }}>Assigned By</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                       <div className="avatar avatar-sm" style={{ background: 'var(--accent)', fontWeight: 900 }}>{selectedTask.assignedBy?.[0] || 'H'}</div>
                       <div style={{ fontSize: '14px', fontWeight: 700 }}>{selectedTask.assignedBy || 'HR Team'}</div>
                    </div>
                 </div>
                 <div>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '1px' }}>Due Date</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                       <div style={{ width: 28, height: 28, borderRadius: '8px', background: `${getTaskStatusInfo(selectedTask).color}15`, color: getTaskStatusInfo(selectedTask).color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Calendar size={14} />
                       </div>
                       <div style={{ fontSize: '14px', fontWeight: 700, color: getTaskStatusInfo(selectedTask).color }}>
                          {getFormattedDeadline(selectedTask)}
                       </div>
                    </div>
                 </div>
                 <div>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '1px' }}>Category</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                       <div style={{ width: 28, height: 28, borderRadius: '8px', background: 'var(--bg-elevated)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--line)' }}>
                          <Tag size={14} />
                       </div>
                       <div style={{ fontSize: '14px', fontWeight: 700 }}>{selectedTask.tag || 'General'}</div>
                    </div>
                 </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                 <button 
                   className="btn btn-primary" 
                   style={{ flex: 1, justifyContent: 'center' }}
                   onClick={() => { handleToggleComplete(selectedTask.id); setSelectedTask(null); }}
                 >
                    {isDone(selectedTask) ? 'Reopen Task' : 'Mark as Complete'}
                 </button>
                 <button 
                   className="btn btn-secondary" 
                   style={{ flex: 1, justifyContent: 'center' }}
                   onClick={() => { setSelectedTask(null); navigate('/communication'); }}
                 >
                    <MessageSquare size={16} /> Chat
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}
