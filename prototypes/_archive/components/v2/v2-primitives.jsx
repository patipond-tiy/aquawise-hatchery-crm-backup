/* global React */
// V2.1 — Thai-first hatchery primitives. Less designer-flex, more tool.

const AWMark = ({ size = 28, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" style={{ display: 'block' }}>
    <g fill={color}>
      <rect x="3" y="7" width="26" height="2.5"/>
      <rect x="3" y="12.5" width="20" height="2.5"/>
      <rect x="9" y="18" width="20" height="2.5"/>
      <rect x="3" y="23.5" width="14" height="2.5"/>
    </g>
  </svg>
);

// Section title — Thai title left, mono meta right
const Section = ({ title, meta, action, children, style }) => (
  <section style={{ marginBottom: 36, ...style }}>
    <div style={{
      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      borderBottom: 'var(--hairline)', paddingBottom: 10, marginBottom: 16,
      gap: 16, flexWrap: 'wrap',
    }}>
      <h2 style={{
        margin: 0, fontFamily: 'var(--font-thai)',
        fontSize: 20, fontWeight: 600, letterSpacing: '-0.005em',
      }}>{title}</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {meta && <span className="label-mono">{meta}</span>}
        {action}
      </div>
    </div>
    {children}
  </section>
);

// Stat — clean, no oversize poetry
const Stat = ({ label, value, unit, sub, accent, big }) => (
  <div>
    <div className="label" style={{ marginBottom: 4 }}>{label}</div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
      <span className="mono" style={{
        fontSize: big ? 38 : 28, fontWeight: 600,
        letterSpacing: '-0.02em', lineHeight: 1,
        color: accent || 'var(--aw-ink)',
      }}>{value}</span>
      {unit && <span className="mono" style={{ fontSize: 12, color: 'var(--aw-ink-3)' }}>{unit}</span>}
    </div>
    {sub && <div className="label-mono" style={{ marginTop: 6 }}>{sub}</div>}
  </div>
);

// Pill — direct status
const Pill = ({ children, tone = 'neutral', size = 'sm' }) => {
  const tones = {
    neutral: { bg: 'var(--aw-line-3)', fg: 'var(--aw-ink-2)' },
    blue: { bg: 'var(--aw-blue)', fg: '#fff' },
    blueTint: { bg: 'var(--aw-blue-tint)', fg: 'var(--aw-blue-2)' },
    good: { bg: 'var(--aw-good-tint)', fg: 'var(--aw-good)' },
    bad: { bg: 'var(--aw-bad-tint)', fg: 'var(--aw-bad)' },
    warn: { bg: 'var(--aw-warn-tint)', fg: 'var(--aw-warn)' },
    solid: { bg: 'var(--aw-ink)', fg: '#fff' },
    flame: { bg: 'var(--aw-flame)', fg: '#fff' },
  };
  const t = tones[tone] || tones.neutral;
  const s = size === 'xs' ? { fs: 10, py: 2, px: 6 } : { fs: 11, py: 3, px: 8 };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: `${s.py}px ${s.px}px`,
      background: t.bg, color: t.fg,
      fontFamily: 'var(--font-thai)',
      fontSize: s.fs, fontWeight: 600,
      lineHeight: 1, whiteSpace: 'nowrap',
    }}>{children}</span>
  );
};

// Bar — short, dense
const Bar = ({ values, height = 60, accent = 'var(--aw-ink)', highlight, labels }) => {
  const max = Math.max(...values);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height, borderBottom: '1px solid var(--aw-line-2)' }}>
        {values.map((v, i) => (
          <div key={i} style={{
            flex: 1, height: `${(v / max) * 100}%`,
            background: highlight === i ? 'var(--aw-blue)' : accent,
          }}/>
        ))}
      </div>
      {labels && (
        <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
          {labels.map((l, i) => (
            <div key={i} className="label-mono" style={{ flex: 1, textAlign: 'center', fontSize: 9 }}>{l}</div>
          ))}
        </div>
      )}
    </div>
  );
};

// Card — utility container, hairline
const Card = ({ children, style, pad = 16, onClick, hover }) => (
  <div onClick={onClick} style={{
    background: 'var(--aw-card)',
    border: '1px solid var(--aw-line-2)',
    padding: pad,
    cursor: onClick ? 'pointer' : 'default',
    transition: 'border-color 0.1s ease',
    ...style,
  }} className={hover ? 'aw-row' : ''}>{children}</div>
);

// Live dot
const LiveDot = ({ tone = 'good' }) => {
  const c = tone === 'good' ? 'var(--aw-good)' : tone === 'bad' ? 'var(--aw-bad)' : tone === 'warn' ? 'var(--aw-warn)' : 'var(--aw-blue)';
  return <span className="aw-blink" style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: c, marginRight: 6, verticalAlign: 'middle' }}/>;
};

// Arrow
const Arrow = ({ size = 12, dir = 'right' }) => {
  const r = { right: 0, down: 90, left: 180, up: 270 }[dir];
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ transform: `rotate(${r}deg)`, display: 'inline-block', verticalAlign: 'middle' }}>
      <path d="M2 8h12M9 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6"/>
    </svg>
  );
};

// Grid helpers
const Grid = ({ cols = 12, gap = 16, children, style }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap, ...style }}>{children}</div>
);
const Col = ({ span = 12, children, style }) => (
  <div style={{ gridColumn: `span ${span}`, minWidth: 0, ...style }}>{children}</div>
);

Object.assign(window, { AWMark, Section, Stat, Pill, Bar, Card, LiveDot, Arrow, Grid, Col });
