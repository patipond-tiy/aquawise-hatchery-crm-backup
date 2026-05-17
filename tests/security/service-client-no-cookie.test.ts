import { describe, expect, it, vi, beforeEach } from 'vitest';

// UAT K4c regression — createServiceClient() was built with @supabase/ssr
// `createServerClient` AND the request cookie store. When called from an
// authenticated dashboard server action the ssr client picked up the user's
// `sb-*-auth-token` cookie and sent that user's JWT as the PostgREST bearer,
// silently downgrading the effective Postgres role from `service_role` to
// `authenticated`. RLS then rejected service-role writes (crm_event_log
// INSERT in K4 publishBatchWarning failed with "new row violates row-level
// security policy").
//
// The fix: createServiceClient() must use a plain @supabase/supabase-js
// client with the service-role key and NO cookie/session adoption, so it
// always authenticates as `service_role` regardless of any ambient session.

const ssrCreate = vi.fn((..._a: unknown[]) => ({ __kind: 'ssr' }));
const jsCreate = vi.fn((..._a: unknown[]) => ({ __kind: 'supabase-js' }));
const cookieStore = { getAll: vi.fn(() => []), set: vi.fn() };

vi.mock('@supabase/ssr', () => ({
  createServerClient: (...a: unknown[]) => ssrCreate(...a),
}));
vi.mock('@supabase/supabase-js', () => ({
  createClient: (...a: unknown[]) => jsCreate(...a),
}));
vi.mock('next/headers', () => ({
  cookies: async () => cookieStore,
}));

describe('K4c — createServiceClient never adopts the request cookie session', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
  });

  it('uses the plain @supabase/supabase-js client (not the ssr cookie client)', async () => {
    const { createServiceClient } = await import('@/lib/supabase/server');
    const client = await createServiceClient();

    expect(jsCreate).toHaveBeenCalledTimes(1);
    expect(ssrCreate).not.toHaveBeenCalled();
    expect((client as unknown as { __kind: string }).__kind).toBe(
      'supabase-js'
    );
  });

  it('passes the service-role key and disables session persistence', async () => {
    const { createServiceClient } = await import('@/lib/supabase/server');
    await createServiceClient();

    const [url, key, opts] = jsCreate.mock.calls[0] as unknown as [
      string,
      string,
      { auth?: Record<string, unknown> },
    ];
    expect(url).toBe('https://example.supabase.co');
    expect(key).toBe('service-role-key');
    expect(opts?.auth?.persistSession).toBe(false);
    expect(opts?.auth?.autoRefreshToken).toBe(false);
  });

  it('never reads the request cookie store (no session bleed-through)', async () => {
    const { createServiceClient } = await import('@/lib/supabase/server');
    await createServiceClient();

    // The whole bug class is the service client touching request cookies.
    expect(cookieStore.getAll).not.toHaveBeenCalled();
  });
});
