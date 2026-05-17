import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll inside Server Components is a no-op; that's expected when this
            // client is created from a RSC. The middleware handles cookie writes.
          }
        },
      },
    }
  );
}

// Service-role client. MUST NOT read the request cookie store: when this is
// called from an authenticated dashboard server action, the @supabase/ssr
// `createServerClient` would pick up the user's `sb-*-auth-token` cookie and
// send that user's JWT as the PostgREST bearer — silently downgrading the
// effective Postgres role from `service_role` to `authenticated` and causing
// RLS to reject service-role writes (e.g. crm_event_log INSERT in K4
// publishBatchWarning). A plain supabase-js client with the service-role key
// and no session persistence is the canonical service-role pattern: it always
// authenticates as `service_role` regardless of any ambient user session.
export async function createServiceClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
}
