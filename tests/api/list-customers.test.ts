import { describe, expect, it, vi, beforeEach } from 'vitest';

// Regression test for B1.i (docs/work-breakdown/MATRIX.md):
//   listCustomers() previously used `customer_cycles!inner(...)` which silently
//   dropped any customer that had no row in customer_cycles. Net-new customers
//   would appear missing from the production list until their first cycle was
//   registered. The fix changed the join to a left join.
//
// This test asserts:
//   1. The Supabase select() string does NOT contain `customer_cycles!inner`
//   2. A customer returned with no cycle data still appears in the result
//      with all cycle-derived fields null.

let lastSelectArg = '';

vi.mock('@/lib/supabase/client', () => {
  return {
    createClient: () => ({
      from: () => ({
        select: (arg: string) => {
          lastSelectArg = arg;
          return Promise.resolve({
            data: [
              {
                id: 'c1',
                name: 'สมชาย',
                farm: 'ฟาร์มบ้านสวน',
                farm_en: 'Bansuan Farm',
                zone: 'สมุทรสาคร',
                status: 'active',
                ltv: 0,
                last_buy: null,
                customer_cycles: [], // empty array = no cycle row (left join behaviour)
              },
            ],
            error: null,
          });
        },
      }),
    }),
  };
});

describe('listCustomers — B1.i regression', () => {
  beforeEach(() => {
    lastSelectArg = '';
  });

  it('does not use an inner join on customer_cycles', async () => {
    const { listCustomers } = await import('@/lib/api/supabase');
    await listCustomers();
    expect(lastSelectArg).toContain('customer_cycles');
    expect(lastSelectArg).not.toContain('customer_cycles!inner');
  });

  it('returns customers with no cycle row (cycle fields null)', async () => {
    const { listCustomers } = await import('@/lib/api/supabase');
    const customers = await listCustomers();
    expect(customers).toHaveLength(1);
    const c = customers[0]!;
    expect(c.id).toBe('c1');
    expect(c.farm).toBe('ฟาร์มบ้านสวน');
    expect(c.cycleDay).toBeNull();
    expect(c.d30).toBeNull();
    expect(c.d60).toBeNull();
    expect(c.restockIn).toBeNull();
    expect(c.expectedHarvest).toBeNull();
  });
});
