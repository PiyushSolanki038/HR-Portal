# SISWIT — How It Works

> Smart HR Management Portal with Telegram Bot + Google Sheets

---

## What Is SISWIT?

SISWIT is an HR management system built for small-to-medium companies. It has **3 parts**:

| Part | Who Uses It | What It Does |
|------|------------|-------------|
| **Web Portal** (React) | HR, Admin, Finance, Owner | Manage employees, attendance, leaves, salary, hiring |
| **Telegram Bot** (Python) | Employees | Submit attendance, request leaves, check status |
| **Google Sheets** | Nobody directly — it's the database | Stores all data (employees, attendance, leaves, etc.) |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  EMPLOYEE'S PHONE                    HR/ADMIN COMPUTER          │
│  ┌─────────────┐                    ┌─────────────────┐        │
│  │  Telegram    │                    │  Web Browser     │        │
│  │  App         │                    │  localhost:5173   │        │
│  └──────┬──────┘                    └────────┬────────┘        │
│         │                                     │                 │
│         ▼                                     ▼                 │
│  ┌─────────────┐                    ┌─────────────────┐        │
│  │ Telegram Bot │                    │ Express Backend  │        │
│  │ (Python)     │                    │ localhost:3001   │        │
│  │ bot/bot.py   │                    │ server/index.js  │        │
│  └──────┬──────┘                    └────────┬────────┘        │
│         │                                     │                 │
│         │         ┌──────────────┐            │                 │
│         └────────►│ Google Sheets│◄───────────┘                 │
│                   │ (Database)   │                               │
│                   │ 6 Tabs       │                               │
│                   └──────────────┘                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Roles & What They Can Do

### 👷 Employee (uses Telegram only)
- `/attend Fixed login bug, reviewed 3 PRs` → Submits today's attendance
- `/leave 2026-03-20 Doctor appointment` → Requests a leave
- `/status` → Sees their attendance stats
- Receives notifications when HR approves/rejects leaves
- Receives salary slip at end of month
- Receives attendance reminders if they forget

### 👩‍💼 HR / Admin (uses Web Portal)
- **Dashboard** → See who's present/absent/late today
- **Attendance** → Today's records + weekly grid view
- **Leaves** → View all leave requests with filters
- **Approvals** → Approve or reject pending leaves (sends Telegram notification to employee)
- **Communication** → Send direct messages or broadcasts to employees via Telegram
- **Employees** → View all employees, click to see detailed profile
- **Employee Profile** → 30-day attendance heatmap, tasks, contact info
- **Onboarding** → Add new employees to the system
- **Hiring** → Manage candidates through pipeline (Applied → Shortlisted → Interviewed → Selected)
- **Documents** → Company policies and templates
- **Settings** → View integrations and system info

### 💰 Finance (uses Web Portal)
- **Payroll** → See gross salary, deductions, net pay for everyone
- **Salary Slips** → View individual salary cards, send via Telegram
- **Deductions** → See who has deductions and why
- **Analytics** → Organization-wide metrics and performance

### 🛡️ Owner (uses Web Portal)
- **Analytics** → KPIs, department performance, top performers
- **Audit Log** → Every action is logged (approvals, messages, updates)
- All other pages for full visibility

---

## Complete Workflows

### Workflow 1: Daily Attendance

```
Morning 9:00 AM
  ├── Employee opens Telegram
  ├── Sends: /attend Fixed login bug, reviewed 3 PRs
  ├── Bot checks if employee is registered (by Telegram Chat ID)
  ├── Bot checks if already submitted today
  ├── Bot checks time:
  │     Before 11 AM → Status: "Present" (p)
  │     After 11 AM  → Status: "Late" (l)
  │     After 6 PM   → Rejected (window closed)
  ├── Bot writes row to Google Sheets → Attendance tab
  └── Bot replies: "✅ Attendance Recorded — On Time!"

Morning 11:30 AM
  ├── HR opens Web Portal → Dashboard
  ├── Portal calls GET /api/attendance/today
  ├── Backend reads Attendance tab from Google Sheets
  ├── Portal shows: 7/8 present, 1 absent
  ├── HR clicks "Remind Absent"
  ├── Portal calls POST /api/messages/remind-absent
  ├── Backend finds absent employees
  └── Backend sends Telegram reminder to each: "⏰ You haven't submitted attendance"
```

