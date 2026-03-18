import { useState } from 'react'
import { KeyRound, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react'
import * as api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export default function ForcePasswordModal() {
  const { user, setMustChangePassword } = useAuth()
  const { showToast } = useToast()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!user?.id) {
      setError('Session expired. Please log in again.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await api.changePassword({ empId: user.id, newPassword: password })
      showToast('Password updated successfully', 'success')
      setMustChangePassword(false)
    } catch (err) {
      setError('Failed to update password. Please try again.')
      showToast('Password update failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999
    }}>
      <div className="animate-in" style={{
        background: 'var(--bg-card)', border: '1px solid var(--line)',
        borderRadius: 28, padding: 40, width: '100%', maxWidth: 440,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        textAlign: 'center'
      }}>
        <div style={{
          width: 64, height: 64, background: 'var(--accent-glow)',
          borderRadius: 20, display: 'flex', alignItems: 'center',
          justifyContent: 'center', margin: '0 auto 24px', color: 'var(--accent)'
        }}>
          <KeyRound size={32} />
        </div>

        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, marginBottom: 12 }}>
          🔐 Set Your New Password
        </h2>
        <p style={{ color: 'var(--text-dim)', fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
          You are using a temporary password. Set your own password to continue.
        </p>

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              New Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                width: '100%', padding: '14px 18px', borderRadius: 16,
                background: 'var(--bg-elevated)', border: '1px solid var(--line)',
                color: 'var(--text)', outline: 'none', fontSize: 16
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Confirm Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              style={{
                width: '100%', padding: '14px 18px', borderRadius: 16,
                background: 'var(--bg-elevated)', border: '1px solid var(--line)',
                color: 'var(--text)', outline: 'none', fontSize: 16
              }}
            />
          </div>

          {error && (
            <div style={{
              display: 'flex', gap: 10, background: 'rgba(239, 68, 68, 0.1)',
              padding: '12px 16px', borderRadius: 12, color: '#ef4444',
              fontSize: 13, fontWeight: 600, alignItems: 'center', marginBottom: 24
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '16px', borderRadius: 16, fontSize: 16, fontWeight: 800, gap: 10 }}
          >
            {loading ? <Loader2 size={18} className="spin" /> : <ShieldCheck size={20} />}
            {loading ? 'SECURING ACCOUNT...' : 'UPDATE & CONTINUE'}
          </button>
        </form>
      </div>
    </div>
  )
}
