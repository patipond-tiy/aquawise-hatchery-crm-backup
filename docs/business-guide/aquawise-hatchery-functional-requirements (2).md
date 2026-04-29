# AquaWise Hatchery Channel — Functional Requirements
## For the Design Team

**Purpose:** This document specifies *what* needs to be built for the hatchery channel, *who* uses each surface, and *where* each surface lives (LINE, LIFF, or webapp). It is intentionally agnostic about visual design — the design team owns layout, hierarchy, micro-interactions, and aesthetic. This document defines the functional skeleton; the design team puts skin on the bones.

**Audience:** Design team (Flex Message designers, UX designers, web app designers).

**Reading order:** Sections 1–4 are required context before starting any design work. Sections 5–7 are the surface-by-surface specs you can pick up individually. Section 8 onward is governance.

---

## 1. Design Constraints That Are Not Negotiable

The design team owns visual decisions. The items below are not visual decisions — they are product decisions. Please respect them as constraints, not suggestions.

**Brand palette (use these; the rest is yours):**

- **Logo Blue: `#004AAD`** — primary brand, anchors, CTAs.
- **Dark Cyan: `#008B8B`** — secondary, for "data" and "trust" surfaces (scorecards, certificates).
- A neutral grayscale of your choice for body / surfaces / dividers.
- One semantic green for success, one semantic amber for warning, one semantic red for danger — your call on the exact tones, but they must be distinguishable for users with red-green color vision deficiency.

**Typography — two-tier system:**

AquaWise runs two type stacks. Use the right one for the surface you are designing.

- **Product stack (CRM, LIFF, dashboards, LINE Flex Messages with data, batch register, scorecard):** Inter + Noto Sans Thai + JetBrains Mono.
    - *Inter* — Latin headlines and body. Chosen for its tabular numerals and small-size legibility on dense data screens.
    - *Noto Sans Thai* — all Thai text. Its x-height is metrically tuned to pair with Inter, so mixed Thai/English strings (e.g., *"Batch B-2026-04-117 รอด 78%"*) sit on one cohesive baseline.
    - *JetBrains Mono* — for batch IDs, customer codes, any reference number that benefits from monospaced rendering.
- **Brand stack (QR poster, batch certificate PDF, marketing surfaces, pitch decks, the AquaWise website):** Plus Jakarta Sans + Inter + Noto Sans Thai.
    - *Plus Jakarta Sans* — display and headlines. Slightly more expressive and warm; carries the brand voice on surfaces where personality matters more than data density.
    - *Inter* — body text on brand surfaces.
    - *Noto Sans Thai* — Thai text, same as the product stack.

**The deliverables in this document split as follows:**
- Product stack: F2 Welcome bot, F3 Daily price feed, F5 Cycle progression, F6/F7 Survival prompts, F8 Harvest reporting, F9 Cross-farm context, H1 LIFF entry, H2–H10 webapp surfaces.
- Brand stack: F1 QR poster, F4 Batch certificate (the certificate is a brand artifact even though it is delivered through LINE; farmers forward it as a status object, so it gets the brand stack).

Thai is the default language. Thai will dominate every farmer-facing surface and most hatchery-facing surfaces. English is the secondary language.

**Language priority:**

- Thai-first for everything farmer-facing. English is invisible on farmer surfaces unless explicitly toggled.
- Bilingual Thai/English on hatchery webapp — Thai default, English toggle in header.
- Numerals: Arabic numerals (0–9) everywhere. No Thai numerals (๐–๙).

**Audience reality check:**

- **Farmers** are 35–65 years old, often working with calloused hands and a phone in bright sun. Type is large. Tap targets are large. Cognitive load is low. Steps are few.
- **Hatchery counter staff** are processing a sale in 30 seconds while a customer waits. Forms must be one screen, one scroll maximum. No tabs. No "advanced" expansions.
- **Hatchery owners** sit at a desk with a laptop and a coffee. They will tolerate slightly more density and complexity, but they are not enterprise software users — they are SME owners.

**The ease-of-use principle:**

