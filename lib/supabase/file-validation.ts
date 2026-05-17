import 'server-only';

/**
 * Story S3 — server-side magic-byte image validation.
 *
 * Client-supplied `file.type` (Content-Type) is attacker-controlled and must
 * never be trusted. We read the first 12 bytes of the upload and match the
 * real file signature so an attacker cannot upload HTML / a polyglot file
 * disguised as an image and have it served from a public Storage bucket.
 *
 * Signatures (see docs/bmad/security.md §1):
 *   JPEG: FF D8 FF
 *   PNG:  89 50 4E 47 0D 0A 1A 0A
 *   GIF:  47 49 46 38 (37|39) 61            ("GIF87a" / "GIF89a")
 *   WebP: 52 49 46 46 ?? ?? ?? ?? 57 45 42 50  ("RIFF"...."WEBP")
 */

export type DetectedImageType = 'jpeg' | 'png' | 'webp' | 'gif';

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'] as const;

const MIME_BY_TYPE: Record<DetectedImageType, string> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
};

function startsWith(bytes: Uint8Array, sig: number[]): boolean {
  if (bytes.length < sig.length) return false;
  for (let i = 0; i < sig.length; i++) {
    if (bytes[i] !== sig[i]) return false;
  }
  return true;
}

/**
 * Read the first 12 bytes of `file` and return the detected image type, or
 * `null` if the magic bytes match no allowed image format.
 */
export async function detectImageType(
  file: File
): Promise<DetectedImageType | null> {
  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());

  // JPEG — FF D8 FF
  if (startsWith(header, [0xff, 0xd8, 0xff])) return 'jpeg';

  // PNG — 89 50 4E 47 0D 0A 1A 0A
  if (startsWith(header, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return 'png';
  }

  // GIF — "GIF87a" / "GIF89a"
  if (
    startsWith(header, [0x47, 0x49, 0x46, 0x38, 0x37, 0x61]) ||
    startsWith(header, [0x47, 0x49, 0x46, 0x38, 0x39, 0x61])
  ) {
    return 'gif';
  }

  // WebP — "RIFF" (0-3) .... "WEBP" (8-11)
  if (
    startsWith(header, [0x52, 0x49, 0x46, 0x46]) &&
    header.length >= 12 &&
    header[8] === 0x57 &&
    header[9] === 0x45 &&
    header[10] === 0x42 &&
    header[11] === 0x50
  ) {
    return 'webp';
  }

  return null;
}

export function contentTypeFor(type: DetectedImageType): string {
  return MIME_BY_TYPE[type];
}

/**
 * Sanitize a client-supplied filename to a safe extension on the whitelist.
 * Strips path-traversal / control / non-alphanumeric characters, then takes
 * the trailing extension. Returns `null` if the resulting extension is not
 * an allowed image extension.
 */
export function sanitizeExtension(filename: string): string | null {
  const cleaned = filename.replace(/[^a-zA-Z0-9.]/g, '');
  const ext = cleaned.split('.').pop()?.toLowerCase();
  if (!ext) return null;
  return (ALLOWED_EXTENSIONS as readonly string[]).includes(ext) ? ext : null;
}

/**
 * Returns true when the original filename contained path separators,
 * parent-directory traversal, or ASCII control characters (0x00–0x1F).
 * Used to surface a distinct "bad filename" error vs "invalid image".
 */
export function hasUnsafeFilename(filename: string): boolean {
  if (filename.includes('/') || filename.includes('\\')) return true;
  if (filename.includes('..')) return true;
  for (let i = 0; i < filename.length; i++) {
    if (filename.charCodeAt(i) <= 0x1f) return true;
  }
  return false;
}

export const MAX_LOGO_BYTES = 2_097_152; // 2 MB
