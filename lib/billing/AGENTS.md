<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-26 | Updated: 2026-05-16 -->

# billing

## Purpose
Subscription-state logic. Two parts: **`trial.ts`** — pure, side-effect-free derivation over `Subscription`/`SubscriptionStatus`/dates, safe to import anywhere (server, client, test); and **`guard.ts`** — a `'server-only'` write-path enforcement helper that reads the current tenant's status and throws when a mutation isn't allowed.

## Key Files

| File | Description |
|------|-------------|
| `trial.ts` | Pure helpers: `daysLeftInTrial(trialEndsAt)`, `effectiveStatus(status, trialEndsAt)` (lazy-flips `trialing` → `trial_expired` if past due), `requiresPaywall(status)`, `isActiveOrTrialing(status)`, `bannerToneForTrial(daysLeft)` (`bad`/`amber`/`sky`), `viewFromRow(sub)` (decorates with `daysLeftInTrial` + `effective`) |
| `guard.ts` | `'server-only'`. `requireActiveSubscription()` — resolves the caller's nursery status and throws `PaywallError` (status 402) when `requiresPaywall(effectiveStatus)`. `PaywallError` is an exported `Error` subclass. Called at the top of subscription-gated server actions (story H3) |

## For AI Agents

### Working In This Directory
- **Keep `trial.ts` pure.** No network, no files, no env — it's imported by client, server, and tests. Anything with I/O belongs in `guard.ts` (server-only) instead.
- **`guard.ts` is `'server-only'`** — it reads the tenant scope. Never import it from a client component; call it from `'use server'` action bodies before a write.
- **`effectiveStatus` is the canonical "is the trial over?" check.** It returns `'trial_expired'` only when status is already `'trialing'` AND the deadline passed. The webhook persists the flip on first observation so later reads are O(1).
- **`requiresPaywall` is what both `BillingGate` (redirect) and `requireActiveSubscription` (throw) consult.** `past_due` is intentionally NOT paywalled — it shows a banner but does not block writes. Don't change that without updating `tests/billing/guard.test.ts`.
- **Banner thresholds**: `<= 2 days` → `bad`, `<= 7 days` → `amber`, otherwise `sky`. Tweaking these moves the trial-banner urgency curve.

### Testing Requirements
- `tests/billing/guard.test.ts` pins the full `MOCK_BILLING_STATE` matrix and `PaywallError.status === 402`. Trial-derivation changes should also keep any `trial.ts` callers green.

### Common Patterns
- Derivation (`trial.ts`) is fed plain values and returns plain values; enforcement (`guard.ts`) resolves the live tenant then delegates the decision to `requiresPaywall`.

## Dependencies

### Internal
- `@/lib/types` (`Subscription`, `SubscriptionStatus`)
- `guard.ts` → `@/lib/auth` (tenant scope) + `@/lib/api` (status read), `server-only`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
