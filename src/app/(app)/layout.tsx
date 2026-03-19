import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { AppShell } from '@/components/layout/app-shell';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .limit(1)
    .single();

  // Avoid redirect loop: only redirect to /onboarding if not already there
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') ?? '';

  if (!member && !pathname.startsWith('/onboarding')) {
    redirect('/onboarding');
  }

  return <AppShell>{children}</AppShell>;
}
