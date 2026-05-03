> Refreshed 2026-05-02 against `aquawise-updated-docs/03-aquawise-farmer-customer-doc.md`.

# 05 — LINE Integration: Hatchery ↔ Farm via @aquawise

This is the operational summary of how the CRM connects to farms through
the existing AquaWise LINE bot. The architectural source-of-truth is
[`../line-integration-strategy.md`](../line-integration-strategy.md) — read
that for the rationale (why one OA, why LIFF chat, why a queue). This doc
focuses on **what we build, in what order, to make the prototype's
LINE-shaped buttons actually push messages**.

---

## The model in one paragraph

There is **one shared LINE Official Account** — `@aquawise` — owned by
AquaWise. Hatcheries do not have their own OA. When a hatchery's CRM
"sends a LINE message" it inserts a row into a shared Supabase queue
(`line_outbound_events`); the existing Cloud Run bot service reads the
queue, renders a co-branded Flex Message (hatchery logo + name from
`hatchery_brand`), and pushes via the LINE Messaging API. Two-way chat
between farmer and hatchery happens in a LIFF mini-app accessed from the
@aquawise rich menu — not in LINE chat itself, so it doesn't compete with
the bot's broadcasts. The CRM and the bot share **one Supabase project**
and never call each other's HTTP endpoints.

```
┌─────────────────┐                                   ┌─────────────────┐
│ Hatchery CRM    │                                   │ Aquawise LINE   │
│ (Next.js Vercel)│         shared Supabase           │ Bot (Cloud Run) │
│                 │  ╔═══════════════════════════╗    │                 │
│ writes events ──┼──╣ line_outbound_events      ╠────┼─▶ reads events  │
│ writes brand ───┼──╣ hatchery_brand            ╠────┼─▶ reads brand   │
│ mints tokens ───┼──╣ customer_bind_tokens      ╠────┼─▶ consumes      │
│ reads chat   ◀──┼──╣ chat_threads/messages     ╠────┼─▶ reads/writes  │
│                 │  ╚═══════════════════════════╝    │                 │
│                 │                                   │   pushes Flex   │
│                 │                                   │   to @aquawise  │
└─────────────────┘                                   └─────────────────┘
                                                              │
                                                       ┌──────▼──────┐
                                                       │ LINE / Phone│
                                                       │  Farmer P6  │
                                                       └─────────────┘
```

---

## What the AquaWise farm-side bot already does

(Context — these features exist today on the @aquawise OA.)

- **Webhook + advisor.** Express on Cloud Run (asia-southeast1), `@line/bot-sdk` v9.4.
  Gemini 3.1 Flash Lite handles weather / shrimp prices / news / Q&A
  inside `@aquawise` chat.
- **Existing Flex templates.** Weather card, price card, news card.
- **Farmer usage modes (from farmer customer doc v1).** Two natural
  phone-in-hand windows per day: *pre-dawn pond walk* (one-tap inputs,
  fast acknowledgment, action-oriented — farmer will not sit and read)
  and *evening review* (longer messages, full charts, Day-30 check-ins).
  Hatchery-originated Flex Messages must respect this split: restock
  reminders and PCR certificates suit the evening window; disease alerts
  must be legible at a glance at 5 AM. The farmer friction budget is one
  minute of active effort per day — anything that demands more will erode
  participation and starve the data flywheel.
- **Cloud Scheduler push pipeline.** Batched pushes every minute, groups
  of 10, 1-second inter-batch delay (LINE rate limits).
- **Rich menu (6 buttons).** One slot will be repurposed for
  "ข้อความของฉัน" → LIFF inbox.
- **LIFF infrastructure.** Existing apps at `/liff/water-quality-scan` and
  `/liff/pond-log`; reusable LIFF auth middleware (5-minute token cache).
- **Shared tables it already uses.** `line_users`, `line_message_logs`,
  `line_scheduled_notifications`, `shrimp_prices`, `aquaculture_news`,
  `weather_cache`.

The bot has **never talked to a hatchery** before — that integration is
what we're building.

---

## What the hatchery CRM adds

### Phase 1 schema (already merged, `006_line_integration.sql`)

| Table | Purpose |
|---|---|
| `hatchery_brand` | Per-tenant logo URL, display name (TH/EN), brand color → used to co-brand every Flex |
| `customer_bind_tokens` | One-shot ULID (26-char, 7-day expiry) — minted by hatchery, consumed by farmer in LIFF to bind LINE user_id ↔ customer record |
| `line_outbound_events` | The push queue — every Flex message the CRM wants to send is a row here |

### Phase 2 schema (planned, `007_chat.sql`)

| Table | Purpose |
|---|---|
| `chat_threads` | One row per (hatchery, customer) pair — the persistent conversation |
| `chat_messages` | Every message in a thread — both directions, timestamped, with sender role |
| `chat_read_receipts` | Per-side "last read message" pointer for ✓✓ display |
| `chat_presence` | Typing indicators + last-active heartbeat |

