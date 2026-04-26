import type { Subscription, SubscriptionStatus } from '@/lib/types';

export function daysLeftInTrial(trialEndsAt: string | null): number {
  if (!trialEndsAt) return 0;
  const ms = new Date(trialEndsAt).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

/**
 * Lazy-flip status: if the row says 'trialing' but the trial ended, treat it
 * as 'trial_expired' for read purposes. The webhook handler / billing-gate
 * will also persist the flip on first access so subsequent reads are fast.
 */
export function effectiveStatus(
  status: SubscriptionStatus,
  trialEndsAt: string | null
): SubscriptionStatus {
  if (status === 'trialing' && trialEndsAt) {
    if (Date.now() > new Date(trialEndsAt).getTime()) return 'trial_expired';
  }
  return status;
}

export function requiresPaywall(status: SubscriptionStatus): boolean {
  return status === 'trial_expired' || status === 'canceled';
}

export function isActiveOrTrialing(status: SubscriptionStatus): boolean {
  return status === 'active' || status === 'trialing' || status === 'past_due';
}

export function bannerToneForTrial(daysLeft: number): 'sky' | 'amber' | 'bad' {
  if (daysLeft <= 2) return 'bad';
  if (daysLeft <= 7) return 'amber';
  return 'sky';
}

/** Subscription read shape exposed by getSubscription(). */
export type SubscriptionView = Subscription & {
  daysLeftInTrial: number;
  effective: SubscriptionStatus;
};

export function viewFromRow(sub: Subscription): SubscriptionView {
  const daysLeft = daysLeftInTrial(sub.trialEndsAt);
  return {
    ...sub,
    daysLeftInTrial: daysLeft,
    effective: effectiveStatus(sub.status, sub.trialEndsAt),
  };
}
