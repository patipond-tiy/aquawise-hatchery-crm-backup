import 'server-only';
import type {
  Batch,
  BatchDetail,
  Customer,
  CustomerDetail,
  CustomerCallback,
  PcrStatus,
  Quote,
  QuoteLineItem,
  QuoteStatus,
} from '@/lib/types';

function mockActive(): boolean {
  return (
    (process.env.NEXT_PUBLIC_USE_MOCK ?? process.env.USE_MOCK) !== 'false' ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL
  );
}

export async function listCustomersServer(): Promise<Customer[]> {
  if (mockActive()) {
    const { listCustomers } = await import('@/lib/mock/api');
    return listCustomers();
  }
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data } = await supabase
    .from('customers')
    .select(
      `id, name, farm, farm_en, zone, status, ltv, last_buy,
       customer_cycles(cycle_day, expected_harvest, d30, d60, restock_in)`
    );
  if (!data) return [];
  return data.map((row) => {
    const cycle = Array.isArray(row.customer_cycles)
      ? (row.customer_cycles[0] ?? null)
      : ((row.customer_cycles as never) ?? null);
    return {
      id: row.id,
      name: row.name,
      farm: row.farm,
      farmEn: row.farm_en ?? row.farm,
      zone: row.zone ?? '',
      batches: 0,
      ltv: row.ltv,
      lastBuy: row.last_buy ?? '',
      cycleDay: cycle?.cycle_day ?? null,
      expectedHarvest: cycle?.expected_harvest ?? null,
      d30: cycle?.d30 ?? null,
      d60: cycle?.d60 ?? null,
      restockIn: cycle?.restock_in ?? null,
      status: row.status as Customer['status'],
    };
  });
}

export async function listBatchesServer(filters?: {
  pcr?: PcrStatus;
  strain?: string;
  year?: number;
}): Promise<Batch[]> {
  if (mockActive()) {
    const { listBatches } = await import('@/lib/mock/api');
    return listBatches(filters);
  }
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  let q = supabase
    .from('batches')
    .select('id, source, pl_produced, pl_sold, date, pcr, mean_d30, dist');
  if (filters?.pcr) q = q.eq('pcr', filters.pcr);
  if (filters?.strain) q = q.eq('source', filters.strain);
  if (filters?.year) {
    q = q
      .gte('date', `${filters.year}-01-01`)
      .lte('date', `${filters.year}-12-31`);
  }
  const { data } = await q.order('date', { ascending: false });
  return (data ?? []).map((row) => ({
    id: row.id,
    source: row.source,
    plProduced: row.pl_produced,
    plSold: row.pl_sold,
    farms: 0,
    date: row.date,
    pcr: row.pcr as PcrStatus,
    meanD30: row.mean_d30 ?? 0,
    dist: Array.isArray(row.dist)
      ? (row.dist as number[])
      : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  }));
}

/**
 * Server-side read variants for RSC prefetch (CLAUDE.md "Server-component
 * data-fetching": `lib/api/supabase.ts` uses the BROWSER Supabase client, so
 * an RSC that must read real Supabase before render — e.g. the customer /
 * batch detail 404 guard — needs a server-client path).
 *
 * These mirror the exact query shapes in `lib/api/supabase.ts` but bind to
 * the cookie-scoped server client. In mock mode they delegate to the
 * in-memory layer so dev click-through is unchanged. RLS still scopes every
 * row to the caller's nursery.
 */

