import { describe, expect, it } from 'vitest';
import {
  BATCH_CODE_REGEX,
  BATCH_CODE_ALPHABET,
  validateBatchCode,
} from '@/lib/aquawise-core';
import { parseClaimBody } from '@/lib/jwt/claim-body-schema';

// Contract §4 — batch_code format the CRM mints and re-validates, plus the
// §6 claim body field-order validation.

describe('batch_code (contract §4)', () => {
  it('alphabet excludes confusables 0 O 1 I L', () => {
    for (const c of '0O1Il') {
      expect(BATCH_CODE_ALPHABET).not.toContain(c);
    }
  });

  it('accepts a well-formed code', () => {
    expect(validateBatchCode('B-A4F2K7')).toBe(true);
    expect(BATCH_CODE_REGEX.test('B-ZZZ999')).toBe(true);
  });

  it('rejects codes with excluded confusables / wrong shape', () => {
    expect(validateBatchCode('B-0O1Il2')).toBe(false);
    expect(validateBatchCode('B-ABC')).toBe(false);
    expect(validateBatchCode('A4F2K7')).toBe(false);
    expect(validateBatchCode('b-a4f2k7')).toBe(false);
    expect(validateBatchCode(123)).toBe(false);
  });
});

describe('claim body validation (contract §6)', () => {
  const ok = {
    line_user_id: 'U' + 'f'.repeat(32),
    pond_id: 'p_1',
    line_profile: { display_name: 'พี่ปลา', picture_url: 'https://x/y' },
    correlation_id: '33333333-3333-4333-8333-333333333333',
  };

  it('accepts a valid body', () => {
    const r = parseClaimBody(ok);
    expect(r.ok).toBe(true);
  });

  it('names line_user_id first when missing/malformed', () => {
    expect(parseClaimBody({ ...ok, line_user_id: 'x' })).toEqual({
      ok: false,
      field: 'line_user_id',
    });
  });

  it('names pond_id when missing', () => {
    const { pond_id, ...rest } = ok;
    void pond_id;
    expect(parseClaimBody(rest)).toEqual({ ok: false, field: 'pond_id' });
  });

  it('names line_profile when incomplete', () => {
    expect(
      parseClaimBody({ ...ok, line_profile: { display_name: 'a' } })
    ).toEqual({ ok: false, field: 'line_profile' });
  });

  it('names correlation_id when not uuid v4', () => {
    expect(parseClaimBody({ ...ok, correlation_id: 'nope' })).toEqual({
      ok: false,
      field: 'correlation_id',
    });
  });
});
