<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-16 | Updated: 2026-05-16 -->

# tests/team

## Purpose
Tests for team invitations and the invite-token expiry/reuse semantics.

## Key Files

| File | Description |
|------|-------------|
| `invite.test.ts` | `inviteTeamMember`: rejects invalid email/role, succeeds for a valid owner invite, inserts a token with a 7-day expiry into `team_invites`, blocks the invite when the caller is not `owner`. Plus `team_invites — expiry and reuse rules`: `expires_at` is 7 days after `created_at` (SQL-level semantics validated in TS) |

## For AI Agents

### Working In This Directory
- Invites are **owner-only** (`team:invite` is `owner` in `lib/rbac.ts`) and token-based with a **7-day** expiry (migration `008_team_invites.sql`). Both rules are asserted here — keep them in sync if the migration changes.
- The second `describe` documents SQL-level expiry/reuse semantics in TS form (no live DB) — treat it as a contract mirror, not a DB integration test.

### Testing Requirements
- Must pass under `pnpm test`. Mock the Supabase client.

### Common Patterns
- Validation rejects (email/role) + authz block (non-owner) + token-shape assertion.

## Dependencies

### Internal
- The `inviteTeamMember` action/helper, `@/lib/rbac`

### External
- `vitest`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
