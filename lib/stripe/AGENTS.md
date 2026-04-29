<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-26 | Updated: 2026-04-26 -->

# stripe

## Purpose
Server-only Stripe SDK access + plan config constants.

`server.ts` is **lazy-initialized** so an unset `STRIPE_SECRET_KEY` doesn't blow up the bundle in mock mode. It also enforces `'server-only'` so the Stripe SDK can never be bundled into a client component.

`config.ts` is safe for both server and client — it's just plan/price constants and the `TRIAL_DAYS` value used by mock billing.

## Key Files

| File | Description |
|------|-------------|
| `server.ts` | `getStripe()` — lazy SDK init; throws if `STRIPE_SECRET_KEY` is missing. `isStripeConfigured()` for branching. Marked `'server-only'` |
| `config.ts` | Plan constants: `TRIAL_DAYS = 30`, `PRO_AMOUNT_THB = 5000`, `PRO_PRICE_ID` (from env), `APP_URL`, `PRO_PLAN` (id, name, amount, Thai + English feature lists) |

## For AI Agents

### Working In This Directory
- **`getStripe()` is the only entry point** to the Stripe SDK. Don't import `Stripe` directly elsewhere — go through this helper so the lazy init + missing-key error message stay consistent.
- **`'server-only'`** import in `server.ts` is mandatory. If a client component tries to import this file, the bundler throws a loud error. Keep it.
- **Trial length is 30 days.** Two places must agree: `TRIAL_DAYS` in `config.ts` AND the column default in `supabase/migrations/004_billing.sql` (`now() + interval '30 days'`). Change both together.
- **Pro price is THB 5,000/mo** = 500_000 satang in Stripe. The display value (`PRO_AMOUNT_THB`) and Stripe's stored value differ by 100×. Don't conflate them.
- **`STRIPE_PRO_PRICE_ID` must come from env**, not hardcoded. The price is provisioned once in the Stripe Dashboard (see `docs/STRIPE.md`) and the id pasted into `.env.local`.
- **`appInfo`** sets `name: 'AquaWise Hatchery CRM'` — Stripe shows this in their dashboard activity log. Keep it as-is for support traceability.

## Dependencies

### External
- `stripe` ^18 (TypeScript SDK)

<!-- MANUAL: -->
