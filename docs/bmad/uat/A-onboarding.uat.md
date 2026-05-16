# UAT: Epic A — Onboarding

> Run after all stories in this epic reach `review` status. Requires: live Supabase (`USE_MOCK=false`) for A1 and A2 live scenarios; mock mode (`USE_MOCK=true`) is acceptable for A3 unit-level checks.

## Prerequisites

- `.env.local` has `USE_MOCK=false`, `NEXT_PUBLIC_USE_MOCK=false`, all three `*_SUPABASE_*` keys, and `SUPABASE_SERVICE_ROLE_KEY`
- Supabase project is linked and migrations `001`–`012` have been applied via `supabase db push`
- At least one fresh email address that has never signed up is available for A1-happy
- Storage bucket `nursery-logos` exists in the Supabase project (migration `012_storage_logos.sql`)
- Seed role available: owner (the account created during A1-happy)

---

## A1: Sign Up and Create a Nursery Workspace

### Scenario 1: A1-happy — Fresh email creates workspace

**Given:** An email address that has never been used with this Supabase project; the app is running with `USE_MOCK=false`
**When:** The user navigates to `/th/login`, enters the fresh email, and clicks the magic-link button; then clicks the link in the received email
**Then:** The browser redirects to `/th` (the dashboard) with no error; a `nurseries` row, a `nursery_members` row with `role = 'owner'`, a `notification_settings` row, and a `scorecard_settings` row are all created atomically via the `create_nursery` RPC

**Verification:**

Manual — `USE_MOCK=false`

1. Navigate to `http://localhost:3000/th/login`.
2. Enter the fresh email address; submit the magic-link form.
3. Open the email inbox; click the magic link.
4. Confirm the browser lands on `http://localhost:3000/th` (no `/error`, no `/auth/callback?error=`).
5. In the Supabase dashboard → Table Editor:
   - `nurseries`: confirm exactly one new row for this user; note `id` as `{nursery_id}`.
   - `nursery_members`: confirm one row where `nursery_id = {nursery_id}` and `role = 'owner'`.
   - `notification_settings`: confirm one row for `{nursery_id}`.
   - `scorecard_settings`: confirm one row for `{nursery_id}`.

**Pass/Fail:** PASS if dashboard renders and all four DB rows exist with correct values. FAIL if redirect lands on any error page, or if any of the four rows are absent, or if `role` is not `'owner'`.

---

### Scenario 2: A1-idempotent — Second sign-in does not duplicate workspace

**Given:** The owner email from A1-happy already has a workspace (verified above)
**When:** The user signs in a second time via a new magic link from `/th/login` using the same email
**Then:** The browser redirects to `/th`; no new `nurseries` or `nursery_members` rows are created

**Verification:**

Manual — `USE_MOCK=false`

1. Note the current row counts: `SELECT COUNT(*) FROM hatcheries` and `SELECT COUNT(*) FROM nursery_members WHERE role = 'owner'`.
2. Navigate to `/th/login`; enter the same owner email; submit; click the new magic link.
3. Confirm redirect to `/th`.
4. Re-query both counts; confirm they are identical to step 1.

Also run the bootstrap unit tests:

```bash
pnpm vitest run tests/auth/bootstrap.test.ts
```

**Pass/Fail:** PASS if row counts are unchanged and unit test suite is green. FAIL if a second `nurseries` or `nursery_members` row exists after the second sign-in, or if any bootstrap test fails.

---

### Scenario 3: A1-trial — Trial period is exactly 30 days

**Given:** A new workspace has just been created (A1-happy passed)
**When:** The `nurseries` row is inspected immediately after first sign-in
**Then:** `trial_ends_at` is within ±60 seconds of `now() + 30 days`

**Verification:**

Manual — `USE_MOCK=false`

1. In the Supabase dashboard SQL editor, run:
   ```sql
   SELECT
     trial_ends_at,
     now() + interval '30 days' AS expected,
     abs(extract(epoch from (trial_ends_at - (now() + interval '30 days')))) AS diff_seconds
   FROM hatcheries
   WHERE id = '{nursery_id}';
   ```
