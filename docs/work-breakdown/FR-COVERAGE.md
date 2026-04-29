# FR-COVERAGE — Functional requirements ↔ implementing stories

The hatchery CRM has **two layers of functional requirements** that don't share an ID space. This file reconciles both.

## Two FR-ID systems in use

### 1. Canonical surfaces (from `business-guide/aquawise-hatchery-functional-requirements (2).md`)

**F-prefix (farmer-facing):** F1–F9 — surfaces that live on the farm-side AquaWise app + LINE bot. **Most are out of scope for this hatchery CRM** — the farm-side codebase owns them. Listed here only to document cross-product dependencies.

**H-prefix (hatchery-facing):** H1–H10 — surfaces in the hatchery CRM (this codebase).

These are the **canonical, business-team-owned IDs**. Every line of design work and every PR that ships hatchery functionality should reference one of H1–H10.

### 2. Sub-IDs (from `product-spec/03-user-stories.md`)

The product-spec author created fine-grained sub-IDs (FR-AUTH-001, FR-WS-002, FR-CUST-003, etc.) for traceability — they don't appear verbatim in the canonical FR doc. These are **derived requirements** that decompose the H1–H10 surfaces into testable pieces.

When working on a story, refer to **both**: the canonical H-id (what business team called it) and the derived FR-id (what the AC tests).

## Schema drift to reconcile

Two known mismatches between spec and code today:


| Drift            | Spec says                                                                                  | Code says                                                                                       | Reconciliation                                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Role enum values | `(owner / counter_staff / lab_tech / auditor)` per `08-roles-and-rls.md` and `FR-TEAM-002` | `(owner / admin / editor / viewer / technician)` in `supabase/migrations/001_init.sql:23`       | New migration to rename values + backfill. **Do this before A2.i (team invite) lands** — the invite modal must accept the spec values. |
| Trial duration   | `14-day` per `03-user-stories.md` §A1 AC list and `FR-AUTH-003`                            | `30-day` per repo `README.md` and product-spec `00-overview.md` (mentions 30-day no-card trial) | Confirm with business team. README/overview wins — A1 should target 30-day. Update `03-user-stories.md` AC if confirmed.               |


---

## H-surfaces (canonical, business-guide FR doc)


| FR      | Surface                               | Phase (FR doc)         | Implementing stories                                                                                                                                     | Status (rollup) | Notes                                                                                                                   |
| ------- | ------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **H1**  | Counter Batch Entry (LIFF)            | H1                     | *No story today.* The hatchery CRM has `add-batch-modal.tsx` but it's a **webapp** modal, not a LIFF surface. C1 covers webapp; LIFF surface is missing. | ❌               | **Coverage gap.** FR doc requires LIFF for 15-second counter-staff sale. Add new story `C5 — LIFF counter batch entry`. |
| **H2**  | Hatchery Dashboard Home               | H1                     | Implicitly served by all dashboard parent rows; no single story scoped to "redesign dashboard" but FR-BATCH-003 (P1.1) replaces hardcoded hero stats.    | 🟡              | Dashboard renders ✅; hero stats hardcoded; counts as P1 work.                                                           |
| **H3**  | Customer & Cycle List                 | H1                     | B1 + FR-SEARCH-001 (Cmd-K palette, no current story)                                                                                                     | 🟡              | List + search + tab filter wired; Cmd-K palette is a missing story (`B5`?).                                             |
| **H4**  | Customer Detail                       | H2                     | B3, B4                                                                                                                                                   | 🟡              | Header + stats wired; sparkline + contact + history hardcoded.                                                          |
| **H5**  | Batch Register                        | H2                     | C1                                                                                                                                                       | 🟡              | UI wizard ✅; PCR upload to Storage ❌.                                                                                   |
| **H6**  | Batch Detail & Certificate Generator  | H2                     | C2, C3, C4                                                                                                                                               | 🟡              | Detail wired; cert generation ❌.                                                                                        |
| **H7**  | Restock Timing Predictor              | H2                     | D1, D2, D3, G4                                                                                                                                           | 🟡              | List + groups wired; quote/broadcast/cron ❌.                                                                            |
| **H8**  | Hatchery Scorecard (private + public) | H3                     | F1, F2, F3, F4                                                                                                                                           | 🟡              | Editor toggles ✅; public route ❌. **Note FR doc says H3, but `06` accelerates F2/F4 to H2 (Week 9) — confirm phasing.** |
| **H9**  | Disease Traceback Alert               | H3                     | E1, E2, E3, E4                                                                                                                                           | 🟡              | E1/E3 wired; E2 (auto-create) and E4 (notify) deferred.                                                                 |
| **H10** | Hatchery Settings & Preferences       | H2 (basic) → H3 (full) | A3, H1, H2, H3, H4, X1                                                                                                                                   | 🟡              | Notif toggles + billing ✅; profile/team/exports/quiet-hours/dead-letter ❌.                                              |


---

## F-surfaces (farmer-facing — out of scope for this codebase)

These belong to the **farm-side AquaWise app + LINE bot**. Documented here for cross-product visibility only. Status reflects whether the hatchery CRM has a *trigger* for the surface, not whether the farm-side surface itself is built.


