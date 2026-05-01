# MATRIX — Master Work Breakdown

Every story from `product-spec/03-user-stories.md` decomposed into `implement / test / verify` subtasks, with verified status against the codebase as of **2026-04-29**.

**Status rolls UP from children:** parent story takes the lowest of `.i`, `.t`, `.v` (❌ < 🟡 < ✅). Don't mark a parent ✅ until all three are ✅.

**See `README.md`** for status legend, owner-assignment workflow, and how to update this file when a status changes.

---

## At-a-glance summary (parent rows only)

| ID  | Title                                       | Phase | Epic        | JTBD       | Personas    | Status | §06   |
|-----|---------------------------------------------|-------|-------------|------------|-------------|--------|-------|
| A1  | Sign up & create workspace                  | H1    | Onboarding  | J4         | P1          | 🟡     | P0.1  |
| A2  | Invite team members                         | H1    | Onboarding  | J4         | P1          | 🟡     | P1.5/6|
| A3  | Set up hatchery profile                     | H1    | Onboarding  | J4         | P1          | ❌     | P0.5  |
| B1  | See all customers at a glance               | H1    | Customers   | J1         | P3          | 🟡     | —     |
| B2  | Add a new customer                          | H1    | Customers   | J1         | P3          | 🟡     | P1.2  |
| B3  | View customer detail & history              | H1    | Customers   | J1, J2     | P1          | 🟡     | P1.2/3|
| B4  | Schedule a callback                         | H2    | Customers   | J1         | P3          | 🟡     | P2.6  |
| C1  | Register a new batch                        | H1    | Batches     | J2         | P2, P4      | 🟡     | P1.4  |
| C2  | Browse and review batches                   | H1    | Batches     | J2         | P5          | 🟡     | —     |
| C3  | View batch detail with distribution         | H1    | Batches     | J2, J3     | P2          | 🟡     | P1.4  |
| C4  | Print or send PCR certificate               | H1    | Batches     | J3         | P2          | 🟡     | P1.8  |
| D1  | See farms by restock urgency                | H1    | Restock     | J1         | P3          | 🟡     | P2.8  |
| D2  | Send a quote in one tap                     | H1    | Restock     | J1         | P3          | 🟡     | P1.7  |
| D3  | Broadcast to a restock cohort               | H2    | Restock     | J1         | P1          | 🟡     | P2.5  |
| E1  | See active alerts                           | H1    | Alerts      | J2         | P1          | 🟡     | —     |
| E2  | Auto-create alerts from farm-side D30 dips  | H2    | Alerts      | J2         | P2          | ❌     | P2.4  |
| E3  | Close an alert                              | H1    | Alerts      | J2         | P1          | 🟡     | —     |
| E4  | Notify affected farms                       | H2    | Alerts      | J2         | P1          | 🟡     | —     |
| F1  | Toggle scorecard visibility                 | H1    | Scorecard   | J3         | P1          | 🟡     | —     |
| F2  | Public scorecard page                       | H2    | Scorecard   | J3, J5     | P6          | ❌     | P2.1  |
| F3  | Scorecard PDF / send via LINE               | H2    | Scorecard   | J3         | P1          | 🟡     | —     |
| F4  | Public scorecard ISR + SEO                  | H2    | Scorecard   | J5         | P1          | ❌     | P2.1b |
| G1  | Bind customer LINE account                  | H1    | LINE        | J1, J2, J3 | P3          | 🟡     | P1.9  |
| G2  | Send one-off LINE message                   | H1    | LINE        | J1, J2     | P3          | 🟡     | P0.2  |
| G3' | Send-only Flex messaging (worker + queue)   | H1    | LINE        | J1, J2, J3 | P3          | ❌     | P0.2  |
| G4  | Cron-driven template pushes                 | H2    | LINE        | J1         | P1          | ❌     | P2.3  |
| G3  | Two-way chat in LIFF inbox                  | H3    | LINE        | J4         | P6          | 🚫     | P3.1  |
| H1  | Edit notification preferences               | H1    | Settings    | J4         | all         | 🟡     | P1.10 |
| H2  | Export customer / PCR data                  | H2    | Settings    | J4         | P5          | ❌     | P2.7  |
| H3  | Subscribe / manage billing                  | H1    | Settings    | J4         | P1          | 🟡     | P0.4  |
| H4  | Quiet hours respected at delivery           | H1    | Settings    | J1         | P1          | ❌     | P1.11 |
| X1  | Dead-letter retry / escalate UI             | H2    | Ops         | J4         | P1          | ❌     | P2.11 |

> **Drift flag — H1 stories not yet at ✅:** Of the 19 H1 parents above, **0 are fully ✅**. Mock layer gives the illusion of completion for B1, D1, E1, E3, F1, H1 but every one of those needs a Supabase swap + RLS audit (P0.3) before it can be marked ✅. Reflect this in sprint planning.

> **Drift flag — schema vs spec roles: ✅ RESOLVED** (2026-04-29). Migration `007_roles_reconcile.sql` renamed the enum to `(owner, counter_staff, lab_tech, auditor)` per spec. `lib/database.types.ts`, `lib/rbac.ts`, `lib/types.ts`, `lib/mock/data.ts`, `components/modals/invite-team-modal.tsx` updated. Per-value mapping: admin/editor → counter_staff, viewer → auditor, technician → lab_tech. Permission semantics preserved (RLS that admitted 'admin' now admits 'counter_staff'); tightening to owner-only on team/billing per `08-roles-and-rls.md` is in `lib/rbac.ts` already; equivalent RLS tightening tracked under H3 / A2 stories.

> **Drift flag — trial period: ✅ RESOLVED** (2026-04-29). 30-day trial chosen as canonical (matches `004_billing.sql:5`, `README.md`, `00-overview.md`). `03-user-stories.md` §A1 AC updated from 14-day → 30-day; A1 AC also corrected from role `admin` → role `owner`.

---

## Detailed story blocks

### A1 · Sign up and create a hatchery workspace · 🟡

**Phase** H1 · **Epic** Onboarding · **JTBD** J4 · **FR-IDs** FR-AUTH-001, FR-WS-001, FR-AUTH-003 · **Personas** P1 (Owner) · **§06 P0.1**

**AC** (from `03-user-stories.md` §A1):
- Email entered on `/login` → magic link sent via Supabase Auth
- Click link → `/auth/callback` exchanges code → redirect to `/{locale}`
- First-ever sign-in for the email creates `hatcheries` row + `hatchery_members` row (role `owner`) + 30-day Stripe trial subscription
- Subsequent sign-ins land directly on dashboard

| Sub | Task | Status | Owner | Est | Blocked-by | Code refs |
|-----|------|--------|-------|-----|------------|-----------|
| .i  | ✅ Landed in commit `56a9492` (worker-auth). `lib/auth/bootstrap.ts` is idempotent (checks `hatchery_members` membership first); `app/auth/callback/route.ts` calls it after `exchangeCodeForSession`. Uses the existing `create_hatchery` RPC for atomicity. Mock-mode no-op added in `04d025e`. | ✅ | | — | — | `app/auth/callback/route.ts`, `lib/auth/bootstrap.ts`, `lib/utils/mock-mode.ts` |
| .t  | ✅ Landed in commit `56a9492`. `tests/auth/bootstrap.test.ts` covers idempotency + new-user bootstrap. Cross-tenant RLS test still pending (rolls into P0.3). | 🟡 | | 0.25d | — | `tests/auth/bootstrap.test.ts`, future RLS test |
| .v  | Walk through sign-up → workspace creation against live Supabase. Confirm trial deadline, owner membership, default settings rows are created via `create_hatchery` RPC. | ❌ | | 0.5d | A1.i | live `pnpm dev` w/ `USE_MOCK=false` |

**Today.** Implementation complete (commit `56a9492`); live Supabase project provisioned in `0b4a112` (migrations 001–011 + storage bucket applied via MCP). Ready for `.v` walkthrough — set live env vars in `.env.local` and run sign-up flow.

---

### A2 · Invite team members · 🟡

**Phase** H1 · **Epic** Onboarding · **JTBD** J4 · **FR-IDs** FR-TEAM-001, FR-TEAM-002, FR-TEAM-003 · **Personas** P1 · **§06 P1.5, P1.6**

**AC:**
- "+ เชิญสมาชิก" opens `invite` modal; fields: email, role (owner / counter_staff / lab_tech / auditor), display name
- Submit creates `team_invites` row with 7-day token; sends email
- Recipient clicks link → magic-link sign-in → joined as `hatchery_members` with chosen role
- Invite modal shows pending invites with Resend / Revoke

