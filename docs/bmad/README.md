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
