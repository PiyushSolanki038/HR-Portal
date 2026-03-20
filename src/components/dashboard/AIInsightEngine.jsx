import React from 'react';
import { Zap, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';

export default function AIInsightEngine({ stats, employees, attendance, leaves, onLeaveIds }) {
  const generateInsights = () => {
    const insights = [];
    const { total, present, late, absent, onLeave } = stats;
    
    // Global Attendance Insight
    const attendanceRate = total ? Math.round((present / total) * 100) : 0;
    if (attendanceRate < 80) {
      insights.push({
        type: 'warning',
        icon: AlertCircle,
        text: `Low attendance detected (${attendanceRate}%). Resource density is below optimal levels.`,
        color: 'var(--red)'
      });
    } else {
      insights.push({
        type: 'success',
        icon: CheckCircle,
        text: `Organization health is stable with ${attendanceRate}% attendance today.`,
        color: 'var(--green)'
      });
    }

    // Departmental Insight
    const workforce = employees.filter(e => {
      const r = (e.role || '').toLowerCase()
      const n = (e.name || '').toLowerCase()
      return !r.includes('admin') && !r.includes('head') && !r.includes('owner') && !r.includes('hr manager') && !n.includes('shreyansh') && !n.includes('ankur')
    });
    const depts = [...new Set(workforce.map(e => e.dept).filter(Boolean))];
    depts.forEach(dept => {
      const deptEmps = workforce.filter(e => e.dept === dept);
      const outIds = attendance.filter(a => {
        const r = (a.role || '').toLowerCase()
        const n = (a.empName || '').toLowerCase() // assuming a.empName exists or filter by empId later
        const isExcluded = r.includes('admin') || r.includes('head') || r.includes('owner') || r.includes('hr manager') || n.includes('shreyansh') || n.includes('ankur')
        return (a.status === 'a' || a.status === 'leave') && a.dept === dept && !isExcluded
      }).map(a => a.empId?.toLowerCase());
      const outCount = outIds.length;
      
      if (deptEmps.length > 0 && (outCount / deptEmps.length) > 0.4) {
        insights.push({
          type: 'critical',
          icon: Zap,
          text: `Critical Capacity: ${dept} team is at ${(1 - outCount / deptEmps.length) * 100}% capacity. Deliverables may be at risk.`,
          color: 'var(--amber)'
        });
      }
    });

    // Punctuality Insight
    if (late > 2) {
      insights.push({
        type: 'info',
        icon: TrendingUp,
        text: `Pattern Alert: ${late} employees were late today. Consider reviewing shift start times.`,
        color: 'var(--purple)'
      });
    }

    return insights.slice(0, 3); // Return top 3 insights
  };

  const insights = generateInsights();

  return (
    <div className="card-premium super-glass animate-in" style={{ padding: '24px', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h3 style={{ margin: 0, fontSize: 13, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
          <Zap size={16} color="var(--accent)" fill="var(--accent)" /> AI Insights
        </h3>
        <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--accent)', opacity: 0.6 }}>PREDICTIVE ENGINE V3.1</div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        {insights.map((insight, i) => (
          <div key={i} style={{ 
            display: 'flex', 
            gap: 16, 
            padding: '16px 20px', 
            borderRadius: 16, 
            background: 'rgba(255,255,255,0.4)', 
            border: `1px solid rgba(255,255,255,0.5)`,
            alignItems: 'center',
            flex: 1
          }}>
            <insight.icon size={18} color={insight.color} />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', opacity: 0.9, lineHeight: 1.4 }}>{insight.text}</span>
          </div>
        ))}
        {insights.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '32px', 
            color: 'var(--muted)', 
            fontSize: 12, 
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 16,
            border: '1px dashed rgba(255,255,255,0.3)'
          }}>
            NEURAL SCANNING: NO CRITICAL VARIANCES DETECTED
          </div>
        )}
      </div>
    </div>
  );
}
