# AquaWise Hatchery CRM — Product Requirements Document

**Version:** 1.0 (2026-05-03)
**Status:** Active scaffold — hatchery-specific features are 2027+ hypotheses
**Audience:** AI dev agents (BMAD execution layer). Not a stakeholder document.
**Source truth:** `docs/aquawise-updated-docs/06-aquawise-hatchery-customer-doc.md` (v0.5) · `docs/aquawise-updated-docs/02-aquawise-what-we-build-first.md` · `docs/product-spec/00-overview.md` · `docs/product-spec/01-personas.md` · `docs/product-spec/02-feature-inventory.md`

---

## 1. Product Vision

AquaWise Hatchery CRM is a Thai/English SaaS cockpit for shrimp and fish hatchery operators in Southeast Asia. It closes the loop between a hatchery's post-larvae batches and downstream farm outcomes, giving the operator verifiable evidence to defend their reputation, manage a small high-stakes customer base, and make their careful craft visible to nursery buyers they have not yet met. The current repo is a nursery-style CRM scaffolded against hatchery vocabulary; serious hatchery product investment begins in 2027 once nursery and farmer cycle data exists at scale.

**Boundary:** Do not add hatchery-specific features beyond the current scaffold before the 2027 P'Bunjong validation conversations. The scaffolded app ships Phase H1 production-readiness first.

---

## 2. Sequencing Context

| # | Stakeholder | Timeline | Gate |
|---|---|---|---|
| 1 | Farmer | 2026 (now) | LINE bot น้องน้ำ; 50 daily users, 30+ complete cycles |
| 2 | Nursery (โรงอนุบาล) | 2026 (now, parallel) | QR onboarding; 5 paying nurseries |
| 3 | Broker / ล้ง | 2026 (opportunistic) | Price-feed revenue; 1+ paying broker |
| 4 | **Hatchery (โรงเพาะฟัก)** | **2027** | Nursery dataset at scale; P'Bunjong onboarded |
| 5 | Feed company | 2027 | 500+ farmers; field-rep tooling |
| 6 | Bank / BAAC | 2028+ | Multi-year cycle history per farm |

**Why hatchery is 4th:** Hatcheries care about cross-nursery survival data attributable to their broodstock lineages. That data does not exist until nurseries and farmers are at scale. Building hatchery-specific features in 2026 splits team attention before the nursery target is hit. The data flywheel is: nurseries distribute farmers → farmers generate cycle data → validated batches flow back → trust artifacts attract upstream hatcheries.

**Boundary:** Any feature request for stakeholder 5 or 6 is auto-rejected in 2026. Any hatchery-specific feature beyond the current scaffold waits for 2027.

---

## 3. Personas

> ⚠ Hatchery personas are 2027+ hypotheses pending validation with P'Bunjong and other hatchery operators. Do not treat any specific job, scene, or behavior as confirmed customer reality. Source: `docs/product-spec/01-personas.md` + `docs/aquawise-updated-docs/06-aquawise-hatchery-customer-doc.md` v0.5.

### Operational personas (inside the hatchery)

| ID | Name | Role | Thai title | Key pain | RBAC role |
|---|---|---|---|---|---|
| P1 | Owner / Hatchery boss | Buyer and primary user; dashboard, restock, alerts | คุณสุเทพ | Unfair blame when downstream farms fail; no verifiable D30 data to defend batches | `owner` |
| P2 | Hatchery manager | Day-to-day operations; batch registration, PCR upload, delivery scheduling | คุณนิภา | PCR PDFs scattered in email; no single place for batch lineage | `counter_staff` (often co-`owner`) |
| P3 | Customer rep | Outbound contact; restock calls, LINE quotes, delivery follow-up | คุณรัตนา | Forgets callbacks; quotes sent from personal LINE look unprofessional | `counter_staff` |
| P4 | PCR / Lab officer | Narrow: upload PCR results, flag positive batches | คุณพรชัย | PCR workflow is paper-first; no structured digital upload | `lab_tech` |
| P5 | Read-only auditor | Compliance reads; batch lineage and PCR records, no commercial data | คุณมานพ | Cannot export clean compliance data without seeing customer LTV | `auditor` *(planned Phase H3)* |

### External and influence personas (not CRM users)

| ID | Name | Role | Thai title | Key context | RBAC role |
|---|---|---|---|---|---|
| P6 | Shrimp farmer | Farm-app user; receives hatchery LINE Flex, logs cycle data | พี่ชาติ | Never logs into the CRM; identified by `line_user_id` on the farm-side LINE bot | None in CRM |
| P7 | Association president | Influence persona; P'Pong is first nursery pilot, P'Bunjong is 2027 hatchery target | พี่ปอง / พี่บุญจง | Brand trust propagates through associations, not ads; his endorsement gates peer adoption | `owner` of his own operation |

