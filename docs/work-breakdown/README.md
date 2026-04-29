# Work Breakdown — How to use this folder

This folder is the team-assignable execution layer. It exists so a hatchery-CRM team lead can open one file, fill in `Owner` columns, and hand the result to engineers without further translation.

It is **not** the spec (`docs/product-spec/`) and **not** the brand intent (`docs/business-guide/`). It is the bridge: every user story from `03-user-stories.md` × every FR-ID from the FR doc × the actual code state today × an `implement / test / verify` decomposition each engineer can own.

## Read order

1. **Start here.** Skim this README — legend + workflow.
2. Open **`BY-PHASE.md`** to pick a sprint slice (H1 → H2 → H3, week-by-week per `06-production-gap.md`).
3. Drill into **`MATRIX.md`** for the full per-story block: AC summary, code refs, three subtasks.
4. Use **`JTBD-ALIGNMENT.md`** to sanity-check that the sprint advances the right Jobs-to-be-done.
5. Use **`FR-COVERAGE.md`** to round-trip every business-guide FR against an implementing story.

## Status legend

Same definitions as `product-spec/02-feature-inventory.md` — do not redefine here.

| Symbol | Meaning |
|---|---|
| ✅ | **Done** — works end-to-end against real Supabase, RLS-scoped, audit-logged where applicable. Shipped. |
| 🟡 | **Partial** — wired against mock or UI exists but submission/persistence is missing or fakes a toast. |
| ❌ | **Not started** — no code path; modal/route/table doesn't exist. |
| ⏸ | **Blocked** — has an unsatisfied upstream in `Blocked-by`. Cannot start. |
| 🚫 | **Out of scope** — explicitly deferred (cross-product, e.g. F8 water-quality is owned by the farm-side AquaWise app). |

**Roll-up rule.** Parent story status = lowest status among its three subtasks. Don't mark a parent ✅ until `.i`, `.t`, and `.v` are all ✅.

## Row-type legend

Each story in `MATRIX.md` is followed by exactly three subtask rows:

| Sub | Meaning | Owner profile |
|---|---|---|
| `.i` | **Implement** — write the code so the AC list passes against real Supabase. Uphold RLS scope, audit-log writes, optimistic updates per facade conventions. | engineer (front-end / full-stack) |
| `.t` | **Test** — Vitest for unit + integration; Playwright for end-to-end where relevant. Cover happy path + the role-permission edge case from `08-roles-and-rls.md` (e.g. `lab_tech` cannot create batches). Tests live in `tests/` or alongside the route. | engineer or QA |
| `.v` | **Verify** — manual exercise of the user journey from `04-flows.md` against `pnpm dev` with `USE_MOCK=false`. Confirms each AC. The person flipping `Status: ✅` on the parent does this last. | team lead / PM / QA |

## Phase tags

Match `03-user-stories.md`. They override the older `PLAN.md` 5-phase numbering for forward-looking work.

| Tag | Meaning | Source |
|---|---|---|
| **H1** | First paying tenant target — weeks 1–6 sequencing in `06-production-gap.md` | `03-user-stories.md` |
| **H2** | Second tenant / scale — weeks 7–10 | `03-user-stories.md` |
| **H3** | Post-GA / deferred (two-way chat, auditor role, mobile-first redesign, reviews) | `03-user-stories.md` |

## Owner-assignment workflow

1. Open `BY-PHASE.md` and pick the H1 (or H2) section. Choose the parent stories you want to staff this sprint.
2. In `MATRIX.md`, find each story's block. Fill the `Owner` column on the parent header AND on each of its `.i`/`.t`/`.v` rows. One person can own all three; often `.t` goes to QA.
3. **Use `@github-handle`** in the Owner cell so the value cross-references PRs and issues.
4. Add `Started: YYYY-MM-DD` next to the Owner when work begins. Add `Completed: YYYY-MM-DD` when status flips to ✅.
5. Commit: `docs(work-breakdown): assign owners for sprint N` (matches existing scope style — see `git log --oneline | grep docs`).
6. As subtasks land, owners update their row's `Status`. Parent status auto-rolls-up — re-derive when committing.
7. At sprint close, regenerate the coverage % in `JTBD-ALIGNMENT.md` and the "Uncovered FRs" list in `FR-COVERAGE.md`. These are the metrics for "are we shipping the JTBDs / FRs we promised?"

## Estimating

Estimates are **rough day-buckets**, not commitments. Pattern:

- Implement subtask: 0.25d (one-line wiring) → 1d (one route + server action) → 2d+ (cross-cutting, e.g. LINE bind flow + bot worker extension).
- Test subtask: typically 0.25–0.5d if logic is co-located; up to 1d for RLS or LINE flow.
- Verify subtask: 0.25–0.5d unless it requires external setup (Stripe webhook, LINE OA).

The engineer who picks up the row owns final estimation. The `Est` column is a starting point.

## Cross-references

- **Spec layer (intent):** `docs/product-spec/` — read these first if you don't know what a story is for.
  - `00-overview.md` — JTBDs J1–J5, NFR commitments
  - `01-personas.md` — P1–P6
  - `02-feature-inventory.md` — every UI control's status today
  - `03-user-stories.md` — A1–X1, with AC + FR-IDs + "Today." notes
  - `04-flows.md` — sequence diagrams for verify steps
  - `06-production-gap.md` — P0–P3 punch list with 10-week sequencing
  - `08-roles-and-rls.md` — auth model + the cross-tenant RLS audit (P0.3)
- **Brand layer (intent):** `docs/business-guide/` — when scoping a story, check the CBBE pillars and FRs.
- **Phase log (history):** `docs/PLAN.md` + `docs/CHECKLIST.md` — the original 5-phase port. Untouched by this folder.
- **LINE strategy:** `docs/line-integration-strategy.md` — full architectural strategy that grounds Epic G stories.
- **Billing runbook:** `docs/STRIPE.md` — for stories H3 and any P0.4 work.

## When to add a new story

If a brand-new requirement emerges (e.g. customer asks for an unanticipated feature):

1. Create the story in `product-spec/03-user-stories.md` first — full AC + FR-IDs + "Today." note.
2. Add it to **all four** files in this folder in one commit:
   - `MATRIX.md` — full block (parent + three subtasks)
   - `JTBD-ALIGNMENT.md` — under each JTBD it serves
   - `FR-COVERAGE.md` — against the FR-IDs it satisfies
   - `BY-PHASE.md` — under its phase, in suggested-week order
3. ID convention: epic letter + next integer (A1 → A4, B4 → B5, X1 → X2, etc.). New epics use the next free letter or `Z` for cross-cutting ops.

## What this folder is *not*

- **Not a Gantt.** No dependencies graph, no critical-path view. Use the `Blocked-by` column manually.
- **Not a ticket system.** Owners track their own subtasks. Convert to GitHub Issues or Linear if the team prefers — keep this folder as the canonical source.
- **Not a velocity tracker.** Estimates are rough; the team can layer on whatever metrics they want.
- **Not a re-write of `PLAN.md` or `CHECKLIST.md`.** Those track the original Phase 1–5 port. This folder is forward-looking.
