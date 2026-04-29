import type { Customer, Batch } from '@/lib/types';

export type DashboardStats = {
  activeCycles: number;
  totalCustomers: number;
  avgD30: number | null;
  restockCount: number;
  restockPL: number;
};

export function deriveDashboardStats(
  customers: Customer[],
  batches: Batch[]
): DashboardStats {
  const totalCustomers = customers.length;
  const activeCycles = customers.filter((c) => c.cycleDay !== null).length;

  const batchesWithD30 = batches.filter((b) => b.meanD30 > 0);
  const avgD30 =
    batchesWithD30.length > 0
      ? Math.round(
          batchesWithD30.reduce((sum, b) => sum + b.meanD30, 0) /
            batchesWithD30.length
        )
      : null;

  const restockCustomers = customers.filter(
    (c) => c.restockIn !== null && c.restockIn > 0 && c.restockIn <= 14
  );
  const restockCount = restockCustomers.length;

  // Estimate PL volume: average plSold per batch, scaled by restock count.
  // plSold is the closest available proxy for upcoming order size.
  const avgPlPerBatch =
    batches.length > 0
      ? batches.reduce((sum, b) => sum + b.plSold, 0) / batches.length
      : 0;
  const restockPL = Math.round(avgPlPerBatch * restockCount);

  return { activeCycles, totalCustomers, avgD30, restockCount, restockPL };
}
