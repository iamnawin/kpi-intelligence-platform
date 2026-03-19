# 📋 实施计划：Milestone 5 — Real KPI Data

## Task Type
- [x] 全栈 (Server Component data layer + Express insight persistence)

---

## API / Data Flow

### Current (mock)
```
(app)/page.tsx [Server Component]
  └─ fetchKPIs() [src/lib/api.ts]
       └─ GET /api/kpis [Express]
            └─ hardcoded KPI_DEFINITIONS → evaluateKpi() → return array
```

### New (real DB)
```
(app)/page.tsx [Server Component]
  └─ fetchWorkspaceKPIs() [src/lib/kpi-data.ts]  ← NEW
       ├─ createServerSupabaseClient()
       ├─ workspace_id ← workspace_members WHERE user_id = auth.uid()
       ├─ kpis[]       ← kpis WHERE workspace_id = $ws_id
       ├─ kpi_values[] ← kpi_values WHERE workspace_id = $ws_id, grouped by kpi_id
       │    └─ last 7 ordered by recorded_at ASC → sparkline[]
       │    └─ current = sparkline[last], previous = sparkline[0]
       ├─ IF no DB kpis found → return mockKPIs (fallback)
       └─ for each kpi with ≥2 values:
            └─ POST /api/evaluate { kpi, current_value, previous_value,
                                    threshold, workspace_id, kpi_id }
                 └─ Express evaluateKpi() [UNCHANGED]
                 └─ IF workspace_id + kpi_id in body:
                      └─ supabaseAdmin.INSERT INTO insights (write via service role)
                 └─ return { insight, actions, confidence, metrics }

(app)/kpis/[id]/page.tsx [Server Component]
  ├─ fetchKPIById(id) [src/lib/kpi-data.ts]  ← NEW
  │    └─ kpis + last 7 kpi_values + latest stored insight
  └─ IF engine needed: POST /api/evaluate (same as above)
```

---

## kpi_values Time-Series Query Logic

```
SELECT value, recorded_at FROM kpi_values
WHERE kpi_id = $kpi_id
ORDER BY recorded_at DESC
LIMIT 7
```
→ reverse result in JS → sparkline (oldest → newest)

- `current_value`  = sparkline[sparkline.length - 1]   (most recent)
- `previous_value` = sparkline[0]                       (oldest of the 7)
- Minimum required: 2 values. With <2 values → skip engine, confidence = null.

Single Supabase query for all KPIs in workspace (avoids N+1):
```js
const { data: allValues } = await supabase
  .from('kpi_values')
  .select('kpi_id, value, recorded_at')
  .in('kpi_id', kpiIds)
  .order('recorded_at', { ascending: false })

// Group by kpi_id in JS, take first 7 per group, reverse
```

---

## insights Table Write Logic (Express)

Triggered by `POST /api/evaluate` when `workspace_id` + `kpi_id` are present in body:

```js
// In server/routes/kpi.js — after evaluateKpi():
if (workspace_id && kpi_id && result.insight) {
  await supabaseAdmin
    .from('insights')
    .insert({
      workspace_id,
      kpi_id,
      insight_type: 'engine_evaluation',
      content: result.insight,
      confidence: result.confidence,
      engine_version: '1.0',
    })
    // Upsert not needed — each evaluation creates a new snapshot row
}
```

No RLS migration needed — service role bypasses RLS.
Existing `read_insights` policy covers SELECT for workspace members.

---

## Files to Add / Modify

| File | Operation | Description |
|------|-----------|-------------|
| `src/lib/kpi-data.ts` | CREATE | Server-side KPI query functions: `fetchWorkspaceKPIs()`, `fetchKPIById(id)` |
| `src/lib/mock-data.ts` | KEEP | Unchanged — used as fallback when workspace has no KPIs |
| `src/lib/api.ts` | MODIFY | Remove `fetchKPIs()` call from Server Components; keep `evaluateKPI()` for client use |
| `src/app/(app)/page.tsx` | MODIFY | Replace `fetchKPIs()` → `fetchWorkspaceKPIs()` from `kpi-data.ts` |
| `src/app/(app)/kpis/[id]/page.tsx` | MODIFY | Replace `mockKPIs.find()` → `fetchKPIById()` from `kpi-data.ts`; remove `generateStaticParams` |
| `server/routes/kpi.js` | MODIFY | `POST /api/evaluate` — accept optional `workspace_id` + `kpi_id`; insert insight via supabaseAdmin |
| `server/lib/supabase-admin.js` | NO CHANGE | Already exists, already exports `supabaseAdmin` |

