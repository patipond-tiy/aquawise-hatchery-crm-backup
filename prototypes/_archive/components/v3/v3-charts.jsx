/* global React */
const { useState: _v3ch } = React;

// =============================================================
// V3 Charts — interactive with hover tooltips
// =============================================================

// Distribution histogram with tooltip + hover
function V3DistChart({ values, labels, height = 180, accent = (i, v) => i >= 7 ? 'var(--aw3-good)' : i >= 5 ? 'var(--aw3-hero)' : 'var(--aw3-warn)' }) {
  const [hover, setHover] = _v3ch(null);
  const max = Math.max(...values, 1);
  const total = values.reduce((a, b) => a + b, 0);

  return (
    <div>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 6, height, padding: '8px 0' }}>
        {/* Y-axis gridlines */}
        <div style={{ position: 'absolute', inset: '8px 0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
          {[0,1,2,3].map(i => <div key={i} style={{ borderTop: '1px dashed var(--aw3-line)', height: 1 }}/>)}
        </div>
        {values.map((v, i) => (
          <div key={i}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch', position: 'relative', cursor: 'pointer' }}>
            <div style={{
              height: `${(v / max) * 100}%`,
              background: hover === i ? 'var(--aw3-ink)' : accent(i, v),
              borderRadius: 'var(--r-sm) var(--r-sm) 4px 4px',
              minHeight: v > 0 ? 4 : 0,
              marginTop: 'auto',
              transition: 'background 0.12s, transform 0.12s',
              transform: hover === i ? 'scaleY(1.04)' : 'scaleY(1)',
              transformOrigin: 'bottom',
              display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 4,
              color: '#fff', fontSize: 10, fontWeight: 700,
            }}>{v >= max * 0.4 && v}</div>
            {hover === i && (
              <div style={{
                position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
                background: 'var(--aw3-ink)', color: '#fff',
                padding: '8px 12px', borderRadius: 'var(--r)',
                fontSize: 12, whiteSpace: 'nowrap', marginBottom: 6,
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 10,
              }}>
                <div style={{ fontWeight: 700 }}>{labels[i]}%</div>
                <div style={{ color: 'var(--aw3-line-2)', fontSize: 11 }}>{v} ฟาร์ม · {Math.round(v/total*100)}%</div>
                <div style={{
                  position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                  borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
                  borderTop: '6px solid var(--aw3-ink)',
                }}/>
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
        {labels.map((l, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 9.5, color: hover === i ? 'var(--aw3-ink)' : 'var(--aw3-ink-4)', fontWeight: hover === i ? 700 : 600 }}>{l}</div>
        ))}
      </div>
    </div>
  );
}

// Trend sparkline with hover dot
function V3Sparkline({ values, height = 60, color = 'var(--aw3-hero)', fill = 'var(--aw3-hero-soft)' }) {
  const [hover, setHover] = _v3ch(null);
  const w = 240, h = height;
  const max = Math.max(...values), min = Math.min(...values);
  const pts = values.map((v, i) => ({
    x: (i / (values.length - 1)) * w,
    y: h - 8 - ((v - min) / (max - min || 1)) * (h - 16),
    v,
  }));
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const area = `${path} L ${w} ${h} L 0 ${h} Z`;

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} style={{ display: 'block' }}
        onMouseLeave={() => setHover(null)}
        onMouseMove={e => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width * w;
          const i = Math.round(x / w * (values.length - 1));
          setHover(Math.max(0, Math.min(values.length - 1, i)));
        }}>
        <path d={area} fill={fill} opacity="0.5"/>
        <path d={path} stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={hover === i ? 5 : 3} fill={color}
            stroke="#fff" strokeWidth="2"/>
        ))}
        {hover != null && (
          <line x1={pts[hover].x} x2={pts[hover].x} y1={0} y2={h} stroke="var(--aw3-line-2)" strokeDasharray="3 3"/>
        )}
      </svg>
      {hover != null && (
        <div style={{
          position: 'absolute', top: -4, left: `${(hover / (values.length - 1)) * 100}%`,
          transform: 'translate(-50%, -100%)',
          background: 'var(--aw3-ink)', color: '#fff',
          padding: '6px 10px', borderRadius: 'var(--r-sm)',
          fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
        }}>{values[hover]}%</div>
      )}
    </div>
  );
}

// Donut with center text and segment hover
function V3Donut({ segs, size = 180, stroke = 22 }) {
  const [hover, setHover] = _v3ch(null);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const total = segs.reduce((a, s) => a + s.value, 0);
  let acc = 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {segs.map((s, i) => {
            const len = (s.value / total) * c;
            const dasharray = `${len} ${c - len}`;
            const dashoffset = -acc;
            acc += len;
            return (
              <circle key={i}
                onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
                cx={size/2} cy={size/2} r={r}
                stroke={s.color} strokeWidth={hover === i ? stroke + 2 : stroke}
                fill="none"
                strokeDasharray={dasharray} strokeDashoffset={dashoffset}
                style={{ cursor: 'pointer', transition: 'stroke-width 0.12s' }}/>
            );
          })}
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em' }}>{hover != null ? segs[hover].value : total}</div>
          <div style={{ fontSize: 11.5, color: 'var(--aw3-ink-4)', fontWeight: 600 }}>{hover != null ? segs[hover].label : 'ทั้งหมด'}</div>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {segs.map((s, i) => (
          <div key={i}
            onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '6px 10px', borderRadius: 'var(--r-sm)',
              background: hover === i ? 'var(--aw3-soft)' : 'transparent',
              cursor: 'pointer', transition: 'background 0.1s',
            }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color }}/>
            <span style={{ fontSize: 13, flex: 1, fontWeight: 600 }}>{s.label}</span>
            <span style={{ fontSize: 13, fontWeight: 800 }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Bars with hover & label
function V3BarsInteractive({ values, labels, height = 140, color = 'var(--aw3-hero)' }) {
  const [hover, setHover] = _v3ch(null);
  const max = Math.max(...values, 1);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height, padding: '8px 0' }}>
        {values.map((v, i) => (
          <div key={i}
            onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'relative', cursor: 'pointer' }}>
            {hover === i && (
              <div style={{
                position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
                background: 'var(--aw3-ink)', color: '#fff',
                padding: '5px 10px', borderRadius: 'var(--r-sm)',
                fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', marginBottom: 4,
              }}>{v}%</div>
            )}
            <div style={{
              height: `${(v / max) * 100}%`,
              background: hover === i ? 'var(--aw3-ink)' : color,
              borderRadius: 'var(--r-sm)',
              minHeight: 4,
              transition: 'background 0.12s',
            }}/>
          </div>
        ))}
      </div>
      {labels && (
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          {labels.map((l, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 11, color: hover === i ? 'var(--aw3-ink)' : 'var(--aw3-ink-4)', fontWeight: hover === i ? 700 : 500 }}>{l}</div>
          ))}
        </div>
      )}
    </div>
  );
}

window.V3DistChart = V3DistChart;
window.V3Sparkline = V3Sparkline;
window.V3Donut = V3Donut;
window.V3BarsInteractive = V3BarsInteractive;
