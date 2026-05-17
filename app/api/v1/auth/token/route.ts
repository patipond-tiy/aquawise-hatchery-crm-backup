// Epic K K2 AC#11 — POST /api/v1/auth/token. Client-credentials token
// refresh (contract §3 row 2). The LINE bot calls this at boot with its
// client_id/secret; CRM validates against LINE_BOT_CLIENT_ID/SECRET and
// returns a ≤15-min read/claim JWT (iss=line-bot, aud=hatchery-crm).
// Not user-facing. Constant-time secret comparison.

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { signReadClaimToken } from '@/lib/jwt/sign-line-bot-jwt';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const b = (body ?? {}) as Record<string, unknown>;
  if (
    b.grant_type !== 'client_credentials' ||
    typeof b.client_id !== 'string' ||
    typeof b.client_secret !== 'string'
  ) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  const expectedId = process.env.LINE_BOT_CLIENT_ID ?? '';
  const expectedSecret = process.env.LINE_BOT_CLIENT_SECRET ?? '';
  if (
    expectedId === '' ||
    expectedSecret === '' ||
    !safeEqual(b.client_id, expectedId) ||
    !safeEqual(b.client_secret, expectedSecret)
  ) {
    return NextResponse.json({ error: 'invalid_client' }, { status: 401 });
  }

  const token = await signReadClaimToken();
  return NextResponse.json(
    { access_token: token, token_type: 'Bearer', expires_in: 900 },
    {
      status: 200,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    }
  );
}
