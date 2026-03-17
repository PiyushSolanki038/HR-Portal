const STATUS_MAP = {
  p: { cls: 'present', label: 'P' },
  l: { cls: 'late',    label: 'L' },
  a: { cls: 'absent',  label: 'A' },
  x: { cls: 'leave',   label: 'X' },
}

export default function AttendanceHeatmap({ records = [], days = 30 }) {
  // Build last N days
  const cells = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
    const rec = records.find(r => r.date === dateStr)
    const status = rec ? (STATUS_MAP[rec.status] || STATUS_MAP.a) : { cls: 'empty', label: '' }
    cells.push({ date: dateStr, ...status, day: d.getDate() })
  }

  return (
    <div className="heatmap">
      {cells.map(cell => (
        <div
          key={cell.date}
          className={`heatmap-cell ${cell.cls}`}
          title={`${cell.date}: ${cell.label || 'No data'}`}
        >
          {cell.day}
        </div>
      ))}
    </div>
  )
}
