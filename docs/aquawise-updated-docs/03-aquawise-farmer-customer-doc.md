# The Farmer
## AquaWise Customer Document

**Author:** Chain (CEO) & founders
**Status:** v1, April 30, 2026
**Audience:** Tech team, design team, anyone building a feature that touches the LINE bot side of AquaWise.
**Reads alongside:** AquaWise Brand Foundation (master), AquaWise Stakeholder Map (the index), AquaWise What We Build First (sequencing).

**Purpose:** This is the deepest customer document in the AquaWise system. The farmer is the protagonist of the brand, the data flywheel input, and the human whose pond decides whether everything else we build matters. Before you write a single line of code or design a single Flex Message that touches the farmer side, read this. Then read it again next month, when the work has revealed what the document does not yet say.

This doc is written from the farmer's perspective, not from the product's perspective. It tells you *who they are, what they are trying to get done, what their day looks like, what they pay, what success looks like, and what we will never build for them.* Features and functional requirements live elsewhere; this doc is upstream of all of that.

---

## 1. Who the Farmer Is

It is 5:17 in the morning. The light is just starting to come up over the Bang Pakong river that feeds the irrigation channels into his land. P'Ek walks down to pond number seven in his boots that have been wet for fifteen years. He has owned this farm since his father retired in 2010. Twelve earthen ponds on his own land, on ground his family has farmed for two generations.

The pond looks wrong. Not in a way he could explain to anyone else. The surface is too still where it should be moving with the aerator. The shrimp are not coming up to the feed tray when he taps it. The water has a slight smell he has learned to distrust. He has seen this before. Sometimes it is nothing. Sometimes it is the start of a bad cycle that will cost him eight hundred thousand baht and three months of work.

He does not call anyone. It is too early, and the people who would know — the nursery owner who sold him the post-larvae three weeks ago, the broker who bought his last harvest, the friend two ponds over who used to share information before a bad season turned them careful — would not pick up at 5:17. He stands in his boots with his phone in his hand and reads the LINE chat from his association, where most messages are stickers and weather emoji. He is alone.

This is the farmer. He is not a persona. He is a man who has been doing this work since he was nineteen. He has notebooks going back to 2009, in his own handwriting, recording every cycle, every feed conversion ratio, every harvest weight, every dispute with every nursery and every broker. He has been the protagonist of his own life for forty-three years and he does not need a tech company to come tell him how to farm.

What he does need, and does not have, is a second opinion at 5:17 in the morning. A way to know if pond seven is the only pond in his zone acting strange this week, or if the same thing is happening to the careful operator three kilometers down the road who draws from the same intake water. A way to be defended when the broker tries to lowball him on the harvest because of a problem that was not his fault. A way to qualify for credit when the next cycle's feed costs a hundred and twenty thousand baht and he has eighty thousand in the account.

P'Ek is the archetype, and there are roughly fifteen thousand farmers like him in Thailand. They are the ones we are building for. They are not the smallest farms (the subsistence operators with two ponds), and they are not the biggest (the industrial operations with their own lab biologists). They are the middle — sophisticated enough to keep records, too small to have staff for analysis, alone in a way that information could fix and money cannot.

We call them the Stuck Operator. They are stuck between extensive and industrial. They are stuck with information asymmetry — they have data, but no analysis; they have problems, but no expert at hand. They are stuck without credit, because banks cannot assess shrimp-farm risk and so the farmers self-fund every cycle, and one bad cycle wipes them out.

This is the human whose isolation we are fighting. Everything else we build is in service of him.

---

## 2. The Cost of Being Wrong

Before we talk about jobs to be done, the tech team needs to understand the stakes the farmer is operating under, in money. This is not abstract.

A bad cycle on a single pond — one that fails before harvest, or harvests at a survival rate below 40%, or grows shrimp too small to command good prices — costs the farmer roughly **three hundred thousand to five hundred thousand baht.** Per pond. Per cycle. That is the feed already poured in, the post-larvae already paid for, the labor and aeration already burned, the opportunity cost of three months that could have been a good cycle.

