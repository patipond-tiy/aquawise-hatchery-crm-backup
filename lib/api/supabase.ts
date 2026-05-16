/**
 * Supabase-backed implementations of the API surface in `lib/api.ts`.
 * These run client-side via the browser Supabase client. RLS scopes results
 * to the user's nursery membership.
 *
 * For mutations that need to write `audit_log`, prefer server actions
 * (see actions.ts files under app/[locale]/(dashboard)/).
 */

import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/database.types';
import type {
  Alert,
  Batch,
  Customer,
  ContinueWatchingItem,
  Nursery,
  NotificationSettings,
  Prices,
  ScorecardSettings,
  TeamMember,
  CustomerStatus,
  PcrStatus,
} from '@/lib/types';
import type { AddBatchInput, AddCustomerInput } from '@/lib/mock/api';
import { PRICES, TEAM, NURSERY } from '@/lib/mock/data';

function rowToCustomer(
  row: {
    id: string;
    name: string;
    farm: string;
    farm_en: string | null;
    zone: string | null;
    status: string;
    ltv: number;
    last_buy: string | null;
  },
  cycle: {
    cycle_day: number | null;
    expected_harvest: string | null;
    d30: number | null;
    d60: number | null;
    restock_in: number | null;
  } | null,
  batchCount = 0
): Customer {
  return {
    id: row.id,
    name: row.name,
    farm: row.farm,
    farmEn: row.farm_en ?? row.farm,
    zone: row.zone ?? '',
    batches: batchCount,
    ltv: row.ltv,
    lastBuy: row.last_buy ?? '',
    cycleDay: cycle?.cycle_day ?? null,
    expectedHarvest: cycle?.expected_harvest ?? null,
    d30: cycle?.d30 ?? null,
    d60: cycle?.d60 ?? null,
    restockIn: cycle?.restock_in ?? null,
    status: row.status as CustomerStatus,
  };
}

function rowToBatch(row: {
  id: string;
  source: string;
  pl_produced: number;
  pl_sold: number;
  date: string;
  pcr: string;
  mean_d30: number | null;
  dist: unknown;
}): Batch {
  return {
    id: row.id,
    source: row.source,
    plProduced: row.pl_produced,
    plSold: row.pl_sold,
    farms: 0,
    date: row.date,
    pcr: row.pcr as PcrStatus,
    meanD30: row.mean_d30 ?? 0,
    dist: Array.isArray(row.dist) ? (row.dist as number[]) : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  };
}

export async function getNursery(): Promise<Nursery> {
  const supabase = createClient();
  // Cast to any so we can read restock_thresholds (added by migration 010)
  // without waiting for a generated-types regen.
  const { data } = await (supabase as any)
    .from('nurseries')
    .select('name, name_en, location, location_en, restock_thresholds')
    .limit(1)
    .single() as { data: {
      name: string;
      name_en: string | null;
      location: string | null;
      location_en: string | null;
      restock_thresholds: { now?: number; week?: number; month?: number } | null;
    } | null };
  if (!data) return NURSERY;
  const raw = data.restock_thresholds;
  return {
    name: data.name,
    nameEn: data.name_en ?? data.name,
    location: data.location ?? '',
    locationEn: data.location_en ?? '',
    restockThresholds: {
      now: raw?.now ?? 0,
      week: raw?.week ?? 14,
      month: raw?.month ?? 45,
    },
  };
}

export async function listCustomers(): Promise<Customer[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('customers')
    .select(
      // Left join on customer_cycles — a customer with no cycle row must
      // still appear in the list (otherwise net-new customers vanish until
      // their first cycle is registered). rowToCustomer handles null cycle.
      `id, name, farm, farm_en, zone, status, ltv, last_buy,
       customer_cycles(cycle_day, expected_harvest, d30, d60, restock_in)`
    );
  if (!data) return [];
  return data.map((row) =>
    rowToCustomer(
      row,
      Array.isArray(row.customer_cycles)
        ? row.customer_cycles[0] ?? null
        : (row.customer_cycles as never) ?? null
    )
  );
}

export async function getCustomer(id: string): Promise<Customer | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('customers')
    .select(
      `id, name, farm, farm_en, zone, status, ltv, last_buy,
       customer_cycles(cycle_day, expected_harvest, d30, d60, restock_in)`
    )
    .eq('id', id)
    .maybeSingle();
  if (!data) return null;
  return rowToCustomer(
    data,
    Array.isArray(data.customer_cycles)
      ? data.customer_cycles[0] ?? null
      : (data.customer_cycles as never) ?? null
  );
}

