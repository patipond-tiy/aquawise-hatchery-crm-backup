// Story A6 — LINE Login: authorize redirect (Route Handler, no UI).
//
// LINE has no native Supabase provider, so this initiates a custom OIDC flow.
// We mint a CSPRNG `state` (CSRF) and `nonce` (replay), stash them in
// httpOnly/Secure/SameSite=Lax short-TTL cookies, and 302 the browser to
// LINE's authorize endpoint. The matching callback (app/auth/line/callback)
// asserts both against the id_token. No secrets are emitted to the client;
// only the public LINE Login channel id appears in the (LINE-hosted) URL.
//
// Security (D-007 / security.md §3/§4): no token or PII is placed in any URL
// or log here; failures redirect to an opaque ?error= on /login.

import { NextResponse, type NextRequest } from 'next/server';
import { randomBytes } from 'node:crypto';
import { isMockMode } from '@/lib/utils/mock-mode';

export const runtime = 'nodejs';

const LINE_AUTHORIZE_URL = 'https://access.line.me/oauth2/v2.1/authorize';
const STATE_COOKIE = 'line_oauth_state';
const NONCE_COOKIE = 'line_oauth_nonce';
const COOKIE_TTL_SECONDS = 600; // 10 minutes — generous for the LINE consent UI

/**
 * Resolve the externally-visible origin. On Vercel the request hits the
 * function via an internal host, so prefer the forwarded headers and only
 * fall back to the parsed request URL for local dev.
 */
function resolveOrigin(request: NextRequest): string {
  const proto =
    request.headers.get('x-forwarded-proto') ??
    new URL(request.url).protocol.replace(':', '');
  const host =
    request.headers.get('x-forwarded-host') ??
    request.headers.get('host') ??
    new URL(request.url).host;
  return `${proto}://${host}`;
}

export async function GET(request: NextRequest) {
  const origin = resolveOrigin(request);
  const channelId = process.env.LINE_LOGIN_CHANNEL_ID;

  // AC #8 — mock mode or unconfigured: button still renders, but starting the
  // flow is a friendly no-op back to /login with an opaque marker.
  if (isMockMode() || !channelId) {
    return NextResponse.redirect(`${origin}/th/login?error=line_unconfigured`);
  }

  const state = randomBytes(32).toString('hex');
  const nonce = randomBytes(32).toString('hex');

  const authorize = new URL(LINE_AUTHORIZE_URL);
  authorize.searchParams.set('response_type', 'code');
  authorize.searchParams.set('client_id', channelId);
  authorize.searchParams.set('redirect_uri', `${origin}/auth/line/callback`);
  authorize.searchParams.set('state', state);
  authorize.searchParams.set('scope', 'openid profile email');
  authorize.searchParams.set('nonce', nonce);

  const response = NextResponse.redirect(authorize.toString());
  const cookieOpts = {
    httpOnly: true,
    secure: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: COOKIE_TTL_SECONDS,
  };
  response.cookies.set(STATE_COOKIE, state, cookieOpts);
  response.cookies.set(NONCE_COOKIE, nonce, cookieOpts);
  return response;
}
