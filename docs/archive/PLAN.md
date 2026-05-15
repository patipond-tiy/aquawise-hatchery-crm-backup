> ARCHIVED 2026-05-15 — superseded by `docs/bmad/`. Historical record; NOT authoritative. Current product truth is `docs/bmad/prd.md`; execution lives in `docs/bmad/stories/`. See `docs/README.md` for the authority map.

# AquaWise Hatchery CRM — Implementation Plan

## Context

The Hatchery CRM is a new Thai/English SaaS product for shrimp/fish hatchery operators in Southeast Asia. It is a sibling to `aquawise-platform` (the farmer-facing AquaWise app) inside the AquaWise monorepo at `/home/CHAIN/project/active/aquawise-platform`. The hatchery side sells post-larvae (PL) to farms and needs to track:

- Customers (farms) and their cycle/restock state
- Batches of PL with PCR test results
- Disease alerts traced back to source batches
- A public scorecard customers can view by scanning a QR
- Settings (profile, notifications, team, data export, billing)

The working v3 prototype lives at `prototypes/AquaWise Hatchery v3 - Standalone.html`. It has 9 pages, 8 modals, mock Thai data, and a soft-rounded design system (`tokens-v3.css`). The "full app" port preserves the prototype's UX and design tokens but rebuilds it on the same stack as `aquawise-platform` so both products share conventions.

## Stack (decided)

Latest stable as of build start (2026-04). Lock by version range, refresh annually.