### Workflow 2: Leave Request & Approval

```
Employee Side (Telegram)
  ├── Sends: /leave 2026-03-20 Doctor appointment
  ├── Bot counts this month's leaves
  │     Leave #1-3 → Free (no deduction)
  │     Leave #4+  → ₹500 deduction each
  ├── Bot writes row to Google Sheets → Leaves tab (status: "pending")
  └── Bot replies: "📋 Leave Request Submitted! Status: Pending HR Approval"

HR Side (Web Portal)
  ├── Opens Approvals page → sees pending leave card
  ├── Clicks "Approve" (or "Reject" with reason)
  ├── Portal calls POST /api/leaves/{id}/approve
  ├── Backend updates Leaves tab → status: "approved"
  ├── Backend sends Telegram to employee: "✅ Leave Approved for 20 Mar!"
  └── Backend logs action in Audit tab
```

### Workflow 3: Salary Dispatch

```
End of Month
  ├── Finance opens Payroll page
  ├── Portal calls GET /api/payroll
  ├── Backend reads Employees tab
  ├── Backend calculates for each employee:
  │     Gross = salary field
  │     Deductions = (leaves > 3) × ₹500 + (late > 5) × ₹200
  │     Net = Gross - Deductions
  ├── Finance reviews the numbers
  ├── Clicks "Dispatch All Slips"
  ├── Portal calls POST /api/payroll/dispatch-all
  ├── Backend sends formatted salary slip to each employee via Telegram:
  │     💰 Salary Slip — March 2026
  │     Gross: ₹45,000
  │     Deductions: ₹500
  │     Net: ₹44,500
  └── Backend logs dispatch in Audit tab
```

### Workflow 4: Hiring Pipeline

```
HR receives a resume
  ├── Opens Hiring page → clicks "Add Candidate"
  ├── Enters: Name, Position, Department, Contact
  ├── Candidate appears in "Applied" column
  │
  ├── After screening → HR moves to "Shortlisted"
  ├── After interview → HR moves to "Interviewed"
  ├── After selection → HR moves to "Selected"
  │
  └── Ready to hire → HR goes to Onboarding page
      ├── Clicks "Onboard Employee"
      ├── Fills in employee details
      └── Employee is added to Google Sheets → Employees tab
```

### Workflow 5: Communication

```
HR wants to send a message
  ├── Opens Communication page
  │
  ├── Option A: Direct Message
  │     Select employee → Type message → Send
  │     Backend sends to that employee's Telegram
  │
  └── Option B: Broadcast
        Select "All" or specific department → Type message → Send
        Backend sends to all matching employees' Telegram
```

---

## Google Sheets Structure (Your Database)

Your Google Sheet has **6 tabs**. All data lives here:

### Tab 1: Employees
| Column | Example | Purpose |
|--------|---------|---------|
| id | EMP001 | Unique ID |
| name | Rahul Sharma | Full name |
| role | Developer | Job title |
| dept | Engineering | Department |
| av | RS | Avatar initials |
| color | #4f6ef7 | Avatar color |
| status | active | active or inactive |
| telegramChatId | 111000001 | Links to Telegram |
| tg | @rahul_s | Telegram username |
| wa | +91 98765 | WhatsApp number |
| email | rahul@co.com | Email |
| joining | 01 Jan 2025 | Join date |
| salary | 45000 | Monthly salary |
| score | 88 | Performance score (0-100) |
| present | 18 | Days present this month |
| late | 2 | Times late this month |
| absent | 1 | Days absent this month |
| streak | 7 | Current attendance streak |
| leaves | 1 | Leaves taken this month |

### Tab 2: Attendance
| Column | Example |
|--------|---------|
| id | ATT20260314091500 |
| empId | EMP001 |
| empName | Rahul Sharma |
| dept | Engineering |
| date | 2026-03-14 |
| time | 09:15 AM |
| status | p (present), l (late), a (absent), x (on leave) |
| report | Fixed login bug, reviewed 3 PRs |
| submittedAt | 2026-03-14T09:15:00Z |

