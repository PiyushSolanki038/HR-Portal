# SISWIT — EMPLOYEE PORTAL (FULL SPEC)
## Complete Web Dashboard for Employees
### Version 1.0 — All 6 Modules

---

> Employee ab web + bot dono se kaam kar sakta hai.
> Web se attendance mark kar sakta hai, tasks complete kar sakta hai,
> leaves apply kar sakta hai, chat kar sakta hai, profile edit kar sakta hai,
> aur apni salary slips dekh sakta hai.

---

## EMPLOYEE LOGIN

### Login Credentials (Demo)
```javascript
// Employees login karte hain apne ID se
{ id:'DEV01', password:'dev123', role:'employee', name:'Sunny' }
{ id:'DEV02', password:'dev123', role:'employee', name:'Piyush' }
{ id:'MKT01', password:'mkt123', role:'employee', name:'Bipul' }
// ... all employees
```

### Role Detection
```javascript
// DEV, MKT, EMP prefix = employee
function detectRole(id) {
  if (id.startsWith('ADM')) return 'admin'
  if (id.startsWith('HR'))  return 'hr'
  return 'employee'
}
```

---

## EMPLOYEE SIDEBAR NAVIGATION

```
┌─────────────────────────┐
│  S  SISWIT              │
│     Employee Portal     │
├─────────────────────────┤
│  MY WORKSPACE           │
│  🏠 Dashboard           │
│  📋 My Attendance       │
│  ✅ My Tasks            │
│  🏖 My Leaves           │
├─────────────────────────┤
│  COMMUNICATION          │
│  💬 Chat                │
├─────────────────────────┤
│  PERSONAL               │
│  💰 My Salary           │
│  👤 My Profile          │
├─────────────────────────┤
│  ┌─────────────────┐    │
│  │ 👤 Sunny        │    │
│  │    DEV01        │    │
│  │    Developer    │    │
│  │ [ Sign Out ]    │    │
│  └─────────────────┘    │
└─────────────────────────┘
```

### Employee Sidebar Theme
- Same dark theme as HR/Admin: `#08080f` background
- Accent color: `#4f6ef7` indigo
- Active nav item: accent-soft bg + accent left border
- Employee role chip: green color (different from HR blue, Admin indigo)

---

## PAGE 1 — EMPLOYEE DASHBOARD

**Route:** `/dashboard`

### Page Header
- "Good morning/afternoon, {firstName}" — Syne font
- Today's date + day
- Role chip: "👤 Employee" (green)
- "Mark Attendance" button (primary, top right) — if not submitted today

---

### Today's Status Card (Full Width, Top)

**If NOT submitted today:**
```
┌─────────────────────────────────────────────────┐
│  ⚠️  You haven't submitted attendance today      │
│                                                  │
│  Deadline: 11:00 AM (On Time) · 6:00 PM (Closes)│
│  Time remaining: 2h 15m                          │
│                                                  │
│  Work Report (what did you work on today?)       │
│  ┌─────────────────────────────────────────┐    │
│  │ Type your work report here...           │    │
│  └─────────────────────────────────────────┘    │
│                                                  │
│  [ ✅ Mark Attendance Now ]                      │
└─────────────────────────────────────────────────┘
```

**If submitted — On Time:**
```
┌─────────────────────────────────────────────────┐
│  ✅ You're On Time!                              │
│  15 Mar 2026 · 09:15 AM                          │
│  "Fixed login bug, reviewed 3 PRs, updated docs" │
│                                [ View Details ]  │
└─────────────────────────────────────────────────┘
```

**If submitted — Late:**
```
┌─────────────────────────────────────────────────┐
│  ⚠️  Late Submission                             │
│  15 Mar 2026 · 02:30 PM                          │
│  "Client meeting ran late, worked on API fixes"  │
│                                [ View Details ]  │
└─────────────────────────────────────────────────┘
```

---

### 3 Mini Stat Cards
```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ ATTENDANCE  │  │   LEAVES    │  │    TASKS    │
│ THIS MONTH  │  │   BALANCE   │  │   PENDING   │
├─────────────┤  ├─────────────┤  ├─────────────┤
│   18 Days   │  │   2 Left    │  │   3 Tasks   │
│  15 On Time │  │  1 Used     │  │  1 Due Today│
│   3 Late    │  │  3 Total    │  │  2 Upcoming │
└─────────────┘  └─────────────┘  └─────────────┘
```

---

