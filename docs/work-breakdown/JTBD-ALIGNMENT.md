# JTBD-ALIGNMENT — Stories grouped by Job-to-be-done

Cross-references the five Jobs-to-be-done from `docs/product-spec/00-overview.md`. Every Phase-H1 story should serve at least one JTBD; if it doesn't, reconsider before sprinting on it.

**Coverage definitions:**
- **Shipping (✅):** parent story status = ✅, all three subtasks done.
- **In flight (🟡):** parent status = 🟡 (mock works, Supabase/test/verify gaps remain).
- **Not started (❌):** parent status = ❌.
- **Deferred (🚫):** explicitly out of scope (e.g. Phase H3 carried forward).

**Read this when:** scoping a sprint (does this advance a high-priority JTBD?), writing release notes (which JTBD did this ship?), or auditing the roadmap (are any JTBDs systematically under-served?).

---

## J1 — Keep customers · "ลูกค้าไม่กลับมา"

> When a customer hasn't reordered in a while, I want to know if their cycle's ending soon and reach out before a competitor does, so that I keep the customer.

**Features serving this job** (from `00-overview.md`): Restock pipeline · D30 trend per customer · Scheduled callbacks · Quote send (one-tap) · Daily restock cron.

| ID  | Title                                       | Phase | Status | §06   |
|-----|---------------------------------------------|-------|--------|-------|
| B1  | See all customers at a glance               | H1    | 🟡     | —     |
| B2  | Add a new customer                          | H1    | 🟡     | P1.2  |
| B3  | View customer detail (D30 trend, J1 portion)| H1    | 🟡     | P1.2/3|
| B4  | Schedule a callback                         | H2    | 🟡     | P2.6  |
| D1  | See farms by restock urgency                | H1    | 🟡     | P2.8  |
| D2  | Send a quote in one tap                     | H1    | 🟡     | P1.7  |
| D3  | Broadcast to a restock cohort               | H2    | 🟡     | P2.5  |
| G2  | Send one-off LINE message (restock context) | H1    | 🟡     | P0.2  |
| G4  | Cron-driven template pushes                 | H2    | ❌     | P2.3  |
| H4  | Quiet hours respected at delivery           | H1    | ❌     | P1.11 |

**Coverage: 0/10 shipping (0%)** · 8/10 in flight · 2/10 not started.

**Gap callout.**

J1 is the *primary* JTBD for the highest-value daily user (Rep persona, P3) yet zero stories ship today. The blocker is structural: every "reach out" story (D2, D3, G2, G4) depends on **G3' (send-only Flex worker)** and **G1 (LINE bind)**. Until those two land, the Rep cannot send a single quote or restock reminder through the system — the Flex queue stays empty.

**Action.** Sequence G1 → G3' before any other J1 story in sprint planning. Without them, B-row and D-row work is gated to mock-only, which is invisible to the customer.

---

## J2 — Defend reputation · "เกษตรกรว่า PL ไม่ดี"

> When a farmer says "your PL was bad," I want to show evidence about that specific lot — PCR results, what other buyers saw, D30 across all farms that bought it — so that I'm not blamed unfairly.

**Features serving this job:** Per-batch PCR results · Distribution-to-farm history · Auto-alert on cross-farm D30 dips · Customer activity panel.

| ID  | Title                                       | Phase | Status | §06   |
|-----|---------------------------------------------|-------|--------|-------|
| B3  | Customer detail (batch history portion)     | H1    | 🟡     | P1.2  |
| C1  | Register a new batch (with PCR rows)        | H1    | 🟡     | P1.4  |
| C2  | Browse and review batches                   | H1    | 🟡     | —     |
| C3  | Batch detail with distribution + D30 dist   | H1    | 🟡     | P1.4  |
| E1  | See active alerts                           | H1    | 🟡     | —     |
| E2  | Auto-create alerts from farm-side D30 dips  | H2    | ❌     | P2.4  |
| E3  | Close an alert                              | H1    | 🟡     | —     |
| E4  | Notify affected farms                       | H2    | 🟡     | —     |
| G1  | Bind customer LINE account                  | H1    | 🟡     | P1.9  |
| G2  | Send one-off LINE message (alert context)   | H1    | 🟡     | P0.2  |
| G3' | Send-only Flex messaging                    | H1    | ❌     | P0.2  |

**Coverage: 0/11 shipping (0%)** · 8/11 in flight · 3/11 not started.

**Gap callout.**

J2 is the **defensive** JTBD — it's invoked specifically in crisis ("a farmer just blamed us"). Today the hatchery has no way to push proof to the farmer, because:
- The defensive evidence exists (✅ alerts list, 🟡 batch detail) — but
- There's no channel to deliver it (G3' = ❌, G2 = unwired) — and
- Auto-detection of cross-farm dips (E2) waits on the farm-side `farm_cycle_metrics` cross-service sync, which has no schedule yet.

