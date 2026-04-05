import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Check if the user already has a workspace
      const { data: member } = user
        ? await supabase
            .from('workspace_members')
            .select('workspace_id')
            .eq('user_id', user.id)
            .limit(1)
            .single()
        : { data: null };

      return NextResponse.redirect(
        new URL(member ? '/' : '/onboarding', origin)
      );
    }
  }

  // Auth failed — redirect to login with error hint
  return NextResponse.redirect(new URL('/login?error=auth_callback_failed', origin));
}
