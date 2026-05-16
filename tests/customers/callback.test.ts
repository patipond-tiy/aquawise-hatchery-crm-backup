import { describe, expect, it } from 'vitest';
import { can } from '@/lib/rbac';
import {
  scheduleCallback,
  completeCallback,
  listCallbacks,
} from '@/lib/mock/api';

// B4 — schedule a callback. Past-date guard + RBAC. The server action
// (customers/actions.ts) wraps the same past-date guard before any DB write;
// the mock layer mirrors it so dev click-through is consistent.

describe('scheduleCallback — B4', () => {
  it('rejects a past date (no insert)', async () => {
    const past = new Date(Date.now() - 3600_000).toISOString();
    await expect(
      scheduleCallback({
        customerId: 'c1',
        scheduledFor: past,
        channel: 'call',
      })
    ).rejects.toThrow();
  });

  it('inserts a future callback and lists it; completing removes it', async () => {
    const future = new Date(Date.now() + 86400_000).toISOString();
    const cb = await scheduleCallback({
      customerId: 'cust-b4',
      scheduledFor: future,
      channel: 'line',
      note: 'โทรหาพรุ่งนี้',
    });
    expect(cb.completedAt).toBeNull();
    let list = await listCallbacks('cust-b4');
    expect(list.map((x) => x.id)).toContain(cb.id);
    await completeCallback(cb.id);
    list = await listCallbacks('cust-b4');
    expect(list.map((x) => x.id)).not.toContain(cb.id);
  });

  it('RBAC: counter_staff may schedule; lab_tech & auditor may not', () => {
    expect(can('counter_staff', 'customer:write')).toBe(true);
    expect(can('lab_tech', 'customer:write')).toBe(false);
    expect(can('auditor', 'customer:write')).toBe(false);
  });
});
