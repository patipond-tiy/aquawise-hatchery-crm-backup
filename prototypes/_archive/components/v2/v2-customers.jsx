/* global React */
const { useState: _v2cs } = React;

// === V2.1 Customers list — Thai operator tool ===
function V2Customers({ setPage, setCustomerId }) {
  const D = window.AW_DATA;
  const [filter, setFilter] = _v2cs('all');
  const [sort, setSort] = _v2cs('restock');
  const [search, setSearch] = _v2cs('');

  const filtered = D.CUSTOMERS.filter(c => {
    if (filter === 'restock' && c.status !== 'restock-now' && c.status !== 'restock-soon') return false;
    if (filter === 'concern' && c.status !== 'concern') return false;
    if (filter === 'quiet' && c.status !== 'quiet') return false;
    if (filter === 'active' && (c.status === 'quiet' || c.status === 'concern')) return false;
    if (search && !c.farm.includes(search) && !c.name.includes(search) && !c.id.includes(search.toUpperCase())) return false;
    return true;
  }).sort((a, b) => {
    if (sort === 'restock') return (a.restockIn ?? 999) - (b.restockIn ?? 999);
    if (sort === 'ltv') return b.ltv - a.ltv;
    if (sort === 'name') return a.farm.localeCompare(b.farm, 'th');
    if (sort === 'lastBuy') return new Date(b.lastBuy) - new Date(a.lastBuy);
    return 0;
  });

  const counts = {
    all: D.CUSTOMERS.length,
    active: D.CUSTOMERS.filter(c => c.status !== 'quiet' && c.status !== 'concern').length,
    restock: D.CUSTOMERS.filter(c => c.status === 'restock-now' || c.status === 'restock-soon').length,
    concern: D.CUSTOMERS.filter(c => c.status === 'concern').length,
    quiet: D.CUSTOMERS.filter(c => c.status === 'quiet').length,
  };

  return (
    <div style={{ padding: 24, maxWidth: 1440, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>ลูกค้า</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="aw-btn aw-btn-ghost aw-btn-sm">ส่งออก CSV</button>
          <button className="aw-btn aw-btn-blue aw-btn-sm">+ เพิ่มลูกค้าใหม่</button>
        </div>
      </div>
      <div className="label" style={{ marginBottom: 20 }}>
        ทั้งหมด {counts.all} ราย · มูลค่าตลอดอายุ ฿{(D.CUSTOMERS.reduce((s,c)=>s+c.ltv,0)/1000000).toFixed(1)}M
      </div>

      {/* Filter tabs + search */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: 'var(--hairline)', paddingBottom: 0, marginBottom: 0,
      }}>
        <div style={{ display: 'flex', gap: 0 }}>
          {[
            { id: 'all', label: 'ทั้งหมด' },
            { id: 'active', label: 'ใช้งานอยู่' },
            { id: 'restock', label: 'ใกล้สั่งใหม่' },
            { id: 'concern', label: 'ต้องดูแล' },
            { id: 'quiet', label: 'หายไปนาน' },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              border: 0, background: 'transparent',
              borderBottom: filter === f.id ? '2px solid var(--aw-ink)' : '2px solid transparent',
              padding: '12px 16px',
              fontFamily: 'var(--font-thai)', fontSize: 14, fontWeight: filter === f.id ? 600 : 500,
              color: filter === f.id ? 'var(--aw-ink)' : 'var(--aw-ink-3)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span>{f.label}</span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--aw-ink-4)' }}>{counts[f.id]}</span>
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อฟาร์ม / ผู้ติดต่อ / ID"
            style={{
              border: 0, borderBottom: '1px solid var(--aw-line-2)',
              padding: '6px 4px', fontSize: 13, width: 200,
              fontFamily: 'var(--font-thai)', background: 'transparent', outline: 'none',
            }}/>
          <select value={sort} onChange={e => setSort(e.target.value)} style={{
            border: 0, background: 'transparent', fontFamily: 'var(--font-thai)',
            fontSize: 13, fontWeight: 500, cursor: 'pointer', color: 'var(--aw-ink-2)',
          }}>
            <option value="restock">เรียง: ใกล้สั่งใหม่</option>
            <option value="ltv">เรียง: มูลค่าสูงสุด</option>
            <option value="name">เรียง: ชื่อฟาร์ม</option>
            <option value="lastBuy">เรียง: ซื้อล่าสุด</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--aw-card)', border: '1px solid var(--aw-line-2)', borderTop: 0 }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '60px 2fr 100px 90px 80px 90px 110px 60px',
          padding: '10px 14px', borderBottom: 'var(--hairline-2)',
          background: 'var(--aw-bg-2)',
        }}>
          {['ID', 'ฟาร์ม / ผู้ติดต่อ', 'จังหวัด', 'รอบที่', 'D30', 'สั่งใหม่ใน', 'มูลค่า (฿)', ''].map((h, i) => (
            <span key={i} className="label-mono" style={{ textAlign: i >= 6 ? 'right' : 'left' }}>{h}</span>
          ))}
        </div>
        {filtered.map((c, i) => (
          <div key={c.id} className="aw-row" onClick={() => { setCustomerId(c.id); setPage('customer'); }}
            style={{
              display: 'grid', gridTemplateColumns: '60px 2fr 100px 90px 80px 90px 110px 60px',
              padding: '14px', alignItems: 'center', gap: 8,
              borderBottom: i < filtered.length - 1 ? 'var(--hairline-3)' : 0,
            }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--aw-ink-3)' }}>{c.id}</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{c.farm}</div>
              <div className="label" style={{ marginTop: 2 }}>{c.name} · ซื้อล่าสุด {new Date(c.lastBuy).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}</div>
            </div>
            <span style={{ fontSize: 13 }}>{c.zone}</span>
            <span className="mono" style={{ fontSize: 13 }}>
              {c.cycleDay != null ? `${c.cycleDay} วัน` : <span style={{ color: 'var(--aw-ink-4)' }}>—</span>}
            </span>
            <span className="mono" style={{ fontSize: 14, fontWeight: 600, color: c.d30 == null ? 'var(--aw-ink-4)' : c.d30 < 60 ? 'var(--aw-bad)' : c.d30 >= 80 ? 'var(--aw-good)' : 'var(--aw-ink)' }}>
              {c.d30 ?? '—'}{c.d30 && '%'}
            </span>
            <span>
              {c.restockIn === 0 ? <Pill tone="flame" size="xs">ตอนนี้</Pill>
                : c.restockIn != null && c.restockIn <= 14 ? <Pill tone="blueTint" size="xs">{c.restockIn} วัน</Pill>
                : c.restockIn != null ? <span className="mono" style={{ fontSize: 12, color: 'var(--aw-ink-3)' }}>{c.restockIn} วัน</span>
                : <Pill tone="neutral" size="xs">หายไป</Pill>}
            </span>
            <span className="mono" style={{ fontSize: 14, fontWeight: 600, textAlign: 'right' }}>
              {(c.ltv / 1000).toFixed(0)}k
            </span>
            <span style={{ textAlign: 'right', color: 'var(--aw-ink-4)' }}><Arrow/></span>
          </div>
        ))}
      </div>
      <div className="label-mono" style={{ marginTop: 12, textAlign: 'right' }}>
        แสดง {filtered.length} จาก {counts.all} ราย · อัปเดต 14 นาทีที่แล้ว
      </div>
    </div>
  );
}

