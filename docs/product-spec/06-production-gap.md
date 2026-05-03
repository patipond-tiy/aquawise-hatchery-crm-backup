> Refreshed 2026-05-02 against `aquawise-updated-docs/06-aquawise-hatchery-customer-doc.md` and current `docs/PLAN.md`.

# 06 — Production Gap: punch-list to ship

This is the cut-list. Everything below is something the prototype either
doesn't have or fakes today, that production must do for real.

## How items are prioritized

- **P0** — blocks any real customer using the product
- **P1** — needed for the first paying tenant (Phase H1)
- **P2** — table-stakes for the second tenant / scale (Phase H2)
- **P3** — post-GA / Phase H3 / nice-to-have

Each item cross-references:

- The user story in `03-user-stories.md` it satisfies
- The flow in `04-flows.md` if applicable
- The FR-ID(s) from `docs/aquawise-updated-docs/06-aquawise-hatchery-customer-doc.md`

## Decisions baked into this list (per business-guide reconciliation)

| Decision | Resolution | Source |
|---|---|---|
| Trial-expired behavior | **Read-only with banner** (not full lockout). Reads work; mutations and LINE pushes are gated with a "Subscribe to continue" inline action. Fits the ลูกหลานที่เรียนมา voice. | Story H3, P0.4 below |
| Two-way chat scope | **Phase H3 (deferred)**. Phase H1 ships send-only Flex per FR-LINE-001/002. Migration 007 + LIFF inbox + CRM `/inbox` defer. | Story G3 / G3' |
| Dead-letter retry/escalate UI | **P2.11 (was P3.7)**. FR doc treats observability + retry as multi-tenant ops. | Story X1, Flow 10 |
| Persona ↔ auth role model | Keep **5 personas** (behavioral) and **3 implementation roles** (`owner`/`counter_staff`/`lab_tech`) + reserved `auditor`. Don't collapse. | `08-roles-and-rls.md` |
| Hatchery sequencing | Hatchery product is **2027+**. The current CRM is a scaffold. Do not invest in hatchery-specific features (lineage tracking, cross-nursery outcome data, broodstock scorecard) before 2027 validation with P'Bunjong. | `docs/aquawise-updated-docs/06-aquawise-hatchery-customer-doc.md` §10 |
| Brand voice in product-spec prose | Stay technical here. Brand voice (`07-brand-and-voice.md`) governs **user-facing strings**, Flex copy, certs, and the public scorecard. | `07` |

---

## P0 — Blockers (cannot ship without)

### P0.1 — Workspace bootstrap on first sign-in ✅ (code-complete; verify in live Supabase)
**FR:** FR-AUTH-001, FR-WS-001, FR-AUTH-003 · **Story:** A1

Auth callback now handles PKCE + implicit-flow callbacks (`app/auth/callback/`). Bootstrap
logic creates `hatcheries` + `hatchery_members` (role `owner`) on first sign-in. Stripe trial
subscription creation is wired via Phase 6 (code-complete; awaiting Stripe Dashboard
provisioning). **Remaining verification:** sign in with a never-seen email against a live
Supabase project (not mock) and confirm dashboard loads with empty state and trial counter.

### P0.2 — Wire the LINE outbound queue
**FR:** FR-LINE-001/002/003 · **Story:** G2, G3' · **Flow:** 5

Without a working queue + worker, every "ส่ง LINE" / "เสนอราคา" /
"ส่งใบรับรอง" / "ส่งข้อความถึงฟาร์ม" button is a lie.

- Schema: ✅ already in `006_line_integration.sql`
- Server action: `sendLineEvent()` — does NOT exist
- Bot worker: extension to existing Cloud Run service — does NOT exist
- Plan: see `05-line-integration.md` Week 1–2

### P0.3 — Real RLS on every tenant table
**FR:** FR-WS-003 · **`08-roles-and-rls.md`** is the policy spec.

Today, the mock layer ignores tenancy entirely; the Supabase
implementation relies on policies in `002_rls.sql`. Verify every table
listed in `08`. Add a scripted test: as `hatchery_a` user, attempt to
read every row belonging to `hatchery_b`; expect 0 rows on every
table. **Continuous from week 1; runs on every deploy.**

