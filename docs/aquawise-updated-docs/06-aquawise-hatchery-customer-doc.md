# The Hatchery
## AquaWise Customer Document — v0.5 (Pending Validation)

**Author:** Chain (CEO) & founders
**Status:** v0.5, April 30, 2026 — *draft pending deep validation conversation with P'Bunjong*
**Audience:** Tech team, design team, founders. Not yet ready for external sharing.
**Reads alongside:** AquaWise Brand Foundation (master), AquaWise Stakeholder Map (the index), AquaWise What We Build First (sequencing), AquaWise Farmer Customer Document, AquaWise Nursery Customer Document.

**Purpose:** This is the customer document for the operator who runs the upstream hatchery (โรงเพาะฟัก) — the player who owns broodstock and produces nauplii from breeding, then sells nauplii to nurseries. Hatcheries are the smallest stakeholder population in the AquaWise system (fewer than thirty serious players in Thailand) and the most upstream. They are also the stakeholder we have done the *least* customer discovery work with.

**The honest framing.** We have one substantial transcript with P'Bunjong (President of the Thai Aquaculture Federation, who runs a true hatchery — broodstock-to-nauplii — at his level upstream of the nursery channel). That transcript gave us the framing for this document. We have not yet done a deep job-to-be-done conversation with him, and we have not interviewed any other hatchery operator. **Everything in this document marked with the symbol ⚠ is a hypothesis to be validated, not a confirmed customer reality.** The document exists at v0.5 because the architecture should be drafted before validation rather than after — having something to push back on is more useful than starting from blank — but the team should not treat any specific job, pricing, or scene as settled until we have done the validation work in 2027.

The hatchery section of the AquaWise system does not get serious product investment until 2027 (see What We Build First). This document is here to give the tech team a *direction,* not a feature spec.

---

## 1. Who the Hatchery Owner Is ⚠

It is 2:00 in the afternoon. The spawning room is humid and dark. P'Bunjong walks past tanks of broodstock that represent twenty years of selective breeding work — animals descended from lines he started building before AquaWise existed, before his children went to university, before the AHPND outbreak rewrote what survival meant in Thai shrimp aquaculture. He is checking the females scheduled to spawn tonight. The lab tech notes which ones look ready, which ones need another day. Nothing in this room can be hurried.

His business operates on a cadence the rest of the chain does not understand. A nursery's cycle is twenty days. A farmer's cycle is ninety days. A hatchery's *broodstock investment cycle* is years. A line he started building in 2018 is finally producing the offspring he wanted in 2026. If something goes wrong with that line — disease, contamination, a single nursery customer who blames bad post-larvae and tells everyone — the loss is not measured in one cycle of revenue. It is measured in *years of breeding work made commercially worthless.*

P'Bunjong has been in this business for thirty years. He is in his late fifties, soft-spoken, scientific in temperament. He is the President of the Thai Aquaculture Federation — a position of considerable influence, the kind of person whose word at a meeting changes how the industry thinks about something. He is also the person upstream of every nursery in our beachhead. Every batch of post-larvae P'Pong sells is descended from nauplii P'Bunjong's hatchery (or one of two or three peer hatcheries) produced.

He has roughly twenty to forty serious nursery customers. Each one places an order for nauplii in the millions per delivery. Each delivery represents an opportunity for something to go wrong — in transit, at the receiving nursery, in the twenty-day grow-out, or in the farmer's pond ninety days later. By the time something goes wrong, the chain of evidence is so far removed from his hatchery that he has effectively no defense. He is the most invisible player in the chain, and the player whose work is the most expensive to do well.

This is the hatchery owner. He is not an operator looking for software; he is a scientist-businessman whose work is judged decades after he does it. What he needs from AquaWise is something that has never existed before: *a way to make his careful broodstock work visible across the chain so that good work is rewarded and bad outcomes get traced to their actual cause, not to the post-larvae by default.*

⚠ P'Bunjong is the archetype. There are roughly twenty to thirty serious hatcheries in Thailand. We have not interviewed the others. Everything below this point is hypothesis based primarily on his April 2026 conversation, plus general industry knowledge.

---

## 2. The Cost of Being Wrong ⚠

A serious Thai vannamei hatchery has annual revenue in the order of ฿80–120 million. The capital intensity is high — broodstock importation costs (P. vannamei broodstock from Hawaii, Florida, or proprietary Thai breeders), tank infrastructure, lab equipment, biosecurity systems, skilled labor. Margins are thin in a normal year, negative in a crisis year (the 2026 chain collapse has compressed hatchery margins severely as nursery orders dropped roughly 50% from the polyculture chain failure).

