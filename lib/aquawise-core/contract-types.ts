// Epic K wire shapes — single source of the request/response types for
// contract §5 (GET batch), §6 (claim), §7 (batch-warning webhook).
// Source of truth: aquawise-docs/K-INTEGRATION-CONTRACT.md. Both repos import
// these instead of redeclaring (drift = compliance bug).

/** §5 GET /api/v1/batches/:code — 200 body. */
export interface BatchReadResponse {
  batch_code: string;
  hatchery_id: string;
  hatchery_name: string;
  hatchery_contact: { line_oa_id: string; phone: string } | null;
  species: string; // §8 K6 — batches.species, default 'vannamei'
  pl_grade: string;
  pcr: Record<string, unknown>;
  valid_until: string; // iso
  first_claimed_at: string | null; // iso; set by §6 claim
  claimed_by_other: boolean;
}

/** §5 error bodies (status ladder; no draft-state / claimant leak). */
export type BatchReadError =
  | { error: 'invalid_code_format' } // 400
  | { error: 'batch_not_found' } // 404 (unknown OR unpublished — identical, no leak)
  | { error: 'batch_expired'; expired_at: string } // 410
  | { error: 'claimed_by_other' }; // 409 (no other-claimant PII)

/** §6 POST /api/v1/batches/:code/claim — request body. */
export interface BatchClaimRequest {
  line_user_id: string; // /^U[0-9a-f]{32}$/
  pond_id: string; // opaque, stored verbatim
  line_profile: { display_name: string; picture_url: string };
  correlation_id: string; // uuid v4
}
export const LINE_USER_ID_REGEX = /^U[0-9a-f]{32}$/;

/** §6 success / error. */
export interface BatchClaimResponse {
  ok: true;
  batch_code: string;
  claimed_at: string;
}
export type BatchClaimError = { error: 'invalid_body'; field: string }; // 400

/** §7 POST {LINE_BOT_BASE_URL}/api/crm-events/batch-warning — body. */
export interface BatchWarningEvent {
  batch_code: string;
  severity: 'info' | 'warning' | 'critical';
  title_th: string;
  body_th: string;
  action_th: string;
  posted_at: string; // iso
  correlation_id: string; // uuid; idempotency key (crm_event_log.correlation_id UNIQUE)
}
