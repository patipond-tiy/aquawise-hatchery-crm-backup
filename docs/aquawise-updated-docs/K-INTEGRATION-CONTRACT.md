# K-INTEGRATION-CONTRACT — hatchery-crm ↔ line-bot (Epic K)

> **MIRROR.** Source of truth is `aquawise-ecosystem/aquawise-docs/K-INTEGRATION-CONTRACT.md` (umbrella, CEO/founder-owned — same pattern as `DSR-SPEC.md` and `00`–`06`).
> Do **not** edit this copy. Edit the umbrella source and re-mirror. Mirrored: 2026-05-15.
> **Authority:** This contract is binding on **both** repos. Where it disagrees with line-bot `architecture.md` ADR-018 (e.g. ADR-018's "both services trust the same key"), **this document wins** — ADR-018 must be reconciled to it. Where it disagrees with a `bmad/stories/K*.md`, the story is wrong and must be fixed (the stories were authored to this contract).

**Status:** v1, 2026-05-15. **Audience:** any engineer or BMAD agent implementing Epic K in `hatchery-crm` (stories K1–K6) or `line-bot` (stories K1–K13). **Reads alongside:** `DSR-SPEC.md` (PDPA), hatchery-crm `bmad/stories/_integration-with-line-bot-Epic-K.md` (the cross-product brief).

---

## 1. Why this exists

Epic K spans two products: the CRM is the **source of truth** for batch metadata; the LINE bot **reads** and **claims** against it, and the CRM **publishes** late-warning events back. The two sides were specced in separate repos and drifted (JWT key model, the `batch_code` alphabet, a "list-active-codes" endpoint the bot needs but the CRM never specced, a `species` column the bot wants). This document pins the wire contract so both sides conform to one spec. Divergence is a compliance bug, not a local decision.

## 2. Identity & trust boundary

- **CRM `customers`** = nursery operators / farms (B2B). **Not** the LINE-bot farmer.
- **LINE-bot farmer (พี่ปลา)** = identified only by `line_user_id`; in the CRM exists solely as a `batch_claims` row + a `line_profile` snapshot (display name + avatar). No other farmer PII crosses to the CRM. (Erasure of this slice: `DSR-SPEC.md` §6.)

## 3. JWT model (supersedes ADR-018 "same key")

Three token flows, **two distinct audiences** — never interchangeable (confused-deputy prevention):

| Flow | iss | aud | Signed with (private) | Verified with (public) | TTL |
|---|---|---|---|---|---|
| **Read/claim** (bot → CRM): `GET /batches/:code`, `POST /batches/:code/claim` | `line-bot` | `hatchery-crm` | line-bot holds `CRM_JWT_PRIVATE_KEY` (issued via token-refresh below) | CRM `CRM_JWT_PUBLIC_KEY` | ≤ 15 min |
| **Token refresh** (bot boot): `POST /api/v1/auth/token` body `{ grant_type:'client_credentials', client_id, client_secret }` | n/a (client-credentials) | n/a | CRM signs response JWT with `CRM_JWT_PRIVATE_KEY`; validates `client_id/secret` against `LINE_BOT_CLIENT_ID`/`LINE_BOT_CLIENT_SECRET` | — | issues a ≤15-min read/claim JWT |
| **Webhook** (CRM → bot): `POST {LINE_BOT_BASE_URL}/api/crm-events/batch-warning` | `hatchery-crm` | `line-bot-webhook` | CRM `CRM_WEBHOOK_JWT_PRIVATE_KEY` | line-bot's matching public key | ≤ 5 min |

All ES256. **The read-side and webhook-side audiences MUST differ** (`hatchery-crm` ≠ `line-bot-webhook`). A token minted for one flow MUST be rejected by the other. ADR-018's "both services trust the same key" is **superseded** — there are two key pairs and two audiences.

## 4. `batch_code` (both K1s validate this exact regex)

- Format: **`^B-[A-CDEFGHJKMNPQRSTUVWXYZ23456789]{6}$`**
- Minted by CRM `mint_batch_code()` from alphabet `ABCDEFGHJKMNPQRSTUVWXYZ23456789` (32 chars). **Excludes confusables `0 O 1 I l`.** ~2^30 entropy; retry-on-collision ≤5×.
- The LINE bot MUST validate this regex client-side before calling the CRM (reject malformed without a round-trip), and the CRM re-validates (path-format 400 below).

## 5. `GET /api/v1/batches/:code` (CRM owns; bot consumes)

Auth: read-side JWT (§3). Path: `:code` must match §4 regex → else **400** `{ error:'invalid_code_format' }`.

**200** body (fields from `batches`, `pcr_results`, `batch_certs`, frozen `hatchery_contact_snapshot`):
```jsonc
{
  "batch_code": "B-A4F2K7",
  "hatchery_id": "...",
  "hatchery_name": "...",
  "hatchery_contact": { "line_oa_id": "@aqx", "phone": "0812345678" } | null,
  "species": "vannamei",                 // see §8 gap — K6 adds batches.species
  "pl_grade": "...", "pcr": { ... },
  "valid_until": "<iso>",
  "first_claimed_at": "<iso>" | null,    // K1 column; set by K3 claim
  "claimed_by_other": false
}
```
Status ladder (no draft-state leak): **404** `batch_not_found` (unknown code) · **404** `batch_not_found` (exists but `published_at IS NULL` — identical body, no leak) · **410** `{ error:'batch_expired', expired_at }` (`valid_until <= now()`) · **409** `{ error:'claimed_by_other' }` (does NOT leak the other claimant's `line_user_id`/name). Observability: log `{ correlation_id (from X-Correlation-Id or fresh), batch_code, status, latency_ms }`.

## 6. `POST /api/v1/batches/:code/claim` (CRM owns; bot consumes)

Auth: read-side JWT. Body:
```jsonc
{ "line_user_id": "U…(/^U[0-9a-f]{32}$/)", "pond_id": "…(opaque, stored verbatim)",
  "line_profile": { "display_name": "…", "picture_url": "…" }, "correlation_id": "<uuid v4>" }
```
- Malformed → **400** `{ error:'invalid_body', field:'<name>' }`.
- Happy → **200** `{ ok:true, batch_code, claimed_at }`; INSERT `batch_claims(batch_id, line_user_id, pond_id, line_profile, correlation_id, hatchery_id, claimed_at=now())`; set `batches.first_claimed_at=now()` on first claim.
- **Idempotency** (PK `(batch_id, line_user_id)`): re-POST same `(code,line_user_id)` same `correlation_id` → 200 with existing `claimed_at`. Different `correlation_id` → still 200 (retry); original `correlation_id` + `claimed_at` preserved (never overwrite).
- Audit: write `audit_log` using the **real columns** `(action, payload, user_id, hatchery_id, created_at)` — `action='batch.claim'`, actor embedded in `payload` (NOT non-existent `event`/`actor`/`subject_id`).

## 7. `POST {LINE_BOT_BASE_URL}/api/crm-events/batch-warning` (CRM publishes; bot consumes)

Auth: webhook JWT (§3, `aud=line-bot-webhook`). Body:
```jsonc
{ "batch_code":"B-…", "severity":"info|warning|critical",
  "title_th":"…", "body_th":"…", "action_th":"…",
  "posted_at":"<iso>", "correlation_id":"<uuid>" }
```
Delivery routing (CRM side): `critical` → inline (≤3s) then fall to retry cron; `warning`/`info` → enqueue, retry cron (5-min tick, exp backoff `min(2^attempts,60)`s, ≤12 attempts → dead-letter). Idempotency key: `crm_event_log.correlation_id` UNIQUE. Cron auth: `Authorization: Bearer ${CRON_SECRET}` (new var; not the Stripe pattern).

## 8. Open contract gaps (owner + resolving story)

| Gap | Needed by | Resolving story | Status |
|---|---|---|---|
| **List-active-codes**: bot's nightly sync needs every currently-claimable code, but §5 is single-code only. | line-bot K1 (decisions line ~101) | hatchery-crm **K5** `GET /api/v1/batches?active=true` (read-side JWT; returns `[{batch_code, valid_until}]` for `published_at IS NOT NULL AND valid_until > now()`) | ADDED (K5) |
| **`batches.species`**: bot K13 repurchase-threshold logic needs species; CRM `batches` has no species column. | line-bot K13 (decisions line ~227) | hatchery-crm **K6** — migration **026** `ALTER TABLE batches ADD COLUMN species text NOT NULL DEFAULT 'vannamei'`; surfaced in §5 payload. | ADDED (K6) |
| **PCR-cert render parity**: CRM C4 cert vs bot K7 flex must render the same minimal fields. | both | hatchery-crm C4 ↔ line-bot K7 — confirm field parity before both ship. | OPEN — coordinate |

## 9. Per-repo conformance

- **hatchery-crm**: K1 (schema, `batch_code`, `first_claimed_at`), K2 (read + token-refresh), K3 (claim), K4 (webhook publisher), **K5** (list-active), **K6** (species). Migration ledger: K1=013 (+K3 RPC appended), K6=**026**.
- **line-bot**: K1 (claim flow — validate §4 regex, consume §5/§6), K7 (PCR flex — §8 parity), K12 (consume §7 webhook — verify `aud=line-bot-webhook`), K13 (use §5 `species`). ADR-018 reconciled to §3.

## 10. Verification

Diff the §3 audiences / §4 regex / §5 response / §6 claim / §7 payload statements across hatchery-crm K1–K6 ↔ this doc ↔ line-bot K1/K7/K12/K13 + ADR-018 → all identical (or line-bot explicitly cites this doc as superseding). `grep "both services trust the same key"` in line-bot ADR-018 → must be reconciled. K5/K6 pass the executability bar; migration 026 collision-free vs the 013–025 ledger.

---

*End of contract. Implementations conform; they do not reinterpret. Contract changes go to the umbrella source, then re-mirror — never edited locally.*
