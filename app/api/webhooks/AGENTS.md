<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-26 | Updated: 2026-05-16 -->

# webhooks

## Purpose
External-service webhook receivers. One handler today: **Stripe**.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `stripe/` | `route.ts` — verifies signatures, processes 5 event types (`checkout.session.completed`, `customer.subscription.{created,updated,deleted}`, `invoice.{paid,payment_failed}`), persists subscription state to `nurseries`, logs to `subscription_events` for idempotency |

## For AI Agents

### Working In This Directory
- **Each webhook source gets its own subdirectory** (`stripe/`, future: `line/`).
- **Signature verification first, business logic second.** Reject anything unsigned with 4xx so the sender stops retrying.
- **Idempotency** lives in `subscription_events.stripe_event_id` (unique). Always check before processing, log after success — failures don't lock you out of retrying.
- **Service-role Supabase client** is required because webhook events aren't authenticated as a user, and they need to write across the `subscription_events` and `nurseries` tables regardless of RLS.
- **Status mapping**: Stripe's `Subscription.Status` (active, trialing, past_due, canceled, unpaid, incomplete, incomplete_expired) is mapped to our 6-value `subscription_status` enum via `stripeStatusToApp()` in the route. Update both sides if either changes.
- **The `current_period_end` field**: Stripe-side it lives on the SubscriptionItem (typed as optional). Our handler reads it from `sub.items.data[0]` — be defensive with `?.`.

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
