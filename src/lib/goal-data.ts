import 'server-only'
import { createServerSupabaseClient } from './supabase-server'

export type GoalStatus = 'not_started' | 'in_progress' | 'at_risk' | 'completed' | 'cancelled'
export type TrustLevel =
  | 'draft'
  | 'self_reported'
  | 'imported'
  | 'reviewer_approved'
  | 'system_verified'
  | 'locked_proof'

export type GoalWithKPICount = {
  id: string
  workspace_id: string
  title: string
  description: string | null
  status: GoalStatus
  progress_pct: number
  trust_level: TrustLevel
  start_date: string | null
  end_date: string | null
  kpi_count: number
}

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

export type GoalDetailData = {
  goal: GoalWithKPICount
  kpis: LinkedKPI[]
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

export async function fetchWorkspaceGoals(): Promise<GoalWithKPICount[]> {
  const workspaceId = await getWorkspaceId()
  if (!workspaceId) return []

  const supabase = await createServerSupabaseClient()

  const { data: goals } = await supabase
    .from('goals')
    .select('id, workspace_id, title, description, status, progress_pct, trust_level, start_date, end_date')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  if (!goals || goals.length === 0) return []

  const goalIds = goals.map(g => g.id)

  const { data: kpiRows } = await supabase
    .from('kpis')
    .select('goal_id')
    .in('goal_id', goalIds)

  const kpiCountMap: Record<string, number> = {}
  for (const row of kpiRows ?? []) {
    if (row.goal_id) {
      kpiCountMap[row.goal_id] = (kpiCountMap[row.goal_id] ?? 0) + 1
    }
  }

  return goals.map(g => ({
    ...g,
    status: g.status as GoalStatus,
    trust_level: g.trust_level as TrustLevel,
    kpi_count: kpiCountMap[g.id] ?? 0,
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
    .select('id, workspace_id, title, description, status, progress_pct, trust_level, start_date, end_date')
    .eq('id', id)
    .single()

  if (!goal) return null

  const { data: kpis } = await supabase
    .from('kpis')
    .select('id, name, unit, category')
    .eq('goal_id', id)

  if (!kpis || kpis.length === 0) {
    return {
      goal: { ...goal, status: goal.status as GoalStatus, trust_level: goal.trust_level as TrustLevel, kpi_count: 0 },
      kpis: [],
    }
  }

  const kpiIds = kpis.map(k => k.id)

  const { data: allValues } = await supabase
    .from('kpi_values')
    .select('kpi_id, value, recorded_at')
    .in('kpi_id', kpiIds)
    .order('recorded_at', { ascending: false })

  const linkedKpis: LinkedKPI[] = kpis.map(kpi => {
    const vals = (allValues ?? []).filter(v => v.kpi_id === kpi.id)
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

  return {
    goal: {
      ...goal,
      status: goal.status as GoalStatus,
      trust_level: goal.trust_level as TrustLevel,
      kpi_count: kpis.length,
    },
    kpis: linkedKpis,
  }
}
