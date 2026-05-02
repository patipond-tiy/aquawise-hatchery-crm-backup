# Task brief — Refresh `product-spec/` against latest business docs, then convert to BMAD-runnable format

**Created:** 2026-05-02
**Owner:** TBD (1 engineer, AI-orchestrated)
**Estimate:** 8–12 hours wall-clock, single person running parallel Claude agents
**Branch target:** `main`
**Reviewers:** CEO + tech lead

---

## Why

1. The upstream business docs were refreshed today (2026-05-02). A local mirror has been dropped at `docs/aquawise-updated-docs/` (7 files, 00–06) — this is the source of truth for any product/UX/copy decision in this task.
2. `docs/product-spec/` (9 files, ~3,000 lines, dated 2026-04-29) is a **first-draft engineering spec — not yet in BMAD format**. It was written against the older business docs and now lags slightly. The content is mostly good; it needs a light refresh, then conversion.
3. Today the spec is human-readable but **not in a format an AI dev agent can execute autonomously**. The goal is to layer the spec so a coding agent can pick up one story file and ship it without a human translating context (BMAD-METHOD).
4. Folder reorganization has already started: `docs/archive/business-guide/` holds the deprecated CBBE + FR docs (do **not** treat them as live). The new layered tree (`00-context/`, `10-product-spec/`, `20-bmad/`, `30-execution/`, `40-ops/`) has not been adopted yet — call that out of scope here unless trivial.

---

## Inputs to read first

### Source of truth (local mirror, refreshed today)

`docs/aquawise-updated-docs/`

| File | Use for |
|---|---|
| `00-aquawise-brand-foundation.md` | Voice, tone, anti-commitments — gates ALL user-facing copy |
| `01-aquawise-stakeholder-map.md` | Persona index across the ecosystem |
| `02-aquawise-what-we-build-first.md` | Sequencing — hatchery is **2027**, not now |
| `03-aquawise-farmer-customer-doc.md` | Farmer JTBDs (relevant for LINE-bot integration story) |
| `04-aquawise-nursery-customer-doc.md` | Nursery JTBDs |
| `05-aquawise-broker-customer-doc.md` | Broker JTBDs (price feed) |
| `06-aquawise-hatchery-customer-doc.md` | **Primary input for this repo.** ⚠ v0.5 — flag hypotheses, do not promote ⚠ items to AC |

### First-draft spec to refresh + convert

`docs/product-spec/` (9 files, dated 2026-04-29)

| File | Lines | What it is |
|---|---|---|
| `README.md` | ~50 | Read-order index |
| `00-overview.md` | 257 | JTBDs, tagline, two-sided market, NFRs |
| `01-personas.md` | 275 | Buyer + 5 operational personas + farmer counterpart |
| `02-feature-inventory.md` | 365 | Every UI control, status (✅/🟡/❌), FR-IDs |
| `03-user-stories.md` | 643 | ~25–30 stories, AC, FR-tagged, grouped by epic A–G |
| `04-flows.md` | 490 | Sequence diagrams |
| `05-line-integration.md` | 329 | CRM ↔ LINE bot |
| `06-production-gap.md` | 394 | Punch list |
| `07-brand-and-voice.md` | 167 | Engineering digest of brand doc |
| `08-roles-and-rls.md` | 153 | Auth model, RBAC, RLS |

### Execution layer (already exists, light updates only)

`docs/work-breakdown/`: `MATRIX.md` (843), `BY-PHASE.md`, `FR-COVERAGE.md`, `JTBD-ALIGNMENT.md`, `README.md`, `AGENTS.md`. Story IDs (A1, B2, …) here must match BMAD story file IDs.

### Method reference

BMAD-METHOD (`github.com/bmad-code-org/BMAD-METHOD`) — agents (Analyst/PM/Architect/SM/Dev/QA), templates (`prd-tmpl`, `architecture-tmpl`, `story-tmpl`), story sharding, `qa-gate`.

---

## Two-step deliverable

### Step 1 — Light refresh of `product-spec/` against `aquawise-updated-docs/`

The first draft is mostly correct. Don't rewrite it — diff it.

