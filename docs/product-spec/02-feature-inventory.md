> Refreshed 2026-05-02 against `aquawise-updated-docs/06-aquawise-hatchery-customer-doc.md`.

# 02 — Feature Inventory: What's wired today

> Cross-references the Functional Requirements doc at
> `docs/aquawise-updated-docs/06-aquawise-hatchery-customer-doc.md`.
> Each page section below is tagged with the **module ID** (H1–H10
> hatchery-facing, F1–F9 farmer-facing) it implements, and the
> **FR-ID → page** reverse map lives at the bottom of this file.

This is the complete map of every interactive element in the prototype,
classified by **how real it is**:

- ✅ **Wired** — hits the `lib/api` facade, persists in mock state,
  invalidates React Query cache, will work end-to-end the moment Supabase
  is wired.
- 🟡 **Toast-only** — UI fires `toast.success()` but does no work.
- ❌ **Stub** — input/button has no handler at all (or `onClick` is a no-op).

The inventory drives [`03-user-stories.md`](./03-user-stories.md) (what we
need to build) and [`06-production-gap.md`](./06-production-gap.md) (the
punch-list).

---

## Layout shell

### Top bar (`components/layout/top-bar.tsx`)

| Element | Status | Notes |
|---|---|---|
| Sidebar collapse toggle | ✅ | Zustand-backed |
| Search input "ค้นหา" | ❌ | Placeholder only, no `onChange` |
| Notifications icon (mail + red badge) | ❌ | No-op click |
| Profile / theme button | ❌ | No-op click |
| User avatar + name | display | Static |

### Left rail (`components/layout/left-rail.tsx`)

| Element | Status | Notes |
|---|---|---|
| All nav links (Dashboard, Customers, Batches, Restock, Alerts, Scorecard, Settings) | ✅ | next-intl `<Link>` |
| Logout "ออกจากระบบ" | ❌ | No handler |
| Logo + collapse animation | ✅ | Zustand state |

### Right rail

Not currently used. Reserved for a future contextual-information or "today's tasks"
panel — design hooks exist in `Shell` but no content. (The hatchery voice is "informational, never editorial" per brand doc; avoid "AI assistant" framing on professional surfaces.)

---

## Page 1 — Dashboard home (`/`) · module **H1**

**Purpose.** Hero CTA, three stat chips, "Continue Watching" cards, recent batches table.

| Element | Status | Notes |
|---|---|---|
| Hero "ดูฟาร์มที่ต้องติดต่อ →" | ✅ | Routes to `/restock` |
| Hero "+ ลงล็อตใหม่" | ✅ | Opens `addBatch` modal |
| Stat chip "ล็อตที่กำลังเลี้ยง" | ✅ | Routes to `/batches` |
| Stat chip "D30 อัตรารอดเฉลี่ย" | ✅ | Routes to `/scorecard` |
| Stat chip "ต้องสั่งใหม่ใน 14 วัน" | ✅ | Routes to `/restock` |
| Continue-watching card click | ✅ | Routes to customer detail |
| 💬 button on continue card | ✅ | Opens `sendLine` modal |
| "ดูทั้งหมด" (continue) | ✅ | Routes to `/customers` |
| Recent batches row click | ✅ | Routes to batch detail |
| "ดูทั้งหมด" (batches) | ✅ | Routes to `/batches` |

**Hardcoded values:** "5/8", "82%", "3 ฟาร์ม · ~620k PL" — all literal
strings, not derived from data. **All three need to be computed** before
going to production. Continue-watching chip text (`'ล็อต B-2604-A'`) is
also hardcoded by index.

---

## Page 2 — Customers list (`/customers`) · module **H2**

| Element | Status | Notes |
|---|---|---|
| "+ เพิ่มลูกค้า" | ✅ | Opens `addCustomer` modal |
| Search "ค้นหาฟาร์มหรือเจ้าของ…" | ✅ | Filters list on change |
| Tabs: All / Active / Restock / Concern | ✅ | Filter state |
| Customer card click | ✅ | Routes to `/customers/{id}` |
| 💬 per-card | ✅ | Opens `sendLine` modal |

