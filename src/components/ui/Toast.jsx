import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useToast } from '../../context/ToastContext'

const ICONS = {
  success: CheckCircle,
  error:   AlertCircle,
  warning: AlertTriangle,
  info:    Info,
}

const COLORS = {
  success: 'var(--green)',
  error:   'var(--red)',
  warning: 'var(--amber)',
  info:    'var(--blue)',
}

export default function Toast() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="toast-container">
      {toasts.map(toast => {
        const Icon = ICONS[toast.type] || Info
        return (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <div className="toast-icon">
              <Icon size={18} style={{ color: COLORS[toast.type] }} />
            </div>
            <span className="toast-message">{toast.message}</span>
            <button className="toast-close" onClick={() => removeToast(toast.id)}>
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
