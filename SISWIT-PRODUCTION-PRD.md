# SISWIT — Production Build PRD
## Real Telegram Bot + Google Sheets + React Portal
### Full-Stack, No Mock Data, Production Ready

---

> **You are building a complete production web application.**
> Every feature must work with real data. No mock data anywhere.
> The Telegram Bot is the employee-facing interface. The React portal is the HR/Admin interface.
> Google Sheets is the single source of truth for all data.

---

## SYSTEM OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                     EMPLOYEE SIDE                           │
│                                                             │
│  Employee opens Telegram                                    │
│    ↓ sends /attend [work report]                            │
│  Telegram Bot (Python — runs on server)                     │
│    ↓ validates telegramChatId                               │
│    ↓ writes attendance row                                  │
│  Google Sheets (primary database)                           │
│    ↓ portal reads via Google Sheets API                     │
│  SISWIT React Portal (HR/Admin view)                        │
│    ↓ HR approves/rejects/warns                              │
│    ↓ portal calls backend API                               │
│  Express Backend                                            │
│    ↓ sends notification                                     │
│  Telegram Bot → sends message back to employee              │
└─────────────────────────────────────────────────────────────┘
```

---

## TECH STACK — COMPLETE

### Frontend
- **React 18 + Vite** — SPA portal
- **React Router v6** — routing
- **useState + useContext** — state management
- **Lucide React** — icons
- **CSS Variables** — design system

### Backend
- **Node.js + Express** — REST API server
- **googleapis** — Google Sheets read/write
- **node-telegram-bot-api** — send messages from portal
- **dotenv** — environment config
- **cors** — cross-origin for dev

### Telegram Bot (separate process)
- **Python 3.10+**
- **python-telegram-bot** — bot framework
- **gspread** — Google Sheets from Python
- **google-auth** — service account auth

### Database
- **Google Sheets** — primary data store (free, no setup)
- 6 tabs: Employees, Attendance, Leaves, Tasks, Hiring, Audit

### Deployment
- **Frontend** → Vercel
- **Backend API** → Railway or Render (free tier)
- **Telegram Bot** → Railway or Render (always-on worker)

---

## ENVIRONMENT VARIABLES

### Frontend `.env`
```
VITE_API_URL=https://your-backend.railway.app
```

### Backend `.env`
```
PORT=3001
TELEGRAM_BOT_TOKEN=7123456789:AAHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_SHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"siswit",...}
FRONTEND_URL=https://your-portal.vercel.app
```

### Bot `config.py`
```python
BOT_TOKEN   = "7123456789:AAHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
SHEET_ID    = "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
SERVICE_JSON = "service_account.json"
ATTENDANCE_CUTOFF_HOUR = 18  # 6 PM
LATE_CUTOFF_HOUR       = 11  # 11 AM
```

---

## GOOGLE SHEETS STRUCTURE

### Sheet 1: Employees
Headers (Row 1):
```
id | name | role | dept | av | color | status | telegramChatId | tg | wa | email | joining | salary | score | present | late | absent | streak | leaves
```

Example rows:
```
EMP001 | Rahul Sharma | Senior Developer | Engineering | RS | #4f6ef7 | active | 111000001 | @rahul_s | +91 98765 43210 | rahul@co.com | 01 Jan 2025 | 45000 | 88 | 18 | 2 | 1 | 7 | 1
```

### Sheet 2: Attendance
Headers:
```
id | empId | empName | dept | date | time | status | report | submittedAt
```

Status values: `p` (present/on time) | `l` (late) | `a` (absent) | `x` (on leave)

### Sheet 3: Leaves
Headers:
```
id | empId | empName | dept | date | type | reason | status | leaveNumber | deductionAmount | approvedBy | approvedAt | createdAt
```

Status values: `pending` | `approved` | `rejected`

### Sheet 4: Tasks
Headers:
```
id | empId | title | desc | deadline | priority | tag | done | createdAt
```

### Sheet 5: Hiring
Headers:
```
id | name | appliedFor | dept | contact | stage | interviewDate | score | notes | createdAt
```

Stage values: `applied` | `shortlisted` | `interviewed` | `selected` | `rejected`

### Sheet 6: Audit
Headers:
```
id | type | description | actor | timestamp
```

Type values: `approval` | `warning` | `update` | `dispatch` | `creation` | `login`

---

## FILE STRUCTURE — COMPLETE PROJECT

```
siswit/
│
├── .env                          ← backend environment variables
├── .env.local                    ← frontend environment variables
├── package.json                  ← root (workspaces or flat)
│
├── index.html
├── vite.config.js
│
├── server/                       ← Express backend
│   ├── index.js                  ← server entry + routes mount
│   ├── sheets.js                 ← Google Sheets read/write helpers
│   ├── telegram.js               ← send Telegram messages from portal
│   └── routes/
│       ├── employees.js
│       ├── attendance.js
│       ├── leaves.js
│       ├── tasks.js
│       ├── hiring.js
│       ├── audit.js
│       ├── payroll.js
│       └── messages.js
│
├── bot/                          ← Python Telegram Bot
│   ├── bot.py                    ← main bot entry
│   ├── config.py                 ← token + sheet config
│   ├── sheets.py                 ← sheets helper for bot
│   ├── handlers/
│   │   ├── attend.py             ← /attend command
│   │   ├── leave.py              ← /leave command
│   │   ├── status.py             ← /status command
│   │   ├── register.py           ← /start + /register
│   │   └── help.py               ← /help command
│   ├── requirements.txt
│   └── service_account.json      ← Google service account key
│
└── src/                          ← React frontend
    ├── main.jsx
    ├── App.jsx
    ├── styles/
    │   ├── index.css
    │   ├── layout.css
    │   └── components.css
    ├── services/
    │   ├── api.js                ← all fetch calls to Express backend
    │   └── telegram.js           ← telegram send helpers
    ├── context/
    │   ├── AuthContext.jsx
    │   ├── ToastContext.jsx
    │   └── DataContext.jsx       ← global data state + polling
    ├── hooks/
    │   ├── useAuth.js
    │   ├── useToast.js
    │   ├── useEmployees.js
    │   ├── useAttendance.js
    │   ├── useLeaves.js
    │   └── useTasks.js
    ├── components/
    │   ├── layout/
    │   │   ├── AppShell.jsx
    │   │   ├── Sidebar.jsx
    │   │   └── Topbar.jsx
    │   └── ui/
    │       ├── StatCard.jsx
    │       ├── Modal.jsx
    │       ├── Toast.jsx
    │       ├── ProgressBar.jsx
    │       ├── PerformanceRing.jsx
    │       ├── AttendanceHeatmap.jsx
    │       └── LoadingSpinner.jsx
    └── pages/
        ├── Login.jsx
        ├── Dashboard.jsx
        ├── Attendance.jsx
        ├── Leaves.jsx
        ├── Approvals.jsx
        ├── Communication.jsx
        ├── Hiring.jsx
        ├── Onboarding.jsx
        ├── Documents.jsx
        ├── Employees.jsx
        ├── EmployeeProfile.jsx
        ├── Payroll.jsx
        ├── Salary.jsx
        ├── Deductions.jsx
        ├── Analytics.jsx
        ├── Audit.jsx
        └── Settings.jsx
