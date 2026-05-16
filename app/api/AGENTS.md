<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-26 | Updated: 2026-05-16 -->

# api

## Purpose
HTTP route handlers callable by external services. Outside `[locale]/` because external callers don't know our locale prefix.

Today this only contains the **Stripe webhook**, which is the source of truth for subscription state — every billing-state mutation flows through here.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `webhooks/` | External webhook receivers — `webhooks/stripe/route.ts` (see `webhooks/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- **`runtime = 'nodejs'`** is required for Stripe SDK (it uses Node-only APIs). Do not switch to edge runtime.
- **`dynamic = 'force-dynamic'`** prevents Next from trying to statically optimize a webhook handler.
- **Always verify signatures** with the SDK's `webhooks.constructEvent(body, sig, secret)` — never parse the body and trust it.
- **Read raw body**: use `await req.text()`, NOT `req.json()`, because signature verification is computed over the raw bytes.
- **Use the service-role Supabase client** for webhook writes (`createServiceClient` from `@/lib/supabase/server`) — webhook events are not authenticated as a user, and need to bypass RLS.
- **Idempotency**: every event must be checked against `subscription_events.stripe_event_id` before processing, then logged after success. The Stripe webhook handler already implements this.

### Common Patterns
- Routes return `NextResponse.json(...)` with a meaningful status code so Stripe's retry logic does the right thing (200 = success, 4xx = stop retrying, 5xx = retry).
- The matcher in `proxy.ts` excludes `/api/...` from middleware, so webhook bodies are not rewritten.

## Dependencies

### Internal
- `@/lib/stripe/server` (lazy SDK init)
- `@/lib/supabase/server` (`createServiceClient`)
- `@/lib/database.types`

### External
- `stripe` ^18

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
