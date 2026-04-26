import { TRIAL_DAYS } from '@/lib/stripe/config';
import type { Invoice, Subscription, SubscriptionStatus } from '@/lib/types';

/**
 * Mock subscription state controlled by MOCK_BILLING_STATE env var.
 *   trialing-25 | trialing-2 | trial_expired | active | past_due
 */
export async function getSubscription(): Promise<Subscription> {
  const state = process.env.MOCK_BILLING_STATE ?? 'trialing-25';

  // trialing-N
  if (state.startsWith('trialing-')) {
    const days = parseInt(state.split('-')[1] ?? '25', 10);
    return {
      status: 'trialing',
      plan: 'pro',
      trialEndsAt: new Date(Date.now() + days * 86_400_000).toISOString(),
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      customerId: null,
      subscriptionId: null,
    };
  }

  if (state === 'trial_expired') {
    return {
      status: 'trial_expired',
      plan: 'pro',
      trialEndsAt: new Date(Date.now() - 86_400_000).toISOString(),
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      customerId: null,
      subscriptionId: null,
    };
  }

  if (state === 'past_due') {
    return {
      status: 'past_due',
      plan: 'pro',
      trialEndsAt: null,
      currentPeriodEnd: new Date(Date.now() - 86_400_000).toISOString(),
      cancelAtPeriodEnd: false,
      customerId: 'cus_mock_pastdue',
      subscriptionId: 'sub_mock_pastdue',
    };
  }

  if (state === 'canceled') {
    return {
      status: 'canceled' as SubscriptionStatus,
      plan: null,
      trialEndsAt: null,
      currentPeriodEnd: new Date(Date.now() - 86_400_000).toISOString(),
      cancelAtPeriodEnd: false,
      customerId: 'cus_mock_canceled',
      subscriptionId: null,
    };
  }

  // default: active
  return {
    status: 'active',
    plan: 'pro',
    trialEndsAt: new Date(
      Date.now() - 5 * 86_400_000 - TRIAL_DAYS * 86_400_000
    ).toISOString(),
    currentPeriodEnd: new Date(Date.now() + 26 * 86_400_000).toISOString(),
    cancelAtPeriodEnd: false,
    customerId: 'cus_mock_active',
    subscriptionId: 'sub_mock_active',
  };
}

export async function getInvoiceHistory(): Promise<Invoice[]> {
  const sub = await getSubscription();
  if (sub.status !== 'active' && sub.status !== 'past_due') return [];

  const today = new Date();
  return [0, 1, 2].map((monthsBack) => {
    const d = new Date(today);
    d.setMonth(d.getMonth() - monthsBack);
    d.setDate(12);
    return {
      id: `in_mock_${monthsBack}`,
      number: `INV-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      amount: 5000,
      currency: 'thb',
      status: 'paid',
      paidAt: d.toISOString(),
      hostedUrl: null,
      pdfUrl: null,
    };
  });
}
