# ProofPath — Complete Project Structure

Every file in the project with its purpose.
Jump directly to any section to understand what a file does and when to touch it.

For the milestone history → see `MEMORY.md`

---

## Directory Tree

```
kpi-intelligence-platform/
│
├── core/                              ← Rule-based KPI evaluation engine (source of truth)
│   ├── ai/
│   │   └── explanation.stub.js        ← AI explanation stub (real AI layer comes in Step 4)
│   ├── engine/
│   │   ├── decision_engine.yaml       ← Example engine config / reference schema
│   │   ├── evaluateKpi.js             ← Core evaluation function (percentage change, thresholds)
│   │   ├── loadConfig.js              ← Loads and validates YAML engine configs
│   │   └── runEngine.js               ← CLI entry point for running the engine directly
│   ├── schemas/
│   │   └── output.schema.json         ← JSON Schema for engine output (insight, actions, confidence)
│   ├── trust/
│   │   └── confidence.js              ← Confidence scoring logic
│   └── package.json                   ← Separate package.json (CommonJS, no React deps)
│
├── server/                            ← Express API server (port 3001)
│   ├── adapters/
│   │   └── kpi-to-config.js           ← Maps flat API payload → engine config shape
│   ├── lib/
│   │   └── supabase-admin.js          ← Supabase service-role client (server-only, bypasses RLS)
│   ├── routes/
│   │   └── kpi.js                     ← API routes: POST /api/evaluate, GET /api/kpis
│   └── server.js                      ← Express entry point, CORS config, mounts routes
│
├── src/                               ← Next.js 15 App Router frontend
│   ├── app/
│   │   ├── (app)/                     ← Protected route group — requires auth + workspace
│   │   │   ├── layout.tsx             ← Auth guard: checks session + workspace → renders AppShell
│   │   │   ├── page.tsx               ← Dashboard (Hero KPI + KPI sections + Active Goals)
│   │   │   ├── alerts/
│   │   │   │   └── page.tsx           ← Alerts page (KPI threshold violations)
│   │   │   ├── goals/
│   │   │   │   ├── page.tsx           ← Goals list (hierarchical rows, sorted by status)
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx       ← Goal detail (progress, tasks, linked KPIs, evidence)
│   │   │   ├── insights/
│   │   │   │   └── page.tsx           ← AI Insights page (placeholder — M10)
│   │   │   ├── kpis/[id]/
│   │   │   │   └── page.tsx           ← KPI detail (sparkline + engine analysis)
│   │   │   └── onboarding/
│   │   │       └── page.tsx           ← Workspace creation form → calls create_workspace RPC
│   │   │
│   │   ├── (auth)/                    ← Public route group — no AppShell, centered card layout
│   │   │   ├── layout.tsx             ← Minimal HTML + centered flex container
│   │   │   ├── login/
│   │   │   │   └── page.tsx           ← Email + password login form
│   │   │   └── signup/
│   │   │       └── page.tsx           ← Email + password signup + "check email" state
│   │   │
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts           ← Supabase email confirmation handler (code exchange)
│   │   │
│   │   ├── layout.tsx                 ← Root layout — bare HTML shell only
│   │   └── globals.css                ← Tailwind base styles
│   │
│   ├── components/
│   │   ├── dashboard/
│   │   │   └── ai-insight-strip.tsx   ← Top-of-dashboard AI insight preview bar
│   │   │
│   │   ├── goal/                      ← Goal layer components (M6–M8)
│   │   │   ├── evidence-card.tsx      ← Evidence record card (type badge, trust, link, uploader)
│   │   │   ├── goal-card.tsx          ← Goal summary card (title, status, trust, progress, KPI count)
│   │   │   ├── goal-row.tsx           ← Hierarchical goal list row (owner, dates, task counts)
│   │   │   ├── goal-status-badge.tsx  ← Color-coded badge for 5 goal statuses
│   │   │   ├── task-row.tsx           ← Task list row (status icon, assignee, due date)
│   │   │   ├── trust-badge.tsx        ← Color-coded badge for 6 trust levels
│   │   │   └── __tests__/
│   │   │       ├── evidence-card.test.tsx
│   │   │       ├── goal-card.test.tsx
│   │   │       ├── goal-row.test.tsx
│   │   │       ├── goal-status-badge.test.tsx
│   │   │       ├── task-row.test.tsx
│   │   │       └── trust-badge.test.tsx
│   │   │
│   │   ├── kpi/
│   │   │   ├── hero-kpi.tsx           ← Large featured KPI card (primary metric)
│   │   │   ├── kpi-card.tsx           ← Standard KPI summary card
│   │   │   ├── kpi-grid.tsx           ← Grid wrapper for KPI cards
│   │   │   ├── kpi-section.tsx        ← Labeled section grouping multiple KPI cards
│   │   │   ├── trend-badge.tsx        ← Up/down/stable trend indicator badge
│   │   │   └── __tests__/
│   │   │       └── trend-badge.test.tsx
│   │   │
│   │   └── layout/
│   │       ├── app-shell.tsx          ← Main layout: Sidebar + FilterBar + main content
│   │       ├── filter-bar.tsx         ← Top bar with filter controls
│   │       └── sidebar.tsx            ← Left nav sidebar (Dashboard, Goals, Alerts, Insights)
│   │
│   ├── lib/
│   │   ├── api.ts                     ← Frontend API client: fetchKPIs + evaluateKPI, mock fallback
│   │   ├── goal-data.ts               ← Server-only: fetchWorkspaceGoals, fetchGoalById (M6–M8)
│   │   ├── kpi-data.ts                ← Server-only: fetchWorkspaceKPIs, fetchKPIById
│   │   ├── mock-data.ts               ← Static KPI + alert fallback data
│   │   ├── supabase.ts                ← Browser Supabase client (createBrowserClient)
│   │   ├── supabase-server.ts         ← Server Supabase client (cookie-based, for Server Components)
│   │   ├── utils.ts                   ← formatNumber, cn (className merge)
│   │   └── __tests__/
│   │       └── utils.test.ts
│   │
│   └── middleware.ts                  ← Edge middleware: session refresh + route protection
│
├── supabase/
│   └── migrations/
│       ├── 001_enums.sql              ← ENUMs: trust_level, workspace_role, goal_status, task_status
│       ├── 002_tables.sql             ← 13 core tables: workspaces, goals, kpis, evidence…
│       ├── 003_indexes.sql            ← Performance indexes (time-series, workspace scoping)
│       ├── 004_rls.sql                ← Row Level Security policies + helper functions
│       └── 005_create_workspace_rpc.sql ← Atomic workspace + admin member creation RPC
│
├── docs/
│   ├── product-foundation.md          ← ProofPath full vision: 6-layer trust-based platform
│   ├── product.md                     ← Current MVP scope and feature list
│   ├── pricing-and-revenue.md         ← Pricing tiers and revenue model
│   ├── kpi-definitions.md             ← KPI taxonomy and definitions
│   ├── mvp-scope.md                   ← MVP boundaries — what's in/out
│   └── user-roles.md                  ← Role definitions: employee, manager, executive, admin
│
├── .claude/
│   ├── CLAUDE.md                      ← Project instructions for Claude (architecture rules)
│   └── plan/
│       ├── ui-skeleton.md             ← M1: UI skeleton plan
│       ├── connect-frontend-to-engine.md ← M2: API bridge plan
│       ├── proofpath-database-schema.md  ← M3: Database schema plan
│       ├── workspace-auth-setup.md    ← M4: Auth + workspace plan
│       ├── milestone5-real-kpi-data.md   ← M5: Real KPI data layer plan
│       ├── milestone6-goals-kpi-management.md ← M6: Goals layer plan
│       └── milestone9-create-edit-forms.md    ← M9: Create/edit forms plan (next up)
│
├── vitest.config.ts                   ← Vitest test runner config (jsdom + React + @/ alias)
├── vitest.setup.tsx                   ← Test setup: jest-dom + Next.js mocks
├── MEMORY.md                          ← Milestone history + key decisions
├── PROJECT_STRUCTURE.md               ← THIS FILE — every file and its purpose
├── README.md                          ← Public-facing project overview
├── package.json                       ← Root deps + scripts (dev, build, test, typecheck)
├── tsconfig.json                      ← TypeScript config (paths: @/* → src/*)
├── tailwind.config.ts                 ← Tailwind CSS config
└── .env.local                         ← Secrets (gitignored): Supabase URL + keys
```

