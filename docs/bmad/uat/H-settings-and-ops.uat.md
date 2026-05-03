# UAT: Epic H + X1 — Settings and Operations

> Run after all stories in H1–H4 and X1 reach `review` status. Requires: mock for most scenarios; live Supabase (`USE_MOCK=false`) for H2-row-count, H3-active-pass, H3-webhook-idempotent, H4-quiet, H4-bypass; live Stripe test mode for H3 billing scenarios.

## Prerequisites

- `pnpm install` completed; `pnpm dev` boots without error
- Mock mode: `USE_MOCK=true` / `NEXT_PUBLIC_USE_MOCK=true` (default unless flagged)
- Live mode (flagged scenarios): all three `*_SUPABASE_*` env vars set; `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_PRICE_ID` configured for H3 Stripe tests
- H4 quiet-hours scenarios require the bot worker (`aquawise-line-bot`) deployed; flagged accordingly
- Role under test is noted per scenario; default is `owner`

---

## H1: Edit Notification Preferences

### Scenario 1: H1-toggle-off — Disabling the disease toggle prevents disease alert events from being enqueued

**Given:** `notification_settings.disease = true` (default); mock or live Supabase is connected; the cron or delivery path reads `notification_settings` before inserting `line_outbound_events`

**When:** An owner sets the `disease` toggle to `false` in Settings → Notifications, then a disease alert delivery is triggered (either via test or by the cron/bot worker checking the flag)

**Then:** No `line_outbound_events` row with `template='disease_alert'` is created for that hatchery during this delivery cycle

**Verification:**
```bash
pnpm vitest run tests/settings/notif.test.ts -t "disease toggle off"
```
Or: Manual — `USE_MOCK=false`.
1. Navigate to `/th/settings` → Notifications; disable the `disease` toggle.
2. Insert an open alert row directly in Supabase.
3. Trigger the delivery path (or wait for cron).
4. Query `line_outbound_events` — confirm no `disease_alert` rows were created for this hatchery.

**Pass/Fail:** PASS if zero `disease_alert` events are enqueued for the hatchery after disabling the toggle. FAIL if a `disease_alert` row is inserted despite the toggle being `false`.

---

### Scenario 2: H1-owner-only — `counter_staff` cannot update notification settings

**Given:** An authenticated `counter_staff` user navigating to `/th/settings` → Notifications

**When:** The `counter_staff` user attempts to toggle any notification setting (e.g., clicking the `restock` toggle)

**Then:** Either (a) the toggle is rendered as read-only/disabled, or (b) the server action returns a Forbidden error; `notification_settings` is not mutated

**Verification:**
```bash
pnpm vitest run tests/settings/notif.test.ts -t "counter_staff write rejected"
```
Or: Manual (mock mode). Set mock session role to `counter_staff`; navigate to Settings → Notifications; attempt to click any toggle; confirm it does not respond or shows an error.

**Pass/Fail:** PASS if `counter_staff` cannot mutate `notification_settings`. FAIL if the toggle responds to clicks and the server action persists the change.

---

## H2: Export Customer / PCR Data

### Scenario 1: H2-csv-header — Exported CSV first row contains expected column headers

**Given:** An authenticated `auditor` or `owner` user; at least one customer record exists for the hatchery

**When:** The user clicks "ดาวน์โหลด CSV" (customers) in Settings → Data

**Then:** The downloaded file is a valid UTF-8 CSV; the first row contains the exact headers: `farm_name`, `owner`, `phone`, `zone`, `status`, `created_at` (or the equivalent Thai/English column names as defined in the implementation)

**Verification:**
```bash
pnpm vitest run tests/settings/export.test.ts -t "CSV header row"
```
Or: Manual (mock mode). Click the CSV download button; open the file in a text editor or spreadsheet; confirm the first row matches the expected headers.

**Pass/Fail:** PASS if the first CSV row matches the defined column headers exactly. FAIL if headers are missing, in the wrong order, or if the file is not valid UTF-8 CSV.

---

### Scenario 2: H2-row-count — CSV row count matches the RLS-scoped customer count with no cross-tenant leakage

**Given:** A live Supabase project with two hatchery tenants — hatchery A has 5 customers, hatchery B has 3 customers; an `owner` of hatchery A is authenticated

**When:** The hatchery A owner downloads the customer CSV

**Then:** The CSV contains exactly 5 data rows (excluding the header); no hatchery B customer rows are present

**Verification:**
Manual — `USE_MOCK=false`.
1. Confirm customer counts in Supabase dashboard: `SELECT hatchery_id, COUNT(*) FROM customers GROUP BY hatchery_id`.
2. Download CSV as hatchery A owner.
3. Count data rows in the CSV (total lines minus 1 for header).
4. Confirm count = 5 and no hatchery B customer data is present (check farm names).

