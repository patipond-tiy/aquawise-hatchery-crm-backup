import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { requiresPaywall, effectiveStatus } from '@/lib/billing/trial';
import type { SubscriptionStatus } from '@/lib/types';

export class PaywallError extends Error {
  readonly status = 402;
  constructor() {
    super(
      'กรุณาสมัครแพ็กเกจเพื่อใช้งานต่อ / Subscribe to continue'
    );
    this.name = 'PaywallError';
  }
}

/**
 * Throws PaywallError when the calling user's nursery subscription requires
 * the paywall (trial_expired or canceled). Call at the top of every mutation
 * server action. Read-only actions must NOT call this.
 */
export async function requireActiveSubscription(): Promise<void> {
  // Mock mode: respect MOCK_BILLING_STATE env var without hitting Supabase.
  const mockState = process.env.MOCK_BILLING_STATE;
  if (mockState) {
    let status: SubscriptionStatus = 'trialing';
    if (mockState === 'trial_expired') status = 'trial_expired';
    else if (mockState === 'active') status = 'active';
    else if (mockState === 'past_due') status = 'past_due';
    else if (mockState === 'canceled') status = 'canceled';
    // trialing-N variants stay as 'trialing'

    if (requiresPaywall(status)) throw new PaywallError();
    return;
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;

  const supabase = await createClient();
  const { data } = await supabase
    .from('nurseries')
    .select('subscription_status, trial_ends_at')
    .limit(1)
    .single();

  if (!data) return;

  const effective = effectiveStatus(
    data.subscription_status as SubscriptionStatus,
    data.trial_ends_at
  );

  if (requiresPaywall(effective)) throw new PaywallError();
}
