# AquaWise Hatchery CRM — Architecture Reference

> PURPOSE: Authoritative reference for AI dev agents executing stories. Rules here are enforced — deviations are bugs.
> SOURCE OF TRUTH: `CLAUDE.md` (this file is a structured derivative).

---

## 1. Stack Summary

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router + Turbopack |
| UI | React 19, Tailwind 4 (CSS-first) |
| Language | TypeScript 5 strict |
| Backend | Supabase (Postgres + Auth + Storage) |
| Server cache | TanStack Query 5 |
| Ephemeral UI state | Zustand |
| i18n | next-intl 4.5 |
| Billing | Stripe (THB 5,000/mo Pro; 30-day no-card trial) |
| Testing | Vitest |
| Package manager | pnpm 10 (locked) |

---

## 2. Key Architectural Rules

Numbered rules. Violation = bug. Never argue with these.

1. **API facade only.** All pages and components import from `@/lib/api` only. Never call Supabase directly from a page or component.
2. **Server components are the default.** `'use client'` is opt-in — only when state, effects, or event handlers are required.
3. **No `any` in app code.** Narrow `as` casts allowed only in adapters (`lib/api/supabase.ts` — `rowToCustomer`, `rowToBatch`).
4. **Server actions live next to routes.** Path: `app/[locale]/(dashboard)/<page>/actions.ts`. Required for anything that writes `audit_log` or talks to Stripe.
5. **`'server-only'` guard on `lib/stripe/server.ts` and `lib/auth.ts`.** Stripe SDK must never bundle into the client.
6. **Mock dispatches automatically.** The facade uses mock when `USE_MOCK=true` (default) OR when `NEXT_PUBLIC_SUPABASE_URL` is unset. Both env vars must match: `USE_MOCK` (server) and `NEXT_PUBLIC_USE_MOCK` (client).
7. **Every API function returns `Promise<T>`.** Even mock functions are async. This ensures the live swap is zero-change at call sites.
8. **RBAC via `can(role, action)` only.** Never branch on role strings directly. See §4.
9. **Locale default is `th`.** All new features are built against the Thai surface first. English is gated to `<ComingSoon />` at `app/[locale]/layout.tsx`.
10. **Both message files must be updated.** Every i18n key must exist in `messages/th.json` AND `messages/en.json`. Missing keys render `⚠️ {key}` in dev.
11. **Run scripts via `pnpm` only.** `packageManager` is locked to `pnpm@10.0.0`.
12. **No `tailwind.config.ts`.** Tailwind 4 uses CSS-first tokens in `app/globals.css`. Do not create one.
13. **`SUPABASE_SERVICE_ROLE_KEY` is server-only.** Never expose to client bundles.

---

## 3. API Facade Pattern

**File:** `lib/api/index.ts`

**Dispatch logic:**

```typescript
const useMock =
  (process.env.NEXT_PUBLIC_USE_MOCK ?? process.env.USE_MOCK) !== 'false' ||
  !process.env.NEXT_PUBLIC_SUPABASE_URL;

const impl = useMock ? mock : live;
```

**Current exported methods:**

| Method | Purpose |
|---|---|
| `getHatchery` | Fetch the calling user's hatchery row |
| `listCustomers` | List all customers for the hatchery |
| `getCustomer` | Fetch a single customer by ID |
| `listBatches` | List all PL batches |
| `getBatch` | Fetch a single batch by ID |
| `listAlerts` | List disease/alert events |
| `getPrices` | Fetch current PL market prices |
| `listTeam` | List team members |
| `getScorecardSettings` | Fetch public scorecard configuration |
| `getNotificationSettings` | Fetch notification preferences |
| `addCustomer` | Create a new customer |
| `addBatch` | Create a new PL batch |
| `closeAlert` | Mark an alert as closed |
| `updateScorecardSettings` | Persist scorecard settings |
| `updateNotificationSettings` | Persist notification settings |
| `getSubscription` | Fetch billing subscription state |
| `getInvoiceHistory` | Fetch Stripe invoice list |

**Exported types:** `AddCustomerInput`, `AddBatchInput` (re-exported from `lib/mock/api`).

