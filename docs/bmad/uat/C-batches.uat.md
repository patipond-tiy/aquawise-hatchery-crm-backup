# UAT: Epic C — Batches

> Run after all stories in this epic reach `review` status. Requires: live Supabase (`USE_MOCK=false`) for storage, RLS, and PDF byte checks; mock mode (`USE_MOCK=true`) acceptable for unit-level filter and RBAC checks where noted.

## Prerequisites

- Migrations `001`–`014` applied; `batches`, `pcr_results`, `batch_distributions`, `customer_cycles`, `batch_certs` tables exist
- Storage buckets `pcr-reports` and `pcr-certificates` exist in the Supabase project
- A `batches_auditor_v` SECURITY INVOKER view exists (migration `013_auditor_batch_view.sql`)
- At least one batch exists with real `pcr_results` rows (at least 4 diseases) and at least 3 `batch_distributions` rows with linked `customer_cycles.d30` values
- At least one batch exists with zero `batch_distributions` rows
- A `lab_tech` member and a `counter_staff` member exist for Hatchery A
- An `auditor` member exists for Hatchery A
- Font files `Plus Jakarta Sans` and `Noto Sans Thai` exist in `public/fonts/`

---

## C1: Register a New Batch

### Scenario 1: C1-pcr-required — Advancing from step 2 without a file is blocked

**Given:** The Add Batch wizard is open; step 1 is complete; the user is on step 2 (PCR upload)
**When:** The user does not attach a PCR file and clicks the "Next" button to advance to step 3
**Then:** The wizard does not advance; an error message referencing the required PCR file is shown on step 2; no `batches` or `pcr_results` rows are inserted

**Verification:**

```bash
pnpm vitest run tests/batches/register.test.ts -t "missing PCR file"
```

Manual — `USE_MOCK=true`:

1. Open the Add Batch modal; complete step 1 (source strain, spawn date, PL count).
2. On step 2, do not attach any file.
3. Click the "Next" or advance button.
4. Confirm the wizard stays on step 2 with an error referencing the PCR file requirement (e.g., "กรุณาอัปโหลดผล PCR ก่อนดำเนินการต่อ").
5. Confirm step 3 is not reachable.

**Pass/Fail:** PASS if the wizard does not advance past step 2 and the error is visible. FAIL if the wizard advances to step 3 without a PCR file attached.

---

### Scenario 2: C1-atomic — batches row rolls back if pcr_results insert fails

**Given:** The `addBatch()` server action is invoked with valid batch fields but the `pcr_results` insert is rigged to fail (e.g., via a mocked DB error in the test environment)
**When:** The server action executes the `batches` insert successfully but the `pcr_results` insert throws
**Then:** The `batches` row that was inserted is also removed (rolled back); no orphaned `batches` row exists in the DB

**Verification:**

```bash
pnpm vitest run tests/batches/register.test.ts -t "atomic rollback"
```

No additional manual step is required; the unit test covers this scenario by asserting that the `batches` delete (or transaction rollback) is called when `pcr_results` insert throws.

**Pass/Fail:** PASS if the unit test passes and the `batches` row is absent after the simulated `pcr_results` failure. FAIL if the `batches` row persists without corresponding `pcr_results` rows.

---

### Scenario 3: C1-rbac — counter_staff cannot insert pcr_results rows

**Given:** A `counter_staff` user is signed in; the Add Batch wizard step 2 is reached with a PCR file and disease results filled in
**When:** The user submits the final wizard step, causing the `addBatch()` server action to run
**Then:** The server action returns a role-rejection error for the `pcr_results` insert; no `pcr_results` row is created; the `batches` row is rolled back

**Verification:**

```bash
pnpm vitest run tests/batches/register.test.ts -t "counter_staff cannot insert pcr_results"
```

Manual — `USE_MOCK=false`:

1. Sign in as `counter_staff`.
2. Open the Add Batch wizard; complete all steps including PCR file upload and disease results.
3. Click the final "ลงทะเบียน" button.
4. Confirm an error toast or modal error appears referencing authorization (e.g., "บทบาทของคุณไม่มีสิทธิ์บันทึกผล PCR").
5. In Supabase → `batches` and `pcr_results`: confirm no new rows were inserted.

**Pass/Fail:** PASS if the action is rejected with an authorization error and no rows are inserted. FAIL if `pcr_results` rows are inserted for a `counter_staff` caller.

---

## C2: Browse and Review Batches

