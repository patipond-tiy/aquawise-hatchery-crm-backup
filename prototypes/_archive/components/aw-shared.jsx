/* global React */
// AquaWise shared components & icons

const AW_LOGO = ({ size = 28, mono = false }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <defs>
      <linearGradient id="awg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#0A5DC2"/>
        <stop offset="100%" stopColor="#003A8A"/>
      </linearGradient>
    </defs>
    <circle cx="16" cy="16" r="15" fill={mono ? 'currentColor' : 'url(#awg)'} />
    <circle cx="16" cy="16" r="14.4" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.6"/>
    <path d="M7.5 19.2c1.7 0 1.7-1.7 3.4-1.7s1.7 1.7 3.4 1.7 1.7-1.7 3.4-1.7 1.7 1.7 3.4 1.7 1.7-1.7 3.4-1.7"
      stroke="#fff" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
    <path d="M7.5 14.2c1.7 0 1.7-1.7 3.4-1.7s1.7 1.7 3.4 1.7 1.7-1.7 3.4-1.7 1.7 1.7 3.4 1.7 1.7-1.7 3.4-1.7"
      stroke="#7BC4F2" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.85"/>
    <circle cx="22.5" cy="11.5" r="1.1" fill="#7BC4F2"/>
  </svg>
);

const AW_Wordmark = ({ scale = 1, color = '#1A1A17' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 * scale }}>
    <AW_LOGO size={28 * scale} />
    <span style={{
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontWeight: 700, fontSize: 18 * scale, letterSpacing: -0.3,
      color,
    }}>AquaWise</span>
  </div>
);

// Verification stamp — for certificates and scorecards
const AW_Stamp = ({ size = 84, label = 'VERIFIED' }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%',
    border: '1.5px solid #008B8B',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    color: '#008B8B', position: 'relative',
    background: 'radial-gradient(circle at 50% 30%, #E5F4F4 0%, #fff 70%)',
    boxShadow: 'inset 0 0 0 4px #fff, inset 0 0 0 5px rgba(0,139,139,0.25)',
  }}>
    {/* Rotating perimeter text */}
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      style={{ position: 'absolute', inset: 0, opacity: 0.55 }}>
      <defs>
        <path id={`stp${size}`} d={`M ${size/2}, ${size/2} m -${size/2-9}, 0 a ${size/2-9},${size/2-9} 0 1,1 ${size-18},0 a ${size/2-9},${size/2-9} 0 1,1 -${size-18},0`}/>
      </defs>
      <text fontSize={size*0.085} fill="#008B8B" fontFamily="IBM Plex Mono"
        letterSpacing={size*0.025}>
        <textPath href={`#stp${size}`}>
          AQUAWISE · INDEPENDENT · VERIFICATION · 2026 · 
        </textPath>
      </text>
    </svg>
    <svg width={size * 0.30} height={size * 0.30} viewBox="0 0 24 24" fill="none">
      <path d="M12 2L4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4z"
        stroke="#008B8B" strokeWidth="1.5" fill="#fff"/>
      <path d="M8.5 12.5L11 15l5-5" stroke="#008B8B" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
    <div style={{
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontWeight: 700, fontSize: size * 0.115, letterSpacing: 1.6,
      marginTop: 4,
    }}>{label}</div>
  </div>
);

// PCR Pathogen Badge
const PathogenBadge = ({ name, clean = true }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '5px 9px 5px 7px', borderRadius: 999,
    background: clean ? '#E6F2EB' : '#FCE9E4',
    color: clean ? '#205A37' : '#8E2A14',
    fontFamily: 'IBM Plex Mono, monospace', fontSize: 11.5, fontWeight: 500,
    border: `1px solid ${clean ? '#C8E2D2' : '#F0C9C0'}`,
  }}>
    <svg width="11" height="11" viewBox="0 0 12 12">
      {clean ? (
        <path d="M2.5 6.2L5 8.5L9.5 3.8" stroke="#205A37" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      ) : (
        <path d="M3 3L9 9M9 3L3 9" stroke="#8E2A14" strokeWidth="1.8" strokeLinecap="round"/>
      )}
    </svg>
    {name}
  </div>
);

// Stat with citation footer
const StatBlock = ({ label, value, unit, delta, source, deltaTone }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    <div style={{
      fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500,
      color: '#6B6B63', textTransform: 'uppercase', letterSpacing: 0.6,
    }}>{label}</div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
      <span style={{
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: 30, fontWeight: 700, color: '#1A1A17', letterSpacing: -0.5,
        fontVariantNumeric: 'tabular-nums',
      }}>{value}</span>
      {unit && <span style={{ fontSize: 14, color: '#6B6B63', fontWeight: 500 }}>{unit}</span>}
      {delta && (
        <span style={{
          fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, fontWeight: 500,
          color: deltaTone === 'up' ? '#2F7A4F' : deltaTone === 'down' ? '#B5371E' : '#6B6B63',
          marginLeft: 'auto',
        }}>{delta}</span>
      )}
    </div>
    {source && (
      <div style={{
        fontFamily: 'IBM Plex Mono, monospace', fontSize: 10.5,
        color: '#8E8E84', marginTop: 2,
      }}>{source}</div>
    )}
  </div>
);

// Distribution bar — small inline histogram
const DistBar = ({ buckets = [], height = 28, accent = '#004AAD' }) => {
  const max = Math.max(...buckets);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height }}>
      {buckets.map((v, i) => (
        <div key={i} style={{
          width: 6, height: `${(v / max) * 100}%`,
          background: accent, opacity: 0.35 + (v / max) * 0.65,
          borderRadius: 2,
          transformOrigin: 'bottom',
          animation: `aw-bar-grow 0.6s ${i * 0.05}s cubic-bezier(0.2,0.8,0.2,1) both`,
        }} />
      ))}
    </div>
  );
};

// Sparkline-like trend
const Trend = ({ values = [], color = '#008B8B', width = 80, height = 24 }) => {
  const max = Math.max(...values), min = Math.min(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 2) - 1;
    return `${x},${y}`;
  }).join(' ');
  const lastX = width, lastY = height - ((values[values.length-1] - min) / range) * (height - 2) - 1;
  const id = 'trg' + Math.random().toString(36).slice(2,7);
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={`0,${height} ${pts} ${width},${height}`} fill={`url(#${id})`}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={lastX} cy={lastY} r="1.8" fill={color}/>
    </svg>
  );
};

// Cycle progress dot
const CycleDot = ({ day, total = 120 }) => {
  const pct = Math.min(day / total, 1);
  const c = day < 30 ? '#8E8E84' : day < 60 ? '#004AAD' : day < 100 ? '#008B8B' : '#B5790E';
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <svg width="18" height="18" viewBox="0 0 18 18">
        <circle cx="9" cy="9" r="7" stroke="#E6E2D8" strokeWidth="1.6" fill="none"/>
        <circle cx="9" cy="9" r="7" stroke={c} strokeWidth="1.6" fill="none"
          strokeDasharray={`${pct * 44} 44`} strokeLinecap="round"
          transform="rotate(-90 9 9)"/>
      </svg>
      <span className="mono tabular" style={{ fontSize: 13, color: '#1A1A17' }}>
        Day {day}
      </span>
    </div>
  );
};

Object.assign(window, {
  AW_LOGO, AW_Wordmark, AW_Stamp, PathogenBadge, StatBlock, DistBar, Trend, CycleDot,
});
