# CRM-side integration with LINE bot Epic K (Batch-ID, ponds, cohort)

Status: planning brief — not a runnable story

This brief summarises the cross-product surface introduced by the LINE bot v1.1 Epic K (`aquawise-line-bot/docs/bmad/stories/K1..K13`). Stories K1–K13 live in the LINE bot repo. They require **CRM-side counterparts** captured below as new stories `K1`–`K4` (this folder) plus six modifications to existing stories.

---

## Why this matters for the CRM

The LINE bot v1.1 promotes individual shrimp farmers (พี่ปลา) to first-class entities and lets them **claim a hatchery's batch** via a 6-char Batch Code printed on the delivery receipt. Once claimed, the farmer's pond receives:

- The hatchery's PCR certificate (K.7)
- Cohort benchmarking against other farms feeding the same batch (K.10–K.11)
- Late-warning broadcasts the hatchery publishes about the batch (K.12)
- A re-purchase prompt at pond closure when results are good (K.13)

The CRM is the **source of truth** for batch metadata. The LINE bot reads + claims against the CRM via a signed-JWT REST contract (ADR-018, line-bot side). The CRM also **publishes** outbound events to the LINE bot when a hatchery flags a batch warning.

> **Identity boundary — critical.** "Customers" in the CRM are *nursery operators* (`โรงอนุบาล`) — B2B accounts the hatchery sells PL to. The LINE bot adds a *second* downstream identity: individual *farmers* (พี่ปลา) who receive PL from a nursery (or, future, direct from hatchery) and run a single pond at a time. Farmers are NOT in `customers`. The CRM records them only as `batch_claims` rows keyed by `line_user_id` — no other PII, no commercial relationship.

---

## Contract summary (CRM owes the LINE bot)

| Surface | Direction | Story (CRM) | Story (LINE bot) |
|---|---|---|---|
| `batch_code` minted on every batch (`B-XXXXXX`, 6-char, unguessable, TTL-bounded) | CRM → LINE bot | **K1**, modifies **C1** | K.1 (consumer) |
| `GET /api/v1/batches/:code` | LINE bot → CRM | **K2** | K.1, K.7 |
| `POST /api/v1/batches/:code/claim` | LINE bot → CRM | **K3** | K.1 |
| `POST /api/v1/auth/token` (token refresh) | LINE bot → CRM | **K2** (auth section) | K.1 |
| `POST {LINE_BOT_BASE_URL}/api/crm-events/batch-warning` | CRM → LINE bot | **K4** | K.12 |
| Hatchery contact (LINE OA id or phone) returned in batch payload | CRM → LINE bot | modifies **A3** | K.13 |
| PCR certificate URL signed for farmer access | CRM → LINE bot | modifies **C4** | K.7 |
| Farm-claims panel on Batch Detail page (CRM operator view) | CRM-internal | modifies **C3** | — |
| Identity-boundary clarification (nursery LINE bind ≠ farmer claim) | CRM-internal | modifies **G1** | K.1 |
| Critical disease alert auto-publishes batch warning | CRM → LINE bot | modifies **E4** | K.12 |

---

## Cross-references

- LINE bot ADR-017 (ponds + batches schema) — `aquawise-line-bot/docs/bmad/architecture.md`
- LINE bot ADR-018 (CRM ↔ LINE bot API contract) — same file
- LINE bot FR-11, FR-12, FR-14 — `aquawise-line-bot/docs/bmad/prd.md`
- LINE bot UAT — `aquawise-line-bot/docs/bmad/uat/K-batch-cohort.uat.md`

---

## Sequencing inside the CRM repo

**Phase 1.1 (with K.1, K.2, K.5):**
1. **K1** schema migration (`013_batch_code_and_claims.sql`) — adds `batches.batch_code`, `batches.valid_until`, `batches.published_at`, `batches.line_oa_id` snapshot, `batch_claims` table, `crm_event_log` table
2. **K2** read API
3. **K3** claim API
4. **C1** mod (mint `batch_code` on register; surface in success toast and on receipt printing)
5. **A3** mod (collect `line_oa_id` and `contact_phone_public` from owner)
6. **G1** mod (rename CTA copy + Dev Notes to make nursery-vs-farmer boundary explicit)

**Phase 1.2 (with K.7, K.8, K.10, K.11):**
7. **C4** mod (PCR cert URL hardening + payload contract)
8. **C3** mod (Farm Claims panel; cohort metrics snapshot consumer — read-only, optional)

**Phase 1.3 (with K.12, K.13):**
9. **K4** webhook publisher
10. **E4** mod (auto-publish batch warning when disease alert is critical)

> Defer cohort-metrics inbound mirror (a hypothetical CRM-side cache of `cohort_metrics_view`) until the LINE bot side has shipped K.10 and a real demand to view aggregate per-batch farm-level outcomes is voiced by a hatchery operator. This is a 2027 question, not 2026.

---

## Out of scope

- Two-way chat between hatchery operator and an individual farmer (this would be Epic G3, already deferred to Phase H3)
- Hatchery dashboard view of all claimed-farm data (`H-LINEAGE` — 2027+ hypothesis)
- Direct farmer billing or invoicing through the CRM
- Storing farmer PII (name, phone) beyond what the LINE bot voluntarily shares in `line_profile` JSON at claim time (LINE display name + avatar URL only)
