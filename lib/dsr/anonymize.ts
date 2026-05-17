import 'server-only';
import { createClient } from '@/lib/supabase/server';

/**
 * Story S7 — wraps the `dsr_anonymize_user` SECURITY DEFINER RPC
 * (migration 029). The migration owns the field-by-field policy; this
 * helper is the typed app seam (used by the delete route, unit-tested).
 *
 * Conforms to docs/aquawise-updated-docs/DSR-SPEC.md §4: scrubs
 * subject-authored free text + pending invites; financial rows and
 * `audit_log` are retained by the RPC (not touched here).
 */
export interface AnonymizeResult {
  ok: boolean;
  error?: string;
  detail?: unknown;
}

export async function anonymizeUser(userId: string): Promise<AnonymizeResult> {
  if (!userId) return { ok: false, error: 'userId required' };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('dsr_anonymize_user', {
    p_user: userId,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, detail: data };
}
