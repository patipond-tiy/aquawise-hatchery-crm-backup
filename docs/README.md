# docs/ — Authority Map

> Read this first. It tells you which docs are authoritative, which are inputs that stories pin by exact path, and which are legacy. If you are an AI dev agent: your execution source of truth is `bmad/`. Do not start from the legacy docs.

## The model

| Tier | Path | What it is | Rule |
|---|---|---|---|
| **Source of truth — execution** | `bmad/` | The BMAD execution layer. `bmad/stories/` = runnable stories only; `bmad/qa/` = QA/audit process artifacts (00 outline, 01 alignment audit, 02 to-fix, 03 fix-auto cmd, 04 executability audit) — NOT stories; `bmad/uat/` = QA gates; `bmad/CHANGELOG.md` = change record. Plus the four governing docs. | Start here. Precedence below. |
| **Load-bearing inputs** | `product-spec/`, `work-breakdown/MATRIX.md`, `aquawise-updated-docs/`, `STRIPE.md` | Referenced by exact path inside story acceptance criteria. | **Never move or rename.** Moving any of these breaks the executability graph and (for the story-ID triple) contractual traceability. |
| **Operational** | `MIRROR.md`, `task-briefs/` | Backup-repo runbook; historical task briefs. | Reference only. |
| **Legacy** | `archive/` | Superseded by `bmad/`. Kept for history. | Not authoritative. Each file carries an `ARCHIVED` header. |

## bmad/ precedence (when docs disagree)

`prd.md` (what to build) → `architecture.md` (which rules are enforced) → `code-design.md` (how to write code that obeys them; §16 is the merge gate) → `security.md` (what can go wrong; threat catalog). A disagreement is a bug in the lower-precedence doc. `security.md` is self-authoritative on specific threats. Full detail: `bmad/README.md`.

## Load-bearing inputs — why they are pinned

- **`product-spec/`** — 37 bmad files cite it (`[Source: docs/product-spec/03-user-stories.md#<ID>]`, `08-roles-and-rls.md`, etc.). **Provenance + traceability, not authority.** `03-user-stories.md` carries an AUTHORITY banner: where its prose disagrees with a `bmad/stories/<ID>.md`, the bmad story wins and the spec text is stale-by-definition. Follow `[Source:]` for traceability; act on the bmad story.
- **`work-breakdown/MATRIX.md`** — 29 bmad files cite it. The **story-ID traceability index**: `bmad/stories/<ID>` = `MATRIX.md` row = `product-spec/03-user-stories.md` story. **IDs are the stable contract and must never change** (see `bmad/README.md` "Story ID stability"); row AC/status prose is provenance and may lag the corrected stories — the bmad story wins on content.
- **`aquawise-updated-docs/`** — 12 bmad files cite it. Mirror of the umbrella `aquawise-ecosystem/aquawise-docs/` founder docs (`00`–`06`), plus the cross-product contracts (`DSR-SPEC.md`, and `K-INTEGRATION-CONTRACT.md` when added). Each carries a "MIRROR — source of truth is the umbrella" header; conform to them, do not edit the mirror.
- **`STRIPE.md`** — story `H3` cites it as `[Source: docs/STRIPE.md]`. Stays at top level.

## Legacy (archived 2026-05-15)

`archive/PLAN.md`, `archive/CHECKLIST.md`, `archive/line-integration-strategy.md` predate the `bmad/` layer and are superseded by it:
- `PLAN.md` (5-phase plan) → product truth is now `bmad/prd.md`.
- `CHECKLIST.md` (per-phase tasks) → execution + acceptance is now `bmad/stories/` + `bmad/uat/`.
- `line-integration-strategy.md` → LINE integration is now `bmad/stories/` Epic G + Epic K + the cross-product contracts in `aquawise-updated-docs/`.

`archive/business-guide/` was archived earlier.

## For AI dev agents

1. Enter via `bmad/README.md`, not via any legacy doc.
2. A story's references (migration files, tables, RPCs, RBAC actions, paths) are **acceptance criteria, not suggestions** — they were grep-verified against the live codebase by the executability audit (`bmad/qa/04.executability-audit.md`). Honor them exactly.
3. Never move a load-bearing input. Never change a story ID.
4. Cross-product contracts (`aquawise-updated-docs/DSR-SPEC.md`, `K-INTEGRATION-CONTRACT.md`) are read-only mirrors — conform, don't edit; escalate contract changes to the umbrella source.
