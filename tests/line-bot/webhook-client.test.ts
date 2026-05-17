// @vitest-environment node
import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  generateKeyPair,
  exportPKCS8,
  exportSPKI,
  jwtVerify,
} from 'jose';

// K4 — outbound webhook client. Asserts the signed JWT is the WEBHOOK flow
// (iss=hatchery-crm, aud=line-bot-webhook, ≤300s — distinct from read-side).

const kp = await generateKeyPair('ES256');
const WEBHOOK_PUB = kp.publicKey;
process.env.CRM_WEBHOOK_JWT_PRIVATE_KEY = await exportPKCS8(kp.privateKey);
process.env.CRM_JWT_PRIVATE_KEY = process.env.CRM_WEBHOOK_JWT_PRIVATE_KEY;
process.env.CRM_JWT_PUBLIC_KEY = await exportSPKI(kp.publicKey);
process.env.LINE_BOT_BASE_URL = 'https://line-bot.example';

let captured: { url: string; headers: Record<string, string>; body: string } | null =
  null;

beforeEach(() => {
  captured = null;
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init: RequestInit) => {
      captured = {
        url,
        headers: init.headers as Record<string, string>,
        body: init.body as string,
      };
      return new Response('{}', { status: 200 });
    })
  );
});

describe('K4 webhook client', () => {
  it('POSTs to the contract path with a WEBHOOK-aud ES256 JWT', async () => {
    const { deliverBatchWarning } = await import(
      '@/lib/line-bot/webhook-client'
    );
    const payload = {
      batch_code: 'B-A4F2K7',
      severity: 'critical' as const,
      title_th: 'ตรวจพบ EHP',
      body_th: 'รายละเอียด',
      action_th: 'คำแนะนำ',
      posted_at: new Date().toISOString(),
      correlation_id: '22222222-2222-4222-8222-222222222222',
    };
    const res = await deliverBatchWarning({
      correlation_id: payload.correlation_id,
      batch_code: payload.batch_code,
      severity: 'critical',
      payload,
    });
    expect(res.ok).toBe(true);
    expect(captured!.url).toBe(
      'https://line-bot.example/api/crm-events/batch-warning'
    );

    const auth = captured!.headers.authorization as string;
    const token = auth.replace('Bearer ', '');
    const { payload: claims } = await jwtVerify(token, WEBHOOK_PUB, {
      issuer: 'hatchery-crm',
      audience: 'line-bot-webhook',
    });
    expect(claims.iss).toBe('hatchery-crm');
    expect(claims.aud).toBe('line-bot-webhook');
    expect((claims.exp as number) - (claims.iat as number)).toBeLessThanOrEqual(
      300
    );
    expect(captured!.headers['x-correlation-id']).toBe(payload.correlation_id);
  });

  it('returns ok:false when LINE_BOT_BASE_URL is unset', async () => {
    const prev = process.env.LINE_BOT_BASE_URL;
    delete process.env.LINE_BOT_BASE_URL;
    const { deliverBatchWarning } = await import(
      '@/lib/line-bot/webhook-client'
    );
    const res = await deliverBatchWarning({
      correlation_id: 'c',
      batch_code: 'B-A4F2K7',
      severity: 'info',
      payload: {} as never,
    });
    expect(res.ok).toBe(false);
    process.env.LINE_BOT_BASE_URL = prev;
  });
});
