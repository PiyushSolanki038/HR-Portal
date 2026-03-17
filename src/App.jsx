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
import MySalary from './pages/MySalary'
import MyProfile from './pages/MyProfile'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
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
                <Route path="/" element={<Dashboard />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/leaves" element={<Leaves />} />
                <Route path="/approvals" element={<Approvals />} />
                <Route path="/tasks" element={<TaskManager />} />
                <Route path="/communication" element={<Communication />} />
                <Route path="/mentors" element={<Mentors />} />
                <Route path="/hiring" element={<Hiring />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/employees" element={<Employees />} />
                <Route path="/employees/:id" element={<EmployeeProfile />} />
                <Route path="/finance-dashboard" element={<FinanceDashboard />} />
                <Route path="/payroll" element={<Payroll />} />
                <Route path="/salary" element={<Salary />} />
                <Route path="/deductions" element={<Deductions />} />
                <Route path="/tax-management" element={<TaxManagement />} />
                <Route path="/financial-reports" element={<FinancialReports />} />
                <Route path="/loans-advances" element={<LoansAdvances />} />
                <Route path="/finance-audit" element={<FinanceAudit />} />
                <Route path="/notifications" element={<NotificationsView />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/disciplinary" element={<DisciplinaryExcellence />} />
                <Route path="/audit" element={<Audit />} />
                <Route path="/settings" element={<Settings />} />
                
                {/* Employee Specific Routes */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/my-attendance" element={<MyAttendance />} />
                <Route path="/my-tasks" element={<MyTasks />} />
                <Route path="/my-leaves" element={<MyLeaves />} />
                <Route path="/my-salary" element={<MySalary />} />
                <Route path="/my-profile" element={<MyProfile />} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AppShell>
          </ProtectedRoute>
        } />
      </Routes>
    </>
  )
}
