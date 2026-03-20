import { useState, useMemo } from 'react'
import { useScreenSize } from '../hooks/useScreenSize'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import * as api from '../services/api'
import {
  CheckSquare,
  Search,
  Filter,
  Plus,
  MessageSquare,
  Bell,
  Trash2,
  Edit,
  ChevronRight,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Briefcase
} from 'lucide-react'
import Modal from '../components/ui/Modal'
import { Link } from 'react-router-dom'

export default function TaskManager() {
  const { isMobile, isTablet, isDesktop } = useScreenSize()
  const { tasks, employees, loading, error, refresh } = useData()
  const { user } = useAuth()
  const { showToast } = useToast()

  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [updating, setUpdating] = useState(null)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [taskEditingId, setTaskEditingId] = useState(null)
  const [newTask, setNewTask] = useState({ title: '', desc: '', deadline: '', priority: 'med', tag: 'General', assignedTo: '' })

  const depts = ['Developer', 'Marketing', 'HR', 'Design', 'Operations', 'Sales', 'Admin', 'Engineering']

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const emp = employees.find(e => e.id === t.assignedTo) || {}
      const matchSearch = (t.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (emp.name || '').toLowerCase().includes(search.toLowerCase())
      const matchDept = deptFilter === 'all' || emp.dept === deptFilter
      const isDone = t.done === 'true' || t.done === true
      const matchStatus = statusFilter === 'all' ||
        (statusFilter === 'done' && isDone) ||
        (statusFilter === 'pending' && !isDone)

      return matchSearch && matchDept && matchStatus
    })
  }, [tasks, employees, search, deptFilter, statusFilter])

  const handleToggleTask = async (taskId) => {
    setUpdating(taskId)
    try {
      await api.toggleTask(taskId)
      showToast('Task status updated', 'success')
      refresh()
    } catch (err) {
      showToast('Failed to update task', 'error')
    } finally {
      setUpdating(null)
    }
  }

  const handleRemind = async (taskId) => {
    try {
      await api.remindTask(taskId)
      showToast('Reminder sent via Telegram', 'success')
    } catch (err) {
      showToast('Failed to send reminder', 'error')
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return
    setUpdating(taskId)
    try {
      await api.deleteTask(taskId)
      showToast('Task deleted successfully', 'success')
      refresh()
    } catch (err) {
      showToast('Failed to delete task', 'error')
    } finally {
      setUpdating(null)
    }
  }

  const handleEditTask = (task) => {
    setNewTask({
      title: task.title,
      desc: task.desc || task.description || '',
      deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
      priority: task.priority || 'med',
      tag: task.tag || 'General',
      assignedTo: task.assignedTo
    })
    setTaskEditingId(task.id)
    setShowTaskModal(true)
  }

  const handleSaveTask = async () => {
    if (!newTask.title.trim()) return showToast('Title is required', 'warning')
    setUpdating(taskEditingId)
    try {
      await api.updateTask(taskEditingId, newTask)
      showToast('Task updated successfully', 'success')
      setShowTaskModal(false)
      refresh()
    } catch (err) {
      showToast('Failed to update task', 'error')
    } finally {
      setUpdating(null)
      setTaskEditingId(null)
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <div className="empty-state">Error: {error}</div>

  return (
    <div className="animate-in">
      <div className="page-header">
        <div style={{ padding: isMobile ? '0 16px' : '0' }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: isMobile ? 24 : 32 }}>Task Command Center</h1>
          <p className="subtitle">Global oversight of all organizational objectives</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ textAlign: 'right', marginRight: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{tasks.filter(t => t.done === 'true').length}/{tasks.length} Completed</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>Global Tasks Stats</div>
          </div>
        </div>
      </div>

      <div className="filter-bar" style={{
        background: 'var(--bg-card)', padding: isMobile ? '12px 16px' : '16px 24px',
        borderRadius: 24, border: '1px solid var(--line)', marginBottom: 32,
        flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center'
      }}>
        <div className="search-bar" style={{ flex: 1, width: '100%' }}>
          <Search size={16} className="search-icon" />
          <input placeholder="Search tasks or employees..." value={search} onChange={e => setSearch(e.target.value)} style={{ border: 'none', background: 'transparent', width: '100%' }} />
        </div>
        <div style={{ display: 'flex', gap: 16, width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-end' }}>
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} style={{ width: 'auto', border: 'none', fontWeight: 700, color: 'var(--text-dim)', background: 'transparent' }}>
            <option value="all">{isMobile ? 'Dept' : 'Everywhere'}</option>
            {depts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 'auto', border: 'none', fontWeight: 700, color: 'var(--text-dim)', background: 'transparent' }}>
            <option value="all">{isMobile ? 'Status' : 'All Status'}</option>
            <option value="pending">Pending</option>
            <option value="done">Completed</option>
          </select>
        </div>
      </div>

      <div className="table-container" style={{ borderRadius: 24 }}>
        <table style={{ minWidth: 600, width: '100%' }}>
          <thead>
            <tr>
              <th>Task Objective</th>
              <th>Assigned To</th>
              <th>Deadline</th>
              <th>Priority</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Management</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map(task => {
              const emp = employees.find(e => e.id === task.assignedTo)
              const isDone = task.done === 'true' || task.done === true
              const deadline = new Date(task.deadline)
              const isOverdue = !isDone && deadline < new Date() && task.deadline

              return (
                <tr key={task.id}>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: 14, color: isDone ? 'var(--muted)' : 'var(--text)', textDecoration: isDone ? 'line-through' : 'none' }}>{task.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{task.tag || 'General'}</div>
                  </td>
                  <td>
                    {emp ? (
                      <Link to={`/employees/${emp.id}`} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'inherit' }}>
                        <div className="avatar avatar-sm" style={{ background: emp.color || 'var(--accent)', borderRadius: 8 }}>{emp.av}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{emp.name}</div>
                          <div style={{ fontSize: 10, color: 'var(--muted)' }}>{emp.dept}</div>
                        </div>
                      </Link>
                    ) : (
                      <span style={{ color: 'var(--muted)', fontSize: 12 }}>Unassigned</span>
                    )}
                  </td>
                  <td>
                    <div style={{ fontSize: 13, fontWeight: 600, color: isOverdue ? 'var(--red)' : 'inherit' }}>
                      {task.deadline ? deadline.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'No Date'}
                    </div>
                    {isOverdue && <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--red)', textTransform: 'uppercase' }}>Overdue</div>}
                  </td>
                  <td>
                    <span className={`badge badge-${task.priority === 'high' ? 'red' : task.priority === 'low' ? 'green' : 'amber'}`}>
                      {(task.priority || 'med').toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {isDone ? (
                        <><CheckCircle2 size={14} color="var(--green)" /> <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)' }}>Done</span></>
                      ) : (
                        <><Clock size={14} color="var(--amber)" /> <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--amber)' }}>In Progress</span></>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                      <button
                        className="btn btn-icon btn-sm"
                        title="Toggle Status"
                        onClick={() => handleToggleTask(task.id)}
                        disabled={updating === task.id}
                        style={{ background: isDone ? 'var(--green-dim)' : 'var(--bg-elevated)', color: isDone ? 'var(--green)' : 'var(--muted)' }}
                      >
                        {updating === task.id ? <div className="spinner-sm" /> : <CheckCircle2 size={14} />}
                      </button>
                      <button
                        className="btn btn-icon btn-sm"
                        title="Send Reminder"
                        onClick={() => handleRemind(task.id)}
                        disabled={isDone}
                        style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}
                      >
                        <Bell size={14} />
                      </button>
                      <button
                        className="btn btn-icon btn-sm"
                        title="Edit Task"
                        onClick={() => handleEditTask(task)}
                        style={{ background: 'var(--bg-elevated)', color: 'var(--text-dim)' }}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        className="btn btn-icon btn-sm"
                        title="Delete Task"
                        onClick={() => handleDeleteTask(task.id)}
                        disabled={updating === task.id}
                        style={{ background: 'var(--red-dim)', color: 'var(--red)' }}
                      >
                        {updating === task.id ? <div className="spinner-sm" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filteredTasks.length === 0 && (
          <div className="empty-state" style={{ padding: 60 }}>
            <CheckSquare size={40} color="var(--muted)" />
            <h3>No tasks found matching your filters</h3>
          </div>
        )}
      </div>

      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="Edit Task" subtitle="Update organizational objective"
        footer={<><button onClick={() => setShowTaskModal(false)} style={{ padding: '8px 16px', borderRadius: 12, border: '1px solid var(--line)', background: 'transparent', fontWeight: 600, cursor: 'pointer' }}>Cancel</button><button onClick={handleSaveTask} style={{ padding: '8px 24px', borderRadius: 12, border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: 'var(--shadow-glow)' }}>Save Changes</button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Objective Title</label>
            <input value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1px solid var(--line)', background: 'var(--bg-elevated)', color: 'var(--text)', outline: 'none' }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Description</label>
            <textarea rows={3} value={newTask.desc} onChange={e => setNewTask({ ...newTask, desc: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1px solid var(--line)', background: 'var(--bg-elevated)', color: 'var(--text)', outline: 'none', resize: 'none' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Deadline</label>
              <input type="date" value={newTask.deadline} onChange={e => setNewTask({ ...newTask, deadline: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1px solid var(--line)', background: 'var(--bg-elevated)', color: 'var(--text)', outline: 'none' }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Priority</label>
              <select value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1px solid var(--line)', background: 'var(--bg-elevated)', color: 'var(--text)', outline: 'none' }}>
                <option value="high">High</option>
                <option value="med">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Category / Tag</label>
            <input value={newTask.tag} onChange={e => setNewTask({ ...newTask, tag: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1px solid var(--line)', background: 'var(--bg-elevated)', color: 'var(--text)', outline: 'none' }} />
          </div>
        </div>
      </Modal>
    </div>
  )
}
