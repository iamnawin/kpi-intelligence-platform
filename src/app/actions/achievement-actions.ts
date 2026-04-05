'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getWorkspaceMember } from '@/lib/auth'

async function getWorkspaceId(): Promise<string | null> {
  const member = await getWorkspaceMember()
  return member?.workspaceId ?? null
}

function getOptionalText(formData: FormData, key: string): string | null {
  if (!formData.has(key)) return null

  const value = (formData.get(key) as string | null)?.trim()
  return value || null
}

export async function createAchievement(formData: FormData): Promise<void> {
  const supabase = await createServerSupabaseClient()
  const workspaceId = await getWorkspaceId()
  if (!workspaceId) throw new Error('No workspace found')

  const title = (formData.get('title') as string)?.trim()
  if (!title) throw new Error('Title is required')

  const description = getOptionalText(formData, 'description')
  const status = (formData.get('status') as string) || 'not_started'
  const progress_pct = Math.min(100, Math.max(0, Number(formData.get('progress_pct')) || 0))
  const start_date = getOptionalText(formData, 'start_date')
  const end_date = getOptionalText(formData, 'end_date')
  const goal_type = (formData.get('goal_type') as string) || 'standard'

  const payload: Record<string, unknown> = {
    workspace_id: workspaceId,
    title,
    description,
    status,
    progress_pct,
    start_date,
    end_date,
    goal_type,
  }

  // These fields are only written when the form actually sends them, which
  // keeps create/update compatible with deployments that have not applied the
  // later ProofPath schema extension yet.
  for (const key of ['outcome_summary', 'period_label', 'achievement_type']) {
    if (formData.has(key)) {
      payload[key] = getOptionalText(formData, key)
    }
  }

  const { error } = await supabase.from('goals').insert(payload)

  if (error) throw new Error(error.message)

  revalidatePath('/achievements')
  redirect('/achievements')
}

export async function updateAchievement(id: string, formData: FormData): Promise<void> {
  const supabase = await createServerSupabaseClient()

  const title = (formData.get('title') as string)?.trim()
  if (!title) throw new Error('Title is required')

  const description = getOptionalText(formData, 'description')
  const status = formData.get('status') as string
  const progress_pct = Math.min(100, Math.max(0, Number(formData.get('progress_pct')) || 0))
  const start_date = getOptionalText(formData, 'start_date')
  const end_date = getOptionalText(formData, 'end_date')
  const goal_type = (formData.get('goal_type') as string) || 'standard'

  const payload: Record<string, unknown> = {
    title,
    description,
    status,
    progress_pct,
    start_date,
    end_date,
    goal_type,
    updated_at: new Date().toISOString(),
  }

  for (const key of ['outcome_summary', 'period_label', 'achievement_type']) {
    if (formData.has(key)) {
      payload[key] = getOptionalText(formData, key)
    }
  }

  const { error } = await supabase
    .from('goals')
    .update(payload)
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/achievements')
  revalidatePath(`/achievements/${id}`)
  redirect(`/achievements/${id}`)
}
