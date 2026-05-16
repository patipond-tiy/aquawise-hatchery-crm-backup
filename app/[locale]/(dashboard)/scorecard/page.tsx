import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query/server';
import { getScorecardSettings } from '@/lib/api';
import { ScorecardView } from './scorecard-view';

/**
 * Reference RSC for the server-fetch convention (see CLAUDE.md
 * "Server-component data-fetching"). The page is a Server Component: it
 * prefetches through the `@/lib/api` facade into a per-request QueryClient,
 * then hands the dehydrated cache to the thin client view. The view's
 * mutations go through the `scorecard/actions.ts` server action (which
 * writes audit_log) — not the browser Supabase client.
 */
export default async function ScorecardPage() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['scorecard'],
    queryFn: getScorecardSettings,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ScorecardView />
    </HydrationBoundary>
  );
}