The cost of *being wrong* at a hatchery is asymmetric in time. A bad batch of nauplii — contaminated, weakened, genetically subpar — is not just a loss on that batch. It is *years of damaged reputation* downstream as nurseries blame the upstream hatchery for problems that may or may not have started there. P'Bunjong has watched competitors lose entire customer bases to a single rumor that may not have been true.

Conversely, the value of being *defended* at a hatchery is meaningful. If AquaWise can show, with cross-nursery cycle data, that batch B from P'Bunjong's hatchery produced 78% Day-30 survival across twelve nurseries' downstream farms, while a competing hatchery's batch produced 64% — the data builds P'Bunjong's premium pricing power over years. ⚠ A genuine 5% pricing premium on ฿80M of annual revenue is ฿4M per year. This is the rough order of magnitude AquaWise potentially delivers on the hatchery side, and it is the math behind why hatcheries can rationally pay AquaWise meaningfully more than nurseries.

⚠ Numbers in this section need validation. The ฿80–120M revenue figure is industry-typical but P'Bunjong's specific operation may be higher or lower. The 5% premium scenario is a hypothesis, not a measured outcome.

---

## 3. The Five Jobs the Hatchery Owner Is Trying to Get Done ⚠

⚠ This entire section is hypothetical. It is drafted from the P'Bunjong transcript and from inferring the structural problems of the hatchery role. It needs validation.

### Job 1 — Defend my broodstock lineages when they are blamed for problems they did not cause

This is the foundational job, mirroring the nursery's defended-dispute job, but two steps removed from the farm. When a farmer's cycle fails, the farmer blames the post-larvae. The nursery, if we are doing our job, has data to defend itself or to redirect the blame fairly. But if the data points further upstream — *"the post-larvae were healthy at the nursery, but the nauplii P'Bunjong supplied may have had a latent problem"* — then the hatchery is in the position the nursery used to be in: blamed, with no evidence to defend itself.

**Today.** P'Bunjong has a paper PCR record on every batch of nauplii he sells. He keeps retained samples for retesting. He has a lab tech who can speak to the science. None of this is structurally accessible at the moment a nursery is calling angry, three weeks after the nauplii delivery. The defense is technical, the conversation is emotional, and the asymmetry is brutal.

**With AquaWise.** ⚠ The hatchery dashboard shows him every batch of nauplii he has produced in the last twelve months, mapped to the nurseries that received them, mapped to the customer farms downstream of those nurseries, mapped to the cycle outcomes at those farms. When a nursery calls to complain, P'Bunjong opens the dashboard. Batch N-2026-03-44 of nauplii went to four nurseries, who packed it into eight different post-larvae batches, sold to fifty-two farms total. The Day-30 survival distribution across those fifty-two farms is statistically normal — well within the range of any clean batch. Three farms had problems; forty-nine did not. The data does not absolve P'Bunjong, but it *contextualizes* the complaint. The conversation that follows is structurally fairer.

### Job 2 — Help me see how my broodstock lineages are actually performing in the real world

This is the genetic-feedback job, and it is unique to hatcheries. P'Bunjong has been selectively breeding for decades. He believes certain lineages perform better than others under certain conditions. He has limited evidence for these beliefs because most of the evidence lives at farm level, ninety days downstream, and never travels back up to him.

**Today.** He has trial-and-error knowledge. He hears anecdotes from nurseries about which batches "did well." He cannot easily separate the broodstock contribution from the nursery contribution from the farm contribution to any given outcome.

**With AquaWise.** ⚠ The hatchery dashboard separates outcome variance by lineage, by nursery, and by farm conditions. Lineage A produced an average of 76% Day-30 survival across all downstream farms with a standard deviation of 8 points. Lineage B produced 71% with a standard deviation of 14 points. The data gives him science he can act on: which lineages are robust under variable conditions, which ones perform brilliantly in optimal conditions but collapse under stress, which ones to invest in and which ones to retire. ⚠ This is the most powerful and the most uncertain feature in this document — uncertain because we have not validated whether P'Bunjong wants or trusts this kind of feedback, and because the data analysis quality required to make it meaningful is high.

### Job 3 — Help me manage a small but high-stakes customer base

A hatchery has twenty to forty nursery customers. Losing one is a major event. Winning one is a major event. The customer relationships are deeper and more important than at the nursery level, but they are also fewer.