### P0.4 — Stripe webhook hardening + trial behavior ✅ (code-complete; awaiting Stripe Dashboard provisioning)
**FR:** FR-AUTH-002, FR-BILLING-001 · **Story:** H3

Webhook handler at `app/api/webhooks/stripe/route.ts` handles
`customer.subscription.deleted`, `invoice.payment_failed`, `invoice.paid`.
Uses service-role client + `subscription_events` table for idempotency.
`BillingGate` (server component) redirects expired/canceled tenants.
Trial-expired behavior is **read-only with banner** (not full lockout);
mutation handlers and LINE event server action return 402 for
`trial_expired` / `past_due`. `MOCK_BILLING_STATE` env var exercises all
states in mock mode.

**Remaining:** Provision Stripe Dashboard (Pro plan price ID, webhook endpoint
with live secret); validate end-to-end Checkout → `subscription_events` → `BillingGate`
redirect flow in production.

### P0.5 — Settings → Profile inputs ✅
**FR:** FR-WS-002 · **Story:** A3

All inputs are wired with `useState` + `updateProfile()` (server action in
`app/[locale]/(dashboard)/settings/actions.ts`). Logo upload wired to Supabase
Storage. Persists to `hatcheries` + `hatchery_brand`. Mock mode returns a
"demo mode" notice; live mode fully functional.

---

## P1 — First paying tenant (Phase H1)

### P1.1 — Replace dashboard hero hardcoded values ✅
**FR:** FR-BATCH-003 · **Story:** (no dedicated story; tied to all dashboard stories)

Dashboard stats are now computed from live `customers` + `batches` data via
`lib/derive/dashboard-stats.ts`. Active cycles, avg D30, restock count and PL
totals are all derived. No more literal strings.

### P1.2 — Customer detail: real contact, real batch history
**FR:** FR-CUST-001/003 · **Story:** B3

Phone, LINE ID, address are hardcoded. Batch history is hardcoded.

- Schema: add `phone TEXT, line_id TEXT, address TEXT` to `customers`
- Schema: introduce `batch_distributions(batch_id, customer_id, quantity, sold_at)`
- Page: `app/[locale]/(dashboard)/customers/[id]/page.tsx` rewrites
  contact section + batch history table

### P1.3 — Real D30 trend per customer
**FR:** FR-CUST-002 · **Story:** B3

Sparkline today is `[d30-3, d30+2, ...]`. Need a real series.

- Schema: `customer_cycles(customer_id, batch_id, started_at, d30, d60, harvest)`
- Derive trend from last 6 cycles

### P1.4 — PCR test rows per batch
**FR:** FR-BATCH-001/002 · **Story:** C1, C3

Today, `batches.pcr` is a single enum (`clean | flagged | pending`).
Detail page shows 4 disease rows but the names are hardcoded and the
flag-on-EHP logic is fake.

- Schema: `batch_pcr_tests(batch_id, disease, result, lab, tested_at, file_url)`
- Update Add Batch step 2 to capture per-disease results
- Update Batch detail to read from new table

### P1.5 — Unify team list with actual auth members ✅
**FR:** FR-TEAM-003 · **Story:** A2

Settings → Team reads from `hatchery_members` joined with `auth.users`.
Team actions live in `app/[locale]/(dashboard)/settings/team/actions.ts`.

### P1.6 — Team invite flow ✅
**FR:** FR-TEAM-001/002 · **Story:** A2

`inviteTeamMember(email, role)` server action exists in
`app/[locale]/(dashboard)/settings/team/actions.ts`. Inserts into
`team_invites`, sends email via Supabase Auth admin API. Acceptance handler
at `app/auth/accept-invite/route.ts` validates token + creates membership.
Migration 012 covers the `team_invites` schema.

### P1.7 — Quote send (LINE template + persistence)
**FR:** FR-QUOTE-001/002/003 · **Story:** D2 · **Flow:** 5

`quote` modal opens; needs submission.

- Schema: `quotes(id, hatchery_id, customer_id, items jsonb, status,
  valid_until, sent_at, decided_at)`
- Server action: `sendQuote()` inserts row + enqueues `line_outbound_events`
- Show quotes list on customer detail

### P1.8 — PCR certificate generation + send
**FR:** FR-BATCH-004 · **Story:** C4

"พิมพ์ใบรับรอง" toast-only; `cert` modal opens but no submit.

