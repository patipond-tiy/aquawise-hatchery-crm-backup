# 00 — Product Overview

## Jobs to be done

> Read this section first. If you ever lose the thread on what this
> product is for, come back here. Every feature in this folder must
> serve at least one of the five jobs below — or it doesn't belong in
> Phase H1. **"Slow is right"** (`07-brand-and-voice.md`) says we
> don't ship features that don't serve a job. This is how we enforce that.

### The core job

> **When** I run a shrimp hatchery in Thailand,
> **I want to** know what happens to my PL after the sale, defend my
> reputation when I'm blamed unfairly, and have my craft be visible to
> the customers I haven't met yet —
> **so that** I keep the farms I sell to, win the ones I don't yet, and
> stop being judged on word-of-mouth alone.

That's the brand promise from CBBE in JTBD form: *you will know · you
will be defended · you will be recognized.*

### The five functional jobs (drives every feature in `03-user-stories.md`)

| # | When (situation) | I want to (motivation) | So that (outcome) | Owner's words |
|---|---|---|---|---|
| **J1** | A customer hasn't reordered in a while | Know if their cycle's ending soon and reach out before a competitor does | I keep the customer | "ลูกค้าไม่กลับมา" |
| **J2** | A farmer says "your PL was bad" | Show evidence about that specific lot — PCR results, what other buyers saw, D30 across all farms that bought it | I'm not blamed unfairly | "เกษตรกรว่า PL ไม่ดี" |
| **J3** | A prospect or association peer asks how good I really am | Hand them a verifiable scorecard with externally-checkable numbers | I close on facts, not promises | "พิสูจน์ว่าโรงเพาะเราดี" |
| **J4** | I want to be a serious, modern operator | Run on a system instead of LINE groups + paper notebooks | I look as professional as I actually am | "อยากเป็นโรงเพาะที่จริงจัง" |
| **J5** | I want to grow beyond my existing customers | Have a public proof artifact a stranger can find or scan | New farmers reach out without a cold sales call | "อยากได้ลูกค้าใหม่" |

### Which features serve which job

| Job | Hatchery-CRM features that serve it |
|---|---|
| **J1** Keep customers | Restock pipeline · D30 trend per customer · Scheduled callbacks · Quote send (one-tap) · Daily restock cron |
| **J2** Defend reputation | Per-batch PCR results · Distribution-to-farm history · Auto-alert on cross-farm D30 dips · Customer activity panel |
| **J3** Prove quality | Public scorecard `/h/{slug}` · PCR certificate PDF · "Verified by AquaWise" stamp · D30 distribution chart on batch detail |
| **J4** Operate seriously | Multi-user team with roles · Branded co-Flex via @aquawise · Real notification settings · Audit-grade exports |
| **J5** Acquire customers | Public scorecard SEO + ISR · QR code on tank stickers / counter posters · Per-batch landing pages (Phase H3) |

### What we explicitly *don't* do (non-jobs)

Per `07-brand-and-voice.md` (anti-commitments) and the CBBE doc — calling
these out so a feature request that lands in one of these categories is
auto-rejected, not silently scoped:

- **We do not** sell to farmers. Farmer-facing surfaces are free, always.
- **We do not** charge per message, per cert, or per export. Flat
  hatchery subscription only.
- **We do not** white-label. The "Verified by AquaWise" stamp is the
  whole point — neutrality is the moat.
- **We do not** replace LINE for farmer chit-chat. We push branded Flex
  + (Phase H3) host the persistent thread; we don't try to capture
  social conversation.
- **We do not** sell hardware, IoT, or feed. Software + data only.
- **We do not** chase volume hatcheries who optimize for PL/day at any
  quality. Our buyer is the careful operator.
- **We do not** ship features without a hatchery customer asking for
  them. "Slow is right."

### How to use this section

- **Building a feature?** Name the job (J1–J5) it serves in the PR
  description. If you can't, reconsider the feature.
- **Reviewing a story in `03`?** Each story should map cleanly to one
  job. If it maps to "operational hygiene" or "we'll need it later,"
  it's a P3 candidate, not a P1.
- **Talking to a hatchery customer?** Use their words (right column
  above) — not "leverage AI to optimize cycle outcomes."

---

## Tagline & promise

> **The closed-loop trust system for Thai shrimp aquaculture.**
>
> *You will know what happened to your PL after the sale. You will be
> defended when blamed unfairly. Your craft will be recognized.*

