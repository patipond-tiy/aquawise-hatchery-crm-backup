'use client';

import { useCallback, useSyncExternalStore } from 'react';
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

const DISMISS_PREFIX = 'aw3-banner-dismissed:';

// Tiny external store over sessionStorage so the banner can read dismissal
// state without a setState-in-effect cascade. sessionStorage means a brand-new
// tab / window / day shows the banner again.
const dismissListeners = new Set<() => void>();

function subscribeDismiss(onChange: () => void): () => void {
  dismissListeners.add(onChange);
  return () => {
    dismissListeners.delete(onChange);
  };
}

function isDismissed(dismissKey: string): boolean {
  if (typeof window === 'undefined') return true; // SSR/first paint: stay hidden
  try {
    return window.sessionStorage.getItem(dismissKey) === '1';
  } catch {
    return false; // sessionStorage may be unavailable in some privacy modes
  }
}

function markDismissed(dismissKey: string): void {
  try {
    window.sessionStorage.setItem(dismissKey, '1');
  } catch {
    /* sessionStorage may be unavailable in some privacy modes */
  }
  dismissListeners.forEach((l) => l());
}

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
      <Banner
        dismissKey={`${DISMISS_PREFIX}past_due`}
        tone="bad"
        message={t('past_due_banner')}
        ctaHref="/settings"
        cta={t('update_payment')}
      />
    );
  }

  // Trialing — sky / amber / red depending on days left
  if (status === 'trialing') {
    const days = daysLeftInTrial(sub.trialEndsAt);
    const tone = bannerToneForTrial(days);
    return (
      <Banner
        // Days bucket is part of the key so a fresh urgency level (e.g. switching
        // from sky to red as the trial winds down) re-shows even if the user
        // dismissed the earlier tone.
        dismissKey={`${DISMISS_PREFIX}trialing:${tone}`}
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
  dismissKey,
  tone,
  message,
  ctaHref,
  cta,
}: {
  dismissKey: string;
  tone: 'sky' | 'amber' | 'bad';
  message: string;
  ctaHref: '/settings';
  cta: string;
}) {
  // Hide for the rest of this browser session once the user dismisses it.
  // useSyncExternalStore keeps SSR (server snapshot = hidden, avoids flash) and
  // the live sessionStorage value in sync without a setState-in-effect cascade.
  const getSnapshot = useCallback(() => isDismissed(dismissKey), [dismissKey]);
  const getServerSnapshot = useCallback(() => true, []);
  const dismissed = useSyncExternalStore(
    subscribeDismiss,
    getSnapshot,
    getServerSnapshot
  );

  if (dismissed) return null;

  const dismiss = () => markDismissed(dismissKey);

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
        position: 'relative',
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
      <button
        type="button"
        onClick={dismiss}
        aria-label="ปิด"
        style={{
          position: 'absolute',
          right: 16,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: 'transparent',
          border: 0,
          color: TONE_FG[tone],
          cursor: 'pointer',
          fontSize: 18,
          lineHeight: 1,
          opacity: 0.65,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.65')}
      >
        ×
      </button>
    </div>
  );
}
