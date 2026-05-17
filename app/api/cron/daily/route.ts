import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { createServiceClient } from '@/lib/supabase/server';
import { evaluateRestockQueue, type QueuedEvent } from '@/lib/cron/restock';
import { evaluateHarvestWindowQueue } from '@/lib/cron/harvest';
import type { Json } from '@/lib/database.types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * G4 — daily cron (Vercel cron → 02:00 UTC = 09:00 ICT). Enqueues
 * restock_reminder + harvest_window events for due customers. Idempotent via
 * the (customer, template, payload->>'cycle_id') partial unique index — a
 * second run the same day inserts no duplicates (23505 → skip). Honors
 * notification_settings.restock (H1). CRON_SECRET-protected, timing-safe.
 */
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

async function handle(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const supabase = await createServiceClient();
  const restock = await evaluateRestockQueue(supabase);
  const harvest = await evaluateHarvestWindowQueue(supabase);
  const queued: QueuedEvent[] = [...restock, ...harvest];

  let enqueued = 0;
  let deduped = 0;
  for (const ev of queued) {
    const { error } = await supabase.from('line_outbound_events').insert({
      nursery_id: ev.nurseryId,
      customer_id: ev.customerId,
      line_user_id: ev.lineUserId,
      template: ev.template,
      payload: ev.payload as Json,
      status: 'pending',
      kind: 'template_push',
      is_manual: false,
    });
    if (!error) {
      enqueued += 1;
    } else if (error.code === '23505') {
      deduped += 1;
    } else {
      console.error('[v0] cron enqueue error', ev.template, error.message);
    }
  }

  console.log(
    `[v0] cron/daily evaluated=${queued.length} enqueued=${enqueued} deduped=${deduped}`
  );

  return NextResponse.json({
    ok: true,
    evaluated: queued.length,
    enqueued,
    deduped,
  });
}

export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}