| Sub | Task | Status | Owner | Est | Blocked-by | Code refs |
|-----|------|--------|-------|-----|------------|-----------|
| .i  | ✅ Landed in commit `56a9492` (worker-team). Role enum reconciled in `0fa4489` (migration 007). Migration 008 creates `team_invites` (owner-only RLS). Server action validates email + role + caller-is-owner, inserts row with hex token, calls `admin.inviteUserByEmail` if service-role key present, otherwise dev-mode console log. Acceptance route at `/auth/accept-invite?token=` upserts membership and redirects. Modal submit wired with `useTransition`. RLS tightened to owner-only in `18d4d9e` (migration 011). | ✅ | | — | A1.i ✅ | `supabase/migrations/008_team_invites.sql`, `supabase/migrations/011_rls_tighten.sql`, `app/[locale]/(dashboard)/settings/team/actions.ts`, `app/auth/accept-invite/route.ts`, `components/modals/invite-team-modal.tsx` |
| .t  | ✅ Landed in commit `56a9492`. `tests/team/invite.test.ts` — 7 cases: invalid email/role, valid invite path, token shape, non-owner blocked, 7-day expiry, accepted-already, expired. | 🟡 | | 0.25d | — | `tests/team/invite.test.ts`, future RLS cross-tenant test |
| .v  | Pending — needs email service (Supabase Admin or Resend) configured. | ❌ | | 0.5d | A2.i + email config | live |

**Today.** Implementation + tests complete (commit `56a9492`). Settings → Team list now reads from `hatchery_members` join when not in mock mode (gated). Awaiting live email service to verify end-to-end.

---

### A3 · Set up the hatchery profile · ❌

**Phase** H1 · **Epic** Onboarding · **JTBD** J4 · **FR-IDs** FR-WS-002 · **Personas** P1 · **§06 P0.5**

**AC:**
- Settings → Profile inputs become controlled with `useState`
- "บันทึก" calls `updateProfile()` and shows toast
- Logo upload sends file to Supabase Storage `hatchery-logos/`, writes URL to `hatchery_brand.logo_url`
- Display name (TH/EN) + brand color picker persist
- Brand fields propagate to Flex Message templates

| Sub | Task | Status | Owner | Est | Blocked-by | Code refs |
|-----|------|--------|-------|-----|------------|-----------|
| .i  | ✅ Landed in commit `56a9492` (worker-auth). Profile inputs controlled with `useState`; `updateProfile()` server action upserts to `hatcheries` + `hatchery_brand`. Logo upload via `lib/supabase/storage.ts` `uploadHatcheryLogo()` with MIME validation. Mock-mode short-circuit added in `04d025e`. | ✅ | | — | A1.i ✅ | `app/[locale]/(dashboard)/settings/page.tsx`, `app/[locale]/(dashboard)/settings/actions.ts`, `lib/supabase/storage.ts` |
| .t  | ✅ Landed in commit `56a9492`. `tests/settings/profile.test.ts` — 3 cases. RLS test deferred to P0.3. | 🟡 | | 0.25d | — | `tests/settings/profile.test.ts`, future RLS test |
| .v  | Walk through Settings → upload logo → render. Confirm path layout `{hatchery_id}/logo.{ext}` and that public URL is accessible. | ❌ | | 0.25d | A3.i | live |

**Today.** Implementation + tests complete (commit `56a9492`). `hatchery-logos` bucket (public, 2 MB, image MIME) + tenant-scoped RLS landed in migration `012_storage_logos.sql` / commit `0b4a112`. Ready for `.v` walkthrough.

---

### B1 · See all customers at a glance · 🟡

**Phase** H1 · **Epic** Customers · **JTBD** J1 · **FR-IDs** FR-CUST-001, FR-CUST-004 · **Personas** P3 (Rep)

**AC:**
- `/customers` lists all this hatchery's customers (RLS-enforced)
- Search filters by farm / farmEn / name (case-insensitive)
- Tabs: All / Active / Restock (≤14d) / Concern
- Card click → detail; 💬 → sendLine modal

| Sub | Task | Status | Owner | Est | Blocked-by | Code refs |
|-----|------|--------|-------|-----|------------|-----------|
| .i  | ✅ Replaced `customer_cycles!inner` with a left join at `lib/api/supabase.ts:104–122`; customers without a cycle row are no longer silently dropped (commit `ddf6ea3`). | ✅ | | 0.25d | — | `app/[locale]/(dashboard)/customers/page.tsx`, `lib/api/supabase.ts:104–121` `listCustomers`, `lib/mock/api.ts` `listCustomers` |
| .t  | ✅ Regression test added at `tests/api/list-customers.test.ts` (commit `ddf6ea3`): asserts no `!inner` in the select string AND a customer with empty `customer_cycles` array is returned with all cycle fields null. RLS cross-tenant test still pending (covered by P0.3 cross-cutting work). | 🟡 | | 0.25d | B1.i | `tests/api/list-customers.test.ts`, future RLS test |
| .v  | Manual: switch `USE_MOCK=false`, log in, see RLS-scoped list; search; tab filters. | ❌ | | 0.25d | B1.i | live |

**Today.** Fully wired against mock (see `02-feature-inventory.md` §Page 2). **Bug fixed 2026-04-29 (commit `ddf6ea3`):** `lib/api/supabase.ts` listCustomers now left-joins `customer_cycles` — customers without a cycle row are returned. Vitest regression covers both the query shape and the result shape. Parent stays 🟡 until the cross-tenant RLS test (`.t`) and live verification (`.v`) land.

---

### B2 · Add a new customer · 🟡

**Phase** H1 · **Epic** Customers · **JTBD** J1 · **FR-IDs** FR-CUST-001 · **Personas** P3 · **§06 P1.2**

**AC:**
- Modal fields: Farm (TH), Owner, Phone, Zone (province dropdown), interested package
- Required: farm, owner, zone
- On submit: insert `customers`, set `status='active'`, generate slug
- Optimistic update + Thai toast; new customer appears at top

| Sub | Task | Status | Owner | Est | Blocked-by | Code refs |
|-----|------|--------|-------|-----|------------|-----------|
| .i  | ✅ Landed in commit `56a9492` (worker-data). Migration 009 adds `package_interest text` (nullable). `addCustomer()` in `lib/api/supabase.ts` now maps `input.plan` → `package_interest` in the insert payload. Other modal fields (phone, zone, farm_en) were already in 001_init schema. | ✅ | | — | — | `supabase/migrations/009_customer_fields.sql`, `lib/api/supabase.ts` `addCustomer`, `lib/database.types.ts` |
| .t  | ✅ Landed in commit `56a9492`. `tests/api/add-customer.test.ts` — 2 cases (plan persisted, nullable when omitted). | 🟡 | | 0.25d | — | `tests/api/add-customer.test.ts`, future required-field test |
| .v  | Walk through Customers → New → submit. Confirm row lands in `customers` table with `package_interest`, hatchery scoping, RLS on read. | ❌ | | 0.25d | B2.i | live |

**Today.** Implementation + tests complete (commit `56a9492`). Schema migration 009 applied to live project in `0b4a112`. Ready for `.v` walkthrough.

---

### B3 · View customer detail and history · 🟡

**Phase** H1 · **Epic** Customers · **JTBD** J1, J2 · **FR-IDs** FR-CUST-001, FR-CUST-002, FR-CUST-003 · **Personas** P1 · **§06 P1.2, P1.3**

**AC:**
- Header: avatar, farm name, owner, zone, status chips
- Stats: total batches, LTV, last D30, restock-in days
- D30 trend = real series from last 6 cycles (not synthetic)
- Contact: real `phone`, `lineId`, `address`
- Batch history: rows from `batch_distributions` joined with batches

| Sub | Task | Status | Owner | Est | Blocked-by | Code refs |
|-----|------|--------|-------|-----|------------|-----------|
| .i  | Migration: `customer_cycles(customer_id, batch_id, started_at, d30, d60, harvest)`, `batch_distributions(batch_id, customer_id, quantity, sold_at)`. Replace hardcoded contact + history blocks with reads from new tables. Compute D30 sparkline series from `customer_cycles` last 6 rows. | ❌ | | 1.5d | B2.i | new migration, `app/[locale]/(dashboard)/customers/[id]/page.tsx`, `lib/api/supabase.ts` `getCustomer` |
| .t  | Vitest: customer with 0 cycles shows empty sparkline state. RLS scopes `customer_cycles` reads. Batch history join correct for multi-batch customer. | ❌ | | 0.5d | B3.i | `tests/customers/detail.test.ts` |
| .v  | Manual: walk a customer with history; confirm D30 trend matches DB; bad customer ID 404s. | ❌ | | 0.25d | B3.i | live |

**Today.** Header + 4 stat cards wired ✅. Sparkline is synthetic (`[d30-3, d30+2, ...]`). Phone, LINE ID, address are hardcoded literals. Batch history table is hardcoded `CUSTOMERS.slice(0, b.farms)`.

---

### B4 · Schedule a callback · 🟡

**Phase** H2 · **Epic** Customers · **JTBD** J1 · **FR-IDs** *(no explicit; implied by FR-CUST-* and customer workflows)* · **Personas** P3 · **§06 P2.6**