Empty state present. Loading state implicit (React Query default).

---

## Page 3 — Customer detail (`/customers/[id]`) · module **H2**

| Element | Status | Notes |
|---|---|---|
| "← ลูกค้าทั้งหมด" | ✅ | Back link |
| "นัดโทร" | ✅ | Opens `schedule` modal — modal exists but submission unwired |
| "เสนอราคา" | ✅ | Opens `quote` modal — same |
| "ส่ง LINE" | ✅ | Opens `sendLine` modal — same |
| Phone, LINE ID, address | ❌ | **Hardcoded** (`"081-234-5678"`, `"@somchaisuanban"`) — should come from customer record |
| Batch history table (4 rows) | ❌ | **Hardcoded** — should be filtered by `batch.farms` containing this customer |
| D30 trend sparkline | 🟡 | Synthetic — `[d30-3, d30+2, d30-5, d30-1, d30+3, d30]` from current value |

---

## Page 4 — Batches list (`/batches`) · module **H3**

| Element | Status | Notes |
|---|---|---|
| "+ ลงทะเบียนล็อตใหม่" | ✅ | Opens `addBatch` modal |
| Batch card click | ✅ | Routes to detail |

Two-column grid. No filter or search yet (Restock-style filtering would help
when batch count grows).

---

## Page 5 — Batch detail (`/batches/[id]`) · module **H3** + **H5** (cert)

| Element | Status | Notes |
|---|---|---|
| "← ล็อตทั้งหมด" | ✅ | Back link |
| "พิมพ์ใบรับรอง" | 🟡 | Toast only — no PDF rendered |
| "ส่งใบรับรอง LINE" | ✅ | Opens `cert` modal — submission unwired |
| Buyers table | ❌ | **Hardcoded** to `CUSTOMERS.slice(0, b.farms)` with synthetic amounts |
| Round button per buyer row | ❌ | No-op |
| D30 distribution chart | ✅ | Reads `batch.dist` array |
| PCR results (4 diseases) | 🟡 | Status logic real but disease names hardcoded; flag logic only triggers on `EHP` |

---

## Page 6 — Restock (`/restock`) · module **H7** (broadcast)

| Element | Status | Notes |
|---|---|---|
| "ส่งข้อความหาทุกคน" | 🟡 | Toast only — should fan out to LINE queue |
| Stat cards (4 groups) | ✅ | Computed from customer list |
| Customer row click | ✅ | Routes to detail |
| "LINE" per row | ✅ | Opens `sendLine` modal |
| "เสนอราคา" per row | ✅ | Opens `quote` modal |

Group thresholds are hardcoded constants (now ≤0, week ≤14, month ≤45,
later). Should be configurable per hatchery.

---

## Page 7 — Alerts (`/alerts`) · module **H6**

| Element | Status | Notes |
|---|---|---|
| Severity stat cards (3) | ✅ | Counts from list |
| "ดูล็อต {batch}" | ✅ | Routes to batch detail (conditional on `a.batch`) |
| "ส่งข้อความถึงฟาร์ม" | 🟡 | Toast only — should fan out |
| "ปิดเคส" | ✅ | Opens `closeAlert` modal — `closeAlert(id)` mutation works |

Empty state present.

---

## Page 8 — Scorecard (`/scorecard`) · module **H9**

| Element | Status | Notes |
|---|---|---|
| "เปิดให้สาธารณะดู" toggle | ✅ | `updateScorecardSettings({ public })` — optimistic |
| "แสดง D30" toggle | ✅ | Same |
| "แสดง PCR" toggle | ✅ | Same |
| "แสดง Retention" toggle | ✅ | Same |
| "แสดง Volume" toggle | ✅ | Same |
| "แสดง Reviews" toggle | ❌ | **Disabled** — "ยังไม่เปิด — รอเฟส 2" |
| "ดาวน์โหลด PDF" | 🟡 | Toast only — no PDF |
| "ส่ง LINE" | 🟡 | Toast only — no LINE |
| QR code (procedural SVG) | display | Not a real QR yet |

