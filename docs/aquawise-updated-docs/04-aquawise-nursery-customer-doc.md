# The Nursery
## AquaWise Customer Document

**Author:** Chain (CEO) & founders
**Status:** v1, April 30, 2026
**Audience:** Tech team, design team, anyone building a feature that touches the nursery side of AquaWise (the LIFF counter form, the nursery dashboard, the batch register, the certificate generator).
**Reads alongside:** AquaWise Brand Foundation (master), AquaWise Stakeholder Map (the index), AquaWise What We Build First (sequencing), AquaWise Farmer Customer Document.

**Purpose:** This is the customer document for the operator who runs the nursery — the person who buys nauplii from a hatchery, grows them for about twenty days, and sells post-larvae to farms. This doc tells you *who they are, what they are trying to get done, what their day looks like, what they pay, what success looks like, and what we will never build for them.* The features and surfaces live in the nursery functional requirements doc; this is upstream of all that.

The nursery is not the protagonist of the AquaWise brand — the farmer is. But the nursery is the *channel* through which we reach farmers at scale, and it is the first stakeholder that pays us money. Get the nursery side wrong, and the farmer flywheel never spins. Get it right, and every QR poster at every nursery counter in Chachoengsao becomes a high-trust onboarding moment for a new farmer.

---

## 1. Who the Nursery Owner Is

It is 11:30 in the morning. The customer is on the phone, agitated. The cycle he stocked twenty-eight days ago is showing white feces. He is sure it is the post-larvae P'Pong sold him. He wants compensation. He is the kind of customer who, if not handled carefully, will tell every other farmer in the district that P'Pong's nursery sells bad larvae.

P'Pong sits in his office at the back of the nursery, listening, holding a cup of cold tea. He has been running this nursery in Chachoengsao for over twenty years. He is the President of the Thai Shrimp Larvae Hatchery Association — the formal name is older terminology, but operationally he runs a nursery: nauplii in, post-larvae out, twenty days, eight tanks, hundreds of farm customers across the central region.

He listens to the customer. He has heard a version of this conversation a hundred times. Sometimes the post-larvae really were the problem. Sometimes — most of the time — the conditions at the farm were the problem, and the post-larvae are the easy thing to blame because they came in last and the cycle failed soon after. He has no way to prove which it was. He has a paper notebook with the batch number, the PCR results from his lab tech, the names of the other twelve farms that received the same batch this month. He has nothing he can put in front of this customer that the customer will accept.

So he does what he has always done. He apologizes. He offers a partial refund or a discount on the next purchase. He absorbs the loss and the reputational damage. He gets off the phone, pours the cold tea down the sink, and gets back to work. There is a delivery to organize for tomorrow morning. Three farms in Bangkok-Chachoengsao corridor have ordered. The truck has to leave at 4:30 AM with the oxygen bags packed cold.

This is the nursery owner. He is not a tech company's user; he is a sixty-year-old businessman who has been doing biological work for twenty-five years and has seen four major industry crises (the AHPND outbreak in 2011, the EHP epidemic, the price collapse of 2024, the polyculture chain collapse of 2026). He has survived because his batches are good and his relationships are strong. What he has never had is a way to *prove* his batches are good, in a way that defends him when someone is shouting on the other end of the phone.

P'Pong is the archetype, and there are roughly three hundred to five hundred operators like him across Thailand. Most are concentrated in Chachoengsao, Samut Sakhon, and the central region. Each one serves dozens to hundreds of farm customers per cycle. Each one has a sales cycle that starts when the farmer arrives at the counter and ends — formally — twenty days later when the truck departs with the post-larvae. *Informally,* each cycle continues for another ninety days, in his head, as he wonders whether the customer's farm is doing well, whether they will come back, whether the next angry phone call will be about his batch.

We call him the Careful Nursery Owner. He is careful because the alternative — running a sloppy operation — failed long ago in the AHPND crisis, when only the careful operators survived. He is the operator AquaWise was designed to serve at the upstream end of the chain, just as the farmer is the operator AquaWise was designed to serve at the downstream end.

