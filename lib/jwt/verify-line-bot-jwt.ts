// Epic K K2/K3/K5 — inbound read/claim bearer verification.
// Thin Next.js adapter over the vendored @aquawise/core verifyFlowToken
// ('read-claim' flow → iss=line-bot, aud=hatchery-crm, ES256, ≤15min TTL).
// Confused-deputy prevention is enforced inside verifyFlowToken: a token
// minted for the webhook flow (aud=line-bot-webhook) is rejected here.

import type { NextRequest } from 'next/server';
import { verifyFlowToken, FlowTokenError } from '@/lib/aquawise-core/jwt';
import { crmJwtPublicKey } from './keys';

export type JwtVerifyResult =
  | { ok: true; iss: string }
  | { ok: false; status: 401; code: string; expired?: boolean };

function bearer(req: NextRequest): string | null {
  const h = req.headers.get('authorization') ?? '';
  if (!h.startsWith('Bearer ')) return null;
  const t = h.slice(7).trim();
  return t.length > 0 ? t : null;
}

/**
 * Verify the read/claim bearer. On any failure returns a 401 descriptor;
 * never throws to the caller (the route maps it to a JSON 401). The
 * `expired` flag lets K2 emit `WWW-Authenticate: Bearer error="token_expired"`.
 */
export async function verifyLineBotJwt(
  req: NextRequest,
): Promise<JwtVerifyResult> {
  const token = bearer(req);
  if (!token) return { ok: false, status: 401, code: 'missing_token' };

  try {
    const pub = await crmJwtPublicKey();
    const claims = await verifyFlowToken('read-claim', pub, token);
    return { ok: true, iss: claims.iss };
  } catch (e) {
    if (e instanceof FlowTokenError) {
      return {
        ok: false,
        status: 401,
        code: e.code,
        expired: e.code === 'expired',
      };
    }
    return { ok: false, status: 401, code: 'invalid_token' };
  }
}
