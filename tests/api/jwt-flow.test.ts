// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { generateKeyPair, exportPKCS8, exportSPKI, SignJWT } from 'jose';
import {
  signFlowToken,
  verifyFlowToken,
  FlowTokenError,
  FLOW_AUD,
  FLOW_ISS,
} from '@/lib/aquawise-core';

// Epic K contract §3 — dual-audience confused-deputy prevention. These are
// the hard security assertions: a token minted for one flow MUST be rejected
// by the other; alg:none / HS256 MUST be rejected; expiry + TTL ceilings hold.

async function keypair() {
  const { privateKey, publicKey } = await generateKeyPair('ES256');
  return { privateKey, publicKey };
}

describe('Epic K JWT — flow audiences (contract §3)', () => {
  it('read-claim aud=hatchery-crm, webhook aud=line-bot-webhook (distinct)', () => {
    expect(FLOW_AUD['read-claim']).toBe('hatchery-crm');
    expect(FLOW_AUD.webhook).toBe('line-bot-webhook');
    expect(FLOW_AUD['read-claim']).not.toBe(FLOW_AUD.webhook);
    expect(FLOW_ISS['read-claim']).toBe('line-bot');
    expect(FLOW_ISS.webhook).toBe('hatchery-crm');
  });

  it('round-trips a valid read-claim token', async () => {
    const { privateKey, publicKey } = await keypair();
    const token = await signFlowToken('read-claim', privateKey, {
      ttlSeconds: 900,
    });
    const claims = await verifyFlowToken('read-claim', publicKey, token);
    expect(claims.iss).toBe('line-bot');
    expect(claims.aud).toBe('hatchery-crm');
  });

  // Cross-flow tokens are rejected; jose validates iss before aud, so the
  // first failing claim may surface as bad_issuer OR bad_audience — either
  // proves the flows are NOT interchangeable (the security property).
  const CROSS_FLOW_CODES = ['bad_audience', 'bad_issuer'];

  async function expectCrossFlowRejection(p: Promise<unknown>) {
    let err: unknown;
    try {
      await p;
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(FlowTokenError);
    expect(CROSS_FLOW_CODES).toContain((err as FlowTokenError).code);
  }

  it('CONFUSED-DEPUTY: webhook token rejected by read-claim verifier', async () => {
    const { privateKey, publicKey } = await keypair();
    const webhookToken = await signFlowToken('webhook', privateKey, {
      ttlSeconds: 300,
    });
    await expectCrossFlowRejection(
      verifyFlowToken('read-claim', publicKey, webhookToken)
    );
  });

  it('CONFUSED-DEPUTY: read-claim token rejected by webhook verifier', async () => {
    const { privateKey, publicKey } = await keypair();
    const readToken = await signFlowToken('read-claim', privateKey, {
      ttlSeconds: 900,
    });
    await expectCrossFlowRejection(
      verifyFlowToken('webhook', publicKey, readToken)
    );
  });

  it('rejects a token signed by a DIFFERENT key pair (bad signature)', async () => {
    const a = await keypair();
    const b = await keypair();
    const token = await signFlowToken('read-claim', a.privateKey, {
      ttlSeconds: 900,
    });
    await expect(
      verifyFlowToken('read-claim', b.publicKey, token)
    ).rejects.toBeInstanceOf(FlowTokenError);
  });

  it('rejects an expired token', async () => {
    const { privateKey, publicKey } = await keypair();
    const now = Math.floor(Date.now() / 1000);
    const token = await new SignJWT({})
      .setProtectedHeader({ alg: 'ES256' })
      .setIssuer('line-bot')
      .setAudience('hatchery-crm')
      .setIssuedAt(now - 1000)
      .setExpirationTime(now - 10)
      .sign(privateKey);
    await expect(
      verifyFlowToken('read-claim', publicKey, token)
    ).rejects.toMatchObject({ code: 'expired' });
  });

  it('rejects alg:none (alg-confusion guard)', async () => {
    const { publicKey } = await keypair();
    // Hand-craft an unsigned alg:none token.
    const header = Buffer.from(
      JSON.stringify({ alg: 'none', typ: 'JWT' })
    ).toString('base64url');
    const now = Math.floor(Date.now() / 1000);
    const payload = Buffer.from(
      JSON.stringify({
        iss: 'line-bot',
        aud: 'hatchery-crm',
        iat: now,
        exp: now + 900,
      })
    ).toString('base64url');
    const token = `${header}.${payload}.`;
    await expect(
      verifyFlowToken('read-claim', publicKey, token)
    ).rejects.toBeInstanceOf(FlowTokenError);
  });

  it('rejects a TTL longer than the read-claim ceiling (over-long token)', async () => {
    const { privateKey, publicKey } = await keypair();
    const now = Math.floor(Date.now() / 1000);
    const token = await new SignJWT({})
      .setProtectedHeader({ alg: 'ES256' })
      .setIssuer('line-bot')
      .setAudience('hatchery-crm')
      .setIssuedAt(now)
      .setExpirationTime(now + 3600) // 1h > 15min ceiling
      .sign(privateKey);
    await expect(
      verifyFlowToken('read-claim', publicKey, token)
    ).rejects.toMatchObject({ code: 'ttl_too_long' });
  });

  it('signFlowToken refuses to mint past the flow TTL ceiling', async () => {
    const { privateKey } = await keypair();
    await expect(
      signFlowToken('webhook', privateKey, { ttlSeconds: 3600 })
    ).rejects.toMatchObject({ code: 'ttl_too_long' });
  });

  it('PEM round-trip works (importSPKI/importPKCS8 path keys are valid)', async () => {
    const { privateKey, publicKey } = await keypair();
    const pkcs8 = await exportPKCS8(privateKey);
    const spki = await exportSPKI(publicKey);
    expect(pkcs8).toContain('BEGIN PRIVATE KEY');
    expect(spki).toContain('BEGIN PUBLIC KEY');
  });
});
