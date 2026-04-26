'use client';

import { useState } from 'react';

type V3DistChartProps = {
  values: number[];
  labels: string[];
  height?: number;
  accent?: (i: number, v: number) => string;
};

const defaultAccent = (i: number) =>
  i >= 7
    ? 'var(--color-good)'
    : i >= 5
      ? 'var(--color-hero)'
      : 'var(--color-warn)';

export function V3DistChart({
  values,
  labels,
  height = 180,
  accent = defaultAccent,
}: V3DistChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...values, 1);
  const total = values.reduce((a, b) => a + b, 0);

  return (
    <div>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          gap: 6,
          height,
          padding: '8px 0',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '8px 0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            pointerEvents: 'none',
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{ borderTop: '1px dashed var(--color-line)', height: 1 }}
            />
          ))}
        </div>
        {values.map((v, i) => (
          <div
            key={i}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              position: 'relative',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                height: `${(v / max) * 100}%`,
                background: hover === i ? 'var(--color-ink)' : accent(i, v),
                borderRadius: 'var(--radius-sm) var(--radius-sm) 4px 4px',
                minHeight: v > 0 ? 4 : 0,
                marginTop: 'auto',
                transition: 'background 0.12s, transform 0.12s',
                transform: hover === i ? 'scaleY(1.04)' : 'scaleY(1)',
                transformOrigin: 'bottom',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                paddingTop: 4,
                color: '#fff',
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              {v >= max * 0.4 && v}
            </div>
            {hover === i && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'var(--color-ink)',
                  color: '#fff',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius)',
                  fontSize: 12,
                  whiteSpace: 'nowrap',
                  marginBottom: 6,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  zIndex: 10,
                }}
              >
                <div style={{ fontWeight: 700 }}>{labels[i]}%</div>
                <div style={{ color: 'var(--color-line-2)', fontSize: 11 }}>
                  {v} ฟาร์ม · {Math.round((v / total) * 100)}%
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
        {labels.map((l, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: 9.5,
              color:
                hover === i ? 'var(--color-ink)' : 'var(--color-ink-4)',
              fontWeight: hover === i ? 700 : 600,
            }}
          >
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}
