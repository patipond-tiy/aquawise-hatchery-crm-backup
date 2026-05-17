import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import type { Json } from '@/lib/database.types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * G1 — POST /api/line/bind/consume. Called by the bot-worker LIFF bind page
 * (cross-service, no browser session) with `{token, lineUserId, lineProfile}`.
 * Service-role (RLS bypassed intentionally for the cross-service write).
 *
 * One-shot semantics:
 *   - expired token (> expires_at)        → 410
 *   - already consumed (consumed_at set)  → 409
 *   - valid                               → sets customers.line_id,
 *     upserts line_users, creates chat_threads (placeholder for H3),
 *     marks the token consumed, returns {ok, customerId}
 *
 * Must be POST — this mutates state.
 */
export async function POST(req: NextRequest) {
  let body: {
    token?: string;
    lineUserId?: string;
    lineProfile?: {
      displayName?: string;
      pictureUrl?: string;
      statusMessage?: string;
    };
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }

  const { token, lineUserId, lineProfile } = body;
  if (!token || !lineUserId) {
    return NextResponse.json(
      { error: 'token and lineUserId required' },
      { status: 400 }
    );
  }

  const supabase = await createServiceClient();

  const { data: row } = await supabase
    .from('customer_bind_tokens')
    .select(
      'token, nursery_id, customer_id, expires_at, consumed_at'
    )
    .eq('token', token)
    .maybeSingle();

  if (!row) {
    return NextResponse.json({ error: 'token not found' }, { status: 404 });
  }
  if (row.consumed_at) {
    return NextResponse.json(
      { error: 'token already consumed' },
      { status: 409 }
    );
  }
  if (new Date(row.expires_at).getTime() <= Date.now()) {
    return NextResponse.json({ error: 'token expired' }, { status: 410 });
  }

  // Set the customer's LINE id (the channel D2/C4/E4/G4 push to).
  const { error: custErr } = await supabase
    .from('customers')
    .update({ line_id: lineUserId })
    .eq('id', row.customer_id);
  if (custErr) {
    return NextResponse.json({ error: custErr.message }, { status: 500 });
  }

  // Upsert the LINE profile.
  await supabase.from('line_users').upsert(
    {
      line_user_id: lineUserId,
      nursery_id: row.nursery_id,
      customer_id: row.customer_id,
      display_name: lineProfile?.displayName ?? null,
      picture_url: lineProfile?.pictureUrl ?? null,
      status_message: lineProfile?.statusMessage ?? null,
      last_seen_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'line_user_id' }
  );

  // chat_threads placeholder (H3 two-way inbox lands here later; not read in H1).
  await supabase
    .from('chat_threads')
    .upsert(
      {
        nursery_id: row.nursery_id,
        customer_id: row.customer_id,
        line_user_id: lineUserId,
      },
      { onConflict: 'customer_id' }
    );

  // Consume the token (one-shot).
  const { error: consumeErr } = await supabase
    .from('customer_bind_tokens')
    .update({
      consumed_at: new Date().toISOString(),
      consumed_line_user_id: lineUserId,
    })
    .eq('token', token)
    .is('consumed_at', null);
  if (consumeErr) {
    return NextResponse.json({ error: consumeErr.message }, { status: 500 });
  }

  await supabase.from('audit_log').insert({
    nursery_id: row.nursery_id,
    user_id: null,
    action: 'customer.line_bound',
    payload: {
      customer_id: row.customer_id,
      line_user_id: lineUserId,
    } as Json,
  });

  return NextResponse.json({ ok: true, customerId: row.customer_id });
}
