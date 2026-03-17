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
    
    // Find user with trimmed comparison
    const user = loginData.find(u => {
      const matchId = u.id?.toString().trim().toUpperCase() === empId.toString().trim().toUpperCase()
      const matchPass = u.password?.toString().trim() === password.toString().trim()
      console.log(`[DEBUG] checking user: "${u.id}" | Match ID: ${matchId} | Match Pass: ${matchPass}`)
      return matchId && matchPass
    })

    if (!user) {
      console.warn(`[AUTH] Login failed for ID: "${empId}". No matching record found in 'Login' sheet.`)
      return res.status(401).json({ error: 'Invalid Employee ID or Password' })
    }

    console.log(`[AUTH] Login successful for: ${user.name} (${empId})`)

    // Determine Role and Redirect Path
    // Handle both HR-001 and HR001 formats
    const rawId = empId.toUpperCase()
    let role = 'Employee', color = '#3b82f6', route = '/'
    
    if (rawId.startsWith('ADM')) {
      role = 'Admin'; color = '#8b5cf6'; route = '/analytics';
    } else if (rawId.startsWith('FIN')) {
      role = 'Finance'; color = '#10b981'; route = '/finance-dashboard';
    } else if (rawId.startsWith('HR')) {
      role = 'HR Manager'; color = '#4f6ef7'; route = '/';
    }

    // Success: Fetch full employee record for more details
    const allEmployees = await readSheet('Employees')
    const empRecord = allEmployees.find(e => e.id?.toString().trim().toUpperCase() === empId.toString().trim().toUpperCase())

    console.log(`[AUTH] Login successful for: ${user.name} (${empId})`)

    // Success: Return user data and route
    res.json({ 
      success: true, 
      user: {
         id: empId, 
         name: empRecord?.name || user.name || `${role} User`, 
         role: role, 
         dept: empRecord?.dept || 'Unknown',
         leavesQuota: empRecord?.leavesQuota || 12,
         av: empRecord?.av || rawId.substring(0,2),
         color: empRecord?.color || color, 
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

export default router
