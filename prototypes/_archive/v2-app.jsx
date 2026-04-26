/* global React */
const { useState: _v2as } = React;

// === V2 root app ===
function V2App() {
  const [page, setPage] = _v2as('dashboard');
  const [customerId, setCustomerId] = _v2as('C001');
  const [batchId, setBatchId] = _v2as('B-2604-A');

  const D = window.AW_DATA;

  let body = null;
  if (page === 'dashboard') body = <V2Dashboard setPage={setPage}/>;
  else if (page === 'customers') body = <V2Customers setPage={setPage} setCustomerId={setCustomerId}/>;
  else if (page === 'customer') body = <V2CustomerDetail setPage={setPage} customerId={customerId}/>;
  else if (page === 'batches') body = <V2Batches setPage={setPage} setBatchId={setBatchId}/>;
  else if (page === 'batch') body = <V2BatchDetail setPage={setPage} batchId={batchId}/>;
  else if (page === 'batch-register') body = <V2BatchRegister setPage={setPage}/>;
  else if (page === 'restock') body = <V2Restock setPage={setPage} setCustomerId={setCustomerId}/>;
  else if (page === 'alerts') body = <V2Alerts setPage={setPage}/>;
  else if (page === 'scorecard') body = <V2Scorecard setPage={setPage}/>;
  else if (page === 'settings') body = <V2Settings/>;

  return (
    <div data-screen-label="AquaWise v2 webapp" style={{ minHeight: '100vh', background: 'var(--aw-bg)' }}>
      <V2TopBar page={page} setPage={(p) => { setPage(p); window.scrollTo(0, 0); }} hatcheryName={D.HATCHERY.nameEn}/>
      <main className="aw-rise" key={page}>{body}</main>
      <footer style={{
        borderTop: 'var(--hairline-2)', padding: '24px 32px',
        display: 'flex', justifyContent: 'space-between',
        fontFamily: 'var(--font-mono)', fontSize: 11,
        color: 'var(--aw-ink-3)', letterSpacing: '0.05em',
      }}>
        <span>AQUAWISE OS · v2.1 · BUILD 2604</span>
        <span>© 2026 AQUAWISE · ตรวจสอบข้อมูลได้ทั้งหมด</span>
      </footer>
    </div>
  );
}

window.V2App = V2App;

// Mount
ReactDOM.createRoot(document.getElementById('root')).render(<V2App/>);
