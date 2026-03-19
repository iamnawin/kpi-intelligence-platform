# ProofPath — Complete Project Structure

Every file in the project with its purpose.
Jump directly to any section to understand what a file does and when to touch it.

For the milestone history → see `MEMORY.md`

---

## Directory Tree

```
kpi-intelligence-platform/
├── core/                          ← Rule-based KPI evaluation engine (source of truth)
│   ├── ai/
│   │   └── explanation.stub.js    ← AI explanation stub (real AI layer comes in Step 4)
│   ├── engine/
│   │   ├── decision_engine.yaml   ← Example engine config / reference schema
│   │   ├── evaluateKpi.js         ← Core evaluation function (percentage change, thresholds)
│   │   ├── loadConfig.js          ← Loads and validates YAML engine configs
│   │   └── runEngine.js           ← CLI entry point for running the engine directly
│   ├── schemas/
│   │   └── output.schema.json     ← JSON Schema for engine output (insight, actions, confidence)
│   ├── trust/
│   │   └── confidence.js          ← Confidence scoring logic
│   └── package.json               ← Separate package.json (CommonJS, no React deps)
│
├── server/                        ← Express API server (port 3001)
│   ├── adapters/
│   │   └── kpi-to-config.js       ← Maps flat API payload → engine config shape
│   ├── lib/
│   │   └── supabase-admin.js      ← Supabase service-role client (server-only, bypasses RLS)
│   ├── routes/
│   │   └── kpi.js                 ← API routes: POST /api/evaluate, GET /api/kpis
│   └── server.js                  ← Express entry point, CORS config, mounts routes
│
├── src/                           ← Next.js 15 App Router frontend
│   ├── app/
│   │   ├── (app)/                 ← Protected route group — requires auth + workspace
│   │   │   ├── layout.tsx         ← Auth guard: checks session + workspace → renders AppShell
│   │   │   ├── page.tsx           ← Dashboard page (Hero KPI + KPI sections)
│   │   │   ├── alerts/
│   │   │   │   └── page.tsx       ← Alerts page (KPI threshold violations)
│   │   │   ├── insights/
│   │   │   │   └── page.tsx       ← AI Insights page (placeholder, Step 4)
│   │   │   ├── kpis/[id]/
│   │   │   │   └── page.tsx       ← KPI detail page (sparkline + engine analysis)
│   │   │   └── onboarding/
│   │   │       └── page.tsx       ← Workspace creation form → calls create_workspace RPC
│   │   │
│   │   ├── (auth)/                ← Public route group — no AppShell, centered card layout
│   │   │   ├── layout.tsx         ← Minimal HTML + centered flex container
│   │   │   ├── login/
│   │   │   │   └── page.tsx       ← Email + password login form
│   │   │   └── signup/
│   │   │       └── page.tsx       ← Email + password signup form + "check email" state
│   │   │
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts       ← Supabase email confirmation handler (code exchange)
│   │   │
│   │   ├── layout.tsx             ← Root layout — bare HTML shell only (no AppShell here)
│   │   └── globals.css            ← Tailwind base styles
│   │
│   ├── components/
│   │   ├── dashboard/
│   │   │   └── ai-insight-strip.tsx  ← Top-of-dashboard AI insight preview bar
│   │   ├── kpi/
│   │   │   ├── hero-kpi.tsx          ← Large featured KPI card (primary metric)
│   │   │   ├── kpi-card.tsx          ← Standard KPI summary card
│   │   │   ├── kpi-grid.tsx          ← Grid wrapper for KPI cards
│   │   │   ├── kpi-section.tsx       ← Labeled section grouping multiple KPI cards
│   │   │   └── trend-badge.tsx       ← Up/down/flat trend indicator badge
│   │   └── layout/
│   │       ├── app-shell.tsx         ← Main layout: Sidebar + FilterBar + main content area
│   │       ├── filter-bar.tsx        ← Top bar with filter controls (UI skeleton for now)
│   │       └── sidebar.tsx           ← Left navigation sidebar with route links
│   │
│   ├── lib/
│   │   ├── api.ts                 ← Frontend API client: fetchKPIs + evaluateKPI, SSR-safe URLs, mock fallback
│   │   ├── mock-data.ts           ← Static KPI and Alert data (fallback when API unavailable)
│   │   ├── supabase.ts            ← Browser Supabase client (createBrowserClient from @supabase/ssr)
│   │   ├── supabase-server.ts     ← Server Supabase client (createServerClient, cookie-based)
│   │   └── utils.ts               ← Shared utilities: formatNumber, cn (className merge)
│   │
│   └── middleware.ts              ← Next.js edge middleware: session refresh + route protection
│
├── supabase/
│   └── migrations/
│       ├── 001_enums.sql          ← Custom ENUMs: trust_level, workspace_role, goal_status, task_status
│       ├── 002_tables.sql         ← 13 core tables: workspaces, workspace_members, goals, kpis, evidence…
│       ├── 003_indexes.sql        ← 22 performance indexes (time-series, workspace scoping, assignee lookup)
│       ├── 004_rls.sql            ← Row Level Security policies + is_workspace_member() helper function
│       └── 005_create_workspace_rpc.sql  ← SECURITY DEFINER RPC: atomic workspace + admin member creation
│
├── docs/
│   ├── product-foundation.md      ← ProofPath full vision: 6-layer trust-based performance platform
│   ├── product.md                 ← Current MVP scope and feature list
│   ├── pricing-and-revenue.md     ← Pricing tiers and revenue model
│   ├── kpi-definitions.md         ← KPI taxonomy and definitions
│   ├── mvp-scope.md               ← MVP boundaries — what's in/out
│   └── user-roles.md              ← Role definitions: employee, manager, executive, admin
│
├── .claude/
│   ├── CLAUDE.md                  ← Project instructions for Claude (architecture rules, anti-patterns)
│   └── plan/
│       ├── workspace-auth-setup.md       ← Auth + workspace implementation plan (Milestone 4)
│       ├── proofpath-database-schema.md  ← Database schema design plan (Milestone 3)
│       ├── connect-frontend-to-engine.md ← API bridge design plan (Milestone 2)
│       └── ui-skeleton.md               ← UI component plan (Milestone 1)
│
├── MEMORY.md                      ← ← YOU ARE HERE — milestone history + key decisions
├── PROJECT_STRUCTURE.md           ← ← THIS FILE — every file and its purpose
├── README.md                      ← Public-facing project overview
├── package.json                   ← Root deps + dev scripts (next dev + node server/server.js)
├── tsconfig.json                  ← TypeScript config (paths: @/* → src/*)
├── tailwind.config.ts             ← Tailwind CSS config
└── .env.local                     ← Secrets (gitignored): Supabase URL, anon key, service role key
```

