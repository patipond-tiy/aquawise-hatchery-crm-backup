<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-26 | Updated: 2026-04-26 -->

# migrations

## Purpose
Ordered SQL migrations applied via `supabase db push`. Numbered by execution order — once a migration is applied to any environment, it must never be edited; new changes go in a new file.

## Key Files

| File | Description |
|------|-------------|
| `001_init.sql` | Schema — `hatcheries`, `hatchery_members`, `customers`, `customer_cycles`, `batches`, `batch_buyers`, `pcr_results`, `alerts`, `alert_farms`, `scorecard_settings`, `notification_settings`, `audit_log`. Defines enum types (`hatchery_role`, `customer_status`, `pcr_status`, `alert_severity`) |
| `002_rls.sql` | Enables RLS on every table; SELECT/INSERT/UPDATE policies scoped via `hatchery_members.hatchery_id = auth.uid()` membership |
| `003_seed.sql` | Inserts the Thai mock data (mirrors `lib/mock/data.ts`) so a fresh project can demo immediately |
| `004_billing.sql` | Adds Stripe + trial columns to `hatcheries` (`trial_ends_at`, `stripe_customer_id`, `stripe_subscription_id`, `subscription_status`, `subscription_current_period_end`, `subscription_cancel_at_period_end`); creates `subscription_events` (idempotency log); updates `create_hatchery()` RPC to set 30-day trial defaults |
| `005_backfill_demo.sql` | Backfills demo seed rows with sane defaults so `004_billing.sql`'s NOT NULL constraints don't blow up |

## For AI Agents

### Working In This Directory
- **Number new migrations sequentially.** Next free number wins (`006_*.sql`).
- **Never edit a previously-applied migration.** Even small "harmless" changes break Supabase's migration ledger.
- **Every new domain table must have**:
  - `hatchery_id uuid not null references public.hatcheries(id) on delete cascade`
  - RLS enabled and a SELECT policy scoped to membership
  - `created_at timestamptz not null default now()`
- **Service-role inserts/updates are allowed by absence of policy.** Don't write `with check (true)` — that opens the table to authenticated users.
- **Run `supabase gen types typescript --linked > lib/database.types.ts` after every schema-shape change.** Otherwise the generated types drift and `lib/api/supabase.ts` adapters silently break at runtime.
- **`create_hatchery` RPC is `security definer`** and is the canonical onboarding path — it creates the `hatcheries` row, the owner `hatchery_members` row, default `scorecard_settings`, default `notification_settings`, and sets the trial deadline. New onboarding flows should call this RPC, not insert manually.

### Common Patterns
- ID strategy: most tables use `uuid default gen_random_uuid()`. Batches use a string id (e.g., `B-2604-A`) for human-readable listings.
- Enum changes: `alter type ... add value 'new_value'` in a new migration; PostgreSQL forbids removing values.
- The `subscription_events` table is service-role-only on writes (no INSERT policy) but readable by `owner`/`admin` of the owning hatchery.

## Dependencies

### Internal
- `lib/database.types.ts` — must be regenerated after structural changes
- `lib/api/supabase.ts` — column names referenced; out-of-sync queries will silently return no rows

### External
- Supabase CLI for `db push` and `gen types`

<!-- MANUAL: -->
