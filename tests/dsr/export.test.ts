// @vitest-environment node
import { describe, expect, it, vi, beforeEach } from 'vitest';

// Story S7 — DSR export endpoint conforms to DSR-SPEC §3.1 / §5.

let mockUser: { id: string } | null = { id: 'user-1' };
let rateAllowed: boolean = true;
const auditInsert = vi.fn((_row: { action: string; [k: string]: unknown }) => ({
  error: null,
}));

function tableStub(rows: unknown[]) {
  // chainable .select(...).eq(...) → resolves to { data }
  const chain: Record<string, unknown> = {};
  chain.select = () => chain;
  chain.eq = () => Promise.resolve({ data: rows });
  return chain;
}

const seeded: Record<string, unknown[]> = {
  nursery_members: [{ nursery_id: 'n-1', role: 'owner', created_at: 't' }],
  team_invites: [],
  customer_callbacks: [],
  audit_log: [],
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: async () => ({ data: { user: mockUser } }) },
    rpc: async (fn: string) =>
      fn === 'dsr_rate_check'
        ? { data: rateAllowed, error: null }
        : { data: null, error: null },
    from: (t: string) =>
      t === 'audit_log'
        ? { ...tableStub(seeded.audit_log), insert: auditInsert }
        : tableStub(seeded[t] ?? []),
  })),
  createServiceClient: vi.fn(),
}));

async function call() {
  const { NextRequest } = require('next/server');
  const r = new NextRequest('http://localhost/api/dsr/export');
  const { GET } = await import('@/app/api/dsr/export/route');
  return GET(r);
}

beforeEach(() => {
  vi.clearAllMocks();
  mockUser = { id: 'user-1' };
  rateAllowed = true;
  seeded.nursery_members = [
    { nursery_id: 'n-1', role: 'owner', created_at: 't' },
  ];
});

describe('S7 GET /api/dsr/export', () => {
  it('401 when unauthenticated', async () => {
    mockUser = null;
    const res = await call();
    expect(res.status).toBe(401);
  });

  it('429 when rate-limited (DSR-SPEC §5)', async () => {
    rateAllowed = false;
    const res = await call();
    expect(res.status).toBe(429);
  });

  it('200 with the spec-shaped export document + audit row written', async () => {
    const res = await call();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.source_repo).toBe('nursery-crm');
    expect(body.subject.auth_uid).toBe('user-1');
    expect(Array.isArray(body.records)).toBe(true);
    expect(body.retained_for_legal_reason.length).toBeGreaterThan(0);
    // DSR-SPEC §5 — one audit_log row per DSR
    expect(auditInsert).toHaveBeenCalledTimes(1);
    expect(auditInsert.mock.calls[0][0].action).toBe('dsr.export');
  });

  it('404 when the repo holds no PII for the subject', async () => {
    seeded.nursery_members = [];
    const res = await call();
    expect(res.status).toBe(404);
  });
});
