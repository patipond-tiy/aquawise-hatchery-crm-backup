<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-16 | Updated: 2026-05-16 -->

# settings/billing

## Purpose
Server actions for the Billing tab. Co-located here so the Stripe secret key stays server-side and never enters the API facade or the client bundle.

## Key Files

| File | Description |
|------|-------------|
| `actions.ts` | `'use server'`. `createCheckoutSession()` → Stripe Checkout (Pro plan, `client_reference_id = nurseryId`), returns a redirect URL. `createPortalSession()` → Stripe Customer Portal URL. `fetchInvoiceHistory()` → `Invoice[]` straight from Stripe (never via `@/lib/api`) |

## For AI Agents

### Working In This Directory
- **Stripe access only via `@/lib/stripe/server`** (`getStripe()`, lazy, `'server-only'`). Never import the Stripe SDK directly or expose secrets to the client.
- These actions are why the Billing tab can show real invoices while `@/lib/api`'s `getInvoiceHistory` returns `[]` — the facade contract is satisfied, the real data comes from here.
- Tenant is resolved with `currentNurseryScope()` (`@/lib/auth`); checkout sets `client_reference_id = nurseryId` so the webhook can map the session back to the nursery.
- Under `isMockMode()` (no Stripe/Supabase env) actions early-return a friendly result instead of throwing.

### Testing Requirements
- No dedicated suite (requires Stripe). Validate in mock mode (graceful no-op) and against a real test-mode Stripe key manually.

### Common Patterns
- Return an `ActionResult<{ url }>`; the client redirects to the URL. Errors are returned, not thrown, so the tab can surface them.

## Dependencies

### Internal
- `@/lib/stripe/server`, `@/lib/stripe/config`, `@/lib/auth`, `@/lib/types`

### External
- `stripe` ^18 (server-only)

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
