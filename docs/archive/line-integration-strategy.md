> ARCHIVED 2026-05-15 — superseded by `docs/bmad/`. Historical record; NOT authoritative. LINE integration is now specified in `docs/bmad/stories/` (Epic G + Epic K) and the cross-product contract in `docs/aquawise-updated-docs/` (DSR-SPEC, K-INTEGRATION-CONTRACT). See `docs/README.md` for the authority map.

# LINE × Hatchery-CRM: Centralization Strategy

> Comprehensive design doc for connecting the existing `aquawise-line-bot` to the new `hatchery-crm` product so that every farmer↔hatchery interaction flows through Aquawise's single LINE channel — with one-on-one conversations happening inside our own LIFF mini-chat we control.
>
> **Decisions locked:**
> 1. Single Aquawise LINE OA, hatchery-branded co-header in each Flex Message
> 2. Centralized Gemini advisor (in @aquawise chat) that can roll up "all my ponds" across every hatchery a farmer is bound to
> 3. Outbound CRM→LINE delivered via a shared Supabase event table (Realtime-subscribed by the bot)
> 4. **Per-hatchery 1:1 conversations live in a LIFF mini-chat we build, not in the LINE chat itself** — every push Flex carries a "เปิดแชท" button that deep-links into the right thread

---

## 1. Context & Strategic Intent

**Why this exists:** Aquawise already owns the farmer relationship via a working LINE bot — weather, shrimp prices, news, AI advisor, daily digest. The new `hatchery-crm` product gives hatcheries a SaaS to manage their farm customers, batches, PCR results, alerts, and restocks. If hatcheries push notifications to farmers through their own channels (private LINE chats, phone calls, paper), Aquawise loses the central vantage point that makes the advisor moat possible.

**The strategic prize:** be the only player who can answer the farmer's most valuable question — *"how is my whole farm doing across every batch I bought from every hatchery, given today's weather and price?"* — because we are the only system that sees all of it at once. Every notification, advisor question, and restock conversation routed through Aquawise compounds this advantage.

**The hard part:** A farmer has **one** LINE identity. A farm has **many** ponds. Each pond's crop can come from a **different** hatchery. CRM is multi-tenant — many hatcheries — so the same `line_user_id` legitimately appears as `customers.line_id` under several hatcheries at once. The system must be **farmer-centric on LINE** and **hatchery-centric in CRM**, bridged by **the pond/batch**.

---

## 2. The Two-Surface Model (the core insight)

Don't try to run hatchery↔farmer conversations inside the LINE chat itself. The LINE chat is too constrained (Flex Messages aren't a real chat UI), too expensive at volume (per-message pricing), and forces ugly per-turn "which hatchery?" disambiguation when a farmer is bound to multiple hatcheries.

Split into two surfaces, each with one job:

### Surface A — `@aquawise` LINE chat (the broadcast + advisor surface)
- Hatcheries push **Flex Messages** through this channel for promos, PCR results, restock reminders, harvest alerts
- Each Flex carries a **co-branded header** (hatchery logo + name, "ส่งผ่าน Aquawise" footer) and a **call-to-action button** ("เปิดแชทกับฟ้าใส") that deep-links into the LIFF mini-chat for that specific hatchery↔farmer thread
- The `aquawise-line-bot` Gemini advisor lives here too — handles weather, prices, news, and cross-hatchery roll-up queries ("ลูกกุ้งทุกบ่อเป็นไงบ้าง")
- Generic queries (no specific hatchery context) stay here

### Surface B — LIFF mini-chat (the conversation surface, ours to build)
- A purpose-built chat UI at `liff.aquawise.app/chat?h=<hatchery_id>`
- Each thread is **one farmer × one hatchery** — perfectly scoped, no disambiguation
- Real-time via Supabase Realtime (free) — not LINE push API (paid)
- Rich UI we control: batch cards, price quotes, "approve restock" buttons, photo uploads, geo-pinned pond locations, links to Stripe checkout
- Hatchery staff see the same thread as a chat panel in CRM
- Conversation history lives in our Postgres forever — searchable, trainable, exportable

