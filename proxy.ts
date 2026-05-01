import { type NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

const intl = createIntlMiddleware(routing);

export default function proxy(req: NextRequest) {
  const res = intl(req) ?? NextResponse.next();
  // Make the pathname available to server components (e.g. BillingGate)
  // since layouts don't get the request URL directly.
  res.headers.set('x-pathname', req.nextUrl.pathname);
  return res;
}

export const config = {
  // Exclude /auth/* — Supabase callbacks land there without a locale prefix.
  matcher: ['/((?!api|auth|_next|_vercel|.*\\..*).*)'],
};
