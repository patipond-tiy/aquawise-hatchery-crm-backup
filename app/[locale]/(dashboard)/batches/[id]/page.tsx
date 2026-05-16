import { notFound } from 'next/navigation';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query/server';
import { getBatchServer } from '@/lib/api/server-reads';
import { BatchDetailView } from './batch-detail-view';

/**
 * C3 — RSC for the batch detail page. Prefetches the real batch with its
 * `pcr_results` rows and `batch_buyers`-joined buyers through the `@/lib/api`
 * facade, then hydrates the thin client view. AC #6: an unknown /
 * cross-tenant id (getBatch → null) renders 404.
 */
export default async function BatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const queryClient = getQueryClient();

  const batch = await getBatchServer(id);
  if (!batch) notFound();

  queryClient.setQueryData(['batch', id], batch);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BatchDetailView id={id} />
    </HydrationBoundary>
  );
}
