import { notFound } from 'next/navigation';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query/server';
import {
  getCustomerServer,
  listCallbacksServer,
  listQuotesServer,
  listLineEventsServer,
} from '@/lib/api/server-reads';
import { CustomerDetailView } from './customer-detail-view';

/**
 * B3/B4 — RSC for the customer detail page. Prefetches the real customer
 * (contact + cycle history + batch history) and the upcoming callbacks list
 * through the `@/lib/api` facade, then hydrates the thin client view.
 * AC #7: an unknown / cross-tenant id (getCustomer → null) renders 404.
 */
export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const queryClient = getQueryClient();

  const customer = await getCustomerServer(id);
  if (!customer) notFound();

  queryClient.setQueryData(['customer', id], customer);
  queryClient.setQueryData(
    ['callbacks', id],
    await listCallbacksServer(id)
  );
  queryClient.setQueryData(['quotes', id], await listQuotesServer(id));
  queryClient.setQueryData(
    ['line-events', id],
    await listLineEventsServer(id)
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CustomerDetailView id={id} />
    </HydrationBoundary>
  );
}
