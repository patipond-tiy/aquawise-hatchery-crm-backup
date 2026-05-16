<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-16 | Updated: 2026-05-16 -->

# tests/billing

## Purpose
Tests for the write-path subscription guard.

## Key Files

| File | Description |
|------|-------------|
| `guard.test.ts` | `requireActiveSubscription — H3 mutation guard` (`lib/billing/guard.ts`): throws `PaywallError` (status 402) for `trial_expired` / `canceled`; resolves for `active`, `trialing-25`, and `past_due` (past-due is intentionally NOT paywalled) |

## For AI Agents

### Working In This Directory
- The matrix is exercised by setting `MOCK_BILLING_STATE` per case — set/restore it inside the test, never rely on ambient env.
- **`past_due` resolves** (not blocked) by design — a failed payment shows a banner but does not lock writes. Don't "fix" that into a throw.
- `PaywallError.status === 402` is part of the contract (callers map it to an HTTP/UI response).

### Testing Requirements
- Must pass under `pnpm test`; deterministic per `MOCK_BILLING_STATE`.

### Common Patterns
- One `it` per billing state; assert resolve vs `PaywallError`.

## Dependencies

### Internal
- `@/lib/billing/guard`, `@/lib/mock/billing`

### External
- `vitest`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
