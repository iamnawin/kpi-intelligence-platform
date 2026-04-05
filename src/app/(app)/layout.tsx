import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { AppShell } from '@/components/layout/app-shell'
import { getWorkspaceMember } from '@/lib/auth'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const member = await getWorkspaceMember()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? ''

  if (!member && !pathname.startsWith('/onboarding')) {
    redirect('/onboarding')
  }

  const displayName =
    (user.user_metadata?.full_name as string | undefined) ||
    user.email?.split('@')[0] ||
    'User'

  return (
    <AppShell
      workspaceName={member?.workspaceName ?? null}
      userEmail={user.email ?? ''}
      displayName={displayName}
    >
      {children}
    </AppShell>
  )
}
