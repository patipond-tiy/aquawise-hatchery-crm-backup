import { describe, it, expect, vi, beforeEach } from 'vitest';

// vi.mock factories must NOT reference variables defined outside them (hoisting).
vi.mock('@/lib/supabase/storage', () => ({
  uploadHatcheryLogo: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

import { createClient } from '@/lib/supabase/server';
import { uploadHatcheryLogo } from '@/lib/supabase/storage';
import { updateProfile } from '@/app/[locale]/(dashboard)/settings/actions';

const mockUpsert = vi.fn();
const mockHatcheryEq = vi.fn(() => ({ error: null }));
const mockHatcheryUpdate = vi.fn(() => ({ eq: mockHatcheryEq }));
const mockMaybeSingle = vi.fn();

function makeClient() {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'uid-1' } } }),
    },
    from: vi.fn((table: string) => {
      if (table === 'hatchery_brand') return { upsert: mockUpsert };
      if (table === 'hatcheries') return { update: mockHatcheryUpdate };
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            limit: vi.fn(() => ({ maybeSingle: mockMaybeSingle })),
          })),
        })),
      };
    }),
  };
}

const BASE_FIELDS = {
  name: 'Test Hatchery',
  name_en: 'Test Hatchery EN',
  location: 'Bangkok',
  location_en: 'Bangkok EN',
  display_name_th: 'แฮทเชอรี่',
  display_name_en: 'Hatchery Brand',
  brand_color: '#FF0000',
};

describe('updateProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMaybeSingle.mockResolvedValue({
      data: { hatchery_id: 'hid-1', role: 'owner' },
      error: null,
    });
    mockHatcheryEq.mockReturnValue({ error: null });
    mockHatcheryUpdate.mockReturnValue({ eq: mockHatcheryEq });
    mockUpsert.mockResolvedValue({ error: null });
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeClient());
  });

  it('rejects a logo file with an invalid MIME type', async () => {
    const badFile = new File(['data'], 'logo.txt', { type: 'text/plain' });
    (uploadHatcheryLogo as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      error: 'Invalid file type: text/plain. Allowed: jpeg, png, webp, gif',
    });

    const result = await updateProfile(BASE_FIELDS, badFile);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/Invalid file type/);
    }
  });

  it('accepts a valid profile update without a logo', async () => {
    const result = await updateProfile(BASE_FIELDS, null);

    expect(result.ok).toBe(true);
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        hatchery_id: 'hid-1',
        display_name_th: BASE_FIELDS.display_name_th,
        brand_color: BASE_FIELDS.brand_color,
      }),
      { onConflict: 'hatchery_id' }
    );
  });

  it('includes logo_url in brand upsert when upload succeeds', async () => {
    const goodFile = new File(['img'], 'logo.png', { type: 'image/png' });
    (uploadHatcheryLogo as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      url: 'https://cdn.example.com/logo.png',
    });

    const result = await updateProfile(BASE_FIELDS, goodFile);

    expect(result.ok).toBe(true);
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ logo_url: 'https://cdn.example.com/logo.png' }),
      { onConflict: 'hatchery_id' }
    );
  });
});
