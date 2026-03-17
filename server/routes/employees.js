import { Router } from 'express'
import { readSheet, appendRow, updateRowWhere, deleteRowWhere } from '../sheets.js'
import { appendAudit } from './audit.js'

const router = Router()

// GET all employees
router.get('/', async (req, res) => {
  try {
    const employees = await readSheet('Employees')
    res.json(employees)
  } catch (err) {
    console.error('[API_ERROR] GET /api/employees:', err.message)
    res.status(500).json({ error: 'Failed to fetch employee list' })
  }
})

// GET single employee by ID
router.get('/:id', async (req, res) => {
  try {
    const employees = await readSheet('Employees')
    const emp = employees.find(e => e.id === req.params.id)
    if (!emp) return res.status(404).json({ error: 'Employee not found' })
    res.json(emp)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST add new employee
router.post('/', async (req, res) => {
  try {
    const e = req.body
    await appendRow('Employees', {
      id: e.id,
      name: e.name,
      role: e.role,
      dept: e.dept,
      av: e.av || e.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase(),
      color: e.color || '#4f6ef7',
      status: 'active',
      telegramChatId: e.telegramChatId || '',
      tg: e.tg || '',
      wa: e.wa || '',
      email: e.email || '',
      joining: e.joining || '',
      salary: e.salary || '',
      score: 80,
      present: 0,
      late: 0,
      leaves: 0,
      deductions: 0,
      tax: 0
    })
    await appendAudit('creation', `New employee ${e.name} added`, req.headers['x-user'] || 'admin')
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH update employee field
router.patch('/:id', async (req, res) => {
  try {
    await updateRowWhere('Employees', 'id', req.params.id, req.body)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Assign Team Leader
router.post('/assign-tl', async (req, res) => {
  try {
    const { empId, teamLeaderId } = req.body
    if (!empId || !teamLeaderId) return res.status(400).json({ error: 'empId and teamLeaderId required' })
    await updateRowWhere('Employees', 'id', empId, { teamLeaderId })
    res.json({ success: true, empId, teamLeaderId })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE employee
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    await deleteRowWhere('Employees', 'id', id)
    await appendAudit('deletion', `Employee ${id} deleted`, req.headers['x-user'] || 'admin')
    res.json({ success: true, message: 'Employee deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
