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
- The FR-ID(s) from `docs/business-guide/aquawise-hatchery-functional-requirements (2).md`

## Decisions baked into this list (per business-guide reconciliation)

| Decision | Resolution | Source |
|---|---|---|
| Trial-expired behavior | **Read-only with banner** (not full lockout). Reads work; mutations and LINE pushes are gated with a "Subscribe to continue" inline action. Fits the ลูกหลานที่เรียนมา voice. | Story H3, P0.4 below |
| Two-way chat scope | **Phase H3 (deferred)**. Phase H1 ships send-only Flex per FR-LINE-001/002. Migration 007 + LIFF inbox + CRM `/inbox` defer. | Story G3 / G3' |
| Dead-letter retry/escalate UI | **P2.11 (was P3.7)**. FR doc treats observability + retry as multi-tenant ops. | Story X1, Flow 10 |
| Persona ↔ auth role model | Keep **5 personas** (behavioral) and **3 implementation roles** (`owner`/`counter_staff`/`lab_tech`) + reserved `auditor`. Don't collapse. | `08-roles-and-rls.md` |
| Brand voice in product-spec prose | Stay technical here. Brand voice (`07-brand-and-voice.md`) governs **user-facing strings**, Flex copy, certs, and the public scorecard. | `07` |

---

## P0 — Blockers (cannot ship without)

### P0.1 — Workspace bootstrap on first sign-in
**FR:** FR-AUTH-001, FR-WS-001, FR-AUTH-003 · **Story:** A1

A new email signing in via magic link must end up with a `hatcheries`
row, a `hatchery_members` row (role `owner`), and a Stripe trial
subscription. Today this happens via no automated path; the dashboard
breaks for any new auth user.

- Files: new server action in `app/auth/callback/route.ts` (or
  `app/[locale]/login/actions.ts`)
- Test: sign in with a never-seen email; land on `/th` dashboard with
  empty state and 14-day trial counter

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

### P0.4 — Stripe webhook hardening + trial behavior
**FR:** FR-AUTH-002, FR-BILLING-001 · **Story:** H3

Subscription state must be authoritative from Stripe. Today, the webhook
handler exists at `app/api/webhooks/stripe/route.ts` but:

- Handle `customer.subscription.deleted`, `invoice.payment_failed`,
  `invoice.paid`
- Verify webhook signature with live secret
- Trial countdown correct after a real Checkout flow
- **Trial-expired = read-only with banner.** Implement a server-side
  guard in mutation handlers and the LINE event server action that
  returns 402 if `subscription.status` is `trial_expired` or
  `past_due`. UI surfaces a banner with "Subscribe to continue."
  Reads remain unblocked.

### P0.5 — Settings → Profile inputs (currently dead)
**FR:** FR-WS-002 · **Story:** A3

Every input on Settings → Profile is `defaultValue`-only. A new tenant
cannot rename their hatchery. Hatchery name flows into every Flex
co-branding header, so this is not optional.

- Wire all 6 inputs with `useState` + `updateProfile()`
- Wire logo upload to Supabase Storage `hatchery-logos/`
- Persist to `hatcheries` and `hatchery_brand` tables

---

## P1 — First paying tenant (Phase H1)

### P1.1 — Replace dashboard hero hardcoded values
**FR:** FR-BATCH-003 · **Story:** (no dedicated story; tied to all dashboard stories)

`5/8`, `82%`, `3 ฟาร์ม · ~620k PL` are literal strings. Compute from
`customers` + `batches`.

- File: `app/[locale]/(dashboard)/page.tsx` lines 42–67
- Optional: extract to `lib/derive/dashboard-stats.ts` for testability

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

### P1.5 — Unify team list with actual auth members
**FR:** FR-TEAM-003 · **Story:** A2

Settings → Team renders the `TEAM` constant (5 hardcoded). Should read
from `hatchery_members` joined with `auth.users`.

### P1.6 — Team invite flow
**FR:** FR-TEAM-001/002 · **Story:** A2

`invite` modal opens but submission is unwired.

- Schema: `team_invites(id, hatchery_id, email, role, token, expires_at, accepted_at)`
- Server action: `inviteTeamMember(email, role)`
- Email send via Supabase Auth admin API or Resend
- Acceptance handler at `/auth/accept-invite?token=...`

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

### P2.10 — Logout button (currently dead)

Left rail logout is a `<button>` with no handler. Must call
`supabase.auth.signOut()` then redirect to `/login`.

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

## Cross-cutting tech debt

- **`USE_MOCK` flag.** Mock + live both bundle today. Production should
  ship with mock excluded from the bundle.
- **`lib/database.types.ts` is a placeholder.** Run
  `supabase gen types typescript --linked > lib/database.types.ts` after
  schema is final.
- **Tests.** No unit/integration tests exist. Vitest harness mentioned
  in README but not set up. P0.3 RLS audit is the highest-leverage
  test to add first.
- **Loading + error states.** Most pages show "กำลังโหลด…" or nothing.
  Standardize a `<PageState loading|error|empty>` component.
- **i18n keys.** Some strings hardcoded Thai in JSX rather than
  `messages/th.json` keys. Sweep before locking the UI.
- **Modal submission handlers (4 of 8 missing).** `sendLine`, `quote`,
  `cert`, `invite`, `schedule`, `closeAlert`-with-note all need wired
  `onSubmit`. See P1.7, P1.8, P1.6, P2.6.
- **Dashboard hero stats (3 hardcoded values).** P1.1.

---

## Suggested sequencing (revised per business-guide reconciliation)

```
Week 1   P0.1 P0.5 + P0.3 (RLS audit baseline)
Week 2   P0.4 (Stripe + read-only-with-banner)
Week 2   P1.5 P1.6 (team list + invite)
Week 3   P1.9 (LINE bind — unblocks all push features)
Week 4   P0.2 (queue + worker)  + P1.11 (quiet hours) + P1.12 (activity)
Week 4   P1.7 P1.8 (quote + cert)
Week 5   P1.4 P1.2 P1.3 (per-batch PCR; real customer detail)
Week 6   P1.1 P1.10 (dashboard stats; notif respect)

— Phase H1 cut here (first paying tenant) —

Week 7   P2.3 P2.5 (cron pushes; restock fan-out)
Week 8   P2.4 (farm-side trigger — depends on cross-service sync)
Week 9   P2.1 + P2.1b (public scorecard + ISR/SEO)
Week 10  P2.7 P2.9 P2.10 P2.11 (exports; topbar; logout; dead-letter UI)

— Phase H2 cut here (second tenant ready) —

Phase H3: P3.1 (two-way chat) + P3.2 (reviews) + P3.3 (auditor) +
          P3.4–P3.8 as the brand journey demands them.

P0.3 (RLS audit) runs continuously on every deploy from week 1.
```

This sequencing reaches "first paying tenant on real LINE" by end of
week 6, "second tenant + cron + public scorecard" by end of week 10,
and reserves Phase H3 for the chat surface and post-GA polish without
over-scoping Phase H1. It matches the business team's "slow is right"
pillar — we don't ship features ahead of customer demand.
