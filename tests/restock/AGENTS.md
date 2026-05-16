<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-16 | Updated: 2026-05-16 -->

# tests/restock

## Purpose
Tests for the D1 configurable restock-threshold grouping.

## Key Files

| File | Description |
|------|-------------|
| `threshold.test.ts` | `restock grouping — D1 configurable thresholds`: groups by `restockIn` against per-nursery thresholds; defaults `{now:0, week:14, month:45}`; re-groups when thresholds change; excludes customers with null `restockIn` |

## For AI Agents

### Working In This Directory
- Thresholds are **per-nursery configurable** (migration `010_restock_thresholds.sql`) — the old hardcoded `7/30` constants are gone. Assert against the configurable inputs, not literals.
- Null `restockIn` ⇒ excluded from active groups (dormant) — keep that case.

### Testing Requirements
- Must pass under `pnpm test`. Pure grouping over fixtures.

### Common Patterns
- Each `it` shifts one threshold and asserts a specific customer moves group — boundary-focused.

## Dependencies

### Internal
- The restock grouping helper + `@/lib/types`

### External
- `vitest`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
