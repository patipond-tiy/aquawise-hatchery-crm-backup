> Refreshed 2026-05-02 against `aquawise-updated-docs/06-aquawise-hatchery-customer-doc.md`. Stale `business-guide/` links rewritten.

# 03 — User Stories

Stories are grouped by **epic**. Each story uses the form:

> **As** {persona}, **I want to** {capability}, **so that** {value}.

…followed by **Acceptance criteria** (AC), the **FR-IDs** the story
satisfies (see `docs/aquawise-updated-docs/06-aquawise-hatchery-customer-doc.md` for
current hatchery scope; original FR reference doc archived),
and a pointer to the prototype state.

Personas: Owner (P1), Manager (P2), Rep (P3), Lab (P4), Auditor (P5),
Farmer (P6 — external, on @aquawise LINE bot).

**Phase tagging.** Stories carry a phase label:

- **H1** — first paying tenant target (weeks 1–6 in `06`)
- **H2** — second tenant / scale (weeks 7–10)
- **H3** — post-GA / deferred

---

## Epic A — Onboarding & Tenancy

### A1. Sign up and create a hatchery workspace · **H1** · FR-AUTH-001, FR-WS-001, FR-AUTH-003

**As** an Owner, **I want to** create my hatchery workspace from a magic-link
email, **so that** I can start using the CRM without a password.

**AC:**
- Email entered on `/login` → magic link sent via Supabase Auth
- Click link → `/auth/callback` exchanges code → redirected to `/{locale}`
- First-ever sign-in for the email creates a `hatcheries` row (name from
  email domain placeholder), an `auth.users → hatchery_members` row with
  role `owner`, and a 30-day Stripe trial subscription
- Subsequent sign-ins land directly on the dashboard

**Today.** Magic-link page exists at `app/[locale]/login/`. Callback handler
exists. **Workspace bootstrap on first login is not implemented** — needs a
server action that runs once per new auth user.

---

### A2. Invite team members · **H1** · FR-TEAM-001/002/003

**As** an Owner, **I want to** invite my manager / rep / lab officer with a
specific role, **so that** they can access the right parts of the CRM.

**AC:**
- "+ เชิญสมาชิก" opens the `invite` modal
- Fields: email (required), role (admin / editor / viewer), display name
- Submit creates a `team_invites` row with a 7-day token, sends an email
- Recipient clicks link → magic-link sign-in → joined as `hatchery_members`
  with the chosen role
- Invite modal shows pending invites with "Resend" / "Revoke"

**Today.** Modal opens (✅) but has no submit handler (❌). No `team_invites`
table yet, no email send.

---

### A3. Set up the hatchery profile · **H1** · FR-WS-002

**As** an Owner, **I want to** fill in my hatchery name, address, LINE OA,
logo, and brand color, **so that** customers see a professional, branded
experience.

**AC:**
- Settings → Profile inputs become controlled with `useState`
- "บันทึก" calls `updateProfile()` and shows a toast
- Logo upload sends file to Supabase Storage `hatchery-logos/` bucket and
  writes URL to `hatchery_brand.logo_url`
- Display name (TH/EN), brand color picker also persist
- Brand fields immediately propagate to Flex Message templates

**Today.** Inputs are dead `defaultValue`s (❌). `hatchery_brand` table exists
in migration 006. Storage bucket not created.

---

## Epic B — Customer management

> ⚠ Per `aquawise-updated-docs/06-aquawise-hatchery-customer-doc.md` (v0.5, unvalidated): the hatchery's
> "customers" are nursery operators (≈20–40), not farm operators. The source doc frames this as a
> *relationship dashboard*, not a sales-pipeline CRM. Story ACs below use the scaffolded "customer/farm"
> vocabulary; treat the exact UX framing as a hypothesis pending validation with P'Bunjong in 2027.

### B1. See all customers at a glance · **H1** · FR-CUST-001/004

**As** a Rep, **I want to** browse my customer list, search by farm/owner
name, and filter by lifecycle status, **so that** I can quickly find the
farm I need.

