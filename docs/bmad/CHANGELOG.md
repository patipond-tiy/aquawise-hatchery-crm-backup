# BMAD doc-state CHANGELOG

> Consolidated record of the 2026-05-15 doc-hardening session. One scannable index of *what changed, why, and what's still open*. Authoritative for "what state are the docs in?"; per-PR detail is in git history; durable rationale is in `code-design.md` §19 and `decisions-2026-05-15-fix-review.md`.

## Sessions

### 2026-05-15 — pre-agent-dev doc hardening (PRs #2–#12, merged to `qa/chain+bear+day-2026-05-15`)

Goal: make the BMAD doc set safe to drive autonomous "docs → agents → human QA" development.

| PR | Theme | Outcome |
|---|---|---|
| #2 | Code-design handbook + security catalog | `code-design.md` (19-§ recipes/anti-patterns/§16 merge gate) + `security.md` (OWASP threat catalog) authored |
| #3 | Epic S security stories | S1–S9 created (CVE patch, RBAC hardening, RLS, secrets, etc.) |
| #4 #5 | FIX-REVIEW cascades | C2 (auditor→H3), D3 (RBAC), D2 (G3 deferred — CEO-ratified) propagated from `02.to-fix.md` decisions |
| #6 | Executability audit | `04.executability-audit.md` — every story's refs vs the live codebase; **16 BLOCKERs** + 21 WARN found (incl. a FIX-AUTO-introduced bug: `batch_distributions` → nonexistent table) |
| #7 #8 | Executability fixes + S7/DSR-SPEC | 16/16 BLOCKERs resolved (grep-verified); `DSR-SPEC.md` mirrored in-repo; SYS-1 migration ledger established |
| #9 | docs/ authority reorg | `docs/README.md` + rewritten `docs/AGENTS.md` (authority map); `PLAN.md`/`CHECKLIST.md`/`line-integration-strategy.md` → `docs/archive/` |
| #10 | product-spec/MATRIX provenance | AUTHORITY banners: these are the ID-traceability index + provenance, not authoritative content (the bmad story wins) |
| #11 | K-series cross-product contract | `K-INTEGRATION-CONTRACT.md` mirrored; K1–K4 repointed; **K5** (list-active-codes) + **K6** (batches.species, migration 026) gap-closer stories added |
| #12 | QA-folder reorg + this CHANGELOG | `00–04` meta-files moved `stories/` → `bmad/qa/`; all refs repointed (zero stale); this file added |

### Durable decisions (the ones future readers must not relitigate)

- **C2** — mean-D30-per-batch sourced from `batch_buyers.d30` (the `customer_cycles.batch_id` join is impossible — no such column).
- **E4** — `alert_severity` enum gains `'critical'` via migration **023** (the K-fan-out depends on it).
- **H2** — `data:export` story matches code: `['owner','counter_staff','auditor']` (story claim was a regression).
- **G3 two-way LIFF chat** — **deferred to H3, CEO-ratified.** Promoting it contradicts the nursery customer doc §7/§10 (no automated outreach; "not a CRM"). The moat is Scene 1 (the defended dispute), not chat.
- **SYS-1 migration ledger** (collision-verified, one number ↔ one file): 013 batch_code_and_claims (K1; K3 RPC appended) · 014 quotes (D2) · 015 customer_history (B3) · 016 alert_resolutions (E3) · 017 quiet_hours (H4) · 018 line_is_manual (H4) · 019 data_exports (H2) · 020 batch_certs (C4) · 021 d30_trigger (E2) · 022 dead_letter_resolved (X1) · 023 alert_severity_critical (E4) · 024 customer_callbacks (B4) · 025 dsr (S7) · 026 batches_species (K6).
- **Provenance model** — `bmad/stories/<ID>.md` is authoritative on content. `product-spec/03-user-stories.md` + `work-breakdown/MATRIX.md` are the **story-ID traceability index + provenance**; their prose may lag; IDs are the stable contract. K-series (K1–K6) is outside the original WBS ID-triple by design.
- **Mirror pattern** — shared cross-product specs (`DSR-SPEC.md`, `K-INTEGRATION-CONTRACT.md`) live as in-repo mirrors under `docs/aquawise-updated-docs/` with a "source of truth is the umbrella" header; conform, don't edit the mirror.
- **`stories/` is runnable-only** — QA/audit process artifacts live in `bmad/qa/`.

### Gated follow-ups (NOT done — require explicit cross-repo approval)

1. line-bot `architecture.md` ADR-018 reconcile to `K-INTEGRATION-CONTRACT.md` (its "both services trust the same key" is superseded by the dual-audience model) + fix its stale `c:\Bear_Work\…` path.
2. line-bot DSR endpoint story (DSR-SPEC §6 — farmer-identity-erasure half).
3. Umbrella `aquawise-ecosystem/aquawise-docs/` source-of-truth for `DSR-SPEC.md` + `K-INTEGRATION-CONTRACT.md`, and the line-bot mirrors.

The hatchery-crm mirrors are self-sufficient for agent execution; (1)–(3) are consistency hygiene. The contract docs declare themselves authoritative over line-bot's ADR-018, so line-bot cannot silently drift in the interim.

### Standing orthogonal item (independent of all doc work)

- **Live CVE:** `pnpm-lock.yaml` resolves `next@16.2.4`, still vulnerable to GHSA-36qx-fr4f-26g5 (i18n middleware bypass; patched ≥16.2.5). Run `pnpm up next@latest` in the live working copy — exploitable now, gated on nothing.

### Recommended next action

Before scaling the agent fleet, **smoke-test ONE already-CLEAN story** (`A2` or `H3`) end-to-end through a real BMAD dev agent (`pnpm typecheck && pnpm lint && pnpm test` + the `code-design.md` §16 checklist). Empirically proves the docs→agent→QA pipeline on 1 story before betting the 90-day plan on 42.

---

*Append new sessions above the previous one (newest first). Keep entries scannable — durable rationale belongs in `code-design.md` §19, not here.*
