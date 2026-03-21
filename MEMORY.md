# ProofPath — Project Memory

High-level log of every milestone completed in this project, in order.
For file-by-file details see → `PROJECT_STRUCTURE.md`

---

## What Is This Project?

**ProofPath** is an AI-native performance intelligence platform.
It lets teams track KPIs, set goals, and build an evidence trail —
so every business decision is backed by verifiable proof.

Working name during early development: *KPI Intelligence Platform*.

---

## Milestones Completed

### Milestone 1 — UI Skeleton
- Built the initial Next.js App Router shell
- Created `AppShell` (sidebar + filter bar), `KPICard`, `HeroKPI`, `KPISection`, `AIInsightStrip`, `TrendBadge`
- Added mock data layer (`src/lib/mock-data.ts`) with 6 KPIs and alert definitions
- Dashboard and KPI detail pages render from mock data

### Milestone 2 — Connect Frontend → Core Engine
- Discovered `core/` rule-based engine (`evaluateKpi.js`, YAML-driven config, confidence scoring)
- Created Express API server (`server/`) on port 3001 running alongside Next.js on port 3000
- Built adapter layer (`server/adapters/kpi-to-config.js`) — maps flat API payload → engine config shape
- Added two API routes: `POST /api/evaluate` (single KPI) and `GET /api/kpis` (all 6 KPIs)
- Added Next.js rewrite proxy: `/api/*` → `http://localhost:3001/api/*`
- Created `src/lib/api.ts` with SSR-safe fetch + mock fallback
- Dashboard page now fetches live data from engine; KPI detail page shows engine insight + confidence score
- **Critical bug fixed**: root `app/` directory conflicted with `src/app/` in Next.js App Router — renamed to `server/`

### Milestone 3 — ProofPath Database Schema
- Created Supabase project: `erlbxyjpjxfkokhbkuds` (region: ap-south-1)
- Deployed 13-table production schema:
  `workspaces`, `workspace_members`, `objectives`, `goals`, `tasks`, `milestones`, `outcomes`,
  `kpis`, `kpi_values`, `evidence`, `insights`, `action_items`, `achievement_records`
- Custom ENUMs: `trust_level` (6 levels), `workspace_role`, `goal_status`, `task_status`
- Trust levels (ProofPath differentiator): `draft → self_reported → imported → reviewer_approved → system_verified → locked_proof`
- 22 performance indexes deployed
- Row Level Security (RLS) enabled on all tables via `is_workspace_member()` helper function
- Migrations saved locally: `supabase/migrations/001–004`
- Supabase clients wired: browser (`src/lib/supabase.ts`) + server admin (`server/lib/supabase-admin.js`)

### Milestone 4 — Workspace + Auth Setup
- Installed `@supabase/ssr` for cookie-based session management in Next.js App Router
- Applied Migration 005: `create_workspace` Postgres RPC (SECURITY DEFINER) — atomically creates workspace + inserts user as admin, bypassing RLS
- Updated `src/lib/supabase.ts` → `createBrowserClient` from `@supabase/ssr`
- Created `src/lib/supabase-server.ts` — `createServerSupabaseClient` for Server Components
- Created `src/middleware.ts` — protects all routes, redirects unauthenticated users to `/login`, injects `x-pathname` header
- Restructured routes into two groups:
  - `(auth)/` — login, signup (no AppShell, centered card layout)
  - `(app)/` — all protected pages (auth guard + workspace check + AppShell)
- Created: login page, signup page, auth callback handler (`/auth/callback`)
- Created: onboarding page — workspace name form → calls `create_workspace` RPC → redirects `/`
- Moved all existing pages (dashboard, alerts, insights, kpi detail) into `(app)/`
- Root layout stripped to bare HTML — AppShell now lives only inside `(app)/layout.tsx`
- Build verified: all 12 routes compile, middleware active (80.7 kB)

### Milestone 5 — KPI Data Layer (Supabase)
- Created `src/lib/kpi-data.ts` with `fetchWorkspaceKPIs()` and `fetchKPIById()` backed by Supabase
- Dashboard now reads real KPIs from DB; falls back to mock data when DB is empty
- KPI detail page tries DB first (UUID route), falls back to mock (slug route)

