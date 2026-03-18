import { useState } from 'react'
import { KeyRound, ShieldCheck, AlertCircle, Loader2, X } from 'lucide-react'
import * as api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export default function ChangePasswordModal({ isOpen, onClose }) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await api.changePassword({ 
        empId: user.id, 
        currentPassword, 
        newPassword 
      })
      showToast('Password updated successfully', 'success')
      onClose()
      // Reset form
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      const msg = err.message.includes('401') ? 'Current password incorrect' : 'Failed to update password'
      setError(msg)
      showToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999
    }} onClick={onClose}>
      <div className="animate-in" style={{
        background: 'var(--bg-card)', border: '1px solid var(--line)',
        borderRadius: 24, padding: 32, width: '100%', maxWidth: 400,
        boxShadow: 'var(--shadow-xl)', position: 'relative'
      }} onClick={e => e.stopPropagation()}>
        
        <button 
          onClick={onClose}
          style={{ position: 'absolute', right: 20, top: 20, background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <div style={{
          width: 48, height: 48, background: 'var(--accent-glow)',
          borderRadius: 14, display: 'flex', alignItems: 'center',
          justifyContent: 'center', marginBottom: 20, color: 'var(--accent)'
        }}>
          <KeyRound size={24} />
        </div>

        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24, marginBottom: 8 }}>
          Change Password
        </h2>
        <p style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 24 }}>
          Enter your current password and set a new one to secure your account.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 12,
                background: 'var(--bg-elevated)', border: '1px solid var(--line)',
                color: 'var(--text)', outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>
              New Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 12,
                background: 'var(--bg-elevated)', border: '1px solid var(--line)',
                color: 'var(--text)', outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 12,
                background: 'var(--bg-elevated)', border: '1px solid var(--line)',
                color: 'var(--text)', outline: 'none'
              }}
            />
          </div>

          {error && (
            <div style={{
              display: 'flex', gap: 8, background: 'rgba(239, 68, 68, 0.1)',
              padding: '10px 12px', borderRadius: 10, color: '#ef4444',
              fontSize: 12, fontWeight: 600, alignItems: 'center', marginBottom: 20
            }}>
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', borderRadius: 14, gap: 8 }}
          >
            {loading ? <Loader2 size={18} className="spin" /> : <ShieldCheck size={18} />}
            {loading ? 'UPDATING...' : 'UPDATE PASSWORD'}
          </button>
        </form>
      </div>
    </div>
  )
}