Public profile URL needs to be defined (`aquawise.tech/h/{slug}` ?). The
QR must encode that URL.

---

## Page 9 — Settings (`/settings`) · module **H10** + **H8** (team) + **O1/O2** (onboarding)

Five tabs.

### 9a — Profile

| Element | Status | Notes |
|---|---|---|
| All form inputs (6) | ❌ | `defaultValue` only, no `onChange`, no state |
| "บันทึก" save | ❌ | No handler |
| Logo upload zone | ❌ | UI only, no FileReader / no upload |
| "เปิดมาแล้ว 8 ปี" card | display | Hardcoded |

### 9b — Notifications

| Element | Status | Notes |
|---|---|---|
| All 6 toggles | ✅ | `updateNotificationSettings` — optimistic |

The 6 keys (`restock`, `lowD30`, `disease`, `lineReply`, `weekly`,
`priceMove`) match exactly the production set we'll need.

### 9c — Team

| Element | Status | Notes |
|---|---|---|
| Team member rows (5 hardcoded) | ❌ | Read from `TEAM` constant, not `listTeam()` per-tenant |
| "แก้ไข" per row | ❌ | No-op |
| "+ เชิญสมาชิก" | ✅ | Opens `invite` modal — no submission handler |

### 9d — Data export

| Element | Status | Notes |
|---|---|---|
| "ดาวน์โหลด CSV" (customers) | ❌ | No-op |
| "ดาวน์โหลด ZIP" (PCR history) | ❌ | No-op |
| "ดาวน์โหลด" (full backup) | ❌ | No-op |
| "ติดต่อทีม" (delete) | ❌ | No-op (correctly — should require human ack) |

### 9e — Billing

| Element | Status | Notes |
|---|---|---|
| "Subscribe" | ✅ | `createCheckoutSession()` redirect |
| "Manage" | ✅ | `createPortalSession()` redirect |
| "Update Payment" | ✅ | Same |
| Invoice PDF link | ✅ | Conditional on `invoice.pdfUrl` |
| Trial countdown | ✅ | Computed from `trialEndsAt` |

Billing is the most production-ready page in the app.

---

## Modal inventory

Every modal lives in `components/modals/`. Triggered via `useModal((s) => s.open)`.

| Modal | Triggered from | Submit handler | State |
|---|---|---|---|
| `addCustomer` | Customers list, dashboard maybe | `addCustomer()` mutation → invalidates `['customers']` + toast | ✅ end-to-end (mock) |
| `addBatch` | Batches list, dashboard hero | `addBatch()` 3-step wizard → invalidates `['batches']` + toast | ✅ end-to-end; PCR step is UI-only (hardcoded results) |
| `closeAlert` | Alerts page | `closeAlert(id)` mutation | ✅ wired |
| `sendLine` | Many places | — | ❌ no submit handler — UI exists, no `sendLineEvent()` |
| `quote` | Customer detail, restock | — | ❌ no submit handler |
| `cert` | Batch detail | — | ❌ no submit handler |
| `invite` | Settings → Team | — | ❌ no submit handler |
| `schedule` | Customer detail, restock | — | ❌ no submit handler |

---

## Mock API surface (`lib/mock/api.ts`)

### Read functions

```ts
getHatchery()                  // Hatchery
listCustomers()                // Customer[]
getCustomer(id)                // Customer | null
listBatches()                  // Batch[]
getBatch(id)                   // Batch | null
listAlerts()                   // Alert[] (open only)
getPrices()                    // Prices
listTeam()                     // TeamMember[]
getScorecardSettings()         // ScorecardSettings
getNotificationSettings()      // NotificationSettings
getSubscription()              // Subscription
getInvoiceHistory()            // Invoice[]
```

### Mutation functions

```ts
addCustomer(input)             // Customer
addBatch(input)                // Batch
closeAlert(id)                 // void
updateScorecardSettings(patch) // ScorecardSettings
updateNotificationSettings(p)  // NotificationSettings
```

### Missing functions (UI exists, API does not)