### GitHub-Style Attendance Heatmap (This Month)
- Full month calendar grid
- Mon–Sun rows, week columns
- Cell colors:
  - Blue `#3b82f6` = Present (On Time)
  - Amber `#f59e0b` = Late
  - Red `#ef4444` = Absent
  - Light gray = Weekend/Holiday
  - Empty = No data
- Hover tooltip: "Mar 5 · Present · 09:15 AM"
- Legend: Present | Late | Absent | Holiday

---

### My Tasks Preview (Top 3)
```
┌─────────────────────────────────────────────────┐
│  MY TASKS                    [ View All Tasks → ]│
├─────────────────────────────────────────────────┤
│  🔴 HIGH  Fix production bug — login timeout     │
│           Assigned by: Pooja (HR)                │
│           Due: Today  [ ✓ Mark Complete ] [ 💬 ] │
├─────────────────────────────────────────────────┤
│  🟡 MED   Review PR #24 — Payment module         │
│           Assigned by: Anand (Mentor)            │
│           Due: Tomorrow  [ ✓ ] [ 💬 ]            │
├─────────────────────────────────────────────────┤
│  🟢 LOW   Update API documentation               │
│           Assigned by: HR Team                   │
│           Due: 20 Mar  [ ✓ ] [ 💬 ]              │
└─────────────────────────────────────────────────┘
```

---

### Chat Preview
```
┌─────────────────────────────────────────────────┐
│  RECENT MESSAGES              [ Open Chat → ]   │
├─────────────────────────────────────────────────┤
│  👤 Pooja (HR)                                  │
│     "Your leave for tomorrow has been approved" │
│     10:30 AM · ✓✓ Read                          │
├─────────────────────────────────────────────────┤
│  👤 Anand (Mentor)                              │
│     "Please review the PR when you're free"    │
│     09:15 AM · ✓✓ Read                          │
└─────────────────────────────────────────────────┘
```

---

### Leave Status Preview
```
┌─────────────────────────────────────────────────┐
│  MY LEAVES                  [ View All Leaves →]│
├─────────────────────────────────────────────────┤
│  20 Mar 2026 — Sick Leave     ✅ Approved        │
│  25 Mar 2026 — Casual Leave   ⏳ Pending         │
├─────────────────────────────────────────────────┤
│  [ + Apply for Leave ]                          │
└─────────────────────────────────────────────────┘
```

---

### Quick Actions Bar
```
[ 📋 Mark Attendance ]  [ 🏖 Apply Leave ]
[ 📊 View My Report  ]  [ 💬 Message HR  ]
```

---

## PAGE 2 — MY ATTENDANCE

**Route:** `/my-attendance`

### Page Header
- "My Attendance" — Syne font
- Month selector dropdown (current + past 3 months)
- "⬇ Export Report" button

---

### Mark Attendance Section (if not submitted today)
```
┌─────────────────────────────────────────────────┐
│  📋 Mark Today's Attendance                      │
│  15 March 2026 — Sunday                          │
│                                                  │
│  What did you work on today?                     │
│  ┌─────────────────────────────────────────┐    │
│  │ Describe your work for the day...       │    │
│  │ (min 10 characters)                     │    │
│  └─────────────────────────────────────────┘    │
│                                                  │
│  ⏰ Before 11:00 AM = On Time                    │
│  ⚠️  After 11:00 AM = Late                       │
│  ❌ After 6:00 PM = Window Closed                │
│                                                  │
│  [ ✅ Submit Attendance ]                        │
└─────────────────────────────────────────────────┘
```

After submit:
- Instant toast: "✅ Attendance recorded — On Time!" or "⚠️ Attendance recorded — Late"
- Status card updates immediately
- Telegram bot also sends confirmation

---

### This Month Stats (4 cards)
- Present (green): count
- Late (amber): count
- Absent (red): count
- On Leave (blue): count

---

### GitHub-Style Heatmap (Full Month)
- Same as dashboard but larger
- All 31 days visible
- Day labels (Mo Tu We Th Fr Sa Su)
- Color legend below

---

### Attendance Log Table
- Columns: Date | Day | Time | Status | Work Report | Actions
- Status chips: On Time (green) / Late (amber) / Absent (red) / On Leave (blue)
- Work Report: truncated 60 chars, click to expand
- Actions: "View Details" button — opens modal with full report
- Sorted: newest first
- Shows last 30 records

### Attendance Detail Modal
- Full date + time
- Status chip
- Complete work report text
- Submitted from (Web / Telegram Bot)

