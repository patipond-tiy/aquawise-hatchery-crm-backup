import type { Database } from '@/lib/database.types';

type Role = Database['public']['Enums']['nursery_role'];

type Action =
  | 'customer:read'
  | 'customer:write'
  | 'batch:read'
  | 'batch:write'
  | 'pcr:write'
  | 'alert:close'
  | 'team:invite'
  | 'settings:write'
  | 'broadcast:write'
  | 'data:export'
  | 'billing:manage';

// Roles per docs/product-spec/08-roles-and-rls.md:
//   owner          — full CRUD; manages team, billing, scorecard, thresholds; broadcasts
//   counter_staff  — customer + batch CRUD; sends quotes/certs/alerts via LINE (per-customer, not broadcast)
//   lab_tech       — PCR rows + cert generation; cannot create batches or send alerts
//   auditor        — read-only on batches, PCR, alerts (Phase H3 surface)
// `pcr:write` is finer-grained than `batch:write`: counter_staff may register a
// batch row but must NOT write pcr_results / generate certs (C1 AC #7, C4 AC #8).
const RULES: Record<Action, Role[]> = {
  'customer:read':   ['owner', 'counter_staff', 'lab_tech', 'auditor'],
  'customer:write':  ['owner', 'counter_staff'],
  'batch:read':      ['owner', 'counter_staff', 'lab_tech', 'auditor'],
  'batch:write':     ['owner', 'counter_staff', 'lab_tech'],
  'pcr:write':       ['owner', 'lab_tech'],
  'alert:close':     ['owner', 'counter_staff'],
  'team:invite':     ['owner'],
  'settings:write':  ['owner'],
  'broadcast:write': ['owner'],
  'data:export':     ['owner', 'counter_staff', 'auditor'],
  'billing:manage':  ['owner'],
};

export function can(role: Role | undefined, action: Action): boolean {
  if (!role) return false;
  return RULES[action].includes(role);
}
