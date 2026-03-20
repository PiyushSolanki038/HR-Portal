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

  const role = user?.role?.toLowerCase() || ''
  const isHR = role === 'hr manager' || role === 'admin'

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

  const workforce = employees.filter(e => e.role?.toLowerCase() !== 'admin')
  const stats = {
    total: workforce.length,
    present: attendance.filter(a => (a.status === 'p' || a.status === 'l') && workforce.some(e => e.id === a.empId)).length,
    late: attendance.filter(a => a.status === 'l' && workforce.some(e => e.id === a.empId)).length,
    absent: attendance.filter(a => a.status === 'a' && !onLeaveIds.has(a.empId?.toLowerCase()) && workforce.some(e => e.id === a.empId)).length,
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

  if (isHR) {
    return (
      <HRDashboardView 
        stats={stats}
        employees={workforce}
        attendance={attendance}
        leaves={leaves}
        onLeaveIds={onLeaveIds}
        onRemindAbsent={handleRemindAbsent}
        onRemindAllAbsent={handleRemindAllAbsent}
        onApproveLeave={handleApproveLeave}
        onRejectLeave={handleRejectLeave}
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