**How to add a new method:**

1. Add the async function signature to `lib/mock/api.ts` (implement with in-memory data).
2. Add the matching async function to `lib/api/supabase.ts` (implement against Supabase).
3. Export via `lib/api/index.ts`: `export const myMethod = impl.myMethod;`.
4. Both implementations must share the same `Promise<T>` signature.

---

## 4. RBAC

**File:** `lib/rbac.ts`

**Role enum** (DB type: `Database['public']['Enums']['hatchery_role']`):

```typescript
type Role = 'owner' | 'counter_staff' | 'lab_tech' | 'auditor';
```

**Action matrix:**

| Action | `owner` | `counter_staff` | `lab_tech` | `auditor` |
|---|---|---|---|---|
| `customer:read` | Y | Y | Y | Y |
| `customer:write` | Y | Y | — | — |
| `batch:read` | Y | Y | Y | Y |
| `batch:write` | Y | Y | Y | — |
| `alert:close` | Y | Y | — | — |
| `team:invite` | Y | — | — | — |
| `settings:write` | Y | — | — | — |
| `broadcast:write` | Y | — | — | — |
| `data:export` | Y | Y | — | Y |
| `billing:manage` | Y | — | — | — |

**Usage:**

```typescript
import { can } from '@/lib/rbac';

if (can(member.role, 'customer:write')) {
  // render or execute
}
```

**Never do this:**

```typescript
// WRONG — branch on role strings directly
if (member.role === 'owner') { ... }
```

**Role notes:**
- `auditor` is reserved in the DB enum from day one. No UI grants it in Phase H1.
- `counter_staff` maps to both Manager and Customer Rep personas.
- `lab_tech` cannot create batches — only update PCR fields on existing batches.

---

## 5. RLS Tables

All rows carry `hatchery_id` directly or via FK chain. RLS is enforced at the Postgres level.

| Table | In migrations | RLS read scope | Insert | Update | Delete | Notes |
|---|---|---|---|---|---|---|
| `hatcheries` | Y (001) | Own row only | Server-side at signup | `owner` only | — | |
| `hatchery_members` | Y (001) | Own hatchery's members | `owner` (via invite acceptance) | `owner` only | `owner` only | |
| `team_invites` | Y (008) | `owner` only | `owner` only | `owner` only (revoke) | `owner` only | |
| `customers` | Y (001) | All roles, own hatchery | `owner` + `counter_staff` | `owner` + `counter_staff` | `owner` only | |
| `customer_bind_tokens` | Y (006) | Service role only | `owner` + `counter_staff` | Service role | Service role | LIFF bind flow |
| `batches` | Y (001) | All roles, own hatchery | `owner` + `counter_staff` | `owner` + `counter_staff` (basic); `lab_tech` (PCR fields) | `owner` only | |
| `pcr_results` | Y (001) | All roles, own hatchery | `lab_tech` + `owner` | `lab_tech` + `owner` | `owner` only | Spec formerly called `batch_pcr_tests` |
| `alerts` | Y (001) | All roles, own hatchery | `owner` + `counter_staff` + system trigger | `owner` + `counter_staff` (close/note) | `owner` only | |
| `notification_settings` | Y (001) | All roles, own hatchery | `owner` | `owner` | `owner` | |
| `scorecard_settings` | Y (001) | All roles, own hatchery | `owner` | `owner` | `owner` | |
| `line_outbound_events` | Y (006) | All roles, own hatchery | Server actions only | Service role (worker) | — | |
| `subscription_events` | Y (004) | `owner` only | Service role (Stripe webhook) | Service role | — | Spec formerly called `subscriptions`; idempotent |
| `hatchery_brand` | Y (001) | Own hatchery + public for `/h/{slug}` | `owner` | `owner` | — | Public when `scorecard_settings.public = true` |
| `batch_buyers` | Y (001) | All roles, own hatchery | `owner` + `counter_staff` | `owner` + `counter_staff` | `owner` only | Spec formerly called `batch_distributions` |
| `quotes` | *(planned)* | All roles, own hatchery | `owner` + `counter_staff` | `owner` + `counter_staff` | `owner` only | Not yet in migrations |
| `prices` | *(planned)* | All roles, own hatchery | `owner` only | `owner` only | `owner` only | Not yet in migrations |
| `customer_callbacks` | *(planned)* | All roles, own hatchery | `owner` + `counter_staff` | `owner` + `counter_staff` | `owner` only | Not yet in migrations |
| `line_message_logs` | *(planned)* | All roles, own hatchery | Service role only | — | — | Not yet in migrations |
| `data_exports` | *(planned)* | All roles, own hatchery | Server actions only | — | `owner` only | Not yet in migrations |

