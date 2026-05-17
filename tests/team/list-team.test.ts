import { describe, expect, it, vi, beforeEach } from 'vitest';

// MOCK-TO-PROD §3 regression guard: listTeam() must return the REAL nursery
// roster (nursery_members → auth.users via the service-role admin API),
// scoped to the caller's nursery and role-gated — never a static `TEAM`.

// Force the live path (the action short-circuits in mock mode).
vi.mock('@/lib/utils/mock-mode', () => ({ isMockMode: () => false }));

let scopeRole: string | null = 'owner';

vi.mock('@/lib/auth', () => ({
  currentNurseryScope: async () =>
    scopeRole
      ? { userId: 'u-owner', nurseryId: 'nursery-705', role: scopeRole }
      : null,
}));

// Two real members for nursery-705; a third row for a DIFFERENT nursery that
// must NOT leak into the result (the .eq('nursery_id', …) scope is asserted).
const MEMBER_ROWS = [
  { user_id: 'u-owner', role: 'owner', created_at: '2026-05-01T00:00:00Z' },
  { user_id: 'u-staff', role: 'counter_staff', created_at: '2026-05-17T00:00:00Z' },
];

let requestedNurseryId: string | null = null;

const USERS: Record<string, { email: string; user_metadata: Record<string, unknown> }> = {
  'u-owner': { email: 'e2e-test@example.com', user_metadata: { full_name: 'พิสูจน์ ข้อมูลจริง QA' } },
  'u-staff': { email: 'qa-uat-probe@gmail.com', user_metadata: {} },
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({}),
  createServiceClient: async () => ({
    from: (_table: string) => ({
      select: () => ({
        eq: (_col: string, val: string) => {
          requestedNurseryId = val;
          return {
            order: async () => ({ data: MEMBER_ROWS, error: null }),
          };
        },
      }),
    }),
    auth: {
      admin: {
        getUserById: async (id: string) => ({
          data: { user: USERS[id] ? { id, ...USERS[id] } : null },
          error: null,
        }),
      },
    },
  }),
}));

vi.mock('@/lib/billing/guard', () => ({
  requireActiveSubscription: async () => {},
}));

describe('fetchTeam — real nursery roster (MOCK-TO-PROD §3)', () => {
  beforeEach(() => {
    scopeRole = 'owner';
    requestedNurseryId = null;
    vi.resetModules();
  });

  it('returns the real members joined from auth.users, scoped to the caller nursery', async () => {
    const { fetchTeam } = await import(
      '@/app/[locale]/(dashboard)/settings/team/actions'
    );
    const team = await fetchTeam();

    expect(requestedNurseryId).toBe('nursery-705');
    expect(team).toHaveLength(2);

    // Member 1 — display name from user_metadata.full_name.
    expect(team[0].name).toBe('พิสูจน์ ข้อมูลจริง QA');
    expect(team[0].perm).toBe('owner');
    expect(team[0].role).toBe('เจ้าของโรงอนุบาล');

    // Member 2 — no metadata → email-local fallback (NOT a static literal).
    expect(team[1].name).toBe('qa-uat-probe');
    expect(team[1].perm).toBe('counter_staff');
    expect(team[1].role).toBe('เจ้าหน้าที่เคาน์เตอร์');

    // Hard proof this is not the old static mock TEAM.
    expect(team.map((m) => m.name)).not.toContain('นิภา ใจดี');
  });

  it('returns an empty roster when signed out (no scope)', async () => {
    scopeRole = null;
    const { fetchTeam } = await import(
      '@/app/[locale]/(dashboard)/settings/team/actions'
    );
    expect(await fetchTeam()).toEqual([]);
  });

  it('the browser facade listTeam() delegates to the real server action', async () => {
    const { listTeam } = await import('@/lib/api/supabase');
    const team = await listTeam();
    expect(team).toHaveLength(2);
    expect(team[0].name).toBe('พิสูจน์ ข้อมูลจริง QA');
  });
});