---

## PAGE 3 — MY TASKS

**Route:** `/my-tasks`

### Page Header
- "My Tasks" — Syne font
- Completion stats: "8/12 completed this month"
- Mini performance ring (showing task completion %)

---

### Filter Tabs
```
[ All (12) ] [ 🔴 Overdue (2) ] [ 🟡 Due Soon (3) ] [ 🔵 On Track (5) ] [ ✅ Done (8) ]
```
Active filter highlighted with color.

---

### Task List

Each task item:
```
┌─────────────────────────────────────────────────┐
│ ■ [checkbox]  Fix production bug — login timeout │ ← colored left bar
│               Assigned by: Pooja (HR) · DEV01   │
│               🔴 Overdue 2d  |  Development  |  HIGH │
│               "Users getting logged out after 5 min" │
│                              [ ✓ Complete ] [ 💬 ] │
└─────────────────────────────────────────────────┘
```

- **Colored left bar:**
  - Red = Overdue
  - Amber = Due Soon (≤2 days)
  - Blue = On Track
  - Green = Done

- **Checkbox:** Click to toggle done/undone
  - Done: green filled checkbox, title strikethrough, gray text

- **Deadline chip:**
  - `🔴 Overdue 2d` — red
  - `🟡 Due Today!` — amber
  - `🟡 Due in 1d — 16 Mar` — amber
  - `🔵 20 Mar` — blue
  - `✅ Done` — green

- **Tag chip:** Development / Design / Review / Sales / etc.
- **Priority chip:** HIGH (red) / MED (amber) / LOW (green)
- **Complete button:** marks done + toast + syncs to Sheets
- **Chat button (💬):** opens chat with task assigner

---

### Task Detail Modal (click task title)
- Full title
- Description
- Assigned by (name + role)
- Deadline
- Priority
- Category
- Status
- "Mark Complete" button
- "Chat with Assigner" button

---

## PAGE 4 — MY LEAVES

**Route:** `/my-leaves`

### Page Header
- "My Leaves" — Syne font
- "+ Apply for Leave" primary button

---

### Leave Balance Card
```
┌──────────────────────────────────────────────────┐
│  LEAVE BALANCE — March 2026                       │
│                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │    3     │  │    1     │  │      2       │   │
│  │ ALLOWED  │  │   USED   │  │  REMAINING   │   │
│  └──────────┘  └──────────┘  └──────────────┘   │
│                                                   │
│  Progress: ■■■□□□□□□□  1/3 used                  │
│                                                   │
│  ⚠️ 4th leave onwards = ₹500 deduction            │
└──────────────────────────────────────────────────┘
```

---

### Apply for Leave Modal
- **Date picker** — single date or date range
- **Leave Type** dropdown:
  - Casual Leave
  - Sick Leave
  - Emergency Leave
  - Unpaid Leave
- **Reason** textarea (required)
- Deduction warning (if this would be 4th+ leave):
  ```
  ⚠️ This will be your 4th leave this month.
  ₹500 deduction will be applied to your salary.
  ```
- "Submit Request" button
- On submit: toast + Telegram bot notification to HR + appears in list

---

### Leave History Table
- Date | Type | Reason | Status | Leave # | Deduction | Actions
- Status chips:
  - Pending (amber) — with "Cancel" button
  - Approved (green) — by HR name
  - Rejected (red) — with reason
- Leave # shows which leave number this month
- Deduction: "₹0" or "₹500" in red

---

### Cancel Leave Modal (pending only)
- "Are you sure you want to cancel this leave request?"
- Date + reason shown
- Cancel Request (red) | Keep Request (ghost) buttons

---

## PAGE 5 — CHAT

**Route:** `/chat`

### Layout: Two Panel