- Server action: `generatePcrCertPdf(batch_id)` — Puppeteer or `@react-pdf/renderer`
- Storage bucket `pcr-certificates/{batch_id}/`
- `cert` modal submission enqueues `pcr_certificate` Flex
- **Voice constraint:** brand-tier surface (Plus Jakarta Sans + Noto
  Sans Thai). No emojis. Authoritative-not-bureaucratic. See `07`.

### P1.9 — LINE bind flow (Connect LINE on customer card)
**FR:** FR-LINE-004 · **Story:** G1 · **Flow:** 4

Without this, no Flex message can reach a farmer. Token table exists.

- LIFF page `/liff/bind` in Bot service
- API route `/api/line/bind` in CRM
- "Connect LINE" CTA on customer card when `line_id IS NULL`
- **Sequencing constraint:** must complete BEFORE P1.7 / P1.8 / D3 /
  E4 — those features need a bound `line_id` to push to.

### P1.10 — Notification settings actually wired to delivery
**FR:** FR-NOTIF-001 · **Story:** H1

Toggles persist (✅) but nothing reads them at delivery time. Bot
worker / cron must respect each setting.

### P1.11 — Quiet hours respected at delivery
**FR:** FR-NOTIF-001/004 · **Story:** H4

Schema fields `notification_settings.quiet_hours_start/end` don't exist.
Worker enforcement not implemented.

- Schema: add columns (TIME, default 21:00–07:00 ICT)
- Settings → Notifications: 2 time pickers per channel
- Worker: skip + re-queue at window-open; high-severity bypasses
- Manual rep `sendLine` from modal bypasses by default

### P1.12 — Activity panel on customer detail
**FR:** FR-LINE-003 · part of `05-line-integration.md` Week 4

Joins `line_outbound_events` + `line_message_logs` filtered by
`customer_id`. Shows what was sent, when, delivery status. Read-only;
two-way replies arrive in Phase H3.

---

## P2 — Second tenant / scale (Phase H2)

### P2.1 — Public scorecard page (`/{locale}/h/{slug}`)
**FR:** FR-PUBLIC-001/002 · **Story:** F2 · **Flow:** 9

Renders read-only verified profile from `hatchery_brand` + aggregates.
ISR with 6h revalidate. Brand-tier voice.

### P2.1b — Public scorecard ISR + SEO
**FR:** FR-PUBLIC-003 · **Story:** F4 · **Flow:** 9

OG image, JSON-LD, sitemap, Lighthouse SEO ≥ 95. Bundled with P2.1.

### P2.3 — Daily cron pushes
**FR:** FR-NOTIF-002 · **Story:** G4

Vercel cron 09:00 ICT for `restock_reminder` and `harvest_window`.
Idempotency indexes already in migration 006.

### P2.4 — Auto-alerts from farm-side D30
**FR:** FR-NOTIF-003 · **Story:** E2 · **Flow:** 8

Postgres trigger watching `farm_cycle_metrics`.

> **Cross-service dependency.** This requires the **farm-side AquaWise
> app** to write `farm_cycle_metrics` rows into the shared Supabase.
> That schema and ingest path is owned by the farm-side product team.
> Coordinate before week 8: schema, write cadence, RLS scope. The
> trigger has nothing to fire on until farm rows are flowing.

### P2.5 — Restock broadcast fan-out
**FR:** FR-LINE-001/002 · **Story:** D3

"ส่งข้อความหาทุกคน" → real fan-out with confirmation dialog and count.

### P2.6 — Schedule callback persistence
**FR:** (no explicit FR; implied by FR-CUST-* and customer workflows)
· **Story:** B4

`schedule` modal currently no-op. Schema + server action + customer
"Upcoming" panel.

### P2.7 — Data exports
**FR:** FR-SEARCH-002, FR-DATA-001/002 · **Story:** H2

Customers CSV, PCR ZIP, full backup.

- Stream from server (not load all into memory)
- Zip from Supabase Storage signed URLs
- Log to `data_exports` table for audit

### P2.8 — Settings: configurable restock thresholds

Today: now ≤ 0, week ≤ 14, month ≤ 45 are hardcoded. Move to
`hatchery_settings.restock_thresholds` jsonb.

