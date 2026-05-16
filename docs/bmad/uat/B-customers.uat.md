# UAT: Epic B — Customers

> Run after all stories in this epic reach `review` status. Requires: live Supabase (`USE_MOCK=false`) for RLS and cross-tenant scenarios; mock mode (`USE_MOCK=true`) is acceptable for unit-level checks where noted.

## Prerequisites

- Migrations `001`–`014` applied; `customer_cycles`, `batch_buyers`, and `customer_callbacks` tables exist
- Two separate nursery workspaces provisioned: **Nursery A** (owner email A) and **Nursery B** (owner email B), each with at least 3 customer rows in `customers`
- A `counter_staff` member exists in Nursery A (created via A2-happy path)
- A `lab_tech` member exists in Nursery A
- At least one customer in Nursery A has at least two `customer_cycles` rows and at least two `batch_buyers` rows
- At least one customer in Nursery A has zero `customer_cycles` rows
- At least one customer in Nursery A has `restockIn <= 14`

---

## B1: See All Customers at a Glance

### Scenario 1: B1-rls — Cross-tenant isolation

**Given:** Nursery B owner is signed in; Nursery A has customers in its `customers` table
**When:** Nursery B owner visits `/th/customers`
**Then:** Zero rows from Nursery A appear in the list; only Nursery B's own customers are visible

**Verification:**

```bash
pnpm vitest run tests/api/list-customers.test.ts -t "cross-tenant RLS"
```

Manual — `USE_MOCK=false`:

