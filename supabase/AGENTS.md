<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-26 | Updated: 2026-04-26 -->

# supabase

## Purpose
SQL migrations for the Postgres schema, RLS policies, seed data, and billing columns. Versioned via the Supabase CLI (`supabase db push`).

Pair with `lib/database.types.ts` (generated, in `lib/`) — every schema change should be followed by `supabase gen types typescript --linked > lib/database.types.ts`.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `migrations/` | Numbered SQL migrations (001_init → 005_backfill_demo). See `migrations/AGENTS.md` |

## For AI Agents

### Working In This Directory
- **Apply order matters** — migrations are numbered (`001_…`, `002_…`). New migrations must use the next free number and never edit a previously-applied migration.
- **Every domain table has `hatchery_id`** and an RLS policy scoped to `hatchery_members.hatchery_id` of `auth.uid()`. Adding a new domain table? Mirror the pattern in `002_rls.sql`.
- **Service-role writes** (the Stripe webhook, audit-log emitters) bypass RLS — that's intentional, but means the service-role key must never leak to the client.
- **The `create_hatchery` RPC** in `004_billing.sql` is `security definer` and creates the row + owner membership + default scorecard/notification settings + 30-day trial. Onboarding flows should call this RPC, not insert directly.

### Common Patterns
- All `id` columns are UUID with `default gen_random_uuid()` except batches, which use a human-readable string id (e.g., `B-2604-A`).
- `created_at timestamptz default now()` on every table.
- Enum types (`hatchery_role`, `customer_status`, `pcr_status`, `alert_severity`) are defined in `001_init.sql`. Adding a value: write a new migration with `alter type ... add value`.

## Dependencies

### Internal
- `lib/database.types.ts` — must be regenerated after every migration that changes shape.
- `lib/api/supabase.ts` — adapter functions read these tables.
- `app/api/webhooks/stripe/route.ts` — writes `subscription_events` + `hatcheries.subscription_status`.

### External
- Supabase CLI (`supabase link`, `supabase db push`, `supabase gen types`)

<!-- MANUAL: -->
