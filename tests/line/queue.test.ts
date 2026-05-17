import { describe, it, expect, beforeEach, vi } from 'vitest';

// G3p / H1 / H4 — enqueue guards + worker status machine, with a mocked
// service-role Supabase client.

vi.mock('server-only', () => ({}));

type Row = Record<string, unknown>;

let customers: Row[] = [];
let events: Row[] = [];
let notif: Row | null = null;
let auditRows: Row[] = [];

function makeClient() {
  return {
    from(table: string) {
      const api: Record<string, unknown> = {};
      api.select = () => ({
        eq: (_c: string, _v: unknown) => ({
          maybeSingle: () => {
            if (table === 'customers')
              return Promise.resolve({ data: customers[0] ?? null });
            if (table === 'notification_settings')
              return Promise.resolve({ data: notif });
            return Promise.resolve({ data: null });
          },
        }),
        in: () => ({
          lte: () => ({
            order: () => ({
              limit: () =>
                Promise.resolve({
                  data: events.filter(
                    (e) =>
                      e.status === 'pending' || e.status === 'failed'
                  ),
                }),
            }),
          }),
        }),
        order: () => ({
          limit: () => Promise.resolve({ data: events }),
        }),
      });
      api.insert = (row: Row | Row[]) => {
        const rows = Array.isArray(row) ? row : [row];
        if (table === 'line_outbound_events') {
          for (const r of rows) {
            const dupe = events.find(
              (e) =>
                e.customer_id === r.customer_id &&
                e.template === r.template &&
                JSON.stringify((e.payload as Row)?.cycle_id) ===
                  JSON.stringify((r.payload as Row)?.cycle_id) &&
                ['pending', 'sending', 'sent'].includes(e.status as string)
            );
            if (dupe) {
              return {
                select: () => ({
                  single: () =>
                    Promise.resolve({
                      data: null,
                      error: { code: '23505', message: 'dup' },
                    }),
                }),
              };
            }
            const created = { id: `ev-${events.length + 1}`, ...r };
            events.push(created);
            return {
              select: () => ({
                single: () =>
                  Promise.resolve({ data: { id: created.id }, error: null }),
              }),
            };
          }
        }
        if (table === 'audit_log') {
          auditRows.push(rows[0]);
        }
        return Promise.resolve({ error: null });
      };
      api.update = (patch: Row) => ({
        eq: (_c: string, id: unknown) => {
          const ev = events.find((e) => e.id === id);
          if (ev) Object.assign(ev, patch);
          return Promise.resolve({ error: null });
        },
      });
      return api;
    },
  };
}

vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: () => Promise.resolve(makeClient()),
}));

beforeEach(() => {
  customers = [
    { id: 'c1', line_id: 'U_farm_1', nursery_id: 'n1' },
  ];
  events = [];
  notif = {
    restock: true,
    low_d30: true,
    disease: true,
    quiet_hours_start: '21:00:00',
    quiet_hours_end: '07:00:00',
  };
  auditRows = [];
  vi.resetModules();
});

