import {
  ALERTS,
  BATCHES,
  CUSTOMERS,
  DEFAULT_NOTIFICATIONS,
  DEFAULT_SCORECARD,
  NURSERY,
  PRICES,
  TEAM,
} from './data';
import type {
  Alert,
  Batch,
  Customer,
  Nursery,
  NotificationSettings,
  Prices,
  ScorecardSettings,
  TeamMember,
} from '@/lib/types';

// In-memory mutable copies so dev mutations persist across navigations within a session.
const state = {
  customers: [...CUSTOMERS],
  batches: [...BATCHES],
  alerts: [...ALERTS],
  scorecard: { ...DEFAULT_SCORECARD },
  notifications: { ...DEFAULT_NOTIFICATIONS },
};

const delay = <T>(value: T, ms = 80): Promise<T> =>
  new Promise((r) => setTimeout(() => r(value), ms));

export async function getNursery(): Promise<Nursery> {
  return delay(NURSERY);
}

export async function listCustomers(): Promise<Customer[]> {
  return delay(state.customers);
}

export async function getCustomer(id: string): Promise<Customer | null> {
  return delay(state.customers.find((c) => c.id === id) ?? null);
}

export async function listBatches(): Promise<Batch[]> {
  return delay(state.batches);
}

export async function getBatch(id: string): Promise<Batch | null> {
  return delay(state.batches.find((b) => b.id === id) ?? null);
}

export async function listAlerts(): Promise<Alert[]> {
  return delay(state.alerts.filter((a) => !a.closed));
}

export async function getPrices(): Promise<Prices> {
  return delay(PRICES);
}

export async function listTeam(): Promise<TeamMember[]> {
  return delay(TEAM);
}

export async function getScorecardSettings(): Promise<ScorecardSettings> {
  return delay(state.scorecard);
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  return delay(state.notifications);
}

// Mutations -------------------------------------------------------------------

export type AddCustomerInput = Pick<Customer, 'farm' | 'name' | 'zone'> & {
  phone?: string;
  plan?: string;
};

export async function addCustomer(input: AddCustomerInput): Promise<Customer> {
  const id = 'C' + String(900 + state.customers.length).padStart(3, '0');
  const next: Customer = {
    id,
    name: input.name,
    farm: input.farm,
    farmEn: input.farm,
    zone: input.zone,
    batches: 0,
    ltv: 0,
    lastBuy: new Date().toISOString().slice(0, 10),
    cycleDay: null,
    expectedHarvest: null,
    d30: null,
    d60: null,
    restockIn: null,
    status: 'active',
  };
  state.customers = [next, ...state.customers];
  return delay(next, 120);
}

export type AddBatchInput = Pick<Batch, 'source' | 'plProduced' | 'date'> & {
  pcr?: 'clean' | 'flagged' | 'pending';
};

export async function addBatch(input: AddBatchInput): Promise<Batch> {
  const idx = state.batches.length;
  const id = 'B-' + (2604 + idx).toString().slice(0, 4) + '-' + 'XYZWV'[idx % 5];
  const next: Batch = {
    id,
    date: input.date,
    source: input.source,
    plProduced: input.plProduced,
    plSold: 0,
    farms: 0,
    meanD30: 0,
    dist: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    pcr: input.pcr ?? 'pending',
  };
  state.batches = [next, ...state.batches];
  return delay(next, 120);
}

export async function closeAlert(id: string): Promise<void> {
  state.alerts = state.alerts.map((a) =>
    a.id === id ? { ...a, closed: true } : a
  );
  return delay(undefined, 80);
}

export async function updateScorecardSettings(
  patch: Partial<ScorecardSettings>
): Promise<ScorecardSettings> {
  state.scorecard = { ...state.scorecard, ...patch };
  return delay(state.scorecard, 60);
}

export async function updateNotificationSettings(
  patch: Partial<NotificationSettings>
): Promise<NotificationSettings> {
  state.notifications = { ...state.notifications, ...patch };
  return delay(state.notifications, 60);
}

// ============================================================
// Billing — mock implementations exposed through the api facade
// ============================================================

export { getSubscription, getInvoiceHistory } from './billing';
