# BY-PHASE — Sprint-ready slices

Stories grouped by phase, ordered to match the suggested 10-week sequencing in `product-spec/06-production-gap.md`. Each row is a parent story; the per-week boundary is your sprint-cut hint.

**Read this when:** picking up a sprint, planning the next 1–2 weeks, or estimating "how much is left before first paying tenant?"

**Status / legend:** see `README.md`. **Per-story details (AC, code refs, subtasks, owners):** see `MATRIX.md`.

---

## Phase H1 — First paying tenant (Weeks 1–6)

Target: hatchery owner can sign up, configure the workspace, register batches with PCR, register customers, send branded LINE Flex (quotes, certs, alerts), and pay through Stripe — end to end against real Supabase.

### Week 1 — Foundation (P0 blockers, no business logic possible without them)

| ID  | Title                                       | Status | §06 priority | Suggested owner profile |
|-----|---------------------------------------------|--------|--------------|-------------------------|
| A1  | Sign up & create workspace                  | 🟡 (.i ✅) | P0.1     | ✅ Code complete (commit `56a9492`); live Supabase provisioned in `0b4a112` — awaiting `.v` walkthrough |
| A3  | Set up hatchery profile                     | 🟡 (.i ✅) | P0.5     | ✅ Code complete (commit `56a9492`); `hatchery-logos` bucket + tenant RLS landed in `0b4a112` — awaiting `.v` walkthrough |
| —   | RLS audit harness (continuous from W1)      | —      | P0.3         | Still TBD; tightening migration 011 landed |

**Sprint goal:** New auth users land on `/th` with a working trial. Owner can name the hatchery + upload a logo. Cross-tenant RLS audit infrastructure exists and runs in CI. **Nothing else compiles without these.**

### Week 2 — Billing + team

| ID  | Title                                       | Status | §06 priority | Suggested owner profile |
|-----|---------------------------------------------|--------|--------------|-------------------------|
| H3  | Subscribe / manage billing (read-only banner)| 🟡 (.i ✅) | P0.4    | ✅ Mutation guard `lib/billing/guard.ts` + tests landed (commit `efec382`); read-only enforcement wired on the two new mutation actions. Awaiting Stripe test mode for `.v` |
| A2  | Invite team members                         | 🟡 (.i ✅) | P1.5/P1.6 | ✅ Code + tests complete (commit `56a9492`); role enum reconciled in `0fa4489`; RLS tightened in `18d4d9e`. Awaiting email service for `.v` |

**Sprint goal:** Trial countdown + read-only-with-banner enforcement at every mutation boundary. Owner can invite a counter_staff/lab_tech, who joins via magic link with the correct role. **Reconcile the role-enum drift in the same migration.**

### Week 3 — LINE bind (unblocks all push features)

| ID  | Title                                       | Status | §06 priority | Suggested owner profile |
|-----|---------------------------------------------|--------|--------------|-------------------------|
| G1  | Bind a customer's LINE account              | 🟡     | P1.9         | Full-stack + LIFF + bot service coordination |

**Sprint goal:** Rep clicks "Connect LINE" on a customer card, copies a one-shot link, farmer opens it in LINE, `customers.line_id` populates. **Sequencing rule: G1 MUST land before D2 / C4 / E4 / F3 / G2 — those need a bound `line_id` to push to.**

### Week 4 — LINE worker + delivery-time policy

| ID  | Title                                       | Status | §06 priority | Suggested owner profile |
|-----|---------------------------------------------|--------|--------------|-------------------------|
| G3' | Send-only Flex messaging (worker + queue)   | ❌     | P0.2         | Bot-service engineer (Cloud Run) |
| H4  | Quiet hours respected at delivery           | ❌     | P1.11        | Backend + bot worker |
| —   | Customer Activity panel (read-only outbound)| (P1.12)| —            | Front-end (joins `line_outbound_events` + `line_message_logs`) |
| C4  | PCR cert generation + send                  | 🟡     | P1.8         | Full-stack + PDF rendering |
| D2  | Quote send via LINE                         | 🟡     | P1.7         | Full-stack |

