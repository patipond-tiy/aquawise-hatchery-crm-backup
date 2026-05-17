import { describe, expect, it } from 'vitest';
import { deriveScorecardStats } from '@/lib/derive/scorecard-stats';
import type { Batch, Customer } from '@/lib/types';

function customer(overrides: Partial<Customer> = {}): Customer {
  return {
    id: 'c1',
    name: 'ลูกค้า',
    farm: 'ฟาร์ม',
    farmEn: 'Farm',
    zone: 'สมุทรสาคร',
    batches: 1,
    ltv: 0,
    lastBuy: '',
    cycleDay: null,
    expectedHarvest: null,
    d30: null,
    d60: null,
    restockIn: null,
    status: 'active',
    ...overrides,
  };
}

function batch(overrides: Partial<Batch> = {}): Batch {
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

describe('deriveScorecardStats', () => {
  it('returns null stats with empty inputs', () => {
    const s = deriveScorecardStats([], []);
    expect(s).toEqual({
      d30Status: null,
      pcrPassPct: null,
      retentionPct: null,
      lotCount: 0,
      farmCount: 0,
    });
  });

  it('computes PCR pass %, retention %, counts, and D30 status from real rows', () => {
    const customers = [
      customer({ id: 'c1', batches: 3 }),
      customer({ id: 'c2', batches: 1 }),
      customer({ id: 'c3', batches: 2 }),
      customer({ id: 'c4', batches: 1 }),
    ];
    const batches = [
      batch({ id: 'b1', pcr: 'clean', meanD30: 70 }),
      batch({ id: 'b2', pcr: 'clean', meanD30: 75 }),
      batch({ id: 'b3', pcr: 'flagged', meanD30: 90 }),
    ];
    const s = deriveScorecardStats(customers, batches);
    expect(s.lotCount).toBe(3);
    expect(s.farmCount).toBe(4);
    expect(s.pcrPassPct).toBe(67); // 2/3
    expect(s.retentionPct).toBe(50); // c1 & c3 returned
    expect(s.d30Status).toBe('above'); // latest 90 > median 75
  });
});
