const BASE = '/api'

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

// Auth
export const loginUser              = (data)      => req('/auth/login', { method:'POST', body:JSON.stringify(data) })
export const changePassword         = (data)      => req('/auth/change-password', { method:'POST', body:JSON.stringify(data) })
export const setTempPassword        = (data)      => req('/auth/set-temp-password', { method:'POST', body:JSON.stringify(data) })
export const sendCredentialsToAll   = ()           => req('/auth/send-credentials-all', { method:'POST' })
export const sendCredentialsSingle  = (data)       => req('/auth/send-credentials-single', { method:'POST', body:JSON.stringify(data) })

// Employees
export const getEmployees       = ()           => req('/employees')
export const getEmployee        = (id)         => req(`/employees/${id}`)
export const addEmployee        = (data)       => req('/employees', { method:'POST', body:JSON.stringify(data) })
export const updateEmployee     = (id, data)   => req(`/employees/${id}`, { method:'PATCH', body:JSON.stringify(data) })
export const deleteEmployee     = (id)         => req(`/employees/${id}`, { method:'DELETE' })
export const assignTeamLeader   = (empId, teamLeaderId) => req('/employees/assign-tl', { method:'POST', body:JSON.stringify({ empId, teamLeaderId }) })

// Attendance
export const getTodayAttendance  = ()          => req('/attendance/today')
export const getAttendanceSummary = ()         => req('/attendance/summary')
export const getEmployeeAttendance = (empId)   => req(`/attendance/employee/${empId}`)
export const markAttendance        = (data)    => req('/attendance/mark', { method:'POST', body:JSON.stringify(data) })
export const getWeeklyGrid       = ()          => req('/attendance/weekly')

// Leaves
export const getLeaves           = ()          => req('/leaves')
export const getPendingLeaves    = ()          => req('/leaves/pending')
export const applyLeave          = (data)      => req('/leaves/apply',   { method:'POST', body:JSON.stringify(data) })
export const logExternalLeave     = (data)      => req('/leaves/log-external', { method:'POST', body:JSON.stringify(data) })
export const approveLeave        = (id, data)  => req(`/leaves/${id}/approve`, { method:'POST', body:JSON.stringify(data) })
export const rejectLeave         = (id, data)  => req(`/leaves/${id}/reject`,  { method:'POST', body:JSON.stringify(data) })

// Tasks
export const getEmployeeTasks    = (empId)     => req(`/tasks/employee/${empId}`)
export const getTasks            = ()          => req('/tasks')
export const addTask             = (data)      => req('/tasks', { method:'POST', body:JSON.stringify(data) })
export const toggleTask          = (id)        => req(`/tasks/${id}/toggle`, { method:'PATCH' })
export const remindTask          = (id)        => req(`/tasks/${id}/remind`, { method:'POST' })

// Hiring
export const getCandidates       = ()          => req('/hiring')
export const addCandidate        = (data)      => req('/hiring', { method:'POST', body:JSON.stringify(data) })
export const updateCandidateStage = (id, stage) => req(`/hiring/${id}/stage`, { method:'PATCH', body:JSON.stringify({ stage }) })

// Payroll
export const getPayroll          = ()          => req('/payroll')
export const getEmployeeSalaries = (empId)     => req(`/payroll/employee/${empId}`)
export const dispatchSlip        = (empId, data) => req(`/payroll/dispatch/${empId}`, { method:'POST', body:JSON.stringify(data) })
export const dispatchAllSlips    = (data)      => req('/payroll/dispatch-all', { method:'POST', body:JSON.stringify(data) })

// Messages
export const sendDirectMessage   = (data)      => req('/messages/direct',       { method:'POST', body:JSON.stringify(data) })
export const sendBroadcast       = (data)      => req('/messages/broadcast',     { method:'POST', body:JSON.stringify(data) })
export const remindAbsent        = (data)      => req('/messages/remind-absent', { method:'POST', body:JSON.stringify(data) })
export const getPortalHistory    = (userId, otherId) => req(`/messages/history/${otherId}?userId=${userId}`)
export const getUserMessages     = (userId)          => req(`/messages/user/${userId}`)
export const sendPortalMessage   = (data)      => req('/messages/send', { method:'POST', body:JSON.stringify(data) })
export const getNotifications    = (userId)    => req(`/messages/notifications/${userId}`)
export const markNotificationRead = (id)       => req(`/messages/${id}/read`, { method:'PATCH' })

// Audit
export const getAuditLog         = ()          => req('/audit')

// Mentors
export const getMentors          = ()          => req('/mentors')
export const addMentor           = (data)      => req('/mentors', { method:'POST', body:JSON.stringify(data) })
export const assignMentor        = (empId, mentorId) => req('/mentors/assign', { method:'POST', body:JSON.stringify({ empId, mentorId }) })
export const deleteMentor        = (id)         => req(`/mentors/${id}`, { method:'DELETE' })

// Governance (Disciplinary/Excellence)
export const getGovernance       = ()          => req('/governance')
export const addGovernance       = (data)      => req('/governance', { method:'POST', body:JSON.stringify(data) })
export const deleteGovernance    = (id)        => req(`/governance/${id}`, { method:'DELETE' })
