import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { AppShell } from '@/components/layout/app-shell'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id, workspace:workspaces(name)')
    .limit(1)
    .single()

  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? ''

  if (!member && !pathname.startsWith('/onboarding')) {
    redirect('/onboarding')
  }

  const workspaceName = (member?.workspace as { name?: string } | null)?.name ?? null
  const displayName =
    (user.user_metadata?.full_name as string | undefined) ||
    user.email?.split('@')[0] ||
    'User'

  return (
    <AppShell
      workspaceName={workspaceName}
      userEmail={user.email ?? ''}
      displayName={displayName}
    >
      {children}
    </AppShell>
  )
}
