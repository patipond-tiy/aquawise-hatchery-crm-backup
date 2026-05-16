'use server';

import { createClient } from '@/lib/supabase/server';
import { uploadNurseryLogo } from '@/lib/supabase/storage';
import { requireActiveSubscription } from '@/lib/billing/guard';
import { currentNurseryScope } from '@/lib/auth';
import { can } from '@/lib/rbac';
import { isMockMode } from '@/lib/utils/mock-mode';
import { writeAuditLog } from '@/lib/audit';
import type { RestockThresholds } from '@/lib/types';

export interface ProfileFields {
  name: string;
  name_en: string;
  location: string;
  location_en: string;
  display_name_th: string;
  display_name_en: string;
  brand_color: string;
  logoFile?: File | null;
}

export async function updateProfile(
  fields: Omit<ProfileFields, 'logoFile'>,
  logoFile?: File | null
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (isMockMode()) {
    return { ok: false, error: 'โหมดเดโม — ยังไม่บันทึกจริง' };
  }
  await requireActiveSubscription();

  // Canonical server-side tenant scope (see lib/auth.ts) — do not re-inline
  // the nursery_members lookup here.
  const scope = await currentNurseryScope();
  if (!scope) return { ok: false, error: 'No nursery membership found' };
  const { nurseryId: nursery_id, role } = scope;

  const supabase = await createClient();

  const { error: nurseryError } = await supabase
    .from('nurseries')
    .update({
      name: fields.name,
      name_en: fields.name_en || null,
      location: fields.location || null,
      location_en: fields.location_en || null,
    })
    .eq('id', nursery_id);

  if (nurseryError) return { ok: false, error: nurseryError.message };

  let logo_url: string | undefined;
  if (logoFile && can(role, 'settings:write')) {
    const result = await uploadNurseryLogo(nursery_id, logoFile);
    if (!result.ok) return { ok: false, error: result.error };
    logo_url = result.url;
  }

  const { error: brandError } = await supabase
    .from('nursery_brand')
    .upsert(
      {
        nursery_id,
        display_name_th: fields.display_name_th,
        display_name_en: fields.display_name_en,
        brand_color: fields.brand_color,
        ...(logo_url ? { logo_url } : {}),
      },
      { onConflict: 'nursery_id' }
    );

  if (brandError) return { ok: false, error: brandError.message };

  return { ok: true };
}

/**
 * D1 — persist per-nursery restock urgency thresholds.
 *
 * Owner-only (`settings:write`). Validates `now <= week <= month`. Writes
 * `nurseries.restock_thresholds` jsonb under the caller's session (RLS
 * `nurseries_update` owner policy enforces tenant + role at the DB layer too)
 * and records an audit_log row. Mock mode no-ops gracefully.
 */
export async function updateRestockThresholdsAction(
  thresholds: RestockThresholds
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { now, week, month } = thresholds;
  if (
    !Number.isInteger(now) ||
    !Number.isInteger(week) ||
    !Number.isInteger(month) ||
    now < 0 ||
    !(now <= week && week <= month)
  ) {
    return {
      ok: false,
      error: 'ค่าต้องเรียงจากน้อยไปมาก: ด่วน ≤ สัปดาห์ ≤ เดือน',
    };
  }

  if (isMockMode()) {
    return { ok: false, error: 'โหมดเดโม — ยังไม่บันทึกจริง' };
  }

  await requireActiveSubscription();

  const scope = await currentNurseryScope();
  if (!scope) return { ok: false, error: 'No nursery membership found' };
  if (!can(scope.role, 'settings:write')) {
    return { ok: false, error: 'Forbidden' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('nurseries')
    .update({
      restock_thresholds: { now, week, month },
    } as never)
    .eq('id', scope.nurseryId);
  if (error) return { ok: false, error: error.message };

  await writeAuditLog('restock_thresholds.update', { now, week, month });
  return { ok: true };
}