A farmer with twelve ponds, like P'Ek, runs three to four cycles a year per pond, staggered. He has thirty-six to forty-eight cycles per year flowing through his property. If two of those cycles fail in a year — which happens regularly in the Thai industry — he loses six hundred thousand to a million baht. That is the difference between a profitable year and a year where he cannot pay the next round of feed.

This is why the farmer's primary emotional state is a low-grade anxiety that never fully resolves. Every cycle is a bet. The bet is mostly skill, but it is partly luck — water that came from the river upstream, weather that was unpredictable, a batch of post-larvae that was clean at the nursery and contaminated by the time it arrived. The farmer cannot see most of the variables. He bets anyway, because he has to.

A 5% improvement in this farmer's decision quality — fewer cycles failed, fewer harvests sold below market price, better feed conversion — is worth, conservatively, three hundred thousand baht a year. A 10% improvement is six hundred thousand. The math is straightforward and the value is real. *This is why farmers might rationally pay AquaWise meaningful money if we ever served the commercial-scale tier.* But for the smallholder we are serving in 2026 — two to twenty ponds, 5–15% margins — the brand commitment is that they pay zero, always. The value is real, but it gets returned to them rather than extracted from them.

---

## 3. The Five Jobs the Farmer Is Trying to Get Done

The farmer is hiring AquaWise to do five jobs. They are listed in the order he feels them, not the order we like to talk about them. Each job is named in his language. Each job has a current state (what he does today) and a future state (what AquaWise enables).

### Job 1 — Don't let my harvest die

This is survival. *"Don't let me lose this cycle."* The farmer is at 5:17 in the morning watching pond seven act strange and wondering if it is the start of a disaster. He needs early warning, contextual judgment, and someone to tell him what he is seeing.

**Today.** He looks at the pond. He checks his notebook from the last cycle to see if he had similar conditions. He calls a friend, if it is late enough in the day to call. He waits and watches. If it is bad, by the time he is sure it is bad, the damage is already done.

**With AquaWise.** น้องน้ำ — the LINE bot — already knows the cycle is on day twenty-three. It already knows the weather forecast, the satellite-observed water quality of this pond's intake source, the historical pattern of this farmer's previous cycles in similar conditions. When the farmer types *"pond seven feels wrong, shrimp not coming to feed tray"* in his own words, the bot replies with three things: *here is what three other farms in your zone reported in the last week; here is what the data suggests about the most likely cause; here is what experienced operators have done in this situation, ranked by how often it worked.* He puts down the phone. He is not the only person watching this pond anymore.

### Job 2 — Help me make better decisions about feed and water

This is optimization. The farmer pours feed into the pond every day. He runs aerators around the clock. Both decisions are expensive. Both decisions are made on intuition built up over fifteen years, supplemented by what the feed company rep tells him on the monthly visit, supplemented by what other farmers casually share. None of his decisions have a quantitative reference.

**Today.** He follows the feed schedule on the bag, with manual adjustments based on yอเช็ค (the feeding tray check at 90 minutes). He measures water quality once or twice a week if he is disciplined; many farmers measure less. He does not know if his feed conversion ratio is above or below the regional average, because he has no regional average to compare to.

**With AquaWise.** The bot pulls his recent feed-and-growth records (entered via daily logbook photo with OCR confirmation, in the WHOOP-passive-collection model) and compares them to his own previous cycles and to anonymized peer cycles in similar conditions. It tells him: *your feed conversion this cycle is 0.92, which is better than your last three cycles at this stage; your peer median is 0.96. Keep going.* Or: *your feed is running 12% above your typical pace; have you adjusted for the cooler weather this week?* The bot does not tell him what to do. It tells him what is happening, against context he has never had access to before.

### Job 3 — Help me know what's happening in the market