### Enums (already defined)

```sql
line_event_status: pending | sending | sent | failed | dead
line_event_kind:   template_push | chat_nudge
```

### Idempotency indexes (already defined)

```sql
-- cron pushes: dedupe by cycle
unique (customer_id, template, payload->>'cycle_id')
  where status in ('pending','sending','sent')
  and template in ('restock_reminder','harvest_window');

-- disease alerts: dedupe by alert
unique (customer_id, payload->>'alert_id')
  where status in ('pending','sending','sent')
  and template = 'disease_alert';
```

---

## Build order — what to ship, when

### Week 1 — bind the loop

1. **`/api/line/bind` route in CRM** — accepts `{token, lineUserId, lineProfile}`,
   verifies + consumes the token, sets `customers.line_id`, upserts
   `line_users`, returns ok. Runs as service-role.
2. **LIFF bind page in Bot service** — `/liff/bind` reads `?token=...`,
   does LINE login, POSTs to `/api/line/bind` (CRM).
3. **CRM "Connect LINE" button** on customer card when `line_id IS NULL` —
   server action mints a token and returns the LIFF URL. Rep copies/sends.
4. **Acceptance.** Owner can connect 1 customer's LINE end-to-end.

### Week 2 — push outbound

5. **Bot worker extension** — Realtime subscribe to
   `line_outbound_events WHERE status='pending'`. Pull in batches of 10,
   set `status='sending'`, render Flex from template name + payload using
   `hatchery_brand`, push via @aquawise OA, set `status='sent'` (or
   `failed`+attempt-count → `dead` after 3 retries with backoff).
6. **Flex template registry in Bot** — `restock_reminder`,
   `harvest_window`, `new_batch_announcement`, `quote`, `pcr_certificate`,
   `alert_acknowledge`, `chat_nudge`. Each takes `{hatchery_id, customer_id, ...}`
   and renders with brand co-headers + "เปิดแชท" CTA → LIFF chat thread.
7. **CRM `sendLineEvent()` server action** — single insert into
   `line_outbound_events` with optimistic toast. Wire `sendLine` modal,
   `quote` modal, and `cert` modal to call it.
8. **Acceptance.** Rep clicks "ส่ง LINE" with a template; farmer phone
   pings within 5 seconds; the row in `line_outbound_events` shows `sent`.

### Week 3 — fan-out and cron

9. **Restock broadcast** — wire "ส่งข้อความหาทุกคน" on `/restock` to
   fan-out — one event per recipient — with confirmation dialog and count.
10. **Daily cron** — Vercel cron at 09:00 ICT. SELECT customers where
    `restock_in IN (7,3,0)` → INSERT `line_outbound_events` ON CONFLICT
    DO NOTHING. Same for harvest windows.
11. **Acceptance.** A test cohort of 5 farms gets a co-branded restock
    reminder at 09:00 without anyone clicking anything.

### Week 4 — Phase H1 messaging hardening (chat deferred)

> **Deferral note.** The original Week 4 plan was full two-way chat
> (LIFF inbox + CRM inbox panel + nudges + migration 007). The FR
> doc treats hatchery↔farm messaging as **send-only Flex** for Phase
> H1; a full chat surface is a separate program of work scheduled for
> Phase H3. See story G3 (deferred) and G3' (Phase H1 send-only) in
> `03-user-stories.md`.

What ships in Week 4 instead:

12. **Quiet hours enforcement in worker** — bot worker reads
    `notification_settings.quiet_hours_start/end` for each recipient;
    outside the window, leave events `pending` and re-evaluate at
    window-open. High-severity disease alerts bypass; manual rep-initiated
    sends bypass (rep is making a human decision). Story H4.
13. **Dead-letter handling** — worker flips events to `status='dead'`
    after 3 attempts with exponential backoff (1m → 5m → 30m). Once-daily
    `failures_digest` template push to the owner. CRM page
    `/settings/messaging-failures` ships as part of P2.11. See Flow 10
    in `04-flows.md`.
