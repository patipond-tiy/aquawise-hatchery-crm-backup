# DSR-SPEC — Data Subject Request Contract (PDPA)

> **MIRROR.** Source of truth is `aquawise-ecosystem/aquawise-docs/DSR-SPEC.md` (CEO/founder-owned, same as `00`–`06`).
> Do **not** edit this copy. Edit the umbrella source and re-mirror (same mechanism as the customer docs `00`–`06` in this folder).
> Mirrored: 2026-05-15. If this header's date lags the source, the mirror is stale — re-sync before relying on it.

**Author:** Chain (CEO) — interim DPO · **Status:** v1, 2026-05-15
**Audience:** any engineer or BMAD agent implementing a Data Subject Request endpoint in `hatchery-crm` or `line-bot`.
**Reads alongside:** `security.md` §12 (PDPA), `code-design.md` §19 (decisions: PDPA cross-repo + DPO).

---

## 1. Why this exists

Thailand's Personal Data Protection Act (PDPA, in force since June 2022) gives a data subject the right to **access** their personal data (§30) and request its **erasure** (§33). Response is owed within **30 days**. The AquaWise system spans two products that each hold a slice of one person's data, so a single DSR may fan out to both. This spec is the contract both repos implement so a data subject gets one coherent answer regardless of which product holds what.

This is a **shared contract**, not an implementation. Each repo implements its own endpoint conforming to the request/response shapes and rules below. Drift between the two implementations is a compliance bug.

---

## 2. The identity boundary (read this first)

The two products hold different *kinds* of person, and the distinction is load-bearing:

| Identity | Lives in | PII held | DSR owner |
|---|---|---|---|
| **Nursery operator / hatchery customer** (B2B account) | `hatchery-crm` | email, name, business address, phone | hatchery-crm endpoint |
| **Customer-of-the-hatchery (a farm)** — `customers` rows | `hatchery-crm` | name, phone, address, `line_id` | hatchery-crm endpoint |
| **Individual farmer (พี่ปลา)** — `batch_claims` rows | `hatchery-crm` (claim record only) + `line-bot` (full LINE identity) | `line_user_id`, LINE display name + avatar, pond data | **split** — each repo erases its own slice |

A farmer is **not** a `customers` row and has **no commercial relationship** in the CRM — the CRM holds only `batch_claims` keyed by `line_user_id` plus the `line_profile` snapshot. The bulk of a farmer's PII lives in `line-bot`. A farmer DSR therefore fans out to both repos; a nursery-operator DSR is hatchery-crm only.

---

## 3. Endpoints (both repos implement)

### 3.1 Export — `GET /api/dsr/export`

- **Auth:** the calling user's own session (`getUser()`, never `getSession()`). A user may only export their own data. No admin-initiated export through this endpoint.
- **Response 200:** `application/json`, a structured document of every personal-data field the repo holds for this subject, plus provenance (which table each datum came from). Shape:

```jsonc
{
  "subject": { "auth_uid": "…", "line_user_id": "…" | null },
  "generated_at": "<iso8601>",
  "source_repo": "hatchery-crm" | "line-bot",
  "records": [
    { "table": "customers", "fields": { "name": "…", "phone": "…", "address": "…" } },
    { "table": "batch_claims", "fields": { "line_user_id": "…", "line_profile": { … } } }
    // … one entry per table holding the subject's PII
  ],
  "retained_for_legal_reason": [
    { "table": "invoices", "reason": "Thai Revenue Dept — 7-year financial record retention", "fields_redacted_on_erasure": ["customer_name"] }
  ]
}
```

- **404** if the authenticated subject has no personal data in this repo (a valid answer — e.g. a nursery operator hitting line-bot).

### 3.2 Erasure — `POST /api/dsr/delete`

- **Auth:** same as export. Self-service only.
- **Behaviour:** **anonymize, do not hard-delete.** Hard deletion breaks referential integrity and the audit trail; anonymization satisfies §33 while preserving non-personal analytics and legally-retained financial rows.
- **Response 200:** `{ ok: true, anonymized_at: "<iso>", tables_affected: [...], tables_retained_for_legal_reason: [...] }`
- **Side effects:** the subject's session is invalidated (they cannot hold a live session post-erasure).

