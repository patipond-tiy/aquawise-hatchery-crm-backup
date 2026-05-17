# UAT: Epic D — Restock

> Run after all stories in this epic reach `review` status. Requires: live Supabase (`USE_MOCK=false`) for DB-write idempotency checks; mock mode (`USE_MOCK=true`) acceptable for threshold bucketing and UI scenarios where noted.

## Prerequisites

- Migration `010_restock_thresholds.sql` applied; `hatcheries.restock_thresholds` column exists with default `{"now":0,"week":14,"month":45}`
- Migration `006_line_integration.sql` applied; `line_outbound_events` table and its partial unique index on `(customer_id, template, cycle_id)` exist
- Migration `013_quotes.sql` applied; `quotes` and `prices` tables exist
- At least 5 customers in Nursery A have `restockIn` values distributed across urgency groups: at least one with `restockIn <= 0`, at least two with `1 <= restockIn <= 14`, and at least one with `restockIn > 45`
- An `owner` and a `counter_staff` member exist for Nursery A

---

## D1: See Farms by Restock Urgency

### Scenario 1: D1-buckets — Customers in "now" group all have restockIn ≤ 0

**Given:** Nursery A has customers with a mix of `restockIn` values; the default thresholds (`now=0`, `week=14`, `month=45`) are active
**When:** The owner navigates to `/th/restock`
**Then:** Every customer card rendered in the "now" urgency group has `restockIn <= 0`; no card with `restockIn > 0` appears in the "now" group

**Verification:**

```bash
pnpm vitest run tests/restock/threshold.test.ts
```

Manual — `USE_MOCK=true`:

1. Navigate to `/th/restock`.
2. Locate the "now" / "ด่วน" group.
3. For each card in that group, confirm the displayed "เติมสต็อกใน X วัน" value is ≤ 0 (i.e., overdue or today).
4. Confirm no card from the "week" or later group appears in the "now" section.

**Pass/Fail:** PASS if every card in the "now" group has `restockIn <= 0` and the unit test suite (5/5) is green. FAIL if any card with `restockIn > 0` appears in the "now" group, or if any threshold test fails.

---

### Scenario 2: D1-custom-threshold — Changing week threshold to 7 re-buckets correctly

**Given:** Owner is signed in; the current "week" threshold is 14; there is at least one customer with `restockIn = 10` (visible in "week" group under the default threshold)
**When:** The owner opens Settings → Restock Thresholds; changes "สัปดาห์นี้ (วัน ≤)" from 14 to 7; saves; then reloads `/th/restock`
**Then:** The customer with `restockIn = 10` no longer appears in the "week" group (10 > 7); it instead appears in the "month" group (assuming `restockIn = 10 <= 45`)

**Verification:**

```bash
pnpm vitest run tests/restock/threshold.test.ts -t "custom thresholds"
```

Manual — `USE_MOCK=false`:

1. Note which customer has `restockIn = 10`; confirm it appears in the "week" group on `/th/restock`.
2. Navigate to Settings → Restock Thresholds; change the "สัปดาห์นี้" input from 14 to 7; click "บันทึก".
3. Confirm success toast "บันทึกแล้ว".
4. In Supabase → `nurseries`: confirm `restock_thresholds` JSON has `"week": 7`.
5. Navigate to `/th/restock`; confirm the customer with `restockIn = 10` now appears in the "month" group, not the "week" group.

**Pass/Fail:** PASS if the customer re-buckets to "month" after the threshold change and the DB reflects `"week": 7`. FAIL if the customer remains in the "week" group, or if the DB is not updated.

---

## D2: Send a Quote in One Tap

### Scenario 1: D2-idempotent — Sending same quote twice does not duplicate line_outbound_events

**Given:** A `quotes` row and one `line_outbound_events` row with `template = 'quote'` already exist for `(nursery_id, customer_id, items)` with `status = 'sent'`
**When:** The user opens the quote modal for the same customer, enters identical line items, and submits a second time
**Then:** No duplicate `line_outbound_events` row is created; the server action returns the existing `quoteId`; the idempotency toast "ใบเสนอราคานี้ส่งไปแล้ว" appears

**Verification:**

```bash
pnpm vitest run tests/restock/quote.test.ts -t "idempotency"
```

