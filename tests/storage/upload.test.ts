import { describe, it, expect, vi, beforeEach } from 'vitest';

// Story S3 — server-side magic-byte upload validation.
// Validation runs entirely before any Supabase call, so the rejection cases
// never reach the client. We mock the Supabase server client for the single
// happy-path case (valid PNG) where the upload actually proceeds.

const uploadFn = vi.fn();
const getPublicUrlFn = vi.fn(() => ({
  data: { publicUrl: 'https://example.test/n/logo.png' },
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    storage: {
      from: () => ({
        upload: uploadFn,
        getPublicUrl: getPublicUrlFn,
      }),
    },
  })),
  createServiceClient: vi.fn(),
}));

import { uploadNurseryLogo } from '@/lib/supabase/storage';

const NURSERY = '00000000-0000-0000-0000-000000000001';

function fileFrom(bytes: number[], name: string, type = 'image/png'): File {
  return new File([new Uint8Array(bytes)], name, { type });
}

const PNG_SIG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0];
const HTML_SIG = [0x3c, 0x21, 0x44, 0x4f, 0x43, 0x54, 0x59, 0x50, 0x45]; // <!DOCTYPE

beforeEach(() => {
  vi.clearAllMocks();
  uploadFn.mockResolvedValue({ error: null });
});

describe('uploadNurseryLogo — S3 server-side validation', () => {
  it('accepts a valid PNG (magic bytes 89 50 4E 47) and derives Content-Type from detection', async () => {
    // client lies about the type — we must NOT trust it
    const file = fileFrom(PNG_SIG, 'logo.png', 'text/html');
    const res = await uploadNurseryLogo(NURSERY, file);
    expect(res.ok).toBe(true);
    expect(uploadFn).toHaveBeenCalledTimes(1);
    const opts = uploadFn.mock.calls[0][2];
    // Content-Type comes from the detected magic bytes, never file.type
    expect(opts.contentType).toBe('image/png');
  });

  it('rejects an HTML body sent with Content-Type image/png ("Invalid image")', async () => {
    const file = fileFrom(HTML_SIG, 'logo.png', 'image/png');
    const res = await uploadNurseryLogo(NURSERY, file);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBe('Invalid image');
      expect(res.code).toBe('invalid_image');
    }
    expect(uploadFn).not.toHaveBeenCalled();
  });

  it('rejects a path-traversal filename ("Bad filename")', async () => {
    const file = fileFrom(PNG_SIG, '../../etc/logo.png', 'image/png');
    const res = await uploadNurseryLogo(NURSERY, file);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBe('Bad filename');
      expect(res.code).toBe('bad_filename');
    }
    expect(uploadFn).not.toHaveBeenCalled();
  });

  it('rejects an oversized file (>2 MB) before any byte read ("File too large")', async () => {
    // 3 MB of zeros — size check must short-circuit before magic-byte read
    const big = new File([new Uint8Array(3 * 1024 * 1024)], 'logo.png', {
      type: 'image/png',
    });
    const res = await uploadNurseryLogo(NURSERY, big);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBe('File too large');
      expect(res.code).toBe('too_large');
    }
    expect(uploadFn).not.toHaveBeenCalled();
  });

  it('rejects a disallowed extension even with valid image bytes', async () => {
    const file = fileFrom(PNG_SIG, 'logo.svg', 'image/svg+xml');
    const res = await uploadNurseryLogo(NURSERY, file);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.code).toBe('bad_filename');
  });
});
