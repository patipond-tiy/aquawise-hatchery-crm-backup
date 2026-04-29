<!-- Generated: 2026-04-26 | Updated: 2026-04-26 -->

# hatchery-crm

## Purpose
**AquaWise Hatchery CRM** — Thai/English (default `th`) SaaS for shrimp & fish hatchery operators in Southeast Asia. Hatcheries sell post-larvae (PL) to farms; the app tracks customers (farms), batches with PCR results, disease alerts, a public scorecard, restock cadence, team RBAC, and Stripe billing (30-day no-card trial → THB 5,000/mo Pro plan).

Built on the same stack as the sibling `aquawise-platform` so primitives can later move into a shared workspace. Currently single-package; not (yet) a monorepo.

## Architecture in one minute

- **Next.js 16 App Router** with Turbopack. Locale-prefixed routes: `/[locale]/...` where `locale ∈ {th, en}`.
- **i18n via `next-intl` 4.5**, default `th`. `proxy.ts` (root middleware) runs `next-intl` AND injects `x-pathname` header so server components like `BillingGate` can branch on the URL.
- **API facade**: pages import only from `@/lib/api`, which transparently switches between mock (`lib/mock/api.ts`) and Supabase (`lib/api/supabase.ts`) based on `USE_MOCK` env var. The mock layer has the same async signatures as the live one — flipping the flag is a one-line swap.
- **Auth & multi-tenant scope**: Supabase Auth (magic link). Every domain row carries `hatchery_id`; RLS scopes reads/writes to `hatchery_members.hatchery_id` of the calling user. Role enum: `owner`/`admin`/`editor`/`viewer`/`technician` (see `lib/rbac.ts`).
- **Billing**: trial state lives on `hatcheries` (column `subscription_status` + `trial_ends_at`). `BillingGate` (server component in dashboard layout) redirects expired/canceled users everywhere except `/settings`, `/billing/trial-expired`, `/login`, `/auth`. Stripe webhook at `app/api/webhooks/stripe/route.ts` is the source of truth — uses service-role client and `subscription_events` for idempotency.
- **Client state**: TanStack Query 5 for server cache; Zustand for ephemeral UI (modal stack `lib/store/modal.ts`, sidebar collapsed flag `lib/store/sidebar.ts`).
- **Design system**: Tailwind 4 with CSS-first tokens in `app/globals.css` (`@theme inline`). Custom `aw3-*` tokens (canvas/app/card/ink/hero, plus pastel pairs `lav`/`peach`/`mint`/`sky`/`rose`/`amber` and `good`/`bad`/`warn`). Custom primitives in `components/aw/` use `var(--color-…)` directly to stay compatible with both prototype CSS and Tailwind utilities.

## Key Files