**Boundary:** P5 (auditor) role is reserved in the enum from day one but the auditor surface ships Phase H3. P6 never touches the CRM dashboard.

---

## 4. Jobs To Be Done

> ⚠ Jobs J1–J5 below reflect the current CRM scaffold (nursery-style vocabulary adapted to hatchery context). The hatchery customer doc (v0.5) defines five distinct hatchery-specific jobs (H-J1 through H-J5) that differ materially and are explicitly hypotheses pending P'Bunjong validation in 2027. Do not treat either set as confirmed hatchery requirements. They will need reconciliation before any 2027 hatchery sprint.

### Scaffold jobs (current CRM, nursery-style vocabulary)

| ID | When (situation) | I want to | So that | Owner's words |
|---|---|---|---|---|
| J1 | A customer hasn't reordered in a while | Know if their cycle's ending soon and reach out before a competitor does | I keep the customer | "ลูกค้าไม่กลับมา" |
| J2 | A farmer says "your PL was bad" | Show evidence about that specific lot — PCR results, what other buyers saw, D30 across all farms that bought it | I'm not blamed unfairly | "เกษตรกรว่า PL ไม่ดี" |
| J3 | A prospect or association peer asks how good I really am | Hand them a verifiable scorecard with externally-checkable numbers | I close on facts, not promises | "พิสูจน์ว่าโรงเพาะเราดี" |
| J4 | I want to be a serious, modern operator | Run on a system instead of LINE groups + paper notebooks | I look as professional as I actually am | "อยากเป็นโรงเพาะที่จริงจัง" |
| J5 | I want to grow beyond my existing customers | Have a public proof artifact a stranger can find or scan | New farmers reach out without a cold sales call | "อยากได้ลูกค้าใหม่" |

### ⚠ Hatchery-specific jobs (2027+ hypotheses — not yet confirmed)

| ID | Job | Source scene | Validation gate |
|---|---|---|---|
| H-J1 | ⚠ Defend broodstock lineages when blamed for downstream problems two steps removed | §3 Job 1, Scene 1 | P'Bunjong conversation 2027 |
| H-J2 | ⚠ See how broodstock lineages actually perform across nurseries and farms | §3 Job 2, Scene 2 | P'Bunjong conversation 2027 |
| H-J3 | ⚠ Manage a small (20–40) but high-stakes nursery customer base | §3 Job 3 | P'Bunjong conversation 2027 |
| H-J4 | ⚠ Prove "careful tier" status when the industry consolidates | §3 Job 4, Scene 3 | 2028+ — depends on AquaWise nursery scale |
| H-J5 | ⚠ Adapt to industry changes faster than competitors using cross-chain trend data | §3 Job 5, Scene 4 | 2028+ — requires years of operating data |

**Boundary:** H-J1 through H-J5 must not be designed or built until validated. Any feature referencing lineage tracking, cross-nursery outcome attribution, or industry trend reports is blocked pending 2027 validation.

---

## 5. Feature Inventory Summary

> Source: `docs/product-spec/02-feature-inventory.md`. Status reflects mock-mode prototype state as of 2026-05-02.

