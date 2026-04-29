import 'server-only';
import { createClient } from '@/lib/supabase/server';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const BUCKET = 'hatchery-logos';

export async function uploadHatcheryLogo(
  hatcheryId: string,
  file: File
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { ok: false, error: `Invalid file type: ${file.type}. Allowed: jpeg, png, webp, gif` };
  }

  const supabase = await createClient();
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${hatcheryId}/logo.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) return { ok: false, error: error.message };

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}