**`restock_thresholds`** is a JSONB column on `hatcheries` (added migration 010), not a separate table. Managed via `getHatchery` / `updateHatchery`.

**Cross-tenant read block** is P0. Run on every deploy:

```sql
-- as user A (hatchery_a member)
SELECT count(*) FROM customers WHERE hatchery_id = '{hatchery_b}'; -- expected: 0
SELECT count(*) FROM batches WHERE hatchery_id = '{hatchery_b}';   -- expected: 0
-- repeat for every table with hatchery_id
```

---

## 6. i18n Rules

- Default locale: `th`. All feature work targets the Thai surface.
- English (`en`) is gated — `app/[locale]/layout.tsx` renders `<ComingSoon />` when `locale === 'en'`.
- Routes are locale-prefixed: `app/[locale]/...`
- Middleware (`proxy.ts`) runs `next-intl` + injects `x-pathname` header. Matcher excludes `/auth/*`.

**String key rules:**

1. All keys must exist in BOTH `messages/th.json` AND `messages/en.json`.
2. Missing key renders `⚠️ {key}` in dev — immediately visible.
3. Add both files in the same commit as the feature.

**Usage in server components:**

```typescript
import { getTranslations } from 'next-intl/server';
const t = await getTranslations('Namespace');
```

**Usage in client components:**

```typescript
import { useTranslations } from 'next-intl';
const t = useTranslations('Namespace');
```

---

## 7. Modal System

**State:** Zustand store at `lib/store/modal.ts` — `kind` union discriminates which modal is open.

**Mount point:** `<ModalRoot />` inside `<Providers>` in `components/providers.tsx`.

**To add a new modal:**

1. Extend the `kind` union in `lib/store/modal.ts`.
2. Add a new `case` branch in `components/modals/ModalRoot.tsx`.
3. Create the component at `components/modals/<name>-modal.tsx`.
4. The component receives its props via the store payload — no prop drilling.

**Existing modals:** 8 modals currently in `components/modals/`.

---

## 8. State Management

| Concern | Tool | Location |
|---|---|---|
| Server data (customers, batches, alerts, etc.) | TanStack Query 5 | Hooks in `app/[locale]/(dashboard)/` pages |
| Modal open/close + payload | Zustand | `lib/store/modal.ts` |
| Sidebar collapsed flag | Zustand | `lib/store/sidebar.ts` |

**TanStack Query pattern:**

```typescript
import { useQuery } from '@tanstack/react-query';
import { listCustomers } from '@/lib/api';

const { data, isLoading } = useQuery({
  queryKey: ['customers'],
  queryFn: listCustomers,
});
```

Do not use Zustand for server data. Do not use TanStack Query for ephemeral UI state.

---

## 9. Design Tokens

**File:** `app/globals.css` under `@theme inline`.

**No `tailwind.config.ts`** — Tailwind 4 doesn't use one for tokens.

**Token families:**

| Family | Tokens |
|---|---|
| Canvas / structure | `aw3-canvas`, `aw3-app`, `aw3-card`, `aw3-ink`, `aw3-hero` |
| Pastel pairs | `aw3-lav`, `aw3-peach`, `aw3-mint`, `aw3-sky`, `aw3-rose`, `aw3-amber` |
| Status | `aw3-good`, `aw3-bad`, `aw3-warn` |

**Usage in custom primitives (`components/aw/`):**

```css
/* Use CSS variables directly — not Tailwind utility classes */
background: var(--color-aw3-canvas);
color: var(--color-aw3-ink);
```

