# SISWIT ENTERPRISE — COMPLETE FEATURES & FUNCTIONS LIST
## Dono PRDs se merge karke banaya gaya — kuch bhi miss nahi

---

## SYSTEM OVERVIEW

- Single Login Page — ek hi URL sab ke liye
- Role auto-detection — ID prefix se: HR→hr, ADM→admin, FIN→finance, baaki→employee
- JWT-based authentication with RBAC
- Google Sheets primary database (9 tabs)
- Telegram Bot employee-facing layer
- Express Backend API
- Dark Theme UI (#0a0a0f background, #4f6ef7 indigo accent)
- Mobile Responsive (375px se desktop tak)
- Zero infrastructure cost (free tiers)

---

## SECTION 1 — LOGIN & AUTHENTICATION

- Employee ID + Password login form
- Password show/hide toggle
- Role auto-detect from ID prefix
- JWT token generate on login
- Session persist via localStorage
- Auto-redirect to role-specific dashboard
- "New here? Contact HR" message
- "Forgot password? Ask your manager" message
- Demo chips: Employee / HR / Admin / Finance
- Logout from any page
- Session timeout handling
- IP-based audit on every login

---

## SECTION 2 — DESIGN SYSTEM

- Dark UI — background #0a0a0f
- Accent Indigo — #4f6ef7
- Muted color — #94a3b8
- Fonts: Syne (headings) + Inter (body) + JetBrains Mono (IDs/codes)
- Glassmorphism cards with frosted glass effect
- Subtle micro-animations on hover
- Smooth page transitions (fadeSlide)
- Role-based theme color shift per portal
- Responsive flex-wrap layouts
- Custom scrollbar
- Toast notifications (bottom-right, dark bg, colored border)
- Modal with blur backdrop
- Loading spinner
- Empty state illustrations

---

## SECTION 3 — TELEGRAM BOT (EMPLOYEE FACING)

Employee sirf bot se interact karta hai — web portal nahi.

### Bot Commands
- `/start` — Registration check + welcome message
- `/attend [work report]` — Attendance submit karo
- `/leave [date] [reason]` — Leave request karo
- `/status` — Aaj ki aur monthly stats dekho
- `/help` — Sab commands ki list

### Bot Logic
- 11 AM cutoff — iske pehle = Present, baad mein = Late
- 6 PM closing — iske baad submit nahi hoga
- Already submitted check — duplicate prevent karo
- Chat ID se employee identify karo
- Google Sheets mein row automatically add ho
- Leave number count karo (3 se zyada = ₹500 deduction warning)
- Task assignment notification — jab HR koi task assign kare
- Leave approval notification — jab HR approve/reject kare
- Salary slip dispatch — end of month
- Attendance reminder — 11 AM tak nahi kiya toh reminder
- Warning notification — jab HR warning issue kare
- Broadcast message — HR se company-wide announcement

---

## SECTION 4 — EMPLOYEE PORTAL (WEB — LIMITED)

NOTE: Employee primarily bot use karta hai. Web portal mein sirf read-only personal data.

### Dashboard
- "Good morning/afternoon/evening, {name}"
- Today's Status card:
  - If submitted: On Time ✅ / Late ⚠️ with time + report
  - If not submitted: Warning + "Submit via Telegram bot" button
- 3 mini stat cards: Attendance This Month / Leave Balance / Tasks Pending
- GitHub-style Attendance Heatmap (full month)
- My Tasks section (grouped by priority)
- Chat with HR / Mentor preview
- Leave Requests status list
- Quick Actions buttons

### My Attendance Page
- Monthly stats: Present / Late / Absent / On Leave
- Full GitHub-style calendar heatmap
- Attendance log table: Date | Time | Status | Work Report
- Month selector (current + past 3 months)
- Export to CSV button

### My Leaves Page
- Leave balance card: Allowed (3) / Used / Remaining
- Apply Leave button
- Apply Leave Modal: Date picker + Type + Reason + Deduction warning
- Leave history table: Date | Type | Reason | Status | Deduction
- Cancel pending request button

### My Tasks Page
- Filter tabs: All / Overdue / Due Soon / Upcoming / Done
- Task list with priority colors
- Colored left bar per deadline status
- Mark Complete checkbox
- Bell reminder button
- Task detail (description, assigned by, deadline)
- Task count per filter

### Chat Page
- Chat with HR (direct)
- Chat with Mentor (one-on-one)
- Team Group Chat
- Message bubbles (sent right / received left)
- Timestamps + Read receipts (✓✓)
- File attachment (images, docs)
- Typing indicator
- Unread count badge
- Search conversations
- Enter to send, Shift+Enter newline

### My Profile Page
- View personal info (name, dept, role, ID, email, phone, telegram)
- Edit name, phone, email
- Change password
- Notification preferences toggle
- View joining date, salary, manager name

---

## SECTION 5 — HR PORTAL

### HR Dashboard
- "Good morning, {name}" + today's date
- Role chip: HR Manager
- "+ Broadcast" button
- 4 KPI stat cards:
  - Present Today (green)
  - Absent (red) — clickable → attendance page
  - Pending Leaves (amber) — clickable → leaves page
  - On Leave (sky blue)
- Quick Stats card: Total Employees / Present % / On Leave / Absent / Pending Approvals
- Not Submitted Yet table: absent employees + 💬 ✈️ Warn buttons
- "Remind All" button — Telegram reminder to all absent
- Pending Approvals preview: top 2 leave cards with Approve/Reject
- Today's Summary: progress bars (On Time / Late / Absent / On Leave)
- Department-wise attendance table: Dept | Present | Late | Absent
- Recent Messages preview: last 3 employee messages
- Hiring Pipeline mini view: Applied / Shortlisted / Interview counts
- HR Reports & Analytics quick links
- Recent Activity feed

### Attendance Management
- Two tabs: Today's Log | Weekly Grid
- Today's Log table: Employee | Dept | Time | Status chip | Work Report | Actions
- Absent rows: rose background + 💬 WhatsApp + ✈️ Telegram + Warn buttons
- Late rows: amber background + Warn button
- Weekly Grid: Mon-Fri heatmap per employee
- Search by name (real-time)
- Filter by: Status / Department
- "Remind All Absent" button
- Attendance Correction handling: approve/reject employee edit requests
- Re-submission requests: allow/deny
- Export attendance to CSV
- Sync button (refresh from Google Sheets)

### Leave Management
- 3 stat cards: Pending / Approved This Month / With Deduction
- Pending approval cards: Name + Type + Date + Reason + Deduction chip
- Approve button (green) — updates Sheets + Telegram notification
- Reject button (red) — updates Sheets + Telegram notification
- Notify button — send Telegram message
- Bulk Approve option — multiple leaves at once
- Leave Calendar — team view by month
- Leave balance per employee
- Leave Register table: Employee | Date | Type | Reason | Status | Leave# | Deduction | Approved By
- Export leave register CSV

### Approvals Page (Aggregated)
- Leave Approvals section
- Edit Request approvals: Old text vs New text side by side
- Re-Submission Request approvals
- All approve/reject/allow/deny update state + toast + Telegram notification

### Employee Management (Directory)
- Search by name, dept, role (real-time)
- Filter by department dropdown
- Employee table: ID | Name | Dept | Telegram | Salary | Leaves | Score | Status | Actions
- Profile button → Employee Profile page
- Message icon button
- Add Employee button + modal:
  - ID, Name, Dept, Role, Salary, Telegram, WhatsApp, Email, Joining Date, Password
- Edit Employee modal
- Deactivate employee (offboarding)
- Document upload/view per employee

### Employee Profile (Full Detail Page)
- Employee Switcher pills (scroll horizontally)
- Hero Section:
  - Dark gradient banner (navy to blue)
  - 88px rounded avatar with online dot
  - Name (Syne font), role chip, dept chip, ID mono chip, status chip
  - Action buttons: Add Task / Message / Edit Profile
- 6-column Stats Row: Present | Late | Absent | Streak | Leaves | Score
- LEFT COLUMN:
  - Task Manager card:
    - Filter tabs: All / Overdue / Due Soon / On Track / Done (with counts)
    - Colored left bar per deadline
    - Checkbox toggle (green when done)
    - Deadline chip with color
    - Tag chip + Priority chip
    - Bell reminder button (sends Telegram)
    - Quick-add task bar (Enter to add)
    - Mini performance ring showing task completion %
  - Attendance History card:
    - Tab 1 — Heatmap: GitHub-style calendar
    - Tab 2 — Daily Log: table with date, time, status, report
    - Tab 3 — Monthly Stats: On Time / Late+Absent boxes + 3 progress bars
    - Export button
  - Activity Timeline card:
    - Attendance submission
    - Task completed
    - Leave taken
    - Joining date
- RIGHT COLUMN:
  - Performance Score card:
    - Big number (Syne font)
    - SVG donut ring (colored by score)
    - vs last month trend chip
    - 4 progress bars: Attendance / Punctuality / Task Completion / Leave Usage
    - Month selector dropdown
  - Mentor card:
    - Gradient avatar
    - Mentor name, role, "Since" date
    - 4 action buttons: WhatsApp / Telegram / Email / Notify
    - Private mentor notes list (green/amber/blue dots)
    - Add Note button → modal
    - Change Mentor button → modal
  - Profile Info card:
    - All contact fields
    - WhatsApp / Telegram / Email send buttons
    - Edit button
  - Disciplinary / Warning Log card:
    - Formal warning list with severity (red/amber)
    - "Excellent Record" badge if no warnings
    - Issue Warning button (opens Telegram notification)
    - Warning details: title, reason, date, severity
  - Leave Summary card:
    - 3-box grid: Allowed / Used / Remaining
    - Leave history list
    - Request Leave on Behalf button
- 5 Modals: Add Task | Add Note | Assign Mentor | Send Message | Edit Profile

### Hiring Pipeline
- 6-stage Kanban board: Applied → Shortlisted → Interviewed → Selected → Offered → Joined
- 4 stat cards: Total Applications / Interviews / Selected / Joined
- Candidate cards per column: Name + Role + Dept chip + Interview date + Score
- Add Candidate modal: Name | Role | Dept | Contact | Stage
- Move stage button
- Schedule Interview (sets date chip on card)
- Send Offer button
- Convert to Employee flow (moves to Onboarding)
- Reject candidate
- Communication buttons per card: 💬 ✈️ 📧

### Onboarding
- Active onboarding list
- Per employee: 10-item interactive checklist
- Progress chip updates live
- Checklist items:
  1. Offer letter sent & accepted
  2. ID proof & documents collected
  3. Added to Telegram group
  4. Attendance bot registered
  5. System access credentials created
  6. Laptop & equipment assigned
  7. HR policy document shared
  8. Salary structure explained
  9. Team introduction meeting done
  10. First week task assigned
- Welcome dispatch buttons: WhatsApp / Telegram / Email
- Start Onboarding modal
- Templates panel: 5 document templates

### Document Vault
- Table: Employee | Document Type | Uploaded | Status | Actions
- Status chips: Verified / Pending / Missing
- Search + type filter
- View + Download buttons
- Upload button + modal

### Communication Hub
- Broadcast panel:
  - Channel toggles: WhatsApp / Telegram / Email (multi-select)
  - Recipients: All / by Department / Individual
  - Subject + Message
  - Send Broadcast + Schedule buttons
- Direct Message panel:
  - Employee dropdown
  - Message textarea
  - Channel buttons
- Quick Actions (5 preset):
  - Remind Absent Employees
  - Send 11 AM Deadline Alert
  - Send Weekly Report
  - Notify Salary Slips Ready
  - Send Holiday Notice
- Message Templates: save + reuse
- Recent Broadcasts list with channel + recipient count
- Chat History view

### Task Management (HR side)
- Assign tasks to any employee
- Task templates (reusable)
- Track completion per employee
- Send reminders via bot
- Overdue task alerts

### HR Analytics
- 4 stat cards with progress bars: Avg Attendance / Avg Score / Leaves / Warnings
- Department attendance chart (progress bars)
- Performance leaderboard (top 5)
- Attendance Report export
- Leave Analysis export
- Employee Turnover report
- Headcount report (department-wise)
- Monthly HR Summary
- Generate AI Report button

---

## SECTION 6 — FINANCE PORTAL

### Finance Dashboard
- "Good morning, {name}" + date
- Role chip: Finance Manager
- Payroll Summary card:
  - Total Employees
  - Total Gross salary
  - Total Deductions
  - Net Payroll
  - Processing Date
  - Process Payroll button
  - Send All Slips button
- 3 mini stat cards: Salary Slips Pending / Deductions This Month / Tax This Year
- Payroll Processing Queue table: EmpID | Name | Gross | Net | Status | Actions
- Deduction Breakdown card: Leave Deductions / Late Penalties / TDS / PF / Professional Tax
- Recent Salary Slips: sent/pending status
- Financial Reports quick links
- Employee Loans & Advances preview

### Payroll Processing
- Monthly payroll register
- 4 stat cards: Total Payroll / Deductions / Net Payable / Pay Date
- Salary table: Employee | Dept | Gross | Deductions | Net | Status | Actions
- Deduction calculation engine:
  - Extra leaves (>3): ₹500 per leave
  - Late arrivals (>5): ₹200 flat penalty
- Process Selected button
- Export to Bank button (CSV format)
- Preview Mode before final processing
- Payroll history (past months)

### Salary Slips
- All employees pending slip list
- Per row: Employee | Net Salary | Deduction note | Status | 💬 ✈️ 📧 buttons
- Status: Pending → Sent (updates on click)
- Send All via WhatsApp button
- Send All via Telegram button
- Generate All (PDF/HTML)
- Download ZIP (bulk)
- Email Slips option

### Deductions
- 2 stat cards: Total Deductions / Employees Affected
- Breakdown progress bars: Extra Leaves vs Late Penalties vs TDS vs PF vs Professional Tax
- Affected employees table: Employee | Gross | Reason | Amount | Net
- Waive Deduction button per row
- Manual Deduction add (one-time)
- Configure Deduction Rules
- Deduction history

### Tax Management
- TDS Calculation (auto-compute)
- Tax Reports generate
- Form 16 annual statement
- Investment Declarations tracking
- YTD Analysis

### Financial Reports
- Monthly Payroll Summary
- YTD Analysis (year-to-date)
- Department-wise Cost breakdown
- Month-over-month comparison
- Bank Export Files (multiple formats)
- Tax Reports

### Loans & Advances
- Track active employee loans
- Total outstanding amount
- EMI calculation (monthly deduction)
- Pending approval list
- Approve/reject loan requests
- Manager approval workflow

### Finance Audit Log
- Finance-related events only
- Export to CSV

---

## SECTION 7 — ADMIN / OWNER PORTAL

### Admin Dashboard
- "Good morning, {name}" + date
- Role chip: Owner / Admin
- System Health card:
  - All Systems Operational indicator
  - API Response Time
  - Active Users count
  - Google Sheets: Connected ✓
  - Telegram Bot: Connected ✓
  - Last Backup timestamp
- 3 mini stat cards: Today's Activity / Pending Tasks / System Uptime (99.9%)
- Recent Audit Log: last 5 entries
- System Configuration shortcuts
- User Management overview: Employees / HR / Finance / Admin counts
- Task Management: urgent tasks
- Backup & Recovery status
- API & Integrations panel
- Top Performers: top 3 by score
- Quick Actions: 6 buttons

### User Management
- All system users list
- Role counts: Employees / HR / Finance / Admin
- Active sessions count
- Per user: View / Edit Role / Deactivate / Reset Password
- Add System User button + modal
- Role assignment dropdown
- Permission matrix view

### System Configuration
- Attendance Settings: late cutoff time, closing time
- Leave Policy: free leaves per month, deduction per extra leave
- Payroll Settings: processing date, payment method
- Notification Rules: which events trigger what alerts
- Role Permissions: edit access matrix

### Audit Log (Full)
- Every action logged: approvals, logins, updates, dispatches, warnings
- Color-coded by type: green=approval, red=warning, blue=update, amber=dispatch, violet=creation, sky=login
- Filter by: user, type, date range, module
- Search functionality
- Export to CSV
- Immutable (cannot be deleted or edited)
- Shows: timestamp, actor, action, description, IP address, module

### Backup & Recovery
- Automated daily backup
- Manual backup on demand
- Restore points (30 days)
- Backup size display
- Next backup scheduled time
- Test restore functionality
- Backup Now button

### API & Integrations
- Telegram Bot Token (masked)
- Google Sheet ID (masked)
- API Calls Today count
- Rate Limit usage %
- Test Connections button
- Edit credentials button
- WhatsApp Business API status
- Email SMTP status

### Security Settings
- Password policy rules
- 2FA settings (future)
- Login attempt monitoring
- IP whitelist management
- Session management

---

## SECTION 8 — CHAT SYSTEM (All Roles)

- Two-panel layout: conversation list + chat area
- Left panel: search + pinned contacts + conversation list
- Right panel: header + messages + input
- Conversation list: avatar + name + last message + time + unread badge
- Message bubbles: sent (right, primary color) / received (left, white/glass)
- Date separators: "Today" / "Yesterday" / "14 Mar"
- Read receipts: ✓ sent, ✓✓ read
- Typing indicator (animated dots)
- File attachment (paperclip icon)
- Emoji button
- Enter to send, Shift+Enter for newline
- Auto-scroll to bottom on new message
- Mark as read when opened
- Group chat for departments
- Pinned contacts: HR (always top for employees), Mentor
- Message timestamps (relative: "2m ago", "Yesterday")
- Empty state: "Select a conversation"
- Mobile: full screen single panel

### Chat Channel Types
- Direct (Employee ↔ Employee)
- Mentor Chat (Employee ↔ Mentor)
- HR Chat (Employee ↔ HR)
- Team Chat (Department group)
- Company Broadcast (announcements only)
- Task Discussion (per task thread)

---

## SECTION 9 — NOTIFICATIONS SYSTEM

- Bell icon in topbar with unread count badge
- Dropdown: last 5 notifications
- "Mark All Read" button
- Full notifications page
- Filter: All / Unread / Tasks / Leaves / Messages / System
- Notification types:
  - Task assigned (with deadline)
  - Task reminder (before deadline)
  - Leave approved/rejected
  - Attendance reminder (11 AM)
  - New message
  - System announcement
  - Warning issued
  - Salary slip ready
- Each: icon + title + description + time + link
- Unread = bold, read = normal
- Real-time updates (simulated 60s refresh)

---

## SECTION 10 — GOOGLE SHEETS DATABASE (9 Tabs)

### Tab 1: Employees
id | name | role | dept | password | email | phone | telegramChatId | avatar | color | status | joining | salary | present | late | absent | leaves | score | managerId | role_type | lastLogin

### Tab 2: Attendance
id | empId | empName | dept | date | time | status | report | submittedAt

### Tab 3: Leaves
id | empId | empName | dept | date | type | reason | status | leaveNumber | deductionAmount | approvedBy | approvedAt | createdAt

### Tab 4: Tasks
id | assignedTo | assignedBy | title | description | deadline | priority | status | completedAt | comments | attachments

### Tab 5: Messages
id | fromId | toId | message | timestamp | read | attachments | channel | threadId

### Tab 6: Payroll
id | empId | month | year | gross | deductions | net | status | processedBy | processedAt

### Tab 7: Hiring
id | name | position | dept | stage | contact | resume | interviewDate | feedback | status

### Tab 8: Audit
id | userId | action | description | timestamp | ipAddress | module

### Tab 9: Settings
key | value | type | description | updatedBy | updatedAt

### Tab 10: Mentors (from File 1)
id | name | expertise | email | phone | assignedTo | since | feedback | active

---

## SECTION 11 — MENTOR SYSTEM (Upgraded)

- External Mentors directory (company ke bahar ke bhi)
- Mentor expertise tags
- Assign mentor to employee
- Change mentor anytime
- Private feedback logs per employee
- Note types: Positive (green) / Warning (amber) / Observation (blue)
- Mentor can message employee via portal → delivers to Telegram
- Mentor profile card in employee profile
- "Since" date tracking
- Active/Inactive status

---

## SECTION 12 — DISCIPLINARY SYSTEM (Upgraded)

- Formal warning issuance
- Warning types: Red (Serious) / Amber (Warning)
- Warning details: title + reason + date + issued by
- "Excellent Record" badge if zero warnings
- Warning history per employee
- Issue Warning → automatically sends Telegram notification to employee
- Warning appears in employee profile right column
- Disciplinary events logged in Audit Log
- HR can view all warnings across all employees

---

## SECTION 13 — KPI TRACKING

### Attendance Score (0-100)
- Attendance rate: 40% weightage
- Punctuality rate: 30% weightage
- Task completion: 30% weightage
- Score colors: ≥90 green, ≥75 blue, ≥60 amber, <60 red

### Leave Balance KPI
- 3 free leaves per month
- 4th leave onwards: ₹500 deduction
- 5+ late arrivals: ₹200 penalty
- Real-time tracking

### Task Streak KPI
- Consecutive days of task completion
- Streak shown on employee profile
- Breaks if task overdue without completion
- Displayed as "7d streak" badge

---

## SECTION 14 — MOBILE RESPONSIVE

- 375px minimum viewport
- Sidebar → bottom navigation (5 icons) on mobile
- Modals → full screen on mobile
- Tables → horizontal scroll
- Stat cards → 2 per row (mobile) / 4 per row (desktop)
- Hero profile → stacked layout on mobile
- Chat → single panel on mobile with back button
- Font sizes reduce on small screens
- Touch-friendly button sizes (min 44px height)

---

## SECTION 15 — PERFORMANCE & TECHNICAL

- React 18 + Vite
- React Router v6
- useState + useContext (no Redux)
- Lucide React icons
- CSS Variables (no Tailwind)
- JWT authentication
- Node.js + Express backend
- Python Telegram Bot
- Google Sheets API (googleapis)
- Vercel deployment (frontend)
- Railway deployment (backend + bot)
- 60-second auto-refresh
- Optimistic state updates
- Error boundaries
- Loading states everywhere
- Empty states with illustrations

---

## QUICK COUNT

| Category | Count |
|----------|-------|
| Total Roles | 4 (Employee, HR, Finance, Admin/Owner) |
| Total Pages | 30+ |
| Total Features | 400+ |
| Bot Commands | 5 (/start /attend /leave /status /help) |
| Google Sheets Tabs | 10 |
| Notification Types | 8 |
| Chat Channel Types | 6 |
| Hiring Pipeline Stages | 6 |
| Onboarding Checklist Items | 10 |
| Quick Action Presets | 5 |

---

*SISWIT Enterprise — Complete Merged Feature List*
*File 1 (SISWIT HRMS PRD) + File 2 (Multi-Portal PRD) — Combined*
*March 2026*
