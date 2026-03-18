import { X } from 'lucide-react'
import { useScreenSize } from '../../hooks/useScreenSize' // Correct path depending on where it's called

export default function Modal({ isOpen = true, title, onClose, children, footer, maxWidth = 500 }) {
  const { isMobile } = useScreenSize()
  
  if (!isOpen) return null;
  
  return (
    <div 
      style={{ 
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 1000,
        display: 'flex',
        alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)',
        padding: isMobile ? 0 : 16
      }} 
      onClick={onClose}
    >
      <div 
        className="card" 
        onClick={e => e.stopPropagation()} 
        style={{ 
          width: isMobile ? '100vw' : '100%',
          maxWidth: isMobile ? '100vw' : maxWidth,
          maxHeight: isMobile ? '92vh' : '85vh',
          overflowY: 'auto',
          background: 'var(--bg-card)',
          borderRadius: isMobile ? '20px 20px 0 0' : 24,
          padding: isMobile ? '24px 16px 32px' : 32,
          WebkitOverflowScrolling: 'touch',
          position: 'relative',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          border: '1px solid var(--line)'
        }}
      >
        {isMobile && (
          <div style={{
            width: 40, height: 4,
            background: 'var(--line)',
            borderRadius: 2,
            margin: '0 auto 20px'
          }} />
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: isMobile ? 18 : 24, fontWeight: 700, margin: 0 }}>{title}</h2>
          <button className="btn-icon" onClick={onClose} style={{ borderRadius: '50%', padding: 8, flexShrink: 0 }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ marginBottom: footer ? 32 : 0 }}>
          {children}
        </div>
        {footer && (
          <div style={{ 
            marginTop: 32, 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: 12,
            borderTop: '1px solid var(--line)',
            paddingTop: 24,
            width: '100%',
            flexDirection: isMobile ? 'column-reverse' : 'row'
          }} className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
