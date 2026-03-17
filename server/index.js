import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

import employeesRouter  from './routes/employees.js'
import attendanceRouter from './routes/attendance.js'
import leavesRouter     from './routes/leaves.js'
import tasksRouter      from './routes/tasks.js'
import hiringRouter     from './routes/hiring.js'
import payrollRouter from './routes/payroll.js'
import auditRouter from './routes/audit.js'
import messagesRouter from './routes/messages.js'
import mentorsRouter from './routes/mentors.js'
import authRouter from './routes/auth.js'
import governanceRouter from './routes/governance.js'

const app  = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())

app.use('/api/employees',  employeesRouter)
app.use('/api/attendance', attendanceRouter)
app.use('/api/leaves',     leavesRouter)
app.use('/api/tasks',      tasksRouter)
app.use('/api/hiring',     hiringRouter)
app.use('/api/payroll',    payrollRouter)
app.use('/api/audit',      auditRouter)
app.use('/api/messages',   messagesRouter)
app.use('/api/mentors',    mentorsRouter)
app.use('/api/auth',       authRouter)
app.use('/api/governance', governanceRouter)

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }))

// Test route to verify Sheets connection
import { readSheet } from './sheets.js'
app.get('/api/test-sheets', async (req, res) => {
  try {
    console.log('[TEST_SHEETS] Attempting to read Employees sheet...')
    const data = await readSheet('Employees')
    if (data.length > 0) {
      res.json({ success: true, count: data.length, firstRow: data[0] })
    } else {
      res.json({ success: true, count: 0, message: 'Sheet is empty or tab "Employees" not found' })
    }
  } catch (err) {
    console.error('[TEST_SHEETS_ERROR]:', err.message)
    res.status(500).json({ error: err.message, stack: err.stack })
  }
})

app.listen(PORT, () => console.log(`SISWIT API running on port ${PORT}`))
