import { describe, expect, it, vi, beforeEach } from 'vitest';

// K4 — retry cron auth + backoff/dead-letter accounting. The webhook client
// is mocked; we assert CRON_SECRET enforcement and the per-row state machine.

process.env.CRON_SECRET = 'cron-secret';

let updateCalls: Array<Record<string, unknown>> = [];
let selectRows: Array<Record<string, unknown>> = [];
let deliverResult = { ok: true, status: 200 } as {
  ok: boolean;
  status: number;
  error?: string;
};

vi.mock('@/lib/line-bot/webhook-client', () => ({
  deliverBatchWarning: () => Promise.resolve(deliverResult),
}));

vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: () =>
    Promise.resolve({
      from: () => ({
        select: () => ({
          is: () => ({
            lt: () => ({
              order: () => ({
                limit: () =>
                  Promise.resolve({ data: selectRows, error: null }),
              }),
            }),
          }),
        }),
        update: (patch: Record<string, unknown>) => {
          updateCalls.push(patch);
          return { eq: () => Promise.resolve({ error: null }) };
        },
      }),
    }),
}));

async function call(headers: Record<string, string> = {}) {
  const { NextRequest } = require('next/server');
  const r = new NextRequest(
    'http://localhost/api/cron/deliver-crm-events',
    { method: 'POST', headers }
  );
  const { POST } = await import(
    '@/app/api/cron/deliver-crm-events/route'
  );
  return POST(r);
}

describe('K4 deliver-crm-events cron', () => {
  beforeEach(() => {
    updateCalls = [];
    selectRows = [];
    deliverResult = { ok: true, status: 200 };
  });

  it('401 without the CRON_SECRET bearer', async () => {
    const res = await call();
    expect(res.status).toBe(401);
  });

  it('sets delivered_at on a 2xx', async () => {
    selectRows = [
      {
        id: 'e1',
        correlation_id: 'c1',
        batch_id: 'B-1',
        severity: 'warning',
        payload: { batch_code: 'B-AAAAAA' },
        attempts: 0,
        posted_at: new Date(Date.now() - 600000).toISOString(),
        last_attempt_at: null,
        delivered_at: null,
      },
    ];
    const res = await call({ authorization: 'Bearer cron-secret' });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.delivered).toBe(1);
    expect(updateCalls[0]).toHaveProperty('delivered_at');
    expect(updateCalls[0]).toHaveProperty('last_attempt_at');
  });

  it('increments attempts on a 5xx', async () => {
    deliverResult = { ok: false, status: 503, error: 'http_503' };
    selectRows = [
      {
        id: 'e1',
        correlation_id: 'c1',
        batch_id: 'B-1',
        severity: 'warning',
        payload: { batch_code: 'B-AAAAAA' },
        attempts: 2,
        posted_at: new Date(Date.now() - 600000).toISOString(),
        last_attempt_at: null,
        delivered_at: null,
      },
    ];
    const res = await call({ authorization: 'Bearer cron-secret' });
    await res.json();
    expect(updateCalls[0]).toMatchObject({ attempts: 3 });
    expect(updateCalls[0]).toHaveProperty('last_attempt_at');
  });

  it('dead-letters a permanent 4xx (non-429)', async () => {
    deliverResult = { ok: false, status: 400, error: 'http_400' };
    selectRows = [
      {
        id: 'e1',
        correlation_id: 'c1',
        batch_id: 'B-1',
        severity: 'warning',
        payload: { batch_code: 'B-AAAAAA' },
        attempts: 0,
        posted_at: new Date(Date.now() - 600000).toISOString(),
        last_attempt_at: null,
        delivered_at: null,
      },
    ];
    const res = await call({ authorization: 'Bearer cron-secret' });
    await res.json();
    expect(updateCalls[0]).toMatchObject({ attempts: 12 });
    expect(updateCalls[0]).toHaveProperty('last_attempt_at');
  });

  it('skips a row still inside its backoff window', async () => {
    selectRows = [
      {
        id: 'e1',
        correlation_id: 'c1',
        batch_id: 'B-1',
        severity: 'warning',
        payload: { batch_code: 'B-AAAAAA' },
        attempts: 5,
        posted_at: new Date().toISOString(), // just posted; 2^5 backoff not elapsed
        last_attempt_at: null,
        delivered_at: null,
      },
    ];
    const res = await call({ authorization: 'Bearer cron-secret' });
    const body = await res.json();
    expect(body.skipped).toBe(1);
    expect(updateCalls).toHaveLength(0);
  });

  it('skips a row whose last_attempt_at is recent even when posted_at is old', async () => {
    // Regression: the old code anchored solely to posted_at, so once
    // now > posted_at + 60 s every tick retried immediately. This test
    // puts last_attempt_at just now and expects the row to be skipped.
    deliverResult = { ok: false, status: 503, error: 'http_503' };
    const postedAtOld = new Date(Date.now() - 5 * 60 * 1000).toISOString(); // 5 min ago
    const lastAttemptJustNow = new Date(Date.now() - 1000).toISOString(); // 1 s ago
    selectRows = [
      {
        id: 'e2',
        correlation_id: 'c2',
        batch_id: 'B-2',
        severity: 'warning',
        payload: { batch_code: 'B-BBBBBB' },
        // attempts=3 → backoff = min(2^3, 60) = 8 s
        // last_attempt_at is 1 s ago → due in 7 s → must be skipped
        attempts: 3,
        posted_at: postedAtOld,
        last_attempt_at: lastAttemptJustNow,
        delivered_at: null,
      },
    ];
    const res = await call({ authorization: 'Bearer cron-secret' });
    const body = await res.json();
    expect(body.skipped).toBe(1);
    expect(updateCalls).toHaveLength(0);
  });

  it('retries a row once its last_attempt_at backoff window has elapsed', async () => {
    // Companion to the above: same attempt count but last_attempt_at is old
    // enough that the backoff window has passed — must NOT skip.
    deliverResult = { ok: false, status: 503, error: 'http_503' };
    const postedAtOld = new Date(Date.now() - 5 * 60 * 1000).toISOString(); // 5 min ago
    // attempts=3 → backoff = 8 s; last_attempt_at 30 s ago → window elapsed
    const lastAttemptElapsed = new Date(Date.now() - 30 * 1000).toISOString();
    selectRows = [
      {
        id: 'e3',
        correlation_id: 'c3',
        batch_id: 'B-3',
        severity: 'warning',
        payload: { batch_code: 'B-CCCCCC' },
        attempts: 3,
        posted_at: postedAtOld,
        last_attempt_at: lastAttemptElapsed,
        delivered_at: null,
      },
    ];
    const res = await call({ authorization: 'Bearer cron-secret' });
    const body = await res.json();
    expect(body.skipped).toBe(0);
    expect(body.retried).toBe(1);
    expect(updateCalls[0]).toMatchObject({ attempts: 4 });
    expect(updateCalls[0]).toHaveProperty('last_attempt_at');
  });
});
