// @vitest-environment node
//
// Story A6 — LINE Login → Supabase bridge (D-007). Covers the five D-007
// conditions: CSRF state mismatch, replay/bad-nonce, bad iss/aud, the
// identity-link idempotency (returning LINE sub reuses the same auth user),
// and the absent-email synthetic-address path (AC #7).

import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/lib/utils/mock-mode', () => ({ isMockMode: () => false }));

const bootstrapNursery = vi.fn().mockResolvedValue(undefined);
vi.mock('@/lib/auth/bootstrap', () => ({
  bootstrapNursery: (id: string) => bootstrapNursery(id),
}));

// ---- service-role + SSR Supabase client doubles ------------------------
let identityRow: { user_id: string } | null = null;
let listUsersResult: { users: Array<{ id: string; email: string | null }> };
const createdUsers: Array<{ email: string }> = [];
const upserted: Array<Record<string, unknown>> = [];
const verifyOtp = vi.fn().mockResolvedValue({ error: null });

function serviceClient() {
  return {
    from: (table: string) => {
      if (table === 'line_identities') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () =>
                Promise.resolve({ data: identityRow, error: null }),
            }),
          }),
          upsert: (row: Record<string, unknown>) => {
            upserted.push(row);
            return Promise.resolve({ error: null });
          },
        };
      }
      throw new Error(`unexpected table ${table}`);
    },
    auth: {
      admin: {
        listUsers: () => Promise.resolve({ data: listUsersResult }),
        createUser: ({ email }: { email: string }) => {
          createdUsers.push({ email });
          return Promise.resolve({
            data: { user: { id: `new-${createdUsers.length}`, email } },
            error: null,
          });
        },
        generateLink: () =>
          Promise.resolve({
            data: { properties: { hashed_token: 'hashed-otp' } },
            error: null,
          }),
      },
    },
  };
}

vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: () => Promise.resolve(serviceClient()),
  createClient: () =>
    Promise.resolve({ auth: { verifyOtp: (a: unknown) => verifyOtp(a) } }),
}));

import { GET } from '@/app/auth/line/callback/route';

const CHANNEL_ID = '1234567890';
process.env.LINE_LOGIN_CHANNEL_ID = CHANNEL_ID;
process.env.LINE_LOGIN_CHANNEL_SECRET = 'secret';

type ReqOpts = {
  code?: string | null;
  state?: string | null;
  cookieState?: string | null;
  cookieNonce?: string | null;
};

function makeRequest(o: ReqOpts) {
  const url = new URL('https://app.test/auth/line/callback');
  if (o.code !== null) url.searchParams.set('code', o.code ?? 'good-code');
  if (o.state !== null) url.searchParams.set('state', o.state ?? 'STATE123');
  const cookies = new Map<string, { value: string }>();
  if (o.cookieState !== null)
    cookies.set('line_oauth_state', { value: o.cookieState ?? 'STATE123' });
  if (o.cookieNonce !== null)
    cookies.set('line_oauth_nonce', { value: o.cookieNonce ?? 'NONCE123' });
  return {
    url: url.toString(),
    headers: new Headers({ 'x-forwarded-proto': 'https', 'x-forwarded-host': 'app.test' }),
    cookies: { get: (n: string) => cookies.get(n) },
  } as unknown as Parameters<typeof GET>[0];
}

function mockLineFetch(opts: {
  tokenOk?: boolean;
  verifyOk?: boolean;
  claims?: Record<string, unknown>;
}) {
  const claims = opts.claims ?? {
    iss: 'https://access.line.me',
    aud: CHANNEL_ID,
    exp: Math.floor(Date.now() / 1000) + 600,
    nonce: 'NONCE123',
    sub: 'Uline_sub_1',
    email: 'farmer@example.com',
    name: 'P Pong',
  };
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string) => {
      if (input.includes('/oauth2/v2.1/token')) {
        return {
          ok: opts.tokenOk ?? true,
          json: async () => ({ id_token: 'id.jwt.token' }),
        };
      }
      if (input.includes('/oauth2/v2.1/verify')) {
        return { ok: opts.verifyOk ?? true, json: async () => claims };
      }
      throw new Error(`unexpected fetch ${input}`);
    })
  );
}

function redirectLocation(res: Awaited<ReturnType<typeof GET>>): string {
  return res.headers.get('location') ?? '';
}

