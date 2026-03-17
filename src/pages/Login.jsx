import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { loginUser } from '../services/api'

// Theme colors based on the reference drawing
const theme = {
  bg: '#F6F0E7', 
  cardBg: '#FFFFFF',
  accent: '#FAC885', 
  yellow: '#FAC885',
  green: '#A3E635',
  text: '#000000', 
  textMuted: '#64748b',
  border: '#e2e8f0',
  fontHeading: '"Syne", sans-serif', 
  fontBody: '"Inter", sans-serif'
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  
  const [empId, setEmpId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDemoClick = (id, pass) => {
    setEmpId(id)
    setPassword(pass)
    setError('')
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const data = await loginUser({ empId, password })
      
      if (data.success) {
        login(data.user)
        navigate(data.route)
      } else {
        setError(data.error || 'Invalid Employee ID or Password')
      }
    } catch (err) {
      setError('Network error connecting to auth server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme.bg,
      fontFamily: theme.fontBody,
      color: theme.text,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      
      {/* ─── HEADER LINK BAR ─── */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '32px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: theme.fontHeading, fontSize: '24px', fontWeight: 800 }}>
            SISWIT
            <span style={{ fontSize: '14px', fontWeight: 600, color: theme.textMuted, marginLeft: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
               HR.Portal <span style={{ width: '12px', height: '1px', background: theme.textMuted }} />
            </span>
         </div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '14px', fontWeight: 600 }}>
            <Globe size={18} color={theme.textMuted} />
         </div>
      </div>

      {/* ─── BACKGROUND VECTOR ART ─── */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
         {/* Left Side Elements */}
         <svg style={{ position: 'absolute', top: '35%', left: '10%' }} width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 20C15 20 15 5 30 5C45 5 45 35 60 35C75 35 75 10 90 10C105 10 105 20 120 20" stroke={theme.textMuted} strokeWidth="1.5" strokeLinecap="round"/>
         </svg>
         
         <div style={{ position: 'absolute', top: '45%', left: '15%', width: '100px', height: '60px', border: `1.5px solid ${theme.textMuted}`, display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center', padding: '0 20px' }}>
            <div style={{ width: '40px', height: '2px', background: theme.textMuted }} />
            <div style={{ width: '60px', height: '2px', background: theme.textMuted }} />
         </div>

         <div style={{ position: 'absolute', bottom: '20%', left: '12%', width: '80px', height: '140px', background: theme.accent, borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '100%', backgroundImage: 'radial-gradient(#111115 2px, transparent 2px)', backgroundSize: '16px 16px' }} />
         </div>

         {/* Right Side Elements */}
         <svg style={{ position: 'absolute', top: '25%', right: '25%' }} width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 20C10 20 10 0 20 0C30 0 30 40 40 40" stroke={theme.textMuted} strokeWidth="1.5" strokeLinecap="round"/>
         </svg>
         
         <div style={{ position: 'absolute', bottom: '20%', right: '15%', width: '100px', height: '120px', background: theme.yellow, borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '100%', backgroundImage: 'radial-gradient(#111115 2.5px, transparent 2.5px)', backgroundSize: '16px 16px' }} />
         </div>

         {/* Abstract Character */}
         <div style={{ position: 'absolute', bottom: '30%', right: '23%', width: '180px', height: '220px' }}>
            <svg width="100%" height="100%" viewBox="0 0 180 220" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M90 140 L 70 200 L 60 205" stroke={theme.textMuted} strokeWidth="14" strokeLinejoin="round" fill="none"/>
               <path d="M90 140 L 110 200 L 120 205" stroke={theme.textMuted} strokeWidth="14" strokeLinejoin="round" fill="none"/>
               <path d="M80 80 Q 70 120 90 140 Q 110 120 100 80 Z" fill={theme.text} />
               <circle cx="90" cy="50" r="16" fill={theme.textMuted} />
               <path d="M20 70 L 40 120 L 55 120 L 50 115 L 25 70 Z" fill={theme.green} />
            </svg>
         </div>
      </div>
      
      {/* ─── CENTRAL LOGIN CARD ─── */}
      <div style={{
         position: 'relative',
         zIndex: 10,
         width: '100%',
         maxWidth: '460px',
         background: theme.cardBg,
         borderRadius: '32px',
         padding: '56px 48px',
         boxShadow: '0 24px 80px rgba(0,0,0,0.1)'
      }} className="animate-in slide-in-from-bottom-8 duration-700">
         
         {/* Form Titles */}
         <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontFamily: theme.fontHeading, fontSize: '32px', fontWeight: 800, margin: '0 0 12px 0' }}>Agent Login</h1>
            <p style={{ color: theme.textMuted, fontSize: '14px', lineHeight: 1.5, margin: 0, padding: '0 16px' }}>
               Hey, Enter your details to get sign in to your account
            </p>
         </div>

         {error && (
            <div style={{
              backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px',
              fontSize: '13px', fontWeight: 600, textAlign: 'center', marginBottom: '24px',
              border: '1px solid #fecaca'
            }}>
              {error}
            </div>
         )}

         <form onSubmit={handleLoginSubmit}>
            <div style={{ marginBottom: '16px' }}>
               <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: theme.text, marginBottom: '8px' }}>Employee ID / No</label>
               <input
                  type="text"
                  placeholder="Enter Employee ID / No"
                  value={empId}
                  onChange={e => setEmpId(e.target.value.toUpperCase())}
                  required
                  style={{
                     width: '100%', padding: '16px 20px',
                     background: 'transparent', border: `1.5px solid ${theme.border}`,
                     borderRadius: '12px', color: theme.text, fontSize: '14px', outline: 'none',
                     transition: 'all 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = theme.accent}
                  onBlur={e => e.target.style.borderColor = theme.border}
               />
            </div>

            <div style={{ marginBottom: '16px', position: 'relative' }}>
               <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: theme.text, marginBottom: '8px' }}>Passcode</label>
               <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Passcode"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{
                     width: '100%', padding: '16px 60px 16px 20px',
                     background: 'transparent', border: `1.5px solid ${theme.border}`,
                     borderRadius: '12px', color: theme.text, fontSize: '14px', outline: 'none',
                     letterSpacing: showPassword ? 'normal' : '2px',
                     transition: 'all 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = theme.accent}
                  onBlur={e => e.target.style.borderColor = theme.border}
               />
               <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                     position: 'absolute', right: '16px', top: '38px',
                     background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer',
                     fontSize: '13px', fontWeight: 600, padding: '4px 8px'
                  }}
               >
                  {showPassword ? 'Show' : 'Hide'}
               </button>
            </div>

            <div style={{ marginBottom: '32px' }}>
               <button type="button" onClick={() => alert('Support module coming soon!')} style={{ background: 'none', border: 'none', padding: 0, fontSize: '13px', color: theme.textMuted, fontWeight: 500, cursor: 'pointer' }}>
                  Having trouble in sign in?
               </button>
            </div>

            <button
               type="submit"
               disabled={loading || !empId || !password}
               style={{
                  width: '100%', padding: '16px', borderRadius: '12px',
                  background: theme.accent, color: theme.text, fontWeight: 700, fontSize: '15px',
                  border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'opacity 0.2s', opacity: (loading || !empId || !password) ? 0.7 : 1
               }}
            >
               {loading ? 'Signing in...' : 'Sign in'}
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '32px 0' }}>
               <div style={{ flex: 1, height: '1px', background: theme.border }} />
               <span style={{ fontSize: '12px', color: theme.textMuted, fontWeight: 600 }}>Or Sign in with</span>
               <div style={{ flex: 1, height: '1px', background: theme.border }} />
            </div>

            {/* Social/Demo Pill Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
               <button type="button" onClick={() => handleDemoClick('HR-001','demo')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: '#fff', border: `1.5px solid ${theme.border}`, borderRadius: '12px', color: theme.text, fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  <UserCircle size={16} color={theme.text} /> HR
               </button>
               <button type="button" onClick={() => handleDemoClick('FIN-001','demo')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: '#fff', border: `1.5px solid ${theme.border}`, borderRadius: '12px', color: theme.text, fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  <Briefcase size={16} color={theme.text} /> Finance
               </button>
               <button type="button" onClick={() => handleDemoClick('ADM-999','demo')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: '#fff', border: `1.5px solid ${theme.border}`, borderRadius: '12px', color: theme.text, fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  <Command size={16} color={theme.text} /> Admin
               </button>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '32px' }}>
               <span style={{ fontSize: '13px', color: theme.textMuted, fontWeight: 500 }}>
                  Don't have an account? <button type="button" onClick={() => alert('Request access module coming soon!')} style={{ background: 'none', border: 'none', padding: 0, color: theme.text, fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>Request Now</button>
               </span>
            </div>
         </form>
      </div>

      {/* ─── FOOTER ─── */}
      <div style={{ position: 'absolute', bottom: '32px', left: 0, right: 0, textAlign: 'center', fontSize: '12px', color: theme.textMuted, fontWeight: 500, zIndex: 10 }}>
         Copyright @siswit 2026 &nbsp;|&nbsp; Privacy Policy
      </div>
      
    </div>
  )
}
