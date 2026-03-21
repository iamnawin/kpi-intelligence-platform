import 'server-only'
import { createServerSupabaseClient } from './supabase-server'
import type { GoalType, GoalWithCounts, GoalStatus, TrustLevel, KRType } from './goal-data'

export type ObjectiveStatus = 'not_started' | 'in_progress' | 'at_risk' | 'completed' | 'cancelled'

export type ObjectiveWithKRs = {
  id: string
  workspace_id: string
  title: string
  description: string | null
  status: ObjectiveStatus
  period: string | null
  goal_type: GoalType
  kr_count: number
  completion_pct: number
}

export type ObjectiveDetailData = {
  objective: ObjectiveWithKRs
  keyResults: GoalWithCounts[]
}

async function getWorkspaceId(): Promise<string | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .limit(1)
    .single()
  return data?.workspace_id ?? null
}

export async function fetchWorkspaceObjectives(): Promise<ObjectiveWithKRs[]> {
  const workspaceId = await getWorkspaceId()
  if (!workspaceId) return []

  const supabase = await createServerSupabaseClient()

  const { data: objectives } = await supabase
    .from('objectives')
    .select('id, workspace_id, title, description, status, period, goal_type')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  if (!objectives || objectives.length === 0) return []

  const objectiveIds = objectives.map(o => o.id)

  const { data: krRows } = await supabase
    .from('goals')
    .select('objective_id, status, progress_pct')
    .in('objective_id', objectiveIds)

  const krMap: Record<string, { count: number; totalPct: number }> = {}
  for (const kr of krRows ?? []) {
    if (!kr.objective_id) continue
    if (!krMap[kr.objective_id]) krMap[kr.objective_id] = { count: 0, totalPct: 0 }
    krMap[kr.objective_id].count++
    krMap[kr.objective_id].totalPct += kr.progress_pct ?? 0
  }

  return objectives.map(o => {
    const krs = krMap[o.id]
    const kr_count = krs?.count ?? 0
    const completion_pct = kr_count > 0 ? Math.round(krs.totalPct / kr_count) : 0
    return {
      id: o.id,
      workspace_id: o.workspace_id,
      title: o.title,
      description: o.description,
      status: (o.status ?? 'not_started') as ObjectiveStatus,
      period: o.period ?? null,
      goal_type: (o.goal_type ?? 'strategic') as GoalType,
      kr_count,
      completion_pct,
    }
  })
}

export async function fetchObjectiveById(id: string): Promise<ObjectiveDetailData | null> {
  const supabase = await createServerSupabaseClient()

  const { data: objective } = await supabase
    .from('objectives')
    .select('id, workspace_id, title, description, status, period, goal_type')
    .eq('id', id)
    .single()

  if (!objective) return null

  const { data: krRows } = await supabase
    .from('goals')
    .select(
      'id, workspace_id, title, description, status, progress_pct, trust_level, start_date, end_date, parent_goal_id, objective_id, goal_type, kr_type, target_value, current_value, unit, owner:workspace_members!owner_id(display_name)'
    )
    .eq('objective_id', id)
    .order('created_at', { ascending: true })

  const keyResults: GoalWithCounts[] = (krRows ?? []).map(kr => ({
    id: kr.id,
    workspace_id: kr.workspace_id,
    title: kr.title,
    description: kr.description,
    status: kr.status as GoalStatus,
    progress_pct: kr.progress_pct ?? 0,
    trust_level: (kr.trust_level ?? 'draft') as TrustLevel,
    start_date: kr.start_date,
    end_date: kr.end_date,
    parent_goal_id: kr.parent_goal_id,
    objective_id: kr.objective_id ?? null,
    goal_type: (kr.goal_type ?? 'standard') as GoalType,
    kr_type: (kr.kr_type ?? null) as KRType | null,
    target_value: kr.target_value ?? null,
    current_value: kr.current_value ?? null,
    unit: kr.unit ?? null,
    owner_name: (kr.owner as unknown as { display_name: string | null } | null)?.display_name ?? null,
    kpi_count: 0,
    sub_goal_count: 0,
    task_count: 0,
    task_done_count: 0,
  }))

  const kr_count = keyResults.length
  const completion_pct = kr_count > 0
    ? Math.round(keyResults.reduce((sum, kr) => sum + kr.progress_pct, 0) / kr_count)
    : 0

  return {
    objective: {
      id: objective.id,
      workspace_id: objective.workspace_id,
      title: objective.title,
      description: objective.description,
      status: (objective.status ?? 'not_started') as ObjectiveStatus,
      period: objective.period ?? null,
      goal_type: (objective.goal_type ?? 'strategic') as GoalType,
      kr_count,
      completion_pct,
    },
    keyResults,
  }
}
