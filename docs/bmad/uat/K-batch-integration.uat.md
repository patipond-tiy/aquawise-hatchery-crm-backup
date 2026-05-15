# UAT: Epic K — LINE Bot Batch Attribution Integration

> Run after K1–K4 reach `review` status. K1 (schema) gates everything else; K2/K3 gate the LINE-bot-side claim flow; K4 gates outbound warnings.
> Cross-product: this epic is the CRM half of the contract in `../stories/_integration-with-line-bot-Epic-K.md`. The LINE-bot side has its own UAT at `aquawise-line-bot/docs/bmad/uat/K-batch-cohort.uat.md`. Coordinate a joint run for the end-to-end scenarios marked **[CROSS-PRODUCT]**.

## Prerequisites

- `pnpm install` completed; `pnpm dev` boots without error
- Mock mode (`USE_MOCK=true`) for schema/unit scenarios
- Live mode (`USE_MOCK=false`, all `*_SUPABASE_*` set) for the API + webhook scenarios
- K1.i (migration `013_batch_code_and_claims.sql`) marked done before any K2/K3/K4 scenario
- JWT keypairs provisioned: `CRM_JWT_PUBLIC_KEY` (verifies LINE-bot→CRM read/claim), `CRM_WEBHOOK_JWT_PRIVATE_KEY` (signs CRM→LINE-bot warnings). ES256.
- `LINE_BOT_BASE_URL` and `CRON_SECRET` set for K4
- A published batch fixture: a `batches` row with `published_at` set, `valid_until > now()`, `hatchery_contact_snapshot` populated, and at least one `pcr_results` row

> **Identity boundary check (applies to every scenario):** farmers are NOT `customers`. A claim creates a `batch_claims` row keyed by `line_user_id` only — assert no `customers` row, no `hatchery_members` row, and no PII beyond `line_profile {display_name, picture_url}` is ever written.

---

## K1: Batch Code & Claims Schema

### Scenario 1: K1-mint-uniqueness — `batch_code` is unique and confusable-free

**Given:** Migration 013 applied; `mint_batch_code()` Postgres function exists

**When:** 1,000 batches are inserted (mock seed loop or `INSERT ... SELECT generate_series`)

**Then:** Every `batch_code` matches `^B-[A-CDEFGHJKMNPQRSTUVWXYZ23456789]{6}$` (no `0`,`O`,`1`,`I`,`l`); zero collisions across all rows; `batch_code` is `NOT NULL` with `DEFAULT mint_batch_code()`

**Verification:**
```sql
SELECT count(*) FROM batches WHERE batch_code !~ '^B-[A-CDEFGHJKMNPQRSTUVWXYZ23456789]{6}$';  -- expect 0
SELECT count(*) - count(DISTINCT batch_code) FROM batches;  -- expect 0
```
**Pass/Fail:** PASS if both queries return 0. FAIL on any malformed code or collision.

### Scenario 2: K1-valid-until-cap — cannot extend beyond 90 days

**Given:** A batch row with `created_at = now()`

**When:** An UPDATE sets `valid_until = created_at + interval '120 days'`

**Then:** The CHECK constraint rejects the UPDATE (error, no row change). Setting `valid_until = created_at + interval '60 days'` succeeds.

**Verification:** Run both UPDATEs in psql; confirm the 120-day one raises a CHECK violation and the 60-day one commits.
**Pass/Fail:** PASS if 120d rejected and 60d accepted. FAIL if 120d commits.

### Scenario 3: K1-publish-gate — unpublished batch is not claimable

**Given:** A batch with `published_at IS NULL`

**When:** K2/K3 resolve this batch code (see K2-S4)

**Then:** Treated as not-found (404), not as draft-exists. `published_at IS NOT NULL AND valid_until > now()` is the only claimable predicate.

**Pass/Fail:** PASS if an unpublished code returns 404 (covered in K2-S4). FAIL if it returns 200 or a distinguishable error.

