import { describe, it, expect, beforeEach, vi } from 'vitest';

// H3 — Stripe webhook idempotency. The handler checks `subscription_events`
// for an existing stripe_event_id BEFORE processing; a replayed event must
// not double-apply or insert a second row.

vi.mock('server-only', () => ({}));

const EVENT = {
  id: 'evt_test_idem_1',
  type: 'checkout.session.completed',
  data: {
    object: {
      client_reference_id: 'nursery-1',
      subscription: 'sub_1',
      customer: 'cus_1',
    },
  },
};

// In-memory subscription_events store shared across the two deliveries.
const subEvents: { stripe_event_id: string }[] = [];
const nurseryUpdates: unknown[] = [];

vi.mock('@/lib/stripe/server', () => ({
  getStripe: () => ({
    webhooks: { constructEvent: () => EVENT },
    subscriptions: {
      retrieve: () =>
        Promise.resolve({
          id: 'sub_1',
          status: 'active',
          cancel_at_period_end: false,
          items: { data: [{ current_period_end: 1893456000 }] },
        }),
    },
  }),
}));

vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: () =>
    Promise.resolve({
      from: (table: string) => ({
        select: () => ({
          eq: () => ({
            maybeSingle: () =>
              Promise.resolve({
                data:
                  table === 'subscription_events'
                    ? (subEvents.find(
                        (e) => e.stripe_event_id === EVENT.id
                      ) ?? null)
                    : null,
              }),
          }),
        }),
        update: () => ({
          eq: () => {
            if (table === 'nurseries') nurseryUpdates.push({});
            return Promise.resolve({ error: null });
          },
        }),
        insert: (row: { stripe_event_id?: string }) => {
          if (table === 'subscription_events' && row.stripe_event_id) {
            subEvents.push({ stripe_event_id: row.stripe_event_id });
          }
          return Promise.resolve({ error: null });
        },
      }),
    }),
}));

function makeReq() {
  return {
    headers: { get: (k: string) => (k === 'stripe-signature' ? 'sig' : null) },
    text: () => Promise.resolve('{}'),
  } as unknown as import('next/server').NextRequest;
}

describe('Stripe webhook idempotency', () => {
  beforeEach(() => {
    subEvents.length = 0;
    nurseryUpdates.length = 0;
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
  });

  it('processes once; replay is a no-op (one subscription_events row)', async () => {
    const { POST } = await import('@/app/api/webhooks/stripe/route');

    const r1 = await POST(makeReq());
    const b1 = await r1.json();
    expect(b1.received).toBe(true);
    expect(subEvents).toHaveLength(1);
    expect(nurseryUpdates.length).toBe(1);

    // Replay the SAME event id.
    const r2 = await POST(makeReq());
    const b2 = await r2.json();
    expect(b2.duplicate).toBe(true);
    expect(subEvents).toHaveLength(1); // still one
    expect(nurseryUpdates.length).toBe(1); // no double-apply
  });
});