**AC:**
- `/customers` lists all customers (only this hatchery's, RLS-enforced)
- Search filters by `farm`, `farmEn`, `name` (case-insensitive)
- Tabs: All / Active (cycleDay != null) / Restock (restockIn ≤ 14) / Concern
- Each card shows farm name, owner, status chips, batches count, LTV, last D30
- Card click → detail. 💬 → sendLine modal.

**Today.** Fully wired against mock (✅). Production = same against Supabase.

---

### B2. Add a new customer · **H1** · FR-CUST-001

**As** a Rep, **I want to** add a customer who just placed their first order,
**so that** they enter the pipeline and I can track their cycles.

**AC:**
- Modal fields: Farm (TH), Owner, Phone, Zone (province dropdown), interested
  package (300k / 500k / 1M PL pre-set)
- Required: farm, owner, zone
- On submit: insert `customers` row, set `status='active'`, generate slug
- Optimistic update + toast "เพิ่มลูกค้า "{farm}" แล้ว"
- New customer appears at top of list

**Today.** Mock-wired (✅). Schema fields needed: `phone`, `zone`,
`farm_en`, `package_interest` (currently in the modal but not in the
`customers` schema migration).

---

### B3. View customer detail and history · **H1** · FR-CUST-001/002/003

**As** an Owner, **I want to** open a customer and see their cycle status,
D30 trend, contact info, and batch history, **so that** I have full context
before calling them.

**AC:**
- Header: avatar, farm name, owner, zone, current status chips
- Stats grid: total batches, LTV, last D30, restock-in days
- D30 trend sparkline = last 6 cycles' actual D30 (not synthetic)
- Contact section: real `phone`, `lineId`, `address` from row
- Batch history: rows where `customer.id ∈ batch.distributions`, with
  cycle status, D30, harvest result chip

**Today.** Header + stats wired ✅. Sparkline is synthetic 🟡. Contact is
hardcoded ❌. Batch history is hardcoded ❌.

---

### B4. Schedule a callback · **H2**

**As** a Rep, **I want to** mark "call this farm on Friday at 2pm",
**so that** I don't forget the next touchpoint.

**AC:**
- "นัดโทร" opens `schedule` modal
- Fields: date, time, note, channel (call / LINE)
- On submit: insert `customer_callbacks` row tagged to current user
- Visible in: customer detail "Upcoming" section + an "Inbox" view (later)
- Notification queued for the rep on the day-of

**Today.** Modal opens (✅) but submission unwired (❌). `customer_callbacks`
table doesn't exist.

---

## Epic C — Batches & Quality

### C1. Register a new batch · **H1** · FR-BATCH-001/002

**As** a Manager, **I want to** register a new PL batch with source strain,
spawn date, quantity, and PCR results in under 60 seconds, **so that** the
batch is ready to assign to buyers.

**AC:**
- 3-step wizard: (1) batch info, (2) PCR upload, (3) confirm
- Step 1 fields: source (strain dropdown — currently 4 hardcoded), spawn
  date, quantity (PL count)
- Step 2: drop PDF/JPG/PNG → uploaded to `pcr-reports/{batch_id}/` Storage
  bucket; OCR-or-form pulls per-disease results; user can override
- Step 3: confirmation summary, register button
- On submit: insert `batches` row + `batch_pcr_tests` rows (one per disease)
- Toast + invalidate

**Today.** UI wizard works (✅). Step 2 PCR upload is fake ❌. The 4
disease results are hardcoded "✓ ผ่าน". Mock submission hardcodes
`pcr: 'pending'`.

---

### C2. Browse and review batches · **H1**

**As** an Auditor, **I want to** browse every batch with PCR status visible,
**so that** I can verify the quality record.

**AC:**
- `/batches` shows all this hatchery's batches, newest first
- Card shows: ID, date, source, PCR chip (clean/flagged/pending), produced PL,
  buyer count, mean D30
- Optional: filter chips for PCR status, source strain, year
- Card click → detail
- Auditor role can see all batches but not commercial fields (LTV, prices)

**Today.** List wired (✅). No filter/search yet. RBAC field-level filtering
not implemented (auditor sees same as admin).

---

### C3. View batch detail with distribution · **H1** · FR-BATCH-001/002/003

**As** a Manager, **I want to** see who bought from a specific batch and
their D30 outcomes, **so that** if a complaint comes I have full context.

**AC:**
- Header: batch ID, PCR chip, spawn date, source
- Stats: produced, sold, buyer farm count, mean D30
- D30 distribution histogram: 10 bins, real data from buyer cycles ⚠ (cross-nursery lineage
  performance feedback is the most uncertain feature per source doc §3 Job 2 — validate
  data analysis quality and whether P'Bunjong wants/trusts this feedback before scaling)
- PCR section: 4 disease rows with pass/fail, lab name, test date
- Buyers table: real `batch_distributions` rows joined with customers

**Today.** Stats wired ✅. PCR section partially real 🟡 (test date is real
but lab name "DOFR" is hardcoded; flag logic only fires on EHP). Buyers table
synthetic ❌.

---

### C4. Print or send a PCR certificate · **H1** · FR-BATCH-004

**As** a Manager, **I want to** print a PCR cert as PDF or send it as a
LINE Flex Message to the buyer, **so that** the farm has documented proof
of the lot's quality.

**AC:**
- "พิมพ์ใบรับรอง" → server-side PDF render of the certificate (logo, batch
  ID, PCR results, signed date) → browser download
- "ส่งใบรับรอง LINE" → opens `cert` modal listing batch buyers → choose
  recipients → submit pushes a `pcr_certificate` Flex template via the LINE
  outbound queue
- PDF generation is server-side (Puppeteer / @react-pdf/renderer)
- Cert URLs stored in `batch_certs` table for re-download

**Today.** Print is toast-only 🟡. Cert modal opens ✅ but no submission.

---

## Epic D — Restock pipeline

### D1. See farms by restock urgency · **H1**

**As** a Rep, **I want to** see a triaged list of farms with cycles ending
soon, grouped by urgency, **so that** I work the most urgent ones first.

**AC:**
- `/restock` lists all `customers` where `restockIn != null`
- Groups: now (≤0d), week (≤14d), month (≤45d), later
- Each row shows restock-in days, last D30, batches count
- Stat cards aggregate counts + estimated PL volume per group
- Group thresholds configurable per hatchery (Settings)

**Today.** Wired ✅. Thresholds hardcoded.

---

### D2. Send a quote in one tap · **H1** · FR-QUOTE-001/002/003, FR-LINE-001/002

**As** a Rep, **I want to** send a co-branded quote (price per size, payment
terms, lead time) to the farm via LINE in one click, **so that** I get the
lot ordered before a competitor calls.

**AC:**
- "เสนอราคา" opens `quote` modal pre-filled with: customer's last package,
  current `prices` rows, hatchery's lead time
- Rep can edit line items and add a note
- Submit emits a `quote` Flex template to the LINE outbound queue
- Farmer receives Flex with "ตอบรับ" button → opens LIFF chat thread
- Quote stored in `quotes` table, status `sent → accepted | declined | expired`
- Visible in customer detail "Quotes" tab

**Today.** Modal opens ✅ but no submission, no `quotes` table.

---

### D3. Broadcast to a restock cohort · **H2** · FR-LINE-001/002

**As** an Owner, **I want to** message all "restock-this-week" farms with a
single template, **so that** I don't have to send 14 messages by hand.

**AC:**
- "ส่งข้อความหาทุกคน" opens a confirmation showing affected farms count
- Template selector: restock_reminder (default), new_batch_announcement,
  promo
- Submit fans out — one row per recipient — into `line_outbound_events`
  (idempotent via `(customer_id, template, cycle_id)` partial unique index)
- Confirmation toast "ส่งถึง 14 ฟาร์ม", events processed by bot worker

**Today.** Toast-only 🟡.

---

## Epic E — Alerts & Disease

### E1. See active alerts · **H1**

**As** an Owner, **I want to** see all open alerts across batches, ranked
by severity, **so that** I respond before reputation damage.

**AC:**
- `/alerts` shows all `closed=false` alerts, sorted by `sev DESC, date DESC`
- Severity stat cards: high / medium / low counts
- Each alert: severity icon, batch link, affected farms, recommended action

**Today.** Wired ✅.

---

### E2. Auto-create alerts from farm-side D30 dips · **H2** · FR-NOTIF-003

**As** a Manager, **I want to** receive an alert when farms report D30 below
target on a batch I produced, **so that** I can investigate before the
pattern spreads.

**AC:**
- Cron / trigger watches `farm_cycle_metrics.d30` rows posted from the
  AquaWise farm app
- When ≥2 farms with the same source `batch_id` report D30 < 70%, generate
  an `alerts` row severity `medium`, action "ตรวจสอบล็อต"
- ≥3 farms or D30 < 60% → severity `high`
- Notification delivered per Settings → Notifications toggles
- De-dup via partial unique on `(batch_id, alert_kind, week)`

**Today.** Alert reading wired ✅, alert creation not implemented ❌.

---

### E3. Close an alert · **H1**

**As** an Owner, **I want to** close an alert with a resolution note,
**so that** the case is documented.

**AC:**
- "ปิดเคส" opens `closeAlert` modal
- Fields: resolution note, follow-up actions taken (multi-select)
- Submit calls `closeAlert(id, note, actions)` → sets `closed=true`,
  appends `alert_resolutions` row, optionally fires a follow-up Flex to
  affected farms
- Alert disappears from list

**Today.** `closeAlert(id)` wired but only flips boolean; modal exists
but submission probably unwired (file not fully read in audit).

---

### E4. Notify affected farms · **H2** · FR-LINE-001/002

**As** an Owner, **I want to** push a "we're investigating + here's what
we found" follow-up to the farms named in an alert, **so that** they
know we're handling it.

**AC:**
- "ส่งข้อความถึงฟาร์ม" opens template selector (acknowledge /
  remediation_plan / closure)
- Submit fans out to `line_outbound_events`, idempotent on `(customer_id, alert_id)`

**Today.** Toast-only 🟡.

---

## Epic F — Public scorecard

> ⚠ The public hatchery scorecard is a 2027+ hypothesis per
> `aquawise-updated-docs/06-aquawise-hatchery-customer-doc.md` §3 Job 4 and Scene 3.
> It is contingent on the nursery and farmer sides reaching data scale first.
> ACs below describe the intended mechanics; do not treat as confirmed product direction.

### F1. Toggle scorecard visibility · **H1**

**As** an Owner, **I want to** flip the public scorecard on/off and pick
which stats appear, **so that** I control what customers see.

**AC:**
- Six toggles: public, showD30, showPCR, showRetention, showVolume, showReviews
- Optimistic updates with rollback on error
- showReviews disabled until reviews schema ships

**Today.** Wired ✅, optimistic + rollback present.

---

### F2. Public scorecard page (renders the QR target) · **H2** · FR-PUBLIC-001/002

**As** a Farmer (P6) scanning the QR, **I want to** see the hatchery's
verified scorecard on a public page without logging in, **so that** I trust
their D30 / PCR claims.

**AC:**
- Public route `/{locale}/h/{slug}` renders the scorecard with hatchery
  brand (logo, color, display name from `hatchery_brand`), only the stats
  the owner enabled
- "Verified by AquaWise" stamp + last-refresh timestamp
- No farmer-side auth required
- RLS policy: `hatchery_brand` row public-readable WHERE
  `scorecard_settings.public = true`; aggregates computed server-side
- Voice: brand-surface tier (Plus Jakarta Sans family per `docs/product-spec/07-brand-and-voice.md`) — no
  emojis, no marketing copy

**Today.** Page does not exist ❌. Only the *editor view* at `/scorecard`.

---

### F4. Public scorecard ISR + SEO · **H2** · FR-PUBLIC-003

**As** an Owner, **I want to** my public scorecard be SEO-indexable so
the hatchery name + AquaWise verification surfaces on Google, **so that**
new farmers searching for me find a credibility-bearing landing page
instead of nothing.

**AC:**
- Page rendered with ISR; revalidate every 6h (`revalidate: 21600` on
  `generateStaticParams`)
- `<head>` carries OG image (auto-rendered card with hatchery name + key
  stats), `<meta name="description">` from FR-doc template, JSON-LD
  `Organization` schema with verified ratings
- `robots.txt` allows `/h/*`; sitemap auto-generated from
  `hatchery_brand WHERE scorecard_settings.public = true`
- Lighthouse SEO ≥ 95; LCP ≤ 2s on 4G

**Today.** Not implemented ❌. Sequenced as part of P2.1.

---

### F3. Generate scorecard PDF / send via LINE · **H2** · FR-LINE-001/002

**As** an Owner, **I want to** download the scorecard as a brochure PDF
and push it to all my customers, **so that** they have an offline reference.

**AC:**
- "ดาวน์โหลด PDF" → server-side render of the scorecard
- "ส่ง LINE" → opens cohort selector → pushes scorecard Flex to selected
  customers via outbound queue

**Today.** Both toast-only 🟡.

---

## Epic G — LINE integration (cross-cutting)

### G1. Bind a customer's LINE account to their CRM record · **H1** · FR-LINE-004

**As** a Rep, **I want to** mint a one-shot bind link for a new customer
and send it via LINE, **so that** their LINE user_id gets connected to
their farm record (so future Flex messages reach them).

**AC:**
- On the customer card, a "Connect LINE" CTA appears if `customer.line_id`
  is null
- Click → server mints a `customer_bind_tokens` row (26-char ULID, 7-day
  expiry), returns a LIFF link `liff.line.me/{liffId}/bind?token=...`
- Rep copies the link or sends it via existing channel
- Farmer opens link in LINE → LIFF page authenticates with LINE Login →
  server looks up token, sets `customers.line_id`, upserts `line_users`,
  creates a `chat_threads` row, deletes the token (one-shot)
- Customer card updates to show "✓ LINE connected" + last-seen status

**Today.** Schema migration 006 has `customer_bind_tokens` ✅. LIFF page
and `/api/line/bind` route do not exist ❌.

---

### G2. Send a one-off LINE message to a single customer · **H1** · FR-LINE-001/002/003

**As** a Rep, **I want to** open a customer and tap "ส่ง LINE" with a
template (cycle-end reminder / new lot / promo / custom note), **so that**
I message them in two clicks.

**AC:**
- `sendLine` modal lists templates and a free-text option
- Submit calls `sendLineEvent(template, payload)` server action which
  inserts to `line_outbound_events` (status=`pending`)
- Bot worker (already running on Cloud Run) consumes the queue, renders the
  Flex with hatchery branding, pushes via @aquawise OA
- Status updates: `pending → sending → sent` (or `failed → dead`)
- Toast in CRM on optimistic insert; later status visible in customer
  "Activity" section

**Today.** Modal opens ✅, no submission ❌, no server action, no worker
extension.

---

### G3. Two-way chat in LIFF inbox · **H3 (deferred)**

> **Status: deferred to Phase H3.** The FR doc treats hatchery↔farm
> messaging as send-only Flex for Phase H1; full two-way chat with
> persistent threads, LIFF inbox, CRM inbox panel, and nudges is a
> separate program of work. Phase H1 ships **G3'** below; the original
> G3 stays here as the H3 target.

**As** a Farmer (P6), **I want to** open "ข้อความของฉัน" in @aquawise rich
menu and see all my hatcheries' threads, **so that** I can chat with my
hatchery without it cluttering my main LINE chat.

**AC:**
- Rich menu adds an "ข้อความของฉัน" button → opens LIFF inbox listing
  every `chat_threads` row for this farmer's `line_user_id`
- Tap a thread → 1-on-1 chat view with hatchery; messages real-time via
  Supabase Realtime
- Hatchery side: an "Inbox" panel in CRM (new page or right rail) shows
  active threads, with unread badges and last message preview
- Both sides see typing indicator and read receipts (`chat_read_receipts`)

**Today.** Rich-menu change not made; inbox LIFF page does not exist; CRM
inbox page does not exist. Schema for chat is in *planned* migration 007.

---

### G3'. Send-only Flex messaging (Phase H1) · **H1** · FR-LINE-001/002/005

**As** a Rep, **I want to** the existing CRM "send LINE" buttons to push
templated co-branded Flex messages to farmers via the AquaWise OA,
without yet exposing two-way chat, **so that** Phase H1 has working
outbound on day one.

**AC:**
- Every `sendLine` / `quote` / `cert` / disease-alert / restock-broadcast
  modal submission inserts to `line_outbound_events` (status `pending`)
- Bot worker consumes the queue, renders Flex with `hatchery_brand`,
  pushes via @aquawise OA
- "เปิดแชท" CTA in the Flex points to a temporary LIFF placeholder
  (not the inbox) — Phase H3 will swap the CTA target
- Status updates `pending → sending → sent` (or `failed → dead`)
  visible in customer detail "Activity" panel
- No farmer-initiated message handling in this phase; farmer replies in
  LINE chat are logged to `line_message_logs` but not surfaced in CRM

**Why split.** Lets us ship the most valuable LINE feature (branded
push) without committing to inbox UX, schema migration 007, presence,
read receipts, or rich-menu changes that need deeper @aquawise
coordination.

**Today.** Not implemented. Unblocks D2, C4, E4, F3, G2 once shipped.

---

### G4. Cron-driven template pushes · **H2** · FR-NOTIF-002

**As** an Owner, **I want to** auto-push restock reminders and harvest-window
alerts without remembering to click anything, **so that** the LINE outreach
is consistent.

**AC:**
- A daily cron evaluates `customers` where `restock_in` ∈ {7, 3, 0} days
  → enqueues `restock_reminder` events
- A daily cron evaluates upcoming harvest windows → enqueues
  `harvest_window` events
- Idempotency via partial unique on `(customer_id, template, cycle_id)`
- Disable per-hatchery via Settings → Notifications

**Today.** No cron exists ❌. Idempotency indexes are in migration 006 ✅.

---

## Epic H — Settings & operations

### H1. Edit notification preferences · **H1** · FR-NOTIF-001

**As** any user, **I want to** toggle which alerts I get, **so that** I'm
not flooded.

**AC:** 6 toggles, optimistic, persist to `notification_settings`.

**Today.** Wired ✅.

---

### H2. Export customer/PCR data · **H2** · FR-SEARCH-002, FR-DATA-001/002

**As** an Auditor, **I want to** download a CSV of customers and a ZIP of
PCR reports, **so that** I can satisfy compliance requests.

**AC:**
- "ดาวน์โหลด CSV" → server action streams a CSV of `customers` (RLS-scoped)
- "ดาวน์โหลด ZIP" → server action zips all `pcr-reports/*` blobs for this
  hatchery
- "ดาวน์โหลด" full backup → JSON dump of all entities
- Each export logs a `data_exports` row

**Today.** All four buttons no-op ❌.

---

### H3. Subscribe / manage billing · **H1** · FR-AUTH-002/003, FR-BILLING-001

**As** an Owner, **I want to** subscribe to Pro after my 30-day trial and
manage my subscription via Stripe, **so that** I keep using the CRM.

> ⚠ Pricing tier (THB 5,000/mo) and trial length are hatchery-side hypotheses per
> `aquawise-updated-docs/06-aquawise-hatchery-customer-doc.md` §5. Validate with P'Bunjong
> before committing to a Stripe price object for the hatchery plan.

**AC:**
- Trial state shows days-left + "Subscribe" CTA → Stripe Checkout
- Active state shows renewal date + "Manage" → Stripe Portal
- Past-due shows red banner + "Update Payment"
- Webhook `app/api/webhooks/stripe/route.ts` flips subscription state
- **Trial-expired behavior: read-only with banner** — reads (customers,
  batches, alerts, scorecard) remain accessible; all mutations and LINE
  pushes are gated with a "Subscribe to continue" inline action. Less
  destructive than a full lockout; fits the ลูกหลานที่เรียนมา voice
  (calm, declarative — see `docs/product-spec/07-brand-and-voice.md`).
- Read-only banner copy is plain Thai/English, not crisis-mode

**Today.** Mostly wired ✅ (Subscribe / Manage / Portal redirects work,
webhook handler exists). Read-only enforcement at mutation boundaries
not yet implemented.

---

### H4. Quiet hours respected at delivery time · **H1** · FR-NOTIF-001/004

**As** an Owner, **I want to** define quiet hours per customer (e.g.,
no LINE pushes after 9pm), **so that** automated alerts and quote
broadcasts don't wake farmers up.

**AC:**
- Schema: `notification_settings.quiet_hours_start` and
  `quiet_hours_end` (TIME, nullable, default 21:00–07:00 ICT)
- Bot worker checks the recipient's quiet-hours window before pushing;
  outside the window the event stays `pending` and is retried at
  window-open
- High-severity disease alerts (`payload.severity = 'high'`) bypass
  quiet hours — make this explicit in the worker config and log every
  bypass
- CRM Settings → Notifications grows two time pickers per channel
- Manual rep-initiated `sendLine` from the modal bypasses quiet hours
  by default (rep is a human making a decision); cron-driven and
  auto-alert events respect them

**Today.** Schema fields don't exist; worker check not implemented.

---

### X1. Dead-letter retry / escalate UI · **H2** · operational

**As** an Owner, **I want to** see a list of LINE pushes that failed all
retries (`status='dead'`) and choose to retry, edit, or escalate,
**so that** failed messages don't silently disappear.

**AC:**
- New page `/settings/messaging-failures` (or right-rail panel) lists
  `line_outbound_events WHERE status='dead'` for the hatchery
- Each row shows: customer, template, payload preview, last error,
  attempt count, first-failure timestamp
- Per-row actions: **Retry** (resets status to `pending`, increments
  retry count, audit log), **Edit & retry** (edits payload, resets),
  **Mark resolved** (closes without resending)
- Bulk action: select multiple → retry all
- Notification: if any row goes `dead`, the relevant notification
  channel (per Settings) gets a once-daily digest "5 messages need
  attention"

**Why this is P2 (was P3).** FR doc treats observability + retry as
multi-tenant ops table-stakes. Without this UI, failed sends to
high-value farmers are invisible until the customer complains.

**Today.** Not implemented. Promoted from `06` P3.7 → P2.11.
