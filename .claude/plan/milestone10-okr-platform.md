# 📋 Implementation Plan: M10 — OKR Platform + Dark Theme + Import + Integrations

## Task Type
- [x] Full-stack (DB migrations + Server Actions + UI overhaul)

---

## Overview — 4 Phases (each independently shippable)

| Phase | Name | Scope |
|-------|------|-------|
| A | Dark Theme | UI-only, no DB changes |
| B | OKR Structure + Goal Types | DB migration + new pages + components |
| C | Import | CSV/JSON upload wizard |
| D | Integrations | Jira, Linear, Asana, GitHub OAuth + sync |

---

## Phase A — Dark Theme

### Approach
- `tailwind.config.ts`: add `darkMode: 'class'`
- Forced dark via `<html className="dark">` in root layout
- All components get systematic `dark:` class additions

### Dark Color Palette
```
Background:    bg-gray-950  (#09090b)  — page background
Surface:       bg-gray-900  (#18181b)  — cards, panels
Border:        border-gray-800         — dividers
Text primary:  text-gray-50            — headings
Text muted:    text-gray-400           — labels, metadata
Blue accent:   blue-500                — primary action
Blue surface:  bg-blue-950             — active nav item bg
```

### Steps

**A1 — tailwind.config.ts**
```ts
const config: Config = {
  darkMode: 'class',   // ADD THIS
  content: [...],
  ...
}
```

**A2 — globals.css**
```css
:root { --background: #ffffff; --foreground: #171717; }
.dark { --background: #09090b; --foreground: #fafafa; }
body { background: var(--background); color: var(--foreground); }
```

**A3 — src/app/layout.tsx** — add `className="dark"` to `<html>`

**A4 — app-shell.tsx**
```tsx
bg-gray-50 → bg-gray-950
```

**A5 — sidebar.tsx**
```tsx
aside:  bg-white border-gray-200 → dark:bg-gray-900 dark:border-gray-800
logo:   text-gray-900 → dark:text-gray-50
nav link inactive: text-gray-600 hover:bg-gray-100 hover:text-gray-900
  → dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100
nav link active: bg-blue-50 text-blue-700
  → dark:bg-blue-950 dark:text-blue-400
```

**A6 — filter-bar.tsx**
```tsx
bg-white border-gray-200 text-gray-500
→ dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400
```

**A7 — goal-card.tsx / goal-row.tsx / task-row.tsx / evidence-card.tsx**
```tsx
Cards: bg-white border-gray-200 → dark:bg-gray-900 dark:border-gray-800
Text: text-gray-900 → dark:text-gray-50
      text-gray-700 → dark:text-gray-300
      text-gray-500 → dark:text-gray-400
      text-gray-400 → dark:text-gray-500
Hover: hover:bg-gray-50 → dark:hover:bg-gray-800
Progress bar bg: bg-gray-100 → dark:bg-gray-800
Divider: divide-gray-100 → dark:divide-gray-800
Dashed border: border-gray-300 → dark:border-gray-700
```

**A8 — trust-badge.tsx / goal-status-badge.tsx**
```tsx
Each badge: keep light colors but add dark variants
draft:              bg-gray-100 text-gray-500 → dark:bg-gray-800 dark:text-gray-400
self_reported:      bg-yellow-100 text-yellow-700 → dark:bg-yellow-950 dark:text-yellow-400
imported:           bg-blue-100 text-blue-700 → dark:bg-blue-950 dark:text-blue-400
reviewer_approved:  bg-green-100 text-green-700 → dark:bg-green-950 dark:text-green-400
system_verified:    bg-emerald-100 text-emerald-800 → dark:bg-emerald-950 dark:text-emerald-400
locked_proof:       bg-purple-100 text-purple-700 → dark:bg-purple-950 dark:text-purple-400
at_risk:            bg-red-100 text-red-700 → dark:bg-red-950 dark:text-red-400
completed:          bg-green-100 text-green-700 → dark:bg-green-950 dark:text-green-400
```

**A9 — hero-kpi.tsx / kpi-card.tsx / kpi-section.tsx / ai-insight-strip.tsx / trend-badge.tsx**
```tsx
Same dark: mapping as goal cards
AI insight strip (blue): bg-blue-50 → dark:bg-blue-950
  border-blue-100 → dark:border-blue-900
  text-blue-600 → dark:text-blue-400
```

**A10 — goal-form.tsx / task-form.tsx**
```tsx
Form card bg: bg-blue-50 (task form) → dark:bg-blue-950
Input/textarea/select:
  bg-white border-gray-300 text-gray-900 placeholder-gray-400
  → dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-500
  focus: focus:border-blue-400 focus:ring-blue-400 (same)
Button cancel: border-gray-300 text-gray-600 hover:bg-gray-50
  → dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800
```

