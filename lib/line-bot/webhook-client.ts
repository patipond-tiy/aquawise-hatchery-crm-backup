// Epic K K4 — outbound batch-warning delivery client (CRM → LINE bot).
// Contract §7: POST {LINE_BOT_BASE_URL}/api/crm-events/batch-warning, signed
// with the WEBHOOK key pair (iss=hatchery-crm, aud=line-bot-webhook — MUST
// differ from the read-side aud; confused-deputy prevention). Server-only;
// never invoked from a client component.

import 'server-only';
import type { BatchWarningEvent } from '@/lib/aquawise-core/contract-types';
import { signWebhookJwt } from '@/lib/jwt/sign-line-bot-jwt';

export interface CrmEventLogRow {
  correlation_id: string;
  batch_code: string;
  severity: 'info' | 'warning' | 'critical';
  payload: BatchWarningEvent;
}

export interface DeliveryResult {
  ok: boolean;
  status: number;
  error?: string;
}

/**
 * Deliver one batch-warning event. `timeoutMs` is 3000 for the critical
 * inline path and 10000 for cron retries. Returns a structured result; the
 * caller decides delivered_at vs attempts++.
 */
export async function deliverBatchWarning(
  event: CrmEventLogRow,
  timeoutMs = 3000
): Promise<DeliveryResult> {
  const base = process.env.LINE_BOT_BASE_URL;
  if (!base) {
    return { ok: false, status: 0, error: 'LINE_BOT_BASE_URL unset' };
  }

  let token: string;
  try {
    token = await signWebhookJwt();
  } catch (e) {
    return {
      ok: false,
      status: 0,
      error: `jwt-sign-failed: ${e instanceof Error ? e.message : String(e)}`,
    };
  }

  const url = `${base.replace(/\/$/, '')}/api/crm-events/batch-warning`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json; charset=utf-8',
        authorization: `Bearer ${token}`,
        'x-correlation-id': event.correlation_id,
      },
      body: JSON.stringify(event.payload),
      signal: controller.signal,
    });
    return {
      ok: res.ok,
      status: res.status,
      error: res.ok ? undefined : `http_${res.status}`,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      ok: false,
      status: 0,
      error: controller.signal.aborted ? 'timeout' : msg,
    };
  } finally {
    clearTimeout(timer);
  }
}
