# AquaWise Stakeholder Map

**Author:** Chain (CEO) & founders
**Status:** v1, April 30, 2026
**Audience:** Tech team, design team, new hires, partners, investors
**Reads alongside:** AquaWise Brand Foundation (master), AquaWise What We Build First (sequencing), and the per-stakeholder customer docs (farmer, nursery, hatchery, broker, feed, BAAC).

**Purpose:** A single document that introduces every player in the AquaWise system. The tech team uses this as the *index* — the page they check to remember which stakeholder a feature is serving and where that stakeholder sits in the chain. Each profile is intentionally short. Deeper customer-and-business documents exist for each stakeholder; this is the map, not the territory.

---

## How to Read This Document

Aquaculture is a chain. Post-larvae move from hatcheries to nurseries to farms. Mature shrimp move from farms to brokers to factories or domestic markets. Money flows back up the chain. Information barely flows at all — that is the gap AquaWise fills.

This document walks the chain from upstream to downstream, then adds the players who sit alongside the chain (feed companies, banks). Six profiles total. Each profile fits on one page. Each profile follows the same structure so you can compare them side by side.

For every stakeholder we name:

- **Who they are** — the real human, with a real example
- **Their biggest pain** — the thing keeping them up at night
- **What we offer** — the surface form AquaWise takes for them
- **What they pay** — the money flow in our direction
- **When we serve them** — the rollout sequence
- **Why we serve them** — the strategic reason they exist in our system

After the six profiles, a quick reference table summarizes the entire map.

---

## 1. The Hatchery (โรงเพาะฟัก) — upstream broodstock

**Who they are.** A small number of operators in Thailand — fewer than thirty serious players — who own broodstock and produce nauplii (the youngest larval stage). The archetype is **P'Bunjong**, President of the Thai Aquaculture Federation. Older operators, often with decades of experience in genetics and breeding. Capital-intensive operations. Each broodstock lineage represents years of selective breeding work. They sell nauplii to nurseries, who grow them for ~20 days before selling post-larvae (PL) to farms.

**Their biggest pain.** They are two steps removed from the farm where outcomes happen. When a crop fails 60 days after a farmer stocked PL, the failure traces back through the nursery, but the hatchery has almost no defense. Bad outcomes are blamed loudly; good outcomes get no credit. Years of careful broodstock work can be undermined by a single noisy customer. They are the most invisible player in the chain.

**What we offer them.** A two-step closed loop. Hatchery → nursery → farm cycle outcomes, aggregated across nursery customers, attributable to broodstock lineages. The Department of Fisheries White List PCR record is the credibility surface they already understand; AquaWise extends it with cross-nursery survival data they cannot see today.

**What they pay.** *Hypothesized opening tier:* ฿5,000–15,000/month flat. The customer base is smaller than the nursery side, so we cannot win on volume — we win on dataset value. Genetic-lineage-level survival data is uniquely valuable to a hatchery and uniquely impossible for them to assemble alone. *Honest context:* a serious Thai vannamei hatchery does roughly ฿80–120M/year in revenue. If AquaWise meaningfully defends one broodstock lineage from unfair blame in a single year, the value capture is in the hundreds of thousands to millions of baht. The opening tier is conservative; the eventual pricing model (flat fee, per-cycle, % of broodstock revenue, hybrid) is TBD after Phase H3 willingness-to-pay validation with P'Bunjong and two other hatcheries.

**When we serve them.** Phase H3+ (2027 onward). After the nursery and farmer sides have generated enough cycle data to be useful upstream. P'Bunjong is the obvious first conversation, but we earn the right to that conversation only after the nursery dataset is real.

**Why we serve them.** Hatcheries close the chain. Without hatchery participation the broodstock-to-harvest link is missing, which means the credit-history product (Phase H4+) cannot tell the full story. Hatcheries also unlock genetic data — the most defensible scientific moat AquaWise can build over the long term.

---

## 2. The Nursery (โรงอนุบาล) — primary distribution channel

