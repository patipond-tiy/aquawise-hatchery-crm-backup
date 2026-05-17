// Epic K — ES256 key loading. Contract §3: TWO key pairs.
//   * read/claim flow:  CRM verifies the bot's bearer with CRM_JWT_PUBLIC_KEY;
//                        CRM mints (token-refresh) with CRM_JWT_PRIVATE_KEY.
//   * webhook flow:      CRM signs outbound with CRM_WEBHOOK_JWT_PRIVATE_KEY.
//
// Keys are PEM, supplied via env. Multiline PEM is stored with literal "\n"
// escapes (same convention as the Supabase service-role / GEE keys elsewhere
// in the ecosystem) — we un-escape before importing.

import { importPKCS8, importSPKI, type KeyLike } from 'jose';

const ALG = 'ES256';

function unescapePem(raw: string): string {
  // Accept both real newlines and "\n"-escaped single-line env values.
  return raw.includes('-----BEGIN') && raw.includes('\\n')
    ? raw.replace(/\\n/g, '\n')
    : raw;
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v || v.trim() === '') {
    throw new Error(`[v0] missing required env ${name} (Epic K JWT key)`);
  }
  return unescapePem(v);
}

let _crmPublic: Promise<KeyLike> | null = null;
let _crmPrivate: Promise<KeyLike> | null = null;
let _webhookPrivate: Promise<KeyLike> | null = null;

/** Verifies inbound read/claim bearer (the bot's CRM_JWT_PRIVATE_KEY counterpart). */
export function crmJwtPublicKey(): Promise<KeyLike> {
  _crmPublic ??= importSPKI(requireEnv('CRM_JWT_PUBLIC_KEY'), ALG);
  return _crmPublic;
}

/** Signs the token-refresh response (read/claim flow). */
export function crmJwtPrivateKey(): Promise<KeyLike> {
  _crmPrivate ??= importPKCS8(requireEnv('CRM_JWT_PRIVATE_KEY'), ALG);
  return _crmPrivate;
}

/** Signs outbound batch-warning webhooks (webhook flow, distinct key pair). */
export function crmWebhookPrivateKey(): Promise<KeyLike> {
  _webhookPrivate ??= importPKCS8(
    requireEnv('CRM_WEBHOOK_JWT_PRIVATE_KEY'),
    ALG,
  );
  return _webhookPrivate;
}