**AC:**
- "นัดโทร" opens `schedule` modal; fields: date, time, note, channel (call / LINE)
- Insert `customer_callbacks` row tagged to current user
- Visible in customer detail "Upcoming" + Inbox view
- Notification queued for the day-of

| Sub | Task | Status | Owner | Est | Blocked-by | Code refs |
|-----|------|--------|-------|-----|------------|-----------|
| .i  | Migration: `customer_callbacks(id, hatchery_id, customer_id, scheduled_for, channel, note, created_by, completed_at)`. Server action `scheduleCallback()`. Wire `schedule-modal.tsx` submit. Render Upcoming section in customer detail. | ❌ | | 1d  | B3.i | new migration, new `actions.ts`, `components/modals/schedule-modal.tsx`, `app/[locale]/(dashboard)/customers/[id]/page.tsx` |
| .t  | Vitest: past date rejected. RLS: counter_staff can insert; only owner of the row can mark completed. | ❌ | | 0.5d | B4.i | `tests/customers/callback.test.ts` |
| .v  | Manual: schedule a callback for tomorrow; appears in Upcoming; mark completed. | ❌ | | 0.25d | B4.i | live |

**Today.** `components/modals/schedule-modal.tsx` opens (verified). No submit handler. `customer_callbacks` table does not exist.

---

### C1 · Register a new batch · 🟡

**Phase** H1 · **Epic** Batches · **JTBD** J2 · **FR-IDs** FR-BATCH-001, FR-BATCH-002 · **Personas** P2 (Manager), P4 (Lab) · **§06 P1.4**

**AC:**
- 3-step wizard: batch info → PCR upload → confirm
- Step 1: source strain, spawn date, PL count
- Step 2: drop PDF/JPG/PNG → uploaded to `pcr-reports/{batch_id}/`; OCR-or-form per-disease results
- Step 3: confirmation summary, register button
- Insert `batches` + `batch_pcr_tests` (one row per disease)

| Sub | Task | Status | Owner | Est | Blocked-by | Code refs |
|-----|------|--------|-------|-----|------------|-----------|
| .i  | Migration: `batch_pcr_tests(batch_id, disease, result, lab, tested_at, file_url)`. Storage bucket `pcr-reports/`. Wire step 2 file upload to Storage. Replace hardcoded "✓ ผ่าน" results with real per-disease capture form. Server action `addBatch()` writes both tables atomically. Strain dropdown: read from `prices` table (or new `strains` table). | ❌ | | 2d  | A1.i | new migration, `components/modals/add-batch-modal.tsx`, new `app/[locale]/(dashboard)/batches/actions.ts`, `lib/supabase/storage.ts` |
| .t  | Vitest: missing PCR file rejected. Atomic rollback if `batch_pcr_tests` insert fails. RLS: counter_staff inserts batch (no PCR), lab_tech inserts PCR rows, owner can do both. | ❌ | | 1d  | C1.i | `tests/batches/register.test.ts` |
| .v  | Manual: complete wizard end-to-end with real PCR PDF; verify rows in both tables; cert generation becomes available (C4). | ❌ | | 0.5d | C1.i, C4.i | live |

**Today.** UI wizard works against mock ✅. Step 2 PCR upload UI exists but is fake — 4 disease results hardcoded as ✓ผ่าน. Mock submission hardcodes `pcr: 'pending'`.

---

### C2 · Browse and review batches · 🟡

**Phase** H1 · **Epic** Batches · **JTBD** J2 · **Personas** P5 (Auditor)

**AC:**
- `/batches` shows all batches newest first
- Card: ID, date, source, PCR chip, produced PL, buyer count, mean D30
- Filter chips: PCR status, source strain, year
- Auditor sees no commercial fields (LTV, prices)

| Sub | Task | Status | Owner | Est | Blocked-by | Code refs |
|-----|------|--------|-------|-----|------------|-----------|
| .i  | Add filter chips bound to URL query state. Add field-level RLS view for `auditor` role hiding LTV/prices. | 🟡 | | 1d  | C1.i | `app/[locale]/(dashboard)/batches/page.tsx`, new SECURITY INVOKER view in migration |
| .t  | Vitest: filter chip selection updates URL + refetches. RLS: `auditor` SELECT returns rows but null for `unit_price`. | ❌ | | 0.5d | C2.i | `tests/batches/list.test.ts` |
| .v  | Manual: log in as `auditor` user; confirm commercial fields blank but PCR visible. | ❌ | | 0.25d | C2.i, A2.i | live |

**Today.** Two-column grid wired ✅. No filter or search. Auditor role not yet implemented in UI (reserved in spec; in current schema role enum = `('owner','admin','editor','viewer','technician')` — DRIFT).

---

### C3 · View batch detail with distribution · 🟡

**Phase** H1 · **Epic** Batches · **JTBD** J2, J3 · **FR-IDs** FR-BATCH-001, FR-BATCH-002, FR-BATCH-003 · **Personas** P2 · **§06 P1.4**

**AC:**
- Header: batch ID, PCR chip, spawn date, source
- Stats: produced, sold, buyer count, mean D30
- D30 distribution: 10 bins, real data from buyer cycles
- PCR section: 4 disease rows with pass/fail, lab, test date
- Buyers table: real `batch_distributions` join

| Sub | Task | Status | Owner | Est | Blocked-by | Code refs |
|-----|------|--------|-------|-----|------------|-----------|
| .i  | Replace hardcoded buyers table with `batch_distributions` query. Replace hardcoded PCR section + disease names with `batch_pcr_tests` query. Replace "DOFR" lab label with `batch_pcr_tests.lab`. Compute mean D30 from `customer_cycles`. | ❌ | | 1d  | C1.i, B3.i | `app/[locale]/(dashboard)/batches/[id]/page.tsx`, `lib/api/supabase.ts` `getBatch` |
| .t  | Vitest: mean D30 correct for batch with mixed-D30 buyers. PCR table renders no rows when no `batch_pcr_tests`. | ❌ | | 0.5d | C3.i | `tests/batches/detail.test.ts` |
| .v  | Manual: pick a batch; buyers table matches DB; PCR rows match per-disease results. | ❌ | | 0.25d | C3.i | live |

**Today.** Stats wired ✅. PCR section partially real 🟡 (test date real but lab "DOFR" hardcoded; flag logic only fires on EHP). Buyers table synthetic ❌.

---

### C4 · Print or send a PCR certificate · 🟡

**Phase** H1 · **Epic** Batches · **JTBD** J3 · **FR-IDs** FR-BATCH-004 · **Personas** P2 · **§06 P1.8**

**AC:**
- "พิมพ์ใบรับรอง" → server-side PDF render → download
- "ส่งใบรับรอง LINE" opens `cert` modal listing buyers → submit pushes `pcr_certificate` Flex
- PDF generation server-side (`@react-pdf/renderer` or Puppeteer)
- Cert URLs stored in `batch_certs` table for re-download
- Brand-tier voice: Plus Jakarta + Noto Sans Thai, no emojis (`07-brand-and-voice.md`)

| Sub | Task | Status | Owner | Est | Blocked-by | Code refs |
|-----|------|--------|-------|-----|------------|-----------|
| .i  | Server action `generatePcrCertPdf(batchId)` rendering brand-tier PDF. Storage bucket `pcr-certificates/{batch_id}/`. Server action `sendCertificate(batchId, customerIds)` enqueues Flex per recipient. Migration: `batch_certs(id, batch_id, pdf_url, generated_at)`. Wire `cert-modal.tsx` submit. | ❌ | | 2d  | C1.i, G3'.i, G1.i | new actions, `components/modals/cert-modal.tsx`, new migration, `lib/pdf/cert.tsx` |
| .t  | Vitest: PDF byte snapshot for canonical batch. Idempotency on `(batch_id, customer_id)` Flex enqueue. | ❌ | | 1d  | C4.i | `tests/batches/cert.test.ts` |
| .v  | Manual: print cert; open PDF; check brand-tier typography. Send via LINE; receiver sees Flex with hatchery brand. | ❌ | | 0.5d | C4.i, G3'.v | live |

**Today.** Print is toast-only 🟡. Cert modal opens ✅ (verified) but no submission. No PDF code path.

---

### D1 · See farms by restock urgency · 🟡

**Phase** H1 · **Epic** Restock · **JTBD** J1 · **Personas** P3 · **§06 P2.8**

**AC:**
- `/restock` lists customers where `restockIn != null`
- Groups: now (≤0d), week (≤14d), month (≤45d), later
- Stat cards aggregate counts + estimated PL volume per group
- Group thresholds configurable per hatchery (Settings)

