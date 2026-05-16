import Link from 'next/link';
import { V3Mark } from '@/components/aw/v3-mark';

/**
 * English-version placeholder. The Thai version is the live product;
 * EN visitors land here until we localize the rest of the copy.
 */
export function ComingSoon() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 28,
        padding: 24,
        background: 'var(--color-canvas)',
      }}
    >
      <div
        style={{
          width: 132,
          height: 132,
          borderRadius: '50%',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 12px 32px rgba(20,19,31,0.08)',
        }}
      >
        <V3Mark size={72} radius={36} />
      </div>

      <div style={{ textAlign: 'center', maxWidth: 460 }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>
          AquaWise Nursery CRM
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: 36,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: 'var(--color-ink)',
          }}
        >
          English version coming soon
        </h1>
        <p
          style={{
            margin: '14px 0 0',
            fontSize: 15,
            lineHeight: 1.7,
            color: 'var(--color-ink-3)',
          }}
        >
          We&apos;re launching with a Thai-first experience for nursery operators in
          Thailand. The English version is on the way — until then, the full app
          is available in Thai.
        </p>
      </div>

      <Link
        href="/th"
        className="aw3-btn aw3-btn-hero"
        style={{
          padding: '14px 26px',
          fontSize: 15,
          textDecoration: 'none',
        }}
      >
        เปิดเวอร์ชันภาษาไทย →
      </Link>

      <div
        style={{
          fontSize: 12,
          color: 'var(--color-ink-4)',
          letterSpacing: '0.04em',
        }}
      >
        ขอบคุณที่สนใจครับ · Thank you for your interest
      </div>
    </div>
  );
}
