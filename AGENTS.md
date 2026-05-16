<!-- Generated: 2026-04-26 | Updated: 2026-05-16 -->

# nursery-crm

## Purpose
**AquaWise Nursery CRM** — Thai/English (default `th`) SaaS for shrimp & fish **nursery** operators (`โรงอนุบาล`) in Southeast Asia. The customer is the operator who **buys nauplii from a hatchery, grows them ~20 days, and sells post-larvae (PL) to farm customers** — the mid-chain player in `hatchery → nursery → farm`. Archetype: **P'Pong** (per `../aquawise-docs/04-aquawise-nursery-customer-doc.md`). The app tracks customers (farms), PL batches with PCR results, disease alerts, a public scorecard, restock cadence, team RBAC, and Stripe billing (30-day no-card trial → THB 5,000/mo Pro plan).

This is one of two product submodules in the `aquawise-ecosystem` umbrella (the other is `line-bot/`). It is **single-package**, not a monorepo — `packageManager: pnpm@10.0.0`. The nursery is the AquaWise farmer-side distribution channel served **now (2026)**; the genuine upstream **hatchery** (`โรงเพาะฟัก`, archetype P'Bunjong) is a distinct **2027+** stakeholder and a separate future product — do **not** conflate the two. This repo was initially mis-scoped as a "hatchery" CRM; the live code, schema, and repo are now "nursery".

## Architecture in one minute

- **Next.js 16 App Router** with Turbopack, **React 19**, **TS 5 strict**. Locale-prefixed routes: `app/[locale]/...` where `locale ∈ {th, en}`.
- **i18n via `next-intl` 4.5**, default `th`. `proxy.ts` (root middleware) runs `next-intl` AND injects an `x-pathname` header so server components like `BillingGate` can branch on the URL. `app/[locale]/layout.tsx` renders `<ComingSoon />` for `en` — the English surface is intentionally gated.
- **API facade**: pages/components import only from `@/lib/api`, which transparently switches between mock (`lib/mock/api.ts`) and Supabase (`lib/api/supabase.ts`) on `USE_MOCK` / `NEXT_PUBLIC_USE_MOCK` (auto-falls back to mock if `NEXT_PUBLIC_SUPABASE_URL` is unset). Mock and live share async signatures — flipping the flag is a one-line swap.
- **Auth & multi-tenant scope**: Supabase Auth (magic link + PKCE/implicit). Every domain row carries `nursery_id`; RLS scopes reads/writes to `nursery_members.nursery_id` of the calling user. Server-side tenant resolution goes through `currentNurseryScope()` / `getCurrentTenantId()` in `lib/auth.ts` (`'server-only'`).
- **RBAC** (`lib/rbac.ts`): role enum is `Database['public']['Enums']['nursery_role']` = `owner | counter_staff | lab_tech | auditor`. Action-based — use `can(role, action)`, never branch on role strings. (Migration `001_init.sql` defines the legacy enum `owner/admin/editor/viewer/technician`; `007_roles_reconcile.sql` reconciles it to the four current roles.)
- **Billing**: trial state lives on `nurseries` (`subscription_status` + `trial_ends_at`). `BillingGate` (server component in dashboard layout) redirects expired/canceled tenants everywhere except `/settings`, `/billing/trial-expired`, `/login`, `/auth`. The Stripe webhook at `app/api/webhooks/stripe/route.ts` is the source of truth — uses the service-role client + `subscription_events` for idempotency. Plan: THB 5,000/mo Pro; 30-day no-card trial.
- **Server-component data-fetching**: new `(dashboard)` pages that own server data are RSCs that `prefetchQuery` through `@/lib/api` via `getQueryClient()` (`lib/query/server.ts`), hand a dehydrated cache to a thin `'use client'` `*-view.tsx`, and mutate through a co-located `actions.ts` (`'use server'`) that writes `audit_log` (`lib/audit.ts`). Reference implementations: `scorecard/` (full) and `alerts/` (read-only). See `CLAUDE.md` for the full convention.
- **Client state**: TanStack Query 5 for server cache; Zustand for ephemeral UI (modal stack `lib/store/modal.ts`, sidebar collapsed flag `lib/store/sidebar.ts`).
- **Design system**: Tailwind 4 with CSS-first tokens in `app/globals.css` (`@theme inline`). Custom `--color-*` tokens (canvas/app/card/ink/hero, pastel pairs `lav`/`peach`/`mint`/`sky`/`rose`/`amber`, plus `good`/`bad`/`warn`). `--color-*` values are hex-identical to the umbrella canonical `../../../design-system-v1/` `--aw3-*` set — only naming differs. Conformance tracked in `docs/bmad/design-system-conformance.md`.

## Key Files

| File | Description |
|------|-------------|
| `package.json` | Next 16 / React 19 / TS 5 / Tailwind 4 / pnpm 10. Scripts: `dev`, `build`, `start`, `typecheck`, `lint`, `test`, `test:watch`, `test:ui`, `format`, `format:check` |
| `tsconfig.json` | Strict, `@/*` → repo root, excludes `prototypes/` |
| `next.config.mjs` | Wraps with the `next-intl` plugin pointing at `i18n/request.ts` |
| `proxy.ts` | Root middleware. Runs next-intl AND sets the `x-pathname` header (read by `BillingGate`); matcher excludes `/auth/*` and `/api/*` |
| `vitest.config.ts` | jsdom + globals; aliases `@` → root and stubs `server-only` → `tests/__mocks__/server-only.ts`; tests in `tests/**/*.test.{ts,tsx}` |
| `postcss.config.mjs` | Tailwind 4 via `@tailwindcss/postcss` |
| `eslint.config.mjs` | Flat config, `eslint-config-next` core-web-vitals |
| `.env.example` | Source-of-truth env var list |
| `README.md` | Quick start + Wiring Supabase walkthrough |
| `CLAUDE.md` | Authoritative tech/build/convention guide for this submodule — read first for *how* |
| `ONBOARDING.md` | New-contributor orientation |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `app/` | Next.js App Router routes, layouts, server actions, API routes (see `app/AGENTS.md`) |
| `components/` | React components: AquaWise V3 primitives, layout shell, modals, providers (see `components/AGENTS.md`) |
| `lib/` | Domain types, API facade, Supabase clients, Stripe, billing, derive, query, auth, stores (see `lib/AGENTS.md`) |
| `i18n/` | next-intl routing/request config + typed navigation helpers (see `i18n/AGENTS.md`) |
| `messages/` | `en.json` + `th.json` translation bundles (see `messages/AGENTS.md`) |
| `supabase/` | SQL migrations: schema, RLS, seed, billing, LINE, roles, invites, restock, storage (see `supabase/AGENTS.md`) |
| `tests/` | Vitest unit/regression suites mirroring story IDs (see `tests/AGENTS.md`) |
| `scripts/` | One-shot dev/ops helper scripts (see `scripts/AGENTS.md`) |
| `docs/` | Specs, BMAD execution layer, work-breakdown, archived legacy (see `docs/AGENTS.md`) |
| `prototypes/` | V3 standalone HTML reference + archived JSX — read-only design intent (see `prototypes/AGENTS.md`) |
| `_bmad/` | Installer-managed BMAD method tooling — read-only, regenerated (see `_bmad/AGENTS.md`) |
| `public/` | Static assets — currently `aquawise-logo.png` |

## For AI Agents

### Working In This Directory
- **Run scripts via pnpm only** (`pnpm dev`, `pnpm build`, `pnpm typecheck`, `pnpm lint`, `pnpm test`). `packageManager` is locked to `pnpm@10.0.0`.
- **Default locale is `th`**, not `en`. URLs are `/th/...` first. `app/[locale]/layout.tsx` renders `<ComingSoon />` for `en` — port new features against the Thai surface.
- **Every UI string lives in BOTH `messages/en.json` AND `messages/th.json`** (missing keys show `⚠️ {key}` in dev; prod falls back to English).
- **Never call Supabase directly from a page** — go through `@/lib/api`. The facade is the only place that knows about `USE_MOCK`.
- **Server-only files are explicit**: `lib/stripe/server.ts`, `lib/auth.ts`, `lib/auth/bootstrap.ts`, `lib/audit.ts`, `lib/query/server.ts` import `'server-only'`. The Stripe SDK and service-role key must never bundle into the client.
- **`'use client'` is opt-in**, not the default. Server components are the norm in the App Router; mark client only when state/effects/event handlers are needed.
- **No `any` in app code** — narrow `as` casts allowed only in the `rowTo*` adapters in `lib/api/supabase.ts`.
- **It is "nursery", never "hatchery"** for this product's customer, schema, and copy. The frozen prototype filename (`prototypes/AquaWise Hatchery v3 - Standalone.html`) and archived historical doc filenames keep their original names — do not rename them.

### Testing Requirements
- `pnpm typecheck` and `pnpm lint` are the green-build gates today; Vitest exists but coverage is thin (regression suites in `tests/`, one per story area).
- `pnpm test` runs Vitest once; single file: `pnpm vitest run path/to/file.test.ts`; by name: `pnpm vitest run -t "substring"`.
- Manually exercise the mock layer end-to-end: navigate every page, open every modal, fire mutations. For billing-state behavior set `MOCK_BILLING_STATE` (`trialing-25` | `trialing-2` | `trial_expired` | `active` | `past_due` | `canceled`) and reload.

### Common Patterns
- **Async-only API surface**. Even mock functions return `Promise<T>` so the live swap doesn't change call sites.
- **Server actions live next to their routes** (`app/[locale]/(dashboard)/<page>/actions.ts`) — required for anything that writes `audit_log` or talks to Stripe.
- **Modal system is a single Zustand store** (`lib/store/modal.ts`) with `open(kind, props)` + a single `<ModalRoot />` in `<Providers>`. New modal: extend the `ModalKind` union, add the `ModalRoot` branch, add the component in `components/modals/`.
- **Tailwind tokens come from `app/globals.css`** under `@theme inline`. Add new colors there — there is intentionally no `tailwind.config.ts`.

## Environment Variables

| Var | Required when | Notes |
|-----|---------------|-------|
| `USE_MOCK` | always (default `true`) | `true` → mock; auto-falls back to mock if `NEXT_PUBLIC_SUPABASE_URL` is unset |
| `NEXT_PUBLIC_USE_MOCK` | always — must mirror `USE_MOCK` | Required for client bundles to dispatch correctly |
| `MOCK_BILLING_STATE` | dev (mock mode) | `trialing-25` \| `trialing-2` \| `trial_expired` \| `active` \| `past_due` \| `canceled` |
| `NEXT_PUBLIC_SUPABASE_URL` | `USE_MOCK=false` | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `USE_MOCK=false` | |
| `SUPABASE_SERVICE_ROLE_KEY` | server actions + webhook | service-role only — never ship to client |
| `STRIPE_SECRET_KEY` | live billing | `lib/stripe/server.ts` lazy-inits, throws if missing |
| `STRIPE_WEBHOOK_SECRET` | live billing | verifies `Stripe-Signature` in the webhook route |
| `STRIPE_PRO_PRICE_ID` | live billing | Pro plan price id |
| `NEXT_PUBLIC_APP_URL` | live billing | Checkout success/cancel + Portal return URLs |

## Dependencies

### External
- `next` ^16, `react` ^19, `typescript` ^5 (strict)
- `tailwindcss` ^4 + `@tailwindcss/postcss` — CSS-first tokens
- `next-intl` ^4.5 — i18n routing + `getRequestConfig`
- `@supabase/ssr` + `@supabase/supabase-js` — Auth + RLS
- `@tanstack/react-query` ^5 — server cache
- `zustand` ^5 — modal store + sidebar collapse
- `stripe` ^18 — server-only SDK for Checkout, Portal, webhooks
- `react-hook-form` + `zod` + `@hookform/resolvers` — form layer
- Radix UI primitives + `lucide-react` icons + `sonner` toasts + `framer-motion` (sparingly)
- `recharts` (installed; most charts hand-rolled SVG in `components/aw/charts/`), `date-fns`, `geist`, `next-themes`
- `vitest` + `@testing-library/react` + `jsdom` (dev) — unit/regression tests

## Status snapshot
Per `docs/bmad/` (the execution source of truth — start at `docs/README.md` → `docs/bmad/README.md`). Historically (archived `docs/archive/PLAN.md`): Phases 1–4 done; Phase 5 (polish + deploy) in progress; Phase 6 (Stripe Pro plan + 30-day trial) code-complete, awaiting Stripe Dashboard provisioning.

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