### Milestone 6 — Goals Layer
- Created `src/lib/goal-data.ts` with `fetchWorkspaceGoals()`, `fetchGoalById()` + full type definitions
- `GoalWithCounts`: goal + sub_goal_count, task_count, task_done_count, kpi_count, evidence
- `GoalRow` component: hierarchical list with depth indentation, status dots, meta row
- `GoalCard` component: card with progress bar, status + trust badges, KPI count
- `EvidenceCard` component: type icon, trust badge, source link
- `TrustBadge` + `GoalStatusBadge` components
- `/goals` page: hierarchical tree (top-level + sub-goals), sorted by status priority
- `/goals/[id]` detail page: progress card, linked KPIs with sparklines, evidence grid

### Milestone 7 — Tasks Layer
- `TaskRecord`, `TaskStatus` types added to `goal-data.ts`
- `fetchGoalById` extended to return `tasks[]`
- `TaskRow` component: status icon, assignee, due date, status badge
- Goal detail page shows Tasks section with task count and done count

### Milestone 8 — Vitest Test Suite
- Installed Vitest + @testing-library/react + jsdom
- `vitest.config.ts`: jsdom environment, React plugin, @/ alias
- `vitest.setup.tsx`: jest-dom + mocks for next/link, next/navigation, server-only
- 83 tests across 8 test files — all passing:
  - `utils.test.ts` (11), `trust-badge.test.tsx` (8), `goal-status-badge.test.tsx` (8)
  - `trend-badge.test.tsx` (7), `goal-card.test.tsx` (8), `goal-row.test.tsx` (12)
  - `task-row.test.tsx` (11), `evidence-card.test.tsx` (12)

### Milestone 9 — Create/Edit Forms with Server Actions
- `src/app/actions/goal-actions.ts`: `createGoal` + `updateGoal` Server Actions
- `src/app/actions/task-actions.ts`: `createTask` Server Action
- `src/components/forms/goal-form.tsx`: GoalForm client component (create/edit modes)
- `src/components/forms/task-form.tsx`: collapsible inline task form
- `/goals/new` + `/goals/[id]/edit` pages created
- Goals list: "New Goal" button; Goal detail: "Edit" button + inline TaskForm

### Milestone 10 — Phase E: Personalized Dashboard (committed 2026-03-21)
- `src/lib/auth.ts`: `getSession()` — resolves userId, role, displayName from Supabase Auth + workspace_members
- `src/lib/dashboard-data.ts`: `fetchDashboardData(view, userId)` — personal filters by owner_id, company returns all
- `src/components/dashboard/view-selector.tsx`: Personal/Team/Company segmented control; writes `?view=` param + localStorage
- `src/components/dashboard/personal-view.tsx`: "Good to see you, {name}" + My Active Goals + KPI Snapshot
- `src/components/dashboard/team-view.tsx`: Rollup stats + completion bar + Team Goals grid
- `src/components/dashboard/executive-strip.tsx`: Blue summary bar with 5 headline numbers (company view only)
- `src/app/(app)/page.tsx`: accepts `?view=` searchParam; admin default = company, member default = personal
- **Pushed to GitHub main** (commit `ebc842c`)

### Milestone 10 — Phase D: External Integrations (committed 2026-03-21)
- `supabase/migrations/007_integrations.sql`: `workspace_integrations` table, `external_id/source/external_url` on tasks
- `src/lib/integrations/`: `types.ts`, `jira.ts` (REST v3), `linear.ts` (GraphQL), `asana.ts` (REST), `github.ts` (REST)
- `src/app/api/integrations/[provider]/authorize/route.ts`: OAuth redirect (Jira/Linear/Asana/GitHub)
- `src/app/api/integrations/[provider]/callback/route.ts`: token exchange + upsert
- `src/app/api/integrations/[provider]/sync/route.ts`: task upsert dedup on `(workspace_id,source,external_id)`, 5-min cooldown
- `src/components/integrations/integration-card.tsx`: Sync Now / Connect / Reconnect card
- `src/app/(app)/settings/integrations/page.tsx`: integrations dashboard page
- `src/components/layout/sidebar.tsx`: added Integrations nav item
- **Env vars required**: `JIRA_CLIENT_ID`, `LINEAR_CLIENT_ID`, `ASANA_CLIENT_ID`, `GITHUB_CLIENT_ID` + secrets + `NEXT_PUBLIC_APP_URL`
- **Pushed to GitHub main** (commit `838bd5b`)

### Milestone 10 — Phase C: CSV/JSON Goal Import (committed 2026-03-21)
- `src/lib/import-parser.ts`: `parseCSV` (quoted-field support), `parseJSON` (array or `{ goals: [...] }`), `validateImportRows` (status/type enum + progress range checks)
- `src/app/actions/import-actions.ts`: `importGoals` Server Action — batch insert up to 100 rows, returns `{ inserted, errors }`, calls `revalidatePath('/goals')`
- `src/components/forms/import-form.tsx`: 3-step wizard (Upload file/paste → Preview table → Done result card)
- `src/app/(app)/goals/import/page.tsx`: `/goals/import` route
- `src/app/(app)/goals/page.tsx`: "Import" button added next to "New Goal"
- **Pushed to GitHub main** (commit `3c8d239`)

