# docs/bmad — BMAD Execution Layer

This folder is the **BMAD-METHOD execution layer** for the AquaWise Hatchery CRM. It lets an AI dev agent pick up a single story file and implement it end-to-end without a human translating context from the product spec, architecture docs, or business guides.

Each story file is self-contained: it embeds the exact acceptance criteria, file paths to touch, API facade methods, RBAC actions, RLS tables, and i18n keys needed to implement and verify the feature autonomously.

---

## Folder layout

```
docs/bmad/
├── README.md            # this file
├── prd.md               # sharded PRD — source of product truth for stories
├── architecture.md      # sharded architecture — source of tech truth for stories
├── stories/             # one .md per story (A1..G2), ready-for-dev
│   └── _hypotheses/     # 2027+ / unvalidated stories (F1-F4, G3) — do not implement
└── uat/                 # one .md per epic, QA-gate style
```

Story IDs (A1, B2, …) are stable and trace to matching rows in `docs/work-breakdown/MATRIX.md` and stories in `docs/product-spec/03-user-stories.md`.

**Current story count:** 29 ready-for-dev + 5 hypothesis = 34 total.

---

## Agent roles

| Agent | Role |
|---|---|
| Analyst | Distils business docs into structured requirements; flags ⚠ hypotheses |
| PM | Authors and maintains `prd.md` from requirements |
| Architect | Authors and maintains `architecture.md` from `CLAUDE.md` + `08-roles-and-rls.md` |
| SM (Scrum Master) | Shards PRD/architecture into individual story files |
| Dev | Implements one story file end-to-end; marks tasks `[x]`; sets Status to `review` |
| QA | Executes UAT gate files; records pass/fail evidence |

---

## Running a story end-to-end

**Step 1.** Open a story file from `docs/bmad/stories/`, e.g. `A1.sign-up-and-create-workspace.md`.

**Step 2.** Invoke the dev agent:

```
/bmad-agent-dev docs/bmad/stories/A1.sign-up-and-create-workspace.md
```

or use `/bmad-dev-story` and supply the path when prompted.

**Step 3.** The dev agent implements all Tasks and Subtasks (checkbox list with file paths), marks each `[x]` as it goes, then sets `Status: review`.

**Step 4.** Run peer review:

```
/bmad-code-review
```

**Step 5.** Verify the green-build gate:

```
pnpm typecheck && pnpm lint && pnpm test
```

All three must pass before the story is considered done.

---

## Hypothesis stories

`stories/_hypotheses/` contains stories for Epic F (public scorecard) and G3 (LIFF inbox). These items are marked ⚠ in `docs/aquawise-updated-docs/06-aquawise-hatchery-customer-doc.md` — they are hypotheses awaiting validation with P'Bunjong (Thai Aquaculture Federation) and the CEO.

**Do not implement hypothesis stories** until they are promoted to confirmed AC after stakeholder validation. The hatchery product is sequenced for 2027 per `docs/aquawise-updated-docs/02-aquawise-what-we-build-first.md`.

---

## Dev conventions enforced by story Dev Notes

Every story's **Dev Notes** section encodes these project constraints:

- **API facade** — all data access goes through `lib/api/index.ts`. Never call Supabase directly from a page or component.
- **i18n** — every user-facing string requires keys in both `messages/th.json` (default) and `messages/en.json`. Missing keys render `⚠️ {key}` in dev.
- **RBAC** — use `can(role, action)` from `lib/rbac.ts`. Never branch on role strings directly.
- **Server actions** — anything that writes `audit_log` or calls Stripe lives in `app/[locale]/(dashboard)/<page>/actions.ts`, colocated with its route.
- **Server components by default** — `'use client'` is opt-in. Add it only when state, effects, or event handlers are needed.
- **No `any`** — `as` casts are allowed only in adapter functions (`lib/api/supabase.ts` row mappers). App code must be fully typed.

---

## Running tests

```bash
# Run all tests
pnpm test

# Run a single test file
pnpm vitest run path/to/file.test.ts

# Run tests matching a name substring
pnpm vitest run -t "test name substring"

# Type and lint gates
pnpm typecheck   # tsc --noEmit (strict)
pnpm lint        # next lint
```

`pnpm typecheck` and `pnpm lint` are the mandatory green-build gates. Vitest coverage is currently thin; mock-mode click-through remains the primary verification path for UI flows.