This is price intelligence. The farmer's harvest is sold to a broker (ล้ง). The broker offers a price the morning of harvest. The farmer says yes or no. The farmer has no real-time visibility into what other brokers are offering, what the export price is doing this week, what factory demand looks like.

**Today.** He listens to gossip at the coffee shop. He watches the นสพ.กุ้งไทย Facebook page when he remembers. He calls two or three brokers if he is feeling careful. He says yes to the price, mostly because he has to harvest in the next 48 hours regardless and the alternative is no buyer.

**With AquaWise.** The daily price feed in his LINE shows him what brokers paid at the central markets yesterday by size grade, what the three-year trend is for this week of the year, what the regional spread is between Chachoengsao and Samut Sakhon. When the broker arrives, the farmer knows whether the offered price is fair or low. He still says yes most of the time — the harvest has to happen — but he says yes with information instead of with hope.

### Job 4 — Defend me when I'm blamed for something that wasn't my fault

This is exoneration, the farmer's version of the same job the nursery owner has on the upstream side. When a cycle fails, the chain of blame walks backward — the broker blames the farmer for low quality, the farmer blames the nursery for bad post-larvae, the nursery blames the hatchery, the hatchery has nowhere to point. The farmer is in the middle of this chain. He gets blamed by the broker (who pays less or rejects the harvest) and he blames the nursery (who shrugs and points at his pond management). Neither blame is well-supported by evidence.

**Today.** He argues. He shows the broker his notebook. He calls the nursery and shouts. None of it is anchored in cross-farm data. None of it has the weight of a verifiable record. The arguments tend to settle in favor of whoever shouts loudest or has the most leverage.

**With AquaWise.** When a cycle fails, the bot can show the farmer (and, with his consent, the broker or the nursery) the same data. *"This batch was sold to fourteen farms. Eleven had Day-30 survival above 75%. Three farms below — including yours — had pH variance above 0.8 in week six. Department of Fisheries PCR for this batch was clean across the board."* The data does not assign blame. It presents facts, with sources. The argument that follows is structurally fairer because both sides see the same evidence. The farmer is not defenseless anymore.

### Job 5 — Help me get credit so I can keep going

This is the farthest-out job, but it is the one that, in the long run, may matter most. Most Thai shrimp farmers self-fund every cycle. Banks do not lend against shrimp because banks cannot assess the risk. So farmers run on cash, and one bad cycle wipes them out, and the industry stays small because it cannot grow on cash alone.

**Today.** He saves what he can from good cycles. He borrows from family when he has to. If he has land, he can occasionally collateralize it for a personal loan, but the loan is against the land, not against the operation. The bank does not know whether he is a good farmer or a bad one. It treats every shrimp farmer as equally risky, which means it does not lend much to anyone.

**With AquaWise.** Three years from now, when AquaWise has tracked his cycles for three years, the bank credit officer pulls a report on him. The report shows yield consistency, water quality discipline, batch source reliability, dispute history. He is, on paper, a careful operator. The bank says yes — and the loan is against his operational track record, not against his land. He no longer has to be at the mercy of cash flow. He can plan a year ahead. He can absorb a bad cycle without it being existential.

This job is 2028+ in our timeline. We do not promise it in 2026. But every cycle we track in 2026 is a brick in the foundation of this future.

---

## 4. What the Farmer's Day Already Looks Like

This section is for the tech team's mental model. Before AquaWise, the farmer's day already has shape. We do not want to disrupt the shape; we want to fit inside it.

**Pre-dawn (4:30–6:00 AM).** First pond walk. He looks at every pond, in person, in the dark with a flashlight. This is when he catches problems early. He has been doing this for fifteen years; it takes him about forty minutes for twelve ponds.

**Morning (6:00–10:00 AM).** Feed time, first round. He runs the aerators. He records the feed amounts in his notebook. He answers calls from the nursery, the broker, the feed company rep, his wife, his cousin. He is on his phone constantly during this window.

