import { Router } from 'express'
import { readSheet, appendRow, updateRowWhere } from '../sheets.js'
import { sendMessage, sendBulkMessage } from '../telegram.js'

const router = Router()

// GET today's attendance
router.get('/today', async (req, res) => {
  try {
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
    const records = await readSheet('Attendance')
    const todayRecs = records.filter(r => r.date === today)

    let employees = await readSheet('Employees')
    // Remove Admin from attendance tracking
    employees = employees.filter(emp => !emp.id.toUpperCase().startsWith('ADM') && emp.role !== 'Admin')
    const merged = employees.map(emp => {
      const rec = todayRecs.find(r => r.empId === emp.id)
      return rec || {
        empId: emp.id, empName: emp.name, dept: emp.dept,
        date: today, time: '—', status: 'a', report: '—'
      }
    })
    res.json(merged)
  } catch (err) {
    console.error('[API_ERROR] GET /api/attendance/today:', err.message)
    res.status(500).json({ error: 'Failed to fetch today\'s attendance' })
  }
})

// GET attendance summary (Total present, late, and score)
router.get('/summary', async (req, res) => {
  try {
    const attendance = await readSheet('Attendance')
    let employees  = await readSheet('Employees')
    // Remove Admin from attendance summary
    employees = employees.filter(emp => !emp.id.toUpperCase().startsWith('ADM') && emp.role !== 'Admin')
    
    // Get all unique working dates from attendance
    const allDates = Array.from(new Set(attendance.map(r => r.date))).sort()
    
    const summary = {}
    const leaves  = await readSheet('Leaves')
    
    employees.forEach(emp => {
      const records = attendance.filter(r => r.empId === emp.id)
      const p = records.filter(r => r.status === 'p').length
      const l = records.filter(r => r.status === 'l').length
      
      const empLeaves = leaves.filter(lv => {
        const isApproved = lv.status?.toLowerCase() === 'approved' || lv.status?.includes('day') || lv.approvedBy;
        return lv.empId === emp.id && isApproved;
      })
      
      const attended = p + l + empLeaves.length
      
      // Calculate working days for this specific employee since joining
      const empWorkingDays = allDates.filter(d => d >= (emp.joining || '1970-01-01')).length
      
      // Score = (Attended Days / Expected Days) * 100
      // We bound score between 0 and 100
      const score = empWorkingDays > 0 ? Math.min(100, Math.round((attended / empWorkingDays) * 100)) : 100
      
      summary[emp.id] = { 
        present: p, 
        late: l, 
        score: score,
        workingDays: empWorkingDays,
        totalAttended: attended
      }
    })
    
    res.json(summary)
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
    let employees = await readSheet('Employees')
    // Remove Admin from weekly grid
    employees = employees.filter(emp => !emp.id.toUpperCase().startsWith('ADM') && emp.role !== 'Admin')

    // Get last 5 weekdays — use IST date to match written records
    const days = []
    const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
    while (days.length < 5) {
      d.setDate(d.getDate() - 1)
      if (d.getDay() !== 0 && d.getDay() !== 6) {
        days.unshift(d.toLocaleDateString('en-CA'))
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

// Mark attendance
router.post('/mark', async (req, res) => {
  try {
    let { empId, empName, dept, report, source } = req.body
    empId = (empId || '').trim()
    
    // Fetch missing details from Employees sheet if necessary
    if (!dept || !empName) {
      const employees = await readSheet('Employees')
      const emp = employees.find(e => e.id === empId)
      if (emp) {
        empName = empName || emp.name
        dept = dept || emp.dept
      }
    }

    const now = new Date()
    const id = `AT${Date.now()}`
    
    // Use Indian Standard Time (IST) for date and time
    const date = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }) // YYYY-MM-DD
    const time = now.toLocaleTimeString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    })
    
    // Status logic: Present (p) 1:00 AM to 11:58 PM, Late (l) otherwise
    const [hours, minutes] = time.split(':').map(Number)
    const minsTotal = hours * 60 + minutes
    const status = (minsTotal >= 60 && minsTotal <= 1438) ? 'p' : 'l'

    // Prevent duplicate submission for the same day
    const history = await readSheet('Attendance')
    const duplicate = history.find(r => r.empId === empId && r.date === date)
    if (duplicate) {
      return res.status(400).json({ error: 'Attendance already marked for today' })
    }

    // Match columns: id, empId, empName, dept, date, time, status, report, submittedAt
    await appendRow('Attendance', [
      id, empId, empName || 'Unknown', dept || 'Unknown', 
      date, time, status, report, now.toISOString()
    ])

    // Sync stats to Employees sheet
    await syncEmployeeStats(empId)

    // 🔔 Notify HR and Employee via Telegram
    try {
      const employees = await readSheet('Employees')
      const targetEmp = employees.find(e => e.id === empId)
      
      const hrEmployees = employees.filter(e => 
        ['hr manager', 'admin'].includes(e.role?.toLowerCase())
      )
      const hrChatIds = Array.from(new Set(hrEmployees.map(e => e.telegramChatId).filter(id => id)))

      const displayTime = now.toLocaleTimeString('en-IN', { 
        timeZone: 'Asia/Kolkata',
        hour12: true, 
        hour: '2-digit', 
        minute: '2-digit' 
      })

      const statusLabel = status === 'p' ? '✅ Present' : '⚠️ Late'
      
      // Notify HR
      const hrMsg = `🔔 <b>New Attendance Marked (Portal)</b>\n\n` +
                    `👤 <b>Name:</b> ${empName}\n` +
                    `🏢 <b>Dept:</b> ${dept}\n` +
                    `🕒 <b>Time:</b> ${displayTime}\n` +
                    `📅 <b>Date:</b> ${date}\n` +
                    `📊 <b>Status:</b> ${statusLabel}\n` +
                    `📝 <b>Report:</b> ${report}`
      
      await sendBulkMessage(hrChatIds, hrMsg)

      // Notify Employee (Personal Confirmation)
      if (targetEmp?.telegramChatId) {
        const empMsg = `✅ <b>Attendance Recorded (Portal)</b>\n\n` +
                       `🕒 <b>Time:</b> ${displayTime}\n` +
                       `📅 <b>Date:</b> ${date}\n` +
                       `📊 <b>Status:</b> ${status === 'p' ? 'On Time' : 'Late'}\n` +
                       `📝 <b>Report:</b> ${report}`
        await sendMessage(targetEmp.telegramChatId, empMsg)
      }
    } catch (teleErr) {
      console.error('[TELEGRAM NOTIFICATION ERROR]', teleErr)
    }

    res.json({ success: true, date, time, status })
  } catch (err) {
    console.error('[ATTENDANCE ERROR]', err)
    res.status(500).json({ error: err.message })
  }
})

export async function syncEmployeeStats(empId) {
  try {
    const attendance = await readSheet('Attendance')
    const employees  = await readSheet('Employees')
    const leaves     = await readSheet('Leaves')
    
    const emp = employees.find(e => e.id === empId)
    if (!emp) return

    const records = attendance.filter(r => r.empId === empId)
    const p = records.filter(r => r.status === 'p').length
    const l = records.filter(r => r.status === 'l').length
    
    // Count total leave days from approved requests
    let leaveDays = 0
    leaves.forEach(lv => {
      const isApproved = lv.status?.toLowerCase() === 'approved' || lv.status?.includes('day') || lv.approvedBy;
      if (lv.empId === empId && isApproved) {
        // Parse duration like "3 days" or "1 day"
        const d = parseInt(lv.duration) || 1
        leaveDays += d
      }
    })

    const attended = p + l + leaveDays

    // Get all unique working dates from attendance
    const allDates = Array.from(new Set(attendance.map(r => r.date))).sort()
    const empWorkingDays = allDates.filter(d => d >= (emp.joining || '1970-01-01')).length
    
    // Score = (Attended Days / Expected Days) * 100
    const score = empWorkingDays > 0 ? Math.min(100, Math.round((attended / empWorkingDays) * 100)) : 100
    const absent = Math.max(0, empWorkingDays - attended)

    await updateRowWhere('Employees', 'id', empId, {
      present: p,
      late: l,
      absent: absent,
      leaves: leaveDays,
      score: score
    })
    console.log(`[SYNC] Updated stats for ${empId}: P=${p}, L=${l}, A=${absent}, Leaves=${leaveDays}, Score=${score}`)
  } catch (err) {
    console.error(`[SYNC_ERROR] Failed to sync stats for ${empId}:`, err.message)
  }
}

export default router
