import { describe, expect, it, vi, beforeEach } from 'vitest';

// Regression test for E1 (docs/work-breakdown/MATRIX.md §E1):
//   listAlerts() must surface the highest-severity alert first, regardless
//   of creation date. The original fix used a DB-level `.order('sev')`, but
//   live verification (2026-05-16) showed the Postgres `alert_severity` enum
//   is `high, medium, low` with `critical` APPENDED (migration 021) — so
//   `ORDER BY sev DESC` yields critical, low, medium, high (WRONG: high
//   sorts last). The corrected impl orders by `created_at` at the DB layer
//   then re-sorts in TS by an explicit severity rank
//   (critical > high > medium > low), recency as the tiebreak.

const ROWS = [
  {
    id: 'low-new',
    sev: 'low',
    title: 'low',
    description: '',
    batch_id: null,
    action: '',
    closed: false,
    created_at: '2026-05-16T10:00:00Z',
    alert_farms: [],
  },
  {
    id: 'high-old',
    sev: 'high',
    title: 'high',
    description: '',
    batch_id: null,
    action: '',
    closed: false,
    created_at: '2026-05-15T10:00:00Z',
    alert_farms: [],
  },
  {
    id: 'medium-mid',
    sev: 'medium',
    title: 'medium',
    description: '',
    batch_id: null,
    action: '',
    closed: false,
    created_at: '2026-05-15T20:00:00Z',
    alert_farms: [],
  },
  {
    id: 'critical-oldest',
    sev: 'critical',
    title: 'critical',
    description: '',
    batch_id: null,
    action: '',
    closed: false,
    created_at: '2026-05-14T10:00:00Z',
    alert_farms: [],
  },
];

vi.mock('@/lib/supabase/client', () => {
  const result = { data: ROWS, error: null };
  function makeChain(): Record<string, unknown> {
    const chain: Record<string, unknown> = {
      eq: () => chain,
      order: () => chain,
      then: (cb: (v: typeof result) => unknown) =>
        Promise.resolve(cb(result)),
    };
    return chain;
  }
  return {
    createClient: () => ({
      from: () => ({ select: () => makeChain() }),
    }),
  };
});

describe('listAlerts — E1 severity-rank ordering', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('orders critical > high > medium > low regardless of created_at', async () => {
    const { listAlerts } = await import('@/lib/api/supabase');
    const alerts = await listAlerts();
    expect(alerts.map((a) => a.id)).toEqual([
      'critical-oldest',
      'high-old',
      'medium-mid',
      'low-new',
    ]);
  });
});
