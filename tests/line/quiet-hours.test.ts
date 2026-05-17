import { describe, it, expect } from 'vitest';
import {
  isInQuietHours,
  nowInICT,
  nextWindowOpenUTC,
} from '@/lib/line/quiet-hours';

// H4 — quiet-hours pure time math (ICT, overnight wrap).
describe('isInQuietHours — overnight 21:00–07:00', () => {
  it('22:00 is inside the quiet window', () => {
    expect(isInQuietHours('22:00', '21:00:00', '07:00:00')).toBe(true);
  });

  it('00:30 (midnight wrap) is inside the quiet window', () => {
    expect(isInQuietHours('00:30', '21:00:00', '07:00:00')).toBe(true);
  });

  it('07:01 is OUTSIDE the quiet window', () => {
    expect(isInQuietHours('07:01', '21:00:00', '07:00:00')).toBe(false);
  });

  it('12:00 midday is outside the quiet window', () => {
    expect(isInQuietHours('12:00', '21:00:00', '07:00:00')).toBe(false);
  });

  it('exact end 07:00 is outside (window is [start,end))', () => {
    expect(isInQuietHours('07:00', '21:00:00', '07:00:00')).toBe(false);
  });

  it('zero-width window is never quiet', () => {
    expect(isInQuietHours('21:00', '21:00:00', '21:00:00')).toBe(false);
  });
});

describe('isInQuietHours — same-day 13:00–14:00', () => {
  it('13:30 inside', () => {
    expect(isInQuietHours('13:30', '13:00', '14:00')).toBe(true);
  });
  it('12:59 outside', () => {
    expect(isInQuietHours('12:59', '13:00', '14:00')).toBe(false);
  });
});

describe('nowInICT', () => {
  it('adds +7h offset and returns HH:MM', () => {
    // 2026-05-17T00:00:00Z → 07:00 ICT
    const v = nowInICT(new Date('2026-05-17T00:00:00Z'));
    expect(v).toBe('07:00');
  });
});

describe('nextWindowOpenUTC', () => {
  it('event at 22:00 ICT defers to next 07:00 ICT (00:00 UTC next day)', () => {
    // 2026-05-17T15:00:00Z = 22:00 ICT same day
    const at = new Date('2026-05-17T15:00:00Z');
    const open = nextWindowOpenUTC('07:00:00', at);
    // 07:00 ICT = 00:00 UTC; today's 00:00 UTC already passed → +1 day
    expect(open.toISOString()).toBe('2026-05-18T00:00:00.000Z');
  });
});
