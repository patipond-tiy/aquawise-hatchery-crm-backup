'use server';

import type { Json } from '@/lib/database.types';
import { isMockMode } from '@/lib/utils/mock-mode';
import { currentNurseryScope } from '@/lib/auth';
import { can } from '@/lib/rbac';
import { writeAuditLog } from '@/lib/audit';

/**
 * Story X1 — dead-letter retry / edit-retry / resolve / bulk-retry.
 *
 * Every action: owner-only (`ops:view`), tenant-scoped (RLS at the DB layer
 * + an explicit application-layer nursery check), writes an audit_log row.
 * Retrying flips a `dead` event back to `pending` so the bot worker picks
 * it up again (delivery itself is the separate worker repo — documented).
 */

type ActionResult = { ok: true } | { ok: false; error: string };

async function guard() {
  const scope = await currentNurseryScope();
  if (!scope) return { ok: false as const, error: 'unauthorized' };
  if (!can(scope.role, 'ops:view')) {
    return { ok: false as const, error: 'forbidden' };
  }
  return { ok: true as const, scope };
}

export async function retryDeadEvent(eventId: string): Promise<ActionResult> {
  if (isMockMode()) return { ok: true };
  const g = await guard();
  if (!g.ok) return { ok: false, error: g.error };

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  // Application-layer tenant check (RLS also enforces this at the DB).
  const { data: ev } = await supabase
    .from('line_outbound_events')
    .select('id, nursery_id, attempts, status')
    .eq('id', eventId)
    .eq('nursery_id', g.scope.nurseryId)
    .maybeSingle();
  if (!ev) return { ok: false, error: 'not_found' };

  const { error } = await supabase
    .from('line_outbound_events')
    .update({ status: 'pending', attempts: (ev.attempts ?? 0) + 1 })
    .eq('id', eventId)
    .eq('nursery_id', g.scope.nurseryId);
  if (error) return { ok: false, error: error.message };

  await writeAuditLog('dead_letter_retry', { event_id: eventId } as Json);
  return { ok: true };
}

export async function editAndRetryEvent(
  eventId: string,
  newPayload: string
): Promise<ActionResult> {
  if (isMockMode()) return { ok: true };
  const g = await guard();
  if (!g.ok) return { ok: false, error: g.error };

  let parsed: unknown;
  try {
    parsed = JSON.parse(newPayload);
  } catch {
    return { ok: false, error: 'invalid_json' };
  }
  if (parsed === null || typeof parsed !== 'object') {
    return { ok: false, error: 'invalid_json' };
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  const { data: ev } = await supabase
    .from('line_outbound_events')
    .select('id, nursery_id, attempts')
    .eq('id', eventId)
    .eq('nursery_id', g.scope.nurseryId)
    .maybeSingle();
  if (!ev) return { ok: false, error: 'not_found' };

  const { error } = await supabase
    .from('line_outbound_events')
    .update({
      payload: parsed as Json,
      status: 'pending',
      attempts: (ev.attempts ?? 0) + 1,
    })
    .eq('id', eventId)
    .eq('nursery_id', g.scope.nurseryId);
  if (error) return { ok: false, error: error.message };

  await writeAuditLog('dead_letter_edit_retry', {
    event_id: eventId,
  } as Json);
  return { ok: true };
}

export async function resolveDeadEvent(
  eventId: string
): Promise<ActionResult> {
  if (isMockMode()) return { ok: true };
  const g = await guard();
  if (!g.ok) return { ok: false, error: g.error };

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  const { data: ev } = await supabase
    .from('line_outbound_events')
    .select('id, nursery_id')
    .eq('id', eventId)
    .eq('nursery_id', g.scope.nurseryId)
    .maybeSingle();
  if (!ev) return { ok: false, error: 'not_found' };

  const { error } = await supabase
    .from('line_outbound_events')
    .update({ status: 'resolved' })
    .eq('id', eventId)
    .eq('nursery_id', g.scope.nurseryId);
  if (error) return { ok: false, error: error.message };

  await writeAuditLog('dead_letter_resolved', { event_id: eventId } as Json);
  return { ok: true };
}

export async function retryDeadEventsBulk(
  eventIds: string[]
): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
  if (isMockMode()) return { ok: true, count: eventIds.length };
  const g = await guard();
  if (!g.ok) return { ok: false, error: g.error };
  if (eventIds.length === 0) return { ok: true, count: 0 };

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  // Only events that belong to this nursery AND are still dead.
  const { data: owned } = await supabase
    .from('line_outbound_events')
    .select('id')
    .in('id', eventIds)
    .eq('nursery_id', g.scope.nurseryId)
    .eq('status', 'dead');
  const ownedIds = (owned ?? []).map((r) => r.id);
  if (ownedIds.length === 0) return { ok: true, count: 0 };

  // Per-row update so `attempts` increments correctly (a single bulk
  // UPDATE can't do attempts = attempts + 1 via the JS client cleanly).
  for (const id of ownedIds) {
    const { data: ev } = await supabase
      .from('line_outbound_events')
      .select('attempts')
      .eq('id', id)
      .maybeSingle();
    await supabase
      .from('line_outbound_events')
      .update({ status: 'pending', attempts: (ev?.attempts ?? 0) + 1 })
      .eq('id', id)
      .eq('nursery_id', g.scope.nurseryId);
    // One audit row PER event (X1 AC#6 — bulk of 2 → 2 rows, not 1).
    await writeAuditLog('dead_letter_retry', {
      event_id: id,
      bulk: true,
    } as Json);
  }

  return { ok: true, count: ownedIds.length };
}
