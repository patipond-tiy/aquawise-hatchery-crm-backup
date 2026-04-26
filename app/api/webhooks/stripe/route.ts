import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe/server';
import { createServiceClient } from '@/lib/supabase/server';
import type { Json } from '@/lib/database.types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type SubStatus =
  | 'trialing'
  | 'trial_expired'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'incomplete';

function stripeStatusToApp(s: Stripe.Subscription.Status): SubStatus {
  switch (s) {
    case 'active':
    case 'trialing':
      return 'active';
    case 'past_due':
      return 'past_due';
    case 'canceled':
    case 'unpaid':
      return 'canceled';
    case 'incomplete':
    case 'incomplete_expired':
      return 'incomplete';
    default:
      return 'incomplete';
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: 'STRIPE_WEBHOOK_SECRET not configured' },
      { status: 500 }
    );
  }

  const sig = req.headers.get('stripe-signature');
  if (!sig) {
    return NextResponse.json({ error: 'missing signature' }, { status: 400 });
  }

  const body = await req.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'invalid signature';
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const supabase = await createServiceClient();

  // Idempotency — refuse to process the same Stripe event twice.
  const { data: existing } = await supabase
    .from('subscription_events')
    .select('id')
    .eq('stripe_event_id', event.id)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  let hatcheryId: string | null = null;

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        hatcheryId = session.client_reference_id ?? null;
        if (!hatcheryId) break;

        const subId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id ?? null;
        const customerId =
          typeof session.customer === 'string'
            ? session.customer
            : session.customer?.id ?? null;

        const sub = subId ? await stripe.subscriptions.retrieve(subId) : null;
        const item = sub?.items.data[0] as
          | (Stripe.SubscriptionItem & { current_period_end?: number })
          | undefined;
        const periodEndUnix = item?.current_period_end;

        await supabase
          .from('hatcheries')
          .update({
            stripe_customer_id: customerId,
            stripe_subscription_id: subId,
            subscription_status: 'active',
            subscription_current_period_end: periodEndUnix
              ? new Date(periodEndUnix * 1000).toISOString()
              : null,
            subscription_cancel_at_period_end: sub?.cancel_at_period_end ?? false,
          })
          .eq('id', hatcheryId);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        hatcheryId =
          (sub.metadata?.hatchery_id as string | undefined) ?? null;
        if (!hatcheryId) {
          // Fallback — look up by stripe_customer_id
          const customerId =
            typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
          const { data: row } = await supabase
            .from('hatcheries')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .maybeSingle();
          hatcheryId = row?.id ?? null;
        }
        if (!hatcheryId) break;

        const item = sub.items.data[0] as
          | (Stripe.SubscriptionItem & { current_period_end?: number })
          | undefined;
        const periodEndUnix = item?.current_period_end;

        await supabase
          .from('hatcheries')
          .update({
            stripe_subscription_id: sub.id,
            subscription_status: stripeStatusToApp(sub.status),
            subscription_current_period_end: periodEndUnix
              ? new Date(periodEndUnix * 1000).toISOString()
              : null,
            subscription_cancel_at_period_end: sub.cancel_at_period_end,
          })
          .eq('id', hatcheryId);
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        hatcheryId =
          (sub.metadata?.hatchery_id as string | undefined) ?? null;
        if (!hatcheryId) {
          const customerId =
            typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
          const { data: row } = await supabase
            .from('hatcheries')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .maybeSingle();
          hatcheryId = row?.id ?? null;
        }
        if (!hatcheryId) break;

        await supabase
          .from('hatcheries')
          .update({
            subscription_status: 'canceled',
            subscription_cancel_at_period_end: false,
          })
          .eq('id', hatcheryId);
        break;
      }

      case 'invoice.paid': {
        const inv = event.data.object as Stripe.Invoice;
        const customerId =
          typeof inv.customer === 'string' ? inv.customer : inv.customer?.id ?? null;
        if (!customerId) break;
        const { data: row } = await supabase
          .from('hatcheries')
          .select('id, subscription_status')
          .eq('stripe_customer_id', customerId)
          .maybeSingle();
        hatcheryId = row?.id ?? null;
        if (row?.id && row.subscription_status !== 'active') {
          await supabase
            .from('hatcheries')
            .update({ subscription_status: 'active' })
            .eq('id', row.id);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const inv = event.data.object as Stripe.Invoice;
        const customerId =
          typeof inv.customer === 'string' ? inv.customer : inv.customer?.id ?? null;
        if (!customerId) break;
        const { data: row } = await supabase
          .from('hatcheries')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle();
        hatcheryId = row?.id ?? null;
        if (row?.id) {
          await supabase
            .from('hatcheries')
            .update({ subscription_status: 'past_due' })
            .eq('id', row.id);
        }
        break;
      }

      default:
        // unhandled event type — still log it for audit
        break;
    }

    // Append to the idempotency log AFTER processing, so failures don't lock us out.
    await supabase.from('subscription_events').insert({
      stripe_event_id: event.id,
      type: event.type,
      hatchery_id: hatcheryId,
      payload: JSON.parse(JSON.stringify(event)) as Json,
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[stripe webhook] error processing', event.type, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'unknown' },
      { status: 500 }
    );
  }
}
