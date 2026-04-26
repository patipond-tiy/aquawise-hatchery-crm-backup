'use client';

import { useState } from 'react';

type V3SparklineProps = {
  values: number[];
  height?: number;
  color?: string;
  fill?: string;
};

export function V3Sparkline({
  values,
  height = 60,
  color = 'var(--color-hero)',
  fill = 'var(--color-hero-soft)',
}: V3SparklineProps) {
  const [hover, setHover] = useState<number | null>(null);
  const w = 240;
  const h = height;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const denom = max - min || 1;

  const pts = values.map((v, i) => ({
    x: (i / (values.length - 1)) * w,
    y: h - 8 - ((v - min) / denom) * (h - 16),
    v,
  }));
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const area = `${path} L ${w} ${h} L 0 ${h} Z`;

  return (
    <div style={{ position: 'relative' }}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width="100%"
        height={h}
        style={{ display: 'block' }}
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * w;
          const i = Math.round((x / w) * (values.length - 1));
          setHover(Math.max(0, Math.min(values.length - 1, i)));
        }}
      >
        <path d={area} fill={fill} opacity="0.5" />
        <path
          d={path}
          stroke={color}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={hover === i ? 5 : 3}
            fill={color}
            stroke="#fff"
            strokeWidth="2"
          />
        ))}
        {hover != null && (
          <line
            x1={pts[hover].x}
            x2={pts[hover].x}
            y1={0}
            y2={h}
            stroke="var(--color-line-2)"
            strokeDasharray="3 3"
          />
        )}
      </svg>
      {hover != null && (
        <div
          style={{
            position: 'absolute',
            top: -4,
            left: `${(hover / (values.length - 1)) * 100}%`,
            transform: 'translate(-50%, -100%)',
            background: 'var(--color-ink)',
            color: '#fff',
            padding: '6px 10px',
            borderRadius: 'var(--radius-sm)',
            fontSize: 11,
            fontWeight: 700,
            whiteSpace: 'nowrap',
          }}
        >
          {values[hover]}%
        </div>
      )}
    </div>
  );
}