| Sub | Task | Status | Owner | Est | Blocked-by | Code refs |
|-----|------|--------|-------|-----|------------|-----------|
| .i  | ✅ Landed in commit `efec382` (worker-cross). Migration 010 adds `restock_thresholds jsonb` (default `{"now":0,"week":14,"month":45}`) to hatcheries. `getHatchery()` returns thresholds; `lib/types.ts` Hatchery includes them; `restock/page.tsx` reads via `useQuery` and applies. Settings UI to edit thresholds is a follow-up. | ✅ | | — | — | `supabase/migrations/010_restock_thresholds.sql`, `lib/types.ts`, `lib/api/supabase.ts` `getHatchery`, `app/[locale]/(dashboard)/restock/page.tsx`, `lib/mock/data.ts` |
| .t  | ✅ Landed in commit `efec382`. `tests/restock/threshold.test.ts` — 5 cases (default + custom thresholds). | ✅ | | — | — | `tests/restock/threshold.test.ts` |
| .v  | Walk through restock page against live thresholds. Confirm bucketing matches `restock_thresholds` jsonb. | ❌ | | 0.25d | D1.i | live |
| —   | **Follow-up:** add Settings UI for editing thresholds (form posts to a new `updateRestockThresholds()` server action). Not in this pilot. | ❌ | | 0.5d | D1.i ✅ | new server action + Settings tab UI |

**Today.** Implementation + tests complete (commit `efec382`). Data path threaded through; UI to edit thresholds remains a follow-up.

---

### D2 · Send a quote in one tap · 🟡

**Phase** H1 · **Epic** Restock · **JTBD** J1 · **FR-IDs** FR-QUOTE-001, FR-QUOTE-002, FR-QUOTE-003, FR-LINE-001, FR-LINE-002 · **Personas** P3 · **§06 P1.7**

**AC:**
- `quote` modal pre-filled with customer's last package, current `prices`, lead time
- Rep edits line items + adds note
- Submit emits `quote` Flex template to outbound queue
- Farmer receives Flex with "ตอบรับ" → opens LIFF chat
- Quote stored in `quotes(id, hatchery_id, customer_id, items jsonb, status, valid_until, sent_at, decided_at)`
- Visible on customer detail "Quotes" tab

| Sub | Task | Status | Owner | Est | Blocked-by | Code refs |
|-----|------|--------|-------|-----|------------|-----------|
| .i  | Migration: `quotes` + `prices` tables. Server action `sendQuote()` inserts row + enqueues `line_outbound_events`. Wire `quote-modal.tsx` submit. Add Quotes tab to customer detail. | ❌ | | 2d  | G3'.i, G1.i | new migration, new actions, `components/modals/quote-modal.tsx`, `app/[locale]/(dashboard)/customers/[id]/page.tsx` |
| .t  | Vitest: quote line-item validation. Idempotency: same quote sent twice does not duplicate Flex. Status transitions sent → accepted/declined/expired. | ❌ | | 1d  | D2.i | `tests/restock/quote.test.ts` |
| .v  | Manual: send quote; verify Flex arrives at farmer LINE with hatchery brand; "ตอบรับ" button works. | ❌ | | 0.5d | D2.i, G1.v | live |

**Today.** `components/modals/quote-modal.tsx` opens ✅ (verified). No submission. `quotes` and `prices` tables do not exist.

---

### D3 · Broadcast to a restock cohort · 🟡

**Phase** H2 · **Epic** Restock · **JTBD** J1 · **FR-IDs** FR-LINE-001, FR-LINE-002 · **Personas** P1 · **§06 P2.5**

**AC:**
- "ส่งข้อความหาทุกคน" opens confirmation showing affected farms count
- Template selector: restock_reminder / new_batch_announcement / promo
- Submit fans out — one row per recipient — into `line_outbound_events` (idempotent on `(customer_id, template, cycle_id)`)
- Confirmation toast "ส่งถึง 14 ฟาร์ม"

| Sub | Task | Status | Owner | Est | Blocked-by | Code refs |
|-----|------|--------|-------|-----|------------|-----------|
| .i  | Server action `broadcastToFarms(filterId, template, payload)` that inserts N rows to `line_outbound_events`. Confirmation dialog with count. Idempotency index already in migration 006 ✅. | ❌ | | 1d  | G3'.i | new actions, `app/[locale]/(dashboard)/restock/page.tsx` |
| .t  | Vitest: idempotency (re-broadcast does not create duplicate `line_outbound_events`). Count-confirmation matches actual recipients. | ❌ | | 0.5d | D3.i | `tests/restock/broadcast.test.ts` |
| .v  | Manual: broadcast to 3 test customers; confirm 3 events queued; bot worker delivers all 3. | ❌ | | 0.25d | D3.i | live |

**Today.** Toast-only 🟡. No fan-out logic.

---

### E1 · See active alerts · 🟡

**Phase** H1 · **Epic** Alerts · **JTBD** J2 · **Personas** P1

**AC:**
- `/alerts` shows all `closed=false` alerts, sorted by `sev DESC, date DESC`
- Severity stat cards: high / medium / low counts
- Each alert: severity icon, batch link, affected farms, recommended action

| Sub | Task | Status | Owner | Est | Blocked-by | Code refs |
|-----|------|--------|-------|-----|------------|-----------|
| .i  | ✅ Added `.order('sev', {ascending:false})` before `.order('created_at', ...)` at `lib/api/supabase.ts:168–172` (commit `ddf6ea3`). High-severity alerts now surface first regardless of recency. | ✅ | | 0.25d | — | `app/[locale]/(dashboard)/alerts/page.tsx`, `lib/api/supabase.ts:162–189` `listAlerts` |
| .t  | ✅ Regression test added at `tests/api/list-alerts.test.ts` (commit `ddf6ea3`): asserts the `.order()` chain calls sev first then created_at, both descending. RLS cross-tenant test still pending (covered by P0.3 cross-cutting work). | 🟡 | | 0.25d | E1.i | `tests/api/list-alerts.test.ts`, future RLS test |
| .v  | Manual against live DB: confirm count matches mock seed; high-severity alert created yesterday surfaces above low-severity alert created today. | ❌ | | 0.25d | E1.i | live |

**Today.** Wired against Supabase ✅ (data fetch + render). **Bug fixed 2026-04-29 (commit `ddf6ea3`):** severity sort added; high alerts now surface above medium/low regardless of date. Vitest regression test asserts the exact `.order()` chain. Parent stays 🟡 until cross-tenant RLS test (`.t`) and live verification (`.v`) land.

---

### E2 · Auto-create alerts from farm-side D30 dips · ❌

**Phase** H2 · **Epic** Alerts · **JTBD** J2 · **FR-IDs** FR-NOTIF-003 · **Personas** P2 · **§06 P2.4**

**AC:**
- Cron / trigger watches `farm_cycle_metrics.d30` rows from farm-side AquaWise app
- ≥2 farms with same source `batch_id` reporting D30 < 70% → alert sev medium, action "ตรวจสอบล็อต"
- ≥3 farms or D30 < 60% → sev high
- De-dup via partial unique on `(batch_id, alert_kind, week)`

| Sub | Task | Status | Owner | Est | Blocked-by | Code refs |
|-----|------|--------|-------|-----|------------|-----------|
| .i  | Cross-service coordination first: confirm farm-side schema for `farm_cycle_metrics`, write cadence, RLS scope. Then: Postgres trigger or scheduled function creating `alerts` rows on threshold breach. Notification respects `notification_settings`. | ❌ | | 2d  | (cross-service) | new migration `00X_d30_trigger.sql`, requires farm-side `farm_cycle_metrics` |
| .t  | Vitest: 1 farm dip → no alert. 2 farms dip → medium. 3 farms dip → high. Same dip twice in same week → no duplicate. | ❌ | | 0.5d | E2.i | `tests/alerts/auto.test.ts` |
| .v  | Live: simulate 2-farm dip on staging; alert appears within trigger latency. | ❌ | | 0.5d | E2.i | live |

**Today.** Alert *reading* wired ✅. Alert *creation* not implemented. Trigger requires `farm_cycle_metrics` from farm-side product team — coordinate before sprint commit.

---

### E3 · Close an alert · 🟡

**Phase** H1 · **Epic** Alerts · **JTBD** J2 · **Personas** P1

**AC:**
- "ปิดเคส" opens `closeAlert` modal with resolution note + multi-select follow-up actions
- Submit calls `closeAlert(id, note, actions)` → sets `closed=true`, appends `alert_resolutions` row, optionally fires follow-up Flex

| Sub | Task | Status | Owner | Est | Blocked-by | Code refs |
|-----|------|--------|-------|-----|------------|-----------|
| .i  | Migration: `alert_resolutions(alert_id, note, actions jsonb, closed_by, closed_at)`. Extend `closeAlert` action to take note + actions + optional Flex enqueue. Wire `close-alert-modal.tsx` submit fully (currently flips boolean only). | 🟡 | | 1d  | G3'.i | new migration, `components/modals/close-alert-modal.tsx`, `lib/api/supabase.ts` `closeAlert` |
| .t  | Vitest: closing without note rejected. Follow-up Flex enqueued only if checkbox set. | ❌ | | 0.5d | E3.i | `tests/alerts/close.test.ts` |
| .v  | Manual: close an alert; alert disappears; optional Flex received by farmer. | ❌ | | 0.25d | E3.i, E4.v | live |

