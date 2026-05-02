# The Broker (ล้ง)
## AquaWise Customer Document

**Author:** Chain (CEO) & founders
**Status:** v1, April 30, 2026
**Audience:** Tech team, design team, anyone building a feature that touches the broker side of AquaWise (the daily price feed, the farm readiness reports, eventually the matching layer).
**Reads alongside:** AquaWise Brand Foundation (master), AquaWise Stakeholder Map (the index), AquaWise What We Build First (sequencing), AquaWise Farmer Customer Doc, AquaWise Nursery Customer Doc.

**Purpose:** This is the customer document for the operator who connects farms to markets — the broker (ล้ง). The broker buys shrimp at the pond, transports it on ice, and resells to factories or domestic markets. Brokers are the highest-leverage paid stakeholder we serve in 2026 because they pay for price intelligence on day one without needing the cross-farm dataset to be mature, and because the price intelligence they pay for flows back to farmers as the daily price feed. Brokers are the channel that makes the daily price feed honest.

**The structural challenge.** Unlike the farmer and nursery roles, the broker role does not have one archetype. It has three, and they operate by different rules in different regions. The Chachoengsao broker negotiates farm-by-farm. The southern broker buys through sealed-bid auctions. The provincial broker runs a smaller mid-volume operation that sits between the two. This document handles each of them honestly, because a single product design that ignores regional variation will fail at first contact with reality.

---

## 1. Who the Broker Is

It is 8:30 in the morning. Hia Iam sits at his desk at P&P in Chachoengsao with a cup of coffee, a phone, and three spreadsheets — none of them on a computer. The spreadsheets are paper, in his own handwriting, going back fifteen years. They tell him what he paid for shrimp last week, what the market was paying yesterday, which farms are within ten days of harvest, which factories have been paying premium for size 50 this month.

He is on the phone constantly. Eleven calls so far this morning. The first was a farmer asking what the market is doing. The second was a factory buyer asking how much size 60 he can deliver this afternoon. The third was a competitor ล้ง — they exchange information sometimes, the way old enemies exchange information. The fourth was his lead driver coordinating today's truck dispatches.

Hia Iam moves volume. Five to ten tons per day passes through P&P, sometimes more in peak season. Multiple trucks run continuously through the day, leaving with shrimp on ice and returning empty, then leaving again. The drivers are full-time employees. The workers — twelve to fifteen of them depending on the day — are organized into teams that handle weighing, grading, packing, and dispatch. Hia Iam does not personally ride along on the trips anymore; he sits at the desk and runs the operation through phone calls and his network of sub-brokers (*"นายหน้า"*) who specialize in tracking specific zones.

By 9:30 he has confirmed three different farm purchases for the day's runs. Total volume across the three: about 7 tons. He is selling forward to two factories and one domestic wholesaler, at prices that net him meaningful margin if the quality holds — and meaningful losses if it doesn't. On a 7-ton day at his pricing structure, his margin is in the ฿100K–200K range when everything goes right. A single factory rejection on a multi-ton lot could destroy it.

Every day is a sequence of bets like this, repeated at scale. He has been making them for thirty years, since he was a young man working for his uncle's ล้ง before he started his own. He has seen four major industry shifts. He has personally watched Thailand's share of the global shrimp export market shrink from 40% to under 20% as Ecuador and Vietnam took the share Thailand could not defend. He has watched friends go out of business in the AHPND outbreak. He has watched the Cambodian border close in 2026 and demolish the polyculture demand his region had relied on.

He is a 30-year veteran. He is sixty-three years old. He runs his business on relationships, intuition, and paper records — and, when pressed, he will tell you that intuition is the only one that has ever been reliable. He is deeply skeptical of every technology pitch he has ever heard. The only AquaWise concept he did not dismiss outright in our first conversation was the satellite + AI early warning system for farms — *"because that is something that might actually help the farmer."* Everything else, he had seen versions of before, and they had failed.

Hia Iam is one archetype of the broker — the *major Chachoengsao operator,* doing 5–10 tons per day, running on the broker model (farm-by-farm negotiation) at significant scale. There are perhaps thirty to fifty operators of this tier in Thailand, concentrated in Chachoengsao, Samut Sakhon, and the central region. They are the most influential brokers in the industry — the ones whose endorsements at association meetings shape what other brokers think.

There are two other archetypes at smaller scales.

