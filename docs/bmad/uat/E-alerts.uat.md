# UAT: Epic E — Alerts

> Run after all stories in this epic reach `review` status. Requires: mock for most scenarios; live Supabase (`USE_MOCK=false`) for E1-rls, E3-resolution-row, and E4-idempotent.

## Prerequisites

- `pnpm install` completed; `pnpm dev` boots without error
- Mock mode: `USE_MOCK=true` / `NEXT_PUBLIC_USE_MOCK=true` in `.env.local` (default)
- Live mode (specific scenarios only): all three `*_SUPABASE_*` env vars set; two distinct nursery tenants seeded with separate owner accounts
- Role under test is noted per scenario; default is `owner`

---

## E1: See Active Alerts

### Scenario 1: E1-sort — High-severity alert surfaces above newer low-severity alert

**Given:** The database (or mock) contains two open alerts for the same nursery:
- Alert A: `sev='low'`, `created_at = now() - interval '1 hour'` (newer)
- Alert B: `sev='high'`, `created_at = now() - interval '25 hours'` (older)

**When:** An authenticated owner navigates to `/th/alerts`

**Then:** Alert B (high-severity) appears above Alert A (low-severity) in the rendered list, regardless of creation timestamp

**Verification:**
```bash
pnpm vitest run tests/api/list-alerts.test.ts -t "severity sort"
```
Or: Manual (mock mode). Insert two seed alerts with the above properties in `lib/mock/api.ts` (or via the Supabase dashboard in live mode). Load `/th/alerts` and visually confirm ordering.

**Pass/Fail:** PASS if high-severity alert renders first in the list. FAIL if low-severity alert (newer) appears above the high-severity alert, or if alerts do not load.

---

### Scenario 2: E1-rls — Cross-tenant isolation: nursery B user cannot see nursery A alerts

**Given:** Two separate nursery accounts exist in a live Supabase project — nursery A (with at least one `closed=false` alert) and nursery B (with no alerts). A user authenticated as a member of nursery B is logged in.

**When:** The nursery B user navigates to `/th/alerts`