### Surface C — LIFF inbox (`/liff/inbox`)
- Rich Menu adds an "ข้อความของฉัน" button → opens an inbox listing every hatchery thread with unread badges + last message preview
- One-tap entry to any thread without needing a Flex push

**Why this split:** the LINE chat is the doorbell, our LIFF is the living room. Push sparingly through the doorbell; do the work indoors where we control the experience and the cost.

---

## 3. Existing Building Blocks (do not rebuild)

### 3.1 `aquawise-line-bot` (separate Cloud Run service)
- `@line/bot-sdk` v9.4, Express, TypeScript, deployed `asia-southeast1` min-instances:1
- Webhook handler: `src/index.ts` → `handlers/message.ts` → `lib/ai/agent.ts`
- LIFF token verification middleware: `src/middleware/liff-auth.ts` (5-min cache, SHA-256 keyed, supports both ID-token JWT and access-token opaque flows)
- Gemini 3.1 Flash Lite agent with tool calling
- Existing Flex Message templates (weather card, price card, news card)
- Cloud Scheduler push pipeline — every minute, batched in groups of 10, 1-sec inter-batch delay
- Rich Menu 2500×1686 px, 6 buttons (will swap one for "ข้อความของฉัน")
- Existing LIFF mini-apps: `/liff/water-quality-scan`, `/liff/pond-log` — reuse the LIFF host, framework, and auth patterns

### 3.2 Shared Supabase tables (live in line-bot's project today)
- `line_users` — canonical farmer identity (`line_user_id`, profile, notification prefs)
- `line_message_logs` — audit
- `line_scheduled_notifications` — per-user schedules
- `shrimp_prices`, `aquaculture_news`, `weather_cache`

### 3.3 `hatchery-crm` schema (canonical: `supabase/migrations/001_init.sql`)
- `hatcheries` (sellers, multi-tenant) with `plan` field
- `customers` — already has `line_id text` field (line 54)
- `batches` (id `text`, e.g. `B-2604-A`) — `pcr` (clean/flagged/pending), `mean_d30`, `dist`
- `batch_buyers` — M:N junction; the canonical "this customer's pond gets larvae from this batch" link
- `customer_cycles` — `cycle_day`, `expected_harvest`, `d30`, `d60`, `restock_in`
- `alerts` + `alert_farms` — disease/performance, M:N to farms
- `notification_settings` — `line_reply` boolean
- UI placeholder: `components/modals/send-line-modal.tsx` (Thai templates already drafted: "ใกล้ครบรอบ", "มีล็อตใหม่")

### 3.4 What is **not** built yet
- No `@line/bot-sdk` in `hatchery-crm/package.json` — and we're keeping it that way (CRM does not call LINE directly)
- No webhook receiver in CRM (correct — webhook stays in the bot service)
- No identity-bind flow
- No outbound event table or worker
- No LIFF mini-chat
- No CRM-side chat panel

---

## 4. Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                          Farmer (LINE app)                            │
│                                                                      │
│  ┌─ Surface A: @aquawise chat ──────┐  ┌─ Surface B: LIFF mini-chat ─┐│
│  │ - co-branded Flex pushes         │  │  one thread =                ││
│  │ - Gemini advisor (cross-hatch)   │  │    one (farmer × hatchery)   ││
│  │ - "เปิดแชท" buttons → LIFF        │  │  real-time, rich UI, ours   ││
│  └──────────────────────────────────┘  └──────────────────────────────┘│
│                                          ┌─ Surface C: LIFF inbox ───┐ │
│                                          │  list of all threads      │ │
│                                          └───────────────────────────┘ │
└────────┬──────────────────────────▲──────────┬───────────────────────▲─┘
         │ msgs / LIFF auth         │ pushes   │ chat msgs (WS)        │
         ▼                          │          ▼                       │
┌──────────────────────────────────────────────────────────────────────┐
│                  aquawise-line-bot (Cloud Run)                        │
│  webhook + Gemini agent + LIFF auth mw + outbound worker              │
│  + nudge worker (sends "new msg" Flex when LIFF idle)                │
└────────┬──────────────────────────▲──────────────────────────────────┘
         │ INSERT line_outbound      │ writes inbound, reads CRM
         ▼                           │
