# 04 — End-to-end flows

The eight flows below cover every cross-system interaction. Sequence
diagrams use plain ASCII to stay diff-friendly. Each flow lists:

- **Trigger** — what starts it
- **Sequence** — actor → system message-by-message
- **Persistence** — which tables get rows
- **Today's gap** — what's missing in the prototype

Actors:

- **Rep / Owner / Manager** — humans in the CRM
- **CRM** — Next.js app + Supabase
- **Queue** — `line_outbound_events` table (Postgres)
- **Bot** — existing Cloud Run service `@aquawise` LINE OA
- **LINE** — LINE Messaging API
- **Farmer** — phone running LINE / @aquawise rich menu
- **LIFF** — LINE in-app webview pages served by Bot

---

## Flow 1 — Sign up new hatchery

**Trigger.** New person enters email on `/login`.

```
User             CRM              Supabase Auth      Stripe
 │  email         │                    │                │
 │───────────────▶│                    │                │
 │                │ signInWithOtp ────▶│                │
 │                │◀──── ok ───────────│                │
 │  email link    │                    │                │
 │◀───────────────│ (Supabase delivers)│                │
 │  click link    │                    │                │
 │───────────────▶│                    │                │
 │                │ exchangeCode ─────▶│                │
 │                │◀── session ────────│                │
 │  /auth/callback│                    │                │
 │                │ first-login? ─────────────┐         │
 │                │                           ▼         │
 │                │ insert hatcheries +       │         │
 │                │ insert hatchery_members   │         │
 │                │ create trial sub ──────────────────▶│
 │                │◀──── customer + sub id ─────────────│
 │                │ insert subscriptions      │         │
 │  /th           │                           │         │
 │◀───────────────│                           │         │
```

**Persistence.** `hatcheries`, `hatchery_members`, `subscriptions`
(`status='trialing'`, `trial_ends_at = now() + 14d`).

**Gap today.** First-login bootstrap server action doesn't exist. Stripe
trial creation works but isn't tied to the auth callback.

---

## Flow 2 — Add customer

**Trigger.** Rep clicks "+ เพิ่มลูกค้า" on `/customers`.

```
Rep              Modal               CRM API            Supabase
 │  click         │                    │                    │
 │───────────────▶│                    │                    │
 │  fill fields   │                    │                    │
 │  submit        │                    │                    │
 │───────────────▶│ addCustomer(input) │                    │
 │                │───────────────────▶│ insert customers ─▶│
 │                │                    │◀── new row ────────│
 │                │◀──── Customer ─────│                    │
 │  toast +close  │                    │                    │
 │◀───────────────│                    │                    │
                  │ invalidate         │
                  │ ['customers']      │
```

**Persistence.** New `customers` row.

**Gap today.** Schema fields `phone`, `zone`, `package_interest`, `farm_en`
are in the modal but not yet in the production schema migration.

---

## Flow 3 — Register batch with PCR

**Trigger.** Manager clicks "+ ลงทะเบียนล็อตใหม่" on `/batches`.

```
Manager          Modal Step 1        Modal Step 2        Modal Step 3       CRM API           Supabase           Storage
 │  click         │                    │                    │                  │                  │                  │
 │───────────────▶│                    │                    │                  │                  │                  │
 │  source/date/  │                    │                    │                  │                  │                  │
 │  quantity      │                    │                    │                  │                  │                  │
 │  next ────────▶│                    │                    │                  │                  │                  │
 │                │  drop PDF ─────────│                    │                  │                  │                  │
 │                │  upload ───────────│ ───────────────────────────────────────────────────────────────────────────▶│
 │                │                    │                    │                  │                  │  blob saved     │
 │                │  OCR → fields ◀────│                    │                  │                  │                  │
 │                │  override results  │                    │                  │                  │                  │
 │                │  next ──────────────────────────────────▶│                  │                  │                  │
 │                │                    │                    │  confirm + register                  │                  │
 │                │                    │                    │  ──────────────▶│ addBatch(input) ─▶│ insert batches   │
 │                │                    │                    │                  │                  │ + batch_pcr_tests│
 │                │                    │                    │                  │◀── new row ──────│                  │
 │  toast +close  │                    │                    │                  │                  │                  │
 │◀───────────────│                    │                    │                  │                  │                  │
```

