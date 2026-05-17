/**
 * API facade — switches between mock and Supabase based on env.
 * - When USE_MOCK=true (default for local dev), all calls go through `lib/mock/api`.
 * - When USE_MOCK=false AND NEXT_PUBLIC_SUPABASE_URL is set, calls hit Supabase via `lib/api/supabase`.
 *
 * Pages import from `@/lib/api` only. Phase 4 swap is one-line: flip USE_MOCK in .env.local.
 */

import * as mock from '../mock/api';
import * as live from './supabase';

// Read NEXT_PUBLIC_USE_MOCK first so the dispatch is correct in client bundles
// (regular USE_MOCK is server-only and reads as undefined in the browser).
const useMock =
  (process.env.NEXT_PUBLIC_USE_MOCK ?? process.env.USE_MOCK) !== 'false' ||
  !process.env.NEXT_PUBLIC_SUPABASE_URL;

const impl = useMock ? mock : live;

export const getNursery = impl.getNursery;
export const listCustomers = impl.listCustomers;
export const getCustomer = impl.getCustomer;
export const listCallbacks = impl.listCallbacks;
export const listBatches = impl.listBatches;
export const getContinueWatching = impl.getContinueWatching;
export const getBatch = impl.getBatch;
export const listAlerts = impl.listAlerts;
export const listQuotes = impl.listQuotes;
export const getPrices = impl.getPrices;
export const listTeam = impl.listTeam;
export const getScorecardSettings = impl.getScorecardSettings;
export const listLineEvents = impl.listLineEvents;
export const getNotificationSettings = impl.getNotificationSettings;
export const addCustomer = impl.addCustomer;
export const addBatch = impl.addBatch;
export const closeAlert = impl.closeAlert;
export const updateScorecardSettings = impl.updateScorecardSettings;
export const updateNotificationSettings = impl.updateNotificationSettings;
export const getSubscription = impl.getSubscription;
export const getInvoiceHistory = impl.getInvoiceHistory;

export type { AddCustomerInput, AddBatchInput } from '../mock/api';