**Today.** `closeAlert(id)` mutation exists and flips boolean ✅. `close-alert-modal.tsx` exists (verified) but submission only takes the id, not the note/actions. **Verifier finding (V3):** the modal at `close-alert-modal.tsx:11–16,52–61` uses a single-select `<select>` dropdown over four fixed `REASONS`, not the multi-select follow-up actions the AC specifies. The note `<textarea>` at line 65–70 is uncontrolled (no `useState`/`ref`), so its value is decorative-only — a future implementer must wire both controls.

---

### E4 · Notify affected farms · 🟡

**Phase** H2 · **Epic** Alerts · **JTBD** J2 · **FR-IDs** FR-LINE-001, FR-LINE-002 · **Personas** P1

**AC:**
- "ส่งข้อความถึงฟาร์ม" opens template selector (acknowledge / remediation_plan / closure)
- Submit fans out to `line_outbound_events`, idempotent on `(customer_id, alert_id)` (index already in migration 006)

| Sub | Task | Status | Owner | Est | Blocked-by | Code refs |
|-----|------|--------|-------|-----|------------|-----------|
| .i  | Server action `notifyAlertFarms(alertId, template)` enqueueing one row per affected farm. | ❌ | | 0.5d | G3'.i, E3.i | new actions, `app/[locale]/(dashboard)/alerts/page.tsx` |
| .t  | Vitest: idempotency on `(customer_id, alert_id)` partial unique. | ❌ | | 0.25d | E4.i | `tests/alerts/notify.test.ts` |
| .v  | Manual: trigger from alert page; affected farmer receives Flex. | ❌ | | 0.25d | E4.i | live |

**Today.** Toast-only 🟡.

---

### F1 · Toggle scorecard visibility · 🟡

**Phase** H1 · **Epic** Scorecard · **JTBD** J3 · **Personas** P1

**AC:**
- 6 toggles: public, showD30, showPCR, showRetention, showVolume, showReviews
- Optimistic with rollback
- showReviews disabled until reviews schema ships

| Sub | Task | Status | Owner | Est | Blocked-by | Code refs |
|-----|------|--------|-------|-----|------------|-----------|
| .i  | Confirm Supabase path; toggles already work against mock with optimistic + rollback. | ✅ | | 0   | — | `app/[locale]/(dashboard)/scorecard/page.tsx`, `lib/api/supabase.ts` `updateScorecardSettings` |
| .t  | Vitest: optimistic rollback when RLS-denied. Only owner can update. | ❌ | | 0.25d | — | `tests/scorecard/toggle.test.ts` |
| .v  | Manual: flip every toggle; refresh; persists. | ❌ | | 0.25d | — | live |

**Today.** Wired ✅, optimistic + rollback present. **Verifier finding (V3):** `scorecard/page.tsx:276–280` does NOT add a `disabled` prop to `showReviews` despite AC + spec saying it should be gated until reviews schema ships. The toggle persists fine (the column exists), but it lets owners enable a stat with no data behind it. Add `disabled` until reviews schema lands.

---

### F2 · Public scorecard page · ❌

**Phase** H2 · **Epic** Scorecard · **JTBD** J3, J5 · **FR-IDs** FR-PUBLIC-001, FR-PUBLIC-002 · **Personas** P6 (Farmer scanning QR) · **§06 P2.1**

**AC:**
- Public route `/{locale}/h/{slug}` renders scorecard with hatchery brand (logo, color, display names from `hatchery_brand`), only stats the owner enabled
- "Verified by AquaWise" stamp + last-refresh timestamp
- No farmer auth required
- RLS: `hatchery_brand` public-readable WHERE `scorecard_settings.public = true`; aggregates server-computed
- Brand-tier voice (Plus Jakarta + Noto Sans Thai)

| Sub | Task | Status | Owner | Est | Blocked-by | Code refs |
|-----|------|--------|-------|-----|------------|-----------|
| .i  | New route `app/[locale]/h/[slug]/page.tsx`. RLS policies for public read on `hatchery_brand`. Server-computed aggregates view (`scorecard_aggregates_v`). Verified-stamp component. | ❌ | | 2d  | A3.i, F1.i | new route, new RLS migration, new view |
| .t  | Vitest: page returns 404 for `public=false` slug. Aggregates exclude commercial fields. RLS audit confirms unauthenticated request reads only allowed fields. | ❌ | | 1d  | F2.i | `tests/scorecard/public.test.ts` |
| .v  | Manual: open `/th/h/p-pong` in incognito; brand renders; numbers match owner view. | ❌ | | 0.25d | F2.i | live |

**Today.** Page does not exist ❌. Only the editor view at `/scorecard`.

---

### F3 · Generate scorecard PDF / send via LINE · 🟡

**Phase** H2 · **Epic** Scorecard · **JTBD** J3 · **FR-IDs** FR-LINE-001, FR-LINE-002 · **Personas** P1

**AC:**
- "ดาวน์โหลด PDF" → server-side render of scorecard
- "ส่ง LINE" → cohort selector → push scorecard Flex to selected customers via outbound queue

| Sub | Task | Status | Owner | Est | Blocked-by | Code refs |
|-----|------|--------|-------|-----|------------|-----------|
| .i  | Server action `generateScorecardPdf(hatcheryId)`. Cohort selector modal. Server action `broadcastScorecard(cohort)` enqueueing Flex. | ❌ | | 1.5d | G3'.i, F2.i | new actions, `app/[locale]/(dashboard)/scorecard/page.tsx`, `lib/pdf/scorecard.tsx` |
| .t  | Vitest: PDF byte-snapshot. Cohort selector counts match. | ❌ | | 0.5d | F3.i | `tests/scorecard/pdf.test.ts` |
| .v  | Manual: download PDF; share via LINE; farmer cohort receives Flex. | ❌ | | 0.25d | F3.i | live |

**Today.** Both buttons toast-only 🟡.

---

### F4 · Public scorecard ISR + SEO · ❌

**Phase** H2 · **Epic** Scorecard · **JTBD** J5 · **FR-IDs** FR-PUBLIC-003 · **Personas** P1 (acquisition) · **§06 P2.1b**

**AC:**
- ISR `revalidate: 21600` (6h)
- OG image auto-rendered with hatchery name + key stats
- `<meta name="description">` from FR-doc template
- JSON-LD `Organization` schema with verified ratings
- `robots.txt` allows `/h/*`; sitemap from `hatchery_brand WHERE public=true`
- Lighthouse SEO ≥ 95; LCP ≤ 2s on 4G

| Sub | Task | Status | Owner | Est | Blocked-by | Code refs |
|-----|------|--------|-------|-----|------------|-----------|
| .i  | Add `revalidate` + `generateStaticParams`. OG image route `app/[locale]/h/[slug]/opengraph-image.tsx`. JSON-LD in `<head>`. Update `app/robots.txt` + `app/sitemap.ts`. | ❌ | | 1d  | F2.i | new files |
| .t  | Vitest snapshot of OG image for canonical hatchery. CI Lighthouse check ≥ 95 SEO. | ❌ | | 0.5d | F4.i | `tests/scorecard/seo.test.ts` |
| .v  | Manual: paste public URL into FB / LINE; preview card renders. Run Lighthouse. | ❌ | | 0.25d | F4.i | live |

**Today.** Not implemented.

---

### G1 · Bind a customer's LINE account to their CRM record · 🟡

**Phase** H1 · **Epic** LINE · **JTBD** J1, J2, J3 (foundational for all LINE pushes) · **FR-IDs** FR-LINE-004 · **Personas** P3 · **§06 P1.9**

**AC:**
- "Connect LINE" CTA on customer card if `customer.line_id IS NULL`
- Click → server mints `customer_bind_tokens` (26-char ULID, 7-day expiry); returns LIFF link `liff.line.me/{liffId}/bind?token=...`
- Farmer opens LIFF → LINE Login → server consumes token, sets `customers.line_id`, upserts `line_users`, deletes token
- Customer card shows "✓ LINE connected" + last-seen

| Sub | Task | Status | Owner | Est | Blocked-by | Code refs |
|-----|------|--------|-------|-----|------------|-----------|
| .i  | API route `app/api/line/bind/route.ts`: POST mints token; GET consumes token + sets `line_id`. LIFF page `/liff/bind` (in bot service). Customer-card "Connect LINE" CTA. **Sequencing constraint:** must land BEFORE D2/C4/E4/F3/G2 — those need bound `line_id`. | ❌ | | 2d  | A1.i | new `app/api/line/bind/route.ts`, customer card component, LIFF service (separate codebase) |
| .t  | Vitest: token expires at 7d; reuse rejected. RLS: counter_staff mints; service-role consumes. | ❌ | | 1d  | G1.i | `tests/line/bind.test.ts` |
| .v  | Manual: mint link as rep; open in LINE on phone; customer record gets `line_id`; subsequent Flex reaches farmer. | ❌ | | 0.5d | G1.i | live (requires LIFF id provisioned) |

