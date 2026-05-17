// Epic K K3 — POST /api/v1/batches/:code/claim. Idempotent claim. Contract
// §6: regex 400 → JWT 401 → rate-limit 429 → body 400 → claim_batch() RPC
// (atomic: ladder + INSERT ON CONFLICT + first_claimed_at + audit_log).
// Service-role DB; the RPC enforces nursery scope by reading batches.nursery_id.

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { validateBatchCode } from '@/lib/aquawise-core/batch-code';
import { verifyLineBotJwt } from '@/lib/jwt/verify-line-bot-jwt';
import { rateLimitAllow } from '@/lib/jwt/rate-limit';
import { parseClaimBody } from '@/lib/jwt/claim-body-schema';
import { createServiceClient } from '@/lib/supabase/server';

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

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ code: string }> }
) {
  const started = Date.now();
  const correlationId =
    req.headers.get('x-correlation-id') ?? randomUUID();
  const { code } = await ctx.params;
  let status = 200;

  try {
    if (!validateBatchCode(code)) {
      status = 400;
      return json({ error: 'invalid_code_format' }, 400, correlationId);
    }

    const auth = await verifyLineBotJwt(req);
    if (!auth.ok) {
      status = 401;
      const headers = auth.expired
        ? { 'www-authenticate': 'Bearer error="token_expired"' }
        : undefined;
      return json({ error: 'unauthorized' }, 401, correlationId, headers);
    }

    if (!rateLimitAllow(auth.iss)) {
      status = 429;
      return json({ error: 'rate_limited' }, 429, correlationId, {
        'retry-after': '1',
      });
    }

    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      status = 400;
      return json(
        { error: 'invalid_body', field: 'line_user_id' },
        400,
        correlationId
      );
    }
    const parsed = parseClaimBody(rawBody);
    if (!parsed.ok) {
      status = 400;
      return json(
        { error: 'invalid_body', field: parsed.field },
        400,
        correlationId
      );
    }

    const supabase = await createServiceClient();
    const { data, error } = await supabase.rpc('claim_batch', {
      p_code: code,
      p_line_user_id: parsed.value.line_user_id,
      p_pond_id: parsed.value.pond_id,
      p_line_profile: parsed.value.line_profile,
      p_correlation_id: parsed.value.correlation_id,
      p_iss: auth.iss,
    });

    if (error) {
      status = 500;
      console.error(
        `[v0] K3 claim rpc error correlation_id=${correlationId}`,
        error.message
      );
      return json({ error: 'internal_error' }, 500, correlationId);
    }

    const res = (data ?? {}) as { status?: string; claimed_at?: string; expired_at?: string };
    switch (res.status) {
      case 'batch_not_found':
        status = 404;
        return json({ error: 'batch_not_found' }, 404, correlationId);
      case 'batch_expired':
        status = 410;
        return json(
          { error: 'batch_expired', expired_at: res.expired_at },
          410,
          correlationId
        );
      case 'claimed_by_other':
        status = 409;
        return json({ error: 'claimed_by_other' }, 409, correlationId);
      case 'ok':
      case 'repeat':
        status = 200;
        return json(
          { ok: true, batch_code: code, claimed_at: res.claimed_at },
          200,
          correlationId
        );
      default:
        status = 500;
        return json({ error: 'internal_error' }, 500, correlationId);
    }
  } catch (e) {
    status = 500;
    console.error(
      `[v0] K3 claim error correlation_id=${correlationId}`,
      e instanceof Error ? e.message : e
    );
    return json({ error: 'internal_error' }, 500, correlationId);
  } finally {
    console.log(
      `[v0] K3 claim correlation_id=${correlationId} batch_code=${code} status=${status} latency_ms=${Date.now() - started}`
    );
  }
}