---

## Implementation Steps

### Step 1 — Create `src/lib/kpi-data.ts`

Server-only file. Never import in client components.

```ts
import { createServerSupabaseClient } from './supabase-server'
import { mockKPIs, type KPI } from './mock-data'

export async function getWorkspaceId(): Promise<string | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .limit(1)
    .single()
  return data?.workspace_id ?? null
}

export async function fetchWorkspaceKPIs(): Promise<KPI[]> {
  const supabase = await createServerSupabaseClient()
  const workspaceId = await getWorkspaceId()
  if (!workspaceId) return mockKPIs  // no workspace → fallback

  // 1. Fetch KPI definitions
  const { data: kpis } = await supabase
    .from('kpis')
    .select('id, name, unit, category, threshold')
    .eq('workspace_id', workspaceId)

  if (!kpis || kpis.length === 0) return mockKPIs  // no KPIs seeded → fallback

  // 2. Fetch last 7 values per KPI in one query
  const kpiIds = kpis.map(k => k.id)
  const { data: allValues } = await supabase
    .from('kpi_values')
    .select('kpi_id, value, recorded_at')
    .in('kpi_id', kpiIds)
    .order('recorded_at', { ascending: false })

  // 3. Group values by kpi_id
  const valuesByKpi: Record<string, number[]> = {}
  for (const kpiId of kpiIds) {
    const vals = (allValues ?? [])
      .filter(v => v.kpi_id === kpiId)
      .slice(0, 7)           // take latest 7
      .map(v => v.value)
      .reverse()             // oldest → newest (sparkline order)
    valuesByKpi[kpiId] = vals
  }

  // 4. Call engine per KPI and shape into KPI[]
  return Promise.all(kpis.map(async (kpi) => {
    const sparkline = valuesByKpi[kpi.id] ?? []
    const current  = sparkline[sparkline.length - 1] ?? 0
    const previous = sparkline[0] ?? 0

    let engineResult = null
    if (sparkline.length >= 2) {
      try {
        const res = await fetch(`${process.env.KPI_API_URL ?? 'http://localhost:3001'}/api/evaluate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            kpi: kpi.name,
            current_value: current,
            previous_value: previous,
            threshold: kpi.threshold ?? 10,
            workspace_id: workspaceId,
            kpi_id: kpi.id,
          }),
          cache: 'no-store',
        })
        engineResult = await res.json()
      } catch { /* engine unavailable */ }
    }

    const change = engineResult?.metrics?.percentageChange ?? 0
    const trend  = change > 0.5 ? 'up' : change < -0.5 ? 'down' : 'stable'

    return {
      id:            kpi.id,
      name:          kpi.name,
      unit:          kpi.unit ?? '',
      category:      kpi.category ?? 'operations',
      value:         current,
      sparkline,
      trend,
      changePercent: change,
      engineResult,
    } as KPI & { engineResult: typeof engineResult }
  }))
}

