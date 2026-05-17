export type CustomerStatus =
  | 'active'
  | 'restock-soon'
  | 'restock-now'
  | 'concern'
  | 'quiet';

export type Customer = {
  id: string;
  name: string;
  farm: string;
  farmEn: string;
  zone: string;
  batches: number;
  ltv: number;
  lastBuy: string;
  cycleDay: number | null;
  expectedHarvest: string | null;
  d30: number | null;
  d60: number | null;
  restockIn: number | null;
  status: CustomerStatus;
};

export type PcrStatus = 'clean' | 'flagged' | 'pending';

export type Batch = {
  id: string;
  date: string;
  source: string;
  plProduced: number;
  plSold: number;
  farms: number;
  meanD30: number;
  dist: number[];
  pcr: PcrStatus;
};

// B3 — customer detail: time-series cycle row backing the D30 sparkline.
export type CustomerCycleHistoryRow = {
  id: string;
  batchId: string | null;
  startedAt: string;
  d30: number | null;
  d60: number | null;
  harvest: string | null;
};

// B3 — customer detail: one PL distribution to this customer (batch_buyers
// joined with batches).
export type CustomerBatchHistoryRow = {
  batchId: string;
  date: string;
  plPurchased: number;
  d30: number | null;
  pcr: PcrStatus;
};

export type CustomerDetail = Customer & {
  phone: string | null;
  lineId: string | null;
  address: string | null;
  cycleHistory: CustomerCycleHistoryRow[];
  batchHistory: CustomerBatchHistoryRow[];
};

// B4 — a scheduled rep reminder.
export type CustomerCallback = {
  id: string;
  customerId: string;
  scheduledFor: string;
  channel: 'call' | 'line';
  note: string | null;
  completedAt: string | null;
  createdBy: string;
};

// C3 — batch detail: one buyer row (batch_buyers joined with customers).
export type BatchBuyer = {
  customerId: string;
  farm: string;
  zone: string;
  plPurchased: number;
  d30: number | null;
};

// C3/C4 — one per-disease PCR result row.
export type PcrResult = {
  id: string;
  disease: string;
  status: string;
  lab: string | null;
  testedOn: string | null;
};

export type BatchDetail = Batch & {
  buyers: BatchBuyer[];
  pcrResults: PcrResult[];
};

// C4 — nursery brand used on the PCR certificate PDF.
export type NurseryBrand = {
  displayNameTh: string;
  displayNameEn: string;
  logoUrl: string | null;
  brandColor: string;
};

export type AlertSeverity = 'high' | 'medium' | 'low';

export type Alert = {
  id: string;
  sev: AlertSeverity;
  title: string;
  desc: string;
  batch: string | null;
  date: string;
  farms: string[];
  action: string;
  closed: boolean;
};

// D2 — one-tap quote.
export type QuoteLineItem = {
  sizeLabel: string;
  unitPrice: number;
  quantity: number;
};

export type QuoteStatus = 'sent' | 'accepted' | 'declined' | 'expired';

export type Quote = {
  id: string;
  customerId: string;
  items: QuoteLineItem[];
  note: string | null;
  status: QuoteStatus;
  validUntil: string | null;
  sentAt: string;
  decidedAt: string | null;
};

export type PriceRow = {
  size: number;
  price: number;
  delta: number;
  avg3y: number;
};

export type Prices = {
  date: string;
  source: string;
  rows: PriceRow[];
};

export type RestockThresholds = {
  now: number;
  week: number;
  month: number;
};

export type Nursery = {
  name: string;
  nameEn: string;
  location: string;
  locationEn: string;
  restockThresholds: RestockThresholds;
  /** ISO timestamp the nursery workspace was created (for "open since"). */
  createdAt?: string;
};

/**
 * The authenticated user rendered in identity surfaces (top-bar, right-rail).
 * Sourced from the live Supabase session — never a hardcoded literal. `null`
 * means no resolvable session (mock mode with no seed, or signed-out).
 */
export type CurrentUser = {
  id: string;
  /** Best available human label: full_name → name → email local-part. */
  displayName: string;
  email: string | null;
  role: 'owner' | 'counter_staff' | 'lab_tech' | 'auditor' | null;
};

export type ScorecardSettings = {
  public: boolean;
  showD30: boolean;
  showPCR: boolean;
  showRetention: boolean;
  showVolume: boolean;
  showReviews: boolean;
};

export type NotificationSettings = {
  restock: boolean;
  lowD30: boolean;
  disease: boolean;
  lineReply: boolean;
  weekly: boolean;
  priceMove: boolean;
  /** H4 — quiet-hours window (ICT, "HH:MM"). */
  quietHoursStart: string;
  quietHoursEnd: string;
};

export type TeamMember = {
  name: string;
  role: string;
  perm: 'owner' | 'counter_staff' | 'lab_tech' | 'auditor';
  tone?: string;
};

export type ContinueWatchingItem = {
  customerId: string;
  name: string;
  farm: string;
  zone: string;
  cycleDay: number | null;
  /** Real latest batch reference this customer purchased from, or null. */
  batchRef: string | null;
};

export type Locale = 'en' | 'th';

// ============================================================
// Billing
// ============================================================

export type SubscriptionStatus =
  | 'trialing'
  | 'trial_expired'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'incomplete';

export type Subscription = {
  status: SubscriptionStatus;
  plan: 'pro' | null;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  customerId: string | null;
  subscriptionId: string | null;
};

export type Invoice = {
  id: string;
  number: string | null;
  amount: number;          // amount in THB
  currency: string;
  status: string;          // 'paid' | 'open' | 'void' | 'uncollectible'
  paidAt: string | null;
  hostedUrl: string | null;
  pdfUrl: string | null;
};
