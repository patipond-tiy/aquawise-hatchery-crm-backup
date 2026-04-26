# Hatchery CRM — Build Checklist

Granular task list. Each phase is an independent demoable milestone. Tick boxes as we go.

Legend: `[ ]` todo · `[~]` in progress · `[x]` done · `[-]` skipped/deferred

## Phase 1 — Scaffold & shell

### 1.1 Project bootstrap
- [ ] `package.json` with Next.js 15, React 19, TypeScript, Tailwind, shadcn deps, next-intl, Zustand, TanStack Query, lucide-react
- [ ] `tsconfig.json` (strict, path alias `@/*` → `./`)
- [ ] `next.config.mjs` (i18n routing via next-intl plugin, image domains)
- [ ] `tailwind.config.ts` (port v3 tokens: colors, fontFamily, borderRadius, shadows)
- [ ] `postcss.config.mjs`
- [ ] `app/globals.css` (Tailwind layers + `:root` design tokens from `tokens-v3.css`)
- [ ] `.gitignore`, `.env.example`, `.env.local` (placeholder Supabase URL)
- [ ] `pnpm install` succeeds
- [ ] `pnpm dev` boots blank page on localhost:3000
- [ ] `pnpm exec tsc --noEmit` clean
- [ ] `pnpm lint` clean

### 1.2 i18n routing (next-intl)
- [ ] `messages/en.json`, `messages/th.json` (seed with nav + page titles only)
- [ ] `i18n/request.ts` (next-intl request config)
- [ ] `middleware.ts` (locale detection + redirect)
- [ ] `app/[locale]/layout.tsx` (root with `<NextIntlClientProvider>`)
- [ ] Locale switch verified: `/en/*` and `/th/*` both load

### 1.3 shadcn setup
- [ ] `pnpm dlx shadcn@latest init` (slate base, css vars, RSC enabled)
- [ ] Add components: button, card, dialog, sheet, dropdown-menu, input, select, tabs, switch, badge, avatar, separator, scroll-area, sonner (toasts)
- [ ] Verify `components.json` matches our path aliases

### 1.4 Design tokens → Tailwind
- [ ] `tailwind.config.ts` extends with: `aw3-canvas`, `aw3-app`, `aw3-card`, `aw3-soft*`, `aw3-line*`, `aw3-ink-1..5`, `aw3-hero*`, pastel pairs (lav/peach/mint/sky/rose/amber + their `-fg`), status (`good`/`bad`/`warn`)
- [ ] `borderRadius`: `sm` 8, `DEFAULT` 14, `lg` 20, `xl` 28, `pill` 999
- [ ] `boxShadow`: `card`, `pop`
- [ ] `fontFamily`: `sans` (Noto Sans Thai stack), `display` (Plus Jakarta Sans), `mono` (JetBrains Mono)
- [ ] `keyframes` + `animation` for `aw3-rise`
- [ ] Visual diff: a Storybook-free smoke page showing every token chip resolves correctly

### 1.5 Fonts
- [ ] `app/[locale]/layout.tsx` uses `next/font` for Plus Jakarta Sans, Noto Sans Thai, JetBrains Mono (subset: latin + thai)
- [ ] Verify Thai glyphs render in `/th` (run `pnpm dev`, view a Thai-only string)

### 1.6 Mock data layer
- [ ] `lib/types.ts` (Customer, Batch, Alert, ScorecardSettings, NotificationSettings, TeamMember, Hatchery)
- [ ] `lib/mock/data.ts` (constants ported from `_archive/components/aw-data.jsx`)
- [ ] `lib/mock/api.ts` (async functions with the exact signatures Phase 4 will replace: `listCustomers()`, `getCustomer(id)`, `listBatches()`, `getBatch(id)`, `listAlerts()`, `addCustomer()`, `addBatch()`, `closeAlert()`, …)
- [ ] All async, all return Promise — no synchronous returns
- [ ] One `lib/mock/seed.ts` with mutable in-memory store so mutations persist within a session

