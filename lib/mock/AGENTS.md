<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-26 | Updated: 2026-04-26 -->

# mock

## Purpose
**In-memory mock data + mock API**, used when `USE_MOCK=true` (the default for local dev) or when `NEXT_PUBLIC_SUPABASE_URL` is unset. Lets developers boot the app without a Supabase project.

The mock implementation is the **reference signature** — `lib/api/supabase.ts` mirrors it function-for-function. Adding a new operation: add to `mock/api.ts` first, then mirror in `lib/api/supabase.ts`.

## Key Files

| File | Description |
|------|-------------|
| `data.ts` | Constant Thai mock data: `HATCHERY`, `CUSTOMERS` (9 farms), `BATCHES` (5 batches), `ALERTS` (3), `PRICES`, `DEFAULT_SCORECARD`, `DEFAULT_NOTIFICATIONS`, `TEAM` |
| `api.ts` | Mock implementations of every API function. Holds a mutable `state` so dev mutations persist across navigations within a session (lost on reload) |
| `billing.ts` | Mock subscription state controlled by `MOCK_BILLING_STATE` env var. Values: `trialing-25` \| `trialing-2` \| `trial_expired` \| `active` \| `past_due` \| `canceled` |

## For AI Agents

### Working In This Directory
- **Mock data is in Thai.** Keep it Thai when you add records — the mock UI is the Thai-first surface (`/th/...`).
- **The mutable `state` object in `api.ts`** is module-level — it resets on a server restart but survives client navigations. This is by design: Phase 4's optimistic-update behavior is exercisable in mock mode.
- **Always wrap returns in the `delay()` helper** so timings approximate the live experience. Default 80ms; mutations 120ms; settings 60ms.
- **Mock signatures must match the live signatures.** TS will catch most drift but watch for subtle differences in mutation return shapes.
- **Add new mock data to `data.ts` as constants**, then reference them in `api.ts`. Don't inline mock arrays in `api.ts`.

### Mock billing state cheat sheet
Set `MOCK_BILLING_STATE` in `.env.local`:
- `trialing-25` — 25 days left in trial (sky banner)
- `trialing-2` — 2 days left (red/amber banner)
- `trial_expired` — paywall active; redirects everywhere except `/settings` and `/billing/trial-expired`
- `active` — paid Pro plan, with 3 mock invoices
- `past_due` — payment failed banner
- `canceled` — subscription canceled

### Common Patterns
- ID generation in mutations is deterministic-ish (`'C' + (900 + n)`, `'B-2604-X'`) — no `crypto.randomUUID()` so test snapshots are stable.
- The mock layer **never** calls Supabase. Don't import `@/lib/supabase/*` here.

## Dependencies

### Internal
- `@/lib/types` (domain types)
- `@/lib/stripe/config` (only for `TRIAL_DAYS`; doesn't actually hit Stripe)

<!-- MANUAL: -->
