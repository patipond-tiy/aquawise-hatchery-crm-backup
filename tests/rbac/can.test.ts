import { describe, expect, it } from 'vitest';
import { can } from '@/lib/rbac';
import type { Database } from '@/lib/database.types';

type Role = Database['public']['Enums']['nursery_role'];

// Source of truth: `lib/rbac.ts` RULES matrix and `docs/bmad/architecture.md` §4.
// If you change either, update this table in the same commit — the §16 review
// checklist requires it.
const EXPECTED: Record<string, Record<Role, boolean>> = {
  'customer:read':   { owner: true,  counter_staff: true,  lab_tech: true,  auditor: true  },
  'customer:write':  { owner: true,  counter_staff: true,  lab_tech: false, auditor: false },
  'batch:read':      { owner: true,  counter_staff: true,  lab_tech: true,  auditor: true  },
  'batch:write':     { owner: true,  counter_staff: true,  lab_tech: true,  auditor: false },
  'alert:close':     { owner: true,  counter_staff: true,  lab_tech: false, auditor: false },
  'team:invite':     { owner: true,  counter_staff: false, lab_tech: false, auditor: false },
  'settings:write':  { owner: true,  counter_staff: false, lab_tech: false, auditor: false },
  'broadcast:write': { owner: true,  counter_staff: false, lab_tech: false, auditor: false },
  'data:export':     { owner: true,  counter_staff: true,  lab_tech: false, auditor: true  },
  'billing:manage':  { owner: true,  counter_staff: false, lab_tech: false, auditor: false },
};

describe('can()', () => {
  for (const [action, byRole] of Object.entries(EXPECTED)) {
    for (const [role, expected] of Object.entries(byRole)) {
      it(`${role} can${expected ? '' : 'NOT'} perform ${action}`, () => {
        expect(can(role as Role, action as Parameters<typeof can>[1])).toBe(expected);
      });
    }
  }

  it('returns false for undefined role', () => {
    expect(can(undefined, 'customer:read')).toBe(false);
  });
});
