import { describe, it, expect } from 'vitest';
import {
  isLineTemplate,
  validatePayload,
  MANUAL_TEMPLATES,
} from '@/lib/line/templates';

// G3p — template enum + payload validation guard (pre-insert).
describe('isLineTemplate', () => {
  it('accepts known templates', () => {
    expect(isLineTemplate('restock_reminder')).toBe(true);
    expect(isLineTemplate('disease_alert')).toBe(true);
  });
  it('rejects unknown / non-string', () => {
    expect(isLineTemplate('not_a_template')).toBe(false);
    expect(isLineTemplate(42)).toBe(false);
    expect(isLineTemplate(undefined)).toBe(false);
  });
});

describe('validatePayload', () => {
  const base = { nursery_id: 'n1', customer_id: 'c1' };

  it('rejects chat_nudge in H1 (LIFF inbox deferred)', () => {
    expect(validatePayload('chat_nudge', { ...base, thread_id: 't' })).toMatch(
      /not enqueueable in H1/
    );
  });

  it('requires nursery_id + customer_id', () => {
    expect(validatePayload('restock_reminder', {})).toMatch(/nursery_id/);
    expect(
      validatePayload('restock_reminder', { nursery_id: 'n1' })
    ).toMatch(/customer_id/);
  });

  it('restock_reminder requires cycle_id (idempotency key)', () => {
    expect(validatePayload('restock_reminder', base)).toMatch(/cycle_id/);
    expect(
      validatePayload('restock_reminder', { ...base, cycle_id: 'cy1' })
    ).toBeNull();
  });

  it('disease_alert requires alert_id', () => {
    expect(validatePayload('disease_alert', base)).toMatch(/alert_id/);
    expect(
      validatePayload('disease_alert', { ...base, alert_id: 'a1' })
    ).toBeNull();
  });

  it('custom_note enforces non-empty and 300-char cap', () => {
    expect(validatePayload('custom_note', { ...base, note: '' })).toMatch(
      /non-empty/
    );
    expect(
      validatePayload('custom_note', { ...base, note: 'x'.repeat(301) })
    ).toMatch(/300/);
    expect(
      validatePayload('custom_note', { ...base, note: 'สวัสดีครับ' })
    ).toBeNull();
  });

  it('manual templates list excludes automated-only + chat_nudge', () => {
    expect(MANUAL_TEMPLATES).toContain('restock_reminder');
    expect(MANUAL_TEMPLATES).toContain('custom_note');
    expect(MANUAL_TEMPLATES).not.toContain('disease_alert');
    expect(MANUAL_TEMPLATES).not.toContain('chat_nudge');
  });
});
