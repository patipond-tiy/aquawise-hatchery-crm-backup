import { describe, it, expect } from 'vitest';
import type { Customer, RestockThresholds } from '@/lib/types';

// Unit test for D1 threshold logic — verifies that grouping customers
// by restockIn uses the configurable thresholds rather than hardcoded values.

function groupCustomers(customers: Customer[], thresholds: RestockThresholds) {
  const due = customers
    .filter((c) => c.restockIn != null)
    .sort((a, b) => (a.restockIn ?? 0) - (b.restockIn ?? 0));

  return {
    now: due.filter((c) => (c.restockIn ?? 0) <= thresholds.now),
    week: due.filter(
      (c) => (c.restockIn ?? 0) > thresholds.now && (c.restockIn ?? 0) <= thresholds.week
    ),
    month: due.filter(
      (c) => (c.restockIn ?? 0) > thresholds.week && (c.restockIn ?? 0) <= thresholds.month
    ),
    later: due.filter((c) => (c.restockIn ?? 0) > thresholds.month),
  };
}

function makeCustomer(id: string, restockIn: number): Customer {
  return {
    id,
    name: `Farm ${id}`,
    farm: `Farm ${id}`,
    farmEn: `Farm ${id}`,
    zone: 'Test',
    batches: 0,
    ltv: 0,
    lastBuy: '',
    cycleDay: null,
    expectedHarvest: null,
    d30: null,
    d60: null,
    restockIn,
    status: 'active',
  };
}

describe('restock grouping — D1 configurable thresholds', () => {
  const customers = [
    makeCustomer('c1', 0),   // now
    makeCustomer('c2', 7),   // week (default)
    makeCustomer('c3', 20),  // month (default)
    makeCustomer('c4', 60),  // later (default)
  ];

  it('groups correctly with default thresholds {now:0, week:14, month:45}', () => {
    const groups = groupCustomers(customers, { now: 0, week: 14, month: 45 });
    expect(groups.now.map((c) => c.id)).toEqual(['c1']);
    expect(groups.week.map((c) => c.id)).toEqual(['c2']);
    expect(groups.month.map((c) => c.id)).toEqual(['c3']);
    expect(groups.later.map((c) => c.id)).toEqual(['c4']);
  });

  it('re-groups correctly after threshold change {now:5, week:10, month:30}', () => {
    const groups = groupCustomers(customers, { now: 5, week: 10, month: 30 });
    // c1 (0) <= 5 → now; c2 (7) > 5 && <= 10 → week; c3 (20) > 10 && <= 30 → month; c4 (60) > 30 → later
    expect(groups.now.map((c) => c.id)).toEqual(['c1']);
    expect(groups.week.map((c) => c.id)).toEqual(['c2']);
    expect(groups.month.map((c) => c.id)).toEqual(['c3']);
    expect(groups.later.map((c) => c.id)).toEqual(['c4']);
  });

  it('moves c2 to "now" when week threshold raised to 3', () => {
    // With now=3, c2 (restockIn=7) should move to week group
    const groups = groupCustomers(customers, { now: 3, week: 8, month: 45 });
    // c1 (0) <= 3 → now; c2 (7) > 3 && <= 8 → week
    expect(groups.now.map((c) => c.id)).toEqual(['c1']);
    expect(groups.week.map((c) => c.id)).toEqual(['c2']);
  });

  it('moves c3 to "later" when month threshold set to 15', () => {
    const groups = groupCustomers(customers, { now: 0, week: 14, month: 15 });
    // c3 (restockIn=20) > 15 → later
    expect(groups.month).toHaveLength(0);
    expect(groups.later.map((c) => c.id)).toContain('c3');
    expect(groups.later.map((c) => c.id)).toContain('c4');
  });

  it('excludes customers with null restockIn', () => {
    const withNull: Customer[] = [
      ...customers,
      { ...makeCustomer('c5', 0), restockIn: null },
    ];
    const groups = groupCustomers(withNull, { now: 0, week: 14, month: 45 });
    const allGrouped = [...groups.now, ...groups.week, ...groups.month, ...groups.later];
    expect(allGrouped.find((c) => c.id === 'c5')).toBeUndefined();
  });
});
