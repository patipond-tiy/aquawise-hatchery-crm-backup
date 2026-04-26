/* global React */
const { useState: _v3ds } = React;

// V3 Dashboard — hero card + category stat chips + continue cards + your-lesson table
function V3Dashboard({ setPage, setCustomerId, setBatchId }) {
  const D = window.AW_DATA;
  const { customers, openModal } = window.useV3();

  const STATS = [
    { tone: 'lav', icon: '⌬', label: 'ล็อตที่กำลังเลี้ยง', value: '5/8', sub: 'ลูกค้า 47 ฟาร์ม', goto: () => setPage('batches') },
    { tone: 'peach', icon: '◇', label: 'D30 อัตรารอดเฉลี่ย', value: '82%', sub: 'สูงกว่าค่ากลาง 11%', goto: () => setPage('scorecard') },
    { tone: 'mint', icon: '◈', label: 'ต้องสั่งใหม่ใน 14 วัน', value: '3 ฟาร์ม', sub: 'รวม ~620k PL', goto: () => setPage('restock') },
  ];

  const CONTINUE = customers.filter(c => c.cycleDay).slice(0, 3).map((c, i) => ({
    ...c,
    tone: ['peach', 'lav', 'sky'][i],
    chip: ['ล็อต B-2604-A', 'ล็อต B-2604-B', 'ล็อต B-2603-C'][i],
    chipTone: ['peach', 'lav', 'mint'][i],
  }));

  return (
    <div>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #004AAD 0%, #1A66C7 60%, #3D85DD 100%)',
        borderRadius: 'var(--r-xl)',
        padding: 40, position: 'relative', overflow: 'hidden',
        marginBottom: 28,
      }}>
        <svg width="100%" height="100%" viewBox="0 0 600 200" preserveAspectRatio="xMaxYMid slice"
          style={{ position: 'absolute', inset: 0, opacity: 0.6 }}>
          {[
            { x: 380, y: 50, s: 1.4 }, { x: 460, y: 110, s: 1.0 },
            { x: 540, y: 60, s: 0.7 }, { x: 420, y: 150, s: 0.5 },
            { x: 500, y: 30, s: 0.4 },
          ].map((s, i) => (
            <g key={i} transform={`translate(${s.x},${s.y}) scale(${s.s})`}>
              <path d="M0 -30 Q 6 -6, 30 0 Q 6 6, 0 30 Q -6 6, -30 0 Q -6 -6, 0 -30Z" fill="rgba(255,255,255,0.35)"/>
            </g>
          ))}
          <path d="M-20 180 Q 100 140, 220 170 T 460 175" stroke="rgba(255,255,255,0.18)" strokeWidth="2" fill="none"/>
        </svg>
        <div style={{ position: 'relative', maxWidth: 540 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 16 }}>
            ระบบจัดการโรงเพาะฟาร์ม
          </div>
          <h1 style={{ margin: 0, color: '#fff', fontSize: 38, fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.01em' }}>
            ช่วยลูกค้าเลี้ยงรอบนี้<br/>ให้รอดมากที่สุด
          </h1>
          <div style={{ display: 'flex', gap: 10, marginTop: 26 }}>
            <button onClick={() => setPage('restock')} className="aw3-btn"
              style={{ background: '#fff', color: 'var(--aw3-ink)', fontSize: 16, padding: '14px 24px' }}>
              ดูฟาร์มที่ต้องติดต่อ
              <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
            </button>
            <button onClick={() => openModal('addBatch')} className="aw3-btn"
              style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', fontSize: 16, padding: '14px 22px', backdropFilter: 'blur(4px)' }}>
              + ลงล็อตใหม่
            </button>
          </div>
        </div>
      </div>

      {/* Stat chips */}
      <V3Grid cols={3} gap={16} style={{ marginBottom: 28 }}>
        {STATS.map((s, i) => (
          <V3Card key={i} pad={20} hover onClick={s.goto} style={{ display: 'flex', alignItems: 'center', gap: 16, border: '1.5px solid var(--aw3-line-2)' }}>
            <div style={{
              width: 52, height: 52, borderRadius: 'var(--r)',
              background: `var(--aw3-${s.tone})`, color: `var(--aw3-${s.tone}-fg)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 700, flexShrink: 0,
            }}>{s.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: 'var(--aw3-ink-3)', fontWeight: 600, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.1 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--aw3-ink-4)', fontWeight: 500, marginTop: 4 }}>{s.sub}</div>
            </div>
          </V3Card>
        ))}
      </V3Grid>

      {/* Continue Watching */}
      <V3Section title="ฟาร์มที่ต้องตามต่อ" action={
        <button className="aw3-btn aw3-btn-ghost aw3-btn-sm" onClick={() => setPage('customers')}>ดูทั้งหมด</button>
      }>
        <V3Grid cols={3} gap={16}>
          {CONTINUE.map(c => (
            <V3Card key={c.id} pad={14} hover onClick={() => { setCustomerId(c.id); setPage('customer'); }}
              style={{ border: '1px solid var(--aw3-line)' }}>
              <div style={{ position: 'relative' }}>
                <V3Photo tone={c.tone} height={140} label={`วันที่ ${c.cycleDay}/120`}/>
                <button onClick={e => { e.stopPropagation(); window.useV3 && openModal('sendLine', { customer: c }); }}
                  style={{
                    position: 'absolute', top: 10, right: 10,
                    width: 30, height: 30, borderRadius: '50%',
                    background: '#fff', border: 0, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                  }}>
                  <svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="var(--aw3-ink)" strokeWidth="1.7">
                    <path d="M3 5l5-3 5 3M3 5v6l5 3 5-3V5"/>
                  </svg>
                </button>
              </div>
              <div style={{ padding: '14px 4px 4px' }}>
                <V3Chip tone={c.chipTone} size="xs" icon="✦">{c.chip}</V3Chip>
                <h3 style={{ margin: '12px 0 0', fontSize: 16, fontWeight: 700, lineHeight: 1.3 }}>{c.farm}</h3>
                <div style={{ marginTop: 10, height: 4, background: 'var(--aw3-line)', borderRadius: 'var(--r-pill)', overflow: 'hidden' }}>
                  <div style={{ width: `${(c.cycleDay/120)*100}%`, height: '100%', background: 'var(--aw3-hero)', borderRadius: 'var(--r-pill)' }}/>
                </div>
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--aw3-line)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <V3Avatar name={c.name} size={28}/>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontSize: 10.5, color: 'var(--aw3-ink-4)' }}>{c.zone}</div>
                  </div>
                </div>
              </div>
            </V3Card>
          ))}
        </V3Grid>
      </V3Section>

      {/* Recent batches */}
      <V3Section title="ล็อตล่าสุด" action={<button className="aw3-btn aw3-btn-ghost aw3-btn-sm" onClick={() => setPage('batches')}>ดูทั้งหมด</button>}>
        <V3Card pad={0} style={{ border: '1px solid var(--aw3-line)', overflow: 'hidden' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '2fr 1.4fr 1.6fr 80px',
            padding: '12px 20px', background: 'var(--aw3-soft)',
            fontSize: 11, fontWeight: 700, color: 'var(--aw3-ink-4)',
            letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            <span>ล็อต</span><span>สายพันธุ์</span><span>ผล</span><span style={{ textAlign: 'right' }}>เปิด</span>
          </div>
          {D.BATCHES.slice(0, 4).map((b, i, arr) => (
            <div key={b.id} className="aw3-row" onClick={() => { setBatchId(b.id); setPage('batch'); }}
              style={{
                display: 'grid', gridTemplateColumns: '2fr 1.4fr 1.6fr 80px',
                padding: '14px 20px', alignItems: 'center', gap: 10,
                borderBottom: i < arr.length - 1 ? '1px solid var(--aw3-line)' : 0,
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <V3Avatar name={b.id} tone={['lav','peach','mint','sky'][i % 4]} size={36}/>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{b.id}</div>
                  <div style={{ fontSize: 11, color: 'var(--aw3-ink-4)' }}>{b.date}</div>
                </div>
              </div>
              <V3Chip tone={['lav','peach','mint','sky'][i % 4]} size="xs">{b.source}</V3Chip>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <V3Chip tone={b.pcr === 'clean' ? 'good' : 'bad'} size="xs">PCR {b.pcr === 'clean' ? 'สะอาด' : 'พบเชื้อ'}</V3Chip>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--aw3-ink-2)' }}>D30 {b.meanD30}%</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <V3RoundBtn dir="right" size={30} tone="soft"/>
              </div>
            </div>
          ))}
        </V3Card>
      </V3Section>
    </div>
  );
}

// =============================================================
// Customers
// =============================================================
function V3Customers({ setPage, setCustomerId }) {
  const { customers, openModal } = window.useV3();
  const [q, setQ] = _v3ds('');
  const [filter, setFilter] = _v3ds('all');
  const filtered = customers.filter(c => {
    if (q && !(c.farm + c.name).toLowerCase().includes(q.toLowerCase())) return false;
    if (filter === 'active' && !c.cycleDay) return false;
    if (filter === 'restock' && c.restockIn == null) return false;
    if (filter === 'concern' && c.status !== 'concern' && c.status !== 'restock-now') return false;
    return true;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: '-0.01em' }}>ลูกค้า</h1>
        <button className="aw3-btn aw3-btn-hero aw3-btn-sm" onClick={() => openModal('addCustomer')}>+ เพิ่มลูกค้า</button>
      </div>
      <div style={{ color: 'var(--aw3-ink-3)', fontSize: 15, marginBottom: 24 }}>
        {customers.length} ฟาร์ม · {customers.filter(c => c.cycleDay).length} กำลังเลี้ยง
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
        <input className="aw3-input" placeholder="ค้นหาฟาร์มหรือเจ้าของ…"
          value={q} onChange={e => setQ(e.target.value)} style={{ flex: 1 }}/>
        <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--aw3-soft)', borderRadius: 'var(--r)' }}>
          {[
            { id: 'all', label: 'ทั้งหมด' },
            { id: 'active', label: 'กำลังเลี้ยง' },
            { id: 'restock', label: 'ใกล้ครบรอบ' },
            { id: 'concern', label: 'น่าห่วง' },
          ].map(t => (
            <button key={t.id} onClick={() => setFilter(t.id)} style={{
              padding: '8px 16px', border: 0, borderRadius: 'var(--r-sm)',
              background: filter === t.id ? '#fff' : 'transparent',
              color: filter === t.id ? 'var(--aw3-ink)' : 'var(--aw3-ink-3)',
              fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              boxShadow: filter === t.id ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <V3Grid cols={2} gap={14}>
        {filtered.map((c, i) => (
          <V3Card key={c.id} pad={18} hover onClick={() => { setCustomerId(c.id); setPage('customer'); }}
            style={{ border: '1px solid var(--aw3-line)', display: 'flex', alignItems: 'center', gap: 14 }}>
            <V3Avatar name={c.farm} tone={['lav','peach','mint','sky','rose','amber'][i % 6]} size={48}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 700 }}>{c.farm}</span>
                {c.status === 'restock-now' && <V3Chip tone="bad" size="xs">ติดต่อด่วน</V3Chip>}
                {c.status === 'concern' && <V3Chip tone="amber" size="xs">น่าห่วง</V3Chip>}
              </div>
              <div style={{ fontSize: 12, color: 'var(--aw3-ink-3)', marginTop: 2 }}>{c.name} · {c.zone}</div>
              <div style={{ marginTop: 10, display: 'flex', gap: 16 }}>
                <span style={{ fontSize: 12 }}><b>{c.batches}</b> รอบ</span>
                <span style={{ fontSize: 12 }}>มูลค่า ฿{(c.ltv/1000).toFixed(0)}k</span>
                {c.cycleDay && <span style={{ fontSize: 12 }}>วันที่ {c.cycleDay}</span>}
              </div>
            </div>
            <button onClick={e => { e.stopPropagation(); openModal('sendLine', { customer: c }); }}
              style={{ background: 'transparent', border: 0, padding: 8, cursor: 'pointer', color: 'var(--aw3-hero)' }}>
              <svg width={18} height={18} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M3 5l5-3 5 3M3 5v6l5 3 5-3V5"/></svg>
            </button>
          </V3Card>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: 60, textAlign: 'center', color: 'var(--aw3-ink-4)' }}>
            ไม่พบลูกค้าที่ตรงกับการค้นหา
          </div>
        )}
      </V3Grid>
    </div>
  );
}

// =============================================================
// Customer Detail
// =============================================================
function V3CustomerDetail({ setPage, customerId }) {
  const { customers, openModal } = window.useV3();
  const c = customers.find(x => x.id === customerId) || customers[0];
  const trend = c.d30 ? [
    Math.max(40, c.d30 - 12), Math.max(40, c.d30 - 8), Math.max(40, c.d30 - 4),
    c.d30 - 2, c.d30 - 1, c.d30
  ] : [60, 65, 68, 70, 75, 80];
  const HISTORY = [
    { batch: 'B-2604-A', date: '2026-04-22', pl: 320, d30: c.d30 || 82, status: c.cycleDay ? 'กำลังเลี้ยง' : 'จบ' },
    { batch: 'B-2511-C', date: '2025-11-18', pl: 280, d30: 78, status: 'จบ' },
    { batch: 'B-2508-B', date: '2025-08-12', pl: 250, d30: 81, status: 'จบ' },
    { batch: 'B-2505-A', date: '2025-05-04', pl: 220, d30: 73, status: 'จบ' },
  ];

  return (
    <div>
      <button onClick={() => setPage('customers')} style={{ background: 'transparent', border: 0, padding: 0, cursor: 'pointer', color: 'var(--aw3-ink-3)', marginBottom: 14, fontSize: 13 }}>← ลูกค้าทั้งหมด</button>

      <V3Card pad={28} style={{ border: '1px solid var(--aw3-line)', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
          <V3Avatar name={c.farm} size={68} tone="lav"/>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>{c.farm}</h1>
            <div style={{ fontSize: 14, color: 'var(--aw3-ink-3)', marginTop: 4 }}>{c.name} · {c.zone}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              {c.cycleDay && <V3Chip tone="sky" size="xs">วันที่ {c.cycleDay}/120</V3Chip>}
              {c.status === 'concern' && <V3Chip tone="amber" size="xs">น่าห่วง</V3Chip>}
              {c.status === 'restock-now' && <V3Chip tone="bad" size="xs">ติดต่อด่วน</V3Chip>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="aw3-btn aw3-btn-soft" onClick={() => openModal('schedule', { customer: c })}>
              <svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h10M3 6v8h10V6M3 6l3-3h4l3 3M7 10h2"/></svg>
              นัดโทร
            </button>
            <button className="aw3-btn aw3-btn-soft" onClick={() => openModal('quote', { customer: c })}>เสนอราคา</button>
            <button className="aw3-btn aw3-btn-hero" onClick={() => openModal('sendLine', { customer: c })}>
              ส่ง LINE
              <svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 8h12M9 4l5 4-5 4"/></svg>
            </button>
          </div>
        </div>
      </V3Card>

      <V3Grid cols={4} gap={14} style={{ marginBottom: 20 }}>
        {[
          { label: 'รอบทั้งหมด', value: c.batches, tone: 'lav' },
          { label: 'มูลค่าตลอดอายุ', value: `฿${(c.ltv/1000).toFixed(0)}k`, tone: 'peach' },
          { label: 'D30 รอบล่าสุด', value: c.d30 ? `${c.d30}%` : '—', tone: c.d30 >= 80 ? 'good' : c.d30 < 70 ? 'bad' : 'amber' },
          { label: 'รอบใหม่ใน', value: c.restockIn != null ? `${c.restockIn} วัน` : '—', tone: 'sky' },
        ].map((s, i) => (
          <V3Card key={i} pad={18} style={{ border: '1px solid var(--aw3-line)' }}>
            <V3Chip tone={s.tone} size="xs">{s.label}</V3Chip>
            <div style={{ fontSize: 28, fontWeight: 800, marginTop: 10, letterSpacing: '-0.02em' }}>{s.value}</div>
          </V3Card>
        ))}
      </V3Grid>

      <V3Grid cols={12} gap={20}>
        <V3Col span={7}>
          <V3Card pad={22} style={{ border: '1px solid var(--aw3-line)' }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>แนวโน้ม D30 ตลอด 6 รอบ</h3>
            <div style={{ fontSize: 12, color: 'var(--aw3-ink-3)', marginTop: 4, marginBottom: 18 }}>เลื่อนเมาส์ดูค่าแต่ละรอบ</div>
            <window.V3Sparkline values={trend} height={90}/>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11, color: 'var(--aw3-ink-4)', fontWeight: 600 }}>
              {HISTORY.slice().reverse().slice(0, 6).map((h, i) => <span key={i}>{h.batch.slice(2,6)}</span>)}
            </div>
          </V3Card>
        </V3Col>
        <V3Col span={5}>
          <V3Card pad={22} style={{ border: '1px solid var(--aw3-line)', height: '100%' }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>ติดต่อ</h3>
            <div style={{ marginTop: 14 }}>
              {[
                { ic: '📞', label: 'เบอร์โทร', v: '081-234-5678' },
                { ic: '💬', label: 'LINE ID', v: '@somchaisuanban' },
                { ic: '📍', label: 'ที่อยู่', v: '45 ม.3 ต.บ้านบ่อ ' + c.zone },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderTop: i > 0 ? '1px solid var(--aw3-line)' : 0 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 'var(--r-sm)', background: 'var(--aw3-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{r.ic}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: 'var(--aw3-ink-4)', fontWeight: 600 }}>{r.label}</div>
                    <div style={{ fontSize: 13.5, fontWeight: 700 }}>{r.v}</div>
                  </div>
                </div>
              ))}
            </div>
          </V3Card>
        </V3Col>
      </V3Grid>

      <V3Section title="ประวัติรอบเลี้ยง" style={{ marginTop: 28 }}>
        <V3Card pad={0} style={{ border: '1px solid var(--aw3-line)', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr 1fr', padding: '12px 20px', background: 'var(--aw3-soft)', fontSize: 11, fontWeight: 700, color: 'var(--aw3-ink-4)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            <span>ล็อต</span><span>วันที่</span><span>ปริมาณ</span><span>D30</span><span>สถานะ</span>
          </div>
          {HISTORY.map((h, i) => (
            <div key={h.batch} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr 1fr', padding: '14px 20px', alignItems: 'center', borderBottom: i < HISTORY.length - 1 ? '1px solid var(--aw3-line)' : 0, fontSize: 13.5 }}>
              <span style={{ fontWeight: 700 }}>{h.batch}</span>
              <span style={{ color: 'var(--aw3-ink-3)' }}>{h.date}</span>
              <span style={{ fontWeight: 600 }}>{h.pl}k PL</span>
              <span style={{ fontWeight: 700, color: h.d30 >= 80 ? 'var(--aw3-good)' : h.d30 < 70 ? 'var(--aw3-bad)' : 'var(--aw3-ink)' }}>{h.d30}%</span>
              <V3Chip tone={h.status === 'จบ' ? 'soft' : 'sky'} size="xs">{h.status}</V3Chip>
            </div>
          ))}
        </V3Card>
      </V3Section>
    </div>
  );
}

// =============================================================
// Batches list
// =============================================================
function V3Batches({ setPage, setBatchId }) {
  const { batches, openModal } = window.useV3();
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>ล็อตลูกกุ้ง</h1>
        <button className="aw3-btn aw3-btn-hero aw3-btn-sm" onClick={() => openModal('addBatch')}>+ ลงทะเบียนล็อตใหม่</button>
      </div>
      <V3Grid cols={2} gap={14}>
        {batches.map((b, i) => (
          <V3Card key={b.id} pad={18} hover onClick={() => { setBatchId(b.id); setPage('batch'); }}
            style={{ border: '1px solid var(--aw3-line)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <V3Avatar name={b.id} tone={['lav','peach','mint','sky','rose'][i % 5]} size={42}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{b.id}</div>
                <div style={{ fontSize: 11, color: 'var(--aw3-ink-4)' }}>{b.date} · {b.source}</div>
              </div>
              <V3Chip tone={b.pcr === 'clean' ? 'good' : 'bad'} size="xs">{b.pcr === 'clean' ? '✓ สะอาด' : '⚠ พบเชื้อ'}</V3Chip>
            </div>
            <V3Grid cols={3} gap={10}>
              <div><div style={{ fontSize: 10.5, color: 'var(--aw3-ink-4)', fontWeight: 600 }}>ผลิต</div><div style={{ fontSize: 16, fontWeight: 700 }}>{(b.plProduced/1000000).toFixed(1)}M</div></div>
              <div><div style={{ fontSize: 10.5, color: 'var(--aw3-ink-4)', fontWeight: 600 }}>ฟาร์ม</div><div style={{ fontSize: 16, fontWeight: 700 }}>{b.farms}</div></div>
              <div><div style={{ fontSize: 10.5, color: 'var(--aw3-ink-4)', fontWeight: 600 }}>D30 เฉลี่ย</div><div style={{ fontSize: 16, fontWeight: 700, color: b.meanD30 >= 80 ? 'var(--aw3-good)' : b.meanD30 < 70 ? 'var(--aw3-bad)' : 'var(--aw3-ink)' }}>{b.meanD30 || '—'}%</div></div>
            </V3Grid>
          </V3Card>
        ))}
      </V3Grid>
    </div>
  );
}

window.V3Dashboard = V3Dashboard;
window.V3Customers = V3Customers;
window.V3CustomerDetail = V3CustomerDetail;
window.V3Batches = V3Batches;