**Today.** P'Bunjong knows every nursery customer personally. He visits them. He has long phone calls. He attends the same association meetings. The relationships are managed in his head and in his calendar.

**With AquaWise.** ⚠ The dashboard tracks every nursery customer's order history, payment patterns, batch performance over time, and outstanding issues. Not as a CRM with sales-pipeline framing — that would be wrong for this relationship style — but as a *relationship dashboard* that surfaces facts (last order, average order size, recent batch outcomes, any open issues) when P'Bunjong is preparing for a phone call or a visit. The system does not change how he manages relationships; it gives him a head's-up before each conversation.

### Job 4 — Help me prove my hatchery is in the careful tier when the industry consolidates

⚠ This is the long-horizon job and the most speculative. The Thai shrimp industry has been consolidating for years — fewer hatcheries, fewer nurseries, larger operations. In this consolidation, the careful operators survive and the sloppy ones do not, but *being careful* and *being known to be careful* are different things. P'Bunjong's twenty years of careful breeding work could be undermined by a single industry-wide rumor that paints all hatcheries with the same brush during a crisis.

**Today.** His careful work is invisible outside his customer base. The Department of Fisheries White List exists, but it covers only PCR clean-status, not broodstock performance. There is no equivalent of an industry scorecard for hatcheries.

**With AquaWise.** ⚠ Over years (this is a 2028+ scenario), AquaWise becomes the de facto industry record of which hatcheries' lineages produce reliable downstream outcomes. P'Bunjong's hatchery is in the verified-careful tier. New nursery customers find him because of the AquaWise scorecard. Existing nursery customers stay with him because the scorecard makes the case for continued relationship even when a competitor offers a discount. The careful work of decades becomes legible to the market. ⚠ This is the most aspirational job in the document and the one most dependent on AquaWise reaching critical mass on the nursery and farm sides first.

### Job 5 — Help me adapt to industry changes (genetics, regulation, market shifts) faster than my competitors

This is the strategic-foresight job. Hatcheries are the most upstream players, which means they have the longest planning cycles. Decisions made today about broodstock acquisition, lineage development, and biosecurity infrastructure pay off (or fail) years later. Hatcheries that read industry trends correctly make money for years; hatcheries that miss trends lose money for years.

**Today.** P'Bunjong reads trends through association meetings, scientific conferences, conversations with peers, and his own intuition.

**With AquaWise.** ⚠ The cross-industry data we accumulate could, eventually, support trend reports specific to the hatchery: emerging disease patterns by region, lineage-performance trends, regulatory shifts (e.g., new DOF certifications), market signals about what nurseries and farms will need eighteen months from now. ⚠ This is the most distant job, achievable only after AquaWise has years of operating data and industry credibility.

---

## 4. What the Hatchery Owner's Day Already Looks Like ⚠

⚠ Inferred from general hatchery-industry knowledge, not validated with P'Bunjong specifically. This section needs the most validation work.

**Pre-dawn (5:00–7:00 AM).** Lab work. Spawning checks. Larval stage assessments. Water quality on the brood and rearing tanks. The lab tech does most of the hands-on work; P'Bunjong reviews and makes decisions about what is ready to harvest, what to spawn, what to retain.

**Morning (7:00–10:00 AM).** Production logistics. Organizing nauplii deliveries to nurseries. Quality-control sign-offs on each batch leaving the facility. PCR sample collection on outbound batches. This is the most operationally tense window — the deliveries that go out today determine the nursery cycles that start tomorrow.

**Mid-morning to noon (10:00 AM–12:00 PM).** Office time. Calls with nursery customers, calls with the Federation, occasional calls with regulators (DOF, DLD, DoA). Order intake, payment follow-up, planning conversations. ⚠ This is the most likely AquaWise dashboard window, by analogy with P'Pong's day.

**Afternoon (12:00–4:00 PM).** Production work. Tank rotations. Lineage development. Lab science with the tech team. New broodstock evaluations. Site walkthroughs.

**Late afternoon (4:00–6:00 PM).** Customer relationship work. Phone calls he could not get to in the morning. Visits if a major customer is local. Federation business if there is something pending.

**Evening (6:00 PM onward).** Family. Reading. Sometimes Federation evening events. Sleep around 10:30.

⚠ The friction budget for the hatchery side is unclear. Hatchery owners are more office-time-comfortable than farmers; they may tolerate longer interactions with software. But they are senior operators with little patience for software that fails to be useful on the first try. The discipline is the same as for the nursery: the dashboard must surface useful information at moments of need, without demanding setup or training that the owner does not want to do.

