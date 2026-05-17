// Epic K contract §3 — JWT model. Source of truth:
// aquawise-docs/K-INTEGRATION-CONTRACT.md §3 (supersedes line-bot ADR-018 "same key").
//
// THREE flows, TWO distinct audiences, TWO key pairs, ES256 only.
// A token minted for one flow MUST be rejected by the other (confused-deputy
// prevention). These constants are the contract — neither repo re-decides them.

import { SignJWT, jwtVerify, type JWTPayload, type KeyLike } from 'jose';

export type Flow = 'read-claim' | 'webhook';

/** §3: read/claim aud=hatchery-crm, webhook aud=line-bot-webhook. MUST differ. */
export const FLOW_AUD = {
  'read-claim': 'hatchery-crm',
  webhook: 'line-bot-webhook',
} as const satisfies Record<Flow, string>;

/** §3: read/claim iss=line-bot, webhook iss=hatchery-crm. */
export const FLOW_ISS = {
  'read-claim': 'line-bot',
  webhook: 'hatchery-crm',
} as const satisfies Record<Flow, string>;

/** §3 TTL ceilings (seconds): read/claim ≤15min, webhook ≤5min. Enforced on verify too. */
export const FLOW_MAX_TTL_S = {
  'read-claim': 900,
  webhook: 300,
} as const satisfies Record<Flow, number>;

const ALG = 'ES256';

export type JwtErrorCode =
  | 'bad_audience'
  | 'bad_issuer'
  | 'bad_alg'
  | 'expired'
  | 'ttl_too_long'
  | 'bad_signature'
  | 'malformed';

export class FlowTokenError extends Error {
  constructor(public readonly code: JwtErrorCode, message: string) {
    super(message);
    this.name = 'FlowTokenError';
  }
}

export interface FlowClaims extends JWTPayload {
  iss: string;
  aud: string;
  exp: number;
}

/**
 * Mint a flow token. CRM-only in practice:
 *  - 'read-claim': minted by CRM token-refresh endpoint (§3 client-credentials), held by bot.
 *  - 'webhook'   : minted by CRM webhook publisher (§7), verified by bot.
 * `privateKey` is the ES256 private key for THIS flow's key pair (the two flows
 * use DIFFERENT key pairs — never share).
 */
export async function signFlowToken(
  flow: Flow,
  privateKey: KeyLike | Uint8Array,
  opts: { ttlSeconds: number; extraClaims?: Record<string, unknown> },
): Promise<string> {
  if (opts.ttlSeconds <= 0 || opts.ttlSeconds > FLOW_MAX_TTL_S[flow]) {
    throw new FlowTokenError(
      'ttl_too_long',
      `ttl ${opts.ttlSeconds}s exceeds ${flow} ceiling ${FLOW_MAX_TTL_S[flow]}s`,
    );
  }
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({ ...opts.extraClaims })
    .setProtectedHeader({ alg: ALG })
    .setIssuer(FLOW_ISS[flow])
    .setAudience(FLOW_AUD[flow])
    .setIssuedAt(now)
    .setExpirationTime(now + opts.ttlSeconds)
    .sign(privateKey);
}

/**
 * Verify a flow token. Rejects, with a typed FlowTokenError:
 *  - wrong audience  (audience isolation — a webhook token presented to the
 *                     read-claim verifier and vice-versa is rejected)
 *  - wrong issuer
 *  - non-ES256 alg   (alg-confusion / alg:none guard)
 *  - expired
 *  - exp further than this flow's TTL ceiling from iat (over-long token)
 *  - bad signature / malformed
 * Never silently downgrades. Callers must not catch-and-soft-pass.
 */
export async function verifyFlowToken(
  flow: Flow,
  publicKey: KeyLike | Uint8Array,
  token: string,
): Promise<FlowClaims> {
  let payload: JWTPayload;
  try {
    ({ payload } = await jwtVerify(token, publicKey, {
      algorithms: [ALG], // hard allow-list — rejects none/HS*/RS* (alg confusion)
      audience: FLOW_AUD[flow],
      issuer: FLOW_ISS[flow],
    }));
  } catch (e) {
    // jose throws structured errors: classify by .code/.claim, not message text.
    const err = e as { code?: string; claim?: string; message?: string };
    const msg = err.message ?? String(e);
    switch (err.code) {
      case 'ERR_JOSE_ALG_NOT_ALLOWED':
        throw new FlowTokenError('bad_alg', msg);
      case 'ERR_JWT_EXPIRED':
        throw new FlowTokenError('expired', msg);
      case 'ERR_JWT_CLAIM_VALIDATION_FAILED':
        if (err.claim === 'aud') throw new FlowTokenError('bad_audience', msg);
        if (err.claim === 'iss') throw new FlowTokenError('bad_issuer', msg);
        throw new FlowTokenError('malformed', msg);
      case 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED':
        throw new FlowTokenError('bad_signature', msg);
      case 'ERR_JWS_INVALID':
      case 'ERR_JWT_INVALID':
      case 'ERR_JWS_NO_SIGNATURES':
        throw new FlowTokenError('malformed', msg);
      default:
        throw new FlowTokenError('malformed', msg);
    }
  }
  if (typeof payload.exp !== 'number' || typeof payload.iat !== 'number') {
    throw new FlowTokenError('malformed', 'missing exp/iat');
  }
  if (payload.exp - payload.iat > FLOW_MAX_TTL_S[flow]) {
    throw new FlowTokenError(
      'ttl_too_long',
      `token lifetime ${payload.exp - payload.iat}s exceeds ${flow} ceiling`,
    );
  }
  return payload as FlowClaims;
}