---

## File Quick Reference

### When you want to…

| Goal | File to open |
|------|-------------|
| Change KPI evaluation logic | `core/engine/evaluateKpi.js` |
| Change confidence scoring | `core/trust/confidence.js` |
| Add a new API endpoint | `server/routes/kpi.js` + `server/adapters/kpi-to-config.js` |
| Change how API payload maps to engine | `server/adapters/kpi-to-config.js` |
| Use Supabase in a server action / API route | `src/lib/supabase-server.ts` |
| Use Supabase in a client component | `src/lib/supabase.ts` (call `createClient()`) |
| Use Supabase with admin/service role (Express) | `server/lib/supabase-admin.js` |
| Add a new protected page | Create under `src/app/(app)/` — auth is inherited |
| Add a new public page (no login needed) | Create under `src/app/(auth)/` or `src/app/` root |
| Change route protection rules | `src/middleware.ts` |
| Change sidebar navigation links | `src/components/layout/sidebar.tsx` |
| Add a new KPI card variant | `src/components/kpi/` |
| Change the DB schema | Add a new file `supabase/migrations/00N_name.sql` and apply via Supabase MCP |
| Understand the product vision | `docs/product-foundation.md` |
| Check what's in/out of MVP | `docs/mvp-scope.md` |

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
  └─ fetchKPIs() [src/lib/api.ts]
       └─ GET /api/kpis [Next.js rewrite → localhost:3001]
            └─ server/routes/kpi.js
                 └─ kpiToConfig() [server/adapters/kpi-to-config.js]
                      └─ evaluateKpi() [core/engine/evaluateKpi.js]
                           └─ generateExplanation() [core/ai/explanation.stub.js]
                                → returns { insight, actions, confidence }
```

---

## Database Schema (13 tables)

| Table | Purpose |
|-------|---------|
| `workspaces` | Top-level tenant — every row of data is scoped to a workspace |
| `workspace_members` | Users + their role (employee/manager/executive/admin) per workspace |
| `objectives` | High-level strategic objectives |
| `goals` | Measurable goals linked to objectives (supports sub-goals via self-reference) |
| `tasks` | Action items linked to goals |
| `milestones` | Key checkpoints within a goal |
| `outcomes` | Actual results achieved against goals |
| `kpis` | KPI definitions (name, unit, target, trust_level) |
| `kpi_values` | Time-series KPI measurements |
| `evidence` | Proof documents/links attached to any entity (polymorphic) |
| `insights` | AI-generated or human-written analysis |
| `action_items` | Recommended actions from engine/AI insights |
| `achievement_records` | Locked proof records — immutable once sealed |

**Trust levels** (core ProofPath concept):
```
draft → self_reported → imported → reviewer_approved → system_verified → locked_proof
```

---

## Environment Variables

| Variable | Where used | How to get |
|----------|-----------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Frontend + Server Components | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Frontend + Server Components | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Express server only (`server/lib/supabase-admin.js`) | Supabase Dashboard → Settings → API |
| `KPI_API_URL` | Server-side fetches in Next.js | `http://localhost:3001` (dev) |
| `FRONTEND_URL` | Express CORS config | `http://localhost:3000` (dev) |
