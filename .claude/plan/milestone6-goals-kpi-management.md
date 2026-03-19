# 📋 实施计划：Milestone 6 — Goals & KPI Management

## Task Type
- [x] 全栈 (Server Component data layer + new goal UI components)

---

## Schema Findings (from 002_tables.sql)

### goals table
```
id             UUID PK
workspace_id   UUID → workspaces
objective_id   UUID → objectives (nullable)
parent_goal_id UUID → goals (nullable, sub-goals)
title          TEXT
description    TEXT (nullable)
owner_id       UUID → workspace_members (nullable)
status         goal_status ENUM
progress_pct   INTEGER (0-100)
start_date     DATE (nullable)
end_date       DATE (nullable)
trust_level    trust_level ENUM DEFAULT 'draft'
created_at     TIMESTAMPTZ
updated_at     TIMESTAMPTZ
```

### Key relationship
```
kpis.goal_id → goals.id   (direct FK, ON DELETE SET NULL)
```
→ NO join table needed. KPIs already belong to a goal via kpis.goal_id

### ENUMs
- `goal_status`: not_started | in_progress | at_risk | completed | cancelled
- `trust_level`: draft | self_reported | imported | reviewer_approved | system_verified | locked_proof

### RLS
- read_goals: SELECT for all workspace members
- write_goals: ALL for manager/executive/admin only
- M6 only does SELECT → no RLS migration needed

---

## API / Data Flow

```
/goals [Server Component]
  └─ fetchWorkspaceGoals() [src/lib/goal-data.ts]
       ├─ createServerSupabaseClient()
       ├─ workspace_id ← workspace_members (single)
       ├─ goals[] ← goals WHERE workspace_id = $ws_id ORDER BY status, created_at DESC
       └─ kpi_counts ← kpis SELECT goal_id, count(*) WHERE goal_id IN (ids) GROUP BY goal_id

/goals/[id] [Server Component]
  └─ fetchGoalById(id) [src/lib/goal-data.ts]
       ├─ goal row (single)
       ├─ kpis[] ← kpis WHERE goal_id = id
       └─ for each kpi: last 7 kpi_values → sparkline (same pattern as kpi-data.ts)

Dashboard (app/page.tsx)
  └─ fetchWorkspaceGoals() parallel with fetchWorkspaceKPIs()
  └─ top 3 active goals (status IN ['in_progress','at_risk']) → GoalsSection
```

---

## Files to Add / Modify

| File | Operation | Description |
|------|-----------|-------------|
| `src/lib/goal-data.ts` | CREATE | Server-only: fetchWorkspaceGoals, fetchGoalById |
| `src/components/goal/trust-badge.tsx` | CREATE | 6-level trust_level color-coded pill |
| `src/components/goal/goal-status-badge.tsx` | CREATE | goal_status color-coded badge |
| `src/components/goal/goal-card.tsx` | CREATE | Goal card: title, status, trust, progress bar, KPI count |
| `src/app/(app)/goals/page.tsx` | CREATE | Goals list page (Server Component) |
| `src/app/(app)/goals/[id]/page.tsx` | CREATE | Goal detail page (Server Component) |
| `src/components/layout/sidebar.tsx` | MODIFY | Add Goals nav item (Target icon) |
| `src/app/(app)/page.tsx` | MODIFY | Add Goals section (top 3 active goals) |

---

## Implementation Steps

### Step 1 — Create `src/lib/goal-data.ts`

Server-only data layer. Pattern mirrors kpi-data.ts.

```ts
import 'server-only'
import { createServerSupabaseClient } from './supabase-server'

export type GoalStatus = 'not_started' | 'in_progress' | 'at_risk' | 'completed' | 'cancelled'
export type TrustLevel = 'draft' | 'self_reported' | 'imported' | 'reviewer_approved' | 'system_verified' | 'locked_proof'

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

  // Count KPIs per goal in one query
  const { data: kpiRows } = await supabase
    .from('kpis')
    .select('goal_id')
    .in('goal_id', goalIds)

  const kpiCountMap: Record<string, number> = {}
  for (const row of kpiRows ?? []) {
    if (row.goal_id) kpiCountMap[row.goal_id] = (kpiCountMap[row.goal_id] ?? 0) + 1
  }

  return goals.map(g => ({
    ...g,
    kpi_count: kpiCountMap[g.id] ?? 0,
  }))
}

function buildSparkline(values: { value: number; recorded_at: string }[]): number[] {
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
    return { goal: { ...goal, kpi_count: 0 }, kpis: [] }
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
    goal: { ...goal, kpi_count: kpis.length },
    kpis: linkedKpis,
  }
}
```

### Step 2 — Create badge components

