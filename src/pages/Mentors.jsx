import { useState } from 'react'
import { useScreenSize } from '../hooks/useScreenSize'
import { useData } from '../context/DataContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import * as api from '../services/api'
import { useToast } from '../context/ToastContext'
import { Search, UserPlus, Mail, Phone, BookOpen, Users, Star, X, Plus, Trash2 } from 'lucide-react'

const theme = {
  bg: 'var(--bg)', 
  accent: 'var(--accent)', 
  cardBg: 'var(--bg-card)',
  cardBorder: 'var(--border)', 
  glass: 'blur(18px)',
  text: 'var(--text)', 
  muted: 'var(--muted)', 
  green: 'var(--green)', 
  amber: 'var(--amber)',
  fontHeading: 'var(--font-heading)', 
  fontBody: 'var(--font)', 
  fontMono: '"JetBrains Mono", monospace'
}

const styles = {
  container: { backgroundColor: 'transparent', color: theme.text, fontFamily: theme.fontBody, display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' },
  title: { fontFamily: theme.fontHeading, fontSize: '32px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' },
  card: { background: theme.cardBg, border: theme.cardBorder, borderRadius: '16px', padding: '24px', transition: 'all 0.3s ease', boxShadow: 'var(--shadow-sm)' },
  btnPrimary: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: theme.accent, color: '#000', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontFamily: theme.fontBody, fontSize: '14px', fontWeight: 700, boxShadow: 'var(--shadow-sm)' },
  btnSecondary: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--bg-elevated)', color: 'var(--text)', border: theme.cardBorder, padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontFamily: theme.fontBody, fontSize: '12px', fontWeight: 600 },
  mono: { fontFamily: theme.fontMono, letterSpacing: '0.5px' },
  inputContainer: { display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-card)', padding: '10px 16px', borderRadius: '12px', border: theme.cardBorder, boxShadow: 'var(--shadow-sm)', width: '100%', boxSizing: 'border-box' },
  input: { background: 'transparent', border: 'none', color: 'var(--text)', outline: 'none', width: '100%', fontFamily: theme.fontBody, fontSize: '13px', fontWeight: 500 },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { background: 'var(--bg-card)', border: theme.cardBorder, borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '24px', boxShadow: 'var(--shadow-xl)', animation: 'modalIn 0.3s ease-out' }
}