### Scenario 1: C2-auditor — Auditor sees batch list but unit_price is null/hidden

**Given:** An `auditor` member is signed in; batches exist with `unit_price` values in `batch_distributions`
**When:** The auditor navigates to `/th/batches`
**Then:** The batch list loads and shows all batch cards; `unit_price` and commercial LTV fields are null or absent in the API response; no commercial data is visible in the UI for the auditor

**Verification:**

```bash
pnpm vitest run tests/batches/list.test.ts -t "auditor dispatch"
pnpm vitest run tests/batches/list.test.ts -t "unit_price null for auditor"
```

Manual — `USE_MOCK=false`:

1. Sign in as `auditor`.
2. Navigate to `/th/batches`.
3. Confirm the batch list renders with cards showing batch ID, PCR chip, spawn date, strain, buyer count, and mean D30.
4. Confirm no LTV, `unit_price`, or `sold_at` value is visible on any batch card.
5. In the browser DevTools → Network tab, inspect the API response for the batches query; confirm `unit_price` fields are absent or null.

**Pass/Fail:** PASS if the batch list loads and zero `unit_price` values appear in the UI or API response for the auditor. FAIL if any `unit_price` or LTV value is visible to the auditor.

---

### Scenario 2: C2-filter — PCR Pass filter chip updates URL searchParam and refetches

**Given:** Owner or counter_staff is signed in; batches exist with mixed PCR statuses (`clean`, `flagged`, `pending`)
**When:** The user clicks the "ผ่าน" (Clean) filter chip on `/th/batches`
**Then:** The URL updates to include `?pcr=clean`; the batch list refetches and shows only batches where `pcr_status = 'clean'`; batches with other statuses are not displayed

**Verification:**

```bash
pnpm vitest run tests/batches/list.test.ts -t "filter chip updates URL"
pnpm vitest run tests/batches/list.test.ts -t "listBatches with pcr=clean filter"
```

Manual — `USE_MOCK=true`:

1. Navigate to `/th/batches`.
2. Click the "ผ่าน" filter chip.
3. Confirm the URL changes to include `?pcr=clean` (check the browser address bar).
4. Confirm only batch cards with PCR status "ผ่าน" (clean) are shown.
5. Click the "ผ่าน" chip again (or an "All" chip) to clear the filter; confirm all batches return and the `?pcr=` param is removed from the URL.

**Pass/Fail:** PASS if the URL param updates and only clean-status batches are shown after filtering. FAIL if the URL does not update, or if batches with non-clean status remain visible after the filter is applied.

---

## C3: View Batch Detail with Distribution

### Scenario 1: C3-mean-d30 — Mean D30 computed correctly for batch with 3 buyers

**Given:** A batch exists with exactly 3 `batch_distributions` rows, each linked to a `customer_cycles` row with distinct `d30` values: 60, 80, 90
**When:** The user navigates to that batch's detail page
**Then:** The "D30 เฉลี่ย" stat card shows 76.67% (or 76.7% rounded to one decimal)

**Verification:**

```bash
pnpm vitest run tests/batches/detail.test.ts -t "mean D30 computed correctly"
```

Manual — `USE_MOCK=false`:

1. Ensure the batch's `customer_cycles` rows have `d30 = 60`, `80`, `90`.
2. Navigate to `/th/batches/{batch_id}`.
3. Locate the "D30 เฉลี่ย" stat card.
4. Confirm the displayed value is 76.67% (or 76.7%).

**Pass/Fail:** PASS if the displayed mean D30 is 76.67% (±0.1%). FAIL if the value is 0, null, or differs from the mathematically correct mean.

---

### Scenario 2: C3-empty — Batch with no distributions shows empty buyers table, not error

**Given:** A batch exists with zero rows in `batch_distributions`
**When:** The user navigates to that batch's detail page
**Then:** The buyers table renders an empty state message ("ยังไม่มีข้อมูลการจำหน่าย"); no JavaScript error is thrown; the page does not error-boundary

**Verification:**

```bash
pnpm vitest run tests/batches/detail.test.ts -t "empty distribution state"
```

Manual — `USE_MOCK=false`:

1. Navigate to `/th/batches/{batch_id_with_no_distributions}`.
2. Open browser DevTools console; confirm no errors.
3. Confirm the buyers table area shows the empty state text "ยังไม่มีข้อมูลการจำหน่าย" (or equivalent).
4. Confirm the sold PL count stat shows 0 or "—" and buyer count shows 0 or "—".