| ID | Feature | Status | Phase | Epic | ⚠ |
|---|---|---|---|---|---|
| H1-DASH | Dashboard hero stats (live from DB) | ❌ Hardcoded | H1 | A | |
| H1-DASH-NAV | Dashboard navigation links | ✅ Wired | H1 | A | |
| H2-CUST-LIST | Customer list + search | ✅ Wired | H1 | B | |
| H2-CUST-DETAIL | Customer detail — phone, LINE ID, address | ❌ Hardcoded | H1 | B | |
| H2-CUST-BATCHES | Customer batch history table | ❌ Hardcoded | H1 | B | |
| H2-CUST-D30 | Customer D30 trend sparkline | 🟡 Synthetic | H1 | B | |
| H3-BATCH-LIST | Batches list | ✅ Wired | H1 | C | |
| H3-BATCH-ADD | Add Batch modal (3-step) | ✅ Wired (PCR step UI-only) | H1 | C | |
| H3-BATCH-DETAIL | Batch detail — buyers table | ❌ Hardcoded | H1 | C | |
| H3-BATCH-PCR | Batch PCR results (per disease) | 🟡 Partial | H1 | C | |
| H5-CERT-PRINT | PCR certificate PDF generation | 🟡 Toast only | H1 | C | |
| H5-CERT-LINE | PCR certificate LINE delivery | ❌ Unwired modal | H1 | C | |
| H7-RESTOCK | Restock pipeline + stat cards | ✅ Wired | H1 | D | |
| H7-BROADCAST | Restock broadcast to all farms | 🟡 Toast only | H1 | D | |
| H6-ALERTS | Alerts list + severity cards | ✅ Wired | H1 | E | |
| H6-ALERT-CLOSE | Close alert mutation | ✅ Wired | H1 | E | |
| H6-ALERT-MSG | Send message to affected farms | 🟡 Toast only | H1 | E | |
| H9-SCORECARD | Scorecard settings toggles | ✅ Wired | H1 | F | ⚠ |
| H9-SCORE-PDF | Scorecard PDF download | 🟡 Toast only | H1 | F | ⚠ |
| H9-SCORE-PUBLIC | Public profile URL + QR | ❌ Not implemented | H2 | F | ⚠ |
| H10-PROFILE | Settings profile save | ❌ Dead inputs | H1 | H | |
| H10-LOGO | Logo upload | ❌ UI only | H1 | H | |
| H8-NOTIF | Notification toggles | ✅ Wired | H1 | H | |
| H8-QUIET | Quiet hours fields | ❌ Schema missing | H2 | H | |
| H8-TEAM | Team list from DB | ❌ Hardcoded constant | H1 | H | |
| H8-INVITE | Team invite submission | ❌ Unwired modal | H1 | H | |
| H8-EXPORT | Data exports (CSV, ZIP, backup) | ❌ No-op | H2 | H | |
| O1-BOOTSTRAP | Workspace bootstrap on first sign-in | ❌ Not implemented | H1 | X | |
| O2-LINE-QUEUE | LINE outbound event queue (enqueue) | ❌ Not implemented | H1 | G | |
| O3-LINE-WORKER | LINE worker consumes queue, sends Flex | ❌ Not implemented | H1 | G | |
| O4-LINE-BIND | LIFF bind + `/api/line/bind` | ❌ Not implemented | H1 | G | |
| O5-STRIPE | Stripe webhook hardening | 🟡 Partial | H1 | X | |
| G3-LIFF-CHAT | Two-way LIFF inbox | ❌ Deferred | H3 | G | |
| H-LINEAGE | ⚠ Broodstock lineage performance analytics | ❌ Not in scope | 2027+ | — | ⚠ |
| H-DISPUTE | ⚠ Cross-chain defended-dispute dashboard | ❌ Not in scope | 2027+ | — | ⚠ |

**Boundary:** H-LINEAGE and H-DISPUTE must not be designed or built until P'Bunjong validation in 2027. G3-LIFF-CHAT is Phase H3; do not pull it into H1.

---

## 6. Epics Overview

| Epic | Title | Representative stories | Phase |
|---|---|---|---|
| A | Onboarding & workspace bootstrap | First sign-in creates hatchery row; profile + logo saved to `hatcheries` + `hatchery_brand`; BillingGate trial wired end-to-end | H1 |
| B | Customer management | Customer detail reads from DB (phone, LINE ID, address); batch history filtered from `batches`; D30 trend from real cycle data; Cmd-K search | H1–H2 |
| C | Batch register & PCR | PCR step in Add Batch persists disease rows; batch detail buyers table from `batch_buyers`; PCR cert PDF generated and delivered via LINE queue | H1 |
| D | Restock pipeline | Cron 09:00 ICT fan-out; restock thresholds configurable per hatchery; broadcast wired to LINE queue; quote modal submits | H1–H2 |
| E | Alerts & disease tracking | Auto-trigger from farm-side D30 breach; alert message fan-out wired; `closeAlert` audit log | H1–H2 |
| F | Public scorecard | Public route `/{locale}/h/{slug}` with ISR; real QR encoding slug URL; scorecard PDF; SEO-indexable | H2 — ⚠ full scorecard is a 2027+ hypothesis |
| G | LINE integration | LINE bind flow; `line_outbound_events` queue; worker sends Flex branded with hatchery logo; `line_message_logs` audit; dead-letter UI | H1 (send-only); H3 (two-way LIFF) |
| H | Settings, team, billing | Profile save; logo upload; team list from DB; invite token email; data exports (CSV/ZIP/backup) with `data_exports` audit log; quiet hours schema | H1–H2 |
| X | Ops & infrastructure | RLS audit (every tenant table); Stripe webhook idempotency hardening; cron Cloud Run; multi-tenant cross-contamination test | H1 |

**Boundary:** Epic F (full scorecard with public profile, SEO, verified credentials) is a 2027+ hypothesis. Ship only the settings-side scorecard toggles (already wired) in H1. The public route is H2 at earliest, pending sequencing approval.

---

## 7. Non-Functional Requirements

