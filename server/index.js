import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

// Support for __dirname in ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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
import reviewsRouter from './routes/reviews.js'
import { spawn } from 'child_process'

const app  = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())

// 1. API Routes (Check these first)
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
app.use('/api/reviews',    reviewsRouter)

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }))

// Test route to verify Sheets connection
import { readSheet, batchReadAllSheets, prewarmCache } from './sheets.js'

// Batch endpoint — returns ALL data in a single HTTP request
app.get('/api/data/all', async (req, res) => {
  try {
    const data = await batchReadAllSheets()
    res.json(data)
  } catch (err) {
    console.error('[API_ERROR] GET /api/data/all:', err.message)
    res.status(500).json({ error: 'Failed to batch-load data' })
  }
})
app.get('/api/test-sheets', async (req, res) => {
  try {
    console.log('[TEST_SHEETS] Attempting to read Employees sheet...')
    const data = await readSheet('Employees')
    const envSummary = {
      SHEET_ID: process.env.GOOGLE_SHEET_ID ? 'Configured' : 'MISSING',
      AUTH: process.env.GOOGLE_SERVICE_ACCOUNT_JSON ? 'Configured' : 'MISSING',
    }
    if (data.length > 0) {
      res.json({ success: true, count: data.length, firstRow: data[0], env: envSummary })
    } else {
      res.json({ success: true, count: 0, message: 'Sheet is empty or tab "Employees" not found', env: envSummary })
    }
  } catch (err) {
    console.error('[TEST_SHEETS_ERROR]:', err.message)
    res.status(500).json({ 
      error: err.message, 
      stack: err.stack,
      hint: "Check GOOGLE_SHEET_ID and GOOGLE_SERVICE_ACCOUNT_JSON in .env",
      code: err.code
    })
  }
})

// 2. Static Frontend (Serve dist folder for any non-API route)
const distPath = path.join(__dirname, '../dist')
app.use(express.static(distPath))

// 3. SPA Fallback (Redirect all other requests to index.html for React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

app.listen(PORT, async () => {
  console.log(`SISWIT API running on port ${PORT}`)
  
  // Pre-warm the cache so first requests are instant
  prewarmCache()
  // Optional: Spawn Telegram Bot as a child process if requested
  if (process.env.START_BOT === 'true') {
    console.log('[BOT] Starting Telegram Bot process...')
    const botProcess = spawn('python', ['bot/bot.py'], {
      stdio: 'inherit',
      shell: true
    })

    botProcess.on('error', (err) => {
      console.error('[BOT_ERROR] Failed to start bot:', err.message)
    })

    botProcess.on('close', (code) => {
      console.log(`[BOT] Bot process exited with code ${code}`)
    })
  }
})
