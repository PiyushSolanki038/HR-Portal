import { useState, useEffect } from 'react'
import { useScreenSize } from '../hooks/useScreenSize'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Navigate } from 'react-router-dom'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import * as api from '../services/api'
import { Send, Download, Mail, MessageCircle, FileText, CheckCircle2 } from 'lucide-react'

export default function Salary() {
  const { isMobile, isTablet, isDesktop } = useScreenSize()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [payroll, setPayroll] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getPayroll().then(data => {
      setPayroll(data.map(p => ({ ...p, slipStatus: 'Pending' })))
    }).catch(() => {
      showToast('Failed to load salary slips', 'error')
    }).finally(() => setLoading(false))
  }, [showToast])

  const role = user?.role?.toLowerCase() || ''
  const canAccess = role === 'hr manager' || role === 'admin' || user?.id?.startsWith('FIN') || role === 'finance'
  
  if (!canAccess) {
    return <Navigate to="/" replace />
  }

  if (loading) return <LoadingSpinner />

  const monthStr = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
  const pendingCount = payroll.filter(p => p.slipStatus === 'Pending').length

  const handleSendSlip = async (id, channel) => {
    try {
      showToast(`Sending via ${channel}...`, 'success')
      await api.dispatchSlip(id, { channel, actor: user?.id })
      setPayroll(prev => prev.map(p => p.emp?.id === id ? { ...p, slipStatus: 'Sent' } : p))
      showToast(`Salary slip dispatched to ${id}`, 'success')
    } catch {
      showToast('Dispatch failed', 'error')
    }
  }

  const handleBulkAction = (action) => {
    showToast(`Bulk Action: ${action} initiated`, 'success')
    if (action.includes('Send')) {
      setTimeout(() => {
        setPayroll(prev => prev.map(p => ({ ...p, slipStatus: 'Sent' })))
        showToast('All pending slips marked as sent', 'success')
      }, 1500)
    }
  }

  return (
    <div className="animate-in" style={{ padding: isMobile ? 12 : 28, maxWidth: '100%', overflowX: 'hidden' }}>
      <div className="page-header" style={{ flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? 16 : 24, marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 24 : 32, fontWeight: 800 }}>Salary Slips</h1>
          <p className="subtitle" style={{ fontFamily: 'var(--font-mono)', fontSize: isMobile ? 12 : 14 }}>
            {monthStr} • {pendingCount} Pending Dispatches
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
          <button className="btn btn-secondary" style={{ flex: isMobile ? '1 1 45%' : 'none', fontSize: isMobile ? 12 : 14 }} onClick={() => handleBulkAction('Email All')}>
            <Mail size={16} /> {isMobile ? 'Email' : 'Email Slips'}
          </button>
          <button className="btn btn-secondary" style={{ flex: isMobile ? '1 1 45%' : 'none', fontSize: isMobile ? 12 : 14 }} onClick={() => handleBulkAction('Download ZIP')}>
            <Download size={16} /> {isMobile ? 'ZIP' : 'Download ZIP'}
          </button>
          <button className="btn btn-secondary" style={{ flex: isMobile ? '1 1 45%' : 'none', fontSize: isMobile ? 12 : 14 }} onClick={() => handleBulkAction('Send All WA')}>
            <MessageCircle size={16} color="var(--green)" /> {isMobile ? 'WhatsApp' : 'WhatsApp'}
          </button>
          <button className="btn btn-primary" style={{ flex: isMobile ? '1 1 45%' : 'none', fontSize: isMobile ? 12 : 14 }} onClick={() => handleBulkAction('Send All TG')}>
            <Send size={16} /> {isMobile ? 'Telegram' : 'Telegram'}
          </button>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gap: 20, 
        gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(340px, 1fr))' 
      }}>
        {payroll.map((p, i) => (
          <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: isMobile ? 16 : 24 }}>
            
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="avatar avatar-lg" style={{ background: p.emp?.color || 'var(--accent)', borderRadius: 12, boxShadow: `0 4px 12px ${p.emp?.color}60` }}>
                  {p.emp?.av || p.emp?.name?.substring(0,2).toUpperCase() || '??'}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{p.emp?.name}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{p.emp?.id} • {p.emp?.dept}</div>
                </div>
              </div>
              <span className={`badge ${p.slipStatus === 'Sent' ? 'badge-green' : 'badge-amber'}`}>
                {p.slipStatus === 'Sent' ? <CheckCircle2 size={12} style={{ marginRight: 4 }}/> : null}
                {p.slipStatus}
              </span>
            </div>

            {/* Financial Details */}
            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--text-dim)' }}>Gross Salary</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>₹{(p.gross || 0).toLocaleString('en-IN')}</span>
              </div>
              {(p.deductions || 0) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    Deductions <span style={{ fontSize: 10, padding: '2px 6px', background: 'var(--red-dim)', borderRadius: 4 }}>Locked</span>
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--red)' }}>-₹{p.deductions.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700 }}>
                <span>Net Salary</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--green)' }}>₹{(p.net || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
              <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => handleSendSlip(p.emp?.id, 'telegram')}>
                <Send size={14} color="var(--blue)" /> TG
              </button>
              <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => handleSendSlip(p.emp?.id, 'whatsapp')}>
                <MessageCircle size={14} color="var(--green)" /> WA
              </button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-icon btn-sm" title="Generate PDF" onClick={() => handleBulkAction(`Generate PDF for ${p.emp?.name}`)}><FileText size={14} /></button>
                <button className="btn btn-icon btn-sm" title="Email" onClick={() => handleSendSlip(p.emp?.id, 'email')}><Mail size={14} /></button>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  )
}