### Scenario 4: K1-contact-snapshot-freeze — contact frozen at first publish

**Given:** A batch published with `hatchery_contact_snapshot = {line_oa_id:'@old', ...}`

**When:** The operator later edits the hatchery profile (`line_oa_id` → `@new`) via A3

**Then:** A K2 read of that batch still returns `@old` (snapshot is frozen at first publish, not live-joined)

**Verification:** Publish → K2 read (assert `@old`) → edit profile → K2 read again (assert still `@old`).
**Pass/Fail:** PASS if the snapshot does not move after the profile edit. FAIL if it reflects `@new`.

### Scenario 5: K1-claims-pk — one claim row per (batch, farmer)

**Given:** `batch_claims` table exists with PK `(batch_id, line_user_id)`

**When:** Two INSERTs with the same `(batch_id, line_user_id)`

**Then:** Second INSERT raises a duplicate-key violation (the K3 idempotency path handles this gracefully — see K3-S5)

**Pass/Fail:** PASS if the raw second INSERT violates the PK. FAIL if duplicate rows persist.

### Scenario 6: K1-event-log-idempotency — `crm_event_log.correlation_id` is UNIQUE

**Given:** `crm_event_log` table exists

**When:** Two INSERTs with the same `correlation_id`

**Then:** Second raises a unique violation (idempotency key enforced at the DB)

**Pass/Fail:** PASS if the second INSERT is rejected. FAIL if duplicates persist.

---

## K2: Batch Read API

### Scenario 1: K2-auth-missing — no token → 401

**When:** `GET /api/v1/batches/B-A4F2K7` with no `Authorization` header

**Then:** 401; no batch data in body

**Verification:** `curl -i http://localhost:3000/api/v1/batches/B-A4F2K7`
**Pass/Fail:** PASS if 401 and no payload. FAIL otherwise.

### Scenario 2: K2-auth-bad-claims — wrong `iss`/`aud`/expired → 401

**Given:** Three crafted JWTs: (a) `iss=evil`, (b) `aud=wrong`, (c) `exp` in the past

**When:** Each used against `GET /api/v1/batches/:code`

**Then:** All three return 401. The expired one carries `WWW-Authenticate: Bearer error="token_expired"`.

**Pass/Fail:** PASS if all 3 → 401 and expired carries the header. FAIL on any 200.

### Scenario 3: K2-path-format — malformed code → 400

**When:** `GET /api/v1/batches/B-0O1Il2` (contains excluded confusables) with a valid token

**Then:** 400 `{ error: 'invalid_code_format' }` — rejected before any DB lookup

**Pass/Fail:** PASS if 400 with that body. FAIL if 404 (means it hit the DB) or 200.

### Scenario 4: K2-resolution-ladder — unknown / unpublished / expired

**Given:** code U (never minted), code D (minted, `published_at IS NULL`), code E (published, `valid_until < now()`)

**When:** Each read with a valid token

**Then:** U → 404 `batch_not_found`; D → 404 `batch_not_found` (identical — no draft leak); E → 410 `{ error:'batch_expired', expired_at }`

**Pass/Fail:** PASS if U and D return byte-identical 404 bodies and E returns 410 with `expired_at`. FAIL if D is distinguishable from U.

### Scenario 5: K2-happy — published batch returns the ADR-018 payload **[CROSS-PRODUCT]**

**Given:** The published batch fixture with PCR results and a signed cert URL

**When:** `GET /api/v1/batches/:code` with a valid LINE-bot JWT

**Then:** 200 with the exact field set in K2 AC#4 (`batch_code`, `hatchery_id`, `hatchery_name`, `hatchery_contact`, `pl_stage`, `source_strain`, `spawn_date`, `pcr_results{wssv,ehp,ihhnv,tsv}`, `pcr_certificate_url`, `valid_until`, `claimed_by_other`). `pcr_certificate_url` is a signed URL or `null`; `hatchery_contact` comes from the frozen snapshot.

