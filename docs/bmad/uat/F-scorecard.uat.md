# UAT: Epic F — Scorecard

> ⚠ **DO NOT RUN — 2027+ HYPOTHESES**
>
> All scenarios in this file are 2027+ unvalidated hypotheses. The public scorecard feature is contingent on:
> - Nursery and farmer sides reaching sufficient data scale
> - Validation with P'Bunjong (Thai Aquaculture Federation)
> - CEO sign-off on the F-epic
>
> Do not execute any scenario below until all three conditions are met and this file has been updated to remove this callout. The stories F1 and F2 are in `docs/bmad/stories/_hypotheses/` and carry `⚠ HYPOTHESIS — DO NOT DEVELOP` markers.

---

## F1: Toggle Scorecard Visibility

### Scenario 1: F1-toggle — Setting `public=true` makes the scorecard publicly accessible

> ⚠ DO NOT RUN — 2027+ hypothesis not validated

**Given:** An owner account for a hatchery with `scorecard_settings.public = false` (the default); the F2 public scorecard route (`/th/h/{slug}`) exists and is deployed (hypothesis — does not exist today)

**When:** The owner navigates to Settings → Scorecard and flips the `public` toggle to `on`; the change is persisted to `scorecard_settings`

**Then:** The public page at `/th/h/{slug}` returns HTTP 200 and renders the scorecard for an unauthenticated visitor

**Verification:**
```bash
# ⚠ DO NOT RUN
pnpm vitest run tests/scorecard/toggle.test.ts -t "public toggle persists"
```
Or: Manual — `USE_MOCK=false`. Navigate to Settings → Scorecard; enable public toggle; open `/th/h/{slug}` in an incognito window; confirm HTTP 200.

**Pass/Fail:** PASS if the scorecard page returns 200 for an unauthenticated visitor after `public=true` is set. FAIL if it returns 404 or 403, or if the toggle does not persist.

---

### Scenario 2: F1-owner-only — `counter_staff` cannot write scorecard visibility settings

> ⚠ DO NOT RUN — 2027+ hypothesis not validated

**Given:** An authenticated `counter_staff` user with a valid session for the hatchery

**When:** The `counter_staff` user attempts to toggle any of the six scorecard visibility settings (public, showD30, showPCR, showRetention, showVolume, showReviews)

**Then:** The toggle is read-only (disabled) or the server action returns a Forbidden error; `scorecard_settings` is not mutated

**Verification:**
```bash
# ⚠ DO NOT RUN
pnpm vitest run tests/scorecard/toggle.test.ts -t "counter_staff write rejected"
```
Or: Manual. Sign in as `counter_staff`; navigate to Settings → Scorecard; confirm all toggles are rendered in a read-only/disabled state.

**Pass/Fail:** PASS if `counter_staff` cannot mutate `scorecard_settings`. FAIL if the toggle responds to clicks or the server action succeeds.

---

### Scenario 3: F1-reviews-disabled — `showReviews` toggle is always disabled (no data source)

> ⚠ DO NOT RUN — 2027+ hypothesis not validated

**Given:** The scorecard settings page is loaded for any role

**When:** The page renders the six scorecard toggles

**Then:** The `showReviews` toggle is rendered with a `disabled` prop (grayed out, non-interactive), regardless of the current `scorecard_settings.show_reviews` value

**Verification:**
```bash
# ⚠ DO NOT RUN
# Manual: inspect DOM for the showReviews toggle element; confirm it has disabled attribute
```
Or: Manual. Open `/th/scorecard` (internal settings view) in any browser. Right-click the Reviews toggle and inspect element. Confirm `disabled` attribute is present.

**Pass/Fail:** PASS if the `showReviews` toggle is non-interactive and visually disabled. FAIL if the toggle is clickable or submittable.

---

## F2: Public Scorecard Page

### Scenario 1: F2-incognito — Unauthenticated visitor can view public scorecard

> ⚠ DO NOT RUN — 2027+ hypothesis not validated

**Given:** A hatchery has `scorecard_settings.public = true`; the public route `app/[locale]/h/[slug]/page.tsx` is deployed (hypothesis — does not exist today); the hatchery slug is `p-pong`

**When:** An unauthenticated visitor opens `/th/h/p-pong` in an incognito browser window

**Then:**
- The page returns HTTP 200
- The hatchery brand (logo, display name in Thai) is rendered
- "Verified by AquaWise" stamp and last-refresh timestamp are visible
- Only the stat sections that the owner has toggled on in F1 are shown
- No auth prompt or redirect to login occurs

**Verification:**
```bash
# ⚠ DO NOT RUN
pnpm vitest run tests/scorecard/public.test.ts -t "renders without auth"
```
Or: Manual — `USE_MOCK=false`. Open `/th/h/p-pong` in incognito; confirm HTTP 200 and brand rendering.

**Pass/Fail:** PASS if the page loads without auth and shows only owner-toggled stats. FAIL if the page redirects to login, returns a non-200 status, or shows stats the owner has toggled off.

---

### Scenario 2: F2-private — Private hatchery returns 404

> ⚠ DO NOT RUN — 2027+ hypothesis not validated

**Given:** A hatchery has `scorecard_settings.public = false`; the public route exists

**When:** An unauthenticated visitor opens `/th/h/{slug}` for that hatchery

**Then:** The page returns HTTP 404

**Verification:**
```bash
# ⚠ DO NOT RUN
pnpm vitest run tests/scorecard/public.test.ts -t "private slug returns 404"
```
Or: Manual — `USE_MOCK=false`. Set `public=false` for a hatchery; open its slug URL in incognito; confirm 404 response.

**Pass/Fail:** PASS if HTTP 404 is returned for a private hatchery slug. FAIL if HTTP 200 is returned or the page is visible to unauthenticated visitors.

---

### Scenario 3: F2-rls — Aggregates do not expose raw commercial fields to unauthenticated callers

> ⚠ DO NOT RUN — 2027+ hypothesis not validated

**Given:** A public scorecard page is deployed; stat aggregates are computed server-side via a DB view (`scorecard_aggregates_v`)

**When:** An unauthenticated visitor views the public scorecard

**Then:**
- The page renders computed aggregates only (D30 mean, PCR pass rate, batch count)
- No raw `pcr_results` rows, customer names, LTV figures, or pricing data are exposed in the page source or Network responses
- No client-side Supabase calls are made by the page (all data is server-rendered)

**Verification:**
```bash
# ⚠ DO NOT RUN
pnpm vitest run tests/scorecard/public.test.ts -t "aggregates exclude commercial fields"
```
Or: Manual — `USE_MOCK=false`. Open the public page; use browser DevTools → Network tab; confirm no Supabase REST calls are initiated from the client and no raw row data appears in responses.

**Pass/Fail:** PASS if no raw commercial fields appear in page source or client network calls. FAIL if any `pcr_results` row data, customer LTV, or pricing information is visible to an unauthenticated caller.

---