### 1.7 Shell components
- [ ] `components/aw/v3-mark.tsx` (logo with `next/image`, fallback path `/aquawise-logo.png`)
- [ ] Move `prototypes/assets/aquawise-logo.png` → `public/aquawise-logo.png`
- [ ] `components/layout/left-rail.tsx` (nav groups: Overview, Daily, Settings)
- [ ] `components/layout/top-bar.tsx` (search, notifications bell, profile dropdown, avatar)
- [ ] `components/layout/right-rail.tsx` (progress ring, D30 sparkline, follow-ups, team)
- [ ] `components/layout/shell.tsx` (3-column grid, rounded inner card)
- [ ] `app/[locale]/(dashboard)/layout.tsx` wraps shell

### 1.8 Stub routes
- [ ] `app/[locale]/(dashboard)/page.tsx` — Dashboard placeholder
- [ ] `app/[locale]/(dashboard)/customers/page.tsx` — Customers list placeholder
- [ ] `app/[locale]/(dashboard)/customers/[id]/page.tsx` — Customer detail placeholder
- [ ] `app/[locale]/(dashboard)/batches/page.tsx` — Batches list placeholder
- [ ] `app/[locale]/(dashboard)/batches/[id]/page.tsx` — Batch detail placeholder
- [ ] `app/[locale]/(dashboard)/restock/page.tsx`
- [ ] `app/[locale]/(dashboard)/alerts/page.tsx`
- [ ] `app/[locale]/(dashboard)/scorecard/page.tsx`
- [ ] `app/[locale]/(dashboard)/settings/page.tsx`

### 1.9 Phase 1 demo gate
- [ ] All 9 routes load without console errors
- [ ] Logo renders in left rail
- [ ] Locale switch (en ↔ th) works on every route
- [ ] Tailwind tokens render (a sample chip with each pastel tone shows correctly)
- [ ] `pnpm build` succeeds

---

## Phase 2 — Page port

### 2.1 Primitive components (port from `_archive/components/v3/v3-primitives.jsx`)
- [ ] `components/aw/v3-chip.tsx`
- [ ] `components/aw/v3-card.tsx` (or use shadcn Card)
- [ ] `components/aw/v3-section.tsx`
- [ ] `components/aw/v3-round-btn.tsx`
- [ ] `components/aw/v3-avatar.tsx` (or extend shadcn Avatar)
- [ ] `components/aw/v3-ring.tsx`
- [ ] `components/aw/v3-bars.tsx`
- [ ] `components/aw/v3-grid.tsx`, `v3-col.tsx`
- [ ] `components/aw/v3-photo.tsx` (gradient placeholder)

### 2.2 Chart components (port from `_archive/components/v3/v3-charts.jsx`)
- [ ] `components/aw/charts/dist-chart.tsx` (histogram with hover tooltip)
- [ ] `components/aw/charts/sparkline.tsx`
- [ ] `components/aw/charts/donut.tsx`
- [ ] `components/aw/charts/bars-interactive.tsx`

### 2.3 Modal system
- [ ] Use shadcn Dialog as base
- [ ] `components/modals/modal-shell.tsx` (header + body + footer slots)
- [ ] `components/modals/add-customer-modal.tsx`
- [ ] `components/modals/add-batch-modal.tsx` (3-step stepper)
- [ ] `components/modals/send-line-modal.tsx`
- [ ] `components/modals/quote-modal.tsx`
- [ ] `components/modals/cert-modal.tsx`
- [ ] `components/modals/invite-team-modal.tsx`
- [ ] `components/modals/close-alert-modal.tsx`
- [ ] `components/modals/schedule-call-modal.tsx`
- [ ] Global modal store (Zustand) with `open(kind, props)` / `close()`

### 2.4 Toast system
- [ ] Use shadcn `sonner`
- [ ] `lib/toast.ts` thin wrapper matching prototype's `toast(msg, kind)` signature

