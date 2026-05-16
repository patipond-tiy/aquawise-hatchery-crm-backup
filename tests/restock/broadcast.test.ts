import { describe, expect, it } from 'vitest';
import { can } from '@/lib/rbac';
import { broadcastToFarms } from '@/app/[locale]/(dashboard)/restock/actions';
import type { RestockThresholds } from '@/lib/types';

// D3 — broadcast to a restock cohort. The cohort-resolution logic (which
// customers fall in a given urgency filter, against the nursery's
// restock_thresholds) is the testable core; it mirrors the SQL filter in the
// server action and the bucketing in the restock page. Idempotency itself is
// DB-enforced (partial unique index) and exercised in the live UAT.

type C = { id: string; restockIn: number | null };

function resolveCohort(
  customers: C[],
  filterId: 'now' | 'week' | 'month' | 'later',
  thr: RestockThresholds
): C[] {
  return customers.filter((c) => {
    const ri = c.restockIn;
    if (ri == null) return false;
    if (filterId === 'now') return ri <= thr.now;
    if (filterId === 'week') return ri > thr.now && ri <= thr.week;
    if (filterId === 'month') return ri > thr.week && ri <= thr.month;
    return ri > thr.month;
  });
}

const THR: RestockThresholds = { now: 0, week: 14, month: 45 };

describe('broadcastToFarms — D3 cohort resolution', () => {
  const customers: C[] = [
    { id: 'a', restockIn: -1 }, // now
    { id: 'b', restockIn: 3 }, // week
    { id: 'c', restockIn: 9 }, // week
    { id: 'd', restockIn: 28 }, // month
    { id: 'e', restockIn: 90 }, // later
    { id: 'f', restockIn: null }, // excluded
  ];

  it('resolves the week cohort to exactly the in-range customers', () => {
    expect(resolveCohort(customers, 'week', THR).map((c) => c.id)).toEqual([
      'b',
      'c',
    ]);
  });

  it('resolves the now cohort (boundary <= now)', () => {
    expect(resolveCohort(customers, 'now', THR).map((c) => c.id)).toEqual([
      'a',
    ]);
  });

  it('an empty cohort yields zero recipients (action returns count 0)', () => {
    const noNow = customers.filter((c) => (c.restockIn ?? 1) > 0);
    expect(resolveCohort(noNow, 'now', THR)).toHaveLength(0);
  });

  it('excludes customers with null restockIn from every cohort', () => {
    const all = (['now', 'week', 'month', 'later'] as const).flatMap((f) =>
      resolveCohort(customers, f, THR)
    );
    expect(all.find((c) => c.id === 'f')).toBeUndefined();
  });

  it('mock-mode broadcastToFarms returns { count: 0 } (no live enqueue)', async () => {
    const res = await broadcastToFarms({
      filterId: 'week',
      template: 'restock_reminder',
    });
    expect(res).toEqual({ count: 0 });
  });
});

describe('broadcastToFarms — D3 RBAC', () => {
  it('owner only — counter_staff / lab_tech / auditor blocked', () => {
    expect(can('owner', 'broadcast:write')).toBe(true);
    expect(can('counter_staff', 'broadcast:write')).toBe(false);
    expect(can('lab_tech', 'broadcast:write')).toBe(false);
    expect(can('auditor', 'broadcast:write')).toBe(false);
  });
});