If a surface requires more than 10 seconds of explanation, it is too complex. If a Flex Message has more than 3 primary actions, it is too cluttered. If a webapp page has more than one primary task, it is two pages. When in doubt, remove things.

**One non-rule:** *Never* let visual polish substitute for functional clarity. AquaWise is a trust product. Trust comes from clarity, predictability, and honesty in the interface. Beautiful but confusing is worse than ugly but obvious.

---

## 2. Platform Decision Framework — LINE vs LIFF vs Webapp

Three platforms are in play. Each surface in this document is assigned to exactly one platform. Here is how the assignment was made.

| Platform | Use it for | Do not use it for |
|---|---|---|
| **LINE OA messages (text + Flex)** | Push notifications, daily content, receipts, certificates, single-tap responses, conversations | Anything requiring file uploads, anything needing tabular data, anything taking more than ~30 seconds |
| **LINE LIFF** (LINE-embedded webapp) | Tasks that need a small form *inside* LINE — e.g., counter staff entering a batch in 15 seconds without leaving LINE | Long workflows, dashboards, anything the user returns to repeatedly |
| **Standalone webapp** (browser, mobile + desktop) | Dashboards, batch registers, file uploads, multi-step workflows, anything the hatchery owner uses sitting at a desk | Anything that requires the user to install something or remember a URL daily |

**The principle:** Farmers live in LINE. They do not visit websites. Anything farmer-facing must work inside LINE without the farmer ever leaving the LINE app. Hatchery counter staff use phones; their flow is LINE LIFF. Hatchery owners use laptops; their flow is the webapp.

**The exception:** A QR scan that creates a LINE friend is the only "outside LINE" moment the farmer has, and it lasts ~2 seconds.

---

## 3. User Roles

There are five distinct users in this system. Designs must serve all five without confusing any of them.

| Role | Who they are | Primary device | Primary surface | Visit frequency |
|---|---|---|---|---|
| **Farmer** | Shrimp pond operator, 35–65 years old, mostly Thai | Smartphone (Android-dominant) | LINE OA | Daily |
| **Hatchery counter staff** | Front-desk seller at the hatchery, processing PL sales | Smartphone | LINE LIFF | Per sale (~5–20 times per day during peak) |
| **Hatchery owner / manager** | SME owner, 40–60 years old, knows their business deeply | Laptop + smartphone | Webapp | Daily |
| **Hatchery lab tech** | Person uploading PCR results, stress test data | Laptop primarily | Webapp | A few times per week |
| **AquaWise admin (us)** | Internal — early phase manual ops | Laptop | Webapp (admin section) | Daily |

The first four are external users. The admin role exists, but admin tools are out of scope for this design package — we will use a simpler internal tool.

---

## 4. Phased Delivery — What to Design First

The build is phased. Design should be phased too. Do not design Phase H3 surfaces in week one.

| Phase | Target window | Surfaces in this phase | Design priority |
|---|---|---|---|
| **H1** | Month 1–4 | F1, F2, F3, F6, F7, H1, H2, H3 | **Design first.** Ship by week 4. |
| **H2** | Month 3–6 | F4, F5, F8, H4, H5, H6, H7 | Design weeks 5–10. |
| **H3** | Month 6–12 | F9, H8, H9, H10 | Design later. Notes only for now. |

(Surface IDs are defined in Sections 5 and 6.)

This phasing is not a suggestion. Designing H3 surfaces before H1 ships will distract the team and produce designs based on a dataset volume we do not have yet. Stay disciplined.

---

## 5. Farmer-Side Surfaces

All farmer surfaces live inside LINE. The farmer never opens a browser, never installs an app, never creates an account. Their identity *is* their LINE account.