**A11 — App pages (goals/page, goals/[id]/page, goals/new/page, goals/[id]/edit/page, page.tsx)**
```tsx
Page heading: text-gray-900 → dark:text-gray-50
Sub text: text-gray-500 → dark:text-gray-400
Section headers (uppercase tracking): text-gray-400 → dark:text-gray-500
Empty state borders: border-gray-300 → dark:border-gray-700
Empty state icons: text-gray-300 → dark:text-gray-600
KPI detail engine box: bg-blue-50 border-blue-100 → dark:bg-blue-950 dark:border-blue-900
```

**A12 — Auth pages (login/signup)**
```tsx
Page bg: bg-gray-50 → dark:bg-gray-950
Card: bg-white border-gray-200 → dark:bg-gray-900 dark:border-gray-800
Heading: text-gray-900 → dark:text-gray-50
Input fields: same as form fields above
Link colors: text-blue-600 → dark:text-blue-400
```

### Files Changed (Phase A)
| File | Op |
|------|----|
| `tailwind.config.ts` | MODIFY |
| `src/app/globals.css` | MODIFY |
| `src/app/layout.tsx` | MODIFY |
| `src/components/layout/app-shell.tsx` | MODIFY |
| `src/components/layout/sidebar.tsx` | MODIFY |
| `src/components/layout/filter-bar.tsx` | MODIFY |
| `src/components/goal/goal-card.tsx` | MODIFY |
| `src/components/goal/goal-row.tsx` | MODIFY |
| `src/components/goal/task-row.tsx` | MODIFY |
| `src/components/goal/evidence-card.tsx` | MODIFY |
| `src/components/goal/trust-badge.tsx` | MODIFY |
| `src/components/goal/goal-status-badge.tsx` | MODIFY |
| `src/components/kpi/hero-kpi.tsx` | MODIFY |
| `src/components/kpi/kpi-card.tsx` | MODIFY |
| `src/components/kpi/kpi-section.tsx` | MODIFY |
| `src/components/kpi/kpi-grid.tsx` | MODIFY |
| `src/components/kpi/trend-badge.tsx` | MODIFY |
| `src/components/dashboard/ai-insight-strip.tsx` | MODIFY |
| `src/components/forms/goal-form.tsx` | MODIFY |
| `src/components/forms/task-form.tsx` | MODIFY |
| `src/app/(app)/page.tsx` | MODIFY |
| `src/app/(app)/goals/page.tsx` | MODIFY |
| `src/app/(app)/goals/[id]/page.tsx` | MODIFY |
| `src/app/(app)/goals/new/page.tsx` | MODIFY |
| `src/app/(app)/goals/[id]/edit/page.tsx` | MODIFY |
| `src/app/(app)/kpis/[id]/page.tsx` | MODIFY |
| `src/app/(app)/alerts/page.tsx` | MODIFY |
| `src/app/(app)/insights/page.tsx` | MODIFY |
| `src/app/(auth)/login/page.tsx` | MODIFY |
| `src/app/(auth)/signup/page.tsx` | MODIFY |

---

## Phase B — OKR Structure + Goal Types

### DB Migration: supabase/migrations/006_okr_extensions.sql
```sql
-- Goal types enum
CREATE TYPE goal_type AS ENUM ('standard','strategic','operational','personal','team');

-- Extend goals table
ALTER TABLE goals ADD COLUMN goal_type       goal_type DEFAULT 'standard';
ALTER TABLE goals ADD COLUMN key_result_type TEXT;      -- 'metric' | 'milestone' | 'activity'
ALTER TABLE goals ADD COLUMN target_value    NUMERIC;   -- for metric KRs
ALTER TABLE goals ADD COLUMN current_value   NUMERIC;
ALTER TABLE goals ADD COLUMN unit            TEXT;

-- Extend objectives with OKR period and type
ALTER TABLE objectives ADD COLUMN period     TEXT;      -- 'Q1 2026', 'H1 2026', 'FY2026'
ALTER TABLE objectives ADD COLUMN goal_type  goal_type DEFAULT 'strategic';

-- Indexes
CREATE INDEX idx_goals_type ON goals(workspace_id, goal_type);
```

### New Data Layer: src/lib/objective-data.ts
```ts
import 'server-only'
export type ObjectiveWithKRs = { id, title, period, status, goal_type, kr_count, completion_pct }
export async function fetchWorkspaceObjectives(): Promise<ObjectiveWithKRs[]>
export async function fetchObjectiveById(id): Promise<{ objective, keyResults: GoalWithCounts[] } | null>
```