**Pass/Fail:** PASS if the empty state is displayed with no console errors. FAIL if the page throws an error, shows a blank section without messaging, or crashes the error boundary.

---

## C4: Print or Send PCR Certificate

### Scenario 1: C4-pdf — PDF download returns valid PDF bytes

**Given:** A batch with real `pcr_results` rows exists; the `lab_tech` or `owner` user is signed in; `@react-pdf/renderer` is installed
**When:** The user clicks "พิมพ์ใบรับรอง" on the batch detail page
**Then:** A PDF file download is initiated; the first 4 bytes of the returned buffer are `%PDF`

**Verification:**

```bash
pnpm vitest run tests/batches/cert.test.ts -t "PDF byte snapshot"
```

Manual — `USE_MOCK=false`:

1. Navigate to `/th/batches/{batch_id}`.
2. Click "พิมพ์ใบรับรอง"; confirm a loading state ("กำลังสร้างใบรับรอง...") appears briefly.
3. Confirm a new browser tab opens with the PDF URL.
4. In Supabase Storage → `pcr-certificates`: confirm a new object exists at `{batch_id}/{timestamp}.pdf`.
5. Download the file and open it; confirm it is a valid PDF (renders in a PDF viewer).
6. Alternatively, use `curl -s "{pdf_url}" | head -c 4` and confirm the output is `%PDF`.

**Pass/Fail:** PASS if the file opens as a valid PDF and the first 4 bytes are `%PDF`. FAIL if the download fails, the file is empty, or the bytes do not start with `%PDF`.

---

### Scenario 2: C4-line-blocked — "Send via LINE" communicates pending delivery

**Given:** G3' (bot worker) is not yet deployed; a batch with at least one buyer in `batch_distributions` exists
**When:** The user clicks "ส่งใบรับรอง LINE" on the batch detail page; the cert modal opens; the user selects at least one buyer and submits
**Then:** A `line_outbound_events` row with `template = 'pcr_certificate'` and `status = 'pending'` is inserted; the modal shows the informational note "จะส่งเมื่อระบบ LINE พร้อม"; the toast confirms the enqueue count; no actual LINE message is delivered

**Verification:**

```bash
pnpm vitest run tests/batches/cert.test.ts -t "sendCertificate idempotency"
```

Manual — `USE_MOCK=false`:

1. Navigate to `/th/batches/{batch_id}`.
2. Click "ส่งใบรับรอง LINE"; confirm the cert modal opens with a buyer list.
3. Confirm the text "จะส่งเมื่อระบบ LINE พร้อม" (or equivalent calm declarative text) is visible in the modal.
4. Select one buyer; click "เพิ่มคิวส่ง".
5. Confirm the toast "เพิ่มคิวส่งใบรับรองให้ 1 ราย แล้ว" (or matching count) appears.
6. In Supabase → `line_outbound_events`: confirm a new row with `template = 'pcr_certificate'`, `status = 'pending'`, and the correct `customer_id` exists.
7. Confirm no LINE message arrives in any test LINE account (delivery requires G3').

**Pass/Fail:** PASS if the `line_outbound_events` row is inserted with `status = 'pending'` and the modal displays the LINE-pending notice. FAIL if no row is inserted, if the row has `status != 'pending'`, or if the pending delivery notice is absent from the modal.

---

### Scenario 3: C4-idempotent — Sending same certificate twice does not duplicate line_outbound_events

**Given:** A `line_outbound_events` row for `(batch_id, customer_id, 'pcr_certificate')` already exists with `status != 'dead'`
**When:** The user submits the cert modal again for the same batch and customer
**Then:** No duplicate `line_outbound_events` row is created; the toast reflects the actual enqueue count (0 if fully idempotent)

**Verification:**

```bash
pnpm vitest run tests/batches/cert.test.ts -t "sendCertificate idempotency"
```

Manual — `USE_MOCK=false`:

1. Complete C4-line-blocked scenario above (first send creates one row).
2. Note `SELECT COUNT(*) FROM line_outbound_events WHERE batch_id = '{batch_id}' AND customer_id = '{customer_id}' AND template = 'pcr_certificate'` — expect 1.
3. Open the cert modal again for the same batch; select the same buyer; click "เพิ่มคิวส่ง".
4. Re-query the count; confirm it remains 1.

**Pass/Fail:** PASS if the count remains 1 after the second submit. FAIL if a duplicate row is created.

---