**Who they are.** Hundreds of operators across Thailand, concentrated heavily in Chachoengsao and the central region. The archetype is **P'Pong**, President of the Thai Shrimp Larvae Hatchery Association (the association name uses older terminology; P'Pong operationally runs a nursery). They buy nauplii from hatcheries, grow them ~20 days, and sell PL to farms. Each nursery serves dozens to hundreds of farm customers. Family-owned, often second-generation, owners typically 40–60 years old.

**Their biggest pain.** They are blamed when farms fail — fairly or unfairly. They have informal phone contact with farms during the cycle but no aggregated, defensible record of how their batches actually performed across the customer base. *"ลูกกุ้งดี แต่ไม่มีอะไรพิสูจน์"* — the larvae are good, but there is nothing to prove it. A single furious customer's accusation can cost more than ten happy customers' word of mouth.

**What we offer them.** The closed loop. Every PL sale tracked from the moment of purchase (QR scan at counter) to harvest. Every batch carries a Department of Fisheries PCR record. Every cycle ends with a labeled outcome attributable to the nursery's specific batch. When unfair blame comes, the nursery has the data. When good batches happen, the nursery can prove it.

**What they pay.** *Hypothesized opening tier:* flat fee, ฿2,000–5,000/month, after the H1 free-pilot phase. Cheap enough that the President of the association does not have to defend the price to peers. Expensive enough to discipline the buyer into actually using the product. *Honest context:* a mid-sized Thai nursery sells 30–80M PL/year to 100–300 farm customers. If AquaWise delivers a 10-point retention lift, the revenue impact is ฿600K–2M/year per nursery — meaning the rational ceiling on what they could pay is far above the opening tier. We open conservatively to win the first nurseries on terms they cannot refuse; the pricing model (flat, per-batch, per-certificate, % of revenue, tiered) evolves after we see what value is actually captured.

**When we serve them.** Phase H1 (now, 2026), starting with P'Pong's pilot — *one nursery × one PL batch × ten farms*. The nursery is the primary distribution channel for the entire AquaWise system because the QR-at-counter mechanic onboards farmers passively. Without nurseries, farmer acquisition is hand-to-hand and slow.

**Why we serve them.** Nurseries distribute farmers. Every nursery counter is a high-trust onboarding moment. We cannot reach farmers at scale without nurseries; the nursery channel is what makes the data flywheel possible.

---

## 3. The Farmer (เกษตรกรเลี้ยงกุ้ง) — the protagonist of the chain

**Who they are.** Thousands of operators across Thailand, with the densest cluster in Chachoengsao. The archetype is **P'Ek of R. Mitchai Farm in Samut Songkhram** — three years of pond records, 90+ crop cycles, the foundation of the AquaWise dataset. Farmers run anywhere from 2 to 50 ponds. Margins are 5–15% on a good year, negative on a bad year. They are the highest-volume customer base and the lowest-revenue customer per head.

**Their biggest pain.** They are alone with the pond. At 5:17 AM when something looks wrong, the only resource is a LINE group chat that mostly goes silent and a phone call to the nursery that may or may not get returned. They do not know if their pond is the only one acting strange or if it is happening across the zone. They do not know if the price they will get next week is going up or down. They do not know if their feed conversion ratio is good or bad relative to peers. Information asymmetry punishes them every cycle.

**What we offer them.** The LINE bot, **น้องน้ำ**. Daily price feed. Day-30 and Day-60 survival check-ins. Cycle-progression reminders. Weather-aware feeding suggestions. Cross-farm context when something goes wrong. Eventually, batch certificates from the nursery they bought from, and credit history they can take to the bank.

**What they pay.** Zero. Always — at the smallholder tier (the operators we serve in 2026, who run 2–20 ponds and operate on 5–15% margins). This is non-negotiable across every doc in the AquaWise system. Farmers are the customer we serve, not the customer we monetize. Charging smallholder farmers in a market with 5–15% margins would destroy the trust system. *Honest context:* commercial-scale farms (50+ ponds, multi-million-baht annual revenue) can rationally pay for AquaWise — preventing one crop failure on a 100-pond operation is worth ฿2–5M, so paying ฿100K/year for the system that prevented it is sensible economics. If we eventually serve commercial-scale farms as a distinct tier, that tier may be paid, with the same strict neutrality protections (no editorial influence on small-farmer-facing surfaces, no asymmetric data access). We have not validated this and we do not commit to it; we name it here because the option exists.

