<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-16 | Updated: 2026-05-16 -->

# lib/derive

## Purpose
Pure derivation helpers — functions that compute view models from domain types. **No I/O, no Supabase, no env.** Safe to import from server, client, or test code.

## Key Files

| File | Description |
|------|-------------|
| `dashboard-stats.ts` | `deriveDashboardStats(customers, batches, …)` — computes the dashboard hero stats: active cycles (customers with non-null `cycleDay`) over total customers, average D30 (rounded mean of batches with `meanD30 > 0`, null when no batches), and the remaining derived figures |

## For AI Agents

### Working In This Directory
- **Pure functions only.** No network, no file reads, no `process.env`. The point of this module is testability and safe ubiquitous import.
- Derivation lives here, **not** in page components — pages call `@/lib/api`, hand the data to a derive helper, and render. Keeps the math unit-testable.
- Mind the documented edge cases: empty inputs, all-null `cycleDay`, `meanD30` of 0 are excluded — keep that behavior; it's pinned by tests.

### Testing Requirements
- `tests/derive/dashboard-stats.test.ts` is fixture-driven and exhaustive on edge cases. Any change to a formula updates the test in the same commit.

### Common Patterns
- Input is domain types (`Customer`, `Batch`); output is a plain stats object the view renders directly.

## Dependencies

### Internal
- `@/lib/types`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
