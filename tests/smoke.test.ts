import { describe, expect, it } from 'vitest';
import { can } from '@/lib/rbac';

// Smoke test — confirms vitest harness is wired and the @/ alias resolves.
// If this fails, no other test in the suite can run.
describe('smoke', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });

  it('imports project code via @/ alias', () => {
    expect(can('owner', 'billing:manage')).toBe(true);
    expect(can('counter_staff', 'billing:manage')).toBe(false);
    expect(can(undefined, 'billing:manage')).toBe(false);
  });
});
