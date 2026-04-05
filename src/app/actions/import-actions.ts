'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { ImportRow } from '@/lib/import-parser'
import { proofPathRoutes } from '@/lib/proofpath-routes'

export type ImportResult = {
  inserted: number
  errors: string[]
}

export async function importGoals(rows: ImportRow[]): Promise<ImportResult> {
  const supabase = await createServerSupabaseClient()

  const { data: memberRow } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .limit(1)
    .single()

  const workspaceId = memberRow?.workspace_id
  if (!workspaceId) return { inserted: 0, errors: ['No workspace found'] }

  const capped = rows.slice(0, 100)
  const errors: string[] = []
  let inserted = 0

  const records = capped.map((row, i) => ({
    workspace_id: workspaceId,
    title: row.title.trim(),
    description: row.description?.trim() || null,
    status: row.status || 'not_started',
    goal_type: row.goal_type || 'standard',
    progress_pct: Math.min(100, Math.max(0, Number(row.progress_pct) || 0)),
    start_date: row.start_date || null,
    end_date: row.end_date || null,
  }))

  const { error, data } = await supabase
    .from('goals')
    .insert(records)
    .select('id')

  if (error) {
    errors.push(error.message)
  } else {
    inserted = data?.length ?? 0
  }

  if (inserted > 0) {
    revalidatePath(proofPathRoutes.achievements)
  }

  return { inserted, errors }
}
