import { Router } from 'express'
import { readSheet, appendRow, updateRowWhere, findRow } from '../sheets.js'
import { sendMessage } from '../telegram.js'

const router = Router()

// GET all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await readSheet('Tasks')
    res.json(tasks)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/employee/:empId', async (req, res) => {
  try {
    const tasks = await readSheet('Tasks')
    res.json(tasks.filter(t => t.assignedTo === req.params.empId))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const t = req.body
    const id = `TASK${Date.now()}`
    // Use object mapping instead of array to ensure columns line up correctly
    const newTask = {
      id,
      assignedTo: t.assignedTo || t.empId,
      title: t.title,
      description: t.description || t.desc || '',
      deadline: t.deadline,
      priority: t.priority || 'med',
      tag: t.tag || 'General',
      done: 'false',
      createdAt: new Date().toISOString()
    }
    await appendRow('Tasks', newTask)
    res.json(newTask)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/:id/toggle', async (req, res) => {
  try {
    const tasks = await readSheet('Tasks')
    const task = tasks.find(t => String(t.id) === String(req.params.id))
    if (!task) return res.status(404).json({ error: 'Task not found' })
    const newDone = task.done === 'true' ? 'false' : 'true'
    await updateRowWhere('Tasks', 'id', String(req.params.id), {
      done: newDone
    })
    res.json({ success: true, task: { ...task, done: newDone } })
  } catch (err) {
    console.error('Toggle task error:', err)
    res.status(500).json({ error: err.message })
  }
})

router.post('/:id/remind', async (req, res) => {
  try {
    const tasks = await readSheet('Tasks')
    const task = tasks.find(t => t.id === req.params.id)
    if (!task) return res.status(404).json({ error: 'Task not found' })

    const emp = await findRow('Employees', 'id', task.assignedTo)
    if (emp?.telegramChatId) {
      const dl = new Date(task.deadline).toLocaleDateString('en-IN', { day:'2-digit', month:'short' })
      await sendMessage(emp.telegramChatId,
        `📋 <b>Task Reminder</b>\n\n` +
        `<b>${task.title}</b>\n` +
        `Deadline: ${dl}\n` +
        `Priority: ${task.priority.toUpperCase()}`
      )
    }
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
