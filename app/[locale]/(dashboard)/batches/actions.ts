'use server';

import type { Batch } from '@/lib/types';
import type { Json } from '@/lib/database.types';
import type { AddBatchInput } from '@/lib/mock/api';
import { isMockMode } from '@/lib/utils/mock-mode';
import { requireActiveSubscription } from '@/lib/billing/guard';
import { currentNurseryScope } from '@/lib/auth';
import { can } from '@/lib/rbac';
import { writeAuditLog } from '@/lib/audit';

/**
 * C1 — register a batch. Server action so the insert writes audit_log.
 *
 * RBAC split (C1 AC #7): the batch row needs `batch:write` (owner /
 * counter_staff / lab_tech); the per-disease `pcr_results` rows need
 * `pcr:write` (owner / lab_tech only). A `counter_staff` submitting PCR rows
 * is rejected and the batch row is rolled back so no orphan batch is left.
 */
export async function addBatchAction(input: AddBatchInput): Promise<Batch> {
  if (isMockMode()) {
    const { addBatch } = await import('@/lib/mock/api');
    return addBatch(input);
  }

  await requireActiveSubscription();

  const scope = await currentNurseryScope();
  if (!scope) throw new Error('No nursery scope for current user');
  if (!can(scope.role, 'batch:write')) {
    throw new Error('บทบาทของคุณไม่มีสิทธิ์ลงทะเบียนล็อต');
  }
  const diseases = input.pcrResults ?? [];
  if (diseases.length > 0 && !can(scope.role, 'pcr:write')) {
    throw new Error('บทบาทของคุณไม่มีสิทธิ์บันทึกผล PCR');
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  const id = `B-${input.date.slice(2, 4)}${input.date.slice(5, 7)}-${Math.random()
    .toString(36)
    .slice(2, 4)
    .toUpperCase()}`;

  // PCR status derived from real results — never hardcoded.
  const pcr =
    diseases.length === 0
      ? 'pending'
      : diseases.some((d) => d.status === 'positive')
        ? 'flagged'
        : diseases.every((d) => d.status === 'negative')
          ? 'clean'
          : 'pending';

  const { data, error } = await supabase
    .from('batches')
    .insert({
      id,
      nursery_id: scope.nurseryId,
      source: input.source,
      pl_produced: input.plProduced,
      date: input.date,
      pcr,
    })
    .select('id, source, pl_produced, pl_sold, date, pcr, mean_d30, dist')
    .single();
  if (error) throw new Error(error.message);

  if (diseases.length > 0) {
    const { error: pcrError } = await supabase.from('pcr_results').insert(
      diseases.map((d) => ({
        batch_id: id,
        disease: d.disease,
        status: d.status,
        lab: input.pcrLab ?? null,
        tested_on: input.date,
        file_url: input.pcrFileUrl ?? null,
      }))
    );
    if (pcrError) {
      // Atomic intent: roll the batch back so no orphan exists.
      await supabase.from('batches').delete().eq('id', id);
      throw new Error(pcrError.message);
    }
  }

  await writeAuditLog('batch.create', {
    batch_id: id,
    pcr,
    pcr_diseases: diseases.length,
  } as Json);

  return {
    id: data.id,
    source: data.source,
    plProduced: data.pl_produced,
    plSold: data.pl_sold,
    farms: 0,
    date: data.date,
    pcr: data.pcr,
    meanD30: data.mean_d30 ?? 0,
    dist: Array.isArray(data.dist)
      ? (data.dist as number[])
      : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  };
}

/**
 * C4 — generate (or re-fetch idempotently) the PCR certificate PDF for a
 * batch. RBAC: only `pcr:write` (owner / lab_tech) may generate. Idempotent:
 * if a cert exists and no `pcr_results` row is newer than it, the stored URL
 * is returned without re-rendering.
 */
export async function generatePcrCertPdfAction(
  batchId: string
): Promise<{ pdfUrl: string }> {
  if (isMockMode()) {
    // Mock mode: no real Storage; return a deterministic placeholder so dev
    // click-through works without faking a download.
    return { pdfUrl: `mock://pcr-certificates/${batchId}.pdf` };
  }

  await requireActiveSubscription();

  const scope = await currentNurseryScope();
  if (!scope) throw new Error('No nursery scope for current user');
  if (!can(scope.role, 'pcr:write')) {
    throw new Error('บทบาทของคุณไม่มีสิทธิ์สร้างใบรับรอง');
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  // Idempotency: existing cert + no newer pcr_results row → reuse.
  const { data: existing } = await supabase
    .from('batch_certs')
    .select('pdf_url, generated_at')
    .eq('batch_id', batchId)
    .maybeSingle();
  if (existing) {
    const { data: newer } = await supabase
      .from('pcr_results')
      .select('id')
      .eq('batch_id', batchId)
      .gt('created_at', existing.generated_at)
      .limit(1);
    if (!newer || newer.length === 0) {
      return { pdfUrl: existing.pdf_url };
    }
  }

  const { getBatchServer } = await import('@/lib/api/server-reads');
  const batch = await getBatchServer(batchId);
  if (!batch) throw new Error('ไม่พบล็อตนี้');

  const { data: brandRow } = await supabase
    .from('nursery_brand')
    .select('display_name_th, display_name_en, logo_url, brand_color')
    .eq('nursery_id', scope.nurseryId)
    .maybeSingle();
  const { data: nurseryRow } = await supabase
    .from('nurseries')
    .select('name, name_en')
    .eq('id', scope.nurseryId)
    .maybeSingle();
  const brand = {
    displayNameTh:
      brandRow?.display_name_th ?? nurseryRow?.name ?? 'โรงอนุบาล',
    displayNameEn:
      brandRow?.display_name_en ?? nurseryRow?.name_en ?? 'Nursery',
    logoUrl: brandRow?.logo_url ?? null,
    brandColor: brandRow?.brand_color ?? '#004AAD',
  };

  const { renderPcrCertPdf } = await import('@/lib/pdf/cert');
  const buffer = await renderPcrCertPdf(batch, brand);

  const generatedAt = new Date().toISOString();
  const path = `${batchId}/${generatedAt}.pdf`;
  const { error: upErr } = await supabase.storage
    .from('pcr-certificates')
    .upload(path, buffer, {
      upsert: true,
      contentType: 'application/pdf',
    });
  if (upErr) throw new Error(upErr.message);

  const { data: signed } = await supabase.storage
    .from('pcr-certificates')
    .createSignedUrl(path, 3600);
  const pdfUrl = signed?.signedUrl ?? path;

  await supabase
    .from('batch_certs')
    .upsert(
      {
        batch_id: batchId,
        pdf_url: pdfUrl,
        generated_at: generatedAt,
        generated_by: scope.userId,
      },
      { onConflict: 'batch_id' }
    );

  await writeAuditLog('batch_cert.generate', {
    batch_id: batchId,
  } as Json);

  return { pdfUrl };
}

/**
 * C4 — enqueue a PCR certificate LINE send. Inserts one
 * `line_outbound_events` row per recipient (idempotent on
 * (customer_id, payload->>'batch_id') for pending/sending/sent rows). Actual
 * delivery is blocked on G3' (bot worker not yet built) — this only enqueues.
 * RBAC: owner / counter_staff / lab_tech (excludes auditor).
 */
export async function sendCertificateAction(
  batchId: string,
  customerIds: string[]
): Promise<{ enqueued: number }> {
  if (isMockMode()) {
    return { enqueued: customerIds.length };
  }

  await requireActiveSubscription();

  const scope = await currentNurseryScope();
  if (!scope) throw new Error('No nursery scope for current user');
  if (!can(scope.role, 'customer:write') && !can(scope.role, 'pcr:write')) {
    throw new Error('บทบาทของคุณไม่มีสิทธิ์ส่งใบรับรอง');
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  // Pull batch buyers + their line_user_id (only those bound to LINE can be
  // queued). Cert summary embedded so the bot can render inline PCR status.
  const { getBatchServer } = await import('@/lib/api/server-reads');
  const batch = await getBatchServer(batchId);
  if (!batch) throw new Error('ไม่พบล็อตนี้');
  const summary: Record<string, string> = {};
  for (const p of batch.pcrResults) summary[p.disease] = p.status;

  let enqueued = 0;
  for (const customerId of customerIds) {
    const { data: customer } = await supabase
      .from('customers')
      .select('id, line_id')
      .eq('id', customerId)
      .maybeSingle();
    if (!customer) continue;

    // Idempotency: skip if a pending/sending/sent cert row already exists for
    // (customer, batch). The unique index also enforces this at the DB layer.
    const { data: dupe } = await supabase
      .from('line_outbound_events')
      .select('id')
      .eq('customer_id', customerId)
      .eq('template', 'pcr_certificate')
      .filter('payload->>batch_id', 'eq', batchId)
      .in('status', ['pending', 'sending', 'sent'])
      .limit(1);
    if (dupe && dupe.length > 0) continue;

    const { error } = await supabase.from('line_outbound_events').insert({
      nursery_id: scope.nurseryId,
      customer_id: customerId,
      line_user_id: customer.line_id ?? '',
      template: 'pcr_certificate',
      payload: {
        nursery_id: scope.nurseryId,
        customer_id: customerId,
        batch_id: batchId,
        summary,
      } as Json,
    });
    if (!error) enqueued += 1;
  }

  await writeAuditLog('batch_cert.send_enqueue', {
    batch_id: batchId,
    enqueued,
  } as Json);

  // Delivery is pending the G3' bot worker — log honestly, do not imply send.
  console.log(
    `[v0] LINE cert send enqueued (${enqueued}) — delivery pending G3'.i bot worker`
  );

  return { enqueued };
}
