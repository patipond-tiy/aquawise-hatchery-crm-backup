import { describe, expect, it, vi } from 'vitest';

// B3 — getCustomer returns the CustomerDetail shape with real contact,
// cycle-history sparkline series, and batch history. RLS scoping means a
// cross-tenant id resolves to no row → null (the customers select returns
// null data because the policy filters it out).

function makeClient(opts: {
  customer: Record<string, unknown> | null;
  history?: Record<string, unknown>[];
  dist?: Record<string, unknown>[];
}) {
  return {
    from: (table: string) => {
      if (table === 'customers') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () =>
                Promise.resolve({ data: opts.customer, error: null }),
            }),
          }),
        };
      }
      if (table === 'customer_cycle_history') {
        return {
          select: () => ({
            eq: () => ({
              order: () => ({
                limit: () =>
                  Promise.resolve({
                    data: opts.history ?? [],
                    error: null,
                  }),
              }),
            }),
          }),
        };
      }
      // batch_buyers
      return {
        select: () => ({
          eq: () =>
            Promise.resolve({ data: opts.dist ?? [], error: null }),
        }),
      };
    },
  };
}

describe('getCustomer — B3 detail', () => {
  it('returns null for a cross-tenant / unknown id (RLS filtered)', async () => {
    vi.resetModules();
    vi.doMock('@/lib/supabase/client', () => ({
      createClient: () => makeClient({ customer: null }),
    }));
    const { getCustomer } = await import('@/lib/api/supabase');
    expect(await getCustomer('other-tenant-id')).toBeNull();
  });

  it('maps real contact, empty sparkline, and batch history', async () => {
    vi.resetModules();
    vi.doMock('@/lib/supabase/client', () => ({
      createClient: () =>
        makeClient({
          customer: {
            id: 'c1',
            name: 'สมชาย',
            farm: 'ฟาร์มบ้านสวน',
            farm_en: 'Bansuan',
            zone: 'สมุทรสาคร',
            status: 'active',
            ltv: 1000,
            last_buy: null,
            phone: '081-111-2222',
            line_id: '@bansuan',
            address: '45 ม.3',
            customer_cycles: [],
          },
          history: [],
          dist: [
            {
              batch_id: 'B-2605-A',
              pl_purchased: 300000,
              d30: 82,
              batches: { id: 'B-2605-A', date: '2026-05-10', pcr: 'clean' },
            },
          ],
        }),
    }));
    const { getCustomer } = await import('@/lib/api/supabase');
    const c = await getCustomer('c1');
    expect(c).not.toBeNull();
    expect(c!.phone).toBe('081-111-2222');
    expect(c!.lineId).toBe('@bansuan');
    expect(c!.address).toBe('45 ม.3');
    expect(c!.cycleHistory).toHaveLength(0); // empty sparkline state
    expect(c!.batchHistory).toHaveLength(1);
    expect(c!.batchHistory[0]!.batchId).toBe('B-2605-A');
    expect(c!.batchHistory[0]!.d30).toBe(82);
  });
});