**Late morning (10:00 AM–noon).** Office work, in his small office at the front of the farm. He writes up the morning's records. He pays bills. He reads the news on his phone. He scrolls Facebook. This is the only window in his day where he is sitting still.

**Afternoon (noon–4:00 PM).** Pond maintenance. Repairs. Feed, second round. Water quality measurement if it is a measurement day (typically once or twice a week). Nap, if he can.

**Late afternoon (4:00–7:00 PM).** Feed, third round. Final pond walk. Conversations with workers. Calls with brokers if a harvest is coming up.

**Evening (7:00 PM onward).** Dinner with family. Phone time. Bed by 9:00 if he can manage it, because tomorrow is 4:30 again.

**Where AquaWise fits.** The two windows in his day where he naturally has the phone in his hand and time to look at it are *late morning at his desk* and *evening after dinner.* Anything that requires him to sit and read goes there. The pre-dawn pond walk is where he is most alone and most vulnerable, but he is not going to sit and read; he is going to fire off a quick message and want a fast answer. So the LINE bot has to be designed for two different modes: *the pre-dawn ping* (one-tap inputs, fast empathetic acknowledgment, action-oriented) and *the evening review* (longer messages, full charts, Day-30 survival check-in conversations).

**The friction budget.** In the WHOOP analogy that shapes our data collection design, the friction budget is one minute per day. That is what the farmer can give us, voluntarily, every day. We have to do everything else passively (weather, satellite, market prices auto-collected) or via WHOOP-style behavioral nudges (daily logbook photo with OCR, tap-first event logging, weekly voice check-in). If a feature requires more than one minute of active farmer effort per day, we will not be able to sustain participation, and the data flywheel will starve.

---

## 5. What the Farmer Pays

Zero. Always. At the smallholder tier — the farmer with two to twenty ponds operating on 5–15% margins, who is the operator we serve in 2026.

This is not a marketing decision. It is structural. Charging this farmer would change everything about the brand, the data flywheel, and the trust we are building. He pays in three other ways instead:

- **He gives us data.** Every cycle he reports, every photo of his logbook, every harvest he records, every dispute he flags. That data is the input the rest of the AquaWise system runs on.
- **He gives us the right to learn.** When the bot suggests something and he does it differently, that is information. When the bot is wrong and he tells us, that is information we cannot get any other way.
- **He gives us his trust, slowly.** Over years. Trust earned this way is worth more than money paid up front.

The honest context, named explicitly: a commercial-scale farm (50+ ponds, multi-million-baht annual revenue) might rationally pay six figures a year for AquaWise if we genuinely prevent crop failures. We have not validated this and we do not commit to a paid commercial tier. We name it because the option may exist, with all the same neutrality protections — no editorial influence on smallholder-facing surfaces, no asymmetric data access, no compromise of the core brand commitment.

Whatever happens at the commercial tier in the future, the smallholder tier is and remains free. No discussion.

---

## 6. What Success Looks Like

For the farmer, by the end of 2026:

- He uses น้องน้ำ daily. Not weekly, not occasionally. Daily. The bot is part of his day the way LINE is part of his day.
- He has caught at least one early-warning signal that meaningfully changed a cycle outcome.
- He has at least one Day-30 or Day-60 survival check-in that gave him useful context (his cycle compared to peers).
- He recommends the bot to one other farmer, unprompted, in a conversation we did not hear.
- When asked what AquaWise does for him, he describes it in his own words, and his words match the brand promise.

For AquaWise, by the end of 2026, drawn from the farmer side:

- 50 farmers actively using น้องน้ำ daily, mostly from P'Pong's Chachoengsao network plus opportunistic adds.
- 30+ complete cycle records (PL stocking → harvest) from these farmers.
- 1+ documented case where AquaWise data was used in a real dispute and resolved it in the farmer's favor.
- 1+ case where a farmer's recommendation brought in another farmer.

