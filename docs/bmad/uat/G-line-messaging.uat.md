# UAT: Epic G — LINE Messaging

> Run after all stories in this epic reach `review` status. Requires: mock for CRM-side unit tests; live LINE OA + LIFF + bot worker deployed for G1-happy, G3p-delivery, and full G2 live verification.

## Prerequisites

- `pnpm install` completed; `pnpm dev` boots without error
- Mock mode: `USE_MOCK=true` / `NEXT_PUBLIC_USE_MOCK=true` (default for most scenarios)
- Live mode (flagged scenarios): `USE_MOCK=false`; all `*_SUPABASE_*` env vars set; LINE OA provisioned; bot worker (`aquawise-line-bot`) deployed to Cloud Run staging; `LIFF_ID` set in bot worker env
- G3p.i must be marked done before G2 and G4 live verification can pass
- G1.i must be marked done before G2 live verification can pass (requires bound `line_id` on a customer)

---

## G1: Bind a Customer's LINE Account

### Scenario 1: G1-token-expiry — Expired token returns 401

**Given:** A `customer_bind_tokens` row exists with `expires_at` set to `now() - interval '1 second'` (expired by at least 1 second); the token has not been consumed (`consumed_at IS NULL`)

**When:** A request is made to `GET /api/line/bind?token={expired_token}` (simulating the LIFF bind page calling the consume endpoint)

**Then:** The endpoint returns HTTP 401 (or 410 per spec — confirm the actual status code matches the implementation); no `customers.line_id` update occurs; no `line_users` row is upserted

**Verification:**
```bash
pnpm vitest run tests/line/bind.test.ts -t "expired token"
```
Or: Manual — `USE_MOCK=false`.
1. Insert a token row directly in Supabase with `expires_at = now() - interval '1 minute'`.
2. `curl -X GET "http://localhost:3000/api/line/bind?token={token_id}"`.
3. Confirm HTTP 410 response body; confirm `customers.line_id` is still null.

**Pass/Fail:** PASS if the endpoint returns a 4xx error and no customer update occurs. FAIL if HTTP 200 is returned or `customers.line_id` is populated.

---

### Scenario 2: G1-reuse — Reusing a consumed token returns 409

**Given:** A `customer_bind_tokens` row exists with `consumed_at` already set (token has been used once)

**When:** A second request is made to `GET /api/line/bind?token={consumed_token}`

**Then:** The endpoint returns HTTP 409; no additional `customers.line_id` update or `chat_threads` row is created

**Verification:**
```bash
pnpm vitest run tests/line/bind.test.ts -t "reuse consumed token"
```
Or: Manual — `USE_MOCK=false`.
1. Complete a valid bind flow once (or set `consumed_at` directly in Supabase).
2. Re-submit the same token URL.
3. Confirm HTTP 409 and no duplicate DB rows.

**Pass/Fail:** PASS if HTTP 409 is returned on the second call and database state is unchanged. FAIL if HTTP 200 is returned or a second bind is applied.

---

### Scenario 3: G1-happy — Full bind flow sets `customers.line_id`

> Requires: live LINE OA + LIFF page deployed in `aquawise-line-bot` repo. Cannot pass until G1.i is complete.

**Given:** A customer exists with `line_id IS NULL`; `counter_staff` user is authenticated; LIFF bind page is deployed at `liff.line.me/{LIFF_ID}/bind`

**When:**
1. The `counter_staff` user opens the customer card and clicks "เชื่อม LINE"
2. A `customer_bind_tokens` row is created with a 7-day expiry; a LIFF URL is returned and copied to clipboard
3. A real LINE user opens the LIFF URL in the LINE app, completes LINE Login, and the LIFF page POSTs to `GET /api/line/bind?token=...`

**Then:**
- `customers.line_id` is set to the farmer's LINE `userId`
- A `line_users` row is upserted with the farmer's LINE profile
- A `chat_threads` row is created for the customer
- The `customer_bind_tokens` row has `consumed_at` set
- The customer card in the CRM shows the "LINE เชื่อมแล้ว" chip

**Verification:**
Manual — `USE_MOCK=false` + live LINE OA required.
1. Open a customer with `line_id IS NULL` in the CRM.
2. Click "เชื่อม LINE"; copy the LIFF URL from the toast.
3. Open the LIFF URL in a real LINE account.
4. In Supabase dashboard: confirm `customers.line_id` is populated, `customer_bind_tokens.consumed_at` is set, `chat_threads` row exists.
5. Refresh the CRM customer card; confirm "LINE เชื่อมแล้ว" chip is visible.

**Pass/Fail:** PASS if all four DB checks pass and the CRM card shows the connected state. FAIL if `line_id` is null after the flow, or if the token is not marked consumed.

