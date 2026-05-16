'use client';

import { useQueryClient } from '@tanstack/react-query';
import { signOut } from '@/app/actions/auth';
import { Icon } from '@/components/aw/icon';

/**
 * Sign-out control (Story A4). The real session teardown is the `signOut`
 * server action (`supabase.auth.signOut()` in live mode, redirect-only in
 * mock mode). Before the server action runs we clear the TanStack Query
 * cache so the next user on a shared device never sees the previous user's
 * cached data (A4 AC#4).
 */
export function LogoutButton({
  collapsed,
  label,
}: {
  collapsed: boolean;
  label: string;
}) {
  const queryClient = useQueryClient();

  return (
    <form
      action={signOut}
      onSubmit={() => {
        // Evict all cached query data before the session is torn down.
        queryClient.clear();
      }}
    >
      <button
        type="submit"
        title={collapsed ? label : undefined}
        className="flex items-center rounded-[var(--radius)] min-h-[50px] bg-transparent border-0 cursor-pointer font-semibold text-base"
        style={{
          color: 'var(--color-ink)',
          gap: collapsed ? 0 : 14,
          padding: collapsed ? '14px 0' : '14px 16px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          textAlign: 'left',
          width: '100%',
        }}
      >
        <Icon name="out" size={22} />
        {!collapsed && <span className="whitespace-nowrap">{label}</span>}
      </button>
    </form>
  );
}