export async function getContinueWatching(
  limit = 3
): Promise<ContinueWatchingItem[]> {
  const supabase = createClient();
  // Customers with an active cycle, nearest restock first. RLS scopes rows.
  const { data } = await supabase
    .from('customers')
    .select(
      `id, name, farm, zone,
       customer_cycles(cycle_day, restock_in),
       batch_buyers(batch_id, created_at)`
    );
  if (!data) return [];

  type Row = {
    id: string;
    name: string;
    farm: string;
    zone: string | null;
    customer_cycles:
      | { cycle_day: number | null; restock_in: number | null }
      | { cycle_day: number | null; restock_in: number | null }[]
      | null;
    batch_buyers:
      | { batch_id: string; created_at: string }[]
      | { batch_id: string; created_at: string }
      | null;
  };

  const rows = data as unknown as Row[];

  return rows
    .map((r) => {
      const cycle = Array.isArray(r.customer_cycles)
        ? r.customer_cycles[0] ?? null
        : r.customer_cycles;
      const buyers = Array.isArray(r.batch_buyers)
        ? r.batch_buyers
        : r.batch_buyers
          ? [r.batch_buyers]
          : [];
      // Real latest batch the customer purchased from.
      const latest = buyers
        .slice()
        .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
      return {
        customerId: r.id,
        name: r.name,
        farm: r.farm,
        zone: r.zone ?? '',
        cycleDay: cycle?.cycle_day ?? null,
        batchRef: latest?.batch_id ?? null,
        _restockIn: cycle?.restock_in ?? null,
      };
    })
    .filter((c) => c.cycleDay !== null)
    .sort((a, b) => (a._restockIn ?? 1e9) - (b._restockIn ?? 1e9))
    .slice(0, limit)
    .map(({ _restockIn, ...item }) => {
      void _restockIn;
      return item;
    });
}

export async function listBatches(): Promise<Batch[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('batches')
    .select('id, source, pl_produced, pl_sold, date, pcr, mean_d30, dist')
    .order('date', { ascending: false });
  return (data ?? []).map(rowToBatch);
}

export async function getBatch(id: string): Promise<Batch | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('batches')
    .select('id, source, pl_produced, pl_sold, date, pcr, mean_d30, dist')
    .eq('id', id)
    .maybeSingle();
  if (!data) return null;
  return rowToBatch(data);
}

export async function listAlerts(): Promise<Alert[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('alerts')
    .select(
      `id, sev, title, description, batch_id, action, closed, created_at,
       alert_farms(customers(farm))`
    )
    .eq('closed', false)
    // Severity first, then recency — high alerts must surface above medium/low
    // regardless of creation date (per 03-user-stories.md §E1 AC).
    .order('sev', { ascending: false })
    .order('created_at', { ascending: false });
  if (!data) return [];
  return data.map((a) => ({
    id: a.id,
    sev: a.sev as 'high' | 'medium' | 'low',
    title: a.title,
    desc: a.description ?? '',
    batch: a.batch_id,
    date: new Date(a.created_at).toLocaleDateString(),
    farms:
      (a.alert_farms as unknown as Array<{ customers: { farm: string } | null }>)
        ?.map((af) => af.customers?.farm ?? '')
        .filter(Boolean) ?? [],
    action: a.action ?? '',
    closed: a.closed,
  }));
}

export async function getPrices(): Promise<Prices> {
  // Prices come from an external scraper; keep mock for now.
  return PRICES;
}

export async function listTeam(): Promise<TeamMember[]> {
  // Team queries auth.users which is restricted; surface via a server action when ready.
  return TEAM;
}

export async function getScorecardSettings(): Promise<ScorecardSettings> {
  const supabase = createClient();
  const { data } = await supabase
    .from('scorecard_settings')
    .select(
      'public, show_d30, show_pcr, show_retention, show_volume, show_reviews'
    )
    .limit(1)
    .single();
  return {
    public: data?.public ?? true,
    showD30: data?.show_d30 ?? true,
    showPCR: data?.show_pcr ?? true,
    showRetention: data?.show_retention ?? true,
    showVolume: data?.show_volume ?? true,
    showReviews: data?.show_reviews ?? false,
  };
}

export async function getSubscription(): Promise<import('@/lib/types').Subscription> {
  const supabase = createClient();
  const { data } = await supabase
    .from('nurseries')
    .select(
      `subscription_status, trial_ends_at, stripe_customer_id, stripe_subscription_id,
       subscription_current_period_end, subscription_cancel_at_period_end`
    )
    .limit(1)
    .single();
  if (!data) {
    return {
      status: 'trialing',
      plan: 'pro',
      trialEndsAt: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      customerId: null,
      subscriptionId: null,
    };
  }
  return {
    status: data.subscription_status as import('@/lib/types').SubscriptionStatus,
    plan: 'pro',
    trialEndsAt: data.trial_ends_at,
    currentPeriodEnd: data.subscription_current_period_end,
    cancelAtPeriodEnd: data.subscription_cancel_at_period_end,
    customerId: data.stripe_customer_id,
    subscriptionId: data.stripe_subscription_id,
  };
}