---

## G2: Send a One-Off LINE Message to a Single Customer

### Scenario 1: G2-blocked — Blocked on G3p.i (bot worker not deployed)

> **BLOCKED — Do not run live verification.**
>
> G2's CRM-side server action (`sendLineEvent`) can be written and unit-tested independently, but the `.v` (live verification) pass cannot succeed until `G3p.i` is marked done — the bot worker must be consuming `line_outbound_events` for delivery to occur. Additionally, a customer with a bound `line_id` (G1.i) is required for the bot worker to have a delivery target.
>
> **When unblocked (G3p.i + G1.i both done), this scenario will verify:**
> - Opening the "ส่ง LINE" modal on a customer with a bound `line_id`
> - Selecting `restock_reminder` template and submitting
> - A `line_outbound_events` row appears with `status='pending'`
> - Within 30 seconds the bot worker flips status to `sent`
> - The customer Activity panel in the CRM reflects the `sent` status (via TanStack Query invalidation or Supabase Realtime)
> - The farmer's LINE account receives the Flex Message with correct nursery branding
>
> **Unit tests that can run now:**
> ```bash
> pnpm vitest run tests/line/send.test.ts
> ```

**Pass/Fail:** CRM unit tests PASS if `sendLineEvent` inserts a row and validates the template enum. Live verification is SKIPPED until G3p.i is complete.

---

### Scenario 2: G2-rbac — `auditor` cannot send LINE messages

**Given:** An authenticated `auditor` session

**When:** The `auditor` attempts to invoke the `sendLineEvent` server action (directly or via the UI modal)

**Then:** The server action returns a Forbidden error (HTTP 403); no `line_outbound_events` row is inserted

**Verification:**
```bash
pnpm vitest run tests/line/send.test.ts -t "auditor role is blocked"
```
Or: Manual (mock mode). Set mock session role to `auditor`; open a customer card; confirm "ส่ง LINE" button is absent or disabled.

**Pass/Fail:** PASS if `auditor` is blocked and no event row is created. FAIL if the `auditor` session successfully inserts a row.

---

### Scenario 3: G2-paywall — `trial_expired` state blocks LINE sends

**Given:** Mock billing state is set to `trial_expired` (`MOCK_BILLING_STATE=trial_expired` in `.env.local`)

**When:** An owner submits the "ส่ง LINE" modal

**Then:** The server action throws a `PaywallError` (HTTP 402); the modal shows an inline "Subscribe to continue" prompt; no `line_outbound_events` row is inserted

**Verification:**
```bash
pnpm vitest run tests/line/send.test.ts -t "PaywallError on trial_expired"
```
Or: Manual (mock mode). Set `MOCK_BILLING_STATE=trial_expired`; attempt a LINE send; confirm 402 and inline paywall prompt.

**Pass/Fail:** PASS if the modal shows the paywall prompt and no event row is created. FAIL if the send proceeds or the error is swallowed silently.

---

## G3p: Send-Only Flex Messaging — Worker + Queue

### Scenario 1: G3p-delivery — Event enqueued with `status=pending` transitions to `sent` within 30 seconds

> Requires: live LINE OA + bot worker deployed. Cannot pass until G3p.i is complete.

**Given:** Bot worker is running in Cloud Run staging and subscribed to `line_outbound_events`; a customer with a bound `line_id` exists; `USE_MOCK=false`

**When:** A `line_outbound_events` row is inserted with `status='pending'` (e.g., via a `sendLineEvent` call from the CRM)

**Then:** Within 30 seconds, the row's `status` field transitions from `pending` → `sending` → `sent`

**Verification:**
Manual — `USE_MOCK=false` + live LINE OA + bot worker deployed.
1. Trigger a send from the CRM customer card.
2. In Supabase dashboard, poll `line_outbound_events` every 5 seconds.
3. Confirm `status = 'sent'` within 30 seconds.
4. Confirm the farmer's LINE app received a Flex Message with the correct nursery branding (logo, display name, brand color).

**Pass/Fail:** PASS if `status='sent'` within 30 seconds and the farmer receives the Flex with correct branding. FAIL if the status remains `pending` after 30 seconds, or if the Flex shows wrong nursery branding.

---

### Scenario 2: G3p-status-fail — Bot worker failure flips status to `failed`; retry increments `attempts`

> Requires: live bot worker deployed. Cannot pass until G3p.i is complete.

**Given:** A `line_outbound_events` row is enqueued but the LINE push will fail (e.g., an invalid `line_id` on the customer record, or LINE API temporarily unavailable)

**When:** The bot worker attempts to process the event

