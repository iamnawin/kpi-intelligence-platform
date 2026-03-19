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

---

## Current Status

**Phase**: Workspace + Auth complete — ready for real data integration

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

**What's next**:
- Connect KPI engine to real Supabase data (replace mock_data with DB queries)
- Multi-tenant workspace-scoped KPI management
- Goals and evidence linking (the core ProofPath value proposition)

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
