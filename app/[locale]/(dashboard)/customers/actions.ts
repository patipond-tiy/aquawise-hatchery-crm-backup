'use server';

import type { Customer, CustomerCallback } from '@/lib/types';
import type { Json } from '@/lib/database.types';
import type { AddCustomerInput } from '@/lib/mock/api';
import { isMockMode } from '@/lib/utils/mock-mode';
import { requireActiveSubscription } from '@/lib/billing/guard';
import { currentNurseryScope } from '@/lib/auth';
import { can } from '@/lib/rbac';
import { writeAuditLog } from '@/lib/audit';

/**
 * B2 — add a customer. Server action so the insert writes audit_log (the path
 * the client modal mutation bypassed). Mock mode delegates to the in-memory
 * layer so dev click-through keeps working. Live mode enforces the paywall,
 * RBAC (`customer:write`), scopes to the caller's tenant, persists, audits.
 */
export async function addCustomerAction(
  input: AddCustomerInput
): Promise<Customer> {
  if (isMockMode()) {
    const { addCustomer } = await import('@/lib/mock/api');
    return addCustomer(input);
  }

  await requireActiveSubscription();

  const scope = await currentNurseryScope();
  if (!scope) throw new Error('No nursery scope for current user');
  if (!can(scope.role, 'customer:write')) {
    throw new Error('บทบาทของคุณไม่มีสิทธิ์เพิ่มลูกค้า');
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('customers')
    .insert({
      nursery_id: scope.nurseryId,
      name: input.name,
      farm: input.farm,
      zone: input.zone,
      phone: input.phone ?? null,
      package_interest: input.plan ?? null,
      status: 'active',
    })
    .select('id, name, farm, farm_en, zone, status, ltv, last_buy')
    .single();
  if (error) throw new Error(error.message);

  await writeAuditLog('customer.create', {
    customer_id: data.id,
    farm: data.farm,
  } as Json);

  return {
    id: data.id,
    name: data.name,
    farm: data.farm,
    farmEn: data.farm_en ?? data.farm,
    zone: data.zone ?? '',
    batches: 0,
    ltv: data.ltv,
    lastBuy: data.last_buy ?? '',
    cycleDay: null,
    expectedHarvest: null,
    d30: null,
    d60: null,
    restockIn: null,
    status: data.status,
  };
}

/**
 * B4 — schedule a callback. Past-date guard runs server-side (defence in depth,
 * also enforced client-side). RBAC: only owner + counter_staff may insert
 * (`customer:write`). `created_by` is derived from the session, never an arg.
 */
export async function scheduleCallbackAction(input: {
  customerId: string;
  scheduledFor: string;
  channel: 'call' | 'line';
  note?: string;
}): Promise<CustomerCallback> {
  if (new Date(input.scheduledFor).getTime() <= Date.now()) {
    throw new Error('กรุณาเลือกวันที่ในอนาคต');
  }

  if (isMockMode()) {
    const { scheduleCallback } = await import('@/lib/mock/api');
    return scheduleCallback(input);
  }

  await requireActiveSubscription();

  const scope = await currentNurseryScope();
  if (!scope) throw new Error('No nursery scope for current user');
  if (!can(scope.role, 'customer:write')) {
    throw new Error('บทบาทของคุณไม่มีสิทธิ์นัดหมาย');
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('customer_callbacks')
    .insert({
      nursery_id: scope.nurseryId,
      customer_id: input.customerId,
      scheduled_for: input.scheduledFor,
      channel: input.channel,
      note: input.note ?? null,
      created_by: scope.userId,
    })
    .select('id, customer_id, scheduled_for, channel, note, completed_at, created_by')
    .single();
  if (error) throw new Error(error.message);

  await writeAuditLog('customer_callback.create', {
    callback_id: data.id,
    customer_id: input.customerId,
  } as Json);

  return {
    id: data.id,
    customerId: data.customer_id,
    scheduledFor: data.scheduled_for,
    channel: data.channel as 'call' | 'line',
    note: data.note,
    completedAt: data.completed_at,
    createdBy: data.created_by,
  };
}

/**
 * B4 — mark a callback complete. RLS enforces row-owner OR owner-role; the
 * server action also writes audit_log.
 */
export async function completeCallbackAction(
  callbackId: string
): Promise<void> {
  if (isMockMode()) {
    const { completeCallback } = await import('@/lib/mock/api');
    return completeCallback(callbackId);
  }

  await requireActiveSubscription();

  const scope = await currentNurseryScope();
  if (!scope) throw new Error('No nursery scope for current user');

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  const { error } = await supabase
    .from('customer_callbacks')
    .update({ completed_at: new Date().toISOString() })
    .eq('id', callbackId);
  if (error) throw new Error(error.message);

  await writeAuditLog('customer_callback.complete', {
    callback_id: callbackId,
  } as Json);
}
