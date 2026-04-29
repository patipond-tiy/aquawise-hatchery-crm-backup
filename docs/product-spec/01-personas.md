# 01 — Personas

The CRM is built around **one buyer archetype** (the person whose
purchase decision matters), **four operational personas inside the
hatchery** who use the product day-to-day, **one external persona** (the
shrimp farmer they message), and **one influence persona** (the
association president whose endorsement we need).

> **Personas describe behavior. Auth roles describe permissions.** This
> file is about behavior. The mapping to the three implementation roles
> (`owner` / `counter_staff` / `lab_tech`) lives in
> [`08-roles-and-rls.md`](./08-roles-and-rls.md).

---

## The buyer we're building for (target archetype)

> The careful, modern, association-affiliated mid-sized hatchery owner.

**Demographic.** Age 40–60. 15+ years in shrimp aquaculture. Runs a
mid-sized operation (millions to tens of millions of PL per cycle).
Often a family business, sometimes second-generation. Operates from one
of the cluster provinces — Chachoengsao, Samut Sakhon, Surat Thani, Trang.

**Psychographic.** Confident in craft. Quietly proud. Has nothing to
hide and is tired of being treated like he might. Modern enough to want
real systems; old enough to distrust marketing language. Shows up on
time to association meetings.

**Identity needs (from CBBE).** Five things he feels, in his own words:

| The need he feels | His phrase |
|---|---|
| Customer slipping away | "ลูกค้าไม่กลับมา" |
| Unfair blame | "เกษตรกรว่า PL ไม่ดี" |
| Quality verification | "พิสูจน์ว่าโรงเพาะเราดี" |
| Modern operating | "อยากเป็นโรงเพาะที่จริงจัง" |
| Customer acquisition | "อยากได้ลูกค้าใหม่" |

Every product decision should answer at least one of those. If a feature
doesn't, ask why we're building it.

**What he is *not*.** He is not the volume player chasing tons of PL/day
at any quality. He is not the early-adopter disruptor. He is not the
operator who sees software as a luxury. The volume players will buy us
later, after the careful operators have made AquaWise the default.

---

## Operational personas (people inside the hatchery)

The buyer above hires (or is) the people below. They live in the CRM
day-to-day. Permission roles in the data model: `owner`, `counter_staff`,
`lab_tech` — see [`08-roles-and-rls.md`](./08-roles-and-rls.md). Seed
list lives in `lib/mock/data.ts` → `TEAM`.

### P1 — Owner / Hatchery boss · "คุณสุเทพ"

**Auth role:** `owner`

**Day in the life.** Walks the tanks at dawn, opens the CRM on the iPad
on the desk, and wants three answers in 15 seconds:

1. How many farms are still in cycle today? (the dashboard 5/8 hero stat)
2. Whose cycle ends in the next 14 days — who do I call? (Restock page)
3. Did anything blow up overnight? (Alerts page)

**Lives on these pages.** Dashboard hero → Restock → Alerts. Rarely opens
Settings, never opens Data Export.

**Goals.**
- Prove our D30 is better than competitors → uses Scorecard for sales
- Never lose a customer to a competitor because we forgot to call them
- Spot bad batches early so we can react before reputation is damaged

**Frustrations.**
- LINE groups merge with personal chat
- Sales staff forget who restocks when
- Every farmer asks for PCR papers separately

**KPIs they care about.** D30 average, restock conversion %, customer LTV.

---

### P2 — Hatchery manager · "คุณนิภา"

**Auth role:** `counter_staff` (often co-`owner` in family hatcheries)

**Day in the life.** Runs the operational side. Logs every new batch the
moment it spawns, uploads PCR PDFs the lab returns, decides which lot goes
to which farm. Does most of the data entry the owner sees aggregated.

**Lives on these pages.** Batches list → Add Batch modal → Batch detail.
Also the customer detail page when scheduling deliveries.

**Goals.**
- Get a new batch registered in < 60 seconds (3-step Add Batch modal)
- Print/send PCR certificates without leaving the desk
- Match buyers to lots quickly

**Frustrations.**
- PCR PDFs stuck in email; certs printed and re-printed
- No single place for batch lineage (which lot went to which farm)

---

### P3 — Customer rep · "คุณรัตนา"

**Auth role:** `counter_staff`

**Day in the life.** The phone-and-LINE person. Opens Restock first thing,
sees the "ติดต่อด่วน" list (cycle ends today/tomorrow), and works it down.
For each farm: scan the LINE thread, send a quote, schedule a delivery.

**Lives on these pages.** Restock → Customer detail → Send-LINE / Quote
/ Schedule modals.

**Goals.**
- Never forget a callback (modal-based scheduling persists)
- Send branded quotes that look professional (Flex Message template)
- Know in one glance whether the farm is happy (last D30, status chip)

**Frustrations.**
- Forgets which farm she promised to call back
- Customers confused when she sends a quote from her personal LINE
- No visibility into whether the farm even read her message

**KPIs they care about.** Restock-to-conversion %, response time, quotes
sent vs. accepted.

---

### P4 — PCR / lab officer · "คุณพรชัย"

**Auth role:** `lab_tech`

**Day in the life.** Runs PCR tests on batch samples for WSSV, EHP, IHHNV,
TSV. Uploads results to the batch record. Most narrow user — does a single
job (Add Batch step 2 + Batch detail PCR section) and exits.

**Goals.**
- Upload a PCR PDF and tag the disease in 30 seconds
- Flag a batch as `pending` while results are being processed
- Trigger an alert if a result comes back positive

