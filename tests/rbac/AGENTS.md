<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-16 | Updated: 2026-05-16 -->

# tests/rbac

## Purpose
Exhaustive permission-matrix test for `can(role, action)`.

## Key Files

| File | Description |
|------|-------------|
| `can.test.ts` | `can()` (`lib/rbac.ts`): table-driven — every `(role, action)` pair asserted against the expected allow/deny; `undefined` role returns `false` |

## For AI Agents

### Working In This Directory
- Roles are the **current four**: `owner`, `counter_staff`, `lab_tech`, `auditor` (`nursery_role` enum, reconciled by migration `007`). The legacy `admin/editor/viewer/technician` set is gone — do not reintroduce it here.
- Actions: `customer:read|write`, `batch:read|write`, `alert:close`, `team:invite`, `settings:write`, `broadcast:write`, `data:export`, `billing:manage`.
- When `RULES` in `lib/rbac.ts` changes, update the expectation table in lock-step — this suite is the guard against silent permission drift.

### Testing Requirements
- Must pass under `pnpm test`. Pure; no env/I/O.

### Common Patterns
- Generated `it` per `(role, action)` cell so a single regression names exactly which permission broke.

## Dependencies

### Internal
- `@/lib/rbac`

### External
- `vitest`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
