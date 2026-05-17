import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { drainOutboundQueue } from '@/lib/line/queue';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * G3p — outbound queue worker (CRM-hosted drain). Protected by CRON_SECRET so
 * only Vercel cron / an authenticated operator can trigger a drain. The actual
 * LINE push is delegated to the bot-worker repo (no channel token here); this
 * route runs the REAL status machine (claim → quiet-hours → toggle gate →
 * retry/backoff → dead-letter) and reports what it did.
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
  const summary = await drainOutboundQueue();
  return NextResponse.json({ ok: true, ...summary });
}

export async function POST(req: NextRequest) {
  return handle(req);
}

export async function GET(req: NextRequest) {
  return handle(req);
}
