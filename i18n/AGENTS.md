<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-26 | Updated: 2026-04-26 -->

# i18n

## Purpose
`next-intl` 4.5 wiring. Three small files define everything:

1. `routing.ts` — locale list + default
2. `request.ts` — server-side request config: load the right `messages/<locale>.json` per request
3. `navigation.ts` — typed `Link`, `redirect`, `usePathname`, `useRouter`, `getPathname` for locale-aware URLs

The runtime entry points are in two files outside this directory:
- `proxy.ts` (root) — middleware that runs `createIntlMiddleware(routing)` AND injects `x-pathname`
- `app/[locale]/layout.tsx` — wraps children in `<NextIntlClientProvider>` and calls `setRequestLocale(locale)`

## Key Files

| File | Description |
|------|-------------|
| `routing.ts` | `defineRouting({ locales: ['en', 'th'], defaultLocale: 'th', localePrefix: 'always' })` |
| `request.ts` | `getRequestConfig` — validates the requested locale, falls back to default, dynamically imports `../messages/<locale>.json` |
| `navigation.ts` | Re-exports locale-aware navigation helpers from `next-intl/navigation` |

## For AI Agents

### Working In This Directory
- **Default locale is `th`**. `localePrefix: 'always'` means there is no naked `/` route — it always redirects to `/th` or `/en`.
- **Adding a locale**: extend `routing.locales`, add `messages/<locale>.json`, mirror every key from `messages/th.json`, restart the dev server. Don't forget to update CI's missing-key gate (planned).
- **Always use `Link` from `@/i18n/navigation`**, not `next/link`, for internal navigation — otherwise the locale prefix is dropped.
- **Server components**: read locale via `setRequestLocale(locale)` then `await getTranslations()`. Client components: `useTranslations()`.

### Common Patterns
- `app/[locale]/layout.tsx` calls `setRequestLocale(locale)` inside the layout body so all nested server components and metadata calls see the right locale.
- The English experience is currently routed to `<ComingSoon />` from `app/[locale]/layout.tsx` — preserving English assets but not building English UI.

## Dependencies

### External
- `next-intl` ^4.5

<!-- MANUAL: -->
