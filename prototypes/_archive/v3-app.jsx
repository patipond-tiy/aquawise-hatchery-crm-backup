/* global React, ReactDOM */
const { useState: _v3as } = React;

function V3App() {
  const [page, setPage] = _v3as('dashboard');
  const [customerId, setCustomerId] = _v3as('C001');
  const [batchId, setBatchId] = _v3as('B-2604-A');

  let body = null;
  if (page === 'dashboard') body = <V3Dashboard setPage={setPage} setCustomerId={setCustomerId} setBatchId={setBatchId}/>;
  else if (page === 'customers') body = <V3Customers setPage={setPage} setCustomerId={setCustomerId}/>;
  else if (page === 'customer') body = <V3CustomerDetail setPage={setPage} customerId={customerId}/>;
  else if (page === 'batches') body = <V3Batches setPage={setPage} setBatchId={setBatchId}/>;
  else if (page === 'batch') body = <V3BatchDetail setPage={setPage} batchId={batchId}/>;
  else if (page === 'restock') body = <V3Restock setPage={setPage} setCustomerId={setCustomerId}/>;
  else if (page === 'alerts') body = <V3Alerts setPage={setPage} setBatchId={setBatchId}/>;
  else if (page === 'scorecard') body = <V3Scorecard/>;
  else if (page === 'settings') body = <V3Settings/>;
  else body = <V3Dashboard setPage={setPage} setCustomerId={setCustomerId} setBatchId={setBatchId}/>;

  return (
    <window.V3Provider>
      <V3Shell page={page} setPage={setPage}>{body}</V3Shell>
    </window.V3Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<V3App/>);
