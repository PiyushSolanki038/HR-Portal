import { useState, useMemo } from 'react'
import { useScreenSize } from '../hooks/useScreenSize'
import { useData } from '../context/DataContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import StatCard from '../components/ui/StatCard'
import * as api from '../services/api'
import { useToast } from '../context/ToastContext'
import { 
  Search, UserPlus, Mail, Phone, BookOpen, Users, 
  Star, X, Plus, Trash2, TrendingUp, Award, 
  Zap, Briefcase, Globe, ShieldCheck, ChevronRight,
  Info, CheckCircle2
} from 'lucide-react'

export default function Mentors() {
  const { isMobile } = useScreenSize()
  const { mentors, employees, loading, error, refresh } = useData()
  const { showToast } = useToast()
  
  const [search, setSearch] = useState('')
  const [showDrawer, setShowDrawer] = useState(null) // 'add' or 'assign'
  const [selectedMentor, setSelectedMentor] = useState(null)
  const [newMentor, setNewMentor] = useState({ name: '', expertise: '', email: '', contact: '', title: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Mentorship Pulse Metrics
  const metrics = useMemo(() => {
    const totalMentors = mentors.length
    const activeAssignments = employees.filter(e => e.mentorId).length
    const saturation = Math.round((activeAssignments / (totalMentors * 3)) * 100) || 0 // Assuming cap of 3
    const avgExp = "12.5 Yrs"
    return { totalMentors, activeAssignments, saturation, avgExp }
  }, [mentors, employees])

  if (loading) return <LoadingSpinner />
  if (error) return <div style={{ padding: 24 }}>Error: {error}</div>

  const filtered = mentors.filter(m => {
    const mName = m.name || m.Name || ''
    const mExpertise = m.expertise || m.Expertise || ''
    return mName.toLowerCase().includes(search.toLowerCase()) ||
           mExpertise.toLowerCase().includes(search.toLowerCase())
  })

  const handleAddMentor = async () => {
    if (!newMentor.name || !newMentor.expertise) {
      showToast('Name and Expertise are required', 'error')
      return
    }
    setIsSubmitting(true)
    try {
      const colors = ['#4f6ef7', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#f97316']
      const randomColor = colors[Math.floor(Math.random() * colors.length)]
      await api.addMentor({ ...newMentor, color: randomColor })
      showToast('New Industry Expert Enlisted', 'success')
      setShowDrawer(null)
      setNewMentor({ name: '', expertise: '', email: '', contact: '', title: '' })
      refresh()
    } catch (err) {
      showToast('Enlistment sequence failed', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteMentor = async (id) => {
    if (!confirm('Are you absolutely sure you want to decommission this mentor? This will unassign all mentees.')) return
    try {
      await api.deleteMentor(id)
      showToast('Mentor record archived', 'success')
      refresh()
    } catch {
      showToast('Decommissioning failed', 'error')
    }
  }

  const handleAssignMentee = async (empId) => {
    if (!selectedMentor) return
    try {
      await api.assignMentor(empId, selectedMentor.id)
      showToast('Mentee linked successfully', 'success')
      refresh()
    } catch {
      showToast('Assignment link failed', 'error')
    }
  }

  const handleRemoveMentee = async (empId) => {
    if (!confirm('Sever this mentorship link?')) return
    try {
      await api.assignMentor(empId, '')
      showToast('Mentee link severed', 'success')
      refresh()
    } catch {
      showToast('Link removal failed', 'error')
    }
  }

  const getMentees = (mentorId) => employees.filter(e => e.mentorId === mentorId)
  const getUnassigned = () => employees.filter(e => !e.mentorId || e.mentorId === '')

  return (
    <div className="animate-in" style={{ padding: isMobile ? '16px' : '32px', maxWidth: 1600, margin: '0 auto' }}>
      {/* Executive Growth Header */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'flex-end', marginBottom: 40, gap: 24 }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 32 : 48, fontWeight: 900, letterSpacing: -2, margin: 0 }}>Mentorship Hub</h1>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--muted)', marginTop: 4, letterSpacing: 0.5 }}>Strategic industry alignment & personnel growth engine</p>
        </div>

        <div style={{ display: 'flex', gap: 12, width: isMobile ? '100%' : 'auto' }}>
            <div style={{ position: 'relative', flex: isMobile ? 1 : 'none' }}>
                <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                <input 
                    type="text" 
                    placeholder="Search expertise..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ width: isMobile ? '100%' : 260, padding: '12px 12px 12px 40px', borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--line)', fontSize: 13, fontWeight: 700, outline: 'none' }}
                />
            </div>
            <button 
                onClick={() => setShowDrawer('add')}
                className="btn btn-primary"
                style={{ height: 44, padding: '0 20px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 800 }}
            >
                <UserPlus size={18} /> <span style={{ whiteSpace: 'nowrap' }}>ENLIST EXPERT</span>
            </button>
        </div>
      </div>

      {/* Growth Pulse Stats */}
      {!isMobile && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 40 }}>
            <StatCard title="Industry Experts" value={metrics.totalMentors} icon={Star} color="var(--amber)" trend={[10, 12, 11, 13, 15, metrics.totalMentors]} />
            <StatCard title="Active Pairings" value={metrics.activeAssignments} icon={Zap} color="var(--accent)" trend={[20, 25, 22, 28, 30, metrics.activeAssignments]} />
            <StatCard title="Growth Saturation" value={`${metrics.saturation}%`} icon={TrendingUp} color="var(--green)" trend={[40, 45, 42, 48, 50, metrics.saturation]} />
            <StatCard title="Expertise Seniority" value={metrics.avgExp} icon={Award} color="var(--blue)}" trend={[8, 9, 10, 11, 12, 12.5]} />
        </div>
      )}

      {/* Mentor Vault */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(400px, 1fr))', gap: 24 }}>
        {filtered.map(mentor => {
          const mentees = getMentees(mentor.id)
          const mName = mentor.name || mentor.Name || mentor.label || 'Expert Mentor'
          const mExpertise = mentor.expertise || mentor.Expertise || 'Staff Specialist'
          let mColor = mentor.color || mentor.Color || '#4f6ef7'
          if (!mColor.startsWith('#') && mColor.length === 6) mColor = '#' + mColor
          
          const mEmail = mentor.email || mentor.Email || 'contact@portal.secure'
          const mContact = mentor.contact || mentor.Contact || 'Personnel Link Pending'
          const initials = mName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
          
          return (
            <div key={mentor.id} className="super-glass card-premium animate-in" style={{ padding: 0, border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
               <div style={{ height: 120, background: `linear-gradient(135deg, ${mColor}30, ${mColor}10)`, position: 'relative' }}>
                  <div style={{ 
                    position: 'absolute', bottom: -40, left: 32, width: 88, height: 88, borderRadius: 24,
                    background: `linear-gradient(135deg, ${mColor}, ${mColor})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 900, color: '#ffffff',
                    boxShadow: `0 12px 30px ${mColor}40`, border: '4px solid #ffffff'
                  }}>
                    {initials || <Users size={32} />}
                  </div>
                  <div style={{ position: 'absolute', top: 16, right: 16 }}>
                    <button onClick={() => handleDeleteMentor(mentor.id)} className="btn-icon" style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'var(--red)', width: 36, height: 36, borderRadius: 10 }}><Trash2 size={16} /></button>
                  </div>
               </div>

               <div style={{ padding: '56px 32px 32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                        <h3 style={{ fontSize: 24, fontWeight: 900, margin: 0, color: '#1a1a1b', letterSpacing: '-0.5px' }}>{mName}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--amber)', fontSize: 13, fontWeight: 800, marginTop: 4 }}>
                            <BookOpen size={14} /> {mExpertise}
                        </div>
                    </div>
                    <div style={{ padding: '6px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--line)', borderRadius: 100, fontSize: 10, fontWeight: 900, letterSpacing: 0.5 }}>
                        STX-ID: {mentor.id?.substring(0,6).toUpperCase()}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.02)', borderRadius: 16, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24, border: '1px solid var(--line)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Mail size={14} color="var(--muted)" />
                        <span style={{ fontSize: 13, fontWeight: 700, opacity: 0.8 }}>{mEmail}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Globe size={14} color="var(--muted)" />
                        <span style={{ fontSize: 13, fontWeight: 700, opacity: 0.8 }}>Contact: {mContact}</span>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--line)', paddingTop: 24 }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Users size={16} color="var(--accent)" /> ACTIVE PAIRINGS ({mentees.length})
                        </div>
                        <button 
                            onClick={() => { setSelectedMentor(mentor); setShowDrawer('assign'); }}
                            className="btn btn-sm btn-glass"
                            style={{ borderRadius: 10, fontSize: 11, fontWeight: 900 }}
                        >
                            <Plus size={14} /> LINK MENTEE
                        </button>
                     </div>

                     <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {mentees.length > 0 ? mentees.map(m => (
                            <div key={m.id} className="super-glass" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 12, fontSize: 12, fontWeight: 800, border: '1px solid var(--line)' }}>
                                <div style={{ width: 24, height: 24, borderRadius: 6, background: m.color || 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>{m.av}</div>
                                {m.name}
                                <button onClick={() => handleRemoveMentee(m.id)} style={{ border: 'none', background: 'none', color: 'var(--red)', opacity: 0.5, cursor: 'pointer', display: 'flex' }}><X size={12} /></button>
                            </div>
                        )) : (
                            <div style={{ width: '100%', padding: '20px 0', textAlign: 'center', background: 'rgba(0,0,0,0.01)', borderRadius: 12, border: '1px dashed var(--line)', color: 'var(--muted)', fontSize: 12, fontWeight: 700 }}>
                                AWAITING PERSONNEL LINKAGE
                            </div>
                        )}
                     </div>
                  </div>
               </div>
            </div>
          )
        })}
      </div>

      {/* Premium Side Drawer */}
      {showDrawer && (
        <div className="modal-overlay" onClick={() => setShowDrawer(null)}>
          <div className="modal-drawer" onClick={e => e.stopPropagation()} style={{ width: isMobile ? '100%' : '500px' }}>
            <div className="modal-header">
                <div>
                    <h2 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>{showDrawer === 'add' ? 'Enlist Expert' : `Assign to ${selectedMentor.name}`}</h2>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', marginTop: 4 }}>{showDrawer === 'add' ? 'Integrating industry knowledge into organizational DNA' : 'Establishing high-integrity growth pairing'}</p>
                </div>
                <button onClick={() => setShowDrawer(null)} className="btn-icon"><X size={20}/></button>
            </div>

            <div className="modal-body">
                {showDrawer === 'add' ? (
                   <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div className="input-field">
                            <label>FULL PROFESSIONAL NAME</label>
                            <div style={{ position: 'relative' }}>
                                <Briefcase size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                                <input value={newMentor.name} onChange={e => setNewMentor({...newMentor, name: e.target.value})} placeholder="Expert Identifier" />
                            </div>
                        </div>
                        <div className="input-field">
                            <label>EXPERTISE DOMAIN</label>
                            <div style={{ position: 'relative' }}>
                                <Award size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                                <input value={newMentor.expertise} onChange={e => setNewMentor({...newMentor, expertise: e.target.value})} placeholder="Mastery Alignment" />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div className="input-field">
                                <label>REACH EMAIL</label>
                                <input value={newMentor.email} onChange={e => setNewMentor({...newMentor, email: e.target.value})} placeholder="expert@domain" />
                            </div>
                            <div className="input-field">
                                <label>VOICE COMMS</label>
                                <input value={newMentor.contact} onChange={e => setNewMentor({...newMentor, contact: e.target.value})} placeholder="+91..." />
                            </div>
                        </div>
                        <div style={{ padding: 20, borderRadius: 16, background: 'var(--bg-elevated)', border: '1px solid var(--line)', display: 'flex', gap: 12 }}>
                            <Info size={18} color="var(--accent)" style={{ flexShrink: 0 }} />
                            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>Authorized industry experts are granted secure channel access for mentorship activities upon enlistment verification.</p>
                        </div>
                   </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ position: 'relative', marginBottom: 12 }}>
                            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                            <input placeholder="Locate unassigned personnel..." style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--line)', fontWeight: 700, fontSize: 13 }} />
                        </div>
                        {getUnassigned().map(emp => (
                            <div 
                                key={emp.id}
                                onClick={() => { handleAssignMentee(emp.id); setShowDrawer(null); }}
                                style={{ padding: '16px 20px', borderRadius: 16, background: 'rgba(0,0,0,0.02)', border: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: '0.2s' }}
                                className="hover-glass"
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: emp.color || 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 12 }}>{emp.av}</div>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 800 }}>{emp.name}</div>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>{emp.dept}</div>
                                    </div>
                                </div>
                                <ChevronRight size={18} color="var(--muted)" />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="modal-footer">
                <button onClick={() => setShowDrawer(null)} className="btn btn-ghost" style={{ padding: '12px 24px' }}>Cancel</button>
                {showDrawer === 'add' && (
                    <button onClick={handleAddMentor} disabled={isSubmitting} className="btn btn-primary" style={{ padding: '12px 32px' }}>
                        {isSubmitting ? 'Verifying...' : 'Establish Expert'}
                    </button>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
