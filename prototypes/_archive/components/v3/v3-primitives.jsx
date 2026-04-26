/* global React */
// V3 primitives — soft, rounded, friendly

const V3Mark = ({ size = 28, radius }) => (
  <img src="assets/aquawise-logo.png" alt="AquaWise"
    width={size} height={size}
    style={{ display: 'block', borderRadius: radius != null ? radius : Math.round(size * 0.22), objectFit: 'cover' }}/>
);

// Tonal pill / chip
const V3Chip = ({ children, tone = 'lav', icon, size = 'sm' }) => {
  const tones = {
    lav: { bg: 'var(--aw3-lav)', fg: 'var(--aw3-lav-fg)' },
    peach: { bg: 'var(--aw3-peach)', fg: 'var(--aw3-peach-fg)' },
    mint: { bg: 'var(--aw3-mint)', fg: 'var(--aw3-mint-fg)' },
    sky: { bg: 'var(--aw3-sky)', fg: 'var(--aw3-sky-fg)' },
    rose: { bg: 'var(--aw3-rose)', fg: 'var(--aw3-rose-fg)' },
    amber: { bg: 'var(--aw3-amber)', fg: 'var(--aw3-amber-fg)' },
    soft: { bg: 'var(--aw3-soft)', fg: 'var(--aw3-ink-2)' },
    good: { bg: 'var(--aw3-good-tint)', fg: 'var(--aw3-good)' },
    bad: { bg: 'var(--aw3-bad-tint)', fg: 'var(--aw3-bad)' },
    warn: { bg: 'var(--aw3-warn-tint)', fg: 'var(--aw3-warn)' },
    solid: { bg: 'var(--aw3-ink)', fg: '#fff' },
  };
  const t = tones[tone] || tones.lav;
  const s = size === 'xs' ? { fs: 11, py: 4, px: 9 } : { fs: 12, py: 5, px: 11 };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: `${s.py}px ${s.px}px`,
      background: t.bg, color: t.fg,
      fontFamily: 'inherit', fontSize: s.fs, fontWeight: 600,
      borderRadius: 'var(--r-pill)', whiteSpace: 'nowrap', lineHeight: 1.2,
    }}>
      {icon && <span style={{ fontSize: s.fs - 1, opacity: 0.8 }}>{icon}</span>}
      {children}
    </span>
  );
};

const V3Card = ({ children, pad = 24, style, onClick, hover, accent }) => (
  <div onClick={onClick}
    className={`aw3-card ${onClick || hover ? 'aw3-row' : ''}`}
    style={{
      padding: pad,
      cursor: onClick ? 'pointer' : 'default',
      ...style,
    }}>
    {accent && <div style={{ height: 4, borderRadius: 'var(--r-sm)', background: accent, marginBottom: 16 }}/>}
    {children}
  </div>
);

const V3Section = ({ title, action, children, style }) => (
  <section style={{ marginBottom: 28, ...style }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em' }}>{title}</h2>
      {action}
    </div>
    {children}
  </section>
);

// Round arrow button
const V3RoundBtn = ({ onClick, dir = 'right', size = 40, tone = 'soft' }) => {
  const r = { right: 0, left: 180, up: 270, down: 90 }[dir];
  const bg = tone === 'hero' ? 'var(--aw3-hero)' : tone === 'soft' ? 'var(--aw3-soft)' : 'var(--aw3-soft-2)';
  const fg = tone === 'hero' ? '#fff' : 'var(--aw3-ink)';
  return (
    <button onClick={onClick} style={{
      width: size, height: size, borderRadius: '50%',
      background: bg, color: fg, border: 0, cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 0.15s ease',
    }}>
      <svg width={14} height={14} viewBox="0 0 16 16" style={{ transform: `rotate(${r}deg)` }}>
        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
};

// Avatar with optional ring
const V3Avatar = ({ name, size = 36, tone, ring }) => {
  const palettes = ['lav', 'peach', 'mint', 'sky', 'rose', 'amber'];
  const t = tone || palettes[(name || '').charCodeAt(0) % palettes.length];
  const tones = {
    lav: ['#A8C0E6', '#004AAD'],
    peach: ['#FFC8A8', '#C2542B'],
    mint: ['#A6E0BD', '#2B7A50'],
    sky: ['#A6C9F2', '#1F5BB8'],
    rose: ['#F5B5C8', '#B83767'],
    amber: ['#F0D78A', '#8C6900'],
  };
  const [bg, fg] = tones[t];
  const initial = (name || '?').trim()[0]?.toUpperCase() || '?';
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg, color: fg,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: size * 0.42,
      boxShadow: ring ? `0 0 0 3px #fff, 0 0 0 ${3 + ring}px var(--aw3-hero)` : 'none',
      flexShrink: 0,
    }}>{initial}</div>
  );
};

