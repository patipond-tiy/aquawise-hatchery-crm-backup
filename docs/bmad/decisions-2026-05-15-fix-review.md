# FIX-REVIEW Decisions — 2026-05-15

> PO decisions on the 3 FIX-REVIEW items extracted in `stories/02.to-fix.md` (C2, D2, D3).
> Drives the FIX-AUTO batch pass (`stories/03.fix-auto-ultrawork-command.md`) and the cascading PRD / migration / story edits noted under each item.
> PO: Patipond. Interview captured by Claude Code session, 2026-05-15.

---

## Summary of decisions

| # | Story | Decision | Cascade |
|---|---|---|---|
| 1 | C2 | Defer auditor SECURITY INVOKER view (mig 013) to H3 | Strip AC#5 + auditor-only Dev Notes from C2; remove mig 013 from H1 migration set |
| 2 | D2 | **Promote G3 → H1** — quote Flex CTA opens full two-way LIFF chat | Large scope bump — see §D2 below for full cascade |
| 3 | D3 (a) | Broadcast is **owner-only** | Tighten mig 006 RLS on `line_outbound_events` INSERT to owner only |
| 4 | D3 (b) | Add dedicated **`broadcast:write`** action in `lib/rbac.ts` | Update action matrix in `architecture.md` §4 + D3 Dev Notes |

---

## C2 — Browse and review batches

**Decision:** Defer to H3.