**Persistence.** `batches` row + 4 `batch_pcr_tests` rows (one per disease).
PDF blob in `pcr-reports/{batch_id}/`.

**Gap today.** Step 2 PDF upload + OCR is fake (results hardcoded). PCR
table doesn't exist (currently `pcr` is a single enum on `batches`).

---

## Flow 4 — Bind a customer's LINE

**Trigger.** Rep clicks "Connect LINE" on a customer card whose
`line_id IS NULL`.

```
Rep            CRM              Supabase           Bot LIFF        Farmer phone
 │ click        │                    │                 │                 │
 │─────────────▶│                    │                 │                 │
 │              │ insert             │                 │                 │
 │              │ customer_bind_     │                 │                 │
 │              │   tokens          ──▶                 │                 │
 │              │ ◀── token (ULID) ──│                 │                 │
 │ link shown   │                    │                 │                 │
 │◀─────────────│                    │                 │                 │
 │ rep sends    │                    │                 │                 │
 │ via WhatsApp │                    │                 │                 │
 │ /existing LINE thread ─────────────────────────────────────────────────▶│
 │              │                    │                 │  click in LINE  │
 │              │                    │                 │◀────────────────│
 │              │                    │                 │ liff.init       │
 │              │                    │                 │ + LINE login    │
 │              │                    │                 │  POST /api/line/bind
 │              │                    │                 │   {token,profile}
 │              │                    │ ◀───────────────│                 │
 │              │                    │ verify token    │                 │
 │              │                    │ update customers│                 │
 │              │                    │ upsert line_users                 │
 │              │                    │ insert chat_threads               │
 │              │                    │ delete token    │                 │
 │              │                    │ ◀── ok ─────────│                 │
 │              │                    │                 │  thank-you screen
 │              │                    │                 │  + open chat ───▶│
 │              │                    │                 │                 │
 │              │  realtime: line_id │                 │                 │
 │              │  set ──────────────│                 │                 │
 │ card now ✓   │                    │                 │                 │
 │◀─────────────│                    │                 │                 │
```

**Persistence.** `customer_bind_tokens` (insert + delete), `customers.line_id`
set, `line_users` upsert, `chat_threads` insert.

**Gap today.** Token table exists in migration 006 ✅. LIFF page +
`/api/line/bind` route + `chat_threads` table do not exist ❌.

---

## Flow 5 — Send a one-off LINE message

**Trigger.** Rep clicks "ส่ง LINE" on a customer card or detail page.

```
Rep            CRM Modal       CRM Server          Queue (DB)        Bot Worker         LINE API           Farmer
 │ click        │                  │                    │                  │                  │                 │
 │─────────────▶│                  │                    │                  │                  │                 │
 │ pick template│                  │                    │                  │                  │                 │
 │ + edit       │                  │                    │                  │                  │                 │
 │ submit ──────▶ sendLineEvent(   │                    │                  │                  │                 │
 │              │   tpl, payload)  │                    │                  │                  │                 │
 │              │ ────────────────▶│                    │                  │                  │                 │
 │              │                  │ insert into        │                  │                  │                 │
 │              │                  │ line_outbound_     │                  │                  │                 │
 │              │                  │   events ─────────▶                  │                  │                 │
 │              │                  │  status=pending    │                  │                  │                 │
 │              │ ◀── ok (id) ─────│                    │                  │                  │                 │
 │ toast        │                  │                    │  realtime push   │                  │                 │
 │◀─────────────│                  │                    │ ────────────────▶│                  │                 │
 │              │                  │                    │                  │ pull batch (≤10) │                 │
 │              │                  │                    │                  │ render Flex with │                 │
 │              │                  │                    │                  │   hatchery_brand │                 │
 │              │                  │                    │                  │ ────────────────▶│                 │
 │              │                  │                    │                  │                  │ pushMessage ───▶│
 │              │                  │                    │                  │                  │ ◀── delivered ──│
 │              │                  │                    │                  │ ◀── 200 ─────────│                 │
 │              │                  │                    │ ◀── status=sent ─│                  │                 │
 │              │                  │                    │                  │                  │                 │
 │              │                  │   realtime: status │                  │                  │                 │
 │              │                  │   change ─────────▶│                  │                  │                 │
 │ activity row │                  │                    │                  │                  │                 │
 │ updated      │                  │                    │                  │                  │                 │
 │◀─────────────│                  │                    │                  │                  │                 │
```