export async function fetchKPIById(id: string) {
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

  const sparkline = (values ?? []).map(v => v.value).reverse()

  // Latest stored insight (avoid re-evaluating if recent)
  const { data: latestInsight } = await supabase
    .from('insights')
    .select('content, confidence, created_at')
    .eq('kpi_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return { kpi, sparkline, latestInsight }
}
```

### Step 2 — Modify `server/routes/kpi.js`

Add optional `workspace_id` + `kpi_id` handling to `POST /api/evaluate`:

```js
const { supabaseAdmin } = require('../lib/supabase-admin')

router.post('/evaluate', async (req, res) => {
  const { kpi, current_value, previous_value, workspace_id, kpi_id } = req.body
  // ... existing validation unchanged ...
  const config = kpiToConfig(req.body)
  const result = evaluateKpi(config)         // engine UNCHANGED
  const explanation = generateExplanation(result, config)

  // Persist insight if context provided (fire-and-forget)
  if (workspace_id && kpi_id && result.insight) {
    supabaseAdmin.from('insights').insert({
      workspace_id,
      kpi_id,
      insight_type: 'engine_evaluation',
      content: result.insight,
      confidence: result.confidence,
      engine_version: '1.0',
    }).then().catch(() => {}) // non-blocking
  }

  res.json({ ...result, explanation })
})
```

`GET /api/kpis` — no change, stays as mock-only (used by old tests / backward compat).

### Step 3 — Modify `src/app/(app)/page.tsx`

```tsx
import { fetchWorkspaceKPIs } from '@/lib/kpi-data'
// Replace: import { fetchKPIs } from '@/lib/api'

export default async function DashboardPage() {
  const kpis = await fetchWorkspaceKPIs()  // ← real data or mock fallback
  // Rest of JSX unchanged
}
```

### Step 4 — Modify `src/app/(app)/kpis/[id]/page.tsx`

```tsx
import { fetchKPIById } from '@/lib/kpi-data'
import { mockKPIs } from '@/lib/mock-data'

export default async function KPIDetailPage({ params }) {
  const { id } = await params

  // Try DB first, fall back to mock
  const dbResult = await fetchKPIById(id)

  let kpi, sparkline, storedInsight
  if (dbResult) {
    kpi          = dbResult.kpi
    sparkline    = dbResult.sparkline
    storedInsight = dbResult.latestInsight
  } else {
    const mock = mockKPIs.find(k => k.id === id)
    if (!mock) notFound()
    kpi       = mock
    sparkline = mock.sparkline
  }

  // Engine eval (re-evaluate for freshness, OR show stored insight)
  let engineResult = storedInsight
    ? { insight: storedInsight.content, confidence: storedInsight.confidence, actions: [] }
    : null

  if (!engineResult && sparkline.length >= 2) {
    try { engineResult = await evaluateKPI({ ... }) } catch { }
  }

  // Rest of JSX largely unchanged
}

// Remove generateStaticParams — can't pre-generate UUIDs
```

### Step 5 — Seed Test Data (Manual — not automated)

After creating a workspace via onboarding, run this in Supabase SQL Editor:

```sql
-- Replace $WORKSPACE_ID with actual workspace UUID from workspaces table
INSERT INTO kpis (workspace_id, name, unit, category, threshold)
VALUES
  ('$WORKSPACE_ID', 'Monthly Revenue',           '$',  'revenue',    5),
  ('$WORKSPACE_ID', 'Churn Rate',                '%',  'customer',  10),
  ('$WORKSPACE_ID', 'NPS Score',                 '',   'customer',   5),
  ('$WORKSPACE_ID', 'Customer Acquisition Cost', '$',  'growth',    10),
  ('$WORKSPACE_ID', 'MRR Growth',                '%',  'revenue',    5),
  ('$WORKSPACE_ID', 'Open Support Tickets',      '',   'operations', 20);

-- Then insert kpi_values for each KPI (7 rows each)
-- Use the UUIDs returned from the INSERT above
```

This manual step is documented as part of Acceptance Criteria.

---

## What Stays OUT OF SCOPE (This Milestone)

| Feature | Why deferred |
|---------|-------------|
| UI to add/edit KPIs from dashboard | Milestone 6+ (Goals & KPI management UI) |
| UI to enter KPI values | Same — manual Supabase entry for now |
| Automated alerts from insights table | Milestone 6+ |
| KPI value import (CSV/Sheets) | Layer 1 (Ingestion) — future milestone |
| Real-time KPI updates (Supabase Realtime) | Performance optimization — not needed for MVP |
| action_items table population | Will come with Goals milestone |
| KPI detail page: show full insight history | Keep showing only latest for now |
| Removing mock-data.ts | Keep as permanent fallback — never remove |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| No KPI data seeded → empty dashboard | `fetchWorkspaceKPIs()` falls back to `mockKPIs` if workspace has no kpis rows |
| KPI detail page uses UUID routes; `generateStaticParams` used slugs | Remove `generateStaticParams` — page becomes dynamic (`ƒ`). Mock fallback handles slug-based legacy routes. |
| `insights` INSERT fails silently | Fire-and-forget pattern — never blocks the API response |
| `kpi-data.ts` accidentally imported in client component | Add `'server-only'` import at top of file |
| Express `fetch()` inside Server Component adds latency | Acceptable for MVP; can be optimized by calling engine directly (without HTTP) in future |

---

## Acceptance Criteria

- [ ] Workspace with seeded KPIs shows real data on dashboard (not mock)
- [ ] Workspace with no KPIs gracefully shows mock fallback
- [ ] `kpi_values` sparkline uses last 7 values ordered by `recorded_at ASC`
- [ ] Engine evaluation runs with real `current` + `previous` from DB
- [ ] Each engine evaluation inserts a row into `insights` table (verify in Supabase)
- [ ] KPI detail page works for both UUID routes (real) and slug routes (mock fallback)
- [ ] `generateStaticParams` removed — detail page renders dynamically
- [ ] TypeScript `npm run typecheck` passes with 0 errors

---

## SESSION_ID（供 /ccg:execute 使用）
- CODEX_SESSION: N/A
- GEMINI_SESSION: N/A
