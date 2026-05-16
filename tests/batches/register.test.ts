import { describe, expect, it, vi, beforeEach } from 'vitest';

// C1 — register a batch. PCR status is derived from real per-disease results
// (never hardcoded). If the pcr_results insert fails the batches row is
// rolled back (atomic intent). RBAC: pcr:write gates the PCR rows.

let batchInsert: Record<string, unknown> | null = null;
let pcrInsertCalled = false;
let batchDeleteCalled = false;
let failPcr = false;

vi.mock('@/lib/supabase/client', () => ({
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
      if (table === 'batches') {
        return {
          insert: (payload: Record<string, unknown>) => {
            batchInsert = payload;
            return {
              select: () => ({
                single: () =>
                  Promise.resolve({
                    data: {
                      id: payload.id,
                      source: payload.source,
                      pl_produced: payload.pl_produced,
                      pl_sold: 0,
                      date: payload.date,
                      pcr: payload.pcr,
                      mean_d30: null,
                      dist: [],
                    },
                    error: null,
                  }),
              }),
            };
          },
          delete: () => ({
            eq: () => {
              batchDeleteCalled = true;
              return Promise.resolve({ error: null });
            },
          }),
        };
      }
      // pcr_results
      return {
        insert: () => {
          pcrInsertCalled = true;
          return Promise.resolve({
            error: failPcr ? { message: 'pcr boom' } : null,
          });
        },
      };
    },
  }),
}));

describe('addBatch — C1 register', () => {
  beforeEach(() => {
    batchInsert = null;
    pcrInsertCalled = false;
    batchDeleteCalled = false;
    failPcr = false;
  });

  it('derives pcr=clean when all diseases negative', async () => {
    const { addBatch } = await import('@/lib/api/supabase');
    const b = await addBatch({
      source: 'CP-Genetics Line A',
      plProduced: 2_000_000,
      date: '2026-05-16',
      pcrResults: [
        { disease: 'WSSV', status: 'negative' },
        { disease: 'EHP', status: 'negative' },
      ],
    });
    expect(b.pcr).toBe('clean');
    expect(pcrInsertCalled).toBe(true);
    expect(batchDeleteCalled).toBe(false);
  });

  it('derives pcr=flagged when any disease positive', async () => {
    const { addBatch } = await import('@/lib/api/supabase');
    const b = await addBatch({
      source: 'X',
      plProduced: 1,
      date: '2026-05-16',
      pcrResults: [
        { disease: 'WSSV', status: 'negative' },
        { disease: 'EHP', status: 'positive' },
      ],
    });
    expect(b.pcr).toBe('flagged');
  });

  it('rolls the batch back when the pcr_results insert fails (atomic)', async () => {
    failPcr = true;
    const { addBatch } = await import('@/lib/api/supabase');
    await expect(
      addBatch({
        source: 'X',
        plProduced: 1,
        date: '2026-05-16',
        pcrResults: [{ disease: 'WSSV', status: 'negative' }],
      })
    ).rejects.toThrow('pcr boom');
    expect(batchDeleteCalled).toBe(true);
  });
});
