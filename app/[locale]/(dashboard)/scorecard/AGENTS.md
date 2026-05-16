<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-26 | Updated: 2026-05-16 -->

# scorecard

## Purpose
The **public scorecard** that farm customers can view by scanning a QR code. Mostly a configurator — choose what to show (D30 trend, PCR status, retention rate, volume, customer reviews) and what to hide. The public-facing scorecard rendering will live elsewhere (separate route/project — open question tracked in `docs/bmad/`, historically `docs/archive/PLAN.md`).

**This directory is the reference full RSC implementation** of the server-component data-fetching convention (page + view + audited server action) — copy it for new server-owning pages. See root `CLAUDE.md` "Server-component data-fetching".

## Key Files

| File | Description |
|------|-------------|
| `page.tsx` | Async **Server Component**. Builds a per-request `getQueryClient()` (`lib/query/server.ts`), `prefetchQuery`s scorecard settings through `@/lib/api`, wraps `<ScorecardView>` in `<HydrationBoundary state={dehydrate(qc)}>` |
| `scorecard-view.tsx` | Thin `'use client'` view: live preview (left) + toggle panel of visibility switches + `public` master switch + QR/share card (right). Reads the hydrated cache with `useQuery`; mutates via the server action |
| `actions.ts` | `'use server'` — `updateScorecardSettingsAction(...)`: mock mode delegates to `@/lib/mock/api`; live mode resolves tenant via `currentNurseryScope()`, persists, then `writeAuditLog(...)` |

## For AI Agents

### Working In This Directory
- **Follow this pattern for new server-data pages.** RSC prefetch through `@/lib/api` → dehydrate → thin client view with the same `queryKey` → mutations through the co-located `'use server'` action that writes `audit_log` (never mutate from the client via `@/lib/api`).
- **Toggles are partial updates** — each switch sends only the changed field; mock and Supabase impls both support partials.
- **The QR / shareable URL** isn't fully wired — placeholder `https://aquawise.com/s/<nursery-slug>`. Replace when the public scorecard route lands.
- **Keep the preview component reusable** so it can be lifted into the eventual public surface unchanged.

### Testing Requirements
- Exercise in mock mode (toggle each switch, confirm persistence across navigation). The server action's audit write only fires in live mode; verify it doesn't break the mock click-through.

### Common Patterns
- `page.tsx` is async, no `'use client'`; `scorecard-view.tsx` carries all interactivity. Same `queryKey` on both sides.

## Dependencies

### Internal
- `@/lib/api` (`getScorecardSettings`, `updateScorecardSettings`), `@/lib/query/server` (`getQueryClient`)
- `@/lib/auth` (`currentNurseryScope`), `@/lib/audit` (`writeAuditLog`), `@/lib/types` (`ScorecardSettings`)

### External
- `@tanstack/react-query` (`HydrationBoundary`, `dehydrate`), Radix `@radix-ui/react-switch`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
