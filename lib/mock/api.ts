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
  BatchDetail,
  Customer,
  CustomerDetail,
  CustomerCallback,
  ContinueWatchingItem,
  Nursery,
  NotificationSettings,
  PcrStatus,
  Prices,
  Quote,
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
  callbacks: [] as CustomerCallback[],
};

const delay = <T>(value: T, ms = 80): Promise<T> =>
  new Promise((r) => setTimeout(() => r(value), ms));

export async function getNursery(): Promise<Nursery> {
  return delay(NURSERY);
}

export async function listCustomers(): Promise<Customer[]> {
  return delay(state.customers);
}

export async function getCustomer(
  id: string
): Promise<CustomerDetail | null> {
  const c = state.customers.find((x) => x.id === id);
  if (!c) return delay(null);
  // Mirror the live query shape: a real D30 series + batch history derived
  // from the seeded mock data (no hardcoded literals).
  const d30 = c.d30 ?? 78;
  const cycleHistory = [0, 1, 2, 3, 4, 5].map((i) => ({
    id: `${id}-h${i}`,
    batchId: state.batches[i % state.batches.length]?.id ?? null,
    startedAt: new Date(Date.now() - i * 40 * 864e5).toISOString(),
    d30: Math.max(60, d30 - i * 2),
    d60: Math.max(55, d30 - i * 2 - 3),
    harvest: 'จบรอบ',
  }));
  const batchHistory = state.batches.slice(0, c.batches).map((b) => ({
    batchId: b.id,
    date: b.date,
    plPurchased: 300_000,
    d30: c.d30,
    pcr: b.pcr,
  }));
  return delay({
    ...c,
    phone: '081-555-0000',
    lineId: null,
    address: `ต.บ้านบ่อ ${c.zone}`,
    cycleHistory,
    batchHistory,
  });
}

export type BatchListFilters = {
  pcr?: PcrStatus;
  strain?: string;
  year?: number;
};

export async function listBatches(
  filters?: BatchListFilters
): Promise<Batch[]> {
  let list = state.batches;
  if (filters?.pcr) list = list.filter((b) => b.pcr === filters.pcr);
  if (filters?.strain) list = list.filter((b) => b.source === filters.strain);
  if (filters?.year)
    list = list.filter(
      (b) => new Date(b.date).getFullYear() === filters.year
    );
  return delay(list);
}

export async function getBatch(id: string): Promise<BatchDetail | null> {
  const b = state.batches.find((x) => x.id === id);
  if (!b) return delay(null);
  const buyers = state.customers.slice(0, b.farms).map((c) => ({
    customerId: c.id,
    farm: c.farm,
    zone: c.zone,
    plPurchased: 300_000,
    d30: c.d30,
  }));
  const pcrResults = (['WSSV', 'EHP', 'IHHNV', 'TSV'] as const).map(
    (disease, i) => ({
      id: `${id}-${disease}`,
      disease,
      status:
        b.pcr === 'flagged' && disease === 'EHP' ? 'positive' : 'negative',
      lab: 'กรมประมง',
      testedOn: b.date,
    })
  );
  const d30s = buyers
    .map((x) => x.d30)
    .filter((v): v is number => v != null);
  const meanD30 =
    d30s.length > 0
      ? Math.round(d30s.reduce((a, c) => a + c, 0) / d30s.length)
      : b.meanD30;
  return delay({ ...b, meanD30, buyers, pcrResults });
}

export async function listCallbacks(
  customerId: string
): Promise<CustomerCallback[]> {
  const now = Date.now();
  return delay(
    state.callbacks
      .filter(
        (c) =>
          c.customerId === customerId &&
          c.completedAt == null &&
          new Date(c.scheduledFor).getTime() >= now
      )
      .sort(
        (a, b) =>
          new Date(a.scheduledFor).getTime() -
          new Date(b.scheduledFor).getTime()
      )
  );
}

export async function listAlerts(): Promise<Alert[]> {
  return delay(state.alerts.filter((a) => !a.closed));
}

export async function listQuotes(_customerId: string): Promise<Quote[]> {
  void _customerId;
  return delay([]);
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

export async function getContinueWatching(
  limit = 3
): Promise<ContinueWatchingItem[]> {
  // Latest batch by date — the same "most recent batch the customer relates
  // to" semantics as the live join, derived from real mock data (no
  // hardcoded literal).
  const latestBatch = [...state.batches].sort((a, b) =>
    b.date.localeCompare(a.date)
  )[0];
  const items = state.customers
    .filter((c) => c.cycleDay !== null)
    .sort((a, b) => (a.restockIn ?? 1e9) - (b.restockIn ?? 1e9))
    .slice(0, limit)
    .map((c) => ({
      customerId: c.id,
      name: c.name,
      farm: c.farm,
      zone: c.zone,
      cycleDay: c.cycleDay,
      batchRef: latestBatch?.id ?? null,
    }));
  return delay(items);
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

export type PcrResultInput = { disease: string; status: string };

export type AddBatchInput = Pick<Batch, 'source' | 'plProduced' | 'date'> & {
  pcrResults?: PcrResultInput[];
  pcrLab?: string;
  pcrFileUrl?: string;
};

export async function addBatch(input: AddBatchInput): Promise<Batch> {
  const idx = state.batches.length;
  const id =
    'B-' + (2604 + idx).toString().slice(0, 4) + '-' + 'XYZWV'[idx % 5];
  const diseases = input.pcrResults ?? [];
  const pcr: PcrStatus =
    diseases.length === 0
      ? 'pending'
      : diseases.some((d) => d.status === 'positive')
        ? 'flagged'
        : diseases.every((d) => d.status === 'negative')
          ? 'clean'
          : 'pending';
  const next: Batch = {
    id,
    date: input.date,
    source: input.source,
    plProduced: input.plProduced,
    plSold: 0,
    farms: 0,
    meanD30: 0,
    dist: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    pcr,
  };
  state.batches = [next, ...state.batches];
  return delay(next, 120);
}

export type ScheduleCallbackInput = {
  customerId: string;
  scheduledFor: string;
  channel: 'call' | 'line';
  note?: string;
};

export async function scheduleCallback(
  input: ScheduleCallbackInput
): Promise<CustomerCallback> {
  if (new Date(input.scheduledFor).getTime() <= Date.now()) {
    throw new Error('PAST_DATE');
  }
  const cb: CustomerCallback = {
    id: 'cb-' + (state.callbacks.length + 1),
    customerId: input.customerId,
    scheduledFor: input.scheduledFor,
    channel: input.channel,
    note: input.note ?? null,
    completedAt: null,
    createdBy: 'mock-user',
  };
  state.callbacks = [...state.callbacks, cb];
  return delay(cb, 80);
}

export async function completeCallback(callbackId: string): Promise<void> {
  state.callbacks = state.callbacks.map((c) =>
    c.id === callbackId
      ? { ...c, completedAt: new Date().toISOString() }
      : c
  );
  return delay(undefined, 60);
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