export default function Mentors() {
  const { isMobile, isTablet, isDesktop } = useScreenSize()
  const { mentors, employees, loading, error, refresh } = useData()
  const { showToast } = useToast()
  
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedMentor, setSelectedMentor] = useState(null)
  
  const [newMentor, setNewMentor] = useState({ name: '', expertise: '', email: '', contact: '' })

  if (loading) return <LoadingSpinner />
  if (error) return <div style={styles.container}>Error: {error}</div>

  const filtered = mentors.filter(m => 
    (m.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.expertise || '').toLowerCase().includes(search.toLowerCase())
  )

  const handleAddMentor = async () => {
    if (!newMentor.name || !newMentor.expertise) {
      showToast('Name and Expertise are required', 'error')
      return
    }
    try {
      const colors = ['#4f6ef7', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#f97316']
      const randomColor = colors[Math.floor(Math.random() * colors.length)]
      
      await api.addMentor({ ...newMentor, color: randomColor })
      showToast('Mentor added successfully', 'success')
      setShowAddModal(false)
      setNewMentor({ name: '', expertise: '', email: '', contact: '' })
      refresh()
    } catch (err) {
      showToast('Failed to add mentor', 'error')
    }
  }

  const handleDeleteMentor = async (id) => {
    if (!confirm('Are you absolutely sure you want to delete this mentor? This will also unassign all their mentees.')) return
    try {
      await api.deleteMentor(id)
      showToast('Mentor deleted successfully', 'success')
      refresh()
    } catch {
      showToast('Failed to delete mentor', 'error')
    }
  }

  const handleAssignMentee = async (empId) => {
    if (!selectedMentor) return
    try {
      await api.assignMentor(empId, selectedMentor.id)
      showToast('Mentee assigned successfully', 'success')
      refresh()
    } catch {
      showToast('Failed to assign mentee', 'error')
    }
  }

  const handleRemoveMentee = async (empId) => {
    if (!confirm('Remove this assignment?')) return
    try {
      await api.assignMentor(empId, '') // Empty string to unassign
      showToast('Mentee removed successfully', 'success')
      refresh()
    } catch {
      showToast('Failed to remove mentee', 'error')
    }
  }

  const getMentees = (mentorId) => employees.filter(e => e.mentorId === mentorId)
  const getUnassigned = () => employees.filter(e => !e.mentorId || e.mentorId === '')

  return (
    <div style={{ ...styles.container, padding: isMobile ? '16px 12px' : '0' }} className="animate-in">
      <div style={{ ...styles.header, flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center' }}>
        <div>
          <h1 style={{ ...styles.title, fontSize: isMobile ? '24px' : '28px' }}>External Mentors</h1>
          <p style={{ color: theme.muted, fontSize: '12px', fontWeight: 600, marginTop: '4px' }}>
            {mentors.length} specialized industry mentors available for employee assignment.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: isMobile ? '100%' : 'auto', flexDirection: isMobile ? 'column' : 'row' }}>
           <div style={{ ...styles.inputContainer, minWidth: isMobile ? '100%' : '250px', height: '42px' }}>
             <Search size={14} color={theme.muted} />
             <input style={styles.input} placeholder="Search mentors..." value={search} onChange={e => setSearch(e.target.value)} />
           </div>
           <button style={{ ...styles.btnPrimary, height: '42px', padding: '0 16px', fontSize: '13px', width: isMobile ? '100%' : 'auto', justifyContent: 'center' }} onClick={() => setShowAddModal(true)}>
             <UserPlus size={16} /> ENLIST
           </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px' }}>
        {filtered.map(mentor => {
          const mentees = getMentees(mentor.id)
          return (
            <div key={mentor.id} className="card-premium animate-in" style={{ padding: 0, border: '1px solid var(--line)' }}>
               <div style={{ 
                 height: '100px', 
                 background: `linear-gradient(135deg, ${mentor.color || 'var(--accent)'}40, ${mentor.color || 'var(--accent)'}10)`,
                 position: 'relative'
               }}>
                 <div style={{ 
                   position: 'absolute', 
                   bottom: '-40px', 
                   left: '24px',
                   width: '80px', 
                   height: '80px', 
                   borderRadius: '24px', 
                   background: `linear-gradient(135deg, ${mentor.color || 'var(--accent)'}, var(--accent))`, 
                   display: 'flex', alignItems: 'center', justifyContent: 'center', 
                   fontSize: '32px', fontWeight: 900, color: '#fff', 
                   boxShadow: `0 12px 24px ${mentor.color || 'var(--accent)'}50`,
                   border: '4px solid var(--bg-card)'
                 }}>
                    {mentor.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                 </div>
                 <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                    <button 
                       onClick={() => handleDeleteMentor(mentor.id)}
                       style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: 'none', color: 'var(--red)', cursor: 'pointer', padding: '8px', borderRadius: '12px', display: 'flex', alignItems: 'center', transition: '0.2s' }}
                       className="hover-red-solid"
                       title="Delete Mentor"
                    >
                       <Trash2 size={18} />
                    </button>
                 </div>
               </div>

               <div style={{ padding: isMobile ? '48px 16px 16px' : '56px 24px 24px' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                         <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: 'var(--text)' }}>{mentor.name}</h3>
                         <div style={{ color: 'var(--amber)', fontSize: '14px', fontWeight: 700, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <BookOpen size={16} /> {mentor.expertise}
                         </div>
                      </div>
                      <div style={{ ...styles.mono, padding: '6px 12px', background: 'var(--bg-elevated)', borderRadius: '100px', fontSize: '10px', color: 'var(--muted)', border: '1px solid var(--line)', fontWeight: 700 }}>
                         EXP: 10+ YRS
                      </div>
                   </div>

                   <div className="card-glass" style={{ borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '14px', fontWeight: 500 }}>
                         <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                           <Mail size={16} style={{ color: 'var(--accent)' }} />
                         </div>
                         <span style={{ color: 'var(--text-dim)' }}>{mentor.email || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '14px', fontWeight: 500 }}>
                         <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                           <Phone size={16} style={{ color: 'var(--accent)' }} />
                         </div>
                         <span style={{ color: 'var(--text-dim)' }}>{mentor.contact || 'N/A'}</span>
                      </div>
                   </div>

                   <div style={{ borderTop: '1px solid var(--line)', paddingTop: '24px', marginTop: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                         <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Users size={16} color="var(--accent)" /> Assigned Mentees ({mentees.length})
                         </div>
                         <button 
                            className="btn btn-sm btn-premium" 
                            style={{ borderRadius: '10px' }}
                            onClick={() => { setSelectedMentor(mentor); setShowAssignModal(true); }}
                         >
                           <Plus size={14}/> Assign
                         </button>
                      </div>
                      
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {mentees.length > 0 ? mentees.map(m => (
                           <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-card)', padding: '6px 12px 6px 6px', borderRadius: '12px', fontSize: '13px', border: '1px solid var(--line)', fontWeight: 600, boxShadow: 'var(--shadow-sm)' }}>
                              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: m.color || 'var(--accent)', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' }}>
                                {m.av}
                              </div>
                              {m.name}
                              <button 
                                onClick={() => handleRemoveMentee(m.id)}
                                style={{ background: 'var(--red-dim)', border: 'none', color: 'var(--red)', cursor: 'pointer', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}
                              >
                                <X size={14} />
                              </button>
                           </div>
                        )) : (
                           <div style={{ width: '100%', textAlign: 'center', padding: '20px', background: 'var(--bg-elevated)', borderRadius: '12px', border: '1px dashed var(--line)', color: 'var(--muted)', fontSize: '13px', fontStyle: 'italic' }}>
                              Waiting for mentee assignments...
                           </div>
                        )}
                      </div>
                   </div>
               </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
         <div style={{ ...styles.card, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 20px', textAlign: 'center' }}>
            <Star size={48} style={{ color: 'var(--muted)', opacity: 0.3, marginBottom: '20px' }} />
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>No Mentors Found</h3>
            <p style={{ color: theme.muted, marginTop: '8px', maxWidth: '300px' }}>Adjust your search filter or enlist a new mentor to the directory.</p>
         </div>
      )}

      {/* Add Mentor Modal */}
      {showAddModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()} className="modal-content">
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontFamily: theme.fontHeading, margin: 0, fontSize: '24px', fontWeight: 800 }}>Enlist Mentor</h2>
             </div>
             
             <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                   <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', marginBottom: '8px', display: 'block', letterSpacing: '0.05em' }}>FULL NAME</label>
                   <div style={styles.inputContainer}>
                      <input style={styles.input} value={newMentor.name} onChange={e => setNewMentor({...newMentor, name: e.target.value})} placeholder="E.g. Dr. A. P. J. Kalam" />
                   </div>
                </div>
                <div>
                   <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', marginBottom: '8px', display: 'block', letterSpacing: '0.05em' }}>EXPERTISE TAG</label>
                   <div style={styles.inputContainer}>
                      <input style={styles.input} value={newMentor.expertise} onChange={e => setNewMentor({...newMentor, expertise: e.target.value})} placeholder="E.g. System Architecture" />
                   </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                   <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', marginBottom: '8px', display: 'block', letterSpacing: '0.05em' }}>EMAIL ID</label>
                      <div style={styles.inputContainer}>
                         <input style={styles.input} value={newMentor.email} onChange={e => setNewMentor({...newMentor, email: e.target.value})} placeholder="mentor@domain.com" />
                      </div>
                   </div>
                   <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', marginBottom: '8px', display: 'block', letterSpacing: '0.05em' }}>CONTACT</label>
                      <div style={styles.inputContainer}>
                         <input style={styles.input} value={newMentor.contact} onChange={e => setNewMentor({...newMentor, contact: e.target.value})} placeholder="+91..." />
                      </div>
                   </div>
                </div>
             </div>

             <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button className="btn btn-ghost" style={{ padding: '12px 24px' }} onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className="btn btn-primary" style={{ padding: '12px 28px' }} onClick={handleAddMentor}>Add Mentor</button>
             </div>
          </div>
        </div>
      )}
      {/* Assign Mentee Modal */}
      {showAssignModal && selectedMentor && (
        <div style={styles.modalOverlay} onClick={() => setShowAssignModal(false)}>
          <div style={{ ...styles.modalContent, maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: theme.fontHeading, margin: 0, fontSize: '20px', fontWeight: 800 }}>Assign to {selectedMentor.name}</h2>
            <p style={{ color: theme.muted, fontSize: '13px' }}>Select an unassigned employee to assign as a mentee.</p>
            
            <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px' }}>
              {getUnassigned().length > 0 ? getUnassigned().map(emp => (
                <div 
                  key={emp.id} 
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-elevated)', borderRadius: '12px', border: '1px solid var(--border)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: emp.color || theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>{emp.av}</div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600 }}>{emp.name}</div>
                      <div style={{ fontSize: '11px', color: theme.muted }}>{emp.dept}</div>
                    </div>
                  </div>
                  <button 
                    className="btn btn-xs btn-primary"
                    onClick={() => { handleAssignMentee(emp.id); setShowAssignModal(false); }}
                  >
                    Select
                  </button>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '20px', color: theme.muted, fontSize: '13px' }}>All employees already have mentors.</div>
              )}
            </div>
            
            <button className="btn btn-ghost" onClick={() => setShowAssignModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
