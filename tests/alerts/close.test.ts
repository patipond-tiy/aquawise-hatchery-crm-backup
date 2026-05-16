import { describe, expect, it } from 'vitest';
import { can } from '@/lib/rbac';
import { closeAlertAction } from '@/app/[locale]/(dashboard)/alerts/actions';

// E3 — close an alert with a resolution note + follow-up actions.
// The note-required validation runs before the mock short-circuit and any
// DB write, so it is testable directly. The alert_resolutions insert and the
// closed_by/closed_reason coexistence are DB-enforced and exercised in the
// live UAT (E3-resolution-row).

describe('closeAlertAction — E3 validation', () => {
  it('rejects an empty resolution note (no write)', async () => {
    const res = await closeAlertAction('alert-1', '', ['lab_retest']);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/หมายเหตุ/);
  });

  it('rejects a whitespace-only note', async () => {
    const res = await closeAlertAction('alert-1', '   ', []);
    expect(res.ok).toBe(false);
  });

  it('a valid note + actions array is accepted (mock mode closes)', async () => {
    const res = await closeAlertAction(
      'alert-1',
      'ตรวจสอบผล PCR ซ้ำ พบสะอาด',
      ['lab_retest', 'customer_followup']
    );
    expect(res.ok).toBe(true);
  });
});

describe('closeAlertAction — E3 RBAC', () => {
  it('owner & counter_staff may close; lab_tech & auditor may not', () => {
    expect(can('owner', 'alert:close')).toBe(true);
    expect(can('counter_staff', 'alert:close')).toBe(true);
    expect(can('lab_tech', 'alert:close')).toBe(false);
    expect(can('auditor', 'alert:close')).toBe(false);
  });
});
