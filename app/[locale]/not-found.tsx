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
        <div
          aria-hidden="true"
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: 12,
            color: 'var(--color-ink-4)',
          }}
        >
          {/* Conformance §1: inline SVG, stroke 1.8px, round caps/joins,
              fill:none — no emoji on a professional surface. */}
          <svg
            width={56}
            height={56}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="16" y1="16" x2="21" y2="21" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </div>
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