### Tab 3: Leaves
| Column | Example |
|--------|---------|
| id | LV20260314 |
| empId | EMP003 |
| empName | Sneha Patel |
| dept | Design |
| date | 2026-03-20 |
| type | casual |
| reason | Doctor appointment |
| status | pending / approved / rejected |
| leaveNumber | 2 |
| deductionAmount | 0 (free if ≤3, ₹500 if >3) |
| approvedBy | HR Admin |
| approvedAt | 2026-03-14T15:00:00Z |
| createdAt | 2026-03-14T14:00:00Z |

### Tab 4: Tasks
| Column | Example |
|--------|---------|
| id | TASK1710000000 |
| empId | EMP001 |
| title | Fix payment gateway |
| desc | Stripe integration failing |
| deadline | 2026-03-20 |
| priority | high / medium / low |
| tag | Engineering |
| done | true / false |
| createdAt | 2026-03-14T10:00:00Z |

### Tab 5: Hiring
| Column | Example |
|--------|---------|
| id | CAND1710000000 |
| name | John Doe |
| appliedFor | Frontend Developer |
| dept | Engineering |
| contact | john@email.com |
| stage | applied / shortlisted / interviewed / selected / rejected |
| interviewDate | 2026-03-18 |
| score | 85 |
| notes | Strong React skills |
| createdAt | 2026-03-14T09:00:00Z |

### Tab 6: Audit
| Column | Example |
|--------|---------|
| id | AUD1710000000 |
| type | approval / warning / update / dispatch / creation / login |
| description | Sneha Patel leave approved by HR Admin |
| actor | HR Admin |
| timestamp | 2026-03-14T15:00:00Z |

---

## Deduction Rules

| Condition | Deduction |
|-----------|-----------|
| First 3 leaves per month | ₹0 (free) |
| Each leave after 3 | ₹500 per leave |
| More than 5 late arrivals | ₹200 flat fee |

**Example:** Employee takes 5 leaves and is late 7 times:
- Leave deduction: (5 - 3) × ₹500 = ₹1,000
- Late deduction: ₹200
- **Total deduction: ₹1,200**

---

## File Structure

```
siswit/
├── .env                    ← Backend credentials (Google Sheets + Telegram)
├── .env.local              ← Frontend API URL
├── package.json            ← Dependencies and scripts
├── vite.config.js          ← Frontend bundler config
├── index.html              ← HTML entry point
│
├── server/                 ← EXPRESS BACKEND (Node.js)
│   ├── index.js            ← Server entry (mounts all routes)
│   ├── sheets.js           ← Google Sheets read/write helpers
│   ├── telegram.js         ← Telegram message sending
│   └── routes/
│       ├── employees.js    ← GET/POST/PATCH employees
│       ├── attendance.js   ← Today's attendance, weekly grid
│       ├── leaves.js       ← Leave CRUD + approve/reject
│       ├── tasks.js        ← Task CRUD + reminders
│       ├── hiring.js       ← Candidate pipeline
│       ├── payroll.js      ← Salary calculations + dispatch
│       ├── audit.js        ← Audit log
│       └── messages.js     ← Direct/broadcast/remind messaging
│
├── bot/                    ← TELEGRAM BOT (Python)
│   ├── bot.py              ← Main bot entry
│   ├── config.py           ← Bot token + settings
│   ├── sheets.py           ← Google Sheets helpers for Python
│   ├── requirements.txt    ← Python dependencies
│   └── handlers/
│       ├── attend.py       ← /attend command
│       ├── leave.py        ← /leave command
│       ├── status.py       ← /status command
│       ├── register.py     ← /start command
│       └── help.py         ← /help command
│
└── src/                    ← REACT FRONTEND
    ├── main.jsx            ← App entry point
    ├── App.jsx             ← Router (17 pages)
    ├── styles/
    │   ├── index.css       ← Design system (colors, fonts, utilities)
    │   ├── layout.css      ← Sidebar, topbar, app shell
    │   └── components.css  ← Component-specific styles
    ├── services/
    │   └── api.js          ← All API calls to backend
    ├── context/
    │   ├── AuthContext.jsx  ← Login/logout state
    │   ├── ToastContext.jsx ← Toast notifications
    │   └── DataContext.jsx  ← Global data (employees, attendance, leaves)
    ├── hooks/
    │   ├── useAuth.js
    │   ├── useToast.js
    │   ├── useEmployees.js
    │   ├── useAttendance.js
    │   ├── useLeaves.js
    │   └── useTasks.js
    ├── components/
    │   ├── layout/
    │   │   ├── AppShell.jsx      ← Main layout wrapper
    │   │   ├── Sidebar.jsx       ← Navigation sidebar
    │   │   └── Topbar.jsx        ← Top bar with search + user
    │   └── ui/
    │       ├── StatCard.jsx       ← Dashboard metric card
    │       ├── Modal.jsx          ← Popup dialog
    │       ├── Toast.jsx          ← Notification toast
    │       ├── ProgressBar.jsx    ← Progress indicator
    │       ├── PerformanceRing.jsx← SVG score ring
    │       ├── AttendanceHeatmap.jsx ← 30-day heatmap
    │       └── LoadingSpinner.jsx ← Loading state
    └── pages/
        ├── Login.jsx           ← Sign in page
        ├── Dashboard.jsx       ← Overview + today's attendance
        ├── Attendance.jsx      ← Attendance records + weekly grid
        ├── Leaves.jsx          ← Leave history
        ├── Approvals.jsx       ← Approve/reject pending leaves
        ├── Communication.jsx   ← Direct messages + broadcasts
        ├── Hiring.jsx          ← Candidate pipeline (Kanban)
        ├── Onboarding.jsx      ← New employee onboarding
        ├── Documents.jsx       ← Company documents
        ├── Employees.jsx       ← Employee list
        ├── EmployeeProfile.jsx ← Individual employee page
        ├── Payroll.jsx         ← Salary overview
        ├── Salary.jsx          ← Individual salary slips
        ├── Deductions.jsx      ← Deduction breakdown
        ├── Analytics.jsx       ← Org metrics + charts
        ├── Audit.jsx           ← Activity log
        └── Settings.jsx        ← System settings
```

