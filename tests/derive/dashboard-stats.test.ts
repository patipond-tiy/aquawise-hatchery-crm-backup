import { describe, expect, it } from 'vitest';
import { deriveDashboardStats } from '@/lib/derive/dashboard-stats';
import type { Customer, Batch } from '@/lib/types';

function makeCustomer(overrides: Partial<Customer> = {}): Customer {
  return {
    id: 'c1',
    name: 'สมชาย',
    farm: 'ฟาร์มบ้านสวน',
    farmEn: 'Bansuan Farm',
    zone: 'สมุทรสาคร',
    batches: 0,
    ltv: 0,
    lastBuy: '',
    cycleDay: null,
    expectedHarvest: null,
    d30: null,
    d60: null,
    restockIn: null,
    status: 'active',
    ...overrides,
  };
}

function makeBatch(overrides: Partial<Batch> = {}): Batch {
  return {
    id: 'b1',
    date: '2026-04-01',
    source: 'Supplier A',
    plProduced: 1_000_000,
    plSold: 800_000,
    farms: 5,
    meanD30: 80,
    dist: [],
    pcr: 'clean',
    ...overrides,
  };
}

describe('deriveDashboardStats', () => {
  describe('stat 1 — active cycles / total customers', () => {
    it('counts customers with a non-null cycleDay as active', () => {
      const customers = [
        makeCustomer({ id: 'c1', cycleDay: 15 }),
        makeCustomer({ id: 'c2', cycleDay: 30 }),
        makeCustomer({ id: 'c3', cycleDay: null }),
        makeCustomer({ id: 'c4', cycleDay: null }),
      ];
      const { activeCycles, totalCustomers } = deriveDashboardStats(customers, []);
      expect(activeCycles).toBe(2);
      expect(totalCustomers).toBe(4);
    });

    it('returns zero active when no customer has a cycleDay', () => {
      const customers = [
        makeCustomer({ id: 'c1', cycleDay: null }),
        makeCustomer({ id: 'c2', cycleDay: null }),
      ];
      const { activeCycles } = deriveDashboardStats(customers, []);
      expect(activeCycles).toBe(0);
    });
  });

  describe('stat 2 — average D30', () => {
    it('computes rounded average meanD30 across batches with meanD30 > 0', () => {
      const batches = [
        makeBatch({ id: 'b1', meanD30: 80 }),
        makeBatch({ id: 'b2', meanD30: 90 }),
        makeBatch({ id: 'b3', meanD30: 70 }),
      ];
      const { avgD30 } = deriveDashboardStats([], batches);
      expect(avgD30).toBe(80);
    });

    it('excludes batches with meanD30 of 0', () => {
      const batches = [
        makeBatch({ id: 'b1', meanD30: 90 }),
        makeBatch({ id: 'b2', meanD30: 0 }),
      ];
      const { avgD30 } = deriveDashboardStats([], batches);
      expect(avgD30).toBe(90);
    });

    it('returns null when there are no batches', () => {
      const { avgD30 } = deriveDashboardStats([], []);
      expect(avgD30).toBeNull();
    });
  });

  describe('stat 3 — restock within 14 days', () => {
    it('counts customers with restockIn between 1 and 14 inclusive', () => {
      const customers = [
        makeCustomer({ id: 'c1', restockIn: 1 }),
        makeCustomer({ id: 'c2', restockIn: 14 }),
        makeCustomer({ id: 'c3', restockIn: 15 }),
        makeCustomer({ id: 'c4', restockIn: 0 }),
        makeCustomer({ id: 'c5', restockIn: null }),
      ];
      const { restockCount } = deriveDashboardStats(customers, []);
      expect(restockCount).toBe(2);
    });

    it('computes restockPL as average plSold × restock count', () => {
      const customers = [
        makeCustomer({ id: 'c1', restockIn: 7 }),
        makeCustomer({ id: 'c2', restockIn: 10 }),
      ];
      const batches = [
        makeBatch({ id: 'b1', plSold: 600_000 }),
        makeBatch({ id: 'b2', plSold: 400_000 }),
      ];
      // avgPlSold = 500_000, restockCount = 2 => 1_000_000
      const { restockPL } = deriveDashboardStats(customers, batches);
      expect(restockPL).toBe(1_000_000);
    });

    it('returns restockPL of 0 when no customers need restock soon', () => {
      const customers = [
        makeCustomer({ id: 'c1', restockIn: null }),
        makeCustomer({ id: 'c2', restockIn: 30 }),
      ];
      const { restockPL, restockCount } = deriveDashboardStats(customers, []);
      expect(restockCount).toBe(0);
      expect(restockPL).toBe(0);
    });
  });
});
