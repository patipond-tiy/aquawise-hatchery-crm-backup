import { describe, expect, it, vi } from 'vitest';

// C3 — batch detail. Mean D30 computed from batch_buyers.d30 server-side;
// PCR lab comes from pcr_results.lab (NOT hardcoded "DOFR"); empty buyers
// renders no rows; null/cross-tenant id → null (404 upstream).

function makeClient(opts: {
  batch: Record<string, unknown> | null;
  buyers?: Record<string, unknown>[];
  pcr?: Record<string, unknown>[];
}) {
  return {
    from: (table: string) => {
      if (table === 'batches') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () =>
                Promise.resolve({ data: opts.batch, error: null }),
            }),
          }),
        };
      }
      if (table === 'batch_buyers') {
        return {
          select: () => ({
            eq: () =>
              Promise.resolve({ data: opts.buyers ?? [], error: null }),
          }),
        };
      }
      // pcr_results
      return {
        select: () => ({
          eq: () => ({
            order: () =>
              Promise.resolve({ data: opts.pcr ?? [], error: null }),
          }),
        }),
      };
    },
  };
}

const BATCH = {
  id: 'B-2605-A',
  source: 'CP-Genetics Line A',
  pl_produced: 2_400_000,
  pl_sold: 1_820_000,
  date: '2026-05-10',
  pcr: 'clean',
  mean_d30: 0,
  dist: [],
};

describe('getBatch — C3 detail', () => {
  it('returns null for unknown/cross-tenant id', async () => {
    vi.resetModules();
    vi.doMock('@/lib/supabase/client', () => ({
      createClient: () => makeClient({ batch: null }),
    }));
    const { getBatch } = await import('@/lib/api/supabase');
    expect(await getBatch('nope')).toBeNull();
  });

  it('computes mean D30 from batch_buyers.d30 ([60,80,90] → 77)', async () => {
    vi.resetModules();
    vi.doMock('@/lib/supabase/client', () => ({
      createClient: () =>
        makeClient({
          batch: BATCH,
          buyers: [
            { customer_id: 'c1', pl_purchased: 100, d30: 60, customers: { farm: 'A', zone: 'Z' } },
            { customer_id: 'c2', pl_purchased: 100, d30: 80, customers: { farm: 'B', zone: 'Z' } },
            { customer_id: 'c3', pl_purchased: 100, d30: 90, customers: { farm: 'C', zone: 'Z' } },
          ],
          pcr: [
            { id: 'p1', disease: 'WSSV', status: 'negative', lab: 'กรมประมง', tested_on: '2026-05-09' },
          ],
        }),
    }));
    const { getBatch } = await import('@/lib/api/supabase');
    const b = await getBatch('B-2605-A');
    expect(b!.meanD30).toBe(77); // round(230/3)
    expect(b!.buyers).toHaveLength(3);
    // Lab comes from the DB column, never the hardcoded "DOFR" literal.
    expect(b!.pcrResults[0]!.lab).toBe('กรมประมง');
    expect(b!.pcrResults[0]!.lab).not.toBe('DOFR');
  });

  it('empty buyers → no rows, pcr empty array', async () => {
    vi.resetModules();
    vi.doMock('@/lib/supabase/client', () => ({
      createClient: () =>
        makeClient({ batch: BATCH, buyers: [], pcr: [] }),
    }));
    const { getBatch } = await import('@/lib/api/supabase');
    const b = await getBatch('B-2605-A');
    expect(b!.buyers).toHaveLength(0);
    expect(b!.pcrResults).toHaveLength(0);
  });
});
