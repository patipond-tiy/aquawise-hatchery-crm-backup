// Epic K contract §4 — batch_code format. Source of truth:
// aquawise-docs/K-INTEGRATION-CONTRACT.md §4. Both repos validate this EXACT regex.
// Alphabet excludes confusables 0 O 1 I l.

export const BATCH_CODE_REGEX = /^B-[A-CDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/;

/** Mint alphabet (32 chars). CRM-side mint_batch_code() draws from this. */
export const BATCH_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/**
 * Validate a batch code against the contract regex.
 * line-bot MUST call this client-side before any CRM round-trip;
 * CRM MUST re-validate (path-format 400 invalid_code_format).
 */
export function validateBatchCode(code: unknown): code is string {
  return typeof code === 'string' && BATCH_CODE_REGEX.test(code);
}
