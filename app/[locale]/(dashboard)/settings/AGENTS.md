<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-26 | Updated: 2026-04-26 -->

# settings

## Purpose
Tabbed settings page. **Paywall-exempt** (per `BillingGate`) so users with an expired trial can still reach the Billing tab to subscribe.

5 tabs: Profile, Notifications, Team, Data export, Billing.

## Key Files

| File | Description |
|------|-------------|
| `page.tsx` | All 5 tabs in one client component (24KB). State for active tab is local. Pulls profile, notifications, team, scorecard via the API facade |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `billing/` | Billing tab's own server actions (Checkout session create, Portal session create, invoice history fetch) — co-located so the secrets stay server-side |

## For AI Agents

### Working In This Directory
- **Settings is the only paywall-exempt area** — anything reachable from here must work even with a `trial_expired` subscription.
- **Notifications tab** uses `getNotificationSettings` / `updateNotificationSettings` (partial updates per toggle).
- **Team tab** opens `<InviteTeamModal>` for invitations. The team list itself is currently `TEAM` from `lib/mock/data.ts` even in live mode (see comment in `lib/api/supabase.ts` — auth.users is restricted; needs a server action to surface).
- **Data export** is a stub today.
- **Billing tab**:
  - In trial → "Subscribe — 5,000฿/mo" CTA → calls a server action that creates a Stripe Checkout Session with `client_reference_id = hatcheryId` and redirects to Stripe.
  - Active → "Manage subscription" → calls a server action that creates a Customer Portal session and redirects.
  - Past-due → "Update payment" CTA leading to the Portal.
  - Below the CTA, the payment history table comes from `fetchInvoiceHistory()` server action (Stripe-side; never goes through the API facade because the Stripe secret can't reach the browser).

### Common Patterns
- The page is a single large client component with locally-scoped tab state. Splitting per-tab into siblings is fine if it grows further — keep them all under this directory.
- All "Save" buttons disable while the mutation is in flight (Phase 5: convert all forms to RHF + zod).

## Dependencies

### Internal
- `@/lib/api` (every read), `@/lib/billing/trial` (status derivation), `@/lib/types`
- `@/lib/store/modal` (open `invite`)
- `./billing/` server actions for Checkout / Portal / invoice fetch

<!-- MANUAL: -->