Manual — `USE_MOCK=false`:

1. Open the quote modal for a customer; enter line items (e.g., 300k PL, unit price 1500); click "ส่งใบเสนอราคา".
2. Confirm toast "ส่งใบเสนอราคาแล้ว" appears.
3. In Supabase → `line_outbound_events`: note the row count for this `customer_id` with `template = 'quote'`.
4. Open the same quote modal again for the same customer; enter identical line items; click "ส่งใบเสนอราคา".
5. Confirm the idempotency toast "ใบเสนอราคานี้ส่งไปแล้ว" appears (or the generic sent toast if idempotency is not separately surfaced).
6. Re-query `line_outbound_events`; confirm the count is unchanged.

**Pass/Fail:** PASS if the `line_outbound_events` count remains unchanged after the second submit. FAIL if a duplicate row is created.

---

### Scenario 2: D2-status — Quote status transitions from sent to accepted

**Given:** A `quotes` row with `status = 'sent'` exists
**When:** The status is updated to `accepted` (via LIFF callback or direct SQL for testing purposes) with `decided_at = now()`
**Then:** The Quotes tab on the customer detail page shows the updated chip ("ตอบรับแล้ว" / accepted); `decided_at` is non-null in the DB

**Verification:**

```bash
pnpm vitest run tests/restock/quote.test.ts -t "status transition accepted"
```

Manual — `USE_MOCK=false`:

1. In Supabase SQL editor, update a `quotes` row:
   ```sql
   UPDATE quotes SET status = 'accepted', decided_at = now() WHERE id = '{quote_id}';
   ```
2. Navigate to `/th/customers/{customer_id}` → Quotes tab.
3. Confirm the quote row shows the "ตอบรับแล้ว" chip (green).
4. Confirm `decided_at` is visible or at minimum non-null in the DB.

**Pass/Fail:** PASS if the Quotes tab shows the accepted chip and `decided_at IS NOT NULL` in the DB. FAIL if the chip still shows "รออนุมัติ" (sent) after the DB update, or if `decided_at` is null after the update.

---

### Scenario 3: D2-validation — Empty items array is rejected

**Given:** The quote modal is open; the user removes all line items leaving the items list empty
**When:** The user clicks "ส่งใบเสนอราคา"
**Then:** The server action returns a validation error ("กรุณาเพิ่มรายการสินค้าอย่างน้อยหนึ่งรายการ"); no `quotes` or `line_outbound_events` row is inserted

**Verification:**

```bash
pnpm vitest run tests/restock/quote.test.ts -t "empty items validation"
```

Manual — `USE_MOCK=false`:

1. Open the quote modal; remove all pre-filled line items.
2. Click "ส่งใบเสนอราคา".
3. Confirm an inline error "กรุณาเพิ่มรายการสินค้าอย่างน้อยหนึ่งรายการ" appears in the modal.
4. Confirm the modal does not close.
5. In Supabase → `quotes`: confirm no new row was inserted.

**Pass/Fail:** PASS if the validation error appears and no DB rows are inserted. FAIL if the action proceeds and inserts a `quotes` row with an empty items array.

---

## D3: Broadcast to a Restock Cohort

### Scenario 1: D3-count — Broadcast toast shows correct farm count

**Given:** The "week" urgency group contains exactly N customers (N >= 1) on the restock page
**When:** The owner clicks "ส่งข้อความหาทุกคน" for the "week" group; confirms the broadcast with template `restock_reminder`
**Then:** The server action inserts N `line_outbound_events` rows; the toast reads "ส่งถึง N ฟาร์ม" where N matches the actual recipient count

**Verification:**

```bash
pnpm vitest run tests/restock/broadcast.test.ts -t "inserts correct count"
```

Manual — `USE_MOCK=false`:

1. Navigate to `/th/restock`; note the count of farms shown in the "week" group header — call it N.
2. Click "ส่งข้อความหาทุกคน" for the "week" group.
3. In the confirmation dialog, confirm the displayed farm count is N; select `restock_reminder` template; click "ส่งเลย".
4. Confirm the toast "ส่งถึง N ฟาร์ม" matches N.
5. In Supabase → `line_outbound_events`: query:
   ```sql
   SELECT COUNT(*) FROM line_outbound_events
   WHERE template = 'restock_reminder' AND status = 'pending'
   AND created_at > now() - interval '5 minutes';
   ```