2. Confirm `diff_seconds < 60`.

**Pass/Fail:** PASS if `diff_seconds < 60`. FAIL if `trial_ends_at` is null, or if the difference exceeds 60 seconds, or if the period is 14 days (old value).

---

## A2: Invite Team Members

### Scenario 1: A2-happy — Owner invites member; member accepts and appears in team list

**Given:** The owner from A1-happy is signed in; a second email address (the invitee) is available; `SUPABASE_SERVICE_ROLE_KEY` is set
**When:** Owner navigates to Settings → Team, clicks "+ เชิญสมาชิก", enters the invitee email with role `lab_tech`, and submits; the invitee clicks the accept link in their email and completes magic-link sign-in
**Then:** A `team_invites` row with 7-day expiry and a 64-char hex token is created; the invitee's `nursery_members` row has `role = 'lab_tech'`; the invite's `accepted_at` is stamped; the invitee appears in the Settings → Team list

**Verification:**

```bash
pnpm vitest run tests/team/invite.test.ts
```

Then manual — `USE_MOCK=false`:

1. Sign in as owner; navigate to `/th/settings`; click "+ เชิญสมาชิก".
2. Enter the invitee email; select `lab_tech`; click "ส่งคำเชิญ".
3. Confirm toast "ส่งคำเชิญถึง {email} แล้ว" appears.
4. In Supabase → `team_invites`: confirm row exists with `nursery_id`, `email`, `role = 'lab_tech'`, `token` (64 chars), `expires_at` ~7 days from now, `accepted_at IS NULL`.
5. Open the invitee inbox; click the accept link in an incognito window; complete magic-link sign-in.
6. Confirm redirect to `/th`.
7. In Supabase → `nursery_members`: confirm a row for the invitee with `role = 'lab_tech'`.
8. In Supabase → `team_invites`: confirm `accepted_at IS NOT NULL` for the invite row.
9. As owner, reload Settings → Team; confirm the invitee's name/email appears in the member list.

**Pass/Fail:** PASS if all 7 steps above succeed and unit test suite is green (7/7). FAIL if the toast is absent, if any DB row is missing or has incorrect values, or if the invitee does not appear in the team list.

---

### Scenario 2: A2-owner-only — counter_staff cannot invite

**Given:** A `counter_staff` member is signed in (created via A2-happy or a separate invite)
**When:** The `counter_staff` user calls the `inviteTeamMember` server action directly (or via the UI if the button is visible)
**Then:** The server action returns `{ ok: false, error: 'ไม่มีสิทธิ์เชิญสมาชิก' }`; no `team_invites` row is inserted

**Verification:**

```bash
pnpm vitest run tests/team/invite.test.ts -t "non-owner blocked"
```

Manual — `USE_MOCK=false`:

1. Sign in as `counter_staff`.
2. Attempt to open Settings → Team; if the "+ เชิญสมาชิก" button is present, click it and attempt to submit an invite.
3. Confirm the action is rejected: either the button is absent/disabled at the UI level OR the server action returns an error response.
4. Query `SELECT COUNT(*) FROM team_invites` before and after — confirm count is unchanged.

**Pass/Fail:** PASS if the server action returns `{ ok: false }` and `team_invites` count is unchanged. FAIL if a `team_invites` row is inserted for a `counter_staff` caller.

---

### Scenario 3: A2-token-expiry — Expired token redirects to error

**Given:** A `team_invites` row exists where `expires_at < now()` (simulate by manually updating `expires_at` to a past timestamp in the Supabase dashboard, or by waiting 7 days with a real row)
**When:** The invitee clicks the accept link containing the expired token
**Then:** The accept-invite route redirects to a URL containing `?invite=expired`; no `nursery_members` row is created for the invitee

**Verification:**

Manual — `USE_MOCK=false`:

1. In Supabase SQL editor:
   ```sql
   UPDATE team_invites SET expires_at = now() - interval '1 hour' WHERE token = '{token}';
   ```
