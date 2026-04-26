/* global React, AW_DATA */
// Hatchery Webapp — H2 Dashboard, H3 Customer List, H1 LIFF preview

const { useState, useMemo } = React;
const { CUSTOMERS, BATCHES, HATCHERY } = window.AW_DATA;

const fmt = {
  thb: (n) => '฿' + n.toLocaleString(),
  k: (n) => n >= 1000 ? (n/1000).toFixed(n >= 10000 ? 0 : 1) + 'k' : n,
  date: (d) => d ? new Date(d).toLocaleDateString('en-GB',
    { day: '2-digit', month: 'short' }) : '—',
};

// — Icons —
const Ic = ({ name, size = 18 }) => {
  const p = { width: size, height: size, fill: 'none', stroke: 'currentColor',
    strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const d = {
    home: 'M3 10L10 4l7 6v7a1 1 0 01-1 1h-3v-5H7v5H4a1 1 0 01-1-1z',
    users: 'M2 17v-1a4 4 0 014-4h4a4 4 0 014 4v1M14 8a3 3 0 100-6 3 3 0 000 6zm-6 0a3 3 0 100-6 3 3 0 000 6z',
    layers: 'M10 2l8 4-8 4-8-4 8-4zM2 10l8 4 8-4M2 14l8 4 8-4',
    phone: 'M5 3h3l2 5-2 1a10 10 0 005 5l1-2 5 2v3a2 2 0 01-2 2A14 14 0 013 5a2 2 0 012-2z',
    award: 'M10 13a5 5 0 100-10 5 5 0 000 10zm-3 0l-2 5 5-2 5 2-2-5',
    settings: 'M10 13a3 3 0 100-6 3 3 0 000 6zm7-3l-2-1v-2l-1-2-2 1-2-2h-2L8 4 6 3 5 5 3 6l1 2v2l-1 2 2 1 1 2 2-1 2 2h2l1-2 2-1 1-2-2-1z',
    search: 'M9 16a7 7 0 100-14 7 7 0 000 14zm5-2l4 4',
    plus: 'M10 4v12M4 10h12',
    bell: 'M5 8a5 5 0 0110 0c0 5 2 6 2 6H3s2-1 2-6zm3 9a2 2 0 004 0',
    chevron: 'M7 5l5 5-5 5',
    arrow: 'M4 10h12m-4-4l4 4-4 4',
    filter: 'M3 5h14M5 10h10M8 15h4',
    check: 'M4 10l4 4 8-8',
    x: 'M5 5l10 10M15 5L5 15',
    sort: 'M6 4v12m0 0l-3-3m3 3l3-3M14 16V4m0 0l-3 3m3-3l3 3',
    info: 'M10 18a8 8 0 100-16 8 8 0 000 16zm0-9v5m0-8v.01',
  };
  return <svg viewBox="0 0 20 20" {...p}><path d={d[name] || d.info}/></svg>;
};

// ─── Top bar ─────────────────────────────────────────
function TopBar({ lang, setLang, hatchery }) {
  return (
    <div style={{
      height: 64, borderBottom: '1px solid var(--aw-line)',
      display: 'flex', alignItems: 'center', padding: '0 24px',
      background: 'var(--aw-card)', gap: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <window.AW_LOGO size={26}/>
        <span style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: 16, letterSpacing: -0.3 }}>
          AquaWise
        </span>
        <span style={{ width: 1, height: 18, background: 'var(--aw-line-strong)', margin: '0 6px' }}/>
        <span style={{ fontFamily: 'Noto Sans Thai', fontSize: 14, color: 'var(--aw-ink-700)' }}>
          {lang === 'th' ? hatchery.name : hatchery.nameEn}
        </span>
      </div>
      <div style={{ flex: 1 }}/>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4, padding: 3,
        background: 'var(--aw-paper-2)', borderRadius: 999, fontSize: 12,
      }}>
        {['th', 'en'].map(l => (
          <button key={l} onClick={() => setLang(l)}
            style={{
              padding: '5px 12px', borderRadius: 999, border: 0, cursor: 'pointer',
              background: lang === l ? 'var(--aw-card)' : 'transparent',
              color: lang === l ? 'var(--aw-ink-900)' : 'var(--aw-ink-500)',
              fontWeight: 600, fontFamily: 'Inter',
              boxShadow: lang === l ? 'var(--shadow-sm)' : 'none',
            }}>
            {l === 'th' ? 'ไทย' : 'EN'}
          </button>
        ))}
      </div>
      <button style={iconBtn}><Ic name="bell"/></button>
      <div style={{
        width: 32, height: 32, borderRadius: 16,
        background: 'linear-gradient(135deg,#004AAD,#008B8B)',
        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 600, fontSize: 13,
      }}>ฟ</div>
    </div>
  );
}

