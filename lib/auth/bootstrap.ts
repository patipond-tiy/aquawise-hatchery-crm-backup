import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { isMockMode } from '@/lib/utils/mock-mode';

/**
 * Called once per user on first sign-in. Creates a hatcheries row +
 * hatchery_members(role='owner') + 30-day trial via the create_hatchery RPC.
 * Idempotent: if the user already has a membership nothing is written.
 * No-op in mock mode (no Supabase project provisioned yet).
 */
export async function bootstrapHatchery(userId: string): Promise<void> {
  if (isMockMode()) return;
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from('hatchery_members')
    .select('hatchery_id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();

  if (existing) return;

  const { error } = await supabase.rpc('create_hatchery', {
    p_name: 'My Hatchery',
  });

  if (error) {
    console.error('[bootstrap] create_hatchery failed:', error.message);
    throw error;
  }
}