6. Confirm the count equals N.

**Pass/Fail:** PASS if the toast count equals N and the DB row count equals N. FAIL if the toast count differs from the inserted row count, or if the row count differs from the UI-displayed farm count.

---

### Scenario 2: D3-idempotent — Running broadcast twice does not create duplicate line_outbound_events rows

**Given:** A broadcast for the "week" group with template `restock_reminder` has already been run (D3-count scenario completed)
**When:** The owner immediately runs the same broadcast again (same filter, same template)
**Then:** No new `line_outbound_events` rows are created; the toast shows "ส่งถึง 0 ฟาร์ม" or "ไม่มีฟาร์มที่ต้องส่งข้อความ"; the DB row count for these recipients is unchanged

**Verification:**

```bash
pnpm vitest run tests/restock/broadcast.test.ts -t "idempotency"
```

Manual — `USE_MOCK=false`:

1. Immediately after D3-count, note the `line_outbound_events` count for `template = 'restock_reminder'` within the last 5 minutes — call it N.
2. Click "ส่งข้อความหาทุกคน" for the same "week" group again; select `restock_reminder`; click "ส่งเลย".
3. Confirm the toast shows "ส่งถึง 0 ฟาร์ม" or "ไม่มีฟาร์มที่ต้องส่งข้อความ" (not N again).
4. Re-query the `line_outbound_events` count; confirm it is still N (unchanged).

**Pass/Fail:** PASS if no new rows are inserted and the toast count is 0. FAIL if duplicate `line_outbound_events` rows are created, or if the count increases beyond N.

---

### Scenario 3: D3-empty-filter — Broadcast to a group with zero farms returns count 0

**Given:** The "now" urgency group has zero customers at the time of the broadcast
**When:** The owner clicks "ส่งข้อความหาทุกคน" for the "now" group and confirms
**Then:** The server action returns `{ count: 0 }`; the toast "ไม่มีฟาร์มที่ต้องส่งข้อความ" appears; no `line_outbound_events` rows are inserted

**Verification:**

```bash
pnpm vitest run tests/restock/broadcast.test.ts -t "zero customers returns count 0"
```

Manual — `USE_MOCK=false` (requires the "now" group to genuinely be empty; adjust live data or use mock mode with a seed that has an empty "now" group):

1. Confirm the "now" group shows 0 farms on `/th/restock`.
2. Click "ส่งข้อความหาทุกคน" for the "now" group; confirm; select any template.
3. Confirm the toast "ไม่มีฟาร์มที่ต้องส่งข้อความ" appears.
4. In Supabase → `line_outbound_events`: confirm no new rows were inserted.

**Pass/Fail:** PASS if the toast indicates zero farms and no DB rows are created. FAIL if any `line_outbound_events` row is inserted when the resolved recipient list is empty.

---

## UAT Run — 2026-05-17 (Block D)

> Executed via Playwright MCP (desktop 1440x900) on live `USE_MOCK=false` (supabase-hatchery), fixture `e2e-test@example.com` (owner) + `qa-uat-probe@gmail.com` (counter_staff), nursery `705cc5e2-423d-4a98-95e8-cdc95c7672f6`. Results: `docs/qa/uat-run/results/nursery-D.json`; screenshots: `docs/qa/uat-run/screenshots/nursery-D/`.

- **27 rows: 26 PASS, 1 BLOCKED-EXTERNAL, 0 FAIL.**
- US-D2-5 (quote status machine — unimplemented; FIXED: updateQuoteStatus action + Quotes-tab controls + test) and NEG-D3-role (broadcast button rendered for non-owner; FIXED: can(role,broadcast:write) UI gate + test). BLOCKED-EXTERNAL: US-D2-4 (quote Flex render/OA deep-link is the bot-worker cross-service residual).
- Green gate post-fix: `pnpm typecheck` clean, `pnpm lint` clean, `pnpm test` 283 passed (baseline 277, no regression). Fixes shipped in nursery-crm@main (commit 5975053). Seeded DB rows restored to pre-run baseline.
