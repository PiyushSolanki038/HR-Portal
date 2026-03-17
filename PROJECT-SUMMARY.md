# SISWIT Enterprise — Technical Project Summary

This document provides a comprehensive technical overview of the **SISWIT Enterprise HRMS**, a React-based management portal integrated with a Telegram Bot and Google Sheets.

## 1. Project Overview
- **What is it?**: A premium Enterprise Human Resource Management System (HRMS).
- **Goal**: Bridges the gap between remote/field employees and HR management using a dual-layer approach: Telegram for interactions and a React Web Portal for administration.
- **Users**: Owners (Full Access), HR Managers (Operations), Finance Managers (Payroll), and Employees (Bot Access).
- **Core Strategy**: Google Sheets as a serverless database, Node.js/Express as the API mediator, and Python for the Telegram Bot automation.

## 2. Tech Stack
### Frontend
- **Framework**: React 18.3.1 (Vite 5.2.0)
- **Styling**: Vanilla CSS with a focus on Glassmorphism and Dark Mode aesthetics.
- **Icons**: Lucide React
- **Typography**: Syne (Headings), Inter (Body), JetBrains Mono (Codes).

### Backend
- **Server**: Node.js with Express 4.19.2
- **Database**: Google Sheets (via Google APIs v4)
- **Bot Layer**: Python 3.10+ with `python-telegram-bot` and `gspread`.

### All Dependencies (package.json)
- `react`: ^18.3.1
- `react-dom`: ^18.3.1
- `react-router-dom`: ^6.23.1
- `lucide-react`: ^0.383.0
- `express`: ^4.19.2
- `cors`: ^2.8.5
- `dotenv`: ^16.4.5
- `googleapis`: ^140.0.0
- `node-telegram-bot-api`: ^0.66.0
- `node-fetch`: ^3.3.2
- `concurrently`: ^8.2.2
- `@vitejs/plugin-react`: ^4.3.1 (dev)
- `vite`: ^5.2.0 (dev)

## 3. Project Structure
- `/bot`: Python-based Telegram Bot.
    - `handlers/`: logic for commands like `/attend`, `/leave`, `/status`, `/register`.
    - `bot.py`: Main entry point for the bot.
    - `sheets.py`: Python interface for Google Sheets.
- `/server`: Node.js/Express Backend.
    - `routes/`: API endpoints for Employees, Attendance, Leaves, Tasks, Payroll, etc.
    - `index.js`: Main backend entry point.
    - `sheets.js`: Core Google Sheets integration logic.
    - `telegram.js`: Helper for sending messages from Portal to Telegram Chat IDs.
- `/src`: React Frontend Source.
    - `components/`: UI components (Modals, Heatmaps, Performance Rings, Layout).
    - `context/`: Global states (Auth, Global Data, Toast Notifications).
    - `pages/`: 25+ Page components (Dashboard, Employee Profile, Payroll, etc.).
    - `services/api.js`: Axios-like wrapper for all backend communication.
    - `styles/`: Modular CSS files.
- `/dist`: Production-ready build output.
- `index.html`: Main entry point for the SPA.
- `.env`: System-wide environment configuration.

## 4. Current Working Features
### Fully Built and Functional:
- **RBAC Authentication**: Role-based access for HR, Owner, and Finance.
- **Employee Directory**: Full CRUD, profile views, and activity timelines.
- **Attendance System**:
    - Employees: Punch-in via Telegram `/attend [report]`.
    - HR: Heatmaps, grid views, and daily log oversight in the Portal.
- **Leave Management**:
    - Employees: Request via Telegram `/leave [date] [reason]`.
    - HR: Single-click Approve/Reject with instant Telegram notification.
- **Task Manager**: Assign tasks to employees; notifications sent to Telegram.
- **Governance Board**: Record awards (Excellence) and warnings (Disciplinary).
- **Mentorship System**: Enlist external mentors and assign them to employees.
- **Hiring & Onboarding**: Status-based funnel tracking for candidates.
- **Payroll Dispatch**: Automated salary calculation and delivery of slips via Telegram Bot.

### API Routes (Backend):
- `GET/POST /api/employees`: Master record management.
- `GET/POST /api/attendance`: Daily histories and punch records.
- `GET/POST /api/leaves`: Request processing and approval flow.
- `GET/POST /api/tasks`: Assignment and status updates.
- `GET/POST /api/payroll`: Salary calculation and Telegram dispatch.
- `GET/POST /api/governance`: Excellence and Disciplinary logs.
- `GET/POST /api/auth`: Login and session management.

## 5. Environment Variables
The project uses a `.env` file at the root.
- `PORT`: Server port (e.g., 3001). [FILLED]
- `TELEGRAM_BOT_TOKEN`: Token from @BotFather. [FILLED]
- `GOOGLE_SHEET_ID`: ID of the master Google Sheet. [FILLED]
- `GOOGLE_SERVICE_ACCOUNT_JSON`: Full JSON string of the service account. [FILLED]
- `TELEGRAM_ADMIN_ID`: Chat ID for administrative alerts. [FILLED]
- `FRONTEND_URL`: `*` or specific URL for CORS. [FILLED]

## 6. How to Run Locally
### Prerequisites:
- Node.js (v18+)
- Python (v3.10+)
- Google Cloud Service Account with Sheets/Drive API enabled.

### Commands:
1. **Install Dependencies**: `npm install`
2. **Setup Bot Environment**: `pip install -r bot/requirements.txt`
3. **Run All (Frontend + Backend)**: `npm run dev:all`
4. **Run Bot (Separate terminal)**: `python bot/bot.py`

## 7. Build & Deploy
- **Production Build**: `npm run build`
- **Output Folder**: `/dist`
- **Known Build Status**: Clean build, no current errors. Vite handles asset optimization.
- **Deployment Strategy**: Frontend as static files (Vercel/Netlify/Hostinger); Backend as Node service on VPS.

## 8. External Services Connected
- **Google Sheets**: Single Source of Truth for all data.
- **Telegram Bot API**: Real-time communication layer between employees and the system.
- **Google APIs**: Used for auth and sheet operations.

## 9. What is NOT built yet
- **Advanced Financial Reports**: `FinancialReports.jsx` is currently a UI template with static mock data.
- **Loans & Advances Module**: `LoansAdvances.jsx` uses hardcoded state and mock entries.
- **Real-time Performance Reports**: Advanced visual charts in the Analytics page are currently based on mock gain/stability metrics.
- **Phase 15 Roadmap**: PWA (Mobile App) and WhatsApp integration.

## 10. Any Known Issues or Errors
- **Console Warnings**: Minor CSS hydration warnings occasionally seen due to Glassmorphism layer opacity.
- **Bot Rate Limits**: Extensive bulk dispatch of salary slips needs to respect Telegram's message-per-second limits.
- **Large Data Latency**: As the Google Sheet grows (beyond 5000+ rows), response times for `readSheet('Attendance')` may increase; caching or transitioning to a real SQL DB is recommended for future scale.