**When we serve them.** Phase H1 (now). The first farmer cohort comes through P'Pong's nursery pilot — ten farms, all in Chachoengsao, in 2026. Then expansion to central Thailand through additional nursery partners. Then nationwide.

**Why we serve them.** Farmers are the data flywheel input. Every cycle a farmer reports is one labeled training example for the cross-farm dataset. Every harvest is an outcome attributed to a batch. Without farmer participation, AquaWise has no ground truth, no credit-history product, no scorecard, no anything. Farmers are also the moral protagonist of the brand — if AquaWise does not serve farmers, none of the rest matters.

---

## 4. The Broker / ล้ง — connecting farms to markets

**Who they are.** Several hundred ล้ง operators across Thailand. They go to farms, buy mature shrimp, transport on ice, and resell to factories or domestic markets. Three archetypes from our customer discovery:

- **Hia Iam** — P&P, Chachoengsao, 30-year veteran, the broker model (negotiates farm-by-farm)
- **P'Safe** — provincial central, family operation, mid-volume
- **P'Maem** — แพกุ้งน้องฮากิ, Nakhon Si Thammarat, runs auction-style buying in the south

Their economics are catastrophic when wrong. P'Maem mentioned a single bad trip costs ฿16,000 in truck rental + ฿130/block of ice + 12 workers' wages — wasted if the farm is not actually ready or yields the wrong volume.

**Their biggest pain.** Demand is unpredictable in a way supply is not. Hia Iam said: *"Demand today? Go ask anyone — they can't tell you."* They cannot price accurately because prices move like stocks. They cannot route trucks efficiently because farm readiness is fuzzy. Factory rejection on quality grounds turns break-even into catastrophic loss. Everything is run on phone calls and gut feel.

**What we offer them.** Price intelligence (real-time price feed, regional comparison, 3-year trend baselines). Farm readiness reports (which AquaWise-tracked farms are 7–14 days from harvest, what volumes, what sizes, what conditions). Eventually, a matched-buyer list when sufficient farms are in the system.

**What they pay.** *Hypothesized opening tier:* subscription, ฿3,000–10,000/month flat for price intelligence + readiness data. Higher than nursery because the dataset value to a broker (saving one bad trip pays for years of subscription) is higher per head. *Honest context:* P'Maem mentioned that one bad trip costs ฿16,000+ in truck rental + ice + workers. A broker who saves two bad trips per month from AquaWise readiness data has covered an entire year's subscription in two weeks. The willingness-to-pay ceiling is well above the opening tier; final pricing model is TBD after broker pilot validation.

**When we serve them.** Parallel with Phase H1 farmers and nurseries — opportunistically. Hia Iam is already in our network. P'Safe and P'Maem are warm leads. Brokers can be onboarded in 2026 for the price-feed product even before the cross-farm dataset is mature, because the price feed is valuable on its own.

**Why we serve them.** Brokers are the price-feed early-revenue channel. They also provide industry-level ground truth on prices that flows back to farmers as the daily price feed. The broker channel is what makes the daily price feed honest — without broker subscribers we are guessing prices; with them we are reporting them.

---

## 5. The Feed Company — sponsorship and reach

**Who they are.** A small number of large players (CP, Charoen Pokphand Foods, Thai Union Feedmill, Inteqc, Grobest, BR Aqua) plus a handful of mid-sized regional brands. They sell feed to farms and provide field reps who advise farmers. Field reps are the most important asset they have — these are the people farmers actually know and trust. The largest players have hundreds of field reps across Thailand.

