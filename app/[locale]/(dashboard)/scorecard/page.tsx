import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query/server';
import {
  getScorecardSettingsServer,
  getNurseryServer,
  listCustomersServer,
  listBatchesServer,
} from '@/lib/api/server-reads';
import { ScorecardView } from './scorecard-view';

/**
 * Reference RSC for the server-fetch convention (see CLAUDE.md
 * "Server-component data-fetching"). The page is a Server Component: it
 * prefetches through the server-Supabase-client reads (MOCK-TO-PROD §7 —
 * never the browser-client `@/lib/api` facade in an RSC) into a per-request
 * QueryClient, then hands the dehydrated cache to the thin client view.
 * The view's mutations go through the `scorecard/actions.ts` server action
 * (which writes audit_log) — not the browser Supabase client.
 */
export default async function ScorecardPage() {
  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ['scorecard'],
      queryFn: getScorecardSettingsServer,
    }),
    queryClient.prefetchQuery({
      queryKey: ['nursery'],
      queryFn: getNurseryServer,
    }),
    queryClient.prefetchQuery({
      queryKey: ['customers'],
      queryFn: listCustomersServer,
    }),
    queryClient.prefetchQuery({
      queryKey: ['batches'],
      queryFn: () => listBatchesServer(),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ScorecardView />
    </HydrationBoundary>
  );
}
