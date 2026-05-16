'use server';

import type { ScorecardSettings } from '@/lib/types';
import type { Database, Json } from '@/lib/database.types';
import { isMockMode } from '@/lib/utils/mock-mode';
import { requireActiveSubscription } from '@/lib/billing/guard';
import { currentNurseryScope } from '@/lib/auth';
import { writeAuditLog } from '@/lib/audit';

type ScorecardUpdate =
  Database['public']['Tables']['scorecard_settings']['Update'];

/**
 * Reference server action for the server-fetch + mandatory-server-action
 * mutation convention (see CLAUDE.md "Server-component data-fetching").
 *
 * Mock mode delegates to the in-memory layer so click-through dev keeps
 * working. Live mode enforces the paywall, scopes to the caller's tenant,
 * persists, and records an audit_log row — the path client mutations
 * bypassed previously.
 */
export async function updateScorecardSettingsAction(
  patch: Partial<ScorecardSettings>
): Promise<ScorecardSettings> {
  if (isMockMode()) {
    const { updateScorecardSettings } = await import('@/lib/mock/api');
    return updateScorecardSettings(patch);
  }

  await requireActiveSubscription();

  const scope = await currentNurseryScope();
  if (!scope) throw new Error('No nursery scope for current user');

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  const dbPatch: ScorecardUpdate = {};
  if (patch.public !== undefined) dbPatch.public = patch.public;
  if (patch.showD30 !== undefined) dbPatch.show_d30 = patch.showD30;
  if (patch.showPCR !== undefined) dbPatch.show_pcr = patch.showPCR;
  if (patch.showRetention !== undefined)
    dbPatch.show_retention = patch.showRetention;
  if (patch.showVolume !== undefined) dbPatch.show_volume = patch.showVolume;
  if (patch.showReviews !== undefined)
    dbPatch.show_reviews = patch.showReviews;

  const { error } = await supabase
    .from('scorecard_settings')
    .update(dbPatch)
    .eq('nursery_id', scope.nurseryId);
  if (error) throw new Error(error.message);

  await writeAuditLog('scorecard_settings.update', patch as Json);

  const { data } = await supabase
    .from('scorecard_settings')
    .select(
      'public, show_d30, show_pcr, show_retention, show_volume, show_reviews'
    )
    .eq('nursery_id', scope.nurseryId)
    .limit(1)
    .single();

  return {
    public: data?.public ?? true,
    showD30: data?.show_d30 ?? true,
    showPCR: data?.show_pcr ?? true,
    showRetention: data?.show_retention ?? true,
    showVolume: data?.show_volume ?? true,
    showReviews: data?.show_reviews ?? false,
  };
}