**Their biggest pain.** Their field reps spend much of the day in trucks, in farms, doing low-leverage work. Reps cannot prove which advice worked and which did not. The feed company cannot prove its product is better than competitors' beyond brand and relationships. New product launches take years to gain traction because there is no objective ground truth.

**What we offer them.** Two products:
1. **Field rep tooling** — a "farm card" view of every farm a rep visits, with cycle history, water quality, batch source, recent issues. Reps go from generalists to expert advisors.
2. **Brand sponsorship** — clearly-attributed promotional placements inside the AquaWise system, with strict rules about neutrality (no editorial influence, no exclusivity, no sponsorship in batch certificates or scorecards).

**What they pay.** *Hypothesized opening tiers:* per-rep subscription for field rep tooling (potentially ฿500–2,000/rep/month at scale; a feed company with 200 reps could spend ฿2.4–4.8M/year on tooling alone). Direct sponsorship fees for branded content placements, scoped per-campaign. *Honest context:* large Thai feed companies have 8- and 9-figure marketing budgets. Our opening tiers are anchored to what feels reasonable, not to what the customer can rationally afford. Final structure TBD after Phase H2 validation with one mid-sized brand and one large brand.

**When we serve them.** Phase H2 (2027). After we have enough farmer-side data to make the field rep tool genuinely useful. Sponsorship can begin earlier opportunistically — likely 2026 if a single feed brand wants to fund the daily price feed in exchange for a logo placement.

**Why we serve them.** Feed companies are the largest revenue tier outside banks. They also amplify AquaWise's reach: a feed company with hundreds of field reps becomes a distribution channel for AquaWise farmer onboarding that complements the nursery channel. The risk is neutrality compromise, which is why the strict rules around sponsorship exist.

---

## 6. The Bank — BAAC and rural credit

**Who they are.** Primarily the **Bank for Agriculture and Agricultural Cooperatives (BAAC)**, the Thai government bank that extends rural credit. Hundreds of branch officers across the country. They are mandated to lend to agriculture but lack reliable data to assess farm-level credit risk. Most farm credit decisions today are based on land collateral and personal relationships, not on operational track record.

**Their biggest pain.** They are flying blind on credit risk. They want to lend more aggressively to careful operators but have no way to identify them. They want to deny credit to chronically failing operators but lack the evidence to do so without alienating their political mandate. Loan defaults are a constant tax on their portfolio that better information could reduce dramatically.

**What we offer them.** Per-farm credit assessment reports, using AquaWise data. Multi-year cycle history. Yield consistency. Water quality discipline. Batch source reliability. Dispute resolution outcomes. The credit officer pulls a report on the farmer applying for a loan and sees three years of operational track record, sourced and timestamped.

**What they pay.** *Hypothesized opening tier:* per-assessment fees, ฿200–1,000 per credit report at scale, plus a strategic relationship that justifies multi-year contracts. *Honest context:* BAAC processes hundreds of thousands of agricultural credit decisions annually. Even at the low end of the fee range, multiplied by penetration, the revenue is significant. The eventual pricing model may also include data-licensing arrangements for portfolio-level analysis. All of this is TBD until we have a real pilot.

**When we serve them.** Phase H4 (2028+). After we have multi-year cycle data from enough farms to make assessments meaningful. Earlier engagement is wasted; BAAC will not pilot a product that does not have at least three years of farm history to assess.

**Why we serve them.** BAAC is the *credit-history-for-shrimp-farms* product Aaqua has been building toward from day one. The closed-loop dataset, when extended over years, becomes the FICO equivalent for an industry that has never had one. This is the largest revenue tier in the long term and the most defensible moat.

---

## A Note on Pricing — Everything in This Document Is Our Opening Hypothesis

The pricing in each profile is what we plan to *open with*, not what we plan to settle on. Every paid tier is a hypothesis to be validated through pilot phases. There are three reasons to write the prices this way.

