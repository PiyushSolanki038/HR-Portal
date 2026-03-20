import React from 'react';

export default function Sparkline({ data = [0, 0, 0, 0, 0, 0, 0], color = 'var(--accent)', height = 40, width = 100 }) {
  if (!data || data.length < 2) return null;

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const padding = 2; // pixel padding to ensure line doesn't cut off
  
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = (height - padding * 2) - ((d - min) / range) * (height - padding * 2) + padding;
    return { x, y };
  });

  const pathData = points.map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`)).join(' ');
  const areaData = `${pathData} V ${height} H 0 Z`;
  const lastPoint = points[points.length - 1];

  const gradientId = `spark-grad-${color.replace(/[^\w]/g, '')}`;

  return (
    <div style={{ width: '100%', height, position: 'relative' }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={areaData}
          fill={`url(#${gradientId})`}
        />
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: 0.8 }}
        />
        {/* Tip Glow */}
        <circle 
          cx={lastPoint.x} 
          cy={lastPoint.y} 
          r="2.5" 
          fill={color} 
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        />
      </svg>
    </div>
  );
}