---

## 4. Anonymization rules (per data class)

| Data class | Action on erasure |
|---|---|
| Direct identifiers — name, phone, email, address, Thai national ID | Replace with `redacted_<short-hash>` (name) or `NULL` (phone/email/address/NIC) |
| `line_user_id` | NULL the column **and** delete the `line_profile` JSON (display name + avatar) |
| `audit_log.actor` / `actor_user_id` | **Retained** (legal/forensic requirement) — but any UI or export that *displays* it renders `redacted`. The raw row is not mutated; immutability of `audit_log` (see `code-design.md` §8) is preserved. |
| Free-text the subject authored (notes, callback comments) | NULL or `redacted` — author-attributable free text is personal data |
| Aggregated / denormalized metrics (e.g. `batch_buyers.d30`, cohort survival) | **Kept** — not personal data once de-identified; required for the trust-system value (see nursery doc §2 Scene 1) |
| **Financial records** — invoices, `subscription_events`, payment refs | **Kept intact.** Thai Revenue Department mandates 7-year retention of financial records. The linked customer name is anonymized to `redacted_<id>`; the financial row itself is untouched. This is a lawful basis that overrides erasure for these specific rows. |

The financial-preservation carve-out is the single most important rule here. Erasure that destroyed an invoice would violate tax law; erasure that left the customer's name on it would violate PDPA. The resolution is: **keep the financial row, redact the personal field on it.**

---

## 5. Audit & rate limiting (both repos)

- Every DSR (export or delete) writes one `audit_log` row. Use the **real** `audit_log` columns (`action`, `payload`, `hatchery_id` where applicable, `user_id`): `action = 'dsr.export' | 'dsr.delete'`, `payload = { subject_auth_uid, source_repo, tables_affected }`. (Note: there is no `event`/`actor`/`subject_id` column — see the executability audit; embed actor in `payload`.)
- Rate-limit: **5 requests per subject per 24h** (export + delete combined). Prevents abuse / accidental mass-trigger.
- The audit row for a DSR is itself retained (it records that a lawful erasure happened — required for accountability) and is exempt from the erasure it documents.

---

## 6. Per-repo responsibilities

| Repo | Tables it must cover on export + erasure |
|---|---|
| **hatchery-crm** | `customers` (name/phone/address/line_id), `hatchery_members` (operator identity), `team_invites`, `batch_claims` (line_user_id + line_profile snapshot), authored free-text (callbacks, notes), `audit_log` actor display. Retain: invoices, `subscription_events`. |
| **line-bot** | full LINE identity (`line_user_id`, display name, avatar), pond data, message history, any farmer-authored content. Retain: nothing financial (line-bot holds no invoices). |

Story `S7` is the hatchery-crm implementation. The line-bot implementation is tracked in the line-bot repo's own story set (TBD — flag to the line-bot PO).

---

## 7. DPO & process (not engineering, but binding)

- **DPO (interim):** Chain (CEO). Named in the public privacy notice. PDPC online course completed before launch (decision: `code-design.md` §19 "DPO — Founder/CEO interim").
- **SLA:** 30 days from request to fulfilled response (PDPA §30). The self-service endpoints make the technical part instant; the 30 days is the legal ceiling for any manual escalation.
- **Consent banner + privacy notice** ship with launch (covered in `security.md` §12 — separate from this endpoint spec).

---

## 8. Verification (both repos)

- Export returns every PII field the repo holds for a test subject; nothing is silently omitted.
- Erasure: post-call, the subject's name/phone/line_user_id are unreadable in every read path, **and** their invoice rows still exist with the customer name showing `redacted_<id>`.
- A pgTAP / integration test asserts: after erasure, no cross-tenant or same-tenant query can recover the subject's direct identifiers, while `invoices.count` for that subject is unchanged.
- Cross-repo: a farmer DSR is run against both endpoints; the two JSON exports together account for all of the farmer's data with no overlap gaps.

---

*End of DSR contract. Implementations conform to this; they do not extend or reinterpret it. Divergence is a compliance bug, not a local decision.*
