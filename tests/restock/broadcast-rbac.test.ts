import { describe, expect, it } from 'vitest';
import { can } from '@/lib/rbac';

// D3 (NEG-D3-role) — broadcast is owner-only. The restock page now gates the
// "ส่งข้อความหาทุกคน" button render on `can(role, 'broadcast:write')`, and the
// `broadcastToFarms` server action re-checks the same gate (defense-in-depth,
// exercised in the live UAT). This test pins the matrix the UI relies on.

describe('broadcast RBAC (NEG-D3-role)', () => {
  it('only owner may broadcast; counter_staff / lab_tech / auditor may not', () => {
    expect(can('owner', 'broadcast:write')).toBe(true);
    expect(can('counter_staff', 'broadcast:write')).toBe(false);
    expect(can('lab_tech', 'broadcast:write')).toBe(false);
    expect(can('auditor', 'broadcast:write')).toBe(false);
  });

  it('an unknown / absent role is denied', () => {
    expect(can(undefined, 'broadcast:write')).toBe(false);
  });
});
