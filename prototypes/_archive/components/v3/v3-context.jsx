/* global React */
const { createContext: _v3cc, useContext: _v3uc, useState: _v3us, useReducer: _v3ur, useRef: _v3ur2, useEffect: _v3ue } = React;

// =============================================================
// V3 App Context — central store for state, modals, toasts
// =============================================================

const V3Ctx = _v3cc(null);
window.useV3 = () => _v3uc(V3Ctx);

function V3Provider({ children }) {
  // Live-mutable copies of the seed data so forms can actually add/edit
  const [customers, setCustomers] = _v3us(() => window.AW_DATA.CUSTOMERS.map(c => ({ ...c })));
  const [batches, setBatches] = _v3us(() => window.AW_DATA.BATCHES.map(b => ({ ...b })));
  const [alerts, setAlerts] = _v3us(() => [
    { id: 'A001', sev: 'high', title: 'พบ EHP ในล็อต B-2603-D', desc: 'ฟาร์ม 2 จาก 4 ที่ซื้อล็อตนี้รายงานอัตรารอด < 60% ที่ D30',
      batch: 'B-2603-D', date: '2 ชั่วโมงที่แล้ว', farms: ['ทองสุขฟาร์ม', 'รุ่งเรืองฟาร์ม 2'],
      action: 'ติดต่อฟาร์มที่เหลือ + ส่ง PCR ใหม่', closed: false },
    { id: 'A002', sev: 'medium', title: 'อัตรารอด D30 ของ B-2604-C ต่ำกว่าเป้า', desc: 'ค่าเฉลี่ย 76% (เป้า 80%) จาก 7 ฟาร์ม',
      batch: 'B-2604-C', date: 'เมื่อวาน', farms: ['สุขสบายฟาร์ม', 'มั่นคงฟาร์ม', '+5'],
      action: 'ตรวจสอบสภาพอากาศ + ปริมาณอาหาร', closed: false },
    { id: 'A003', sev: 'low', title: 'อุณหภูมิน้ำในเขตสมุทรสาครสูงผิดปกติ', desc: '3 วันติดต่อกัน อาจกระทบล็อตที่กำลังเลี้ยง',
      batch: null, date: '3 วันที่แล้ว', farms: ['ฟาร์มกุ้งบ้านสวน', 'มั่นคงฟาร์ม', 'ทองสุขฟาร์ม'],
      action: 'แนะนำลดอาหาร 15%', closed: false },
  ]);

  // Public scorecard state
  const [scorecard, setScorecard] = _v3us({
    public: true,
    showD30: true, showPCR: true, showRetention: true, showVolume: true, showReviews: false,
  });

  // Notification settings
  const [notifs, setNotifs] = _v3us({
    restock: true, lowD30: true, disease: true, lineReply: false, weekly: true, priceMove: true,
  });

  // Modal stack — { kind, props }
  const [modal, setModal] = _v3us(null);
  const openModal = (kind, props = {}) => setModal({ kind, props });
  const closeModal = () => setModal(null);

  // Toasts
  const [toasts, setToasts] = _v3us([]);
  const toast = (msg, kind = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  };

  const value = {
    customers, setCustomers,
    batches, setBatches,
    alerts, setAlerts,
    scorecard, setScorecard,
    notifs, setNotifs,
    modal, openModal, closeModal,
    toast,
    addCustomer: (c) => { setCustomers(arr => [{ ...c, id: 'C' + String(900 + arr.length).padStart(3,'0'), batches: 0, ltv: 0, status: 'active', cycleDay: null, d30: null, d60: null, restockIn: null }, ...arr]); toast(`เพิ่มลูกค้า "${c.farm}" แล้ว`); },
    addBatch: (b) => { setBatches(arr => [{ ...b, id: 'B-' + (2604 + arr.length).toString().slice(0,4) + '-' + 'XYZWV'[arr.length % 5], plSold: 0, farms: 0 }, ...arr]); toast(`ลงทะเบียนล็อต ${b.source} แล้ว`); },
    closeAlert: (id) => { setAlerts(arr => arr.map(a => a.id === id ? { ...a, closed: true } : a)); toast('ปิดเคสแล้ว'); },
  };

  return (
    <V3Ctx.Provider value={value}>
      {children}
      <V3ModalRoot/>
      <V3ToastRoot toasts={toasts}/>
    </V3Ctx.Provider>
  );
}

