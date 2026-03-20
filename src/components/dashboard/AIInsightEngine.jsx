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
    const workforce = employees.filter(e => e.role?.toLowerCase() !== 'admin');
    const depts = [...new Set(workforce.map(e => e.dept).filter(Boolean))];
    depts.forEach(dept => {
      const deptEmps = workforce.filter(e => e.dept === dept);
      const outIds = attendance.filter(a => (a.status === 'a' || a.status === 'leave') && a.dept === dept && a.role?.toLowerCase() !== 'admin').map(a => a.empId?.toLowerCase());
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
    <div className="card-premium animate-in" style={{ padding: '24px', background: 'var(--bg-elevated)', border: '1px solid var(--line)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--accent-glow)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Zap size={18} fill="var(--accent)" />
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Intelligence Engine</h3>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {insights.map((insight, i) => (
          <div key={i} style={{ 
            display: 'flex', 
            gap: 14, 
            padding: '12px 16px', 
            borderRadius: 14, 
            background: 'var(--bg)', 
            border: `1px solid var(--line)`,
            alignItems: 'center'
          }}>
            <insight.icon size={18} color={insight.color} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', opacity: 0.9 }}>{insight.text}</span>
          </div>
        ))}
        {insights.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)', fontSize: 13 }}>
            System scanning... No immediate alerts.
          </div>
        )}
      </div>
    </div>
  );
}
