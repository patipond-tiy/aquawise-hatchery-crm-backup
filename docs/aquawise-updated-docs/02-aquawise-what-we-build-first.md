# What We Build First — AquaWise Sequencing

**Author:** Chain (CEO) & founders
**Status:** v1, April 30, 2026
**Audience:** Tech team, design team, founders, anyone making "what should we build next" decisions
**Reads alongside:** AquaWise Brand Foundation (master), AquaWise Stakeholder Map (the index), per-stakeholder customer docs.

**Purpose:** This document settles one question — *in what order do we serve the six stakeholders, and why?* The order is not negotiable. When tradeoffs come up in planning meetings, this is the document we point at to remember what comes first.

---

## The Order

1. **Farmer** (now, 2026) — through the nursery channel
2. **Nursery (โรงอนุบาล)** (now, 2026) — distribution partner for the farmer side
3. **Broker / ล้ง** (parallel with 1 and 2, opportunistically) — price-feed revenue
4. **Hatchery (โรงเพาะฟัก)** (2027) — once nursery dataset is real
5. **Feed company** (2027) — once farmer dataset is dense enough for field rep tooling
6. **Bank / BAAC** (2028+) — once cycle history spans multiple years

That is the order. The rest of this document explains why.

---

## The Argument

The order is determined by **the data flywheel**, not by who is willing to pay first. Some of the highest-value paying stakeholders (BAAC, large feed companies) come last in our sequence, because serving them well requires a dataset that does not yet exist. Serving them prematurely would mean shipping a thin product that fails to deliver, which would burn the relationship before we earn the right to it.

The flywheel works like this:

```
Nurseries distribute farmers (via QR-at-counter)
        ↓
Farmers generate cycle data (via น้องน้ำ)
        ↓
Cycle data validates batches (back to nurseries)
        ↓
Validated batches generate trust artifacts (certificates, scorecards)
        ↓
Trust artifacts attract upstream (hatcheries) and downstream (brokers, feed, banks)
```

Every stakeholder above the line in the flywheel diagram depends on the stakeholder below them. We cannot serve hatcheries until nurseries are in. We cannot serve nurseries until farmers are in. We cannot serve farmers without nurseries acting as the distribution channel. Hence the seemingly-paradoxical sequence: **the lowest-revenue stakeholder per head (farmers, free) gets served first, because they are the input the rest of the system needs.**

---

## The Six Stakeholders, in Order

### 1. Farmer (now)

**Why first:** The farmer is the data flywheel input. Every cycle a farmer reports is one labeled training example. Every harvest is an outcome attributed to a batch. Without farmer participation, AquaWise has no ground truth, no credit-history product, no scorecard, no anything. The farmer is also the moral protagonist of the brand — if AquaWise does not serve farmers, none of the rest matters.

**What we build for them in 2026:** The LINE bot น้องน้ำ. Daily price feed. Day-30 and Day-60 survival check-ins. Cycle-progression reminders. Weather-aware feeding suggestions. Cross-farm context when something goes wrong. Eventually, batch certificates. Free, always.

**Success metric for this phase:** 50 farmers actively using น้องน้ำ daily by end of 2026, generating 30+ complete cycle records.

### 2. Nursery (now, in parallel with farmer)

**Why second:** Nurseries distribute farmers. Every nursery counter is a high-trust onboarding moment for the farmer who just bought PL. Without nurseries, farmer acquisition is hand-to-hand and slow. Pairing nursery onboarding with farmer onboarding is what makes farmer scale possible.

**What we build for them in 2026:** The QR poster (counter onboarding tool). The batch register (lab, PCR, broodstock source, pack date, linked to DOF White List). The batch certificate (Flex Message + PDF with DOF link, sent to farmer LINE). The nursery dashboard (customers, cycles, restock predictor, recent batch performance). Disease tracking dashboard.

**Success metric for this phase:** P'Pong's pilot complete (1 nursery × 1 batch × 10 farms). 5 nurseries paying *something* by end of 2026 — opening hypothesis is ฿2,000–5,000/month flat, but the priority is establishing willingness-to-pay at all and learning what unit of billing matches the unit of value.

### 3. Broker / ล้ง (parallel, opportunistically)

**Why this position:** Brokers can be onboarded for the price-feed product *without* needing the farmer-and-nursery dataset to be mature. The price feed is valuable on its own. Broker subscription revenue helps justify the daily price feed work, which farmers also benefit from. The broker's industry-level price intelligence flows back as farmer-facing daily price feed — so brokers and farmers reinforce each other.

But brokers are not the priority. We serve them when convenient — Hia Iam is already in our network and can be onboarded in 2026. P'Safe and P'Maem are warm leads. We do not do dedicated broker-acquisition work in 2026 because the farmer-and-nursery work is more strategic.

**What we build for them in 2026:** Price intelligence (real-time price feed across multiple ตลาด, regional comparison, 3-year trend baselines). Eventually, farm readiness reports.

**Success metric for this phase:** 1+ paying broker subscriber by end of 2026 (likely Hia Iam).

### 4. Hatchery (2027)

**Why fourth:** Hatcheries care about cross-nursery survival data attributable to their broodstock lineages. That data does not exist until nurseries and farmers are generating cycle outcomes at scale. Approaching P'Bunjong in 2026 with a nursery dataset of n=15 cycles would be selling him a promise, not a product. By 2027, with hundreds of cycles tracked across multiple nurseries, the conversation changes from *"trust us, this will be valuable someday"* to *"here is the data, here is what your lineages did."*