### F1. QR Onboarding Flow
- **Phase:** H1
- **Platform:** External QR poster → LINE friend-add
- **User:** Farmer, at the hatchery counter, while paying for PL.
- **User goal:** Scan the QR, become a LINE friend of AquaWise, and be enrolled in their cycle automatically — without any typing.
- **Functional requirements:**
    - QR sticker design at A4 size, single-page, printable on a desktop printer at any hatchery.
    - The QR must add the farmer to the AquaWise LINE Official Account.
    - The poster headline must promise something concrete: a free Day-30 and Day-60 survival report. Not "scan to learn more."
    - Below the QR: a 1-line instruction in Thai, a 1-line instruction in English (in case the farmer doesn't read Thai script confidently — some Cambodian and Burmese workers also handle PL purchases).
- **Design team output:** The QR poster artwork. A4 printable PDF.
- **Edge cases:**
    - Farmer scans but doesn't add as friend → no follow-up possible. Acceptable; they can scan again.
    - Farmer is already a friend → bot should welcome them back, not duplicate-add.
    - Multiple farmers scan from one phone → handle each as an independent friend-add.

### F2. Welcome & First-Touch (Bot Conversation)
- **Phase:** H1
- **Platform:** LINE OA — text + Flex
- **User:** Farmer who just scanned the QR.
- **User goal:** Understand within 5 seconds what AquaWise is, what they will get, and what they need to do next.
- **Functional requirements:**
    - First message: warm, non-corporate Thai greeting. Identifies AquaWise as a service that helps shrimp farmers, in plain language. Does not say "AI" or "platform."
    - Asks for the farmer's name and the farm name in two separate messages. Free-text capture; no forms.
    - Asks farm location at province level (province-picker, not GPS — many farmers will not grant location permission).
    - Confirms the cycle that the hatchery just registered: "เราเห็นว่าคุณเพิ่งซื้อ PL จาก [hatchery name] วันนี้ จำนวน [X] ตัว ใช่มั้ยครับ?" with two buttons (yes / no, this isn't right).
    - Sets expectations for what comes next: daily prices, a check-in at Day 30, a check-in at Day 60.
- **Design team output:** A series of Flex Messages and rich messages for this onboarding sequence. The number of bubbles is your call — fewer is better.
- **Tone:** Warm, humble, ลูกหลานที่เรียนมา. Use "เรา" not "คุณ." See `linkedin-ceo-voice` skill notes for tone reference.

### F3. Daily Price Feed (Push Notification)
- **Phase:** H1
- **Platform:** LINE OA — Flex Message, broadcast daily
- **User:** All farmers in the LINE OA, regardless of whether they have an active cycle.
- **User goal:** See today's farm-gate shrimp price for major sizes (40, 50, 60, 70, 80) at a glance, with context (vs yesterday, vs 3-year average).
- **Functional requirements:**
    - One Flex bubble per day, sent at the same time each morning (8:00 AM is the working assumption — confirm with team).
    - Must show: today's date, price by size category, change from yesterday (▲▼), context note ("ราคาเฉลี่ย 3 ปีย้อนหลัง").
    - Source citation footer ("ที่มา: สมุทรสาคร" or whichever benchmark we are using that day).
    - A single CTA at the bottom — currently undecided whether this should link to a deeper price view or to a "share with friends" function. Design both options; we will pick one.
- **Design team output:** Daily price card Flex Message (one or two variants for A/B testing).
- **Tone:** Honest. If the price is bad, the card says so without spin. The card never sells anything.

### F4. Batch Certificate (Flex Message, received from hatchery)
- **Phase:** H2
- **Platform:** LINE OA — Flex Message, triggered by hatchery action
- **User:** Farmer, at the moment the hatchery confirms the sale and generates the certificate.
- **User goal:** Receive a clean, shareable, official-feeling document confirming what they bought.
- **Functional requirements:**
    - Triggered automatically when a hatchery completes a batch entry (see H1).
    - Must show: hatchery name, batch ID, PL count, source broodstock line, PCR clean-status (✅/❌ for EHP, WSSV, IHHNV, AHPND, TPD), pack date, an AquaWise verification stamp.
    - One CTA: "บันทึกใบรับรอง" (save certificate) — opens a PDF version they can save or forward.
    - PDF version is the same content, formal layout, downloadable.
- **Design team output:**
    - The Flex Message version (LINE-native).
    - The PDF version (formal one-page layout). Both must use the same data fields and feel like the same product.
- **The trust signal:** This is the moment the farmer realizes AquaWise is a serious thing. The certificate must look authoritative — not slick like a marketing email, not bureaucratic like a government form. Authoritative.

### F5. Cycle Progression Updates
- **Phase:** H2
- **Platform:** LINE OA — Flex Message, triggered weekly
- **User:** Farmer with an active cycle.
- **User goal:** Be reminded where they are in the cycle and what's coming next.
- **Functional requirements:**
    - One Flex card per week per active cycle. (Farmers with multiple ponds may have multiple cycles; the design must handle a farmer receiving 2–3 of these in a single week.)
    - Must show: day-of-cycle, expected size, next expected milestone (e.g., "Day 30 survival check coming in 8 days"), one piece of contextual content (a tip, a weather note, a price reminder).
    - No interaction required by default. The farmer reads and moves on. Optional CTA: "บันทึกขนาดวันนี้" (log today's size).
- **Design team output:** The weekly cycle update Flex Message.

### F6. Day-30 Survival Report Prompt
- **Phase:** H1
- **Platform:** LINE OA — Flex Message + bot conversation
- **User:** Farmer, on Day 30 of an active cycle.
- **User goal:** Tell us their estimated survival rate in less than 30 seconds, and feel good about doing so.
- **Functional requirements:**
    - Push at Day 30 (configurable per farmer based on stocking date in cycle record).
    - The prompt must lead with empathy, not interrogation. "ครบ 30 วันแล้วครับ — ประมาณกุ้งรอดกี่ % ครับ?"
    - Single-tap response: a horizontal scroller of percentage chips (50%, 60%, 70%, 80%, 90%, 100%, "ไม่แน่ใจ").
    - "ไม่แน่ใจ" path: a follow-up message that says "ไม่เป็นไรครับ บอกประมาณก็พอ — มากกว่า 70% หรือน้อยกว่า?" Two buttons.
    - After response: a short, contextualized reply that compares to the area average ("ฟาร์มในแถวนี้เฉลี่ย 76% ครับ คุณอยู่ในกลุ่มดี" or "ต่ำกว่าค่าเฉลี่ยนิดหน่อย — มาดูกันว่าทำไม") *only if we have enough nearby data to be honest*. Otherwise, a generic acknowledgment.
- **Design team output:** The Day-30 prompt Flex Message + the chip-style response options + the follow-up acknowledgment cards.
- **Sensitive:** A bad survival rate is emotional. Do not celebrate, do not condescend. The bot is a co-worker, not a coach.

### F7. Day-60 Survival Report Prompt
- **Phase:** H1
- **Platform:** LINE OA — Flex Message + bot conversation
- **User:** Same as F6.
- **Functional requirements:** Same as F6, but at Day 60. Slightly different content (size estimate also requested), same interaction model.
- **Design team output:** The Day-60 variant. Reuse F6 components where possible.

### F8. Harvest Reporting
- **Phase:** H2
- **Platform:** LINE OA — Flex Message + bot conversation
- **User:** Farmer, on or after harvest day.
- **User goal:** Tell us how the harvest went — total weight, average size, survival, sale price — in under 2 minutes.
- **Functional requirements:**
    - Triggered when bot detects a likely harvest (Day 100+, or farmer mentions harvest in conversation).
    - Multi-step but each step is a single tap or a single number.
    - Steps: 1) "จับแล้วใช่มั้ยครับ?" (yes/no/not yet) 2) "ได้กี่ตัน/กก.?" (free number) 3) "ขายไซส์อะไร?" (chips: 40/50/60/70/80) 4) "ราคาเท่าไหร่?" (free number) 5) "ขายให้ใครครับ?" (chips: list of nearby ล้ง + "อื่นๆ").
    - After completion: thank-you message + a summary card showing what they reported + a teaser of what's coming for next cycle.
