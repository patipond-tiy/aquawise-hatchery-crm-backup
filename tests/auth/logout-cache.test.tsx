import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Story A4 AC#4 — clicking "ออกจากระบบ" must clear the TanStack Query cache
// before the session is torn down, so the next user on a shared device never
// sees the previous user's cached data. The real session teardown is the
// signOut server action (covered by tests/auth/signout.test.ts); here we
// assert the client wrapper evicts the cache.

vi.mock('@/app/actions/auth', () => ({
  // The form action is invoked by jsdom form submission; stub it so the
  // test only observes the cache-clear side effect.
  signOut: vi.fn(),
}));

import { LogoutButton } from '@/components/layout/logout-button';

describe('LogoutButton — A4 AC#4 cache clear', () => {
  it('clears the TanStack Query cache on submit', () => {
    const qc = new QueryClient();
    qc.setQueryData(['customers'], [{ id: 'c1' }]);
    qc.setQueryData(['batches'], [{ id: 'b1' }]);
    expect(qc.getQueryData(['customers'])).toBeDefined();

    const clearSpy = vi.spyOn(qc, 'clear');

    render(
      <QueryClientProvider client={qc}>
        <LogoutButton collapsed={false} label="ออกจากระบบ" />
      </QueryClientProvider>
    );

    fireEvent.submit(screen.getByText('ออกจากระบบ').closest('form')!);

    expect(clearSpy).toHaveBeenCalledOnce();
    expect(qc.getQueryData(['customers'])).toBeUndefined();
    expect(qc.getQueryData(['batches'])).toBeUndefined();
  });

  it('renders the logout label', () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <LogoutButton collapsed={false} label="ออกจากระบบ" />
      </QueryClientProvider>
    );
    expect(screen.getByText('ออกจากระบบ')).toBeInTheDocument();
  });
});