**`src/components/goal/trust-badge.tsx`**
```tsx
import type { TrustLevel } from "@/lib/goal-data"

const TRUST_CONFIG: Record<TrustLevel, { label: string; className: string }> = {
  draft:             { label: 'Draft',             className: 'bg-gray-100 text-gray-500' },
  self_reported:     { label: 'Self Reported',     className: 'bg-yellow-100 text-yellow-700' },
  imported:          { label: 'Imported',          className: 'bg-blue-100 text-blue-700' },
  reviewer_approved: { label: 'Reviewer Approved', className: 'bg-green-100 text-green-700' },
  system_verified:   { label: 'System Verified',   className: 'bg-emerald-100 text-emerald-800' },
  locked_proof:      { label: 'Locked Proof',      className: 'bg-purple-100 text-purple-700' },
}

export function TrustBadge({ level }: { level: TrustLevel }) {
  const { label, className } = TRUST_CONFIG[level] ?? TRUST_CONFIG.draft
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
```

**`src/components/goal/goal-status-badge.tsx`**
```tsx
import type { GoalStatus } from "@/lib/goal-data"

const STATUS_CONFIG: Record<GoalStatus, { label: string; className: string }> = {
  not_started: { label: 'Not Started', className: 'bg-gray-100 text-gray-500' },
  in_progress: { label: 'In Progress', className: 'bg-blue-100 text-blue-700' },
  at_risk:     { label: 'At Risk',     className: 'bg-red-100 text-red-700' },
  completed:   { label: 'Completed',   className: 'bg-green-100 text-green-700' },
  cancelled:   { label: 'Cancelled',   className: 'bg-gray-100 text-gray-400' },
}

export function GoalStatusBadge({ status }: { status: GoalStatus }) {
  const { label, className } = STATUS_CONFIG[status] ?? STATUS_CONFIG.not_started
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
```

### Step 3 — Create GoalCard component

**`src/components/goal/goal-card.tsx`**
```tsx
import Link from "next/link"
import { ArrowUpRight, BarChart2 } from "lucide-react"
import { GoalStatusBadge } from "./goal-status-badge"
import { TrustBadge } from "./trust-badge"
import type { GoalWithKPICount } from "@/lib/goal-data"

export function GoalCard({ goal }: { goal: GoalWithKPICount }) {
  return (
    <Link
      href={`/goals/${goal.id}`}
      className="group block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-gray-800 group-hover:text-gray-900 line-clamp-2">
          {goal.title}
        </p>
        <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        <GoalStatusBadge status={goal.status} />
        <TrustBadge level={goal.trust_level} />
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-400">Progress</span>
          <span className="text-xs font-medium text-gray-600">{goal.progress_pct}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-100">
          <div
            className="h-1.5 rounded-full bg-blue-400 transition-all"
            style={{ width: `${goal.progress_pct}%` }}
          />
        </div>
      </div>

      {goal.kpi_count > 0 && (
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <BarChart2 className="h-3 w-3" />
          <span>{goal.kpi_count} KPI{goal.kpi_count !== 1 ? 's' : ''} linked</span>
        </div>
      )}
    </Link>
  )
}
```

### Step 4 — Goals list page

**`src/app/(app)/goals/page.tsx`**
```tsx
import { Target } from "lucide-react"
import { fetchWorkspaceGoals } from "@/lib/goal-data"
import { GoalCard } from "@/components/goal/goal-card"

export default async function GoalsPage() {
  const goals = await fetchWorkspaceGoals()

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Goals</h1>
        <p className="mt-1 text-sm text-gray-500">
          Workspace goals linked to KPIs and outcomes.
        </p>
      </div>

      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-16 text-center">
          <Target className="mb-3 h-8 w-8 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">No goals yet</p>
          <p className="mt-1 text-xs text-gray-400">
            Add goals in Supabase to see them here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map(goal => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}
    </div>
  )
}
```

### Step 5 — Goal detail page

