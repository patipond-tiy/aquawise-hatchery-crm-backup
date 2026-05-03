> Refreshed 2026-05-02. Stale `business-guide/` links rewritten to `aquawise-updated-docs/`.

# Product Spec — AquaWise Hatchery CRM

This folder is the bridge between the **prototype** (what's clickable today)
and the **production app** (what should actually work). Every doc here was
written from a complete walk-through of the current code: every page, every
button, every modal, every mock API call.

Read in this order:

| # | File | Purpose |
|---|------|---------|
| 00 | [`00-overview.md`](./00-overview.md) | **Start here.** Jobs-to-be-done (J1–J5), tagline & promise, who it serves, two-sided market, NFR commitments |
| 01 | [`01-personas.md`](./01-personas.md) | The buyer archetype + 5 operational personas + farmer counterpart |
| 02 | [`02-feature-inventory.md`](./02-feature-inventory.md) | Every UI control today: wired ✅ / toast-only 🟡 / dead stub ❌, with FR-IDs |
| 03 | [`03-user-stories.md`](./03-user-stories.md) | User stories with acceptance criteria, FR-tagged, grouped by epic |
| 04 | [`04-flows.md`](./04-flows.md) | End-to-end sequence diagrams for the critical journeys |
| 05 | [`05-line-integration.md`](./05-line-integration.md) | How the CRM talks to farms through the AquaWise LINE bot |
| 06 | [`06-production-gap.md`](./06-production-gap.md) | Concrete punch-list to go from prototype → production |
| 07 | [`07-brand-and-voice.md`](./07-brand-and-voice.md) | Engineering digest of the CBBE brand doc — voice, anti-commitments, where to apply |
| 08 | [`08-roles-and-rls.md`](./08-roles-and-rls.md) | Auth model, persona↔role mapping, RLS strategy |

## Relationship to `docs/aquawise-updated-docs/`

The business team owns the **intent** layer:

- [`../aquawise-updated-docs/00-aquawise-brand-foundation.md`](../aquawise-updated-docs/00-aquawise-brand-foundation.md) — Brand foundation: positioning, brand pillars, voice, 5-year customer journey, EOY-2026 KPIs
- [`../aquawise-updated-docs/06-aquawise-hatchery-customer-doc.md`](../aquawise-updated-docs/06-aquawise-hatchery-customer-doc.md) — Hatchery customer document v0.5: jobs-to-be-done, scenes, pricing hypotheses, what we will never build

This `product-spec/` folder is the **execution** layer — it reconciles
that intent with the prototype's actual state and produces a punch-list.
Where the two layers disagree, the updated-docs intent wins; this
folder explains how to get there.

## Companion docs (already in `docs/`)

- [`PLAN.md`](../PLAN.md) — 5-phase delivery plan (scaffold → port → backend → wire → polish)
- [`CHECKLIST.md`](../CHECKLIST.md) — granular task list backing PLAN.md
- [`line-integration-strategy.md`](../line-integration-strategy.md) — full architectural strategy for hatchery↔farm LINE messaging (the source-of-truth that `05-line-integration.md` summarizes and operationalizes)
- [`STRIPE.md`](../STRIPE.md) — billing & subscription wiring

## How to use this spec

- **Building a feature?** Find the user story in `03`, the flow in `04`, the
  current state in `02`, and the missing pieces in `06`.
- **Estimating production work?** `06-production-gap.md` is the punch-list.
- **Onboarding a new engineer?** Start at `00`, then `02` to see what's real.
- **Talking to a hatchery customer?** `01-personas.md` and `03-user-stories.md`
  are written in their language.
