// Epic K — CRM-side token minting. Thin adapter over vendored
// @aquawise/core signFlowToken. TWO distinct flows / key pairs (contract §3):
//   * signReadClaimToken — token-refresh endpoint (K2 AC#11): the bot exchanges
//     client-credentials for a ≤15-min read/claim JWT (iss=line-bot,
//     aud=hatchery-crm).
//   * signWebhookJwt — outbound batch-warning (K4 §7): ≤5-min webhook JWT
//     (iss=hatchery-crm, aud=line-bot-webhook — MUST differ from read-side).

import { signFlowToken } from '@/lib/aquawise-core/jwt';
import { crmJwtPrivateKey, crmWebhookPrivateKey } from './keys';

const READ_CLAIM_TTL_S = 900; // ≤15 min (contract §3 ceiling)
const WEBHOOK_TTL_S = 300; // ≤5 min (contract §3 ceiling)

/** Mint the read/claim JWT handed back by the token-refresh endpoint. */
export async function signReadClaimToken(): Promise<string> {
  const key = await crmJwtPrivateKey();
  return signFlowToken('read-claim', key, { ttlSeconds: READ_CLAIM_TTL_S });
}

/** Mint the webhook JWT for an outbound batch-warning POST. */
export async function signWebhookJwt(): Promise<string> {
  const key = await crmWebhookPrivateKey();
  return signFlowToken('webhook', key, { ttlSeconds: WEBHOOK_TTL_S });
}