┌──────────────────────────────────────────────────────────────────────┐
│                    Shared Supabase (one project)                      │
│                                                                      │
│  Existing: line_users, line_message_logs, hatcheries, customers,      │
│            batches, batch_buyers, customer_cycles, alerts             │
│                                                                      │
│  ▶ NEW: line_outbound_events       (push queue → bot worker)          │
│  ▶ NEW: customer_bind_tokens       (one-shot LIFF bind)               │
│  ▶ NEW: hatchery_brand             (logo, color, display names)       │
│  ▶ NEW: chat_threads               (one row per farmer×hatchery)      │
│  ▶ NEW: chat_messages              (the actual chat content)          │
│  ▶ NEW: chat_read_receipts         (per-side read state)              │
└────────▲──────────────────────────▲──────────────────────────────────┘
         │ writes events             │ reads + writes chat
         │ writes chat (staff side)  │ via supabase-js + Realtime
┌──────────────────────────────────────────────────────────────────────┐
│                   hatchery-crm (Next.js, Vercel)                      │
│  CRM dashboard, send-line-modal, customer detail (with chat panel),   │
│  alerts feed, brand setup wizard                                      │
└──────────────────────────────────────────────────────────────────────┘
                          ▲
                          │
                  Hatchery staff (web)
```

Two services, one DB, three farmer-facing surfaces. CRM **never** talks to LINE directly. Bot **never** writes to CRM business tables (only to event/log/inbound tables and the chat tables).

---

## 5. The Four Bridges

### 5.1 Identity Bridge — bind `customers.line_id` ↔ `line_users.line_user_id`

**Trust model:** the hatchery vouches for who the farmer is (they already know each other). The farmer authenticates the LINE side via LIFF (LINE provides `line_user_id` cryptographically). The CRM side is proven by a one-time token the hatchery created for that specific customer.

See migration `006_line_integration.sql` for the `customer_bind_tokens` table.

**Flow:**
1. Hatchery rep clicks "Invite to LINE" on a customer record → server action mints token → returns `https://liff.aquawise.app/bind?t=<token>`.
2. Hatchery sends link via SMS / paper QR / their existing chat (one-shot).
3. Farmer opens link in LINE → LIFF bind page → LIFF SDK gives `accessToken` + `userId` → page POSTs both to `hatchery-crm` API `/api/line/bind`.
4. Server: verifies token via existing LIFF middleware; checks not expired/consumed; sets `customers.line_id = userId`; upserts a `line_users` row; creates a `chat_threads` row for this `(hatchery_id, customer_id)`; marks token consumed.
5. Show success page with one-tap "เปิดแชทกับฟ้าใส" button → deep-links into the new LIFF chat thread.

**Multi-hatchery binding:** the same `line_user_id` lands on N customer rows across N hatcheries, with N separate `chat_threads`. That is correct.

**Edge cases:**
- Token reused → 410 Gone, ask for a new invite.
- Customer already has a different `line_id` → require explicit confirmation step.
- LIFF token verification failure → 401, log to audit.

### 5.2 Outbound Push Bridge — CRM event → Flex Message in @aquawise chat

CRM never calls LINE directly. It writes a row to `line_outbound_events`; the bot worker delivers.

**Bot-side worker** (`aquawise-line-bot/src/workers/outbound.ts`, NEW):
- Subscribe via Postgres Realtime to `INSERT` on `line_outbound_events`.
- Atomic transition `pending → sending` (`update where status='pending' returning *`) to prevent double-send.
- Load `hatchery_brand`, render Flex Message, call `client.pushMessage(line_user_id, message)`.
- Success → `sent`. Failure → `attempts++`; if < 5, leave `failed` for retry; if ≥ 5, mark `dead` + emit a CRM-side notification.
- Backoff sweep every 60s for `failed` rows where `attempts < 5` and `now() - last_attempt > attempts * 30s`.
- Safety net: 30s polling sweep for `pending` rows in case Realtime missed.

**Templates v1 (5 push templates, all carry "เปิดแชท" CTA):**

