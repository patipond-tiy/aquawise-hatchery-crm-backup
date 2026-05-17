import { describe, expect, it } from 'vitest';
import { deriveD30Trend } from '@/lib/derive/d30-trend';
import type { Batch } from '@/lib/types';

function makeBatch(overrides: Partial<Batch> = {}): Batch {
  return {
    id: 'b1',
    date: '2026-01-01',
    source: 'CP',
    plProduced: 0,
    plSold: 0,
    farms: 0,
    meanD30: 0,
    dist: [],
    pcr: 'clean',
    ...overrides,
  };
}

describe('deriveD30Trend', () => {
  it('returns empty trend when no batch has D30', () => {
    const t = deriveD30Trend([makeBatch({ meanD30: 0 })]);
    expect(t).toEqual({ series: [], latest: null, deltaPct: null });
  });

  it('builds a chronological series from real batch meanD30', () => {
    const t = deriveD30Trend([
      makeBatch({ id: 'b2', date: '2026-03-01', meanD30: 80 }),
      makeBatch({ id: 'b1', date: '2026-01-01', meanD30: 70 }),
      makeBatch({ id: 'b3', date: '2026-02-01', meanD30: 0 }),
    ]);
    expect(t.series).toEqual([70, 80]);
    expect(t.latest).toBe(80);
    expect(t.deltaPct).toBe(14); // (80-70)/70 ≈ 14%
  });

  it('caps the series to maxPoints keeping the most recent', () => {
    const batches = Array.from({ length: 20 }, (_, i) =>
      makeBatch({
        id: `b${i}`,
        date: `2026-01-${String(i + 1).padStart(2, '0')}`,
        meanD30: 60 + i,
      })
    );
    const t = deriveD30Trend(batches, 5);
    expect(t.series).toHaveLength(5);
    expect(t.latest).toBe(79);
  });
});
