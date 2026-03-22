'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { TrustLevel } from '@/lib/goal-data'

type EvidenceRow = { source_type: string | null; trust_level: string }

function computeTrustLevel(items: EvidenceRow[]): TrustLevel {
  if (items.length === 0) return 'draft'

  const SYSTEM_SOURCES = ['github', 'jira', 'linear', 'asana']
  const systemCount = items.filter(e => SYSTEM_SOURCES.includes(e.source_type ?? '')).length
  const importCount = items.filter(e => e.source_type === 'import').length
  const total = items.length

  if (systemCount >= 2) return 'system_verified'
  if (systemCount >= 1 || importCount >= 1) return 'imported'
  if (total >= 3) return 'imported'
  return 'self_reported'
}

export async function createEvidence(achievementId: string, formData: FormData): Promise<void> {
  const supabase = await createServerSupabaseClient()

  const { data: memberRow } = await supabase
    .from('workspace_members')
    .select('id, workspace_id')
    .limit(1)
    .single()

  if (!memberRow) throw new Error('Not authenticated')

  const title         = (formData.get('title') as string)?.trim()
  const evidence_type = (formData.get('evidence_type') as string) || 'note'
  const description   = (formData.get('description') as string)?.trim() || null
  const source_url    = (formData.get('source_url') as string)?.trim() || null
  const source_type   = (formData.get('source_type') as string) || 'manual'

  if (!title) throw new Error('Title is required')

  const { error } = await supabase.from('evidence').insert({
    workspace_id:  memberRow.workspace_id,
    goal_id:       achievementId,
    title,
    evidence_type,
    description,
    source_url,
    source_type,
    uploaded_by:   memberRow.id,
    trust_level:   source_type === 'manual' ? 'self_reported' : 'imported',
  })

  if (error) throw new Error(error.message)

  // Recompute trust level for the achievement
  await recomputeAchievementTrust(achievementId)

  revalidatePath(`/achievements/${achievementId}`)
}

export async function deleteEvidence(evidenceId: string, achievementId: string): Promise<void> {
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase
    .from('evidence')
    .delete()
    .eq('id', evidenceId)

  if (error) throw new Error(error.message)

  await recomputeAchievementTrust(achievementId)

  revalidatePath(`/achievements/${achievementId}`)
}

async function recomputeAchievementTrust(achievementId: string): Promise<void> {
  const supabase = await createServerSupabaseClient()

  const { data: items } = await supabase
    .from('evidence')
    .select('source_type, trust_level')
    .eq('goal_id', achievementId)

  const newLevel = computeTrustLevel(items ?? [])

  // Only auto-upgrade trust level — never downgrade reviewer_approved or higher
  const { data: current } = await supabase
    .from('goals')
    .select('trust_level')
    .eq('id', achievementId)
    .single()

  const PROTECTED: TrustLevel[] = ['reviewer_approved', 'system_verified', 'locked_proof']
  if (current && PROTECTED.includes(current.trust_level as TrustLevel)) return

  await supabase
    .from('goals')
    .update({ trust_level: newLevel, updated_at: new Date().toISOString() })
    .eq('id', achievementId)
}