For each file in `product-spec/`:
- Diff against the matching `aquawise-updated-docs/` source.
- Patch deltas only: persona refinements, tone gates, sequencing reminders, hatchery hypotheses.
- Mark ⚠ items explicitly (per `06-aquawise-hatchery-customer-doc.md`). Do **not** promote ⚠ to confirmed AC.
- Update the link in `README.md` and `03-user-stories.md` that still references `docs/business-guide/...` — those files now live under `docs/archive/business-guide/`. Either rewrite the link to point to `archive/`, or better, point to `aquawise-updated-docs/` for the live intent.
- Add a CHANGE NOTE at the top of every touched file: *"Refreshed 2026-05-02 against `aquawise-updated-docs/<file>`."*
- Update `work-breakdown/MATRIX.md` row text wherever AC changed; keep IDs stable.

This is intentionally a **small** workstream — most of the time goes into Step 2.

### Step 2 — Convert refreshed spec into BMAD-runnable layer under `docs/bmad/`

Create `docs/bmad/` with:

- **`README.md`** — explains the layout, agent roles, and how to run a story end-to-end with an AI dev agent against this repo.
- **`prd.md`** — sharded PRD generated from `aquawise-updated-docs/` + refreshed `product-spec/00–02`.
- **`architecture.md`** — sharded architecture doc generated from this repo's root `CLAUDE.md` + refreshed `product-spec/08-roles-and-rls.md`.
- **`stories/`** — one `.md` per story (e.g. `A1.sign-up-and-create-workspace.md`), one-to-one with the stories in refreshed `product-spec/03-user-stories.md`. Use the **BMAD story template** with these sections fully filled:
  - Status / Story / Acceptance Criteria / Tasks & Subtasks (checkbox list with file paths)
  - **Dev Notes** must embed: file paths to touch, relevant API facade methods from `lib/api/`, RBAC actions from `lib/rbac.ts`, RLS table names, i18n keys to add to BOTH `messages/en.json` AND `messages/th.json`
  - Testing (Vitest + Playwright commands)
  - Change Log / Dev Agent Record / QA Results
  - Cover **every story currently in `03-user-stories.md` Epics A–G** (~25–30 stories).
  - ⚠ hatchery hypotheses go in `stories/_hypotheses/`, not `stories/`.
- **`uat/`** — one file per epic (`A-onboarding.uat.md` … `G-billing.uat.md`) in BMAD QA-gate style: each scenario = numbered Given/When/Then + an explicit **agent-runnable verification command** (Playwright spec path, or `pnpm vitest -t "..."`) + pass/fail decision rule, so a QA agent can execute the gate without human judgment.

### Step 3 — Agent harness + smoke proof

- Add `.bmad-core/` (or equivalent) so a coding agent can `*draft → *implement → *qa` a story file without extra prompting.
- Smoke-prove it: pick **one ✅ story and one ❌ story** from `MATRIX.md`, run a BMAD dev agent end-to-end against each, attach the transcripts to `docs/bmad/README.md` as evidence the format is autonomously executable.

---

## Constraints

- **AI-agent-led authoring.** Use `ultrawork` / `team` to fan out: Analyst agent for Step 1 diffs, PM agent for PRD shard, Architect agent for architecture shard, SM agent to draft each story, QA agent to draft UAT. Human orchestrates and reviews — does not first-draft.
- **Bilingual-aware.** Every user-facing string in stories/UAT must specify both `en.json` and `th.json` keys. Default surface is `th`.
- **Voice gate.** Re-check copy against `aquawise-updated-docs/00-aquawise-brand-foundation.md` (no "AI-powered", no "platform", no emoji on professional surfaces, no dark mode, no customization).
- **Sequencing.** Hatchery items remain **2027** per `02-aquawise-what-we-build-first.md`. Don't promote ⚠ hypotheses into committed stories.
- **Stable IDs.** Story `A1` must trace to row `A1` in `work-breakdown/MATRIX.md`, story `A1` in `product-spec/03-user-stories.md`, and `bmad/stories/A1.*.md`, sharing the same FR-IDs.
- **Don't touch `archive/`.** It's there for history. If a refresh needs the old CBBE/FR text, copy what's needed into the new doc — don't link into archive.
- **Zero broken links** at PR time — automated link-check required across `docs/`, `hatchery-crm/CLAUDE.md`, `hatchery-crm/README.md`, and the umbrella's CLAUDE.md/README.

