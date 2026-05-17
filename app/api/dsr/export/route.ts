import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Story S7 — PDPA DSR export. `GET /api/dsr/export`.
 * Conforms to docs/aquawise-updated-docs/DSR-SPEC.md §3.1 (READ-ONLY mirror).
 *
 * Subject = the calling auth user (a nursery operator). Self-service only:
 * `getUser()` (NEVER getSession — validates the JWT server-side, §18(C)).
 * No `can()` check — DSR is the subject's own right regardless of role
 * (DSR-SPEC §3.1 / S7 RBAC note). Works even with no remaining membership
 * (a revoked operator still owns their PII).
 */
export async function GET(_req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // Rate-limit (DSR-SPEC §5: 5 / subject / 24h, export+delete combined).
  const { data: allowed, error: rlErr } = await supabase.rpc(
    'dsr_rate_check',
    { p_kind: 'export' }
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

  // Gather every row in this repo that holds the subject's personal data.
  // RLS still applies (these reads run as the subject) — that is correct:
  // the subject can only see their own tenant's rows anyway, and we filter
  // to their authorship/identity explicitly.
  const [members, invites, callbacks, audit] = await Promise.all([
    supabase
      .from('nursery_members')
      .select('nursery_id, role, created_at')
      .eq('user_id', user.id),
    supabase
      .from('team_invites')
      .select('nursery_id, email, role, created_at, accepted_at')
      .eq('created_by', user.id),
    supabase
      .from('customer_callbacks')
      .select('id, nursery_id, customer_id, scheduled_for, channel, note, created_at')
      .eq('created_by', user.id),
    supabase
      .from('audit_log')
      .select('action, payload, created_at')
      .eq('user_id', user.id),
  ]);

  const records: { table: string; fields: unknown }[] = [];
  if (members.data?.length)
    records.push({ table: 'nursery_members', fields: members.data });
  if (invites.data?.length)
    records.push({ table: 'team_invites', fields: invites.data });
  if (callbacks.data?.length)
    records.push({ table: 'customer_callbacks', fields: callbacks.data });
  if (audit.data?.length)
    records.push({ table: 'audit_log', fields: audit.data });

  if (records.length === 0) {
    // DSR-SPEC §3.1 — a valid answer: this repo holds no PII for the subject.
    return NextResponse.json(
      { error: 'no_personal_data', source_repo: 'nursery-crm' },
      { status: 404 }
    );
  }

  const body = {
    subject: { auth_uid: user.id, line_user_id: null },
    generated_at: new Date().toISOString(),
    source_repo: 'nursery-crm',
    records,
    retained_for_legal_reason: [
      {
        table: 'audit_log',
        reason:
          'PDPA accountability — records that lawful processing/erasure occurred',
        fields_redacted_on_erasure: ['actor_user_id (displayed as redacted)'],
      },
      {
        table: 'subscription_events',
        reason: 'Thai Revenue Dept — 7-year financial record retention',
        fields_redacted_on_erasure: ['linked customer name'],
      },
    ],
  };

  // DSR-SPEC §5 — one audit_log row per DSR; actor embedded in payload
  // (no event/actor/subject_id columns). audit_log.nursery_id is NOT NULL
  // and RLS-scoped, so we can only write it when the subject still has a
  // membership. The DSR is independently recorded in `dsr_requests` (via
  // dsr_rate_check) so accountability is preserved even for a
  // post-revocation subject with no nursery.
  const auditNurseryId = members.data?.[0]?.nursery_id;
  if (auditNurseryId) {
    await supabase.from('audit_log').insert({
      nursery_id: auditNurseryId,
      user_id: user.id,
      action: 'dsr.export',
      payload: {
        subject_auth_uid: user.id,
        source_repo: 'nursery-crm',
        tables_affected: records.map((r) => r.table),
      },
    });
  }

  return new NextResponse(JSON.stringify(body, null, 2), {
    status: 200,
    headers: {
      'content-type': 'application/json',
      'content-disposition': 'attachment; filename="dsr-export.json"',
    },
  });
}
