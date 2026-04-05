'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { proofPathRoutes } from '@/lib/proofpath-routes'

async function getWorkspaceId(): Promise<string | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .limit(1)
    .single()
  return data?.workspace_id ?? null
}

export async function createGoal(formData: FormData): Promise<void> {
  const supabase = await createServerSupabaseClient()
  const workspaceId = await getWorkspaceId()
  if (!workspaceId) throw new Error('No workspace found')

  const title = (formData.get('title') as string)?.trim()
  if (!title) throw new Error('Title is required')

  const description = (formData.get('description') as string)?.trim() || null
  const status = (formData.get('status') as string) || 'not_started'
  const progress_pct = Math.min(100, Math.max(0, Number(formData.get('progress_pct')) || 0))
  const start_date = (formData.get('start_date') as string) || null
  const end_date = (formData.get('end_date') as string) || null
  const goal_type = (formData.get('goal_type') as string) || 'standard'
  const objective_id = (formData.get('objective_id') as string)?.trim() || null
  const kr_type = (formData.get('kr_type') as string) || null
  const target_value = formData.get('target_value') ? Number(formData.get('target_value')) : null
  const current_value = formData.get('current_value') ? Number(formData.get('current_value')) : null
  const unit = (formData.get('unit') as string)?.trim() || null

  const { error } = await supabase.from('goals').insert({
    workspace_id: workspaceId,
    title,
    description,
    status,
    progress_pct,
    start_date: start_date || null,
    end_date: end_date || null,
    goal_type,
    objective_id,
    kr_type,
    target_value,
    current_value,
    unit,
  })

  if (error) throw new Error(error.message)

  revalidatePath(proofPathRoutes.achievements)
  redirect(proofPathRoutes.achievements)
}

export async function updateGoal(id: string, formData: FormData): Promise<void> {
  const supabase = await createServerSupabaseClient()

  const title = (formData.get('title') as string)?.trim()
  if (!title) throw new Error('Title is required')

  const description = (formData.get('description') as string)?.trim() || null
  const status = formData.get('status') as string
  const progress_pct = Math.min(100, Math.max(0, Number(formData.get('progress_pct')) || 0))
  const start_date = (formData.get('start_date') as string) || null
  const end_date = (formData.get('end_date') as string) || null
  const goal_type = (formData.get('goal_type') as string) || 'standard'
  const objective_id = (formData.get('objective_id') as string)?.trim() || null
  const kr_type = (formData.get('kr_type') as string) || null
  const target_value = formData.get('target_value') ? Number(formData.get('target_value')) : null
  const current_value = formData.get('current_value') ? Number(formData.get('current_value')) : null
  const unit = (formData.get('unit') as string)?.trim() || null

  const { error } = await supabase
    .from('goals')
    .update({
      title,
      description,
      status,
      progress_pct,
      start_date: start_date || null,
      end_date: end_date || null,
      goal_type,
      objective_id,
      kr_type,
      target_value,
      current_value,
      unit,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath(proofPathRoutes.achievements)
  revalidatePath(proofPathRoutes.achievementDetail(id))
  redirect(proofPathRoutes.achievementDetail(id))
}
