// @vitest-environment node
import { describe, expect, it, vi, beforeEach } from 'vitest';

// Story S7 — anonymizeUser delegates to the SECURITY DEFINER RPC
// dsr_anonymize_user (migration 029) which retains financial + audit rows
// (DSR-SPEC §4). The helper is the typed app seam.

const rpc = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({ rpc })),
  createServiceClient: vi.fn(),
}));

import { anonymizeUser } from '@/lib/dsr/anonymize';

beforeEach(() => vi.clearAllMocks());

describe('S7 anonymizeUser', () => {
  it('rejects an empty userId without calling the RPC', async () => {
    const r = await anonymizeUser('');
    expect(r.ok).toBe(false);
    expect(rpc).not.toHaveBeenCalled();
  });

  it('calls dsr_anonymize_user with the subject uid and returns ok', async () => {
    rpc.mockResolvedValue({
      data: {
        anonymized_at: '2026-05-17T00:00:00Z',
        tables_affected: ['customer_callbacks', 'team_invites'],
        tables_retained_for_legal_reason: ['audit_log', 'subscription_events'],
      },
      error: null,
    });
    const r = await anonymizeUser('user-9');
    expect(rpc).toHaveBeenCalledWith('dsr_anonymize_user', {
      p_user: 'user-9',
    });
    expect(r.ok).toBe(true);
    // DSR-SPEC §4 — financial + audit retained, not in tables_affected
    const detail = r.detail as { tables_retained_for_legal_reason: string[] };
    expect(detail.tables_retained_for_legal_reason).toContain(
      'subscription_events'
    );
    expect(detail.tables_retained_for_legal_reason).toContain('audit_log');
  });

  it('surfaces an RPC error as { ok: false }', async () => {
    rpc.mockResolvedValue({ data: null, error: { message: 'boom' } });
    const r = await anonymizeUser('user-9');
    expect(r.ok).toBe(false);
    expect(r.error).toBe('boom');
  });
});
