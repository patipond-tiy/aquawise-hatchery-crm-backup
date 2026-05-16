<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-26 | Updated: 2026-05-16 -->

# lib

## Purpose
Domain code, infra clients, and shared helpers — everything that isn't a route, a component, or a static asset.

The most important file is **`lib/types.ts`** — the canonical domain shape (`Customer`, `Batch`, `Alert`, `Nursery`, `ScorecardSettings`, `NotificationSettings`, `TeamMember`, `Subscription`, `Invoice`). Both the mock layer and the Supabase layer are adapters that produce these types; pages never see DB column names.

The next most important is **`lib/api/`** — the facade that pages import. It picks between mock and Supabase based on `USE_MOCK`.

## Key Files

| File | Description |
|------|-------------|
| `types.ts` | Domain types — single source of truth. Pages, components, and adapters all consume these |
| `database.types.ts` | Supabase-generated row/insert/update/enum types. Re-generate with `supabase gen types typescript --linked > lib/database.types.ts` after schema changes |
| `auth.ts` | `'server-only'`. `currentNurseryScope()` resolves `{ userId, nurseryId, role }` from the cookie session; `getCurrentTenantId()` returns just the nursery id. Returns `null` in mock mode. (First-sign-in bootstrap is separate — see `auth/AGENTS.md`) |
| `audit.ts` | `'server-only'`. `writeAuditLog(action, payload)` — appends to `audit_log` from server actions on every audited write |
| `rbac.ts` | `can(role, action)` permission checker. Roles (`nursery_role`): `owner`/`counter_staff`/`lab_tech`/`auditor`. Actions: `customer:read/write`, `batch:read/write`, `alert:close`, `team:invite`, `settings:write`, `broadcast:write`, `data:export`, `billing:manage` |
| `utils.ts` | `cn()` — clsx + tailwind-merge composition helper (note: the `utils/` directory is separate — see `utils/AGENTS.md`) |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `api/` | API facade (`index.ts`) + Supabase implementation (`supabase.ts`) (see `api/AGENTS.md`) |
| `mock/` | In-memory mock data + mock API + mock billing state (see `mock/AGENTS.md`) |
| `supabase/` | Browser/server/service clients + middleware session refresh (see `supabase/AGENTS.md`) |
| `stripe/` | Server-only SDK init (`server.ts`) + plan config (`config.ts`) (see `stripe/AGENTS.md`) |
| `billing/` | Pure trial/subscription derivation + the `requireActiveSubscription` write guard (see `billing/AGENTS.md`) |
| `store/` | Zustand stores: modal stack + sidebar collapsed flag (see `store/AGENTS.md`) |
| `auth/` | First-sign-in tenant bootstrap (`bootstrap.ts`) — distinct from `auth.ts` (see `auth/AGENTS.md`) |
| `derive/` | Pure view-model derivation, e.g. `dashboard-stats.ts` (see `derive/AGENTS.md`) |
| `query/` | Server-side per-request TanStack QueryClient for RSC prefetch/hydrate (see `query/AGENTS.md`) |
| `utils/` | Standalone utilities, e.g. `mock-mode.ts` — distinct from `utils.ts` (see `utils/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- **Domain types are camelCase** (`farmEn`, `cycleDay`, `mean_d30` → `meanD30`). Supabase rows are snake_case. The `rowTo*` adapters in `lib/api/supabase.ts` are the only place that bridge them.
- **Adding a new domain field**: (1) extend the type in `types.ts`, (2) add the column in a new `supabase/migrations/00X_*.sql`, (3) regenerate `database.types.ts`, (4) update `rowTo*` in `lib/api/supabase.ts`, (5) update `lib/mock/data.ts` so mock mode keeps working, (6) update `lib/api/index.ts` only if you added a new function.
- **`server-only` import** is mandatory in any file that uses `process.env.STRIPE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY`. See `lib/stripe/server.ts` and `lib/auth.ts`.
- **Do not call `createClient` (browser) inside a server component.** Use `lib/supabase/server.ts`'s `createClient` (RSC-aware cookies) or `createServiceClient` (service-role; bypasses RLS).

### Common Patterns
- All API functions are async and return `Promise<T>` even in mock mode.
- Adapters that return non-nullable defaults (e.g., `getScorecardSettings`) coalesce missing rows to safe defaults so the UI never crashes on a fresh tenant.
- The Stripe SDK is **lazy-initialized** (`getStripe()` in `lib/stripe/server.ts`) so an unset `STRIPE_SECRET_KEY` doesn't blow up the bundle in mock mode.

## Dependencies

### Internal
- Pages → `@/lib/api` (and only `@/lib/api`)
- API facade → `@/lib/mock/api` and `@/lib/api/supabase`
- Supabase adapter → `@/lib/supabase/client` + `@/lib/database.types`
- Stripe webhook + checkout actions → `@/lib/stripe/server` + `@/lib/supabase/server` (service client)

### External
- `@supabase/ssr`, `@supabase/supabase-js`
- `stripe` (server-only)
- `zustand` (+ `zustand/middleware` `persist` for sidebar)
- `clsx`, `tailwind-merge`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
