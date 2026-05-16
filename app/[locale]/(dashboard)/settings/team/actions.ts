'use server';

import { randomBytes } from 'crypto';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { requireActiveSubscription } from '@/lib/billing/guard';
import { isMockMode } from '@/lib/utils/mock-mode';

type NurseryRole = 'owner' | 'counter_staff' | 'lab_tech' | 'auditor';

const VALID_ROLES: NurseryRole[] = ['owner', 'counter_staff', 'lab_tech', 'auditor'];

function generateToken(): string {
  return randomBytes(32).toString('hex');
}

export async function inviteTeamMember(
  email: string,
  role: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (isMockMode()) {
    return { ok: false, error: 'โหมดเดโม — ยังไม่ส่งคำเชิญจริง' };
  }
  await requireActiveSubscription();

  // Validate inputs
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: 'อีเมลไม่ถูกต้อง' };
  }
  if (!VALID_ROLES.includes(role as NurseryRole)) {
    return { ok: false, error: 'สิทธิ์ไม่ถูกต้อง' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'ไม่ได้เข้าสู่ระบบ' };

  // Find the nursery where caller is owner
  const { data: membership } = await supabase
    .from('nursery_members')
    .select('nursery_id')
    .eq('user_id', user.id)
    .eq('role', 'owner')
    .limit(1)
    .single();

  if (!membership) return { ok: false, error: 'ไม่มีสิทธิ์เชิญสมาชิก' };

  const nurseryId = membership.nursery_id;
  const token = generateToken();

  const { error: insertError } = await supabase
    .from('team_invites')
    .insert({
      nursery_id: nurseryId,
      email: email.toLowerCase(),
      role: role as NurseryRole,
      token,
      created_by: user.id,
    });

  if (insertError) {
    return { ok: false, error: 'ไม่สามารถสร้างคำเชิญได้' };
  }

  // Send invite email — stub when SUPABASE_SERVICE_ROLE_KEY is unset (dev mode)
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log(`[dev] invite link: /auth/accept-invite?token=${token}`);
    return { ok: true };
  }

  try {
    const serviceClient = await createServiceClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    await (serviceClient.auth.admin as any).inviteUserByEmail(email, {
      redirectTo: `${appUrl}/auth/accept-invite?token=${token}`,
    });
  } catch {
    // Email send failed — invite row is saved, can be resent later
    console.error('[invite] email send failed — invite token saved');
  }

  return { ok: true };
}
