<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-16 | Updated: 2026-05-16 -->

# lib/auth

## Purpose
First-sign-in **tenant bootstrap**. Distinct from the sibling file `lib/auth.ts` (which resolves the *current* tenant scope for an authenticated session). This directory holds the one-time provisioning that runs during the auth callback, before an ambient session exists.

## Key Files

| File | Description |
|------|-------------|
| `bootstrap.ts` | `bootstrapNursery(userId)` — `'server-only'`. On first sign-in, if the user has no `nursery_members` row, calls the `create_nursery` RPC (creates the `nurseries` row + owner membership + default scorecard/notification settings + 30-day trial). No-op for returning users; throws if the RPC errors |

## For AI Agents

### Working In This Directory
- **Keyed by an explicitly-passed `userId`**, not the ambient session — it runs during the auth callback when there is no session yet. This is why it has its own `nursery_members` lookup distinct from `currentNurseryScope()` in `lib/auth.ts`; do not "consolidate" them without re-verifying first sign-in stays stable.
- The onboarding RPC is **`create_nursery`** (`002_rls.sql`, trial defaults in `004_billing.sql`) — never `create_hatchery`. Onboarding must go through the RPC, not raw inserts (the RPC is `security definer` and sets up membership + defaults atomically).
- `'server-only'` — never import from a client component.

### Testing Requirements
- `tests/auth/bootstrap.test.ts` pins both branches (new user → RPC; returning user → skip) and the error path. Update it if the lookup or RPC name changes.

### Common Patterns
- Lookup membership → branch on presence → RPC or no-op. Idempotent across repeated callbacks.

## Dependencies

### Internal
- `@/lib/supabase/server` (cookie/service client), `@/lib/database.types`

### External
- `@supabase/ssr`, `server-only`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
