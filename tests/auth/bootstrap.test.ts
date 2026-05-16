import { describe, it, expect, vi, beforeEach } from 'vitest';

// Force live-mode path; bootstrap is a no-op in mock mode.
vi.mock('@/lib/utils/mock-mode', () => ({ isMockMode: () => false }));

// Use vi.fn() directly in the factory — no top-level vars referenced from factory.
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

import { createClient } from '@/lib/supabase/server';
import { bootstrapNursery } from '@/lib/auth/bootstrap';

const mockRpc = vi.fn();
const mockMaybeSingle = vi.fn();

function makeClient() {
  return {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          limit: vi.fn(() => ({
            maybeSingle: mockMaybeSingle,
          })),
        })),
      })),
    })),
    rpc: mockRpc,
  };
}

describe('bootstrapNursery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRpc.mockResolvedValue({ error: null });
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeClient());
  });

  it('calls create_nursery RPC for a new user (no existing membership)', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });

    await bootstrapNursery('new-user-id');

    expect(mockRpc).toHaveBeenCalledOnce();
    expect(mockRpc).toHaveBeenCalledWith('create_nursery', { p_name: 'My Nursery' });
  });

  it('skips create_nursery RPC for a returning user (membership exists)', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { nursery_id: 'existing-nursery-id' },
      error: null,
    });

    await bootstrapNursery('existing-user-id');

    expect(mockRpc).not.toHaveBeenCalled();
  });

  it('throws when the RPC returns an error', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockRpc.mockResolvedValue({ error: { message: 'DB error' } });

    await expect(bootstrapNursery('user-id')).rejects.toBeDefined();
  });
});
