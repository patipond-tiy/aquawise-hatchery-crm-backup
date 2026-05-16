<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-26 | Updated: 2026-05-16 -->

# auth

## Purpose
Locale-agnostic Supabase auth callback. Lives outside `[locale]/` so the redirect URL configured in the Supabase dashboard is stable (`/auth/callback`) and doesn't depend on which locale the user clicked the magic link from.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `callback/` | `route.ts` — handles the OAuth/magic-link code exchange and redirects to `/{th,en}/` |

## For AI Agents

### Working In This Directory
- **Don't move this under `[locale]/`** — the URL must be stable for Supabase's redirect-URL allowlist.
- **The callback is a route handler (`route.ts`)**, not a page. It calls `supabase.auth.exchangeCodeForSession(code)` then redirects.
- New auth flows (e.g., LINE Login in a future phase) should land as siblings here (`auth/line/callback/`).

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
