import { describe, it, expect, vi } from 'vitest';

// Tests for app/actions/auth.ts P2.10 logout action.
// Verifies signOut() calls supabase.auth.signOut and redirects to /th/login.

vi.mock('server-only', () => ({}));

const mockSignOut = vi.fn().mockResolvedValue({ error: null });
const mockRedirect = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: () =>
    Promise.resolve({
      auth: { signOut: mockSignOut },
    }),
}));

vi.mock('next/navigation', () => ({
  redirect: (url: string) => mockRedirect(url),
}));

describe('signOut server action — P2.10', () => {
  it('calls supabase.auth.signOut()', async () => {
    const { signOut } = await import('@/app/actions/auth');
    try {
      await signOut();
    } catch {
      // redirect() throws in Next.js — that's expected behaviour
    }
    expect(mockSignOut).toHaveBeenCalledOnce();
  });

  it('redirects to /th/login after sign out', async () => {
    const { signOut } = await import('@/app/actions/auth');
    try {
      await signOut();
    } catch {
      // redirect() throws in Next.js — that's expected behaviour
    }
    expect(mockRedirect).toHaveBeenCalledWith('/th/login');
  });
});