### Milestone 10 — Phase B: OKR Structure (committed 2026-03-21)
- `supabase/migrations/006_okr_extensions.sql`: ENUMs `goal_type`, `key_result_type`; added columns to goals + objectives
- `src/lib/goal-data.ts`: extended `GoalWithCounts` with `objective_id`, `goal_type`, `kr_type`, `target_value`, `current_value`, `unit`
- `src/lib/objective-data.ts`: `ObjectiveWithKRs`, `fetchWorkspaceObjectives`, `fetchObjectiveById`
- `src/components/okr/`: `GoalTypeBadge`, `ProgressRing` (SVG circle), `ObjectiveCard`, `ObjectiveRow`, `KeyResultRow`
- `src/components/forms/objective-form.tsx`: create/edit objective
- `src/app/actions/objective-actions.ts`: `createObjective`, `updateObjective` Server Actions
- `src/app/(app)/objectives/`: list, new, `[id]` detail, `[id]/edit` pages
- `GoalForm` extended: goal_type select, "Link to Objective" toggle, kr_type, metric fields
- Test fixtures updated with new required GoalWithCounts fields; 83 tests passing
- **Pushed to GitHub main**

### Milestone 10 — Phase A: Dark Theme (committed 2026-03-21)
- `tailwind.config.ts`: added `darkMode: 'class'`
- `globals.css`: `.dark` CSS variables (`#09090b` bg, `#fafafa` text)
- `layout.tsx` + `(auth)/layout.tsx`: forced dark via `<html className="dark">`
- 30 files updated with systematic `dark:` Tailwind variants:
  - Layout: app-shell, sidebar, filter-bar
  - Goal components: goal-card, goal-row, task-row, evidence-card
  - Badges: trust-badge, goal-status-badge (all 6/5 states with dark variants)
  - KPI: hero-kpi, kpi-card, kpi-section, trend-badge, ai-insight-strip
  - Forms: goal-form, task-form
  - Pages: dashboard, goals, goal detail, new/edit goal, kpi detail, alerts, insights, login, signup
- `npm typecheck`: 0 errors | `npm test`: 83/83 passing
- **Pushed to GitHub main**

---

## Current Status

**Phase**: M10 COMPLETE — All 5 phases (A+B+C+D+E) shipped ✅

**Auth flow**:
```
/signup → email confirm → /onboarding → create workspace → /dashboard
/login  → check workspace → / (dashboard) or /onboarding
```

**What works**:
- Full auth flow with Supabase Auth (email + password)
- Workspace creation with RLS-safe RPC
- Route protection via Next.js middleware
- Dashboard shows live KPI data from core engine (falls back to mock)
- Goals layer: list, detail, create, edit — all with Supabase backend
- Tasks inline form on goal detail page
- Evidence cards with trust levels
- Full dark theme across all pages (forced dark, no toggle)
- 83 passing tests

**M10 All Phases Complete** — No remaining phases.

---

## Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| Express separate from Next.js | KPI engine is Node.js / CommonJS — keeps it isolated from React/SSR concerns |
| Supabase RPC for workspace creation | SECURITY DEFINER bypasses RLS atomically; no Express round-trip needed |
| `@supabase/ssr` over `@supabase/supabase-js` | Cookie-based sessions work correctly with Next.js Server Components and middleware |
| Route groups `(auth)` / `(app)` | Clean separation: auth pages have no sidebar; app pages always require session |
| Trust levels as ENUM not booleans | 6-stage evidence quality progression is ProofPath's core differentiator vs. plain dashboards |
| Adapter pattern in server/ | Decouples API payload shape from engine config — engine stays unchanged |

---

## Infrastructure

| Service | Detail |
|---------|--------|
| Supabase project | `erlbxyjpjxfkokhbkuds` · ap-south-1 |
| Frontend | Next.js 15 · port 3000 |
| Backend API | Express 4 · port 3001 |
| DB | PostgreSQL via Supabase · 13 tables · RLS enabled |
| Auth | Supabase Auth · email + password · cookie-based sessions |

---

## Pending Manual Step

Fill in `.env.local`:
```
SUPABASE_SERVICE_ROLE_KEY=<get from Supabase Dashboard → Settings → API>
```
