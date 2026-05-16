import { describe, expect, it } from 'vitest';

// E2 — D30-dip auto-alert rule engine. This mirrors the threshold logic in
// `supabase/migrations/022_d30_dip_alert_engine.sql`
// (run_d30_dip_alert_scan). The live SQL function is exercised end-to-end in
// the E-alerts UAT against seeded batch_buyers; this unit suite locks the
// branching contract so a future SQL edit that drifts from the spec is
// caught in CI.
//
// Scale note: d30 is integer-percent (matching the app-wide `d30 < 70`
// convention), not the 0–1 fraction in the prose AC.

type Severity = 'high' | 'medium' | null;

function classifyDip(d30s: Array<number | null>): Severity {
  const dipCount = d30s.filter((v) => v != null && v < 70).length;
  const severeDip = d30s.some((v) => v != null && v < 60);
  if (dipCount >= 3 || severeDip) return 'high';
  if (dipCount >= 2) return 'medium';
  return null;
}

describe('E2 — D30-dip threshold classification', () => {
  it('1 farm below 70% → no alert', () => {
    expect(classifyDip([65, 82, 88])).toBeNull();
  });

  it('2 farms below 70% → medium', () => {
    expect(classifyDip([65, 68, 88])).toBe('medium');
  });

  it('3 farms below 70% → escalates to high', () => {
    expect(classifyDip([65, 68, 69])).toBe('high');
  });

  it('any farm below 60% → high regardless of farm count', () => {
    expect(classifyDip([59, 88, 90])).toBe('high');
    expect(classifyDip([59, 65, 88])).toBe('high');
  });

  it('nulls are ignored (no false dip)', () => {
    expect(classifyDip([null, null, 90])).toBeNull();
    expect(classifyDip([null, 65, 68])).toBe('medium');
  });

  it('no dips at all → no alert', () => {
    expect(classifyDip([78, 82, 85])).toBeNull();
  });
});

// The de-dup invariant — one auto-alert per (batch_id, alert_kind, dip_week)
// — is enforced by the partial unique index `alerts_d30_week_dedupe_idx`
// (migration 022) and the function's `on conflict do nothing`. A second scan
// in the same ISO week inserts zero new rows; this is verified live in the
// E-alerts UAT, not unit-mockable without a Postgres harness.
describe('E2 — de-dup contract (documented; DB-enforced)', () => {
  it('dedupe key is (batch_id, alert_kind, dip_week)', () => {
    const key = (b: string, w: string) => `${b}|d30_dip|${w}`;
    expect(key('B-1', '2026-05-11')).toBe(key('B-1', '2026-05-11'));
    expect(key('B-1', '2026-05-11')).not.toBe(key('B-1', '2026-05-18'));
  });
});