```ts
sendLineEvent(template, payload)   // for sendLine modal
sendQuote(customer, items)         // for quote modal
sendCertificate(batchId, customers) // for cert modal
inviteTeamMember(email, role)      // for invite modal
scheduleCallback(customer, when)   // for schedule modal
generateScorecardPdf(hatcheryId)   // for scorecard "Download PDF"
broadcastToFarms(filter, message)  // for restock + alert broadcast
exportCustomersCsv()               // for data export
exportPcrHistoryZip()              // for data export
exportFullBackup()                 // for data export
updateProfile(patch)               // for settings profile
uploadLogo(file)                   // for settings profile
generatePcrCertPdf(batchId)        // for batch detail print cert
```

### Modules out of Phase H1 scope

| Module | Status | Notes |
|---|---|---|
| **F8 — Water Quality** (farmer-facing) | Phase H2 (deferred) | FR-doc lists water test results + quality trend graphs sourced from farm IoT. Not in hatchery-CRM scope for H1; the data ingest path is on the farm-side AquaWise app. CRM may surface aggregate water-quality flags later as a customer-detail signal. |
| **F-chat (two-way LIFF inbox)** | Phase H3 (deferred) | Schema migration 007 + LIFF inbox + CRM `/inbox` panel + nudges. Demoted from P2.2 → P3.x; FR doc treats messaging as send-only Flex for H1. |
| ⚠ **H-LINEAGE — Broodstock lineage performance analytics** | 2027+ hypothesis | Source doc §3 Job 2, Scene 2: cross-nursery outcome variance broken down by lineage (e.g., Alpha-9 vs Alpha-12 Day-30 comparison). Most uncertain feature in the source doc — explicitly flagged ⚠ awaiting P'Bunjong validation. Do not design or build until validated. |
| ⚠ **H-DISPUTE — Cross-chain defended-dispute dashboard** | 2027+ hypothesis | Source doc §3 Job 1, Scene 1: batch-to-nursery-to-farm outcome mapping for upstream exoneration. Depends on nursery + farm data flywheel reaching scale first. |

These are the surfaces production needs to add. See
[`06-production-gap.md`](./06-production-gap.md) for prioritization.

---

## Hardcoded values that need to be computed or stored

| Where | What | Should come from |
|---|---|---|
| Dashboard hero | `5/8`, `82%`, `3 ฟาร์ม · ~620k PL` | Derived from `customers` + `batches` |
| Continue-watching chip text | `ล็อต B-2604-A` etc. | Customer's current batch FK |
| Customer detail | Phone, LINE ID, address | `customer.phone`, `customer.lineId`, `customer.address` |
| Customer detail | Batch history table | `batches.filter(b => b.farms.includes(customer.id))` |
| Customer detail | D30 trend | Real series from past cycles |
| Batch detail | Buyers table amounts | `batch.distributions[i].quantity` |
| Batch detail | PCR results | `batch.pcr_tests[]` (one row per disease) |
| Batch detail | "DOFR" lab caption | `batch.lab_name` |
| Settings | Team list | `listTeam()` per-tenant, not `TEAM` constant |
| Settings | "เปิดมาแล้ว 8 ปี" | `hatchery.foundedAt` |
| Scorecard | Logo, brand color | `hatchery_brand` table (already in migration 006) |
| Notification settings | (no quiet-hours field exists) | New columns `notification_settings.quiet_hours_start`, `quiet_hours_end` per FR-NOTIF-001/004; bot worker must skip / re-queue pushes outside the window |

---

## FR-ID → page reverse map

Quick lookup for "where does FR-XYZ live in the prototype?" Pulled from
`docs/aquawise-updated-docs/06-aquawise-hatchery-customer-doc.md`.

