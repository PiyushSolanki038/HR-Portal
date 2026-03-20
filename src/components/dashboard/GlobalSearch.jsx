import { useState, useEffect } from 'react'
import { Search, X, User, Briefcase, Calendar, Info } from 'lucide-react'

export default function GlobalSearch({ employees, allEmployees, attendance, leaves, onSelect }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }

    const q = query.toLowerCase()
    const found = []

    // Search Employees
    allEmployees.forEach(e => {
      if (e.name?.toLowerCase().includes(q) || e.department?.toLowerCase().includes(q) || e.role?.toLowerCase().includes(q)) {
        found.push({ type: 'employee', id: e.id, title: e.name, subtitle: `${e.role} • ${e.dept}`, icon: User })
      }
    })

    // Search Departments (unique)
    const depts = [...new Set(allEmployees.map(e => e.department || e.dept))].filter(Boolean)
    depts.forEach(d => {
      if (d.toLowerCase().includes(q)) {
        found.push({ type: 'department', id: d, title: `${d} Department`, subtitle: 'Team Overview', icon: Briefcase })
      }
    })

    setResults(found.slice(0, 8))
  }, [query, allEmployees])

  return (
    <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
      <div style={{ position: 'relative' }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
        <input 
          type="text"
          className="input"
          placeholder="Search Employees, Depts, Tasks..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setShowResults(true)
          }}
          onFocus={() => setShowResults(true)}
          style={{ width: '100%', paddingLeft: 42, background: 'var(--bg-elevated)', borderRadius: 12, height: 42, border: '1px solid var(--line)' }}
        />
        {query && (
          <button 
            onClick={() => setQuery('')}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div 
          className="card-premium animate-in" 
          style={{ 
            position: 'absolute', 
            top: '120%', 
            left: 0, 
            right: 0, 
            zIndex: 1000, 
            padding: 8, 
            maxHeight: 400, 
            overflowY: 'auto',
            background: 'var(--bg-card)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            border: '1px solid var(--line)'
          }}
        >
          {results.map((res, i) => (
            <div 
              key={`${res.type}-${res.id}-${i}`}
              onClick={() => {
                onSelect(res)
                setQuery('')
                setShowResults(false)
              }}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 12, 
                padding: '10px 12px', 
                borderRadius: 8, 
                cursor: 'pointer',
                background: 'transparent',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-elevated)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
                <res.icon size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{res.title}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{res.subtitle}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
