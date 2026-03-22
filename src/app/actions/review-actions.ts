'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getSession } from '@/lib/auth'
import type { TrustLevel } from '@/lib/goal-data'

export async function approveAchievement(achievementId: string, formData: FormData): Promise<void> {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    throw new Error('Unauthorized: only admins can approve achievements')
  }

  const note = (formData.get('note') as string | null)?.trim() ?? ''
  const supabase = await createServerSupabaseClient()

  // Fetch the full achievement + evidence snapshot
  const { data: goal } = await supabase
    .from('goals')
    .select('*')
    .eq('id', achievementId)
    .single()

  if (!goal) throw new Error('Achievement not found')

  const { data: evidence } = await supabase
    .from('evidence')
    .select('*')
    .eq('goal_id', achievementId)

  // Create frozen snapshot in achievement_records
  const snapshotData = {
    goal,
    evidence: evidence ?? [],
    approvedBy: session.userId,
    approvedAt: new Date().toISOString(),
    reviewNote: note,
  }

  // Generate export token
  const exportToken = `proof_${achievementId}_${Date.now()}`

  const { error: snapshotError } = await supabase
    .from('achievement_records')
    .upsert(
      {
        achievement_id: achievementId,
        snapshot_data: snapshotData,
        export_token: exportToken,
      },
      { onConflict: 'achievement_id' }
    )

  if (snapshotError) throw new Error(snapshotError.message)

  // Elevate trust level to locked_proof
  const { error: updateError } = await supabase
    .from('goals')
    .update({ trust_level: 'locked_proof' as TrustLevel })
    .eq('id', achievementId)

  if (updateError) throw new Error(updateError.message)

  revalidatePath(`/achievements/${achievementId}`)
  revalidatePath('/achievements')
  redirect(`/achievements/${achievementId}`)
}

export async function requestChanges(achievementId: string, formData: FormData): Promise<void> {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    throw new Error('Unauthorized: only admins can request changes')
  }

  const note = (formData.get('note') as string | null)?.trim() ?? ''
  if (!note) throw new Error('A note is required when requesting changes')

  const supabase = await createServerSupabaseClient()

  // Downgrade from reviewer_approved → imported (reviewable states only)
  const { data: goal } = await supabase
    .from('goals')
    .select('trust_level')
    .eq('id', achievementId)
    .single()

  if (!goal) throw new Error('Achievement not found')

  const PROTECTED: TrustLevel[] = ['system_verified', 'locked_proof']
  if (!PROTECTED.includes(goal.trust_level as TrustLevel)) {
    // Mark as needing revision — store note in evidence as a 'note' type
    await supabase.from('evidence').insert({
      goal_id: achievementId,
      title: `Review: Changes Requested`,
      description: note,
      evidence_type: 'note',
      source_type: 'manual',
      trust_level: 'self_reported',
      uploaded_by: session.userId,
    })

    // Revert to self_reported if it was reviewer_approved
    if (goal.trust_level === 'reviewer_approved') {
      await supabase
        .from('goals')
        .update({ trust_level: 'self_reported' as TrustLevel })
        .eq('id', achievementId)
    }
  }

  revalidatePath(`/achievements/${achievementId}`)
  revalidatePath('/achievements')
  redirect(`/achievements/${achievementId}`)
}

export async function submitForReview(achievementId: string): Promise<void> {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')

  const supabase = await createServerSupabaseClient()

  // Elevate to reviewer_approved stage (pending review)
  const { data: goal } = await supabase
    .from('goals')
    .select('trust_level')
    .eq('id', achievementId)
    .single()

  if (!goal) throw new Error('Achievement not found')

  const SUBMITTABLE: TrustLevel[] = ['self_reported', 'imported']
  if (SUBMITTABLE.includes(goal.trust_level as TrustLevel)) {
    await supabase
      .from('goals')
      .update({ trust_level: 'reviewer_approved' as TrustLevel })
      .eq('id', achievementId)
  }

  revalidatePath(`/achievements/${achievementId}`)
  revalidatePath('/achievements')
  redirect(`/achievements/${achievementId}`)
}
