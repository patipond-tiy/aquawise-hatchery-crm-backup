import { describe, it, expect, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { ulid } from '@/lib/line/ulid';

// G1 — bind token generator.
describe('ulid', () => {
  it('is exactly 26 chars, Crockford base32 alphabet', () => {
    const v = ulid();
    expect(v).toHaveLength(26);
    expect(v).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/);
  });

  it('is monotonic by timestamp prefix (sortable)', () => {
    const a = ulid(1_000_000_000_000);
    const b = ulid(2_000_000_000_000);
    expect(a.slice(0, 10) < b.slice(0, 10)).toBe(true);
  });

  it('is unique across many calls', () => {
    const set = new Set(Array.from({ length: 500 }, () => ulid()));
    expect(set.size).toBe(500);
  });
});
