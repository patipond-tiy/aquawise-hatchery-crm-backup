import { describe, expect, it, vi, beforeEach } from 'vitest';

// Story X1 — dead-letter retry / resolve / bulk server actions.
// Force live path (mock mode short-circuits to { ok: true }).
vi.mock('@/lib/utils/mock-mode', () => ({ isMockMode: () => false }));

let scopeRole = 'owner';
vi.mock('@/lib/auth', () => ({
  currentNurseryScope: async () => ({
    userId: 'u-owner',
    nurseryId: 'nursery-A',
    role: scopeRole,
  }),
}));

const auditCalls: { action: string; payload: unknown }[] = [];
vi.mock('@/lib/audit', () => ({
  writeAuditLog: async (action: string, payload: unknown) => {
    auditCalls.push({ action, payload });
  },
}));

// Per-event store keyed by id → its nursery + attempts + status.
const rows: Record<
  string,
  { nursery_id: string; attempts: number; status: string }
> = {};
const updates: { id: string; patch: Record<string, unknown> }[] = [];

function makeQuery(table: string) {
  // Chainable stub. Filters accumulate via .eq()/.in(); the terminal is
  // either .maybeSingle() (select) or awaiting the builder (update / bulk
  // select). An .update() resolves against the accumulated filters when the
  // builder is awaited.
  const filters: Record<string, string> = {};
  let inIds: string[] | null = null;
  let mode: 'select' | 'update' = 'select';
  let patch: Record<string, unknown> = {};

  const builder: Record<string, unknown> = {};
  builder.select = () => builder;
  builder.update = (p: Record<string, unknown>) => {
    mode = 'update';
    patch = p;
    return builder;
  };
  builder.in = (_c: string, ids: string[]) => {
    inIds = ids;
    return builder;
  };
  builder.eq = (col: string, val: string) => {
    filters[col] = val;
    return builder;
  };
  builder.maybeSingle = async () => {
    const id = filters.id;
    if (!id || !rows[id]) return { data: null };
    if (filters.nursery_id && rows[id].nursery_id !== filters.nursery_id)
      return { data: null };
    return {
      data: {
        id,
        nursery_id: rows[id].nursery_id,
        attempts: rows[id].attempts,
        status: rows[id].status,
      },
    };
  };
  // Awaiting the builder = terminal for update + bulk-select.
  builder.then = (
    resolve: (v: { data?: { id: string }[]; error: null }) => void
  ) => {
    if (mode === 'update') {
      const id = filters.id;
      if (
        id &&
        rows[id] &&
        (!filters.nursery_id || rows[id].nursery_id === filters.nursery_id)
      ) {
        updates.push({ id, patch });
        Object.assign(rows[id], patch);
      }
      resolve({ error: null });
      return;
    }
    // bulk select(...).in(ids).eq(nursery).eq(status)
    const ids = inIds ?? [];
    const data = ids
      .filter(
        (i) =>
          rows[i] &&
          (!filters.nursery_id || rows[i].nursery_id === filters.nursery_id) &&
          (!filters.status || rows[i].status === filters.status)
      )
      .map((i) => ({ id: i }));
    resolve({ data, error: null });
  };
  void table;
  return builder;
}

// X1 dead-letter actions MUST use the SERVICE-ROLE client: line_outbound_events
// has no nursery-staff UPDATE RLS policy (migration 006), so the user-scoped
// client's status UPDATE is silently RLS-denied. The query stub is therefore
// wired to createServiceClient; createClient is left a bare vi.fn() so any
// regression that reverts an action back to the user client fails here
// (undefined.from(...) throws → tests red).
vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: vi.fn(async () => ({
    from: (t: string) => makeQuery(t),
  })),
  createClient: vi.fn(),
}));

import {
  retryDeadEvent,
  resolveDeadEvent,
  retryDeadEventsBulk,
} from '@/app/[locale]/(dashboard)/settings/messaging-failures/actions';

beforeEach(() => {
  scopeRole = 'owner';
  auditCalls.length = 0;
  updates.length = 0;
  for (const k of Object.keys(rows)) delete rows[k];
  rows['e1'] = { nursery_id: 'nursery-A', attempts: 5, status: 'dead' };
  rows['e2'] = { nursery_id: 'nursery-A', attempts: 5, status: 'dead' };
  rows['eX'] = { nursery_id: 'nursery-B', attempts: 5, status: 'dead' };
});

describe('X1 dead-letter actions', () => {
  it('retryDeadEvent resets status to pending and increments attempts', async () => {
    const r = await retryDeadEvent('e1');
    expect(r.ok).toBe(true);
    expect(rows['e1'].status).toBe('pending');
    expect(rows['e1'].attempts).toBe(6);
  });

  it('retryDeadEvent writes a dead_letter_retry audit row', async () => {
    await retryDeadEvent('e1');
    expect(auditCalls).toHaveLength(1);
    expect(auditCalls[0].action).toBe('dead_letter_retry');
  });

  it('resolveDeadEvent sets status=resolved + dead_letter_resolved audit', async () => {
    const r = await resolveDeadEvent('e1');
    expect(r.ok).toBe(true);
    expect(rows['e1'].status).toBe('resolved');
    expect(auditCalls[0].action).toBe('dead_letter_resolved');
  });

  it('retryDeadEventsBulk([e1,e2]) produces 2 audit rows, not 1', async () => {
    const r = await retryDeadEventsBulk(['e1', 'e2']);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.count).toBe(2);
    expect(auditCalls.filter((a) => a.action === 'dead_letter_retry')).toHaveLength(
      2
    );
  });

  it('cross-tenant: nursery-A owner cannot retry a nursery-B event', async () => {
    const r = await retryDeadEvent('eX');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe('not_found');
    expect(rows['eX'].status).toBe('dead'); // untouched
  });

  it('non-owner (counter_staff) is forbidden', async () => {
    scopeRole = 'counter_staff';
    const r = await retryDeadEvent('e1');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe('forbidden');
  });

  it('bulk retry only touches this nursery’s dead events (cross-tenant skip)', async () => {
    const r = await retryDeadEventsBulk(['e1', 'eX']);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.count).toBe(1); // eX (nursery-B) excluded
    expect(rows['eX'].status).toBe('dead');
  });
});