**Today.** Schema migration 006 has `customer_bind_tokens` ✅. LIFF page and `/api/line/bind` route do not exist (verified — `app/api/` only has `webhooks/stripe/`).

---

### G2 · Send a one-off LINE message to a single customer · 🟡

**Phase** H1 · **Epic** LINE · **JTBD** J1, J2 · **FR-IDs** FR-LINE-001, FR-LINE-002, FR-LINE-003 · **Personas** P3 · **§06 P0.2**

**AC:**
- `sendLine` modal lists templates + free-text option
- Submit calls `sendLineEvent(template, payload)` server action → inserts to `line_outbound_events` (status `pending`)
- Bot worker consumes queue, renders Flex with hatchery brand, pushes via @aquawise OA
- Status: `pending → sending → sent` (or `failed → dead`)

| Sub | Task | Status | Owner | Est | Blocked-by | Code refs |
|-----|------|--------|-------|-----|------------|-----------|
| .i  | Server action `sendLineEvent(customerId, template, payload)` inserts row. Wire `send-line-modal.tsx` submit. Optimistic Activity panel insert. | ❌ | | 1d  | G3'.i, G1.i | new actions, `components/modals/send-line-modal.tsx`, customer detail Activity panel |
| .t  | Vitest: malformed template rejected. RLS: counter_staff can insert. Idempotency where applicable. | ❌ | | 0.5d | G2.i | `tests/line/send.test.ts` |
| .v  | Manual: send template to bound customer; receives Flex with brand; status updates in customer Activity. | ❌ | | 0.25d | G2.i, G1.v | live |

**Today.** `components/modals/send-line-modal.tsx` opens ✅ (verified). No submit handler. No `sendLineEvent` server action exists. Bot worker extension missing.

---

### G3' · Send-only Flex messaging (worker + queue) · ❌

**Phase** H1 · **Epic** LINE · **JTBD** J1, J2, J3 · **FR-IDs** FR-LINE-001, FR-LINE-002, FR-LINE-005 · **Personas** P3 · **§06 P0.2**

**AC:**
- Every `sendLine` / `quote` / `cert` / disease-alert / restock-broadcast modal submission inserts to `line_outbound_events` (status `pending`)
- Bot worker consumes queue, renders Flex with `hatchery_brand`, pushes via @aquawise OA
- "เปิดแชท" CTA in Flex points to placeholder LIFF (not the inbox — H3 swaps target)
- Status updates `pending → sending → sent` (or `failed → dead`) visible in customer Activity panel
- No farmer-initiated handling in this phase; replies logged to `line_message_logs` but not surfaced

| Sub | Task | Status | Owner | Est | Blocked-by | Code refs |
|-----|------|--------|-------|-----|------------|-----------|
| .i  | Bot worker extension (existing Cloud Run service): consumer for `line_outbound_events` filtered to hatchery rows. Renders Flex from template + `hatchery_brand`. Pushes via LINE Messaging API. Updates status. Service-role client. **Unblocks: D2, C4, E4, F3, G2.** | ❌ | | 3d  | G1.i, A3.i | bot worker repo (separate); `lib/line/templates/` (Flex templates) |
| .t  | Integration: enqueue test event; worker processes within latency budget; status flips correctly on success and on simulated failure (retry → dead). | ❌ | | 1d  | G3'.i | bot worker test harness |
| .v  | Manual: enqueue 1 event from CRM; bot delivers within 30s; receiver confirms hatchery brand correct. | ❌ | | 0.5d | G3'.i | live (requires LINE OA + worker deploy) |

**Today.** Not implemented — neither in CRM nor in bot worker. Migration 006 has the queue ✅. **Verifier finding (V4):** schema columns + idempotency indexes match the spec exactly (`006_line_integration.sql` lines 43–73). Note: alert-template idempotency is `(customer_id, payload->>'alert_id')` — a JSONB extraction, not a column reference; matches operational pattern but worth knowing if you write SQL queries against it.

**Cross-service dependency** (per `docs/line-integration-strategy.md`):
- The bot worker lives in a separate repo (`aquawise-line-bot`, Cloud Run `asia-southeast1`, min-instances:1). It owns `src/workers/outbound.ts` (new), the LIFF auth middleware, and all LIFF pages. **None of these files are in this CRM repo.**
- Bot service must share the Supabase project with this CRM for Realtime subscription on `line_outbound_events` to work. If the two services use separate Supabase projects today, a project merge or cross-project access plan is a hard prerequisite.
- Env vars `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_CHANNEL_SECRET`, `LIFF_ID` go in the bot service, not the CRM (CRM never calls LINE directly). `.env.example` correctly omits them.

**This is the keystone P0.2 work item — it unblocks 5 downstream stories (D2, C4, E4, F3, G2).**

---

### G4 · Cron-driven template pushes · ❌

**Phase** H2 · **Epic** LINE · **JTBD** J1 · **FR-IDs** FR-NOTIF-002 · **Personas** P1 · **§06 P2.3**

**AC:**
- Daily cron (09:00 ICT) evaluates `customers` where `restock_in ∈ {7, 3, 0}` → enqueues `restock_reminder`
- Daily cron evaluates upcoming harvest windows → enqueues `harvest_window`
- Idempotency via partial unique on `(customer_id, template, cycle_id)` (already in 006)
- Disable per-hatchery via Settings → Notifications

| Sub | Task | Status | Owner | Est | Blocked-by | Code refs |
|-----|------|--------|-------|-----|------------|-----------|
| .i  | Vercel cron `vercel.json` schedule → API route `app/api/cron/daily/route.ts` (CRON_SECRET protected). Inserts into `line_outbound_events` for matching customers. Respects `notification_settings`. | ❌ | | 1d  | G3'.i, H1.i | new `vercel.json` cron entry, new `app/api/cron/daily/route.ts` |
| .t  | Vitest: no duplicate enqueue when cron runs twice in same day. Notification toggle off → no enqueue. | ❌ | | 0.5d | G4.i | `tests/line/cron.test.ts` |
| .v  | Stage: simulate 09:00 trigger; expected restock customers receive Flex within 5 min. | ❌ | | 0.5d | G4.i | live |

**Today.** No cron exists. Idempotency indexes in place ✅.

---

### G3 · Two-way chat in LIFF inbox · 🚫

**Phase** H3 (deferred) · **Epic** LINE · **JTBD** J4 · **Personas** P6 (Farmer) · **§06 P3.1**

**AC** (deferred — full epic out of scope for H1/H2):
- Rich-menu adds "ข้อความของฉัน" → opens LIFF inbox listing every `chat_threads` row for farmer's `line_user_id`
- Tap → 1-on-1 chat view; messages real-time via Supabase Realtime
- CRM "Inbox" panel shows active threads with unread badges
- Typing indicator + read receipts (`chat_read_receipts`)

| Sub | Task | Status | Owner | Est | Blocked-by | Code refs |
|-----|------|--------|-------|-----|------------|-----------|
| .i  | Out of scope. Whole epic = migration 007 (chat tables) + LIFF inbox + LIFF chat thread + CRM `/inbox` panel + nudge logic. Demoted from P2 to P3 per `06`. | 🚫 | | — | — | (deferred) |
| .t  | Out of scope. | 🚫 | | — | — | — |
| .v  | Out of scope. | 🚫 | | — | — | — |

**Today.** Phase H3 placeholder. Do not work on this in H1/H2.

---

### H1 · Edit notification preferences · 🟡

**Phase** H1 · **Epic** Settings · **JTBD** J4 · **FR-IDs** FR-NOTIF-001 · **Personas** all · **§06 P1.10**

**AC:**
- 6 toggles: restock, lowD30, disease, lineReply, weekly, priceMove
- Optimistic; persist to `notification_settings`

| Sub | Task | Status | Owner | Est | Blocked-by | Code refs |
|-----|------|--------|-------|-----|------------|-----------|
| .i  | Toggles already wired ✅. Bot worker / cron must read `notification_settings` at delivery time before pushing — currently nothing reads them. | 🟡 | | 0.5d | G3'.i, G4.i | `app/[locale]/(dashboard)/settings/notification/page.tsx`, bot worker |
| .t  | Vitest: toggle off → enqueue suppressed. RLS: each role can read; only owner can write. | ❌ | | 0.25d | H1.i | `tests/settings/notif.test.ts` |
| .v  | Manual: toggle disease off; trigger an alert; confirm no Flex sent. | ❌ | | 0.25d | H1.i | live |

**Today.** Toggle persistence wired ✅. No delivery-time check.