---

## 2. The Cost of Being Wrong

A nursery operator's economics are different from a farmer's. The farmer makes or loses money one cycle at a time. The nursery owner makes or loses money one *customer* at a time, where each customer represents many cycles of future revenue.

A serious Thai nursery sells thirty to eighty million post-larvae per year, to one hundred to three hundred farm customers. The wholesale price of post-larvae is roughly fifteen to twenty-five satang per piece (varies seasonally and by quality), so total annual revenue is typically twenty to forty million baht. Margins are thin — feed, oxygen, labor, broodstock costs, and twenty-day grow-out time all eat into the spread between nauplii cost and post-larvae sale price.

The cost of losing a customer is not the lost revenue from that customer alone; it is the *retention failure rate compounded over time.* In an industry where word of mouth dominates and association meetings are where reputation is made, one angry customer who tells five friends costs the nursery far more than the single sale they walked away from. P'Pong's biggest fear is not a single bad cycle; it is *the slow erosion of his network of trusting customers* due to disputes he could not defend.

A 10% retention improvement on a nursery doing 30 million baht in revenue is roughly 600,000 to 2 million baht per year, depending on customer lifetime value assumptions. This is the value AquaWise potentially delivers, and it is meaningful — it is the math behind why nurseries can rationally pay AquaWise serious money once we deliver. But the value flows back to the nursery only if the system actually works, which it cannot until we have enough cycles tracked to defend disputes with evidence rather than with apologies.

The exoneration moment — the conversation where P'Pong can show the customer that this batch went to fourteen farms and eleven of them got 75%+ Day-30 survival, that the three exceptions all had pH variance issues, that the DOF White List PCR for this batch was clean — is the single most valuable moment in the AquaWise nursery product. Every other feature is a brick in the foundation of that moment.

---

## 3. The Five Jobs the Nursery Owner Is Trying to Get Done

Five jobs, in his order, in his language.

### Job 1 — Defend me when the customer blames my batch unfairly

This is the foundational job. It is also the highest-emotional-weight job. *"พิสูจน์ไม่ใช่ความผิด PL"* — prove it was not the post-larvae's fault. The nursery owner has carried this defense in his head for twenty-five years and never had the data to back it up.

**Today.** When a customer blames the batch, P'Pong has three options: argue (which damages the relationship), apologize and absorb the loss (which damages his margins), or a combination. He keeps notes in a paper notebook about which farms received which batches, but he cannot easily produce the data on demand, and even if he could, the customer would not be satisfied with the nursery's own internal records.

**With AquaWise.** When a customer disputes a batch, P'Pong opens the nursery dashboard. Batch B-2026-04-117 was sold to fourteen farms. Eleven of them are at 78%+ Day-30 survival. The three below 75% all show pH variance issues in week six. The DOF White List PCR for this batch is clean across the board. He shares the relevant view with the customer (with farmer consent for any specific farm, anonymized for the rest). The conversation that follows is structurally fairer because both sides are looking at the same evidence. The customer may still be unhappy, but they cannot reasonably continue to blame the batch when the data shows the batch performed well at eleven other farms with similar conditions. P'Pong has been defended without having to defend himself.

### Job 2 — Help me know which customers will reorder, and when

This is restocking-timing intelligence — the highest-ROI job in P'Pong's economic life. A farmer who buys post-larvae on cycle one and then disappears is a lost ฿50,000–200,000 of lifetime value. A farmer who is called at the right moment — Day 90 of his cycle, two weeks before he stocks the next one — is far more likely to reorder than one called at the wrong moment.

**Today.** P'Pong tracks this in his head and in a paper ledger. He has a pretty good intuition about when each major customer will reorder, but the intuition decays fast as the customer base grows beyond what he personally remembers. Sales staff cannot easily share his mental model. Cycles get missed. Customers go to competitors not because the competitor is better but because the competitor called first.

