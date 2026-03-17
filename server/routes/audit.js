import { Router } from 'express'
import { readSheet, appendRow } from '../sheets.js'

const router = Router()

export async function appendAudit(type, description, actor) {
  const id = `AUD${Date.now()}`
  await appendRow('Audit', [id, type, description, actor, new Date().toISOString()])
}

router.get('/', async (req, res) => {
  try {
    const events = await readSheet('Audit')
    res.json(events.reverse())
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
