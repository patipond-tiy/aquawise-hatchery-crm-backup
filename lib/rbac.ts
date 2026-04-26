import type { Database } from '@/lib/database.types';

type Role = Database['public']['Enums']['hatchery_role'];

type Action =
  | 'customer:read'
  | 'customer:write'
  | 'batch:read'
  | 'batch:write'
  | 'alert:close'
  | 'team:invite'
  | 'settings:write'
  | 'data:export'
  | 'billing:manage';

const RULES: Record<Action, Role[]> = {
  'customer:read':   ['owner', 'admin', 'editor', 'viewer', 'technician'],
  'customer:write':  ['owner', 'admin', 'editor'],
  'batch:read':      ['owner', 'admin', 'editor', 'viewer', 'technician'],
  'batch:write':     ['owner', 'admin', 'editor', 'technician'],
  'alert:close':     ['owner', 'admin', 'editor'],
  'team:invite':     ['owner', 'admin'],
  'settings:write':  ['owner', 'admin'],
  'data:export':     ['owner', 'admin'],
  'billing:manage':  ['owner', 'admin'],
};

export function can(role: Role | undefined, action: Action): boolean {
  if (!role) return false;
  return RULES[action].includes(role);
}
