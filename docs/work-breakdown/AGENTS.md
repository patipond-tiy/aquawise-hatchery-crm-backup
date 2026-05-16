<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-29 | Updated: 2026-05-16 -->

# docs/work-breakdown

## Purpose
Team-assignable execution layer. Maps every user story (`docs/product-spec/03-user-stories.md`) and every functional requirement (the FR doc, now archived at `docs/archive/business-guide/aquawise-hatchery-functional-requirements (2).md` — historical filename frozen; the product is "nursery") to its current implementation status, decomposed into `implement` / `test` / `verify` subtasks each owner can pick up.

This folder does NOT replace the historical port log (`docs/archive/PLAN.md`, the 5-phase log) or its checkbox state (`docs/archive/CHECKLIST.md`). It tracks ongoing post-port work toward the H1 / H2 / H3 paying-tenant cuts defined in `docs/product-spec/06-production-gap.md`. Note: `docs/bmad/` is now the execution source of truth — this work-breakdown is a load-bearing input cited by bmad stories.

## Key Files

| File | Description |
|------|-------------|
| `README.md` | Entry point. Status legend, owner-assignment workflow, how-to-use guide |
| `MATRIX.md` | Master matrix. One section per story with a 3-row impl/test/verify table. The single source of truth |
| `JTBD-ALIGNMENT.md` | J1–J5 → stories serving each + coverage % + gap callouts |
| `FR-COVERAGE.md` | Both lenses: F1–F9 / H1–H10 surfaces from the FR doc, AND the FR-AUTH/FR-WS/etc sub-IDs the product-spec uses. Surfaces uncovered FRs |
| `BY-PHASE.md` | H1 / H2 / H3 cuts ordered to match `06-production-gap.md`'s 10-week sequencing. Sprint-ready slices |

## For AI Agents

### Working In This Directory
- **`MATRIX.md` is the canonical state.** Other files derive from it. If a status changes, update `MATRIX.md` first, then refresh the slicing views.
- **One row per subtask.** Never collapse `.i` + `.t` + `.v` into a single row even if one person owns all three.
- **Status rolls UP from children.** Parent story takes the LOWEST status of its three subtasks (❌ < 🟡 < ✅). Don't mark a parent ✅ until all three children are ✅.
- **Code refs must be live paths.** If a path no longer exists in the repo, fix it — don't leave stale paths.
- **Conventional commits:** `docs(work-breakdown): <change>` matches existing scope style (see `git log`).

### Common Patterns
- **Status legend** (consistent with `02-feature-inventory.md`):
  - ✅ Done — works end-to-end against real backend
  - 🟡 Partial — wired but incomplete (e.g. modal opens but no submit)
  - ❌ Not started — no implementation
  - ⏸ Blocked — has a `Blocked-by` upstream that must land first
  - 🚫 Out of scope — explicitly deferred (e.g. F8 water quality is on the farm-side app)
- **Phase tags:** H1 (first paying tenant) · H2 (scale) · H3 (post-GA / deferred). Match `03-user-stories.md`.
- **JTBD tags:** J1–J5 from `00-overview.md`. Each story carries one or more.
- **FR-IDs:** sub-IDs from `03-user-stories.md` (FR-AUTH-001, FR-WS-001, …). The canonical FR doc uses coarser surface IDs (F1–F9, H1–H10) — `FR-COVERAGE.md` reconciles both.

### When to add a new story
- New ID convention: epic letter (A–H, X for ops) + next integer.
- Add it to: `MATRIX.md` (full block), `JTBD-ALIGNMENT.md` (under each JTBD it serves), `FR-COVERAGE.md` (against the FR-IDs it satisfies), `BY-PHASE.md` (under its phase). Same commit.

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
