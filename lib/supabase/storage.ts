import 'server-only';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import {
  detectImageType,
  contentTypeFor,
  sanitizeExtension,
  hasUnsafeFilename,
  MAX_LOGO_BYTES,
} from '@/lib/supabase/file-validation';

const BUCKET = 'nursery-logos';
const PCR_BUCKET = 'pcr-certificates';

/**
 * Stable error codes for the logo upload. The settings UI maps these to
 * localized strings (Story S3 AC#6). The human-readable strings are also
 * stable so server logs / tests can assert on them.
 */
export type LogoUploadError =
  | 'too_large'
  | 'bad_filename'
  | 'invalid_image';

const ERROR_MESSAGE: Record<LogoUploadError, string> = {
  too_large: 'File too large',
  bad_filename: 'Bad filename',
  invalid_image: 'Invalid image',
};

export async function uploadNurseryLogo(
  nurseryId: string,
  file: File
): Promise<
  | { ok: true; url: string }
  | { ok: false; error: string; code: LogoUploadError }
> {
  // Story S3 — all checks run SERVER-SIDE before the upload begins. Client
  // checks can be bypassed; `file.type` is attacker-controlled and never
  // trusted (we derive Content-Type from the detected magic bytes instead).

  // AC#3 — size cap (before any byte read / network call)
  if (file.size > MAX_LOGO_BYTES) {
    return { ok: false, error: ERROR_MESSAGE.too_large, code: 'too_large' };
  }

  // AC#2 — reject path-traversal / control-char filenames outright
  if (hasUnsafeFilename(file.name)) {
    return { ok: false, error: ERROR_MESSAGE.bad_filename, code: 'bad_filename' };
  }
  const safeExt = sanitizeExtension(file.name);
  if (!safeExt) {
    return { ok: false, error: ERROR_MESSAGE.bad_filename, code: 'bad_filename' };
  }

  // AC#1/#4 — magic-byte detection; Content-Type derived from detection,
  // never from the client-asserted file.type
  const detected = await detectImageType(file);
  if (!detected) {
    return { ok: false, error: ERROR_MESSAGE.invalid_image, code: 'invalid_image' };
  }

  const supabase = await createClient();
  const path = `${nurseryId}/logo.${safeExt}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      upsert: true,
      contentType: contentTypeFor(detected),
    });

  if (error) return { ok: false, error: error.message, code: 'invalid_image' };

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