These numbers look small. They are. The first 50 farmers are the ones whose stories will be told for years. Every one of them is a brick in the foundation of the credit-history product that arrives in 2028. Quality matters more than count.

---

## 7. What We Will Never Build for the Farmer Side

These are commitments. Not "we are not building it now, maybe later." Genuine never.

- **No fees of any kind, at the smallholder tier.** No subscription, no premium feature, no in-app purchase, no transaction fee on harvest sales, no commission on feed orders. Zero, always.
- **No payment processing.** We do not handle the farmer's money. We do not connect to his bank account. We do not facilitate transactions. (Brokers and farmers will continue to settle directly the way they have always settled.)
- **No social feed, no farmer-to-farmer messaging, no comments, no likes.** AquaWise is not a social network for farmers. The community-belonging feeling we cultivate comes from *contextual cross-farm data shared anonymously*, not from a farmer-to-farmer chat layer that we would have to moderate, regulate, and inevitably distort.
- **No gamification.** No points. No badges. No streaks. No leaderboards. The farmer is not a user we are trying to retain through dopamine; he is an operator we are serving with information.
- **No farmer-to-farmer marketplace.** Selling shrimp goes through brokers; buying feed goes through feed companies; exchanging post-larvae goes through nurseries. AquaWise routes information; we do not route transactions.
- **No broker disintermediation.** We do not let farmers sell directly to factories. We do not put ourselves between the farmer and the broker. The broker's role in the chain is real, and we serve them on the broker side rather than competing with them on the farmer side.
- **No real-time monitoring.** We do not promise real-time anything. The cadences are daily (price feed, weather), weekly (cycle progression), event-based (Day-30, Day-60, harvest, disease). Anything faster is overpromising and we will not.
- **No farmer-targeted advertising.** No third-party ads. No feed-company-paid recommendations. No sponsored content in the LINE bot. The farmer's screen is theirs; we do not sell access to it.
- **No data sale to third parties about individual farmers.** Aggregated, anonymized, non-attributable industry data may be published or licensed (to BAAC, to the Department of Fisheries, to industry associations). Farmer-identified data never leaves the system except by the farmer's explicit consent in writing.
- **No prediction of the farmer's behavior to anyone other than the farmer himself.** No behavioral scoring sold to brokers ("which farmers are most likely to harvest in the next two weeks"). No risk scoring sold to feed companies ("which farmers are most likely to default on credit"). The farmer's pattern is the farmer's, period.

These rules together define what AquaWise is on the farmer side. They are at least as important as what we *do* build. The tech team should refuse any product idea that requires breaking one of them, regardless of how lucrative or technically interesting it is.

---

## 8. The Voice We Use With the Farmer

The brand voice from the master Brand Foundation document — *ลูกหลานที่เรียนมา*, the educated younger relative who came back to help — is most active here. The farmer is the relationship that defines the voice. Everything else (nursery, broker, feed) gets a slightly more professional version of the same voice; the farmer gets the full warmth and humility.

A few language commitments specific to the farmer side:

- **เรา not คุณ.** We are with him, not above him.
- **He gets credit for his craft.** The bot never says "you should" without first naming what he is doing right. *"Your feed conversion this cycle is 0.92, which is excellent. The peer median is 0.96. One thing to watch: the cooler weather this week may shift this in the next few days."* Compliment first, suggestion second, never a command.
- **The bot is not a teacher.** It does not explain things he already knows. It does not condescend. When in doubt, the bot under-explains rather than over-explains. He has been doing this for fifteen years; he does not need a primer.
- **Specificity always.** Real numbers, real days of cycle, real batch IDs, real DOF White List records. Vague advice ("watch your water quality") is worse than no advice. Specific advice ("pH variance in your pond seven this week is 0.6, which is at the upper edge of your typical range; the data does not yet show a problem but it is worth a check") earns trust.
- **Honesty about uncertainty.** When the bot does not know, it says so. "We do not have enough data on your pond seven yet to be confident — your cycle is at day 23 and our peer baseline becomes meaningful at day 30. Check back in a week."