```

---

## BACKEND — server/sheets.js

```javascript
import { google } from 'googleapis'
import dotenv from 'dotenv'
dotenv.config()

const SHEET_ID = process.env.GOOGLE_SHEET_ID

function getAuth() {
  const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
  return new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
}

// Read all rows from a tab, returns array of objects using row 1 as keys
export async function readSheet(tabName) {
  const auth   = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  const res    = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: tabName,
  })
  const rows = res.data.values || []
  if (rows.length < 2) return []
  const headers = rows[0]
  return rows.slice(1).map(row =>
    Object.fromEntries(headers.map((h, i) => [h, row[i] || '']))
  )
}

// Append a new row to a tab
export async function appendRow(tabName, values) {
  const auth   = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: tabName,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    resource: { values: [values] },
  })
}

// Update a specific row by matching a field value
export async function updateRowWhere(tabName, field, value, updates) {
  const auth   = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  const res    = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: tabName,
  })
  const rows    = res.data.values || []
  const headers = rows[0]
  const fieldIdx = headers.indexOf(field)
  const rowIdx   = rows.findIndex((r, i) => i > 0 && r[fieldIdx] === value)

  if (rowIdx === -1) throw new Error(`Row with ${field}=${value} not found`)

  // Apply updates
  Object.entries(updates).forEach(([key, val]) => {
    const colIdx = headers.indexOf(key)
    if (colIdx !== -1) rows[rowIdx][colIdx] = val
  })

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${tabName}!A${rowIdx + 1}`,
    valueInputOption: 'USER_ENTERED',
    resource: { values: [rows[rowIdx]] },
  })
}

// Get a single row by field match
export async function findRow(tabName, field, value) {
  const rows = await readSheet(tabName)
  return rows.find(r => r[field] === value) || null
}
```

---

## BACKEND — server/telegram.js

```javascript
import fetch from 'node-fetch'
import dotenv from 'dotenv'
dotenv.config()

const BASE = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`

