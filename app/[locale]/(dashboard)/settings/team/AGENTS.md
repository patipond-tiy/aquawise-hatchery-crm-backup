<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-16 | Updated: 2026-05-16 -->

# settings/team

## Purpose
Server action for team member invitations, co-located with the Team tab.

## Key Files

| File | Description |
|------|-------------|
| `actions.ts` | `'use server'`. `inviteTeamMember(...)` — validates email + role, enforces owner-only authorization (`can(role, 'team:invite')`), and inserts a token row into `team_invites` with a 7-day expiry (migration `008_team_invites.sql`) |

## For AI Agents

### Working In This Directory
- **Owner-only.** `team:invite` is `owner` in `lib/rbac.ts` — the action must reject non-owner callers. Roles offered are the current `nursery_role` set (`owner`/`counter_staff`/`lab_tech`/`auditor`); reject anything else.
- **Token expiry is 7 days** — keep it in sync with the `team_invites` schema (`008`). The accept side is `app/auth/accept-invite/route.ts`.
- Tenant resolved via `currentNurseryScope()` (`@/lib/auth`); the invite is scoped to the caller's `nursery_id`.

### Testing Requirements
- `tests/team/invite.test.ts` pins invalid-email/role rejects, owner-only authz, and the 7-day token shape. Keep it green when changing validation or expiry.

### Common Patterns
- Validate → authorize (`can`) → insert token → return result. Errors returned, not thrown.

## Dependencies

### Internal
- `@/lib/auth` (tenant scope), `@/lib/rbac` (`can`), `@/lib/supabase/server`, `@/lib/audit`

### External
- `@supabase/ssr`, `zod` (input validation)

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