describe('enqueueLineEvent', () => {
  it('rejects an unbound (line_id NULL) customer — fails closed', async () => {
    customers = [{ id: 'c1', line_id: null, nursery_id: 'n1' }];
    const { enqueueLineEvent } = await import('@/lib/line/queue');
    const r = await enqueueLineEvent({
      nurseryId: 'n1',
      customerId: 'c1',
      template: 'restock_reminder',
      payload: { nursery_id: 'n1', customer_id: 'c1', cycle_id: 'cy1' },
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/not linked|เชื่อมต่อ/);
  });

  it('rejects a malformed payload before insert', async () => {
    const { enqueueLineEvent } = await import('@/lib/line/queue');
    const r = await enqueueLineEvent({
      nurseryId: 'n1',
      customerId: 'c1',
      template: 'restock_reminder',
      payload: { nursery_id: 'n1', customer_id: 'c1' }, // no cycle_id
    });
    expect(r.ok).toBe(false);
  });

  it('inserts once, then dedupes the second identical cycle event', async () => {
    const { enqueueLineEvent } = await import('@/lib/line/queue');
    const p = {
      nurseryId: 'n1',
      customerId: 'c1',
      template: 'restock_reminder' as const,
      payload: { nursery_id: 'n1', customer_id: 'c1', cycle_id: 'cy1' },
    };
    const a = await enqueueLineEvent(p);
    const b = await enqueueLineEvent(p);
    expect(a).toEqual({ ok: true, eventId: 'ev-1', deduped: false });
    expect(b).toEqual({ ok: true, eventId: null, deduped: true });
    expect(events).toHaveLength(1);
  });
});

describe('drainOutboundQueue — H1 toggle + H4 quiet hours', () => {
  it('defers a non-manual event inside quiet hours (stays pending, scheduled_for moved)', async () => {
    events = [
      {
        id: 'e1',
        nursery_id: 'n1',
        customer_id: 'c1',
        line_user_id: 'U_farm_1',
        template: 'restock_reminder',
        payload: { cycle_id: 'cy1' },
        attempts: 0,
        is_manual: false,
        status: 'pending',
      },
    ];
    const { drainOutboundQueue } = await import('@/lib/line/queue');
    // 22:00 ICT = 15:00 UTC
    const s = await drainOutboundQueue(10, new Date('2026-05-17T15:00:00Z'));
    expect(s.deferred).toBe(1);
    expect(events[0].status).toBe('pending');
    expect(events[0].scheduled_for).toBeDefined();
  });

  it('high-severity disease bypasses quiet hours and logs an audit bypass', async () => {
    events = [
      {
        id: 'e2',
        nursery_id: 'n1',
        customer_id: 'c1',
        line_user_id: 'U_farm_1',
        template: 'disease_alert',
        payload: { alert_id: 'a1', severity: 'high' },
        attempts: 0,
        is_manual: false,
        status: 'pending',
      },
    ];
    const { drainOutboundQueue } = await import('@/lib/line/queue');
    const s = await drainOutboundQueue(10, new Date('2026-05-17T15:00:00Z'));
    expect(s.bypassed).toBe(1);
    expect(s.deferred).toBe(0);
    expect(
      auditRows.some((r) => r.action === 'quiet_hours_bypassed')
    ).toBe(true);
  });

  it('H1: restock toggle off leaves the event pending (skipped)', async () => {
    notif = {
      restock: false,
      low_d30: true,
      disease: true,
      quiet_hours_start: '21:00:00',
      quiet_hours_end: '07:00:00',
    };
    events = [
      {
        id: 'e3',
        nursery_id: 'n1',
        customer_id: 'c1',
        line_user_id: 'U_farm_1',
        template: 'restock_reminder',
        payload: { cycle_id: 'cy1' },
        attempts: 0,
        is_manual: false,
        status: 'pending',
      },
    ];
    const { drainOutboundQueue } = await import('@/lib/line/queue');
    // 12:00 ICT (outside quiet hours) so only the toggle gate applies.
    const s = await drainOutboundQueue(10, new Date('2026-05-17T05:00:00Z'));
    expect(s.sent).toBe(0);
    expect(s.deferred).toBe(0);
    expect(events[0].status).toBe('pending'); // skipped, re-processable
  });

  it('no LINE channel token → event reverts to pending (honest stub, no fake send)', async () => {
    delete process.env.LINE_CHANNEL_ACCESS_TOKEN;
    events = [
      {
        id: 'e4',
        nursery_id: 'n1',
        customer_id: 'c1',
        line_user_id: 'U_farm_1',
        template: 'restock_reminder',
        payload: { cycle_id: 'cy1' },
        attempts: 0,
        is_manual: true, // manual → bypass quiet hours
        status: 'pending',
      },
    ];
    const { drainOutboundQueue } = await import('@/lib/line/queue');
    const s = await drainOutboundQueue(10, new Date('2026-05-17T05:00:00Z'));
    expect(s.skipped_channel).toBe(true);
    expect(s.sent).toBe(0);
    expect(events[0].status).toBe('pending');
  });
});