**Verification:** Joint run with the LINE-bot team — the bot's K.1 consumer must parse this body without a schema error.
**Pass/Fail:** PASS if the body matches ADR-018 exactly and the bot consumes it. FAIL on any missing/renamed field.

---

## K3: Batch Claim API

### Scenario 1: K3-auth — same JWT contract as K2

**When:** `POST /api/v1/batches/:code/claim` with missing/invalid/expired token

**Then:** 401 in all three cases (mirror K2-S1/S2)

**Pass/Fail:** PASS if all → 401. FAIL on any 200.

### Scenario 2: K3-body-validation — malformed body → 400

**Given:** Bodies missing `line_user_id`; with `line_user_id` not matching `/^U[0-9a-f]{32}$/`; with `correlation_id` not a UUID v4

**When:** Each POSTed with a valid token

**Then:** 400 `{ error:'invalid_body', field:'<name>' }` naming the first offending field

**Pass/Fail:** PASS if each returns 400 with the correct `field`. FAIL if a malformed body inserts a row.

### Scenario 3: K3-happy — first claim writes `batch_claims` + side effects

**When:** Valid claim POST against the published fixture

**Then:** 200 `{ ok:true, batch_code, claimed_at }`; one `batch_claims` row with `(batch_id, line_user_id, pond_id, line_profile, correlation_id, hatchery_id, claimed_at)`; `batches.first_claimed_at` set to `now()` (was NULL); one `audit_log` row `event='batch_claim'`. **Assert no `customers` row created.**

**Verification:**
```sql
SELECT count(*) FROM batch_claims WHERE batch_id = :b;          -- 1
SELECT first_claimed_at FROM batches WHERE id = :b;             -- not null
SELECT count(*) FROM audit_log WHERE event='batch_claim';       -- 1
SELECT count(*) FROM customers WHERE created_at > :t0;          -- 0  (identity boundary)
```
**Pass/Fail:** PASS if all four hold. FAIL on any missing row OR any `customers` write.

### Scenario 4: K3-idempotency — repeat claim is a no-op 200

**Given:** A claim already exists for `(batch, U-farmer)`

**When:** (a) re-POST same `(code, line_user_id, correlation_id)`; (b) re-POST same `(code, line_user_id)` with a DIFFERENT `correlation_id`

**Then:** Both → 200 with the ORIGINAL `claimed_at`; the original `correlation_id` is preserved (not overwritten); `audit_log` gets a `batch_claim_repeat` event (not a second `batch_claim`)

**Pass/Fail:** PASS if claimed_at and original correlation_id are stable and the repeat event is logged. FAIL if the row is overwritten or a duplicate `batch_claim` event appears.

### Scenario 5: K3-conflict — different farmer → 409 with no PII leak

**Given:** `(batch, U-alice)` already claimed

**When:** `(batch, U-bob)` POSTs a claim

**Then:** 409 `{ error:'claimed_by_other' }` — body contains NO `line_user_id`, `display_name`, or `picture_url` of Alice

**Verification:** Inspect the 409 body byte-for-byte; grep for Alice's identifiers — must be absent.
**Pass/Fail:** PASS if 409 and zero Alice PII in the response. FAIL if any Alice identifier leaks.

### Scenario 6: K3-rate-limit — 10 req/s per `iss`

**When:** 50 claim POSTs in 1 second from the same `iss`