**P'Safe** is the provincial central broker. Late forties, a family operation, mid-volume, operates with his father (who is in his seventies and still keeps the books). They do roughly 1–2 tons per day in good weeks. They run on phone calls and notebook records and a strong instinct for which farms are about to harvest. They are the most numerically common broker archetype in Thailand — *several hundred operations of this scale* across the country. They are also the most operationally vulnerable: thin margins, no slack, one bad cycle of cancelled orders ruins a month.

**P'Maem** is the southern auction operator. She runs แพกุ้งน้องฮากิ in Nakhon Si Thammarat. The southern market structure is different — sealed-bid auctions, where multiple ล้ง submit bids on a farm's harvest and the highest bid wins the lot. The broker's job there is less about negotiation and more about *deciding what to bid* and *organizing logistics* once the bid is won. P'Maem's exposure to bad-trip costs is what she described most clearly: ฿16,000 truck rental + ฿130 per block of ice + twelve workers' wages, around ฿20K per failed trip. If she wins a bid for a farm that turns out to deliver less volume than expected, or wrong size, or wrong quality, the trip's economics collapse. She is the clearest articulator of the *cost-of-being-wrong* at the small-to-mid broker scale.

These three archetypes — Hia Iam (major Chachoengsao broker, 5–10 tons/day), P'Safe (provincial mid-volume, 1–2 tons/day), P'Maem (southern auction model, mid-volume) — represent three different combinations of regional structure and operational scale. The role is *connecting farm supply to market demand,* but the *mechanism* differs across regions, and the *exposure to bad outcomes* differs across volumes. AquaWise has to design for all three without forcing them into one model.