| FR  | Surface                                    | Hatchery-CRM trigger         | Status | Notes                                                   |
| --- | ------------------------------------------ | ---------------------------- | ------ | ------------------------------------------------------- |
| F1  | QR Onboarding Flow                         | A3 (brand QR generation)     | ❌      | A3 must produce a printable QR PDF. Not in current AC.  |
| F2  | Welcome & First-Touch (Bot)                | None — farm-side OA          | 🚫     | Farm-side scope.                                        |
| F3  | Daily Price Feed                           | None — farm-side cron        | 🚫     | Farm-side scope.                                        |
| F4  | Batch Certificate (received from hatchery) | C4 (cert send)               | 🟡     | CRM enqueues cert Flex; farm-side renders.              |
| F5  | Cycle Progression Updates                  | None — farm-side cron        | 🚫     | Farm-side scope.                                        |
| F6  | Day-30 Survival Report Prompt              | None — farm-side prompt      | 🚫     | Farm-side. CRM consumes resulting `farm_cycle_metrics`. |
| F7  | Day-60 Survival Report Prompt              | None — farm-side prompt      | 🚫     | Farm-side.                                              |
| F8  | Harvest Reporting                          | None — farm-side prompt      | 🚫     | Farm-side.                                              |
| F9  | Same-Batch Cross-Farm Context              | None — farm-side conditional | 🚫     | Farm-side, Phase H3.                                    |


---

## Sub-IDs (from product-spec) → implementing stories


| FR sub-ID          | What it requires                                           | Implementing stories                           | Status | §06            |
| ------------------ | ---------------------------------------------------------- | ---------------------------------------------- | ------ | -------------- |
| **FR-AUTH-001**    | Magic-link signup                                          | A1                                             | 🟡     | P0.1           |
| **FR-AUTH-002**    | Stripe webhook reconciliation                              | H3                                             | 🟡     | P0.4           |
| **FR-AUTH-003**    | 14-day trial + countdown (or 30-day per repo)              | A1, H3                                         | 🟡     | —              |
| **FR-WS-001**      | Workspace bootstrap on first sign-in                       | A1                                             | 🟡     | P0.1           |
| **FR-WS-002**      | Profile update persists to `hatcheries` + `hatchery_brand` | A3                                             | ❌      | P0.5           |
| **FR-WS-003**      | RLS on every tenant table                                  | (cross-cutting)                                | 🟡     | P0.3           |
| **FR-CUST-001**    | Customer metadata (phone, line_id, address, name)          | B1, B2, B3                                     | 🟡     | P1.2           |
| **FR-CUST-002**    | Derived D30/D60/harvest trend (last 6 cycles)              | B3                                             | 🟡     | P1.3           |
| **FR-CUST-003**    | Batch distribution history per customer                    | B3                                             | 🟡     | P1.2           |
| **FR-CUST-004**    | Search by name/phone/LINE ID                               | B1                                             | 🟡     | (Cmd-K → P2.9) |
| **FR-BATCH-001**   | Per-disease PCR results                                    | C1, C3                                         | 🟡     | P1.4           |
| **FR-BATCH-002**   | Survival at D30/D60/harvest                                | C1, C3                                         | 🟡     | P1.4           |
| **FR-BATCH-003**   | Aggregate to dashboard hero                                | (no story; P1.1 is dashboard hero replacement) | ❌      | P1.1           |
| **FR-BATCH-004**   | PCR cert PDF + LINE delivery                               | C4                                             | 🟡     | P1.8           |
| **FR-LINE-001**    | Enqueue `line_outbound_events` on every send               | G3' (foundational), D2, C4, E4, F3, G2         | ❌      | P0.2           |
| **FR-LINE-002**    | Worker consumes queue, sends Flex                          | G3'                                            | ❌      | P0.2           |
| **FR-LINE-003**    | `line_message_logs` audit trail                            | G2 (Activity panel)                            | ❌      | P1.12          |
| **FR-LINE-004**    | LIFF bind + `/api/line/bind`                               | G1                                             | 🟡     | P1.9           |
| **FR-LINE-005**    | Rich-menu templates                                        | G3' (Phase H1 reuse)                           | ❌      | P0.2           |
| **FR-QUOTE-001**   | Quote create                                               | D2                                             | 🟡     | P1.7           |
| **FR-QUOTE-002**   | Quote send via LINE                                        | D2                                             | 🟡     | P1.7           |
| **FR-QUOTE-003**   | Quote status tracking                                      | D2                                             | 🟡     | P1.7           |
| **FR-NOTIF-001**   | Respect notif toggles at delivery                          | H1                                             | 🟡     | P1.10          |
| **FR-NOTIF-002**   | Daily cron 09:00 ICT for restock/harvest                   | G4                                             | ❌      | P2.3           |
| **FR-NOTIF-003**   | Auto-trigger from farm-side D30 breach                     | E2                                             | ❌      | P2.4           |
| **FR-NOTIF-004**   | Quiet hours per customer                                   | H4                                             | ❌      | P1.11          |
| **FR-TEAM-001**    | Email-based async invite + token                           | A2                                             | 🟡     | P1.6           |
| **FR-TEAM-002**    | 3+1 roles (owner / counter_staff / lab_tech / auditor)     | A2 + schema reconciliation                     | 🟡     | (drift)        |
| **FR-TEAM-003**    | List from `hatchery_members` join `auth.users`             | A2                                             | 🟡     | P1.5           |
| **FR-BILLING-001** | Block features on trial expired/unpaid (read-only banner)  | H3                                             | 🟡     | P0.4           |
| **FR-SEARCH-001**  | Cmd-K palette over customers/batches/alerts                | (no story today)                               | ❌      | P2.9           |
| **FR-SEARCH-002**  | Export CSV / ZIP / backup                                  | H2                                             | ❌      | P2.7           |
| **FR-DATA-001**    | `data_exports` audit log                                   | H2                                             | ❌      | P2.7           |
| **FR-DATA-002**    | Stream exports + signed URLs                               | H2                                             | ❌      | P2.7           |
| **FR-PUBLIC-001**  | Public scorecard at `/{locale}/h/{slug}`                   | F2                                             | ❌      | P2.1           |
| **FR-PUBLIC-002**  | Show verified credentials                                  | F2                                             | ❌      | P2.1           |
| **FR-PUBLIC-003**  | ISR 6h + SEO indexable                                     | F4                                             | ❌      | P2.1b          |


