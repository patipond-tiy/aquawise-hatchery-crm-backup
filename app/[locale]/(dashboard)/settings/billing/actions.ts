'use server';

import { headers } from 'next/headers';
import { getStripe, isStripeConfigured } from '@/lib/stripe/server';
import { APP_URL, PRO_PRICE_ID } from '@/lib/stripe/config';
import { currentNurseryScope } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/server';
import { can } from '@/lib/rbac';
import type { Invoice } from '@/lib/types';
import { getInvoiceHistory as mockInvoices } from '@/lib/mock/billing';

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function getLocale(): Promise<string> {
  const h = await headers();
  const path = h.get('x-pathname') ?? h.get('referer') ?? '';
  const m = path.match(/\/(th|en)(\/|$)/);
  return m?.[1] ?? 'th';
}

/**
 * Create a Stripe Checkout Session for the Pro subscription.
 * Returns the redirect URL the client should `window.location.href = url` to.
 */
export async function createCheckoutSession(): Promise<ActionResult<{ url: string }>> {
  if (!isStripeConfigured()) {
    return {
      ok: false,
      error: 'Stripe ยังไม่ได้ตั้งค่า — กรุณาติดต่อผู้ดูแลระบบ',
    };
  }

  const scope = await currentNurseryScope();
  if (!scope) return { ok: false, error: 'ไม่ได้เข้าสู่ระบบ' };
  if (!can(scope.role, 'billing:manage')) {
    return { ok: false, error: 'ไม่มีสิทธิ์จัดการแพ็กเกจ' };
  }

  if (!PRO_PRICE_ID) {
    return {
      ok: false,
      error: 'STRIPE_PRO_PRICE_ID ยังไม่ได้ตั้งค่า — ดูคู่มือใน docs/STRIPE.md',
    };
  }

  const stripe = getStripe();
  const supabase = await createServiceClient();

  // Look up or create the Stripe customer for this nursery.
  const { data: nursery } = await supabase
    .from('nurseries')
    .select('id, name, stripe_customer_id')
    .eq('id', scope.nurseryId)
    .single();
  if (!nursery) return { ok: false, error: 'ไม่พบโรงอนุบาล' };

  let customerId = nursery.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      name: nursery.name,
      metadata: { nursery_id: nursery.id },
    });
    customerId = customer.id;
    await supabase
      .from('nurseries')
      .update({ stripe_customer_id: customerId })
      .eq('id', nursery.id);
  }

  const locale = await getLocale();
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    client_reference_id: nursery.id,
    line_items: [{ price: PRO_PRICE_ID, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${APP_URL}/${locale}/settings?checkout=success`,
    cancel_url: `${APP_URL}/${locale}/settings?checkout=cancel`,
    locale: locale === 'th' ? 'th' : 'en',
    subscription_data: {
      metadata: { nursery_id: nursery.id },
    },
  });

  if (!session.url) return { ok: false, error: 'Stripe ไม่ส่ง URL กลับ' };
  return { ok: true, data: { url: session.url } };
}

/**
 * Create a Customer Portal session so the user can manage their subscription
 * (update card / cancel / view invoices) on Stripe-hosted UI.
 */
export async function createPortalSession(): Promise<ActionResult<{ url: string }>> {
  if (!isStripeConfigured()) {
    return { ok: false, error: 'Stripe ยังไม่ได้ตั้งค่า' };
  }

  const scope = await currentNurseryScope();
  if (!scope) return { ok: false, error: 'ไม่ได้เข้าสู่ระบบ' };
  if (!can(scope.role, 'billing:manage')) {
    return { ok: false, error: 'ไม่มีสิทธิ์จัดการแพ็กเกจ' };
  }

  const supabase = await createServiceClient();
  const { data: nursery } = await supabase
    .from('nurseries')
    .select('stripe_customer_id')
    .eq('id', scope.nurseryId)
    .single();
  if (!nursery?.stripe_customer_id) {
    return { ok: false, error: 'ยังไม่มีบัญชี Stripe สำหรับโรงอนุบาลนี้' };
  }

  const stripe = getStripe();
  const locale = await getLocale();
  const session = await stripe.billingPortal.sessions.create({
    customer: nursery.stripe_customer_id,
    return_url: `${APP_URL}/${locale}/settings`,
  });

  return { ok: true, data: { url: session.url } };
}

/**
 * Fetch invoice history. Mock mode returns sample invoices; real mode hits
 * Stripe via the secret key (server-side only).
 */
export async function fetchInvoiceHistory(): Promise<Invoice[]> {
  if (!isStripeConfigured()) {
    return mockInvoices();
  }

  const scope = await currentNurseryScope();
  if (!scope) return [];

  const supabase = await createServiceClient();
  const { data: nursery } = await supabase
    .from('nurseries')
    .select('stripe_customer_id')
    .eq('id', scope.nurseryId)
    .single();
  if (!nursery?.stripe_customer_id) return [];

  const stripe = getStripe();
  const list = await stripe.invoices.list({
    customer: nursery.stripe_customer_id,
    limit: 12,
  });

  return list.data.map((inv) => ({
    id: inv.id ?? '',
    number: inv.number,
    amount: (inv.amount_paid || inv.amount_due) / 100,
    currency: inv.currency,
    status: inv.status ?? 'open',
    paidAt: inv.status_transitions?.paid_at
      ? new Date(inv.status_transitions.paid_at * 1000).toISOString()
      : null,
    hostedUrl: inv.hosted_invoice_url ?? null,
    pdfUrl: inv.invoice_pdf ?? null,
  }));
}
