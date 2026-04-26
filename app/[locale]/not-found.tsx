import { Link } from '@/i18n/navigation';

export default function NotFound() {
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
        style={{ padding: 36, maxWidth: 420, textAlign: 'center' }}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }}>🐚</div>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>
          ไม่พบหน้านี้
        </h2>
        <div
          style={{
            fontSize: 14,
            color: 'var(--color-ink-3)',
            marginTop: 8,
            marginBottom: 24,
          }}
        >
          ลิงก์อาจเสียหรือถูกย้ายไปแล้ว
        </div>
        <Link
          href="/"
          className="aw3-btn aw3-btn-hero"
          style={{ display: 'inline-flex' }}
        >
          กลับหน้าหลัก
        </Link>
      </div>
    </div>
  );
}
