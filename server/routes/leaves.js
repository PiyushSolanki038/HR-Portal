import { Router } from 'express'
import { readSheet, appendRow, updateRowWhere, findRow } from '../sheets.js'
import { sendMessage } from '../telegram.js'
import { appendAudit } from './audit.js'

const router = Router()

// Convert Excel serial date numbers (e.g. 46098) to ISO date strings (YYYY-MM-DD).
// Google Sheets sometimes stores dates as serial numbers when cells are number-formatted.
function excelSerialToISO(value) {
  const num = Number(value)
  if (!value || isNaN(num) || String(value).includes('-') || String(value).includes('/')) return value
  // Excel epoch is Jan 1 1900; 25569 = days from Excel epoch to Unix epoch (Jan 1 1970)
  const ms = (num - 25569) * 86400 * 1000
  const d = new Date(ms)
  if (isNaN(d.getTime())) return value
  return d.toISOString().split('T')[0]
}

// Normalize a leave record regardless of whether it was written by the bot
// (single 'date' field) or the portal (startDate/endDate fields).
function normalizeLeave(l) {
  const rawStart = l.startDate || l.date || ''
  const rawEnd   = l.endDate   || rawStart
  const start = excelSerialToISO(rawStart)
  const end   = excelSerialToISO(rawEnd)
  return {
    ...l,
    date:      start,
    startDate: start,
    endDate:   end,
    status:    (l.status || 'pending').toLowerCase(),
  }
}

router.get('/', async (req, res) => {
  try {
    const leaves = await readSheet('Leaves')
    res.json(leaves.map(normalizeLeave))
  } catch (err) {
    console.error('[API_ERROR] GET /api/leaves:', err.message)
    res.status(500).json({ error: 'Failed to fetch leaves data' })
  }
})

router.get('/pending', async (req, res) => {
  try {
    const leaves = await readSheet('Leaves')
    res.json(leaves.map(normalizeLeave).filter(l => l.status === 'pending'))
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
      // Sync leaves count in Employees sheet
      const employees = await readSheet('Employees')
      const empRow = employees.find(e => e.id === leave.empId)
      if (empRow) {
        const currentLeaves = parseInt(empRow.leaves) || 0
        await updateRowWhere('Employees', 'id', leave.empId, {
          leaves: currentLeaves + 1
        })
      }

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

    await appendAudit('leave', `${leave?.empName || 'Employee'} leave request rejected by ${rejectedBy}`, rejectedBy)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Apply for leave
router.post('/apply', async (req, res) => {
  try {
    const { empId, empName, dept, type, startDate, endDate, reason } = req.body
    const id = `LV${Date.now()}`
    
    // Simple duration calculation (days)
    const start = new Date(startDate)
    const end = new Date(endDate)
    const durationDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
    const duration = `${durationDays} day${durationDays > 1 ? 's' : ''}`

    await appendRow('Leaves', {
      id, empId, empName, dept, type, 
      startDate, endDate, duration, 
      reason, status: 'pending', approvedBy: '', approvedAt: ''
    })

    await appendAudit('leave', `${empName} applied for ${type} leave (${duration})`, empId)
    res.json({ success: true, id })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Log external leave (direct approval)
router.post('/log-external', async (req, res) => {
  try {
    const { empId, empName, dept, type, startDate, endDate, reason, loggedBy } = req.body
    const id = `LV${Date.now()}`
    
    const start = new Date(startDate)
    const end = new Date(endDate)
    const durationDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
    const duration = `${durationDays} day${durationDays > 1 ? 's' : ''}`
    const now = new Date().toISOString()

    // 1. Append to Leaves sheet
    await appendRow('Leaves', {
      id, empId, empName, dept, type, 
      startDate, endDate, duration, 
      reason, status: 'approved', approvedBy: loggedBy, approvedAt: now
    })

    // 2. Increment employee leaves count
    const employees = await readSheet('Employees')
    const empRow = employees.find(e => e.id === empId)
    if (empRow) {
      const currentLeaves = parseInt(empRow.leaves) || 0
      await updateRowWhere('Employees', 'id', empId, {
        leaves: currentLeaves + 1
      })
    }

    await appendAudit('approval', `${empName} external leave logged by ${loggedBy}`, loggedBy)
    res.json({ success: true, id })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
