# AquaWise Hatchery CRM

Thai/English SaaS for shrimp & fish hatchery operators in Southeast Asia. Built on the same stack as `aquawise-platform` (Next.js 16 + React 19 + Tailwind 4 + Supabase) so the two apps can share packages later.

## Quick start

Requires Node 20+ and pnpm 10+.

```bash
pnpm install
cp .env.example .env.local
pnpm dev          # http://localhost:3000 — dashboard at /th
```

The app boots with **mock data** by default (`USE_MOCK=true`) so you don't need Supabase to develop or demo. To swap to a real backend, see [§ Wiring Supabase](#wiring-supabase).

## Scripts

| Command            | What it does                                  |
|--------------------|-----------------------------------------------|
| `pnpm dev`         | Dev server with Turbopack (HMR, source maps)  |
| `pnpm build`       | Production build                              |
| `pnpm start`       | Run the production build                      |
| `pnpm typecheck`   | `tsc --noEmit` strict typecheck               |
| `pnpm lint`        | Next.js lint                                  |
| `pnpm format`      | Prettier write                                |

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript 5**
- **Tailwind 4** with CSS-first theme tokens (`app/globals.css` `@theme inline`)
- **shadcn-ready** Radix UI primitives + lucide icons
- **next-intl 4.5** for `th`/`en` routing
- **Supabase** (Postgres + RLS) — schema in `supabase/migrations/`
- **TanStack Query** for cache + optimistic updates
- **Zustand** for ephemeral client state (modal stack)
- **sonner** for toasts

## Project layout

```
hatchery-crm/
├ app/[locale]/              # Locale-prefixed App Router pages
│ ├ (dashboard)/             # 9 main pages, wrapped in 3-column Shell
│ │ ├ page.tsx               # Dashboard (hero + stat chips + continue cards)
│ │ ├ customers/{,[id]}      # Customer list + detail
│ │ ├ batches/{,[id]}        # Batch list + detail
│ │ ├ restock/, alerts/, scorecard/, settings/
│ │ └ layout.tsx             # Shell wrapper
│ ├ login/                   # Magic-link auth page
│ ├ layout.tsx               # Root layout (fonts, providers, i18n)
│ ├ error.tsx, not-found.tsx
├ app/auth/callback/         # Supabase OAuth callback handler
├ components/
│ ├ aw/                      # Custom AquaWise primitives (V3Mark, V3Chip, …)
│ ├ aw/charts/               # Interactive charts (Sparkline, DistChart, Donut)
│ ├ layout/                  # LeftRail, TopBar, RightRail, Shell
│ ├ modals/                  # 8 modals + ModalShell + ModalRoot
│ └ providers.tsx            # QueryClient + ModalRoot + Toaster
├ i18n/                      # next-intl routing + request config + helpers
├ lib/
│ ├ api/                     # Facade switching between mock and Supabase
│ │ ├ index.ts               # Public API surface
│ │ └ supabase.ts            # Real backend implementation
│ ├ mock/                    # Thai mock data + in-memory mock API
│ ├ supabase/                # Browser/server clients + middleware
│ ├ store/modal.ts           # Zustand modal store
│ ├ types.ts, rbac.ts, utils.ts, database.types.ts
├ messages/                  # en.json + th.json
├ public/aquawise-logo.png
├ supabase/migrations/       # 001_init / 002_rls / 003_seed
├ docs/                      # PLAN.md + CHECKLIST.md
└ prototypes/                # Original V3 standalone HTML + archived JSX sources
```

## Environment variables

| Var                              | Required when               | Notes                            |
|----------------------------------|-----------------------------|----------------------------------|
| `USE_MOCK`                       | always (default `true`)      | Set `false` to hit Supabase     |
| `NEXT_PUBLIC_SUPABASE_URL`       | `USE_MOCK=false`            | https://xxx.supabase.co          |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | `USE_MOCK=false`            | Public anon key                  |
| `SUPABASE_SERVICE_ROLE_KEY`      | server actions w/ audit log | Service role key — keep secret  |

Copy `.env.example` to `.env.local` and fill in.

## Wiring Supabase

1. **Create a Supabase project** at https://supabase.com/dashboard/projects.
2. **Set env vars** in `.env.local`:
   ```bash
   USE_MOCK=false
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
   SUPABASE_SERVICE_ROLE_KEY=YOUR-SERVICE-KEY
   ```
3. **Run migrations** (via Supabase CLI):
   ```bash
   supabase link --project-ref YOUR-PROJECT
   supabase db push
   ```
4. **Regenerate typed Database** (replaces the placeholder `lib/database.types.ts`):
   ```bash
   supabase gen types typescript --linked > lib/database.types.ts
   ```
5. **Restart `pnpm dev`** — the app facade now talks to Supabase.

## Design system

Tokens live in `app/globals.css` under `@theme inline`. Add new tokens by extending that block — Tailwind 4 picks them up as `bg-{name}` / `text-{name}` utilities. Custom AquaWise primitives in `components/aw/` use CSS vars directly (`var(--color-hero)` etc) for compatibility with both the prototype's loose styling and Tailwind utility classes.

## i18n

Strings live in `messages/{en,th}.json`. Every UI string MUST exist in both. To add a new key:

1. Add to `messages/th.json` (the source-of-truth for Thai-speaking users).
2. Mirror in `messages/en.json`.
3. Use via `useTranslations()` (client) or `getTranslations()` (server).

Locale routing: `/th/...` and `/en/...`. Default is `th`. The middleware at `middleware.ts` handles redirects.

## Testing

The mock data layer is exercised end-to-end by clicking through pages. Add unit tests with Vitest later.

## Status

See `docs/PLAN.md` for the 5-phase delivery plan and `docs/CHECKLIST.md` for the granular task list.

| Phase | Status |
|-------|--------|
| 1 — Scaffold & shell        | ✓ Done |
| 2 — Page port               | ✓ Done |
| 3 — Supabase backend (code) | ✓ Done — project not yet provisioned |
| 4 — Wire pages to backend   | ✓ Done — facade behind `USE_MOCK` flag |
| 5 — Polish & deploy         | In progress |

## Reference

Original prototype: `prototypes/AquaWise Hatchery v3 - Standalone.html` (open in browser to see the design intent). Archived JSX sources in `prototypes/_archive/` are the porting reference.
