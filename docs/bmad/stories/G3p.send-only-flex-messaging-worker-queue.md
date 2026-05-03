# Story G3p: Send-Only Flex Messaging — Worker + Queue

Status: draft

---

> **KEYSTONE STORY — P0.2**
>
> G3p is the critical-path prerequisite for 5 downstream stories. Until `G3p.i` lands, none of the following can reach `.v` (live verification):
>
> | Blocked story | Capability unlocked |
> |---|---|
> | **G2** | One-off LINE message from the customer card |
> | **D2** | Quote sent via LINE from the restock view |
> | **C4** | PCR certificate pushed via LINE |
> | **E4** | Disease-alert fan-out to affected farms |
> | **F3** | Scorecard PDF / LINE send |
>
> Do not sequence any of the above to `.v` until `G3p.i` is marked done and the bot worker is deployed.

---

## Story

As a Rep,
I want the existing CRM "send LINE" buttons to push templated co-branded Flex messages to farmers via the AquaWise OA,
so that Phase H1 has working outbound LINE delivery on day one — without yet exposing two-way chat.

## Acceptance Criteria

1. Every `sendLine` / `quote` / `cert` / disease-alert / restock-broadcast modal submission in the CRM inserts a row into `line_outbound_events` with `status='pending'`
2. The bot worker (Cloud Run, `aquawise-line-bot` repo) subscribes to `line_outbound_events` filtered to hatchery-type rows; it processes events in batches, rendering a co-branded Flex Message using `hatchery_brand` (logo, display name TH/EN, brand color) from the shared Supabase project
3. The worker pushes the Flex via the @aquawise LINE OA using the bound `customers.line_id` as the recipient
4. Status transitions are visible in the CRM: `pending → sending → sent` (on success) or `failed → dead` (after 3 retries with backoff 1m → 5m → 30m)
5. "เปิดแชท" CTA in every Flex points to a temporary LIFF placeholder — story G3 (deferred, see `_hypotheses/G3.two-way-chat-liff-inbox.md`) will swap the target to the real LIFF inbox when capacity allows
6. Farmer-initiated replies in LINE chat are logged to `line_message_logs` but are NOT surfaced in the CRM in this phase; full two-way chat is deferred to story G3
7. Tenant isolation is guaranteed: the worker reads `hatchery_brand` keyed by `event.hatchery_id` — no Flex message ever renders with the wrong hatchery's branding
8. High-severity disease alerts (`payload.severity = 'high'`) bypass quiet hours; all other events respect `notification_settings.quiet_hours_start/end` (default 21:00–07:00 ICT) per story H4

## Tasks / Subtasks

