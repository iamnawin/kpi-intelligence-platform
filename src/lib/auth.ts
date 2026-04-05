import 'server-only'
import { createServerSupabaseClient } from './supabase-server'

export type SessionContext = {
  userId: string
  email: string
  workspaceId: string
  role: 'admin' | 'member' | 'viewer'
  displayName: string
}

export type WorkspaceMemberContext = {
  userId: string
  memberId: string
  workspaceId: string
  role: 'admin' | 'member' | 'viewer'
  workspaceName?: string | null
}

export async function getWorkspaceMember(): Promise<WorkspaceMemberContext | null> {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: memberRow } = await supabase
    .from('workspace_members')
    .select('id, workspace_id, role, workspace:workspaces(name)')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!memberRow) return null

  return {
    userId: user.id,
    memberId: memberRow.id,
    workspaceId: memberRow.workspace_id,
    role: memberRow.role as WorkspaceMemberContext['role'],
    workspaceName: (memberRow.workspace as { name?: string } | null)?.name ?? null,
  }
}

export async function getSession(): Promise<SessionContext | null> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const member = await getWorkspaceMember()

  if (!user || !member) return null

  return {
    userId: user.id,
    email: user.email ?? '',
    workspaceId: member.workspaceId,
    role: member.role,
    displayName: (user.user_metadata?.full_name as string) || user.email?.split('@')[0] || 'User',
  }
}
