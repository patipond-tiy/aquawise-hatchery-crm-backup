<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-16 | Updated: 2026-05-16 -->

# tests/auth

## Purpose
Tests for the auth lifecycle: first-sign-in tenant bootstrap and sign-out.

## Key Files

| File | Description |
|------|-------------|
| `bootstrap.test.ts` | `bootstrapNursery` (`lib/auth/bootstrap.ts`): calls the `create_nursery` RPC for a new user (no membership), skips it for a returning user (membership exists), throws when the RPC errors |
| `signout.test.ts` | `signOut server action — P2.10` (`app/actions/auth.ts`): calls `supabase.auth.signOut()`, then redirects to `/th/login` |

## For AI Agents

### Working In This Directory
- `bootstrapNursery` is `'server-only'` — testable because `vitest.config.ts` stubs `server-only`.
- The onboarding RPC is **`create_nursery`** (defined in `002_rls.sql`, trial defaults added in `004_billing.sql`) — not `create_hatchery`. Assert against that name.
- `signOut` redirect target is the **`th`** locale login (default locale).

### Testing Requirements
- Mock the Supabase client; no live calls. Must pass under `pnpm test`.

### Common Patterns
- Membership presence is the branch that decides whether the RPC runs — assert both paths.

## Dependencies

### Internal
- `@/lib/auth/bootstrap`, `app/actions/auth`, `@/lib/supabase/*` (mocked)

### External
- `vitest`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
