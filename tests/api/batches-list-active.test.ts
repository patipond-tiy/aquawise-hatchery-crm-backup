// @vitest-environment node
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { generateKeyPair, exportPKCS8, exportSPKI, SignJWT } from 'jose';
import { __resetRateLimit } from '@/lib/jwt/rate-limit';

// K5 — GET /api/v1/batches?active=true. Contract §5/§8 gap 1.

const kp = await generateKeyPair('ES256');
process.env.CRM_JWT_PUBLIC_KEY = await exportSPKI(kp.publicKey);
process.env.CRM_JWT_PRIVATE_KEY = await exportPKCS8(kp.privateKey);
process.env.CRM_WEBHOOK_JWT_PRIVATE_KEY = process.env.CRM_JWT_PRIVATE_KEY;

let rows: Array<{ batch_code: string; valid_until: string }> = [];

vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: () =>
    Promise.resolve({
      from: () => ({
        select: () => ({
          not: () => ({
            gt: () => ({
              order: () => Promise.resolve({ data: rows, error: null }),
            }),
          }),
        }),
      }),
    }),
}));

async function token() {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({})
    .setProtectedHeader({ alg: 'ES256' })
    .setIssuer('line-bot')
    .setAudience('hatchery-crm')
    .setIssuedAt(now)
    .setExpirationTime(now + 600)
    .sign(kp.privateKey);
}

async function call(qs: string, headers: Record<string, string> = {}) {
  const { NextRequest } = require('next/server');
  const r = new NextRequest(`http://localhost/api/v1/batches${qs}`, { headers });
  const { GET } = await import('@/app/api/v1/batches/route');
  return GET(r);
}

describe('K5 list-active-batch-codes', () => {
  beforeEach(() => {
    __resetRateLimit();
    rows = [];
  });

  it('401 without a token', async () => {
    const res = await call('?active=true');
    expect(res.status).toBe(401);
  });

  it('400 unsupported_query when active!=true', async () => {
    const t = await token();
    const res = await call('?active=false', { authorization: `Bearer ${t}` });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'unsupported_query' });
  });

  it('400 unsupported_query when no query', async () => {
    const t = await token();
    const res = await call('', { authorization: `Bearer ${t}` });
    expect(res.status).toBe(400);
  });

  it('200 with the active codes, batch_code + valid_until only', async () => {
    rows = [
      { batch_code: 'B-AAAAAA', valid_until: '2026-06-01T00:00:00Z' },
      { batch_code: 'B-BBBBBB', valid_until: '2026-06-10T00:00:00Z' },
    ];
    const t = await token();
    const res = await call('?active=true', { authorization: `Bearer ${t}` });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.batches).toHaveLength(2);
    expect(Object.keys(body.batches[0]).sort()).toEqual([
      'batch_code',
      'valid_until',
    ]);
  });

  it('200 { batches: [] } when none active (not 404)', async () => {
    const t = await token();
    const res = await call('?active=true', { authorization: `Bearer ${t}` });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ batches: [] });
  });
});