// =============================================================
// Modal root + chrome
// =============================================================
function V3ModalRoot() {
  const { modal, closeModal } = window.useV3();
  if (!modal) return null;
  const Body = window.V3Modals[modal.kind];
  return (
    <div onClick={closeModal} style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(13,12,24,0.55)', backdropFilter: 'blur(2px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, animation: 'aw3-fade 0.12s ease-out',
    }}>
      <style>{`@keyframes aw3-fade { from { opacity: 0 } to { opacity: 1 } } @keyframes aw3-slip { from { opacity: 0; transform: translateY(8px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }`}</style>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 'var(--r-xl)',
        boxShadow: '0 20px 60px rgba(13,12,24,0.25)',
        maxWidth: 560, width: '100%', maxHeight: '88vh', overflow: 'auto',
        animation: 'aw3-slip 0.16s ease-out',
      }}>
        {Body ? <Body {...modal.props} close={closeModal}/> : null}
      </div>
    </div>
  );
}

const V3ModalShell = ({ title, subtitle, children, close, footer }) => (
  <div>
    <div style={{ padding: '24px 28px 16px', borderBottom: '1px solid var(--aw3-line)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em' }}>{title}</h2>
          {subtitle && <div style={{ fontSize: 13, color: 'var(--aw3-ink-3)', marginTop: 4 }}>{subtitle}</div>}
        </div>
        <button onClick={close} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--aw3-soft)', border: 0, cursor: 'pointer', fontSize: 18, lineHeight: 1, color: 'var(--aw3-ink-3)' }}>×</button>
      </div>
    </div>
    <div style={{ padding: '20px 28px' }}>{children}</div>
    {footer && (
      <div style={{ padding: '14px 28px 20px', borderTop: '1px solid var(--aw3-line)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        {footer}
      </div>
    )}
  </div>
);
window.V3ModalShell = V3ModalShell;

// =============================================================
// Toast root
// =============================================================
function V3ToastRoot({ toasts }) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 200,
      display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: t.kind === 'error' ? 'var(--aw3-bad)' : 'var(--aw3-ink)',
          color: '#fff', padding: '14px 22px',
          borderRadius: 'var(--r)', boxShadow: '0 8px 24px rgba(13,12,24,0.18)',
          fontSize: 14, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 10,
          animation: 'aw3-slip 0.18s ease-out',
        }}>
          <svg width={18} height={18} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M3 8.5l3.5 3.5 6.5-7"/></svg>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// =============================================================
// Reusable form bits
// =============================================================
const V3Field = ({ label, hint, children }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--aw3-ink-3)', marginBottom: 6 }}>{label}</label>
    {children}
    {hint && <div style={{ fontSize: 11.5, color: 'var(--aw3-ink-4)', marginTop: 4 }}>{hint}</div>}
  </div>
);
window.V3Field = V3Field;

const V3Toggle = ({ on, onChange, size = 'md' }) => {
  const dim = size === 'sm' ? { w: 44, h: 26, k: 20 } : { w: 48, h: 28, k: 22 };
  return (
    <button onClick={() => onChange(!on)} style={{
      width: dim.w, height: dim.h, borderRadius: 'var(--r-pill)',
      background: on ? 'var(--aw3-hero)' : 'var(--aw3-line-2)',
      border: 0, cursor: 'pointer', position: 'relative', transition: 'all 0.15s',
      flexShrink: 0,
    }}>
      <span style={{
        position: 'absolute', top: 3, left: on ? dim.w - dim.k - 3 : 3,
        width: dim.k, height: dim.k, borderRadius: '50%',
        background: '#fff', transition: 'left 0.15s',
        boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
      }}/>
    </button>
  );
};
window.V3Toggle = V3Toggle;

window.V3Provider = V3Provider;
