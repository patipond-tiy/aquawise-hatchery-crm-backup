<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-16 | Updated: 2026-05-16 -->

# tests/derive

## Purpose
Tests for pure dashboard-stat derivation.

## Key Files

| File | Description |
|------|-------------|
| `dashboard-stats.test.ts` | `deriveDashboardStats` (`lib/derive/dashboard-stats.ts`): active cycles = customers with non-null `cycleDay`; average D30 = rounded mean of batches with `meanD30 > 0` (excludes 0; null when no batches); plus the remaining derived stats |

## For AI Agents

### Working In This Directory
- `deriveDashboardStats` is a **pure function** — no mocking needed; feed fixtures, assert numbers. Keep tests fixture-driven.
- Edge cases are the point: empty inputs, all-null `cycleDay`, `meanD30` of 0 must stay covered.

### Testing Requirements
- Must pass under `pnpm test`. No env, no I/O.

### Common Patterns
- Nested `describe` per stat (`stat 1 — active cycles`, `stat 2 — average D30`, …).

## Dependencies

### Internal
- `@/lib/derive/dashboard-stats`, `@/lib/types`

### External
- `vitest`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