---

### P5 — Read-only auditor · "คุณมานพ"

**Auth role:** `auditor` *(planned, Phase H3)*

**Day in the life.** Compliance / auditor / accountant. Reads everything,
mutates nothing. Important because a future ASC certification flow will
let an external auditor see batch lineage without seeing customer LTV.

**Goals.**
- Read all batches and PCR records
- Cannot see commercial data (customer LTV, prices) — RLS-enforced
- Export read-only CSV for compliance reports

---

## External persona (LINE counterpart)

### P6 — Shrimp farmer · "พี่ชาติ" — uses the AquaWise farm app, NOT the CRM

**Auth role:** *none in the CRM*. Identified in code as
`line_users.line_user_id`, bound to `customers.line_id`.

**Critical context:** This persona does NOT log into the hatchery CRM.
They live on the farm-side AquaWise LINE bot (@aquawise OA) and the farm
app at `/liff/*`. Every cross-product flow ends here.

**Day in the life.**
- Reads the rich menu on @aquawise daily for weather/price/news
- Receives Flex Messages from hatcheries (branded with hatchery logo,
  "เปิดแชท" CTA) — looks like the hatchery is messaging them, but the OA
  is shared
- Opens "ข้อความของฉัน" rich-menu button → LIFF inbox listing every
  hatchery they've bought from → tap one → 1-on-1 chat thread *(Phase H3)*

**What they expect from the hatchery.**
- Heads-up when their cycle ends ("รอบที่แล้วของพี่ใกล้ครบ — ขอเสนอลอตใหม่")
- PCR certificate when their lot arrives
- Apology + remediation if a disease alert lands

**What they don't want.**
- Generic broadcasts that don't address them by farm name
- Multiple hatcheries shouting in the same chat
- A separate app to install (LIFF mini-pages stay inside LINE)

**Why this matters for the CRM design.**

Every hatchery action has a farmer-side reflection:

| Hatchery does this in CRM | Farmer experiences this |
|---|---|
| Click "ส่ง LINE" on a customer card | Receives co-branded Flex from @aquawise |
| Click "เสนอราคา" with cycle days + price | Receives quote Flex with "ตอบรับ" CTA |
| Register new batch with PCR result | Buyers of that batch get cert Flex |
| Close an alert | Affected farms get a follow-up acknowledgment |
| Nothing — just opens the app | Farmer can still send messages first via LIFF inbox *(Phase H3)* |

The CRM must be designed knowing the farmer is the person whose attention
matters most, even though they never see the dashboard.

---

## Influence persona (not a user)

### P7 — Association President · "P'Pong"

**Auth role:** `owner` of his own hatchery — but his **role in this
product** is brand-shaped, not feature-shaped.

**Why he's named.** P'Pong is the President of the Thai Shrimp Larvae
Hatchery Association in Chachoengsao and the first hatchery customer.
The CBBE doc places him at the center of the brand growth motion: AquaWise
spreads through associations, not digital ads. Owners trust other owners.
P'Pong's endorsement is what makes the next 25 hatcheries adopt.

**Implications for product decisions.**
- The public scorecard must look credible enough that an association
  member would be unembarrassed to put it on their counter.
- The brand voice must not embarrass him in front of his peers — no
  slick AI iconography, no "revolutionary" copy.
- The PCR certificate is the artifact most likely to circulate at
  association meetings; design it to be the kind of document an owner
  is proud to show.
- Crisis-moment behavior matters more than feature breadth: when a
  member gets blamed unfairly and AquaWise defends them with data,
  word travels.

P'Pong is not a user we build features *for*; he's a stakeholder whose
trust we cannot afford to lose. Treat any feature decision that he
might find embarrassing as a P0 stop.

---

## Persona × page matrix

| Page | Owner | Manager | Rep | Lab | Auditor |
|---|:-:|:-:|:-:|:-:|:-:|
| Dashboard hero | ★ | ✓ | ✓ | — | ✓ |
| Customers list | ✓ | ✓ | ★ | — | ✓ |
| Customer detail | ✓ | ✓ | ★ | — | — |
| Batches list | ✓ | ★ | — | ✓ | ✓ |
| Batch detail | ✓ | ★ | — | ★ | ✓ |
| Restock | ★ | — | ★ | — | — |
| Alerts | ★ | ✓ | ✓ | ✓ | ✓ |
| Scorecard | ★ | ✓ | ✓ | — | — |
| Settings → Profile | ★ | — | — | — | — |
| Settings → Notifications | ✓ | ✓ | ✓ | ✓ | — |
| Settings → Team | ★ | — | — | — | — |
| Settings → Data | ★ | ✓ | — | — | ✓ |
| Settings → Billing | ★ | — | — | — | — |

★ primary user · ✓ regular user · — never used

---

## Personas vs. auth roles

| Persona | Default `hatchery_members.role` | Notes |
|---|---|---|
| P1 Owner | `owner` | One per hatchery |
| P2 Manager | `counter_staff` (often `owner` in family hatcheries) | Co-admin pattern is common |
| P3 Rep | `counter_staff` | The most common role |
| P4 Lab | `lab_tech` | Narrow surface |
| P5 Auditor | `auditor` *(planned H3)* | Reserved in enum from day one |
| P6 Farmer | *no CRM role* | Auth via LINE Login; identified by `line_user_id` |
| P7 P'Pong | `owner` of his own hatchery | Influence persona, not a separate role |

Full RLS policies and the cross-tenant audit test in
[`08-roles-and-rls.md`](./08-roles-and-rls.md).
