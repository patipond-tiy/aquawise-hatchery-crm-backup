import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { isMockMode } from '@/lib/utils/mock-mode';

/**
 * Called once per user on first sign-in. Creates a nurseries row +
 * nursery_members(role='owner') + 30-day trial via the create_nursery RPC.
 * Idempotent: if the user already has a membership nothing is written.
 * No-op in mock mode (no Supabase project provisioned yet).
 */
export async function bootstrapNursery(userId: string): Promise<void> {
  if (isMockMode()) return;
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from('nursery_members')
    .select('nursery_id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();

  if (existing) return;

  const { error } = await supabase.rpc('create_nursery', {
    p_name: 'My Nursery',
  });

  if (error) {
    console.error('[nursery-crm] create_nursery failed:', error.message);
    throw error;
  }
}