**Action.** P0.2 (G3') is the same blocker as J1; no separate action. But add **cross-team ask: schedule the farm-side `farm_cycle_metrics` ingest** — without it E2 cannot fire even after G3' ships.

---

## J3 — Prove quality · "พิสูจน์ว่าโรงเพาะเราดี"

> When a prospect or association peer asks how good I really am, I want to hand them a verifiable scorecard with externally-checkable numbers, so that I close on facts not promises.

**Features serving this job:** Public scorecard `/h/{slug}` · PCR certificate PDF · "Verified by AquaWise" stamp · D30 distribution chart on batch detail.

| ID  | Title                                       | Phase | Status | §06   |
|-----|---------------------------------------------|-------|--------|-------|
| C3  | Batch detail (D30 distribution chart)       | H1    | 🟡     | P1.4  |
| C4  | Print or send PCR certificate               | H1    | 🟡     | P1.8  |
| F1  | Toggle scorecard visibility                 | H1    | 🟡     | —     |
| F2  | Public scorecard page                       | H2    | ❌     | P2.1  |
| F3  | Scorecard PDF / send via LINE               | H2    | 🟡     | —     |
| G1  | Bind customer LINE account                  | H1    | 🟡     | P1.9  |
| G3' | Send-only Flex messaging (cert delivery)    | H1    | ❌     | P0.2  |

**Coverage: 0/7 shipping (0%)** · 5/7 in flight · 2/7 not started.

**Gap callout.**

J3 has two branches: the **certificate** branch (one-to-one proof, delivered via LINE — C4 + G3') and the **public scorecard** branch (one-to-many proof, on the open web — F2 + F4). Today both branches are gated:
- Certificate: blocked on G3' (LINE worker) and G1 (bind).
- Public scorecard: F2 doesn't exist as a route yet (`app/[locale]/h/[slug]/` not present in the codebase).

**Action.** Per `06`'s sequencing, F2/F4 land in Week 9 (post-H1). Don't try to ship the public scorecard before the LINE branch — both serve J3 but the certificate is the higher-value proof artifact (it shows up at exactly the moment J2 is invoked, in the same conversation thread).

---

## J4 — Operate seriously · "อยากเป็นโรงเพาะที่จริงจัง"

> When I want to be a serious, modern operator, I want to run on a system instead of LINE groups + paper notebooks, so that I look as professional as I actually am.

**Features serving this job:** Multi-user team with roles · Branded co-Flex via @aquawise · Real notification settings · Audit-grade exports.

| ID  | Title                                       | Phase | Status | §06   |
|-----|---------------------------------------------|-------|--------|-------|
| A1  | Sign up & create workspace                  | H1    | 🟡     | P0.1  |
| A2  | Invite team members                         | H1    | 🟡     | P1.5/6|
| A3  | Set up hatchery profile (brand fields)      | H1    | ❌     | P0.5  |
| G3  | Two-way chat in LIFF inbox (Phase H3)       | H3    | 🚫     | P3.1  |
| H1  | Edit notification preferences               | H1    | 🟡     | P1.10 |
| H2  | Export customer / PCR data                  | H2    | ❌     | P2.7  |
| H3  | Subscribe / manage billing                  | H1    | 🟡     | P0.4  |
| X1  | Dead-letter retry / escalate UI             | H2    | ❌     | P2.11 |

**Coverage: 0/8 shipping (0%)** · 4/8 in flight · 3/8 not started · 1/8 deferred.

**Gap callout.**

J4 is the **foundation** JTBD — without it the product literally can't be used by a paying tenant (A1 bootstrap blocks every other story; A3 brand fields gate every co-branded Flex push; H3 trial enforcement gates the business model). All four "in flight" stories are P0 punch list items, not optional polish.

**Action.** Sequence A1 → A3 → H3 → A2 in Week 1–2 per `06`. These are non-negotiable; nothing else compiles without them.

---

## J5 — Acquire customers · "อยากได้ลูกค้าใหม่"

> When I want to grow beyond my existing customers, I want a public proof artifact a stranger can find or scan, so that new farmers reach out without a cold sales call.

**Features serving this job:** Public scorecard SEO + ISR · QR code on tank stickers / counter posters · Per-batch landing pages (Phase H3).

| ID  | Title                                       | Phase | Status | §06   |
|-----|---------------------------------------------|-------|--------|-------|
| F2  | Public scorecard page                       | H2    | ❌     | P2.1  |
| F4  | Public scorecard ISR + SEO                  | H2    | ❌     | P2.1b |

**Coverage: 0/2 shipping (0%)** · 0/2 in flight · 2/2 not started.

**Gap callout.**

J5 has the smallest backlog (good — `06` deliberately scopes acquisition behind J4 retention, per "Slow is right"). But neither story exists yet. **Per-batch landing pages** (the QR-on-tank-sticker idea) is `P3.7` — explicitly post-GA, not in this matrix.

**Action.** Don't sprint on J5 in H1. After H1 ships, F2 + F4 are a tight 2–3 day chunk that should land together in Week 9.

---

## Coverage rollup

| JTBD                  | Stories | ✅ | 🟡 | ❌ | 🚫 | % shipping |
|-----------------------|---------|----|----|----|----|------------|
| J1 Keep customers     | 10      | 0  | 8  | 2  | 0  | 0%         |
| J2 Defend reputation  | 11      | 0  | 8  | 3  | 0  | 0%         |
| J3 Prove quality      | 7       | 0  | 5  | 2  | 0  | 0%         |
| J4 Operate seriously  | 8       | 0  | 4  | 3  | 1  | 0%         |
| J5 Acquire customers  | 2       | 0  | 0  | 2  | 0  | 0%         |
| **All**               | **38**  | **0** | **25** | **12** | **1** | **0%** |

> **Note on the "0% shipping" reading.** No parent story can roll up to ✅ until all three of its `.i / .t / .v` subtasks are ✅, and the test suite has zero coverage today (`tests/` does not exist). That alone caps every parent at 🟡 even when implementation is real and live. Adding Vitest infra is the highest-leverage move to convert 🟡s to ✅s — a single afternoon's setup unblocks dozens of `.t` rows.

> **Note on row count vs MATRIX.md.** The MATRIX has 33 unique parent rows; this rollup totals 38 because a few stories serve multiple JTBDs (B3 → J1 + J2; C3 → J2 + J3; G1 → J1 + J2 + J3; F2 → J3 + J5; G2 → J1 + J2; G3' → J1 + J2 + J3). Counting per-JTBD is correct for "is this JTBD funded enough"; the MATRIX is correct for "how many stories total."