---

## Story ID stability

Story IDs must never change. `A1` in this folder = row `A1` in `docs/work-breakdown/MATRIX.md` = story `A1` in `docs/product-spec/03-user-stories.md`. FR-IDs embedded in acceptance criteria must stay aligned across all three locations. If an AC change in Step 1 (spec refresh) affects a row, update `MATRIX.md` row text but leave the ID intact.

---

## Smoke proof — 2026-05-03

Two stories were run through a dev-agent dry run to validate that the BMAD story format is autonomously executable. Results below.

### A1 — Sign Up and Create a Hatchery Workspace (done story, verification pass)

**Objective:** Prove a "done" story gives the agent enough context to verify the implementation without human guidance.

| Check | Result | Notes |
|---|---|---|
| Task 1 — Bootstrap idempotency guard | PASS | `lib/auth/bootstrap.ts` checks `hatchery_members` before calling `create_hatchery` RPC. `app/auth/callback/actions.ts` calls `bootstrap()` after PKCE exchange. Mock-mode short-circuit confirmed in `lib/utils/mock-mode.ts`. |
| Task 2 — `create_hatchery` RPC location | PASS | RPC is in `supabase/migrations/004_billing.sql` (not `001_init.sql`). `trial_ends_at = now() + interval '30 days'` confirmed. Story file was corrected during this run (previously said `001_init.sql`). |
| Task 3 — Test coverage | PASS | `tests/auth/bootstrap.test.ts` exists with 2 cases: new-user creates workspace; idempotent re-run skips creation. Tests pass (`vitest run` exit code 0). |
| Task 4 — Live verification | SKIPPED | Requires Supabase credentials; deferred to manual QA. |

**Verdict:** 3/3 verifiable tasks PASS. Story format provided sufficient file paths, RPC names, and migration references for autonomous verification. One minor inaccuracy (RPC file location) was caught and fixed — demonstrating that the format also surfaces latent doc bugs.

### B3 — View Customer Detail and History (unimplemented story, dry-run)

**Objective:** Prove an unimplemented story gives the agent enough context to plan and begin implementation without human translation.

| Check | Result | Notes |
|---|---|---|
| Task 1 — Migration schema | PARTIAL | Agent identified that `customer_cycles` and `batch_buyers` already exist in `001_init.sql`. Original story said `CREATE TABLE` for both — would have failed at migration time. Story was rewritten: new `customer_cycle_history` table + `ALTER TABLE batch_buyers` instead. |
| Task 2 — `getCustomer()` query shape | PASS (dry-run) | Story provides exact join targets (`customer_cycle_history`, `batch_buyers` + `batches`), column names (`phone`, `line_id`, `address`), and the `notFound()` pattern. Agent confirmed sufficient detail to write the query. |
| Task 3 — Page component wiring | PASS (dry-run) | Story identifies all hardcoded blocks (contact, sparkline, batch history) with replacement data sources. Empty-sparkline i18n key provided. |
| Task 4 — Tests | PASS (dry-run) | 3 test cases specified with exact assertion targets. File path and run command provided. |

**Verdict:** Format is sufficient for autonomous implementation. The schema inaccuracy in Task 1 (CREATE vs ALTER for existing tables) was the only blocker — now fixed. All other tasks contained enough detail (file paths, column names, join shapes, i18n keys, RBAC actions) for an agent to implement without asking clarifying questions.

### Quality review findings (applied before smoke proof)

A cross-cutting review of all 27 stories + 8 UAT files found and fixed:
- 8 files referencing `batch_distributions` (correct: `batch_buyers`)
- 4 files referencing `retry_count` or `attempt_count` (correct: `attempts`)
- RBAC inversions in H2 (counter_staff vs lab_tech for `data:export`)
- Missing `pcr:write` action guidance in C1/C4
- Wrong RBAC proxy actions in D2 (`batch:write` → `customer:write`) and D3 (`batch:write` → `settings:write`)
- JSONB expression index mismatch in E4
- `line_user_id NOT NULL` constraint ignored in G2, G4, E4 INSERT patterns
- `alert_farms` join table not used in E4 (story referenced non-existent `alerts.affected_customer_ids`)

All fixes verified with grep sweeps: 0 remaining instances of incorrect names in `docs/bmad/`.