---

## Uncovered FRs (no implementing story today)

These are **spec gaps** — a requirement exists but no story claims it. Decide before sprinting: write a new story or explicitly defer.


| FR                          | What it requires                                                                                        | Decision needed                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **H1 (LIFF counter entry)** | 15-second LIFF surface for counter staff to register a batch + customer in LINE without leaving the app | **Add story `C5`** in product-spec (Phase H2) — distinct from C1 webapp wizard                  |
| **FR-BATCH-003**            | Aggregate stats to dashboard hero (5/8, 82%, 3 ฟาร์ม · ~620k PL)                                        | **Add story to MATRIX** — currently `06 P1.1` is the only reference; promote to `B0` or `D0`    |
| **FR-SEARCH-001**           | Cmd-K palette over customers/batches/alerts                                                             | **Add story** — currently P2.9 only                                                             |
| **FR-LINE-003**             | `line_message_logs` Activity panel on customer detail                                                   | **Implicit in G2 today** but should be its own story; `06 P1.12` calls it out                   |
| **A3 → F1 link**            | Hatchery onboarding QR poster generation (FR doc Section 7 step 3)                                      | **Extend A3 AC** to include "owner downloads QR poster (auto-generated PDF with hatchery name)" |


---

## NFR coverage

The FR doc and `00-overview.md` "Non-functional commitments" list NFR budgets. No story directly owns these — they're cross-cutting acceptance gates. Track separately.


| NFR                                       | Budget        | Implementing layer                              | Owner                                                  |
| ----------------------------------------- | ------------- | ----------------------------------------------- | ------------------------------------------------------ |
| Dashboard ≤ 2s on 4G                      | Performance   | TanStack Query staleTime, Tailwind 4 CSS budget | (cross-cutting)                                        |
| PCR cert generation ≤ 5s                  | Performance   | C4 server action                                | C4.t includes timing assertion                         |
| Quote send (DB + queue) ≤ 1s              | Performance   | D2 server action                                | D2.t includes timing assertion                         |
| Batch creation w/ 10 PCR rows ≤ 3s        | Performance   | C1 server action                                | C1.t                                                   |
| WCAG 2.1 AA                               | Accessibility | All UI; Tailwind tokens already a11y-aware      | Phase 5 polish (P3.5) — re-audit                       |
| RLS on every tenant table                 | Security      | All migrations                                  | P0.3 cross-tenant audit                                |
| Stripe webhook signature verified         | Security      | H3 (already ✅ in code, verify in test)          | H3.t                                                   |
| Magic-link 24h expiry                     | Security      | A1                                              | A1.t                                                   |
| Invite token 7d default                   | Security      | A2                                              | A2.t                                                   |
| All UI strings in `messages/{th,en}.json` | i18n          | every story                                     | CI check (mentioned in FR doc — confirm exists or add) |
| Every LINE push logged                    | Observability | G3' includes `line_message_logs` write          | G3'.t                                                  |
| Dead-letter UI                            | Observability | X1                                              | X1                                                     |


> **Recommend:** add an NFR-COVERAGE.md sister file later if the team wants to formally track these. For Phase H1 the cross-cutting NFR work happens inside individual stories' `.t` and `.v` rows.

---

## How to use this file

- **Scoping a story?** Look up its FR-IDs in the canonical (H1–H10) and sub-ID tables. Confirm the surface is in the right phase.
- **Sprint planning?** Filter by Status = ❌ at high P0/P1 priorities — those are the stories whose FR coverage is currently zero.
- **PR review?** PR description should cite at least one FR-ID. If none cited, ask: "what FR does this satisfy?" If answer is "none" — reconsider the PR per "Slow is right."
- **Quarterly audit?** Re-run the "Uncovered FRs" check. New FRs from the business team must spawn new stories within one sprint.

