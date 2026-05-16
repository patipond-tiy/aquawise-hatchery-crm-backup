<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-16 | Updated: 2026-05-16 -->

# app/actions

## Purpose
Top-level (non-page-scoped) server actions — `'use server'` functions not tied to a single `(dashboard)` route. Page-scoped mutations stay co-located with their route (`app/[locale]/(dashboard)/<page>/actions.ts`); this directory is for app-wide actions.

## Key Files

| File | Description |
|------|-------------|
| `auth.ts` | `signOut()` — `'use server'`. Signs the user out via the server Supabase client and redirects to `/th/login`. App-wide (invoked from the top-bar profile menu), so it lives here rather than under a single page. Regression-tested by `tests/auth/signout.test.ts` (story P2.10) |

## For AI Agents

### Working In This Directory
- **Only put genuinely app-wide actions here.** A mutation that belongs to one page (customers/batches/scorecard/settings) goes in that page's co-located `actions.ts` so the audit trail and tenant scope stay local to the feature.
- Actions are `'use server'` and run on the server — use `@/lib/supabase/server` (cookie-aware) or the service client, never the browser client.
- Redirects use the **default `th`** locale unless a locale is explicitly threaded through.
- Writes that must be audited go through `writeAuditLog` (`lib/audit.ts`); subscription-gated writes call `requireActiveSubscription` (`lib/billing/guard.ts`).

### Testing Requirements
- Cover new actions with a suite under `tests/` (mock the Supabase client). `signOut` is pinned by `tests/auth/signout.test.ts`.

### Common Patterns
- Thin action → Supabase call → `redirect()`/return. Keep business logic in `lib/`, not in the action body.

## Dependencies

### Internal
- `@/lib/supabase/server`, `next/navigation` (`redirect`)

### External
- `@supabase/ssr`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
