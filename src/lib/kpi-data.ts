import 'server-only'
import { createServerSupabaseClient } from './supabase-server'
import { mockKPIs, type KPI, type KPICategory, type KPITrend } from './mock-data'
import type { EngineResult } from './api'
import { getWorkspaceMember } from './auth'

const ENGINE_URL = process.env.KPI_API_URL ?? 'http://localhost:3001'

async function getWorkspaceId(): Promise<string | null> {
  const member = await getWorkspaceMember()
  return member?.workspaceId ?? null
}

async function runEngineEval(params: {
  kpiName: string
  currentValue: number
  previousValue: number
  threshold: number
  workspaceId: string
  kpiId: string
  category: string
}): Promise<EngineResult | null> {
  try {
    const res = await fetch(`${ENGINE_URL}/api/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kpi: params.kpiName,
        current_value: params.currentValue,
        previous_value: params.previousValue,
        threshold: params.threshold,
        workspace_id: params.workspaceId,
        kpi_id: params.kpiId,
        context: { region: 'Global', team: params.category },
      }),
      cache: 'no-store',
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

function buildSparkline(
  allValues: { kpi_id: string; value: number; recorded_at: string }[],
  kpiId: string
): number[] {
  return allValues
    .filter(v => v.kpi_id === kpiId)
    .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())
    .slice(0, 7)
    .map(v => Number(v.value))
    .reverse()
}

function calcTrend(change: number): KPITrend {
  if (change > 0.5) return 'up'
  if (change < -0.5) return 'down'
  return 'stable'
}

export type KPIWithEngine = KPI & { engineResult: EngineResult | null }

export async function fetchWorkspaceKPIs(): Promise<KPIWithEngine[]> {
  const workspaceId = await getWorkspaceId()
  if (!workspaceId) return mockKPIs.map(k => ({ ...k, engineResult: null }))

  const supabase = await createServerSupabaseClient()

  const { data: kpis } = await supabase
    .from('kpis')
    .select('id, name, unit, category, threshold')
    .eq('workspace_id', workspaceId)

  if (!kpis || kpis.length === 0) {
    return mockKPIs.map(k => ({ ...k, engineResult: null }))
  }

  const kpiIds = kpis.map(k => k.id)

  const { data: allValues } = await supabase
    .from('kpi_values')
    .select('kpi_id, value, recorded_at')
    .in('kpi_id', kpiIds)
    .order('recorded_at', { ascending: false })

  return Promise.all(
    kpis.map(async kpi => {
      const sparkline = buildSparkline(allValues ?? [], kpi.id)
      const current = sparkline[sparkline.length - 1] ?? 0
      const previous = sparkline[0] ?? 0

      let engineResult: EngineResult | null = null
      if (sparkline.length >= 2) {
        engineResult = await runEngineEval({
          kpiName: kpi.name,
          currentValue: current,
          previousValue: previous,
          threshold: Number(kpi.threshold ?? 10),
          workspaceId,
          kpiId: kpi.id,
          category: kpi.category ?? 'operations',
        })
      }

      const change = engineResult?.metrics?.percentageChange ?? 0

      return {
        id: kpi.id,
        name: kpi.name,
        unit: kpi.unit ?? '',
        category: (kpi.category ?? 'operations') as KPICategory,
        value: current,
        sparkline,
        trend: calcTrend(change),
        changePercent: change,
        engineResult,
      }
    })
  )
}

export type KPIDetailData = {
  kpi: {
    id: string
    name: string
    unit: string
    category: string
    threshold: number | null
    workspace_id: string
  }
  sparkline: number[]
  latestInsight: {
    content: string
    confidence: number
    created_at: string
  } | null
}

export async function fetchKPIById(id: string): Promise<KPIDetailData | null> {
  const supabase = await createServerSupabaseClient()

  const { data: kpi } = await supabase
    .from('kpis')
    .select('id, name, unit, category, threshold, workspace_id')
    .eq('id', id)
    .single()

  if (!kpi) return null

  const { data: values } = await supabase
    .from('kpi_values')
    .select('value, recorded_at')
    .eq('kpi_id', id)
    .order('recorded_at', { ascending: false })
    .limit(7)

  const sparkline = (values ?? []).map(v => Number(v.value)).reverse()

  const { data: latestInsight } = await supabase
    .from('insights')
    .select('content, confidence, created_at')
    .eq('kpi_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return {
    kpi,
    sparkline,
    latestInsight: latestInsight ?? null,
  }
}