export async function getInvoiceHistory(): Promise<import('@/lib/types').Invoice[]> {
  // Real invoice history requires the Stripe secret key; the Settings page
  // calls the `fetchInvoiceHistory()` server action instead. Return [] here
  // so the facade contract stays satisfied if a client ever calls it directly.
  return [];
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  const supabase = createClient();
  const { data } = await supabase
    .from('notification_settings')
    .select('restock, low_d30, disease, line_reply, weekly, price_move')
    .limit(1)
    .single();
  return {
    restock: data?.restock ?? true,
    lowD30: data?.low_d30 ?? true,
    disease: data?.disease ?? true,
    lineReply: data?.line_reply ?? false,
    weekly: data?.weekly ?? true,
    priceMove: data?.price_move ?? true,
  };
}

// Mutations -------------------------------------------------------------------

export async function addCustomer(input: AddCustomerInput): Promise<Customer> {
  const supabase = createClient();
  const { data: nursery } = await supabase
    .from('nurseries')
    .select('id')
    .limit(1)
    .single();
  if (!nursery) throw new Error('No nursery scope for current user');

  const { data, error } = await supabase
    .from('customers')
    .insert({
      nursery_id: nursery.id,
      name: input.name,
      farm: input.farm,
      zone: input.zone,
      phone: input.phone ?? null,
      package_interest: input.plan ?? null,
    })
    .select(
      `id, name, farm, farm_en, zone, status, ltv, last_buy,
       customer_cycles(cycle_day, expected_harvest, d30, d60, restock_in)`
    )
    .single();
  if (error) throw error;
  return rowToCustomer(
    data,
    Array.isArray(data.customer_cycles)
      ? data.customer_cycles[0] ?? null
      : (data.customer_cycles as never) ?? null
  );
}

export async function addBatch(input: AddBatchInput): Promise<Batch> {
  const supabase = createClient();
  const { data: nursery } = await supabase
    .from('nurseries')
    .select('id')
    .limit(1)
    .single();
  if (!nursery) throw new Error('No nursery scope for current user');

  const id = `B-${input.date.slice(2, 4)}${input.date.slice(5, 7)}-${Math.random().toString(36).slice(2, 4).toUpperCase()}`;

  const { data, error } = await supabase
    .from('batches')
    .insert({
      id,
      nursery_id: nursery.id,
      source: input.source,
      pl_produced: input.plProduced,
      date: input.date,
      pcr: input.pcr ?? 'pending',
    })
    .select('id, source, pl_produced, pl_sold, date, pcr, mean_d30, dist')
    .single();
  if (error) throw error;
  return rowToBatch(data);
}

export async function closeAlert(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('alerts')
    .update({
      closed: true,
      closed_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) throw error;
}

export async function updateScorecardSettings(
  patch: Partial<ScorecardSettings>
): Promise<ScorecardSettings> {
  const supabase = createClient();
  const { data: nursery } = await supabase
    .from('nurseries')
    .select('id')
    .limit(1)
    .single();
  if (!nursery) throw new Error('No nursery scope for current user');

  const dbPatch: Database['public']['Tables']['scorecard_settings']['Update'] = {};
  if (patch.public !== undefined) dbPatch.public = patch.public;
  if (patch.showD30 !== undefined) dbPatch.show_d30 = patch.showD30;
  if (patch.showPCR !== undefined) dbPatch.show_pcr = patch.showPCR;
  if (patch.showRetention !== undefined) dbPatch.show_retention = patch.showRetention;
  if (patch.showVolume !== undefined) dbPatch.show_volume = patch.showVolume;
  if (patch.showReviews !== undefined) dbPatch.show_reviews = patch.showReviews;

  await supabase
    .from('scorecard_settings')
    .update(dbPatch)
    .eq('nursery_id', nursery.id);

  return getScorecardSettings();
}

export async function updateNotificationSettings(
  patch: Partial<NotificationSettings>
): Promise<NotificationSettings> {
  const supabase = createClient();
  const { data: nursery } = await supabase
    .from('nurseries')
    .select('id')
    .limit(1)
    .single();
  if (!nursery) throw new Error('No nursery scope for current user');

  const dbPatch: Database['public']['Tables']['notification_settings']['Update'] = {};
  if (patch.restock !== undefined) dbPatch.restock = patch.restock;
  if (patch.lowD30 !== undefined) dbPatch.low_d30 = patch.lowD30;
  if (patch.disease !== undefined) dbPatch.disease = patch.disease;
  if (patch.lineReply !== undefined) dbPatch.line_reply = patch.lineReply;
  if (patch.weekly !== undefined) dbPatch.weekly = patch.weekly;
  if (patch.priceMove !== undefined) dbPatch.price_move = patch.priceMove;

  await supabase
    .from('notification_settings')
    .update(dbPatch)
    .eq('nursery_id', nursery.id);

  return getNotificationSettings();
}
