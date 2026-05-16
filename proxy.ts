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

export default async function proxy(req: NextRequest) {
  const res = intl(req) ?? NextResponse.next();
  // Make the pathname available to server components (e.g. BillingGate)
  // since layouts don't get the request URL directly.
  res.headers.set('x-pathname', req.nextUrl.pathname);

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
    let response = res;
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
      return NextResponse.redirect(url);
    }
  }

  return res;
}

export const config = {
  // Exclude /auth/* — Supabase callbacks land there without a locale prefix.
  matcher: ['/((?!api|auth|_next|_vercel|.*\\..*).*)'],
};