describe('A6 LINE bridge — /auth/line/callback', () => {
  beforeEach(() => {
    identityRow = null;
    listUsersResult = { users: [] };
    createdUsers.length = 0;
    upserted.length = 0;
    bootstrapNursery.mockClear();
    verifyOtp.mockClear();
  });
  afterEach(() => vi.unstubAllGlobals());

  it('rejects a state/cookie mismatch (CSRF) with opaque error', async () => {
    mockLineFetch({});
    const res = await GET(
      makeRequest({ state: 'ATTACKER', cookieState: 'STATE123' })
    );
    expect(redirectLocation(res)).toContain('/th/login?error=line_failed');
    expect(createdUsers).toHaveLength(0);
  });

  it('rejects a replayed/forged nonce (id_token nonce ≠ cookie)', async () => {
    mockLineFetch({
      claims: {
        iss: 'https://access.line.me',
        aud: CHANNEL_ID,
        exp: Math.floor(Date.now() / 1000) + 600,
        nonce: 'OLD_REPLAYED_NONCE',
        sub: 'Uline_sub_1',
      },
    });
    const res = await GET(makeRequest({ cookieNonce: 'FRESH_NONCE' }));
    expect(redirectLocation(res)).toContain('error=line_failed');
    expect(createdUsers).toHaveLength(0);
  });

  it('rejects a bad issuer / audience id_token', async () => {
    mockLineFetch({
      claims: {
        iss: 'https://evil.example',
        aud: CHANNEL_ID,
        exp: Math.floor(Date.now() / 1000) + 600,
        nonce: 'NONCE123',
        sub: 'Uline_sub_1',
      },
    });
    const res = await GET(makeRequest({}));
    expect(redirectLocation(res)).toContain('error=line_failed');

    mockLineFetch({
      claims: {
        iss: 'https://access.line.me',
        aud: 'wrong-channel',
        exp: Math.floor(Date.now() / 1000) + 600,
        nonce: 'NONCE123',
        sub: 'Uline_sub_1',
      },
    });
    const res2 = await GET(makeRequest({}));
    expect(redirectLocation(res2)).toContain('error=line_failed');
  });

  it('happy path: new LINE user → creates user, links identity, mints session, /th', async () => {
    mockLineFetch({});
    const res = await GET(makeRequest({}));
    expect(createdUsers).toHaveLength(1);
    expect(createdUsers[0].email).toBe('farmer@example.com');
    expect(upserted[0]).toMatchObject({
      line_sub: 'Uline_sub_1',
      email_at_link: 'farmer@example.com',
    });
    expect(verifyOtp).toHaveBeenCalledOnce();
    expect(bootstrapNursery).toHaveBeenCalledWith('new-1');
    expect(redirectLocation(res)).toBe('https://app.test/th');
    // No token/PII in the redirect.
    expect(redirectLocation(res)).not.toContain('id.jwt.token');
  });

  it('identity idempotency: returning LINE sub reuses the existing auth user', async () => {
    identityRow = { user_id: 'existing-user-9' };
    mockLineFetch({});
    const res = await GET(makeRequest({}));
    expect(createdUsers).toHaveLength(0); // no duplicate auth user
    expect(bootstrapNursery).toHaveBeenCalledWith('existing-user-9');
    expect(redirectLocation(res)).toBe('https://app.test/th');
  });

  it('absent LINE email → synthetic reserved address, never duplicated', async () => {
    mockLineFetch({
      claims: {
        iss: 'https://access.line.me',
        aud: CHANNEL_ID,
        exp: Math.floor(Date.now() / 1000) + 600,
        nonce: 'NONCE123',
        sub: 'Uline_no_email',
      },
    });
    const res = await GET(makeRequest({}));
    expect(createdUsers[0].email).toBe('line_Uline_no_email@line.nursery.local');
    expect(upserted[0]).toMatchObject({
      line_sub: 'Uline_no_email',
      email_at_link: null,
    });
    expect(redirectLocation(res)).toBe('https://app.test/th');
  });

  it('links to an existing email account instead of duplicating (Google/magic-link convergence)', async () => {
    listUsersResult = {
      users: [{ id: 'google-user-3', email: 'farmer@example.com' }],
    };
    mockLineFetch({});
    const res = await GET(makeRequest({}));
    expect(createdUsers).toHaveLength(0);
    expect(upserted[0]).toMatchObject({ user_id: 'google-user-3' });
    expect(bootstrapNursery).toHaveBeenCalledWith('google-user-3');
    expect(redirectLocation(res)).toBe('https://app.test/th');
  });
});
