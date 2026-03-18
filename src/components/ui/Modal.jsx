import { X } from 'lucide-react'
import { useScreenSize } from '../../hooks/useScreenSize' // Correct path depending on where it's called

export default function Modal({ title, onClose, children, footer, maxWidth = 500 }) {
  const { isMobile } = useScreenSize()
  
  return (
    <div 
      style={{ 
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
        background: 'rgba(0,0,0,0.4)', display: 'flex', 
        alignItems: isMobile ? 'flex-end' : 'center', 
        justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' 
      }} 
      onClick={onClose}
    >
      <div 
        className="card" 
        onClick={e => e.stopPropagation()} 
        style={{ 
          maxWidth: isMobile ? '100%' : maxWidth, 
          width: isMobile ? '100%' : '90%',
          borderRadius: isMobile ? '24px 24px 0 0' : '24px',
          padding: isMobile ? '20px' : '32px',
          maxHeight: isMobile ? '90vh' : 'auto',
          overflowY: 'auto',
          background: 'var(--bg-card)',
          position: 'relative',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          border: '1px solid var(--line)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{title}</h2>
          <button className="btn-icon" onClick={onClose} style={{ borderRadius: '50%', padding: 8 }}>
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
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
