import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { effectiveStatus } from '@/lib/billing/trial';
import type { Subscription, SubscriptionStatus } from '@/lib/types';

const useMock =
  (process.env.NEXT_PUBLIC_USE_MOCK ?? process.env.USE_MOCK) !== 'false' ||
  !process.env.NEXT_PUBLIC_SUPABASE_URL;

async function getSubscriptionForServer(): Promise<Subscription> {
  if (useMock) {
    const { getSubscription } = await import('@/lib/mock/billing');
    return getSubscription();
  }
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data } = await supabase
    .from('nurseries')
    .select(
      `subscription_status, trial_ends_at, stripe_customer_id, stripe_subscription_id,
       subscription_current_period_end, subscription_cancel_at_period_end`
    )
    .limit(1)
    .single();
  if (!data) {
    return {
      status: 'trialing',
      plan: 'pro',
      trialEndsAt: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      customerId: null,
      subscriptionId: null,
    };
  }
  return {
    status: data.subscription_status as SubscriptionStatus,
    plan: 'pro',
    trialEndsAt: data.trial_ends_at,
    currentPeriodEnd: data.subscription_current_period_end,
    cancelAtPeriodEnd: data.subscription_cancel_at_period_end,
    customerId: data.stripe_customer_id,
    subscriptionId: data.stripe_subscription_id,
  };
}

export async function getCurrentSubscription(): Promise<Subscription> {
  return getSubscriptionForServer();
}

export async function BillingGate({
  locale,
  children,
}: {
  locale: string;
  children: React.ReactNode;
}) {
  const sub = await getSubscriptionForServer();
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
