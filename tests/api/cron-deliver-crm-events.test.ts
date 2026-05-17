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
        delivered_at: null,
      },
    ];
    const res = await call({ authorization: 'Bearer cron-secret' });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.delivered).toBe(1);
    expect(updateCalls[0]).toHaveProperty('delivered_at');
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
        delivered_at: null,
      },
    ];
    const res = await call({ authorization: 'Bearer cron-secret' });
    await res.json();
    expect(updateCalls[0]).toMatchObject({ attempts: 3 });
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
        delivered_at: null,
      },
    ];
    const res = await call({ authorization: 'Bearer cron-secret' });
    await res.json();
    expect(updateCalls[0]).toMatchObject({ attempts: 12 });
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
        delivered_at: null,
      },
    ];
    const res = await call({ authorization: 'Bearer cron-secret' });
    const body = await res.json();
    expect(body.skipped).toBe(1);
    expect(updateCalls).toHaveLength(0);
  });
});
