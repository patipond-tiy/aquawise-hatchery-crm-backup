// Epic K K3 — claim request body validation (contract §6).
// On failure the route returns 400 { error:'invalid_body', field:<name> }
// naming the FIRST offending field. We hand-roll the field-order check so the
// reported `field` is deterministic and matches the UAT (K3-S2).

import { LINE_USER_ID_REGEX, type BatchClaimRequest } from '@/lib/aquawise-core/contract-types';

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type ClaimParseResult =
  | { ok: true; value: BatchClaimRequest }
  | { ok: false; field: string };

function isStr(v: unknown): v is string {
  return typeof v === 'string' && v.length > 0;
}

export function parseClaimBody(raw: unknown): ClaimParseResult {
  if (typeof raw !== 'object' || raw === null) {
    return { ok: false, field: 'line_user_id' };
  }
  const b = raw as Record<string, unknown>;

  if (!isStr(b.line_user_id) || !LINE_USER_ID_REGEX.test(b.line_user_id)) {
    return { ok: false, field: 'line_user_id' };
  }
  if (!isStr(b.pond_id)) {
    return { ok: false, field: 'pond_id' };
  }
  const lp = b.line_profile;
  if (
    typeof lp !== 'object' ||
    lp === null ||
    !isStr((lp as Record<string, unknown>).display_name) ||
    !isStr((lp as Record<string, unknown>).picture_url)
  ) {
    return { ok: false, field: 'line_profile' };
  }
  if (!isStr(b.correlation_id) || !UUID_V4.test(b.correlation_id)) {
    return { ok: false, field: 'correlation_id' };
  }

  const profile = lp as { display_name: string; picture_url: string };
  return {
    ok: true,
    value: {
      line_user_id: b.line_user_id,
      pond_id: b.pond_id,
      line_profile: {
        display_name: profile.display_name,
        picture_url: profile.picture_url,
      },
      correlation_id: b.correlation_id,
    },
  };
}