```
┌─────────────────────────────────────────────────────────────┐
│  CHAT                                                        │
├──────────────────┬──────────────────────────────────────────┤
│  LEFT PANEL      │  RIGHT PANEL — Chat Area                 │
│  (Conversations) │                                          │
│                  │  ┌────────────────────────────────────┐  │
│  🔍 Search...    │  │ Header: avatar + name + online dot │  │
│                  │  └────────────────────────────────────┘  │
│  📌 PINNED       │                                          │
│  👤 Pooja (HR)   │  [messages area]                         │
│     ✓✓ 10:30 AM  │                                          │
│     "Approved.." │  Priya (HR) · 10:30 AM                  │
│  2 unread        │  ┌─────────────────────────────────┐    │
│                  │  │ Your leave for tomorrow has      │    │
│  👤 Anand (Mentor│  │ been approved. Have a great day! │    │
│     ✓✓ Yesterday │  └─────────────────────────────────┘    │
│     "Review PR.."│                                          │
│                  │            You · 10:32 AM                │
│  MY TEAM         │  ┌─────────────────────────────────┐    │
│  👥 Dev Team     │  │ Thank you so much! 🙏            │    │
│     "Sunny: Done"│  └─────────────────────────────────┘    │
│                  │                                          │
│  ALL EMPLOYEES   │  ┌──────────────────────────────────┐   │
│  (if team lead)  │  │ 📎  Type your message...   Send  │   │
│                  │  └──────────────────────────────────┘   │
└──────────────────┴──────────────────────────────────────────┘
```

---

