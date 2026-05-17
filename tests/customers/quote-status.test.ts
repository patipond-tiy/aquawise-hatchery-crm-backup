import { describe, expect, it } from 'vitest';
import { can } from '@/lib/rbac';
import {
  updateQuoteStatus,
} from '@/app/[locale]/(dashboard)/customers/[id]/actions';

// D2 (status machine) — rep-driven quote status transition. Input validation
// and the mock-mode short-circuit are testable directly; the sent → decided
// state machine + RBAC are DB/`can()`-enforced and exercised in the live UAT.

describe('updateQuoteStatus — D2 status machine', () => {
  it('rejects an invalid decision before any DB work', async () => {
    const res = await updateQuoteStatus(
      'q1',
      'bogus' as unknown as 'accepted'
    );
    expect(res).toEqual({ ok: false, error: 'invalid status' });
  });

  it('accepts a valid decision (mock mode returns ok, no DB write)', async () => {
    for (const d of ['accepted', 'declined', 'expired'] as const) {
      const res = await updateQuoteStatus('q1', d);
      expect(res).toEqual({ ok: true });
    }
  });
});

describe('updateQuoteStatus — D2 RBAC', () => {
  it('owner & counter_staff may decide; lab_tech & auditor may not', () => {
    expect(can('owner', 'customer:write')).toBe(true);
    expect(can('counter_staff', 'customer:write')).toBe(true);
    expect(can('lab_tech', 'customer:write')).toBe(false);
    expect(can('auditor', 'customer:write')).toBe(false);
  });
});