// === V2.1 Customer detail ===
function V2CustomerDetail({ setPage, customerId }) {
  const D = window.AW_DATA;
  const c = D.CUSTOMERS.find(x => x.id === customerId) || D.CUSTOMERS[0];
  const cycles = [
    { id: 'CY-08', date: '2026-04', batch: 'B-2604-A', pl: 320000, d30: c.d30 ?? 84, d60: c.d60 ?? 79, status: 'active' },
    { id: 'CY-07', date: '2026-01', batch: 'B-2601-B', pl: 280000, d30: 81, d60: 76, harvest: 3.2, status: 'closed' },
    { id: 'CY-06', date: '2025-10', batch: 'B-2510-A', pl: 300000, d30: 78, d60: 71, harvest: 2.9, status: 'closed' },
    { id: 'CY-05', date: '2025-07', batch: 'B-2507-C', pl: 260000, d30: 85, d60: 80, harvest: 3.4, status: 'closed' },
    { id: 'CY-04', date: '2025-04', batch: 'B-2504-A', pl: 240000, d30: 72, d60: 65, harvest: 2.4, status: 'closed' },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1440, margin: '0 auto' }}>
      <button onClick={() => setPage('customers')} className="label-mono"
        style={{ background: 'none', border: 0, padding: 0, marginBottom: 16, cursor: 'pointer', color: 'var(--aw-ink-3)' }}>
        <Arrow dir="left"/> กลับไปรายชื่อลูกค้า
      </button>

      <Grid cols={12} gap={20} style={{ marginBottom: 20 }}>
        <Col span={8}>
          <div className="label-mono" style={{ marginBottom: 4 }}>{c.id} · {c.zone}</div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>{c.farm}</h1>
          <div className="label" style={{ marginTop: 6, fontSize: 14 }}>
            ผู้ติดต่อ <strong style={{ color: 'var(--aw-ink)' }}>{c.name}</strong> · ลูกค้ามา {c.batches} รอบ ตั้งแต่ปี 2565 · เชื่อมต่อ LINE OA แล้ว
          </div>
        </Col>
        <Col span={4} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button className="aw-btn aw-btn-blue" style={{ justifyContent: 'space-between' }}>ส่งข้อความ LINE <Arrow/></button>
          <button className="aw-btn aw-btn-ghost" style={{ justifyContent: 'space-between' }}>ใบเสนอราคาล็อตหน้า <Arrow/></button>
          <button className="aw-btn aw-btn-ghost" style={{ justifyContent: 'space-between' }}>โทร 081-234-5678 <Arrow/></button>
        </Col>
      </Grid>

      <Grid cols={12} gap={1} style={{ background: 'var(--aw-line-2)', border: '1px solid var(--aw-line-2)', marginBottom: 24 }}>
        {[
          { label: 'มูลค่าตลอดอายุ', value: (c.ltv/1000).toFixed(0), unit: 'k฿' },
          { label: 'จำนวนรอบ', value: c.batches, unit: 'รอบ' },
          { label: 'รอบปัจจุบัน', value: c.cycleDay ?? '—', unit: c.cycleDay ? 'วัน' : '', accent: c.cycleDay ? 'var(--aw-blue)' : null },
          { label: 'D30 / D60 ล่าสุด', value: `${c.d30 ?? '—'} / ${c.d60 ?? '—'}`, unit: '%' },
          { label: 'รอบเฉลี่ย', value: '108', unit: 'วัน' },
          { label: 'สั่งใหม่ใน', value: c.restockIn ?? '—', unit: c.restockIn != null ? 'วัน' : '', accent: c.restockIn === 0 ? 'var(--aw-flame)' : null },
        ].map((s, i) => (
          <div key={i} style={{ gridColumn: 'span 2', background: 'var(--aw-card)', padding: 14 }}>
            <Stat {...s} big/>
          </div>
        ))}
      </Grid>

      <Section title="คาดการณ์รอบถัดไป" meta="ความน่าเชื่อถือ 78%">
        <Card pad={20} style={{
          background: c.restockIn === 0 ? 'var(--aw-flame)' : c.restockIn != null && c.restockIn <= 14 ? 'var(--aw-warn-tint)' : 'var(--aw-card)',
          color: c.restockIn === 0 ? '#fff' : 'var(--aw-ink)',
          borderColor: c.restockIn === 0 ? 'var(--aw-flame)' : c.restockIn != null && c.restockIn <= 14 ? 'var(--aw-warn)' : 'var(--aw-line-2)',
        }}>
          <Grid cols={12} gap={20}>
            <Col span={7}>
              <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.3 }}>
                {c.expectedHarvest ? `จับขายประมาณ ${new Date(c.expectedHarvest).toLocaleDateString('th-TH', { day: 'numeric', month: 'long' })} → สั่งรอบใหม่ประมาณ ${c.restockIn === 0 ? 'สัปดาห์นี้' : 'หลังจากนั้น 7-10 วัน'}` : 'เงียบ — ยังไม่มีรอบใหม่'}
              </div>
              <div style={{ marginTop: 12, fontSize: 13, lineHeight: 1.6, opacity: 0.92 }}>
                คำนวณจากวันที่ปัจจุบัน {c.cycleDay ?? '—'}, รอบเฉลี่ย 108 วัน, และพฤติกรรมสั่งซ้ำ {c.batches} รอบที่ผ่านมา
              </div>
            </Col>
            <Col span={5} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div className="label-mono" style={{ opacity: 0.7 }}>สั่งครั้งล่าสุด</div>
                <div className="mono" style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>103 <span style={{ fontSize: 12, opacity: 0.7 }}>วันก่อน</span></div>
              </div>
              <div>
                <div className="label-mono" style={{ opacity: 0.7 }}>เฉลี่ย 5 รอบ</div>
                <div className="mono" style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>98 <span style={{ fontSize: 12, opacity: 0.7 }}>วัน</span></div>
              </div>
            </Col>
          </Grid>
        </Card>
      </Section>

      <Section title="ประวัติทุกรอบ" meta={`${cycles.length} CYCLES`}>
        <div style={{ background: 'var(--aw-card)', border: '1px solid var(--aw-line-2)' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '80px 100px 140px 100px 80px 80px 100px 100px',
            padding: '10px 14px', borderBottom: 'var(--hairline-2)', background: 'var(--aw-bg-2)',
          }}>
            {['รอบ', 'เริ่ม', 'จากล็อต', 'PL', 'D30', 'D60', 'จับได้', 'สถานะ'].map(h => <span key={h} className="label-mono">{h}</span>)}
          </div>
          {cycles.map((cy, i) => (
            <div key={cy.id} style={{
              display: 'grid', gridTemplateColumns: '80px 100px 140px 100px 80px 80px 100px 100px',
              padding: '14px', alignItems: 'center', gap: 8,
              borderBottom: i < cycles.length - 1 ? 'var(--hairline-3)' : 0,
              background: i === 0 ? 'var(--aw-blue-tint)' : 'transparent',
            }}>
              <span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>{cy.id}</span>
              <span className="mono" style={{ fontSize: 12 }}>{cy.date}</span>
              <span className="mono" style={{ fontSize: 12 }}>{cy.batch}</span>
              <span className="mono" style={{ fontSize: 13 }}>{(cy.pl/1000).toFixed(0)}k</span>
              <span className="mono" style={{ fontSize: 13, fontWeight: 600 }}>{cy.d30}%</span>
              <span className="mono" style={{ fontSize: 13, fontWeight: 600 }}>{cy.d60}%</span>
              <span className="mono" style={{ fontSize: 13 }}>{cy.harvest ? `${cy.harvest} ตัน` : '—'}</span>
              <span>{cy.status === 'active' ? <Pill tone="blue" size="xs">กำลังเลี้ยง</Pill> : <Pill tone="neutral" size="xs">ปิดรอบ</Pill>}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

window.V2Customers = V2Customers;
window.V2CustomerDetail = V2CustomerDetail;
