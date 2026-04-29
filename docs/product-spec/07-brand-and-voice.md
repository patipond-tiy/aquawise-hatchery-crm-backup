# 07 — Brand and Voice (engineering digest)

This file is a **digest** of `docs/business-guide/aquawise-hatchery-cbbe (1).md`
for the people writing code, copy, Flex JSON, and certificate text. The
CBBE doc is the source of truth — read it for the full positioning, the
5-year journey, the brand metrics, and the strategic rationale. This file
exists so an engineer making a UI string decision has the relevant excerpts
in one place.

---

## Tagline & promise

> **Tagline:** The closed-loop trust system for Thai shrimp aquaculture.
>
> **Promise to the hatchery owner:** *You will know what happened to your
> PL after the sale. You will be defended when blamed unfairly. Your craft
> will be recognized.*

When you write any user-facing copy — Flex header, certificate sub-line,
public scorecard headline, onboarding hero — start by asking: *does this
make the owner feel known, defended, recognized?* If not, rewrite.

---

## The five brand pillars

| # | Pillar | What it means in code |
|---|---|---|
| 1 | **Truth over comfort** | Every number on screen must be externally verifiable. Don't synthesize trend lines. Don't show a "5/8" stat that isn't computed. No fabricated demo data in production. |
| 2 | **Farmers free, always** | Farmer-facing surfaces (LIFF, public scorecard, LINE Flex) never paywall. No upsells in farmer copy. |
| 3 | **Neutrality is the moat** | No partner logos on hatchery surfaces. No "powered by [feed company]" sponsor footers. AquaWise stamps are AquaWise's own. |
| 4 | **Slow is right** | Don't over-feature. P3 lines stay P3. Reject "let's also add…" in PRs that don't have a hatchery customer asking for it. |
| 5 | **The hatchery owner is the protagonist** | AquaWise is the supporting character. UI says "your D30," "your batch," "your customers" — never "AquaWise's analytics." Branding on outputs (cert, scorecard) leads with hatchery name + logo; "Verified by AquaWise" is the *stamp*, not the headline. |

---

## Voice: ลูกหลานที่เรียนมา

The educated younger relative who came back to help. Capable but humble.
Knows things, listens first. **Not** a Bangkok consultant. **Not** a
foreign expert. **Not** a slick salesperson.

| Trait | Means | Rules out |
|---|---|---|
| Educated, humble | Plain words. No jargon walls. | "Innovative AI-powered" / "revolutionary" |
| Calm under pressure | Steadier than the user when something breaks. | Breathless urgency. Crisis-mode CTAs. |
| Direct, not flashy | "I don't know yet, I'll find out by 6pm." | Hedged corporate-speak. Marketing fluff. |
| Patient with people, impatient with noise | Long calls with owners; short patience for hype. | "Always-on" / "low-touch SaaS" framing. |

### Style anti-commitments

- **No motion graphics, no splash screens, no hero animations.**
- **No glassmorphism, no neumorphism, no "fashionable" styles.**
- **No emoji-heavy professional surfaces.** A 💬 on a customer card is
  fine; emojis in a PCR certificate are not.
- **No AI iconography.** No glowing brains, no neural-network
  decorations, no "AI" badges.
- **No breathless verbs in CTAs.** "Send LINE" — not "Blast LINE!"
  "Register batch" — not "Launch batch!"

---

## Differentiation (anti-eFishery posture)

The CBBE doc positions explicitly against the moving-fast-and-breaking-trust
unicorn template. We do not name eFishery in product surfaces, but the
engineering decisions reflect the contrast:

| eFishery posture | AquaWise posture |
|---|---|
| Fast, breathless | Slow, steady |
| Crisis-driven CTAs | Calm, declarative copy |
| Jargon-heavy ("AI-powered…") | Plain Thai/English |
| Overpromising | Defensible — every claim backed by data |
| Venture-capital speed | "One province, one association, one careful step" |

When you write copy, ask: *would this fit on an eFishery slide?* If yes,
rewrite.

---

## Where this voice applies

