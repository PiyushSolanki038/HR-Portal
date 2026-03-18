import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import AppShell from './components/layout/AppShell'
import Toast from './components/ui/Toast'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Attendance from './pages/Attendance'
import Leaves from './pages/Leaves'
import Approvals from './pages/Approvals'
import Communication from './pages/Communication'
import Hiring from './pages/Hiring'
import Onboarding from './pages/Onboarding'
import Documents from './pages/Documents'
import Employees from './pages/Employees'
import EmployeeProfile from './pages/EmployeeProfile'
import Payroll from './pages/Payroll'
import Salary from './pages/Salary'
import Deductions from './pages/Deductions'
import FinanceDashboard from './pages/FinanceDashboard'
import TaxManagement from './pages/TaxManagement'
import FinancialReports from './pages/FinancialReports'
import LoansAdvances from './pages/LoansAdvances'
import FinanceAudit from './pages/FinanceAudit'
import NotificationsView from './pages/NotificationsView'
import Analytics from './pages/Analytics'
import Audit from './pages/Audit'
import Settings from './pages/Settings'
import Mentors from './pages/Mentors'
import DisciplinaryExcellence from './pages/DisciplinaryExcellence'
import TaskManager from './pages/TaskManager'

// Employee Portal Pages
import MyAttendance from './pages/MyAttendance'
import MyTasks from './pages/MyTasks'
import MyLeaves from './pages/MyLeaves'
import MyDeductions from './pages/MyDeductions'
import MyProfile from './pages/MyProfile'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function RoleGate({ children, allowedRoles }) {
  const { user } = useAuth()
  const role = user?.role || 'Employee'
  
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />
  }
  
  return children
}

export default function App() {
  const { isAuthenticated } = useAuth()

  return (
    <>
      <Toast />
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" replace /> : <Login />
        } />
        <Route path="/*" element={
          <ProtectedRoute>
            <AppShell>
              <Routes>
                <Route path="/" element={
                  <RoleGate allowedRoles={['Admin', 'HR Manager', 'Finance', 'Employee']}>
                    <Dashboard />
                  </RoleGate>
                } />
                <Route path="/attendance" element={
                  <RoleGate allowedRoles={['Admin', 'HR Manager']}>
                    <Attendance />
                  </RoleGate>
                } />
                <Route path="/leaves" element={
                  <RoleGate allowedRoles={['Admin', 'HR Manager']}>
                    <Leaves />
                  </RoleGate>
                } />
                <Route path="/approvals" element={
                  <RoleGate allowedRoles={['Admin', 'HR Manager']}>
                    <Approvals />
                  </RoleGate>
                } />
                <Route path="/tasks" element={
                  <RoleGate allowedRoles={['Admin', 'HR Manager']}>
                    <TaskManager />
                  </RoleGate>
                } />
                <Route path="/communication" element={<Communication />} />
                <Route path="/mentors" element={
                  <RoleGate allowedRoles={['Admin', 'HR Manager']}>
                    <Mentors />
                  </RoleGate>
                } />
                <Route path="/hiring" element={
                  <RoleGate allowedRoles={['Admin', 'HR Manager']}>
                    <Hiring />
                  </RoleGate>
                } />
                <Route path="/onboarding" element={
                  <RoleGate allowedRoles={['Admin', 'HR Manager']}>
                    <Onboarding />
                  </RoleGate>
                } />
                <Route path="/documents" element={
                  <RoleGate allowedRoles={['Admin', 'HR Manager']}>
                    <Documents />
                  </RoleGate>
                } />
                <Route path="/employees" element={
                  <RoleGate allowedRoles={['Admin', 'HR Manager']}>
                    <Employees />
                  </RoleGate>
                } />
                <Route path="/employees/:id" element={
                  <RoleGate allowedRoles={['Admin', 'HR Manager']}>
                    <EmployeeProfile />
                  </RoleGate>
                } />
                
                {/* Finance Routes */}
                <Route path="/finance-dashboard" element={
                  <RoleGate allowedRoles={['Admin', 'Finance']}>
                    <FinanceDashboard />
                  </RoleGate>
                } />
                <Route path="/payroll" element={
                  <RoleGate allowedRoles={['Admin', 'Finance']}>
                    <Payroll />
                  </RoleGate>
                } />
                <Route path="/salary" element={
                  <RoleGate allowedRoles={['Admin', 'Finance']}>
                    <Salary />
                  </RoleGate>
                } />
                <Route path="/deductions" element={
                  <RoleGate allowedRoles={['Admin', 'Finance', 'HR Manager']}>
                    <Deductions />
                  </RoleGate>
                } />
                <Route path="/tax-management" element={
                  <RoleGate allowedRoles={['Admin', 'Finance']}>
                    <TaxManagement />
                  </RoleGate>
                } />
                <Route path="/financial-reports" element={
                  <RoleGate allowedRoles={['Admin', 'Finance']}>
                    <FinancialReports />
                  </RoleGate>
                } />
                <Route path="/loans-advances" element={
                  <RoleGate allowedRoles={['Admin', 'Finance']}>
                    <LoansAdvances />
                  </RoleGate>
                } />
                <Route path="/finance-audit" element={
                  <RoleGate allowedRoles={['Admin', 'Finance']}>
                    <FinanceAudit />
                  </RoleGate>
                } />

                <Route path="/notifications" element={<NotificationsView />} />
                <Route path="/analytics" element={
                  <RoleGate allowedRoles={['Admin', 'HR Manager']}>
                    <Analytics />
                  </RoleGate>
                } />
                <Route path="/disciplinary" element={
                  <RoleGate allowedRoles={['Admin', 'HR Manager']}>
                    <DisciplinaryExcellence />
                  </RoleGate>
                } />
                <Route path="/audit" element={
                  <RoleGate allowedRoles={['Admin', 'HR Manager']}>
                    <Audit />
                  </RoleGate>
                } />
                <Route path="/settings" element={
                  <RoleGate allowedRoles={['Admin']}>
                    <Settings />
                  </RoleGate>
                } />
                
                {/* Employee Specific Routes */}
                <Route path="/dashboard" element={<Navigate to="/" replace />} />
                <Route path="/my-attendance" element={
                  <RoleGate allowedRoles={['Employee']}>
                    <MyAttendance />
                  </RoleGate>
                } />
                <Route path="/my-tasks" element={
                  <RoleGate allowedRoles={['Employee']}>
                    <MyTasks />
                  </RoleGate>
                } />
                <Route path="/my-leaves" element={
                  <RoleGate allowedRoles={['Employee']}>
                    <MyLeaves />
                  </RoleGate>
                } />
                <Route path="/my-deductions" element={
                  <RoleGate allowedRoles={['Employee']}>
                    <MyDeductions />
                  </RoleGate>
                } />
                <Route path="/my-profile" element={
                  <RoleGate allowedRoles={['Employee']}>
                    <MyProfile />
                  </RoleGate>
                } />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AppShell>
          </ProtectedRoute>
        } />
      </Routes>
    </>
  )
}