---

## 5. What the Hatchery Pays ⚠

Hypothesized opening tier: ฿5,000–15,000 per month flat, after a free pilot phase. The pricing is a hypothesis, not a commitment. See the Stakeholder Map's pricing-as-hypothesis section and the WTP Validation Plan for how this evolves.

⚠ The honest context. A hatchery doing ฿80–120M in annual revenue, where AquaWise potentially delivers a 5% pricing premium plus reduced reputational damage from defended disputes, can rationally pay AquaWise ฿100K+/month if we genuinely deliver these outcomes. The opening tier is conservative; the eventual pricing model — flat fee, per-cycle, per-broodstock-line monitored, performance-based on defended disputes, % of revenue — is to be validated in conversation with P'Bunjong in early 2027.

The ⚠ on the per-defended-dispute pricing structure (mentioned in the WTP Validation Plan) is worth highlighting here: this would be the most strategically interesting unit of billing if it works, because it ties our revenue directly to outcomes delivered. It is also operationally complex (how do we define a "defended dispute"? what counts as a successful defense?) and may not survive contact with reality. We test it in conversation before we commit to it.

---

## 6. What Success Looks Like ⚠

⚠ For P'Bunjong's hatchery, by the end of 2027 (not 2026 — the hatchery doesn't get serious investment until 2027):

- He is paying for AquaWise at a tier validated in conversation with us.
- He has used AquaWise data in at least one real nursery dispute, and the dispute resolved fairly.
- He has identified at least one broodstock lineage performance pattern from the cross-nursery data that informed a real breeding decision.
- He has, unprompted, recommended AquaWise to at least one peer hatchery.

For AquaWise, by the end of 2027, drawn from the hatchery side:

- 1 paying hatchery (P'Bunjong) by end of Q1 2027, plus 1–2 additional by end of 2027.
- Cross-nursery cycle data flowing back to hatchery dashboard at meaningful scale (200+ cycles per major hatchery per year).
- 1+ documented hatchery-side exoneration case.

⚠ All of these targets are dependent on the nursery and farmer sides hitting their 2026 numbers. If we miss those, the hatchery opportunity slips into 2028.

---

## 7. What We Will Never Build for the Hatchery Side

These are commitments. The hatchery anti-features mostly inherit from the nursery anti-features, with two additions specific to the hatchery role.

- **No broodstock genetics management software.** Hatcheries already have their own breeding programs and decision-support tools (or build them in-house). Building this would put us in a category we have no business being in.
- **No tank-level operations management.** Tank-by-tank nauplii production tooling is the hatchery's craft, not our intervention point.
- **No competing with existing hatchery tools.** Aquatec, BioMar, and various proprietary breeding systems exist. We are upstream of them in the chain (we deal with cross-stakeholder outcomes); we do not replace what hatcheries already use internally.
- **No real-time anything.** Same as nursery and farmer.
- **No data sale to third parties about specific hatcheries.** Aggregated, anonymized industry statistics may be published. Hatchery-identified data never leaves the system except by explicit written consent.
- **No nursery-to-hatchery information leakage.** A nursery's internal data (batch register, cycle outcomes for individual customers) is not visible to its upstream hatchery without the nursery's consent. Same principle as farmer-to-nursery.
- **No exclusivity arrangements with any single hatchery.** P'Bunjong is the first; he will not be the only. We do not give any hatchery special treatment, exclusive features, or preferred placement in nursery-facing surfaces.
- **No equity, sponsorship, or financial relationships that compromise neutrality.** A hatchery cannot buy a better scorecard, a higher placement, or any editorial influence on AquaWise. Neutrality is the moat.

---

## 8. The Voice We Use With the Hatchery Owner ⚠

The brand voice — *ลูกหลานที่เรียนมา* — applies, but with an even more deferential register than the nursery side. The hatchery owner is at the top of the technical hierarchy in Thai aquaculture. He is a scientist-businessman who has forgotten more about broodstock genetics than most of our team will ever learn. The voice respects this.

⚠ Specific commitments for hatchery-facing surfaces:

- **The dashboard is informational, never editorial.** No "Great work!" No "We recommend." Just data with sources, sample sizes, time windows, and confidence indicators.
- **Scientific terminology is welcome.** Where the farmer-side voice avoids jargon, the hatchery-side voice can use technical language because the hatchery owner uses it daily. PCR results are PCR results. Lineage performance is lineage performance. We do not over-translate.
- **The voice is patient and quiet.** Hatchery owners do not move fast. The dashboard does not ping or vibrate or demand attention. It is there when he wants it, silent when he does not.
- **The voice accepts being challenged.** A hatchery owner will, occasionally, look at our data and say "this is wrong, here is why." The voice accepts the challenge, says thank you, and updates the data when the owner is right. Defensiveness in the voice would be fatal at the hatchery level.

---

## 9. The Five Scenes We Are Building Toward ⚠

⚠ Hypothetical scenes. These need testing with P'Bunjong before they become canonical.

**Scene 1 (2027): The defended dispute, two steps upstream.** A nursery calls P'Bunjong, complaining that batch N-2026-08-92 of nauplii has produced poor downstream outcomes. P'Bunjong opens the AquaWise hatchery dashboard. The batch went to four nurseries. Across all four nurseries' downstream farms, Day-30 survival is 76% — well within normal range. The complaining nursery's specific outcomes are statistically normal too. The conversation is calm. The data does the work.

**Scene 2 (2027): The lineage decision.** P'Bunjong is planning his next round of broodstock retention. He opens the AquaWise dashboard. Lineage Alpha-9 has produced 79% average Day-30 survival across all downstream farms over the past twelve months, with a standard deviation of 6 points. Lineage Alpha-12 has produced 73% with a standard deviation of 14 points. Alpha-9 is more robust under variable conditions; Alpha-12 might still be the right choice for highly controlled nurseries but is wrong for the average customer. He retains Alpha-9 and retires Alpha-12. The decision is data-informed, not gut-felt.

**Scene 3 (2027): The new nursery customer.** A nursery owner P'Bunjong has not worked with before approaches him at an association meeting. The nursery owner is shopping for a new nauplii supplier. He has been looking at AquaWise hatchery scorecards (a 2027+ feature). P'Bunjong's hatchery is in the verified-careful tier. The conversation is short. Yes, P'Bunjong will take a trial order. The relationship begins on a foundation of verifiable trust rather than a friend-of-a-friend introduction.

**Scene 4 (2028): The industry-trend report.** AquaWise publishes its first annual hatchery industry report. P'Bunjong's hatchery is one of the references cited (with consent). The report shows, with cross-stakeholder data, that EHP detection rates rose 12% across central Thailand in 2027, that the average Day-30 survival of vannamei batches dropped 4 points, that one specific lineage popular among smaller hatcheries underperformed badly. The report is read at every Federation meeting for the next month. P'Bunjong's hatchery is associated with the data behind the report. His credibility, already high, becomes industry-defining.

**Scene 5 (2028+): The unprompted referral.** P'Bunjong, at a peer hatchery's facility, recommends AquaWise to a hatchery owner he has known for fifteen years. The peer hatchery becomes our second paying hatchery customer, brought in entirely by P'Bunjong's word. This is the year-end test for AquaWise on the hatchery side: when P'Bunjong vouches for us inside the closed circle of senior hatchery operators, we have crossed the threshold from vendor to infrastructure.

---

## 10. What This Means for the Tech Team

If you are building anything for the hatchery side in 2027 or beyond, your work is shaped by what is in this document — but only loosely, because most of this document is hypothesis.

The single most important thing to internalize: **the hatchery side is not the priority in 2026.** Resist the temptation to over-invest here early. The data flywheel runs through farmers and nurseries first. Hatcheries become a real product opportunity only after we have nursery and farm cycle data flowing at scale. Building hatchery-side features in 2026 splits the team's attention before the upstream data is meaningful.

In 2027, when we begin serious hatchery work, this document becomes the starting point — a starting point that should be heavily updated based on a real, multi-hour conversation with P'Bunjong (and ideally with one or two other hatchery owners) before we ship anything. The architecture of this doc — nine sections, the same structure as the farmer and nursery docs — is correct. The specific content of each section is mostly speculative until validated.

⚠ When in doubt about the hatchery side, the discipline is the same as everywhere else in AquaWise: do less, more carefully, and validate before scaling. The hatchery owner is a scientist. He will respect under-promising and consistent delivery. He will not respect breathless promises that fail to be backed by data. The brand position on the hatchery side is exactly the same as it is on every other side: *"trust the data, trust the source, trust the time we have spent earning the conversation."*

Read this doc again before any 2027 hatchery sprint kicks off. Most of the ⚠ markers will need to be removed first, replaced with validated facts from real conversations.

---

*End of hatchery customer document — v0.5, pending validation.*
