# Stripe Pro plan — setup runbook

The app ships with a **30-day free trial managed in Postgres** (no card required) and a **5,000 THB / month Pro subscription via Stripe**. The trial runs entirely in-app; Stripe is only invoked when a user subscribes.

This doc walks you through provisioning the Stripe side. Estimated time: 10 minutes.

## 1. Create the Product + Price

In the Stripe Dashboard ([dashboard.stripe.com](https://dashboard.stripe.com)):

1. **Products → + Add product**
2. Name: `AquaWise Hatchery — Pro`
3. **Pricing**:
   - Type: **Recurring**
   - Billing period: **Monthly**
   - Price: **5000** THB (Stripe stores `unit_amount=500000` — five hundred thousand satang)
   - Currency: **THB**
4. Save. Copy the **Price ID** (looks like `price_1Q…`).

Paste it into your env:

```bash
STRIPE_PRO_PRICE_ID=price_1Q...
```

> Note: Stripe supports THB. Minimum charge is 20 THB; 5,000 THB is well above. PromptPay can be added later as an additional payment method on the Price.

## 2. Configure Customer Portal

The Customer Portal handles **manage subscription / update card / view invoices / cancel** — we don't build any of that ourselves.

1. **Settings → Billing → Customer Portal**
2. Toggle **ON**: cancel subscriptions, update payment methods, view invoice history.
3. Set **Default return URL** to `${NEXT_PUBLIC_APP_URL}/th/settings`.
4. Under **Products**, allow customers to switch among the Pro plan only (single tier).
5. Save.

## 3. Add the webhook endpoint

The webhook is the source of truth — we react to subscription state from Stripe, not to client redirects.

### Local development

Use the Stripe CLI to forward events to your local dev server:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

The CLI prints a `whsec_…` signing secret. Paste it into:

```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Production

1. **Developers → Webhooks → + Add endpoint**
2. URL: `https://YOUR-DOMAIN.com/api/webhooks/stripe`
3. Listen on these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
4. Reveal the **Signing secret**, copy into your prod env:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_prod_...
   ```

## 4. Set the rest of the env

```bash
STRIPE_SECRET_KEY=sk_test_...                # Test mode while developing
NEXT_PUBLIC_APP_URL=http://localhost:3000     # Or your prod domain
USE_MOCK=false                                # Flip to engage real Stripe
```

## 5. Run the migration

```bash
supabase link --project-ref YOUR-PROJECT
supabase db push
```

This applies `supabase/migrations/004_billing.sql` and `005_backfill_demo.sql`. Verify:

```sql
\d hatcheries
-- should include: trial_ends_at, stripe_customer_id, stripe_subscription_id,
-- subscription_status, subscription_current_period_end, subscription_cancel_at_period_end

select id, name, subscription_status, trial_ends_at from public.hatcheries;
-- demo hatchery: subscription_status='active', trial_ends_at=null
-- new sign-ups: subscription_status='trialing', trial_ends_at = signup + 30 days
```

## 6. End-to-end smoke test

With `USE_MOCK=false pnpm dev` plus `stripe listen` running:

1. Sign in as the owner of a `'trialing'` hatchery.
2. Force the trial to expire so we can test the paywall:
   ```sql
   update public.hatcheries
      set trial_ends_at = now() - interval '1 minute'
    where id = '<test-id>';
   ```
3. Reload the dashboard — should redirect to `/th/billing/trial-expired`.
4. Click **สมัคร 5,000 ฿ / เดือน** — Stripe Checkout opens.
5. Use test card `4242 4242 4242 4242` · any future expiry · any CVC · any postal.
6. After Checkout success:
   - URL returns to `/th/settings?checkout=success`
   - Toast confirms "✓ สมัครสำเร็จ"
   - Webhook log shows `checkout.session.completed`, `customer.subscription.created`, `invoice.paid`
   - DB:
     ```sql
     select stripe_customer_id, stripe_subscription_id,
            subscription_status, subscription_current_period_end
       from public.hatcheries where id = '<test-id>';
     ```
     should show populated Stripe IDs and `subscription_status='active'`
7. Reload `/th` — paywall is gone, banner is gone, full app accessible.
8. Click **จัดการแพ็กเกจ** — Customer Portal opens.
9. Cancel the subscription. Webhook fires `customer.subscription.updated` with `cancel_at_period_end=true`. Reload Settings → Billing — shows "ยกเลิกแล้ว — ใช้ได้ถึง <date>".

## Test cards reference

| Card                   | Behavior                                        |
|------------------------|-------------------------------------------------|
| `4242 4242 4242 4242`  | Success                                         |
| `4000 0000 0000 0002`  | Declined at Checkout                            |
| `4000 0000 0000 0341`  | Succeeds first charge, fails on renewal         |
| `4000 0025 0000 3155`  | Requires 3D Secure auth                         |

To trigger a failed renewal locally:
```bash
stripe trigger invoice.payment_failed
```

## Mock mode (no Stripe needed)

Set `USE_MOCK=true` plus one of:

```bash
MOCK_BILLING_STATE=trialing-25     # default — banner sky
MOCK_BILLING_STATE=trialing-2      # banner red
MOCK_BILLING_STATE=trial_expired   # paywall demo
MOCK_BILLING_STATE=active          # subscribed
MOCK_BILLING_STATE=past_due        # past-due banner
```

Useful for designing the UI without booking real Stripe sessions.

## Going to production

1. Switch `STRIPE_SECRET_KEY` from `sk_test_…` to `sk_live_…`
2. Re-create the Product + Price in **live mode** — they don't carry over from test.
3. Update `STRIPE_PRO_PRICE_ID` to the live Price ID.
4. Re-add the webhook endpoint in **live mode**, get a fresh `STRIPE_WEBHOOK_SECRET`.
5. Apply migrations to your prod Supabase.

## Troubleshooting

**"STRIPE_PRO_PRICE_ID is not set"** — server action returns this when the env var is empty. Double-check `.env.local` and restart the dev server.

**Webhook not firing** — confirm `stripe listen` is running and the CLI is logged in to the same account that owns the test Stripe customer.

**Subscription not flipping to active** — inspect `subscription_events` table for the raw payload, or check the webhook delivery log in the Stripe Dashboard.

**RLS blocking the webhook from updating** — the webhook handler uses `createServiceClient()` which bypasses RLS via the service-role key. Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in the server env.
