# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**AquaWise Nursery CRM** — Thai/English (default `th`) SaaS for shrimp & fish **nursery** operators (`โรงอนุบาล`) in Southeast Asia. The customer is the operator who **buys nauplii from a hatchery, grows them ~20 days, and sells post-larvae (PL) to farm customers** — the mid-chain player in `hatchery → nursery → farm`. Archetype: **P'Pong** (per `../aquawise-docs/04-aquawise-nursery-customer-doc.md`). The app tracks customers (farms), PL batches with PCR results, disease alerts, a public scorecard, restock cadence, team RBAC, and Stripe billing (30-day no-card trial → THB 5,000/mo Pro plan).

This is one of two product submodules in the `aquawise-ecosystem` umbrella (the other is `line-bot/`). It is **single-package**, not a monorepo — `packageManager: pnpm@10.0.0`.

### Where this product sits in AquaWise sequencing

Per `../aquawise-docs/02-aquawise-what-we-build-first.md` (Chain, CEO):

1. Farmer (now, 2026) — via the LINE bot `น้องน้ำ` in the sibling `line-bot/`
2. **Nursery (`โรงอนุบาล`) — now, 2026. ← This repo's customer.** Distribution channel for the farmer side (QR-at-counter onboards farmers).
3. Broker / `ล้ง` (parallel, opportunistic) — price-feed revenue
4. Hatchery (`โรงเพาะฟัก`) — 2027. The **real upstream broodstock** stakeholder (archetype P'Bunjong); a **separate future product**, not this repo.
5. Feed company (2027), Bank/BAAC (2028+).

> **History:** this repo was initially mis-scoped as a "hatchery" CRM. The actual customer is the **nursery** (P'Pong, `โรงอนุบาล`), served **now (2026)**. The genuine hatchery (broodstock/nauplii/lineages, P'Bunjong) is the distinct 2027+ upstream stakeholder in step 4 — do not conflate the two.

The nursery customer doc is `../aquawise-docs/04-aquawise-nursery-customer-doc.md` (archetype **P'Pong**, President of the Thai Shrimp Larvae Hatchery Association — the association name is older terminology; he operationally runs a nursery). The separate `06-aquawise-hatchery-customer-doc.md` covers the **future** hatchery stakeholder (P'Bunjong) and is **explicitly v0.5 with ⚠ markers** — 2027+ hypotheses, not this repo's customer reality.

The repo today is a **nursery CRM**: PL batches, PCR results, farm customers, restock cadence, disease alerts. Broodstock / nauplii / genetic-lineage vocabulary belongs to the upstream *hatchery* (step 4, 2027) — not the nursery surfaces built here.

## Read these before product work

- `../aquawise-docs/00-aquawise-brand-foundation.md` — tone/voice gates ALL user-facing copy. Voice archetype: `ลูกหลานที่เรียนมา` ("educated younger relative who came back to help"). For nursery surfaces the register is even more deferential and scientific. **Never** use: "AI-powered", "platform", "revolutionary", excitement, urgency, awe-at-tech. **No emoji on professional surfaces. No dark mode. No customization.**
- `../aquawise-docs/02-aquawise-what-we-build-first.md` — sequencing is non-negotiable. The nursery is **now (2026)** as the farmer-side distribution channel; the real hatchery is 2027+ (don't build ahead of the farmer side).
- `../aquawise-docs/04-aquawise-nursery-customer-doc.md` — read before scoping any nursery feature (this repo's customer). `06-aquawise-hatchery-customer-doc.md` is the *future* 2027+ hatchery stakeholder — not this repo.

When the docs and the code disagree on *what to build*, the docs win. When they disagree on *how to build it*, this repo wins.

## Development commands

```bash
pnpm install              # required: Node ≥20, pnpm 10
cp .env.example .env.local
pnpm dev                  # http://localhost:3000 — boots in mock mode at /th
pnpm build                # production build
pnpm start                # serve production build
pnpm typecheck            # tsc --noEmit (strict)
pnpm lint                 # eslint . (flat config, eslint-config-next/core-web-vitals)
pnpm test                 # vitest run
pnpm test:watch           # vitest watch
pnpm test:ui              # vitest with UI
pnpm format               # prettier write
pnpm format:check         # prettier check
```

Run a single Vitest file: `pnpm vitest run path/to/file.test.ts`.
Run a single test by name: `pnpm vitest run -t "test name substring"`.

`pnpm typecheck` and `pnpm lint` are the green-build gates today — Vitest exists but coverage is thin. Manual mock-mode click-through is the dominant verification path.

## Architecture in one minute

- **Next.js 16 App Router** + Turbopack, **React 19**, **TS 5 strict**. Locale-prefixed routes: `app/[locale]/...` where `locale ∈ {th, en}`.
- **`proxy.ts` (root middleware)** runs `next-intl` middleware AND injects an `x-pathname` header on every response so server components like `BillingGate` can branch on the URL (layouts don't get the request URL directly). The matcher excludes `/auth/*` because Supabase OAuth/PKCE callbacks land there without a locale prefix.
- **i18n**: `next-intl` 4.5, default `th`. Strings live in `messages/{en,th}.json`. **Every key must exist in both files.** Missing keys render `⚠️ {key}` in dev. `app/[locale]/layout.tsx` currently renders `<ComingSoon />` for `locale === 'en'` — the English experience is intentionally gated; port features against the Thai surface.
- **API facade (`lib/api/index.ts`)**: pages and components import only from `@/lib/api`. The facade dispatches to `lib/mock/api.ts` (mock) or `lib/api/supabase.ts` (live) based on `USE_MOCK` / `NEXT_PUBLIC_USE_MOCK` env (also auto-falls back to mock if `NEXT_PUBLIC_SUPABASE_URL` is unset). Mock and live share async signatures so flipping the flag is a one-line swap. **Never call Supabase directly from a page.**
- **Auth + multi-tenant scope**: Supabase Auth (magic link + PKCE/implicit). Every domain row carries `nursery_id`; RLS scopes reads/writes to `nursery_members.nursery_id` of the calling user. `app/auth/callback/` handles both PKCE and implicit-flow callbacks.
- **RBAC** (`lib/rbac.ts`): role enum is `owner | counter_staff | lab_tech | auditor`. The DB enum lives at `Database['public']['Enums']['nursery_role']`. Action-based: `customer:read|write`, `batch:read|write`, `alert:close`, `team:invite`, `settings:write`, `data:export`, `billing:manage`. Use `can(role, action)` — do not branch on role strings directly.
- **Billing**: trial state lives on `nurseries` (`subscription_status`, `trial_ends_at`). `BillingGate` (server component in dashboard layout) redirects expired/canceled tenants everywhere except `/settings`, `/billing/trial-expired`, `/login`, `/auth`. **Stripe webhook at `app/api/webhooks/stripe/route.ts` is the source of truth** — uses service-role client + `subscription_events` for idempotency. Plan: THB 5,000/mo Pro; 30-day no-card trial.
- **State**: TanStack Query 5 for server cache; Zustand for ephemeral UI (modal stack at `lib/store/modal.ts`, sidebar collapsed flag at `lib/store/sidebar.ts`). `<ModalRoot />` (mounted in `<Providers>`) switches on a `kind` union — adding a modal means: extend the union, add a branch in `ModalRoot`, drop the component in `components/modals/`.
- **Design tokens**: Tailwind 4 with **CSS-first** tokens in `app/globals.css` under `@theme inline`. Custom `aw3-*` tokens (canvas/app/card/ink/hero, plus pastel pairs `lav`/`peach`/`mint`/`sky`/`rose`/`amber` and `good`/`bad`/`warn`). Custom primitives in `components/aw/` use `var(--color-…)` directly. **No `tailwind.config.ts`** — Tailwind 4 doesn't need one for tokens. The canonical design system is `../../../design-system-v1/` (umbrella-level; see its `SKILL.md`); this repo's `--color-*` token *values* are hex-identical to its `--aw3-*` set — only naming differs. Conformance + divergences tracked in `docs/bmad/design-system-conformance.md`.
- **Fonts** (`app/[locale]/layout.tsx` via `next/font`, wired to `--font-*` tokens in `globals.css`): **Inter** = Latin/body workhorse (`--font-sans`, tables, forms, eyebrows); **Plus Jakarta Sans** = display headings + hero only (`--font-display`, `h1/h2/h3`, or the `font-display` utility) — the design-system-v1 *sanctioned exception*, never the body default; **Noto Sans Thai** = all Thai; **JetBrains Mono** = numbers/lot IDs (`.mono`). Don't reintroduce Plus Jakarta Sans as a body face.

## Layout

```
app/
├ [locale]/
│ ├ (dashboard)/        9 main pages wrapped in 3-column Shell:
│ │   page.tsx            dashboard hero
│ │   customers/, batches/, alerts/, restock/, scorecard/, settings/
│ │   billing-gate.tsx    server-component trial/subscription redirect
│ │   layout.tsx          mounts BillingGate + Shell
│ ├ login/               magic-link auth
│ ├ billing/             trial-expired + post-checkout pages
│ ├ layout.tsx           root (gates English to ComingSoon)
│ └ error.tsx, not-found.tsx
├ auth/callback/        Supabase callback (PKCE + implicit), no locale prefix
└ api/webhooks/stripe/  Stripe events → subscription_events (idempotent)
components/
├ aw/                   AquaWise primitives (V3Mark, V3Chip, V3Card, …) + charts/
├ layout/               LeftRail, TopBar, RightRail, Shell, TrialBanner
├ modals/               8 modals + ModalRoot + ModalShell
└ providers.tsx         QueryClient + ModalRoot + Toaster
lib/
├ api/                  facade + supabase impl
├ mock/                 in-memory mock + Thai seed data
├ supabase/             browser/server/middleware clients
├ stripe/               server.ts (server-only), config.ts
├ billing/              guard.ts + trial.ts
├ auth/, auth.ts        bootstrap; auth.ts is `'server-only'`
├ store/                modal.ts, sidebar.ts (Zustand)
├ rbac.ts, types.ts, database.types.ts
i18n/                   routing + getRequestConfig
messages/               en.json, th.json
supabase/migrations/    001..012 (init, rls, seed, billing, line, roles, invites, customer fields, restock, rls tighten, storage)
docs/                   README.md (authority map — start here), bmad/ (execution source of truth), product-spec/, work-breakdown/, aquawise-updated-docs/, STRIPE.md, MIRROR.md, archive/ (legacy: PLAN.md, CHECKLIST.md, line-integration-strategy.md)
prototypes/             V3 standalone HTML — design intent. Read-only.
```

## Project conventions

- **Run scripts via `pnpm` only.** `packageManager` is locked to `pnpm@10.0.0`.
- **`'use client'` is opt-in.** Server components are the default in App Router; mark client only when state/effects/event handlers are needed.
- **Server-only files import `'server-only'`** — `lib/stripe/server.ts`, `lib/auth.ts`. Stripe SDK must never bundle into the client.
- **No `any` in app code.** Narrow `as` casts allowed only in adapters (see `lib/api/supabase.ts` `rowToCustomer` / `rowToBatch`).
- **Server actions live next to routes** (`app/[locale]/(dashboard)/<page>/actions.ts`). Required for anything that writes `audit_log` or talks to Stripe. See "Server-component data-fetching" below for the full fetch+mutate convention new pages must follow.
- **Async-only API surface** — even mock functions return `Promise<T>` so the live swap doesn't change call sites.
- **Locale matters.** Default is `th`. URLs are `/th/...` first. English is gated to `<ComingSoon />` at `app/[locale]/layout.tsx` — port new features against the Thai surface.

## Server-component data-fetching (the convention new code MUST follow)

Historically all 9 `(dashboard)/*/page.tsx` were `'use client'`, fetched via
the browser Supabase client through TanStack Query, repeated a fragile
`.from('nurseries').select('id').limit(1).single()` tenant idiom ~7×, and
mutated client-side — bypassing the server-action `audit_log`. New pages and
new BMAD systems **must not** copy that. The locked pattern:

1. **Tenant scope: one helper, never re-inlined.** Resolve the caller's
   tenant with `currentNurseryScope()` (user + nurseryId + role) or
   `getCurrentTenantId()` — both in `lib/auth.ts` (`'server-only'`). Do
   **not** re-write the `nursery_members` / `nurseries .limit(1).single()`
   lookup inline in an action or RSC.
2. **Pages are RSCs that prefetch + hydrate.** A `(dashboard)` page that owns
   server data is an async Server Component (no `'use client'`). It builds a
   per-request client via `getQueryClient()` (`lib/query/server.ts`),
   `prefetchQuery`s through the `@/lib/api` facade (still the only data
   entrypoint — never call Supabase directly), and wraps a thin
   `'use client'` `*-view.tsx` in `<HydrationBoundary state={dehydrate(qc)}>`.
   The view keeps the interactive UI and reads the hydrated cache with
   `useQuery` (same `queryKey`).
3. **Mutations go through a co-located server action that writes `audit_log`.**
   `<page>/actions.ts` (`'use server'`): mock mode delegates to `lib/mock/api`
   (keeps dev click-through working), live mode calls
   `requireActiveSubscription()` for write actions, scopes via
   `currentNurseryScope()`, persists, then `await writeAuditLog(action, payload)`
   (`lib/audit.ts`). The client view's `useMutation.mutationFn` is the server
   action, not a `@/lib/api` mutation.

**Reference implementations:** `scorecard/` (full: RSC page + view + server
action + audit_log) and `alerts/` (read-only RSC page + view). Copy these.

**Migration checklist — remaining client pages to convert (P2-1d, deferred,
keep-green per page):**

- [ ] `(dashboard)/page.tsx` (dashboard hero)
- [ ] `(dashboard)/customers/page.tsx` + `customers/[id]/page.tsx`
- [ ] `(dashboard)/batches/page.tsx` + `batches/[id]/page.tsx`
- [ ] `(dashboard)/restock/page.tsx`
- [ ] `(dashboard)/settings/page.tsx` tabs (notifications/profile/team/billing)
- [ ] Route `closeAlert` / `addCustomer` / `addBatch` mutations through
      co-located server actions writing `audit_log` (currently still via the
      `@/lib/api` client facade behind modals)
- [ ] `lib/api/supabase.ts` live impl uses the **browser** Supabase client; a
      server-side variant is needed before RSC prefetch hits real Supabase
      (today only mock mode is exercised, so RSC prefetch is safe as-is)
- [ ] `lib/auth/bootstrap.ts` keeps its own `nursery_members` lookup — it is
      keyed by an explicitly-passed `userId` during the auth callback (no
      ambient session yet), distinct from `currentNurseryScope()`; revisit if
      it can adopt the helper without destabilising first sign-in

Convert one page per commit; `typecheck + lint + test + build` must stay
green after each. Never half-convert a page.

## Mock-mode billing

Set `MOCK_BILLING_STATE` in `.env.local` (mock mode only) to exercise billing flows without Stripe:

`trialing-25` | `trialing-2` | `trial_expired` | `active` | `past_due`

Reload — Settings → Billing tab and `BillingGate` redirects react accordingly.

## Wiring real Supabase

1. Create project at https://supabase.com/dashboard.
2. In `.env.local` set both `USE_MOCK=false` and `NEXT_PUBLIC_USE_MOCK=false` plus the three `*_SUPABASE_*` keys.
3. `supabase link --project-ref <ref> && supabase db push` to run migrations `001`–`012` from `supabase/migrations/`.
4. `supabase gen types typescript --linked > lib/database.types.ts` (replaces the placeholder).
5. Restart `pnpm dev`.

## Environment variables

| Var                              | Required when                | Notes                            |
|----------------------------------|------------------------------|----------------------------------|
| `USE_MOCK`                       | always (default `true`)      | `true` = mock; falls back to mock if `NEXT_PUBLIC_SUPABASE_URL` unset |
| `NEXT_PUBLIC_USE_MOCK`           | always — must mirror `USE_MOCK` | Required for client bundles to dispatch correctly |
| `MOCK_BILLING_STATE`             | dev (mock mode)              | See above |
| `NEXT_PUBLIC_SUPABASE_URL`       | `USE_MOCK=false`             |                                  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | `USE_MOCK=false`             |                                  |
| `SUPABASE_SERVICE_ROLE_KEY`      | server actions + webhook     | service-role only — never client |
| `STRIPE_SECRET_KEY`              | live billing                 | `lib/stripe/server.ts` lazy-inits, throws if missing |
| `STRIPE_WEBHOOK_SECRET`          | live billing                 | verifies `Stripe-Signature` |
| `STRIPE_PRO_PRICE_ID`            | live billing                 | Pro plan price id |
| `NEXT_PUBLIC_APP_URL`            | live billing                 | Checkout success/cancel + Portal return URLs |

## Working with the umbrella

This directory is a git submodule of `aquawise-ecosystem`. Inside `hatchery-crm/` it behaves as a full clone of its own repo (`aquawise-tech/aquawise-nursery-crm`). Branch and push from this folder; pushes go to the component's GitHub repo, not the umbrella. The umbrella auto-bumps its submodule pin within ~10 seconds of a push to the tracked branch (`main`).

## Status

Current status and execution live in `docs/bmad/` (start at `docs/README.md` → `docs/bmad/README.md`). Per the archived `docs/archive/PLAN.md` (historical): Phases 1–4 done; Phase 5 (polish + deploy) in progress; Phase 6 (Stripe Pro plan + 30-day trial) code-complete, awaiting Stripe Dashboard provisioning. The reference design is `prototypes/AquaWise Hatchery v3 - Standalone.html` — open in a browser to see the design intent (filename frozen, do not rename).