### New Components: src/components/okr/
```
objective-card.tsx     — Card: title, period badge, type badge, circular progress
objective-row.tsx      — Row version for list page
key-result-row.tsx     — KR row within objective detail: type icon + progress bar/check
goal-type-badge.tsx    — strategic=violet, operational=cyan, personal=pink, team=orange
progress-ring.tsx      — SVG circle: r=20, strokeDasharray trick for % fill
```

### New Pages
```
src/app/(app)/objectives/page.tsx            — List objectives, grouped by period
src/app/(app)/objectives/new/page.tsx        — Create objective form
src/app/(app)/objectives/[id]/page.tsx       — Objective detail: KR list + progress
src/app/(app)/objectives/[id]/edit/page.tsx  — Edit objective
```

### New Server Actions: src/app/actions/objective-actions.ts
```ts
export async function createObjective(formData: FormData): Promise<void>
export async function updateObjective(id: string, formData: FormData): Promise<void>
```

### Update GoalForm
```tsx
// New fields:
// - goal_type: select (standard/strategic/operational/personal/team)
// - objective_id: select (optional — link to an objective)
// - key_result_type: select (metric/milestone/activity) — shown when objective_id set
// - target_value, current_value, unit — shown when key_result_type = 'metric'
```

### Update goal-data.ts
```ts
// Add goal_type, key_result_type, target_value, current_value, unit to GoalWithCounts type
// Update fetchWorkspaceGoals() select to include new fields
// Update fetchGoalById() select to include new fields
```

### Sidebar Update
```tsx
import { CircleTarget } from 'lucide-react'
// Add: { href: '/objectives', label: 'Objectives', icon: CircleTarget }
```

### Files Changed (Phase B)
| File | Op | Description |
|------|----|-------------|
| `supabase/migrations/006_okr_extensions.sql` | CREATE | goal_type enum, KR fields, period |
| `src/lib/objective-data.ts` | CREATE | Objectives data layer |
| `src/lib/goal-data.ts` | MODIFY | Add new fields to types + queries |
| `src/components/okr/objective-card.tsx` | CREATE | |
| `src/components/okr/objective-row.tsx` | CREATE | |
| `src/components/okr/key-result-row.tsx` | CREATE | |
| `src/components/okr/goal-type-badge.tsx` | CREATE | |
| `src/components/okr/progress-ring.tsx` | CREATE | |
| `src/app/(app)/objectives/page.tsx` | CREATE | |
| `src/app/(app)/objectives/new/page.tsx` | CREATE | |
| `src/app/(app)/objectives/[id]/page.tsx` | CREATE | |
| `src/app/(app)/objectives/[id]/edit/page.tsx` | CREATE | |
| `src/app/actions/objective-actions.ts` | CREATE | |
| `src/components/forms/goal-form.tsx` | MODIFY | goal_type + KR fields |
| `src/app/actions/goal-actions.ts` | MODIFY | Handle new fields |
| `src/components/layout/sidebar.tsx` | MODIFY | Add Objectives nav item |

---

## Phase C — Import (CSV / JSON)

### New Page: src/app/(app)/goals/import/page.tsx
Three-step wizard:
1. Upload CSV or paste JSON
2. Preview table with column mapper
3. Confirm + batch insert

### CSV Parser (client-side, no library)
```ts
// src/lib/import-parser.ts
export type ImportRow = { title: string; description?: string; status?: string;
  goal_type?: string; progress_pct?: string; start_date?: string; end_date?: string }

export function parseCSV(text: string): ImportRow[]
export function parseJSON(text: string): ImportRow[]
export function validateImportRows(rows: ImportRow[]): { valid: ImportRow[]; errors: string[] }
```

### Import Form Component: src/components/forms/import-form.tsx
```tsx
'use client'
// Step 1: <input type="file" accept=".csv,.json"> or <textarea> paste area
// Step 2: show parsed rows in preview table, allow column re-mapping
// Step 3: submit button → calls importGoals Server Action
```

### Server Action: src/app/actions/import-actions.ts
```ts
'use server'
export async function importGoals(rows: ImportRow[]): Promise<{ inserted: number; errors: string[] }>
  // Batch insert up to 100 rows
  // Return result counts
```

### Files Changed (Phase C)
| File | Op | Description |
|------|----|-------------|
| `src/lib/import-parser.ts` | CREATE | CSV/JSON parser + validator |
| `src/components/forms/import-form.tsx` | CREATE | 3-step import wizard UI |
| `src/app/(app)/goals/import/page.tsx` | CREATE | Import page |
| `src/app/actions/import-actions.ts` | CREATE | Batch insert Server Action |
| `src/app/(app)/goals/page.tsx` | MODIFY | Add "Import" button next to "New Goal" |

---

## Phase D — Integrations (Jira · Linear · Asana · GitHub)