| File | Description |
|------|-------------|
| `package.json` | Next 16 / React 19 / TS 5 / Tailwind 4 / pnpm 10. Scripts: `dev`, `build`, `start`, `typecheck`, `lint`, `format` |
| `tsconfig.json` | Strict, `@/*` → repo root, excludes `prototypes/` |
| `next.config.mjs` | Wraps with `next-intl` plugin pointing at `i18n/request.ts` |
| `proxy.ts` | Root middleware. Runs next-intl AND sets `x-pathname` header (read by `BillingGate`) |
| `postcss.config.mjs` | Tailwind 4 via `@tailwindcss/postcss` |
| `.env.example` | Source of truth for env vars (see below) |
| `README.md` | Quick start + Wiring Supabase walkthrough |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `app/` | Next.js App Router routes, layouts, API routes (see `app/AGENTS.md`) |
| `components/` | React components: AquaWise primitives, layout shell, modals, providers (see `components/AGENTS.md`) |
| `lib/` | Domain types, API facade, Supabase clients, Stripe, billing helpers, Zustand stores (see `lib/AGENTS.md`) |
| `i18n/` | next-intl routing/request config + typed navigation helpers (see `i18n/AGENTS.md`) |
| `messages/` | `en.json` + `th.json` translation bundles (see `messages/AGENTS.md`) |
| `supabase/` | SQL migrations: schema, RLS policies, seed, billing columns (see `supabase/AGENTS.md`) |
| `public/` | Static assets — currently `aquawise-logo.png` only |
| `docs/` | PLAN.md, CHECKLIST.md, STRIPE.md, MIRROR.md (see `docs/AGENTS.md`) |
| `prototypes/` | V3 standalone HTML reference + archived JSX sources — read-only design intent (see `prototypes/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- **Run scripts via pnpm only** (`pnpm dev`, `pnpm build`, `pnpm typecheck`, `pnpm lint`). `packageManager` is locked to `pnpm@10.0.0`.
- **Default locale is `th`**, not `en`. URLs are `/th/...` first. Note: `app/[locale]/layout.tsx` currently renders a `<ComingSoon />` page when `locale === 'en'` — the English experience is intentionally gated. When porting features, focus on the Thai surface.
- **Every UI string lives in BOTH `messages/en.json` AND `messages/th.json`** (CI is intended to enforce this; missing keys show `⚠️ {key}` in dev).
- **Never call Supabase directly from a page** — go through `@/lib/api`. The facade is the only place that knows about `USE_MOCK`.
- **Server-only files are explicit**: `lib/stripe/server.ts` and `lib/auth.ts` import `'server-only'`. Stripe SDK must never be bundled into the client.
- **`'use client'` is opt-in**, not the default. Server components are the norm in the App Router; mark client components only when they need state/effects/event handlers.
- **No `any` in app code** — narrow `as` casts allowed only in adapters that bridge Supabase row types to domain types (see `lib/api/supabase.ts`'s `rowToCustomer` / `rowToBatch`).

### Testing Requirements
- Tests are not yet wired. `pnpm typecheck` and `pnpm lint` are the green-build gates today.
- Manually exercise the mock layer end-to-end: navigate every page, open every modal, fire mutations.
- For billing-state behavior, set `MOCK_BILLING_STATE` (values: `trialing-25` | `trialing-2` | `trial_expired` | `active` | `past_due`) and reload — the Settings → Billing tab + `BillingGate` redirects react accordingly.

### Common Patterns
- **Async-only API surface**. Even mock functions return `Promise<T>` so the live swap doesn't change call sites.
- **Server actions live next to their routes** (`app/[locale]/(dashboard)/<page>/actions.ts`) — though most mutation paths today still call `@/lib/api` from client. Server actions are required for anything that writes `audit_log` or talks to Stripe.
- **Modal system is a single Zustand store** (`lib/store/modal.ts`) with `open(kind, props)` + a single `<ModalRoot />` mounted in `<Providers>` that switches on `kind`. New modals: add the kind union, the props branch in `ModalRoot`, and the modal component in `components/modals/`.
- **Tailwind tokens come from `app/globals.css`** under `@theme inline`. Add new colors there, not in a `tailwind.config.ts` (Tailwind 4 doesn't need one for tokens).

## Environment Variables

| Var                              | Required when               | Notes                            |
|----------------------------------|-----------------------------|----------------------------------|
| `USE_MOCK`                       | always (default `true`)     | `true` → mock, `false` → Supabase. Also auto-falls back to mock if `NEXT_PUBLIC_SUPABASE_URL` is unset |
| `MOCK_BILLING_STATE`             | dev (mock mode)             | `trialing-25` \| `trialing-2` \| `trial_expired` \| `active` \| `past_due` |
| `NEXT_PUBLIC_SUPABASE_URL`       | `USE_MOCK=false`            |                                   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | `USE_MOCK=false`            |                                   |
| `SUPABASE_SERVICE_ROLE_KEY`      | server actions + webhook    | service-role only — never ship to client |
| `STRIPE_SECRET_KEY`              | live billing                | `lib/stripe/server.ts` lazy-inits and throws if missing |
| `STRIPE_WEBHOOK_SECRET`          | live billing                | verifies `Stripe-Signature` in `app/api/webhooks/stripe/route.ts` |
| `STRIPE_PRO_PRICE_ID`            | live billing                | Pro plan price id |
| `NEXT_PUBLIC_APP_URL`            | live billing                | Used for Checkout success/cancel + Portal return URLs |

## Dependencies

### External
- `next` ^16, `react` ^19, `typescript` ^5.6
- `tailwindcss` ^4.1, `@tailwindcss/postcss` — CSS-first tokens
- `next-intl` ^4.5 — i18n routing + `getRequestConfig`
- `@supabase/ssr` ^0.7, `@supabase/supabase-js` ^2.75 — Auth + RLS
- `@tanstack/react-query` ^5.90 — server cache
- `zustand` ^5 — modal store + sidebar collapse
- `stripe` ^18 — server-only SDK for Checkout, Portal, webhooks
- `react-hook-form` ^7 + `zod` ^4 + `@hookform/resolvers` — form layer
- Radix UI primitives + `lucide-react` icons + `sonner` toasts
- `recharts` ^3 — but most charts are hand-rolled SVG in `components/aw/charts/`
- `framer-motion` ^12 — used sparingly; most motion is CSS keyframes

## Status snapshot (per `docs/PLAN.md`)
Phases 1–4 done; Phase 5 (polish + deploy) in progress; Phase 6 (Stripe Pro plan + 30-day trial) code-complete, awaiting Stripe Dashboard provision.

<!-- MANUAL: -->
