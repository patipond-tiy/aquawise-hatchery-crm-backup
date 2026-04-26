/* global React */
const { useState: _v2sh } = React;

function V2TopBar({ page, setPage, hatcheryName }) {
  const NAV = [
    { id: 'dashboard', label: 'หน้าหลัก' },
    { id: 'customers', label: 'ลูกค้า' },
    { id: 'batches', label: 'ล็อตลูกกุ้ง' },
    { id: 'restock', label: 'รอบใหม่' },
    { id: 'alerts', label: 'แจ้งเตือนโรค' },
    { id: 'scorecard', label: 'คะแนนสาธารณะ' },
    { id: 'settings', label: 'ตั้งค่า' },
  ];

  return (
    <header style={{
      borderBottom: 'var(--hairline)',
      background: 'var(--aw-card)',
      position: 'sticky', top: 0, zIndex: 30,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 24px', gap: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AWMark size={22} color="var(--aw-blue)"/>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, lineHeight: 1 }}>AquaWise</div>
              <div className="label-mono" style={{ fontSize: 9, marginTop: 2 }}>{hatcheryName}</div>
            </div>
          </div>
          <nav style={{ display: 'flex', gap: 2 }}>
            {NAV.map(n => (
              <button key={n.id} onClick={() => { setPage(n.id); window.scrollTo(0, 0); }}
                style={{
                  background: page === n.id ? 'var(--aw-ink)' : 'transparent',
                  color: page === n.id ? '#fff' : 'var(--aw-ink-2)',
                  border: 0, padding: '8px 12px',
                  fontFamily: 'var(--font-thai)', fontSize: 14, fontWeight: 500,
                  cursor: 'pointer',
                }}>
                {n.label}
              </button>
            ))}
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <LiveDot/>
            <span className="label">ออนไลน์ · ซิงก์ 14 นาทีที่แล้ว</span>
          </div>
          <button className="aw-btn aw-btn-ghost aw-btn-sm">ค้นหา</button>
          <div style={{
            width: 32, height: 32, background: 'var(--aw-blue)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 13,
          }}>ฟ</div>
        </div>
      </div>
    </header>
  );
}

window.V2TopBar = V2TopBar;