**Persistence.** `line_outbound_events` row, status transitioning
`pending → sending → sent` (or `failed → dead` after retries).

**Idempotency.** Cron-driven templates dedupe on `(customer_id, template, cycle_id)`;
disease alerts dedupe on `(customer_id, alert_id)`. Manual rep messages
have no dedupe constraint (rep can send multiple).

**Gap today.** Server action + bot worker extension don't exist.

---

## Flow 6 — Two-way chat thread

**Trigger.** Farmer taps "ข้อความของฉัน" in @aquawise rich menu, then
opens a hatchery thread.

```
Farmer        LINE         LIFF Inbox      Supabase Realtime    CRM Inbox        Hatchery rep
 │ tap rich    │             │                   │                   │                 │
 │ menu        │             │                   │                   │                 │
 │────────────▶│             │                   │                   │                 │
 │             │  open LIFF  │                   │                   │                 │
 │             │────────────▶│                   │                   │                 │
 │             │             │ list chat_threads │                   │                 │
 │             │             │  for line_user_id │                   │                 │
 │             │             │◀──────────────────│                   │                 │
 │             │             │ tap thread        │                   │                 │
 │             │             │ subscribe to      │                   │                 │
 │             │             │  chat_messages    │                   │                 │
 │             │             │  by thread_id ───▶│                   │                 │
 │             │             │ type message      │                   │                 │
 │             │             │ insert chat_message                   │                 │
 │             │             │ ──────────────────▶                   │                 │
 │             │             │                   │ realtime push ───▶│                 │
 │             │             │                   │                   │ unread badge    │
 │             │             │                   │                   │ +1              │
 │             │             │                   │                   │◀────────────────│
 │             │             │                   │                   │ rep opens       │
 │             │             │                   │                   │ inbox panel     │
 │             │             │                   │                   │ insert read_    │
 │             │             │                   │                   │  receipt        │
 │             │             │                   │                   │ ──────────▶     │
 │             │             │                   │ ◀── realtime ────│                 │
 │             │             │ ✓✓ shown          │                   │                 │
 │             │             │                   │                   │ rep types reply │
 │             │             │                   │                   │◀────────────────│
 │             │             │                   │                   │ insert chat_    │
 │             │             │                   │                   │  message ──────▶│
 │             │             │ realtime ◀────────│ ◀─────────────────│                 │
 │             │             │ message bubble    │                   │                 │
 │             │             │ shown             │                   │                 │
 │ farmer idle │             │                   │                   │                 │
 │ closes app  │             │                   │                   │                 │
 │             │ ┌──── 60s ──┴──┐                │                   │                 │
 │             │ │ chat_nudge   │                │                   │                 │
 │             │ │ enqueued ────────────────────▶                   │                 │
 │             │ │ Bot pushes   │                │                   │                 │
 │             │ │ Flex "you    │                │                   │                 │
 │             │ │  have a new  │                │                   │                 │
 │ ◀───── pop  │ │  message"    │                │                   │                 │
 │             │ └──────────────┘                │                   │                 │
```

**Persistence.** `chat_messages`, `chat_read_receipts`, `chat_presence`,
`line_outbound_events` (for nudge), all in planned migration 007.

**Gap today.** Entire two-way chat does not exist. Migration 007 not yet
written; LIFF inbox + CRM inbox panel are net-new.

---

## Flow 7 — Cron restock reminder

**Trigger.** Daily cron at 09:00 ICT.

```
Cron           CRM Server        Supabase             Queue            Bot Worker         Farmer
 │ tick         │                   │                    │                 │                 │
 │─────────────▶│                   │                    │                 │                 │
 │              │ select customers  │                    │                 │                 │
 │              │ where restock_in  │                    │                 │                 │
 │              │  in (7, 3, 0)     │                    │                 │                 │
 │              │ ────────────────▶ │                    │                 │                 │
 │              │ ◀── rows ─────────│                    │                 │                 │
 │              │ for each:         │                    │                 │                 │
 │              │  insert event     │                    │                 │                 │
 │              │  ON CONFLICT DO   │                    │                 │                 │
 │              │  NOTHING          │                    │                 │                 │
 │              │  (template, cycle_id)──────────────────▶                 │                 │
 │              │                   │                    │ realtime ──────▶│                 │
 │              │                   │                    │                 │ pull, push ────▶│
```

