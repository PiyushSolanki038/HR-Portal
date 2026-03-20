import { useState, useEffect } from 'react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import * as api from '../services/api'
import HRDashboardView from '../components/dashboard/HRDashboardView'
import EmployeeDashboardView from '../components/dashboard/EmployeeDashboardView'

const isTaskDone = (t) => t && (t.done === true || String(t.done).toLowerCase() === 'true')

export default function Dashboard() {
  const { employees, attendance, leaves, tasks, loading, error, refresh } = useData()
  const { user } = useAuth()
  const { showToast } = useToast()
  
  const [history, setHistory] = useState([])
  const [recentMessages, setRecentMessages] = useState([])
  const [systemHealth, setSystemHealth] = useState({ status: 'loading', sheets: 'unknown', latency: '0ms' })

  const role = user?.role?.toLowerCase() || ''
  const isHR = role === 'hr manager' || role === 'admin'

  useEffect(() => {
    if (isHR) {
      api.getSystemHealth().then(setSystemHealth).catch(() => setSystemHealth({ status: 'degraded', sheets: 'error', latency: 'N/A' }))
      const interval = setInterval(() => {
        api.getSystemHealth().then(setSystemHealth).catch(() => setSystemHealth({ status: 'degraded', sheets: 'error', latency: 'N/A' }))
      }, 30000) // Every 30s
      return () => clearInterval(interval)
    }
  }, [isHR])

  useEffect(() => {
    if (!isHR && user?.id) {
      api.getEmployeeAttendance(user.id).then(setHistory).catch(console.error)
      api.getUserMessages(user.id).then(setRecentMessages).catch(console.error)
    }
  }, [isHR, user?.id])

  if (loading) return <LoadingSpinner />
  
  if (error || (isHR && employees.length === 0)) {
    return (
      <div className="empty-state">
        <div style={{ background: 'var(--red-dim)', color: 'var(--red)', padding: '20px', borderRadius: '16px', maxWidth: '400px' }}>
          <h3>Data Unavailable</h3>
          <p>{error || 'No employee data found. This might be a connection issue with Google Sheets.'}</p>
          <button className="btn btn-primary" onClick={() => refresh()} style={{ marginTop: '16px' }}>
            Retry Loading Data
          </button>
        </div>
      </div>
    )
  }

  const today = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD (safe local)
  const onLeaveEmps = (leaves || []).filter(l => {
    const isApproved = l.status?.toLowerCase() === 'approved' || l.status?.includes('day') || l.approvedBy
    return isApproved && today >= l.startDate && today <= (l.endDate || l.startDate)
  })
  const onLeaveIds = new Set(onLeaveEmps.map(l => l.empId?.toLowerCase()))

  const workforce = employees.filter(e => {
    const r = e.role?.toLowerCase() || ''
    const n = e.name?.toLowerCase() || ''
    const isExcluded = 
      r.includes('admin') || 
      r.includes('head') || 
      r.includes('owner') ||
      r.includes('hr manager') ||
      n.includes('shreyansh') || 
      n.includes('ankur');
    return !isExcluded;
  })

  const todayAttendance = attendance.filter(a => workforce.some(e => e.id === a.empId))
  const presentToday = workforce.filter(e => 
    todayAttendance.some(a => a.empId === e.id && (a.status === 'p' || a.status === 'l'))
  ).map(e => {
    const rec = todayAttendance.find(a => a.empId === e.id)
    return { ...e, time: rec?.time || '--:--', status: rec?.status }
  })

  const remainingToday = workforce.filter(e => 
    !todayAttendance.some(a => a.empId === e.id && (a.status === 'p' || a.status === 'l' || a.status === 'a')) &&
    !onLeaveIds.has(e.id.toLowerCase())
  )

  const stats = {
    total: workforce.length,
    present: presentToday.length,
    late: presentToday.filter(p => p.status === 'l').length,
    absent: attendance.filter(a => a.status === 'a' && !onLeaveIds.has(a.empId?.toLowerCase()) && workforce.some(e => e.id === a.empId)).length,
    pending: remainingToday.length,
    onLeave: workforce.filter(e => onLeaveIds.has(e.id?.toLowerCase())).length,
    pendingLeaves: leaves.filter(l => l.status?.toLowerCase() === 'pending').length,
  }

  const handleRemindAbsent = async (empId) => {
    try {
      await api.remindAbsent({ empId, actor: user.id })
      showToast('Reminder sent successfully', 'success')
    } catch (err) {
      showToast('Failed to send reminder', 'error')
    }
  }

  const handleRemindAllAbsent = async () => {
    const absentees = attendance.filter(a => a.status === 'a')
    if (absentees.length === 0) {
      showToast('No absentees to remind', 'info')
      return
    }
    try {
      showToast(`Sending ${absentees.length} reminders...`, 'info')
      await Promise.all(absentees.map(a => api.remindAbsent({ empId: a.empId, actor: user.id })))
      showToast('All reminders sent successfully', 'success')
    } catch (err) {
      showToast('Failed to send some reminders', 'error')
    }
  }

  const handleApproveLeave = async (id) => {
    try {
      await api.approveLeave(id, { actor: user.id })
      showToast('Leave approved', 'success')
      refresh()
    } catch (err) {
      showToast('Approval failed', 'error')
    }
  }

  const handleRejectLeave = async (id) => {
    try {
      await api.rejectLeave(id, { actor: user.id })
      showToast('Leave rejected', 'info')
      refresh()
    } catch (err) {
      showToast('Rejection failed', 'error')
    }
  }

  const handleStartBot = () => {
    window.open('https://t.me/your_bot_username', '_blank')
  }

  const employeeStats = {
    attendance: history.length,
    onTime: history.filter(h => h.status === 'p').length,
    late: history.filter(h => h.status === 'l').length,
    leavesUsed: leaves.filter(l => l.empId === user?.id && l.status === 'approved').length,
    leavesTotal: 3, 
    pendingTasks: tasks.filter(t => t.assignedTo === user?.id && !isTaskDone(t)).length,
    dueToday: tasks.filter(t => t.assignedTo === user?.id && !isTaskDone(t) && t.deadline === new Date().toISOString().split('T')[0]).length
  }


  const handleHRBroadcast = async (data) => {
    try {
      const res = await api.sendHRBroadcast({ ...data, actor: user.id })
      showToast(`Broadcast sent to ${res.sentCount} employees`, 'success')
      return true
    } catch (err) {
      showToast('Failed to send broadcast', 'error')
      return false
    }
  }

  // 7-day availability map
  const getAvailabilityForRange = (days = 7) => {
    const range = []
    for (let i = 0; i < days; i++) {
      const d = new Date()
      d.setDate(d.getDate() + i)
      const dateStr = d.toLocaleDateString('en-CA')
      const onLeaveCount = (leaves || []).filter(l => {
        const isApproved = l.status?.toLowerCase() === 'approved' || l.approvedBy
        return isApproved && dateStr >= l.startDate && dateStr <= (l.endDate || l.startDate)
      }).length
      range.push({ date: dateStr, onLeave: onLeaveCount, label: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }) })
    }
    return range
  }

  const handleSentimentSurvey = async () => {
    try {
      await api.sendHRBroadcast({ group: 'all', message: '📝 *QUICK CHECK-IN*\n\nHow is your work-life balance this week?\n\n1️⃣ Great\n2️⃣ Good\n3️⃣ Neutral\n4️⃣ Stressed\n5️⃣ Blocked\n\n_Reply with the number!_' })
      showToast('Sentiment survey triggered via Telegram', 'success')
    } catch (err) {
      showToast('Failed to trigger survey', 'error')
    }
  }

  // Sentiment Pulse: Heuristic based on task completion and lateness
  const sentimentStats = {
    positive: workforce.filter(e => parseFloat(e.score) > 85).length,
    neutral: workforce.filter(e => parseFloat(e.score) >= 70 && parseFloat(e.score) <= 85).length,
    concerned: workforce.filter(e => parseFloat(e.score) < 70).length,
    overall: workforce.length > 0 ? (workforce.reduce((acc, e) => acc + (parseFloat(e.score) || 0), 0) / workforce.length).toFixed(1) : 0
  }

  const leaderboard = [...workforce].sort((a,b) => (parseFloat(b.score) || 0) - (parseFloat(a.score) || 0))
  const availabilityMap = getAvailabilityForRange(7)

  if (isHR) {
    return (
      <HRDashboardView 
        stats={stats}
        employees={workforce}
        allEmployees={employees}
        attendance={attendance}
        leaves={leaves}
        onLeaveIds={onLeaveIds}
        presentToday={presentToday}
        remainingToday={remainingToday}
        systemHealth={systemHealth}
        availabilityMap={availabilityMap}
        leaderboard={leaderboard}
        sentimentStats={sentimentStats}
        onRemindAbsent={handleRemindAbsent}
        onRemindAllAbsent={handleRemindAllAbsent}
        onApproveLeave={handleApproveLeave}
        onRejectLeave={handleRejectLeave}
        onBroadcast={handleHRBroadcast}
        onSentimentSurvey={handleSentimentSurvey}
      />
    )
  }

  return (
    <EmployeeDashboardView 
      user={user}
      stats={employeeStats}
      tasks={tasks.filter(t => t.assignedTo === user?.id && !isTaskDone(t))}
      history={history}
      messages={recentMessages}
      leaves={leaves.filter(l => l.empId === user?.id)}
      onStartBot={handleStartBot}
    />
  )
}
