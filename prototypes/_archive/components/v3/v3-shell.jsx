/* global React */
const { useState: _v3sh } = React;

// V3 — three-column shell with rounded inner card.
function V3Shell({ page, setPage, children }) {
  const NAV_OVERVIEW = [
    { id: 'dashboard', label: 'หน้าหลัก', en: 'Dashboard', icon: 'home' },
    { id: 'customers', label: 'ลูกค้า', en: 'Customers', icon: 'users' },
    { id: 'batches', label: 'ล็อตลูกกุ้ง', en: 'Batches', icon: 'box' },
    { id: 'restock', label: 'รอบใหม่', en: 'Restock', icon: 'cycle' },
  ];
  const NAV_DAILY = [
    { id: 'alerts', label: 'แจ้งเตือนโรค', en: 'Disease watch', icon: 'alert' },
    { id: 'scorecard', label: 'คะแนนสาธารณะ', en: 'Public score', icon: 'badge' },
  ];
  const NAV_SETTINGS = [
    { id: 'settings', label: 'ตั้งค่า', en: 'Settings', icon: 'gear' },
    { id: 'logout', label: 'ออกจากระบบ', en: 'Logout', icon: 'out' },
  ];

  const Icon = ({ name, color }) => {
    const props = { width: 22, height: 22, viewBox: '0 0 20 20', fill: 'none', stroke: color || 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
    if (name === 'home') return <svg {...props}><path d="M3 9l7-6 7 6v8a1 1 0 01-1 1h-3v-5H7v5H4a1 1 0 01-1-1V9z"/></svg>;
    if (name === 'users') return <svg {...props}><circle cx="7" cy="7" r="3"/><path d="M2 17c0-3 2-5 5-5s5 2 5 5"/><circle cx="14" cy="6" r="2.5"/><path d="M13 12c2 0 5 1.5 5 5"/></svg>;
    if (name === 'box') return <svg {...props}><path d="M3 6l7-3 7 3v8l-7 3-7-3V6z"/><path d="M3 6l7 3 7-3M10 9v9"/></svg>;
    if (name === 'cycle') return <svg {...props}><path d="M3 10a7 7 0 0112-5l2 2"/><path d="M17 4v3h-3"/><path d="M17 10a7 7 0 01-12 5l-2-2"/><path d="M3 16v-3h3"/></svg>;
    if (name === 'alert') return <svg {...props}><path d="M10 3l8 14H2L10 3z"/><path d="M10 8v4M10 14h.01"/></svg>;
    if (name === 'badge') return <svg {...props}><path d="M10 2l2.4 4.6 5.1.7-3.7 3.6.9 5.1L10 13.6l-4.6 2.4.9-5.1L2.5 7.3l5.1-.7L10 2z"/></svg>;
    if (name === 'gear') return <svg {...props}><circle cx="10" cy="10" r="3"/><path d="M10 1v3M10 16v3M19 10h-3M4 10H1M16.4 3.6l-2.1 2.1M5.7 14.3l-2.1 2.1M16.4 16.4l-2.1-2.1M5.7 5.7L3.6 3.6"/></svg>;
    if (name === 'out') return <svg {...props}><path d="M8 3H4a1 1 0 00-1 1v12a1 1 0 001 1h4M13 14l4-4-4-4M17 10H7"/></svg>;
    return null;
  };

  const NavItem = ({ n }) => {
    const active = page === n.id;
    return (
      <button onClick={() => { setPage(n.id); window.scrollTo(0, 0); }}
        style={{
          display: 'flex', alignItems: 'center', gap: 14,
          width: '100%', padding: '14px 16px',
          background: active ? 'var(--aw3-hero-soft)' : 'transparent',
          color: active ? 'var(--aw3-hero)' : 'var(--aw3-ink)',
          border: 0, borderRadius: 'var(--r)',
          fontFamily: 'inherit', fontSize: 16, fontWeight: active ? 700 : 600,
          textAlign: 'left', cursor: 'pointer',
          minHeight: 50,
          transition: 'all 0.12s',
        }}>
        <Icon name={n.icon}/>
        <span style={{ whiteSpace: 'nowrap' }}>{n.label}</span>
      </button>
    );
  };

  const Group = ({ label, items }) => (
    <div style={{ marginBottom: 18 }}>
      <div className="eyebrow" style={{ padding: '0 14px', marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map(n => <NavItem key={n.id} n={n}/>)}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', padding: 20, background: 'var(--aw3-canvas)' }}>
      <div data-screen-label="AquaWise v3 webapp" style={{
        background: 'var(--aw3-app)',
        borderRadius: 'var(--r-xl)',
        boxShadow: '0 4px 24px rgba(20,19,31,0.06)',
        display: 'grid', gridTemplateColumns: '270px 1fr 320px',
        minHeight: 'calc(100vh - 40px)',
        overflow: 'hidden',
      }}>
        {/* Left rail */}
        <aside style={{ borderRight: '1px solid var(--aw3-line)', padding: '24px 14px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 10px 24px' }}>
            <V3Mark size={32}/>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em' }}>AquaWise</div>
              <div style={{ fontSize: 10.5, color: 'var(--aw3-ink-4)', fontWeight: 500, marginTop: -2 }}>ฟ้าใส แฮทเชอรี่</div>
            </div>
          </div>
          <Group label="ภาพรวม" items={NAV_OVERVIEW}/>
          <Group label="งานประจำวัน" items={NAV_DAILY}/>
          <div style={{ flex: 1 }}/>
          <Group label="ตั้งค่า" items={NAV_SETTINGS}/>
        </aside>

        {/* Center */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <V3TopBar/>
          <main className="aw3-rise" key={page} style={{ padding: '20px 28px 40px', flex: 1 }}>
            {children}
          </main>
        </div>

        {/* Right rail */}
        <aside style={{ borderLeft: '1px solid var(--aw3-line)', padding: '20px 22px 28px', overflow: 'auto' }}>
          <V3RightRail/>
        </aside>
      </div>
    </div>
  );
}

function V3TopBar() {
  return (
    <header style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '20px 28px',
      borderBottom: '1px solid var(--aw3-line)',
    }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <svg width={16} height={16} viewBox="0 0 20 20" fill="none" stroke="var(--aw3-ink-4)" strokeWidth="1.8"
          style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)' }}>
          <circle cx="9" cy="9" r="6"/><path d="M14 14l4 4"/>
        </svg>
        <input className="aw3-input" placeholder="ค้นหาฟาร์ม ล็อต หรือเลขใบรับรอง…" style={{ paddingLeft: 44 }}/>
      </div>
      <button style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--aw3-soft)', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <svg width={18} height={18} viewBox="0 0 20 20" fill="none" stroke="var(--aw3-ink)" strokeWidth="1.7">
          <path d="M3 6l7 5 7-5M3 6v9a1 1 0 001 1h12a1 1 0 001-1V6M3 6l7-3 7 3"/>
        </svg>
        <span style={{ position: 'absolute', top: 8, right: 9, width: 8, height: 8, background: 'var(--aw3-hero)', borderRadius: '50%', border: '2px solid var(--aw3-card)' }}/>
      </button>
      <button style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--aw3-soft)', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width={18} height={18} viewBox="0 0 20 20" fill="none" stroke="var(--aw3-ink)" strokeWidth="1.7">
          <path d="M10 11a3 3 0 100-6 3 3 0 000 6zM4 17c0-3 2.5-5 6-5s6 2 6 5"/>
        </svg>
      </button>
      <div style={{ width: 1, height: 26, background: 'var(--aw3-line-2)', margin: '0 4px' }}/>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <V3Avatar name="สุเทพ" tone="lav" size={36}/>
        <div style={{ whiteSpace: 'nowrap' }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>คุณสุเทพ</div>
          <div style={{ fontSize: 12, color: 'var(--aw3-ink-3)' }}>เจ้าของฟาร์ม</div>
        </div>
      </div>
    </header>
  );
}