**Then:**
- After the first failure: `status` remains `failed` (not `dead`) and `attempts = 1`
- After the second failure: `attempts = 2`
- After the third failure: `status = 'dead'`, `attempts = 3`, `last_error` contains the failure message

**Verification:**
Manual — `USE_MOCK=false` + bot worker deployed.
1. Insert a `line_outbound_events` row with an intentionally invalid `line_id` (e.g., a fake LINE user ID).
2. Poll the row in Supabase dashboard every 2 minutes.
3. Confirm `attempts` increments from 1 to 2 to 3 with appropriate backoff (1m → 5m → 30m).
4. Confirm final `status = 'dead'` and `last_error` is non-null.

**Pass/Fail:** PASS if `status='dead'` and `attempts=3` after three delivery attempts, with `last_error` populated. FAIL if the status skips states unexpectedly or `attempts` does not increment.

---

## G4: Cron-Driven Template Pushes

### Scenario 1: G4-idempotent — Calling the cron endpoint twice on the same day creates no duplicate rows

**Given:** At least one customer exists with `restock_in IN (7, 3, 0)` days for a nursery with `notification_settings.restock = true`; the cron endpoint is deployed at `GET /api/cron/daily` with `CRON_SECRET` configured

**When:** The endpoint is called twice within the same calendar day (UTC) with the correct `Authorization: Bearer {CRON_SECRET}` header

**Then:** The number of `line_outbound_events` rows after the second call equals the number after the first call — no additional rows are inserted

**Verification:**
```bash
pnpm vitest run tests/line/cron.test.ts -t "no duplicate rows on double run"
```
Or: Manual — `USE_MOCK=false`.
1. `curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/daily` → note row count.
2. Call again immediately.
3. Query `SELECT COUNT(*) FROM line_outbound_events WHERE template IN ('restock_reminder','harvest_window')` — confirm count is unchanged.

**Pass/Fail:** PASS if row count does not increase on the second call. FAIL if additional rows are inserted.

---

### Scenario 2: G4-notification-off — Hatchery with `notification_settings.restock = false` receives no enqueued events

**Given:** A nursery has `notification_settings.restock = false`; one or more of its customers have `restock_in IN (7, 3, 0)` days

**When:** The cron endpoint fires (or `evaluateRestockQueue()` is called in tests)

**Then:** No `line_outbound_events` rows are created for any customer belonging to that nursery; the endpoint response `enqueued` count does not include these customers

**Verification:**
```bash
pnpm vitest run tests/line/cron.test.ts -t "restock toggle false"
```
Or: Manual — `USE_MOCK=false`.
1. Set `notification_settings.restock = false` for a test nursery in Supabase dashboard.
2. Trigger the cron endpoint.
3. Query `line_outbound_events` for customers belonging to that nursery — confirm 0 rows.

**Pass/Fail:** PASS if zero events are enqueued for the nursery with `restock=false`. FAIL if any `line_outbound_events` rows are created for that nursery.

---

### Scenario 3: G4-auth — Cron endpoint without `CRON_SECRET` returns 401

**Given:** The cron endpoint is running at `GET /api/cron/daily`

**When:** A request is made without the `Authorization` header (or with an incorrect secret)

**Then:** The endpoint returns HTTP 401; no DB queries are executed

**Verification:**
```bash
pnpm vitest run tests/line/cron.test.ts -t "missing CRON_SECRET returns 401"
```
Or: Manual.
1. `curl http://localhost:3000/api/cron/daily` (no auth header).
2. Confirm HTTP 401 response.

**Pass/Fail:** PASS if HTTP 401 is returned without an auth header. FAIL if the endpoint processes any queries without authentication.

---

## UAT Run — 2026-05-17 (Block G)

> Executed via Playwright MCP (desktop 1440x900) on live `USE_MOCK=false` (supabase-hatchery), fixture `e2e-test@example.com` (owner) + `qa-uat-probe@gmail.com` (counter_staff), nursery `705cc5e2-423d-4a98-95e8-cdc95c7672f6`. Results: `docs/qa/uat-run/results/nursery-G.json`; screenshots: `docs/qa/uat-run/screenshots/nursery-G/`.

- **38 rows: 36 PASS, 2 BLOCKED-EXTERNAL, 0 FAIL.**
- US-G4-mockmode (cron lacked the story-mandated isMockMode guard; FIXED: guard + skip log + test). BLOCKED-EXTERNAL: US-G3p-2 (co-branded Flex render/delivery) and US-G3p-6 (real inbound LINE reply ingestion) — bot-worker cross-service residuals.
- Green gate post-fix: `pnpm typecheck` clean, `pnpm lint` clean, `pnpm test` 283 passed (baseline 277, no regression). Fixes shipped in nursery-crm@main (commit 5975053). Seeded DB rows restored to pre-run baseline.
