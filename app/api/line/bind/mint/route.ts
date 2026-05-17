import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { currentNurseryScope } from '@/lib/auth';
import { can } from '@/lib/rbac';
import { createClient } from '@/lib/supabase/server';
import { ulid } from '@/lib/line/ulid';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SEVEN_DAYS_MS = 7 * 24 * 3600 * 1000;

/**
 * G1 — POST /api/line/bind/mint. Mints a one-shot `customer_bind_tokens` row
 * (26-char ULID, 7-day expiry) for a customer and returns the LIFF URL the rep
 * sends to the farmer. Session-scoped: caller must be a nursery member with
 * `customer:write`. The token is RLS-scoped to the caller's nursery.
 */
export async function POST(req: NextRequest) {
  const scope = await currentNurseryScope();
  if (!scope) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!can(scope.role, 'customer:write')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  let body: { customerId?: string };
  try {
    body = (await req.json()) as { customerId?: string };
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }
  const customerId = body.customerId;
  if (!customerId) {
    return NextResponse.json(
      { error: 'customerId required' },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // RLS confirms the customer belongs to the caller's nursery.
  const { data: customer } = await supabase
    .from('customers')
    .select('id, nursery_id, line_id')
    .eq('id', customerId)
    .maybeSingle();
  if (!customer) {
    return NextResponse.json({ error: 'customer not found' }, { status: 404 });
  }
  if (customer.line_id) {
    return NextResponse.json(
      { error: 'customer already linked' },
      { status: 409 }
    );
  }

  const token = ulid();
  const expiresAt = new Date(Date.now() + SEVEN_DAYS_MS).toISOString();

  const { error } = await supabase.from('customer_bind_tokens').insert({
    token,
    nursery_id: scope.nurseryId,
    customer_id: customerId,
    created_by: scope.userId,
    expires_at: expiresAt,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const liffId = process.env.LIFF_ID ?? '';
  const url = liffId
    ? `https://liff.line.me/${liffId}/bind?token=${token}`
    : `https://liff.line.me/PENDING_LIFF_ID/bind?token=${token}`;

  return NextResponse.json({ ok: true, token, url, expiresAt });
}
