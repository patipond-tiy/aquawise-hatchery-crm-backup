// @vitest-environment node
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { generateKeyPair, exportPKCS8, exportSPKI, SignJWT } from 'jose';
import { __resetRateLimit } from '@/lib/jwt/rate-limit';

// K2 — GET /api/v1/batches/:code. Asserts the contract §5 ladder:
// 400 bad code → 401 (missing/bad/expired) → 404 unknown/unpublished
// (identical body) → 410 expired → 200 happy.

const kp = await generateKeyPair('ES256');
const PUB = await exportSPKI(kp.publicKey);
const PRIV = await exportPKCS8(kp.privateKey);
process.env.CRM_JWT_PUBLIC_KEY = PUB;
process.env.CRM_JWT_PRIVATE_KEY = PRIV;
process.env.CRM_WEBHOOK_JWT_PRIVATE_KEY = PRIV;

let batchRow: Record<string, unknown> | null = null;

vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: () =>
    Promise.resolve({
      from: (table: string) => {
        if (table === 'batches') {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: () =>
                  Promise.resolve({ data: batchRow, error: null }),
              }),
            }),
          };
        }
        if (table === 'pcr_results') {
          return {
            select: () => ({
              eq: () => Promise.resolve({ data: [], error: null }),
            }),
          };
        }
        if (table === 'batch_claims') {
          return {
            select: () => ({
              eq: () => Promise.resolve({ count: 0, error: null }),
            }),
          };
        }
        if (table === 'nurseries') {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: () =>
                  Promise.resolve({
                    data: { name: 'นอสเซอรี่ทดสอบ', line_oa_id: null, contact_phone_public: null },
                    error: null,
                  }),
              }),
            }),
          };
        }
        return { select: () => ({}) };
      },
    }),
}));

vi.mock('@/lib/supabase/storage', () => ({
  getSignedPcrCertUrl: () => Promise.resolve(null),
}));

async function token(opts?: { iss?: string; aud?: string; exp?: number }) {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({})
    .setProtectedHeader({ alg: 'ES256' })
    .setIssuer(opts?.iss ?? 'line-bot')
    .setAudience(opts?.aud ?? 'hatchery-crm')
    .setIssuedAt(now)
    .setExpirationTime(opts?.exp ?? now + 600)
    .sign(kp.privateKey);
}

function req(code: string, headers: Record<string, string> = {}) {
  const { NextRequest } = require('next/server');
  return new NextRequest(`http://localhost/api/v1/batches/${code}`, {
    headers,
  });
}

async function call(code: string, headers: Record<string, string> = {}) {
  const { GET } = await import('@/app/api/v1/batches/[code]/route');
  return GET(req(code, headers), { params: Promise.resolve({ code }) });
}

describe('K2 batch-read API', () => {
  beforeEach(() => {
    __resetRateLimit();
    batchRow = null;
  });

  it('400 invalid_code_format for a malformed code (before DB/auth)', async () => {
    const res = await call('B-0O1Il2');
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'invalid_code_format' });
  });

  it('401 when no Authorization header', async () => {
    const res = await call('B-A4F2K7');
    expect(res.status).toBe(401);
  });

  it('401 with token_expired header for an expired token', async () => {
    const now = Math.floor(Date.now() / 1000);
    const t = await token({ exp: now - 5 });
    const res = await call('B-A4F2K7', { authorization: `Bearer ${t}` });
    expect(res.status).toBe(401);
    expect(res.headers.get('www-authenticate')).toContain('token_expired');
  });

  it('401 for a webhook-audience token (confused-deputy)', async () => {
    const t = await token({ aud: 'line-bot-webhook' });
    const res = await call('B-A4F2K7', { authorization: `Bearer ${t}` });
    expect(res.status).toBe(401);
  });

  it('404 batch_not_found for unknown code', async () => {
    batchRow = null;
    const t = await token();
    const res = await call('B-A4F2K7', { authorization: `Bearer ${t}` });
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'batch_not_found' });
  });

  it('404 identical body for unpublished code (no draft leak)', async () => {
    batchRow = { id: 'B-1', nursery_id: 'n1', batch_code: 'B-A4F2K7', species: 'vannamei', source: 'CP', pcr: 'clean', valid_until: new Date(Date.now() + 1e9).toISOString(), published_at: null, first_claimed_at: null, nursery_contact_snapshot: null };
    const t = await token();
    const res = await call('B-A4F2K7', { authorization: `Bearer ${t}` });
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'batch_not_found' });
  });

  it('410 batch_expired with expired_at', async () => {
    const exp = new Date(Date.now() - 1000).toISOString();
    batchRow = { id: 'B-1', nursery_id: 'n1', batch_code: 'B-A4F2K7', species: 'vannamei', source: 'CP', pcr: 'clean', valid_until: exp, published_at: new Date().toISOString(), first_claimed_at: null, nursery_contact_snapshot: null };
    const t = await token();
    const res = await call('B-A4F2K7', { authorization: `Bearer ${t}` });
    expect(res.status).toBe(410);
    const body = await res.json();
    expect(body.error).toBe('batch_expired');
    expect(body.expired_at).toBeTruthy();
  });

  it('200 happy path returns the contract wire shape', async () => {
    batchRow = {
      id: 'B-1',
      nursery_id: 'n1',
      batch_code: 'B-A4F2K7',
      species: 'vannamei',
      source: 'CP-Genetics Line A',
      pcr: 'clean',
      valid_until: new Date(Date.now() + 1e9).toISOString(),
      published_at: new Date().toISOString(),
      first_claimed_at: null,
      nursery_contact_snapshot: { line_oa_id: '@aqx', contact_phone_public: '0812345678', nursery_name_th: 'นอสเซอรี่ทดสอบ' },
    };
    const t = await token();
    const res = await call('B-A4F2K7', { authorization: `Bearer ${t}` });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.batch_code).toBe('B-A4F2K7');
    expect(body.hatchery_id).toBe('n1');
    expect(body.species).toBe('vannamei');
    expect(body.hatchery_contact).toEqual({ line_oa_id: '@aqx', phone: '0812345678' });
    expect(body.claimed_by_other).toBe(false);
    expect(res.headers.get('x-correlation-id')).toBeTruthy();
  });

  it('echoes an inbound X-Correlation-Id', async () => {
    const t = await token();
    const res = await call('B-A4F2K7', {
      authorization: `Bearer ${t}`,
      'x-correlation-id': 'corr-123',
    });
    expect(res.headers.get('x-correlation-id')).toBe('corr-123');
  });
});
