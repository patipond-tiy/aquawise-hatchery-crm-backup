import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Story S7 — PDPA DSR erasure. `POST /api/dsr/delete`.
 * Conforms to docs/aquawise-updated-docs/DSR-SPEC.md §3.2 / §4.
 *
 * Anonymize, do NOT hard-delete (DSR-SPEC §3.2). Self-service only
 * (`getUser()`). The actual field scrub is the SECURITY DEFINER RPC
 * `dsr_anonymize_user` (migration 029) so the policy decisions live in the
 * migration, not app code. Financial rows + audit_log are retained (§4).
 * The subject's session is invalidated afterwards (§3.2 side effect).
 */
export async function POST(_req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // Rate-limit (DSR-SPEC §5).
  const { data: allowed, error: rlErr } = await supabase.rpc(
    'dsr_rate_check',
    { p_kind: 'delete' }
  );
  if (rlErr) {
    return NextResponse.json({ error: 'rate_check_failed' }, { status: 500 });
  }
  if (allowed === false) {
    return NextResponse.json(
      { error: 'rate_limited', detail: 'Max 5 DSR requests per 24h' },
      { status: 429 }
    );
  }

  // Capture the membership BEFORE anonymizing (for the audit row's
  // nursery_id — audit_log.nursery_id is NOT NULL + RLS-scoped).
  const { data: membership } = await supabase
    .from('nursery_members')
    .select('nursery_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  const { data: result, error: anonErr } = await supabase.rpc(
    'dsr_anonymize_user',
    { p_user: user.id }
  );
  if (anonErr) {
    return NextResponse.json(
      { error: 'anonymize_failed', detail: anonErr.message },
      { status: 500 }
    );
  }

  // DSR-SPEC §5 — audit the erasure (retained, exempt from the erasure it
  // documents). Only when a tenant scope exists (NOT NULL + RLS).
  if (membership?.nursery_id) {
    await supabase.from('audit_log').insert({
      nursery_id: membership.nursery_id,
      user_id: user.id,
      action: 'dsr.delete',
      payload: {
        subject_auth_uid: user.id,
        source_repo: 'nursery-crm',
        tables_affected: ['customer_callbacks', 'team_invites'],
      },
    });
  }

  // §3.2 side effect — invalidate the session; the subject cannot hold a
  // live session after erasure.
  await supabase.auth.signOut();

  return NextResponse.json({
    ok: true,
    anonymized_at:
      (result as { anonymized_at?: string } | null)?.anonymized_at ??
      new Date().toISOString(),
    tables_affected: ['customer_callbacks', 'team_invites'],
    tables_retained_for_legal_reason: ['audit_log', 'subscription_events'],
    detail: result,
  });
}
