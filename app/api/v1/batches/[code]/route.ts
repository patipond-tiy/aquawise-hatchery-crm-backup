// Epic K K2 — GET /api/v1/batches/:code. Versioned, ES256-bearer read API
// the LINE bot consumes. Contract §5: regex 400 → JWT 401 → rate-limit 429 →
// resolution ladder (404/410/200). No locale, no BillingGate (proxy.ts
// matcher excludes /api/*). Service-role DB (no user session).

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { validateBatchCode } from '@/lib/aquawise-core/batch-code';
import { verifyLineBotJwt } from '@/lib/jwt/verify-line-bot-jwt';
import { rateLimitAllow } from '@/lib/jwt/rate-limit';
import { createServiceClient } from '@/lib/supabase/server';
import { resolveBatchForRead } from '@/lib/batch-read';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function json(
  body: unknown,
  status: number,
  correlationId: string,
  extraHeaders?: Record<string, string>
) {
  return NextResponse.json(body, {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'x-correlation-id': correlationId,
      ...extraHeaders,
    },
  });
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ code: string }> }
) {
  const started = Date.now();
  const correlationId =
    req.headers.get('x-correlation-id') ?? randomUUID();
  const { code } = await ctx.params;

  let status = 200;
  try {
    // 1. Path format (before any DB / auth work — contract §5).
    if (!validateBatchCode(code)) {
      status = 400;
      return json({ error: 'invalid_code_format' }, 400, correlationId);
    }

    // 2. Auth.
    const auth = await verifyLineBotJwt(req);
    if (!auth.ok) {
      status = 401;
      const headers = auth.expired
        ? { 'www-authenticate': 'Bearer error="token_expired"' }
        : undefined;
      return json({ error: 'unauthorized' }, 401, correlationId, headers);
    }

    // 3. Rate limit (per iss).
    if (!rateLimitAllow(auth.iss)) {
      status = 429;
      return json({ error: 'rate_limited' }, 429, correlationId, {
        'retry-after': '1',
      });
    }

    // 4. Resolution ladder.
    const supabase = await createServiceClient();
    const r = await resolveBatchForRead(supabase, code);
    if (r.kind === 'not_found') {
      status = 404;
      return json({ error: 'batch_not_found' }, 404, correlationId);
    }
    if (r.kind === 'expired') {
      status = 410;
      return json(
        { error: 'batch_expired', expired_at: r.expiredAt },
        410,
        correlationId
      );
    }
    if (r.kind === 'claimed_by_other') {
      status = 409;
      return json({ error: 'claimed_by_other' }, 409, correlationId);
    }
    return json(r.body, 200, correlationId);
  } catch (e) {
    status = 500;
    console.error(
      `[v0] K2 batch-read error correlation_id=${correlationId}`,
      e instanceof Error ? e.message : e
    );
    return json({ error: 'internal_error' }, 500, correlationId);
  } finally {
    console.log(
      `[v0] K2 batch-read correlation_id=${correlationId} batch_code=${code} status=${status} latency_ms=${Date.now() - started}`
    );
  }
}