// Progress ring (radial)
const V3Ring = ({ value, size = 160, stroke = 10, color = 'var(--aw3-hero)', children }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} stroke="var(--aw3-soft)" strokeWidth={stroke} fill="none"/>
        <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={c * (1 - value/100)} strokeLinecap="round"/>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </div>
    </div>
  );
};

// Soft bar chart (lavender / hero pair)
const V3Bars = ({ values, labels, height = 140, activeIndex }) => {
  const max = Math.max(...values);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height, padding: '8px 0' }}>
        {values.map((v, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-end', gap: 6 }}>
            <div style={{
              height: `${(v / max) * 100}%`,
              background: activeIndex === i ? 'var(--aw3-hero)' : 'var(--aw3-hero-soft)',
              borderRadius: 'var(--r-sm)',
              minHeight: 4,
            }}/>
          </div>
        ))}
      </div>
      {labels && (
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          {labels.map((l, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 11, color: 'var(--aw3-ink-4)', fontWeight: activeIndex === i ? 700 : 500 }}>{l}</div>
          ))}
        </div>
      )}
    </div>
  );
};

const V3Grid = ({ cols = 12, gap = 20, children, style }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap, ...style }}>{children}</div>
);
const V3Col = ({ span = 12, children, style }) => (
  <div style={{ gridColumn: `span ${span}`, minWidth: 0, ...style }}>{children}</div>
);

// Photo placeholder — gradient + abstract shapes
const V3Photo = ({ tone = 'lav', height = 140, label }) => {
  const tones = {
    lav: ['#1A66C7', '#A8C0E6'],
    peach: ['#FF8E5A', '#FFC8A8'],
    mint: ['#3F9B6C', '#A6E0BD'],
    sky: ['#3578CC', '#A6C9F2'],
    rose: ['#D04B7B', '#F5B5C8'],
    amber: ['#C29A1F', '#F0D78A'],
  };
  const [a, b] = tones[tone] || tones.lav;
  return (
    <div style={{
      height, borderRadius: 'var(--r)', position: 'relative', overflow: 'hidden',
      background: `linear-gradient(135deg, ${a}, ${b})`,
    }}>
      <svg width="100%" height="100%" viewBox="0 0 200 140" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
        <circle cx="40" cy="100" r="50" fill="rgba(255,255,255,0.15)"/>
        <circle cx="160" cy="40" r="36" fill="rgba(255,255,255,0.12)"/>
        <path d="M0 110 Q 50 80, 100 100 T 200 95 V140 H0 Z" fill="rgba(255,255,255,0.18)"/>
      </svg>
      {label && (
        <div style={{
          position: 'absolute', bottom: 10, left: 12,
          background: 'rgba(255,255,255,0.92)', color: 'var(--aw3-ink)',
          padding: '4px 10px', borderRadius: 'var(--r-pill)',
          fontSize: 11, fontWeight: 600,
        }}>{label}</div>
      )}
    </div>
  );
};

Object.assign(window, {
  V3Mark, V3Chip, V3Card, V3Section, V3RoundBtn, V3Avatar, V3Ring, V3Bars, V3Grid, V3Col, V3Photo,
});
