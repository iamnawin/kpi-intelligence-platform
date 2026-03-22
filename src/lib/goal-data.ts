import 'server-only'
import { createServerSupabaseClient } from './supabase-server'

export type GoalStatus = 'not_started' | 'in_progress' | 'at_risk' | 'completed' | 'cancelled'
export type GoalType = 'standard' | 'strategic' | 'operational' | 'personal' | 'team'
export type KRType = 'metric' | 'milestone' | 'activity'
export type TrustLevel =
  | 'draft'
  | 'self_reported'
  | 'imported'
  | 'reviewer_approved'
  | 'system_verified'
  | 'locked_proof'

// Renamed from GoalWithKPICount — now includes hierarchy + owner + task counts
export type GoalWithCounts = {
  id: string
  workspace_id: string
  title: string
  description: string | null
  status: GoalStatus
  progress_pct: number
  trust_level: TrustLevel
  start_date: string | null
  end_date: string | null
  parent_goal_id: string | null
  objective_id: string | null
  goal_type: GoalType
  kr_type: KRType | null
  target_value: number | null
  current_value: number | null
  unit: string | null
  owner_name: string | null
  kpi_count: number
  sub_goal_count: number
  task_count: number
  task_done_count: number
}

// Kept for backwards compat — dashboard GoalCard uses this alias
export type GoalWithKPICount = GoalWithCounts

export type LinkedKPI = {
  id: string
  name: string
  unit: string
  category: string | null
  sparkline: number[]
  value: number
  trend: 'up' | 'down' | 'stable'
  changePercent: number
}

export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done' | 'cancelled'

export type TaskRecord = {
  id: string
  title: string
  status: TaskStatus
  assignee_name: string | null
  due_date: string | null
}

export type EvidenceType = 'note' | 'link' | 'file' | 'metric'

export type EvidenceRecord = {
  id: string
  title: string
  description: string | null
  evidence_type: EvidenceType
  source_url: string | null
  source_type: string | null    // 'manual' | 'import' | 'github' | 'jira' | 'linear' | 'asana'
  trust_level: TrustLevel
  uploader_name: string | null
  created_at: string
}

export type GoalDetailData = {
  goal: GoalWithCounts
  kpis: LinkedKPI[]
  evidence: EvidenceRecord[]
  tasks: TaskRecord[]
}

export type LockedProofRecord = {
  id: string                  // achievement_records.id
  achievementId: string       // goals.id
  title: string               // goals.title
  description: string | null
  outcomeSupport: string | null  // from snapshot_data.goal.outcome_summary
  periodLabel: string | null     // from snapshot_data.goal.period_label
  achievementType: string | null // from snapshot_data.goal.achievement_type
  evidenceCount: number          // snapshot_data.evidence.length
  approvedAt: string | null      // achievement_records.approved_at
  exportToken: string | null     // achievement_records.export_token
  isPortable: boolean            // achievement_records.is_portable
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

export async function fetchWorkspaceGoals(): Promise<GoalWithCounts[]> {
  const workspaceId = await getWorkspaceId()
  if (!workspaceId) return []

  const supabase = await createServerSupabaseClient()

  const { data: goals } = await supabase
    .from('goals')
    .select(
      'id, workspace_id, title, description, status, progress_pct, trust_level, start_date, end_date, parent_goal_id, objective_id, goal_type, kr_type, target_value, current_value, unit, owner:workspace_members!owner_id(display_name)'
    )
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  if (!goals || goals.length === 0) return []

  const goalIds = goals.map(g => g.id)

  // Batch all counts in parallel — no N+1
  const [kpiRows, subGoalRows, taskRows] = await Promise.all([
    supabase.from('kpis').select('goal_id').in('goal_id', goalIds),
    supabase.from('goals').select('parent_goal_id').in('parent_goal_id', goalIds),
    supabase.from('tasks').select('goal_id, status').in('goal_id', goalIds),
  ])

  const kpiCountMap: Record<string, number> = {}
  for (const row of kpiRows.data ?? []) {
    if (row.goal_id) kpiCountMap[row.goal_id] = (kpiCountMap[row.goal_id] ?? 0) + 1
  }

  const subGoalCountMap: Record<string, number> = {}
  for (const row of subGoalRows.data ?? []) {
    if (row.parent_goal_id) subGoalCountMap[row.parent_goal_id] = (subGoalCountMap[row.parent_goal_id] ?? 0) + 1
  }

  const taskCountMap: Record<string, { total: number; done: number }> = {}
  for (const row of taskRows.data ?? []) {
    if (row.goal_id) {
      if (!taskCountMap[row.goal_id]) taskCountMap[row.goal_id] = { total: 0, done: 0 }
      taskCountMap[row.goal_id].total++
      if (row.status === 'done') taskCountMap[row.goal_id].done++
    }
  }

  return goals.map(g => ({
    id: g.id,
    workspace_id: g.workspace_id,
    title: g.title,
    description: g.description,
    status: g.status as GoalStatus,
    progress_pct: g.progress_pct,
    trust_level: g.trust_level as TrustLevel,
    start_date: g.start_date,
    end_date: g.end_date,
    parent_goal_id: g.parent_goal_id,
    objective_id: g.objective_id ?? null,
    goal_type: (g.goal_type ?? 'standard') as GoalType,
    kr_type: (g.kr_type ?? null) as KRType | null,
    target_value: g.target_value ?? null,
    current_value: g.current_value ?? null,
    unit: g.unit ?? null,
    owner_name: (g.owner as unknown as { display_name: string | null } | null)?.display_name ?? null,
    kpi_count: kpiCountMap[g.id] ?? 0,
    sub_goal_count: subGoalCountMap[g.id] ?? 0,
    task_count: taskCountMap[g.id]?.total ?? 0,
    task_done_count: taskCountMap[g.id]?.done ?? 0,
  }))
}

function buildSparkline(
  values: { value: number | string; recorded_at: string }[]
): number[] {
  return values
    .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())
    .slice(0, 7)
    .map(v => Number(v.value))
    .reverse()
}

