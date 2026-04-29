'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isMockMode } from '@/lib/utils/mock-mode';

export async function signOut(): Promise<void> {
  if (isMockMode()) {
    redirect('/th/login');
  }
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/th/login');
}