export async function sendMessage(chatId, text) {
  const res = await fetch(`${BASE}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    }),
  })
  return res.json()
}

export async function sendBulkMessage(chatIds, text) {
  const results = await Promise.allSettled(
    chatIds.map(id => sendMessage(id, text))
  )
  return results
}
```

---

## BACKEND — server/routes/employees.js

```javascript
import { Router } from 'express'
import { readSheet, appendRow, updateRowWhere } from '../sheets.js'
import { appendAudit } from './audit.js'

const router = Router()

// GET all employees
router.get('/', async (req, res) => {
  try {
    const employees = await readSheet('Employees')
    res.json(employees)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET single employee by ID
router.get('/:id', async (req, res) => {
  try {
    const employees = await readSheet('Employees')
    const emp = employees.find(e => e.id === req.params.id)
    if (!emp) return res.status(404).json({ error: 'Employee not found' })
    res.json(emp)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST add new employee
router.post('/', async (req, res) => {
  try {
    const e = req.body
    await appendRow('Employees', [
      e.id, e.name, e.role, e.dept,
      e.av || e.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase(),
      e.color || '#4f6ef7', 'active',
      e.telegramChatId, e.tg, e.wa, e.email,
      e.joining, e.salary, 80,
      0, 0, 0, 0, 0
    ])
    await appendAudit('creation', `New employee ${e.name} added`, req.headers['x-user'] || 'admin')
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH update employee field
router.patch('/:id', async (req, res) => {
  try {
    await updateRowWhere('Employees', 'id', req.params.id, req.body)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
```

---

## BACKEND — server/routes/attendance.js

```javascript
import { Router } from 'express'
import { readSheet } from '../sheets.js'

const router = Router()

// GET today's attendance
router.get('/today', async (req, res) => {
  try {
    const today   = new Date().toISOString().split('T')[0]
    const records = await readSheet('Attendance')
    const todayRecs = records.filter(r => r.date === today)

    // Get all employees and merge — mark absent if no record
    const employees = await readSheet('Employees')
    const merged = employees.map(emp => {
      const rec = todayRecs.find(r => r.empId === emp.id)
      return rec || {
        empId: emp.id, empName: emp.name, dept: emp.dept,
        date: today, time: '—', status: 'a', report: '—'
      }
    })
    res.json(merged)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET attendance for a specific employee
router.get('/employee/:empId', async (req, res) => {
  try {
    const records = await readSheet('Attendance')
    const empRecs = records
      .filter(r => r.empId === req.params.empId)
      .sort((a,b) => new Date(b.date) - new Date(a.date))
      .slice(0, 30)
    res.json(empRecs)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET weekly grid (last 5 working days)
router.get('/weekly', async (req, res) => {
  try {
    const records   = await readSheet('Attendance')
    const employees = await readSheet('Employees')

    // Get last 5 weekdays
    const days = []
    const d = new Date()
    while (days.length < 5) {
      d.setDate(d.getDate() - 1)
      if (d.getDay() !== 0 && d.getDay() !== 6) {
        days.unshift(d.toISOString().split('T')[0])
      }
    }

    const grid = employees.map(emp => ({
      empId: emp.id,
      empName: emp.name,
      days: days.map(date => {
        const rec = records.find(r => r.empId === emp.id && r.date === date)
        return rec ? rec.status : 'a'
      }),
      dates: days
    }))

    res.json(grid)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
```

---

## BACKEND — server/routes/leaves.js

```javascript
import { Router } from 'express'
import { readSheet, appendRow, updateRowWhere } from '../sheets.js'
import { sendMessage } from '../telegram.js'
import { appendAudit } from './audit.js'
import { findRow } from '../sheets.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const leaves = await readSheet('Leaves')
    res.json(leaves)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/pending', async (req, res) => {
  try {
    const leaves = await readSheet('Leaves')
    res.json(leaves.filter(l => l.status === 'pending'))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/:id/approve', async (req, res) => {
  try {
    const { approvedBy } = req.body
    const now = new Date().toISOString()

    await updateRowWhere('Leaves', 'id', req.params.id, {
      status: 'approved',
      approvedBy,
      approvedAt: now,
    })

    // Notify employee via Telegram
    const leave = await findRow('Leaves', 'id', req.params.id)
    if (leave) {
      const emp = await findRow('Employees', 'id', leave.empId)
      if (emp?.telegramChatId) {
        await sendMessage(emp.telegramChatId,
          `✅ <b>Leave Approved!</b>\n\n` +
          `Your leave request for <b>${leave.date}</b> has been approved.\n` +
          `Approved by: ${approvedBy}`
        )
      }
    }

    await appendAudit('approval', `${leave?.empName || 'Employee'} leave approved by ${approvedBy}`, approvedBy)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/:id/reject', async (req, res) => {
  try {
    const { rejectedBy, reason } = req.body
    const now = new Date().toISOString()

    await updateRowWhere('Leaves', 'id', req.params.id, {
      status: 'rejected',
      approvedBy: rejectedBy,
      approvedAt: now,
    })

    const leave = await findRow('Leaves', 'id', req.params.id)
    if (leave) {
      const emp = await findRow('Employees', 'id', leave.empId)
      if (emp?.telegramChatId) {
        await sendMessage(emp.telegramChatId,
          `❌ <b>Leave Rejected</b>\n\n` +
          `Your leave request for <b>${leave.date}</b> has been rejected.\n` +
          `${reason ? `Reason: ${reason}` : ''}`
        )
      }
    }

    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
```

---

## BACKEND — server/routes/messages.js

```javascript
import { Router } from 'express'
import { readSheet } from '../sheets.js'
import { sendMessage, sendBulkMessage } from '../telegram.js'
import { appendAudit } from './audit.js'

const router = Router()

// Send direct message to one employee
router.post('/direct', async (req, res) => {
  try {
    const { empId, message, channel, actor } = req.body
    const employees = await readSheet('Employees')
    const emp = employees.find(e => e.id === empId)
    if (!emp) return res.status(404).json({ error: 'Employee not found' })

    if (channel === 'telegram' && emp.telegramChatId) {
      await sendMessage(emp.telegramChatId, message)
    }
    // WhatsApp and Email — add integrations here later

    await appendAudit('dispatch', `Direct message sent to ${emp.name}`, actor || 'portal')
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Broadcast to all or dept
router.post('/broadcast', async (req, res) => {
  try {
    const { message, recipients, channels, actor } = req.body
    const employees = await readSheet('Employees')

    let targets = employees
    if (recipients !== 'all') {
      targets = employees.filter(e => e.dept.toLowerCase() === recipients.toLowerCase())
    }

    const chatIds = targets.map(e => e.telegramChatId).filter(Boolean)

    if (channels.includes('telegram')) {
      await sendBulkMessage(chatIds, message)
    }

    await appendAudit('dispatch', `Broadcast sent to ${targets.length} employees`, actor || 'portal')
    res.json({ success: true, sent: targets.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Send attendance reminder to absent employees
router.post('/remind-absent', async (req, res) => {
  try {
    const { actor } = req.body
    const today = new Date().toISOString().split('T')[0]
    const [employees, attendance] = await Promise.all([
      readSheet('Employees'),
      readSheet('Attendance')
    ])

    const presentIds = attendance.filter(a => a.date === today).map(a => a.empId)
    const absent = employees.filter(e => !presentIds.includes(e.id) && e.status === 'active')

    await Promise.all(absent.map(emp =>
      emp.telegramChatId ? sendMessage(emp.telegramChatId,
        `⏰ <b>Attendance Reminder</b>\n\n` +
        `Hi ${emp.name.split(' ')[0]}, you haven't submitted your attendance today.\n\n` +
        `Please send: <code>/attend [your work report]</code>`
      ) : Promise.resolve()
    ))

    res.json({ success: true, reminded: absent.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
```

---

## BACKEND — server/routes/tasks.js

```javascript
import { Router } from 'express'
import { readSheet, appendRow, updateRowWhere } from '../sheets.js'
import { sendMessage } from '../telegram.js'
import { findRow } from '../sheets.js'

const router = Router()

router.get('/employee/:empId', async (req, res) => {
  try {
    const tasks = await readSheet('Tasks')
    res.json(tasks.filter(t => t.empId === req.params.empId))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const t = req.body
    const id = `TASK${Date.now()}`
    await appendRow('Tasks', [
      id, t.empId, t.title, t.desc || '',
      t.deadline, t.priority, t.tag || 'General',
      'false', new Date().toISOString()
    ])
    res.json({ success: true, id })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/:id/toggle', async (req, res) => {
  try {
    const tasks = await readSheet('Tasks')
    const task = tasks.find(t => t.id === req.params.id)
    if (!task) return res.status(404).json({ error: 'Task not found' })
    await updateRowWhere('Tasks', 'id', req.params.id, {
      done: task.done === 'true' ? 'false' : 'true'
    })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/:id/remind', async (req, res) => {
  try {
    const tasks = await readSheet('Tasks')
    const task = tasks.find(t => t.id === req.params.id)
    if (!task) return res.status(404).json({ error: 'Task not found' })

    const emp = await findRow('Employees', 'id', task.empId)
    if (emp?.telegramChatId) {
      const dl = new Date(task.deadline).toLocaleDateString('en-IN', { day:'2-digit', month:'short' })
      await sendMessage(emp.telegramChatId,
        `📋 <b>Task Reminder</b>\n\n` +
        `<b>${task.title}</b>\n` +
        `Deadline: ${dl}\n` +
        `Priority: ${task.priority.toUpperCase()}`
      )
    }
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
```

---

## BACKEND — server/routes/payroll.js

```javascript
import { Router } from 'express'
import { readSheet } from '../sheets.js'
import { sendMessage } from '../telegram.js'
import { appendAudit } from './audit.js'

const router = Router()

function calcSalary(emp) {
  const leaves = parseInt(emp.leaves) || 0
  const late   = parseInt(emp.late)   || 0
  let deductions = 0
  if (leaves > 3)  deductions += (leaves - 3) * 500
  if (late   > 5)  deductions += 200
  return {
    gross:      parseInt(emp.salary) || 0,
    deductions,
    net:        (parseInt(emp.salary) || 0) - deductions
  }
}

router.get('/', async (req, res) => {
  try {
    const employees = await readSheet('Employees')
    const payroll = employees.map(emp => ({
      emp,
      ...calcSalary(emp),
      sent: false
    }))
    res.json(payroll)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/dispatch/:empId', async (req, res) => {
  try {
    const { channel, actor } = req.body
    const employees = await readSheet('Employees')
    const emp = employees.find(e => e.id === req.params.empId)
    if (!emp) return res.status(404).json({ error: 'Employee not found' })

    const { gross, deductions, net } = calcSalary(emp)
    const month = new Date().toLocaleDateString('en-IN', { month:'long', year:'numeric' })

    if (channel === 'telegram' && emp.telegramChatId) {
      await sendMessage(emp.telegramChatId,
        `💰 <b>Salary Slip — ${month}</b>\n\n` +
        `Employee: ${emp.name}\n` +
        `ID: ${emp.id}\n\n` +
        `Gross Salary:  ₹${gross.toLocaleString('en-IN')}\n` +
        (deductions > 0 ? `Deductions:    ₹${deductions.toLocaleString('en-IN')}\n` : '') +
        `──────────────────\n` +
        `Net Salary:    ₹${net.toLocaleString('en-IN')}\n\n` +
        `Payment Date: 31 ${month}`
      )
    }

    await appendAudit('dispatch', `Salary slip sent to ${emp.name}`, actor || 'portal')
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/dispatch-all', async (req, res) => {
  try {
    const { actor } = req.body
    const employees = await readSheet('Employees')
    const month = new Date().toLocaleDateString('en-IN', { month:'long', year:'numeric' })

    await Promise.all(employees.map(emp => {
      if (!emp.telegramChatId) return Promise.resolve()
      const { gross, deductions, net } = calcSalary(emp)
      return sendMessage(emp.telegramChatId,
        `💰 <b>Salary Slip — ${month}</b>\n\n` +
        `Employee: ${emp.name}\n` +
        `Gross: ₹${gross.toLocaleString('en-IN')}\n` +
        (deductions > 0 ? `Deductions: ₹${deductions.toLocaleString('en-IN')}\n` : '') +
        `Net: ₹${net.toLocaleString('en-IN')}`
      )
    }))

    await appendAudit('dispatch', `Salary slips dispatched to all ${employees.length} employees`, actor || 'portal')
    res.json({ success: true, sent: employees.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
```

---

## BACKEND — server/routes/audit.js

```javascript
import { Router } from 'express'
import { readSheet, appendRow } from '../sheets.js'

const router = Router()

export async function appendAudit(type, description, actor) {
  const id = `AUD${Date.now()}`
  await appendRow('Audit', [id, type, description, actor, new Date().toISOString()])
}

router.get('/', async (req, res) => {
  try {
    const events = await readSheet('Audit')
    res.json(events.reverse())
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
```

---

## BACKEND — server/routes/hiring.js

```javascript
import { Router } from 'express'
import { readSheet, appendRow, updateRowWhere } from '../sheets.js'
import { appendAudit } from './audit.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    res.json(await readSheet('Hiring'))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const c = req.body
    const id = `CAND${Date.now()}`
    await appendRow('Hiring', [
      id, c.name, c.appliedFor, c.dept, c.contact,
      c.stage || 'applied', '', '', '', new Date().toISOString()
    ])
    await appendAudit('creation', `New candidate ${c.name} added for ${c.appliedFor}`, req.headers['x-user'] || 'hr')
    res.json({ success: true, id })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/:id/stage', async (req, res) => {
  try {
    await updateRowWhere('Hiring', 'id', req.params.id, { stage: req.body.stage })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
```

---

## BACKEND — server/index.js

```javascript
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

import employeesRouter  from './routes/employees.js'
import attendanceRouter from './routes/attendance.js'
import leavesRouter     from './routes/leaves.js'
import tasksRouter      from './routes/tasks.js'
import hiringRouter     from './routes/hiring.js'
import payrollRouter    from './routes/payroll.js'
import auditRouter      from './routes/audit.js'
import messagesRouter   from './routes/messages.js'

const app  = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }))
app.use(express.json())

app.use('/api/employees',  employeesRouter)
app.use('/api/attendance', attendanceRouter)
app.use('/api/leaves',     leavesRouter)
app.use('/api/tasks',      tasksRouter)
app.use('/api/hiring',     hiringRouter)
app.use('/api/payroll',    payrollRouter)
app.use('/api/audit',      auditRouter)
app.use('/api/messages',   messagesRouter)

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }))

app.listen(PORT, () => console.log(`SISWIT API running on port ${PORT}`))
```

---

## TELEGRAM BOT — bot/config.py

```python
BOT_TOKEN              = "YOUR_BOT_TOKEN_HERE"
SHEET_ID               = "YOUR_GOOGLE_SHEET_ID_HERE"
SERVICE_ACCOUNT_FILE   = "service_account.json"
ATTENDANCE_CUTOFF_HOUR = 18   # 6 PM — no attendance after this
LATE_CUTOFF_HOUR       = 11   # 11 AM — late if submitted after this
FREE_LEAVES_PER_MONTH  = 3
DEDUCTION_PER_LEAF     = 500
PORTAL_URL             = "https://your-portal.vercel.app"
```

---

## TELEGRAM BOT — bot/sheets.py

```python
import gspread
from google.oauth2.service_account import Credentials
from config import SHEET_ID, SERVICE_ACCOUNT_FILE
from datetime import datetime

SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive',
]

def get_sheet():
    creds = Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    gc = gspread.authorize(creds)
    return gc.open_by_key(SHEET_ID)

def get_employee_by_chat_id(chat_id):
    sh = get_sheet()
    ws = sh.worksheet('Employees')
    records = ws.get_all_records()
    for emp in records:
        if str(emp.get('telegramChatId', '')) == str(chat_id):
            return emp
    return None

def get_employee_by_id(emp_id):
    sh = get_sheet()
    ws = sh.worksheet('Employees')
    records = ws.get_all_records()
    for emp in records:
        if emp.get('id') == emp_id:
            return emp
    return None

def add_attendance(emp_id, emp_name, dept, date, time_str, status, report):
    sh = get_sheet()
    ws = sh.worksheet('Attendance')
    att_id = f"ATT{datetime.now().strftime('%Y%m%d%H%M%S')}"
    ws.append_row([
        att_id, emp_id, emp_name, dept,
        date, time_str, status, report,
        datetime.now().isoformat()
    ])

def get_today_attendance(emp_id):
    sh = get_sheet()
    ws = sh.worksheet('Attendance')
    today = datetime.now().strftime('%Y-%m-%d')
    records = ws.get_all_records()
    return [r for r in records if r.get('empId') == emp_id and r.get('date') == today]

def add_leave_request(emp_id, emp_name, dept, date, leave_type, reason):
    sh = get_sheet()
    leaves_ws = sh.worksheet('Leaves')

    # Count this month's leaves
    month = datetime.now().strftime('%Y-%m')
    all_leaves = leaves_ws.get_all_records()
    month_leaves = [l for l in all_leaves
                    if l.get('empId') == emp_id
                    and str(l.get('date', '')).startswith(month)
                    and l.get('status') != 'rejected']

    leave_num     = len(month_leaves) + 1
    deduction_amt = 500 if leave_num > 3 else 0
    leave_id      = f"LV{datetime.now().strftime('%Y%m%d%H%M%S')}"

    leaves_ws.append_row([
        leave_id, emp_id, emp_name, dept, date,
        leave_type, reason, 'pending',
        leave_num, deduction_amt, '', '',
        datetime.now().isoformat()
    ])
    return leave_num, deduction_amt

def get_employee_stats(emp_id):
    sh = get_sheet()
    att_ws = sh.worksheet('Attendance')
    leave_ws = sh.worksheet('Leaves')

    month = datetime.now().strftime('%Y-%m')
    records = att_ws.get_all_records()
    month_att = [r for r in records
                 if r.get('empId') == emp_id
                 and str(r.get('date', '')).startswith(month)]

    leaves = leave_ws.get_all_records()
    month_leaves = [l for l in leaves
                    if l.get('empId') == emp_id
                    and str(l.get('date', '')).startswith(month)
                    and l.get('status') == 'approved']

    present  = len([r for r in month_att if r.get('status') == 'p'])
    late     = len([r for r in month_att if r.get('status') == 'l'])
    on_leave = len(month_leaves)

    return { 'present': present, 'late': late, 'leaves': on_leave }
```

---

## TELEGRAM BOT — bot/handlers/attend.py

```python
from telegram import Update
from telegram.ext import ContextTypes
from datetime import datetime
from sheets import get_employee_by_chat_id, add_attendance, get_today_attendance
from config import LATE_CUTOFF_HOUR, ATTENDANCE_CUTOFF_HOUR

async def attend_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    chat_id = update.effective_chat.id
    emp     = get_employee_by_chat_id(chat_id)

    if not emp:
        await update.message.reply_text(
            "❌ You are not registered in SISWIT.\n"
            "Contact your HR manager to register your Telegram ID."
        )
        return

    # Check if already submitted today
    today_records = get_today_attendance(emp['id'])
    if today_records:
        await update.message.reply_text(
            f"✅ You already submitted attendance today at {today_records[-1]['time']}.\n\n"
            f"Report: {today_records[-1]['report']}"
        )
        return

    now  = datetime.now()
    hour = now.hour

    if hour >= ATTENDANCE_CUTOFF_HOUR:
        await update.message.reply_text(
            "⚠️ Attendance window is closed (after 6 PM).\n"
            "Contact HR if you need to submit late attendance."
        )
        return

    report = ' '.join(ctx.args) if ctx.args else None
    if not report:
        await update.message.reply_text(
            "Please include your work report.\n\n"
            "Usage: <code>/attend [what you worked on today]</code>\n\n"
            "Example: <code>/attend Fixed login bug, reviewed 3 PRs, updated documentation</code>",
            parse_mode='HTML'
        )
        return

    status   = 'p' if hour < LATE_CUTOFF_HOUR else 'l'
    time_str = now.strftime("%I:%M %p")
    date_str = now.strftime("%Y-%m-%d")

    add_attendance(
        emp['id'], emp['name'], emp['dept'],
        date_str, time_str, status, report
    )

    if status == 'p':
        await update.message.reply_text(
            f"✅ <b>Attendance Recorded — On Time!</b>\n\n"
            f"👤 {emp['name']}\n"
            f"🕐 {time_str}\n"
            f"📅 {date_str}\n"
            f"📝 {report}",
            parse_mode='HTML'
        )
    else:
        await update.message.reply_text(
            f"⚠️ <b>Attendance Recorded — Late</b>\n\n"
            f"👤 {emp['name']}\n"
            f"🕐 {time_str} (after 11 AM cutoff)\n"
            f"📅 {date_str}\n"
            f"📝 {report}\n\n"
            f"<i>Note: Late submissions affect your attendance score.</i>",
            parse_mode='HTML'
        )
```

---

## TELEGRAM BOT — bot/handlers/leave.py

```python
from telegram import Update
from telegram.ext import ContextTypes
from sheets import get_employee_by_chat_id, add_leave_request

async def leave_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    chat_id = update.effective_chat.id
    emp     = get_employee_by_chat_id(chat_id)

    if not emp:
        await update.message.reply_text("❌ Not registered. Contact HR.")
        return

    if len(ctx.args) < 2:
        await update.message.reply_text(
            "📋 <b>Leave Request</b>\n\n"
            "Usage: <code>/leave YYYY-MM-DD [reason]</code>\n\n"
            "Examples:\n"
            "<code>/leave 2026-03-20 Doctor appointment</code>\n"
            "<code>/leave 2026-03-21 Family function</code>",
            parse_mode='HTML'
        )
        return

    date   = ctx.args[0]
    reason = ' '.join(ctx.args[1:])

    # Validate date format
    try:
        from datetime import datetime
        datetime.strptime(date, '%Y-%m-%d')
    except ValueError:
        await update.message.reply_text("❌ Invalid date format. Use YYYY-MM-DD")
        return

    leave_num, deduction = add_leave_request(
        emp['id'], emp['name'], emp['dept'],
        date, 'casual', reason
    )

    msg = (
        f"📋 <b>Leave Request Submitted!</b>\n\n"
        f"👤 {emp['name']}\n"
        f"📅 Date: {date}\n"
        f"📝 Reason: {reason}\n"
        f"📊 Leave #{leave_num} this month\n\n"
        f"⏳ Status: <b>Pending HR Approval</b>"
    )
    if deduction > 0:
        msg += f"\n\n⚠️ <b>₹{deduction} deduction will apply</b> (exceeds 3 free leaves)"

    await update.message.reply_text(msg, parse_mode='HTML')
```

---

## TELEGRAM BOT — bot/handlers/status.py

```python
from telegram import Update
from telegram.ext import ContextTypes
from sheets import get_employee_by_chat_id, get_today_attendance, get_employee_stats
from datetime import datetime

STATUS_LABELS = { 'p':'✅ On Time', 'l':'⚠️ Late', 'a':'❌ Absent', 'x':'🏖 On Leave' }

async def status_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    chat_id = update.effective_chat.id
    emp     = get_employee_by_chat_id(chat_id)

    if not emp:
        await update.message.reply_text("❌ Not registered. Contact HR.")
        return

    today_recs = get_today_attendance(emp['id'])
    stats      = get_employee_stats(emp['id'])
    month      = datetime.now().strftime('%B %Y')

    if today_recs:
        rec   = today_recs[-1]
        label = STATUS_LABELS.get(rec['status'], '?')
        msg = (
            f"📊 <b>Your Status — {datetime.now().strftime('%d %b %Y')}</b>\n\n"
            f"{label}\n"
            f"🕐 Submitted at: {rec['time']}\n"
            f"📝 Report: {rec['report']}\n\n"
            f"<b>This Month ({month}):</b>\n"
            f"✅ Present: {stats['present']} days\n"
            f"⚠️ Late: {stats['late']} times\n"
            f"🏖 Leaves taken: {stats['leaves']}/3"
        )
    else:
        msg = (
            f"📊 <b>Your Status — {datetime.now().strftime('%d %b %Y')}</b>\n\n"
            f"⚠️ No attendance submitted today.\n\n"
            f"Submit now: <code>/attend [your work report]</code>\n\n"
            f"<b>This Month ({month}):</b>\n"
            f"✅ Present: {stats['present']} days\n"
            f"⚠️ Late: {stats['late']} times\n"
            f"🏖 Leaves taken: {stats['leaves']}/3"
        )

    await update.message.reply_text(msg, parse_mode='HTML')
```

---

## TELEGRAM BOT — bot/handlers/register.py

```python
from telegram import Update
from telegram.ext import ContextTypes
from sheets import get_employee_by_chat_id

async def start_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    chat_id = update.effective_chat.id
    emp     = get_employee_by_chat_id(chat_id)

    if emp:
        await update.message.reply_text(
            f"👋 <b>Welcome back, {emp['name']}!</b>\n\n"
            f"🏢 {emp['role']} — {emp['dept']}\n"
            f"🆔 {emp['id']}\n\n"
            f"<b>Available Commands:</b>\n"
            f"📋 /attend [work report] — Submit today's attendance\n"
            f"🏖 /leave [date] [reason] — Request leave\n"
            f"📊 /status — View your attendance status\n"
            f"❓ /help — Show all commands",
            parse_mode='HTML'
        )
    else:
        await update.message.reply_text(
            f"👋 <b>Welcome to SISWIT!</b>\n\n"
            f"Your Telegram ID is: <code>{chat_id}</code>\n\n"
            f"You are not yet registered in the system.\n"
            f"Please share this ID with your HR manager to get registered.\n\n"
            f"Once registered, you can:\n"
            f"• Submit daily attendance\n"
            f"• Request leaves\n"
            f"• Check your attendance status",
            parse_mode='HTML'
        )
```

---

## TELEGRAM BOT — bot/bot.py

```python
from telegram.ext import ApplicationBuilder, CommandHandler
from config import BOT_TOKEN
from handlers.attend   import attend_handler
from handlers.leave    import leave_handler
from handlers.status   import status_handler
from handlers.register import start_handler

def main():
    print("🤖 SISWIT Bot starting...")
    app = ApplicationBuilder().token(BOT_TOKEN).build()

    app.add_handler(CommandHandler('start',  start_handler))
    app.add_handler(CommandHandler('attend', attend_handler))
    app.add_handler(CommandHandler('leave',  leave_handler))
    app.add_handler(CommandHandler('status', status_handler))

    print("✅ Bot is running. Press Ctrl+C to stop.")
    app.run_polling()

if __name__ == '__main__':
    main()
```

---

## TELEGRAM BOT — bot/requirements.txt

```
python-telegram-bot==20.7
gspread==6.0.2
google-auth==2.27.0
google-auth-oauthlib==1.2.0
```

---

## FRONTEND — src/services/api.js

```javascript
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

// Attendance
export const getTodayAttendance  = ()          => req('/api/attendance/today')
export const getEmployeeAttendance = (empId)   => req(`/api/attendance/employee/${empId}`)
export const getWeeklyGrid       = ()          => req('/api/attendance/weekly')

// Leaves
export const getLeaves           = ()          => req('/api/leaves')
export const getPendingLeaves    = ()          => req('/api/leaves/pending')
export const approveLeave        = (id, data)  => req(`/api/leaves/${id}/approve`, { method:'POST', body:JSON.stringify(data) })
export const rejectLeave         = (id, data)  => req(`/api/leaves/${id}/reject`,  { method:'POST', body:JSON.stringify(data) })

// Tasks
export const getEmployeeTasks    = (empId)     => req(`/api/tasks/employee/${empId}`)
export const addTask             = (data)      => req('/api/tasks', { method:'POST', body:JSON.stringify(data) })
export const toggleTask          = (id)        => req(`/api/tasks/${id}/toggle`, { method:'PATCH' })
export const remindTask          = (id)        => req(`/api/tasks/${id}/remind`, { method:'POST' })

// Hiring
export const getCandidates       = ()          => req('/api/hiring')
export const addCandidate        = (data)      => req('/api/hiring', { method:'POST', body:JSON.stringify(data) })
export const updateCandidateStage = (id, stage) => req(`/api/hiring/${id}/stage`, { method:'PATCH', body:JSON.stringify({ stage }) })

// Payroll
export const getPayroll          = ()          => req('/api/payroll')
export const dispatchSlip        = (empId, data) => req(`/api/payroll/dispatch/${empId}`, { method:'POST', body:JSON.stringify(data) })
export const dispatchAllSlips    = (data)      => req('/api/payroll/dispatch-all', { method:'POST', body:JSON.stringify(data) })

// Messages
export const sendDirectMessage   = (data)      => req('/api/messages/direct',       { method:'POST', body:JSON.stringify(data) })
export const sendBroadcast       = (data)      => req('/api/messages/broadcast',     { method:'POST', body:JSON.stringify(data) })
export const remindAbsent        = (data)      => req('/api/messages/remind-absent', { method:'POST', body:JSON.stringify(data) })

// Audit
export const getAuditLog         = ()          => req('/api/audit')
```

---

## FRONTEND — src/context/DataContext.jsx

```jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as api from '../services/api'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [employees,  setEmployees]  = useState([])
  const [attendance, setAttendance] = useState([])
  const [leaves,     setLeaves]     = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)

  const loadAll = useCallback(async () => {
    try {
      setLoading(true)
      const [emps, att, lvs] = await Promise.all([
        api.getEmployees(),
        api.getTodayAttendance(),
        api.getLeaves(),
      ])
      setEmployees(emps)
      setAttendance(att)
      setLeaves(lvs)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAll()
    // Auto-refresh every 60 seconds
    const interval = setInterval(loadAll, 60000)
    return () => clearInterval(interval)
  }, [loadAll])

  return (
    <DataContext.Provider value={{
      employees, setEmployees,
      attendance, setAttendance,
      leaves, setLeaves,
      loading, error,
      refresh: loadAll
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() { return useContext(DataContext) }
```

---

## FRONTEND — Replace Mock Data in Every Page

Every page that currently imports from `../data/` must be updated:

### Pattern — replace this in every page:

**Before:**
```javascript
import { EMPLOYEES } from '../data/employees'
import { LEAVES }    from '../data/leaves'
// ...
const [leaves, setLeaves] = useState(LEAVES)
```

**After:**
```javascript
import { useData }   from '../context/DataContext'
import { useToast }  from '../context/ToastContext'
import * as api      from '../services/api'

// Inside component:
const { employees, leaves, setLeaves, refresh } = useData()
const { showToast } = useToast()
```

### Loading state pattern — add to every page:

```jsx
import LoadingSpinner from '../components/ui/LoadingSpinner'

const { employees, loading, error } = useData()

if (loading) return <LoadingSpinner />
if (error)   return <div className="empty-state">Error loading data: {error}</div>
```

---

## FRONTEND — src/components/ui/LoadingSpinner.jsx

```jsx
export default function LoadingSpinner() {
  return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'center',
      height:'60vh', flexDirection:'column', gap:16
    }}>
      <div style={{
        width:36, height:36, borderRadius:'50%',
        border:'3px solid var(--line)',
        borderTopColor:'var(--accent)',
        animation:'spin 0.8s linear infinite'
      }} />
      <span style={{fontSize:13, color:'var(--muted)'}}>Loading data from Sheets…</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
```

---

## SETUP INSTRUCTIONS — STEP BY STEP

### Step 1 — Create Telegram Bot
1. Open Telegram → search **@BotFather**
2. Send `/newbot`
3. Name: `SISWIT Attendance Bot`
4. Username: `siswit_your_company_bot`
5. Copy the **Bot Token**
6. Send `/setcommands` to BotFather:
```
attend - Submit your attendance with work report
leave - Request a leave
status - Check your attendance status today
start - Welcome and registration info
```

### Step 2 — Set Up Google Sheets
1. Go to [sheets.google.com](https://sheets.google.com)
2. Create new spreadsheet named **SISWIT Data**
3. Create 6 tabs: `Employees`, `Attendance`, `Leaves`, `Tasks`, `Hiring`, `Audit`
4. Add headers to each tab exactly as specified above
5. Copy the **Spreadsheet ID** from the URL:
   `https://docs.google.com/spreadsheets/d/`**`THIS_PART`**`/edit`

### Step 3 — Create Google Service Account
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create new project: **SISWIT**
3. Enable **Google Sheets API**
4. Go to **IAM & Admin → Service Accounts**
5. Create service account: `siswit-sheets`
6. Download JSON key → save as `service_account.json`
7. Copy the `client_email` from the JSON
8. Open your Google Sheet → Share → paste that email → Editor access

### Step 4 — Add Your First Employee
In Google Sheets Employees tab, add row:
```
EMP001 | Your Name | Admin | Admin | YN | #4f6ef7 | active | YOUR_TELEGRAM_CHAT_ID | @yourtg | +91 XXXXX | email | 01 Jan 2026 | 50000 | 90 | 0 | 0 | 0 | 0 | 0
```

To find your Telegram Chat ID:
- Message **@userinfobot** on Telegram
- It replies with your numeric Chat ID

### Step 5 — Run the Bot
```bash
cd bot/
pip install -r requirements.txt

# Copy service_account.json into bot/ folder
# Edit config.py with your BOT_TOKEN and SHEET_ID

python bot.py
```

Test it — open your bot in Telegram, send `/start`

### Step 6 — Run the Backend
```bash
npm install googleapis node-telegram-bot-api cors dotenv node-fetch

# Create .env with all variables

node server/index.js
```

Test: `http://localhost:3001/api/health` should return `{"status":"ok"}`

### Step 7 — Update Frontend
1. Remove all imports from `../data/`
2. Replace with `useData()` hook
3. Update all API calls to use `src/services/api.js`
4. Add `<DataProvider>` to `App.jsx`

### Step 8 — Deploy
**Backend (Railway):**
```bash
# Install Railway CLI
npm install -g @railway/cli
railway login
railway init
railway up
```

**Bot (Railway — separate service):**
```bash
railway new
# Set as Python service
# Add all env variables
railway up
```

**Frontend (Vercel):**
```bash
npm install -g vercel
vercel
# Set VITE_API_URL to your Railway backend URL
```

---

## COMPLETE DATA FLOW — REAL WORLD

```
Morning 9 AM:
  Rahul opens Telegram
  Sends: /attend Fixed auth bug, reviewed 2 PRs, updated tests
  Bot checks: telegramChatId 111000001 → EMP001 Rahul Sharma
  Bot writes to Google Sheets Attendance tab: EMP001, 2026-03-14, 09:15 AM, p, "Fixed auth bug..."
  Bot replies: ✅ Attendance Recorded — On Time!

Morning 11:30 AM:
  HR opens SISWIT Portal
  Dashboard fetches: GET /api/attendance/today
  Backend reads Google Sheets Attendance tab
  Portal shows: 7/8 present, Amit Mishra absent
  HR clicks "Remind All"
  Portal calls: POST /api/messages/remind-absent
  Backend sends Telegram message to Amit: "⏰ Attendance Reminder..."

Afternoon 2 PM:
  Amit submits /attend in Telegram (late)
  Bot writes: EMP004, 2026-03-14, 02:15 PM, l, "..."
  Portal auto-refreshes in 60 seconds

Afternoon 3 PM:
  Sneha sends: /leave 2026-03-18 Doctor appointment
  Bot counts: her 2nd leave this month
  Bot writes to Leaves tab: pending, leave #2, ₹0 deduction
  HR portal shows new pending card
  HR clicks Approve
  Portal calls: POST /api/leaves/LV001/approve
  Backend updates Sheets: status → approved
  Backend sends Telegram to Sneha: "✅ Leave Approved for 18 Mar!"

End of month:
  Finance opens Salary Slips
  Portal fetches: GET /api/payroll
  Backend reads all employees, calculates deductions live
  Finance clicks "Send All"
  Portal calls: POST /api/payroll/dispatch-all
  Backend sends salary slip message to each employee via Telegram
  All 8 employees receive their salary slips on Telegram
```

---

## PACKAGE.JSON

```json
{
  "name": "siswit",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev":        "vite",
    "dev:server": "node --watch server/index.js",
    "dev:all":    "concurrently \"npm run dev\" \"npm run dev:server\"",
    "build":      "vite build",
    "preview":    "vite preview",
    "start:server": "node server/index.js"
  },
  "dependencies": {
    "lucide-react":           "^0.383.0",
    "react":                  "^18.3.1",
    "react-dom":              "^18.3.1",
    "react-router-dom":       "^6.23.1",
    "googleapis":             "^140.0.0",
    "node-telegram-bot-api":  "^0.66.0",
    "express":                "^4.19.2",
    "cors":                   "^2.8.5",
    "dotenv":                 "^16.4.5",
    "node-fetch":             "^3.3.2",
    "concurrently":           "^8.2.2"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite":                 "^5.2.0"
  }
}
```

---

## SECURITY RULES

1. **Never put BOT_TOKEN or service account JSON in frontend code**
2. **All Telegram API calls go through Express backend only**
3. **Google Sheets API calls go through Express backend only**
4. **Frontend only talks to your Express API — never to Google or Telegram directly**
5. **Add rate limiting to message endpoints** — prevent spam:
```javascript
import rateLimit from 'express-rate-limit'
const msgLimit = rateLimit({ windowMs: 60000, max: 10 })
app.use('/api/messages', msgLimit)
```

---

*SISWIT Production PRD v2.0 — Full Telegram + Google Sheets Integration*
*March 2026*
