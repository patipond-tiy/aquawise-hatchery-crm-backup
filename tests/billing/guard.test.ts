import { describe, it, expect, afterEach, vi } from 'vitest';

// Tests for lib/billing/guard.ts H3 mutation guard.
// Uses MOCK_BILLING_STATE env var so no Supabase connection is needed.

// Mock 'server-only' so it doesn't throw in vitest (jsdom env).
vi.mock('server-only', () => ({}));

// Mock the Supabase server client — guard uses it only when MOCK_BILLING_STATE
// is absent and NEXT_PUBLIC_SUPABASE_URL is set. In these tests MOCK_BILLING_STATE
// is always set, so the client is never reached.
vi.mock('@/lib/supabase/server', () => ({
  createClient: () => Promise.resolve({
    from: () => ({ select: () => ({ limit: () => ({ single: () => Promise.resolve({ data: null }) }) }) }),
  }),
}));

afterEach(() => {
  delete process.env.MOCK_BILLING_STATE;
  // Reset module cache so guard re-reads env on next import
  vi.resetModules();
});

describe('requireActiveSubscription — H3 mutation guard', () => {
  it('throws PaywallError when MOCK_BILLING_STATE=trial_expired', async () => {
    process.env.MOCK_BILLING_STATE = 'trial_expired';
    const { requireActiveSubscription, PaywallError } = await import('@/lib/billing/guard');
    await expect(requireActiveSubscription()).rejects.toBeInstanceOf(PaywallError);
  });

  it('throws PaywallError when MOCK_BILLING_STATE=canceled', async () => {
    process.env.MOCK_BILLING_STATE = 'canceled';
    const { requireActiveSubscription, PaywallError } = await import('@/lib/billing/guard');
    await expect(requireActiveSubscription()).rejects.toBeInstanceOf(PaywallError);
  });

  it('resolves when MOCK_BILLING_STATE=active', async () => {
    process.env.MOCK_BILLING_STATE = 'active';
    const { requireActiveSubscription } = await import('@/lib/billing/guard');
    await expect(requireActiveSubscription()).resolves.toBeUndefined();
  });

  it('resolves when MOCK_BILLING_STATE=trialing-25 (trialing)', async () => {
    process.env.MOCK_BILLING_STATE = 'trialing-25';
    const { requireActiveSubscription } = await import('@/lib/billing/guard');
    await expect(requireActiveSubscription()).resolves.toBeUndefined();
  });

  it('resolves when MOCK_BILLING_STATE=past_due (past_due is NOT paywalled)', async () => {
    process.env.MOCK_BILLING_STATE = 'past_due';
    const { requireActiveSubscription } = await import('@/lib/billing/guard');
    await expect(requireActiveSubscription()).resolves.toBeUndefined();
  });

  it('PaywallError has status 402', async () => {
    process.env.MOCK_BILLING_STATE = 'trial_expired';
    const { requireActiveSubscription, PaywallError } = await import('@/lib/billing/guard');
    try {
      await requireActiveSubscription();
      expect.fail('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(PaywallError);
      expect((e as InstanceType<typeof PaywallError>).status).toBe(402);
    }
  });
});
