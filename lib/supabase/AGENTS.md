<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-26 | Updated: 2026-04-26 -->

# supabase

## Purpose
Supabase client factories. Three flavors for three runtime contexts:

1. **Browser client** (`client.ts`) — for `'use client'` components and the API facade
2. **Server client** (`server.ts` `createClient`) — for RSC, server actions, route handlers; reads/writes the user session via Next's cookie store
3. **Service-role client** (`server.ts` `createServiceClient`) — bypasses RLS; only for the Stripe webhook and admin tasks
4. **Middleware refresher** (`middleware.ts`) — refreshes the auth session on every request and writes updated cookies to the response. Wired from `proxy.ts` (eventually — currently `proxy.ts` only runs `next-intl` middleware; the Supabase refresh is wired in when needed)

## Key Files

| File | Description |
|------|-------------|
| `client.ts` | `createBrowserClient` from `@supabase/ssr`. Reads `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Used by `lib/api/supabase.ts` |
| `server.ts` | `createClient()` (anon, RSC-aware cookies) + `createServiceClient()` (service role; bypasses RLS). Both async — they `await cookies()` |
| `middleware.ts` | `updateSession(request)` — refreshes the auth session and rewrites cookies onto the response. Call from middleware before any RSC tries to read `auth.getUser()` |

## For AI Agents

### Working In This Directory
- **`server.ts` is async** in Next 16 because `cookies()` is async. Always `await createClient()` from a server context. The browser `createClient()` in `client.ts` is sync.
- **Service-role client is a footgun.** It bypasses RLS — only use it from:
  - the Stripe webhook handler (`app/api/webhooks/stripe/route.ts`)
  - other server-side admin paths that absolutely must write across tenants
  Never expose service-role results to a client.
- **The "setAll inside Server Components is a no-op" comment** in `server.ts` is intentional — RSC can't write cookies, only middleware can. The try/catch lets the same factory work in RSC, server actions, and route handlers without branching.
- **Don't write a generic "current hatchery" helper here.** That lives at `@/lib/auth.ts` (`currentHatcheryScope()`) so it can be marked `server-only`.

### Common Patterns
- `Database` type from `@/lib/database.types` is generic-parameterized into every client so queries are typed.
- Browser client is created fresh per call (cheap; just a config object) — there's no shared singleton.

## Dependencies

### Internal
- `@/lib/database.types` — the type-providing schema

### External
- `@supabase/ssr` (`createBrowserClient`, `createServerClient`)
- `next/headers` (`cookies()`)

<!-- MANUAL: -->
