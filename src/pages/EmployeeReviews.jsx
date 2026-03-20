import { useState, useMemo, useEffect } from 'react'
import { useScreenSize } from '../hooks/useScreenSize'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { 
  Star, Users, MessageSquare, Send, Search, 
  Filter, User, Calendar, Trash2, Award, 
  Quote, CheckCircle2, RefreshCw 
} from 'lucide-react'
import * as api from '../services/api'

export default function EmployeeReviews() {
  const { isMobile } = useScreenSize()
  const { employees, refresh } = useData()
  const { user } = useAuth()
  const { showToast } = useToast()

  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reviews, setReviews] = useState([])
  const [loadingReviews, setLoadingReviews] = useState(true)

  useEffect(() => {
    const fetchReviews = async () => {
        try {
            const data = await api.getReviews()
            if (Array.isArray(data)) setReviews([...data].reverse())
        } catch {}
        finally { setLoadingReviews(false) }
    }
    fetchReviews()
  }, [])

  // Filter out admins/heads as requested
  const reviewableEmployees = useMemo(() => {
    return employees.filter(e => {
        const isAdmin = e.role?.toLowerCase() === 'admin' || e.id?.toUpperCase().startsWith('ADM');
        const isHead = e.role?.toLowerCase().includes('head') || e.role?.toLowerCase().includes('manager');
        // User said "employee only not head"
        return !isAdmin && !isHead;
    }).filter(e => 
        e.name.toLowerCase().includes(search.toLowerCase()) || 
        e.dept.toLowerCase().includes(search.toLowerCase())
    )
  }, [employees, search])

  const selectedEmp = useMemo(() => 
    employees.find(e => e.id === selectedId), 
  [employees, selectedId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedId) return showToast('Please select an employee', 'warning')
    if (!comment.trim()) return showToast('Please write a review', 'warning')

    setIsSubmitting(true)
    try {
        const payload = {
            empId: selectedId,
            reviewerId: user?.id || 'admin',
            reviewerName: user?.name || 'Admin',
            rating,
            comment
        }
        const saved = await api.addReview(payload)
        setReviews([saved, ...reviews])
        showToast('Review submitted & notifications dispatched', 'success')
        setComment('')
        setRating(5)
        setSelectedId('')
    } catch {
        showToast('Submission failed', 'error')
    } finally {
        setIsSubmitting(false)
    }
}

  return (
    <div className="animate-in" style={{ padding: isMobile ? 12 : 32, maxWidth: 1200, margin: '0 auto', paddingBottom: 100 }}>
      <div style={{ marginBottom: 48 }}>
        <h1 className="glow-text" style={{ fontSize: isMobile ? 32 : 44, fontWeight: 900, letterSpacing: -1.5 }}>Employee Reviews</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, fontWeight: 700, marginTop: 4 }}>Authentic feedback for organizational excellence.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '380px 1fr', gap: 40, alignItems: 'start' }}>
        
        {/* Left: Employee Selection */}
        <div className="card-glass" style={{ padding: 24, borderRadius: 28, border: '1px solid var(--line)', background: '#fff', position: 'sticky', top: 32 }}>
            <h3 style={{ fontSize: 16, fontWeight: 900, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Users size={18} color="var(--blue)" /> Select Employee
            </h3>
            
            <div style={{ position: 'relative', marginBottom: 24 }}>
                <Search size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                <input 
                    type="text" 
                    placeholder="Search name or dept..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ 
                        width: '100%', padding: '14px 14px 14px 44px', borderRadius: 16, 
                        background: 'var(--bg-hover)', border: 'none', 
                        fontSize: 13, fontWeight: 700, outline: 'none' 
                    }}
                />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 500, overflowY: 'auto', paddingRight: 4 }} className="no-scrollbar">
                {reviewableEmployees.map(emp => (
                    <button 
                        key={emp.id}
                        onClick={() => setSelectedId(emp.id)}
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: 12, padding: 12, 
                            borderRadius: 16, border: selectedId === emp.id ? '2px solid var(--blue)' : '1px solid transparent',
                            background: selectedId === emp.id ? 'var(--blue-dim)' : 'transparent',
                            transition: 'all 0.2s', textAlign: 'left', width: '100%'
                        }}
                    >
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: emp.color || 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13 }}>
                            {emp.av || '?'}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>{emp.name}</div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>{emp.dept}</div>
                        </div>
                        {selectedId === emp.id && <CheckCircle2 size={16} color="var(--blue)" />}
                    </button>
                ))}
                {reviewableEmployees.length === 0 && (
                    <div style={{ padding: 40, textAlign: 'center', opacity: 0.5, fontSize: 13, fontWeight: 600 }}>No eligible employees found.</div>
                )}
            </div>
        </div>

        {/* Right: Review Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div className="card-glass" style={{ padding: isMobile ? 24 : 40, borderRadius: 32, border: '1px solid var(--line)', background: '#fff' }}>
                {!selectedId ? (
                    <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>
                        <Quote size={48} style={{ marginBottom: 20, opacity: 0.2 }} />
                        <h3 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)' }}>Start a Review</h3>
                        <p style={{ fontWeight: 600, fontSize: 14 }}>Select an employee from the list to write your feedback.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                            <div style={{ width: 64, height: 64, borderRadius: 20, background: selectedEmp?.color || 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 24 }}>
                                {selectedEmp?.av || '?'}
                            </div>
                            <div>
                                <h2 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>Reviewing {selectedEmp?.name}</h2>
                                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--muted)', margin: 0 }}>{selectedEmp?.role} • {selectedEmp?.dept}</p>
                            </div>
                        </div>

                        <div style={{ background: 'var(--bg-hover)', padding: 24, borderRadius: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                            <label style={{ fontSize: 11, fontWeight: 900, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Overall Performance Rating</label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button 
                                        key={star}
                                        type="button" 
                                        onClick={() => setRating(star)}
                                        style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', transition: 'transform 0.2s' }}
                                        className="hover-scale"
                                    >
                                        <Star 
                                            size={32} 
                                            fill={star <= rating ? 'var(--accent)' : 'none'} 
                                            color={star <= rating ? 'var(--accent)' : 'var(--line)'} 
                                            strokeWidth={2.5}
                                        />
                                    </button>
                                ))}
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 900, color: 'var(--accent)' }}>
                                {rating === 5 ? 'EXCEPTIONAL' : rating === 4 ? 'GREAT' : rating === 3 ? 'GOOD' : rating === 2 ? 'FAIR' : 'NEEDS IMPROVEMENT'}
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <label style={{ fontSize: 11, fontWeight: 900, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <MessageSquare size={14} /> Detailed Feedback
                            </label>
                            <textarea 
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                placeholder="What makes this team member stand out? Or what could be improved?"
                                rows={6}
                                style={{ 
                                    width: '100%', padding: 24, borderRadius: 24, 
                                    background: 'var(--bg-hover)', border: '1px solid var(--line)', 
                                    fontSize: 15, fontWeight: 600, color: 'var(--text)', outline: 'none', resize: 'none'
                                }}
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="btn btn-primary" 
                            style={{ 
                                padding: 20, borderRadius: 20, fontWeight: 900, fontSize: 15, 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                                boxShadow: '0 12px 24px rgba(var(--accent-rgb), 0.2)'
                            }}
                        >
                            {isSubmitting ? <RefreshCw className="rotate" size={20} /> : <Send size={20} />}
                            {isSubmitting ? 'SUBMITTING...' : 'SUBMIT PERFORMANCE REVIEW'}
                        </button>
                    </form>
                )}
            </div>

            <div className="card-glass" style={{ padding: 32, borderRadius: 32, border: '1px solid var(--line)', background: '#fff' }}>
                <h3 style={{ fontSize: 16, fontWeight: 900, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Award size={18} color="var(--purple)" /> Review Feed
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: 600, overflowY: 'auto' }} className="no-scrollbar">
                    {reviews.map(rev => {
                        const emp = employees.find(e => e.id === rev.empId)
                        return (
                            <div key={rev.id} style={{ padding: 20, borderRadius: 20, background: 'var(--bg-hover)', border: '1px solid var(--line)', transition: 'all 0.2s' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ width: 28, height: 28, borderRadius: 8, background: emp?.color || 'var(--accent)', color: '#fff', fontSize: 10, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {emp?.av || '?'}
                                        </div>
                                        <span style={{ fontSize: 13, fontWeight: 900 }}>{emp?.name || 'Unknown'}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 2 }}>
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={10} fill={i < rev.rating ? 'var(--accent)' : 'none'} color={i < rev.rating ? 'var(--accent)' : 'var(--line)'} />
                                        ))}
                                    </div>
                                </div>
                                <p style={{ fontSize: 12, fontWeight: 600, margin: '8px 0', color: 'var(--text)', lineHeight: 1.5 }}>"{rev.comment}"</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, opacity: 0.6 }}>
                                    <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>By {rev.reviewer}</span>
                                    <span style={{ fontSize: 10, fontWeight: 800 }}>{rev.date}</span>
                                </div>
                            </div>
                        )
                    })}
                    {reviews.length === 0 && (
                        <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)', fontSize: 13, fontWeight: 600 }}>No reviews submitted yet.</div>
                    )}
                </div>
            </div>
        </div>
      </div>

      <style>{`
        .form-group-premium input:focus, .form-group-premium textarea:focus {
            border-color: var(--accent);
            background: #ffffff;
            box-shadow: 0 0 0 4px var(--accent-glow);
        }
        .rotate { animation: rotate 1s linear infinite; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
