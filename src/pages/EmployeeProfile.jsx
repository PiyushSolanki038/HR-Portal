import { useState, useMemo, useEffect } from 'react'
import { useScreenSize } from '../hooks/useScreenSize'
import { useParams, useNavigate } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import * as api from '../services/api'
import Modal from '../components/ui/Modal'
import { ArrowLeft, Edit, Edit2, Download, Loader2, Users, MessageSquare, CheckCircle2, Calendar, Mail, Flame, Clock, Target, AlertTriangle, Building2, Trash2 } from 'lucide-react'

// ── HELPERS ───────────────────────────────────────────────
const isTaskDone = (t) => t && (t.done === true || String(t.done).toLowerCase() === 'true')

function taskStatus(task) {
  if (isTaskDone(task)) return 'done'
  if (!task.deadline) return 'ok'
  const [y, m, d] = task.deadline.split('-').map(Number)
  const dl = new Date(y, m - 1, d)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const diff = Math.ceil((dl - today) / 86400000)
  if (diff < 0) return 'over'
  if (diff === 0) return 'soon' // Today
  if (diff <= 2) return 'soon'
  return 'ok'
}

function deadlineLabel(task) {
  if (isTaskDone(task)) return { text: '✅ Done', cls: 'done' }
  if (!task.deadline) return { text: 'No Date', cls: 'ok' }
  const [y, m, d] = task.deadline.split('-').map(Number)
  const dl = new Date(y, m - 1, d)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const diff = Math.ceil((dl - today) / 86400000)
  const fmt = dl.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
  if (diff < 0) return { text: `🔴 Overdue ${Math.abs(diff)}d`, cls: 'over' }
  if (diff === 0) return { text: '🟡 Due Today!', cls: 'soon' }
  if (diff <= 2) return { text: `🟡 Due in ${diff}d — ${fmt}`, cls: 'soon' }
  return { text: `🔵 ${fmt}`, cls: 'ok' }
}

function scoreColor(s) {
  if (s >= 90) return '#0ba360'
  if (s >= 75) return '#1a6cff'
  if (s >= 60) return '#d97706'
  return '#e0321c'
}

const DEPT_COLORS = {
  Developer: { bg: '#eef3ff', color: '#1a6cff' },
  Marketing: { bg: '#f3f0ff', color: '#6d28d9' },
  HR: { bg: '#edfaf3', color: '#0ba360' },
  Design: { bg: '#fff8ec', color: '#d97706' },
  Operations: { bg: '#ecfeff', color: '#0891b2' },
  Sales: { bg: '#fff1ee', color: '#e0321c' },
  Admin: { bg: '#f3f0ff', color: '#6d28d9' },
  Engineering: { bg: '#eef3ff', color: '#1a6cff' },
}

const TAG_STYLES = {
  Development: '#eef3ff,#1a6cff', Design: '#f3f0ff,#6d28d9', Review: '#ecfeff,#0891b2',
  Documentation: '#f7f8fc,#6e7f96', Meeting: '#fff8ec,#d97706', Sales: '#fff1ee,#e0321c',
  Operations: '#eef3ff,#1a6cff', General: '#f7f8fc,#6e7f96', Other: '#f7f8fc,#6e7f96',
}
function tagStyle(tag) {
  const s = (TAG_STYLES[tag] || '#f7f8fc,#6e7f96').split(',')
  return { background: s[0], color: s[1] }
}

function dlStyle(cls) {
  const m = {
    over: { background: '#fff1ee', color: '#e0321c', borderColor: '#ffccc5' },
    soon: { background: '#fff8ec', color: '#d97706', borderColor: '#fde8a0' },
    ok: { background: '#eef3ff', color: '#1a6cff', borderColor: '#c3d5ff' },
    done: { background: '#edfaf3', color: '#0ba360', borderColor: '#a7f0cf' },
  }
  return m[cls] || m.ok
}

function priStyle(p) {
  const m = {
    high: { background: 'var(--red-dim)', color: 'var(--red)' },
    med: { background: 'var(--amber-dim)', color: 'var(--amber)' },
    low: { background: 'var(--green-dim)', color: 'var(--green)' },
  }
  return m[p] || m.med
}

// ── PERF RING ───────────────────────────────────────────────
function PerfRing({ score, size = 100, stroke = 9 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const fill = (score / 100) * circ
  const color = scoreColor(score)
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-elevated)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray .6s ease' }} />
      </svg>
      <span style={{ fontFamily: 'Syne,sans-serif', fontSize: size < 60 ? 12 : 20, fontWeight: 800, color, position: 'relative', zIndex: 1 }}>{score}</span>
    </div>
  )
}

// ── HEATMAP ──────────────────────────────────────────────────
function Heatmap({ data = {} }) {
  const firstDayOffset = 6 // March 2026 starts on Sunday
  const daysInMonth = 31
  const totalCells = firstDayOffset + daysInMonth
  const cols = Math.ceil(totalCells / 7)
  const COLOR = { p: 'var(--blue)', l: 'var(--amber)', a: 'var(--red)', x: 'var(--line)', h: 'var(--bg-elevated)' }
  const LABEL = { p: 'Present', l: 'Late', a: 'Absent', x: 'Weekend/Holiday', h: 'No data' }
  const colEls = []
  for (let col = 0; col < cols; col++) {
    const rowEls = []
    for (let row = 0; row < 7; row++) {
      const idx = col * 7 + row
      const day = idx - firstDayOffset + 1
      if (day < 1 || day > daysInMonth) {
        rowEls.push(<div key={row} style={{ width: 13, height: 13, borderRadius: 3, background: 'var(--bg)', opacity: .3 }} />)
      } else {
        const s = data[day] || 'h'
        rowEls.push(
          <div key={row} title={`Mar ${day}: ${LABEL[s]}`}
            style={{ width: 13, height: 13, borderRadius: 3, background: COLOR[s], cursor: 'pointer', transition: 'transform .1s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.4)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          />
        )
      }
    }
    colEls.push(<div key={col} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>{rowEls}</div>)
  }
  return (
    <div style={{ width: '100%' }}>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 12, fontWeight: 600, letterSpacing: .5, textTransform: 'uppercase' }}>March 2026 — Attendance Pattern</div>
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 8, width: '100%' }}>
        <div style={{ display: 'inline-flex', gap: 6, minWidth: 'max-content' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginRight: 2 }}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
              <div key={d} style={{ fontSize: 9, color: 'var(--muted)', height: 13, lineHeight: '13px' }}>{d}</div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 2 }}>{colEls}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, fontSize: 11.5, color: 'var(--text-dim)', flexWrap: 'wrap' }}>
        <span>Legend:</span>
        {[[COLOR.p, 'Present'], [COLOR.l, 'Late'], [COLOR.a, 'Absent'], [COLOR.x, 'Holiday']].map(([c, l]) => (
          <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 13, height: 13, borderRadius: 3, background: c, display: 'inline-block' }} />
            {l}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── PROGRESS BAR ─────────────────────────────────────────────
function PB({ label, value, color }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-dim)', marginBottom: 5 }}>
        <span>{label}</span>
        <span style={{ fontWeight: 600, color: 'var(--text)' }}>{value}%</span>
      </div>
      <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 4, transition: 'width .6s ease' }} />
      </div>
    </div>
  )
}

