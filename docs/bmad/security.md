# AquaWise Nursery CRM — Security Reference

> PURPOSE: Threat catalog with concrete, actionable mitigations for THIS stack.
> AUDIENCE: developers writing features, reviewers gating PRs, anyone preparing for first paying tenant.
> SCOPE: this repo only. The sibling `line-bot/` repo has its own security doc.
> RELATIONSHIP: `code-design.md` §13 is the merge-gate fast-scan; this file is the deep reference.

Last reviewed: 2026-05-15. Mitigations verified against actual codebase patterns and current upstream advisories.

---

## TL;DR — Immediate actions (pre-launch)

| Severity | Action | Why | Tracked |
|---|---|---|---|
| **🔴 P0** | `pnpm up next@latest` (target ≥16.2.5) | GHSA-36qx-fr4f-26g5: middleware/proxy bypass in i18n apps. We are on 16.0.0; we use `next-intl`. **Directly exploitable.** | §1 |
| **🔴 P0** | Disable Supabase implicit-grant flow; PKCE only | Implicit-flow tokens are visible in the URL fragment; email-link trackers (Outlook SafeLinks, Barracuda) prefetch and consume them. | §3 |
| **🔴 P0** | Disable Storage bucket directory listing (`nursery-logos` — FLAG: bucket name) | A public bucket leaks the list of all nursery tenant UUIDs via the listing API. | §15 |
| **🟠 P1** | Validate file upload magic bytes (not just `Content-Type`) | Current check is client-asserted; attacker can upload HTML disguised as PNG. | §1 |
| **🟠 P1** | Add `.github/dependabot.yml` + CI `pnpm audit --audit-level=high` | 16 advisories open today, 7 high. No automated tracking. | §10 |
| **🟠 P1** | Mark Stripe/Supabase service keys as "Sensitive" in Vercel | Lateral movement on a compromised Vercel team account otherwise. | §11 |
| **🟠 P1** | Add CSP header in `proxy.ts` with nonce + strict-dynamic | No CSP today; XSS damage is bounded by React's escaping alone. | §17 |
| **🟡 P2** | Build PDPA Data Subject Request (DSR) tooling | Thailand law since 2022; we collect phone, address, LINE ID, possibly NIC. | §12 |
| **🟡 P2** | Audit log table + `logAudit()` helper | Tenant accountability + breach forensics require this. Tracked in `code-design.md` §19. | §18 |

The rest of this file is the threat catalog. Each entry has the same shape: what it is, how it bites THIS app, how to prevent, how to verify, source.

---

## Table of contents