When the bot fails the voice test — too clinical, too breathless, too commanding, too generic — the farmer notices and trust erodes. Voice consistency is brand equity in this relationship.

---

## 9. The Five Scenes We Are Building Toward

This is the closing section. It is the same set of scenes from the Brand Foundation's *Industry Letter*, but here they are written for the tech team — what we will look at and say *we built that.* When in doubt about whether a feature matters, ask: does it bring one of these scenes closer to real?

**Scene 1: Pre-dawn, pond seven.** P'Ek opens LINE at 5:17 AM. The bot already knows the day of cycle, the weather, the satellite reading on his intake source. He types in his own words: *pond seven feels wrong*. The reply comes in twenty seconds: *yes, three other farms in your zone reported similar conditions in the last week; the most common cause has been X; here is what experienced operators have done.* He puts the phone down. He is not alone.

**Scene 2: Day-30 check-in.** The bot pings him on day thirty: *how is the cycle? About what percent survival are you seeing?* He replies *85%*. The bot replies *that is above the peer median for similar conditions at this stage; your feed conversion is also strong; one thing to watch — pH variance in pond four has crept up over the last week.* He nods at his phone. Someone else is watching.

**Scene 3: Harvest day.** The broker pulls into the farm. The price he offers is 130 baht per kg for size 50. P'Ek opens the daily price feed: *Samut Sakhon yesterday: 138 for size 50; Mahachai market: 135–140; three-year trend for this week of year: 132–142.* He pushes back on the broker. They settle at 135. He has captured five baht per kilogram on a four-ton harvest he otherwise would have lost. Twenty thousand baht of value, on one harvest, made possible by free information.

**Scene 4: The defended dispute.** The broker calls him three days after harvest: the factory rejected part of the lot for size variance. He wants a partial refund. P'Ek opens the bot: *show me the size distribution at harvest weighing.* The data is there, with timestamps. He replies to the broker with the screenshot. The dispute ends without a fight, with the broker absorbing the rejection rather than splitting it. AquaWise was not the protagonist; the data was. P'Ek was the protagonist.

**Scene 5: The credit decision (2028+).** A BAAC officer pulls a report on R. Mitchai Farm. Three years of cycles. Yield consistency: top quartile. Water quality discipline: top quartile. Batch source reliability: high. Disputes: two, both resolved with verified data. The officer approves a 1.2 million baht working capital line at favorable terms — secured by the operational track record, not by additional land collateral. P'Ek can plan a year ahead. He can absorb a bad cycle without it being existential. The cycle that started at 5:17 AM on a pond that felt wrong has, three years later, become the basis of a credit relationship that changes the economics of his farm forever.

These scenes are not all real yet. Scene 1 is approaching reality with the current pilot. Scene 2 will be real by mid-2026. Scene 3 is real now, in primitive form. Scene 4 will be real in 2027. Scene 5 is 2028+. We are building toward them, in order. Every feature we ship should be testable against at least one of these scenes: *does this bring it closer or not?*

---

## 10. What This Means for the Tech Team

If you are building anything that touches the farmer side, your work is shaped by what is in this document.

You are building for one human at 5:17 AM with a phone in his hand and a pond he does not understand. You are building inside his existing day, not on top of it. You are building inside a one-minute-per-day friction budget. You are building a voice that recognizes his craft, not a system that replaces his judgment. You are building the foundation of a credit history that will not be useful for two more years, but that is being assembled with every cycle today.

The brand foundation tells you *who AquaWise is.* The stakeholder map tells you *who we serve.* The sequencing doc tells you *in what order.* This document tells you *what serving the farmer actually looks like, in his own life, in his own kitchen at 5:17 AM.*

Read it again next month. Things you missed the first time will become visible.

---

*End of farmer customer document.*