**Pass/Fail:** PASS if CSV row count matches hatchery A's customer count and contains no hatchery B data. FAIL if row count is wrong or any cross-tenant data appears.

---

### Scenario 3: H2-rbac — Only `auditor` and `owner` can trigger an export; `counter_staff` is blocked

**Given:** Three authenticated sessions: `owner`, `auditor`, and `counter_staff`

**When:** Each session attempts to call `exportCustomersCsv` (directly or via the Settings → Data UI)

**Then:**
- `owner` export succeeds; file downloads
- `auditor` export succeeds; file downloads
- `counter_staff` attempt returns HTTP 403; no file is returned and no `data_exports` row is created

**Verification:**
```bash
pnpm vitest run tests/settings/export.test.ts -t "counter_staff blocked"
```
Or: Manual (mock mode). Switch session role to `counter_staff`; navigate to Settings → Data; confirm the export button is disabled or clicking it returns an error toast.

**Pass/Fail:** PASS if `counter_staff` is blocked and `owner`/`auditor` can export. FAIL if `counter_staff` successfully downloads a CSV.

---

## H3: Subscribe / Manage Billing

### Scenario 1: H3-trial-30 — Fresh workspace has `trial_ends_at` set to 30 days from creation

**Given:** A newly created hatchery workspace (simulated by setting `MOCK_BILLING_STATE=trialing-25` in mock mode, or by reading a fresh `hatcheries` row in live mode)

**When:** The owner navigates to Settings → Billing

**Then:** The billing UI shows a trial countdown consistent with a 30-day trial period (not 14 days); the `trial_ends_at` column in `hatcheries` equals `created_at + interval '30 days'`

**Verification:**
```bash
# Guard test (existing)
pnpm vitest run tests/billing/guard.test.ts
```
Or: Manual — `USE_MOCK=false`.
1. Create a new hatchery in Supabase.
2. Query: `SELECT created_at, trial_ends_at, (trial_ends_at - created_at) AS trial_length FROM hatcheries WHERE id = '{new_id}'`.
3. Confirm `trial_length = '30 days'`.

**Pass/Fail:** PASS if `trial_ends_at - created_at = 30 days`. FAIL if trial length is 14 days or any other value.

---

### Scenario 2: H3-expired-redirect — Tenant with `trial_expired` status is redirected to `/billing/trial-expired`

**Given:** Mock mode with `MOCK_BILLING_STATE=trial_expired` in `.env.local`

**When:** An authenticated owner navigates to any dashboard page (e.g., `/th/customers`, `/th/batches`)

**Then:** The `BillingGate` server component intercepts the request and redirects to `/th/billing/trial-expired`; the trial-expired page renders with calm Thai/English copy and a "สมัครแผน Pro เพื่อใช้งานต่อ" CTA (no urgency words, no exclamation marks, no emojis)

**Verification:**
Manual (mock mode).
1. Set `MOCK_BILLING_STATE=trial_expired` in `.env.local`; restart `pnpm dev`.
2. Navigate to `/th/customers`.
3. Confirm redirect to `/th/billing/trial-expired`.
4. Inspect copy for voice compliance: no "!", no "now!", no "upgrade", no urgency language.

**Pass/Fail:** PASS if redirect occurs and the expired page copy passes the voice audit. FAIL if the dashboard page loads normally, or if the expired page contains urgency/exclamation copy.

---

### Scenario 3: H3-active-pass — Tenant with `subscription_status=active` loads the dashboard normally

**Given:** Mock mode with `MOCK_BILLING_STATE=active` in `.env.local`

**When:** An authenticated owner navigates to `/th/customers`

**Then:** The customers page loads without any redirect or billing banner interruption

**Verification:**
Manual (mock mode).
1. Set `MOCK_BILLING_STATE=active` in `.env.local`; restart `pnpm dev`.
2. Navigate to `/th/customers`.
3. Confirm the customers list renders normally with no billing redirect.

**Pass/Fail:** PASS if the customers page loads normally. FAIL if a billing redirect or paywall banner appears for an `active` subscription.

---

### Scenario 4: H3-webhook-idempotent — Duplicate Stripe webhook events produce only one `subscription_events` row

**Given:** A Stripe `checkout.session.completed` event with a known `event.id` (e.g., `evt_test_abc123`); live Stripe webhook endpoint at `app/api/webhooks/stripe/route.ts` with valid `STRIPE_WEBHOOK_SECRET`

