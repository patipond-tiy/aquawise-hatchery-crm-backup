import { describe, expect, it, vi, beforeEach } from 'vitest';

// Regression test for E1.i (docs/work-breakdown/MATRIX.md):
//   listAlerts() previously ordered only by `created_at DESC`. Per the AC
//   in 03-user-stories.md §E1, the primary sort is `sev DESC` so high-severity
//   alerts surface above medium/low regardless of creation date. Without it,
//   an old high-severity alert could be buried below newer low-severity ones.
//
// This test asserts the order chain:
//   1. .order('sev', {ascending: false}) is called first
//   2. .order('created_at', {ascending: false}) is called second

const orderCalls: Array<{ column: string; ascending: boolean }> = [];

vi.mock('@/lib/supabase/client', () => {
  const finalQuery = {
    data: [],
    error: null,
    then: (cb: (v: { data: never[]; error: null }) => unknown) =>
      Promise.resolve(cb({ data: [], error: null })),
  };

  function makeChain(): Record<string, unknown> {
    const chain: Record<string, unknown> = {
      eq: () => chain,
      order: (column: string, opts: { ascending: boolean }) => {
        orderCalls.push({ column, ascending: opts.ascending });
        return chain;
      },
      then: finalQuery.then,
    };
    return chain;
  }

  return {
    createClient: () => ({
      from: () => ({
        select: () => makeChain(),
      }),
    }),
  };
});

describe('listAlerts — E1.i severity-sort regression', () => {
  beforeEach(() => {
    orderCalls.length = 0;
  });

  it('orders by sev DESC before created_at DESC', async () => {
    const { listAlerts } = await import('@/lib/api/supabase');
    await listAlerts();
    expect(orderCalls.length).toBe(2);
    expect(orderCalls[0]).toEqual({ column: 'sev', ascending: false });
    expect(orderCalls[1]).toEqual({ column: 'created_at', ascending: false });
  });
});
