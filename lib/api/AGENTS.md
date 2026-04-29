<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-26 | Updated: 2026-04-26 -->

# api

## Purpose
**The API facade.** This is what pages and modals import (`from '@/lib/api'`). It transparently picks between the in-memory mock layer and the live Supabase implementation based on `USE_MOCK`.

```
pages / modals
     │
     ▼
@/lib/api           ← this directory's index.ts
     │
     ├── if USE_MOCK=true (or no SUPABASE_URL) → @/lib/mock/api
     └── else                                   → ./supabase
```

Switching providers is a one-line change to `.env.local` — no page edits.

## Key Files

| File | Description |
|------|-------------|
| `index.ts` | The facade. 18 exports cover hatchery, customers, batches, alerts, prices, team, scorecard/notification settings, billing, and 4 mutations (`addCustomer`, `addBatch`, `closeAlert`, `updateScorecardSettings`, `updateNotificationSettings`) |
| `supabase.ts` | Live implementation against the browser Supabase client. Uses RLS to scope rows by hatchery. Includes `rowToCustomer` / `rowToBatch` adapters that bridge snake_case rows to camelCase domain types |

## For AI Agents

### Working In This Directory
- **Pages MUST import from `@/lib/api`**, not from `@/lib/api/supabase` or `@/lib/mock/api` directly. The facade is the API contract.
- **Adding a new function**:
  1. Add the mock impl to `@/lib/mock/api.ts`.
  2. Add the live impl to `lib/api/supabase.ts` (with the `rowTo*` adapter if needed).
  3. Re-export from `lib/api/index.ts` (`export const myFn = impl.myFn;`).
  4. Both impls must have **identical signatures** (TypeScript will catch drift).
- **Mock-mode auto-fallback**: even with `USE_MOCK=false`, the facade falls back to mock when `NEXT_PUBLIC_SUPABASE_URL` is unset. This is intentional — devs without Supabase access still get a working UI.
- **The Supabase impl uses the BROWSER client** (`@/lib/supabase/client`) so it can run from server or client components alike (Next 16 RSC + 'use client' both call into it). Mutations that need to write `audit_log` should NOT live here; use a server action instead.
- **`getInvoiceHistory` returns `[]` from `supabase.ts`** — real invoices require the Stripe secret key, which only the Settings page's server action `fetchInvoiceHistory()` has access to. The contract just keeps the facade satisfied.

### Common Patterns
- All functions are `async` and return `Promise<T>`.
- The Supabase impl coalesces missing rows to safe defaults (empty arrays, default `ScorecardSettings`) so the UI renders correctly on a fresh tenant.
- Type re-exports: `index.ts` re-exports the mock layer's `AddCustomerInput` and `AddBatchInput` so callers have one place to import everything.

## Dependencies

### Internal
- `@/lib/mock/api` (mock impl)
- `@/lib/supabase/client` (browser Supabase client)
- `@/lib/types`, `@/lib/database.types`
- `@/lib/mock/data` (still used for `PRICES`/`TEAM`/`HATCHERY` defaults — these aren't in the schema yet)

### External
- `@supabase/ssr` (via `lib/supabase/client`)

<!-- MANUAL: -->
