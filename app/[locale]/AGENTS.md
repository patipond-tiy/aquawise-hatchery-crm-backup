<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-26 | Updated: 2026-05-16 -->

# [locale]

## Purpose
Locale-prefixed user-facing routes. Every URL the user visits starts with `/{th,en}/`. Three branches:

1. **`(dashboard)/`** — main authenticated app, wrapped in `Shell` + `BillingGate` + `TrialBanner`
2. **`login/`** — magic-link sign-in (no shell, no gate)
3. **`billing/`** — paywall landing page (`trial-expired/`) for users whose trial ended

The locale layout (`layout.tsx`) sets up fonts, the `<NextIntlClientProvider>`, and conditionally swaps the entire UI for `<ComingSoon />` when `locale === 'en'`.

## Key Files

| File | Description |
|------|-------------|
| `layout.tsx` | Root html/body. Loads Inter (Latin/body) + Plus Jakarta Sans (display headings — design-system-v1 sanctioned exception) + Noto Sans Thai (Thai) + JetBrains Mono (numerics) via `next/font`. Validates locale, calls `setRequestLocale`. **Renders `<ComingSoon />` for `en` locale**, otherwise `<Providers>` + children |
| `error.tsx` | Locale-scoped error boundary with retry |
| `not-found.tsx` | Locale-scoped 404 page |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `(dashboard)/` | Main app: dashboard, customers, batches, restock, alerts, scorecard, settings (see `(dashboard)/AGENTS.md`) |
| `login/` | Magic-link sign-in page |
| `billing/` | Paywall landing — `trial-expired/` |

## For AI Agents

### Working In This Directory
- **Locale validation is mandatory.** `layout.tsx` calls `notFound()` when the locale segment isn't in `routing.locales` — preserve this when refactoring.
- **`setRequestLocale(locale)` must run early** in the layout body so nested server components and metadata see the right locale. Don't move it.
- **Body fontFamily is locale-aware**: Thai-first stack on `/th`, Latin-first on `/en`. Don't hard-code one of them.
- **The `<ComingSoon />` gate**: any work on the English UI must currently account for the fact that `[locale]/layout.tsx` short-circuits all `en` routes. Remove the gate when English copy review lands (Phase 5).

### Common Patterns
- Layouts: every directory under `[locale]/` may have its own `layout.tsx` and `error.tsx`. The `(dashboard)` group's layout adds the shell + billing gate.
- `params` is a Promise in Next 16 — always `await params` in async server components.

## Dependencies

### Internal
- `@/i18n/routing`, `@/components/providers`, `@/components/coming-soon`

### External
- `next-intl/server` (`setRequestLocale`, `hasLocale`), `next-intl` (`NextIntlClientProvider`)
- `next/font/google` for Inter (Latin/body), Plus Jakarta Sans (display headings only — design-system-v1 sanctioned exception, not the default), Noto Sans Thai (Thai), JetBrains Mono (numerics). Canonical stack: `../../../design-system-v1/colors_and_type.css`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