**Then:** The excess is rejected (429 or the project's rate-limit response); the limiter is the shared `rate-limit.ts` helper also used by K2

**Pass/Fail:** PASS if throttling engages at ~10/s. FAIL if all 50 process.

---

## K4: Batch Warning Webhook Publisher

### Scenario 1: K4-rbac — only owner/counter_staff can publish

**Given:** Sessions as each role

**When:** Each opens `/[locale]/(dashboard)/batches/[id]` and attempts the "แจ้งเตือนล็อตนี้" action

**Then:** `owner` and `counter_staff` can publish (`can(role,'alert:close')` is true); `lab_tech` and `auditor` cannot — button hidden AND server action rejects if forced

**Pass/Fail:** PASS if the matrix holds at BOTH the UI-hide and server-action layers. FAIL if a non-permitted role can publish via a forced request.

### Scenario 2: K4-enqueue — server action writes `crm_event_log`

**When:** `publishBatchWarning(batchId,'warning',title,body,action)` is invoked

**Then:** One `crm_event_log` row: `event_type='batch_warning'`, fresh `correlation_id`, `posted_at=now()`, `delivered_at=null`, `attempts=0`; the action returns the new `correlation_id`

**Pass/Fail:** PASS if the row and return value match. FAIL otherwise.

### Scenario 3: K4-critical-inline — critical delivers inline **[CROSS-PRODUCT]**

**Given:** `LINE_BOT_BASE_URL` points at a LINE-bot staging endpoint that 2xxs

**When:** Publish with `severity='critical'`

**Then:** `deliverBatchWarning()` runs inline (caller awaits ≤3s); outbound JWT has `iss=hatchery-crm`, `aud=line-bot-webhook` (NOT the read-side `aud`); on 2xx, `delivered_at` is set; LINE-bot staging records receipt with the same `correlation_id`

**Pass/Fail:** PASS if delivered_at set within timeout AND the bot side correlates. FAIL if it falls to retry path on a healthy endpoint, or if the JWT `aud` equals the read-side audience (confused-deputy).

### Scenario 4: K4-warning-info-enqueue — non-critical defers to cron

**When:** Publish with `severity='warning'` then `severity='info'`

**Then:** Neither delivers inline; both rows sit `delivered_at=null` until the next `app/api/cron/deliver-crm-events` tick

**Pass/Fail:** PASS if no inline POST for warning/info and the cron later delivers. FAIL if warning/info block the caller.

### Scenario 5: K4-retry-backoff — failed delivery retries with backoff

**Given:** `LINE_BOT_BASE_URL` points at an endpoint returning 503

**When:** A critical publish fails inline, then the cron runs repeatedly

**Then:** `attempts` increments; spacing follows `min(2^attempts,60)`s; after 12 attempts the row stops at `attempts=12, last_error=<final>` (dead-letter UI is a deferred follow-up, not tested here)

**Pass/Fail:** PASS if attempts cap at 12 with backoff. FAIL if it retries unbounded or ignores backoff.

### Scenario 6: K4-cron-auth — cron endpoint rejects unauthenticated calls

**When:** `POST /api/cron/deliver-crm-events` without `Authorization: Bearer ${CRON_SECRET}`

**Then:** 401/403; no delivery attempts

**Verification:** `curl -i -X POST http://localhost:3000/api/cron/deliver-crm-events` (no auth) → expect 4xx
**Pass/Fail:** PASS if unauthenticated calls are rejected. FAIL if the cron runs without the secret.

---

## Epic-K exit gate

All of the following before K1–K4 are marked done:

- [ ] Every scenario above PASS in the stated mode
- [ ] **[CROSS-PRODUCT]** scenarios (K2-S5, K3 happy path consumed by bot, K4-S3) verified in a joint run with the LINE-bot team against `aquawise-line-bot/docs/bmad/uat/K-batch-cohort.uat.md`
- [ ] Identity boundary holds in every claim path: zero `customers` / `hatchery_members` writes from a farmer claim; no farmer PII beyond `line_profile{display_name,picture_url}`
- [ ] Confused-deputy check: read-side JWT `aud` (`hatchery-crm`) and webhook-side JWT `aud` (`line-bot-webhook`) are distinct and not interchangeable
- [ ] `pnpm typecheck && pnpm lint && pnpm test` green
- [ ] P0 cross-tenant SQL test (see `code-design.md` §11) extended to cover `batch_claims` and `crm_event_log` (both carry `hatchery_id`)