1. Sign in as Nursery B owner.
2. Navigate to `/th/customers`.
3. Confirm the list shows only customers belonging to Nursery B.
4. In the Supabase SQL editor (authenticated as Nursery B's user token), run:
   ```sql
   SELECT COUNT(*) FROM customers WHERE nursery_id = '{hatchery_a_id}';
   ```
5. Confirm the result is `0`.

**Pass/Fail:** PASS if the customer list shows zero Nursery A rows and the SQL query returns `0`. FAIL if any Nursery A customer row is visible in the UI or returned by the query.

---

### Scenario 2: B1-search — Case-insensitive search returns only matching farms

**Given:** Nursery A owner is signed in; at least two customers exist, one with `farm` containing "นาย" and one without
**When:** The user types "นาย" in the search field
**Then:** Only customers whose `farm`, `farmEn`, or `name` field contains "นาย" (case-insensitive) are shown in the list

**Verification:**

Manual — `USE_MOCK=true` (search is client-side):

1. Set `USE_MOCK=true`; navigate to `/th/customers`.
2. Type "นาย" in the search input.
3. Confirm the list filters to only farms matching the term.
4. Type "NAY" (uppercase) in the search input.
5. Confirm the same farms appear (case-insensitive match).
6. Clear the search; confirm all customers reappear.

**Pass/Fail:** PASS if filtered results contain only farms matching the term and clearing the search restores the full list. FAIL if non-matching farms remain visible, or if the search is case-sensitive.

---

### Scenario 3: B1-restock-tab — Restock tab shows only customers where restockIn ≤ 14

**Given:** Nursery A has at least one customer with `restockIn <= 14` and at least one with `restockIn > 14`
**When:** The user clicks the "Restock" tab on the customers page
**Then:** Only customers where `restockIn <= 14` are shown; customers with `restockIn > 14` or `restockIn = null` are absent

**Verification:**

Manual — `USE_MOCK=true`:

1. Navigate to `/th/customers`.
2. Click the "Restock" tab.
3. For each visible card, confirm `restockIn` is ≤ 14 (displayed as "เติมสต็อกใน X วัน" or equivalent).
4. Confirm no card shows `restockIn > 14`.
5. Switch to the "All" tab; confirm the full list returns.

**Pass/Fail:** PASS if every card on the Restock tab has `restockIn <= 14` and the full list is restored on switching to All. FAIL if any card with `restockIn > 14` appears on the Restock tab.

---

### Scenario 4: B1-no-cycle — Customer without customer_cycles row appears in list

**Given:** A customer exists in Nursery A with no corresponding row in `customer_cycles`
**When:** The user visits the "All" tab on `/th/customers`
**Then:** The customer appears in the list; cycle-derived fields (last D30, restock-in) show a null/empty state, not an error

**Verification:**

```bash
pnpm vitest run tests/api/list-customers.test.ts -t "no cycle row"
```

Manual — `USE_MOCK=false`:

1. In Supabase, confirm a customer row exists where no `customer_cycles.customer_id` match is present.
2. Navigate to `/th/customers` → "All" tab.
3. Confirm the customer card is visible (not silently absent).
4. Confirm cycle-derived fields display an empty/null state (em-dash, zero, or blank) rather than a JavaScript error or blank page.

**Pass/Fail:** PASS if the customer is visible with graceful null rendering for cycle fields. FAIL if the customer is absent from the list, or if the page throws an error when a null cycle field is encountered.

---

## B2: Add a New Customer

### Scenario 1: B2-required — Submit without farm name is blocked; no DB insert

**Given:** Owner or counter_staff is signed in; the Add Customer modal is open
**When:** The user clears the "Farm Name" field (leaving it empty) and clicks "เพิ่มลูกค้า"
**Then:** The UI shows a validation error for the required field; the `customers` table row count does not increase

**Verification:**

```bash
pnpm vitest run tests/api/add-customer.test.ts -t "required field rejected"
```

Manual — `USE_MOCK=false`:

1. Note `SELECT COUNT(*) FROM customers WHERE nursery_id = '{nursery_id}'`.
2. Open the Add Customer modal; leave "Farm Name" empty; fill in "Owner" and "Province"; click "เพิ่มลูกค้า".
3. Confirm a validation error appears on the farm name field.
4. Re-query the count; confirm it is unchanged.

**Pass/Fail:** PASS if a validation error is displayed and the row count is unchanged. FAIL if a `customers` row is inserted when the farm name is empty.

---

### Scenario 2: B2-package — package_interest persists correctly

**Given:** Owner or counter_staff is signed in; the Add Customer modal is open
**When:** The user fills all required fields and selects "500k PL" as the interested package; clicks "เพิ่มลูกค้า"
**Then:** The new `customers` row in the database has `package_interest = '500k'` (or the exact value the application maps to 500k PL); a success toast appears; the customer appears at the top of the list

**Verification:**

```bash
pnpm vitest run tests/api/add-customer.test.ts -t "plan persisted"
```

Manual — `USE_MOCK=false`:

1. Open the Add Customer modal.
2. Enter a unique farm name (e.g., "ฟาร์มทดสอบ UAT"), an owner name, select a province, and select "500k PL" in the package dropdown.
3. Click "เพิ่มลูกค้า".
4. Confirm toast "เพิ่มลูกค้า "ฟาร์มทดสอบ UAT" แล้ว" appears.
5. Confirm the new card appears at the top of the customer list.
6. In Supabase → `customers`: locate the new row; confirm `package_interest` has the value corresponding to "500k PL" and `status = 'active'`.

**Pass/Fail:** PASS if the DB row has the correct `package_interest` value and `status = 'active'`. FAIL if `package_interest` is null when a selection was made, or if the row is absent.

---

## B3: View Customer Detail and History

### Scenario 1: B3-sparkline — Customer with 0 cycles shows empty sparkline, not error

**Given:** A customer with zero `customer_cycles` rows exists in Nursery A
**When:** The user navigates to that customer's detail page at `/th/customers/{customer_id}`
**Then:** The page loads without a JavaScript error; the D30 trend area shows an explicit empty state (e.g., "ยังไม่มีข้อมูลรอบ"); no chart component crashes

**Verification:**

```bash
pnpm vitest run tests/customers/detail.test.ts -t "empty sparkline"
```

Manual — `USE_MOCK=false`:

1. Navigate to `/th/customers/{customer_id}` for the customer with zero cycle rows.
2. Open the browser DevTools console; confirm no JavaScript errors are thrown.
3. Confirm the sparkline area renders an empty state message rather than a broken chart or blank space with no indicator.

**Pass/Fail:** PASS if the page loads cleanly with an explicit empty state visible. FAIL if a JavaScript error is thrown, the page crashes, or the empty state text is absent.

---

### Scenario 2: B3-history — Batch history rows match batch_buyers for that customer

**Given:** A customer in Nursery A has at least two rows in `batch_buyers` joined to `batches`
**When:** The user opens that customer's detail page
**Then:** The batch history table shows exactly the rows present in `batch_buyers` for that `customer_id`; row count and D30 values match the DB

**Verification:**

```bash
pnpm vitest run tests/customers/detail.test.ts -t "batch history join"
```

Manual — `USE_MOCK=false`:

1. In Supabase, query:
   ```sql
   SELECT bd.id, b.id AS batch_id, cc.d30
   FROM batch_buyers bd
   JOIN batches b ON b.id = bd.batch_id
   LEFT JOIN customer_cycles cc ON cc.batch_id = b.id AND cc.customer_id = bd.customer_id
   WHERE bd.customer_id = '{customer_id}';
   ```
   Note the row count and D30 values.
2. Navigate to `/th/customers/{customer_id}`.
3. Confirm the batch history table row count matches the query result.
4. Confirm each D30 value displayed matches the corresponding query row (or shows "—" where `d30 IS NULL`).

**Pass/Fail:** PASS if UI row count and D30 values exactly match the DB query result. FAIL if any distribution row is missing, extra rows appear, or D30 values differ.

---

## B4: Schedule a Callback

### Scenario 1: B4-past-date — Callback for yesterday is rejected

**Given:** Owner or counter_staff is signed in; the Schedule a Callback modal is open on a customer detail page
**When:** The user enters yesterday's date as the callback date and clicks "บันทึกนัด"
**Then:** An inline validation error appears ("กรุณาเลือกวันที่ในอนาคต"); no `customer_callbacks` row is inserted

**Verification:**

```bash
pnpm vitest run tests/customers/callback.test.ts -t "past date rejected"
```

Manual — `USE_MOCK=false`:

1. Navigate to a customer detail page; click "นัดโทร".
2. In the date field, enter yesterday's date; enter a valid time; select a channel.
3. Click "บันทึกนัด".
4. Confirm the validation error "กรุณาเลือกวันที่ในอนาคต" (or equivalent) appears in the modal.
5. Confirm the modal remains open (not closed on error).
6. In Supabase → `customer_callbacks`: confirm no new row was inserted.

**Pass/Fail:** PASS if the error appears, the modal stays open, and no DB row is inserted. FAIL if the callback is saved with a past date.

---

### Scenario 2: B4-upcoming — Callback for tomorrow appears in Upcoming section

**Given:** Owner or counter_staff is signed in; no upcoming callbacks exist for the selected customer
**When:** The user schedules a callback for tomorrow at 10:00 via the modal and submits
**Then:** The success toast appears; the callback appears in the "Upcoming" section on the customer detail page sorted by `scheduled_for ASC`; the `customer_callbacks` DB row has `completed_at IS NULL`

**Verification:**

```bash
pnpm vitest run tests/customers/callback.test.ts -t "counter_staff role can insert"
```

Manual — `USE_MOCK=false`:

1. Navigate to a customer detail page; click "นัดโทร".
2. Enter tomorrow's date and time 10:00; select "โทรศัพท์"; optionally add a note.
3. Click "บันทึกนัด".
4. Confirm the success toast appears.
5. Confirm the callback row appears in the "Upcoming" section on the page with the correct date and channel.
6. In Supabase → `customer_callbacks`: confirm the new row has `scheduled_for` matching tomorrow 10:00 and `completed_at IS NULL`.

**Pass/Fail:** PASS if the callback appears in the Upcoming section and the DB row has the correct values with `completed_at IS NULL`. FAIL if the callback does not appear in the UI, or if `completed_at` is set on creation.

---

### Scenario 3: B4-rbac-lab-tech — lab_tech cannot insert a callback

**Given:** A `lab_tech` member is signed in for Nursery A
**When:** The user attempts to click "นัดโทร" on a customer detail page
**Then:** The "นัดโทร" button is absent or disabled; if the server action is called directly, it returns a permission-denied error; no `customer_callbacks` row is inserted

**Verification:**

```bash
pnpm vitest run tests/customers/callback.test.ts -t "lab_tech cannot insert"
```

Manual — `USE_MOCK=false`:

1. Sign in as `lab_tech`.
2. Navigate to a customer detail page.
3. Confirm the "นัดโทร" button is absent or visibly disabled.
4. In Supabase → `customer_callbacks`: confirm no new row is created.

**Pass/Fail:** PASS if the button is absent/disabled and no DB row is inserted. FAIL if the `lab_tech` user can successfully schedule a callback.

---
