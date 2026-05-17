import type { Batch, Customer } from '@/lib/types';

export type ScorecardStats = {
  /** D30 survival vs the nursery's own median, as a status phrase. */
  d30Status: 'above' | 'at' | 'below' | null;
  /** % of batches passing PCR (pcr === 'clean'). null when no batches. */
  pcrPassPct: number | null;
  /** % of customers who returned for a 2nd+ batch. null when no customers. */
  retentionPct: number | null;
  /** Total lots (batches) and distinct buying farms over the window. */
  lotCount: number;
  farmCount: number;
};

/**
 * Derive the public-scorecard headline stats from real customer + batch
 * data. No hardcoded "100% / 78% / 12 lots / 47 farms" literals — every
 * figure is computed from the live facade rows.
 */
export function deriveScorecardStats(
  customers: Customer[],
  batches: Batch[]
): ScorecardStats {
  const lotCount = batches.length;
  const farmCount = customers.length;

  const pcrPassPct =
    batches.length > 0
      ? Math.round(
          (batches.filter((b) => b.pcr === 'clean').length / batches.length) *
            100
        )
      : null;

  const retentionPct =
    customers.length > 0
      ? Math.round(
          (customers.filter((c) => c.batches > 1).length / customers.length) *
            100
        )
      : null;

  const d30s = batches
    .filter((b) => b.meanD30 > 0)
    .map((b) => b.meanD30)
    .sort((a, b) => a - b);
  let d30Status: ScorecardStats['d30Status'] = null;
  if (d30s.length > 0) {
    const mid = Math.floor(d30s.length / 2);
    const median =
      d30s.length % 2 === 0 ? (d30s[mid - 1] + d30s[mid]) / 2 : d30s[mid];
    const latest = d30s[d30s.length - 1];
    d30Status = latest > median ? 'above' : latest < median ? 'below' : 'at';
  }

  return { d30Status, pcrPassPct, retentionPct, lotCount, farmCount };
}
