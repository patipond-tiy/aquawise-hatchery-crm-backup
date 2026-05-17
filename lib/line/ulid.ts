import { randomBytes } from 'node:crypto';

/**
 * Minimal ULID (26-char Crockford base32, lexicographically sortable,
 * 48-bit ms timestamp + 80 bits random). Zero deps — used for one-shot
 * `customer_bind_tokens.token` values (G1).
 */
const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // Crockford, no I L O U

export function ulid(now: number = Date.now()): string {
  let ts = '';
  let t = now;
  for (let i = 0; i < 10; i++) {
    ts = ENCODING[t % 32] + ts;
    t = Math.floor(t / 32);
  }
  const bytes = randomBytes(16);
  let rand = '';
  let bits = 0;
  let acc = 0;
  for (let i = 0; i < bytes.length && rand.length < 16; i++) {
    acc = (acc << 8) | bytes[i];
    bits += 8;
    while (bits >= 5 && rand.length < 16) {
      bits -= 5;
      rand += ENCODING[(acc >> bits) & 31];
    }
  }
  while (rand.length < 16) rand += ENCODING[Math.floor(Math.random() * 32)];
  return (ts + rand).slice(0, 26);
}
