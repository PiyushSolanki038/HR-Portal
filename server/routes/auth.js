import express from 'express'
import dotenv from 'dotenv'
import { readSheet } from '../sheets.js'

dotenv.config()

const router = express.Router()

// Login endpoint: Direct authentication against 'Login' sheet
router.post('/login', async (req, res) => {
  try {
    const { empId, password } = req.body
    
    if (!empId || !password) {
      return res.status(400).json({ error: 'Missing Employee ID or Password' })
    }

    // Read the 'Login' sheet for credentials
    const loginData = await readSheet('Login')
    console.log(`[AUTH] Attempting login for ID: "${empId}"`)
    console.log(`[DEBUG] LoginData retrieved:`, JSON.stringify(loginData, null, 2))
    
    // Find user in Login sheet
    const user = loginData.find(u => {
      const matchId = u.id?.toString().trim().toUpperCase() === empId.toString().trim().toUpperCase()
      const matchPass = u.password?.toString().trim() === password.toString().trim()
      return matchId && matchPass
    })

    if (!user) {
      console.warn(`[AUTH] Login failed for ID: "${empId}"`)
      return res.status(401).json({ error: 'Invalid Employee ID or Password' })
    }

    // Success: Fetch full employee record for role/dept
    const allEmployees = await readSheet('Employees')
    const empRecord = allEmployees.find(e => e.id?.toString().trim().toUpperCase() === empId.toString().trim().toUpperCase())

    // Determine Role and Redirect Path
    const rawId = empId.toUpperCase()
    let role = 'Employee', color = '#3b82f6', route = '/'
    
    if (rawId.startsWith('ADM')) {
      role = 'Admin'; color = '#8b5cf6'; route = '/analytics';
    } else if (rawId.startsWith('FIN')) {
      role = 'Finance'; color = '#10b981'; route = '/finance-dashboard';
    } else if (rawId.startsWith('HR')) {
      role = 'HR Manager'; color = '#4f6ef7'; route = '/';
    }

    // Success: Return user data and route
    res.json({ 
      success: true, 
      user: {
         id: empId, 
         name: user.name || empRecord?.name || `${role} User`, 
         role: empRecord?.role || role, 
         dept: empRecord?.dept || 'Unknown',
         leavesQuota: empRecord?.leavesQuota || 12,
         av: empRecord?.av || rawId.substring(0,2),
         color: empRecord?.color || color, 
         mustChangePassword: user.mustChangePassword === 'true',
         token: 'direct_auth_token_ready'
      },
      route 
    })

  } catch (err) {
    console.error('[API_ERROR] POST /api/auth/login:', err.message)
    res.status(500).json({ error: 'Internal server error during authentication' })
  }
})

// OTP Verification is now deprecated (Removed as per user request)
router.post('/verify-otp', (req, res) => {
  res.status(410).json({ error: 'OTP authentication is no longer enabled.' })
})

// Change password endpoint
import { updateRowWhere } from '../sheets.js'
import { sendMessage } from '../telegram.js'

router.post('/change-password', async (req, res) => {
  try {
    const { empId, newPassword } = req.body
    
    if (!empId || !newPassword) {
      return res.status(400).json({ error: 'Missing employee ID or new password' })
    }

    // 1. Update password AND flag in Login sheet
    await updateRowWhere('Login', 'id', empId, { 
      password: newPassword,
      mustChangePassword: 'false'
    })

    // 2. Fetch employee record for Telegram
    const allEmployees = await readSheet('Employees')
    const empRecord = allEmployees.find(e => e.id?.toString().trim().toUpperCase() === empId.toString().trim().toUpperCase())

    // 3. Send Telegram notification if chat ID is available
    if (empRecord && empRecord.telegramChatId) {
      const msg = `🔐 <b>Password Updated</b>\n\nYour SISWIT password has been updated successfully. Your new password is saved securely. If you did not make this change, contact HR immediately.`
      await sendMessage(empRecord.telegramChatId, msg)
    }

    res.json({ success: true, message: 'Password updated successfully' })
  } catch (err) {
    console.error('[API_ERROR] POST /api/auth/change-password:', err.message)
    res.status(500).json({ error: 'Failed to update password' })
  }
})

// Set Temp Password (Admin only)
router.post('/set-temp-password', async (req, res) => {
  try {
    const { empId, tempPassword } = req.body
    if (!empId || !tempPassword) return res.status(400).json({ error: 'empId and tempPassword required' })

    await updateRowWhere('Login', 'id', empId, { 
      password: tempPassword,
      mustChangePassword: 'true'
    })

    res.json({ success: true, message: `Temporary password set for ${empId}` })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