---

## Milestone Progress

| # | Milestone | Status |
|---|-----------|--------|
| M1 | UI Skeleton — AppShell, KPI cards, mock data | ✅ Done |
| M2 | Connect Frontend → Core Engine (Express API) | ✅ Done |
| M3 | ProofPath Database Schema (13 tables, RLS, enums) | ✅ Done |
| M4 | Auth Layer — login, signup, workspace onboarding | ✅ Done |
| M5 | Real KPI Data — Supabase-backed KPI list + detail | ✅ Done |
| M6 | Goals Layer — list, detail, trust badges, KPI linking | ✅ Done |
| M7 | Evidence Layer — evidence types, EvidenceCard | ✅ Done |
| M8a | Hierarchical Goals List — owner, dates, task counts | ✅ Done |
| M8b | Task Rollup on Goal Detail — TaskRow component | ✅ Done |
| M9 | Create/Edit Forms — Goals, Tasks (Server Actions) | 📋 Planned |
| M10 | AI Insights Page | 🔜 Next |
| M11 | Deploy to Vercel | 🔜 Next |

---

## File Quick Reference

### When you want to…

| Goal | File to open |
|------|-------------|
| Change KPI evaluation logic | `core/engine/evaluateKpi.js` |
| Change confidence scoring | `core/trust/confidence.js` |
| Add a new API endpoint | `server/routes/kpi.js` |
| Use Supabase in a Server Component / Action | `src/lib/supabase-server.ts` |
| Use Supabase in a Client Component | `src/lib/supabase.ts` |
| Use Supabase with admin/service role (Express) | `server/lib/supabase-admin.js` |
| Add a new protected page | Create under `src/app/(app)/` |
| Add a new public page | Create under `src/app/(auth)/` |
| Change route protection rules | `src/middleware.ts` |
| Change sidebar navigation | `src/components/layout/sidebar.tsx` |
| Add/change goal display logic | `src/components/goal/` |
| Add/change KPI display logic | `src/components/kpi/` |
| Change goal data fetching | `src/lib/goal-data.ts` |
| Change KPI data fetching | `src/lib/kpi-data.ts` |
| Add a DB migration | `supabase/migrations/00N_name.sql` |
| Run tests | `npm test` |
| Check types | `npm run typecheck` |

