<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-26 | Updated: 2026-05-15 -->

# docs

## Purpose
Specs, runbooks, and the BMAD execution layer. Hand-written, not auto-generated. **Start at `README.md` (the authority map), then `bmad/`.**

## Source of truth

`bmad/` is the execution source of truth. Everything else is either a pinned input or legacy.

| Path | Role |
|------|------|
| `README.md` | **Authority map — read first.** Which docs are authoritative vs pinned inputs vs legacy. |
| `bmad/` | Execution layer. `README.md`, then the four governing docs in precedence order: `prd.md` (what) → `architecture.md` (rules) → `code-design.md` (how; §16 = merge gate) → `security.md` (threats). Stories in `bmad/stories/`, QA gates in `bmad/uat/`. |
| `product-spec/` | **Load-bearing input — do not move.** Cited by 37 bmad files (`[Source: …#<ID>]`, roles/RLS, personas). |
| `work-breakdown/MATRIX.md` | **Load-bearing input — do not move.** Cited by 29 bmad files. Part of the story-ID triple (see `bmad/README.md` "Story ID stability"). |
| `aquawise-updated-docs/` | **Load-bearing input — do not move.** Mirror of umbrella founder docs `00`–`06` + cross-product contracts (`DSR-SPEC.md`, `K-INTEGRATION-CONTRACT.md`). Read-only mirrors — conform, don't edit. |
| `STRIPE.md` | **Load-bearing input — do not move.** Cited by story `H3` as `[Source: docs/STRIPE.md]`. |
| `MIRROR.md` | Operational: CI-driven personal backup repo runbook. |
| `task-briefs/` | Historical task briefs. Reference only. |
| `archive/` | **Legacy — not authoritative.** `PLAN.md`, `CHECKLIST.md`, `line-integration-strategy.md` superseded by `bmad/` (archived 2026-05-15). |

## For AI Agents

### Working In This Directory
- **Enter via `README.md` → `bmad/README.md`.** Never start from a legacy doc in `archive/`.
- These are reference docs, not code. Read for context before non-trivial changes; rarely write here unless asked.
- A story's references (migration files, tables, RPCs, RBAC actions, paths) are **acceptance criteria, not suggestions** — grep-verified by `bmad/stories/04.executability-audit.md`. Honor them exactly.
- **Never move a load-bearing input. Never change a story ID.** Both break contractual traceability and the executability graph.
- Cross-product contracts in `aquawise-updated-docs/` are read-only mirrors — conform; escalate changes to the umbrella source.
- Keep timestamps absolute (`2026-05-15`), not relative.

### Common Patterns
- Conventional-commits style (`feat(scope):`, `fix(scope):`, `docs(scope):`). Story-ID scope where applicable (see `bmad/code-design.md` §17).
- The merge gate is `bmad/code-design.md` §16. Epic UAT gates are in `bmad/uat/`.

<!-- MANUAL: -->
