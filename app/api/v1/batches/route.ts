// Epic K K5 — GET /api/v1/batches?active=true. LINE-bot nightly sync.
// Contract §5/§8 gap row 1: returns every currently-claimable code
// (published_at IS NOT NULL AND valid_until > now()) cross-nursery — the
// payload is batch_code + valid_until only (no PII, no commercial data), so
// the deliberate cross-tenant scope is a minimal-surface platform endpoint.
// Same read-side JWT + rate-limit as K2. Distinct route from [code]/route.ts.

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { verifyLineBotJwt } from '@/lib/jwt/verify-line-bot-jwt';
import { rateLimitAllow } from '@/lib/jwt/rate-limit';
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

export async function GET(req: NextRequest) {
  const started = Date.now();
  const correlationId =
    req.headers.get('x-correlation-id') ?? randomUUID();
  let status = 200;
  let count = 0;

  try {
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

    // Only ?active=true is supported in v1.1. Any other / missing → 400.
    const params = req.nextUrl.searchParams;
    if (params.get('active') !== 'true' || params.size !== 1) {
      status = 400;
      return json({ error: 'unsupported_query' }, 400, correlationId);
    }

    const supabase = await createServiceClient();
    const nowIso = new Date().toISOString();
    const { data, error } = await supabase
      .from('batches')
      .select('batch_code, valid_until')
      .not('published_at', 'is', null)
      .gt('valid_until', nowIso)
      .order('valid_until', { ascending: true });

    if (error) {
      status = 500;
      console.error(
        `[v0] K5 list-active error correlation_id=${correlationId}`,
        error.message
      );
      return json({ error: 'internal_error' }, 500, correlationId);
    }

    const batches = (data ?? []).map((r) => ({
      batch_code: r.batch_code,
      valid_until: new Date(r.valid_until).toISOString(),
    }));
    count = batches.length;
    return json({ batches }, 200, correlationId);
  } catch (e) {
    status = 500;
    console.error(
      `[v0] K5 list-active error correlation_id=${correlationId}`,
      e instanceof Error ? e.message : e
    );
    return json({ error: 'internal_error' }, 500, correlationId);
  } finally {
    console.log(
      `[v0] K5 list-active correlation_id=${correlationId} count=${count} status=${status} latency_ms=${Date.now() - started}`
    );
  }
}
