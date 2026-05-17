import { describe, it, expect, vi } from 'vitest';

// G4 — cron evaluation helpers + auth gate.

vi.mock('server-only', () => ({}));

type Row = Record<string, unknown>;

function clientWith(opts: {
  notif: Row[];
  customers: Row[];
}) {
  return {
    from(table: string) {
      if (table === 'notification_settings') {
        return {
          select: () => ({
            eq: () => Promise.resolve({ data: opts.notif }),
          }),
        };
      }
      // customers
      return {
        select: () => ({
          not: () => Promise.resolve({ data: opts.customers }),
        }),
      };
    },
  } as never;
}

describe('evaluateRestockQueue', () => {
  it('enqueues only customers at restock_in ∈ {7,3,0} for restock-enabled nurseries', async () => {
    const { evaluateRestockQueue } = await import('@/lib/cron/restock');
    const events = await evaluateRestockQueue(
      clientWith({
        notif: [{ nursery_id: 'n1', restock: true }],
        customers: [
          {
            id: 'c1',
            nursery_id: 'n1',
            line_id: 'U1',
            customer_cycles: { restock_in: 7, d30: 80 },
          },
          {
            id: 'c2',
            nursery_id: 'n1',
            line_id: 'U2',
            customer_cycles: { restock_in: 5, d30: 70 }, // not a threshold
          },
          {
            id: 'c3',
            nursery_id: 'n1',
            line_id: 'U3',
            customer_cycles: { restock_in: 0, d30: 60 },
          },
        ],
      })
    );
    const ids = events.map((e) => e.customerId).sort();
    expect(ids).toEqual(['c1', 'c3']);
    expect(events[0].payload.cycle_id).toBeDefined();
  });

  it('returns zero events for a nursery with restock disabled', async () => {
    const { evaluateRestockQueue } = await import('@/lib/cron/restock');
    const events = await evaluateRestockQueue(
      clientWith({
        notif: [], // .eq('restock', true) returns nothing
        customers: [
          {
            id: 'c1',
            nursery_id: 'n1',
            line_id: 'U1',
            customer_cycles: { restock_in: 7 },
          },
        ],
      })
    );
    expect(events).toHaveLength(0);
  });

  it('skips customers with no bound line_id (filtered by query .not(line_id is null))', async () => {
    const { evaluateRestockQueue } = await import('@/lib/cron/restock');
    const events = await evaluateRestockQueue(
      clientWith({
        notif: [{ nursery_id: 'n1', restock: true }],
        customers: [
          {
            id: 'c1',
            nursery_id: 'n1',
            line_id: null,
            customer_cycles: { restock_in: 7 },
          },
        ],
      })
    );
    expect(events).toHaveLength(0);
  });
});

describe('cron route auth', () => {
  it('returns 401 without CRON_SECRET header', async () => {
    process.env.CRON_SECRET = 'secret-x';
    const { GET } = await import('@/app/api/cron/daily/route');
    const req = {
      headers: { get: () => null },
    } as unknown as import('next/server').NextRequest;
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});

describe('cron route mock-mode guard (G4 Task 4 / AC #1)', () => {
  it('short-circuits with a mock response and skip log when USE_MOCK is on', async () => {
    process.env.CRON_SECRET = 'secret-x';
    const prevPub = process.env.NEXT_PUBLIC_USE_MOCK;
    const prevSrv = process.env.USE_MOCK;
    process.env.NEXT_PUBLIC_USE_MOCK = 'true';
    process.env.USE_MOCK = 'true';
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    try {
      const { GET } = await import('@/app/api/cron/daily/route');
      const req = {
        headers: {
          get: (k: string) =>
            k === 'authorization' ? 'Bearer secret-x' : null,
        },
      } as unknown as import('next/server').NextRequest;
      const res = await GET(req);
      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        mock?: boolean;
        enqueued?: number;
      };
      expect(body.mock).toBe(true);
      expect(body.enqueued).toBe(0);
      expect(
        logSpy.mock.calls.some((c) =>
          String(c[0]).includes('[mock] cron/daily skipped — mock mode')
        )
      ).toBe(true);
    } finally {
      logSpy.mockRestore();
      if (prevPub === undefined) delete process.env.NEXT_PUBLIC_USE_MOCK;
      else process.env.NEXT_PUBLIC_USE_MOCK = prevPub;
      if (prevSrv === undefined) delete process.env.USE_MOCK;
      else process.env.USE_MOCK = prevSrv;
    }
  });
});