**What we build for them in 2027:** A two-step closed loop view. Hatchery → nursery → farm cycle outcomes, aggregated. Genetic-lineage performance dashboards. Defense materials when broodstock is unfairly blamed.

**Success metric for this phase:** P'Bunjong onboarded by end of 2027. Two more hatcheries by mid-2028.

### 5. Feed company (2027)

**Why fifth:** Feed company sponsorship is meaningful only when AquaWise has farmer reach the feed company values. A feed company will not pay for sponsorship in a system with 50 farmers; it will at 500. Field rep tooling is meaningful only when AquaWise has farmer-side data dense enough to give a rep something genuinely useful in their hands during a farm visit. Both gates are crossed in 2027 if Phase H1 and H2 hit targets.

We may take small, opportunistic sponsorships in 2026 — for example, a single feed brand funding the daily price feed in exchange for a logo placement, with strict rules about neutrality and non-exclusivity. But the dedicated feed-company go-to-market work waits until 2027.

**What we build for them in 2027:** Field rep tooling (farm cards, cycle history, batch sources). Branded sponsorship placements with strict editorial separation.

**Success metric for this phase:** 1 paying feed-company sponsor by end of 2026 (opportunistic). 2+ feed-company partnerships with field rep tooling by end of 2027.

### 6. Bank (BAAC) (2028+)

**Why last:** BAAC will not pilot a credit-assessment product without multi-year farm history. The minimum credible dataset for a single farm credit decision is three years of cycle data. That timeline cannot be compressed by any amount of effort on our side; we have to wait for the data to exist. We can begin BAAC conversations in 2027 to lay groundwork for a 2028 pilot, but real product engagement waits.

**What we build for them in 2028+:** Per-farm credit assessment reports. Multi-year cycle history. Yield consistency scores. Water quality discipline scores. Batch source reliability. Dispute resolution outcomes. A credit officer pulls a report and sees three years of operational track record, sourced and timestamped.

**Success metric for this phase:** BAAC pilot (single province, 50–100 farms) by end of 2028.

---

## Why This Order Is Non-Negotiable

Three temptations will come up repeatedly in planning meetings. This document exists to refuse them with cause.

**Temptation 1: "Let's build the BAAC product earlier — they have budget."**

BAAC has budget but no patience for half-built products. A credit-assessment product with a thin dataset would fail at the first credit officer's desk and the relationship would not recover for years. We earn BAAC by waiting until the dataset deserves them.

**Temptation 2: "Let's chase the feed companies now — they have huge marketing budgets."**

Feed company sponsorship at the wrong time captures us. A feed company that funds AquaWise when we have 50 farmers becomes the dominant voice in the system; their interests will quietly become our interests. A feed company that sponsors us when we have 500 farmers cannot capture us because we have other revenue and other reach. The order matters for *brand neutrality*, not just for revenue.

**Temptation 3: "Let's serve hatcheries in parallel with nurseries — same QR mechanic, why not?"**

Same mechanic, different stakeholder, different product. Serving hatcheries requires nursery + farmer cycle data, which requires the nursery channel to be running first. Building hatchery-side features in parallel splits the team's attention before the nursery-side work is complete. We will look productive and miss the nursery target.

The order is the discipline that prevents premature scaling, premature commercialization, and premature broadening.

---

## What This Means in Daily Decisions

When the tech team is asked to build something, the test is:

1. **Does this serve a stakeholder in our current phase, or one in a future phase?**
2. **If future, what would we sacrifice to build it now?**
3. **Is that sacrifice worth it?** (Answer is almost always no.)

When a partner or investor proposes a feature, the test is the same. *"Could you also build a marketplace for fish in 2026?"* Answer: yes, technically; no, strategically. *"Could you do BAAC pilot in 2026?"* Answer: yes, technically; no, dataset-honestly.

Sequencing is the most important strategic decision in a multi-stakeholder system. Get it right, and the flywheel compounds. Get it wrong, and we ship a fragmented product that serves no one well.

This is the order. We hold to it.

---

## A Note on How Pricing Validation May Affect Sequencing

The sequencing in this document is governed by the *data flywheel*, not by *willingness to pay*. That principle stands. But pricing is currently a hypothesis (see the Stakeholder Map's pricing-as-hypothesis section), and as we validate it, the order of effort may shift slightly.

For example: if hatchery willingness-to-pay turns out to be much higher than the ฿5–15K/month opening tier — say, ฿100K+/month for a P'Bunjong-class hatchery whose broodstock lineage is meaningfully defended — then the case for serving hatcheries in 2027 sharpens, and the team should consider parallel investment earlier than otherwise. Conversely, if nursery willingness-to-pay turns out to be lower than the opening tier, we may need to revisit whether the nursery channel is sustainable as a paid tier or whether we lean harder on free distribution and revenue from elsewhere.

The sequencing principle does not change: data flywheel comes first, paid customers come second. But the *relative pace* of investment across phases may evolve as we learn what value actually translates into willingness to pay.

What does not change under any pricing scenario: **farmers smallholder-tier free, always.** No pricing validation in any direction will move that.

---

*End of sequencing doc.*
