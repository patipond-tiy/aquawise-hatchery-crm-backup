'use client';

import { useEffect, useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { getSubscription } from '@/lib/api';
import {
  createCheckoutSession,
  createPortalSession,
  fetchInvoiceHistory,
} from './billing/actions';
import { daysLeftInTrial, effectiveStatus } from '@/lib/billing/trial';
import { PRO_AMOUNT_THB } from '@/lib/stripe/config';
import { V3Card } from '@/components/aw/v3-card';
import { V3Grid, V3Col } from '@/components/aw/v3-grid';

export function Billing() {
  const t = useTranslations('billing');
  const search = useSearchParams();

  // One-shot toast on Checkout return
  useEffect(() => {
    if (search.get('checkout') === 'success') toast.success(t('checkout_success'));
    if (search.get('checkout') === 'cancel') toast.message(t('checkout_canceled'));
  }, [search, t]);

  const { data: sub } = useQuery({
    queryKey: ['subscription'],
    queryFn: getSubscription,
  });
  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices'],
    queryFn: fetchInvoiceHistory,
  });

  if (!sub) return null;
  const status = effectiveStatus(sub.status, sub.trialEndsAt);
  const features = t('pro_features').split('|');

  return (
    <V3Grid cols={12} gap={16}>
      <V3Col span={7}>
        {(status === 'trialing' || status === 'trial_expired') && (
          <SubscribeCard
            status={status}
            daysLeft={daysLeftInTrial(sub.trialEndsAt)}
            trialEndsAt={sub.trialEndsAt}
            features={features}
          />
        )}
        {status === 'active' && <ActiveCard sub={sub} />}
        {status === 'past_due' && <PastDueCard sub={sub} />}
        {status === 'canceled' && (
          <SubscribeCard status="trial_expired" daysLeft={0} trialEndsAt={null} features={features} />
        )}
      </V3Col>
      <V3Col span={5}>
        <V3Card pad={22} style={{ border: '1px solid var(--color-line)' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{t('payment_history')}</h3>
          {invoices.length === 0 ? (
            <div
              style={{
                fontSize: 13,
                color: 'var(--color-ink-4)',
                marginTop: 14,
                paddingTop: 14,
                borderTop: '1px solid var(--color-line)',
                textAlign: 'center',
              }}
            >
              {t('no_invoices')}
            </div>
          ) : (
            invoices.map((inv, i) => (
              <div
                key={inv.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 0',
                  borderTop: '1px solid var(--color-line)',
                  marginTop: i === 0 ? 14 : 0,
                  fontSize: 13,
                }}
              >
                <span style={{ color: 'var(--color-ink-3)' }}>
                  {inv.paidAt
                    ? new Date(inv.paidAt).toLocaleDateString()
                    : '—'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 700 }}>
                    ฿{inv.amount.toLocaleString()}
                  </span>
                  {inv.pdfUrl && (
                    <a
                      href={inv.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontSize: 11,
                        color: 'var(--color-hero)',
                        textDecoration: 'none',
                        fontWeight: 600,
                      }}
                    >
                      PDF
                    </a>
                  )}
                </span>
              </div>
            ))
          )}
        </V3Card>
      </V3Col>
    </V3Grid>
  );
}

