'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getWorkspaceMember } from '@/lib/auth'

async function getWorkspaceId(): Promise<string | null> {
  const member = await getWorkspaceMember()
  return member?.workspaceId ?? null
}

export async function createObjective(formData: FormData): Promise<void> {
  const supabase = await createServerSupabaseClient()
  const workspaceId = await getWorkspaceId()
  if (!workspaceId) throw new Error('No workspace found')

  const title = (formData.get('title') as string)?.trim()
  if (!title) throw new Error('Title is required')

  const description = (formData.get('description') as string)?.trim() || null
  const status = (formData.get('status') as string) || 'not_started'
  const period = (formData.get('period') as string)?.trim() || null
  const goal_type = (formData.get('goal_type') as string) || 'strategic'

  const { error } = await supabase.from('objectives').insert({
    workspace_id: workspaceId,
    title,
    description,
    status,
    period,
    goal_type,
  })

  if (error) throw new Error(error.message)

  revalidatePath('/objectives')
  redirect('/objectives')
}

export async function updateObjective(id: string, formData: FormData): Promise<void> {
  const supabase = await createServerSupabaseClient()

  const title = (formData.get('title') as string)?.trim()
  if (!title) throw new Error('Title is required')

  const description = (formData.get('description') as string)?.trim() || null
  const status = (formData.get('status') as string)
  const period = (formData.get('period') as string)?.trim() || null
  const goal_type = (formData.get('goal_type') as string) || 'strategic'

  const { error } = await supabase
    .from('objectives')
    .update({ title, description, status, period, goal_type })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/objectives')
  revalidatePath(`/objectives/${id}`)
  redirect(`/objectives/${id}`)
}
