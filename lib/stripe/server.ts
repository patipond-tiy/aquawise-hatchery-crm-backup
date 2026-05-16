import 'server-only';
import Stripe from 'stripe';

let _stripe: Stripe | null = null;

/**
 * Lazy-init the Stripe SDK. Throws if STRIPE_SECRET_KEY is not set so we
 * never accidentally hit Stripe in mock mode.
 */
export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      'STRIPE_SECRET_KEY is not set. Either set it in .env.local or run with USE_MOCK=true.'
    );
  }
  _stripe = new Stripe(key, {
    typescript: true,
    appInfo: {
      name: 'AquaWise Nursery CRM',
      version: '0.1.0',
    },
  });
  return _stripe;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
