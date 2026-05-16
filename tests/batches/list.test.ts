import { describe, expect, it } from 'vitest';
import { can } from '@/lib/rbac';
import { listBatches } from '@/lib/mock/api';

// C2 — browse & review. listBatches accepts optional filters; auditor has
// batch:read (read-only). Auditor commercial-field hiding is deferred to H3
// per docs/bmad/decisions-2026-05-15-fix-review.md §C2.

describe('listBatches — C2 filters', () => {
  it('returns all batches with no filter', async () => {
    const all = await listBatches();
    expect(all.length).toBeGreaterThan(0);
  });

  it('pcr=clean filter returns only clean batches', async () => {
    const clean = await listBatches({ pcr: 'clean' });
    expect(clean.every((b) => b.pcr === 'clean')).toBe(true);
  });

  it('strain filter returns only that source', async () => {
    const all = await listBatches();
    const src = all[0]!.source;
    const filtered = await listBatches({ strain: src });
    expect(filtered.every((b) => b.source === src)).toBe(true);
  });

  it('auditor has batch:read (read-only browse)', () => {
    expect(can('auditor', 'batch:read')).toBe(true);
  });
});
