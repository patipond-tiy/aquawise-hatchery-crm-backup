import { redirect } from 'next/navigation';
import { currentNurseryScope } from '@/lib/auth';
import { can } from '@/lib/rbac';
import { isMockMode } from '@/lib/utils/mock-mode';
import { listDeadEventsServer } from '@/lib/api/server-reads';
import { MessagingFailuresView } from './messaging-failures-view';

/**
 * Story X1 — dead-letter list. Server Component: owner-only
 * (`ops:view`), fetches `line_outbound_events WHERE status='dead'`
 * RLS-scoped via the server cookie client (MOCK-TO-PROD §7), hands the
 * rows to the thin client view whose actions go through the co-located
 * server actions (audit_log written there). Mock mode shows a seed row so
 * the dev click-through works.
 */
export default async function MessagingFailuresPage() {
  // In mock mode there is no real session; the demo deploy still renders
  // the page (seed data). Live mode enforces the owner-only guard.
  if (!isMockMode()) {
    const scope = await currentNurseryScope();
    if (!scope || !can(scope.role, 'ops:view')) {
      redirect('/th/settings');
    }
  }

  const events = await listDeadEventsServer();
  return <MessagingFailuresView initialEvents={events} />;
}