We call this archetype the Veteran Broker. Aged 40–65, ten to thirty years in the role, runs the business mostly on relationships and intuition, deeply skeptical of any technology pitch that has not been tested against the chaos of an actual harvest day. There are roughly five hundred to eight hundred Veteran Brokers across Thailand, distributed across the three sub-archetypes — the largest tier (Hia Iam's level) being the smallest in count but the most influential in reputation. We do not need many of them as customers — even ten paying brokers, well-served, would be a meaningful business — but we need to design carefully because they have low tolerance for software that fails to be useful on the first try.

---

## 2. The Cost of Being Wrong

The broker's economic life is asymmetric, and the magnitude varies dramatically by tier.

**Hia Iam's tier (5–10 tons/day, major Chachoengsao):** Annual revenue passes ฿180–500M depending on margin assumptions. A good week makes ฿500K–1M of margin. A bad week — a series of cancelled orders, factory rejections, or wrong-volume estimates — can destroy the same amount or more. A single factory rejection on a multi-ton lot can be ฿100K–500K of margin destruction in a single afternoon. The exposure scales with volume; the larger the operation, the larger the absolute losses when things go wrong.

**P'Safe's tier (1–2 tons/day, provincial mid-volume):** Annual revenue ฿30–80M. A good week is ฿50K–150K of margin; a bad week wipes out a month. The percentages are similar to Hia Iam's tier but the absolute numbers are smaller.

**P'Maem's tier (southern auction operator):** Bad-trip costs are the cleanest to quantify because she described them directly: ฿16,000 truck rental + ฿1,300 ice + twelve workers' wages = roughly ฿20,000 per failed trip. This is the failure cost at her tier of operation, where one or two trucks per day rather than continuous dispatch.

Three concrete cost-of-being-wrong examples from our customer discovery:

**Wrong-volume estimates: chronic at every tier.** P'Safe described the daily problem of estimating how many kilograms a farm will harvest tomorrow morning. The farmer says "about 2 tons." The actual harvest is 1.4 tons. P'Safe has booked truck capacity for 2 tons and brought ice for 2 tons, both wasted. He has also pre-sold to a factory at a price assuming 2-ton volume; now he has to scramble to find another 600 kg from somewhere or apologize to the factory. Either option is expensive. At Hia Iam's tier, the same problem is even more expensive in absolute terms — wrong-volume on a 7-ton planning day means tens of thousands of baht of misallocated logistics.

**Factory rejection: catastrophic at every tier, scaled by volume.** Hia Iam described how a factory in Mahachai can reject a multi-ton lot for chemical residue, off-color, or wrong size distribution. The rejected lot has to be sold elsewhere at distress prices — sometimes ฿40–60/kg less than the agreed price. On a 3-ton lot, that's ฿120,000–180,000 of margin destroyed. On a 5-ton lot at Hia Iam's volumes, ฿200K–300K of margin destroyed in one event.

**P'Maem's quantified bad-trip floor: ~฿20K per failed trip.** Mentioned above. This is the most useful number we have because it is concretely bounded and clearly attributed to a single trip event.

The value AquaWise potentially delivers, ranked by impact across all broker tiers:

1. **Saving one bad trip per month** through better farm readiness data → ฿20K–100K/month/broker recovered depending on tier.
2. **Reducing factory rejection** through earlier visibility into farm conditions → ฿100K–500K/month for the major broker who avoids one rejection per quarter.
3. **Better price information** at the moment of negotiation → small but consistent margin improvement, scaling with volume.

The broker's willingness to pay scales with delivered savings *and with their tier of operation*. A major broker like Hia Iam who saves ฿100K+ in a single avoided rejection can rationally pay ฿20K+/month for AquaWise. A mid-volume operator like P'Safe at smaller exposure rationally pays ฿3K–8K/month. AquaWise pricing on the broker side may eventually need to be tier-aware — flat low fee for entry, scaled higher for major operators where value capture is much higher. The pricing structure is TBD; see Section 5 below and the WTP Validation Plan.

---

## 3. The Five Jobs the Broker Is Trying to Get Done

### Job 1 — Tell me what the market is doing right now, with sources I can verify

The price-intelligence job. The broker is in a constant negotiation with farmers, with factories, and with competitors. Better information at the moment of decision turns into margin. Worse information turns into loss. The broker does not need predictions; they need *current state with sources.*

**Today.** Hia Iam reads the นสพ.กุ้งไทย Facebook page. He calls competitor ล้ง to compare prices. He pulls his fifteen-year paper records. He guesses. He is right more often than wrong, but the variance is high, and the bad guesses are expensive.

**With AquaWise.** The daily price feed shows him every major market's morning prices by size grade, with the source named (ตลาดทะเลไทย, สมาคมผู้ค้ากุ้งสมุทรสาคร, ราคาปากบ่อฉะเชิงเทรา). It shows him three-year baselines for this week of the year, regional spreads (Chachoengsao vs Mahachai vs the south), and the trend over the last 30 days. When he negotiates with a farmer at 9:00 AM, he is no longer estimating from yesterday's gossip; he is referencing today's market with verifiable sources. This is the wedge product on the broker side — it is valuable enough to pay for on its own, before any cross-farm dataset is mature.

### Job 2 — Tell me which farms are about to harvest, and what they will deliver

The farm-readiness job. The broker needs to know seven to fourteen days in advance which farms are approaching harvest, what volumes they will deliver, what sizes they will be, what conditions the cycle had. Today this information lives in the farmer's head and gets shared with brokers only at the moment the farmer is ready to negotiate. By that point the broker has limited ability to plan logistics.

**Today.** The broker calls farmers regularly. *"How is the cycle? When will you harvest?"* The farmer gives an estimate. Brokers maintain mental maps of which farms are at what stage. The map decays as farms grow beyond personal memory; for P'Safe with maybe 80 active farm relationships, this is just barely manageable. For Hia Iam with 200+, it is not manageable, and he relies on a network of sub-brokers (*"นายหน้า"*) who specialize in tracking specific zones.

**With AquaWise.** The broker dashboard shows him every AquaWise-tracked farm, sorted by predicted harvest date. He sees that fourteen farms are within his service zone, predicted to harvest in the next 7–14 days, with expected volumes and size distributions. He plans truck routes and pre-negotiates with factories accordingly. When he calls the farmer on the day of harvest, he is not asking *"are you ready?"* — he is asking *"the AquaWise data says you will be at size 50 with about 1.6 tons; does that match what you are seeing?"* The conversation is structurally different.

### Job 3 — Defend me when a factory rejects a lot for reasons that aren't the lot's fault

The exoneration job, broker version. Factories reject lots. Sometimes the rejection is fair (the lot really did have chemical residue or quality issues). Sometimes the rejection is opportunistic — the factory has too much inventory and is using a quality pretext to push back the cost onto the broker. The broker has limited ability to push back because they have no objective record of the lot's condition at the farm.

**Today.** The broker takes the rejection. They might argue, but they rarely win. The cost goes onto the broker's books.

**With AquaWise.** ⚠ This is a 2027+ feature, depending on whether we can get farm-side data dense enough to be useful at the moment of factory dispute. If we have it, the broker dashboard shows the harvest day's water quality readings, the cycle's PCR history, the size distribution measured at weighing. The data does not always defend the broker (some rejections are real), but it shifts the bargaining position when the rejection is opportunistic.

### Job 4 — Help me find buyers, and help buyers find me, without losing my margin

The matching job. Brokers do not just buy from farms; they sell to factories, domestic markets, restaurants, exporters. The broker who can move shrimp to the right buyer, at the right size, at the right price, makes margin. The broker who is stuck with a wrong-size lot at the end of the day takes losses.

**Today.** This is run through phone calls, long-standing factory relationships, and informal networks. Brokers protect their factory contacts jealously. New buyers are hard to reach.

**With AquaWise.** ⚠ The matching feature is a 2027+ scenario, and even then it will be carefully architected. We will not let buyers and sellers connect directly through AquaWise — this is the principle from P'Park's earlier advice, that disintermediating the broker turns AquaWise into a marketplace and breaks the trust system. Instead, AquaWise will publish *anonymized supply signals* (X tons of size 50 will be available in Chachoengsao this week from N AquaWise farms, served by these brokers) that buyers can react to. Brokers stay as the middleman; we make the broker's job easier without taking the broker's place.

### Job 5 — Help me adapt to long-term industry shifts I cannot see from inside the broker role

The structural-foresight job. Every veteran broker has watched Thailand's export position erode. They know the global structure has shifted. They have less visibility into *what comes next* — which provinces are gaining, which regions are losing, which size grades are commanding premium because of factory mix changes, which markets (China? domestic?) are emerging or contracting.

**Today.** They read the trade press. They listen at association meetings. They guess.

**With AquaWise.** ⚠ Over years, AquaWise's industry-aggregate data could support broker-facing trend reports: emerging supply patterns by region, demand shifts, competitive dynamics. ⚠ This is the most distant job and the most speculative — only achievable after AquaWise has years of operating data and broker trust at scale.

---

## 4. What the Broker's Day Already Looks Like

The broker's day varies more than the farmer's or nursery's because the role is more reactive. Some days are purely planning days; some days are pure execution days; harvest days are 18 hours of nonstop logistics. The pattern below is for a typical mid-week non-harvest day.

**Pre-dawn (5:00–7:00 AM).** Phone calls with farmers in the service zone. *"What's the cycle looking like? When will you harvest? What size are you seeing?"* Information gathering for the next 7–14 days of operations.

**Morning (7:00–10:00 AM).** Office time. Reviewing yesterday's transactions, settling accounts with farmers and factories, reviewing the day's market intelligence. ⚠ This is the primary AquaWise dashboard window — most analogous to P'Pong's mid-morning.

**Mid-day (10:00 AM–2:00 PM).** Active brokering. Phone calls with factories about today's needs. Phone calls with farmers about tomorrow's harvests. Coordinating sub-brokers and drivers. Negotiating prices on incoming offers.

**Afternoon (2:00–5:00 PM).** If a harvest is happening today, the broker is on-site or coordinating remotely. Trucks dispatched. Factory delivery scheduled. Quality concerns surfaced and managed.

**Evening (5:00–8:00 PM).** Settlement. Today's transactions reconciled. Driver paid. Factory invoice sent. Tomorrow's plan confirmed.

**Late evening (8:00 PM onward).** Family, food, sleep. Rarely later than 10:00 PM because pre-dawn tomorrow.

**Where AquaWise fits.**
- *Pre-dawn calls* are when the broker is gathering farm data — this is when AquaWise farm-readiness reports can save phone calls (*"the AquaWise data already shows me which of my farms are within 14 days; I only need to call the ones I am uncertain about"*).
- *Morning office time* is when the daily price feed lands. The broker reads it once over coffee, internalizes it, and uses it throughout the day.
- *Mid-day brokering* is when AquaWise plays no active role; the broker is in execution mode and does not have time to look at a dashboard.
- *Evening settlement* is when the broker can review aggregate data, reconcile predictions vs reality, and learn for tomorrow.

The friction budget for the broker is high in the morning office window (15–20 minutes) and zero during execution. Features designed for the broker have to be useful in the morning window; features designed to interrupt execution will be ignored.

---

## 5. What the Broker Pays

Hypothesized opening tier: ฿3,000–10,000 per month flat for daily price intelligence + farm readiness data. *Pricing is a hypothesis — and almost certainly tier-aware in eventual structure.*

The honest context: broker willingness-to-pay scales sharply with operational tier.

- **A mid-volume operator (P'Safe's tier, 1–2 tons/day)** who saves one bad trip per month (~฿20K) can rationally pay ฿5K–10K/month.
- **A major operator (Hia Iam's tier, 5–10 tons/day)** who avoids one factory rejection per quarter (~฿200K–500K destroyed margin) can rationally pay ฿20K+/month, possibly significantly more if AquaWise reliably delivers exoneration data when factories try opportunistic rejections.
- **A southern auction operator (P'Maem's tier)** sits between these two on willingness-to-pay; the auction model means each individual bid carries severe asymmetric risk, so the value of better farm-readiness data is high relative to her revenue base.

The tiered willingness-to-pay creates a pricing question the team will need to validate: *flat-fee pricing across all tiers (simple to defend, leaves money on the table at the major-broker tier)* vs. *volume-tiered pricing (captures more value but requires the broker to disclose volume, which they tend to keep private)* vs. *value-based pricing tied to specific outcomes delivered (most aligned but operationally complex)*.

The opening hypothesis: flat ฿3K–10K/month for the first dozen brokers across all tiers, with a tier-up conversation in year two for major brokers where AquaWise has demonstrated clear value capture above ฿100K per quarter. Final structure TBD after WTP validation. See WTP Validation Plan.

What is unique to the broker side: brokers tend to have looser bookkeeping than nurseries (P'Safe still uses paper ledgers; Hia Iam runs on memory and notebooks). The unit of billing matters operationally — flat monthly is simplest. Per-trip-saved is mentally interesting but hard to bill against. We will likely default to flat monthly with the option to revisit in year two.

---

## 6. What Success Looks Like

For the broker (Hia Iam as the first test), by the end of 2026:

- He is paying for AquaWise at a tier validated with us.
- He has at least one documented case of AquaWise data preventing a bad trip or improving a price negotiation.
- He has, unprompted, mentioned AquaWise to at least one peer broker in a conversation we did not hear.

For AquaWise, by the end of 2026, drawn from the broker side:

- 1 paying broker subscriber (likely Hia Iam) by end of 2026.
- Daily price feed live and reliable, sourced from at least three markets (ตลาดทะเลไทย, ราคาปากบ่อฉะเชิงเทรา, นสพ.กุ้งไทย Facebook).
- Industry-level price data flowing back to the farmer-facing daily price feed.

---

## 7. What We Will Never Build for the Broker Side

These are commitments.

- **No buyer-seller direct connections.** AquaWise will not let factories and farms connect without a broker in between. This is the critical commitment that protects the broker's role in the chain. A platform that disintermediates the broker becomes the broker's enemy and we lose the channel.
- **No marketplace UI in the broker dashboard.** No "browse farms" feature for buyers. No "browse buyers" feature for farmers. AquaWise routes information; brokers route transactions.
- **No commission on broker-mediated transactions in 2026.** ⚠ Year-2+ we may explore commission structures, but only with broker consent and only in arrangements that strengthen the broker's position rather than weaken it.
- **No exclusivity arrangements with any single broker.** Hia Iam is the first; he will not be the only. We do not give any broker special placement, exclusive access to readiness data, or preferred treatment.
- **No real-time anything.** Daily price feed, weekly farm readiness reports, event-based alerts. The broker does not need (and would not trust) real-time price ticks or live data streams. Daily cadence is correct.
- **No data sale to third parties about specific brokers.** Aggregated, anonymized industry data only.
- **No farmer-identified data sold to brokers.** A broker's view of a farm is what the *farmer has consented to share* — typically anonymized predicted-harvest signals and aggregated regional patterns, not the farmer's individual cycle records or PCR history.

---

## 8. The Voice We Use With the Broker

The brand voice — *ลูกหลานที่เรียนมา* — applies, but with two adjustments specific to the broker side.

First, the broker is the most skeptical archetype in the entire AquaWise system. Hia Iam dismissed almost every concept he heard in his first conversation with Chain. The voice has to *earn the right* to be useful in every interaction; it does not get the benefit of the doubt. This means: more evidence, fewer claims, sources cited everywhere, explicit confidence indicators.

Second, the broker speaks a different professional dialect than the farmer. Where the farmer uses simple ลูกหลาน language, the broker uses industry vocabulary fluently — size grades, factory names, market terminology, regional shorthand. The broker-facing surfaces should match this fluency. Over-translating into simple language reads as condescending.

Specific commitments:

- **Sources, sources, sources.** Every number on the broker dashboard cites its origin. Every prediction includes a confidence indicator. The broker does not trust software; he trusts data with provenance.
- **No celebration, no engagement metrics.** The broker is not a user we are trying to retain; he is a professional we are serving with information.
- **Industry-fluent language.** Size 40, size 50, size 60. Factory names. Regional shorthand. The voice meets the broker at his vocabulary level.
- **Quiet about uncertainty.** When AquaWise does not know, it says so. *"We have data on 8 of the 11 farms in your zone tracking toward harvest in the next 14 days. Three farms have not reported in the last week."* No fabricated confidence.

---

## 9. The Five Scenes We Are Building Toward

**Scene 1: The morning price brief.** It is 7:30 AM. Hia Iam sits at his desk with coffee. He opens the AquaWise daily price feed in LINE. Today's prices across three markets, the 30-day trend, the regional spread. He reads it for ninety seconds, internalizes it, and begins his morning calls. No software training. No setup. Just useful information at the right moment.

**Scene 2: The farm readiness call list.** Tuesday morning, 9:00 AM. Hia Iam opens the broker dashboard. Eleven AquaWise-tracked farms in his service zone are within 14 days of harvest. He reviews their predicted volumes and sizes. He prioritizes calls to the four largest. By 11:00 AM he has confirmed four loads for next week, planned the truck schedules, and pre-negotiated with two factories. The morning that used to take three hours of phone calls and guessing took ninety minutes of structured work.

**Scene 3: The avoided bad trip.** P'Maem (southern auction broker) is preparing to bid on a farm's harvest. AquaWise farm readiness data shows the farm's predicted size is 70 (smaller than the farmer claimed at 60). The factory she would have sold to pays a premium for size 60 but discounts for size 70. She adjusts her bid down by ฿8/kg, wins the auction at the lower price, and her trip economics work. The bad trip she would have made under her old information regime is avoided. ฿20,000 of risk avoided through better information.

**Scene 4: The defended factory rejection.** ⚠ 2027+ feature. Hia Iam delivers a 5-ton lot to a Mahachai factory. The factory tries to reject 1.5 tons of size 60 for "off-color" with a major price reduction proposal — claiming roughly ฿180K of value reduction on the lot. Hia Iam pulls up the AquaWise harvest-day record on his phone — water quality readings, size measurements at weighing, photos. The factory's rejection claim does not stand up against the data. They negotiate down to a partial rejection of 300 kg with a smaller price adjustment, saving Hia Iam ฿130K+ of margin destruction. One scene 4 per quarter pays for an entire year of subscription many times over.

**Scene 5: The unprompted referral.** Hia Iam mentions AquaWise to another Chachoengsao broker over lunch, unprompted. *"It's actually useful. Not the marketplace nonsense I expected. Just the price feed and the farm readiness data."* The other broker tries it. He becomes broker subscriber number two. This is the year-end test for AquaWise on the broker side: when a 30-year veteran who dismissed almost every tech pitch he ever heard recommends AquaWise to a peer, we have crossed the threshold from vendor to useful tool.

These five scenes are achievable in the order listed. Scene 1 is buildable in 2026. Scene 2 by mid-2026. Scene 3 by late 2026. Scenes 4 and 5 by 2027.

---

## 10. What This Means for the Tech Team

If you are building anything that touches the broker side, your work is shaped by what is in this document.

You are building for a 30-year veteran who has dismissed every previous technology pitch. You are building inside his fifteen-minute morning office window. You are building the wedge product (the daily price feed) that has to be valuable on its own, before the cross-farm dataset is mature. You are building it in three regional flavors — the Chachoengsao broker model, the southern auction model, the provincial mid-volume model — without forcing any one model on the others.

The single most important thing to internalize: **the broker's role in the chain is real and we protect it.** The temptation to build a marketplace that disintermediates the broker will arise repeatedly — from investors, from feature ideation, from inside the team. The answer is always no. AquaWise routes information; brokers route transactions. The broker is our channel and our customer; they are not the friction we are trying to eliminate.

Read this doc again next month. Things you missed the first time will become visible.

---

*End of broker customer document.*