const iconBtn = {
  width: 36, height: 36, borderRadius: 8, border: 0, background: 'transparent',
  color: 'var(--aw-ink-500)', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

// ─── Side nav ────────────────────────────────────────
function SideNav({ active, onNav, lang }) {
  const T = lang === 'th'
    ? { dash: 'แดชบอร์ด', cust: 'ลูกค้าและรอบเลี้ยง', batch: 'ทะเบียนล็อต',
        restock: 'พยากรณ์การสั่งซ้ำ', cert: 'ใบรับรอง', settings: 'ตั้งค่า',
        phase: 'อยู่ระหว่างพัฒนา' }
    : { dash: 'Dashboard', cust: 'Customers & Cycles', batch: 'Batch Register',
        restock: 'Restock Predictor', cert: 'Certificates', settings: 'Settings',
        phase: 'Coming soon' };
  const items = [
    { id: 'dashboard', label: T.dash, icon: 'home', live: true },
    { id: 'customers', label: T.cust, icon: 'users', live: true },
    { id: 'batches', label: T.batch, icon: 'layers', live: true },
    { id: 'restock', label: T.restock, icon: 'phone', live: true },
    { id: 'alerts', label: lang==='th'?'แจ้งเตือนโรค':'Disease alerts', icon: 'bell', live: true, h3: true },
    { id: 'scorecard', label: lang==='th'?'การ์ดคะแนน':'Scorecard', icon: 'award', live: true, h3: true },
    { id: 'settings', label: T.settings, icon: 'settings', live: true },
  ];
  return (
    <nav style={{
      width: 232, borderRight: '1px solid var(--aw-line)',
      background: 'var(--aw-card)', padding: '20px 12px', flexShrink: 0,
      display: 'flex', flexDirection: 'column', gap: 2,
      fontFamily: lang === 'th' ? 'Noto Sans Thai' : 'Inter',
    }}>
      {items.map(it => (
        <button key={it.id} onClick={() => it.live && onNav(it.id)}
          disabled={!it.live}
          style={{
            display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px',
            border: 0, borderRadius: 8, cursor: it.live ? 'pointer' : 'not-allowed',
            background: active === it.id ? 'var(--aw-blue-50)' : 'transparent',
            color: active === it.id ? 'var(--aw-blue)'
              : it.live ? 'var(--aw-ink-700)' : 'var(--aw-ink-300)',
            fontWeight: active === it.id ? 600 : 500, fontSize: 14, textAlign: 'left',
            fontFamily: 'inherit',
          }}>
          <Ic name={it.icon}/>
          <span style={{ flex: 1 }}>{it.label}</span>
          {it.h3 && (
            <span style={{
              fontSize: 9.5, padding: '2px 6px', borderRadius: 4,
              background: '#FBF1DC', color: '#8C5A0B',
              fontFamily: 'IBM Plex Mono', letterSpacing: 0.3,
            }}>H3</span>
          )}
        </button>
      ))}
      <div style={{ marginTop: 'auto', padding: 12, fontSize: 11, color: 'var(--aw-ink-400)',
        fontFamily: 'IBM Plex Mono', borderTop: '1px solid var(--aw-line)' }}>
        Phase H1 · v0.4
      </div>
    </nav>
  );
}

// ─── Dashboard (H2) ──────────────────────────────────
function Dashboard({ lang, onOpenCustomer }) {
  const T = lang === 'th' ? {
    title: 'แดชบอร์ด', sub: 'ภาพรวมธุรกิจของคุณวันนี้',
    addBatch: 'เพิ่มล็อตใหม่', addCust: 'ลงทะเบียนลูกค้า',
    kpi1: 'ลูกค้าใหม่เดือนนี้', kpi2: 'รอบเลี้ยงที่ยังเปิดอยู่',
    kpi3: 'ใกล้จับ (≤30 วัน)', kpi4: 'รอด Day-30 เฉลี่ย',
    panel1: 'ลูกค้าและรอบเลี้ยง', panel2: 'ผลของล็อตล่าสุด',
    sortDay: 'เรียงตาม: วันใกล้จับ', viewAll: 'ดูทั้งหมด',
    farms: 'ฟาร์ม', day: 'วัน', harvest: 'จับ', d30: 'รอด D30',
    batchCol: 'ล็อต', source: 'แหล่งพ่อแม่พันธุ์', meanD30: 'รอด D30 เฉลี่ย',
    note: 'ที่มา: รายงานจริงจากฟาร์มผ่าน LINE OA',
  } : {
    title: 'Dashboard', sub: 'Your business at a glance',
    addBatch: 'Add new batch', addCust: 'Register customer',
    kpi1: 'New customers this month', kpi2: 'Active cycles',
    kpi3: 'Approaching harvest (≤30d)', kpi4: 'Mean Day-30 survival',
    panel1: 'Customers & cycles', panel2: 'Recent batch performance',
    sortDay: 'Sort: harvest soonest', viewAll: 'View all',
    farms: 'farms', day: 'day', harvest: 'harvest', d30: 'D30 surv.',
    batchCol: 'Batch', source: 'Broodstock source', meanD30: 'Mean D30',
    note: 'Source: farmer self-reports via LINE OA',
  };

  const active = CUSTOMERS.filter(c => c.cycleDay !== null);
  const sorted = [...active].sort((a, b) => b.cycleDay - a.cycleDay).slice(0, 6);
  const nearHarvest = active.filter(c => c.cycleDay >= 90).length;
  const meanD30 = Math.round(
    active.filter(c => c.d30).reduce((s, c) => s + c.d30, 0) /
    active.filter(c => c.d30).length
  );

  return (
    <div style={{ padding: '28px 32px 60px', maxWidth: 1240,
      fontFamily: lang === 'th' ? 'Noto Sans Thai' : 'Inter' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: 34,
            fontWeight: 600, letterSpacing: -0.8, color: 'var(--aw-ink-900)',
            fontVariationSettings: '"opsz" 144' }}>
            {T.title}
          </h1>
          <p style={{ margin: '6px 0 0', color: 'var(--aw-ink-500)', fontSize: 14 }}>
            {T.sub} · {new Date('2026-04-26').toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-GB',
              { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          <button style={btnSecondary}><Ic name="users" size={15}/>{T.addCust}</button>
          <button style={btnPrimary}><Ic name="plus" size={15}/>{T.addBatch}</button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
        <KPI label={T.kpi1} value="3" delta="+1" deltaTone="up" trend={[1,1,2,2,2,3]}/>
        <KPI label={T.kpi2} value={active.length} sublabel={`${active.filter(c => c.cycleDay > 60).length} ${lang === 'th' ? 'ครึ่งหลัง' : 'late stage'}`}/>
        <KPI label={T.kpi3} value={nearHarvest} accent="amber"/>
        <KPI label={T.kpi4} value={meanD30 + '%'} delta="+2pt" deltaTone="up" trend={[71,74,76,78,77,79]} accent="cyan"/>
      </div>

      {/* Two panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
        {/* Customers & cycles */}
        <Panel title={T.panel1} action={T.viewAll} onAction={() => onOpenCustomer && onOpenCustomer()}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px 10px',
            fontSize: 11.5, color: 'var(--aw-ink-500)', textTransform: 'uppercase',
            letterSpacing: 0.5, fontFamily: 'Inter' }}>
            <Ic name="sort" size={13}/>{T.sortDay}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 0.8fr 0.8fr',
            padding: '0 16px 8px', fontSize: 11, color: 'var(--aw-ink-400)',
            fontFamily: 'Inter', textTransform: 'uppercase', letterSpacing: 0.6,
            borderBottom: '1px solid var(--aw-line)' }}>
            <div>{lang === 'th' ? 'ลูกค้า / ฟาร์ม' : 'Customer / Farm'}</div>
            <div>{lang === 'th' ? 'รอบเลี้ยง' : 'Cycle'}</div>
            <div>{T.harvest}</div>
            <div style={{ textAlign: 'right' }}>{T.d30}</div>
          </div>
          {sorted.map(c => (
            <div key={c.id} onClick={() => onOpenCustomer && onOpenCustomer(c.id)}
              style={{
                display: 'grid', gridTemplateColumns: '1.4fr 1fr 0.8fr 0.8fr',
                alignItems: 'center', padding: '12px 16px', cursor: 'pointer',
                borderBottom: '1px solid var(--aw-line)', fontSize: 13.5,
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--aw-paper)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div>
                <div style={{ fontWeight: 600 }}>{lang === 'th' ? c.name : c.name}</div>
                <div style={{ fontSize: 12, color: 'var(--aw-ink-500)', marginTop: 1 }}>
                  {lang === 'th' ? c.farm : c.farmEn} · {c.zone}
                </div>
              </div>
              <div><window.CycleDot day={c.cycleDay}/></div>
              <div className="mono tabular" style={{ fontSize: 12.5, color: 'var(--aw-ink-700)' }}>
                {fmt.date(c.expectedHarvest)}
              </div>
              <div style={{ textAlign: 'right' }}>
                {c.d30 ? <SurvivalChip pct={c.d30}/> :
                  <span style={{ fontSize: 12, color: 'var(--aw-ink-400)', fontFamily: 'Inter' }}>
                    {lang === 'th' ? 'รอ' : 'pending'}
                  </span>}
              </div>
            </div>
          ))}
        </Panel>

        {/* Batch performance */}
        <Panel title={T.panel2}>
          {BATCHES.slice(0, 4).map((b, i) => (
            <div key={b.id} style={{
              padding: '14px 16px', borderBottom: i < 3 ? '1px solid var(--aw-line)' : 0,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="mono" style={{ fontSize: 13, fontWeight: 600 }}>{b.id}</div>
                <div style={{ fontSize: 11.5, color: 'var(--aw-ink-500)', marginTop: 2,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {b.source} · {b.farms} {T.farms}
                </div>
              </div>
              <window.DistBar buckets={b.dist} height={26}/>
              <div style={{ textAlign: 'right', minWidth: 56 }}>
                <div className="tabular" style={{ fontFamily: 'Plus Jakarta Sans',
                  fontSize: 18, fontWeight: 700,
                  color: b.meanD30 >= 75 ? 'var(--aw-cyan)' : b.meanD30 >= 65 ? 'var(--aw-ink-900)' : 'var(--aw-amber)' }}>
                  {b.meanD30}%
                </div>
                <div style={{ fontSize: 10, color: 'var(--aw-ink-400)',
                  fontFamily: 'IBM Plex Mono' }}>D30</div>
              </div>
            </div>
          ))}
          <div style={{ padding: '12px 16px', fontSize: 11.5, color: 'var(--aw-ink-400)',
            fontFamily: 'Inter', borderTop: '1px solid var(--aw-line)' }}>
            <Ic name="info" size={11}/> {T.note}
          </div>
        </Panel>
      </div>
    </div>
  );
}

// ─── KPI card ────────────────────────────────────────
function KPI({ label, value, delta, deltaTone, sublabel, trend, accent = 'blue' }) {
  const colors = { blue: '#004AAD', cyan: '#008B8B', amber: '#B5790E' };
  return (
    <div style={{
      background: 'var(--aw-card)', borderRadius: 14, padding: '16px 18px',
      border: '1px solid var(--aw-line)', position: 'relative',
    }}>
      <div style={{ fontSize: 11.5, color: 'var(--aw-ink-500)',
        textTransform: 'uppercase', letterSpacing: 0.6, fontFamily: 'Inter',
        fontWeight: 500, marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
        <span style={{
          fontFamily: 'Plus Jakarta Sans', fontSize: 32, fontWeight: 700,
          color: colors[accent], letterSpacing: -0.6, lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}>{value}</span>
        {delta && (
          <span style={{
            fontFamily: 'IBM Plex Mono', fontSize: 11.5, fontWeight: 500,
            color: deltaTone === 'up' ? 'var(--aw-green)' : 'var(--aw-red)',
            paddingBottom: 4,
          }}>{deltaTone === 'up' ? '▲' : '▼'} {delta}</span>
        )}
      </div>
      {sublabel && (
        <div style={{ fontSize: 12, color: 'var(--aw-ink-500)', marginTop: 4 }}>
          {sublabel}
        </div>
      )}
      {trend && (
        <div style={{ position: 'absolute', right: 14, top: 14 }}>
          <window.Trend values={trend} color={colors[accent]} width={56} height={20}/>
        </div>
      )}
    </div>
  );
}

// ─── Panel ─────────────────────────────────────────
function Panel({ title, action, onAction, children }) {
  return (
    <section style={{
      background: 'var(--aw-card)', borderRadius: 14,
      border: '1px solid var(--aw-line)', overflow: 'hidden',
    }}>
      <header style={{ padding: '16px 18px', display: 'flex', alignItems: 'center',
        borderBottom: '1px solid var(--aw-line)' }}>
        <h3 style={{ margin: 0, fontFamily: 'Plus Jakarta Sans', fontSize: 15,
          fontWeight: 600, color: 'var(--aw-ink-900)' }}>{title}</h3>
        {action && (
          <button onClick={onAction} style={{
            marginLeft: 'auto', background: 0, border: 0, fontSize: 12.5,
            color: 'var(--aw-blue)', cursor: 'pointer', fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit',
          }}>
            {action} <Ic name="chevron" size={12}/>
          </button>
        )}
      </header>
      {children}
    </section>
  );
}

// ─── Survival chip ─────────────────────────────────
function SurvivalChip({ pct }) {
  const tone = pct >= 75 ? 'good' : pct >= 60 ? 'mid' : 'low';
  const colors = {
    good: { bg: 'var(--aw-green-50)', fg: 'var(--aw-green)' },
    mid: { bg: 'var(--aw-amber-50)', fg: 'var(--aw-amber)' },
    low: { bg: 'var(--aw-red-50)', fg: 'var(--aw-red)' },
  }[tone];
  return (
    <span className="mono tabular" style={{
      display: 'inline-block', padding: '3px 8px', borderRadius: 6,
      background: colors.bg, color: colors.fg, fontSize: 12, fontWeight: 600,
    }}>{pct}%</span>
  );
}

// ─── Customer list (H3) ─────────────────────────────
function CustomerList({ lang, onOpen }) {
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const T = lang === 'th' ? {
    title: 'ลูกค้าและรอบเลี้ยง', sub: 'ลูกค้าทุกรายที่เคยซื้อจากคุณ',
    search: 'ค้นหาชื่อหรือฟาร์ม...', filterAll: 'ทั้งหมด',
    fActive: 'รอบเลี้ยงที่เปิดอยู่', fConcern: 'ผลรอดต่ำ',
    fRestock: 'ใกล้สั่งซ้ำ', fQuiet: 'เงียบหาย 6 เดือน+',
    cName: 'ลูกค้า', cFarm: 'ฟาร์ม', cBatches: 'จำนวนล็อต',
    cLast: 'ซื้อล่าสุด', cLTV: 'มูลค่ารวม', cStatus: 'สถานะ',
  } : {
    title: 'Customers & cycles', sub: 'Every farmer who has ever bought from you',
    search: 'Search name or farm...', filterAll: 'All',
    fActive: 'Active cycles', fConcern: 'Low survival',
    fRestock: 'Restock soon', fQuiet: 'Quiet 6mo+',
    cName: 'Customer', cFarm: 'Farm', cBatches: 'Batches',
    cLast: 'Last purchase', cLTV: 'Lifetime value', cStatus: 'Status',
  };

  const filtered = useMemo(() => CUSTOMERS.filter(c => {
    if (filter === 'active' && c.status !== 'active') return false;
    if (filter === 'concern' && c.status !== 'concern') return false;
    if (filter === 'restock' && !['restock-now', 'restock-soon'].includes(c.status)) return false;
    if (filter === 'quiet' && c.status !== 'quiet') return false;
    if (q && !(c.name.includes(q) || c.farm.includes(q) || c.farmEn.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  }), [filter, q]);

  const filters = [
    { id: 'all', label: T.filterAll, count: CUSTOMERS.length },
    { id: 'active', label: T.fActive, count: CUSTOMERS.filter(c => c.status === 'active').length },
    { id: 'concern', label: T.fConcern, count: CUSTOMERS.filter(c => c.status === 'concern').length, tone: 'red' },
    { id: 'restock', label: T.fRestock, count: CUSTOMERS.filter(c => ['restock-now', 'restock-soon'].includes(c.status)).length, tone: 'amber' },
    { id: 'quiet', label: T.fQuiet, count: CUSTOMERS.filter(c => c.status === 'quiet').length },
  ];

  const statusLabel = (s) => {
    const m = lang === 'th' ? {
      'active': 'เปิดอยู่', 'concern': 'น่าเป็นห่วง',
      'restock-now': 'ควรโทรวันนี้', 'restock-soon': 'ใกล้สั่งซ้ำ', 'quiet': 'เงียบหาย',
    } : {
      'active': 'Active', 'concern': 'Concern',
      'restock-now': 'Call today', 'restock-soon': 'Restock soon', 'quiet': 'Quiet',
    };
    return m[s];
  };
  const statusTone = {
    'active': { bg: 'var(--aw-cyan-50)', fg: 'var(--aw-cyan-700)' },
    'concern': { bg: 'var(--aw-red-50)', fg: 'var(--aw-red)' },
    'restock-now': { bg: 'var(--aw-amber-50)', fg: 'var(--aw-amber)' },
    'restock-soon': { bg: 'var(--aw-blue-50)', fg: 'var(--aw-blue)' },
    'quiet': { bg: 'var(--aw-paper-2)', fg: 'var(--aw-ink-500)' },
  };

  return (
    <div style={{ padding: '28px 32px 60px', maxWidth: 1240,
      fontFamily: lang === 'th' ? 'Noto Sans Thai' : 'Inter' }}>
      <h1 style={{ margin: 0, fontFamily: 'Plus Jakarta Sans', fontSize: 28,
        fontWeight: 700, letterSpacing: -0.6 }}>{T.title}</h1>
      <p style={{ margin: '6px 0 22px', color: 'var(--aw-ink-500)', fontSize: 14 }}>{T.sub}</p>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '8px 14px', borderRadius: 999, cursor: 'pointer',
              border: '1px solid ' + (filter === f.id ? 'var(--aw-blue)' : 'var(--aw-line-strong)'),
              background: filter === f.id ? 'var(--aw-blue)' : 'var(--aw-card)',
              color: filter === f.id ? '#fff' : 'var(--aw-ink-700)',
              fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
            }}>
            {f.label}
            <span className="mono tabular" style={{
              fontSize: 11, padding: '1px 6px', borderRadius: 999,
              background: filter === f.id ? 'rgba(255,255,255,0.22)' : 'var(--aw-paper-2)',
              color: filter === f.id ? '#fff' : 'var(--aw-ink-500)',
            }}>{f.count}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
        background: 'var(--aw-card)', border: '1px solid var(--aw-line)',
        borderRadius: 10, marginBottom: 18, color: 'var(--aw-ink-500)',
      }}>
        <Ic name="search" size={16}/>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder={T.search}
          style={{ flex: 1, border: 0, outline: 0, fontSize: 14, fontFamily: 'inherit',
            background: 'transparent', color: 'var(--aw-ink-900)' }}/>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--aw-card)', border: '1px solid var(--aw-line)',
        borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ display: 'grid',
          gridTemplateColumns: '1.6fr 1.6fr 0.8fr 1fr 1fr 1.1fr',
          padding: '12px 18px', fontSize: 11, color: 'var(--aw-ink-500)',
          textTransform: 'uppercase', letterSpacing: 0.6, fontFamily: 'Inter',
          borderBottom: '1px solid var(--aw-line)', background: 'var(--aw-paper)' }}>
          <div>{T.cName}</div>
          <div>{T.cFarm}</div>
          <div className="tabular">{T.cBatches}</div>
          <div>{T.cLast}</div>
          <div className="tabular">{T.cLTV}</div>
          <div>{T.cStatus}</div>
        </div>
        {filtered.map(c => (
          <div key={c.id} onClick={() => onOpen && onOpen(c.id)} style={{
            display: 'grid', gridTemplateColumns: '1.6fr 1.6fr 0.8fr 1fr 1fr 1.1fr',
            alignItems: 'center', padding: '14px 18px', fontSize: 13.5, cursor: 'pointer',
            borderBottom: '1px solid var(--aw-line)',
          }} onMouseEnter={e => e.currentTarget.style.background = 'var(--aw-paper)'}
             onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div>
              <div style={{ fontWeight: 600 }}>{c.name}</div>
              <div style={{ fontSize: 11.5, color: 'var(--aw-ink-400)',
                fontFamily: 'IBM Plex Mono' }}>{c.id}</div>
            </div>
            <div>
              <div>{lang === 'th' ? c.farm : c.farmEn}</div>
              <div style={{ fontSize: 12, color: 'var(--aw-ink-500)' }}>{c.zone}</div>
            </div>
            <div className="mono tabular">{c.batches}</div>
            <div className="mono tabular" style={{ color: 'var(--aw-ink-700)' }}>
              {fmt.date(c.lastBuy)}
            </div>
            <div className="tabular" style={{ fontFamily: 'Plus Jakarta Sans',
              fontWeight: 600 }}>{fmt.thb(c.ltv)}</div>
            <div>
              <span style={{
                display: 'inline-block', padding: '3px 9px', borderRadius: 6,
                fontSize: 12, fontWeight: 500,
                background: statusTone[c.status].bg, color: statusTone[c.status].fg,
              }}>{statusLabel(c.status)}</span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--aw-ink-400)',
            fontSize: 14 }}>
            {lang === 'th' ? 'ไม่พบลูกค้าที่ตรงกับเงื่อนไข' : 'No customers match.'}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Buttons ─────────────────────────────────────────
const btnPrimary = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '10px 16px', borderRadius: 8, border: 0, cursor: 'pointer',
  background: 'var(--aw-blue)', color: '#fff',
  fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600,
  boxShadow: '0 1px 0 rgba(0,0,0,0.05)',
};
const btnSecondary = {
  ...btnPrimary, background: 'var(--aw-card)', color: 'var(--aw-ink-700)',
  border: '1px solid var(--aw-line-strong)',
};

// ─── Main webapp shell ──────────────────────────────
function HatcheryApp({ lang, setLang, initialPage = 'dashboard' }) {
  const [page, setPage] = useState(initialPage);
  const [customerId, setCustomerId] = useState(null);
  const goCustomer = (id) => { setCustomerId(id || 'C001'); setPage('customer-detail'); };
  return (
    <div style={{
      width: '100%', height: '100%', minHeight: 800,
      display: 'flex', flexDirection: 'column',
      background: 'var(--aw-paper)',
    }}>
      <TopBar lang={lang} setLang={setLang} hatchery={HATCHERY}/>
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <SideNav active={page.startsWith('customer') ? 'customers' : page === 'batch-detail' ? 'batches' : page} onNav={setPage} lang={lang}/>
        <main style={{ flex: 1, overflow: 'auto' }}>
          {page === 'dashboard' && <Dashboard lang={lang} onOpenCustomer={(id) => id ? goCustomer(id) : setPage('customers')}/>}
          {page === 'customers' && <CustomerList lang={lang} onOpen={goCustomer}/>}
          {page === 'customer-detail' && <window.CustomerDetail lang={lang} customerId={customerId} onBack={() => setPage('customers')}/>}
          {page === 'batches' && <window.BatchDetail lang={lang} onBack={() => setPage('dashboard')}/>}
          {page === 'batch-register' && <window.BatchRegister lang={lang} onBack={() => setPage('batches')}/>}
          {page === 'batch-detail' && <window.BatchDetail lang={lang} onBack={() => setPage('batches')}/>}
          {page === 'restock' && <window.RestockPredictor lang={lang} onBack={() => setPage('dashboard')}/>}
          {page === 'alerts' && <window.DiseaseAlert lang={lang} onBack={() => setPage('dashboard')}/>}
          {page === 'scorecard' && <window.PublicScorecard lang={lang}/>}
          {page === 'settings' && <window.Settings lang={lang}/>}
          {page === 'onboarding' && <window.OnboardingWizard lang={lang}/>}
        </main>
      </div>
    </div>
  );
}

window.HatcheryApp = HatcheryApp;
