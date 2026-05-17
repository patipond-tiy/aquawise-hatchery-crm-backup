'use server';

import { randomBytes } from 'crypto';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { requireActiveSubscription } from '@/lib/billing/guard';
import { currentNurseryScope } from '@/lib/auth';
import { can } from '@/lib/rbac';
import { isMockMode } from '@/lib/utils/mock-mode';
import type { TeamMember } from '@/lib/types';

type NurseryRole = 'owner' | 'counter_staff' | 'lab_tech' | 'auditor';

const VALID_ROLES: NurseryRole[] = ['owner', 'counter_staff', 'lab_tech', 'auditor'];

/**
 * Thai role label + display tone for a nursery_members.role. Mirrors the
 * Settings→Team `ROLE_LABELS` map (team-tab.tsx) so the right-rail and the
 * settings list stay consistent. Voice: deferential/scientific nursery
 * register (CLAUDE.md brand-foundation gate).
 */
const ROLE_LABEL: Record<NurseryRole, { label: string; tone: TeamMember['tone'] }> = {
  owner: { label: 'เจ้าของโรงอนุบาล', tone: 'mint' },
  counter_staff: { label: 'เจ้าหน้าที่เคาน์เตอร์', tone: 'sky' },
  lab_tech: { label: 'เจ้าหน้าที่ PCR', tone: 'rose' },
  auditor: { label: 'ผู้ตรวจสอบ (ดูเท่านั้น)', tone: 'lav' },
};

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

  // Canonical server-side tenant scope (see lib/auth.ts) — do not re-inline
  // the nursery_members lookup here. Only owners may invite.
  const scope = await currentNurseryScope();
  if (!scope) return { ok: false, error: 'ไม่ได้เข้าสู่ระบบ' };
  if (!can(scope.role, 'team:invite')) {
    return { ok: false, error: 'ไม่มีสิทธิ์เชิญสมาชิก' };
  }

  const nurseryId = scope.nurseryId;
  const token = generateToken();

  const supabase = await createClient();
  const { error: insertError } = await supabase
    .from('team_invites')
    .insert({
      nursery_id: nurseryId,
      email: email.toLowerCase(),
      role: role as NurseryRole,
      token,
      created_by: scope.userId,
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

/**
 * Real team roster for the caller's nursery (replaces the former static
 * `TEAM` mock in `lib/api/supabase.ts` — MOCK-TO-PROD §3).
 *
 * `auth.users` is not reachable via PostgREST (restricted schema), so the
 * member→identity join needs the service-role admin API. Per conformance-gate
 * §3 + D-007 / SF-010, the service-role client is sanctioned here ONLY
 * because this is a server action that role-gates via `currentNurseryScope()`
 * BEFORE `createServiceClient()` is touched, and is never reachable from a
 * client component directly (the `@/lib/api` browser facade delegates to this
 * server action — server actions run on the server). The
 * `nursery_members` enumeration is explicitly scoped to the caller's own
 * `nurseryId` from the session — no cross-tenant read.
 *
 * Mock mode delegates to the in-memory layer so dev click-through is
 * unchanged. Signed-out / no-membership → empty list (the right-rail and
 * Settings→Team render their own "no members" empty state).
 */
export async function fetchTeam(): Promise<TeamMember[]> {
  if (isMockMode()) {
    const { listTeam } = await import('@/lib/mock/api');
    return listTeam();
  }

  // Role-gate FIRST (any signed-in member of the nursery may view the
  // roster — team:read is implied by customer:read which every role has).
  const scope = await currentNurseryScope();
  if (!scope || !can(scope.role, 'customer:read')) return [];

  const admin = await createServiceClient();

  const { data: members } = await admin
    .from('nursery_members')
    .select('user_id, role, created_at')
    .eq('nursery_id', scope.nurseryId)
    .order('created_at', { ascending: true });

  if (!members || members.length === 0) return [];

  const team: TeamMember[] = [];
  for (const m of members) {
    const role = (
      VALID_ROLES.includes(m.role as NurseryRole) ? m.role : 'auditor'
    ) as NurseryRole;

    let displayName = '';
    let email: string | null = null;
    try {
      const { data: u } = await admin.auth.admin.getUserById(m.user_id);
      const user = u?.user;
      const meta = (user?.user_metadata ?? {}) as Record<string, unknown>;
      const metaName =
        (typeof meta.full_name === 'string' && meta.full_name.trim()) ||
        (typeof meta.name === 'string' && meta.name.trim()) ||
        (typeof meta.display_name === 'string' && meta.display_name.trim()) ||
        '';
      email = user?.email ?? null;
      const emailLocal = email ? email.split('@')[0] : '';
      displayName = metaName || emailLocal || 'สมาชิก';
    } catch {
      // Admin lookup failed for this row — still surface the member with a
      // neutral label rather than dropping them silently.
      displayName = 'สมาชิก';
    }

    const meta = ROLE_LABEL[role];
    team.push({
      name: displayName,
      role: meta.label,
      perm: role,
      tone: meta.tone,
    });
  }

  return team;
}
