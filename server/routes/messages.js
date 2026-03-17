import { Router } from 'express'
import { readSheet, appendRow } from '../sheets.js'
import { sendMessage, sendBulkMessage } from '../telegram.js'
import { appendAudit } from './audit.js'

const router = Router()

// Send direct message to one employee
router.post('/direct', async (req, res) => {
  try {
    const { empId, message, text, channel = 'telegram', actor } = req.body
    const msg = message || text
    const employees = await readSheet('Employees')
    const emp = employees.find(e => e.id === empId)
    if (!emp) return res.status(404).json({ error: 'Employee not found' })

    if (channel === 'telegram' && emp.telegramChatId) {
      await sendMessage(emp.telegramChatId, msg)
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

// Get message history for a conversation
router.get('/history/:otherId', async (req, res) => {
  try {
    const { userId } = req.query // We expect userId to be passed or derived from auth
    const { otherId } = req.params
    const messages = await readSheet('Messages')
    
    // Filter messages where from=me AND to=other OR from=other AND to=me
    const history = messages.filter(m => 
      (m.fromId === userId && m.toId === otherId) || 
      (m.fromId === otherId && m.toId === userId)
    ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

    res.json(history)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get all messages for a specific user (for dashboard preview)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const messages = await readSheet('Messages')
    const history = messages.filter(m => m.fromId === userId || m.toId === userId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5)
    res.json(history)
  } catch (err) {
    console.error(`[API_ERROR] GET /api/messages/user/${req.params.userId}:`, err.message)
    res.status(500).json({ error: 'Failed to fetch message history' })
  }
})

// Send portal message (persisted to Google Sheets)
router.post('/send', async (req, res) => {
  try {
    const { fromId, toId, message, channel = 'portal' } = req.body
    if (!fromId || !toId || !message) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const id = `MSG-${Date.now()}`
    const timestamp = new Date().toISOString()
    
    // Append to Messages sheet
    // Tab 5: Messages (id, fromId, toId, message, timestamp, read, attachments, channel, threadId)
    await appendRow('Messages', [id, fromId, toId, message, timestamp, 'false', '', channel, ''])

    // If it's a critical alert or if user has telegram linked, we can optionally cross-post
    // But for now, user requested "portal portal only"
    
    res.json({ success: true, message: { id, fromId, toId, message, timestamp } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get notifications for a user
router.get('/notifications/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const messages = await readSheet('Messages')
    
    // Notifications include messages specifically for the user or broadcast to 'all'
    const notifications = messages.filter(m => 
      m.toId === userId || m.toId?.toLowerCase() === 'all'
    ).map(m => ({
      ...m,
      type: m.channel === 'broadcast' ? 'system' : 'message' // Simple type mapping
    })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    res.json(notifications)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Mark message as read
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params
    const { updateRowWhere } = await import('../sheets.js') // Ensure it is available
    await updateRowWhere('Messages', 'id', id, { read: 'true' })
    res.json({ success: true })
  } catch (err) {
    console.error('[NOTIF ERROR]', err)
    res.status(500).json({ error: err.message })
  }
})

export default router
