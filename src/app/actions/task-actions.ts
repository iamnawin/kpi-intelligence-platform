'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { proofPathRoutes } from '@/lib/proofpath-routes'
import { getWorkspaceMember } from '@/lib/auth'

async function getWorkspaceId(): Promise<string | null> {
  const member = await getWorkspaceMember()
  return member?.workspaceId ?? null
}

export async function createTask(goalId: string, formData: FormData): Promise<void> {
  const supabase = await createServerSupabaseClient()
  const workspaceId = await getWorkspaceId()
  if (!workspaceId) throw new Error('No workspace found')

  const title = (formData.get('title') as string)?.trim()
  if (!title) throw new Error('Task title is required')

  const due_date = (formData.get('due_date') as string) || null

  const { error } = await supabase.from('tasks').insert({
    workspace_id: workspaceId,
    goal_id: goalId,
    title,
    due_date: due_date || null,
    status: 'todo',
  })

  if (error) throw new Error(error.message)

  revalidatePath(proofPathRoutes.achievementDetail(goalId))
}
