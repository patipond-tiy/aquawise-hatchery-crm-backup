import { describe, expect, it } from 'vitest';
import { can } from '@/lib/rbac';
import { renderPcrCertPdf } from '@/lib/pdf/cert';
import type { BatchDetail, NurseryBrand } from '@/lib/types';

// C4 — PCR certificate. renderPcrCertPdf returns a real PDF Buffer (magic
// bytes %PDF). RBAC: only pcr:write (owner/lab_tech) may generate;
// counter_staff & auditor may not. The send union (customer:write OR
// pcr:write) covers owner/counter_staff/lab_tech and excludes auditor.

const BATCH: BatchDetail = {
  id: 'B-2605-A',
  date: '2026-05-10',
  source: 'CP-Genetics Line A',
  plProduced: 2_400_000,
  plSold: 1_820_000,
  farms: 2,
  meanD30: 80,
  dist: [],
  pcr: 'clean',
  buyers: [],
  pcrResults: [
    {
      id: 'p1',
      disease: 'WSSV',
      status: 'negative',
      lab: 'กรมประมง',
      testedOn: '2026-05-09',
    },
  ],
};

const BRAND: NurseryBrand = {
  displayNameTh: 'โรงอนุบาลฟ้าใส',
  displayNameEn: 'Fasai Nursery',
  logoUrl: null,
  brandColor: '#004AAD',
};

describe('renderPcrCertPdf — C4', () => {
  it('returns a valid PDF buffer (first 4 bytes %PDF)', async () => {
    const buf = await renderPcrCertPdf(BATCH, BRAND);
    expect(buf.length).toBeGreaterThan(1000);
    expect(buf.subarray(0, 4).toString('latin1')).toBe('%PDF');
  }, 20000);

  it('RBAC: only owner & lab_tech may generate a cert', () => {
    expect(can('owner', 'pcr:write')).toBe(true);
    expect(can('lab_tech', 'pcr:write')).toBe(true);
    expect(can('counter_staff', 'pcr:write')).toBe(false);
    expect(can('auditor', 'pcr:write')).toBe(false);
  });

  it('send union covers owner/counter_staff/lab_tech, excludes auditor', () => {
    const canSend = (r: Parameters<typeof can>[0]) =>
      can(r, 'customer:write') || can(r, 'pcr:write');
    expect(canSend('owner')).toBe(true);
    expect(canSend('counter_staff')).toBe(true);
    expect(canSend('lab_tech')).toBe(true);
    expect(canSend('auditor')).toBe(false);
  });
});