---

## How to Run

### Start the Frontend (React Portal)
```bash
npm run dev
# Opens at http://localhost:5173
```

### Start the Backend (Express API)
```bash
npm run dev:server
# Runs at http://localhost:3001
# Test: http://localhost:3001/api/health
```

### Start the Telegram Bot (Optional)
```bash
cd bot
pip install -r requirements.txt
python bot.py
```

### Run Frontend + Backend together
```bash
npm run dev:all
```

---

## API Endpoints

| Method | Endpoint | What It Does |
|--------|----------|-------------|
| GET | /api/employees | Get all employees |
| GET | /api/employees/:id | Get one employee |
| POST | /api/employees | Add new employee |
| PATCH | /api/employees/:id | Update employee |
| GET | /api/attendance/today | Today's attendance |
| GET | /api/attendance/employee/:empId | Employee's attendance history |
| GET | /api/attendance/weekly | Last 5 working days grid |
| GET | /api/leaves | All leaves |
| GET | /api/leaves/pending | Pending leaves only |
| POST | /api/leaves/:id/approve | Approve leave + notify via Telegram |
| POST | /api/leaves/:id/reject | Reject leave + notify via Telegram |
| GET | /api/tasks/employee/:empId | Employee's tasks |
| POST | /api/tasks | Create task |
| PATCH | /api/tasks/:id/toggle | Toggle task done/undone |
| POST | /api/tasks/:id/remind | Send task reminder via Telegram |
| GET | /api/hiring | All candidates |
| POST | /api/hiring | Add candidate |
| PATCH | /api/hiring/:id/stage | Update candidate stage |
| GET | /api/payroll | Payroll with calculated salaries |
| POST | /api/payroll/dispatch/:empId | Send salary slip via Telegram |
| POST | /api/payroll/dispatch-all | Send all salary slips |
| POST | /api/messages/direct | Send DM to one employee |
| POST | /api/messages/broadcast | Broadcast to all/department |
| POST | /api/messages/remind-absent | Remind absent employees |
| GET | /api/audit | Get audit log |
| GET | /api/health | Health check |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + React Router v6 |
| Styling | CSS Variables (dark theme) |
| Icons | Lucide React |
| Backend | Node.js + Express |
| Database | Google Sheets (via googleapis) |
| Telegram | node-telegram-bot-api (backend) + python-telegram-bot (bot) |
| Bot | Python 3.10+ with gspread |