**Prototypes:** `prototypes/AquaWise Hatchery v3 - Standalone.html` is read-only design intent. Open in browser to see token usage in context.

**Brand constraints (non-negotiable):**
- No emoji on professional surfaces.
- No dark mode.
- No customization.
- Never use: "AI-powered", "platform", "revolutionary", excitement, urgency, awe-at-tech.

---

## 10. Testing Commands

```bash
pnpm test                                    # vitest run (all tests)
pnpm test:watch                              # vitest watch mode
pnpm test:ui                                 # vitest with UI
pnpm vitest run path/to/file.test.ts         # single file
pnpm vitest run -t "test name substring"     # by name match
pnpm typecheck                               # tsc --noEmit (strict) — CI gate
pnpm lint                                    # next lint — CI gate
pnpm format:check                            # prettier check
```

**Green-build gates:** `pnpm typecheck` AND `pnpm lint` must pass. Vitest coverage is thin — mock-mode click-through is the dominant verification path today.

**P0 test:** Cross-tenant read block (see §5). Must run on every deploy.

---

## 11. File Naming Conventions

| Artifact | Path pattern |
|---|---|
| Page server component | `app/[locale]/(dashboard)/<page>/page.tsx` |
| Server actions | `app/[locale]/(dashboard)/<page>/actions.ts` |
| Tests | `tests/<domain>/<feature>.test.ts` |
| AquaWise primitives | `components/aw/<Name>.tsx` |
| Layout components | `components/layout/<Name>.tsx` |
| Feature components | `components/<domain>/<Name>.tsx` |
| Modals | `components/modals/<name>-modal.tsx` |
| Zustand stores | `lib/store/<name>.ts` |
| API facade | `lib/api/index.ts` (single file — do not split) |
| Mock implementation | `lib/mock/api.ts` |
| Live implementation | `lib/api/supabase.ts` |

---

## 12. Billing Gate

**Server component:** `app/[locale]/(dashboard)/billing-gate.tsx`

Mounted in dashboard `layout.tsx`. Redirects expired/canceled tenants to `/billing/trial-expired` for all routes except: `/settings`, `/billing/*`, `/login`, `/auth`.

**State source:** `hatcheries.subscription_status` + `hatcheries.trial_ends_at`.

**Stripe webhook** at `app/api/webhooks/stripe/route.ts` is the single source of truth for subscription state. Uses service-role client + `subscription_events` table for idempotency.

**Mock billing state** (dev only — `MOCK_BILLING_STATE` in `.env.local`):

| Value | Simulates |
|---|---|
| `trialing-25` | Trial active, 25 days remain |
| `trialing-2` | Trial active, 2 days remain |
| `trial_expired` | Trial ended, no subscription |
| `active` | Paid Pro plan |
| `past_due` | Payment failed |

---

## 13. Shared Domain Types

**File:** `lib/types.ts`

Key types used across API facade, mock, and components:

```typescript
Customer         // id, name, farm, zone, batches, ltv, lastBuy, cycleDay, status, ...
Batch            // id, date, source, plProduced, plSold, farms, meanD30, pcr, ...
Alert            // id, sev, title, desc, batch, date, farms, action, closed
PriceRow         // size, price, delta, avg3y
Prices           // date, source, rows: PriceRow[]
Hatchery         // name, nameEn, location, locationEn, restockThresholds
TeamMember       // name, role, perm: 'owner'|'counter_staff'|'lab_tech'|'auditor'
ScorecardSettings
NotificationSettings
RestockThresholds // now, week, month (jsonb on hatcheries)
Subscription      // status, plan, trialEndsAt, currentPeriodEnd, cancelAtPeriodEnd, ...
Invoice           // id, number, amount, currency, status, paidAt, hostedUrl, pdfUrl
CustomerStatus   // 'active'|'restock-soon'|'restock-now'|'concern'|'quiet'
PcrStatus        // 'clean'|'flagged'|'pending'
SubscriptionStatus // 'trialing'|'trial_expired'|'active'|'past_due'|'canceled'|'incomplete'
Locale           // 'en'|'th'
```
