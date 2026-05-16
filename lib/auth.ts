import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/database.types';

type Role = Database['public']['Enums']['nursery_role'];

/**
 * Resolve the calling user's nursery scope from the cookie session.
 * Returns null in mock mode (no Supabase configured) — callers should
 * gracefully short-circuit.
 */
export async function currentNurseryScope(): Promise<{
  userId: string;
  nurseryId: string;
  role: Role;
} | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: membership } = await supabase
    .from('nursery_members')
    .select('nursery_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .single();
  if (!membership) return null;

  return {
    userId: user.id,
    nurseryId: membership.nursery_id,
    role: membership.role,
  };
}

/**
 * Convenience tenant-scope accessor: the calling user's `nursery_id` or null.
 *
 * This is the ONE canonical server-side tenant lookup. Do NOT re-inline the
 * `.from('nursery_members').select('nursery_id').eq('user_id', …).limit(1)`
 * idiom in server actions / RSC — call this (or `currentNurseryScope()` when
 * the role is also needed). See CLAUDE.md "Server-component data-fetching".
 */
export async function getCurrentTenantId(): Promise<string | null> {
  const scope = await currentNurseryScope();
  return scope?.nurseryId ?? null;
}
