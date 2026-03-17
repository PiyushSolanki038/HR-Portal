const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

// Employees
export const getEmployees       = ()           => req('/api/employees')
export const getEmployee        = (id)         => req(`/api/employees/${id}`)
export const addEmployee        = (data)       => req('/api/employees', { method:'POST', body:JSON.stringify(data) })
export const updateEmployee     = (id, data)   => req(`/api/employees/${id}`, { method:'PATCH', body:JSON.stringify(data) })
export const deleteEmployee     = (id)         => req(`/api/employees/${id}`, { method:'DELETE' })
export const assignTeamLeader   = (empId, teamLeaderId) => req('/api/employees/assign-tl', { method:'POST', body:JSON.stringify({ empId, teamLeaderId }) })

// Attendance
export const getTodayAttendance  = ()          => req('/api/attendance/today')
export const getAttendanceSummary = ()         => req('/api/attendance/summary')
export const getEmployeeAttendance = (empId)   => req(`/api/attendance/employee/${empId}`)
export const markAttendance        = (data)    => req('/api/attendance/mark', { method:'POST', body:JSON.stringify(data) })
export const getWeeklyGrid       = ()          => req('/api/attendance/weekly')

// Leaves
export const getLeaves           = ()          => req('/api/leaves')
export const getPendingLeaves    = ()          => req('/api/leaves/pending')
export const applyLeave          = (data)      => req('/api/leaves/apply',   { method:'POST', body:JSON.stringify(data) })
export const logExternalLeave     = (data)      => req('/api/leaves/log-external', { method:'POST', body:JSON.stringify(data) })
export const approveLeave        = (id, data)  => req(`/api/leaves/${id}/approve`, { method:'POST', body:JSON.stringify(data) })
export const rejectLeave         = (id, data)  => req(`/api/leaves/${id}/reject`,  { method:'POST', body:JSON.stringify(data) })

// Tasks
export const getEmployeeTasks    = (empId)     => req(`/api/tasks/employee/${empId}`)
export const getTasks            = ()          => req('/api/tasks')
export const addTask             = (data)      => req('/api/tasks', { method:'POST', body:JSON.stringify(data) })
export const toggleTask          = (id)        => req(`/api/tasks/${id}/toggle`, { method:'PATCH' })
export const remindTask          = (id)        => req(`/api/tasks/${id}/remind`, { method:'POST' })

// Hiring
export const getCandidates       = ()          => req('/api/hiring')
export const addCandidate        = (data)      => req('/api/hiring', { method:'POST', body:JSON.stringify(data) })
export const updateCandidateStage = (id, stage) => req(`/api/hiring/${id}/stage`, { method:'PATCH', body:JSON.stringify({ stage }) })

// Payroll
export const getPayroll          = ()          => req('/api/payroll')
export const getEmployeeSalaries = (empId)     => req(`/api/payroll/employee/${empId}`)
export const dispatchSlip        = (empId, data) => req(`/api/payroll/dispatch/${empId}`, { method:'POST', body:JSON.stringify(data) })
export const dispatchAllSlips    = (data)      => req('/api/payroll/dispatch-all', { method:'POST', body:JSON.stringify(data) })

// Messages
export const sendDirectMessage   = (data)      => req('/api/messages/direct',       { method:'POST', body:JSON.stringify(data) })
export const sendBroadcast       = (data)      => req('/api/messages/broadcast',     { method:'POST', body:JSON.stringify(data) })
export const remindAbsent        = (data)      => req('/api/messages/remind-absent', { method:'POST', body:JSON.stringify(data) })
export const getPortalHistory    = (userId, otherId) => req(`/api/messages/history/${otherId}?userId=${userId}`)
export const getUserMessages     = (userId)          => req(`/api/messages/user/${userId}`)
export const sendPortalMessage   = (data)      => req('/api/messages/send', { method:'POST', body:JSON.stringify(data) })
export const getNotifications    = (userId)    => req(`/api/messages/notifications/${userId}`)
export const markNotificationRead = (id)       => req(`/api/messages/${id}/read`, { method:'PATCH' })

// Audit
export const getAuditLog         = ()          => req('/api/audit')

// Mentors
export const getMentors          = ()          => req('/api/mentors')
export const addMentor           = (data)      => req('/api/mentors', { method:'POST', body:JSON.stringify(data) })
export const assignMentor        = (empId, mentorId) => req('/api/mentors/assign', { method:'POST', body:JSON.stringify({ empId, mentorId }) })
export const deleteMentor        = (id)         => req(`/api/mentors/${id}`, { method:'DELETE' })

// Governance (Disciplinary/Excellence)
export const getGovernance       = ()          => req('/api/governance')
export const addGovernance       = (data)      => req('/api/governance', { method:'POST', body:JSON.stringify(data) })
export const deleteGovernance    = (id)        => req(`/api/governance/${id}`, { method:'DELETE' })
