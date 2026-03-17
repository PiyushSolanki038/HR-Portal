import express from 'express'
import { readSheet, appendRow, deleteRowWhere } from '../sheets.js'
import { appendAudit } from './audit.js'

const router = express.Router()
const TAB = 'Governance'

// Get all records
router.get('/', async (req, res) => {
  try {
    const data = await readSheet(TAB)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Add a record
router.post('/', async (req, res) => {
  try {
    const { type, empId, empName, title, date, description } = req.body
    const newRecord = {
      id: Date.now().toString(),
      type,
      empId,
      empName,
      title,
      date: date || new Date().toISOString().split('T')[0],
      description,
      createdAt: new Date().toISOString()
    }
    await appendRow(TAB, newRecord)
    
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

export default router