---

## Auth Flow

```
Visitor hits any protected route
    ↓ middleware detects no session
    → redirect /login

/signup  →  supabase.auth.signUp()
             → "Check your email" screen
             → user clicks link → /auth/callback
             → redirect /onboarding  (no workspace yet)

/login   →  supabase.auth.signInWithPassword()
             → has workspace? YES → /   (dashboard)
             →               NO  → /onboarding

/onboarding  →  create_workspace RPC
              →  workspace + admin member created atomically
              →  redirect /
```

---

## Data Flow

```
Browser
  └─ fetchKPIs() [src/lib/api.ts]           ← or fetchWorkspaceKPIs() for DB-backed
       └─ GET /api/kpis [Next.js → port 3001]
            └─ server/routes/kpi.js
                 └─ kpiToConfig() [server/adapters/]
                      └─ evaluateKpi() [core/engine/evaluateKpi.js]
                           → returns { insight, actions, confidence }

Browser → /goals
  └─ fetchWorkspaceGoals() [src/lib/goal-data.ts]   ← Server Component, Supabase direct
       └─ goals + kpi counts + task counts + owner (parallel queries)

Browser → /goals/[id]
  └─ fetchGoalById(id) [src/lib/goal-data.ts]
       └─ goal + linked KPIs + sparklines + evidence + tasks (parallel)
```

---

## Database Schema (13 tables)

| Table | Purpose |
|-------|---------|
| `workspaces` | Top-level tenant — every row scoped to a workspace |
| `workspace_members` | Users + role (employee/manager/executive/admin) per workspace |
| `objectives` | High-level strategic objectives |
| `goals` | Measurable goals linked to objectives (supports sub-goals) |
| `tasks` | Action items linked to goals |
| `milestones` | Key checkpoints within a goal |
| `outcomes` | Actual results achieved against goals |
| `kpis` | KPI definitions (name, unit, target, trust_level) |
| `kpi_values` | Time-series KPI measurements |
| `evidence` | Proof documents/links (polymorphic — goal/task/outcome/kpi) |
| `insights` | AI-generated or human-written analysis |
| `action_items` | Recommended actions from engine/AI insights |
| `achievement_records` | Locked proof records — immutable once sealed |

**Trust levels** (core ProofPath concept):
```
draft → self_reported → imported → reviewer_approved → system_verified → locked_proof
```

---

## Test Coverage

| Suite | Tests | Covers |
|-------|-------|--------|
| `utils.test.ts` | 11 | `formatNumber` ($ / % / other), `cn` merging |
| `trust-badge.test.tsx` | 8 | All 6 trust levels + fallback + element type |
| `goal-status-badge.test.tsx` | 8 | All 5 statuses + color classes + fallback |
| `trend-badge.test.tsx` | 7 | Up/down/stable + color + +/- prefix |
| `goal-card.test.tsx` | 8 | Title, link, badges, progress, KPI count |
| `goal-row.test.tsx` | 12 | Title, depth, owner, task counts, progress, KPIs |
| `task-row.test.tsx` | 11 | All 5 statuses, line-through, meta row |
| `evidence-card.test.tsx` | 12 | All 4 types, link, trust badge, new tab |
| **Total** | **83** | |

---

## Environment Variables

| Variable | Where used | How to get |
|----------|-----------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Frontend + Server Components | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Frontend + Server Components | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Express server (`server/lib/supabase-admin.js`) | Supabase Dashboard → Settings → API |
| `KPI_API_URL` | Server-side Next.js fetches | `http://localhost:3001` (dev) |
| `FRONTEND_URL` | Express CORS config | `http://localhost:3000` (dev) |