| Surface | Voice strictness | Why |
|---|---|---|
| Public scorecard `/{locale}/h/{slug}` | **Highest** | First impression to farmers; the "verified" promise lives here |
| PCR certificate PDF | **Highest** | Authoritative document. Owner shows this around the association. No emojis. No marketing copy. |
| LINE Flex templates (quote, cert, alert) | **High** | Co-branded; farmer thinks the *hatchery* is talking. Use the hatchery's own name in copy ("ฟ้าใส แฮทเชอรี่ ขอแจ้ง…"), not AquaWise's. |
| CRM hero / onboarding strings | **High** | Owner sees these daily. Calm, declarative. |
| CRM body strings (button labels, table headers) | Medium | Stay direct and brief. |
| Toasts / error messages | Medium | "ส่งล็อต B-2604-A แล้ว" — not "Success!! 🎉" |
| Internal logs / dev console | None | Be technical. |

---

## Visual & type system (excerpt)

Full system in CBBE doc; engineering-relevant pieces:

- **Brand colors.** Logo Blue `#004AAD`, Dark Cyan `#008B8B`. Used
  *sparingly* — protagonist colors. Co-brand backgrounds in Flex use
  hatchery's own brand color from `hatchery_brand.color`, not AquaWise blue.
- **Two-tier type system:**
  - **Product surfaces** (CRM, dashboards, LIFF data screens): Inter +
    Noto Sans Thai + JetBrains Mono.
  - **Brand surfaces** (PCR certificate, public scorecard, QR poster,
    pitch decks): Plus Jakarta Sans + Inter + Noto Sans Thai.
- **Aesthetic.** Clean, calm, careful. Confident and unhurried. Whitespace
  is a feature, not a bug.

---

## The five hatchery owner needs (messaging map)

For copywriters and template designers — when you build a Flex template
or notification copy, identify which need it serves:

| Need they feel | Their phrase | What we want them to think |
|---|---|---|
| Customer slipping away | "ลูกค้าไม่กลับมา" | "Check AquaWise — when does he restock?" |
| Unfair blame | "เกษตรกรว่า PL ไม่ดี" | "What does AquaWise say about that batch?" |
| Quality verification | "พิสูจน์ว่าโรงเพาะเราดี" | "AquaWise scorecard." |
| Modern operating | "อยากเป็นโรงเพาะที่จริงจัง" | "Get into the AquaWise system." |
| Customer acquisition | "อยากได้ลูกค้าใหม่" | "Put up the AquaWise QR." |

---

## Heritage to invoke (sparingly)

The brand origin from the CBBE doc — **do not paste this verbatim into
product UI**, but it informs the founder-facing pages, About page, sales
deck, and any copy that needs credibility weight:

> AquaWise began in 2025 when Chain (Chulalongkorn computer engineering)
> built VannameiVision and realized the harder problem was trust, not
> technology. He partnered with **Dr. Chanati Jantrachotechatchawan**
> (Harvard molecular biology, King's College PhD, IBO 2006 gold medalist)
> and **Dr. Kobchai Duangrattanalert** (Manchester PhD computational
> genetics) to close the loop between hatchery and farm. The first
> hatchery to come on board was **P'Pong's**, the President of the Thai
> Shrimp Larvae Hatchery Association in Chachoengsao.

Use this on About, in the marketing site, and in pitch contexts. Do not
sprinkle credentials into product UI — that violates "the hatchery owner
is the protagonist."

---

## Practical checklist before shipping any user-facing string

1. Could the same sentence fit on an eFishery slide? **Rewrite.**
2. Does it use ✨ / 🎉 / 🚀 in a professional context? **Remove.**
3. Does it center AquaWise instead of the hatchery? **Reorder.**
4. Does it claim something we can't verify? **Remove or qualify.**
5. Is it longer than it needs to be? **Cut.**
6. Is the Thai version a literal translation that sounds awkward? **Rewrite
   from intent, not from English.**

---

## Source of truth

For full brand position, customer journey, brand health KPIs, growth
channels (association meetings > digital ads), and the EOY-2026 metrics
table, read **`docs/business-guide/aquawise-hatchery-cbbe (1).md`**.
This file is the engineering digest only.