- **Design team output:** The full harvest reporting flow — every step's Flex Message + acknowledgment + summary card.

### F9. Same-Batch Cross-Farm Context (Phase H3)
- **Phase:** H3
- **Platform:** LINE OA — Flex Message, triggered by farmer disputing batch quality
- **User:** Farmer who has just reported a poor result and indicated they suspect the PL.
- **User goal:** See objective data about how the same batch performed at other farms — to understand whether it's the batch or their pond.
- **Functional requirements:**
    - Triggered when farmer reports survival <50% AND mentions PL/batch/hatchery in conversation.
    - Shows anonymized cross-farm view: "ลูกพันธุ์ batch นี้ขายให้ฟาร์ม [N] ฟาร์ม — เฉลี่ยรอด [X]%, ฟาร์มของคุณรอด [Y]%."
    - Includes a contextual factor analysis: "ฟาร์มที่รอดสูง vs ของคุณ ต่างกันที่: [pH variance, salinity, ฯลฯ]."
    - Does not blame anyone. Presents data and lets the farmer interpret.
- **Design team output:** A Flex Message that conveys uncomfortable truth gracefully. This is the hardest design problem in the document.

---

## 6. Hatchery-Side Surfaces

Hatcheries have three sub-roles (counter staff, owner/manager, lab tech). Each uses different surfaces. The design team should treat them as different users even though they belong to the same organization.

