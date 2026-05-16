<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-16 | Updated: 2026-05-16 -->

# lib/query

## Purpose
Server-side TanStack Query plumbing for the RSC prefetch + hydrate convention. The browser keeps its own long-lived `QueryClient` in `components/providers.tsx`; this directory provides the **per-request** server client.

## Key Files

| File | Description |
|------|-------------|
| `server.ts` | `getQueryClient()` — `'server-only'`. Returns a fresh `QueryClient` per request (`staleTime: 30_000`, `refetchOnWindowFocus: false`, dehydrate includes `pending` queries so streamed prefetches hydrate). A new client per request prevents cross-request cache bleed on the server |

## For AI Agents

### Working In This Directory
- **One client per request — never share.** A module-level singleton would leak one tenant's cached data into another request. `getQueryClient()` constructing fresh each call is the whole point; don't memoize it.
- This is half of the locked server-fetch convention (see root `CLAUDE.md` "Server-component data-fetching"): RSC page calls `getQueryClient()` → `prefetchQuery` through `@/lib/api` → wrap a thin `'use client'` `*-view.tsx` in `<HydrationBoundary state={dehydrate(qc)}>`. Reference impls: `app/[locale]/(dashboard)/scorecard/` and `alerts/`.
- `dehydrate` deliberately includes `pending` queries so streamed/suspended prefetches still hydrate on the client — keep that override.
- `'server-only'` — never import from a client component (the browser client lives in `components/providers.tsx`).

### Testing Requirements
- No dedicated suite; behavior is exercised indirectly via RSC pages. Keep options aligned with the browser client's `staleTime` (30s) so server/client caches agree.

### Common Patterns
- RSC: `const qc = getQueryClient(); await qc.prefetchQuery({ queryKey, queryFn })`; view reuses the same `queryKey` with `useQuery`.

## Dependencies

### Internal
- `@/lib/api` (the prefetch data source — callers, not this file)

### External
- `@tanstack/react-query`, `server-only`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
