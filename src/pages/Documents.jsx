import { FileText, Upload, Download, FolderOpen } from 'lucide-react'

const DOC_CATEGORIES = [
  { title: 'Company Policies', icon: FileText, count: 4, items: ['Employee Handbook', 'Leave Policy', 'Code of Conduct', 'Remote Work Policy'] },
  { title: 'Templates', icon: FolderOpen, count: 3, items: ['Offer Letter Template', 'NDA Template', 'Exit Clearance Form'] },
  { title: 'Compliance', icon: FileText, count: 2, items: ['Tax Declaration Form', 'PF Registration Guide'] },
]

export default function Documents() {
  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1>Documents</h1>
          <p className="subtitle">Company documents and templates</p>
        </div>
        <button className="btn btn-primary">
          <Upload size={16} /> Upload Document
        </button>
      </div>

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
        {DOC_CATEGORIES.map((cat, i) => (
          <div key={i} className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div className="stat-icon" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
                <cat.icon size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{cat.title}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{cat.count} documents</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {cat.items.map((item, j) => (
                <div key={j} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 'var(--r-sm)',
                  cursor: 'pointer', transition: 'background 0.15s'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    <FileText size={14} style={{ color: 'var(--muted)' }} />
                    {item}
                  </div>
                  <Download size={14} style={{ color: 'var(--muted)' }} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
