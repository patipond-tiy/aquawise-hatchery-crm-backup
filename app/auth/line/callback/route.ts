// Story A6 — LINE Login callback: the D-007 OIDC→Supabase bridge.
//
// This Route Handler is the 4th sanctioned createServiceClient() site
// (DECISIONS.md D-007 / conformance-gate §3 / security.md §14). It is NEVER
// reachable from a user-facing action or page — Route Handler only.
//
// Flow (all five D-007 conditions enforced here):
//  1. CSRF: `state` query param must equal the httpOnly cookie (timing-safe).
//  2. Exchange `code` at LINE's token endpoint for an `id_token`.
//  3. Verify the id_token at LINE's verify endpoint, asserting
//     iss=https://access.line.me, aud=<channel id>, not expired, and
//     nonce === the httpOnly cookie (replay defence).
//  4. Resolve/create the auth.users row via the service-role client and
//     upsert line_identities (service-role bypasses RLS by design).
//  5. Mint the session SERVER-SIDE (generateLink → verifyOtp on the SSR
//     client) so the cookie is set in this handler. The browser is NEVER
//     sent an access_token/refresh_token URL fragment (closes §3/§4).
// Any failure → opaque /th/login?error=line_failed (no token/PII/exception
// text in the URL or logs).

import { NextResponse, type NextRequest } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { bootstrapNursery } from '@/lib/auth/bootstrap';
import { isMockMode } from '@/lib/utils/mock-mode';

export const runtime = 'nodejs';

const LINE_TOKEN_URL = 'https://api.line.me/oauth2/v2.1/token';
const LINE_VERIFY_URL = 'https://api.line.me/oauth2/v2.1/verify';
const LINE_ISSUER = 'https://access.line.me';
const STATE_COOKIE = 'line_oauth_state';
const NONCE_COOKIE = 'line_oauth_nonce';

// Narrow `as` casts confined to these external-response adapters (per
// architecture constraints — no `any`, casts only at the IdP boundary).
type LineTokenResponse = { id_token?: string };
type LineVerifyResponse = {
  iss?: string;
  aud?: string;
  exp?: number;
  nonce?: string;
  sub?: string;
  email?: string;
  name?: string;
};

function constantTimeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

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

function fail(origin: string): NextResponse {
  // Opaque failure — never leak token/exception/PII into the URL (D-007 #4).
  const response = NextResponse.redirect(`${origin}/th/login?error=line_failed`);
  response.cookies.delete(STATE_COOKIE);
  response.cookies.delete(NONCE_COOKIE);
  return response;
}

export async function GET(request: NextRequest) {
  const origin = resolveOrigin(request);
  const channelId = process.env.LINE_LOGIN_CHANNEL_ID;
  const channelSecret = process.env.LINE_LOGIN_CHANNEL_SECRET;

  if (isMockMode() || !channelId || !channelSecret) {
    return NextResponse.redirect(`${origin}/th/login?error=line_unconfigured`);
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const cookieState = request.cookies.get(STATE_COOKIE)?.value;
  const cookieNonce = request.cookies.get(NONCE_COOKIE)?.value;

  // D-007 #3 (CSRF) — state must be present on both sides and match.
  if (
    !code ||
    !state ||
    !cookieState ||
    !constantTimeEqual(state, cookieState)
  ) {
    return fail(origin);
  }

  try {
    // ---- Step 2: code → id_token --------------------------------------
    const tokenRes = await fetch(LINE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${origin}/auth/line/callback`,
        client_id: channelId,
        client_secret: channelSecret,
      }),
    });
    if (!tokenRes.ok) return fail(origin);
    const tokenJson = (await tokenRes.json()) as LineTokenResponse;
    const idToken = tokenJson.id_token;
    if (!idToken) return fail(origin);

    // ---- Step 3: verify id_token (iss/aud/exp/nonce) ------------------
    const verifyRes = await fetch(LINE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        id_token: idToken,
        client_id: channelId,
      }),
    });
    if (!verifyRes.ok) return fail(origin);
    const claims = (await verifyRes.json()) as LineVerifyResponse;

    const nowSeconds = Math.floor(Date.now() / 1000);
    // D-007 #3 — assert iss / aud / exp AND the replay nonce. LINE echoes the
    // nonce from /authorize into the id_token and returns it from the verify
    // endpoint; it must equal the httpOnly cookie minted by /auth/line/start.
    if (
      claims.iss !== LINE_ISSUER ||
      claims.aud !== channelId ||
      typeof claims.exp !== 'number' ||
      claims.exp < nowSeconds ||
      !claims.sub ||
      !cookieNonce ||
      !claims.nonce ||
      !constantTimeEqual(claims.nonce, cookieNonce)
    ) {
      return fail(origin);
    }

    const lineSub = claims.sub;
    const lineEmail = claims.email?.trim() || null;
    const displayName = claims.name?.trim() || null;

    // ---- Step 4: resolve/create the Supabase user (service-role) ------
    const admin = await createServiceClient();

    let userId: string | null = null;

    // Prefer the existing line_identities mapping (stable across email
    // permission changes); fall back to email when LINE returned one.
    const { data: identity } = await admin
      .from('line_identities')
      .select('user_id')
      .eq('line_sub', lineSub)
      .maybeSingle();

    if (identity) {
      userId = identity.user_id;
    }

    // AC #7 — LINE email may be absent. When present, key on it so a LINE
    // login and a magic-link login for the same address converge; when
    // absent, use a reserved synthetic address that is never shown/mailed.
    const resolvedEmail =
      lineEmail ?? `line_${lineSub}@line.nursery.local`;

    if (!userId && lineEmail) {
      // Look for an existing auth user with this email (e.g. prior magic-link
      // or Google sign-in) so LINE links to it rather than duplicating.
      const { data: list } = await admin.auth.admin.listUsers();
      const match = list?.users.find(
        (u) => u.email?.toLowerCase() === lineEmail.toLowerCase()
      );
      if (match) userId = match.id;
    }

    if (!userId) {
      const { data: created, error: createErr } =
        await admin.auth.admin.createUser({
          email: resolvedEmail,
          email_confirm: true,
        });
      if (createErr || !created.user) return fail(origin);
      userId = created.user.id;
    }

    // Upsert the identity mapping (idempotent on the unique line_sub).
    const { error: upsertErr } = await admin
      .from('line_identities')
      .upsert(
        {
          user_id: userId,
          line_sub: lineSub,
          email_at_link: lineEmail,
          display_name: displayName,
        },
        { onConflict: 'line_sub' }
      );
    if (upsertErr) return fail(origin);

    // ---- Step 5: mint the session SERVER-SIDE (no URL fragment) -------
    // generateLink yields a single-use OTP hash; verifyOtp on the SSR
    // (cookie-bound) client sets the auth cookie directly in this handler.
    const { data: linkData, error: linkErr } =
      await admin.auth.admin.generateLink({
        type: 'magiclink',
        email: resolvedEmail,
      });
    if (linkErr || !linkData.properties?.hashed_token) return fail(origin);

    const ssr = await createClient();
    const { error: otpErr } = await ssr.auth.verifyOtp({
      type: 'magiclink',
      token_hash: linkData.properties.hashed_token,
    });
    if (otpErr) return fail(origin);

    // First sign-in bootstraps a workspace exactly like A1 (idempotent).
    await bootstrapNursery(userId);

    const response = NextResponse.redirect(`${origin}/th`);
    response.cookies.delete(STATE_COOKIE);
    response.cookies.delete(NONCE_COOKIE);
    return response;
  } catch {
    // No exception text in the redirect or logs (D-007 #4).
    return fail(origin);
  }
}