function V3RightRail() {
  const D = window.AW_DATA;
  const TEAM = [
    { name: 'นิภา ใจดี', role: 'หัวหน้าโรงเพาะ', tone: 'mint' },
    { name: 'พรชัย ตั้งใจ', role: 'เจ้าหน้าที่ PCR', tone: 'sky' },
    { name: 'รัตนา สุขสวัสดิ์', role: 'ดูแลลูกค้า', tone: 'rose' },
  ];
  const followUps = D.CUSTOMERS.filter(c => c.restockIn != null && c.restockIn <= 14).slice(0, 3);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>สถิติของคุณ</h3>
        <button style={{ width: 24, height: 24, border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--aw3-ink-4)' }}>⋯</button>
      </div>

      {/* Progress ring */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14, position: 'relative' }}>
        <V3Ring value={82} size={170} stroke={9}>
          <V3Avatar name="สุเทพ" tone="lav" size={130}/>
        </V3Ring>
        <div style={{
          position: 'absolute', top: 8, right: 38,
          background: '#fff', color: 'var(--aw3-hero)',
          padding: '4px 10px', borderRadius: 'var(--r-pill)',
          fontSize: 11, fontWeight: 700,
          boxShadow: '0 4px 8px rgba(91,75,255,0.18)',
        }}>82%</div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>สวัสดีครับ คุณสุเทพ</div>
        <div style={{ fontSize: 13, color: 'var(--aw3-ink-3)', marginTop: 6, padding: '0 8px' }}>
          เป้าหมาย D30 อัตรารอด 80% ของไตรมาสนี้
        </div>
      </div>

      {/* D30 trend sparkline */}
      <div style={{ background: 'var(--aw3-soft)', borderRadius: 'var(--r-lg)', padding: 16, marginTop: 18, marginBottom: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <div className="eyebrow">D30 — 12 สัปดาห์</div>
          <V3Chip tone="good" size="xs">+11%</V3Chip>
        </div>
        <div style={{ fontSize: 11, color: 'var(--aw3-ink-4)', marginBottom: 8 }}>เลื่อนเมาส์ดูแต่ละสัปดาห์</div>
        <window.V3Sparkline values={[68, 71, 73, 70, 72, 75, 74, 76, 78, 80, 81, 82]} height={70}/>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: 'var(--aw3-ink-4)', fontWeight: 600 }}>
          <span>ก.พ.</span><span>มี.ค.</span><span>เม.ย.</span>
        </div>
      </div>

      {/* Follow-ups */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>ต้องติดต่อ</h3>
        <V3RoundBtn dir="right" size={28}/>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {followUps.map((c, i) => (
          <div key={c.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: 10, borderRadius: 'var(--r)',
            background: i === 0 ? 'var(--aw3-hero-soft)' : 'var(--aw3-soft)',
          }}>
            <V3Avatar name={c.farm} tone={['lav','peach','mint'][i]} size={36}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.farm}</div>
              <div style={{ fontSize: 11, color: 'var(--aw3-ink-3)' }}>
                {c.restockIn === 0 ? 'ตอนนี้' : `ใน ${c.restockIn} วัน`} · {c.zone}
              </div>
            </div>
            <button className="aw3-btn aw3-btn-soft aw3-btn-sm" style={{ padding: '5px 11px' }}>
              <svg width={12} height={12} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 5l5-3 5 3M3 5v6l5 3 5-3V5M3 5l5 3 5-3M8 8v6"/>
              </svg>
              ติดต่อ
            </button>
          </div>
        ))}
        <button className="aw3-btn aw3-btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 6 }}>ดูทั้งหมด</button>
      </div>

      {/* Team */}
      <div style={{ marginTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>ทีมของคุณ</h3>
        <V3RoundBtn dir="right" size={28}/>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {TEAM.map(t => (
          <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 4 }}>
            <V3Avatar name={t.name} tone={t.tone} size={36}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{t.name}</div>
              <div style={{ fontSize: 11, color: 'var(--aw3-ink-3)' }}>{t.role}</div>
            </div>
            <button className="aw3-btn aw3-btn-soft aw3-btn-sm" style={{ padding: '4px 10px' }}>
              <svg width={11} height={11} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 4v8M4 8h8"/></svg>
              ทักทาย
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

window.V3Shell = V3Shell;