**Idempotency.** Partial unique index on `(customer_id, template, payload->>'cycle_id')`
WHERE status IN ('pending','sending','sent') — re-running the cron same
day is a no-op.

**Gap today.** Cron job (Vercel cron / Cloud Scheduler) doesn't exist.
Idempotency index does ✅.

---

## Flow 8 — Auto-alert from farm-side D30 dip

**Trigger.** AquaWise farm app posts a `farm_cycle_metrics` row with a low D30.

> **Cross-service dependency:** this flow depends on the **farm-side
> AquaWise app** writing `farm_cycle_metrics` rows into the shared
> Supabase. That schema and ingest path is owned by the farm-side
> product team, not the hatchery CRM. Until the farm app is writing
> these rows reliably, the trigger has nothing to fire on. Coordinate
> with the farm team on: (a) row schema (must include `batch_id`,
> `customer_id`, `cycle_id`, `d30`, `recorded_at`), (b) write cadence
> (real-time vs. nightly batch), (c) RLS scope (hatchery-CRM service
> role must have SELECT on `farm_cycle_metrics`). See `06` P2.4.

```
Farm app       Supabase           Trigger / Cron     CRM realtime     Owner / Rep
 │ POST D30=62 │                   │                    │                 │
 │────────────▶│                   │                    │                 │
 │             │ insert farm_      │                    │                 │
 │             │  cycle_metrics    │                    │                 │
 │             │ trigger fires ───▶│                    │                 │
 │             │                   │ count low-D30     │                 │
 │             │                   │ rows for batch    │                 │
 │             │                   │ in last 7d        │                 │
 │             │                   │ if ≥2: insert     │                 │
 │             │                   │  alerts row       │                 │
 │             │                   │  sev='medium'     │                 │
 │             │                   │ ────▶             │                 │
 │             │ ◀── alert id ─────│                    │                 │
 │             │ realtime ──────────────────────────────▶                 │
 │             │                                        │ /alerts page    │
 │             │                                        │ shows new card  │
 │             │                                        │◀────────────────│
 │             │                                        │ owner clicks    │
 │             │                                        │ "ส่งข้อความ      │
 │             │                                        │  ถึงฟาร์ม"        │
 │             │                                        │ → Flow 5 fan-out│
```

**Persistence.** `alerts` row inserted by trigger; later resolved via
Flow E3.

**Gap today.** Postgres trigger doesn't exist. `farm_cycle_metrics` is
the join surface to the AquaWise farm app — schema needs to be agreed
across both products.

---

## Flow 9 — Public scorecard view (ISR + revalidation)

**Trigger.** Farmer (or anyone) hits `/{locale}/h/{slug}` from the QR
code on the hatchery's tank sticker, Facebook, or counter poster.

```
Visitor          Next.js (Vercel)        Supabase                CDN cache
 │ scan QR        │                          │                        │
 │───────────────▶│                          │                        │
 │ GET /th/h/foo  │                          │                        │
 │                │ check ISR cache ────────▶│                        │
 │                │◀── HIT (<6h old) ─────────────────────────────────│
 │ HTML + OG +    │                          │                        │
 │ JSON-LD        │                          │                        │
 │◀───────────────│                          │                        │
 │                │                          │                        │
 │                │ MISS or stale (>6h)      │                        │
 │                │ generateStaticProps:     │                        │
 │                │  select hatchery_brand   │                        │
 │                │   where slug=$1 and      │                        │
 │                │   scorecard_settings     │                        │
 │                │   .public = true ───────▶│                        │
 │                │ select aggregates        │                        │
 │                │  (avg D30 last 6 cycles, │                        │
 │                │   batch count, PCR %)   ─▶                        │
 │                │ ◀── rows + aggs ─────────│                        │
 │                │ render with brand-tier   │                        │
 │                │ font + co-brand color    │                        │
 │                │ embed OG + JSON-LD       │                        │
 │                │ store in ISR cache ─────────────────────────────▶ │
 │                │                          │                        │
 │ HTML returned  │                          │                        │
 │◀───────────────│                          │                        │
```

**Persistence.** Read-only on `hatchery_brand`, `scorecard_settings`,
plus computed aggregates (memoized in cache; no writes).

**Caching.** Vercel ISR with `revalidate: 21600` (6h). Manual purge
endpoint `/api/admin/purge-scorecard?slug=foo` for owners who want to
push a brand-update live immediately.