14. **Activity panel on customer detail** — joins `line_outbound_events`
    + `line_message_logs` so reps can see what was sent, when, and
    delivery status (no two-way replies surfaced yet — that's H3).
15. **Acceptance.** Push success rate ≥ 99% (excluding dead). Failed
    rows surface in the digest within 24h.

### Phase H3 — Two-way chat (deferred)

When unblocked, the full plan is:

- Migration 007 — chat tables (`chat_threads`, `chat_messages`,
  `chat_read_receipts`, `chat_presence`)
- Rich-menu update on @aquawise — swap one slot for "ข้อความของฉัน"
- LIFF inbox + LIFF chat thread pages with Realtime
- CRM `/inbox` page or right-rail panel with unread badges
- `chat_nudge` template when farmer is idle > 60s after a hatchery
  message
- Acceptance: farmer ↔ rep real-time chat with typing + read receipts

### Week 5 — alerts & disease pushes

19. **Postgres trigger on `farm_cycle_metrics`** — when ≥2 farms with same
    source `batch_id` report D30 < 70% in the last 7 days → INSERT into
    `alerts`.
20. **Wire alert "ส่งข้อความถึงฟาร์ม"** to fan out
    `disease_alert` Flex template to affected farms.

---

## Template payload contracts

Every Flex template the bot renders takes a JSON payload from the queue.
The CRM is responsible for the payload shape; the bot is responsible for
the visual. Locking the payload contract early lets both sides ship
independently.

### `restock_reminder`

```json
{
  "hatchery_id": "uuid",
  "customer_id": "uuid",
  "cycle_id": "uuid",
  "days_until_restock": 7,
  "last_d30": 82,
  "preferred_size": 12
}
```

### `quote`

```json
{
  "hatchery_id": "uuid",
  "customer_id": "uuid",
  "quote_id": "uuid",
  "items": [{"size": 12, "qty": 500000, "price": 0.18}],
  "valid_until": "2026-05-15",
  "lead_time_days": 5
}
```

### `pcr_certificate`

```json
{
  "hatchery_id": "uuid",
  "customer_id": "uuid",
  "batch_id": "B-2604-A",
  "cert_url": "https://...storage.../cert.pdf",
  "summary": {"WSSV": "clean", "EHP": "clean", "IHHNV": "clean", "TSV": "clean"}
}
```

### `disease_alert`

```json
{
  "hatchery_id": "uuid",
  "customer_id": "uuid",
  "alert_id": "uuid",
  "batch_id": "B-2604-A",
  "severity": "medium",
  "recommended_action": "ตรวจน้ำและเปลี่ยนสารดิน"
}
```

### `chat_nudge`

```json
{
  "hatchery_id": "uuid",
  "customer_id": "uuid",
  "thread_id": "uuid",
  "preview": "first 80 chars of unread message"
}
```

---

## Where each prototype button lands in this plan

| Prototype button | Today | Lands in |
|---|---|---|
| 💬 sendLine modal (any page) | opens, no submit | Week 2, step 7 |
| "เสนอราคา" quote modal | opens, no submit | Week 2, step 7 (template `quote`) |
| "ส่งใบรับรอง LINE" cert modal | opens, no submit | Week 2, step 7 (template `pcr_certificate`) |
| "ส่งข้อความหาทุกคน" (Restock) | toast only | Week 3, step 9 |
| "ส่งข้อความถึงฟาร์ม" (Alerts) | toast only | Week 5, step 20 |
| Scorecard "ส่ง LINE" | toast only | Week 3 (template `scorecard_share`) |
| Daily restock reminders (no UI) | not built | Week 3, step 10 |
| Auto-D30 disease alerts (no UI) | not built | Week 5, step 19 |
| Rep ↔ farmer two-way chat | not built | Week 4 |

---

## Operational concerns

- **Rate limits.** LINE caps push messages per OA; bot worker already
  batches to 10 per second. Restock cron must not enqueue tens of
  thousands at once — paginate by hatchery.
- **Tenant isolation in Flex.** The bot worker uses service-role and
  bypasses RLS. It MUST select `hatchery_brand` keyed by `event.hatchery_id`
  to render the right logo. Bug here = farmer sees the wrong hatchery's
  branding. Add an integration test.
- **Quiet hours.** Bot worker checks
  `notification_settings.quiet_hours_start/end` before pushing. Default
  21:00–07:00 ICT. Severity `high` events bypass; manual rep sends from
  the modal bypass (the rep is the decision-maker). See story H4 +
  FR-NOTIF-004.
- **Backoff & dead letter.** After 3 attempts with exponential backoff
  (1m → 5m → 30m), status flips to `dead`. CRM ships
  `/settings/messaging-failures` (P2.11) for retry / edit-and-retry /
  mark-resolved. Once-daily digest push notifies the owner. See Flow 10
  in `04-flows.md` and story X1.
- **GDPR / Thai PDPA.** `line_users.line_user_id` is a personal identifier.
  RLS scopes it to the bound hatchery; chat content is encrypted at rest
  by Supabase. Add a "delete my data" path triggered from the LIFF
  account screen (Phase H3 alongside chat).
- **Observability.** Every push logs to `line_message_logs` (already used
  by the bot). CRM ships an Activity panel on customer detail in Phase H1
  joining `line_outbound_events` + `line_message_logs`; chat-thread joins
  arrive with Phase H3.

---

## What we explicitly are NOT doing

- **Per-hatchery LINE OAs.** Brand confusion is real; we tested the
  trade-off in the strategy doc and chose a single OA with co-branded
  Flex.
- **CRM calling LINE Messaging API directly.** All pushes go through the
  queue. This keeps rate-limit and observability in one place.
- **Replicating chat into LINE chat itself.** The persistent thread lives
  in LIFF; only the nudge ("you have a new message") lands in LINE chat.
- **Storing chat content outside Postgres.** All searchable, all backed
  up, all RLS-scoped.
