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

app.listen(PORT, () => console.log(`SISWIT API running on port ${PORT}`))