**Sprint goal:** The Flex queue is real. CRM enqueues, bot worker drains, branded Flex reaches the farmer's LINE. Cert + Quote modals submit fully. **This is the keystone week — five stories unblock simultaneously.**

### Week 5 — Real per-batch + per-customer data

| ID  | Title                                       | Status | §06 priority | Suggested owner profile |
|-----|---------------------------------------------|--------|--------------|-------------------------|
| C1  | Register a new batch (with real PCR rows)   | 🟡     | P1.4         | Full-stack + Storage — still pending |
| C3  | Batch detail with distribution + D30 dist   | 🟡     | P1.4         | Front-end — still pending |
| B2  | Add a new customer (schema fields)          | 🟡 (.i ✅) | P1.2     | ✅ Code + migration 009 + tests landed (commit `56a9492`); live Supabase provisioned in `0b4a112` — awaiting `.v` walkthrough |
| B3  | View customer detail (real contact + history)| 🟡    | P1.2/P1.3    | Full-stack — still pending |

**Sprint goal:** No more hardcoded data. Customer detail and batch detail both read everything from Supabase.

### Week 6 — Polish + dashboard stats + notif respect

| ID  | Title                                       | Status | §06 priority | Suggested owner profile |
|-----|---------------------------------------------|--------|--------------|-------------------------|
| P1.1 | Dashboard hero stats from real data        | ✅     | P1.1         | ✅ `lib/derive/dashboard-stats.ts` + 8 tests (commit `56a9492`) |
| H1  | Edit notification preferences (delivery enforcement) | 🟡 | P1.10  | Backend + bot worker — still pending |
| B1  | See all customers (live verification)       | 🟡 (.i ✅) | —    | ✅ Inner-join bug fixed + regression test (commit `ddf6ea3`); awaiting `.v` |
| C2  | Browse batches (live + auditor RBAC)        | 🟡     | —            | Full-stack (auditor role now in enum, RLS view still TBD) |
| E1  | See active alerts (live verification)       | 🟡 (.i ✅) | —    | ✅ Severity sort fixed + regression test (commit `ddf6ea3`); awaiting `.v` |
| E3  | Close an alert (with note + actions)        | 🟡     | —            | Full-stack — still pending |
| F1  | Toggle scorecard visibility (live verify)   | 🟡     | —            | QA |
| —   | i18n sweep (no hardcoded Thai in JSX)       | (tech debt) | —      | Full-stack |
| P2.10| Logout button                              | ✅     | P2.10        | ✅ Form action + redirect (commit `efec382`) |

**Sprint goal:** Every H1 story has all three subtasks at ✅. The product is a paying-tenant-ready CRM for one hatchery. **This is the H1 cut.**

---

## Phase H2 — Second tenant / scale (Weeks 7–10)

Target: a second hatchery onboarded without bespoke work. Public scorecard live. Cron-driven outreach replaces ad-hoc reps. Auditor + observability ops.

### Week 7 — Cron + broadcast

| ID  | Title                                       | Status | §06 priority | Suggested owner profile |
|-----|---------------------------------------------|--------|--------------|-------------------------|
| G4  | Cron-driven template pushes (daily 09:00 ICT)| ❌    | P2.3         | Backend (Vercel cron) |
| D3  | Broadcast to a restock cohort               | 🟡     | P2.5         | Full-stack |

### Week 8 — Cross-service (farm-side coordination)

| ID  | Title                                       | Status | §06 priority | Suggested owner profile |
|-----|---------------------------------------------|--------|--------------|-------------------------|
| E2  | Auto-create alerts from farm-side D30 dips  | ❌     | P2.4         | Backend + cross-team coordination |

**Pre-condition:** farm-side product team must commit to schema + write cadence for `farm_cycle_metrics` before sprint commit. Without this E2 cannot fire.

### Week 9 — Public scorecard (J5 acquisition surface)

| ID  | Title                                       | Status | §06 priority | Suggested owner profile |
|-----|---------------------------------------------|--------|--------------|-------------------------|
| F2  | Public scorecard page                       | ❌     | P2.1         | Full-stack |
| F4  | Public scorecard ISR + SEO                  | ❌     | P2.1b        | Front-end (OG image, JSON-LD) |
| F3  | Scorecard PDF / send via LINE               | 🟡     | —            | Full-stack |
| E4  | Notify affected farms (alert follow-up)     | 🟡     | —            | Full-stack |