// ── SHARED STYLES ────────────────────────────────────────────
const card = {
  background: 'var(--bg-card)', border: 'var(--border)', borderRadius: 'var(--r-lg)',
  overflow: 'hidden', boxShadow: 'var(--shadow-sm)', transition: 'all .2s ease'
}
const cardHdr = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '16px 20px', borderBottom: 'var(--border)'
}
const cardTitle = { fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--text)' }
const outlineBtn = {
  padding: '6px 12px', borderRadius: 'var(--r-sm)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
  background: 'var(--bg-elevated)', color: 'var(--text)', border: 'var(--border)',
  display: 'flex', alignItems: 'center', gap: 6, transition: 'all .1s'
}
const primaryBtn = {
  padding: '7px 14px', borderRadius: 'var(--r-md)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
  background: 'var(--accent)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: 6,
  boxShadow: 'var(--shadow-glow)'
}

// ── MAIN ─────────────────────────────────────────────────────
export default function EmployeeProfile() {
  const { isMobile, isTablet, isDesktop } = useScreenSize()
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { employees, mentors, leaves, attendanceSummary, loading: dataLoading, refresh } = useData()
  const { user } = useAuth()

  const isHR = user?.role?.toLowerCase() === 'hr manager' || user?.role?.toLowerCase() === 'admin'

  const [activeId, setActiveId] = useState(id || '')
  const [tasks, setTasks] = useState([])
  const [history, setHistory] = useState([])
  const [heatmap, setHeatmap] = useState({})
  const [loading, setLoading] = useState(false)

  const [taskFilter, setTaskFilter] = useState('all')
  const [attTab, setAttTab] = useState('heatmap')
  const [quickAdd, setQuickAdd] = useState('')
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [showMentorModal, setShowMentorModal] = useState(false)
  const [showMsgModal, setShowMsgModal] = useState(false)
  const [showTeamLeaderModal, setShowTeamLeaderModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [msgText, setMsgText] = useState('')
  const [msgChannel, setMsgChannel] = useState('telegram')
  const [editFormData, setEditFormData] = useState({})
  const [newLeave, setNewLeave] = useState({ type: 'casual', startDate: '', endDate: '', reason: '' })
  const [notesList, setNotesList] = useState({
    EMP001: [
      { type: 'green', text: 'Great improvement in code quality. Promoted to code reviewer for Q2.' },
      { type: 'amber', text: 'Needs to improve time management — sometimes submits attendance late on Mondays.' },
      { type: 'blue', text: 'Strong candidate for team lead role by Q3 2026. Recommend leadership training.' },
    ],
    DEV02: [
      { type: 'green', text: 'Outstanding work on the HR portal. Excellent PRD analysis and execution.' },
      { type: 'blue', text: 'Taking initiative on debugging reports — great leadership potential.' },
    ],
  })
  const [newTask, setNewTask] = useState({ title: '', desc: '', deadline: '', priority: 'high', tag: 'Development' })
  const [taskEditingId, setTaskEditingId] = useState(null)
  const [newNote, setNewNote] = useState({ text: '', type: 'green' })

  // Initialize activeId from employees if not set
  useEffect(() => {
    if (!activeId && employees.length > 0) {
      setActiveId(employees[0].id)
    }
  }, [employees, activeId])

  // Fetch employee specific data
  useEffect(() => {
    if (!activeId) return
    let active = true
    async function fetchDetails() {
      setLoading(true)
      try {
        const [tks, att] = await Promise.all([
          api.getEmployeeTasks(activeId),
          api.getEmployeeAttendance(activeId)
        ])
        if (!active) return
        setTasks(tks || [])
        setHistory(att || [])

        // Generate a simple heatmap from history
        const hm = {}
        att.forEach(a => {
          const d = new Date(a.date).getDate()
          hm[d] = a.status // 'p', 'l', 'a'
        })
        setHeatmap(hm)
      } catch (err) {
        console.error(err)
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchDetails()
    return () => { active = false }
  }, [activeId])

  const emp = employees.find(e => e.id === activeId) || employees[0] || {
    name: 'Loading...', role: 'Please wait', dept: '...', status: 'active', color: '#ccc', av: '??', score: 0,
    present: 0, late: 0, absent: 0, streak: 0, leaves: 0, joining: '...', tg: '...', wa: '...', email: '...', salary: 0, id: '...'
  }

  const empTasks = tasks
  const mentorEmp = mentors.find(m => m.id === emp.mentorId)
  const teamLeaderEmp = employees.find(e => e.id === emp.teamLeaderId)
  const empNotes = notesList[activeId] || []
  const empLeaves = (leaves || []).filter(l => {
    const isApproved = l.status?.toLowerCase() === 'approved' || l.status?.includes('day') || l.approvedBy;
    return l.empId?.toLowerCase() === activeId?.toLowerCase() && isApproved;
  })
  const takenCount = empLeaves.length

  const stats = attendanceSummary[activeId] || { present: 0, late: 0, score: 0, totalAttended: 0 }
  const totalDays = stats.workingDays || 0
  const attendRate = parseInt(emp.score) || stats.score || 0
  const punctRate = stats.totalAttended > 0 ? Math.round(((stats.present || 0) / stats.totalAttended) * 100) : 100
  const doneCount = empTasks.filter(isTaskDone).length
  const taskRate = empTasks.length > 0 ? Math.round(doneCount / empTasks.length * 100) : 0
  const leaveLeft = Math.max(0, 3 - takenCount)
  // Calculate streak from history
  const streak = useMemo(() => {
    let s = 0;
    for (const h of history) {
      if (h.status === 'p' || h.status === 'l') s++;
      else break;
    }
    return s;
  }, [history])

  const counts = useMemo(() => ({
    all: empTasks.length,
    over: empTasks.filter(t => taskStatus(t) === 'over').length,
    soon: empTasks.filter(t => taskStatus(t) === 'soon').length,
    ok: empTasks.filter(t => taskStatus(t) === 'ok').length,
    done: doneCount,
  }), [empTasks, doneCount])

  const filteredTasks = useMemo(() => {
    if (taskFilter === 'all') return empTasks
    if (taskFilter === 'done') return empTasks.filter(isTaskDone)
    return empTasks.filter(t => taskStatus(t) === taskFilter)
  }, [empTasks, taskFilter])

  async function toggleTaskStatus(tid) {
    try {
      await api.toggleTask(tid)
      setTasks(ts => ts.map(t => t.id === tid ? { ...t, done: !isTaskDone(t) } : t))
      showToast('Task updated', 'success')
    } catch (err) {
      showToast('Failed to update task', 'error')
    }
  }

  async function addQuickTask() {
    if (!quickAdd.trim()) return
    try {
      const dl = new Date(); dl.setDate(dl.getDate() + 7)
      const newTaskData = { empId: activeId, title: quickAdd, desc: '', deadline: dl.toISOString().split('T')[0], priority: 'med', tag: 'General' }
      const res = await api.addTask(newTaskData)
      setTasks(ts => [res, ...ts])
      setQuickAdd('')
      showToast('Task added!', 'success')
    } catch (err) {
      showToast('Failed to add task', 'error')
    }
  }

  async function addTaskFromModal() {
    if (!newTask.title.trim()) { showToast('Title required', 'warning'); return }
    try {
      setLoading(true)
      const dl = newTask.deadline || (() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().split('T')[0] })()
      
      if (taskEditingId) {
        await api.updateTask(taskEditingId, { ...newTask, deadline: dl })
        setTasks(ts => ts.map(t => t.id === taskEditingId ? { ...t, ...newTask, deadline: dl } : t))
        showToast('Task updated!', 'success')
      } else {
        const res = await api.addTask({ ...newTask, empId: activeId, deadline: dl })
        setTasks(ts => [res, ...ts])
        showToast('Task added!', 'success')
      }
      
      setShowTaskModal(false)
      setTaskEditingId(null)
      setNewTask({ title: '', desc: '', deadline: '', priority: 'high', tag: 'Development' })
      refresh()
    } catch (err) {
      showToast('Action failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function deleteTask(tid) {
    if (!window.confirm('Are you sure you want to delete this task?')) return
    try {
      setLoading(true)
      await api.deleteTask(tid)
      setTasks(ts => ts.filter(t => t.id !== tid))
      showToast('Task deleted', 'success')
      refresh()
    } catch (err) {
      showToast('Failed to delete task', 'error')
    } finally {
      setLoading(false)
    }
  }

  function openEditTaskModal(task) {
    setNewTask({
      title: task.title,
      desc: task.desc || '',
      deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
      priority: task.priority || 'med',
      tag: task.tag || 'General'
    })
    setTaskEditingId(task.id)
    setShowTaskModal(true)
  }

  function openEditModal() {
    setEditFormData({ ...emp })
    setShowEditModal(true)
  }

  async function saveProfile() {
    try {
      setLoading(true)
      await api.updateEmployee(activeId, editFormData)
      await refresh()
      setShowEditModal(false)
      showToast('Profile updated!', 'success')
    } catch (err) {
      showToast('Failed to update profile', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function sendMessage() {
    if (!msgText.trim()) { showToast('Message cannot be empty', 'warning'); return }

    if (msgChannel === 'wa') {
      const phone = emp.wa || ''
      if (!phone) {
        showToast('WhatsApp number not set for this employee', 'error')
        return
      }
      const cleanPhone = phone.replace(/\D/g, '')
      const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msgText)}`
      window.open(url, '_blank')
      setShowMsgModal(false)
      setMsgText('')
      showToast('Redirecting to WhatsApp...', 'success')
      return
    }

    try {
      setLoading(true)
      await api.sendDirectMessage({ empId: activeId, text: msgText, channel: msgChannel })
      setShowMsgModal(false)
      setMsgText('')
      showToast('Message sent to employee!', 'success')
    } catch (err) {
      showToast('Failed to send message', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleLogLeave() {
    if (!newLeave.startDate || !newLeave.endDate) {
      showToast('Dates are required', 'warning')
      return
    }
    try {
      setLoading(true)
      await api.logExternalLeave({
        ...newLeave,
        empId: activeId,
        empName: emp.name,
        dept: emp.dept,
        loggedBy: user.name || 'Admin'
      })
      await refresh()
      setShowLeaveModal(false)
      setNewLeave({ type: 'casual', startDate: '', endDate: '', reason: '' })
      showToast('External leave logged successfully', 'success')
    } catch (err) {
      showToast('Failed to log leave', 'error')
    } finally {
      setLoading(false)
    }
  }

  function addNote() {
    if (!newNote.text.trim()) { showToast('Write a note first', 'warning'); return }
    setNotesList(n => ({ ...n, [activeId]: [{ ...newNote }, ...(n[activeId] || [])] }))
    setShowNoteModal(false)
    setNewNote({ text: '', type: 'green' })
    showToast('Mentor note saved!', 'success')
  }

  const noteColor = { green: '#0ba360', amber: '#d97706', blue: '#1a6cff' }

  const statusBadge = emp.status === 'active'
    ? { bg: '#edfaf3', color: '#0ba360', border: '#a7f0cf', label: 'Active' }
    : emp.status === 'leave'
      ? { bg: '#ecfeff', color: '#0891b2', border: '#a5f3fc', label: 'On Leave' }
      : { bg: '#fff1ee', color: '#e0321c', border: '#ffccc5', label: 'Inactive' }

  const deptStyle = DEPT_COLORS[emp.dept] || { bg: '#eef3ff', color: '#1a6cff' }

  const formLabel = { fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: .5, display: 'block', marginBottom: 5 }
  const formInput = { width: '100%', padding: '9px 12px', borderRadius: 'var(--r-sm)', border: 'var(--border)', background: 'var(--bg-elevated)', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'var(--font)' }

  if (dataLoading && !employees.length) return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', flexDirection: 'column', gap: 15 }}>
      <Loader2 className="animate-spin" size={40} color="var(--accent)" />
      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-dim)' }}>Loading Employees...</span>
    </div>
  )

  return (
    <div style={{ fontFamily: 'var(--font)', background: 'var(--bg)', minHeight: '100vh', paddingBottom: 60, color: 'var(--text)' }}>

      {/* ── EMPLOYEE SWITCHER ── */}
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: isMobile ? '12px 16px' : '16px 20px', marginBottom: 20, alignItems: 'center', borderBottom: 'var(--border)', background: 'var(--bg-glass)', backdropFilter: 'blur(8px)', position: 'sticky', top: 0, zIndex: 40, WebkitOverflowScrolling: 'touch' }}>
        <button onClick={() => navigate('/employees')}
          style={{ ...outlineBtn, padding: '8px 14px', flexShrink: 0 }}>
          <ArrowLeft size={14} /> Back
        </button>
        <div style={{ width: 1, height: 24, background: 'var(--line)', margin: '0 4px' }} />
        <div style={{ display: 'flex', gap: 8, paddingBottom: 4 }}>
          {employees.map(e => (
            <div key={e.id} onClick={() => { setActiveId(e.id); setTaskFilter('all'); navigate(`/employees/${e.id}`) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px',
                borderRadius: 'var(--r-xl)', border: activeId === e.id ? '2px solid var(--accent)' : '1px solid var(--line)',
                background: activeId === e.id ? 'var(--accent-glow)' : 'var(--bg-card)',
                cursor: 'pointer', flexShrink: 0, transition: 'all .25s',
                boxShadow: activeId === e.id ? 'var(--shadow-glow)' : 'none'
              }}>
              <div style={{
                width: 24, height: 24, borderRadius: 'var(--r-sm)', background: e.color || '#ccc',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 800, color: '#fff', fontFamily: 'Syne,sans-serif'
              }}>{e.av || '??'}</div>
              <span style={{ fontSize: 13, fontWeight: activeId === e.id ? 700 : 500, color: activeId === e.id ? 'var(--text)' : 'var(--text-dim)' }}>{e.name.split(' ')[0]}</span>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 6, background: scoreColor(attendanceSummary[e.id]?.score || 0) + '22', color: scoreColor(attendanceSummary[e.id]?.score || 0) }}>{attendanceSummary[e.id]?.score || 0}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: isMobile ? '0 12px' : '0 24px' }}>

        {/* ── HERO ── */}
        <div style={{ ...card, marginBottom: 24, border: 'none', background: 'transparent' }}>
          <div style={{
            background: 'var(--bg-card)', borderRadius: 'var(--r-xl)', border: 'var(--border)',
            overflow: 'hidden', position: 'relative', boxShadow: 'var(--shadow-md)'
          }}>
            {/* Banner */}
            {/* Banner */}
            <div style={{ height: isMobile ? 100 : 160, background: 'var(--bg-elevated)', position: 'relative', overflow: 'hidden' }}>
              <img
                src="/profile_banner_abstract.png"
                alt="Banner"
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9, filter: 'brightness(0.95)' }}
                onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.style.background = 'linear-gradient(135deg, var(--accent) 0%, #fcd34d 100%)'; }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.1), var(--bg-card))' }} />
            </div>

            {/* Profile Content */}
            <div style={{ padding: isMobile ? '0 16px 24px' : '0 32px 32px', marginTop: isMobile ? -40 : -50, position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'center' : 'flex-end', justifyContent: 'space-between', gap: 24 }}>
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'center' : 'flex-end', gap: isMobile ? 12 : 24, flex: 1, textAlign: isMobile ? 'center' : 'left' }}>
                  <div style={{
                    width: isMobile ? 80 : 100, height: isMobile ? 80 : 100, borderRadius: 'var(--r-xl)',
                    background: `linear-gradient(135deg, ${emp.color}, var(--accent))`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 40, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-heading)',
                    border: '5px solid var(--bg-card)', boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                  }}>{emp.av}</div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                      <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: isMobile ? 20 : 28, fontWeight: 800, letterSpacing: -1, overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', whiteSpace: 'nowrap' }}>{emp.name}</h1>
                      <span style={{
                        padding: '4px 10px', borderRadius: 100, fontSize: 10, fontWeight: 700,
                        background: statusBadge.bg === '#edfaf3' ? 'var(--green-dim)' : statusBadge.bg === '#ecfeff' ? 'var(--blue-dim)' : 'var(--red-dim)',
                        color: statusBadge.color, border: `1px solid ${statusBadge.color}33`,
                        marginLeft: isMobile ? 'auto' : 0, marginRight: isMobile ? 'auto' : 0
                      }}>{statusBadge.label}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: isMobile ? 'center' : 'flex-start' }}>
                      <span style={{ fontSize: 14, color: 'var(--text-dim)', fontWeight: 500 }}>{emp.role}</span>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--line)' }} />
                      <span style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 600 }}>{emp.dept}</span>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--line)' }} />
                      <code style={{ fontSize: 12, color: 'var(--muted)', background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: 6 }}>{emp.id}</code>
                    </div>
                    {teamLeaderEmp && (
                      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, justifyContent: isMobile ? 'center' : 'flex-start' }}>
                        <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>TEAM LEADER:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-elevated)', padding: '4px 10px', borderRadius: '100px', border: 'var(--border)' }}>
                          <div style={{ width: 14, height: 14, borderRadius: '50%', background: teamLeaderEmp.color || 'var(--accent)', fontSize: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{teamLeaderEmp.av}</div>
                          <span style={{ fontSize: 12, fontWeight: 600 }}>{teamLeaderEmp.name}</span>
                          {isHR && (
                            <button onClick={() => setShowTeamLeaderModal(true)} style={{ background: 'none', border: 'none', color: 'var(--accent)', padding: 0, cursor: 'pointer', fontSize: 10, fontWeight: 700, marginLeft: 4 }}>• Change</button>
                          )}
                        </div>
                      </div>
                    )}
                    {!teamLeaderEmp && isHR && (
                      <div style={{ marginTop: 12, textAlign: isMobile ? 'center' : 'left' }}>
                        <button onClick={() => setShowTeamLeaderModal(true)} style={{ background: 'none', border: '1px dashed var(--line)', color: 'var(--muted)', padding: '4px 10px', borderRadius: '100px', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>+ Assign Team Leader</button>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, paddingBottom: 8, alignItems: 'center', width: isMobile ? '100%' : 'auto', flexWrap: 'wrap' }}>
                  <button onClick={() => { setMsgChannel('telegram'); setShowMsgModal(true); }} style={{ ...primaryBtn, flex: isMobile ? '1 1 calc(50% - 4px)' : 'none', justifyContent: 'center' }}>
                    <MessageSquare size={14} /> Message
                  </button>
                  <button onClick={openEditModal} style={{ ...outlineBtn, flex: isMobile ? '1 1 calc(50% - 4px)' : 'none', justifyContent: 'center' }}><Edit size={14} /> Edit Profile</button>
                </div>
              </div>

              <div style={{
                display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: isMobile ? 12 : 16, marginTop: 32
              }}>
                {[
                  { val: stats.present, label: 'Present', color: 'var(--green)', icon: 'CheckCircle2' },
                  { val: stats.late, label: 'Late', color: 'var(--amber)', icon: 'Clock' },
                  { val: Math.max(0, (stats.workingDays || 0) - (stats.totalAttended || 0)), label: 'Absent', color: 'var(--red)', icon: 'AlertTriangle' },
                  { val: streak, label: 'Streak', color: 'var(--blue)', icon: 'Flame' },
                  { val: takenCount, label: 'Leaves', color: 'var(--purple)', icon: 'Calendar' },
                  { val: parseInt(emp.score) || stats.score || 0, label: 'Score', color: scoreColor(parseInt(emp.score) || stats.score || 0), icon: 'Target' },
                ].map((s) => (
                  <div key={s.label} style={{
                    background: 'var(--bg-elevated)', padding: isMobile ? '12px 8px' : '20px 16px', borderRadius: '20px',
                    textAlign: 'center', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
                    transition: 'transform 0.2s', cursor: 'default'
                  }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                    <div style={{ fontSize: isMobile ? 18 : 24, fontWeight: 900, color: s.color, fontFamily: 'Syne,sans-serif', marginBottom: 2 }}>{s.val}</div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── MAIN GRID ── */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 16 : 24 }}>

          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* TASK MANAGER */}
            <div style={card}>
              <div style={cardHdr}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={cardTitle}>Task Manager</div>
                  </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <button onClick={() => setShowTaskModal(true)} style={{ ...primaryBtn, padding: '6px 14px', fontSize: 11 }}>+ New</button>
                </div>
              </div>

              <div className="no-scrollbar" style={{ 
                display: 'flex', gap: 6, overflowX: 'auto', 
                padding: isMobile ? '12px 10px' : '12px 20px', 
                borderBottom: 'var(--border)', background: 'var(--bg-elevated)', 
                opacity: .9, WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none'
              }}>
                {[
                  { key: 'all', label: 'All', color: 'var(--blue)', count: counts.all },
                  { key: 'over', label: 'Overdue', color: 'var(--red)', count: counts.over },
                  { key: 'soon', label: 'Due Soon', color: 'var(--amber)', count: counts.soon },
                  { key: 'ok', label: 'On Track', color: 'var(--blue)', count: counts.ok },
                  { key: 'done', label: 'Done', color: 'var(--green)', count: counts.done },
                ].map(f => {
                  const active = taskFilter === f.key
                  return (
                    <button key={f.key} onClick={() => setTaskFilter(f.key)}
                      style={{
                        padding: '6px 12px', borderRadius: 20, fontSize: 11.5, fontWeight: 600,
                        border: '1px solid var(--line)',
                        background: active ? 'var(--bg-hover)' : 'transparent',
                        color: active ? f.color : 'var(--text-dim)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all .15s', flexShrink: 0
                      }}>
                      {f.label}
                      <span style={{ fontSize: 10, background: active ? f.color + '22' : 'var(--bg-glass)', color: active ? f.color : 'var(--muted)', padding: '1px 6px', borderRadius: 10 }}>{f.count}</span>
                    </button>
                  )
                })}
              </div>

              <div style={{ padding: '0 8px 8px' }}>
                {filteredTasks.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)', fontSize: 13 }}>No tasks in this category</div>
                )}
                {filteredTasks.map(task => {
                  const dl = deadlineLabel(task)
                  const ts = taskStatus(task)
                  return (
                    <div key={task.id}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: 12, padding: isMobile ? '16px 8px' : '16px 12px',
                        borderBottom: 'var(--border)', position: 'relative', borderRadius: 'var(--r-md)',
                        margin: '4px 0', transition: 'background .15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                      <div onClick={() => toggleTaskStatus(task.id)}
                        style={{
                          width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 2,
                          border: isTaskDone(task) ? 'none' : '2px solid var(--line)',
                          background: isTaskDone(task) ? 'var(--green)' : 'var(--bg-elevated)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', transition: 'all .2s', fontSize: 12, color: '#fff'
                        }}>
                        {isTaskDone(task) && '✓'}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: isTaskDone(task) ? 'var(--muted)' : 'var(--text)', textDecoration: isTaskDone(task) ? 'line-through' : 'none', marginBottom: 4 }}>{task.title}</div>
                        {task.desc && <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginBottom: 8, lineHeight: 1.5 }}>{task.desc}</div>}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20, ...dlStyle(dl.cls), border: '1px solid transparent' }}>{dl.text}</span>
                          <span style={{ fontSize: 10.5, fontWeight: 600, padding: '2px 8px', borderRadius: 20, ...tagStyle(task.tag) }}>{task.tag}</span>
                          <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 20, ...priStyle(task.priority) }}>{(task.priority || 'med').toUpperCase()}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 4, opacity: isMobile ? 1 : 0, transition: 'opacity .2s' }} className="task-actions">
                        <button onClick={() => openEditTaskModal(task)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 4 }} title="Edit">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => deleteTask(task.id)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', padding: 4 }} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div style={{ display: 'flex', gap: 10, padding: '16px 20px', borderTop: 'var(--border)', background: 'var(--bg-glass)', flexDirection: isMobile ? 'column' : 'row' }}>
                <input value={quickAdd} onChange={e => setQuickAdd(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addQuickTask()}
                  placeholder="Quick task... Hit Enter"
                  style={{ ...formInput, flex: 1, height: 38 }} />
                <button onClick={addQuickTask} style={{ ...primaryBtn, height: 38, width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}>Add</button>
              </div>
            </div>

            {/* ATTENDANCE HISTORY */}
            <div style={card}>
              <div style={cardHdr}>
                <div>
                  <div style={cardTitle}>Attendance History</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Monthly overview & details</div>
                </div>
                <button onClick={() => showToast('Exporting...', 'info')} style={outlineBtn}>
                  <Download size={14} /> Export
                </button>
              </div>

              <div style={{ display: 'flex', borderBottom: 'var(--border)', background: 'var(--bg-elevated)', gap: 4, padding: '0 12px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                {[['heatmap', 'Pattern'], ['log', 'Daily Log'], ['stats', 'Analytics']].map(([key, label]) => (
                  <div key={key} onClick={() => setAttTab(key)}
                    style={{
                      padding: '12px 16px', fontSize: 13, fontWeight: attTab === key ? 700 : 500,
                      color: attTab === key ? 'var(--accent)' : 'var(--text-dim)', cursor: 'pointer',
                      borderBottom: attTab === key ? '2px solid var(--accent)' : '2px solid transparent',
                      transition: 'all .25s', flexShrink: 0
                    }}>{label}</div>
                ))}
              </div>

              <div style={{ padding: '20px' }}>
                {attTab === 'heatmap' && <Heatmap data={heatmap} />}
                {attTab === 'log' && (
                  <div style={{ maxHeight: 300, overflowY: 'auto', paddingRight: 4 }}>
                    {history.map((a, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 10px',
                        borderBottom: i < history.length - 1 ? 'var(--line) dashed 1px' : 'none',
                        background: i % 2 === 0 ? 'var(--bg-elevated)' : 'transparent', borderRadius: 'var(--r-sm)',
                        marginBottom: 4
                      }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: a.status === 'p' ? 'var(--green)' : a.status === 'l' ? 'var(--amber)' : 'var(--red)', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{a.date}</div>
                          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{a.report}</div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{a.time}</div>
                          <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>{a.status === 'p' ? 'Present' : a.status === 'l' ? 'Late' : 'Absent'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {attTab === 'stats' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div style={{ textAlign: 'center', padding: 16, background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--green)' }}>{stats.present}</div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginTop: 4 }}>On Time</div>
                      </div>
                      <div style={{ textAlign: 'center', padding: 16, background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--amber)' }}>{stats.late}</div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginTop: 4 }}>Delayed</div>
                      </div>
                    </div>
                    <div>
                      <PB label="Attendance Rate" value={attendRate} color="var(--green)" />
                      <PB label="Punctuality" value={punctRate} color="var(--blue)" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ACTIVITY TIMELINE */}
            <div style={card}>
              <div style={cardHdr}><div style={cardTitle}>Activity Timeline</div></div>
              <div style={{ padding: '20px' }}>
                {[
                  { icon: '✅', title: 'Submitted attendance', meta: `Today · ${history[0]?.time || '—'}` },
                  { icon: '📋', title: 'Task completed', meta: 'Yesterday · Sprint Review' },
                  { icon: '🎯', title: 'Onboarding complete', meta: `${emp.joining} · Registered` },
                ].map((item, i, arr) => (
                  <div key={i} style={{ display: 'flex', gap: 16, paddingBottom: i < arr.length - 1 ? 20 : 0, position: 'relative' }}>
                    {i < arr.length - 1 && <div style={{ position: 'absolute', left: 16, top: 32, bottom: 0, width: 2, background: 'var(--line)' }} />}
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, zIndex: 1, border: 'var(--border)' }}>{item.icon}</div>
                    <div style={{ paddingTop: 4 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{item.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{item.meta}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>{/* /left */}

          {/* RIGHT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* PERFORMANCE SCORE */}
            <div style={card}>
              <div style={cardHdr}>
                <div style={cardTitle}>Performance Score</div>
                <select style={{ ...formInput, width: 'auto', height: 32, padding: '0 8px', fontSize: 11 }}>
                  <option>March 2026</option>
                  <option>February 2026</option>
                </select>
              </div>
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: 24, marginBottom: 20 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: isMobile ? 36 : 48, fontWeight: 900, color: scoreColor(parseInt(emp.score) || stats.score || 0), letterSpacing: -2, lineHeight: 1 }}>{parseInt(emp.score) || stats.score || 0}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Current Rating</div>
                  </div>
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                    <PerfRing score={stats.score} size={isMobile ? 80 : 90} stroke={10} />
                  </div>
                  {!isMobile && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ padding: '4px 10px', borderRadius: 'var(--r-sm)', background: 'var(--green-dim)', color: 'var(--green)', fontSize: 12, fontWeight: 800 }}>↑ +4</div>
                      <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>Growth</div>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <PB label="Attendance" value={attendRate} color="var(--green)" />
                  <PB label="Punctuality" value={punctRate} color="var(--blue)" />
                  <PB label="Tasks" value={taskRate} color="var(--accent)" />
                </div>
              </div>
            </div>

            {/* MENTOR */}
            <div style={card}>
              <div style={cardHdr}>
                <div>
                  <div style={cardTitle}>Mentor Support</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Guidance & private feedback</div>
                </div>
                <button onClick={isHR ? () => setShowMentorModal(true) : () => showToast('Only HR can change mentors', 'info')} style={outlineBtn}>Change</button>
              </div>

              {mentorEmp ? (
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                    <div style={{
                      width: 54, height: 54, borderRadius: 'var(--r-md)', background: `linear-gradient(135deg, ${mentorEmp.color || 'var(--accent)'}, var(--accent))`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#fff', border: 'var(--border)'
                    }}>{mentorEmp.name?.substring(0, 1)?.toUpperCase() || 'M'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{mentorEmp.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>{mentorEmp.expertise}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                    {[
                      { id: 'wa', label: 'WA', icon: '💬' },
                      { id: 'telegram', label: 'TG', icon: '✈️' },
                      { id: 'email', label: 'Email', icon: '✉️' }
                    ].map(ch => (
                      <button key={ch.id} onClick={() => { setMsgChannel(ch.id); setMsgText(`Hi ${mentorEmp.name}, question about ${emp.name}: `); setShowMsgModal(true); }}
                        style={{ ...outlineBtn, flex: 1, padding: 8 }}>{ch.icon} {ch.label}</button>
                    ))}
                  </div>
                  <div style={{ borderTop: '1px solid var(--line)', paddingTop: 16, marginTop: 4 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MessageSquare size={12} /> Recent Feedback
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {empNotes.map((note, i) => (
                        <div key={i} style={{
                          padding: '12px', borderRadius: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                          display: 'flex', gap: 12, position: 'relative', overflow: 'hidden'
                        }}>
                          <div style={{ width: 4, height: '100%', position: 'absolute', left: 0, top: 0, background: note.type === 'green' ? 'var(--green)' : note.type === 'amber' ? 'var(--amber)' : 'var(--blue)' }} />
                          <span style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>{note.text}</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setShowNoteModal(true)}
                      style={{ ...outlineBtn, width: '100%', borderStyle: 'dashed', marginTop: 16, justifyContent: 'center' }}>+ Add Private Note</button>
                  </div>
                </div>
              ) : (
                <div style={{ padding: 24, textAlign: 'center' }}>
                  <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 16 }}>No external mentor assigned from directory.</div>
                  {isHR && <button onClick={() => setShowMentorModal(true)} style={{ ...primaryBtn, width: '100%', justifyContent: 'center' }}>Assign Mentor</button>}
                </div>
              )}
            </div>

            {/* PROFILE INFO */}
            <div style={card}>
              <div style={cardHdr}>
                <div style={cardTitle}>Personal Details</div>
                <button onClick={() => setShowEditModal(true)} style={outlineBtn}><Edit2 size={14} /></button>
              </div>
              <div style={{ padding: '8px 0' }}>
                {[
                  ['Joining Date', emp.joining || '—', 'Calendar'],
                  ['Email Address', emp.email || '—', 'Mail'],
                  ['Primary Dept', emp.dept || '—', 'Building2'],
                  ['Current CTC', `₹${Number(emp.salary || 0).toLocaleString('en-IN')}`, 'Wallet'],
                  ['Telegram Chat ID', emp.telegramChatId || '—', 'MessageSquare']
                ].map(([l, v, icon]) => {
                  const IconMap = { Calendar, Mail, Building2, Wallet: Download, MessageSquare }
                  const Icon = IconMap[icon] || Users
                  return (
                    <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', borderBottom: '1px solid var(--line)' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                        <Icon size={14} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>{(l || '').toUpperCase()}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>{v}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* WARNING LOG */}
            <div style={card}>
              <div style={cardHdr}>
                <div style={cardTitle}>Disciplinary Log</div>
                <button onClick={() => { setMsgText(`⚠️ Official Formal Warning Issued:\n\nSeverity: [Red/Amber]\nReason: `); setShowMsgModal(true); }}
                  style={{ ...outlineBtn, color: 'var(--red)', borderColor: 'var(--red-dim)' }}>Issue Warning</button>
              </div>
              <div style={{ padding: '20px' }}>
                {(!emp.warnings || emp.warnings.length === 0) ? (
                  <div style={{ textAlign: 'center', padding: '10px 0', color: 'var(--muted)', fontSize: 13 }}>
                    <div style={{ display: 'inline-flex', padding: '8px 16px', borderRadius: '100px', background: 'var(--green-dim)', color: 'var(--green)', border: '1px solid var(--green)', fontWeight: 600, fontSize: '13px', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <CheckCircle2 size={16} /> Excellent Record
                    </div>
                    <div>No formal warnings issued.</div>
                  </div>
                ) : emp.warnings.map((w, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 12, padding: 12, borderRadius: 'var(--r-md)', marginBottom: 10,
                    background: w.severity === 'red' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    border: `1px solid ${w.severity === 'red' ? 'var(--red)' : 'var(--amber)'}`
                  }}>
                    <div style={{ fontSize: 18 }}>{w.severity === 'red' ? '🚨' : '⚠️'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: w.severity === 'red' ? 'var(--red)' : 'var(--amber)' }}>{w.title}</div>
                      <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 4 }}>{w.reason || 'No specific reason provided.'}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6, fontFamily: 'var(--font-mono)' }}>{w.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* LEAVE SUMMARY */}
            <div style={card}>
              <div style={cardHdr}><div style={cardTitle}>Leave Tracker</div></div>
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
                  {[
                    ['Allowed', '3', 'var(--green)'],
                    ['Taken', takenCount, takenCount > 3 ? 'var(--red)' : 'var(--accent)'],
                    ['Balance', leaveLeft, 'var(--amber)'],
                  ].map(([label, val, color]) => (
                    <div key={label} style={{ textAlign: 'center', padding: '12px 8px', background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)', border: 'var(--border)' }}>
                      <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: isMobile ? 18 : 20, fontWeight: 900, color: color }}>{val}</div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setShowLeaveModal(true)} style={{ ...outlineBtn, width: '100%', borderStyle: 'dashed' }}>
                  + Log External Leave
                </button>
              </div>
            </div>

          </div>{/* /right */}
        </div>{/* /grid */}
      </div>

      {/* ── MODALS (Themed) ── */}
      <Modal isOpen={showTaskModal} onClose={() => { setShowTaskModal(false); setTaskEditingId(null); setNewTask({ title: '', desc: '', deadline: '', priority: 'high', tag: 'Development' }); }} 
        title={taskEditingId ? "Edit Task" : "New Task"} 
        subtitle={taskEditingId ? "Update task details" : "Assign a task with deadline"}
        footer={<><button onClick={() => { setShowTaskModal(false); setTaskEditingId(null); }} style={outlineBtn}>Cancel</button><button onClick={addTaskFromModal} style={primaryBtn}>{taskEditingId ? 'Update Task' : 'Create Task'}</button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div><label style={formLabel}>Title</label><input value={newTask.title} onChange={e => setNewTask(t => ({ ...t, title: e.target.value }))} style={formInput} /></div>
          <div><label style={formLabel}>Description</label><textarea rows={3} value={newTask.desc} onChange={e => setNewTask(t => ({ ...t, desc: e.target.value }))} style={{ ...formInput, resize: 'none' }} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
            <div><label style={formLabel}>Deadline</label><input type="date" value={newTask.deadline} onChange={e => setNewTask(t => ({ ...t, deadline: e.target.value }))} style={formInput} /></div>
            <div><label style={formLabel}>Priority</label>
              <select value={newTask.priority} onChange={e => setNewTask(t => ({ ...t, priority: e.target.value }))} style={formInput}>
                <option value="high">High</option><option value="med">Medium</option><option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showNoteModal} onClose={() => setShowNoteModal(false)} title="Add Note" subtitle="Private feedback for this employee"
        footer={<><button onClick={() => setShowNoteModal(false)} style={outlineBtn}>Cancel</button><button onClick={addNote} style={primaryBtn}>Save Note</button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div><label style={formLabel}>Note Content</label><textarea rows={4} value={newNote.text} onChange={e => setNewNote(n => ({ ...n, text: e.target.value }))} style={{ ...formInput, resize: 'none' }} /></div>
          <div><label style={formLabel}>Category</label>
            <select value={newNote.type} onChange={e => setNewNote(n => ({ ...n, type: e.target.value }))} style={formInput}>
              <option value="green">Positive</option><option value="amber">Caution</option><option value="blue">Observation</option>
            </select>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showMentorModal} onClose={() => setShowMentorModal(false)} title="Assign External Mentor"
        footer={<button onClick={() => setShowMentorModal(false)} style={outlineBtn}>Close</button>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 400, overflowY: 'auto', paddingRight: 4 }}>
          {mentors.map(m => (
            <div key={m.id} onClick={async () => {
              try {
                await api.assignMentor(activeId, m.id);
                showToast('Mentor Assigned!', 'success');
                setShowMentorModal(false);
                refresh();
              } catch (err) {
                showToast('Failed to assign mentor', 'error');
              }
            }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 'var(--r-md)',
                border: emp.mentorId === m.id ? '2px solid var(--accent)' : 'var(--border)',
                background: emp.mentorId === m.id ? 'var(--bg-elevated)' : 'transparent',
                cursor: 'pointer', transition: 'all .2s'
              }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--r-sm)', background: `linear-gradient(135deg, ${m.color || 'var(--accent)'}, var(--accent))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff' }}>{m.name?.substring(0, 1)?.toUpperCase() || 'M'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{m.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{m.expertise || 'General'}</div>
              </div>
            </div>
          ))}
          {mentors.length === 0 && <div style={{ textAlign: 'center', padding: 20, color: 'var(--muted)' }}>No mentors found. Add them in the Mentors page.</div>}
        </div>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Profile"
        footer={<><button onClick={() => setShowEditModal(false)} style={outlineBtn}>Cancel</button><button onClick={saveProfile} style={primaryBtn}>Apply Changes</button></>}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
          {[
            ['name', 'Name'], ['role', 'Role'], ['dept', 'Dept'],
            ['tg', 'Telegram Handle'], ['telegramChatId', 'Telegram Chat ID'],
            ['wa', 'WhatsApp'], ['email', 'Email']
          ].map(([key, label]) => (
            <div key={key}>
              <label style={formLabel}>{label}</label>
              <input value={editFormData[key] || ''} onChange={e => setEditFormData(prev => ({ ...prev, [key]: e.target.value }))} style={formInput} />
            </div>
          ))}
        </div>
      </Modal>

      <Modal isOpen={showMsgModal} onClose={() => setShowMsgModal(false)} title="Direct Message" subtitle={`Send a message to ${emp.name}`}
        footer={<><button onClick={() => setShowMsgModal(false)} style={outlineBtn}>Cancel</button><button onClick={sendMessage} style={primaryBtn}>{msgChannel === 'wa' ? 'Open WhatsApp' : 'Send Message'}</button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { id: 'telegram', label: 'Telegram', icon: '✈️' },
              { id: 'wa', label: 'WhatsApp', icon: '💬' }
            ].map(ch => (
              <button key={ch.id} onClick={() => setMsgChannel(ch.id)}
                style={{
                  ...outlineBtn, flex: 1, padding: 10,
                  borderColor: msgChannel === ch.id ? 'var(--accent)' : 'var(--line)',
                  background: msgChannel === ch.id ? 'var(--accent-glow)' : 'transparent',
                  fontWeight: msgChannel === ch.id ? 700 : 500
                }}>{ch.icon} {ch.label}</button>
            ))}
          </div>
          <div>
            <label style={formLabel}>Message via {msgChannel === 'wa' ? 'WhatsApp' : 'Telegram'}</label>
            <textarea rows={5} value={msgText} onChange={e => setMsgText(e.target.value)} placeholder="Type your message here..." style={{ ...formInput, resize: 'none' }} />
            {msgChannel === 'wa' && !emp.wa && (
              <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 8 }}>⚠️ No WhatsApp number found. This will fail.</div>
            )}
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>This will be delivered to the employee's registered accounts.</div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showTeamLeaderModal} onClose={() => setShowTeamLeaderModal(false)} title="Assign Team Leader" subtitle="Select a senior or lead to oversee this employee"
        footer={<button onClick={() => setShowTeamLeaderModal(false)} style={outlineBtn}>Close</button>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 400, overflowY: 'auto', paddingRight: 4 }}>
          {employees.filter(e => e.id !== activeId).map(e => (
            <div key={e.id} onClick={async () => {
              try {
                await api.assignTeamLeader(activeId, e.id);
                showToast(`Team Leader Assigned: ${e.name}`, 'success');
                setShowTeamLeaderModal(false);
                refresh();
              } catch (err) {
                showToast('Failed to assign team leader', 'error');
              }
            }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 'var(--r-md)',
                border: emp.teamLeaderId === e.id ? '2px solid var(--accent)' : 'var(--border)',
                background: emp.teamLeaderId === e.id ? 'var(--bg-elevated)' : 'transparent',
                cursor: 'pointer', transition: 'all .2s'
              }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--r-sm)', background: e.color || 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff' }}>{e.av || e.name?.substring(0, 2)?.toUpperCase() || '??'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{e.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{e.role} • {e.dept}</div>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      <Modal isOpen={showLeaveModal} onClose={() => setShowLeaveModal(false)} title="Log External Leave" subtitle="Directly record an approved leave"
        footer={<><button onClick={() => setShowLeaveModal(false)} style={outlineBtn}>Cancel</button><button onClick={handleLogLeave} style={primaryBtn}>Log Leave</button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={formLabel}>Leave Type</label>
            <select value={newLeave.type} onChange={e => setNewLeave(prev => ({ ...prev, type: e.target.value }))} style={formInput}>
              <option value="casual">Casual Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="vacation">Vacation</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
            <div><label style={formLabel}>Start Date</label><input type="date" value={newLeave.startDate} onChange={e => setNewLeave(prev => ({ ...prev, startDate: e.target.value }))} style={formInput} /></div>
            <div><label style={formLabel}>End Date</label><input type="date" value={newLeave.endDate} onChange={e => setNewLeave(prev => ({ ...prev, endDate: e.target.value }))} style={formInput} /></div>
          </div>
          <div>
            <label style={formLabel}>Reason / Remarks</label>
            <textarea rows={3} value={newLeave.reason} onChange={e => setNewLeave(prev => ({ ...prev, reason: e.target.value }))} placeholder="Optional reason..." style={{ ...formInput, resize: 'none' }} />
          </div>
        </div>
      </Modal>

    </div>
  )
}
