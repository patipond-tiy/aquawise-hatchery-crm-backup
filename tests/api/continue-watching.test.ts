import { describe, expect, it, vi } from 'vitest';

// Story A5 AC#4 — the dashboard "ฟาร์มที่ต้องตามต่อ" cards must show the
// customer's REAL latest batch reference, not the hardcoded literals
// ['ล็อต B-2604-A', 'ล็อต B-2604-B', 'ล็อต B-2603-C']. getContinueWatching()
// derives batchRef from the real customers → batch_buyers join, picks the
// most-recent batch by created_at, and sorts by nearest restock.

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      select: () =>
        Promise.resolve({
          data: [
            {
              id: 'c1',
              name: 'สมชาย',
              farm: 'ฟาร์มบ้านสวน',
              zone: 'สมุทรสาคร',
              customer_cycles: [{ cycle_day: 18, restock_in: 5 }],
              batch_buyers: [
                { batch_id: 'B-2604-A', created_at: '2026-04-01T00:00:00Z' },
                { batch_id: 'B-2605-C', created_at: '2026-05-10T00:00:00Z' },
              ],
            },
            {
              id: 'c2',
              name: 'สมหญิง',
              farm: 'ฟาร์มทุ่งทอง',
              zone: 'ชลบุรี',
              customer_cycles: [{ cycle_day: 30, restock_in: 2 }],
              batch_buyers: [
                { batch_id: 'B-2603-B', created_at: '2026-03-15T00:00:00Z' },
              ],
            },
            {
              // No cycle → excluded from continue-watching.
              id: 'c3',
              name: 'สมศักดิ์',
              farm: 'ฟาร์มเงียบ',
              zone: 'ระยอง',
              customer_cycles: [],
              batch_buyers: [],
            },
          ],
          error: null,
        }),
    }),
  }),
}));

describe('getContinueWatching — A5 AC#4 real batch reference', () => {
  it('returns the most-recent batch_id per customer, nearest restock first', async () => {
    const { getContinueWatching } = await import('@/lib/api/supabase');
    const items = await getContinueWatching(3);

    // c3 has no cycle → excluded. c2 (restock_in 2) before c1 (restock_in 5).
    expect(items).toHaveLength(2);
    expect(items[0]!.customerId).toBe('c2');
    expect(items[0]!.batchRef).toBe('B-2603-B');
    expect(items[1]!.customerId).toBe('c1');
    // Latest by created_at, not array order.
    expect(items[1]!.batchRef).toBe('B-2605-C');
  });

  it('does not return the hardcoded mock literals', async () => {
    const { getContinueWatching } = await import('@/lib/api/supabase');
    const items = await getContinueWatching(3);
    const refs = items.map((i) => i.batchRef);
    expect(refs).not.toContain('B-2604-A');
    expect(refs).not.toContain('B-2604-B');
    expect(refs).not.toContain('B-2603-C');
  });

  it('respects the limit argument', async () => {
    const { getContinueWatching } = await import('@/lib/api/supabase');
    const items = await getContinueWatching(1);
    expect(items).toHaveLength(1);
    expect(items[0]!.customerId).toBe('c2');
  });
});
