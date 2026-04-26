import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSubscription } from '@/lib/api';
import { effectiveStatus } from '@/lib/billing/trial';
import type { Subscription } from '@/lib/types';

export async function getCurrentSubscription(): Promise<Subscription> {
  return getSubscription();
}

/**
 * Server-side paywall: if the trial expired (or status was already
 * trial_expired/canceled), redirect everywhere except /settings to the
 * trial-expired landing page so the user can subscribe to continue.
 *
 * Settings is accessible during paywall so they can reach Billing.
 */
export async function BillingGate({
  locale,
  children,
}: {
  locale: string;
  children: React.ReactNode;
}) {
  const sub = await getSubscription();
  const status = effectiveStatus(sub.status, sub.trialEndsAt);

  if (status === 'trial_expired' || status === 'canceled') {
    const h = await headers();
    const path = h.get('x-pathname') ?? '';
    const allowed =
      path.includes('/settings') ||
      path.includes('/billing/trial-expired') ||
      path.includes('/login') ||
      path.includes('/auth');
    if (!allowed) {
      redirect(`/${locale}/billing/trial-expired`);
    }
  }

  return <>{children}</>;
}
