import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query/server';
import { listBatchesServer } from '@/lib/api/server-reads';
import type { PcrStatus } from '@/lib/types';
import { BatchesView } from './batches-view';

/**
 * C2 — RSC that reads filter state from the URL `searchParams` (AC #3),
 * prefetches the RLS-scoped filtered batch list through the `@/lib/api`
 * facade, then hydrates the thin client view. Filter chips push to the URL;
 * the keyed query refetches.
 */
export default async function BatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ pcr?: string; strain?: string; year?: string }>;
}) {
  const sp = await searchParams;
  const pcr =
    sp.pcr === 'clean' || sp.pcr === 'flagged' || sp.pcr === 'pending'
      ? (sp.pcr as PcrStatus)
      : undefined;
  const strain = sp.strain || undefined;
  const year = sp.year ? Number(sp.year) : undefined;
  const filters = { pcr, strain, year };

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['batches', filters],
    queryFn: () => listBatchesServer(filters),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BatchesView pcr={pcr} strain={strain} year={year} />
    </HydrationBoundary>
  );
}
