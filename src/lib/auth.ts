import 'server-only'
import { createServerSupabaseClient } from './supabase-server'

export type SessionContext = {
  userId: string
  email: string
  workspaceId: string
  role: 'admin' | 'member' | 'viewer'
  displayName: string
}

export async function getSession(): Promise<SessionContext | null> {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: memberRow } = await supabase
    .from('workspace_members')
    .select('workspace_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!memberRow) return null

  return {
    userId: user.id,
    email: user.email ?? '',
    workspaceId: memberRow.workspace_id,
    role: memberRow.role as SessionContext['role'],
    displayName: (user.user_metadata?.full_name as string) || user.email?.split('@')[0] || 'User',
  }
}