| Category | Commitment | Notes |
|---|---|---|
| Performance | Dashboard ≤ 2s on 4G · PCR cert generation ≤ 5s · Quote send (DB + queue) ≤ 1s · Batch creation with 10 PCR rows ≤ 3s | Hard gates, not aspirations |
| Security | RLS on every tenant-scoped table (P0) · Stripe webhook verified with live secret · Magic-link 24h expiry · Invite token 7d default · No hardcoded secrets · Audit trail for all data exports | Cross-tenant data leak = P0 incident |
| Accessibility | WCAG 2.1 AA · Color is never the sole indicator of state (icon + text required) · Keyboard navigation on all interactive elements | No exceptions for "professional" surfaces |
| i18n | Thai-first, English secondary · All UI strings in `messages/{th,en}.json` (no hardcoded literals) · Per-locale number + date formatting · CI fails if either file has keys the other lacks | English is gated to `<ComingSoon />` for now; port features against Thai surface |
| Scalability | Multi-tenant via RLS · Supabase connection pooling · Cron fan-out via Cloud Run · LINE worker scaled horizontally · Signed URLs for all Storage access | |
| Observability | Every LINE push logged in `line_message_logs` · Dead-letter UI for `status='dead'` (P2) · Cron error logs streamed to Cloud Logging | |
| Brand health | ⚠ EOY-2027 KPIs: 1 paying hatchery (P'Bunjong) by Q1 2027 · 200+ cross-nursery cycles flowing to hatchery dashboard · 1+ documented exoneration case | KPIs are hypotheses; gate on 2027 validation |

**Boundary:** Every NFR in this table is a gate for production-readiness (Phase H1 done = all NFRs met). KPIs in Brand health are 2027+ targets, not H1 acceptance criteria.

---

## 8. Out of Scope (now)

The following are explicitly excluded from current work. Any PR or story touching these is rejected without further discussion.

| Item | Reason |
|---|---|
| H-LINEAGE — Broodstock lineage performance analytics | ⚠ 2027+ hypothesis; depends on nursery + farm data flywheel at scale; requires P'Bunjong validation |
| H-DISPUTE — Cross-chain defended-dispute dashboard (hatchery → nursery → farm tracing) | ⚠ 2027+ hypothesis; same dependency |
| G3 — Two-way LIFF inbox (full two-way chat) | Deferred to Phase H3; H1 ships send-only Flex |
| Epic F — Public scorecard at `/{locale}/h/{slug}` with SEO + ISR + verified credentials | ⚠ 2027+ hypothesis (Scene 3, Job 4); settings toggles are H1-wired but the public route is H2 at earliest |
| H-J4 — "Careful tier" industry scorecard / external ranking | ⚠ 2027+ hypothesis; requires AquaWise nursery scale |
| H-J5 — Industry trend reports | ⚠ 2028+ hypothesis; requires years of operating data |
| Scene 4 (2028) — Annual hatchery industry report | ⚠ Far-horizon; not a product feature yet |
| Scene 5 (2028+) — Unprompted peer referral loop | ⚠ Success outcome, not a buildable feature |
| Broodstock genetics management software | Anti-commitment; competes with hatcheries' existing tools |
| Tank-level operations management | Anti-commitment; the craft, not our intervention point |
| Real-time anything | Anti-commitment; same as nursery and farmer side |
| Data sale to third parties about specific hatcheries | Anti-commitment; aggregated anonymized stats only |
| Exclusivity arrangements with any single hatchery | Anti-commitment; neutrality is the moat |
| BAAC credit product | Stakeholder 6; 2028+ |
| Feed company field-rep tooling (dedicated) | Stakeholder 5; 2027 |

**Boundary:** If a proposed feature is not in Epics A–X above and not in this out-of-scope list, the agent must flag it for PM review before proceeding.

---

## 9. Voice and Brand Gates

These are hard constraints. Violations are treated as bugs, not style issues.

**Copy must never say:**
- "AI-powered", "AI-driven", or any variant
- "platform" (as a proud noun)
- "revolutionary", "disruptive", "game-changing", "next-generation"
- Excitement punctuation (! at end of claims)
- "We recommend…" or "Great work!" (editorial voice)

**Surface rules:**
- No emoji on professional surfaces (dashboard, batch detail, scorecard, certificates, any B2B-facing page)
- No dark mode — not now, not planned
- No customization themes
- Thai is the source-of-truth language; default route is `/th`; English is `<ComingSoon />` until explicitly gated off
- Voice archetype: `ลูกหลานที่เรียนมา` — the educated younger relative who came back to help. Hatchery register is even more deferential and scientific than the nursery side.
- The dashboard is informational, never editorial. No nudges, no "insights", no AI suggestions. Data with sources, sample sizes, time windows, and confidence indicators only.
- Scientific terminology is welcome on hatchery-facing surfaces (PCR, lineage, broodstock, EHP, WSSV, AHPND). Do not over-translate.

**Boundary:** Any string, copy, or UI element that violates these gates is a P0 issue. The association president (P7 / P'Pong) must not be embarrassed by anything AquaWise ships. If a feature would embarrass him in front of his peers, it is a P0 stop.
