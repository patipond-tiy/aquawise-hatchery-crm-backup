<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-26 | Updated: 2026-04-26 -->

# billing

## Purpose
Pure helpers for deriving subscription state. **No I/O, no Stripe, no Supabase.** Just functions over `Subscription` + `SubscriptionStatus` + dates. Safe to import from server, client, or test code.

## Key Files

| File | Description |
|------|-------------|
| `trial.ts` | Pure helpers: `daysLeftInTrial(trialEndsAt)`, `effectiveStatus(status, trialEndsAt)` (lazy-flips `trialing` → `trial_expired` if past due), `requiresPaywall(status)`, `isActiveOrTrialing(status)`, `bannerToneForTrial(daysLeft)` (`bad`/`amber`/`sky`), `viewFromRow(sub)` (decorates with `daysLeftInTrial` + `effective`) |

## For AI Agents

### Working In This Directory
- **Pure functions only.** Don't add anything that hits the network or reads files. The point of this module is that it's safe to import everywhere.
- **`effectiveStatus` is the canonical "is the trial over?" check.** Use it instead of comparing dates ad-hoc — it correctly returns `'trial_expired'` only when status is already `'trialing'` AND the deadline has passed. The webhook handler is also expected to persist the flip on first observation so subsequent reads are O(1).
- **`requiresPaywall` is what `BillingGate` consults** to decide whether to redirect to `/billing/trial-expired`.
- **Banner thresholds**: `<= 2 days` → red (`bad`), `<= 7 days` → amber, otherwise sky. Tweaking these affects the trial-banner urgency curve.

## Dependencies

### Internal
- `@/lib/types` (`Subscription`, `SubscriptionStatus`)

<!-- MANUAL: -->