| Template | Trigger | Payload | CTA button |
|---|---|---|---|
| `larvae_ready` | Hatchery creates a new batch with `pcr='clean'` and customer is on prior-buyers / restock-list | `{batch_id, species, size_g, price_per_thousand, available_qty, ready_date}` | "เปิดแชทเพื่อสอบถาม" → LIFF chat |
| `pcr_result` | `batches.pcr` transitions for a batch the customer has via `batch_buyers` | `{batch_id, pcr, tested_at, lab}` | "ดูรายละเอียดในแชท" |
| `restock_reminder` | Daily cron: `customer_cycles.restock_in <= 7` and not sent in last 5 days | `{cycle_id, current_day, expected_harvest, restock_in, suggested_batch_ids[]}` | "คุยเรื่องล็อตใหม่" |
| `harvest_window` | Daily cron: pond at d≥58 within 4 days of `expected_harvest` | `{cycle_id, current_day, expected_harvest, last_d60, dist}` | "ปรึกษาก่อนจับ" |
| `disease_alert` | New row in `alerts` with `sev` ≥ medium, joined via `alert_farms` | `{alert_id, sev, summary, recommended_action_th}` | "คุยกับโรงเพาะ" |

Plus a sixth, system-emitted template:

| Template | Trigger | Payload |
|---|---|---|
| `chat_nudge` | Hatchery staff sends a chat message and farmer's LIFF presence is `inactive > 60s` and last nudge for this thread was > 30 min ago | `{thread_id, hatchery_name, message_preview}` |

**Co-branded Flex header:**
```
┌─────────────────────────────────────┐
│ [logo] ฟ้าใส โรงเพาะพันธุ์            │
│        ส่งผ่าน Aquawise               │
├─────────────────────────────────────┤
│ <template-specific body>            │
│                                     │
│         [ เปิดแชท ]                  │  <- LIFF deep link
└─────────────────────────────────────┘
```

### 5.3 Conversation Bridge — LIFF mini-chat (the new core)

This is the key surface. Each thread = one `(hatchery_id, customer_id)` pair.

Schema lives in migration `007_chat.sql`: `chat_threads`, `chat_messages`, `chat_read_receipts`, `chat_presence`.

**Farmer side — LIFF mini-chat (`/liff/chat?h=<hatchery_id>`)**:
- LIFF auth gives `line_user_id` → backend resolves the unique `chat_threads` row for that hatchery.
- React chat UI subscribed to `chat_messages` via Supabase Realtime.
- On focus: heartbeat to `chat_presence`, mark `chat_read_receipts.farmer`.
- Compose box: text + photo upload (uploads to Supabase Storage, then sends a `card_kind='photo'` message).
- Receives rich cards rendered by the hatchery side: batch quote with "ขอใบเสนอราคา" button, order draft with "อนุมัติ" CTA, etc.
- "←" returns to LIFF inbox; LINE close button returns to LINE chat.

**Hatchery side — chat panel inside CRM**:
- Customer detail page gets a chat tab that mirrors the same thread.
- Staff types text → `chat_messages` row inserted with `sender='hatchery'`.
- Quick-action buttons compose structured cards (batch quote, order draft, restock offer) directly into the thread.
- Inbound farmer photos and replies appear in real-time.

