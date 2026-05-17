// @vitest-environment node
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { generateKeyPair, exportPKCS8, exportSPKI, SignJWT } from 'jose';
import { __resetRateLimit } from '@/lib/jwt/rate-limit';

// K3 — POST /api/v1/batches/:code/claim. Contract §6: 401 → body 400
// (named field) → RPC-driven ladder (404/410/409) → 200 ok/repeat
// idempotent. The claim_batch() RPC is mocked; the route's status mapping
// + body validation is what is asserted here.

const kp = await generateKeyPair('ES256');
process.env.CRM_JWT_PUBLIC_KEY = await exportSPKI(kp.publicKey);
process.env.CRM_JWT_PRIVATE_KEY = await exportPKCS8(kp.privateKey);
process.env.CRM_WEBHOOK_JWT_PRIVATE_KEY = process.env.CRM_JWT_PRIVATE_KEY;

let rpcResult: Record<string, unknown> = { status: 'ok', claimed_at: '2026-05-17T00:00:00Z' };
let lastRpcArgs: Record<string, unknown> = {};

vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: () =>
    Promise.resolve({
      rpc: (_name: string, args: Record<string, unknown>) => {
        lastRpcArgs = args;
        return Promise.resolve({ data: rpcResult, error: null });
      },
    }),
}));

async function token(aud = 'hatchery-crm') {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({})
    .setProtectedHeader({ alg: 'ES256' })
    .setIssuer('line-bot')
    .setAudience(aud)
    .setIssuedAt(now)
    .setExpirationTime(now + 600)
    .sign(kp.privateKey);
}

const validBody = {
  line_user_id: 'U' + 'a'.repeat(32),
  pond_id: 'p_01',
  line_profile: { display_name: 'พี่ปลา', picture_url: 'https://x/y.png' },
  correlation_id: '11111111-1111-4111-8111-111111111111',
};

async function call(code: string, body: unknown, headers: Record<string, string> = {}) {
  const { NextRequest } = require('next/server');
  const r = new NextRequest(`http://localhost/api/v1/batches/${code}/claim`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
  const { POST } = await import('@/app/api/v1/batches/[code]/claim/route');
  return POST(r, { params: Promise.resolve({ code }) });
}

describe('K3 batch-claim API', () => {
  beforeEach(() => {
    __resetRateLimit();
    rpcResult = { status: 'ok', claimed_at: '2026-05-17T00:00:00Z' };
  });

  it('401 without a token', async () => {
    const res = await call('B-A4F2K7', validBody);
    expect(res.status).toBe(401);
  });

  it('400 invalid_body naming line_user_id when malformed', async () => {
    const t = await token();
    const res = await call('B-A4F2K7', { ...validBody, line_user_id: 'bad' }, { authorization: `Bearer ${t}` });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'invalid_body', field: 'line_user_id' });
  });

  it('400 invalid_body naming correlation_id when not uuid v4', async () => {
    const t = await token();
    const res = await call('B-A4F2K7', { ...validBody, correlation_id: 'not-a-uuid' }, { authorization: `Bearer ${t}` });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'invalid_body', field: 'correlation_id' });
  });

  it('200 ok on first claim, passes iss to the RPC', async () => {
    const t = await token();
    const res = await call('B-A4F2K7', validBody, { authorization: `Bearer ${t}` });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, batch_code: 'B-A4F2K7', claimed_at: '2026-05-17T00:00:00Z' });
    expect(lastRpcArgs.p_iss).toBe('line-bot');
  });

  it('200 with original claimed_at on idempotent repeat', async () => {
    rpcResult = { status: 'repeat', claimed_at: '2026-05-01T00:00:00Z' };
    const t = await token();
    const res = await call('B-A4F2K7', validBody, { authorization: `Bearer ${t}` });
    expect(res.status).toBe(200);
    expect((await res.json()).claimed_at).toBe('2026-05-01T00:00:00Z');
  });

  it('409 claimed_by_other with no PII leak', async () => {
    rpcResult = { status: 'claimed_by_other' };
    const t = await token();
    const res = await call('B-A4F2K7', validBody, { authorization: `Bearer ${t}` });
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body).toEqual({ error: 'claimed_by_other' });
    expect(JSON.stringify(body)).not.toContain('U');
  });

  it('410 batch_expired surfaced from RPC', async () => {
    rpcResult = { status: 'batch_expired', expired_at: '2026-04-01T00:00:00Z' };
    const t = await token();
    const res = await call('B-A4F2K7', validBody, { authorization: `Bearer ${t}` });
    expect(res.status).toBe(410);
    expect((await res.json()).error).toBe('batch_expired');
  });

  it('404 batch_not_found surfaced from RPC (unpublished == unknown)', async () => {
    rpcResult = { status: 'batch_not_found' };
    const t = await token();
    const res = await call('B-A4F2K7', validBody, { authorization: `Bearer ${t}` });
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'batch_not_found' });
  });
});
