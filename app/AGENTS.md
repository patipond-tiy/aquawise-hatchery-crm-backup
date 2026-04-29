<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-26 | Updated: 2026-04-26 -->

# app

## Purpose
Next.js 16 App Router root. Three top-level groupings:

1. **`[locale]/`** — locale-prefixed user-facing routes (`/th/...` and `/en/...`). The locale segment is required because `next-intl` is configured with `localePrefix: 'always'`.
2. **`auth/`** — Supabase magic-link callback. Lives outside `[locale]` because Supabase's redirect URL must be locale-agnostic.
3. **`api/`** — server-only HTTP routes (Stripe webhook today). Lives outside `[locale]` because external services don't know our locales.

The `globals.css` file at this level holds the Tailwind 4 `@theme inline` token block — the single source of truth for design tokens (`--color-*`, `--radius-*`, `--shadow-*`, fonts, animations).

## Key Files

| File | Description |
|------|-------------|
| `globals.css` | Tailwind 4 layer + `@theme inline` design tokens. Imported once from `[locale]/layout.tsx` |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `[locale]/` | All user-facing routes; root layout, dashboard group, login, billing landing (see `[locale]/AGENTS.md`) |
| `auth/` | Supabase OAuth/magic-link callback at `/auth/callback` (see `auth/AGENTS.md`) |
| `api/` | HTTP API routes — Stripe webhook (see `api/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- **Anything user-facing belongs under `[locale]/`** so it gets i18n routing and the `BillingGate` paywall (when nested under the `(dashboard)` group).
- **External-callback routes belong outside `[locale]/`** (Stripe webhooks, Supabase auth callbacks) so they get a stable URL.
- **Token edits live in `globals.css`** — Tailwind 4 picks up `@theme inline` variables as `bg-{name}` / `text-{name}` utilities. There is intentionally no `tailwind.config.ts`.
- **Do not import server-only modules from a client component.** `lib/stripe/server.ts` and `lib/auth.ts` use `import 'server-only'`; bundler will fail loudly.

### Common Patterns
- Layouts cascade: `[locale]/layout.tsx` (i18n + fonts + providers) → `[locale]/(dashboard)/layout.tsx` (BillingGate + Shell + TrialBanner) → page.
- Route groups: `(dashboard)` is parenthesized — it groups routes for a shared layout without adding a URL segment.
- Dynamic segments: `[id]` for entity detail pages; `[locale]` for the locale prefix.

## Dependencies

### Internal
- `@/i18n/routing` — locale list + default
- `@/components/providers` — Query + Modal + Toast root
- `@/components/layout/shell` — 3-column shell
- `@/lib/api` — facade for all data access
- `@/lib/supabase/server` + `@/lib/stripe/server` — server-only helpers

### External
- `next-intl` (routing, RSC config), `@supabase/ssr` (auth), `stripe` (webhook)

<!-- MANUAL: -->