### 2.5 Pages — port from prototype
- [ ] Dashboard (`app/[locale]/(dashboard)/page.tsx`) — hero, stat chips, continue cards, recent batches table
- [ ] Customers list — search + filter tabs + 2-col card grid
- [ ] Customer detail — header + 4 stat cards + sparkline + contact card + history table
- [ ] Batches list — 2-col grid of batch cards
- [ ] Batch detail — header + 4 stat cards + dist chart + PCR results card + buyers table
- [ ] Restock — 4 summary chips + 4 grouped due-date sections
- [ ] Alerts — 3 sev chips + alert cards with farms + action buttons
- [ ] Scorecard — left preview + right toggles + QR card
- [ ] Settings (5 tabs):
  - [ ] Profile
  - [ ] Notifications
  - [ ] Team
  - [ ] Data export
  - [ ] Billing

### 2.6 Phase 2 demo gate
- [ ] Every prototype page is fully ported and interactive against mock data
- [ ] All 8 modals open/close and call the correct mock mutation
- [ ] Toasts fire on success
- [ ] Visual parity check: side-by-side with `prototypes/AquaWise Hatchery v3 - Standalone.html` shows no glaring drift
- [ ] All UI strings in both en.json and th.json
- [ ] `pnpm build` clean

---

## Phase 3 — Supabase backend

### 3.1 Project setup
- [ ] Create Supabase project via MCP (`mcp__claude_ai_Supabase__create_project`) or dashboard
- [ ] `supabase/` folder with CLI init
- [ ] `.env.local` populated: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `lib/supabase/client.ts` (browser client)
- [ ] `lib/supabase/server.ts` (server actions / RSC)
- [ ] `lib/supabase/middleware.ts` (auth refresh in middleware)

### 3.2 Schema
- [ ] `supabase/migrations/001_init.sql`:
  - [ ] `hatcheries` (id, name, name_en, location, location_en, registration_no, plan, created_at)
  - [ ] `hatchery_members` (hatchery_id, user_id, role, created_at) — role ∈ `owner`/`admin`/`editor`/`viewer`/`technician`
  - [ ] `customers` (id, hatchery_id, name, farm, farm_en, phone, line_id, zone, address, status, created_at)
  - [ ] `customer_cycles` (customer_id, cycle_day, expected_harvest, d30, d60, restock_in)
  - [ ] `batches` (id, hatchery_id, source, pl_produced, date, pcr_status, mean_d30, dist jsonb)
  - [ ] `batch_buyers` (batch_id, customer_id, pl_purchased, d30)
  - [ ] `pcr_results` (batch_id, disease, status, lab, tested_on, file_url)
  - [ ] `alerts` (id, hatchery_id, sev, title, description, batch_id, action, closed, closed_reason, created_at)
  - [ ] `alert_farms` (alert_id, customer_id)
  - [ ] `scorecard_settings` (hatchery_id pk, public bool, show_d30, show_pcr, show_retention, show_volume, show_reviews)
  - [ ] `notification_settings` (hatchery_id pk, restock, low_d30, disease, line_reply, weekly, price_move)
  - [ ] `audit_log` (id, hatchery_id, user_id, action, payload jsonb, created_at)
- [ ] `supabase/migrations/002_rls.sql`:
  - [ ] Enable RLS on every table
  - [ ] Policies: `SELECT` allowed iff `hatchery_id IN (SELECT hatchery_id FROM hatchery_members WHERE user_id = auth.uid())`
  - [ ] `INSERT`/`UPDATE` gated by role (e.g., only `owner`/`admin` can `INSERT INTO hatchery_members`)
- [ ] `supabase/migrations/003_seed.sql` (mock data ported into seed inserts; Thai text intact)
- [ ] Apply migrations to a Supabase branch
- [ ] `pnpm exec supabase gen types typescript --linked > lib/database.types.ts`

### 3.3 Auth
- [ ] Magic-link login page `app/[locale]/login/page.tsx`
- [ ] Auth callback route `app/auth/callback/route.ts`
- [ ] Server-side auth check in `(dashboard)/layout.tsx` — redirect to `/login` if no session
- [ ] Onboarding flow: first login creates `hatcheries` row + `hatchery_members` (`owner`)