**When:** The same event payload is delivered to the webhook endpoint twice (simulating Stripe retry behavior)

**Then:** Exactly one row exists in `subscription_events` with `stripe_event_id = 'evt_test_abc123'`; `hatcheries.subscription_status` reflects the event outcome once (no double-apply)

**Verification:**
```bash
pnpm vitest run tests/billing/webhook.test.ts -t "idempotent event"
```
Or: Manual — `USE_MOCK=false` + Stripe CLI.
1. `stripe trigger checkout.session.completed` (captures the event ID from CLI output).
2. Replay the same event using `stripe events resend {event_id}`.
3. Query `SELECT COUNT(*) FROM subscription_events WHERE stripe_event_id = '{event_id}'` — confirm count = 1.

**Pass/Fail:** PASS if `subscription_events` has exactly one row for the event ID after two deliveries. FAIL if two rows are created or if `subscription_status` is in an inconsistent state.

---

## H4: Quiet Hours Respected at Delivery

### Scenario 1: H4-quiet — Event enqueued at 22:00 ICT stays `pending` until 07:01 ICT

> Requires: bot worker deployed. Cannot fully pass until G3p.i is complete. CRM-side logic (migration + settings UI) can be verified independently.

**Given:** `notification_settings.quiet_hours_start = '21:00'`, `quiet_hours_end = '07:00'` for a hatchery; a `restock_reminder` `line_outbound_events` row is inserted at 22:00 ICT with `is_manual = false`

**When:** The bot worker checks this event at 22:30 ICT

**Then:**
- The event `status` remains `pending`
- `scheduled_for` is updated to the next 07:00 ICT (next day, in UTC: `2024-{next_day}T00:00:00Z`)
- The farmer's LINE account does NOT receive a message

**Verification:**
```bash
pnpm vitest run tests/settings/quiet-hours.test.ts -t "event deferred at 22:00"
```
Or: Manual — `USE_MOCK=false` + bot worker deployed.
1. Set hatchery quiet hours to 21:00–07:00 in Settings → Notifications.
2. Enqueue a `restock_reminder` event at 22:00 (server time in ICT).
3. Poll `line_outbound_events` — confirm `status = 'pending'` and `scheduled_for` is set to the next 07:00 ICT.
4. Confirm no LINE message is received before 07:00.

**Pass/Fail:** PASS if event remains `pending` and `scheduled_for` is set to next 07:01 ICT window. FAIL if the event is delivered before quiet hours end, or if `scheduled_for` is null.

---

### Scenario 2: H4-bypass — High-severity disease alert enqueued at 22:00 ICT delivers immediately with bypass logged

> Requires: bot worker deployed. Cannot fully pass until G3p.i is complete.

**Given:** `notification_settings.quiet_hours_start = '21:00'`, `quiet_hours_end = '07:00'` for a hatchery; a `disease_alert` `line_outbound_events` row is inserted at 22:00 ICT with `payload->>'severity' = 'high'` and `is_manual = false`

**When:** The bot worker checks this event at 22:00 ICT

**Then:**
- The event is delivered immediately; `status` transitions to `sent`
- An `audit_log` row is inserted with `action = 'quiet_hours_bypassed'`, `entity_type = 'line_outbound_events'`, and the event's `id`
- The farmer's LINE account receives the disease alert Flex Message

**Verification:**
```bash
pnpm vitest run tests/settings/quiet-hours.test.ts -t "high-severity bypasses quiet hours"
```
Or: Manual — `USE_MOCK=false` + bot worker deployed.
1. Enqueue a `disease_alert` event with `payload = {severity: 'high', ...}` at 22:00 ICT.
2. Confirm bot delivers within 30 seconds.
3. Query `audit_log` where `action = 'quiet_hours_bypassed'` and `entity_id = {event_id}` — confirm row exists.

**Pass/Fail:** PASS if event is delivered immediately and an `audit_log` bypass row is created. FAIL if the event is deferred like a normal quiet-hours event, or if no `audit_log` row is created.

---

## X1: Dead-Letter Retry / Escalate UI

### Scenario 1: X1-retry — Retry action flips `status` to `pending`, increments `retry_count`, and creates `audit_log` row

**Given:** A `line_outbound_events` row exists with `status = 'dead'` and `retry_count = 3`; the authenticated user is an `owner`; the user is on `/th/settings/messaging-failures`

**When:** The owner clicks "ลองใหม่" (Retry) on that event row

**Then:**
- The event `status` is updated to `pending`
- `retry_count` is incremented to `4`
- An `audit_log` row is inserted with `action = 'dead_letter_retry'` and `entity_id` matching the event's `id`
- The bot worker can now attempt re-delivery (status is `pending` again)

