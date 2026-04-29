import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(`${origin}/th`);
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Not signed in — redirect to login with return URL
    return NextResponse.redirect(
      `${origin}/auth/login?next=/auth/accept-invite?token=${encodeURIComponent(token)}`
    );
  }

  // Look up the invite
  const now = new Date().toISOString();
  const { data: invite, error } = await supabase
    .from('team_invites')
    .select('id, hatchery_id, role, expires_at, accepted_at, email')
    .eq('token', token)
    .single();

  if (error || !invite) {
    return NextResponse.redirect(`${origin}/th?invite=invalid`);
  }

  if (invite.accepted_at) {
    return NextResponse.redirect(`${origin}/th?invite=already_used`);
  }

  if (invite.expires_at < now) {
    return NextResponse.redirect(`${origin}/th?invite=expired`);
  }

  // Insert member row — upsert in case they're already a member with a different role
  const { error: memberError } = await supabase
    .from('hatchery_members')
    .upsert(
      { hatchery_id: invite.hatchery_id, user_id: user.id, role: invite.role },
      { onConflict: 'hatchery_id,user_id' }
    );

  if (memberError) {
    return NextResponse.redirect(`${origin}/th?invite=error`);
  }

  // Mark invite as accepted
  await supabase
    .from('team_invites')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invite.id);

  return NextResponse.redirect(`${origin}/th`);
}
