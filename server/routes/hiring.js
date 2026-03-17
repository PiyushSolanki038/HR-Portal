import { Router } from 'express'
import { readSheet, appendRow, updateRowWhere } from '../sheets.js'
import { appendAudit } from './audit.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    res.json(await readSheet('Hiring'))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const c = req.body
    const id = `CAND${Date.now()}`
    await appendRow('Hiring', [
      id, c.name, c.appliedFor, c.dept, c.contact,
      c.stage || 'applied', '', '', '', new Date().toISOString()
    ])
    await appendAudit('creation', `New candidate ${c.name} added for ${c.appliedFor}`, req.headers['x-user'] || 'hr')
    res.json({ success: true, id })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/:id/stage', async (req, res) => {
  try {
    const { stage } = req.body
    await updateRowWhere('Hiring', 'id', req.params.id, { stage })
    
    // Log to Audit
    const candidates = await readSheet('Hiring')
    const candidate = candidates.find(c => c.id === req.params.id)
    if (candidate) {
      await appendAudit('hiring', `Candidate ${candidate.name} moved to stage: ${stage}`, 'System')
    }

    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
