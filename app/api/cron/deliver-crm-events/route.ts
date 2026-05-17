// Epic K K4 — retry cron for undelivered crm_event_log rows. Contract §7:
// 5-min tick; select delivered_at IS NULL AND attempts < 12; exp backoff
// min(2^attempts,60)s between attempts; 4xx (non-429) stops the row; 5xx/429
// increments attempts; 12 attempts → dead-letter (left at attempts=12).
// CRON_SECRET, timing-safe (same pattern as app/api/cron/daily).

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { createServiceClient } from '@/lib/supabase/server';
import { deliverBatchWarning } from '@/lib/line-bot/webhook-client';
import type { BatchWarningEvent } from '@/lib/aquawise-core/contract-types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_ATTEMPTS = 12;
const BATCH_PER_TICK = 50;

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get('authorization') ?? '';
  const expected = `Bearer ${secret}`;
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function backoffDueSeconds(attempts: number): number {
  return Math.min(2 ** attempts, 60);
}

async function handle(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const supabase = await createServiceClient();
  const { data: rows, error } = await supabase
    .from('crm_event_log')
    .select(
      'id, correlation_id, batch_id, severity, payload, attempts, posted_at, delivered_at'
    )
    .is('delivered_at', null)
    .lt('attempts', MAX_ATTEMPTS)
    .order('posted_at', { ascending: true })
    .limit(BATCH_PER_TICK);

  if (error) {
    console.error('[v0] K4 cron select error', error.message);
    return NextResponse.json({ error: 'select_failed' }, { status: 500 });
  }

  let delivered = 0;
  let retried = 0;
  let skipped = 0;
  let deadLettered = 0;

  for (const row of rows ?? []) {
    // Respect exponential backoff: only attempt if enough time elapsed since
    // posted_at given the current attempt count.
    const dueAfterMs =
      new Date(row.posted_at).getTime() +
      backoffDueSeconds(row.attempts) * 1000;
    if (Date.now() < dueAfterMs) {
      skipped += 1;
      continue;
    }

    try {
      const result = await deliverBatchWarning(
        {
          correlation_id: row.correlation_id,
          batch_code: (row.payload as unknown as BatchWarningEvent).batch_code,
          severity: row.severity as BatchWarningEvent['severity'],
          payload: row.payload as unknown as BatchWarningEvent,
        },
        10000
      );

      if (result.ok) {
        await supabase
          .from('crm_event_log')
          .update({ delivered_at: new Date().toISOString() })
          .eq('id', row.id);
        delivered += 1;
      } else if (
        result.status >= 400 &&
        result.status < 500 &&
        result.status !== 429
      ) {
        // Permanent client error — stop retrying this row.
        await supabase
          .from('crm_event_log')
          .update({
            attempts: MAX_ATTEMPTS,
            last_error: result.error ?? `http_${result.status}`,
          })
          .eq('id', row.id);
        deadLettered += 1;
      } else {
        const nextAttempts = row.attempts + 1;
        await supabase
          .from('crm_event_log')
          .update({
            attempts: nextAttempts,
            last_error: result.error ?? `http_${result.status}`,
          })
          .eq('id', row.id);
        retried += 1;
        if (nextAttempts >= MAX_ATTEMPTS) deadLettered += 1;
      }
    } catch (e) {
      console.error(
        '[v0] K4 cron per-row error',
        row.correlation_id,
        e instanceof Error ? e.message : e
      );
      await supabase
        .from('crm_event_log')
        .update({
          attempts: row.attempts + 1,
          last_error: e instanceof Error ? e.message : 'unknown',
        })
        .eq('id', row.id);
      retried += 1;
    }
  }

  console.log(
    `[v0] cron/deliver-crm-events scanned=${rows?.length ?? 0} delivered=${delivered} retried=${retried} skipped=${skipped} deadletter=${deadLettered}`
  );

  return NextResponse.json({
    ok: true,
    scanned: rows?.length ?? 0,
    delivered,
    retried,
    skipped,
    deadLettered,
  });
}

export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}
