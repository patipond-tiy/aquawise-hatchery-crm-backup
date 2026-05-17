// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  generateKeyPair,
  exportPKCS8,
  exportSPKI,
  jwtVerify,
} from 'jose';

// K2 AC#11 — POST /api/v1/auth/token client-credentials refresh (contract §3).

const kp = await generateKeyPair('ES256');
process.env.CRM_JWT_PRIVATE_KEY = await exportPKCS8(kp.privateKey);
process.env.CRM_JWT_PUBLIC_KEY = await exportSPKI(kp.publicKey);
process.env.CRM_WEBHOOK_JWT_PRIVATE_KEY = process.env.CRM_JWT_PRIVATE_KEY;
process.env.LINE_BOT_CLIENT_ID = 'bot-client';
process.env.LINE_BOT_CLIENT_SECRET = 'bot-secret';

async function call(body: unknown) {
  const { NextRequest } = require('next/server');
  const r = new NextRequest('http://localhost/api/v1/auth/token', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const { POST } = await import('@/app/api/v1/auth/token/route');
  return POST(r);
}

describe('K2 token-refresh endpoint', () => {
  it('200 + a 15-min read-claim JWT for valid client creds', async () => {
    const res = await call({
      grant_type: 'client_credentials',
      client_id: 'bot-client',
      client_secret: 'bot-secret',
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.token_type).toBe('Bearer');
    expect(body.expires_in).toBe(900);
    const { payload } = await jwtVerify(body.access_token, kp.publicKey, {
      audience: 'hatchery-crm',
      issuer: 'line-bot',
    });
    expect(payload.aud).toBe('hatchery-crm');
    expect((payload.exp as number) - (payload.iat as number)).toBeLessThanOrEqual(900);
  });

  it('401 invalid_client for a bad secret', async () => {
    const res = await call({
      grant_type: 'client_credentials',
      client_id: 'bot-client',
      client_secret: 'wrong',
    });
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'invalid_client' });
  });

  it('400 for a non client_credentials grant', async () => {
    const res = await call({ grant_type: 'password' });
    expect(res.status).toBe(400);
  });
});