**First, willingness-to-pay scales with delivered value, not with our cost-plus instinct.** A nursery doing ฿30M+/year in PL revenue who experiences a real 10-point retention lift can rationally pay ten times what we are asking. A hatchery whose lineage we successfully defend from unfair blame can rationally pay a percentage of the revenue we protect. A commercial-scale farm that avoids one crop failure can rationally pay six figures per year. We will not know the true ceiling until we deliver value and ask honestly.

**Second, the right model may not be flat fee.** Flat-fee subscriptions are easy to sell and easy to defend, which is why we open there. But the eventual structure may be per-batch certificate (for nurseries), per-cycle (for farms in disputes), per-assessment (for banks), per-rep (for feed companies), or some combination. The *unit of billing* should match the *unit of value*. We do not yet know what the right unit is for each stakeholder.

**Third, opening conservatively wins the first customer at terms they cannot refuse, then evolves.** P'Pong is the President of an association. He cannot champion AquaWise to peers if our pricing requires him to defend a number that feels expensive. So we open at a tier that is obviously fair, prove value, and revisit pricing in year two when the conversation is *"here is what AquaWise saved you in the last twelve months."*

The principle is: **price for the relationship in year one, price for the value in year three.** Every number in this document is our year-one anchor. Years two and three will be different conversations with different evidence. The team should not treat any price in this document as a settled commitment to AquaWise's revenue model.

What does *not* change with pricing evolution: **farmers free at the smallholder tier, always.** That is not a pricing question; it is a brand commitment. Everything else is up for revalidation as we learn.

---

## Quick Reference Table

Note: all paid tiers shown below are *opening hypotheses*, not commitments. See the section above on pricing.

| # | Stakeholder | Archetype | Pain | Opening pay tier | Serve when | Why we serve |
|---|---|---|---|---|---|---|
| 1 | Hatchery (โรงเพาะฟัก) | P'Bunjong | Two steps from outcomes; cannot defend lineages | ฿5K–15K/mo (TBD) | 2027+ | Closes the chain; genetic moat |
| 2 | Nursery (โรงอนุบาล) | P'Pong | Blamed when farms fail; no defense | ฿2K–5K/mo (TBD) | Now (2026) | Distributes farmers |
| 3 | Farmer (smallholder) | P'Ek | Alone with the pond; information asymmetry | ฿0 always | Now (2026) | The protagonist; data input |
| 3a | Farmer (commercial-scale, future) | TBD | Same; bigger consequences | TBD (potentially ฿100K+/year) | Possibly 2028+ | Possible separate tier — not yet validated |
| 4 | Broker / ล้ง | Hia Iam, P'Safe, P'Maem | Demand unpredictable; bad trips ruin economics | ฿3K–10K/mo (TBD) | 2026 (parallel) | Price-feed revenue + ground truth |
| 5 | Feed company | CP, Thai Union, Inteqc | Reps low-leverage; cannot prove product superiority | Per-rep + sponsorship (TBD) | 2027 | Largest external revenue + distribution |
| 6 | Bank (BAAC) | BAAC officers | Credit decisions made blind | Per-assessment (TBD) | 2028+ | The long-term moat (credit history) |

---

## What This Map Implies for Builders

The tech team and design team should internalize three things from this document:

**One closed loop, six surface forms.** Every feature you build serves at least one of these stakeholders, but no feature serves only one. A batch certificate serves the nursery (defense), the farmer (transparency), and eventually the bank (credit input). A daily price feed serves the farmer (decisions), the broker (revenue intelligence), and the feed company (market context). Build for the closed loop, not for any single stakeholder.

**The farmer is always the protagonist.** Even when a feature is built primarily for a paying stakeholder (nursery, broker, feed, bank), the test is: *does this strengthen the farmer's position or weaken it?* If a feature would help a paying stakeholder at the farmer's expense, the feature is wrong. The farmer's free-and-protected position is the architectural commitment that makes everything else trustworthy.

**Sequence is everything.** This map shows six stakeholders, but it does not say "build for all six in 2026." The next document — *What We Build First* — explains the order, which is non-negotiable. Building out of sequence will look productive in the short term and will break the data flywheel in the long term.

---

*End of stakeholder map.*