### DB Migration: supabase/migrations/007_integrations.sql
```sql
CREATE TABLE workspace_integrations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  provider      TEXT NOT NULL CHECK (provider IN ('jira','linear','asana','github')),
  access_token  TEXT,
  refresh_token TEXT,
  settings      JSONB DEFAULT '{}',
  synced_at     TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, provider)
);
ALTER TABLE tasks ADD COLUMN external_id  TEXT;
ALTER TABLE tasks ADD COLUMN source       TEXT;   -- 'jira' | 'linear' | 'asana' | 'github'
ALTER TABLE tasks ADD COLUMN external_url TEXT;
```

### OAuth Flow Per Provider
```
GET /api/integrations/[provider]/authorize
  → redirect to provider OAuth URL with state param

GET /api/integrations/[provider]/callback?code=...
  → exchange code for token
  → upsert workspace_integrations row
  → redirect /settings/integrations

POST /api/integrations/[provider]/sync
  → fetch issues from provider API
  → upsert into tasks (match on external_id to avoid duplicates)
  → update synced_at
```

### Provider API Clients: src/lib/integrations/
```ts
// jira.ts — REST API v3
export async function fetchJiraIssues(token: string, settings: JiraSettings): Promise<ExternalTask[]>

// linear.ts — GraphQL API
export async function fetchLinearIssues(token: string, settings: LinearSettings): Promise<ExternalTask[]>

// asana.ts — REST API
export async function fetchAsanaTasks(token: string, settings: AsanaSettings): Promise<ExternalTask[]>

// github.ts — REST API
export async function fetchGitHubIssues(token: string, settings: GitHubSettings): Promise<ExternalTask[]>

// shared type
type ExternalTask = { externalId: string; title: string; status: string; url: string; dueDate?: string }
```

### Settings Page: src/app/(app)/settings/integrations/page.tsx
```tsx
// Grid of 4 integration cards (Jira, Linear, Asana, GitHub)
// Each card: provider logo, name, Connected/Not connected status
// Connect button → OAuth flow
// If connected: "Sync Now" + "Disconnect" + last synced timestamp
```

### Files Changed (Phase D)
| File | Op | Description |
|------|----|-------------|
| `supabase/migrations/007_integrations.sql` | CREATE | workspace_integrations table |
| `src/lib/integrations/jira.ts` | CREATE | Jira API client |
| `src/lib/integrations/linear.ts` | CREATE | Linear GraphQL client |
| `src/lib/integrations/asana.ts` | CREATE | Asana REST client |
| `src/lib/integrations/github.ts` | CREATE | GitHub REST client |
| `src/app/api/integrations/[provider]/authorize/route.ts` | CREATE | OAuth redirect |
| `src/app/api/integrations/[provider]/callback/route.ts` | CREATE | Token exchange |
| `src/app/api/integrations/[provider]/sync/route.ts` | CREATE | Issue sync |
| `src/app/(app)/settings/integrations/page.tsx` | CREATE | Integration dashboard |
| `src/components/layout/sidebar.tsx` | MODIFY | Add Settings nav item |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Dark theme missed hardcoded colors | Grep for `#fff`, `#000`, `rgb(` after implementation |
| goal_type migration breaks existing rows | `DEFAULT 'standard'` — all rows auto-typed, zero downtime |
| CSV with commas inside quoted values | Detect double-quoted fields in parser |
| Integration OAuth tokens in plain text | Use Supabase Vault or mark tokens as sensitive in settings |
| Integration API rate limits | Track `synced_at`, enforce 5-min minimum between syncs |
| Phase B OKR UI complexity | List view first, detail page second |

---

## Acceptance Criteria

### Phase A
- [ ] Every page renders correctly in dark (no white flash, no unthemed elements)
- [ ] All badge colors readable against dark surfaces
- [ ] Auth pages (login/signup) fully dark
- [ ] `npm run typecheck` passes
- [ ] `npm test` 83/83 passing

### Phase B
- [ ] `/objectives` lists objectives with KR counts and progress
- [ ] Objective detail shows all linked Key Results
- [ ] GoalForm includes goal_type selector + KR fields
- [ ] DB migration applies cleanly (existing goals unaffected)

### Phase C
- [ ] Can upload a `.csv` file and preview parsed rows
- [ ] Column mapping works for all optional fields
- [ ] Batch insert creates goals and redirects to `/goals`
- [ ] Invalid rows show error messages (not silently dropped)

### Phase D
- [ ] Can connect Jira/Linear/Asana/GitHub via OAuth
- [ ] Sync pulls issues and creates tasks linked to the correct goal
- [ ] Duplicate syncs don't create duplicate tasks (external_id dedup)

---

## SESSION_ID (for /ccg:execute)
- CODEX_SESSION: N/A
- GEMINI_SESSION: N/A
