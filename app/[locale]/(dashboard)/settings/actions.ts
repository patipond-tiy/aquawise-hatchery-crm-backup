'use server';

import { createClient } from '@/lib/supabase/server';
import { uploadHatcheryLogo } from '@/lib/supabase/storage';
import { requireActiveSubscription } from '@/lib/billing/guard';
import { isMockMode } from '@/lib/utils/mock-mode';

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

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Not authenticated' };

  const { data: membership } = await supabase
    .from('hatchery_members')
    .select('hatchery_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  if (!membership) return { ok: false, error: 'No hatchery membership found' };

  const { hatchery_id, role } = membership;

  const { error: hatcheryError } = await supabase
    .from('hatcheries')
    .update({
      name: fields.name,
      name_en: fields.name_en || null,
      location: fields.location || null,
      location_en: fields.location_en || null,
    })
    .eq('id', hatchery_id);

  if (hatcheryError) return { ok: false, error: hatcheryError.message };

  let logo_url: string | undefined;
  if (logoFile && role === 'owner') {
    const result = await uploadHatcheryLogo(hatchery_id, logoFile);
    if (!result.ok) return { ok: false, error: result.error };
    logo_url = result.url;
  }

  const { error: brandError } = await supabase
    .from('hatchery_brand')
    .upsert(
      {
        hatchery_id,
        display_name_th: fields.display_name_th,
        display_name_en: fields.display_name_en,
        brand_color: fields.brand_color,
        ...(logo_url ? { logo_url } : {}),
      },
      { onConflict: 'hatchery_id' }
    );

  if (brandError) return { ok: false, error: brandError.message };

  return { ok: true };
}