### P2.9 — Top bar: real search, notifications, theme
**FR:** FR-SEARCH-001 · (Cmd-K palette)

Search input has no handler; notifications + profile buttons are
no-ops. Either wire them or remove them — fake controls erode trust
(violates "Truth over comfort" pillar from `07`).

### P2.10 — Logout button ✅

Left rail logout calls `signOut` server action (`app/actions/auth.ts`),
which invokes `supabase.auth.signOut()` and redirects to `/login`.

### P2.11 — Dead-letter retry / escalate UI · *promoted from P3.7*
**FR:** operational (no explicit FR ID; FR doc treats as multi-tenant
ops requirement) · **Story:** X1 · **Flow:** 10

`line_outbound_events.status='dead'` rows need a CRM panel for retry /
edit-and-retry / mark-resolved. Once-daily failures digest to owner.
New `audit_log` table for retry events.

---

## P3 — After GA (Phase H3)

### P3.1 — Two-way chat (LIFF inbox + CRM inbox + nudges) · *demoted from P2.2*
**FR:** (not explicit in FR doc — overscope per business intent)
· **Story:** G3 (deferred)

Whole Epic G3 + Flow 6 + migration 007. Demoted because the FR doc
treats messaging as send-only Flex; full chat is a separate program of
work. When unblocked:

- Migration 007 (chat tables)
- Rich-menu update on @aquawise (one slot → "ข้อความของฉัน")
- LIFF inbox + LIFF chat thread
- CRM `/inbox` page or right-rail panel
- `chat_nudge` template logic
- Read receipts + presence + typing indicators

### P3.2 — Reviews / ratings on scorecard

`showReviews` toggle is disabled with "ยังไม่เปิด — รอเฟส 2". Reviews
schema + farmer-facing review form in LIFF.

### P3.3 — ASC certification flow
**FR:** FR-TEAM-002 (auditor role reserved) · **Story:** P5

Auditor persona reviews batch lineage. Field-level RLS hiding
commercial data from auditors. See `08-roles-and-rls.md`.

### P3.4 — Internal advisor / "Aquara" per-hatchery

Gemini-powered Q&A trained on the hatchery's own batches and
customers. Pre-existing on the farm side, not on the hatchery side.

### P3.5 — Mobile-first redesign

Today's grid breaks on phones. Rep persona (P3) is 80% mobile.

### P3.6 — Activity timeline per customer (full)

Phase H1 ships read-only outbound activity (P1.12). Phase H3 joins
`chat_messages` + `customer_callbacks` + `quotes` for the full stream.

### P3.7 — Per-batch buyer-facing landing pages

Like the public scorecard but per batch — QR on the tank delivery
sticker so farmers scan to see lot lineage.

### P3.8 — Bilingual review of every Thai string

Sweep `messages/{en,th}.json` for missing keys / drift. Add a CI check
that fails the build if either file has keys the other lacks.
**FR:** NFR i18n.

---

## 2027+ Hatchery gaps ⚠ (hypotheses only — do not build before validation)

