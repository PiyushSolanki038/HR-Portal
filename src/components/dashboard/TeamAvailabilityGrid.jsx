import React from 'react';

export default function TeamAvailabilityGrid({ employees, attendance, onLeaveIds }) {
  const getStatus = (empId) => {
    const record = attendance.find(a => a.empId?.toLowerCase() === empId?.toLowerCase());
    if (onLeaveIds?.has(empId?.toLowerCase())) return { label: 'On Leave', color: 'var(--blue)' };
    if (!record || record.status === 'a') return { label: 'Absent', color: 'var(--red)' };
    if (record.status === 'l') return { label: 'Late', color: 'var(--amber)' };
    if (record.status === 'p') return { label: 'Present', color: 'var(--green)' };
    return { label: 'Unknown', color: 'var(--muted)' };
  };

  return (
    <div className="card-premium animate-in" style={{ padding: '24px', background: 'var(--bg-elevated)', border: '1px solid var(--line)' }}>
      <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
        Team Availability Map
      </h3>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', 
        gap: 20 
      }}>
        {employees.map(emp => {
          const status = getStatus(emp.id);
          return (
            <div key={emp.id} className="hover-scale" style={{ textAlign: 'center', position: 'relative' }}>
              <div style={{ 
                width: 48, height: 48, borderRadius: 16, 
                background: emp.color || 'var(--accent)', 
                color: '#fff', 
                margin: '0 auto 8px', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                fontSize: 16, fontWeight: 800,
                position: 'relative'
              }}>
                {emp.av || emp.name?.substring(0,2).toUpperCase()}
                <div style={{ 
                  position: 'absolute', 
                  bottom: -2, right: -2, 
                  width: 14, height: 14, 
                  borderRadius: 7, 
                  background: 'var(--bg)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: 4, background: status.color }} />
                </div>
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', opacity: 0.8 }}>
                {emp.name.split(' ')[0]}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 20, display: 'flex', gap: 12, justifyContent: 'center' }}>
        {[
          { label: 'Present', color: 'var(--green)' },
          { label: 'Late', color: 'var(--amber)' },
          { label: 'Leave', color: 'var(--blue)' },
          { label: 'Absent', color: 'var(--red)' }
        ].map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, opacity: 0.6 }}>
            <div style={{ width: 6, height: 6, borderRadius: 3, background: s.color }} />
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
}