### 3.4 RBAC
- [ ] `lib/rbac.ts` with `can(user, action, resource)` helpers
- [ ] Server-action level + UI-level enforcement

### 3.5 Phase 3 demo gate
- [ ] Migrations apply cleanly to a fresh Supabase project
- [ ] Login + first-run hatchery creation works
- [ ] RLS sanity: a second test user cannot see the first user's customers
- [ ] Generated types compile

---

## Phase 4 — Wire pages to Supabase

### 4.1 Server fetchers
- [ ] Replace each `lib/mock/api.ts` function with a Supabase implementation in `lib/server/queries.ts` (server) and `lib/queries.ts` (client wrappers via TanStack Query)
- [ ] Keep mock layer behind a `USE_MOCK=true` env flag for offline dev

### 4.2 Mutations as server actions
- [ ] `app/[locale]/(dashboard)/customers/actions.ts` (`addCustomer`, `updateCustomer`)
- [ ] `app/[locale]/(dashboard)/batches/actions.ts` (`addBatch`, `addBatchPcr`)
- [ ] `app/[locale]/(dashboard)/alerts/actions.ts` (`closeAlert`, `dismissAlert`)
- [ ] `app/[locale]/(dashboard)/settings/actions.ts` (`updateProfile`, `updateNotifications`, `inviteMember`, `updateScorecard`)
- [ ] All actions: `'use server'`, validate with zod, write `audit_log` row

### 4.3 Optimistic updates
- [ ] TanStack Query mutations use `onMutate` + `onError` rollback for: addCustomer, addBatch, closeAlert
- [ ] Toasts fire on success/failure with the right messages

### 4.4 Phase 4 demo gate
- [ ] Two browser sessions logged in as different users see independent data (RLS verified)
- [ ] Adding a customer in browser A appears in browser B after refresh
- [ ] All prototype interactions work end-to-end against real DB
- [ ] Mock layer still runs with `USE_MOCK=true`

---

## Phase 5 — Polish

### 5.1 Forms & validation
- [ ] react-hook-form + zod resolver on every form
- [ ] Inline error messages (Thai + English)
- [ ] Disable submit while pending; show spinner

### 5.2 Loading & empty states
- [ ] Skeleton components for every list/grid (use shadcn `Skeleton`)
- [ ] Empty-state component with illustration + CTA per page

### 5.3 Errors
- [ ] `app/[locale]/error.tsx` (root error boundary)
- [ ] Per-route `error.tsx` for granular recovery
- [ ] Sentry integration (optional, behind env flag)

### 5.4 a11y & responsive
- [ ] Keyboard nav: tab order, focus rings, escape closes modals
- [ ] Mobile breakpoint review — current shell is desktop-only; degrade gracefully
- [ ] aria-labels on icon-only buttons
- [ ] Color contrast audit (WCAG AA)

### 5.5 Copy & i18n review
- [ ] Native Thai speaker reviews `messages/th.json`
- [ ] Native English speaker reviews `messages/en.json`
- [ ] Currency, date, number formatting via `Intl` (Thai Buddhist year option)

### 5.6 Deploy
- [ ] Vercel project linked, env vars set
- [ ] Preview deploys on every PR
- [ ] Production domain (TBD with user)
- [ ] README with run instructions
- [ ] Migration runbook

### 5.7 Phase 5 demo gate
- [ ] Lighthouse: Performance > 85, Accessibility > 95
- [ ] Zero console errors on production deploy
- [ ] All ENV vars documented in `.env.example`
- [ ] Production smoke test: log in, add customer, add batch, view alerts, log out

---

## Open questions (track here)

- [ ] Domain name for production?
- [ ] Will hatcheries log in via email magic link, phone OTP, or LINE Login?
- [ ] Free tier limits — how many customers/batches before paywall?
- [ ] Does the public scorecard live on the same Vercel project or a separate `score.aquawise.com` deployment?
- [ ] LINE OA integration: Phase 6 or earlier?

Add answers and date them here as we get them.