### Week 10 — Ops table-stakes

| ID  | Title                                       | Status | §06 priority | Suggested owner profile |
|-----|---------------------------------------------|--------|--------------|-------------------------|
| H2  | Export customer / PCR data                  | ❌     | P2.7         | Backend (streaming, Storage) — still pending |
| X1  | Dead-letter retry / escalate UI             | ❌     | P2.11        | Full-stack — still pending |
| D1  | Configurable restock thresholds             | 🟡 (.i ✅) | P2.8     | ✅ Migration 010 + data path threaded; Settings UI is a follow-up (commit `efec382`) |
| B4  | Schedule a callback                         | 🟡     | P2.6         | Full-stack — still pending |
| —   | Top-bar real search + notifications         | (P2.9) | —            | Front-end |
| —   | Logout button                               | ✅     | P2.10        | ✅ Done in week-0 pilot (commit `efec382`) |

**Sprint goal:** A second hatchery can sign up, configure, run a cycle, and the team can observe failures + export records. **This is the H2 cut — second-tenant-ready.**

---

## Phase H3 — Post-GA / deferred (Weeks 11+)

Do not work on these in H1/H2. Listed for visibility only.

| ID  | Title                                       | Status | §06 priority | Notes |
|-----|---------------------------------------------|--------|--------------|-------|
| G3  | Two-way chat in LIFF inbox                  | 🚫     | P3.1         | Migration 007 + LIFF inbox + CRM `/inbox` panel + nudges. Demoted from P2.2 — FR doc treats messaging as send-only Flex for H1. Reconsider when farmer demand is observable. |
| —   | Reviews / ratings on scorecard              | (P3.2) | —            | `showReviews` toggle stays disabled until reviews schema ships. |
| —   | ASC certification flow + auditor field-RLS  | (P3.3) | —            | Full auditor experience; field-level RLS + SECURITY INVOKER views. |
| —   | "Aquara" hatchery-side advisor              | (P3.4) | —            | Gemini Q&A trained on hatchery's own batches/customers. Pre-existing on farm side. |
| —   | Mobile-first redesign                       | (P3.5) | —            | Today's grid breaks on phones; Rep persona is 80% mobile. |
| —   | Activity timeline per customer (full)       | (P3.6) | —            | H1 ships read-only outbound; H3 joins chat + callbacks + quotes. |
| —   | Per-batch buyer-facing landing pages        | (P3.7) | —            | QR on tank delivery sticker; lot lineage. |
| —   | Bilingual review of every Thai/English string| (P3.8)| —            | CI key-parity check + native-speaker review. |

---

## Cross-cutting work (continuous)

These run across every sprint, not in any single week.

| Work | Owner profile | Trigger |
|------|---------------|---------|
| Cross-tenant RLS audit (P0.3) | Backend / DB | Every deploy from Week 1 |
| Vitest infra setup | Test engineer | One-time, Week 1 — unblocks every `.t` row |
| Conventional commits + PR review | All | Every PR |
| `messages/{th,en}.json` parity CI gate | Tooling | Add in Week 1; runs on every PR |
| `lib/database.types.ts` regeneration | Backend | After every migration: `supabase gen types typescript --linked > lib/database.types.ts` |

---

## Sprint-cut handoff

**To stage a sprint to your team:**

1. Pick a week from the H1 or H2 sections above.
2. For each row, open `MATRIX.md` and find the story block.
3. Fill `Owner` in the parent row + each `.i`, `.t`, `.v` subtask row.
4. Commit: `docs(work-breakdown): assign owners for sprint <YYYY-MM-DD>`.
5. Owners flip subtask status as work progresses; parent rolls up.
6. At sprint close, refresh `JTBD-ALIGNMENT.md` coverage % + `FR-COVERAGE.md` "Uncovered FRs" list.

**To re-prioritize:** edit this file's row order — but if you reorder *across* weeks, also update `06-production-gap.md`'s "Suggested sequencing" block so the two stay in sync.