### H1. Counter Batch Entry (LIFF)
- **Phase:** H1
- **Platform:** **LINE LIFF** — embedded webapp inside LINE.
- **Why LIFF:** Counter staff already have LINE open. They don't want to open a browser, log into a webapp, and switch back. LIFF is a 1-second context.
- **User:** Hatchery counter staff, during a sale.
- **User goal:** Enter a new batch + customer assignment in **15 seconds or less**, while the customer is paying.
- **Functional requirements:**
    - One screen, no scroll. Three input groups maximum.
    - Inputs: (1) Customer LINE — auto-captured if customer scanned the QR poster, otherwise typed/searched (2) Batch ID — typed (3) PL count — number input (4) Pond ID at customer farm — optional.
    - One submit button. Big.
    - On submit: the cycle is created; the customer (if connected) gets the cycle confirmation in their LINE; the staff sees a green checkmark and is ready for the next sale.
    - Recent batches dropdown: if the staff has been entering the same batch ID all morning, it should be at the top of a recent-list.
- **Design team output:** The single-screen LIFF entry form. Plus the success state. Plus the error states (network failure, customer not found, duplicate cycle).
- **The 15-second test:** Time yourself. If a fluent Thai speaker takes longer than 15 seconds to complete this form on the second try, the design has too many inputs. Cut.

### H2. Hatchery Dashboard Home
- **Phase:** H1
- **Platform:** **Webapp** — responsive (works on laptop and phone).
- **User:** Hatchery owner / manager, daily.
- **User goal:** Get a 30-second read on the state of their business: customers in the system, active cycles, who's approaching restock, recent batch performance.
- **Functional requirements:**
    - Dashboard structure: top KPIs row, then two main panels — "Customers and cycles" and "Recent batch performance."
    - Top KPIs (numbers, no charts): customers acquired this month, active cycles, cycles approaching harvest (last 30 days of cycle), average Day-30 survival across recent batches.
    - "Customers and cycles" panel: a sortable list. Each row shows customer name, farm, current cycle day, expected harvest date, current Day-30 survival (if reported). Sortable by cycle day descending (default — those closest to harvest at the top).
    - "Recent batch performance" panel: list of recent batches with mean Day-30 survival, number of farms, and a small distribution indicator.
    - One primary CTA in header: "Add new batch" (jumps to H5 batch register entry).
