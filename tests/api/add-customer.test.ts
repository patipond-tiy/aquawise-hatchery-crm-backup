import { describe, expect, it, vi } from 'vitest';

// Tests for B2.i (docs/work-breakdown/MATRIX.md):
//   addCustomer() previously dropped the `plan` field from the modal payload.
//   The fix maps input.plan -> package_interest in the insert payload.
//   The new `package_interest` column is nullable, so omitting plan is also valid.

let lastInsertPayload: Record<string, unknown> = {};

vi.mock('@/lib/supabase/client', () => {
  return {
    createClient: () => ({
      from: (table: string) => {
        if (table === 'nurseries') {
          return {
            select: () => ({
              limit: () => ({
                single: () =>
                  Promise.resolve({ data: { id: 'h1' }, error: null }),
              }),
            }),
          };
        }
        // customers table
        return {
          insert: (payload: Record<string, unknown>) => {
            lastInsertPayload = payload;
            return {
              select: () => ({
                single: () =>
                  Promise.resolve({
                    data: {
                      id: 'c1',
                      name: 'สมชาย',
                      farm: 'ฟาร์มบ้านสวน',
                      farm_en: null,
                      zone: 'สมุทรสาคร',
                      status: 'active',
                      ltv: 0,
                      last_buy: null,
                      customer_cycles: [],
                    },
                    error: null,
                  }),
              }),
            };
          },
        };
      },
    }),
  };
});

describe('addCustomer — B2.i plan persistence', () => {
  it('persists plan as package_interest in the insert payload', async () => {
    const { addCustomer } = await import('@/lib/api/supabase');
    await addCustomer({
      farm: 'ฟาร์มบ้านสวน',
      name: 'สมชาย',
      zone: 'สมุทรสาคร',
      plan: '500k',
    });
    expect(lastInsertPayload).toMatchObject({ package_interest: '500k' });
  });

  it('sets package_interest to null when plan is omitted (nullable)', async () => {
    const { addCustomer } = await import('@/lib/api/supabase');
    await addCustomer({
      farm: 'ฟาร์มบ้านสวน',
      name: 'สมชาย',
      zone: 'สมุทรสาคร',
    });
    expect(lastInsertPayload).toMatchObject({ package_interest: null });
  });
});
