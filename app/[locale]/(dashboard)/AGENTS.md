<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-26 | Updated: 2026-04-26 -->

# (dashboard)

## Purpose
Authenticated app surface — the **9 main pages** of the Nursery CRM. The parenthesized `(dashboard)` is a route group, so the layout applies but the segment doesn't appear in the URL: `/th/customers`, not `/th/dashboard/customers`.

The layout (`layout.tsx`) wraps everything in `<BillingGate>` (server-side paywall) → `<TrialBanner>` (header) → `<Shell>` (3-column).

## Key Files

| File | Description |
|------|-------------|
| `layout.tsx` | Wraps children in `<BillingGate locale={locale}>` then `<TrialBanner />` then `<Shell>`. Reads locale from params |
| `page.tsx` | Dashboard home — hero with nursery name, stat chips, "Continue where you left off" cards, recent batches table |
| `billing-gate.tsx` | Server component — calls `getSubscription()`, derives `effectiveStatus`, redirects to `/{locale}/billing/trial-expired` for expired/canceled users (except on `/settings`, `/billing/trial-expired`, `/login`, `/auth`). Reads `x-pathname` header set by `proxy.ts` |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `customers/` | List of farms + per-farm detail pages |
| `batches/` | List of PL batches + per-batch detail pages |
| `restock/` | Customers grouped by restock urgency |
| `alerts/` | Active disease/quality alerts with close action |
| `scorecard/` | Public scorecard preview + visibility toggles + QR |
| `settings/` | Profile + notifications + team + data export + billing tabs |

## For AI Agents

### Working In This Directory
- **`BillingGate` is the single paywall checkpoint.** Don't add ad-hoc subscription checks in individual pages — the gate covers them all from the layout.
- **Settings is paywall-exempt** (so users can reach Billing to subscribe). If you add a new "always reachable during paywall" page, extend the `allowed` check in `billing-gate.tsx`.
- **Adding a new page**: create `app/[locale]/(dashboard)/<name>/page.tsx`, add the nav link in `components/layout/left-rail.tsx`, add the translation keys in both `messages/en.json` and `messages/th.json`. The shell + paywall come for free.
- **Server actions co-locate with pages** (e.g., `actions.ts` next to a route's `page.tsx`). They are the right place for mutations that write `audit_log` or talk to Stripe (mock-mode mutations can still go via `@/lib/api`).
- **Pages are server components by default.** Only mark `'use client'` for parts that need state/effects (lists with filter UI, tabs, forms).
- **Read locale from `params`** in async server components. `params` is a Promise in Next 16 — `const { locale } = await params`.

### Common Patterns
- Each list page calls `await listX()` from `@/lib/api` and either renders directly (RSC) or hands off to a `'use client'` child for filter/search UI.
- Detail pages use dynamic segments (`[id]/page.tsx`) and call `getX(id)` — return `notFound()` if null.
- Modals are opened via `useModal().open(kind, props)` from inside `'use client'` components — typical pattern: a button in a server component renders a `<Suspense>` wrapping a client wrapper that opens the modal.

## Dependencies

### Internal
- `@/components/layout/shell`, `@/components/layout/trial-banner`
- `@/lib/api` (every read), `@/lib/billing/trial`, `@/lib/types`
- `@/i18n/navigation` for cross-page locale-aware links

### External
- `next/headers` (`headers()`), `next/navigation` (`redirect`, `notFound`)

<!-- MANUAL: -->