- [ ] Task 1 — CRM-side: Confirm `line_outbound_events` insert shape (AC: #1)
  - [ ] Read `supabase/migrations/006_line_integration.sql` and confirm columns: `id`, `hatchery_id`, `customer_id`, `template`, `payload jsonb`, `status line_event_status`, `kind line_event_kind`, `attempts int`, `last_error text`, `created_at`, `updated_at`
  - [ ] Confirm both idempotency indexes are in place:
    - Cron pushes: `UNIQUE (customer_id, template, payload->>'cycle_id') WHERE status IN ('pending','sending','sent') AND template IN ('restock_reminder','harvest_window')`
    - Alert pushes: `UNIQUE (customer_id, payload->>'alert_id') WHERE status IN ('pending','sending','sent') AND template = 'disease_alert'`
  - [ ] Note: alert idempotency uses JSONB extraction `payload->>'alert_id'` — this is NOT a column reference; SQL queries against this index must extract via `->>`
  - [ ] Ensure `lib/api/supabase.ts` has a reusable `enqueueLineEvent(event)` function used by all callers (G2, D2, C4, E4, F3, G4) — single insert path, no duplication
- [ ] Task 2 — CRM-side: Flex template payload validation (AC: #1)
  - [ ] Define a TypeScript union `LineTemplate` and per-template payload types in `lib/line/templates.ts`:
    - `restock_reminder` — `{hatchery_id, customer_id, cycle_id, days_until_restock, last_d30, preferred_size}`
    - `harvest_window` — `{hatchery_id, customer_id, cycle_id, harvest_date}`
    - `new_batch_announcement` — `{hatchery_id, customer_id, batch_id, available_qty, pcr_status}`
    - `quote` — `{hatchery_id, customer_id, quote_id, items, valid_until, lead_time_days}`
    - `pcr_certificate` — `{hatchery_id, customer_id, batch_id, cert_url, summary}`
    - `disease_alert` — `{hatchery_id, customer_id, alert_id, batch_id, severity, recommended_action}`
    - `chat_nudge` — `{hatchery_id, customer_id, thread_id, preview}`
  - [ ] Validate payload shape in `enqueueLineEvent()` before insert; reject unknown templates
- [ ] Task 3 — CRM-side: Customer Activity panel status display (AC: #4)
  - [ ] `lib/api/supabase.ts` — add `listLineEvents(customerId)` returning `line_outbound_events` ordered by `created_at DESC LIMIT 20`
  - [ ] Customer detail page renders these as an Activity timeline with status chips; TanStack Query polls or uses Supabase Realtime subscription to reflect status changes without a full page reload
- [ ] Task 4 — Bot worker repo (separate): `src/workers/outbound.ts` — CORE DELIVERABLE (AC: #2, #3, #4, #5, #6, #7, #8)
  - [ ] Subscribe to `line_outbound_events` via Supabase Realtime WHERE `status='pending'` (or poll at 5s interval as fallback if Realtime quota is a concern)
  - [ ] Pull events in batches of 10 (respects LINE rate limits); set `status='sending'` before processing
  - [ ] For each event: fetch `hatchery_brand` by `event.hatchery_id`; render the matching Flex template; push to `line_users.line_user_id` via LINE Push Message API; set `status='sent'`
  - [ ] On failure: increment `attempts`; apply backoff (1m → 5m → 30m); after 3 attempts set `status='dead'`
  - [ ] Respect quiet hours: before pushing, check `notification_settings.quiet_hours_start/end` for the recipient's hatchery; if outside window, leave `status='pending'` and skip; re-evaluate on next poll. Exception: `payload.severity='high'` events bypass quiet hours and log the bypass to `line_message_logs`
  - [ ] "เปิดแชท" CTA URL in every Flex: use a fixed LIFF placeholder path (e.g., `liff.line.me/{LIFF_ID}/placeholder`) — Phase H3 swaps this to the real inbox
  - [ ] Tenant isolation: always select `hatchery_brand` by `event.hatchery_id`; never cache brand across different hatchery events
  - [ ] Farmer replies: do not process; log inbound webhook events to `line_message_logs` only
  - [ ] Env vars required in bot worker (NOT in CRM): `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_CHANNEL_SECRET`, `LIFF_ID`
- [ ] Task 5 — Bot worker repo (separate): Flex template registry (AC: #2, #5)
  - [ ] `src/templates/` — one file per template name; each exports `renderFlex(payload, brand): FlexMessage`
  - [ ] All templates share a co-branded header: hatchery logo, display name (TH preferred, EN fallback), brand color accent
  - [ ] Flex Message design timing guidance (from `05-line-integration.md`):
    - **Disease alerts** — delivered pre-dawn (5 AM); must be scannable in under 5 seconds; prioritize severity icon, batch ID, recommended action in Thai; no decorative whitespace
    - **Restock reminders, PCR certificates, quotes** — delivered in the evening window; allow more detail, D30 data, item lists
  - [ ] Include an integration test asserting that rendering a `disease_alert` Flex with a test brand produces a valid LINE Flex JSON and does NOT contain the wrong `hatchery_id`'s brand data
- [ ] Task 6 — Integration test (AC: #4, #7)
  - [ ] `tests/line/outbound.test.ts` in CRM:
    - Enqueue a test event; confirm row has `status='pending'` with correct shape
    - Simulate worker processing: status flips to `sent`
    - Idempotency: alert event enqueued twice with same `alert_id` in payload — only one row created (JSONB extraction `payload->>'alert_id'` index fires)
    - Idempotency: cron event enqueued twice with same `cycle_id` — only one row created
    - Trial-expired hatchery: `enqueueLineEvent()` throws `PaywallError`
- [ ] Task 7 — Live verification (AC: #1–#7)
  - [ ] Deploy bot worker with `src/workers/outbound.ts` to Cloud Run staging
  - [ ] Confirm shared Supabase project between CRM and bot worker (same `SUPABASE_URL`)
  - [ ] Enqueue 1 event from CRM; confirm bot delivers within 30s; receiver's LINE shows Flex with correct hatchery branding
  - [ ] Enqueue a second event for the same customer; confirm it also delivers (no cross-event contamination)
  - [ ] Simulate 3 failures; confirm `status='dead'` after third attempt
  - [ ] Confirm no Flex is ever rendered with the wrong hatchery's logo

## Dev Notes

### Architecture Constraints

- CRM never calls LINE Messaging API directly — all pushes go through `line_outbound_events`
- CRM and bot worker share one Supabase project; they do not call each other's HTTP endpoints
- If the two services use separate Supabase projects today, a project-merge or cross-project access plan is a hard prerequisite before G3p can land
- Bot worker uses service-role Supabase client to bypass RLS when reading brand data and updating event status
- `'use client'` opt-in only in CRM; server components by default

### Cross-Service Boundary

**CRM-side (this repo):**
| File | Role |
|------|------|
| `supabase/migrations/006_line_integration.sql` | Already exists — queue table + idempotency indexes ✅ |
| `lib/line/templates.ts` | CREATE — TypeScript payload type definitions + validation |
| `lib/api/supabase.ts` | ADD `enqueueLineEvent()` + `listLineEvents()` |
| `lib/api/index.ts` | ADD facade dispatch |
| `lib/mock/api.ts` | ADD mock enqueue + listLineEvents |
| `app/[locale]/(dashboard)/customers/[id]/page.tsx` | ADD Activity panel |
| `tests/line/outbound.test.ts` | CREATE |

**Bot worker repo (separate — `aquawise-line-bot`, Cloud Run `asia-southeast1`, min-instances:1):**
- `src/workers/outbound.ts` — Realtime subscriber, batch consumer, Flex renderer, push sender, status updater
- `src/templates/` — per-template Flex renderers
- `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_CHANNEL_SECRET`, `LIFF_ID` — env vars here only

### Idempotency Detail

The two partial unique indexes on `line_outbound_events` use JSONB extraction — not column references. When writing SQL or Supabase queries that rely on these, extract correctly:

```sql
-- Cron deduplication
INSERT INTO line_outbound_events (...)
ON CONFLICT (customer_id, template, (payload->>'cycle_id'))
  WHERE status IN ('pending','sending','sent')
  AND template IN ('restock_reminder','harvest_window')
DO NOTHING;

-- Alert deduplication
ON CONFLICT (customer_id, (payload->>'alert_id'))
  WHERE status IN ('pending','sending','sent')
  AND template = 'disease_alert'
DO NOTHING;
```

The `payload->>'alert_id'` syntax is a JSONB expression index, not a simple column. Supabase's `.upsert()` helper does not natively express this — use a raw RPC or `supabase.rpc()` call for the ON CONFLICT path.

### RBAC

- Any `hatchery_members` user with `customer:write` can insert into `line_outbound_events`
- Auditor cannot (`customer:write` not granted)
- Service-role used by bot worker for SELECT + UPDATE on events and SELECT on `hatchery_brand`

### Billing Gate

`enqueueLineEvent()` must call `requireActiveSubscription()` from `lib/billing/guard.ts`. When `trial_expired` or `canceled`, the action throws `PaywallError` (HTTP 402) and the modal surfaces an inline "Subscribe to continue" prompt. This applies to all enqueue callers (G2, D2, C4, E4, F3, G4).

### RLS Tables

| Table | Operation | Who | Migration |
|-------|-----------|-----|-----------|
| `line_outbound_events` | INSERT | `hatchery_members` with `customer:write` | `006_line_integration.sql` |
| `line_outbound_events` | SELECT + UPDATE status | service-role (bot worker) | `006_line_integration.sql` |
| `hatchery_brand` | SELECT | service-role (bot worker) | `006_line_integration.sql` |
| `notification_settings` | SELECT | service-role (bot worker, quiet-hours check) | `001_init.sql` |
| `line_message_logs` | INSERT (inbound log) | service-role (bot worker) | `006_line_integration.sql` |

### Flex Message Timing Design

From `docs/product-spec/05-line-integration.md` — farmer usage patterns set two design modes:

| Event type | Delivery window | Design principle |
|---|---|---|
| `disease_alert` (high/medium) | Pre-dawn, ~5 AM | Scannable in <5s. Lead with severity icon + batch ID + recommended action in Thai. No decorative whitespace. Action button prominent. |
| `restock_reminder` | Evening | Can include D30 data, cycle day, preferred size, "นัดโทร" button |
| `pcr_certificate` | Evening | Disease rows, lab, date, "ดาวน์โหลดใบรับรอง" button |
| `quote` | Evening | Line items, price, validity date, "ตอบรับ" button |

All Flex Messages include:
- Co-branded header: hatchery logo + display name (TH) + brand color accent
- "เปิดแชท" CTA at footer pointing to LIFF placeholder (Phase H3 swaps target)
- No emojis on professional surfaces per brand guidelines (`docs/product-spec/07-brand-and-voice.md`)

### Testing

```bash
# CRM-side unit tests
pnpm vitest run tests/line/outbound.test.ts

# Typecheck and lint
pnpm typecheck
pnpm lint
```

### References

- [Source: docs/product-spec/03-user-stories.md#G3p]
- [Source: docs/work-breakdown/MATRIX.md#G3p]
- [Source: docs/product-spec/05-line-integration.md — Week 2: push outbound; Week 4: hardening]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
