'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getSession } from '@/lib/auth'

export async function enableExport(achievementId: string): Promise<{ exportToken: string } | { error: string }> {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  const supabase = await createServerSupabaseClient()

  // Verify achievement is locked_proof before making it portable
  const { data: goal } = await supabase
    .from('goals')
    .select('trust_level')
    .eq('id', achievementId)
    .single()

  if (!goal) return { error: 'Achievement not found' }
  if (goal.trust_level !== 'locked_proof') return { error: 'Only locked proof achievements can be exported' }

  const { data: record, error } = await supabase
    .from('achievement_records')
    .update({
      is_portable: true,
      exported_at: new Date().toISOString(),
    })
    .eq('achievement_id', achievementId)
    .select('export_token')
    .single()

  if (error || !record) return { error: error?.message ?? 'Failed to enable export' }

  revalidatePath('/profile')

  return { exportToken: record.export_token }
}

export async function disableExport(achievementId: string): Promise<void> {
  const session = await getSession()
  if (!session) return

  const supabase = await createServerSupabaseClient()

  await supabase
    .from('achievement_records')
    .update({ is_portable: false })
    .eq('achievement_id', achievementId)

  revalidatePath('/profile')
}
