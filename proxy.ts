import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import type { Database } from '@/lib/database.types';

const intl = createIntlMiddleware(routing);

// Routes that never require a session (login, post-checkout, trial-expired).
const PUBLIC_PATH = /^\/(th|en)\/(login|billing)(\/|$)/;

function isMockMode(): boolean {
  return (
    (process.env.NEXT_PUBLIC_USE_MOCK ?? process.env.USE_MOCK) !== 'false' ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL
  );
}

/**
 * Story S4 — per-request Content-Security-Policy with a fresh nonce +
 * `strict-dynamic`. Source of truth is `docs/bmad/security.md` §17 (do not
 * reinvent the string). The nonce is also pushed onto the *request* headers
 * so server components (`app/[locale]/layout.tsx`) can read it via
 * `headers().get('x-nonce')` and stamp it on any inline `<Script>`.
 *
 * Trade-off (recorded in code-design.md §19): nonces force fully dynamic
 * rendering — incompatible with PPR / `cacheComponents`. Hash-based CSP is
 * the migration path if/when PPR becomes worthwhile.
 */
// Exported for the S4 regression test (tests/security/csp.test.ts) — the
// original S4 ship had an unchecked "zero CSP violations" AC and a nonce
// style-src that blocked every inline style. Pure function, no side effects.
export function buildCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV !== 'production';
  // Next.js HMR / React Refresh needs 'unsafe-eval' in dev only.
  const scriptSrc = isDev
    ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval'`
    : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`;
  return [
    `default-src 'self'`,
    scriptSrc,
    // style-src: 'unsafe-inline', NOT a nonce. React 19 / Next.js 16 emit
    // hundreds of runtime inline `style=` attributes (the <body> font-family
    // here, component styles, tw-animate-css, next/font's injected block).
    // A CSP nonce only authorizes <style>/<link> elements — it can never
    // cover an inline `style=` attribute, and a nonce in style-src also
    // disables the implicit 'unsafe-inline' for them (CSP3). The result was
    // every inline style blocked → fully unstyled UI. Style injection is not
    // a script-execution vector; 'unsafe-inline' on style-src is the
    // Next.js-recommended posture. The XSS-relevant control (script-src
    // nonce + 'strict-dynamic') is unchanged.
    `style-src 'self' 'unsafe-inline'`,
    `connect-src 'self' https://*.supabase.co https://api.stripe.com https://sentry.io https://*.sentry.io https://api.line.me`,
    `img-src 'self' blob: data: https://*.supabase.co`,
    `font-src 'self' data:`,
    `frame-src https://js.stripe.com https://hooks.stripe.com`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ].join('; ');
}

function applySecurityHeaders(res: NextResponse, csp: string): void {
  res.headers.set('Content-Security-Policy', csp);
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );
}

export default async function proxy(req: NextRequest) {
  // Fresh nonce per request (AC#1). Push it onto the request headers so the
  // intl rewrite AND downstream RSC see the same value.
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  req.headers.set('x-nonce', nonce);
  const csp = buildCsp(nonce);

  const res = intl(req) ?? NextResponse.next();
  // Make the pathname available to server components (e.g. BillingGate)
  // since layouts don't get the request URL directly.
  res.headers.set('x-pathname', req.nextUrl.pathname);
  res.headers.set('x-nonce', nonce);
  applySecurityHeaders(res, csp);

  // Story A4 AC#3 — block dashboard access without a valid session so a
  // signed-out user (e.g. on a shared device) cannot reach stale data.
  // Skipped entirely in mock mode (demo deploy has no Supabase).
  const { pathname } = req.nextUrl;
  const localeRoot = /^\/(th|en)\/?$/.test(pathname);
  const inLocale = /^\/(th|en)\//.test(pathname);
  const needsAuth =
    !isMockMode() &&
    (localeRoot || inLocale) &&
    !PUBLIC_PATH.test(pathname);

  if (needsAuth) {
    const response = res;
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      const locale = pathname.split('/')[1] || routing.defaultLocale;
      const url = req.nextUrl.clone();
      url.pathname = `/${locale}/login`;
      url.search = '';
      const redirect = NextResponse.redirect(url);
      // Carry the security headers onto the redirect response too.
      applySecurityHeaders(redirect, csp);
      return redirect;
    }
  }

  return res;
}

export const config = {
  // Exclude /auth/* — Supabase callbacks land there without a locale prefix.
  matcher: ['/((?!api|auth|_next|_vercel|.*\\..*).*)'],
};
