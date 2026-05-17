import type { Batch } from '@/lib/types';

export type D30Trend = {
  /** Chronological mean-D30 series (oldest → newest) from real batches. */
  series: number[];
  /** Latest mean D30 (the ring value). null when no D30 data exists. */
  latest: number | null;
  /** % change first → latest across the window. null when undeterminable. */
  deltaPct: number | null;
};

/**
 * Derive the right-rail D30 trend from the real batch list. No hardcoded
 * sample series — every point is a batch's `meanD30`. Batches with no D30
 * signal (`meanD30 <= 0`) are excluded so the trend reflects measured data.
 */
export function deriveD30Trend(batches: Batch[], maxPoints = 12): D30Trend {
  const withD30 = batches
    .filter((b) => b.meanD30 > 0)
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((b) => Math.round(b.meanD30));

  const series = withD30.slice(-maxPoints);
  if (series.length === 0) {
    return { series: [], latest: null, deltaPct: null };
  }

  const latest = series[series.length - 1];
  const first = series[0];
  const deltaPct =
    series.length >= 2 && first > 0
      ? Math.round(((latest - first) / first) * 100)
      : null;

  return { series, latest, deltaPct };
}
