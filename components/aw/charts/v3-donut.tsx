'use client';

import { useState } from 'react';

export type DonutSeg = { value: number; label: string; color: string };

type V3DonutProps = {
  segs: DonutSeg[];
  size?: number;
  stroke?: number;
};

export function V3Donut({ segs, size = 180, stroke = 22 }: V3DonutProps) {
  const [hover, setHover] = useState<number | null>(null);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const total = segs.reduce((a, s) => a + s.value, 0);
  // Precompute cumulative offsets so the render pass stays pure (no mutation
  // of a closure variable while mapping — react-hooks/immutability).
  const offsets = segs.reduce<number[]>((acc, s) => {
    const prev = acc.length === 0 ? 0 : acc[acc.length - 1];
    acc.push(prev + (s.value / total) * c);
    return acc;
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
      <div
        style={{
          position: 'relative',
          width: size,
          height: size,
          flexShrink: 0,
        }}
      >
        <svg
          width={size}
          height={size}
          style={{ transform: 'rotate(-90deg)' }}
        >
          {segs.map((s, i) => {
            const len = (s.value / total) * c;
            const dasharray = `${len} ${c - len}`;
            // offsets[i] is the cumulative length *through* segment i; the dash
            // offset is the negative cumulative length *before* it.
            const dashoffset = -(offsets[i] - len);
            return (
              <circle
                key={i}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                cx={size / 2}
                cy={size / 2}
                r={r}
                stroke={s.color}
                strokeWidth={hover === i ? stroke + 2 : stroke}
                fill="none"
                strokeDasharray={dasharray}
                strokeDashoffset={dashoffset}
                style={{ cursor: 'pointer', transition: 'stroke-width 0.12s' }}
              />
            );
          })}
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em' }}
          >
            {hover != null ? segs[hover].value : total}
          </div>
          <div
            style={{
              fontSize: 11.5,
              color: 'var(--color-ink-4)',
              fontWeight: 600,
            }}
          >
            {hover != null ? segs[hover].label : 'ทั้งหมด'}
          </div>
        </div>
      </div>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {segs.map((s, i) => (
          <div
            key={i}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              background:
                hover === i ? 'var(--color-soft)' : 'transparent',
              cursor: 'pointer',
              transition: 'background 0.1s',
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                background: s.color,
              }}
            />
            <span style={{ fontSize: 13, flex: 1, fontWeight: 600 }}>
              {s.label}
            </span>
            <span style={{ fontSize: 13, fontWeight: 800 }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