That's the promise the brand team made to the hatchery owner — and it's
the lens every product decision in this folder is filtered through. Full
brand context lives in `docs/business-guide/aquawise-hatchery-cbbe (1).md`;
the engineering digest is in [`07-brand-and-voice.md`](./07-brand-and-voice.md).

## What this product is

**AquaWise Hatchery CRM** is a Thai/English SaaS for shrimp and fish
hatchery operators in Southeast Asia. A hatchery sells *post-larvae* (PL —
baby shrimp, about 12 days old) to many farms; each PL batch then grows
for ~110 days on the farm before harvest. The hatchery's reputation
depends on what happens *after* delivery — survival rate, disease
incidence, harvest weight — which is data they normally never see.

The CRM closes that loop. It is the hatchery owner's day-to-day cockpit for:

1. **Customer relationships** — every farm they sell to, with cycle status,
   D30 survival, lifetime value, and one-tap LINE messaging.
2. **Batch quality records** — every PL lot they produce, with PCR results,
   distribution to farms, and aggregate D30 outcomes (the trust ledger).
3. **Restock pipeline** — predicted re-order dates so reps can call the
   right farm at the right time.
4. **Disease & quality alerts** — flagged when D30 drops or pathogens are
   reported in the field, linked back to the source batch.
5. **Public scorecard** — a QR-code-shareable verified profile, branded
   AquaWise, that hatcheries put on tank stickers and Facebook posts.

## Who it's for

The target buyer is the **careful, modern, association-affiliated mid-sized
hatchery owner**: 40–60 years old, 15+ years in the industry, confident in
craft, wants their work to be seen. Not the volume player. Not the
disruptor. The kind of operator who shows up on time to association
meetings.

Five operational personas use the product day to day inside that owner's
hatchery — Owner, Manager, Rep, Lab Officer, Auditor — plus the **shrimp
farmer** (P6) on the other end of every LINE flow. Full personas in
[`01-personas.md`](./01-personas.md); the auth roles enforced in code
(`owner` / `counter_staff` / `lab_tech`) are in
[`08-roles-and-rls.md`](./08-roles-and-rls.md).

## Why this product exists

Today, hatcheries in Thailand run on:

- **A LINE group** with each farm (often replicated, no shared history)
- **Paper notebooks** for orders, PCR results, and follow-ups
- **Word-of-mouth reputation** with no verifiable evidence of D30 / survival

Three problems compound:

| Problem | Effect today | What the CRM does |
|---|---|---|
| No visibility into farm-side survival | Hatchery is blamed for farmer's mistakes; no way to disprove | D30 from farms flows back via the AquaWise farm app |
| LINE drowns in noise | Restock reminders get missed; deals lost to competitors | Predicted restock + one-tap branded Flex template push |
| No verifiable quality story | Every customer demands the same proofs verbally | Public AquaWise-verified scorecard + per-batch PCR cert |

## Heritage

AquaWise began in 2025 when **Chain** (Chulalongkorn computer engineering)
built VannameiVision — an AI grader for shrimp post-larvae quality — and
realized the harder problem was trust, not technology. He partnered with
**Dr. Chanati Jantrachotechatchawan** (Harvard molecular biology, King's
College PhD neuroscience, IBO 2006 gold medalist) and **Dr. Kobchai
Duangrattanalert** (Manchester PhD computational genetics) to build a
system that closed the loop between hatchery and farm. The first hatchery
to come on board was **P'Pong's** — President of the Thai Shrimp Larvae
Hatchery Association in Chachoengsao.

Everything since has been built on that foundation: **one province, one
association, one careful step at a time.**

## How we differentiate

Three structural commitments that competitors cannot copy without
contradicting their own model:

- **Closed-loop, both sides.** We track PL from sale to harvest on the
  hatchery *and* the farm. Single-sided products can't verify outcomes.
- **Farmers free, always.** Farmer-facing surfaces (LIFF, public
  scorecard, LINE Flex) never paywall. Structural commitment, not
  marketing.
- **Neutrality is the moat.** No equity from feed companies, hatchery
  groups, or integrators. No exclusive deals.

The contrast with the moving-fast-and-breaking-trust unicorn template is
explicit: AquaWise is **slow, steady, patient, plain-spoken, defensible**.
We don't chase venture-capital speed. The voice is "ลูกหลานที่เรียนมา" —
the educated younger relative who came back to help — not the slick
salesperson. See [`07-brand-and-voice.md`](./07-brand-and-voice.md) for
how that voice translates to UI strings, Flex copy, and certificates.