**With AquaWise.** The nursery dashboard shows him every active customer cycle, sorted by predicted reorder date. He sees that twelve customers are between Day 80 and Day 100, predicted to harvest in the next two weeks. He knows their typical reorder volumes. He knows which competitors they have used in the past. The system does not call them for him; it tells him *who to call, and when*. He still does the work of the relationship; we hand him the list.

### Job 3 — Help me run my batches like a quality operation people can verify

This is the trust-artifact job. P'Pong has always run a careful operation — clean broodstock, regular PCR testing, stress tests, water quality discipline. None of this is visible to his customers. His batches are good but indistinguishable, on the surface, from the batches of nurseries that take shortcuts. Without verifiable differentiation, price competition is on volume and relationship alone, and quality erodes into commodity over years.

**Today.** Customers ask about PCR results and P'Pong tells them. They sometimes ask to see a paper, which he provides if he has it on hand. Most do not ask. Some ask once, see the paper, and never ask again because they are not sure what they are looking at. The DOF White List exists but most farmers do not know about it; even fewer use it.

**With AquaWise.** Every batch P'Pong sells generates a batch certificate that is automatically sent to the farmer's LINE on the day of sale. The certificate shows the source hatchery (broodstock supplier), the batch ID, PCR clean-status with a tappable link to the actual Department of Fisheries record, the pack date, the AquaWise verification stamp. The farmer keeps the certificate. They share it with their broker and their feed company rep. P'Pong's care becomes legible. Over time, this legibility becomes the basis for premium pricing — *"P'Pong's batches always come with verified certificates"* enters the local vocabulary, and customers increasingly treat the certificate as the price of doing business.

### Job 4 — Help me catch disease early when something is going wrong

This is the cross-farm pattern job. A serious nursery sells the same batch to ten or fifteen farms in a single week. If a disease outbreak is happening in the batch, the symptoms will appear at multiple farms within a few days of each other. P'Pong cannot see this pattern from his own end — he hears about each individual farm's symptoms one at a time, and by the time he realizes there is a pattern, the damage is done.

**Today.** He hears about disease one farm at a time, by phone. He may not connect the dots between Farm A reporting white feces on Day 21 and Farm C reporting white feces on Day 23, because each conversation is its own thing. By the time three farms have called, he is reactive instead of proactive. The reputation damage is well underway.

**With AquaWise.** The disease tracking dashboard alerts him the moment a pattern emerges across multiple farms with the same batch. *"Three farms that received batch B-2026-04-117 have reported white feces between Day 21–23. The DOF White List PCR for this batch was clean. We recommend you contact the affected customers and the farms still incubating."* The system surfaces patterns no individual farm could see, in time to intervene rather than absorb. Sometimes the pattern will turn out to be coincidence (three farms with similar pond conditions). Sometimes it will be a real upstream signal that requires action. Either way, P'Pong knows first.

### Job 5 — Help me grow the nursery without losing what made it work

This is the growth job, and it is the last one because it is the one P'Pong is most ambivalent about. Growth is good — more customers, more revenue, more influence in the association. Growth is also dangerous — every new customer is one more relationship he cannot personally manage, one more customer who might shout on the phone, one more cycle whose outcome will reflect on his nursery's reputation.

**Today.** Growth happens through word of mouth and through P'Pong's personal presence in the association. New customers arrive because someone recommended him. He cannot easily scale this — his time is the bottleneck — and he cannot easily verify whether new customers are getting the same level of care his oldest customers got, because his time is the bottleneck.

**With AquaWise.** New customers come through the QR poster at the counter, which is a *low-touch* onboarding (the farmer scans, joins the AquaWise LINE OA, gets the certificate in their phone — P'Pong's staff did fifteen seconds of typing). The system does the relationship-maintenance work that P'Pong cannot scale: tracks every cycle, alerts him when something goes wrong, generates the certificates that signal his care. He still does the high-value work — the personal phone call when a major customer needs reassurance, the visit to a farm that is struggling — but he does it with leverage. The nursery grows without the personal-attention floor collapsing.

---

## 4. What the Nursery Owner's Day Already Looks Like

For the tech team's mental model. The nursery's day has shape, and AquaWise has to fit inside it.