**Verification:**
```bash
pnpm vitest run tests/ops/dead-letter.test.ts -t "retryDeadEvent flips status"
pnpm vitest run tests/ops/dead-letter.test.ts -t "retryDeadEvent inserts audit_log"
```
Or: Manual — `USE_MOCK=false`.
1. Insert a `dead` event row directly in Supabase.
2. Navigate to `/th/settings/messaging-failures`; confirm the row appears.
3. Click "ลองใหม่".
4. Query `line_outbound_events` — confirm `status = 'pending'` and `retry_count` incremented.
5. Query `audit_log` — confirm `action = 'dead_letter_retry'` row exists.

**Pass/Fail:** PASS if `status = 'pending'`, `retry_count` incremented, and `audit_log` row created. FAIL if any of the three conditions is not met.

---

### Scenario 2: X1-bulk — Bulk-selecting 3 dead events and retrying flips all 3 to `pending`

**Given:** Three `line_outbound_events` rows with `status = 'dead'` exist for the hatchery; the owner is on `/th/settings/messaging-failures`

**When:** The owner checks all three rows and clicks "ลองใหม่ที่เลือก (3)"

**Then:**
- All three event rows have `status = 'pending'`
- Three separate `audit_log` rows are created (one per event, not one consolidated row)
- The UI's failure list no longer shows the three retried events (or they are visually updated)

**Verification:**
```bash
pnpm vitest run tests/ops/dead-letter.test.ts -t "bulk retry produces 3 audit_log rows"
```
Or: Manual — `USE_MOCK=false`.
1. Insert 3 `dead` event rows in Supabase.
2. Navigate to `/th/settings/messaging-failures`; select all three checkboxes.
3. Click "ลองใหม่ที่เลือก (3)"; confirm confirmation dialog appears; confirm.
4. Query `SELECT COUNT(*) FROM line_outbound_events WHERE status = 'pending'` — confirm 3.
5. Query `SELECT COUNT(*) FROM audit_log WHERE action = 'dead_letter_retry'` — confirm 3.

**Pass/Fail:** PASS if all 3 events flip to `pending` and exactly 3 `audit_log` rows are created. FAIL if only one consolidated audit row is created, or if any event remains `dead`.

---

### Scenario 3: X1-resolved — "Mark resolved" removes the event from the failures list without resending

**Given:** A `line_outbound_events` row with `status = 'dead'` exists; the owner is on `/th/settings/messaging-failures`

**When:** The owner clicks "ปิดเคส" (Mark resolved) on that event row

**Then:**
- The event's `status` is updated to `resolved` (or equivalent closed state per the implementation)
- An `audit_log` row is inserted with `action = 'dead_letter_resolved'`
- The event no longer appears in the messaging failures list (filtered out by the `WHERE status = 'dead'` query)
- No `line_outbound_events` row is re-enqueued or delivered to LINE

**Verification:**
```bash
pnpm vitest run tests/ops/dead-letter.test.ts -t "resolveDeadEvent removes from failures list"
```
Or: Manual — `USE_MOCK=false`.
1. Insert a `dead` event row; confirm it appears on the failures page.
2. Click "ปิดเคส".
3. Confirm the row disappears from the UI.
4. Query `line_outbound_events` — confirm `status = 'resolved'` (not `pending`).
5. Query `audit_log` — confirm `action = 'dead_letter_resolved'` row exists.

**Pass/Fail:** PASS if `status = 'resolved'`, the audit row is created, and the event does not reappear in the failures list. FAIL if the event is re-enqueued to `pending`, or if no audit row is created.

---

### Scenario 4: X1-cross-tenant — Owner of hatchery B cannot retry an event belonging to hatchery A

**Given:** A `line_outbound_events` row with `status = 'dead'` belongs to hatchery A; an owner of hatchery B is authenticated

**When:** The hatchery B owner calls `retryDeadEvent(eventId)` where `eventId` belongs to hatchery A

**Then:** The server action returns a Forbidden or Not Found error; the hatchery A event `status` is not changed

**Verification:**
```bash
pnpm vitest run tests/ops/dead-letter.test.ts -t "cross-tenant isolation"
```
Or: Manual — `USE_MOCK=false`.
1. Insert a `dead` event for hatchery A.
2. Authenticate as hatchery B owner.
3. Attempt to call the retry action with hatchery A's event ID.
4. Confirm the event `status` in Supabase remains `dead`.

**Pass/Fail:** PASS if the action is rejected and the hatchery A event is unchanged. FAIL if hatchery B owner can modify a hatchery A event.

---
