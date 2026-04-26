'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'var(--color-canvas)',
      }}
    >
      <div
        className="aw3-card"
        style={{ padding: 36, maxWidth: 480, textAlign: 'center' }}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>
          เกิดข้อผิดพลาด
        </h2>
        <div
          style={{
            fontSize: 14,
            color: 'var(--color-ink-3)',
            marginTop: 8,
            marginBottom: 24,
          }}
        >
          {error.message || 'ระบบทำงานผิดพลาด ลองใหม่อีกครั้ง'}
        </div>
        <button
          type="button"
          className="aw3-btn aw3-btn-hero"
          onClick={reset}
        >
          ลองอีกครั้ง
        </button>
      </div>
    </div>
  );
}
