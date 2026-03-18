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
         role: role, // Use the system role determined by ID prefix
         jobTitle: empRecord?.role || 'Staff', // Original job title from Employees sheet
         dept: empRecord?.dept || 'Unknown',
         leavesQuota: empRecord?.leavesQuota || 12,
         av: empRecord?.av || rawId.substring(0,2),
         color: empRecord?.color || color, 
         mustChangePassword: user.mustChangePassword?.toString().toLowerCase() === 'true',
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
    const { empId, currentPassword, newPassword } = req.body
    
    if (!empId || !newPassword) {
      return res.status(400).json({ error: 'Missing employee ID or new password' })
    }

    // 0. Verify current password if provided
    const loginData = await readSheet('Login')
    const user = loginData.find(u => u.id?.toString().trim().toUpperCase() === empId.toString().trim().toUpperCase())
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (currentPassword && user.password !== currentPassword) {
      return res.status(401).json({ error: 'Current password incorrect' })
    }

    // 1. Update password AND flag in Login sheet
    await updateRowWhere('Login', 'id', empId, { 
      password: newPassword,
      mustChangePassword: 'false'
    })

    // 2. Fetch employee record for Telegram
    const allEmployees = await readSheet('Employees')
    const empRecord = allEmployees.find(e => e.id?.toString().trim().toUpperCase() === empId.toString().trim().toUpperCase())

    // 3. Send Telegram notification
    if (empRecord && empRecord.telegramChatId) {
      const msg = `✅ <b>Password Updated Successfully!</b>\n\nHello ${empRecord.name}!\n\nYour SISWIT portal password has been changed.\n\n👤 Employee ID: ${empId}\n🔑 New Password: ${newPassword}\n🌐 Portal: https://hr-portal-production-4b10.up.railway.app\n\nIf you did not make this change, contact HR immediately!\n\n- SISWIT HR Team`
      await sendMessage(empRecord.telegramChatId, msg)
    }

    res.json({ success: true, message: 'Password updated successfully' })
  } catch (err) {
    console.error('[API_ERROR] POST /api/auth/change-password:', err.message)
    res.status(500).json({ error: 'Failed to update password' })
  }
})

// Set temporary password (HR/Admin action)
router.post('/set-temp-password', async (req, res) => {
  try {
    const { empId, tempPassword } = req.body
    
    if (!empId || !tempPassword) {
      return res.status(400).json({ error: 'Missing employee ID or temporary password' })
    }

    await updateRowWhere('Login', 'id', empId, { 
      password: tempPassword,
      mustChangePassword: 'true'
    })

    res.json({ success: true, message: 'Temporary password set successfully' })
  } catch (err) {
    console.error('[API_ERROR] POST /api/auth/set-temp-password:', err.message)
    res.status(500).json({ error: 'Failed to set temporary password' })
  }
})

// Send Credentials to All via Telegram
router.post('/send-credentials-all', async (req, res) => {
  try {
    const loginData = await readSheet('Login')
    const employees = await readSheet('Employees')
    
    let sent = 0
    let failed = 0

    for (const loginUser of loginData) {
      if (!loginUser.id || !loginUser.password) continue

      const emp = employees.find(e => e.id?.toString().trim().toUpperCase() === loginUser.id.toString().trim().toUpperCase())
      
      if (emp && emp.telegramChatId) {
        const msg = `🔐 <b>SISWIT Portal Login Credentials</b>\n\nHello ${emp.name || loginUser.name}! Your account is ready.\n\n🌐 Portal: https://hr-portal-production-4b10.up.railway.app\n👤 Employee ID: ${loginUser.id}\n🔑 Temporary Password: ${loginUser.password}\n\n⚠️ You will be asked to set a new password when you login.\nPlease change it immediately for security.\n\n- SISWIT HR Team`
        
        try {
          await sendMessage(emp.telegramChatId, msg)
          sent++
        } catch (err) {
          console.error(`Failed to send to ${loginUser.id}:`, err.message)
          failed++
        }
      } else {
        failed++
      }
    }

    res.json({ success: true, sent, failed })
  } catch (err) {
    console.error('[API_ERROR] POST /api/auth/send-credentials-all:', err.message)
    res.status(500).json({ error: 'Failed to send credentials' })
  }
})

// Send Credentials to Individual via Telegram
router.post('/send-credentials-single', async (req, res) => {
  try {
    const { empId } = req.body
    if (!empId) return res.status(400).json({ error: 'empId required' })

    const loginData = await readSheet('Login')
    const employees = await readSheet('Employees')
    
    const loginUser = loginData.find(u => u.id?.toString().trim().toUpperCase() === empId.toString().trim().toUpperCase())
    if (!loginUser || !loginUser.password) {
      return res.status(404).json({ error: 'User credentials not found' })
    }

    const emp = employees.find(e => e.id?.toString().trim().toUpperCase() === empId.toString().trim().toUpperCase())
    
    if (!emp || !emp.telegramChatId) {
      return res.status(400).json({ error: 'Employee Telegram Chat ID not found' })
    }

    const msg = `🔐 <b>SISWIT Portal Login Credentials</b>\n\nHello ${emp.name || loginUser.name}! Your account is ready.\n\n🌐 Portal: https://hr-portal-production-4b10.up.railway.app\n👤 Employee ID: ${loginUser.id}\n🔑 Temporary Password: ${loginUser.password}\n\n⚠️ You will be asked to set a new password when you login.\nPlease change it immediately for security.\n\n- SISWIT HR Team`
    
    await sendMessage(emp.telegramChatId, msg)
    res.json({ success: true, message: `Credentials sent to ${empId}` })
  } catch (err) {
    console.error('[API_ERROR] POST /api/auth/send-credentials-single:', err.message)
    res.status(500).json({ error: 'Failed to send credentials' })
  }
})

export default router
