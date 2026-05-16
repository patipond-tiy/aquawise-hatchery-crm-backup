import 'server-only';
import {
  QueryClient,
  defaultShouldDehydrateQuery,
} from '@tanstack/react-query';

/**
 * Per-request QueryClient for React Server Components.
 *
 * Server-fetch convention (see CLAUDE.md "Server-component data-fetching"):
 * a (dashboard) page that owns server data is an RSC that creates a client
 * here, `prefetchQuery`s through the `@/lib/api` facade, then hands a
 * dehydrated cache to a thin `'use client'` view via `<HydrationBoundary>`.
 *
 * A fresh client per request prevents cross-request cache bleed on the server.
 * The browser keeps its own long-lived client from `components/providers.tsx`.
 */
export function getQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
      },
      dehydrate: {
        // Include pending queries so streamed prefetches hydrate too.
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
      },
    },
  });
}
