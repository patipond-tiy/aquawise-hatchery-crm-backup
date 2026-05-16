import { describe, expect, it } from 'vitest';
import { can } from '@/lib/rbac';
import { notifyAlertFarms } from '@/app/[locale]/(dashboard)/alerts/actions';

// E4 — notify affected farms. The fan-out (resolve alert_farms, skip unbound
// line_id, idempotent enqueue via the 006 partial unique index) is
// DB-enforced and exercised in the live UAT (E4-idempotent). Here we assert
// the RBAC matrix and the mock-mode contract.

describe('notifyAlertFarms — E4 mock contract', () => {
  it('mock mode returns { enqueued: 0, skipped: 0 } (no live enqueue)', async () => {
    const res = await notifyAlertFarms('alert-1', 'acknowledge');
    expect(res).toEqual({ enqueued: 0, skipped: 0 });
  });

  it('accepts all three templates', async () => {
    for (const t of ['acknowledge', 'remediation_plan', 'closure'] as const) {
      const res = await notifyAlertFarms('alert-1', t);
      expect(res.enqueued).toBe(0);
    }
  });
});

describe('notifyAlertFarms — E4 RBAC', () => {
  it('owner & counter_staff may notify; lab_tech & auditor may not', () => {
    expect(can('owner', 'alert:close')).toBe(true);
    expect(can('counter_staff', 'alert:close')).toBe(true);
    expect(can('lab_tech', 'alert:close')).toBe(false);
    expect(can('auditor', 'alert:close')).toBe(false);
  });
});
