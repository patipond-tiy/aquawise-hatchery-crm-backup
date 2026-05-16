import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query/server';
import { listCustomersServer } from '@/lib/api/server-reads';
import { CustomersView } from './customers-view';

/**
 * B1 — RSC that prefetches the RLS-scoped customer list through the
 * `@/lib/api` facade, then hydrates the thin client view (search/tab state
 * stays client-side per AC #2/#3). CD-1 conversion: this page is no longer
 * `'use client'`.
 */
export default async function CustomersPage() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['customers'],
    queryFn: () => listCustomersServer(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CustomersView />
    </HydrationBoundary>
  );
}