These items emerge from `aquawise-updated-docs/06-aquawise-hatchery-customer-doc.md`
(v0.5, pending deep validation with P'Bunjong). Every item here carries a ⚠ — none
are confirmed customer reality. **Do not invest engineering time before the 2027
validation conversations.**

### HG.1 — Broodstock lineage performance dashboard ⚠
**Source:** Customer doc §3 Job 2, Scene 2

A dashboard view showing per-lineage Day-30 survival averages, standard deviations,
and trend across all downstream nursery/farm cycles. P'Bunjong's core feedback loop.
Requires cross-nursery outcome data flowing at meaningful scale (200+ cycles/hatchery/year).
⚠ We have not validated whether P'Bunjong wants or trusts this kind of feedback; the
data-quality bar is high. Do not begin schema work until 2027 validation.

### HG.2 — Cross-nursery batch traceability (two steps upstream) ⚠
**Source:** Customer doc §3 Job 1, Scene 1

Map each nauplii batch → nurseries that received it → downstream farm cycle outcomes.
Surfaced on the hatchery dashboard when a nursery calls with a dispute. Requires the
nursery and farm data flywheel to be operating at scale first. ⚠ The P2.4 cross-service
dependency (farm-side writes `farm_cycle_metrics`) is a prerequisite; this feature is a
further step upstream.

### HG.3 — Hatchery-tier pricing model ⚠
**Source:** Customer doc §5

Updated doc hypothesizes ฿5,000–15,000/mo (vs. the current ฿5,000/mo scaffold).
Also raises a per-defended-dispute pricing structure as the most strategically
interesting unit of billing. ⚠ Both the tier and the structure need validation in
conversation with P'Bunjong before any Stripe price IDs are created. The current
฿5,000/mo Pro plan is a placeholder, not a confirmed hatchery price point.

### HG.4 — Hatchery public scorecard (verified-careful tier) ⚠
**Source:** Customer doc §3 Job 4, Scene 3

Extends P2.1 (public scorecard) with hatchery-specific verified-careful tier signal,
lineage performance summary, and discoverability by new nursery customers. ⚠ The
2027+ scenario (Scene 3) — nursery owners finding hatcheries via AquaWise scorecard — is
the most aspirational path and depends on AquaWise reaching critical mass on the
nursery and farm sides first. Do not scope before 2027.

### HG.5 — Industry trend reports ⚠
**Source:** Customer doc §3 Job 5, Scene 4

Aggregated cross-hatchery disease patterns, lineage trends, regulatory shifts,
published as an annual report (Scene 4: 2028+). ⚠ Most distant job; requires years
of operating data and industry credibility. Out of scope until further notice.

---

## Cross-cutting tech debt

- **`USE_MOCK` flag.** Mock + live both bundle today. Production should
  ship with mock excluded from the bundle.
- **`lib/database.types.ts` is a placeholder.** Run
  `supabase gen types typescript --linked > lib/database.types.ts` after
  schema is final.
- **Tests.** Vitest harness is set up (`pnpm test` runs). Coverage is thin — mostly
  smoke. P0.3 RLS audit is the highest-leverage test to add. A `tests/team/invite.test.ts`
  exists; broader coverage is still missing.
- **Loading + error states.** Most pages show "กำลังโหลด…" or nothing.
  Standardize a `<PageState loading|error|empty>` component.
- **i18n keys.** Some strings hardcoded Thai in JSX rather than
  `messages/th.json` keys. Sweep before locking the UI.
- **Modal submission handlers (partially resolved).** `invite` ✅ (P1.6 done).
  Still unwired: `sendLine`, `quote`, `cert`, `schedule`,
  `closeAlert`-with-note. See P1.7, P1.8, P2.6.

---

## Suggested sequencing (revised 2026-05-02)

Items marked ✅ above are complete. Remaining open work:

```
Now      P0.3 (RLS audit baseline — continuous from week 1)
Now      P0.4 Stripe Dashboard provisioning (code done; live keys needed)
         P0.1 verify live Supabase bootstrap (code done; needs live project)

Next     P1.9 (LINE bind — unblocks all push features)
         P0.2 (queue + worker)
         P1.11 (quiet hours) + P1.12 (activity panel)
         P1.7 P1.8 (quote + cert)
         P1.4 P1.2 P1.3 (per-batch PCR; real customer detail)
         P1.10 (notification delivery respect)

— Phase H1 cut here (first paying tenant) —

         P2.3 P2.5 (cron pushes; restock fan-out)
         P2.4 (farm-side trigger — depends on cross-service sync)
         P2.1 + P2.1b (public scorecard + ISR/SEO)
         P2.6 (schedule callback)
         P2.7 P2.8 (exports; restock thresholds)
         P2.9 (topbar: wire search + notifications)
         P2.11 (dead-letter retry UI)

— Phase H2 cut here (second tenant ready) —

Phase H3: P3.1 (two-way chat) + P3.2 (reviews) + P3.3 (auditor) +
          P3.4–P3.8 as the brand journey demands them.

2027+:   HG.1–HG.5 (hatchery-specific features) — validate with P'Bunjong first.

P0.3 (RLS audit) runs continuously on every deploy.
```

This sequencing reaches "first paying tenant on real LINE" once P1.9 + P0.2
are complete, with billing live after Stripe Dashboard provisioning. The 2027+
hatchery gaps (HG.1–HG.5) are placeholders only — do not begin until validation
conversations with P'Bunjong. It matches the business team's "slow is right"
pillar — we don't ship features ahead of customer demand.