2. Navigate to `{NEXT_PUBLIC_APP_URL}/auth/accept-invite?token={token}`.
3. Confirm the redirect destination URL contains `?invite=expired`.
4. Confirm no new `nursery_members` row exists for the invitee email.

**Pass/Fail:** PASS if the redirect URL contains `?invite=expired` and no member row is created. FAIL if the invite is accepted and a member row is created, or if no redirect occurs.

---

## A3: Set Up the Nursery Profile

### Scenario 1: A3-logo — PNG upload stored at correct path with correct URL

**Given:** Owner is signed in; `USE_MOCK=false`; a PNG file under 2 MB is available
**When:** Owner navigates to `/th/settings`; uploads the PNG as the nursery logo; clicks "บันทึก"
**Then:** The file is stored at `{nursery_id}/logo.png` in the `nursery-logos` Storage bucket; `nursery_brand.logo_url` is updated to the public URL of that object; a success toast appears

**Verification:**

```bash
pnpm vitest run tests/settings/profile.test.ts -t "logo URL included in brand upsert"
```

Manual — `USE_MOCK=false`:

1. Navigate to `/th/settings`.
2. Click the logo upload area; select a PNG file (< 2 MB).
3. Click "บันทึก".
4. Confirm success toast "บันทึกข้อมูลเรียบร้อยแล้ว" (or equivalent) appears.
5. In Supabase Storage → `nursery-logos` bucket: confirm an object at path `{nursery_id}/logo.png` exists.
6. In Supabase → `nursery_brand`: confirm `logo_url` is set to a URL that is publicly accessible (open the URL in a browser; confirm the PNG renders).

**Pass/Fail:** PASS if the Storage object exists at the correct path and `logo_url` in `nursery_brand` points to a publicly reachable PNG URL. FAIL if the object is absent, the path does not match `{nursery_id}/logo.png`, or `logo_url` is not updated.

---

### Scenario 2: A3-display-name — Display name (TH + EN) persists after save

**Given:** Owner is signed in; `USE_MOCK=false`
**When:** Owner changes `display_name_th` to "โรงอนุบาลทดสอบ" and `display_name_en` to "Test Nursery"; clicks "บันทึก"; then reloads the settings page
**Then:** Both display names are pre-populated with the saved values after reload

**Verification:**

```bash
pnpm vitest run tests/settings/profile.test.ts -t "valid update without logo succeeds"
```

Manual — `USE_MOCK=false`:

1. Navigate to `/th/settings`.
2. Clear and re-type the TH display name field: "โรงอนุบาลทดสอบ".
3. Clear and re-type the EN display name field: "Test Nursery".
4. Click "บันทึก"; confirm success toast.
5. Hard-reload the page (`Ctrl+Shift+R` / `Cmd+Shift+R`).
6. Confirm the TH input shows "โรงอนุบาลทดสอบ" and the EN input shows "Test Nursery".
7. In Supabase → `nursery_brand`: confirm `display_name_th = 'โรงอนุบาลทดสอบ'` and `display_name_en = 'Test Nursery'`.

**Pass/Fail:** PASS if both fields show the saved values after reload and the DB row matches. FAIL if either field reverts to the previous value, is blank, or the DB row does not reflect the save.

---

### Scenario 3: A3-logo-invalid-type — Non-image upload is rejected

**Given:** Owner is signed in; a `.txt` or `.pdf` file is available for upload
**When:** Owner attempts to upload a `.txt` file as the nursery logo and clicks "บันทึก"
**Then:** The action returns an error; an error toast appears mentioning an invalid file type; no new object is created in the `nursery-logos` bucket

**Verification:**

```bash
pnpm vitest run tests/settings/profile.test.ts -t "invalid MIME type rejected"
```

Manual — `USE_MOCK=false`:

1. Navigate to `/th/settings`.
2. In the logo upload area, select a `.txt` file.
3. Click "บันทึก".
4. Confirm an error toast appears (content references invalid file type or similar).
5. In Supabase Storage → `nursery-logos`: confirm no new object was uploaded.

**Pass/Fail:** PASS if an error toast appears and no Storage object is created. FAIL if the file is uploaded silently or `logo_url` is updated with a non-image URL.

---
