'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { getSubscription } from '@/lib/api';
import {
  bannerToneForTrial,
  daysLeftInTrial,
  effectiveStatus,
} from '@/lib/billing/trial';

const TONE_BG: Record<'sky' | 'amber' | 'bad', string> = {
  sky: 'var(--color-sky)',
  amber: 'var(--color-warn-tint)',
  bad: 'var(--color-bad-tint)',
};
const TONE_FG: Record<'sky' | 'amber' | 'bad', string> = {
  sky: 'var(--color-sky-fg)',
  amber: 'var(--color-warn)',
  bad: 'var(--color-bad)',
};

export function TrialBanner() {
  const t = useTranslations('billing');
  const { data: sub } = useQuery({
    queryKey: ['subscription'],
    queryFn: getSubscription,
  });

  if (!sub) return null;
  const status = effectiveStatus(sub.status, sub.trialEndsAt);

  // Past-due banner — bright red, prompts to update card
  if (status === 'past_due') {
    return (
      <Banner tone="bad" message={t('past_due_banner')} ctaHref="/settings" cta={t('update_payment')} />
    );
  }

  // Trialing — sky / amber / red depending on days left
  if (status === 'trialing') {
    const days = daysLeftInTrial(sub.trialEndsAt);
    const tone = bannerToneForTrial(days);
    return (
      <Banner
        tone={tone}
        message={t('trial_days_left', { days })}
        ctaHref="/settings"
        cta={t('upgrade_cta')}
      />
    );
  }

  // active / trial_expired / canceled — no banner here.
  // (BillingGate handles trial_expired by redirecting; no banner needed.)
  return null;
}

function Banner({
  tone,
  message,
  ctaHref,
  cta,
}: {
  tone: 'sky' | 'amber' | 'bad';
  message: string;
  ctaHref: '/settings';
  cta: string;
}) {
  return (
    <div
      style={{
        background: TONE_BG[tone],
        color: TONE_FG[tone],
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        fontSize: 14,
        fontWeight: 600,
        borderBottom: `1px solid ${TONE_FG[tone]}22`,
      }}
    >
      <span>{message}</span>
      <Link
        href={ctaHref}
        style={{
          background: TONE_FG[tone],
          color: '#fff',
          padding: '6px 14px',
          borderRadius: 'var(--radius-pill)',
          fontWeight: 700,
          textDecoration: 'none',
          fontSize: 13,
        }}
      >
        {cta} →
      </Link>
    </div>
  );
}