**Then:** The alert list is empty (or shows only nursery B's own alerts); no alerts belonging to nursery A are visible

**Verification:**
Manual — `USE_MOCK=false`.
1. Seed nursery A with one open alert row directly in Supabase dashboard.
2. Sign in as a nursery B owner (separate auth session).
3. Navigate to `/th/alerts`.
4. Confirm the nursery A alert does not appear.
5. As a secondary check, run a raw Supabase query authenticated as nursery B's anon token and confirm the `alerts` RLS returns 0 rows for nursery A's `nursery_id`.

**Pass/Fail:** PASS if nursery B session sees zero nursery A alerts. FAIL if any nursery A alert row is returned or rendered.

---

## E2: Auto-Create Alerts from Farm D30 Dips

### Scenario 1: E2-blocked — Cross-service dependency not yet resolved

> **BLOCKED — Do not run this scenario.**
>
> E2 requires `farm_cycle_metrics` from the farm-side AquaWise product (a separate codebase and potentially a separate Supabase project). The table does not exist in this repository's schema. Implementation cannot begin until the following are confirmed with the farm-app team:
> - Column names (`batch_id`, `d30`, `farm_id`, recorded-at timestamp)
> - Write cadence and ingestion latency
> - Whether hatchery-CRM and farm-app share one Supabase project or require a cross-project access plan (foreign data wrapper, event webhook, or project merge)
>
> **When unblocked, this scenario will verify:**
> - 1 farm reports D30 < 70% on a batch → no alert row created
> - 2 farms report D30 < 70% on the same `batch_id` in the same ISO week → `alerts` row inserted with `severity='medium'`, `action='ตรวจสอบล็อต'`
> - 3 farms report D30 < 70% → `severity` escalates to `'high'`
> - Any farm reports D30 < 60% on the same `batch_id` → `severity='high'` regardless of farm count
> - Same breach in the same ISO week → no duplicate row (partial unique on `(batch_id, alert_kind, week)`)
>
> **Test file (once unblocked):**
> ```bash
> pnpm vitest run tests/alerts/auto.test.ts
> ```

**Pass/Fail:** This scenario is SKIPPED until cross-service coordination is documented in `docs/work-breakdown/`.

---

## E3: Close an Alert

### Scenario 1: E3-no-note — Submitting close without a resolution note is rejected

**Given:** An open alert exists; the `closeAlert` modal is open with the note textarea empty

**When:** An owner submits the form without entering any text in the resolution note field

**Then:** The server action (or client-side validation) rejects the submission; no `alert_resolutions` row is created; no `alerts.closed` update occurs; an error message is displayed to the user

**Verification:**
```bash
pnpm vitest run tests/alerts/close.test.ts -t "closing without a note"
```
Or: Manual (mock mode). Open `/th/alerts`, click "ปิดเคส" on any alert, leave the note field empty, click submit. Confirm the modal does not close and an inline error appears.

**Pass/Fail:** PASS if the submission is rejected with a visible error and no DB write occurs. FAIL if the modal closes or any `alert_resolutions` row is inserted.

---

### Scenario 2: E3-modal-controls — Modal sends `note` text and `actions` array, not a single-select value

**Given:** The `close-alert-modal.tsx` has been reworked per the E3 implementation spec (controlled textarea + checkbox multi-select replacing the old single-select dropdown)

**When:** An owner types "ตรวจสอบผล PCR ซ้ำ" in the note field, selects `lab_retest` and `customer_followup` checkboxes, and submits

**Then:** The server action `closeAlertAction` receives:
- `note = "ตรวจสอบผล PCR ซ้ำ"` (non-empty string)
- `actions = ["lab_retest", "customer_followup"]` (array, not a single string)

**Verification:**
```bash
pnpm vitest run tests/alerts/close.test.ts -t "closing with note and actions"
```
Or: Manual (mock mode). Intercept the server action call (add a `console.log` temporarily) and confirm the payload shape matches the expected types.

**Pass/Fail:** PASS if `actions` is a `string[]` containing both selected values and `note` is the entered string. FAIL if `actions` is a single string (old dropdown behavior) or if `note` is empty/undefined.

---

### Scenario 3: E3-resolution-row — `alert_resolutions` row is created with correct `closed_by`

**Given:** An open alert exists in a live Supabase project; the authenticated user is an owner with a known `auth.users.id`

**When:** The owner submits the close-alert modal with a valid note and at least one action selected

**Then:**
- `alerts.closed = true` for the targeted alert row
- An `alert_resolutions` row exists with:
  - `alert_id` matching the closed alert
  - `note` matching the submitted text
  - `actions` JSONB array matching the selected actions
  - `closed_by` matching the authenticated owner's `auth.users.id`

**Verification:**
```bash
pnpm vitest run tests/alerts/close.test.ts -t "inserts an alert_resolutions row"
```
Or: Manual — `USE_MOCK=false`.
1. Note your authenticated user's UUID from Supabase Auth dashboard.
2. Open `/th/alerts`, close an alert with note "UAT test close" and action `lab_retest`.
3. In Supabase dashboard, query `SELECT * FROM alert_resolutions WHERE note = 'UAT test close'`.
4. Confirm `closed_by` matches your user UUID; `actions` contains `["lab_retest"]`.

**Pass/Fail:** PASS if the `alert_resolutions` row exists with all four fields correct. FAIL if the row is missing, `closed_by` is null, or `actions` is not a valid JSONB array.

---

### Scenario 4: E3-rbac — RBAC gate: `lab_tech` cannot close alerts

**Given:** An authenticated `lab_tech` user opens `/th/alerts`

**When:** The `lab_tech` attempts to submit the close-alert modal (or the "ปิดเคส" button is rendered)

**Then:** Either (a) the submit button is disabled with an inline message, or (b) the server action throws a Forbidden error and no DB write occurs

**Verification:**
```bash
pnpm vitest run tests/alerts/close.test.ts -t "non-alert:close role"
```
Or: Manual (mock mode). Set the mock session role to `lab_tech`. Navigate to `/th/alerts`. Confirm "ปิดเคส" button is disabled or absent.

**Pass/Fail:** PASS if `lab_tech` cannot complete a close action. FAIL if the close modal submits successfully for `lab_tech`.

---

## E4: Notify Affected Farms

### Scenario 1: E4-idempotent — Calling `notifyAlertFarms` twice does not create duplicate `line_outbound_events` rows

**Given:** An open alert with `alert_id = 'alert-uuid-123'` exists; two farms are affected, both with bound `line_id` values. The `line_outbound_events` table has a partial unique index on `(customer_id, alert_id)` (migration 006).

**When:** `notifyAlertFarms('alert-uuid-123', 'acknowledge')` is called, then called again for the same alert and template

**Then:** Only two `line_outbound_events` rows exist after both calls (one per affected farm); no duplicate rows are created by the second call

**Verification:**
```bash
pnpm vitest run tests/alerts/notify.test.ts -t "idempotency"
```
Or: Manual — `USE_MOCK=false`.
1. Navigate to `/th/alerts`, click "ส่งข้อความถึงฟาร์ม" on an alert, select `acknowledge`, submit.
2. Immediately submit again with the same template.
3. In Supabase dashboard, run: `SELECT COUNT(*) FROM line_outbound_events WHERE payload->>'alert_id' = 'alert-uuid-123'`.
4. Confirm count equals the number of affected farms (not double).

**Pass/Fail:** PASS if row count after two calls equals the number of affected farms (no duplicates). FAIL if a second call inserts additional rows.

---

### Scenario 2: E4-rbac — `counter_staff` can notify; `auditor` cannot

**Given:** Two authenticated sessions — one `counter_staff`, one `auditor` — each viewing the same open alert

**When:**
- `counter_staff` clicks "ส่งข้อความถึงฟาร์ม" and submits the `acknowledge` template
- `auditor` attempts the same action

**Then:**
- `counter_staff` submission succeeds; `line_outbound_events` rows are created
- `auditor` submission is blocked (button disabled or server action returns Forbidden)

**Verification:**
```bash
pnpm vitest run tests/alerts/notify.test.ts -t "counter_staff can notify"
pnpm vitest run tests/alerts/notify.test.ts -t "auditor cannot notify"
```
Or: Manual (mock mode). Switch mock session role between `counter_staff` and `auditor`; observe button state and submission outcome.

**Pass/Fail:** PASS if `counter_staff` can enqueue and `auditor` is blocked. FAIL if `auditor` successfully enqueues, or if `counter_staff` is incorrectly blocked.

---

## UAT Run — 2026-05-17 (Block E)

> Executed via Playwright MCP (desktop 1440x900) on live `USE_MOCK=false` (supabase-hatchery), fixture `e2e-test@example.com` (owner) + `qa-uat-probe@gmail.com` (counter_staff), nursery `705cc5e2-423d-4a98-95e8-cdc95c7672f6`. Results: `docs/qa/uat-run/results/nursery-E.json`; screenshots: `docs/qa/uat-run/screenshots/nursery-E/`.

- **28 rows: 28 PASS, 0 BLOCKED-EXTERNAL, 0 FAIL.**
- All PASS. D30 dip alerts verified via run_d30_dip_alert_scan (medium/high/severe/dedupe). Close + notify-farms fan-out + idempotency (alert dedupe index) DB-verified.
- Green gate post-fix: `pnpm typecheck` clean, `pnpm lint` clean, `pnpm test` 283 passed (baseline 277, no regression). Fixes shipped in nursery-crm@main (commit 5975053). Seeded DB rows restored to pre-run baseline.
