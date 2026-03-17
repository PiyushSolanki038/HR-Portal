# SISWIT Enterprise HRMS — Full Product Requirements Document (PRD)

## 1. Executive Summary
SISWIT is a modern, premium Enterprise Human Resource Management System (HRMS) designed for small to medium-sized enterprises. It uniquely bridges the gap between field/remote employees and management by using **Telegram** as the primary employee interactions layer and a high-performance **React Portal** as the administrative command center. **Google Sheets** serves as the agile, serverless database for the entire ecosystem.

---

## 2. Core Vision & Objectives
- **Accessibility**: Employees interact purely via Telegram bot commands (Attendance, Leaves, Status).
- **Efficiency**: HR and Managers manage everything (Approvals, Hiring, Payroll) through a sleek Web Dashboard.
- **Transparency**: Real-time data sync between Chat and Portal ensured by the Express backend.
- **Modern Aesthetics**: A high-end, dark-themed UI that feels premium and interactive.

---

## 3. Product Roles & Permissions (RBAC)
| Role | Permissions | Focus Area |
| :--- | :--- | :--- |
| **Owner** | Full Access | Financial oversight, audit logs, and system-wide settings. |
| **HR Manager** | Employee Management | Hiring, Onboarding, Attendance, Leaves, and Communication. |
| **Finance Manager** | Payroll & Deductions | Salary distribution, leave deductions, and expense management. |
| **Employee** | Bot Access Only | Daily reports, leave requests, and personal status checks. |

---

## 4. Key Performance Indicators (KPIs)
- **Attendance Score**: A 0-100 rating based on punctuality and presence.
- **Leave Balance**: Tracking the 3-day paid leave policy and subsequent deductions.
- **Task Streak**: Measuring continuous task completion and performance.

---

## 5. System Modules (14+ Core Modules)

### 5.1 Field Operations (via Telegram Bot)
- **Attendance Layer**: `/attend [report]` command with 11 AM late cutoff and 6 PM closing.
- **Leave Layer**: `/leave [date] [reason]` command with automated balance tracking.
- **Status Dashboard**: `/status` to view personal KPIs and today's record.
- **Task Verification**: Bot notifies employees of new tasks and deadlines assigned via Portal.

### 5.2 HR Operations (Web Portal)
- **Dashboard**: Real-time stats on presence, pending approvals, and hiring funnel.
- **Attendance Management**: Heatmaps, weekly grids, and daily log oversight.
- **Leave approvals**: Single-click approve/reject with automated Telegram notifications.
- **Employee Directory**: Detailed profiles with performance rings and activity timelines.
- **Hiring & Onboarding**: Candidate tracking from 'Applied' to 'Selected'.
- **Mentorship System**: Assignment of external mentors to specific employees with private feedback logs.

### 5.3 Financial Operations (Web Portal)
- **Payroll & Salary**: Automated gross/net calculation based on leaves and late marks.
- **Leave Deductions**: Automatic ₹500/day deduction for leaves exceeding the 3-day limit.
- **Salary Slips**: Bulk dispatch of digital salary slips directly to employees via Telegram.

### 5.4 Governance & Communication
- **Audit Log**: Every administrative action (Approvals, Disciplinary, Logins) is permanently recorded.
- **Direct Messaging**: Intra-system messaging that delivers to Employee Telegram accounts.
- **Broadcast System**: Department-wide or company-wide announcements.
- **Disciplinary Log**: Formal warning system with "Excellent Record" tracking.

---

## 6. Technical Architecture

### 6.1 Technology Stack
- **Frontend**: React 18, Vite, Lucide Icons, Synergy Typography.
- **Backend API**: Node.js, Express, Google APIs (v4).
- **Automation Bot**: Python 3.10+, python-telegram-bot, gspread.
- **Database**: Google Sheets (Single Source of Truth).
- **Authentication**: JWT-based with Role-Based Access Control (RBAC).

### 6.2 Data Model (Google Sheets Tabs)
- **Employees**: Master record (Credentials, Roles, KPIs).
- **Attendance**: Daily history of punch-ins and work reports.
- **Leaves**: Leave requests, status, and deduction tracking.
- **Tasks**: Assignment, deadlines, and completion status.
- **Hiring**: Candidate pipeline data.
- **Mentors**: External mentor directory and expertise.
- **Audit**: Immutable log of all system events.

---

## 7. Roadmap & Future Scope
- **Phase 12 (Current)**: Implement Backend Auth, Password Support, and RBAC.
- **Phase 13**: Real Data integration for Disciplinary Logs and Mentor Feedback.
- **Phase 14**: Advanced Analytics and Visual Performance Reports.
- **Phase 15**: Mobile App (PWA) and WhatsApp Integration for redundancy.

---

## 8. Design Standards
- **Color Palette**: Dark UI (#0a0a0f), Accent Indigo (#4f6ef7), Muted Dim (#94a3b8).
- **Typography**: Syne (Headings), Inter (Body), JetBrains Mono (Codes/IDs).
- **Interactive Elements**: Glassmorphism, subtle micro-animations, and responsive flex-wrap layouts.
