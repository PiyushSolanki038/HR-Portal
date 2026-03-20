import { Router } from 'express'
import { readSheet } from '../sheets.js'
import { sendMessage } from '../telegram.js'
import { appendAudit } from './audit.js'

const router = Router()

router.get('/employee/:empId', async (req, res) => {
  try {
    const payroll = await readSheet('Payroll')
    const mySlips = payroll.filter(s => s.empId === req.params.empId)
    // Map to camelCase if needed, but the sheet has 'netSalary' etc based on MySalary.jsx usage
    // Actually MySalary expects: id, month, grossSalary, netSalary, deductions, basic, hra, specialAllowance, pf, tax, leaveDeduction
    res.json(mySlips)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

function calcSalary(emp, manualDeductions = 0) {
  const leaves = parseInt(emp.leaves) || 0
  const late   = parseInt(emp.late)   || 0
  
  let leaveDeduction = leaves > 3 ? (leaves - 3) * 500 : 0
  let lateDeduction = late > 5 ? 200 : 0
  let deductions = leaveDeduction + lateDeduction + manualDeductions
  
  return {
    gross:      parseInt(emp.salary) || 0,
    deductions,
    net:        (parseInt(emp.salary) || 0) - deductions,
    breakdown: {
      leavesUsed: leaves,
      lates: late,
      leaveDeduction,
      lateDeduction,
      other: manualDeductions,
      total: deductions
    }
  }
}

router.get('/', async (req, res) => {
  try {
    const [employees, governance, waivers] = await Promise.all([
      readSheet('Employees'),
      readSheet('Governance'),
      readSheet('Waivers')
    ])

    const monthLabel = new Date().toLocaleDateString('en-IN', { month:'long', year:'numeric' })
    const now = new Date()
    const currentMonthIdx = now.getMonth()
    const currentYear = now.getFullYear()

      const payroll = employees.map(emp => {
        const targetId = String(emp.id).trim()
        
        const empPenalties = governance
          .filter(g => {
            if (String(g.empId).trim() !== targetId || g.type !== 'disciplinary') return false
            const d = new Date(g.date)
            return d.getMonth() === currentMonthIdx && d.getFullYear() === currentYear
          })
          .reduce((sum, g) => sum + (parseFloat(g.penalty) || 0), 0)

        const empWaivers = waivers
          .filter(w => String(w.empId).trim() === targetId && String(w.month).trim() === monthLabel)
          .reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0)

      const salaryInfo = calcSalary(emp, empPenalties)
      
      // Apply waivers to total deductions and also update breakdown
      salaryInfo.deductions = Math.max(0, salaryInfo.deductions - empWaivers)
      salaryInfo.net = salaryInfo.gross - salaryInfo.deductions
      salaryInfo.breakdown.waivers = empWaivers
      salaryInfo.breakdown.total = salaryInfo.deductions

      return {
        emp,
        ...salaryInfo,
        sent: false
      }
    })
    res.json(payroll)
  } catch (err) {
    console.error('[API_ERROR] GET /api/payroll:', err.message)
    res.status(500).json({ error: 'Failed to fetch payroll data' })
  }
})

router.post('/dispatch/:empId', async (req, res) => {
  try {
    const { channel, actor } = req.body
    const employees = await readSheet('Employees')
    const emp = employees.find(e => e.id === req.params.empId)
    if (!emp) return res.status(404).json({ error: 'Employee not found' })

    const { gross, deductions, net } = calcSalary(emp)
    const month = new Date().toLocaleDateString('en-IN', { month:'long', year:'numeric' })

    if (channel === 'telegram' && emp.telegramChatId) {
      await sendMessage(emp.telegramChatId,
        `💰 <b>Salary Slip — ${month}</b>\n\n` +
        `Employee: ${emp.name}\n` +
        `ID: ${emp.id}\n\n` +
        `Gross Salary:  ₹${gross.toLocaleString('en-IN')}\n` +
        (deductions > 0 ? `Deductions:    ₹${deductions.toLocaleString('en-IN')}\n` : '') +
        `──────────────────\n` +
        `Net Salary:    ₹${net.toLocaleString('en-IN')}\n\n` +
        `Payment Date: 31 ${month}`
      )
    }

    await appendAudit('dispatch', `Salary slip sent to ${emp.name}`, actor || 'portal')
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/dispatch-all', async (req, res) => {
  try {
    const { actor } = req.body
    const employees = await readSheet('Employees')
    const month = new Date().toLocaleDateString('en-IN', { month:'long', year:'numeric' })

    await Promise.all(employees.map(emp => {
      if (!emp.telegramChatId) return Promise.resolve()
      const { gross, deductions, net } = calcSalary(emp)
      return sendMessage(emp.telegramChatId,
        `💰 <b>Salary Slip — ${month}</b>\n\n` +
        `Employee: ${emp.name}\n` +
        `Gross: ₹${gross.toLocaleString('en-IN')}\n` +
        (deductions > 0 ? `Deductions: ₹${deductions.toLocaleString('en-IN')}\n` : '') +
        `Net: ₹${net.toLocaleString('en-IN')}`
      )
    }))

    await appendAudit('dispatch', `Salary slips dispatched to all ${employees.length} employees`, actor || 'portal')
    res.json({ success: true, sent: employees.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
