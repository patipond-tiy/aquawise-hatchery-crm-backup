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
};

export type TeamMember = {
  name: string;
  role: string;
  perm: 'owner' | 'counter_staff' | 'lab_tech' | 'auditor';
  tone?: string;
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
