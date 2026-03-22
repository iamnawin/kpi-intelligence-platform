[Root](../../CLAUDE.md) > **src/lib**

# Module: Data Layer & Utilities

The server-side data access layer and shared utilities. All Supabase queries originate here.
Client components never import from this module directly (most files use `'server-only'`).

---

## Module Responsibility

- Provide typed Supabase query functions for achievements, evidence, tasks, and KPIs
- Provide semantic re-export aliases for ProofPath terminology
- Provide CSV/JSON import parsing and validation
- Provide the Supabase client factory for Server Components and Server Actions
- Provide shared utilities (`cn`, `formatNumber`)

---

## File Inventory

### `goal-data.ts` — Primary Data Layer

`import 'server-only'` — cannot be imported in client components.

**Exported Types:**

| Type | Description |
|------|-------------|
| `GoalStatus` | `'not_started' \| 'in_progress' \| 'at_risk' \| 'completed' \| 'cancelled'` |
| `GoalType` | `'standard' \| 'strategic' \| 'operational' \| 'personal' \| 'team'` |
| `KRType` | `'metric' \| 'milestone' \| 'activity'` |
| `TrustLevel` | 6-level enum: `draft` through `locked_proof` |
| `GoalWithCounts` | Goal row + kpi_count, sub_goal_count, task_count, task_done_count, owner_name |
| `GoalWithKPICount` | Alias for `GoalWithCounts` (backwards compat) |
| `LinkedKPI` | KPI with sparkline, trend, changePercent |
| `TaskStatus` | `'todo' \| 'in_progress' \| 'blocked' \| 'done' \| 'cancelled'` |
| `TaskRecord` | id, title, status, assignee_name, due_date |
| `EvidenceType` | `'note' \| 'link' \| 'file' \| 'metric'` |
| `EvidenceRecord` | Full evidence row with source_type, trust_level, uploader_name |
| `GoalDetailData` | `{ goal, kpis, evidence, tasks }` — full detail page payload |

**Exported Functions:**

| Function | Signature | Description |
|----------|-----------|-------------|
| `fetchWorkspaceGoals` | `() => Promise<GoalWithCounts[]>` | All goals in workspace with batch-counted relations |
| `fetchGoalById` | `(id: string) => Promise<GoalDetailData \| null>` | Full detail — goal + KPIs + evidence + tasks |

**Performance note:** `fetchWorkspaceGoals` uses `Promise.all` to batch 3 count queries in parallel — no N+1 pattern.

---

### `achievement-data.ts` — ProofPath Re-export Layer

A thin shim over `goal-data.ts` that provides ProofPath semantic names.

**Type aliases:**
- `AchievementWithCounts` = `GoalWithCounts`
- `AchievementDetailData` = `GoalDetailData`
- `AchievementStatus` = `GoalStatus`
- `AchievementType` = `GoalType`

**Function aliases:**
- `fetchWorkspaceAchievements` = `fetchWorkspaceGoals`
- `fetchAchievementById` = `fetchGoalById`

Note from the file: "The underlying DB table remains 'goals' — migration 009 will rename it."
Use `achievement-data.ts` in new ProofPath code; `goal-data.ts` types remain the source of truth.

---

### `import-parser.ts` — CSV/JSON Import Utilities

**Exported Types:**
- `ImportRow` — `{ title, description?, status?, goal_type?, progress_pct?, start_date?, end_date? }`
- `ValidationResult` — `{ valid: ImportRow[]; errors: string[] }`

**Exported Functions:**

| Function | Signature | Description |
|----------|-----------|-------------|
| `parseCSV` | `(text: string) => ImportRow[]` | Full CSV parser with quoted field support |
| `parseJSON` | `(text: string) => ImportRow[]` | Accepts array root or `{ goals: [...] }` wrapper |
| `validateImportRows` | `(rows: ImportRow[]) => ValidationResult` | Validates status, goal_type, progress_pct range |

Column aliases supported: `progress` = `progress_pct`, `type` = `goal_type`.

---

### `supabase-server.ts` — Server Supabase Client Factory

**Exported Function:**
```typescript
createServerSupabaseClient(): Promise<SupabaseClient>
```
Uses `@supabase/ssr` `createServerClient` with Next.js `cookies()` store.
Handles the "Server Component context — cookies readable but not writable" case silently.

Required env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

### `supabase.ts` — Browser Supabase Client

Browser-side client for auth operations in Client Components.

---

### `utils.ts` — Shared Utilities

| Export | Signature | Description |
|--------|-----------|-------------|
| `cn` | `(...inputs: ClassValue[]) => string` | clsx + tailwind-merge class merger |
| `formatNumber` | `(value: number, unit: string) => string` | Formats numbers as $1.2M, $300K, 42%, etc. |

Tested in `src/lib/__tests__/utils.test.ts`.

---

### `auth.ts` — Auth Utilities

Auth helper functions.

---

### `integrations/` — Provider Fetch Functions

| File | Exported Function | Returns |
|------|------------------|---------|
| `types.ts` | `IntegrationProvider`, `ExternalTask`, `IntegrationSettings` | Types only |
| `github.ts` | `fetchGitHubIssues(token, settings)` | `ExternalTask[]` |
| `jira.ts` | `fetchJiraIssues(token, settings)` | `ExternalTask[]` |
| `linear.ts` | `fetchLinearIssues(token, settings)` | `ExternalTask[]` |
| `asana.ts` | `fetchAsanaTasks(token, settings)` | `ExternalTask[]` |

---

### Legacy Files (Not ProofPath Core)

| File | Status |
|------|--------|
| `mock-data.ts` | KPI mock data — legacy |
| `kpi-data.ts` | KPI fetch functions — legacy |
| `objective-data.ts` | OKR objective queries — legacy |
| `dashboard-data.ts` | Dashboard data helpers — partially legacy |

---

## Tests

| Test File | Coverage |
|-----------|---------|
| `__tests__/utils.test.ts` | `cn()`, `formatNumber()` |

No tests exist for `goal-data.ts`, `achievement-data.ts`, or `import-parser.ts`.

---

## Known Gaps / Next Steps

- `goal-data.ts` functions have no unit tests — mocking Supabase client required
- `import-parser.ts` `parseCSV` and `validateImportRows` are pure functions and testable without mocks
- `achievement-data.ts` comment says "migration 009 will rename goals table" — this has not happened; `goals` is still the table name
- A `proof-data.ts` file is planned (Phase 4) for `AchievementRecord` queries and trust score aggregation

---

## Related Files

- `src/app/actions/` — all consumers of these data functions
- `src/app/(app)/achievements/` — page-level consumers
- `supabase/migrations/` — DB schema these queries depend on
