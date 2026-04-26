/** Free trial length, in days. Change here + the migration default to adjust. */
export const TRIAL_DAYS = 30;

/** Monthly price in THB (display value; Stripe stores 500000 satang). */
export const PRO_AMOUNT_THB = 5000;

/** Stripe Price ID for the Pro plan. Required for real-mode subscriptions. */
export const PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID ?? '';

/** App base URL for Checkout success/cancel URLs and Portal return URL. */
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const PRO_PLAN = {
  id: 'pro',
  name: 'Pro',
  amountThb: PRO_AMOUNT_THB,
  features: [
    'ลูกค้าไม่จำกัด',
    'ล็อตไม่จำกัด',
    'แจ้งเตือนโรค + ส่ง LINE',
    'ใบรับรอง PCR + คะแนนสาธารณะ',
    'ทีมงานสูงสุด 5 คน',
  ],
  featuresEn: [
    'Unlimited customers',
    'Unlimited batches',
    'Disease alerts + LINE messaging',
    'PCR certificates + public scorecard',
    'Up to 5 team members',
  ],
} as const;