**Nudge logic** (when the farmer isn't currently in the LIFF):
- Hatchery sends a message → trigger checks `chat_presence.last_seen_at`; if > 60s ago for this thread, and no `chat_nudge` event for this thread in the last 30 min, emit a `chat_nudge` row in `line_outbound_events`.
- The bot's outbound worker delivers a tiny Flex Message ("📬 ฟ้าใส โรงเพาะพันธุ์ ส่งข้อความถึงคุณ" + "เปิดแชท" button).
- Tapping the button re-opens the LIFF thread → presence updates → no more nudges until next idle window.

This nudge model is the only outbound-message cost during conversation. One nudge can carry many messages worth of catch-up.

### 5.4 Inbox Bridge — Surface C

**LIFF inbox (`/liff/inbox`)**: lists all `chat_threads` for the LINE user, with hatchery brand, last message preview, unread count (computed from `chat_messages.created_at > chat_read_receipts.last_read_at`).

**Rich Menu**: replace one of the existing 6 buttons with "ข้อความของฉัน" → opens `/liff/inbox`. The other 5 keep their existing functions (weather, water quality scan, advisor, location, alerts) so we don't disrupt the existing bot UX.

### 5.5 Centralized Advisor — what stays in the @aquawise chat

The Gemini advisor is unchanged in spirit, sharper in scope:

| Question type | Where answered |
|---|---|
| Weather, prices, generic farming Q&A | @aquawise chat (existing) |
| "ลูกกุ้งทุกบ่อเป็นไงบ้าง" — cross-hatchery roll-up | @aquawise chat (NEW) |
| "บ่อ A2 มีปัญหา" — specific to one hatchery's batch | LIFF mini-chat for that hatchery |
| "เห็นโพสต์ราคาวันนี้ ขอเปรียบเทียบ" | @aquawise chat |

Add **two** Gemini tools to the bot agent:

| Tool | Purpose |
|---|---|
| `get_my_ponds(line_user_id)` | Cross-hatchery roll-up: list every pond the farmer has across all bound hatcheries with `(hatchery_name, batch_id, pond_label, day_in_cycle, d30, d60, restock_in, last_alert)` |
| `open_chat_with(hatchery_id, line_user_id)` | Returns a Flex with the deep-link button — used when the agent decides "you should ask Fasai directly" and points the farmer to the right thread |

Bump `MAX_TOOL_ITERATIONS` from 1 → 2 so the agent can chain `get_my_ponds → open_chat_with`.

---

## 6. Phased Build

| Phase | Scope | Est. effort | Verifiable outcome |
|---|---|---|---|
| **1. Identity + outbound MVP** | `customer_bind_tokens`, `hatchery_brand`, `line_outbound_events` migrations; `/api/line/bind` + `/liff/bind`; bot Realtime worker; 5 push templates | 2 wks | Hatchery rep sends invite → farmer binds → "Send LINE: larvae_ready" delivers branded Flex within 10s |
| **2. LIFF mini-chat (core)** | `chat_threads`, `chat_messages`, `chat_read_receipts`, `chat_presence` migrations; `/liff/chat` page (text + photos); CRM chat panel on customer detail; Realtime on both sides; `chat_nudge` template + nudge logic | 3 wks | Hatchery types in CRM panel → farmer sees in LIFF in real-time; if farmer is away, gets a Flex nudge once |
| **3. Inbox + Rich Menu update** | `/liff/inbox` page; replace one Rich Menu slot with "ข้อความของฉัน"; unread badges | 1 wk | Farmer taps Rich Menu → sees all their hatchery threads with unread counts |
| **4. Advisor centralization** | 2 new Gemini tools; cross-hatchery roll-up replies in @aquawise chat | 1 wk | Farmer asks "ลูกกุ้งทุกบ่อเป็นไงบ้าง" → bot replies with all hatcheries' batches in one carousel |
| **5. Rich cards in chat** | Card kinds: `batch_quote`, `order_draft`, `price_card`, `pond_pin`; CRM quick-action buttons to compose them; farmer-side approve/decline actions | 2 wks | Hatchery sends batch quote card → farmer taps approve → order draft created in CRM |

**Total: ~9 weeks.** Phase 1 alone is shippable value (broadcast capability). Phases 2–3 deliver the Flex-push → LIFF-chat architecture. Phases 4–5 unlock the advisor moat and rich commerce.

---

## 7. Critical Files / Locations

**hatchery-crm:**
- `supabase/migrations/006_line_integration.sql` — bind tokens, outbound events, hatchery brand
- `supabase/migrations/007_chat.sql` — chat threads/messages/receipts/presence (Phase 2)
- `components/modals/send-line-modal.tsx` — replace stub with event-emitting server action
- `app/api/line/bind/route.ts` — bind endpoint (NEW)
- `app/[locale]/(dashboard)/customers/[id]/page.tsx` — add "Invite to LINE" + chat panel + bind status
- `app/[locale]/(dashboard)/customers/[id]/chat-panel.tsx` — staff chat UI (NEW, Phase 2)
- `app/[locale]/(dashboard)/settings/brand` — `hatchery_brand` setup wizard
- `lib/api/line.ts` — server actions: `mintBindToken`, `sendLineEvent`, `archiveThread`
- `lib/api/chat.ts` — server actions: `sendChatMessage`, `markRead`, `composeQuoteCard`

**aquawise-line-bot:**
- `src/workers/outbound.ts` — Realtime push worker (NEW)
- `src/workers/nudge.ts` — chat-nudge debouncer (NEW, may live inside outbound)
- `src/handlers/message.ts` — extend with cross-hatchery context for @aquawise generic queries
- `src/lib/ai/agent.ts` — add `get_my_ponds`, `open_chat_with`, bump iterations
- `src/lib/flex/hatchery-templates.ts` — 6 co-branded templates incl. `chat_nudge` (NEW)
- `src/middleware/liff-auth.ts` — already exists, expose for bind + chat endpoints
- `src/liff/chat/` — LIFF mini-chat page (NEW)
- `src/liff/inbox/` — LIFF inbox page (NEW)
- `src/liff/bind/` — LIFF bind page (NEW)

---

## 8. Cross-Cutting Concerns

### 8.1 LINE Messaging API cost
Splitting conversation into LIFF means push API cost is bounded:
- 5 broadcast templates: O(events triggered) — capped by hatchery activity
- `chat_nudge`: at most 1 per thread per 30 min — naturally throttled
- Daily crons (`restock_reminder`, `harvest_window`): one per qualifying customer per cycle

Surface monthly send count in CRM billing page so hatcheries see what they're consuming. Folds into existing `hatcheries.plan` tiers.

### 8.2 Idempotency
Cron-driven templates dedupe via partial unique indexes (see migration). For `disease_alert`: dedupe on `(customer_id, alert_id)`. App code uses `on conflict do nothing`.

### 8.3 Real-time chat
Supabase Realtime postgres_changes on `chat_messages` filtered by `thread_id`. Both LIFF and CRM panel subscribe. Presence updates throttled to 1/10s heartbeat.

### 8.4 Read receipts & unread
`chat_read_receipts` row per `(thread_id, side)`. Unread = count of `chat_messages` newer than `last_read_at` from the opposite sender. LIFF marks read on focus + scroll-to-bottom; CRM marks read on panel focus.

### 8.5 Photo / attachment handling
Supabase Storage bucket `chat-attachments` with RLS scoped per thread. Direct upload from LIFF/CRM, store URL in `chat_messages.attachments`. 10MB max, server-side image resize to thumbnail.

### 8.6 Observability
- Every outbound event row is its own audit trail.
- Mirror sent events to existing `line_message_logs`.
- Chat thread last activity surfaced on CRM dashboard.
- Worker emits structured logs `{event_id, hatchery_id, template, status, latency_ms}` → Cloud Logging.

### 8.7 Security
- LIFF `accessToken` verified server-side on every endpoint (existing middleware).
- `customer_bind_tokens` are 26-char ULIDs, single-use, 7-day expiry.
- RLS: hatchery staff can read/insert `chat_messages` only WHERE `thread_id IN (SELECT id FROM chat_threads WHERE hatchery_id IN current_user_hatchery_ids)`. Farmer (LIFF) reads/inserts via service-role, scoped to `chat_threads.line_user_id = their_line_user_id` in app code.
- Bot service-role key in Cloud Run secret manager; never returned to client.
- LIFF host on `liff.aquawise.app`, HTTPS-only, HSTS.

### 8.8 Failure modes
| Failure | Behavior |
|---|---|
| Bot service down | Events queue in `pending`; sweep picks up on restart; chat still works (CRM↔Supabase↔LIFF doesn't depend on the bot) |
| Realtime disconnect | 30s polling sweep on the bot; LIFF/CRM use Supabase client retry |
| LINE API 5xx | Retry with backoff, max 5 attempts, then `dead` |
| Stale `customers.line_id` | Push fails → mark `dead`, surface "needs re-bind" in CRM |
| Token replay | `consumed_at` check + RLS on token table |
| Photo upload abuse | Storage bucket RLS scopes uploads to thread; size cap; rate limit per `line_user_id` |

### 8.9 i18n
- LIFF mini-chat UI: Thai-first, English fallback via `next-intl` (or LIFF equivalent).
- Push Flex templates: Thai-only for v1 (TH market focus). English variant later.
- `hatchery_brand.display_name_th` + `display_name_en`.

### 8.10 Privacy invariant
Cross-hatchery data only ever shown to the **farmer** in the @aquawise chat or `/liff/inbox`. Hatcheries see only their own threads/customers/batches in CRM. Make this explicit in the farmer-facing terms during bind: *"Aquawise shows you a unified view of your farm; each hatchery only sees the batches they sold you."*

---

## 9. Verification (end-to-end smoke test)

Run after each phase ships; full version after Phase 5:

1. **Bind:** Hatchery rep creates customer "Somchai" in CRM, clicks "Invite to LINE" → token row written. Open invite URL on a real phone in LINE → LIFF binds → `customers.line_id` set, `chat_threads` row created, success page shows "เปิดแชทกับฟ้าใส" button.
2. **Outbound co-branded:** Hatchery rep clicks "Send LINE: larvae_ready" → event row → branded Flex Message arrives in farmer's @aquawise chat within 10s, with hatchery logo + "เปิดแชท" button.
3. **Tap-to-chat:** Tap "เปิดแชท" in the Flex → LIFF opens directly to the right thread.
4. **Two-way chat:** Hatchery types in CRM chat panel → farmer sees it in LIFF within 1s. Farmer types reply → CRM panel shows it in real-time. Photo upload from farmer side renders in CRM.
5. **Nudge:** Farmer closes LIFF. Hatchery sends a new chat message → after 60s of farmer-LIFF idle, a `chat_nudge` Flex arrives in @aquawise chat. Hatchery sends 5 more messages within 30 min → no further nudges. After 30 min of continued idle + new message → second nudge.
6. **Multi-hatchery:** Bind same farmer to a second hatchery via second invite. Inbox shows two threads. Each thread is independently scoped — messages don't cross.
7. **Cross-hatchery advisor:** In @aquawise chat (not LIFF), farmer types "ลูกกุ้งทุกบ่อเป็นไงบ้าง" → bot replies with carousel showing both hatcheries' batches.
8. **Idempotency:** Run restock-reminder cron twice for the same cycle → only one event, only one Flex.
9. **Failure recovery:** Stop bot worker, send 5 events from CRM → all queue. Restart → all delivered in order.

---

## 10. Open Items (not blockers, address before later phases)

- **Hatchery onboarding:** sign-up wizard collects logo + brand color for `hatchery_brand`.
- **Farmer terms acceptance:** during first bind, one-screen consent about cross-hatchery roll-up.
- **Send caps:** decide per-plan limits on hatchery monthly outbound volume; folds into `hatcheries.plan`.
- **Chat templates:** hatcheries may want canned-response templates ("ราคาวันนี้", "ลูกกุ้งล็อตใหม่ของเรา"). Add a `chat_canned_responses` table later.
- **Typing indicators:** nice-to-have, not blocking.
- **Voice notes:** later phase, requires audio upload + LINE compatibility check.
- **Future Stripe:** chat card kind `payment_link` that triggers `Stripe Checkout` for restock orders.

---

## 11. Why This Wins

The architecture is deliberately layered so the **product** can be ambitious:

- **The doorbell** (LINE chat) is small, branded with each hatchery's identity, and reserved for nudges and the cross-hatchery advisor.
- **The living room** (LIFF mini-chat) is ours — rich UI, real-time, free, owned data, infinite expandability.
- **The hatchery's command center** (CRM) gives staff a real inbox alongside their dashboards.

Only Aquawise can answer "how is my whole farm doing" because only Aquawise sees every batch from every hatchery the farmer trusts. Hatcheries get reach + tooling + a chat product without running infrastructure; farmers get one channel with structured threads instead of fragmented chats; Aquawise gets the relationship, the conversation history, and the data flywheel. Centralization here is not channel-ownership for its own sake — it is being the only system positioned to give the farmer a better answer (and a better commerce experience) than any individual hatchery could on their own.
