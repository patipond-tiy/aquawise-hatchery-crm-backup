import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { currentNurseryScope } from '@/lib/auth';
import type { Json } from '@/lib/database.types';

/**
 * Append a row to `audit_log` for the calling user's tenant.
 *
 * Mutation server actions are the ONLY place tenant-state changes should
 * happen (client mutations via the browser Supabase client bypass this and
 * are being migrated away — see CLAUDE.md "Server-component data-fetching").
 * Call this right after a successful write. Audit failures are swallowed:
 * a missing audit row must never roll back a user-visible mutation.
 *
 * No-op when there is no resolvable tenant scope (mock mode / unauthenticated)
 * so callers can invoke it unconditionally.
 */
export async function writeAuditLog(
  action: string,
  payload?: Json
): Promise<void> {
  const scope = await currentNurseryScope();
  if (!scope) return;

  try {
    const supabase = await createClient();
    await supabase.from('audit_log').insert({
      nursery_id: scope.nurseryId,
      user_id: scope.userId,
      action,
      payload: payload ?? null,
    });
  } catch (e) {
    console.error(
      '[audit] failed to write audit_log entry:',
      e instanceof Error ? e.message : e
    );
  }
}
