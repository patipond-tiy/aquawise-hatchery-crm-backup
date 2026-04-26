import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { V3Mark } from '@/components/aw/v3-mark';
import { PRO_PLAN, PRO_AMOUNT_THB } from '@/lib/stripe/config';
import { TrialExpiredCta } from './trial-expired-cta';

export default async function TrialExpiredPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Body />;
}

function Body() {
  const t = useTranslations();
  const features = t('billing.pro_features').split('|');

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
        style={{
          width: '100%',
          maxWidth: 520,
          padding: 40,
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
          <V3Mark size={56} />
        </div>
        <div className="eyebrow" style={{ marginBottom: 8 }}>
          {t('app.title')}
        </div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: '-0.01em' }}>
          {t('billing.trial_expired_title')}
        </h1>
        <div
          style={{
            color: 'var(--color-ink-3)',
            fontSize: 14,
            marginTop: 10,
            marginBottom: 28,
            lineHeight: 1.6,
          }}
        >
          {t('billing.trial_expired_body')}
        </div>

        <div
          style={{
            background: 'linear-gradient(135deg, #004AAD 0%, #1A66C7 100%)',
            color: '#fff',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
            textAlign: 'left',
            marginBottom: 24,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.10em',
              opacity: 0.85,
              textTransform: 'uppercase',
            }}
          >
            {PRO_PLAN.name}
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 800,
              marginTop: 6,
              letterSpacing: '-0.01em',
            }}
          >
            {PRO_AMOUNT_THB.toLocaleString()} ฿
            <span style={{ fontSize: 14, opacity: 0.85, fontWeight: 600 }}>
              {' '}
              / {t('billing.per_month')}
            </span>
          </div>

          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: '20px 0 0',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              fontSize: 14,
            }}
          >
            {features.map((f) => (
              <li key={f} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ opacity: 0.9 }}>✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <TrialExpiredCta />

        <div
          style={{
            fontSize: 11.5,
            color: 'var(--color-ink-4)',
            marginTop: 14,
            lineHeight: 1.5,
          }}
        >
          {t('billing.cancel_anytime')}
        </div>
      </div>
    </div>
  );
}
