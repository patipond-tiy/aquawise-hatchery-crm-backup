<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-26 | Updated: 2026-05-16 -->

# migrations

## Purpose
Ordered SQL migrations applied via `supabase db push`. Numbered by execution order — once a migration is applied to any environment, it must never be edited; new changes go in a new file.

## Key Files

| File | Description |
|------|-------------|
| `001_init.sql` | Schema — `nurseries`, `nursery_members`, `customers`, `customer_cycles`, `batches`, `batch_buyers`, `pcr_results`, `alerts`, `alert_farms`, `scorecard_settings`, `notification_settings`, `audit_log`. Defines enum types (`nursery_role` [legacy values, see `007`], `customer_status`, `pcr_status`, `alert_severity`) |
| `002_rls.sql` | Enables RLS on every table; SELECT/INSERT/UPDATE policies scoped via `nursery_members.nursery_id = auth.uid()` membership. Defines the `create_nursery(...)` `security definer` RPC |
| `003_seed.sql` | Inserts the Thai mock data (mirrors `lib/mock/data.ts`) so a fresh project demos immediately |
| `004_billing.sql` | Adds Stripe + trial columns to `nurseries` (`trial_ends_at`, `stripe_customer_id`, `stripe_subscription_id`, `subscription_status`, `subscription_current_period_end`, `subscription_cancel_at_period_end`); creates `subscription_events` (idempotency log); updates `create_nursery()` to set 30-day trial defaults |
| `005_backfill_demo.sql` | Backfills the demo nursery to `subscription_status = 'active'` (never expires) so local dev/demo isn't paywalled |
| `006_line_integration.sql` | LINE × Nursery-CRM Phase 1 (identity bind + outbound push). Strictly additive: `nursery_brand`, `customer_bind_tokens`, `line_outbound_events` |
| `007_roles_reconcile.sql` | Reconciles `nursery_role` from the legacy `('owner','admin','editor','viewer','technician')` to the current `('owner','counter_staff','lab_tech','auditor')` (per `08-roles-and-rls.md` / FR-TEAM-002) |
| `008_team_invites.sql` | Owner-issued, token-based team invites with 7-day expiry. Adds `team_invites`; enables `citext` |
| `009_customer_fields.sql` | Adds nullable `customers.package_interest` (collected in the onboarding modal; informational) |
| `010_restock_thresholds.sql` | Per-nursery configurable restock thresholds (replaces inline constants; defaults `now<=0, week<=14, month<=45`) |
| `011_rls_tighten.sql` | Tightens RLS to match `08-roles-and-rls.md` (corrects the permissive policies `007` deliberately preserved during the enum rename) |
| `012_storage_logos.sql` | Creates the `nursery-logos` storage bucket (companion: `lib/supabase/storage.ts`, path `{nurseryId}/logo.{ext}`) |

## For AI Agents

### Working In This Directory
- **Number new migrations sequentially.** Next free number wins (`013_*.sql`).
- **Never edit a previously-applied migration.** Even a "harmless" change breaks Supabase's migration ledger.
- **Every new domain table must have**:
  - `nursery_id uuid not null references public.nurseries(id) on delete cascade`
  - RLS enabled and a SELECT policy scoped to `nursery_members` membership
  - `created_at timestamptz not null default now()`
- **Service-role inserts/updates are allowed by absence of policy.** Don't write `with check (true)` — that opens the table to authenticated users.
- **Run `supabase gen types typescript --linked > lib/database.types.ts` after every schema-shape change.** Otherwise the generated types drift and `lib/api/supabase.ts` adapters break silently at runtime.
- **`create_nursery` RPC is `security definer`** and is the canonical onboarding path — it creates the `nurseries` row, the owner `nursery_members` row, default `scorecard_settings`, default `notification_settings`, and sets the trial deadline. New onboarding flows call this RPC (via `lib/auth/bootstrap.ts`), not raw inserts.

### Common Patterns
- ID strategy: most tables use `uuid default gen_random_uuid()`. Batches use a string id (e.g., `B-2604-A`) for human-readable listings.
- Enum changes: `alter type ... add value 'new_value'` in a new migration; PostgreSQL forbids removing values (hence the `007` reconcile dance).
- `subscription_events` is service-role-only on writes (no INSERT policy), readable by `owner` of the owning nursery.

## Dependencies

### Internal
- `lib/database.types.ts` — regenerate after every structural change
- `lib/api/supabase.ts` — column names referenced; out-of-sync queries silently return no rows
- `lib/auth/bootstrap.ts` — calls the `create_nursery` RPC
- `lib/supabase/storage.ts` — pairs with the `nursery-logos` bucket (`012`)

### External
- Supabase CLI for `db push` and `gen types`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