---

### H2 · Export customer / PCR data · ❌

**Phase** H2 · **Epic** Settings · **JTBD** J4 · **FR-IDs** FR-SEARCH-002, FR-DATA-001, FR-DATA-002 · **Personas** P5 (Auditor) · **§06 P2.7**

**AC:**
- "ดาวน์โหลด CSV" → server action streams CSV of customers (RLS-scoped)
- "ดาวน์โหลด ZIP" → zips all `pcr-reports/*` blobs for this hatchery
- "ดาวน์โหลด" full backup → JSON dump
- Each export logs to `data_exports`

| Sub | Task | Status | Owner | Est | Blocked-by | Code refs |
|-----|------|--------|-------|-----|------------|-----------|
| .i  | Migration: `data_exports(id, hatchery_id, kind, requested_by, file_url, completed_at)`. Server actions: `exportCustomersCsv`, `exportPcrHistoryZip`, `exportFullBackup`. Stream from server (don't load into memory). Use signed URLs for Storage. | ❌ | | 2d  | C1.i | new migration, new actions, `app/[locale]/(dashboard)/settings/page.tsx` Data tab |
| .t  | Vitest: streamed CSV header correct; row count matches RLS-scoped row count. ZIP integrity. | ❌ | | 0.5d | H2.i | `tests/settings/export.test.ts` |
| .v  | Manual: download CSV with 100+ rows; open in Excel; check columns. | ❌ | | 0.25d | H2.i | live |

**Today.** All four buttons no-op ❌.

---

### H3 · Subscribe / manage billing · 🟡

**Phase** H1 · **Epic** Settings · **JTBD** J4 · **FR-IDs** FR-AUTH-002, FR-AUTH-003, FR-BILLING-001 · **Personas** P1 · **§06 P0.4**

**AC:**
- Trial state: days-left + Subscribe CTA → Stripe Checkout
- Active: renewal date + Manage → Stripe Portal
- Past-due: red banner + Update Payment
- Webhook flips subscription state
- **Trial-expired = read-only with banner:** reads work, mutations + LINE pushes return 402; banner says "Subscribe to continue"

| Sub | Task | Status | Owner | Est | Blocked-by | Code refs |
|-----|------|--------|-------|-----|------------|-----------|
| .i  | ✅ Landed in commit `efec382` (worker-cross). `lib/billing/guard.ts` exports `PaywallError` (status 402) and `requireActiveSubscription()`. Reads `MOCK_BILLING_STATE` in mock mode, falls back to `hatcheries.subscription_status` in production. Wired into the two mutation actions added this sprint (updateProfile, inviteTeamMember). Future actions follow the same pattern. | ✅ | | — | — | `lib/billing/guard.ts`, `app/[locale]/(dashboard)/settings/actions.ts`, `app/[locale]/(dashboard)/settings/team/actions.ts` |
| .t  | ✅ Landed in commit `efec382`. `tests/billing/guard.test.ts` — 6 cases (trial_expired/canceled throw 402; active/trialing/past_due pass). Webhook idempotency test still TBD. | 🟡 | | 0.25d | — | `tests/billing/guard.test.ts`, future webhook idempotency test |
| .v  | Pending — needs Stripe Dashboard provision (test mode price + webhook secret) to verify trial-expiry behavior end-to-end. | ❌ | | 0.5d | H3.i + Stripe test mode | live |

**Today.** Subscribe / Manage / Portal redirects all work ✅. Webhook handler exists ✅ (`app/api/webhooks/stripe/route.ts`, 6 event types, idempotent). Guard now wired and unit-tested (commit `efec382`); awaiting live Stripe test-mode flow to verify the user-facing read-only banner UX.

---

### H4 · Quiet hours respected at delivery · ❌

**Phase** H1 · **Epic** Settings · **JTBD** J1 · **FR-IDs** FR-NOTIF-001, FR-NOTIF-004 · **Personas** P1 · **§06 P1.11**

**AC:**
- Schema: `notification_settings.quiet_hours_start` + `quiet_hours_end` (TIME, default 21:00–07:00 ICT)
- Bot worker checks recipient quiet-hours window before push; outside window event stays `pending`, retried at window-open
- High-severity disease alerts (`payload.severity = 'high'`) bypass quiet hours; log every bypass
- Settings → Notifications adds 2 time pickers per channel
- Manual rep `sendLine` from modal bypasses quiet hours by default

| Sub | Task | Status | Owner | Est | Blocked-by | Code refs |
|-----|------|--------|-------|-----|------------|-----------|
| .i  | Migration: add columns. UI: 2 time pickers per channel. Worker: quiet-hours check + re-queue at window-open. Logging on bypass. | ❌ | | 1.5d | G3'.i | new migration, `app/[locale]/(dashboard)/settings/notification/page.tsx`, bot worker |
| .t  | Vitest: enqueue at 22:00 + check at 22:30 → still pending. At 07:01 → sending. High-severity → bypass + log. | ❌ | | 0.5d | H4.i | `tests/settings/quiet-hours.test.ts` |
| .v  | Manual: set quiet hours; enqueue test event at 22:00 staging; confirm delivered next morning. | ❌ | | 0.25d | H4.i | live |

**Today.** Schema fields don't exist; worker check not implemented.

---

### X1 · Dead-letter retry / escalate UI · ❌

**Phase** H2 · **Epic** Ops · **JTBD** J4 · **FR-IDs** *operational (no explicit FR-ID)* · **Personas** P1 · **§06 P2.11**

**AC:**
- New page `/settings/messaging-failures` (or right-rail panel) lists `line_outbound_events WHERE status='dead'` for hatchery
- Each row: customer, template, payload preview, last error, attempt count, first-failure timestamp
- Per-row actions: Retry (status → pending, increment retry, audit log), Edit & retry (edits payload, resets), Mark resolved (closes without resending)
- Bulk: select multiple → retry all
- Once-daily failures digest to relevant notification channel ("5 messages need attention")

| Sub | Task | Status | Owner | Est | Blocked-by | Code refs |
|-----|------|--------|-------|-----|------------|-----------|
| .i  | New route `app/[locale]/(dashboard)/settings/messaging-failures/page.tsx`. Server actions `retryDead`, `editAndRetry`, `markResolved`. Bulk action UI. Daily digest cron entry. | ❌ | | 2d  | G3'.i, G4.i | new route, new actions |
| .t  | Vitest: retry resets status + increments attempts. Audit log row created. Bulk retry covers correct row set. | ❌ | | 0.5d | X1.i | `tests/ops/dead-letter.test.ts` |
| .v  | Manual: simulate dead row; retry; appears in audit log; resolves successfully on second attempt. | ❌ | | 0.25d | X1.i | live |

**Today.** Not implemented. Promoted from P3.7 → P2.11 per `06` reconciliation block.

---

## Verification log (what was checked at write time, 2026-04-29)

This is the audit trail behind the `Status` and `Code refs` columns. Re-run when the matrix is touched.

| Story | Check | Result |
|---|---|---|
| A1 | `cat app/auth/callback/route.ts` | Code-exchange only; no bootstrap action. Confirms 🟡. |
| A2 | `ls components/modals/invite-team-modal.tsx` | File exists. Submit handler not wired (per 02-feature-inventory.md). Schema role enum DRIFTS — `('owner','admin','editor','viewer','technician')` in `001_init.sql:23` vs spec `(owner/counter_staff/lab_tech/auditor)`. |
| A3 | (per `02-feature-inventory.md` Settings 9a) | Confirms ❌ — `defaultValue` only. |
| B1–B4 | `02-feature-inventory.md` Page 2/3 + `lib/api/supabase.ts` exists | Mock wired; Supabase swap is the work. |
| C1–C4 | `02-feature-inventory.md` Page 4/5 + `components/modals/{add-batch,cert-modal}.tsx` exist | Wizard works against mock; PCR + cert paths missing. |
| D1–D3 | `02-feature-inventory.md` Page 6 + `quote-modal.tsx` exists | List wired; quote/broadcast unwired. |
| E1–E4 | `02-feature-inventory.md` Page 7 + `close-alert-modal.tsx` exists | List wired; resolution metadata + auto-create + notify all unwired. |
| F1–F4 | `02-feature-inventory.md` Page 8 + no public route under `app/` | Editor toggles wired; public scorecard does not exist. |
| G1, G2, G3' | `find app/api -type f` → only `webhooks/stripe/route.ts` · `find . -type d -name line -o -name liff` → none | LINE schema in 006 ✅; no application code anywhere. |
| G3 | (out of scope) | 🚫 — H3. |
| G4 | `grep cron vercel.json` → empty | No cron configured. |
| H1 | Existing notif toggles wired (per Page 9b) | Delivery-time check missing. |
| H2 | `02-feature-inventory.md` Page 9d | All 4 buttons no-op. |
| H3 | `app/api/webhooks/stripe/route.ts` exists; `lib/billing/` has helpers (`AGENTS.md` confirms) | Webhook + Checkout/Portal redirects ✅; mutation guard ❌. |
| H4 | `grep quiet_hours supabase/migrations/*.sql` → empty | Schema missing. |
| X1 | No dead-letter route | Not implemented. |
| Tests | `ls tests/ vitest.config* playwright.config*` → all empty | 0 tests across the repo. Every `.t` row is ❌. |

**Re-verify cadence.** Re-run this verification block at every sprint boundary. If a `Status` cell is changed without a corresponding entry here, the change is unverified — flag in PR review.

---

## Second-pass verification (2026-04-29, post-write)

After the matrix landed, four parallel verifier agents (V1 onboarding/customers/settings, V2 batches/restock, V3 alerts/scorecard, V4 LINE) re-checked every story against fresh code reads. Outcome:

**Status corrections applied (2):**
- **B1.i** ✅ → 🟡 — `lib/api/supabase.ts:111` uses `customer_cycles!inner(...)` which silently drops customers with no cycle row. Mock returns all customers; production list would appear empty for net-new customers. Fix: change to left join.
- **E1.i** ✅ → 🟡 — `lib/api/supabase.ts:168` orders only by `created_at DESC`; AC requires `sev DESC, date DESC`. High-severity alerts may not surface first. Fix: chain `.order('sev', {ascending:false})` before `.order('created_at', ...)`.

**Annotations added (no status change, but worth knowing):**
- **A2** modal `PERMS` array uses a third role set (`admin/editor/viewer`) distinct from both schema and spec — three-way drift, not two-way.
- **A1 / H3 trial period** `004_billing.sql:5` says 30 days; `03-user-stories.md:34` AC says 14 days; `README.md` + `00-overview.md` say 30 days. Two values across three sources — confirm canonical.
- **B2** schema is *not* missing four fields; `phone`/`zone`/`farm_en` already exist in `001_init.sql:54–56`. Only `package_interest` is missing. Plus `addCustomer()` silently drops the `plan` field passed by the modal.
- **E3** modal uses single-select `<select>` not multi-select; note textarea is uncontrolled (decorative-only).
- **F1** `showReviews` toggle has no `disabled` prop despite spec.
- **H3** webhook handles 6 event types, not 5. `lib/billing/guard.ts` is a planned (new) file, not existing.
- **G3'** alert idempotency index uses JSONB extraction `payload->>'alert_id'`, not a column reference.
- **G epic** cross-service dependencies (bot worker repo, shared Supabase, env vars) added to G3' block.

**Verifier confirmations (no change needed):**
- All 7 stories in V2 slice (C1–C4, D1–D3) confirmed exactly as stated.
- All 5 stories in V4 slice (G1, G2, G3, G3', G4) confirmed; schema columns match spec exactly.
- A1, A3, B3, B4, H1, H2, H4, X1 (V1) confirmed.
- E2, E4, F2, F3, F4 (V3) confirmed.

**Method.** Each verifier was constrained read-only, given a story slice + `Code refs` to grep, and required to cite file:line. Reports archived in conversation history (sonnet, ~100k tokens total). The agents found no ✅-claimed-but-actually-❌ cases — only two over-reads where ✅ should have been 🟡.

---

## Third-pass: pilot landing (2026-04-29, branch `feat/h1-pilot-week0`)

Implementation work completed on this branch:

| Commit | Subject | Stories advanced |
|---|---|---|
| `b7fafb8` | docs(spec): align A1 AC with code — 30-day trial, role 'owner' | A1 (AC fix; trial-period drift resolved) |
| `0fa4489` | feat(roles): reconcile hatchery_role enum with product spec | A2 / A3 / RLS (role-enum drift resolved; migration `007_roles_reconcile.sql`) |
| `e99511e` | test(infra): add Vitest + Testing Library + jsdom harness | every `.t` row (unblocks test work across the matrix) |
| `ddf6ea3` | fix(api): B1.i left-join + E1.i severity sort | B1.i ✅, E1.i ✅ (with regression tests) |

**State after this pass:**
- Vitest harness: 3 test files, 5/5 passing (1 smoke + 2 B1 + 1 E1 + 1 confirms `@/` alias works).
- `pnpm typecheck`: clean.
- Both bug fixes land with regression tests so future regressions break CI.
- Two upstream drift flags resolved (role enum, trial period). Future stories no longer block on these decisions.
- B1 and E1 parent rows stay at 🟡 because `.t` rows have only the unit-level regression test, not the cross-tenant RLS test (deferred to P0.3 cross-cutting). `.v` rows (live verification) need a real Supabase project — pending for whoever runs the next live-mode session.

**Not landed yet (Week-1 H1 work that needs decisions or external setup):**
- A1.i bootstrap action — needs Supabase project provisioned to land + verify
- A3.i settings profile — needs `hatchery-logos/` Storage bucket
- A2.i team_invites — needs Resend or Supabase Auth Admin email config; spec wants owner-only invite, current RLS allows owner+counter_staff (rls policy still needs to tighten)
- H3 read-only mutation guard — needs Stripe test mode for live verification
- G1 / G3' — separate `aquawise-line-bot` repo + LINE OA provisioning

---

## Fourth-pass: team-driven sprint (2026-04-29, team `h1-pilot-week0`)

Spawned 4 parallel sonnet workers via `/oh-my-claudecode:team` on the `feat/h1-pilot-week0` branch. 8 tasks across the 4 workers, all landed in ~20 min wall clock. Lead committed in 2 batches.

**Workers and their slices:**

| Worker | Tasks | Tests added |
|---|---|---|
| `worker-auth` | A1.i bootstrap + A3.i settings profile | 6 |
| `worker-team` | A2.i team invites end-to-end | 7 |
| `worker-data` | B2.i customer fields + plan persistence; P1.1 dashboard hero stats | 10 |
| `worker-cross` | H3 mutation guard; D1 configurable thresholds; P2.10 logout button | 13 |

**Commits on the branch:**

| Commit | Subject |
|---|---|
| `56a9492` | feat(h1): A1 + A2 + A3 + B2 + P1.1 — H1 pilot batch (5 stories) |
| `efec382` | feat(h1): H3 + D1 + P2.10 — H1 pilot batch (worker-cross) |

**Status flips (parent rows still 🟡 because `.v` live verification waits on a real Supabase project):**

| Story | `.i` Status before | After | Note |
|---|---|---|---|
| A1.i | ❌ | ✅ | `lib/auth/bootstrap.ts` calls `create_hatchery` RPC; idempotent |
| A2.i | ❌ | ✅ | Migration 008 + invite + accept-invite route + modal submit |
| A3.i | ❌ | ✅ | Profile inputs controlled; storage helper for logo upload |
| B2.i | 🟡 | ✅ | Migration 009 + addCustomer maps `plan` → `package_interest` |
| H3 (mutation guard) | 🟡 | ✅ | `lib/billing/guard.ts` PaywallError + requireActiveSubscription wraps mutations |
| D1.i | 🟡 | ✅ | Migration 010 + `restock_thresholds` jsonb; restock page reads from settings |
| P1.1 dashboard hero | (06 P1.1 only) | ✅ | `lib/derive/dashboard-stats.ts` replaces hardcoded `5/8`/`82%`/`3 ฟาร์ม` |
| P2.10 logout | (06 P2.10) | ✅ | `app/actions/auth.ts` + form action on left-rail button |

**Test suite growth:**
- Pre-sprint: 5 tests (smoke + B1 regression + E1 regression)
- Post-sprint: **42 tests across 11 files**, all passing.

**Test infra additions (worker-auth):**
- `tests/__mocks__/server-only.ts` shim + `vitest.config.ts` alias so server-only files can be imported under jsdom. Pays dividends for every future `.t` row that touches a server action.

**Coordination notes worth remembering:**
- Cross-worker file overlaps on `lib/api/supabase.ts` (3 workers) and `lib/database.types.ts` (3 workers) resolved without conflicts thanks to ordering — not designed; lucky.
- worker-team noticed and fixed a pre-existing typecheck error in worker-auth's `settings/actions.ts` mid-flight without being asked. Without that fix, the first commit batch would have failed `pnpm typecheck`.
- worker-cross stalled around the 10-minute mark mid-H3 and required a status-check ping from the lead. Watchdog policy (5-min stall threshold) earned its keep.

**Still open after this pilot:**
- Live verification (`.v` rows) for A1/A2/A3/B2/H3 — needs Supabase project provisioned + Stripe test mode + email service.
- B3.i, C1.i (per-disease PCR), C3.i (real buyers table), C4.i (PCR cert PDF) — next pilot.
- LINE epic (G1, G2, G3', G4) — different repo, defer.
- E2 auto-alerts — farm-side schema cross-team coordination.
- B1.t and E1.t cross-tenant RLS tests — fold into P0.3 cross-cutting work.