**Why:** Auditor persona (P5) is already documented as Phase H3 in `01-personas.md`. Building an `auditor`-only DB view in H1 with no H1 consumer is infra leaking forward (PRD rule#7 "slow is right"). No confirmed H1 hatchery is asking for auditor-scoped batch browsing.

**Cascade edits:**
- `stories/C2.browse-and-review-batches.md`
  - Remove AC#5 (auditor SECURITY INVOKER view requirement)
  - Restore persona to Manager (P2) — already done in 2026-05-04 review
  - Add explicit "auditor surface deferred to H3" note in Dev Notes
- `supabase/migrations/`
  - Do **not** create migration 013 in this cycle. Park the view DDL in a `docs/migrations-deferred/` note for H3 pickup.
- No PRD edit needed — PRD §3 already lists P5 as "*planned Phase H3*".

---

## D2 — Send a quote in one-tap

**Decision:** **Promote G3 → H1.** The quote Flex "ตอบรับ" CTA opens a **full two-way LIFF chat** between the nursery (hatchery's customer) and the hatchery operator, hosted inside our webapp. All hatchery↔nursery communication should be mediated by our system so we keep both sides on AquaWise rather than losing them to native LINE chat.

**Rationale (PO):** Brand-owned chat is the strategic moat — if conversations happen in LINE OA, AquaWise becomes a thin notifier and loses the relationship surface. Promoting G3 trades H1 timeline for product defensibility.

### ⚠ Scope impact — read before ratifying

This decision reverses the explicit H3 deferral baked into:
- `prd.md` §6 row G: *"H1 (send-only); H3 (two-way LIFF)"*
- `prd.md` §8 out-of-scope: *"G3 — Two-way LIFF inbox (full two-way chat) | Deferred to Phase H3"*
- `docs/product-spec/00-overview.md` (cited by audit)
- `stories/_hypotheses/G3.two-way-chat-liff-inbox.md` currently marked as 2027+ hypothesis

**Cascade edits required:**
- `prd.md`
  - §6 row G: change to "H1 (two-way LIFF)"
  - §8 out-of-scope table: remove the G3 row (or replace with "G3 two-way LIFF — promoted to H1, see decisions-2026-05-15")
  - §5 feature inventory: G3-LIFF-CHAT row — change "Phase H3" → "Phase H1", status "❌ Deferred" → "❌ Not implemented"
- `architecture.md` — likely no rule change, but §5 RLS tables needs a new entry:
  - `line_messages` (planned) — message store with `hatchery_id`, `customer_id`, `direction (in|out)`, `body`, `flex_payload`, `delivered_at`, `read_at`
  - Decide: realtime via Supabase Realtime subscription vs. polling?
- `stories/_hypotheses/G3.two-way-chat-liff-inbox.md` → move to `stories/G3.two-way-chat-liff-inbox.md` and rewrite as ready-for-dev
- `stories/D2.send-a-quote-in-one-tap.md`
  - AC#4: replace with "ตอบรับ button opens the AquaWise LIFF chat thread between the nursery and the hatchery"
  - Remove ⚠ deferral note
- `stories/G2.send-one-off-line-message.md` — re-scope: it currently assumes send-only; will likely fold into G3
- `stories/G3p.send-only-flex-messaging-worker-queue.md` — keep as the infra story for the outbound side of G3, OR retire if G3 supersedes it. Recommend keep + retitle to "Outbound queue + worker (Flex render side of G3)".
- New stories needed (PO to confirm scope before authoring):
  - **G3a** — LIFF chat inbox surface (nursery-side LIFF page rendering message thread, composer, scroll)
  - **G3b** — Operator inbox in CRM dashboard (hatchery-side: list of open threads, unread badges, reply composer)
  - **G3c** — Inbound LINE webhook to ingest nursery replies into `line_messages`
  - **G3d** — Realtime/polling sync between operator inbox and LIFF
  - **G3e** — Notifications (operator gets a CRM-side ping when a nursery replies; respect quiet hours per H4)
- UAT additions:
  - `uat/G-line-messaging.uat.md` — extend with two-way chat scenarios (nursery sends, operator replies, both sides see thread, quiet hours enforced)

**Effort estimate (rough, PO to ratify):** 2–3 sprint-weeks of additional H1 work on top of existing G1/G2/G3p draft scope. Cross-cutting with H4 (quiet hours) and X1 (dead-letter).

**Risk flags:**
- Doubles the "G epic" surface area — may push H1 ship date.
- LINE webhook signature verification + nursery identity binding becomes P0 (cross-tenant risk if a nursery's LIFF lands them in the wrong hatchery's thread).
- The 2027 P'Bunjong validation premise was "build H1 fast on confirmed scaffold". Promoting G3 widens scaffold scope — re-affirm with CEO that the strategic moat argument outweighs the speed-to-first-tenant goal.

**PO action before fix pass runs:**
- [ ] Confirm with CEO that G3 promotion is approved (mention §8 PRD override).
- [ ] Confirm we want G3a–G3e as discrete stories vs. one bundled G3.
- [ ] If estimate of +2–3 weeks is unacceptable, reconsider as G3p interim (send-only LIFF + LINE OA handoff button) and re-park G3 for H2.

---

## D3 — Broadcast to a restock cohort

### D3 (a) — Who can broadcast?

**Decision:** **Owner-only.**

**Why:** Broadcast is a deliberate brand-voice signal that fans out to every "restock-this-week" farm. The operational/brand cost of an off-tone fan-out from `counter_staff` is higher than the convenience gain. Aligns with D3 Dev Notes intent.

**Cascade edits:**
- `supabase/migrations/006_*.sql` — tighten `line_outbound_events` INSERT RLS policy from `(owner, counter_staff)` → `(owner)` for rows where `event_type = 'broadcast'`. Confirm migration is forward-compatible (no rollback of already-inserted rows needed — broadcast rows by counter_staff have not been produced in prod yet).
- `architecture.md` §5 RLS table — update `line_outbound_events` row's Insert column to reflect the new scoping.
- `stories/D3.broadcast-to-a-restock-cohort.md` Dev Notes — confirm `can(role, 'broadcast:write')` is checked server-side before enqueueing.

### D3 (b) — Which RBAC action?

**Decision:** **Add a new `broadcast:write`** action.

**Why:** Clearer audit trail. `settings:write` semantically means changing hatchery config; broadcasting is an outbound comms action and shouldn't be coupled to settings permissions. The cost is one enum entry + matrix update.

**Cascade edits:**
- `lib/rbac.ts` — add `'broadcast:write'` to action union; update the action matrix with: `owner = Y`, `counter_staff = —`, `lab_tech = —`, `auditor = —`.
- `architecture.md` §4 RBAC matrix — add the new row.
- `stories/D3.broadcast-to-a-restock-cohort.md` Dev Notes — change `can(role, 'settings:write')` references to `can(role, 'broadcast:write')`.
- Any future broadcast features (E4 critical-alert fan-out?) should reuse `broadcast:write` rather than introducing more action variants.

---

## After ratification — fix pass plan

Once the §D2 G3-promotion question is settled with CEO:

1. **Apply the C2 + D3 cascades** above (low-risk, no PRD §6/§8 surgery needed).
2. **Run the FIX-AUTO batch** per `stories/03.fix-auto-ultrawork-command.md` — 20 mechanical items, several touch C2/D2/D3 so this consolidates the edits.
3. **D2 / G3 cascade** runs separately as its own mini-epic (PRD edits + story moves + new G3a–G3e stories) — this is *not* a fix-auto batch item, it's a deliberate scope expansion that needs its own sprint planning pass.
4. **Update `stories/01.qa-user-story-audit.md`** to reflect the new decisions (the 3 FIX-REVIEW rows become KEEP after these edits).
5. **Add a K-batch-integration UAT file** (`uat/K-batch-integration.uat.md`) — gap identified during this review; not part of the FIX-REVIEW set but blocking before K1–K4 land in code.

---

## Open questions surfaced during this interview

- **PRD §4 reconciliation debt:** J1–J5 (scaffold jobs) vs. H-J1–H-J5 (2027 hatchery hypothesis jobs). Not blocking this fix pass, but must be resolved before 2027 sprint planning.
- **K-epic UAT:** Missing. Owed before K1–K4 ship. PO to author or delegate.
- **G3 promotion:** Pending CEO ratification (see §D2 above).

---

## Sign-off

- [x] PO (Patipond) — reviewed and ratified all 4 decisions (2026-05-15 interview session)
- [x] CEO (Chain) — ratified 2026-05-15: **G3 stays deferred to H3.** The §D2 promotion was NOT approved. Rationale: promoting two-way LIFF chat to H1 contradicts the nursery customer doc Chain authored — §7 ("No automated customer outreach. P'Pong sends his own messages; we tell him who to send them to") and §10 ("You are not building a CRM. You are building a trust artifact factory"). All 5 nursery jobs in §3 are satisfied by send-only; the moat is Scene 1 (the defended dispute = batch register + PCR + cross-farm D30), not a chat surface. The original `prd.md` §6 "H1 send-only / H3 two-way" sequencing stands unchanged — no PRD edit needed.
- [ ] Architect — N/A. The `line_messages` schema + realtime-vs-polling question is moot for H1 because G3 is not promoted. Re-open only if/when G3 is reconsidered for a future phase.

**Final disposition:** C2 (defer auditor view to H3), D3a (broadcast owner-only), D3b (new `broadcast:write` action) — applied in PR #4 (`5c2885e`). D2 (G3 deferred, send-only) — applied in this commit. Audit `01.qa-user-story-audit.md` is now fully resolved: 6 KEEP + 20 DONE-AUTO + 3 DONE-REVIEW, zero open items.

Once the checkboxes above are signed, this doc is the source of truth for the fix pass. Story files and PRD/architecture edits should reference this file in their changelog entries.
