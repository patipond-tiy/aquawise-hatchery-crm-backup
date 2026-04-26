'use client';

import { useState } from 'react';

type V3BarsInteractiveProps = {
  values: number[];
  labels?: string[];
  height?: number;
  color?: string;
};

export function V3BarsInteractive({
  values,
  labels,
  height = 140,
  color = 'var(--color-hero)',
}: V3BarsInteractiveProps) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...values, 1);
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 12,
          height,
          padding: '8px 0',
        }}
      >
        {values.map((v, i) => (
          <div
            key={i}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              position: 'relative',
              cursor: 'pointer',
            }}
          >
            {hover === i && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'var(--color-ink)',
                  color: '#fff',
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 11,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  marginBottom: 4,
                }}
              >
                {v}%
              </div>
            )}
            <div
              style={{
                height: `${(v / max) * 100}%`,
                background: hover === i ? 'var(--color-ink)' : color,
                borderRadius: 'var(--radius-sm)',
                minHeight: 4,
                transition: 'background 0.12s',
              }}
            />
          </div>
        ))}
      </div>
      {labels && (
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          {labels.map((l, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                textAlign: 'center',
                fontSize: 11,
                color:
                  hover === i ? 'var(--color-ink)' : 'var(--color-ink-4)',
                fontWeight: hover === i ? 700 : 500,
              }}
            >
              {l}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