export async function getCustomerServer(
  id: string
): Promise<CustomerDetail | null> {
  if (mockActive()) {
    const { getCustomer } = await import('@/lib/mock/api');
    return getCustomer(id);
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  const { data } = await supabase
    .from('customers')
    .select(
      `id, name, farm, farm_en, zone, status, ltv, last_buy,
       phone, line_id, address,
       customer_cycles(cycle_day, expected_harvest, d30, d60, restock_in)`
    )
    .eq('id', id)
    .maybeSingle();
  if (!data) return null;

  const cycle = Array.isArray(data.customer_cycles)
    ? (data.customer_cycles[0] ?? null)
    : ((data.customer_cycles as never) ?? null);

  const { data: history } = await supabase
    .from('customer_cycle_history')
    .select('id, batch_id, started_at, d30, d60, harvest')
    .eq('customer_id', id)
    .order('started_at', { ascending: false })
    .limit(6);

  const { data: dist } = await supabase
    .from('batch_buyers')
    .select('batch_id, pl_purchased, d30, batches(id, date, pcr)')
    .eq('customer_id', id);

  type DistRow = {
    batch_id: string;
    pl_purchased: number;
    d30: number | null;
    batches:
      | { id: string; date: string; pcr: string }
      | { id: string; date: string; pcr: string }[]
      | null;
  };
  const batchHistory = ((dist ?? []) as unknown as DistRow[]).map((r) => {
    const b = Array.isArray(r.batches) ? r.batches[0] : r.batches;
    return {
      batchId: r.batch_id,
      date: b?.date ?? '',
      plPurchased: r.pl_purchased,
      d30: r.d30,
      pcr: (b?.pcr ?? 'pending') as PcrStatus,
    };
  });

  const c = data as unknown as {
    id: string;
    name: string;
    farm: string;
    farm_en: string | null;
    zone: string | null;
    status: string;
    ltv: number;
    last_buy: string | null;
    phone: string | null;
    line_id: string | null;
    address: string | null;
  };

  return {
    id: c.id,
    name: c.name,
    farm: c.farm,
    farmEn: c.farm_en ?? c.farm,
    zone: c.zone ?? '',
    batches: batchHistory.length,
    ltv: c.ltv,
    lastBuy: c.last_buy ?? '',
    cycleDay: cycle?.cycle_day ?? null,
    expectedHarvest: cycle?.expected_harvest ?? null,
    d30: cycle?.d30 ?? null,
    d60: cycle?.d60 ?? null,
    restockIn: cycle?.restock_in ?? null,
    status: c.status as CustomerDetail['status'],
    phone: c.phone ?? null,
    lineId: c.line_id ?? null,
    address: c.address ?? null,
    cycleHistory: (history ?? []).map((h) => ({
      id: h.id,
      batchId: h.batch_id,
      startedAt: h.started_at,
      d30: h.d30,
      d60: h.d60,
      harvest: h.harvest,
    })),
    batchHistory,
  };
}

export async function listCallbacksServer(
  customerId: string
): Promise<CustomerCallback[]> {
  if (mockActive()) {
    const { listCallbacks } = await import('@/lib/mock/api');
    return listCallbacks(customerId);
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data } = await supabase
    .from('customer_callbacks')
    .select(
      'id, customer_id, scheduled_for, channel, note, completed_at, created_by'
    )
    .eq('customer_id', customerId)
    .is('completed_at', null)
    .gte('scheduled_for', new Date().toISOString())
    .order('scheduled_for', { ascending: true });
  return (data ?? []).map((r) => ({
    id: r.id,
    customerId: r.customer_id,
    scheduledFor: r.scheduled_for,
    channel: r.channel as 'call' | 'line',
    note: r.note,
    completedAt: r.completed_at,
    createdBy: r.created_by,
  }));
}

export async function listQuotesServer(
  customerId: string
): Promise<Quote[]> {
  if (mockActive()) {
    const { listQuotes } = await import('@/lib/mock/api');
    return listQuotes(customerId);
  }
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data } = await supabase
    .from('quotes')
    .select(
      'id, customer_id, items, note, status, valid_until, sent_at, decided_at'
    )
    .eq('customer_id', customerId)
    .order('sent_at', { ascending: false });
  if (!data) return [];
  return (
    data as unknown as Array<{
      id: string;
      customer_id: string;
      items: unknown;
      note: string | null;
      status: string;
      valid_until: string | null;
      sent_at: string;
      decided_at: string | null;
    }>
  ).map((r) => ({
    id: r.id,
    customerId: r.customer_id,
    items: Array.isArray(r.items) ? (r.items as QuoteLineItem[]) : [],
    note: r.note,
    status: r.status as QuoteStatus,
    validUntil: r.valid_until,
    sentAt: r.sent_at,
    decidedAt: r.decided_at,
  }));
}

export type LineEventServerRow = {
  id: string;
  template: string;
  status: string;
  attempts: number;
  createdAt: string;
  sentAt: string | null;
  lastError: string | null;
  isManual: boolean;
};

export async function listLineEventsServer(
  customerId: string
): Promise<LineEventServerRow[]> {
  if (mockActive()) return [];
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data } = await supabase
    .from('line_outbound_events')
    .select(
      'id, template, status, attempts, created_at, sent_at, last_error, is_manual'
    )
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(20);
  return (data ?? []).map((r) => ({
    id: r.id,
    template: r.template,
    status: r.status,
    attempts: r.attempts,
    createdAt: r.created_at,
    sentAt: r.sent_at,
    lastError: r.last_error,
    isManual: r.is_manual,
  }));
}

export async function getBatchServer(
  id: string
): Promise<BatchDetail | null> {
  if (mockActive()) {
    const { getBatch } = await import('@/lib/mock/api');
    return getBatch(id);
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  const { data } = await supabase
    .from('batches')
    .select('id, source, pl_produced, pl_sold, date, pcr, mean_d30, dist')
    .eq('id', id)
    .maybeSingle();
  if (!data) return null;

  const { data: buyersRaw } = await supabase
    .from('batch_buyers')
    .select('customer_id, pl_purchased, d30, customers(farm, zone)')
    .eq('batch_id', id);
  type BuyerRow = {
    customer_id: string;
    pl_purchased: number;
    d30: number | null;
    customers:
      | { farm: string; zone: string | null }
      | { farm: string; zone: string | null }[]
      | null;
  };
  const buyers = ((buyersRaw ?? []) as unknown as BuyerRow[]).map((r) => {
    const cust = Array.isArray(r.customers) ? r.customers[0] : r.customers;
    return {
      customerId: r.customer_id,
      farm: cust?.farm ?? '',
      zone: cust?.zone ?? '',
      plPurchased: r.pl_purchased,
      d30: r.d30,
    };
  });

  const { data: pcrRaw } = await supabase
    .from('pcr_results')
    .select('id, disease, status, lab, tested_on')
    .eq('batch_id', id)
    .order('disease', { ascending: true });
  const pcrResults = (pcrRaw ?? []).map((p) => ({
    id: p.id,
    disease: p.disease,
    status: p.status,
    lab: p.lab,
    testedOn: p.tested_on,
  }));

  const d30s = buyers
    .map((b) => b.d30)
    .filter((v): v is number => v != null);
  const meanD30 =
    d30s.length > 0
      ? Math.round(d30s.reduce((a, b) => a + b, 0) / d30s.length)
      : (data.mean_d30 ?? 0);

  return {
    id: data.id,
    source: data.source,
    plProduced: data.pl_produced,
    plSold: data.pl_sold,
    farms: buyers.length,
    date: data.date,
    pcr: data.pcr as PcrStatus,
    meanD30,
    dist: Array.isArray(data.dist)
      ? (data.dist as number[])
      : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    buyers,
    pcrResults,
  };
}
