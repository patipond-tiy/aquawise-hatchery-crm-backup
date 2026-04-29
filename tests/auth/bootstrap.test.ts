import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use vi.fn() directly in the factory — no top-level vars referenced from factory.
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

import { createClient } from '@/lib/supabase/server';
import { bootstrapHatchery } from '@/lib/auth/bootstrap';

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

describe('bootstrapHatchery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRpc.mockResolvedValue({ error: null });
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeClient());
  });

  it('calls create_hatchery RPC for a new user (no existing membership)', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });

    await bootstrapHatchery('new-user-id');

    expect(mockRpc).toHaveBeenCalledOnce();
    expect(mockRpc).toHaveBeenCalledWith('create_hatchery', { p_name: 'My Hatchery' });
  });

  it('skips create_hatchery RPC for a returning user (membership exists)', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { hatchery_id: 'existing-hatchery-id' },
      error: null,
    });

    await bootstrapHatchery('existing-user-id');

    expect(mockRpc).not.toHaveBeenCalled();
  });

  it('throws when the RPC returns an error', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockRpc.mockResolvedValue({ error: { message: 'DB error' } });

    await expect(bootstrapHatchery('user-id')).rejects.toBeDefined();
  });
});
