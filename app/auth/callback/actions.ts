'use server';

import { createClient } from '@/lib/supabase/server';
import { bootstrapHatchery } from '@/lib/auth/bootstrap';

export async function exchangeCodeAction(code: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return { ok: false, error: error.message };
  if (data.user) await bootstrapHatchery(data.user.id);
  return { ok: true };
}

export async function bootstrapCurrentUserAction(): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { ok: false, error: error?.message ?? 'no session' };
  await bootstrapHatchery(data.user.id);
  return { ok: true };
}
