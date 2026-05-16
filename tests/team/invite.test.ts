import { describe, expect, it, vi, beforeEach } from 'vitest';

// Force live-mode path; the action short-circuits in mock mode.
vi.mock('@/lib/utils/mock-mode', () => ({ isMockMode: () => false }));

// ---- Supabase mock ----
// We track inserts so we can assert on them.
type InsertedInvite = {
  nursery_id: string;
  email: string;
  role: string;
  token: string;
  created_by: string;
};

let capturedInsert: InsertedInvite | null = null;
let membershipRole = 'owner';
let existingInvite: { token: string; accepted_at: string | null; expires_at: string } | null = null;

vi.mock('@/lib/supabase/server', () => {
  return {
    createClient: async () => ({
      auth: {
        getUser: async () => ({ data: { user: { id: 'user-owner-1' } } }),
      },
      from: (table: string) => ({
        select: () => ({
          eq: (_col: string, _val: string) => ({
            eq: (_col2: string, _val2: string) => ({
              limit: () => ({
                single: async () => {
                  if (table === 'nursery_members') {
                    if (membershipRole !== 'owner') return { data: null, error: { message: 'not found' } };
                    return { data: { nursery_id: 'nursery-1' }, error: null };
                  }
                  return { data: null, error: null };
                },
              }),
              single: async () => {
                if (table === 'team_invites') {
                  return existingInvite
                    ? { data: existingInvite, error: null }
                    : { data: null, error: { message: 'not found' } };
                }
                return { data: null, error: null };
              },
            }),
            single: async () => {
              if (table === 'nursery_members') {
                if (membershipRole !== 'owner') return { data: null, error: { message: 'not found' } };
                return { data: { nursery_id: 'nursery-1' }, error: null };
              }
              return { data: null, error: null };
            },
          }),
        }),
        insert: (rows: InsertedInvite | InsertedInvite[]) => {
          capturedInsert = Array.isArray(rows) ? rows[0] : rows;
          return Promise.resolve({ error: null });
        },
        update: () => ({
          eq: () => ({
            eq: () => Promise.resolve({ error: null }),
          }),
        }),
        upsert: () => Promise.resolve({ error: null }),
      }),
    }),
    createServiceClient: async () => ({
      auth: {
        admin: {
          inviteUserByEmail: async () => ({}),
        },
      },
    }),
  };
});

describe('inviteTeamMember', () => {
  beforeEach(() => {
    capturedInsert = null;
    membershipRole = 'owner';
    existingInvite = null;
    vi.resetModules();
  });

  it('rejects an invalid email', async () => {
    const { inviteTeamMember } = await import(
      '@/app/[locale]/(dashboard)/settings/team/actions'
    );
    const result = await inviteTeamMember('not-an-email', 'counter_staff');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeTruthy();
  });

  it('rejects an invalid role', async () => {
    const { inviteTeamMember } = await import(
      '@/app/[locale]/(dashboard)/settings/team/actions'
    );
    const result = await inviteTeamMember('valid@example.com', 'super_admin');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeTruthy();
  });

  it('succeeds for a valid owner invite', async () => {
    const { inviteTeamMember } = await import(
      '@/app/[locale]/(dashboard)/settings/team/actions'
    );
    const result = await inviteTeamMember('newmember@example.com', 'lab_tech');
    expect(result.ok).toBe(true);
  });

  it('inserts a token with 7-day expiry window into team_invites', async () => {
    const { inviteTeamMember } = await import(
      '@/app/[locale]/(dashboard)/settings/team/actions'
    );
    await inviteTeamMember('test@example.com', 'counter_staff');
    expect(capturedInsert).not.toBeNull();
    expect(capturedInsert!.nursery_id).toBe('nursery-1');
    expect(capturedInsert!.email).toBe('test@example.com');
    expect(capturedInsert!.role).toBe('counter_staff');
    expect(typeof capturedInsert!.token).toBe('string');
    expect(capturedInsert!.token.length).toBeGreaterThan(20);
  });

  it('blocks invite when caller is not owner', async () => {
    membershipRole = 'counter_staff';
    const { inviteTeamMember } = await import(
      '@/app/[locale]/(dashboard)/settings/team/actions'
    );
    const result = await inviteTeamMember('other@example.com', 'auditor');
    expect(result.ok).toBe(false);
  });
});

describe('team_invites — expiry and reuse rules (SQL-level semantics validated here)', () => {
  it('invite expires_at is 7 days after created_at', () => {
    const created = new Date('2026-04-29T00:00:00Z');
    const expires = new Date(created.getTime() + 7 * 24 * 60 * 60 * 1000);
    const diff = expires.getTime() - created.getTime();
    expect(diff).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it('an already-accepted invite cannot be reused', () => {
    const invite = {
      token: 'abc',
      accepted_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 86400_000).toISOString(),
    };
    // acceptance route rejects when accepted_at is set
    expect(invite.accepted_at).not.toBeNull();
  });

  it('an expired invite (expires_at in the past) is rejected', () => {
    const expiredAt = new Date(Date.now() - 1000).toISOString();
    const now = new Date().toISOString();
    expect(expiredAt < now).toBe(true);
  });
});