1. [File upload abuse (logo bucket)](#1-file-upload-abuse)
2. [Public scorecard route abuse](#2-public-scorecard-route-abuse)
3. [Magic-link auth attacks](#3-magic-link-auth-attacks)
4. [Open redirect on auth callback](#4-open-redirect)
5. [Stripe webhook signature verification](#5-stripe-webhook-signature)
6. [LINE webhook signature](#6-line-webhook-signature)
7. [XSS via Thai user content](#7-xss-via-thai-content)
8. [Server-action parameter tampering](#8-server-action-tampering)
9. [Supabase Auth JWT pitfalls](#9-supabase-jwt-pitfalls)
10. [Dependency / supply-chain risk](#10-dependency-supply-chain)
11. [Secrets management](#11-secrets-management)
12. [PDPA (Thailand)](#12-pdpa-thailand)
13. [DoS on auth endpoints](#13-dos-on-auth)
14. [PDF generation attack surface](#14-pdf-generation)
15. [Storage bucket misconfiguration](#15-storage-bucket)
16. [SQL injection via Supabase client](#16-sql-via-supabase)
17. [CSP / security headers](#17-csp-headers)
18. [Rate limiting](#18-rate-limiting)
19. [CSRF in server actions](#19-csrf-server-actions)
20. [Audit logging](#20-audit-logging)
21. [RLS multi-tenant correctness](#21-rls-multi-tenant)
22. [Cross-tenant automated testing](#22-cross-tenant-testing)
23. [PII in logs](#23-pii-in-logs)
24. [Things we should NOT worry about right now](#out-of-scope)

---

<a id="1-file-upload-abuse"></a>

## 1. File upload abuse (logo bucket)

- **What it is:** Attackers upload malicious content disguised as images: polyglot HTML/SVG+JS, oversized blobs, path-traversal filenames.
- **How it bites THIS app:** `lib/supabase/storage.ts` checks `file.type` (client-asserted MIME), not actual file bytes. A user can send `Content-Type: image/png` with an HTML body. The extension at `file.name.split('.').pop()` is unsanitized — accepts `../../etc/logo.png`. Migration `012_storage_logos` sets a 2 MB cap on the bucket, but app code does not pre-check size — an attacker can start a multi-GB upload that the bucket later rejects (wasting bandwidth and connections).
- **How to prevent:**
  1. Read magic bytes server-side and compare to a known list:
     ```typescript
     const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
     const isJpeg = head[0] === 0xFF && head[1] === 0xD8;
     const isPng  = head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4E && head[3] === 0x47;
     const isWebp = head[0] === 0x52 && head[1] === 0x49 && head[2] === 0x46 && head[3] === 0x46;
     const isGif  = head[0] === 0x47 && head[1] === 0x49 && head[2] === 0x46;
     if (!isJpeg && !isPng && !isWebp && !isGif) return { ok: false, error: 'Invalid image' };
     ```
  2. Sanitize the extension whitelist-style:
     ```typescript
     const ext = file.name.replace(/[^a-zA-Z0-9.]/g, '').split('.').pop()?.toLowerCase();
     if (!['jpg','jpeg','png','webp','gif'].includes(ext ?? '')) return { ok: false, error: 'Bad extension' };
     ```
  3. Enforce size in app code before upload starts: `if (file.size > 2_097_152) return …`.
  4. Serve logos through `next/image` with `remotePatterns` restricted to your Supabase storage domain — the proxy strips dangerous content types and re-encodes.
  5. Set `Content-Disposition: attachment` on the bucket if logos are ever rendered as untrusted HTML (irrelevant if served only via `next/image`).
- **How to verify:** `curl -X PUT '<storage>/nursery-logos/UUID/logo.html' -H 'Content-Type: image/png' --data '<script>alert(1)</script>'` — must be rejected before reaching storage.
- **Source:** [OWASP Unrestricted File Upload](https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload)

---

<a id="2-public-scorecard-route-abuse"></a>

## 2. Public scorecard route abuse

- **What it is:** Enumeration, scraping, or bandwidth theft against the unauthenticated `/[locale]/h/{slug}` route.
- **How it bites THIS app:** The public scorecard is in `_hypotheses/` today (Phase H2/2027). When it ships, the slug maps to a `nursery_brand` row (FLAG: table name). Sequential or dictionary-based slug guessing would reveal which nurseries exist. Logos are in a public Storage bucket and trivially hot-linkable.
- **How to prevent:**
  1. Use UUIDs or random 8-char tokens (not sequential IDs, not business names) for the public path.
  2. Add `Cache-Control: public, max-age=3600` + Vercel Edge caching to absorb scraping spikes.
  3. Serve logos via `next/image` with `remotePatterns` restricted to your Supabase storage host — this proxies and caches images and prevents direct hot-linking from third-party sites.
  4. Add `robots.txt` rules if individual scorecards should not appear in search results: `User-agent: * \n Disallow: /*/h/*`.
  5. Rate-limit the scorecard route per IP (see §18).
- **How to verify:** `for i in $(seq 1 100); do curl -s -o /dev/null -w "%{http_code} " "https://app/th/h/slug$i"; done` — guessable slugs should return 404, not 200.
- **Source:** [OWASP — Session Management Schema Testing](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/06-Session_Management_Testing/01-Testing_for_Session_Management_Schema)

---

<a id="3-magic-link-auth-attacks"></a>

## 3. Magic-link auth attacks

- **What it is:** Token replay, click-tracker interception, account takeover via stale or prefetched link.
- **How it bites THIS app:** `login/page.tsx` calls `signInWithOtp` with `emailRedirectTo: /auth/callback`. Supabase PKCE tokens are single-use by default, but if the project has implicit flow enabled (the callback handler in `app/auth/callback/page.tsx` includes an implicit-flow branch reading `access_token` from the URL fragment), an intercepted link grants a full session. Corporate email-link trackers (Outlook SafeLinks, Barracuda) prefetch URLs and consume the OTP before the human clicks.
- **How to prevent:**
  1. In Supabase Dashboard → Auth → Settings, **disable implicit grant flow**. Use PKCE only.
  2. Remove the implicit-flow handler branch from `app/auth/callback/page.tsx` once PKCE is the only path. Until then, gate it behind `process.env.ALLOW_IMPLICIT_FLOW` so prod cannot accidentally enable it.
  3. Shorten OTP expiry to 10 minutes (default is 1 hour) in Supabase Dashboard → Auth → Email.
  4. Add a "click-once" guard: the callback handler should record the magic-link token in a short-lived `auth_token_consumed` table and reject reuse server-side (Supabase does this for PKCE already; this is belt-and-braces for the implicit path during migration).
  5. Log `auth.sign_in` events to `audit_log` (once available) so anomalous patterns (same token, two IPs) are visible.
- **How to verify:** Use a magic link, then attempt to reuse the same link in a fresh browser. Should return an error.
- **Source:** [Supabase Auth — Passwordless / Email](https://supabase.com/docs/guides/auth/auth-email-passwordless)

---

<a id="4-open-redirect"></a>

## 4. Open redirect on auth callback

- **What it is:** An attacker crafts a login URL that, after authentication, redirects the victim to a phishing site styled like the original app.
- **How it bites THIS app:** `app/auth/accept-invite/route.ts` builds a redirect using `?next=...`. If `next` is not validated, an attacker can construct `?next=https://evil-clone.example/login` and the post-auth redirect will land there. `settings/team/actions.ts` passes `redirectTo` to `inviteUserByEmail` from `NEXT_PUBLIC_APP_URL` — if that env var is misconfigured (e.g. on a preview deployment), invites can be diverted.
- **How to prevent:**
  1. Validate all redirect targets stay on-origin:
     ```typescript
     const target = new URL(nextParam, request.url);
     if (target.origin !== new URL(request.url).origin) {
       throw new Error('invalid redirect');
     }
     ```
  2. In Supabase Dashboard → Auth → URL Configuration, add **only** your exact production and preview URLs to the Redirect Allow List. Wildcards are dangerous.
  3. Never construct `redirectTo` from user input. Hardcode the allowed post-login paths (a small enum).
- **How to verify:** `curl -I 'https://app/auth/callback?next=https://evil.com'` — must not produce a 302 to `evil.com`.
- **Source:** [Supabase Auth — Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)

---

<a id="5-stripe-webhook-signature"></a>

## 5. Stripe webhook signature verification

- **What it is:** Accepting forged Stripe events that modify subscription state (e.g. a fake `customer.subscription.updated` that flips a trial-expired tenant to `active`).
- **How it bites THIS app:** `app/api/webhooks/stripe/route.ts` correctly reads the raw body via `req.text()` and calls `stripe.webhooks.constructEvent(body, sig, secret)`. The implementation is sound — risk is regression. The route MUST NOT pass through any JSON-parsing middleware, and the `runtime = 'nodejs'` export is essential.
- **How to prevent:**
  1. Never add `bodyParser` or JSON middleware to this route.
  2. Keep `export const runtime = 'nodejs'`.
  3. Add an event-type allowlist at the top of the handler — silently ignoring unknown event types is safer than logging them with full payload:
     ```typescript
     const HANDLED = new Set(['customer.subscription.updated', 'customer.subscription.deleted', 'invoice.paid', 'invoice.payment_failed']);
     if (!HANDLED.has(event.type)) return new Response('ignored', { status: 200 });
     ```
  4. Verify `STRIPE_WEBHOOK_SECRET` starts with `whsec_` at startup (assert in `lib/stripe/server.ts`).
  5. Preserve the idempotency check (existing `subscription_events` table + unique constraint on `stripe_event_id`).
  6. Return HTTP 200 on duplicate-key (Postgres error `23505`), not 409 — Stripe interprets non-2xx as delivery failure and retries.
- **How to verify:** `curl -X POST /api/webhooks/stripe -H 'stripe-signature: fake' -d '{}'` — must return 400.
- **Source:** [Stripe Webhook Signatures](https://docs.stripe.com/webhooks/signatures), [Stripe Idempotent Requests](https://docs.stripe.com/api/idempotent_requests)

---

<a id="6-line-webhook-signature"></a>

## 6. LINE webhook signature

- **What it is:** Same as Stripe but for the LINE Messaging API — verifying that webhook events come from LINE, not an attacker.
- **How it bites THIS app:** LINE outbound is in scope for this repo (queue + worker via Cloud Run). Inbound webhook is the sibling `line-bot/` repo today. When this CRM adds a LINE webhook endpoint (planned for Epic G two-way chat, deferred to Phase H3), it must verify with `@line/bot-sdk` `validateSignature(body, channelSecret, signature)` using the raw body.
- **How to prevent (when implemented):**
  1. `import { validateSignature } from '@line/bot-sdk'`. Read body as `req.text()`, validate BEFORE JSON-parsing.
  2. Store `LINE_CHANNEL_SECRET` in Vercel env vars (Sensitive), never in code.
  3. Return 200 for valid signatures even if business-logic processing fails — LINE retries on non-200 and you'll exhaust your daily message quota.
  4. Reject `x-line-signature` mismatches with 401 BEFORE any logging that includes the body.
- **How to verify:** `curl -X POST /api/webhooks/line -H 'x-line-signature: bad' -d '{}'` — must return 401.
- **Source:** [LINE — Verifying signatures](https://developers.line.biz/en/docs/messaging-api/receiving-messages/#verifying-signatures)

---

<a id="7-xss-via-thai-content"></a>

## 7. XSS via Thai user content

- **What it is:** Injecting `<script>` or `onerror` via user-supplied Thai text rendered without escaping.
- **How it bites THIS app:** Risk is LOW today. The codebase has **zero uses** of `dangerouslySetInnerHTML` (confirmed by grep). React 19 JSX auto-escapes all interpolated strings. No markdown renderer is present. Thai text is multi-byte UTF-8; the escape semantics are identical to ASCII (each combining mark is its own codepoint, all rendered as text).
- **How to prevent:**
  1. Maintain the current pattern: **never introduce `dangerouslySetInnerHTML`**.
  2. Add an ESLint rule:
     ```json
     // .eslintrc.json
     "rules": {
       "react/no-danger": "error"
     }
     ```
     (Already a recommended rule in `eslint-plugin-react`; promote to `error`.)
  3. If markdown rendering is ever needed for nursery profiles, use `react-markdown` with `rehype-sanitize` and a strict allowlist schema (no `script`, `iframe`, `style`, `on*` attributes).
  4. SVG uploads (not currently allowed) are an XSS vector — keep them banned in `ALLOWED_TYPES`.
- **How to verify:** Save `<img src=x onerror=alert(1)>` as a nursery `display_name_th`. Render the page. Confirm it appears as literal text, not as an executing script.
- **Source:** [OWASP XSS](https://owasp.org/www-community/attacks/xss/), [react-markdown + rehype-sanitize](https://github.com/remarkjs/react-markdown#security)

---

<a id="8-server-action-tampering"></a>

## 8. Server-action parameter tampering

- **What it is:** Manipulating server-action arguments (FormData fields, bound args) to access another tenant's data or escalate privileges.
- **How it bites THIS app:** `settings/actions.ts:updateProfile` correctly derives `nursery_id` (FLAG: code identifier) from the authenticated session, not from the client. `settings/team/actions.ts:inviteTeamMember` accepts `role` from the client but validates against a `VALID_ROLES` allowlist. The risk is **future drift**: a new action that accepts a nursery ID as a parameter would let any tenant write to any other tenant's data.
- **How to prevent:**
  1. Hard rule: **NEVER** accept `nursery_id`, `user_id`, or `role` as a server-action argument (these are FLAG identifiers; the principle applies regardless of rename). Derive from `supabase.auth.getUser()` + `nursery_members` lookup. Pattern in `code-design.md` §5 enforces this.
  2. For Next.js 16 bound arguments via `.bind(null, nurseryId)`: even though they're AES-encrypted with a per-build key, **do not bind sensitive IDs**. Bind only display hints; re-derive authority server-side.
  3. Validate all enum inputs with a hard zod schema (`z.enum(['owner','counter_staff','lab_tech','auditor'])`).
  4. The `(input: unknown)` type on action signatures is intentional. If TypeScript ever lets you skip the `safeParse`, you've defeated the trust boundary.
- **How to verify:** Intercept a server action request via DevTools, modify `nursery_id` in the FormData, replay. The action must ignore the field and derive from session.
- **Source:** [Next.js — Data Security](https://nextjs.org/docs/app/guides/data-security)

---

<a id="9-supabase-jwt-pitfalls"></a>

## 9. Supabase Auth JWT pitfalls

- **What it is:** Trusting client-supplied JWTs without server-side verification.
- **How it bites THIS app:** `lib/auth.ts:currentNurseryScope` (FLAG: function name) and `lib/supabase/middleware.ts` both correctly call `getUser()` (which makes a server round-trip to Supabase Auth and validates the JWT). The risk is regression — a developer hot-path that uses `getSession()` for "performance" decodes the JWT locally and can be spoofed by cookie tampering.
- **How to prevent:**
  1. Rule: **NEVER** use `getSession()` for authorization decisions in server contexts. Always `getUser()`. ESLint rule (custom): forbid `getSession` outside `lib/supabase/middleware.ts` (where it's used only for cookie refresh).
  2. In RLS policies, `auth.uid()` is safe — Supabase validates the JWT at the PostgREST boundary. Don't trust `auth.jwt() ->> 'aud'` for authorization — use `auth.uid()` + membership lookups.
  3. The service-role client (`createServiceClient` in `lib/supabase/server.ts`) bypasses RLS entirely. Restrict its use to: Stripe webhook, LINE worker, cron endpoints, and the **auth-provider callback Route Handler** (`app/auth/line/callback/route.ts` — A6 LINE-login OIDC bridge; sanctioned by DECISIONS.md **D-007**). Never use it inside a user-facing server action or page. The A6 bridge additionally mints the session **server-side** (`generateLink`→`verifyOtp`, no `access_token` URL fragment) so it does not widen the §3 magic-link / §4 open-redirect surface.
- **How to verify:** Forge a JWT with a different `sub` claim and inject it as the auth cookie. Call a server action. `getUser()` should reject the request.
- **Source:** [Supabase Server-Side Auth (Next.js)](https://supabase.com/docs/guides/auth/server-side/nextjs) — see the "Important" callout about `getUser` vs `getSession`.

---

<a id="10-dependency-supply-chain"></a>

## 10. Dependency / supply-chain risk

- **What it is:** Vulnerable or malicious transitive dependencies. Sometimes the maintainer of a tiny utility package is compromised; sometimes a CVE drops on a framework.
- **How it bites THIS app:** `pnpm audit --audit-level=high` today reports **16 vulnerabilities: 7 high, 6 moderate, 3 low**. The headline:
  - **GHSA-36qx-fr4f-26g5**: Next.js middleware/proxy bypass in Pages Router applications using i18n. Vulnerable: `>=16.0.0 <16.2.5`. Patched in 16.2.5. We are on 16.0.0 with `next-intl`. **Directly exploitable.**
  - Additional `next` advisories: SSRF, DoS — all fixed in 16.2.5+.
  - `postcss` XSS, `next-intl` prototype pollution.
- **How to prevent:**
  1. **Immediately**: `pnpm up next@latest` (verify ≥16.2.5).
  2. `pnpm up next-intl@latest postcss@latest`.
  3. Enable GitHub Dependabot — add `.github/dependabot.yml`:
     ```yaml
     version: 2
     updates:
       - package-ecosystem: "npm"
         directory: "/"
         schedule: { interval: "weekly" }
         open-pull-requests-limit: 10
         labels: ["dependencies"]
     ```
  4. Add CI gate: `pnpm audit --audit-level=high` in `.github/workflows/ci.yml` as a blocking check.
  5. Pin `packageManager` (already done: `pnpm@10.0.0`). Commit the `pnpm-lock.yaml`.
  6. For high-risk dependencies (auth, payment, cron), pin exact versions instead of using `^`.
- **How to verify:** `pnpm audit --audit-level=high` exits 0 after the upgrade.
- **Source:** [GHSA-36qx-fr4f-26g5](https://github.com/advisories/GHSA-36qx-fr4f-26g5), [GitHub Dependabot docs](https://docs.github.com/en/code-security/dependabot)

---

<a id="11-secrets-management"></a>

## 11. Secrets management

- **What it is:** Leaking API keys, service-role keys, or webhook secrets via commits, logs, or client bundles.
- **How it bites THIS app:**
  - `SUPABASE_SERVICE_ROLE_KEY` bypasses ALL row-level security. If leaked, an attacker has full read/write on every tenant's data.
  - `STRIPE_SECRET_KEY` allows arbitrary charges and refunds.
  - `STRIPE_WEBHOOK_SECRET` lets an attacker forge webhook events to modify subscription state.
  - Any `NEXT_PUBLIC_*` env var is bundled into the client. If a developer accidentally prefixes a secret, it ships to every user.
- **How to prevent:**
  1. `.gitignore` includes `.env.local` and `.env*.local` (verified).
  2. In Vercel: mark `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `LINE_CHANNEL_SECRET`, `CRON_SECRET` as **Sensitive** (they become un-readable in the dashboard after creation).
  3. Never prefix server secrets with `NEXT_PUBLIC_`. The Supabase anon key is fine (public by design); nothing else.
  4. Rotate the service-role key **quarterly** at minimum. Supabase Dashboard → Settings → API → Regenerate. Plan a rotation window so callers can roll over.
  5. Add a pre-commit hook with `gitleaks`:
     ```bash
     # .git/hooks/pre-commit
     npx gitleaks detect --source=. --no-banner
     ```
  6. Document the secret inventory in a single place (e.g. `docs/operations/SECRETS.md`). Don't list values — list names, scope, rotation cadence, blast radius.
- **How to verify:** `grep -r "sk_live\|whsec_\|service_role\|eyJhbG" . --include='*.ts' --include='*.tsx' --exclude-dir=node_modules` — must return zero matches.
- **Source:** [Supabase API Keys](https://supabase.com/docs/guides/api/api-keys), [Vercel Sensitive env vars](https://vercel.com/docs/projects/environment-variables/sensitive-environment-variables)

---

<a id="12-pdpa-thailand"></a>

## 12. PDPA (Thailand Personal Data Protection Act)

- **What it is:** Thailand's data-protection law, effective since June 2022. Conceptually similar to GDPR. The Office of the Personal Data Protection Committee (PDPC) is the regulator.
- **How it bites THIS app:** We collect:
  - Email (sign-up)
  - Nursery business address (`hatcheries.location` — FLAG: table name)
  - Customer name (`customers.name` — `พี่ชาติ` etc.)
  - Customer phone (`customers.phone`)
  - LINE user ID (`customer_line_ids.line_user_id`)
  - Potentially Thai national ID for PCR certificates and invoices (TBD; not modeled today)
  - Production data per cycle (`customer_cycles` — potentially a trade secret)
  
  All of the above except nursery business name are **personal data** under PDPA Section 26. The Revenue Department of Thailand requires 7-year retention of financial records, which conflicts with the PDPA right-to-erasure for billing/invoice data.
- **How to prevent (compliance steps):**
  1. **Consent banner** at sign-up — explicit, not implied. Logged with timestamp and consent text version.
  2. **Privacy notice** linked from the sign-up page and `/settings` — what we collect, why, retention period, DPO contact.
  3. **Data Subject Request (DSR) tooling** — an authenticated endpoint that:
     - Exports a user's personal data (JSON download).
     - Deletes / anonymizes their personal data across `customers`, `nursery_members`, `team_invites`, `customer_line_ids`, `audit_log` actor columns.
     - Preserves billing/invoice rows but anonymizes the linked customer name to `redacted_<id>`.
  4. **Retention policy** — document and enforce. Default: personal data deleted on DSR. Financial records: 7 years. Audit log: 2 years for non-financial entries.
  5. **DPO (Data Protection Officer)** — name a person or external service. Required by PDPA for organizations processing large-scale personal data.
  6. **Cross-border transfer** — Supabase regions outside Thailand require explicit consent or adequacy decision. Confirm Supabase project region (likely `ap-southeast-1` Singapore) is acceptable to your DPO.
  7. Log all personal-data **access** to `audit_log` (read events too, not just writes).
- **How to verify:** Run a DSR for a test user. Confirm their phone/email/LINE ID are removed from all reads; their invoice records remain but with redacted customer names.
- **Source:** [PDPC Thailand — official PDPA](https://www.pdpc.or.th/en/pdpa), [Supabase DPA](https://supabase.com/legal/dpa)

---

<a id="13-dos-on-auth"></a>

## 13. DoS on auth endpoints

- **What it is:** Flooding the magic-link endpoint to exhaust the email send quota and lock legitimate users out.
- **How it bites THIS app:** `login/page.tsx` calls `signInWithOtp` from the client. Supabase applies a default project-wide rate limit of 30 OTP emails / hour. An attacker can burn that in seconds, denying service to every user trying to sign in for an hour.
- **How to prevent:**
  1. Supabase Dashboard → Auth → Rate Limits: set per-IP and per-email caps (e.g. 3 OTPs per email per hour, 10 per IP per hour).
  2. Client-side cooldown: after a successful OTP send, disable the button for 60 seconds.
  3. Add Cloudflare Turnstile or hCaptcha. Supabase supports CAPTCHA natively via `options: { captchaToken }` in `signInWithOtp`. Turnstile is invisible by default; Hostinger has a Turnstile API tier worth a one-time setup.
  4. On Vercel, add a Vercel WAF rule on `/[locale]/login` for IP-based bursts.
- **How to verify:** Script 10 rapid `signInWithOtp` calls for the same email. Confirm Supabase returns 429 after the per-email limit.
- **Source:** [Supabase — CAPTCHA](https://supabase.com/docs/guides/auth/auth-captcha), [Supabase — Rate Limits](https://supabase.com/docs/guides/auth/rate-limits)

---

<a id="14-pdf-generation"></a>

## 14. PDF generation attack surface

- **What it is:** If PCR certificates use a headless browser to render HTML→PDF, the renderer becomes a server-side request issuer. SSRF / arbitrary file read are possible.
- **How it bites THIS app:** No PDF generation library exists yet. Story C4 (PCR certificate) currently stubs as a toast; real cert generation is planned. Stripe-hosted invoice PDFs are linked (`inv.invoice_pdf`), not generated by us. Risk is **N/A today but real on adoption**.
- **How to prevent (when implemented):**
  1. **Prefer a template library over a headless browser** when possible. `@react-pdf/renderer` and `pdf-lib` have no SSRF surface — they render from typed templates, not HTML.
  2. If a headless browser is required (signature blocks, complex layout): run it on **Cloud Run** in a sandboxed container with **no egress to the public internet** (deny outbound except your storage bucket).
  3. Explicitly block:
     - `file://` schemes
     - GCP metadata: `169.254.169.254`
     - AWS metadata: `169.254.169.254` (same address — IMDS)
     - Private RFC1918 ranges: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`
     - Link-local: `169.254.0.0/16`
  4. Never pass user-controlled HTML to the renderer. Render from a fixed template + interpolated data fields (with HTML escaping).
- **How to verify:** With `<img src="http://169.254.169.254/computeMetadata/v1/">` in the cert template, the request must fail (not return metadata).
- **Source:** [OWASP — SSRF](https://owasp.org/www-community/attacks/Server_Side_Request_Forgery)

---

<a id="15-storage-bucket"></a>

## 15. Storage bucket misconfiguration

- **What it is:** Public buckets leaking files across tenants or exposing directory listings.
- **How it bites THIS app:** Migration `012_storage_logos` creates a public-read `nursery-logos` bucket (FLAG: bucket name). Tenant-scoped write policies are correct (each nursery writes to `{nursery_id}/logo.*` — FLAG: path uses code identifier). **The public SELECT policy has no tenant filter** — intentional (the logo IS public on the scorecard). But the bucket also exposes the LIST endpoint by default, revealing **every** nursery tenant UUID. That's a tenant inventory leak.
- **How to prevent:**
  1. Disable directory listing: Supabase Dashboard → Storage → `nursery-logos` → Settings → uncheck "Allow listing objects." Public **GET by exact URL** continues to work; LIST is denied.
  2. Serve logos exclusively via `next/image` with the **known** public URL pattern. Never expose the raw `storage/v1/object/list/` endpoint to the client.
  3. If signed URLs are ever needed for private assets (PCR certificates), set TTL to **60 seconds maximum**, regenerate on demand.
  4. Add an RLS policy on `storage.objects` to make double-sure (Supabase Storage uses RLS internally):
     ```sql
     create policy hatchery_logos_select on storage.objects
       for select using (bucket_id = 'nursery-logos');
     -- (no listing policy = no listing)
     ```
- **How to verify:** `curl 'https://<project>.supabase.co/storage/v1/object/list/nursery-logos'` — must return 403, not a list of folders.
- **Source:** [Supabase Storage — Access Control](https://supabase.com/docs/guides/storage/security/access-control)

---

<a id="16-sql-via-supabase"></a>

## 16. SQL injection via Supabase client

- **What it is:** SQL injection through Supabase's query builder when using `.rpc()`, `.or()`, or `.filter()` with user-controlled strings.
- **How it bites THIS app:** Risk is LOW today. `lib/auth/bootstrap.ts` calls `.rpc('create_nursery', { p_name: 'My Nursery' })` (FLAG: `create_nursery` is the RPC name — nursery tenant bootstrap) with hardcoded value — safe. All `.eq()`, `.select()`, `.filter()` calls in `lib/api/supabase.ts` use parameterized values from typed variables. No `.or()` with string interpolation exists. The risk is regression — a feature that does free-text search with `.or()` could introduce injection.
- **How to prevent:**
  1. Rule: **NEVER** build `.or()` or `.filter()` strings from user input.
     ```typescript
     // ❌
     .or(`name.eq.${userInput}`)
     // ✅
     .ilike('name', `%${escapePostgrestLike(userInput)}%`)   // the builder parameterizes ilike
     ```
  2. For `.rpc()`: always pass parameters as the second argument object (the codebase already does this). Never concatenate into the function name.
  3. For free-text search: use a dedicated Postgres function that takes a plain text input and runs `plainto_tsquery(input)` internally — the tsquery builder is safe against injection.
  4. ESLint custom rule: forbid template literals as arguments to `.or()` / `.filter()` / `.rpc()` first argument.
- **How to verify:** Insert `'; DROP TABLE customers; --` as a customer name via `addCustomer`. Confirm it stores as a literal string (search for the literal in the DB) and no DDL executes.
- **Source:** [Supabase — SQL parameterization](https://supabase.com/docs/guides/database/overview)

---

<a id="17-csp-headers"></a>

## 17. CSP / security headers

- **What it is:** Content-Security-Policy header limits which scripts, styles, fonts, frames, and connections the browser permits — bounding XSS damage and supply-chain compromise of third-party scripts.
- **How it bites THIS app:** No CSP today. An XSS bug (if one slipped past React's escaping) would have full reach to call attacker-controlled domains.
- **How to prevent:** Add CSP to `proxy.ts` with a per-request nonce + `strict-dynamic`:
  ```typescript
  // proxy.ts
  import { NextResponse, type NextRequest } from 'next/server';

  export function middleware(request: NextRequest) {
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
    const csp = [
      `default-src 'self'`,
      `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
      `style-src 'self' 'nonce-${nonce}'`,
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

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-nonce', nonce);

    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.headers.set('Content-Security-Policy', csp);
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    return response;
  }
  ```
  Read the nonce from the request headers in your root layout and set it on inline scripts:
  ```typescript
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  return <Script nonce={nonce} ... />;
  ```
  
  **Trade-off:** nonces force full dynamic rendering. Incompatible with PPR/`cacheComponents`. If/when that becomes worth it, switch to hash-based CSP (the experimental `sri` option in `next.config.js`).
  
  Other headers worth setting via `next.config.mjs` `headers()`:
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  - `X-Frame-Options: DENY` (Vercel sets this by default; double-check)
- **How to verify:** Browser DevTools → Network → main document response → confirm `Content-Security-Policy` header is set with a fresh nonce on every request.
- **Source:** [Next.js — Content Security Policy](https://nextjs.org/docs/app/guides/content-security-policy)

---

<a id="18-rate-limiting"></a>

## 18. Rate limiting

- **What it is:** Throttling expensive operations (auth, mutations, exports, scorecard reads) by user / IP / fingerprint.
- **How it bites THIS app:** No rate limiting today. A single bad actor can:
  - Spam OTP requests (§13)
  - Spam server actions to exhaust Supabase free-tier reads
  - Scrape the public scorecard route at speed
  - Trigger LINE quota burn by mass-sending quotes
- **How to prevent:** Two viable stacks:
  
  **Option A — Vercel WAF Rate Limiting SDK (recommended on Vercel, 2026 GA):**
  ```typescript
  // app/actions/create-quote.ts
  'use server';
  import { checkRateLimit } from '@vercel/firewall';
  import { headers } from 'next/headers';

  export async function createQuoteAction(raw: unknown) {
    const ip = (await headers()).get('x-forwarded-for') ?? 'unknown';
    const userId = /* from getUser() */;
    const { rateLimited } = await checkRateLimit('create-quote', {
      rateLimitKey: `${ip}:${userId}`,
    });
    if (rateLimited) return { ok: false, error: 'Too many requests' };
    // …rest of action
  }
  ```
  Configure the rule (`create-quote`) in Vercel Firewall dashboard. Composite keys (IP + userId) are supported.

  **Option B — Upstash Ratelimit + Vercel KV (works anywhere):**
  ```typescript
  import { Ratelimit } from '@upstash/ratelimit';
  import { Redis } from '@upstash/redis';

  const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, '1 m'),
  });
  const { success } = await ratelimit.limit(`${ip}:${userId}`);
  ```
  
  Decision tracked in `code-design.md` §19.
  
  **Suggested baseline limits** (per user, sliding 1-minute):
  - Auth OTP: 3/hour (Supabase rate-limit handles this; double-up at WAF for hot IPs)
  - Mutating server actions: 30/min
  - Exports: 1/min
  - Public scorecard: 60/min per IP
  - LINE outbound enqueue: 10/min per nursery
- **How to verify:** Script 50 rapid action invocations; confirm 429 starts being returned.
- **Source:** [Vercel WAF Rate Limiting](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting), [Vercel SDK](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting-sdk), [Upstash Ratelimit](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview)

---

<a id="19-csrf-server-actions"></a>

## 19. CSRF in server actions

- **What it is:** Cross-Site Request Forgery — an attacker tricks an authenticated user's browser into submitting a request to your app.
- **How it bites THIS app:** Largely mitigated by default. Next.js 16 server actions automatically:
  - Only accept `POST` (blocks GET-based CSRF entirely).
  - Compare `Origin` header to `Host` / `X-Forwarded-Host`; mismatch aborts the request.
  - AES-encrypt closed-over variables per build, so bound args can't be tampered.
- **How to prevent (the developer's job):**
  1. **Behind a reverse proxy** (Vercel handles this, but bare-metal deploys differ): add `serverActions.allowedOrigins` to `next.config.mjs`:
     ```ts
     module.exports = {
       experimental: {
         serverActions: { allowedOrigins: ['app.aquawise.tech', '*.aquawise.tech'] },
       },
     };
     ```
  2. **Multiple server instances** (Cloud Run replicas, multi-region): set `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` (base64, 32-byte AES key) so encryption keys are consistent across replicas. Rotate when secrets rotate.
  3. **Always re-verify auth inside the action.** Page-level auth doesn't extend to actions — they're separate POST entry points (§5 rule 1).
  4. **API routes are NOT covered by this automatic check.** Webhook routes rely on signature verification (Stripe §5, LINE §6) as their trust boundary. Cron routes use `Authorization: Bearer ${CRON_SECRET}`.
- **How to verify:** Forge a cross-origin POST to `/api/something` with a valid auth cookie. Server action endpoints should return 4xx; webhook endpoints should reject on signature.
- **Source:** [Next.js — Data Security](https://nextjs.org/docs/app/guides/data-security)

---

<a id="20-audit-logging"></a>

## 20. Audit logging

- **What it is:** An append-only record of who did what when, for forensic, compliance, and accountability purposes.
- **How it bites THIS app:** No `audit_log` table exists today. Server actions in `settings/` write changes (logo upload, profile updates, team invites) with no record of actor, target, or before-after state. A compromised account or a buggy bulk operation is invisible after the fact. PDPA accountability needs this.
- **How to prevent:** Build it. Canonical shape (also in `code-design.md` §8):
  ```sql
  create table public.audit_log (
    id            bigserial primary key,
    nursery_id   uuid        not null,
    actor_user_id uuid        not null references auth.users,
    actor_role    text        not null,
    action        text        not null,                      -- 'quote.create', 'alert.close', …
    target_type   text        not null,                      -- table name
    target_id     uuid,
    old_record    jsonb,
    new_record    jsonb,
    ip            inet,
    user_agent    text,
    created_at    timestamptz not null default now()
  );

  -- Immutability via trigger
  create or replace function public.audit_log_immutable() returns trigger language plpgsql as $$
  begin raise exception 'audit_log is append-only'; end;
  $$;
  create trigger no_modify before update or delete on public.audit_log
    for each row execute function public.audit_log_immutable();

  -- Indexes: BRIN for time (tiny, append-only) + BTREE for tenant lookups
  create index audit_log_created_at_brin on public.audit_log using brin (created_at);
  create index audit_log_hatchery_time on public.audit_log (nursery_id, created_at desc);
  create index audit_log_actor on public.audit_log (actor_user_id);

  -- RLS
  alter table public.audit_log enable row level security;
  create policy audit_log_select on public.audit_log
    for select using (nursery_id in (select public.current_user_nursery_ids()));
  -- No INSERT/UPDATE/DELETE policies for authenticated; writes go via SECURITY DEFINER function only.
  ```
  
  Helper:
  ```typescript
  // lib/audit.ts
  import 'server-only';
  import { createClient } from '@/lib/supabase/server';
  import { headers } from 'next/headers';

  export async function logAudit(entry: {
    actorUserId: string;
    actorRole: string;
    nurseryId: string;   // FLAG: parameter name — nursery tenant ID; rename pending engineering decision
    action: string;       // 'quote.create'
    targetType: string;
    targetId?: string;
    oldRecord?: unknown;
    newRecord?: unknown;
  }) {
    const supabase = await createClient();
    const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim();
    const ua = (await headers()).get('user-agent');
    await supabase.rpc('write_audit_log', {
      p_nursery_id: entry.nurseryId,
      p_actor: entry.actorUserId,
      p_role: entry.actorRole,
      p_action: entry.action,
      p_target_type: entry.targetType,
      p_target_id: entry.targetId,
      p_old: entry.oldRecord,
      p_new: entry.newRecord,
      p_ip: ip,
      p_ua: ua,
    });
  }
  ```
  
  Partition by month for storage growth. Archive partitions older than 90 days to Storage.
- **How to verify:** Run a write through the canonical action skeleton; query `select * from audit_log order by created_at desc limit 1` and confirm the row matches.
- **Source:** [Supabase — Postgres Audit](https://supabase.com/blog/postgres-audit)

---

<a id="21-rls-multi-tenant"></a>

## 21. RLS multi-tenant correctness

- **What it is:** Row-Level Security policies that prevent any tenant from reading or writing another tenant's rows.
- **How it bites THIS app:** Already implemented and is the foundation of multi-tenancy. The codebase uses `nursery_id in (select public.current_user_nursery_ids())` (FLAG: `nursery_id` and function name are code identifiers) consistently to scope every row to its nursery tenant. The risks are:
  - **Forgetting RLS on a new table** (catastrophic — cross-tenant data leak).
  - **Performance**: omitting the `(select …)` wrap causes per-row function calls.
  - **Helper function callable from PostgREST** — `public.current_user_nursery_ids()` (FLAG: function name) is reachable as an RPC. Not exploitable by itself, but a defense-in-depth concern.
- **How to prevent:**
  1. Every new tenant-scoped migration includes `alter table … enable row level security` AND policies in the same file. PR template requires it.
  2. Use the `(select …)` wrap (already enforced; see `code-design.md` §8).
  3. Move helper functions to a `private` schema:
     ```sql
     create schema if not exists private;
     create or replace function private.current_user_nursery_ids()
       returns setof uuid language sql security definer stable as $$
       select nursery_id from public.nursery_members where user_id = auth.uid();
     $$;
     -- revoke from public roles
     revoke all on schema private from public, anon, authenticated;
     -- migrate policies to call private.current_user_nursery_ids()
     ```
     Tracked in `code-design.md` §19.
  4. Run the cross-tenant test (§22) on every deploy.
- **How to verify:** §22.
- **Source:** [Supabase RLS Performance and Best Practices](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv)

---

<a id="22-cross-tenant-testing"></a>

## 22. Cross-tenant automated testing

- **What it is:** A test that confirms a user from tenant A cannot read or write any row belonging to tenant B.
- **How it bites THIS app:** No automated cross-tenant test today. Manual SQL spot-checks only.
- **How to prevent:** pgTAP via `supabase test db`. Full example in `code-design.md` §11. Run on every deploy. Treat any non-zero count as a P0 incident.
- **How to verify:** `supabase test db` exits 0.
- **Source:** [Supabase Testing Overview](https://supabase.com/docs/guides/local-development/testing/overview), [pgTAP](https://supabase.com/docs/guides/database/extensions/pgtap)

---

<a id="23-pii-in-logs"></a>

## 23. PII in logs

- **What it is:** Personal data appearing in Vercel function logs, Supabase Postgres logs, Sentry events, or third-party tracker payloads.
- **How it bites THIS app:**
  - Supabase Postgres logs (Dashboard → Logs) can capture query parameter values. Avoid logging values containing PII; rely on the query builder's parameterization.
  - `console.log` in server actions and route handlers goes to Vercel Function logs (retained 1–7 days per plan, accessible to any project member).
  - Sentry (when added) captures stack traces, breadcrumbs, request data — PII leaks through breadcrumbs by default.
- **How to prevent:**
  1. **Allow-list, not block-list, the log shape:** every log line includes only `{ action, nurseryId, targetId, durationMs, errorMessage }` (FLAG: `nurseryId` is the code identifier for the nursery tenant ID). Anything else is stripped.
  2. **Never log:**
     - `customer.phone`, `customer.name`, `customer.address`
     - `line_user_id` (it's a stable user identifier)
     - Thai national ID (if/when collected)
     - JWT contents, session tokens, Stripe card metadata
     - Full request bodies, full LINE Flex payloads, PCR PDF contents (binary anyway)
  3. **Sentry `beforeSend` PII scrub** (full example in `code-design.md` §14).
  4. **Supabase RLS protects the data at rest**, but logs are not subject to RLS — keep them clean from the start.
- **How to verify:** `grep -E 'phone|email|line_user_id|@.*\.' <log-dump>` over a day of production logs should return zero non-anonymized hits.
- **Source:** [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html), [Supabase DPA](https://supabase.com/legal/dpa)

---

<a id="out-of-scope"></a>

## 24. Things we should NOT worry about right now

Real but lower-priority for a pre-launch SaaS at this scale. Revisit when conditions change.

| Threat | Why deferred |
|---|---|
| **Subdomain takeover** | The app runs on Vercel's default domain + one custom. No dangling DNS. Revisit when adding subdomains. |
| **WebSocket / Realtime abuse** | Supabase Realtime is not used (all data fetching is REST via TanStack Query). No channels to hijack. |
| **Brute-force password attacks** | Magic links only — no passwords to brute-force. The auth-DoS vector (§13) is the relevant concern instead. |
| **Server-side template injection** | No Handlebars/EJS/Pug. All rendering is React JSX. Not applicable until/unless a template engine is introduced. |
| **Clickjacking** | Vercel sets `X-Frame-Options: DENY` by default. The app has no reason to be framed. Verify the header is set in production, then move on. |
| **DNSSEC / DANE** | Domain registry handles this. Worth verifying once at launch; not an ongoing concern. |
| **Hardware-level threats** | Out of scope for a managed-PaaS deployment. |

---

## Reporting a vulnerability

If a security issue is found:

1. **Do NOT open a public GitHub issue.**
2. Email `security@aquawise.tech` (set up before launch). Subject: `[SECURITY] short description`.
3. Include: vulnerability class, affected endpoint/file, reproduction steps, suggested severity.
4. Allow 48 hours for acknowledgement. Coordinated disclosure preferred.

Acknowledged researchers are credited in this file (with consent) once a fix ships.

---

## Document maintenance

- Update the **TL;DR** table whenever an item moves from "open" to "tracked" or "closed."
- New threats append to the relevant section or get their own numbered entry — never delete an entry, mark it `> CLOSED YYYY-MM-DD — fix shipped in <commit/PR>`.
- A vulnerability advisory affecting a dependency we use → add to §10 with the CVE/GHSA ID, expected upgrade path, and date discovered.
- When a section here cites a §N in `code-design.md`, verify the cross-reference still resolves after handbook edits.
