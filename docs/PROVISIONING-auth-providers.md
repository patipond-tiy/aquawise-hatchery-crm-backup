# Provisioning — social sign-in auth providers (Story A6)

A6 ships the Google + LINE sign-in **code** dormant. The buttons render and the
magic-link fallback (A1) always works, but social sign-in only goes live once an
operator completes the external-console steps below. These are deliberately
out-of-band: OAuth client credentials cannot be created from code or MCP.

> Until these steps are done: the **Google** button is hidden in mock mode and
> errors gracefully if Supabase has no Google provider; the **LINE** button
> renders but `/auth/line/start` redirects to `?error=line_unconfigured`. The
> email magic-link path is unaffected in every mode.

## Google (Supabase-native provider — no app env)

1. Google Cloud Console → APIs & Services → Credentials → **Create OAuth client
   ID** → *Web application*.
2. Authorized redirect URI:
   `https://<project-ref>.supabase.co/auth/v1/callback`
   (project-ref of the nursery-crm Supabase project).
3. Authorized JavaScript origin: the app domain (e.g. `https://<app-domain>`,
   plus `http://localhost:3000` for local).
4. Copy the generated **Client ID** and **Client secret**.
5. Supabase Dashboard → **Authentication → Providers → Google** → enable, paste
   the Client ID + secret, save.
6. No app environment variable is needed — the existing `/auth/callback` PKCE
   branch (`exchangeCodeAction` → `bootstrapNursery`) handles the return
   unchanged (same path as A1 magic-link). First Google sign-in for an email
   bootstraps one `nurseries` + one `owner` membership + 30-day trial, exactly
   like A1.

## LINE (custom OIDC bridge — needs app env)

1. LINE Developers Console → your provider → **Create a new channel** →
   **LINE Login** (NOT a Messaging API channel — that is the bot's separate
   channel; do not reuse it).
2. Channel settings → **Callback URL**: add one entry per environment:
   - `http://localhost:3000/auth/line/callback` (local)
   - `https://<preview-domain>/auth/line/callback` (Vercel preview, if used)
   - `https://<app-domain>/auth/line/callback` (production)
3. Request the **email address permission** (OpenID `email` scope). LINE reviews
   this; until approved LINE will not return an email. The bridge handles that:
   the user is keyed solely on the LINE `sub` and gets a reserved synthetic
   address `line_<sub>@line.nursery.local` that is never shown in the UI and
   never used to send mail (AC #7).
4. Copy the channel's **Channel ID** and **Channel secret**.
5. Set in Vercel (and `.env.local` for local) — mark **Sensitive** in Vercel:
   ```
   LINE_LOGIN_CHANNEL_ID=<channel id>
   LINE_LOGIN_CHANNEL_SECRET=<channel secret>
   ```
   `LINE_LOGIN_CHANNEL_SECRET` is server-only — never prefix `NEXT_PUBLIC_`.

## Known v1 limitation (AC #7 — by design, not a defect)

A LINE-only account created **before** LINE email permission is approved (so it
has only the synthetic `line_<sub>@line.nursery.local` address) does **not**
auto-merge with a later magic-link or Google account for the same human. The
LINE `sub` is the stable key; once email permission is granted, a *new* LINE
login with the same `sub` keeps the original account (idempotent on `line_sub`).
Cross-provider account merging is intentionally out of scope for v1.

## Security posture (DECISIONS.md D-007)

The LINE callback (`app/auth/line/callback/route.ts`) is the 4th sanctioned
`createServiceClient()` site. It is a Route Handler only (never a user-facing
action/page), enforces CSRF `state` + replay `nonce` + `id_token`
`iss`/`aud`/`exp` assertions, mints the session server-side
(`generateLink`→`verifyOtp`, no `access_token` URL fragment), and emits no
token / `line_sub` / email into any URL or log (failures are opaque
`?error=line_failed`). See `docs/bmad/security.md` §3/§4/§14 and
`docs/temp-docs/conformance-gate.md` §3.
