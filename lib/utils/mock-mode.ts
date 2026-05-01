/**
 * isMockMode — true when the app is configured to run against the in-memory
 * mock layer (no Supabase project provisioned). Mirrors the gate in
 * `lib/api/index.ts` so server actions can short-circuit gracefully when
 * Supabase env is absent (e.g. on a Vercel preview before provisioning).
 *
 * Server-action callers should early-return a friendly result instead of
 * letting createClient() throw at runtime.
 */
export function isMockMode(): boolean {
  return (
    (process.env.NEXT_PUBLIC_USE_MOCK ?? process.env.USE_MOCK) !== 'false' ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL
  );
}