function SubscribeCard({
  status,
  daysLeft,
  trialEndsAt,
  features,
}: {
  status: 'trialing' | 'trial_expired';
  daysLeft: number;
  trialEndsAt: string | null;
  features: string[];
}) {
  const t = useTranslations('billing');
  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  const subscribe = () => {
    setLoading(true);
    startTransition(async () => {
      const result = await createCheckoutSession();
      if (!result.ok) {
        toast.error(result.error);
        setLoading(false);
        return;
      }
      window.location.href = result.data.url;
    });
  };

  const isTrial = status === 'trialing';

  return (
    <V3Card
      pad={28}
      style={{
        border: '1px solid var(--color-line)',
        background: 'linear-gradient(135deg, #004AAD 0%, #1A66C7 100%)',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.85)' }}>
        {isTrial ? t('free_trial_label') : t('current_plan')}
      </div>
      <h2
        style={{
          margin: '8px 0 0',
          fontSize: 32,
          fontWeight: 800,
          letterSpacing: '-0.01em',
        }}
      >
        Pro
      </h2>
      <div style={{ fontSize: 14, opacity: 0.9, marginTop: 4 }}>
        {PRO_AMOUNT_THB.toLocaleString()} ฿ / {t('per_month')}
        {isTrial && trialEndsAt
          ? ' · ' +
            t('trial_until', {
              date: new Date(trialEndsAt).toLocaleDateString(),
            })
          : ''}
      </div>

      {isTrial && (
        <div
          style={{
            marginTop: 14,
            display: 'inline-block',
            padding: '4px 12px',
            background: 'rgba(255,255,255,0.18)',
            borderRadius: 'var(--radius-pill)',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {t('trial_days_left', { days: Math.max(0, daysLeft) })}
        </div>
      )}

      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: '20px 0 0',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 6,
          fontSize: 13,
        }}
      >
        {features.map((f) => (
          <li key={f} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ opacity: 0.85 }}>✓</span>
            {f}
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="aw3-btn"
        onClick={subscribe}
        disabled={pending || loading}
        style={{
          background: '#fff',
          color: 'var(--color-hero)',
          marginTop: 24,
        }}
      >
        {loading ? t('preparing_checkout') : t('subscribe_cta')}
      </button>
    </V3Card>
  );
}

function ActiveCard({ sub }: { sub: import('@/lib/types').Subscription }) {
  const t = useTranslations('billing');
  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  const manage = () => {
    setLoading(true);
    startTransition(async () => {
      const result = await createPortalSession();
      if (!result.ok) {
        toast.error(result.error);
        setLoading(false);
        return;
      }
      window.location.href = result.data.url;
    });
  };

  return (
    <V3Card
      pad={28}
      style={{
        border: '1px solid var(--color-line)',
        background: 'linear-gradient(135deg, #004AAD 0%, #1A66C7 100%)',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.85)' }}>
        {t('current_plan')}
      </div>
      <h2
        style={{
          margin: '8px 0 0',
          fontSize: 32,
          fontWeight: 800,
          letterSpacing: '-0.01em',
        }}
      >
        Pro
      </h2>
      <div style={{ fontSize: 14, opacity: 0.9, marginTop: 4 }}>
        {PRO_AMOUNT_THB.toLocaleString()} ฿ / {t('per_month')}
      </div>
      {sub.cancelAtPeriodEnd && sub.currentPeriodEnd ? (
        <div
          style={{
            marginTop: 14,
            display: 'inline-block',
            padding: '4px 12px',
            background: 'rgba(255,200,200,0.25)',
            borderRadius: 'var(--radius-pill)',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {t('canceled_until', {
            date: new Date(sub.currentPeriodEnd).toLocaleDateString(),
          })}
        </div>
      ) : (
        sub.currentPeriodEnd && (
          <div style={{ marginTop: 8, fontSize: 12.5, opacity: 0.85 }}>
            {t('next_renewal', {
              date: new Date(sub.currentPeriodEnd).toLocaleDateString(),
            })}
          </div>
        )
      )}

      <button
        type="button"
        className="aw3-btn"
        onClick={manage}
        disabled={pending || loading}
        style={{
          background: '#fff',
          color: 'var(--color-hero)',
          marginTop: 24,
        }}
      >
        {loading ? t('preparing_checkout') : t('manage_cta')}
      </button>
    </V3Card>
  );
}

function PastDueCard({ sub }: { sub: import('@/lib/types').Subscription }) {
  const t = useTranslations('billing');
  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  const manage = () => {
    setLoading(true);
    startTransition(async () => {
      const result = await createPortalSession();
      if (!result.ok) {
        toast.error(result.error);
        setLoading(false);
        return;
      }
      window.location.href = result.data.url;
    });
  };

  return (
    <V3Card
      pad={28}
      style={{
        border: '1.5px solid var(--color-bad)',
        background: 'var(--color-bad-tint)',
        color: 'var(--color-bad)',
      }}
    >
      <div className="eyebrow">{t('current_plan')} · Pro</div>
      <h2 style={{ margin: '8px 0 0', fontSize: 22, fontWeight: 800 }}>
        {t('past_due_banner')}
      </h2>
      {sub.currentPeriodEnd && (
        <div style={{ marginTop: 6, fontSize: 13, opacity: 0.9 }}>
          {t('next_renewal', {
            date: new Date(sub.currentPeriodEnd).toLocaleDateString(),
          })}
        </div>
      )}
      <button
        type="button"
        className="aw3-btn aw3-btn-hero"
        onClick={manage}
        disabled={pending || loading}
        style={{ marginTop: 22 }}
      >
        {loading ? t('preparing_checkout') : t('update_payment')}
      </button>
    </V3Card>
  );
}
