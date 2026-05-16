import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query/server';
import { listAlerts } from '@/lib/api';
import { AlertsView } from './alerts-view';

/**
 * Second reference RSC for the server-fetch convention (see CLAUDE.md
 * "Server-component data-fetching"). Read-only page: prefetch through the
 * `@/lib/api` facade into a per-request QueryClient, hand the dehydrated
 * cache to the thin client view. The close-alert mutation runs through the
 * existing modal flow and is tracked for server-action migration.
 */
export default async function AlertsPage() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['alerts'],
    queryFn: listAlerts,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AlertsView />
    </HydrationBoundary>
  );
}