function calcTrend(change: number): 'up' | 'down' | 'stable' {
  if (change > 0.5) return 'up'
  if (change < -0.5) return 'down'
  return 'stable'
}

export async function fetchGoalById(id: string): Promise<GoalDetailData | null> {
  const supabase = await createServerSupabaseClient()

  const { data: goal } = await supabase
    .from('goals')
    .select('id, workspace_id, title, description, status, progress_pct, trust_level, start_date, end_date, parent_goal_id, objective_id, goal_type, kr_type, target_value, current_value, unit, owner:workspace_members!owner_id(display_name)')
    .eq('id', id)
    .single()

  if (!goal) return null

  const { data: kpis } = await supabase
    .from('kpis')
    .select('id, name, unit, category')
    .eq('goal_id', id)

  const kpiList = kpis ?? []

  const [valuesResult, evidenceResult, tasksResult] = await Promise.all([
    kpiList.length > 0
      ? supabase
          .from('kpi_values')
          .select('kpi_id, value, recorded_at')
          .in('kpi_id', kpiList.map(k => k.id))
          .order('recorded_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    supabase
      .from('evidence')
      .select('id, title, description, evidence_type, source_url, source_type, trust_level, created_at, uploader:workspace_members!uploaded_by(display_name)')
      .eq('goal_id', id)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('tasks')
      .select('id, title, status, due_date, assignee:workspace_members!assignee_id(display_name)')
      .eq('goal_id', id)
      .order('created_at', { ascending: true }),
  ])

  const linkedKpis: LinkedKPI[] = kpiList.map(kpi => {
    const vals = (valuesResult.data ?? []).filter(v => v.kpi_id === kpi.id)
    const sparkline = buildSparkline(vals)
    const current = sparkline[sparkline.length - 1] ?? 0
    const previous = sparkline[0] ?? 0
    const change = previous > 0 ? ((current - previous) / previous) * 100 : 0

    return {
      id: kpi.id,
      name: kpi.name,
      unit: kpi.unit ?? '',
      category: kpi.category,
      sparkline,
      value: current,
      trend: calcTrend(change),
      changePercent: change,
    }
  })

  const evidence: EvidenceRecord[] = (evidenceResult.data ?? []).map(e => ({
    id: e.id,
    title: e.title,
    description: e.description,
    evidence_type: e.evidence_type as EvidenceType,
    source_url: e.source_url,
    source_type: (e as any).source_type ?? 'manual',
    trust_level: e.trust_level as TrustLevel,
    uploader_name: (e.uploader as unknown as { display_name: string | null } | null)?.display_name ?? null,
    created_at: e.created_at,
  }))

  const tasks: TaskRecord[] = (tasksResult.data ?? []).map(t => ({
    id: t.id,
    title: t.title,
    status: t.status as TaskStatus,
    assignee_name: (t.assignee as unknown as { display_name: string | null } | null)?.display_name ?? null,
    due_date: t.due_date,
  }))

  return {
    goal: {
      id: goal.id,
      workspace_id: goal.workspace_id,
      title: goal.title,
      description: goal.description,
      status: goal.status as GoalStatus,
      progress_pct: goal.progress_pct,
      trust_level: goal.trust_level as TrustLevel,
      start_date: goal.start_date,
      end_date: goal.end_date,
      parent_goal_id: goal.parent_goal_id,
      objective_id: goal.objective_id ?? null,
      goal_type: (goal.goal_type ?? 'standard') as GoalType,
      kr_type: (goal.kr_type ?? null) as KRType | null,
      target_value: goal.target_value ?? null,
      current_value: goal.current_value ?? null,
      unit: goal.unit ?? null,
      owner_name: (goal.owner as unknown as { display_name: string | null } | null)?.display_name ?? null,
      kpi_count: kpiList.length,
      sub_goal_count: 0,
      task_count: 0,
      task_done_count: 0,
    },
    kpis: linkedKpis,
    evidence,
    tasks,
  }
}

export async function fetchLockedProofRecords(): Promise<LockedProofRecord[]> {
  const workspaceId = await getWorkspaceId()
  if (!workspaceId) return []

  const supabase = await createServerSupabaseClient()

  const { data: records } = await supabase
    .from('achievement_records')
    .select('id, achievement_id, snapshot_data, approved_at, export_token, is_portable, goals(title, description)')
    .eq('workspace_id', workspaceId)
    .order('approved_at', { ascending: false })

  if (!records || records.length === 0) return []

  return records.map(r => {
    const snapshot = (r.snapshot_data ?? {}) as Record<string, any>
    const snapshotGoal = snapshot.goal ?? {}
    const evidenceArr = Array.isArray(snapshot.evidence) ? snapshot.evidence : []
    const live = r.goals as unknown as { title: string; description: string | null } | null

    return {
      id: r.id,
      achievementId: r.achievement_id,
      title: live?.title ?? snapshotGoal.title ?? 'Untitled',
      description: live?.description ?? snapshotGoal.description ?? null,
      outcomeSupport: snapshotGoal.outcome_summary ?? null,
      periodLabel: snapshotGoal.period_label ?? null,
      achievementType: snapshotGoal.achievement_type ?? null,
      evidenceCount: evidenceArr.length,
      approvedAt: r.approved_at ?? null,
      exportToken: r.export_token ?? null,
      isPortable: r.is_portable ?? false,
    }
  })
}
