<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-26 | Updated: 2026-05-16 -->

# settings

## Purpose
Tabbed settings page. **Paywall-exempt** (per `BillingGate`) so a tenant with an expired trial can still reach the Billing tab to subscribe.

5 tabs: Profile, Notifications, Team, Data export, Billing. Each tab is its own `*-tab.tsx` component; mutations go through co-located server actions.

## Key Files

| File | Description |
|------|-------------|
| `page.tsx` | Shell that hosts the tab strip + renders the active tab component |
| `actions.ts` | `'use server'` — `updateProfile(...)` (nursery profile + logo upload to the `nursery-logos` bucket). Regression-tested by `tests/settings/profile.test.ts` |
| `profile-tab.tsx` | Profile form (nursery name, contact, logo) |
| `notifications-tab.tsx` | Notification toggles (partial updates per switch via `@/lib/api`) |
| `team-tab.tsx` | Team list + invite trigger (opens `<InviteTeamModal>`) |
| `data-export-tab.tsx` | Data-export tab |
| `billing-tab.tsx` | Subscribe / Manage / Update-payment CTA + invoice history table |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `billing/` | Billing server actions — Checkout / Portal / invoice history (Stripe secret stays server-side) (see `billing/AGENTS.md`) |
| `team/` | Team server action — `inviteTeamMember` (see `team/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- **Settings is the only paywall-exempt area** — anything reachable from here must work even with a `trial_expired` subscription.
- **Tabs are split into `*-tab.tsx` files** (no longer one giant client component). Keep each tab's logic in its own file; shared tab chrome stays in `page.tsx`.
- **Profile updates go through `actions.ts`'s `updateProfile`** (server action, writes audit log, uploads logo). Don't mutate the profile from the client via `@/lib/api`.
- **Notifications** use `getNotificationSettings` / `updateNotificationSettings` (partial updates per toggle) through `@/lib/api`.
- **Team tab** opens `<InviteTeamModal>`; the actual invite is the `team/actions.ts` server action (owner-only).
- **Billing tab**: trial → Checkout Session (`client_reference_id = nurseryId`); active → Customer Portal; past-due → Portal "update payment". The invoice table comes from `billing/actions.ts` `fetchInvoiceHistory()` — never via `@/lib/api` (the Stripe secret can't reach the browser).

### Testing Requirements
- `tests/settings/profile.test.ts` (MIME reject, no-logo accept, logo-url-in-upsert) and `tests/team/invite.test.ts` (owner-only, 7-day token) pin the two action surfaces. Keep them green.

### Common Patterns
- Each "Save" disables while the mutation is in flight. Forms move toward RHF + zod (Phase 5).
- Settings server actions early-return gracefully under `isMockMode()` so previews without Stripe/Supabase don't throw.

## Dependencies

### Internal
- `@/lib/api` (reads), `@/lib/billing/trial` (status derivation), `@/lib/types`
- `@/lib/store/modal` (open `invite`), `@/lib/audit` (audited writes)
- `./billing/` + `./team/` co-located server actions

### External
- `next/navigation` (`redirect`), Radix primitives (Switch/Tabs)

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