**Pre-dawn (4:00–5:30 AM).** Truck departs. Oxygen bags packed cold. P'Pong is up at 4:00, supervises the pack, signs off on the delivery manifest, sends the truck off. This is the most operationally critical window of his day.

**Morning (5:30–9:00 AM).** Lab work, broodstock care, water quality measurement on the production tanks. The lab tech (a single person with biology training, often a cousin or a long-term employee) handles most of this. P'Pong walks through, asks questions, makes calls.

**Mid-morning (9:00 AM–noon).** Office time. Phone calls with customers — both incoming complaints and outgoing follow-ups. Order intake from the previous day. Coordinating with the upstream hatchery (P'Bunjong-class supplier) on the next nauplii order. This is the window where the nursery dashboard is most useful — P'Pong is at his desk with his laptop and his phone.

**Afternoon (noon–4:00 PM).** Counter sales. Farmers come to buy. Walk-in customers, call-ahead pickups, occasional new customers introduced by existing ones. The counter staff handle most of this; P'Pong is sometimes present for new or large-volume customers. *This is where the LIFF counter form lives* — entered by the counter staff in fifteen seconds while the customer pays.

**Late afternoon (4:00–7:00 PM).** Lab work continues. Tank monitoring. Pack preparation for tomorrow's deliveries. Customer calls. P'Pong walks the production tanks one last time, talks to the lab tech, signs off on the next day's delivery list.

**Evening (7:00 PM onward).** Family time, dinner, association calls or meetings if it is that kind of evening. Bed by 10:00 if he can manage it.

**Where AquaWise fits.** The mid-morning window (9:00 AM–noon) is the primary nursery-dashboard window. This is when P'Pong is at his desk, has time to think, has the laptop open. The counter window (afternoon) is when the LIFF form is used by counter staff for fifteen seconds per sale. The early-evening tank walk (5:00–6:00 PM) is when an alert about cross-farm disease patterns might land — and the alert needs to be *actionable* (contact list ready, draft message available) because P'Pong is on his feet, not at his desk.

**The fifteen-second test.** The LIFF counter form has to clear in under fifteen seconds, with the customer waiting. This is non-negotiable. If the form takes longer, counter staff will work around it — entering data after the customer leaves, in batches, with errors, and we will lose data integrity at the source. Fifteen seconds is the friction budget at the moment of sale; everything else can take longer.

---

## 5. What the Nursery Pays

Hypothesized opening tier: ฿2,000–5,000 per month, flat, after the H1 free-pilot phase. The pricing is a hypothesis, not a commitment. See the Stakeholder Map's pricing-as-hypothesis section and the WTP Validation Plan for how this evolves.

The honest context the tech team should know. A 10% retention improvement on a 30M-baht-revenue nursery is worth 600K to 2M baht per year. The opening tier captures less than 1% of that value. This is deliberate: we open at a price that is obviously fair to the customer, prove value over twelve months, and revisit pricing in year two when the conversation is *"here is what AquaWise saved you in the last twelve months."* The right unit of billing — flat fee, per-batch certificate, per-cycle, hybrid — is also TBD; we will validate it in conversation with P'Pong and with the next two nurseries from his association referral.

What does not change with pricing evolution: **the nursery pays for participation in the trust system, not for individual features.** Every feature is unlocked at every tier. The lock-in is exit cost — leaving means losing the scorecard, the certificate history, the cycle continuity with customers. Pricing is for *being inside the system,* not for unlocking incremental capability.

---

## 6. What Success Looks Like

For the nursery owner, by the end of 2026:

- P'Pong's pilot is complete: one nursery × one batch × ten farms, with cycle data flowing end to end.
- He has used AquaWise data to defend himself in at least one real customer dispute, and the dispute resolved in his favor.
- He has measurable improvement in customer reorder rates compared to the previous comparable period.
- He has, unprompted, recommended AquaWise to at least one other nursery in his association. (This is the year-end test: when P'Pong forwards the QR-poster template to a peer without us asking him to, we know the brand has earned the relationship.)

For AquaWise, by the end of 2026, drawn from the nursery side:

- 5 paying nurseries (P'Pong plus four from his association referral).
- 100+ batches in the register, all with DOF White List PCR linked at creation.
- 80+ cycles tracked from PL purchase to harvest.
- 1+ documented exoneration case, ideally with the customer's verbal acknowledgment that the data resolved the dispute fairly.

These numbers are intentionally modest. The first five nurseries are the ones whose stories will be told for years inside the association. Quality of relationship matters more than count.

---

## 7. What We Will Never Build for the Nursery Side

Genuine never. Not "not yet," not "maybe later." Commitments.

- **No tank-side IoT for nursery operations.** Same no-hardware rule that governs the farmer side. P'Bunjong's specific warning: nurseries who bought IoT used it for a month and quit, because devices that show numbers without interpretation are not a product. We do not enter that category.
- **No nursery internal ERP / accounting.** Express, MAC-5, AutoFlight, and others already serve this. Building it makes us a worse competitor in a saturated category.
- **No larval rearing operations management.** Tank-by-tank, day-by-day production tooling. This is the nursery's craft, not our intervention point. Adding it expands surface area without adding moat.
- **No direct PL sales or e-commerce.** Disintermediating the nursery's existing sales process turns them from partner to enemy. The QR at counter is the only sales-adjacent feature.
- **No nursery-to-nursery comparisons in early phases.** Until cross-nursery cycle data is statistically meaningful (n ≥ 30 farms × 3 batches per nursery), peer comparisons are libel. Even when n is large enough, comparisons happen with explicit nursery consent.
- **No sponsorship from one nursery against another.** We do not take money from one nursery to favor it over another in any view. Neutrality is the moat.
- **No real-time anything.** The cadences are appointment-based: counter sale (LIFF), daily dashboard review (mid-morning desk time), event-based alerts (disease patterns, dispute escalations). Anything faster is overpromising.
- **No marketing tools.** No email campaign builder. No automated customer outreach. P'Pong sends his own messages; we tell him *who to send them to.*
- **No discount-for-data exchanges.** Per P'Bunjong's principle: data sharing is *participation,* not a transactional exchange. Verified-good batches earn premiums in the market; data-sharing nurseries do not get discounts on their AquaWise subscription.
- **No data sale to third parties about specific nurseries.** Aggregated, anonymized industry statistics may be published. Nursery-identified data never leaves the system except by the nursery's explicit written consent.

---

## 8. The Voice We Use With the Nursery

The brand voice from the master Brand Foundation document — *ลูกหลานที่เรียนมา*, the educated younger relative who came back to help — applies here, but with one important shift: the nursery owner is older, more senior, and more accomplished than the farmer. The voice in nursery-facing surfaces is the *deferential* version of ลูกหลาน, not the gentle-mentor version.

Specifics:

- **Even more พี่/น้อง than the farmer side.** P'Pong is sixty. He is the President of an association. The voice never talks down to him, never explains industry concepts he obviously knows, never offers unsolicited advice. The bot is a tool he uses; it is not a co-worker who has opinions.
- **The dashboard is informational, not editorial.** The dashboard shows him the data; it does not interpret the data for him unless he asks. *"Batch B-2026-04-117: Day 30 survival 78% across fourteen farms. Three farms below 75%."* That is the language. Not *"This batch is performing well."* He decides what "performing well" means; we surface what is.
- **Specificity always, with sources.** Every number in every nursery surface cites its source. Department of Fisheries link. Sample size. Time window. Confidence indicator. The nursery owner deals with skeptical customers all day; he respects sources because he understands why they matter.
- **No celebration.** The dashboard does not say "Great job!" when survival is high. It does not use motivational language. The nursery owner is not motivated by software; he is informed by it. Celebrating breaks the voice.
- **Quiet about success, immediate about problems.** When everything is going well, the dashboard is calm. When a cross-farm disease pattern emerges, the alert is direct and includes a recommended action (contact list, suggested message). The voice modulates with the stakes; it is not constantly "engaging."

---

## 9. The Five Scenes We Are Building Toward

For the tech team, the same exercise as the Farmer doc: when in doubt about whether a feature matters on the nursery side, ask whether it brings one of these scenes closer.

**Scene 1: The defended dispute.** A customer calls at 11:30 AM, agitated, blaming P'Pong's batch for white feces. P'Pong opens the dashboard. Batch B-2026-04-117 went to fourteen farms; eleven are at 78%+ Day-30 survival; the three below all show pH variance in week six; DOF White List PCR is clean. He shares the relevant views with the customer (anonymized for other farms). The customer goes quiet, then concedes. He hangs up the phone. The cup of tea is still warm. The dispute ended without a fight, with the data doing the work.

**Scene 2: The fifteen-second counter sale.** A farmer arrives at the counter to buy 200,000 post-larvae. The counter staff member opens the LIFF form on her phone, types the batch ID, the customer LINE ID, the pond ID. Submit. Twelve seconds total. The farmer scans the QR poster on the counter, becomes a friend of the AquaWise LINE OA, and receives the batch certificate to his LINE thirty seconds later as he is loading the bags into his pickup. The cycle is now in the system without anyone having stopped to think about it.

**Scene 3: The reorder call list.** Tuesday morning, 9:30 AM. P'Pong opens the dashboard. He sees twelve customers approaching their reorder window. He knows their typical volumes, their preferred batches, their previous reorder dates. He spends ninety minutes calling six of them. Three reorder for next week. Two reorder for two weeks out. One says he is taking a cycle off. A nursery growth lever that used to take all of P'Pong's mental capacity now takes ninety minutes of his desk time, with better hit rate.

**Scene 4: The disease pattern alert.** Wednesday, 5:45 PM. P'Pong is walking the tanks. His phone vibrates. *"Three farms that received batch B-2026-04-117 have reported white feces between Day 21–23. PCR on this batch was clean. Recommend contacting affected customers and the eleven farms still incubating to monitor closely."* He calls the lab tech. They pull the retained sample. They send it for an out-of-cycle PCR retest. By the time the test result comes back (clean), P'Pong has already called the eleven incubating farms to advise close monitoring. The pattern turned out to be coincidence — three farms with similar pond conditions — but P'Pong was ahead of the panic instead of chasing it.

**Scene 5: The unprompted referral.** Friday afternoon at the association meeting. Another nursery owner asks P'Pong how things have been. P'Pong mentions the AquaWise pilot, in passing, without us being there. He shows the dashboard on his phone. He tells the story of Scene 1. The other nursery owner asks how to get into the system. P'Pong sends him our LINE contact. The other nursery owner becomes paying customer number two, brought in by P'Pong without any work from us. This is the year-end test for AquaWise on the nursery side: when P'Pong recommends us unprompted, we have earned the brand's place in his life.

These five scenes are not all real yet. Scene 2 is in pilot now. Scene 3 will be real by mid-2026. Scenes 1, 4, and 5 will become real over the course of the second half of 2026 as cycle data accumulates and the dataset becomes statistically meaningful. Every feature we ship on the nursery side should be testable against these scenes: *does this bring scene N closer or not?*

---

## 10. What This Means for the Tech Team

If you are building anything that touches the nursery side, your work is shaped by what is in this document.

You are building for a sixty-year-old businessman who has run his nursery for twenty-five years and has nothing to learn from your software. You are building inside his fifteen-second window at the counter, his ninety-minute window at the desk in mid-morning, his three-minute window when he is walking the tanks and his phone buzzes with an alert. You are not building a CRM. You are building a *trust artifact factory* that runs in the background of his existing operation and surfaces evidence at the moments he needs it.

The exoneration moment is the highest-stakes feature you will ever build on the nursery side. If you can deliver Scene 1 reliably — a real defended dispute, settled with data, that P'Pong tells other nursery owners about — you have built the product that justifies the entire flywheel from his end.

Read this doc again next month. Things you missed the first time will become visible.

---

*End of nursery customer document.*