| Layer        | Choice                                                                                |
|--------------|---------------------------------------------------------------------------------------|
| Framework    | **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript 5**              |
| Styling      | **Tailwind CSS 4** (PostCSS via `@tailwindcss/postcss`, CSS-first theme)              |
| UI primitives| **shadcn/ui 3** + Radix UI primitives                                                 |
| Icons        | lucide-react                                                                          |
| Forms        | react-hook-form + **Zod 4** (`@hookform/resolvers`)                                   |
| State        | Zustand (client UI state) + **TanStack Query 5** (server cache)                       |
| i18n         | **next-intl 4.5** (en + th)                                                           |
| Database     | **Supabase** (Postgres 15 + RLS), schema versioned in `supabase/migrations/`          |
| Auth         | Supabase Auth (`@supabase/ssr` 0.7), RBAC: `owner`/`admin`/`editor`/`viewer`          |
| Toasts       | sonner                                                                                |
| Charts       | recharts (port custom V3 charts on top where the prototype's hover behaviour matters) |
| Animation    | framer-motion (sparingly — most motion is CSS)                                        |
| Tests        | Vitest + Testing Library; Playwright for e2e                                          |
| Lint/Format  | ESLint 9 (flat config) + Prettier 3 + `prettier-plugin-tailwindcss`                   |
| Hosting      | Vercel (frontend) + Supabase managed Postgres                                         |
| Package mgr  | pnpm 10+                                                                              |
| Node         | 20 LTS                                                                                |

The stack mirrors `aquawise-platform` (the active sibling app in the monorepo) so later we can extract shared packages (UI primitives, types, Supabase client) into a Turbo workspace without rewriting code.

## Phased delivery

Each phase ends with a runnable, demoable build. **Phase boundaries are review checkpoints** — pause for sign-off before starting the next.

### Phase 1 — Scaffold & shell
Bootstrap a Next.js 15 app, port the design tokens to Tailwind, build the 3-column shell (left rail / top bar / right rail) with the V3Mark logo, set up i18n routing (`/[locale]/…`), and stub all 9 routes with placeholders. Mock data lives in a single typed `lib/mock-data.ts` behind an async API (`getCustomers()`, etc.) so Phase 4 is a one-file swap.

**Demo at end:** `pnpm dev` → 3-column shell renders, sidebar nav switches placeholder pages, locale switch flips Thai/English, logo loads.

### Phase 2 — Page port
Port all 9 prototype pages to TS components using the Phase 1 shell + Tailwind tokens. Reuse shadcn primitives where they fit (Button, Card, Dialog, Sheet, Tabs, Toggle, Input, Select); port custom components as-is (V3Chip, V3Avatar, V3Ring, V3Sparkline, V3DistChart, V3Donut, V3BarsInteractive, V3Photo). Port all 8 modals and the toast system.

**Demo at end:** Every prototype page renders and is interactive against mock data. Modals open/close. Toasts fire. No backend yet.

### Phase 3 — Supabase backend
Design schema, write migrations, set up clients, wire RLS, and implement auth. Schema covers: `hatcheries`, `hatchery_members`, `customers` (farms), `batches`, `batch_buyers`, `pcr_results`, `alerts`, `scorecard_settings`, `notification_settings`, `audit_log`. RLS scopes everything to `hatchery_id` and member role.

**Demo at end:** Supabase project provisioned, migrations applied, seed data inserted. Auth login flow works. Direct SQL queries return seed data scoped by RLS. Frontend not yet wired.

### Phase 4 — Wire pages to backend
Replace `lib/mock-data.ts` calls with real Supabase queries via TanStack Query. Add server actions for mutations (add customer, add batch, send LINE, close alert). Add optimistic updates for mutations the prototype already handles optimistically.

**Demo at end:** All pages read/write real data. Auth gating on routes. Multi-user RLS verified.

### Phase 5 — Polish
Form validation (zod + react-hook-form), error boundaries, loading skeletons, empty states, accessibility pass, mobile responsive review, Thai/English copy review with a native speaker, Vercel deployment, environment-variable docs.

**Demo at end:** Production deployment on Vercel, env vars documented, SLOs (LCP < 2.5s, no console errors) met.

## Out of scope (for now)

- LIFF / LINE Official Account integration (mocked toasts in prototype)
- LINE Flex message generation
- Real PCR PDF parsing (uploads stub to Supabase storage, no OCR yet)
- AI assistant ("Aquara") — keep aquawise-platform as the AI surface
- Mobile app — web-only

These can become Phase 6+ once core CRM is solid.

## Critical path & risks

| Risk                                                       | Mitigation                                                          |
|------------------------------------------------------------|---------------------------------------------------------------------|
| RLS policies are easy to get wrong                         | Write integration tests in Phase 3 hitting real DB as different roles |
| Thai font rendering edge cases                             | Verify Noto Sans Thai loads + tnum/zwsp handling on every page early |
| shadcn vs custom token mismatch                            | Configure Tailwind theme upfront in Phase 1; avoid per-component overrides |
| Mock-to-Supabase swap breaks page-level state              | Keep mock layer behind same async signatures Phase 4 will use       |
| Multi-tenant scoping leaks                                 | Every query MUST filter by `hatchery_id`; lint rule + RLS as belt+braces |

## Working agreements

- Each phase ships a green CI build (`pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm test` if tests added).
- Translations: every UI string lands in BOTH `en.json` AND `th.json`. CI fails if a key is missing one side.
- No `any` types in app code; allow narrowly in adapters.
- Server-only code lives in `app/**` and `lib/server/**`; client components are explicit `'use client'`.
- Conventional commits: `feat(scope):`, `fix(scope):`, `chore(scope):`.

## Cross-references

- Prototype reference: `prototypes/AquaWise Hatchery v3 - Standalone.html`
- Archived prototype source (untransformed JSX): `prototypes/_archive/components/v3/`, `prototypes/_archive/v3-app.jsx`
- Design tokens: `prototypes/_archive/styles/tokens-v3.css`
- Sibling app to mirror: `/home/CHAIN/project/active/aquawise-platform/`
- Monorepo root CLAUDE.md: `/home/CHAIN/project/CLAUDE.md`

## Status

| Phase | Status        | Owner   | Started     | Completed   |
|-------|---------------|---------|-------------|-------------|
| 1     | Done          | Claude  | 2026-04-26  | 2026-04-26  |
| 2     | Done          | Claude  | 2026-04-26  | 2026-04-26  |
| 3     | Done (code only — project not yet provisioned) | Claude | 2026-04-26 | 2026-04-26 |
| 4     | Done (facade behind USE_MOCK)              | Claude | 2026-04-26 | 2026-04-26 |
| 5     | Code-side done; deploy + a11y audit pending user | Claude | 2026-04-26 | — |
| 6     | Stripe Pro plan + 30-day no-card trial — code complete; awaiting Stripe Dashboard provision | Claude | 2026-04-26 | 2026-04-26 |

Update this table at the top of each phase.