### Left Panel — Conversation List
- Search bar (filter conversations)
- **Pinned section:**
  - HR contact (always first — employee's HR)
  - Mentor contact (assigned mentor)
- **My Team section:** department group chat
- Conversation item shows:
  - Avatar (colored) + online dot
  - Name + role
  - Last message preview (40 chars)
  - Relative timestamp ("2m ago", "Yesterday", "Mon")
  - Unread badge (red circle with count)

---

### Right Panel — Chat Area

**Header:**
- Avatar + name + role
- Online status dot (green = online, gray = offline)
- Phone/email icon buttons

**Messages:**
- Date separators: "Today", "Yesterday", "14 Mar 2026"
- **Received messages** (left-aligned):
  - Avatar small
  - White/glass bubble
  - Name above (if group)
  - Timestamp below
- **Sent messages** (right-aligned):
  - Accent color bubble
  - Timestamp below
  - Read receipts: ✓ (sent) · ✓✓ (read)
- **File attachment:**
  - Image: inline preview
  - Document: filename + size + download icon
- **Typing indicator:** "Pooja is typing..." (animated dots)

**Input Area:**
- 📎 Attach file button
- Text input (multi-line, auto-resize)
- 😊 Emoji button
- Send button (accent color, arrow icon)
- Enter to send, Shift+Enter for newline

---

### Chat Types for Employee
| Chat Type | With Whom | Purpose |
|-----------|-----------|---------|
| Direct HR | Pooja (HR) | Leave queries, work issues |
| Mentor Chat | Assigned mentor | Task guidance, feedback |
| Team Chat | Department group | Team discussions |

---

### Mobile Chat
- Single panel — conversation list first
- Tap conversation → full screen chat
- Back button to return to list

---

## PAGE 6 — MY SALARY

**Route:** `/my-salary`

### Page Header
- "My Salary" — Syne font
- Current month label: "March 2026"

---

### Current Month Salary Card
```
┌─────────────────────────────────────────────────┐
│  💰 Salary Slip — March 2026                     │
│                                                  │
│  Employee: Sunny                                 │
│  ID: DEV01 · Developer                           │
│                                                  │
│  Gross Salary:      ₹30,000                      │
│  ─────────────────────────────                   │
│  Deductions:                                     │
│    Extra Leaves (1): - ₹0                        │
│    Late Penalty:     - ₹0                        │
│  ─────────────────────────────                   │
│  Net Salary:        ₹30,000                      │
│                                                  │
│  Status: ⏳ Pending Dispatch                     │
│  Pay Date: 25 March 2026                         │
│                                                  │
│  [ ⬇ Download Slip ]                            │
└─────────────────────────────────────────────────┘
```

If deductions exist:
```
│  Deductions:                                     │
│    Extra Leaves (2 extra): - ₹1,000              │
│    Late Penalty (7 lates): - ₹200                │
│  ─────────────────────────────                   │
│  Net Salary:        ₹28,800                      │
```

---

### Deduction Explanation Card
- "How are deductions calculated?"
- Free leaves per month: 3
- 4th leave onwards: ₹500 deduction each
- Late threshold: 5 times
- Late penalty: ₹200 flat

---

### Salary History Table
- Month | Gross | Deductions | Net | Status | Actions
- Status: Sent ✅ / Pending ⏳
- Actions: "View Slip" + "Download" per row
- Last 6 months shown

---

### Salary Slip Detail Modal (click View Slip)
Full formatted salary slip:
- Company name: SISWIT
- Employee name + ID + Department
- Month + Year
- Joining date
- Gross salary
- Deduction breakdown
- Net salary
- "Download PDF" button

---

## PAGE 7 — MY PROFILE

**Route:** `/my-profile`

### Page Header
- "My Profile" — Syne font
- "Edit Profile" button

---

### Profile Hero
- Avatar (88px, rounded, colored, with initial)
- Name (Syne font, large)
- Role chip: Developer / Marketing / etc.
- Dept chip
- ID mono chip
- Status chip: Active (green)
- Online indicator dot

---

### Info Cards (2 column layout)

**Left — Personal Info:**
```
📧 Email: sunny@siswit.com
📱 Phone: +91 XXXXX XXXXX
✈️ Telegram: @Rajput_sunny90
💬 WhatsApp: +91 98765 43210
```
"Edit Info" button → opens edit modal

**Right — Employment Info:**
```
🆔 Employee ID: DEV01
🏢 Department: Developer
💼 Role: Developer
📅 Joining Date: 05 Mar 2026
👤 Manager: Anand (ADM001)
🎓 Mentor: Piyush (DEV02)
```

---

### Edit Profile Modal
- Editable fields:
  - Full Name
  - Phone number
  - WhatsApp number
  - Email
- Non-editable (shown as disabled):
  - Employee ID
  - Department
  - Role
  - Joining Date
- "Save Changes" button
- "Cancel" button

---

### Change Password Section
```
┌─────────────────────────────────────────────────┐
│  🔒 Change Password                              │
│                                                  │
│  Current Password: [__________]                  │
│  New Password:     [__________]                  │
│  Confirm New:      [__________]                  │
│                                                  │
│  [ Update Password ]                             │
└─────────────────────────────────────────────────┘
```

---

### My Stats Card
```
┌─────────────────────────────────────────────────┐
│  MY PERFORMANCE — March 2026                     │
│                                                  │
│  ┌────────┐  Score ring (SVG donut)              │
│  │  88    │  88 / 100                            │
│  └────────┘                                      │
│                                                  │
│  Attendance Rate  ████████░░  82%               │
│  Punctuality      ███████░░░  75%               │
│  Task Completion  █████████░  90%               │
└─────────────────────────────────────────────────┘
```

---

### Notification Preferences
- Toggle list:
  - Task assigned notification ✅
  - Task deadline reminder ✅
  - Leave approval/rejection ✅
  - Attendance reminder ✅
  - Salary slip ready ✅
  - New message ✅
  - System announcements ✅

---

## ATTENDANCE MARK — FULL LOGIC

### Web Submission Flow
```
Employee opens web portal
    ↓
Clicks "Mark Attendance" or goes to My Attendance
    ↓
Types work report (min 10 chars)
    ↓
Clicks "Submit Attendance"
    ↓
Backend checks:
  - Is employee registered? ✓
  - Already submitted today? → show error
  - Current time?
    - Before 11 AM → status = 'p' (Present)
    - 11 AM - 6 PM → status = 'l' (Late)
    - After 6 PM   → show "Window Closed" error
    ↓
Write to Google Sheets Attendance tab
    ↓
Toast: "✅ Attendance recorded — On Time!"
         or "⚠️ Attendance recorded — Late"
    ↓
Telegram notification to employee:
  "✅ Attendance recorded via Web Portal
   09:15 AM · On Time
   Report: Fixed login bug..."
    ↓
Dashboard status card updates immediately
```

---

## EMPLOYEE NAVIGATION CONFIG

```javascript
export const EMPLOYEE_NAV = [
  {
    section: 'MY WORKSPACE',
    items: [
      { key: 'dashboard',    label: 'Dashboard',      path: '/dashboard',    icon: 'LayoutDashboard' },
      { key: 'attendance',   label: 'My Attendance',  path: '/my-attendance',icon: 'CalendarCheck' },
      { key: 'tasks',        label: 'My Tasks',       path: '/my-tasks',     icon: 'CheckSquare' },
      { key: 'leaves',       label: 'My Leaves',      path: '/my-leaves',    icon: 'Palmtree' },
    ]
  },
  {
    section: 'COMMUNICATION',
    items: [
      { key: 'chat',         label: 'Chat',           path: '/chat',         icon: 'MessageSquare' },
    ]
  },
  {
    section: 'PERSONAL',
    items: [
      { key: 'salary',       label: 'My Salary',      path: '/my-salary',    icon: 'DollarSign' },
      { key: 'profile',      label: 'My Profile',     path: '/my-profile',   icon: 'User' },
    ]
  },
]
```

---

## EMPLOYEE ROUTES

```
/dashboard       → Employee Dashboard
/my-attendance   → Attendance + Mark
/my-tasks        → Tasks view + complete
/my-leaves       → Leaves + apply
/chat            → Chat with HR + Mentor
/my-salary       → Salary slips
/my-profile      → Profile + edit
```

---

## WHAT EMPLOYEE CANNOT SEE

```
❌ Other employees' data
❌ HR management pages
❌ All employees list
❌ Payroll (others)
❌ Hiring pipeline
❌ Onboarding
❌ Communication Hub (broadcast)
❌ Mentors directory
❌ Approvals
❌ Audit Log
❌ Analytics (org-wide)
❌ Settings
```

---

## EMPLOYEE DESIGN THEME

Same dark theme as HR/Admin but with GREEN accent for employee role:

```css
[data-role="employee"] {
  --primary:       #10b981;   /* Green instead of indigo */
  --primary-soft:  rgba(16,185,129,0.10);
  --primary-hover: #09825a;
  --sidebar-bg:    #071a12;   /* Dark green tint */
  --portal-label:  "Employee Portal";
}
```

---

## TELEGRAM BOT (Still Works)

Employee can STILL use Telegram bot — both work:

| Action | Web Portal | Telegram Bot |
|--------|-----------|--------------|
| Mark attendance | ✅ Web form | ✅ /attend command |
| Apply leave | ✅ Web form | ✅ /leave command |
| Check status | ✅ Dashboard | ✅ /status command |
| View tasks | ✅ Web page | ❌ (view only on web) |
| Chat | ✅ Web chat | ❌ (use Telegram directly) |
| View salary | ✅ Web page | ✅ Bot sends slip |

---

## NOTIFICATIONS FOR EMPLOYEE

Employee receives these in-app notifications (bell icon):

| Event | Source | Message |
|-------|--------|---------|
| Task assigned | HR/Mentor | "New task: Fix login bug — Due 20 Mar" |
| Task reminder | System | "Deadline tomorrow: Review PR #24" |
| Leave approved | HR | "Your leave for 20 Mar is approved ✅" |
| Leave rejected | HR | "Your leave for 20 Mar was rejected ❌" |
| Attendance reminder | System | "You haven't submitted attendance yet ⏰" |
| Salary slip ready | Finance | "Your March 2026 salary slip is ready 💰" |
| New message | HR/Mentor | "Pooja sent you a message 💬" |
| Warning issued | HR | "A formal warning has been issued ⚠️" |

---

## GOOGLE SHEETS — EMPLOYEE DATA

Employee's data lives in these Sheets tabs:

```
Employees tab  → Employee's profile data
Attendance tab → Employee's attendance records
Leaves tab     → Employee's leave requests
Tasks tab      → Tasks assigned to employee
Messages tab   → Employee's chat messages
Payroll tab    → Employee's salary records
```

Employee can ONLY read their own data.
Employee CANNOT read other employees' data.

---

## FILE STRUCTURE (Employee Pages)

```
src/pages/employee/
    ├── Dashboard.jsx        ← Main dashboard
    ├── MyAttendance.jsx     ← Attendance + mark
    ├── MyTasks.jsx          ← Tasks view
    ├── MyLeaves.jsx         ← Leaves + apply
    ├── Chat.jsx             ← Chat with HR/Mentor
    ├── MySalary.jsx         ← Salary slips
    └── MyProfile.jsx        ← Profile + edit
```

---

## QUICK SUMMARY

| Feature | Employee Can Do |
|---------|----------------|
| Dashboard | ✅ Full dashboard with all stats |
| Mark Attendance | ✅ Web form (or Telegram bot) |
| View Attendance | ✅ Own only — heatmap + log |
| Apply Leave | ✅ Web form (or Telegram bot) |
| View Leaves | ✅ Own only — history + balance |
| Complete Tasks | ✅ Mark done, chat with assigner |
| Chat | ✅ HR + Mentor + Team group |
| View Salary | ✅ Own salary slips only |
| Edit Profile | ✅ Name, phone, email |
| Change Password | ✅ Yes |
| Notifications | ✅ All relevant events |
| Other employees | ❌ Cannot see |
| HR pages | ❌ Cannot access |
| Finance pages | ❌ Cannot access |
| Settings | ❌ Cannot access |

---

*SISWIT Enterprise — Employee Portal Complete Spec*
*7 Pages | All Features | Dark Theme | Web + Bot*
*March 2026*
