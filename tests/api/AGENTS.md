<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-16 | Updated: 2026-05-16 -->

# tests/api

## Purpose
Regression tests for the `@/lib/api` facade behavior — guarding query-shape and persistence bugs that previously shipped. Each suite names the story it pins.

## Key Files

| File | Description |
|------|-------------|
| `add-customer.test.ts` | `addCustomer — B2.i plan persistence`: `plan` persists as `package_interest`; null when omitted (nullable column from migration `009`) |
| `list-alerts.test.ts` | `listAlerts — E1.i severity-sort regression`: orders by severity DESC before `created_at` DESC |
| `list-customers.test.ts` | `listCustomers — B1.i regression`: no inner join on `customer_cycles`; customers with no cycle row still return (cycle fields null) |

## For AI Agents

### Working In This Directory
- These assert the **query shape / payload**, not just outputs — they catch the class of bug where an inner join silently drops rows or a field stops persisting. Keep that intent when extending.
- Run against the mock facade; do not introduce a live Supabase dependency.

### Testing Requirements
- Must pass under `pnpm test`. Add a new file here only for another `@/lib/api` regression; name the `describe` with the story ID.

### Common Patterns
- Suite name format: `<fn> — <STORY>.i <short reason>`.

## Dependencies

### Internal
- `@/lib/api`, `@/lib/mock/*`

### External
- `vitest`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
