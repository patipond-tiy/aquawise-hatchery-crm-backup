import 'server-only';
import { createClient, createServiceClient } from '@/lib/supabase/server';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const BUCKET = 'nursery-logos';
const PCR_BUCKET = 'pcr-certificates';

export async function uploadNurseryLogo(
  nurseryId: string,
  file: File
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { ok: false, error: `Invalid file type: ${file.type}. Allowed: jpeg, png, webp, gif` };
  }

  const supabase = await createClient();
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${nurseryId}/logo.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) return { ok: false, error: error.message };

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}

/**
 * Epic K K2 — sign the latest PCR certificate for a batch so a farmer can
 * fetch it without authenticating to Supabase. The `pcr-certificates` bucket
 * is PRIVATE (migration 019); we return a short-lived signed URL, never the
 * raw path. Service-role client (this is the service-to-service read API,
 * no user session). Returns null when the batch has no cert.
 */
export async function getSignedPcrCertUrl(
  batchId: string,
  ttlSeconds = 3600
): Promise<string | null> {
  const supabase = await createServiceClient();

  const { data: cert } = await supabase
    .from('batch_certs')
    .select('pdf_url')
    .eq('batch_id', batchId)
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!cert?.pdf_url) return null;

  // pdf_url may be a storage path or a full public URL (legacy). If it's a
  // bare path inside the bucket, sign it; if it's already an http(s) URL,
  // return it verbatim (older C4 rows wrote public URLs).
  if (/^https?:\/\//i.test(cert.pdf_url)) return cert.pdf_url;

  const objectPath = cert.pdf_url.replace(/^pcr-certificates\//, '');
  const { data: signed, error } = await supabase.storage
    .from(PCR_BUCKET)
    .createSignedUrl(objectPath, ttlSeconds);

  if (error || !signed?.signedUrl) return null;
  return signed.signedUrl;
}
