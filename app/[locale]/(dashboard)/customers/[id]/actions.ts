'use server';

import { isMockMode } from '@/lib/utils/mock-mode';
import { requireActiveSubscription } from '@/lib/billing/guard';
import { currentNurseryScope } from '@/lib/auth';
import { can } from '@/lib/rbac';
import { writeAuditLog } from '@/lib/audit';
import { enqueueLineEvent } from '@/lib/line/queue';
import {
  MANUAL_TEMPLATES,
  isLineTemplate,
  type LineTemplate,
} from '@/lib/line/templates';
import type { Json } from '@/lib/database.types';

export type SendLineResult =
  | { ok: true; eventId: string | null; deduped: boolean }
  | { ok: false; error: string };

/**
 * G2 — send a one-off LINE message to a single customer. Inserts ONE
 * `line_outbound_events` row (status=pending, is_manual=true → H4 quiet-hours
 * bypass). Billing-gated + RBAC (`customer:write`). The bot worker delivers.
 */
export async function sendLineEvent(input: {
  customerId: string;
  template: string;
  note?: string;
}): Promise<SendLineResult> {
  if (!isLineTemplate(input.template)) {
    return { ok: false, error: 'unknown template' };
  }
  if (!MANUAL_TEMPLATES.includes(input.template as LineTemplate)) {
    return { ok: false, error: 'template not allowed for manual send' };
  }

  if (isMockMode()) {
    // Dev click-through: no Supabase, just acknowledge.
    return { ok: true, eventId: `mock-${Date.now()}`, deduped: false };
  }

  try {
    await requireActiveSubscription();
  } catch {
    return {
      ok: false,
      error: 'PAYWALL',
    };
  }

  const scope = await currentNurseryScope();
  if (!scope) return { ok: false, error: 'unauthorized' };
  if (!can(scope.role, 'customer:write')) {
    return { ok: false, error: 'บทบาทของคุณไม่มีสิทธิ์ส่งข้อความ' };
  }

  const payload: Record<string, unknown> = {
    nursery_id: scope.nurseryId,
    customer_id: input.customerId,
  };
  if (input.template === 'custom_note') {
    payload.note = (input.note ?? '').slice(0, 300);
  } else if (input.template === 'restock_reminder') {
    // Manual restock reminder has no cycle context; synthesize a
    // minute-bucketed key so the payload validates and a double-tap within
    // the same minute dedupes (the cron path uses a real cycle_id).
    payload.cycle_id = `manual-${new Date().toISOString().slice(0, 16)}`;
  } else if (input.template === 'new_batch_announcement') {
    payload.batch_id = `manual-announce-${new Date()
      .toISOString()
      .slice(0, 16)}`;
  }

  const result = await enqueueLineEvent({
    nurseryId: scope.nurseryId,
    customerId: input.customerId,
    template: input.template as LineTemplate,
    payload,
    isManual: true,
    createdBy: scope.userId,
  });

  if (!result.ok) return { ok: false, error: result.error };

  await writeAuditLog('line.send_manual', {
    customer_id: input.customerId,
    template: input.template,
    event_id: result.eventId,
  } as Json);

  return {
    ok: true,
    eventId: result.eventId,
    deduped: result.deduped,
  };
}

/**
 * G1 — mint a one-shot LINE bind link for a customer (server action wrapper
 * around POST /api/line/bind/mint logic). Returns the LIFF URL the rep copies.
 */
export async function mintBindLink(
  customerId: string
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  if (isMockMode()) {
    return {
      ok: true,
      url: `https://liff.line.me/MOCK_LIFF/bind?token=MOCK${Date.now()}`,
    };
  }

  const scope = await currentNurseryScope();
  if (!scope) return { ok: false, error: 'unauthorized' };
  if (!can(scope.role, 'customer:write')) {
    return { ok: false, error: 'ไม่มีสิทธิ์สร้างลิงก์' };
  }

  const { ulid } = await import('@/lib/line/ulid');
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  const { data: customer } = await supabase
    .from('customers')
    .select('id, line_id')
    .eq('id', customerId)
    .maybeSingle();
  if (!customer) return { ok: false, error: 'ไม่พบลูกค้า' };
  if (customer.line_id) {
    return { ok: false, error: 'ลูกค้าเชื่อม LINE แล้ว' };
  }

  const token = ulid();
  const { error } = await supabase.from('customer_bind_tokens').insert({
    token,
    nursery_id: scope.nurseryId,
    customer_id: customerId,
    created_by: scope.userId,
    expires_at: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
  });
  if (error) return { ok: false, error: error.message };

  await writeAuditLog('customer.bind_link_minted', {
    customer_id: customerId,
  } as Json);

  const liffId = process.env.LIFF_ID ?? 'PENDING_LIFF_ID';
  return {
    ok: true,
    url: `https://liff.line.me/${liffId}/bind?token=${token}`,
  };
}

export type QuoteDecision = 'accepted' | 'declined' | 'expired';

/**
 * D2 (status machine) — rep-driven quote status transition from the CRM.
 *
 * Per the D2 story, the farmer responds through the existing phone / LINE-OA
 * channel and the rep records the outcome here: `sent → accepted | declined
 * | expired`. Owner + counter_staff (`customer:write`, Pro-gated). Sets
 * `quotes.status` + `quotes.decided_at` and writes audit_log. Idempotent: a
 * quote already in the target state is a no-op success; a quote no longer in
 * `sent` cannot be re-decided.
 */
export async function updateQuoteStatus(
  quoteId: string,
  decision: QuoteDecision
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (
    decision !== 'accepted' &&
    decision !== 'declined' &&
    decision !== 'expired'
  ) {
    return { ok: false, error: 'invalid status' };
  }

  if (isMockMode()) {
    return { ok: true };
  }

  await requireActiveSubscription();

  const scope = await currentNurseryScope();
  if (!scope) return { ok: false, error: 'unauthorized' };
  if (!can(scope.role, 'customer:write')) {
    return { ok: false, error: 'Forbidden' };
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  const { data: quote } = await supabase
    .from('quotes')
    .select('id, status')
    .eq('id', quoteId)
    .maybeSingle();
  if (!quote) return { ok: false, error: 'ไม่พบใบเสนอราคา' };
  const current = (quote as { status: string }).status;
  if (current === decision) return { ok: true }; // idempotent no-op
  if (current !== 'sent') {
    return {
      ok: false,
      error: 'ใบเสนอราคานี้ตัดสินผลแล้ว ไม่สามารถเปลี่ยนสถานะได้',
    };
  }

  const { error } = await supabase
    .from('quotes')
    .update({
      status: decision,
      decided_at: new Date().toISOString(),
    } as never)
    .eq('id', quoteId);
  if (error) return { ok: false, error: error.message };

  await writeAuditLog('quote.status_update', {
    quote_id: quoteId,
    status: decision,
  } as Json);

  return { ok: true };
}