---

## Definition of Done

- [ ] Every file in `product-spec/` has a "Refreshed 2026-05-02" note and passes a reviewer diff against `aquawise-updated-docs/`.
- [ ] Stale `business-guide/` links rewritten to `aquawise-updated-docs/` (or removed). No links into `archive/` from live docs.
- [ ] `docs/bmad/` exists with PRD, architecture, ≥25 story files, and 7 epic UAT files.
- [ ] `work-breakdown/MATRIX.md` row text reflects refreshed AC; row IDs unchanged.
- [ ] Two BMAD agent transcripts attached, demonstrating autonomous story execution end-to-end (one ✅, one ❌).
- [ ] Markdown link-checker passes across `docs/`, `hatchery-crm/CLAUDE.md`, `hatchery-crm/README.md`, umbrella CLAUDE.md/README.
- [ ] `pnpm typecheck` and `pnpm lint` green.
- [ ] PR opened on `main` with reviewers = CEO + tech lead.

---

## Manhour estimate — 8–12h, one person, parallel Claude agents

The estimate assumes the engineer acts as an **orchestrator/reviewer**, not an author — fanning out work via `ultrawork` / `team` mode while reviewing batched output. The first draft already exists, so Step 1 is small.

| Hour | Activity | Parallelism strategy |
|---|---|---|
| 0–1 | Read `aquawise-updated-docs/` 00–06; skim `product-spec/`; design BMAD folder layout | Solo |
| 1–3 | **Step 1 — Refresh `product-spec/`** against `aquawise-updated-docs/` | Fan out 5 reconciliation agents (one per pairing where there's overlap); review diffs as they finish |
| 3–4 | BMAD harness install + `.bmad-core/` config; PRD + Architecture shards drafted | 2 parallel drafting agents |
| 4–8 | Author 25–30 BMAD story files | Fan out 8–10 SM-agents at once; batch-review |
| 8–9 | Author 7 epic UAT files | 7 parallel QA-agents (one per epic) |
| 9–10 | Smoke-run (1 ✅ + 1 ❌ story end-to-end via BMAD dev agent); patch any Dev Notes gaps | Solo |
| 10–11 | `MATRIX.md` row updates from refreshed AC | Solo, scripted where possible |
| 11–12 | Cross-repo link-check; CLAUDE.md / README updates; PR | Solo |

### What makes 8–12h achievable

1. **Step 1 is a refresh, not a rewrite** — the first-draft `product-spec/` is mostly correct. Diffs are surgical, not page-by-page rewrites.
2. **Ultrawork/team fan-out** on Step 2 (25-story authoring) — drafting goes from O(N) to O(N/parallelism); human review stays sequential but is fast on AI output.
3. **AI-drafted, human-reviewed**, not human-authored. CEO does a single end-of-PR copy pass.
4. **Story Dev Notes templated once** — every story slots into the same shape, agents fill the slots.
5. **Smoke-run early** — run after the first 3 stories, not after all 30, so Dev Notes template gaps get fixed before they multiply.

### What blows it past 12h (call out before starting)

| Risk | Impact | Mitigation |
|---|---|---|
| CEO review cycle on tone/copy | +4–8h **wait** time (not work) | Get CEO to commit to a same-day review window |
| Smoke-run fails on the ❌ story → Dev Notes template needs rework → re-author 5+ stories | +4–6h | Run the smoke after 3 stories, not after 30 |
| ⚠ hatchery hypothesis triage needs CEO sync | +2–4h wait | Surface them in a single batch, not one-by-one |
| Hidden coupling: refreshed spec changes AC enough that `MATRIX.md` row updates cascade into BMAD story rewrites | +2–3h | Sequence the work — finish Step 1 + MATRIX before drafting BMAD stories |

**Confidence:** ±25%. Happy path lands at 9–10h; one review cycle pushes to 12h; CEO unavailability or smoke-run failure pushes to 16h+.
