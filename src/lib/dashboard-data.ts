import 'server-only'
import { createServerSupabaseClient } from './supabase-server'
import type { GoalWithCounts } from './goal-data'
import type { KPI } from './mock-data'
import { fetchWorkspaceKPIs } from './kpi-data'

export type DashboardView = 'personal' | 'team' | 'company'

export type DashboardData = {
  goals: GoalWithCounts[]
  kpis: KPI[]
  totalGoals: number
  completedGoals: number
  atRiskGoals: number
}

const GOAL_SELECT = `
  id, workspace_id, title, description, status, progress_pct, trust_level,
  start_date, end_date, parent_goal_id, objective_id, goal_type, kr_type,
  target_value, current_value, unit,
  owner:workspace_members!goals_owner_id_fkey(
    profile:profiles(full_name)
  ),
  kpi_count:kpis(count),
  sub_goal_count:goals!goals_parent_goal_id_fkey(count),
  task_count:tasks(count),
  task_done_count:tasks(count)
`.trim()

export async function fetchDashboardData(
  view: DashboardView,
  userId: string
): Promise<DashboardData> {
  const supabase = await createServerSupabaseClient()

  const { data: memberRow } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', userId)
    .limit(1)
    .single()

  const workspaceId = memberRow?.workspace_id
  if (!workspaceId) {
    return { goals: [], kpis: [], totalGoals: 0, completedGoals: 0, atRiskGoals: 0 }
  }

  let query = supabase
    .from('goals')
    .select(GOAL_SELECT)
    .eq('workspace_id', workspaceId)
    .is('parent_goal_id', null)
    .order('status')

  if (view === 'personal') {
    // Goals where the current user is the owner
    const { data: memberRecord } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .single()

    if (memberRecord?.id) {
      query = query.eq('owner_id', memberRecord.id)
    }
  }
  // 'team' and 'company' show all workspace goals — team filtering
  // can be scoped further once a teams table is added

  const { data: rows } = await query.limit(20)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const goals: GoalWithCounts[] = (rows ?? []).map((r: any) => ({
    id:             r['id'] as string,
    workspace_id:   r['workspace_id'] as string,
    title:          r['title'] as string,
    description:    r['description'] as string | null,
    status:         r['status'] as GoalWithCounts['status'],
    progress_pct:   r['progress_pct'] as number,
    trust_level:    r['trust_level'] as GoalWithCounts['trust_level'],
    start_date:     r['start_date'] as string | null,
    end_date:       r['end_date'] as string | null,
    parent_goal_id: r['parent_goal_id'] as string | null,
    objective_id:   r['objective_id'] as string | null,
    goal_type:      (r['goal_type'] as GoalWithCounts['goal_type']) ?? 'standard',
    kr_type:        r['kr_type'] as GoalWithCounts['kr_type'] | null,
    target_value:   r['target_value'] as number | null,
    current_value:  r['current_value'] as number | null,
    unit:           r['unit'] as string | null,
    owner_name:     (r['owner'] as { profile?: { full_name?: string } } | null)?.profile?.full_name ?? null,
    kpi_count:      (r['kpi_count'] as [{ count: number }])?.[0]?.count ?? 0,
    sub_goal_count: (r['sub_goal_count'] as [{ count: number }])?.[0]?.count ?? 0,
    task_count:     (r['task_count'] as [{ count: number }])?.[0]?.count ?? 0,
    task_done_count:(r['task_done_count'] as [{ count: number }])?.[0]?.count ?? 0,
  }))

  const kpis = await fetchWorkspaceKPIs()

  return {
    goals,
    kpis,
    totalGoals:     goals.length,
    completedGoals: goals.filter(g => g.status === 'completed').length,
    atRiskGoals:    goals.filter(g => g.status === 'at_risk').length,
  }
}
