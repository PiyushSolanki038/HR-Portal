import express from 'express'
import { readSheet, appendRow, updateRowWhere, findRow, deleteRowWhere } from '../sheets.js'

const router = express.Router()

// Get all mentors
router.get('/', async (req, res) => {
  try {
    const mentors = await readSheet('Mentors')
    res.json(mentors)
  } catch (err) {
    const code = err.code || (err.response && err.response.status)
    if (code === 400 || code === '400') {
      return res.json([]) // Return empty array if sheet not found
    }
    console.error('Fetch Mentors Error:', err)
    res.status(500).json({ error: 'Failed to fetch mentors' })
  }
})

// Add new mentor
router.get('/add', async (req, res) => {
  // This is a simple GET for quick testing if needed, or use POST
  // But let's stick to standard POST for the real UI
})

router.post('/', async (req, res) => {
  try {
    const { name, expertise, contact, email, color } = req.body
    const id = `M${Date.now().toString().slice(-6)}`
    
    // Headers: id, name, expertise, contact, email, color
    try {
      await appendRow('Mentors', [id, name, expertise, contact, email, color || '#4f6ef7'])
      res.json({ id, name, expertise, contact, email, color: color || '#4f6ef7' })
    } catch (sheetErr) {
      if (sheetErr.message.includes('range not found') || sheetErr.code === 400) {
        return res.status(400).json({ 
          error: 'Sheet "Mentors" tab not found. Please create it first with columns: id, name, expertise, contact, email' 
        })
      }
      throw sheetErr
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to add mentor' })
  }
})

// Assign mentor to employee (or unassign if mentorId is empty)
router.post('/assign', async (req, res) => {
  try {
    const { empId, mentorId } = req.body
    if (!empId) return res.status(400).json({ error: 'empId required' })
    
    // Explicitly handle unassigning
    const targetMentorId = mentorId || ''
    
    try {
      await updateRowWhere('Employees', 'id', empId, { mentorId: targetMentorId })
      res.json({ success: true, empId, mentorId: targetMentorId })
    } catch (sheetErr) {
      const code = sheetErr.code || (sheetErr.response && sheetErr.response.status)
      if (code === 400 || code === '400') {
        return res.status(400).json({ error: 'Employees sheet error: mentorId column might be missing' })
      }
      throw sheetErr
    }
  } catch (err) {
    console.error('Assign Mentor Error:', err)
    res.status(500).json({ error: 'Failed to assign mentor' })
  }
})

// Delete mentor
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    // 1. Delete the mentor row
    await deleteRowWhere('Mentors', 'id', id)
    
    // 2. Unassign any mentees (Safe Cleanup)
    const employees = await readSheet('Employees')
    const assignedEmps = employees.filter(e => e.mentorId === id)
    
    for (const emp of assignedEmps) {
      await updateRowWhere('Employees', 'id', emp.id, { mentorId: '' })
    }

    res.json({ success: true, message: 'Mentor deleted and mentees unassigned' })
  } catch (err) {
    console.error('Delete Mentor Error:', err)
    res.status(500).json({ error: 'Failed to delete mentor' })
  }
})

export default router