**SEO.** OG image auto-rendered (e.g., via `@vercel/og`) showing
hatchery name + verified-D30 stat. JSON-LD `Organization` schema with
`aggregateRating` (when ≥10 reviews exist — Phase H3). Page indexable
unless `scorecard_settings.public = false`, in which case the route
returns 404.

**Voice.** This is a brand-tier surface — Plus Jakarta Sans + Noto
Sans Thai (see `07-brand-and-voice.md`). No emojis, no marketing copy.
"Verified by AquaWise" is the *stamp*, not the headline.

**Gap today.** Page does not exist. See `06` P2.1 / story F2 + F4.

---

## Flow 10 — Dead-letter retry / escalate

**Trigger.** A bot worker push fails 3 times with exponential backoff
and `line_outbound_events.status` flips to `'dead'`.

```
Bot worker     Supabase            Cron (digest)        Owner            CRM Failures page
 │ attempt 3     │                     │                   │                   │
 │ fails ───────▶│                     │                   │                   │
 │ status=dead   │                     │                   │                   │
 │               │ realtime ──────────▶ subscriber: none   │                   │
 │               │                     │ (no UI in P0)     │                   │
 │               │                     │                   │                   │
 │               │  ┌─ daily 09:00 ICT ┘                   │                   │
 │               │  │ select status='dead'                 │                   │
 │               │  │ where last_attempt > -24h            │                   │
 │               │  │ group by hatchery                    │                   │
 │               │  │ for each: enqueue                    │                   │
 │               │  │  template_push: failures_digest      │                   │
 │               │  │  to owner's LINE                     │                   │
 │               │  │  payload: count, top 3 customers     │                   │
 │               │  └─────────────────────────────────────▶│ "5 messages       │
 │               │                                        │  need attention"  │
 │               │                                        │ (taps Flex CTA)   │
 │               │                                        │  ────────────────▶│
 │               │                                        │                   │ open
 │               │                                        │                   │ /settings/
 │               │                                        │                   │ messaging-
 │               │                                        │                   │ failures
 │               │                                        │                   │ select rows
 │               │                                        │                   │ click Retry
 │               │ ◀────────────────────────────────────────────────────────── │
 │               │ status=pending,                        │                   │
 │               │ retry_count++                          │                   │
 │               │ insert audit_log                       │                   │
 │               │                                        │                   │
 │ realtime ◀────│                                        │                   │
 │ pull, push    │                                        │                   │
 │ (Flow 5)      │                                        │                   │
```

**Per-row actions.**

| Action | Effect |
|---|---|
| **Retry** | `status=pending`, `retry_count++`, audit log row, worker picks up via Realtime |
| **Edit & retry** | Modal to edit `payload`, then same as Retry |
| **Mark resolved** | `status='resolved'`, no resend, audit log; row stays for compliance |

**Bulk action.** Multi-select rows → "Retry selected (N)" → fan-out to
the same per-row Retry path with one audit log per row.

**Persistence.** `line_outbound_events.status` transitions; new
`audit_log` table (see `06` P2.11) records who/when/what.

**Operator notification.** Once-daily digest (NOT per-failure spam) to
the owner via the same `line_outbound_events` queue, template
`failures_digest`. If notifications are disabled in Settings, digest
goes to email instead.

**Gap today.** Not implemented. See `06` P2.11 / story X1.

---

## Cross-flow sequencing notes

- **All LINE pushes** route through `line_outbound_events` — the CRM never
  calls the LINE Messaging API directly. This keeps a single rate-limited,
  retryable, observable funnel.
- **All Flex messages** are rendered by the bot worker, not the CRM. The
  CRM sends `template + payload`; the worker is the only thing that knows
  the LINE Flex JSON shape. This lets us upgrade Flex templates without
  redeploying the CRM.
- **Chat messages** do NOT route through `line_outbound_events`. Persistent
  chat is Postgres-only with Realtime; the LINE OA is only used for the
  nudge ("you have a new message in your LIFF inbox") when the farmer is
  idle.
- **Idempotency** lives in partial unique indexes, not in app code. A
  re-run of the cron can never double-send.
- **Multi-tenant boundary** is enforced by RLS on every table where
  `hatchery_id` is set. The bot worker uses the service role and is
  responsible for getting tenancy right at render time.