- **Design team output:** The full webapp dashboard layout. Empty state, populated state, sad state (when there's a bad batch).
- **Density principle:** This is a hatchery owner's dashboard, not a Bloomberg terminal. A first-time visitor should be able to read it without explanation.

### H3. Customer & Cycle List
- **Phase:** H1
- **Platform:** Webapp.
- **User:** Hatchery owner / manager.
- **User goal:** See every customer they've ever sold to, find a specific one, see their cycle history.
- **Functional requirements:**
    - Searchable, filterable list. Columns: customer name, farm, total batches purchased, last purchase date, lifetime value (estimated), current cycle status.
    - Filters: active cycles only, customers with poor recent survival, customers approaching restock window, customers gone quiet (no purchase in 6+ months).
    - Click a customer → goes to H4 (customer detail).
- **Design team output:** The list page + filter UI + empty/loading states.

### H4. Customer Detail
- **Phase:** H2
- **Platform:** Webapp.
- **User:** Hatchery owner / manager.
- **User goal:** See everything about one customer — their farm, their cycles, batches purchased, survival history.
- **Functional requirements:**
    - Header: customer name, farm name, location, contact (LINE), tenure ("Customer since [date]").
    - Cycle history: chronological list of cycles, each showing batch ID, PL count, Day-30 survival, Day-60 survival, harvest outcome.
    - "Send a message" CTA — opens a draft message back in LINE. (Not an in-app messaging system; we don't compete with LINE.)
    - Restock prediction widget: if cycle is in late stage, shows "Likely to restock in [X] days."
- **Design team output:** The customer detail page.

### H5. Batch Register
- **Phase:** H2
- **Platform:** Webapp (with file upload capability — this is why it's not LIFF).
- **User:** Hatchery lab tech (primarily), or owner.
- **User goal:** Record a new batch with full lab data and PCR results.
- **Functional requirements:**
    - Form structure: batch metadata (ID, source broodstock line, pack date, PL count produced) + lab uploads (PCR reports as PDF/image, stress test results as numbers, photos of the batch — optional but encouraged).
    - File uploads: PDF, JPG, PNG accepted; max 10 MB each.
    - Auto-fill where possible: source broodstock line should remember the last used; pack date should default to today.
    - On submit: batch is created in register; can now be referenced in H1 counter entry; certificate generation becomes available in H6.
- **Design team output:** The batch register entry page + the batch list view (separate page or tab — your call).

### H6. Batch Detail & Certificate Generator
- **Phase:** H2
- **Platform:** Webapp.
- **User:** Hatchery owner / manager.
- **User goal:** Inspect a batch, generate a certificate, see how the batch is performing across customer farms.
- **Functional requirements:**
    - Header: batch ID, source broodstock, pack date, PL count produced, PL count sold (running tally).
    - Lab data section: PCR results (badges showing clean/positive), stress test scores, photos.
    - Customer assignments: list of farms that received this batch, with their current cycle status and Day-30 / Day-60 / harvest outcomes.
    - "Generate certificate" CTA: triggers F4 to all customers who received this batch (or has been already triggered automatically — design team to confirm with PM).
    - Performance summary: mean Day-30 survival, distribution chart, comparison to hatchery's recent average.
- **Design team output:** The batch detail page.

### H7. Restock Timing Predictor
- **Phase:** H2
- **Platform:** Webapp.
- **User:** Hatchery owner / manager + sales staff.
- **User goal:** Get a prioritized call list of customers about to need PL.
- **Functional requirements:**
    - A list, sorted by predicted reorder date.
    - Each row: customer name, current cycle day, expected harvest date, predicted reorder date, expected PL volume (based on prior pattern), confidence indicator.
    - "Mark as called" / "Mark as reordered" actions — for the hatchery to track their own follow-up.
    - Filter by zone, by cycle stage, by predicted volume.
- **Design team output:** The restock predictor page. This is the highest-ROI feature for the hatchery — design with care.

### H8. Hatchery Scorecard (Phase H3)
- **Phase:** H3
- **Platform:** Webapp — and a separate public version (URL-shareable).
- **User:** Hatchery owner (private view) + farmers, brokers, association (public view).
- **User goal (private):** See own scores, benchmark against association.
- **User goal (public):** Verify a hatchery's quality before purchasing.
- **Functional requirements:**
    - Private view: full breakdown — Day-30 survival distribution, harvest survival distribution, ADG, batch-level performance over time, association benchmark, top-quartile threshold.
    - Public view: hatchery name, AquaWise verification stamp, headline metric (mean Day-30 survival, sample size, period), association comparison (just whether above/below median, no exact rank).
    - Consent toggle: hatchery can opt in/out of public scorecard. Opt-out is itself visible (i.e., "this hatchery is in the AquaWise system but has not opted into the public scorecard").
    - "Share scorecard" CTA: copies a public URL.
- **Design team output:** Both views. The public view is the more important design challenge — it must look authoritative and uncomplicated.

### H9. Disease Traceback Alert (Phase H3)
- **Phase:** H3
- **Platform:** Webapp + LINE OA notification to hatchery.
- **User:** Hatchery owner.
- **User goal:** Know immediately if an outbreak at a customer farm could trace back to a batch they sold.
- **Functional requirements:**
    - Webapp surface: a focused alert page showing the affected batch, customers who received it, their current cycle status, recommended outreach actions.
    - LINE notification: a Flex Message that pushes to the hatchery's LINE the moment an outbreak signal hits a threshold.
    - This is a sensitive feature. The alert is to the *hatchery*, not the public. Public disclosure is a separate (manual) decision.
- **Design team output:** The webapp alert page + the LINE notification.

### H10. Hatchery Settings & Preferences
- **Phase:** H2 (basic) → H3 (full)
- **Platform:** Webapp.
- **User:** Hatchery owner.
- **User goal:** Manage their account, set preferences, control sharing.
- **Functional requirements:** Account info, notification preferences (email/LINE/both), public scorecard opt-in/out, data export, billing.
- **Design team output:** Settings pages.

---

## 7. Hatchery Onboarding Flow

This is a meta-surface that connects multiple H surfaces. Worth calling out separately.

- **Phase:** H1
- **Platforms:** Webapp (primary) + LINE LIFF (counter staff handoff).
- **User:** Hatchery owner, during onboarding (in-person or remote with AquaWise team).
- **User goal:** Go from "agreed to pilot" to "first batch entered, first customer onboarded" in under 30 minutes.
- **Functional requirements:**
    - Step 1: Owner signs up via webapp. Receives login.
    - Step 2: Owner enters basic hatchery profile (name, location, capacity, broodstock sources).
    - Step 3: Owner downloads QR poster (auto-generated, includes hatchery name).
    - Step 4: Owner adds counter staff (sends a LINE invite link that opens LIFF directly).
    - Step 5: First batch test entry — owner walks through with AquaWise team present in early pilots.
- **Design team output:** A guided onboarding flow on the webapp. Should feel like a welcome wizard, not a settings menu.

---

## 8. Cross-Cutting Requirements

These apply to every surface above.

**Authentication:**
- Farmer: LINE identity is the only identity. No password. No email.
- Hatchery webapp: email + password login. Optional LINE Login as a faster path.
- Hatchery LIFF: LINE identity, scoped to the hatchery via invite.

**Notifications:**
- Farmer notifications: LINE only.
- Hatchery notifications: LINE for time-sensitive (disease alerts, restock prompts), email for digest summaries (weekly performance), in-app for everything else.
- Notification preferences: farmer can mute the daily price feed without leaving the LINE OA. Hatchery can configure notification channels per type.

**Loading and empty states:**
- Every list, every dashboard, every chart must have an explicit empty state. The empty state is *content*, not a placeholder. It tells the user what they will see once data exists and what they can do to start populating it.

**Error handling:**
- Errors must speak the user's language (Thai for farmer, Thai/English for hatchery), not API codes.
- Network errors must be recoverable — saved drafts, retry buttons, never silent data loss.

**Accessibility:**
- Minimum tap target 44×44 pt on mobile.
- Color contrast WCAG AA at minimum.
- Body text ≥ 16 pt on farmer surfaces (older eyes).
- Test at least one design with a real ~55-year-old user before shipping.

**Performance budget:**
- LINE Flex Messages must render within LINE's payload limits.
- Webapp pages: time-to-interactive < 3 seconds on 4G.
- LIFF batch entry: time-to-input < 1.5 seconds from open.

**Localization:**
- Farmer: Thai only in V1. (Future: Burmese, Khmer for migrant labor.)
- Hatchery: Thai default, English toggle. Both translations must be reviewed by a native speaker — the hatchery world has trade-specific vocabulary that machine translation will get wrong.

---

## 9. Anti-Features — What NOT to Design

Save the team time by knowing what is out of scope.

- ❌ A farmer mobile app. We are not making one. LINE is the app.
- ❌ A messaging system inside the hatchery webapp. LINE handles communication; we don't compete with LINE.
- ❌ A marketplace UI in the hatchery webapp. Marketplace is a separate phase, separate doc.
- ❌ Hatchery-to-hatchery comparison features (until H3). We do not show one hatchery another hatchery's data.
- ❌ Real-time live anything. There is no real-time monitoring. There is no live chat. There are no live alerts measured in seconds. Everything is reasonable cadence.
- ❌ "Power user" advanced views. AquaWise has no power users. If a feature requires advanced UI, it is the wrong feature.
- ❌ Dark mode. Not yet. Maybe later. Light theme only for V1.
- ❌ Customization, theming, white-labeling. Every hatchery sees the same AquaWise. Brand consistency is a trust signal.

---

## 10. Design Principles (Use These When in Doubt)

These are the principles to apply when this document does not give you the answer.

1. **Trust over cleverness.** A boring design that is honest beats a beautiful design that is confusing. Every visual decision should make the user feel: "this product is not trying to trick me."

2. **Thai-first.** Every design is reviewed in Thai before English. Layouts that look balanced in English often break with longer Thai strings — design for Thai length, then English will fit.

3. **One job per screen.** If a screen does two things, it is two screens.

4. **The lowest-skill user wins.** The grandfather farmer in Chachoengsao is the design target. If the grandfather can't do it, the design is wrong.

5. **Empty is not a failure state.** Every empty state is an opportunity to teach the user what comes next.

6. **Every number must cite its source.** Charts with unattributed numbers feel like marketing. Charts with sources feel like journalism. We are journalism.

7. **Aesthetic discipline.** Logo Blue is the protagonist. Dark Cyan is the supporting role. Everything else is gray. Color used for emphasis is precious; spend it carefully.

8. **The interface should feel a little humble.** Not slick. Not minimalist-flexing. Just calm, confident, careful — like the ลูกหลานที่เรียนมา persona of the bot itself.

---

## 11. Deliverables Checklist (For Project Tracking)

By end of Phase H1 design sprint, the design team is expected to deliver:

**Farmer side:**
- [ ] F1 — QR poster (PDF, A4, print-ready)
- [ ] F2 — Welcome bot conversation (Flex bubbles + text scripts)
- [ ] F3 — Daily price card Flex Message (1–2 variants)
- [ ] F6 — Day-30 prompt + response chips + acknowledgment cards
- [ ] F7 — Day-60 variant of F6

**Hatchery side:**
- [ ] H1 — LIFF counter batch entry (single screen + states)
- [ ] H2 — Hatchery dashboard home (full layout + empty/populated/sad states)
- [ ] H3 — Customer & cycle list (list + filter UI + states)

By end of Phase H2 design sprint:
- [ ] F4, F5, F8 (farmer side)
- [ ] H4, H5, H6, H7 (hatchery side)
- [ ] Hatchery onboarding wizard

By end of Phase H3 design sprint:
- [ ] F9 (farmer side)
- [ ] H8, H9, H10 (hatchery side)

---

## 12. Open Questions for the Design Team

Before starting, please flag concerns or ask about:

1. Are there LINE Flex layout patterns that would be costly to maintain at scale (e.g., custom assets per message)? If so, propose a component library.
2. For the hatchery webapp — should we use a pre-existing component library (shadcn/ui, etc.) to ship faster, or design custom from scratch? Tradeoff between speed and brand uniqueness.
3. Counter staff phone diversity — are we designing for older Android devices? If so, what's our minimum target spec?
4. The F9 cross-farm context Flex is the hardest design problem in this doc. If it cannot be designed gracefully in V1, recommend deferring rather than shipping a clumsy version.

---

## 13. Final Note

This document tells you *what* to build, *who* uses it, and *where* it lives. It does not tell you what it should look like. The design team owns visual quality, hierarchy, micro-interactions, and aesthetic. We will trust your craft.

The one thing we will be unforgiving about is **clarity**. AquaWise is a trust product in a market that has been burned by overpromising platforms (eFishery is the recent example). Every farmer, every hatchery, every broker who interacts with AquaWise must walk away thinking: "this product told me the truth in a way I could understand."

Design for that.

---

*End of functional requirements.*
