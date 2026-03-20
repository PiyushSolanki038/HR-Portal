import { Router } from 'express'
import { readSheet, appendRow, updateRowWhere, deleteRowWhere, findRow } from '../sheets.js'
import { sendMessage } from '../telegram.js'

const router = Router()

// GET all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await readSheet('Tasks')
    res.json(tasks)
  } catch (err) {
    console.error('[API_ERROR] GET /api/tasks:', err.message)
    res.status(500).json({ error: 'Failed to fetch tasks list' })
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
    const taskDesc = t.description || t.desc || ''
    const empId = t.assignedTo || t.empId || ''

    const newTask = {
      id,
      empId,
      title: t.title,
      desc: taskDesc,
      deadline: t.deadline,
      priority: (t.priority || 'med').toLowerCase(),
      tag: t.tag || 'General',
      done: 'false',
      createdAt: new Date().toISOString(),
      assignedTo: empId,
      description: taskDesc
    }
    await appendRow('Tasks', newTask)

    // Automated Telegram Notification
    try {
      const emp = await findRow('Employees', 'id', newTask.assignedTo)
      if (emp?.telegramChatId) {
        const dl = new Date(newTask.deadline).toLocaleDateString('en-IN', { day:'2-digit', month:'short' })
        await sendMessage(emp.telegramChatId,
          `📋 <b>New Task Assigned</b>\n\n` +
          `<b>${newTask.title}</b>\n` +
          `Deadline: ${dl}\n` +
          `Priority: ${newTask.priority.toUpperCase()}\n\n` +
          `Check the portal for details.`
        )
      }
    } catch (notifyErr) {
      console.error('[NOTIFY_ERROR] Failed to send task notification:', notifyErr.message)
    }

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
    const currentDone = task.done === 'true' || task.done === true || String(task.done).toLowerCase() === 'true';
    const newDone = !currentDone;
    
    await updateRowWhere('Tasks', 'id', String(req.params.id), {
      done: String(newDone) // Keep consistently as lowercase string for the sheet
    })

    // NOTIFICATIONS ON COMPLETION
    if (newDone) {
      try {
        const [allTasks, employees] = await Promise.all([readSheet('Tasks'), readSheet('Employees')])
        const empTaskItems = allTasks.filter(t => String(t.assignedTo) === String(task.assignedTo))
        const doneCount = empTaskItems.filter(t => String(t.done).toLowerCase() === 'true').length
        const totalCount = empTaskItems.length
        const percent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0
        const emp = employees.find(e => String(e.id) === String(task.assignedTo))

        if (emp?.telegramChatId) {
          await sendMessage(emp.telegramChatId,
            `🎉 <b>Congratulations!</b>\n\n` +
            `You completed: <b>${task.title}</b>\n\n` +
            `Your task completion rate is now <b>${percent}%</b> (${doneCount}/${totalCount}).\n` +
            `Great work! Keep it up! 🚀`
          )
        }

        if (process.env.TELEGRAM_ADMIN_ID) {
          await sendMessage(process.env.TELEGRAM_ADMIN_ID,
            `✅ <b>Task Completed</b>\n\n` +
            `<b>Employee:</b> ${emp?.name || 'Unknown'}\n` +
            `<b>Task:</b> ${task.title}\n` +
            `<b>Performance:</b> ${percent}% (${doneCount}/${totalCount})`
          )
        }
      } catch (err) {
        console.error('[NOTIFY_ERROR] Completion notification failed:', err.message)
      }
    }

    res.json({ success: true, task: { ...task, done: String(newDone) } })
  } catch (err) {
    console.error('Toggle task error:', err)
    res.status(500).json({ error: err.message })
  }
})

// UPDATE task details
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body
    
    // Remove sensitive or non-updatable fields if any
    delete updates.id
    delete updates.createdAt

    await updateRowWhere('Tasks', 'id', String(id), updates)
    res.json({ success: true, id })
  } catch (err) {
    console.error('[API_ERROR] PATCH /api/tasks/:id:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// DELETE task
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    await deleteRowWhere('Tasks', 'id', String(id))
    res.json({ success: true, id })
  } catch (err) {
    console.error('[API_ERROR] DELETE /api/tasks/:id:', err.message)
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

// REMIND ALL pending tasks
router.post('/remind-all', async (req, res) => {
  try {
    const [tasks, employees] = await Promise.all([readSheet('Tasks'), readSheet('Employees')])
    const pendingTasks = tasks.filter(t => String(t.done).toLowerCase() !== 'true')
    
    // Group by employee
    const tasksPerEmp = pendingTasks.reduce((acc, t) => {
      acc[t.assignedTo] = acc[t.assignedTo] || []
      acc[t.assignedTo].push(t)
      return acc
    }, {})

    let count = 0
    for (const empId in tasksPerEmp) {
      const empTasks = tasksPerEmp[empId]
      const emp = employees.find(e => String(e.id) === String(empId))
      
      if (emp?.telegramChatId) {
        const taskList = empTasks.map(t => `• ${t.title}`).join('\n')
        await sendMessage(emp.telegramChatId,
          `📋 <b>Pending Task Summary</b>\n\n` +
          `You have <b>${empTasks.length}</b> open action items:\n\n${taskList}\n\n` +
          `Please check the portal to update your progress.`
        )
        count++
      }
    }

    res.json({ success: true, employeesReminded: count })
  } catch (err) {
    console.error('[API_ERROR] POST /api/tasks/remind-all:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// Bulk Broadcast Telegram Messages
router.post('/broadcast', async (req, res) => {
  const { group, message, actor } = req.body
  try {
    const [employees, attendance] = await Promise.all([
      readSheet('Employees'),
      readSheet('Attendance')
    ])
    
    let targets = []
    if (group === 'all') {
      targets = employees
    } else if (group.startsWith('dept:')) {
      const deptName = group.split(':')[1]
      targets = employees.filter(e => String(e.department || e.dept).toLowerCase() === deptName.toLowerCase())
    } else if (group === 'pending_attendance') {
      const today = new Date().toLocaleDateString('en-CA')
      const todayAtt = attendance.filter(a => a.date === today)
      targets = employees.filter(e => {
        const r = String(e.role).toLowerCase()
        if (r === 'admin' || r === 'head') return false
        return !todayAtt.some(a => a.empId === e.id && (a.status === 'p' || a.status === 'l' || a.status === 'a'))
      })
    }

    let count = 0
    for (const emp of targets) {
      if (emp.telegramChatId) {
        await sendMessage(emp.telegramChatId, `📢 <b>HR BROADCAST</b>\n\n${message}`)
        count++
      }
    }

    res.json({ success: true, sentCount: count })
  } catch (err) {
    console.error('[API_ERROR] POST /api/tasks/broadcast:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// System Health Check
router.get('/health', async (req, res) => {
  try {
    const start = Date.now()
    await readSheet('Employees')
    const latency = Date.now() - start
    res.json({ status: 'healthy', sheets: 'connected', latency: `${latency}ms` })
  } catch (err) {
    res.status(503).json({ status: 'degraded', error: err.message })
  }
})

export default router
