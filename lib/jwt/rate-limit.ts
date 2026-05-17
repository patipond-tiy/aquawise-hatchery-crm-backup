// Epic K K2/K3/K5 — per-`iss` token bucket. 10 req/s, burst 10.
// In-memory; acceptable for single-region deployment (contract §5 / K2 AC#9).
// Keyed on the JWT `iss` claim, not IP — the trust boundary is the token.

interface Bucket {
  tokens: number;
  last: number;
}

const CAPACITY = 10;
const REFILL_PER_SEC = 10;
const MAX_KEYS = 1000;

const buckets = new Map<string, Bucket>();

/** Returns true if the request is allowed; false if the bucket is exhausted. */
export function rateLimitAllow(iss: string, now = Date.now()): boolean {
  let b = buckets.get(iss);
  if (!b) {
    if (buckets.size >= MAX_KEYS) {
      // Crude LRU-ish guard: drop the oldest insertion.
      const firstKey = buckets.keys().next().value;
      if (firstKey !== undefined) buckets.delete(firstKey);
    }
    b = { tokens: CAPACITY, last: now };
    buckets.set(iss, b);
  }
  const elapsedSec = (now - b.last) / 1000;
  if (elapsedSec > 0) {
    b.tokens = Math.min(CAPACITY, b.tokens + elapsedSec * REFILL_PER_SEC);
    b.last = now;
  }
  if (b.tokens >= 1) {
    b.tokens -= 1;
    return true;
  }
  return false;
}

/** Test-only reset. */
export function __resetRateLimit(): void {
  buckets.clear();
}
