import { Router } from 'express'
import { appendRow, readSheet, findRow } from '../sheets.js'
import { sendMessage } from '../telegram.js'

const router = Router()

router.get('/', async (req, res) => {
    try {
        const data = await readSheet('Reviews')
        res.json(data)
    } catch (e) {
        res.status(500).json({ error: e.message })
    }
})

router.post('/', async (req, res) => {
    try {
        const { empId, reviewerId, reviewerName, rating, comment } = req.body
        const id = `REV${Date.now()}`
        const date = new Date().toISOString().split('T')[0]
        
        const newReview = { id, empId, reviewerId, reviewerName, rating, comment, date }
        await appendRow('Reviews', newReview)
        
        // Notifications Logic
        const emps = await readSheet('Employees')
        const targetEmp = emps.find(e => e.id === empId)
        
        const stars = '⭐'.repeat(rating)
        const msg = `📝 <b>New Performance Review</b>\n\n` +
                    `<b>For:</b> ${targetEmp?.name || empId}\n` +
                    `<b>Rating:</b> ${stars} (${rating}/5)\n` +
                    `<b>Comment:</b> "${comment}"\n` +
                    `<b>By:</b> ${reviewerName}\n\n` +
                    `View all reviews in the portal.`

        // 1. Notify the Employee
        if (targetEmp?.telegramChatId) {
            await sendMessage(targetEmp.telegramChatId, msg).catch(e => console.error('TG_ERR:', e.message))
        }
        
        // 2. Notify HR (Pooja)
        const hr = emps.find(e => {
            const r = (e.role || '').toLowerCase()
            return r.includes('hr manager') || r === 'hr'
        })
        if (hr?.telegramChatId) {
            await sendMessage(hr.telegramChatId, `🔔 <b>HR Alert: New Review</b>\n\n${msg}`).catch(e => console.error('TG_ERR_HR:', e.message))
        }
        
        // 3. Notify Admins (Heads and Root Admin)
        const admins = emps.filter(e => {
            const r = (e.role || '').toLowerCase()
            return r === 'head' || r === 'admin' || r === 'owner'
        })
        for (const admin of admins) {
            if (admin.telegramChatId) {
                await sendMessage(admin.telegramChatId, `🛡️ <b>Admin Alert: New Review</b>\n\n${msg}`).catch(e => console.error('TG_ERR_ADMIN:', e.message))
            }
        }
        
        if (process.env.TELEGRAM_ADMIN_ID) {
            await sendMessage(process.env.TELEGRAM_ADMIN_ID, `🛡️ <b>Root Admin Alert: New Review</b>\n\n${msg}`).catch(e => console.error('TG_ERR_ROOT:', e.message))
        }

        res.json(newReview)
    } catch (e) {
        res.status(500).json({ error: e.message })
    }
})

export default router
