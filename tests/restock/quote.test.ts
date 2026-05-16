import { describe, expect, it } from 'vitest';
import { can } from '@/lib/rbac';
import {
  sendQuote,
  type QuoteLineItem,
} from '@/app/[locale]/(dashboard)/restock/actions';

// D2 — send a quote. Validation runs before any DB write (and before the
// mock-mode short-circuit), so it is testable directly. RBAC is asserted via
// the can() matrix; idempotency/status transitions are DB-enforced (partial
// unique index + check constraint) and exercised in the live UAT.

const okItem: QuoteLineItem = {
  sizeLabel: '300k',
  unitPrice: 0.18,
  quantity: 2,
};

describe('sendQuote — D2 validation', () => {
  it('rejects an empty items array (no insert)', async () => {
    await expect(
      sendQuote({ customerId: 'c1', items: [] })
    ).rejects.toThrow();
  });

  it('rejects a zero / negative unit price', async () => {
    await expect(
      sendQuote({
        customerId: 'c1',
        items: [{ sizeLabel: '300k', unitPrice: 0, quantity: 1 }],
      })
    ).rejects.toThrow();
  });

  it('rejects a non-positive / non-integer quantity', async () => {
    await expect(
      sendQuote({
        customerId: 'c1',
        items: [{ sizeLabel: '300k', unitPrice: 0.18, quantity: 0 }],
      })
    ).rejects.toThrow();
  });

  it('accepts a valid quote (mock mode returns a quote id, no throw)', async () => {
    const res = await sendQuote({ customerId: 'c1', items: [okItem] });
    expect(res.quoteId).toBeTruthy();
    expect(res.duplicate).toBe(false);
  });
});

describe('sendQuote — D2 RBAC', () => {
  it('owner & counter_staff may send; lab_tech & auditor may not', () => {
    expect(can('owner', 'customer:write')).toBe(true);
    expect(can('counter_staff', 'customer:write')).toBe(true);
    expect(can('lab_tech', 'customer:write')).toBe(false);
    expect(can('auditor', 'customer:write')).toBe(false);
  });
});