**`src/app/(app)/goals/[id]/page.tsx`**
```tsx
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, BarChart2 } from "lucide-react"
import { fetchGoalById } from "@/lib/goal-data"
import { GoalStatusBadge } from "@/components/goal/goal-status-badge"
import { TrustBadge } from "@/components/goal/trust-badge"
import { KPICard } from "@/components/kpi/kpi-card"  // reuse for linked KPIs
import { formatNumber } from "@/lib/utils"
import { TrendBadge } from "@/components/kpi/trend-badge"

type Props = { params: Promise<{ id: string }> }

export default async function GoalDetailPage({ params }: Props) {
  const { id } = await params
  const data = await fetchGoalById(id)
  if (!data) notFound()

  const { goal, kpis } = data

  return (
    <div>
      <Link href="/goals" className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
        <ArrowLeft className="h-4 w-4" />
        Back to Goals
      </Link>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{goal.title}</h1>
          {goal.description && (
            <p className="mt-1 text-sm text-gray-500">{goal.description}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <GoalStatusBadge status={goal.status} />
          <TrustBadge level={goal.trust_level} />
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-700">Progress</p>
          <p className="text-2xl font-bold text-gray-900">{goal.progress_pct}%</p>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-100">
          <div
            className="h-2 rounded-full bg-blue-400"
            style={{ width: `${goal.progress_pct}%` }}
          />
        </div>
        {(goal.start_date || goal.end_date) && (
          <p className="mt-3 text-xs text-gray-400">
            {goal.start_date} → {goal.end_date ?? 'ongoing'}
          </p>
        )}
      </div>

      {/* Linked KPIs */}
      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
          Linked KPIs ({kpis.length})
        </h2>
        {kpis.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
            <BarChart2 className="mx-auto mb-2 h-6 w-6 text-gray-300" />
            <p className="text-sm text-gray-400">No KPIs linked to this goal yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {kpis.map(kpi => (
              <KPICard key={kpi.id} kpi={kpi} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

### Step 6 — Update Sidebar

Add Goals nav item with Target icon:
```tsx
import { LayoutDashboard, Bell, Sparkles, Target } from "lucide-react"

const NAV_ITEMS = [
  { href: "/",        label: "Dashboard", icon: LayoutDashboard },
  { href: "/goals",   label: "Goals",     icon: Target },          // ← ADD
  { href: "/alerts",  label: "Alerts",    icon: Bell },
  { href: "/insights",label: "AI Insights",icon: Sparkles },
]
```

### Step 7 — Update Dashboard

Add Goals section to `src/app/(app)/page.tsx`:
```tsx
import { fetchWorkspaceGoals } from "@/lib/goal-data"
import { GoalCard } from "@/components/goal/goal-card"

export default async function DashboardPage() {
  // Parallel fetch
  const [kpis, goals] = await Promise.all([
    fetchWorkspaceKPIs(),
    fetchWorkspaceGoals(),
  ])

  const activeGoals = goals
    .filter(g => g.status === 'in_progress' || g.status === 'at_risk')
    .slice(0, 3)

  // ... existing heroKPI, primary, customer, operational logic unchanged ...

  return (
    <div className="flex flex-col gap-8">
      {/* ... existing sections ... */}

      {/* Goals section */}
      {activeGoals.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Active Goals
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeGoals.map(goal => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
```

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| goals table empty → empty goals page | Dedicated empty state UI — no mock fallback for goals |
| kpis.goal_id all null → no linked KPIs | Goal detail shows "No KPIs linked" placeholder |
| buildSparkline duplicated from kpi-data.ts | Extract to shared util; or accept small duplication for now |
| KPICard expects KPI type from mock-data.ts | LinkedKPI type in goal-data.ts matches KPI shape — verify at compile time |
| Dashboard parallel fetch adds latency | Both are lightweight DB reads; Promise.all keeps them concurrent |

---

## Acceptance Criteria

- [ ] `/goals` page renders goal cards or empty state
- [ ] GoalCard shows: title, status badge, trust badge, progress bar, KPI count
- [ ] `/goals/[id]` page renders goal info + linked KPI cards (or "no KPIs" state)
- [ ] Sidebar has "Goals" nav item that highlights correctly on `/goals` and `/goals/*`
- [ ] Dashboard shows top 3 in_progress/at_risk goals in "Active Goals" section
- [ ] Dashboard: goals and KPIs fetched in parallel (Promise.all)
- [ ] Empty workspace: goals page shows empty state, dashboard hides Goals section
- [ ] TypeScript `npm run typecheck` passes with 0 errors
- [ ] trust_level and goal_status badges render correct colors for all values

---

## Seed Test Data (Manual — after workspace creation)

```sql
-- Replace $WORKSPACE_ID with actual workspace UUID
INSERT INTO goals (workspace_id, title, description, status, progress_pct, trust_level, start_date, end_date)
VALUES
  ('$WORKSPACE_ID', 'Grow MRR to $300k', 'Increase monthly recurring revenue through upsell and new logos', 'in_progress', 45, 'self_reported', '2026-01-01', '2026-06-30'),
  ('$WORKSPACE_ID', 'Reduce Churn Below 2%', 'Improve retention through CS programs and product improvements', 'at_risk', 30, 'imported', '2026-01-01', '2026-12-31'),
  ('$WORKSPACE_ID', 'NPS Score > 70', 'Achieve world-class NPS through support quality and feature delivery', 'in_progress', 65, 'reviewer_approved', '2026-01-01', '2026-06-30');

-- Then link existing KPIs to goals by updating kpis.goal_id:
-- UPDATE kpis SET goal_id = '<goal_uuid>' WHERE name = 'Monthly Revenue';
```

---

## SESSION_ID（供 /ccg:execute 使用）
- CODEX_SESSION: N/A
- GEMINI_SESSION: N/A
