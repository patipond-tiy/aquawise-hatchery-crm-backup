import { describe, expect, it, vi } from 'vitest';

// proxy.ts imports next-intl middleware + Supabase SSR at module load; stub
// them so we can unit-test the pure buildCsp function in isolation.
vi.mock('next-intl/middleware', () => ({
  default: () => () => undefined,
}));
vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: { getUser: async () => ({ data: { user: null } }) },
  }),
}));
vi.mock('@/i18n/routing', () => ({
  routing: { locales: ['th', 'en'], defaultLocale: 'th' },
}));

import { buildCsp } from '@/proxy';

const NONCE = 'dGVzdC1ub25jZQ==';

describe('S4 CSP — style/script directive invariants', () => {
  const csp = buildCsp(NONCE);
  const directive = (name: string) =>
    csp
      .split(';')
      .map((d) => d.trim())
      .find((d) => d.startsWith(`${name} `)) ?? '';

  it('style-src allows inline styles (React/Next emit nonce-less style= attrs)', () => {
    // The original bug: `style-src 'self' 'nonce-…'` blocked every inline
    // `style=` attribute → fully unstyled UI. Inline style attributes can
    // never carry a nonce, so 'unsafe-inline' is required and a nonce must
    // NOT be present (a nonce disables implicit unsafe-inline under CSP3).
    const styleSrc = directive('style-src');
    expect(styleSrc).toContain("'unsafe-inline'");
    expect(styleSrc).not.toContain('nonce-');
  });

  it('script-src keeps the per-request nonce + strict-dynamic (XSS control intact)', () => {
    const scriptSrc = directive('script-src');
    expect(scriptSrc).toContain(`'nonce-${NONCE}'`);
    expect(scriptSrc).toContain("'strict-dynamic'");
  });

  it('script-src never falls back to unsafe-inline (the real XSS vector)', () => {
    expect(directive('script-src')).not.toContain("'unsafe-inline'");
  });

  it('keeps the S4 hardening directives', () => {
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain('upgrade-insecure-requests');
  });
});
