'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getWorkspaceMember } from '@/lib/auth'

async function getWorkspaceId(): Promise<string | null> {
  const member = await getWorkspaceMember()
  return member?.workspaceId ?? null
}

export async function createAchievement(formData: FormData): Promise<void> {
  const supabase = await createServerSupabaseClient()
  const workspaceId = await getWorkspaceId()
  if (!workspaceId) throw new Error('No workspace found')

  const title = (formData.get('title') as string)?.trim()
  if (!title) throw new Error('Title is required')

  const description     = (formData.get('description') as string)?.trim() || null
  const outcome_summary = (formData.get('outcome_summary') as string)?.trim() || null
  const period_label    = (formData.get('period_label') as string)?.trim() || null
  const achievement_type = (formData.get('achievement_type') as string) || null
  const status          = (formData.get('status') as string) || 'not_started'
  const progress_pct    = Math.min(100, Math.max(0, Number(formData.get('progress_pct')) || 0))
  const start_date      = (formData.get('start_date') as string) || null
  const end_date        = (formData.get('end_date') as string) || null
  const goal_type       = (formData.get('goal_type') as string) || 'standard'

  const { error } = await supabase.from('goals').insert({
    workspace_id: workspaceId,
    title,
    description,
    outcome_summary,
    period_label,
    achievement_type,
    status,
    progress_pct,
    start_date: start_date || null,
    end_date:   end_date   || null,
    goal_type,
  })

  if (error) throw new Error(error.message)

  revalidatePath('/achievements')
  redirect('/achievements')
}

export async function updateAchievement(id: string, formData: FormData): Promise<void> {
  const supabase = await createServerSupabaseClient()

  const title = (formData.get('title') as string)?.trim()
  if (!title) throw new Error('Title is required')

  const description      = (formData.get('description') as string)?.trim() || null
  const outcome_summary  = (formData.get('outcome_summary') as string)?.trim() || null
  const period_label     = (formData.get('period_label') as string)?.trim() || null
  const achievement_type = (formData.get('achievement_type') as string) || null
  const status           = formData.get('status') as string
  const progress_pct     = Math.min(100, Math.max(0, Number(formData.get('progress_pct')) || 0))
  const start_date       = (formData.get('start_date') as string) || null
  const end_date         = (formData.get('end_date') as string) || null
  const goal_type        = (formData.get('goal_type') as string) || 'standard'

  const { error } = await supabase
    .from('goals')
    .update({
      title,
      description,
      outcome_summary,
      period_label,
      achievement_type,
      status,
      progress_pct,
      start_date: start_date || null,
      end_date:   end_date   || null,
      goal_type,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/achievements')
  revalidatePath(`/achievements/${id}`)
  redirect(`/achievements/${id}`)
}
