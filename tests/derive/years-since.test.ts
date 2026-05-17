import { describe, expect, it } from 'vitest';
import { yearsSince } from '@/lib/derive/years-since';

const NOW = new Date('2026-05-17T00:00:00.000Z').getTime();

describe('yearsSince', () => {
  it('returns null for missing/invalid input', () => {
    expect(yearsSince(null, NOW)).toBeNull();
    expect(yearsSince(undefined, NOW)).toBeNull();
    expect(yearsSince('not-a-date', NOW)).toBeNull();
  });

  it('floors whole years since the created instant', () => {
    expect(yearsSince('2018-05-01T00:00:00.000Z', NOW)).toBe(8);
    expect(yearsSince('2026-01-01T00:00:00.000Z', NOW)).toBe(0);
  });

  it('never returns a negative number for a future date', () => {
    expect(yearsSince('2030-01-01T00:00:00.000Z', NOW)).toBe(0);
  });
});