| FR-ID | What it requires | Where it lives now |
|---|---|---|
| FR-WS-001 | Workspace bootstrap on first sign-in | **Not implemented** — see `06` P0.1 |
| FR-WS-002 | Profile update persists to `hatcheries` + `hatchery_brand` | Settings → Profile (currently dead `defaultValue`s — `06` P0.5) |
| FR-WS-003 | RLS on every tenant table | Migration 002 partial — see `08` table-by-table policies |
| FR-CUST-001 | Customer metadata (phone, line_id, address, name) | Customer detail page (hardcoded — see `06` P1.2) |
| FR-CUST-002 | Derived D30/D60/harvest trend (last 6 cycles) | Customer detail sparkline (synthetic — `06` P1.3) |
| FR-CUST-003 | Batch distribution history per customer | Customer detail batch table (hardcoded — `06` P1.2) |
| FR-CUST-004 | Search by name/phone/LINE ID | Customers list search (works locally; needs Cmd-K — `06` P2.9) |
| FR-BATCH-001 | Per-disease PCR results | Batch detail PCR section (hardcoded — `06` P1.4) |
| FR-BATCH-002 | Survival at D30/D60/harvest | Batch detail stats (D30 only) — `06` P1.4 |
| FR-BATCH-003 | Aggregate to dashboard hero | Dashboard hero (hardcoded `5/8`/`82%` — `06` P1.1) |
| FR-BATCH-004 | PCR cert PDF + LINE delivery | Print cert toast-only + cert modal unwired — `06` P1.8 |
| FR-LINE-001 | Enqueue `line_outbound_events` on every send | **Not implemented** — server action missing — `06` P0.2 |
| FR-LINE-002 | Worker consumes queue, sends Flex | **Not implemented** — bot extension missing — `06` P0.2 |
| FR-LINE-003 | `line_message_logs` audit trail | Schema exists (farm-side); CRM activity panel not built — `06` P3.5 |
| FR-LINE-004 | LIFF bind + `/api/line/bind` | **Not implemented** — `06` P1.9 |
| FR-LINE-005 | Rich-menu templates | Strategy doc only — Phase H3 chat |
| FR-QUOTE-001/2/3 | Quote create/send/track | Quote modal opens but unwired — `06` P1.7 |
| FR-NOTIF-001 | Respect notif toggles at delivery | Toggles persist (`02` Settings 9b ✅); worker enforcement — `06` P1.10 |
| FR-NOTIF-002 | Daily cron 09:00 ICT for restock/harvest | **Not implemented** — `06` P2.3 |
| FR-NOTIF-003 | Auto-trigger from farm-side D30 breach | Trigger missing; depends on `farm_cycle_metrics` sync — `06` P2.4 |
| FR-NOTIF-004 | Quiet hours per customer | Schema fields missing — see hardcoded-values table above |
| FR-TEAM-001 | Email-based async invite + token | Modal opens but unwired — `06` P1.6 |
| FR-TEAM-002 | 3 roles (owner / counter_staff / lab_tech) | `08-roles-and-rls.md` |
| FR-TEAM-003 | List from `hatchery_members` join `auth.users` | Currently reads `TEAM` constant — `06` P1.5 |
| FR-AUTH-001 | Magic-link signup | Login page exists ✅; bootstrap missing — `06` P0.1 |
| FR-AUTH-002 | Stripe webhook reconciliation | Handler exists; needs hardening — `06` P0.4 |
| FR-AUTH-003 | 30-day no-card trial + countdown | Settings billing wired ✅ |
| FR-BILLING-001 | Block features on trial expired/unpaid | Read-only-with-banner decision — `06` P0.4, story H3 |
| FR-SEARCH-001 | Cmd-K palette over customers/batches/alerts | **Not implemented** — `06` P2.9 |
| FR-SEARCH-002 | Export CSV / ZIP / backup | All buttons no-op — `06` P2.7 |
| FR-DATA-001 | `data_exports` audit log | Schema + table missing — `06` P2.7 |
| FR-DATA-002 | Stream exports + signed URLs | Implementation note — `06` P2.7 |
| FR-PUBLIC-001 | ⚠ Public scorecard at `/{locale}/h/{slug}` (2027+ hypothesis — source §4 Scene 3, Job 4) | **Not implemented** — `06` P2.1 |
| FR-PUBLIC-002 | ⚠ Show verified credentials (same caveat as FR-PUBLIC-001) | Same — story F2 in `03` |
| FR-PUBLIC-003 | ⚠ ISR 6h + SEO indexable (same caveat as FR-PUBLIC-001) | Same — story F4 in `03` |