## Two-sided market

This product sits **between two existing AquaWise surfaces**:

```
┌────────────────────────────────┐         ┌──────────────────────────────┐
│  Hatchery CRM (this product)   │         │  AquaWise Farm App + LINE bot│
│  /th, /en — Next.js dashboard  │  ←──→   │  /liff/*, @aquawise OA       │
│  Used by: hatchery owner/staff │         │  Used by: shrimp farmers     │
└────────────────────────────────┘         └──────────────────────────────┘
        │                                              │
        └────────────── shared Supabase ───────────────┘
                  (one project, RLS by hatchery + farm)
```

The hatchery never calls the LINE Messaging API directly. It writes events
into a shared `line_outbound_events` queue, and the existing Cloud Run bot
service (already running for farm broadcasts) picks them up and pushes them
out, branded with the hatchery's logo. Two-way chat lives in a LIFF mini-app
("ข้อความของฉัน" inbox button on the LINE rich menu) so the persistent
conversation runs on a surface AquaWise controls — not lost in LINE chat.
**Note**: full two-way chat is deferred to Phase H3; Phase H1 ships
send-only Flex.

See [`05-line-integration.md`](./05-line-integration.md) for the full picture.

## Stack & constraints

- **Next.js 16 + React 19 + TS 5**, App Router with `/th` and `/en` locales
  (Thai is the source-of-truth language; default route is `/th`)
- **Tailwind 4** + custom V3 component library (`components/aw/*`)
- **Supabase** (Postgres + RLS) — schema in `supabase/migrations/`
- **TanStack Query** for server cache, **Zustand** for the modal stack only
- **Mock-first**: `USE_MOCK=true` gives the entire app a fake backend; flip
  the env var to point at Supabase. Pages import only from `lib/api`, the
  facade — they never know which is live.
- **i18n**: all strings live in `messages/{en,th}.json`; missing keys show
  `⚠️ {key}` in dev to make gaps loud.

## Non-functional commitments

The business team's FR doc commits to specific NFR budgets. Engineers
should treat these as gates, not aspirations. Full text:
`docs/business-guide/aquawise-hatchery-functional-requirements (2).md`.

| Category | Commitment |
|---|---|
| **Performance** | Dashboard ≤ 2s on 4G · PCR cert generation ≤ 5s · Quote send (DB + queue) ≤ 1s · Batch creation w/ 10 PCR rows ≤ 3s |
| **Security** | RLS on every tenant-scoped table (P0) · Stripe webhook verified with live secret · Magic-link 24h expiry · Invite token 7d default · No hardcoded secrets · Audit trail for all data exports |
| **Accessibility** | WCAG 2.1 AA · color is never the sole indicator of state (icon + text required) · keyboard navigation on all interactive elements |
| **i18n** | Thai-first, English secondary · all UI strings in `messages/{th,en}.json` (no hardcoded literals) · per-locale number + date formatting · CI fails if either file has keys the other lacks |
| **Scalability** | Multi-tenant via RLS · Supabase connection pooling · Cron fan-out via Cloud Run · LINE worker scaled horizontally · signed URLs for all Storage access |
| **Observability** | Every LINE push logged in `line_message_logs` · dead-letter UI for `status='dead'` (P2) · cron error logs streamed to Cloud Logging |
| **Brand health** | EOY-2026 KPIs in CBBE doc — 80% aided awareness in beachhead, 99%+ data accuracy, 9/10 uptime, 4.5/5 quality rating |

## What "done" means for production

The prototype is **visually complete and navigationally complete**. ~70% of
the buttons do something real (open a modal, run a mutation, show a toast),
~20% are toast-only "fake success" stubs, and ~10% are dead inputs. See
[`02-feature-inventory.md`](./02-feature-inventory.md) for the breakdown.

Production-readiness means:

- Every wired button hits Supabase, not the in-memory mock
- Every toast-only button does the real thing (LINE push, PDF generation,
  CSV export, certificate render)
- Every dead input is either wired or removed (no fake fields)
- A real LINE bind flow + outbound queue is shipping branded Flex
  messages, and farmer replies show up in the hatchery's inbox
  (Phase H1 = send-only; Phase H3 = full two-way)
- Stripe billing gates the trial properly (read-only with banner when
  expired — not full lockout)
- Multi-tenant RLS is verified — one hatchery can never see another's data

The punch-list is in [`06-production-gap.md`](./06-production-gap.md).
