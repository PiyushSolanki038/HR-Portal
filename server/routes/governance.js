import express from 'express'
import { readSheet, appendRow, deleteRowWhere, updateRowWhere } from '../sheets.js'
import { appendAudit } from './audit.js'
import { sendMessage } from '../telegram.js'

const router = express.Router()
const TAB = 'Governance'

// Get all records
router.get('/', async (req, res) => {
  try {
    const data = await readSheet(TAB)
    res.json(data)
  } catch (err) {
    console.error(`[API_ERROR] GET /api/governance:`, err.message)
    res.status(500).json({ error: 'Failed to fetch governance data' })
  }
})

// Add a record
router.post('/', async (req, res) => {
  try {
    const { type, empId, empName, title, date, description, penalty } = req.body
    const newRecord = {
      id: Date.now().toString(),
      type,
      empId,
      empName,
      title,
      date: date || new Date().toISOString().split('T')[0],
      description,
      penalty: parseFloat(penalty) || 0,
      createdAt: new Date().toISOString()
    }
    await appendRow(TAB, newRecord)
    
    // Notify Employee via Telegram
    try {
      const employees = await readSheet('Employees')
      const emp = employees.find(e => e.id === empId)
      if (emp && emp.telegramChatId) {
        await sendMessage(emp.telegramChatId, 
          `🚨 <b>New Fiscal Adjustment Issued</b>\n\n` +
          `Title: ${title}\n` +
          `Penalty: <b>₹${penalty}</b>\n` +
          `Date: ${newRecord.date}\n\n` +
          `<i>Note: This has been docked from your current monthly payroll.</i>`
        )
      }
    } catch (msgErr) {
      console.error('[MSG_ERROR] Failed to notify employee of penalty:', msgErr.message)
    }

    // Log to Audit for Intelligence Stream
    await appendAudit(
      type === 'excellence' ? 'Excellence' : 'Disciplinary', 
      `${empName} received a new ${type === 'excellence' ? 'award' : 'warning'}: ${title}`,
      'Admin'
    )

    res.json(newRecord)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Delete a record
router.delete('/:id', async (req, res) => {
  try {
    await deleteRowWhere(TAB, 'id', req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// --- Penalty Catalog Management ---
const CATALOG_TAB = 'PenaltyCatalog'

router.get('/catalog', async (req, res) => {
  try {
    const data = await readSheet(CATALOG_TAB)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/catalog', async (req, res) => {
  try {
    const { label, amount, category } = req.body
    const newItem = {
      id: Date.now().toString(),
      label,
      amount: parseFloat(amount) || 0,
      category: category || 'General'
    }
    await appendRow(CATALOG_TAB, newItem)
    res.json(newItem)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/catalog/:id', async (req, res) => {
  try {
    const { label, amount, category } = req.body
    const updates = {}
    if (label !== undefined) updates.label = label
    if (amount !== undefined) updates.amount = parseFloat(amount) || 0
    if (category !== undefined) updates.category = category
    
    await updateRowWhere(CATALOG_TAB, 'id', req.params.id, updates)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/catalog/:id', async (req, res) => {
  try {
    await deleteRowWhere(CATALOG_TAB, 'id', req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// --- Waivers (Grace/Pardon Management) ---
const WAIVERS_TAB = 'Waivers'

router.get('/waivers', async (req, res) => {
  try {
    const data = await readSheet(WAIVERS_TAB)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/waivers', async (req, res) => {
  try {
    const { empId, amount, reason, month } = req.body
    const newWaiver = {
      id: Date.now().toString(),
      empId,
      amount: parseFloat(amount) || 0,
      reason: reason || 'High-Integrity Waiver',
      month: month || new Date().toLocaleDateString('en-IN', { month:'long', year:'numeric' }),
      date: new Date().toISOString().split('T')[0]
    }
    await appendRow(WAIVERS_TAB, newWaiver)
    
    // Notify Employee via Telegram
    try {
      const employees = await readSheet('Employees')
      const emp = employees.find(e => e.id === empId)
      if (emp && emp.telegramChatId) {
        await sendMessage(emp.telegramChatId, 
          `✅ <b>High-Integrity Waiver Granted</b>\n\n` +
          `Pardon Amount: <b>₹${newWaiver.amount}</b>\n` +
          `Reason: ${reason}\n` +
          `Cycle: ${newWaiver.month}\n\n` +
          `<i>Note: This adjustment has been credited back to your current payroll.</i>`
        )
      }
    } catch (msgErr) {
      console.error('[MSG_ERROR] Failed to notify employee of waiver:', msgErr.message)
    }

    res.json(newWaiver)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/waivers/:id', async (req, res) => {
  try {
    await deleteRowWhere(WAIVERS_TAB, 'id', req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
