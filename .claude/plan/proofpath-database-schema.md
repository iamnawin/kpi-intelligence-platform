# 📋 실시 계획：ProofPath Core Database Schema (Supabase)

## Task Type
- [x] 후端 (→ Codex / Claude)

---

## Supabase Project Status

| Project | Status | Region |
|---------|--------|--------|
| ReminderBuddy | INACTIVE | ap-south-1 |
| PlotDNA AI | INACTIVE | ap-northeast-1 |
| Applyo | ACTIVE_HEALTHY | ap-northeast-2 |

**⚠️ No ProofPath project exists yet.**
**Action required before execution:** Create a new Supabase project named "ProofPath" (or reuse an existing one).

---

## Schema Design

### Enums

```sql
CREATE TYPE trust_level AS ENUM (
  'draft',            -- 0: not submitted
  'self_reported',    -- 1: manual input by user
  'imported',         -- 2: uploaded file/CSV
  'reviewer_approved',-- 3: manager validated
  'system_verified',  -- 4: integrated system data
  'locked_proof'      -- 5: tamper-proof, signed
);

CREATE TYPE workspace_role AS ENUM ('employee', 'manager', 'executive', 'admin');
CREATE TYPE goal_status AS ENUM ('not_started', 'in_progress', 'at_risk', 'completed', 'cancelled');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'blocked', 'done', 'cancelled');
```

### Entity Relationship (simplified)

```
workspaces
    │
    ├── workspace_members (user_id → auth.users, role)
    │
    ├── objectives
    │       └── goals (parent_goal_id → self, for sub-goals)
    │               ├── tasks
    │               ├── milestones
    │               └── outcomes
    │                       └── kpis
    │                               └── kpi_values (time-series)
    │
    ├── evidence (polymorphic → goal | task | outcome | kpi)
    │
    ├── insights (AI-generated, per goal | kpi | member)
    │       └── action_items
    │
    └── achievement_records (member → approved outcomes/KPIs)
```

---

## Migration SQL

### Migration 1: Extensions + Enums

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE trust_level AS ENUM (
  'draft', 'self_reported', 'imported',
  'reviewer_approved', 'system_verified', 'locked_proof'
);
CREATE TYPE workspace_role AS ENUM ('employee', 'manager', 'executive', 'admin');
CREATE TYPE goal_status AS ENUM ('not_started', 'in_progress', 'at_risk', 'completed', 'cancelled');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'blocked', 'done', 'cancelled');
```

### Migration 2: Core Tables

```sql
-- Workspaces (one per company)
CREATE TABLE workspaces (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Workspace members
CREATE TABLE workspace_members (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role         workspace_role NOT NULL DEFAULT 'employee',
  display_name TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

-- Objectives (company-level)
CREATE TABLE objectives (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  owner_id     UUID REFERENCES workspace_members(id),
  status       goal_status DEFAULT 'not_started',
  start_date   DATE,
  end_date     DATE,
  trust_level  trust_level DEFAULT 'draft',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Goals (self-referential for sub-goals)
CREATE TABLE goals (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id   UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  objective_id   UUID REFERENCES objectives(id) ON DELETE SET NULL,
  parent_goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
  title          TEXT NOT NULL,
  description    TEXT,
  owner_id       UUID REFERENCES workspace_members(id),
  status         goal_status DEFAULT 'not_started',
  progress_pct   INTEGER DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  start_date     DATE,
  end_date       DATE,
  trust_level    trust_level DEFAULT 'draft',
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks
CREATE TABLE tasks (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  goal_id      UUID REFERENCES goals(id) ON DELETE SET NULL,
  title        TEXT NOT NULL,
  description  TEXT,
  assignee_id  UUID REFERENCES workspace_members(id),
  status       task_status DEFAULT 'todo',
  due_date     DATE,
  trust_level  trust_level DEFAULT 'draft',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Milestones
CREATE TABLE milestones (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  goal_id      UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  due_date     DATE,
  completed_at TIMESTAMPTZ,
  trust_level  trust_level DEFAULT 'draft',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Outcomes (results produced by goals/tasks)
CREATE TABLE outcomes (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  goal_id      UUID REFERENCES goals(id) ON DELETE SET NULL,
  task_id      UUID REFERENCES tasks(id) ON DELETE SET NULL,
  title        TEXT NOT NULL,
  description  TEXT,
  owner_id     UUID REFERENCES workspace_members(id),
  trust_level  trust_level DEFAULT 'self_reported',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- KPI definitions
CREATE TABLE kpis (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  goal_id      UUID REFERENCES goals(id) ON DELETE SET NULL,
  outcome_id   UUID REFERENCES outcomes(id) ON DELETE SET NULL,
  name         TEXT NOT NULL,
  unit         TEXT,       -- '$', '%', 'count'
  category     TEXT,       -- 'revenue', 'customer', 'operations', 'growth'
  threshold    NUMERIC,    -- alert threshold (engine uses this)
  owner_id     UUID REFERENCES workspace_members(id),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- KPI values (time-series)
CREATE TABLE kpi_values (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  kpi_id       UUID NOT NULL REFERENCES kpis(id) ON DELETE CASCADE,
  value        NUMERIC NOT NULL,
  recorded_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  period_label TEXT,       -- 'Q1 2026', 'March 2026'
  trust_level  trust_level DEFAULT 'self_reported',
  recorded_by  UUID REFERENCES workspace_members(id),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Evidence (polymorphic)
CREATE TABLE evidence (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  goal_id       UUID REFERENCES goals(id) ON DELETE SET NULL,
  task_id       UUID REFERENCES tasks(id) ON DELETE SET NULL,
  outcome_id    UUID REFERENCES outcomes(id) ON DELETE SET NULL,
  kpi_id        UUID REFERENCES kpis(id) ON DELETE SET NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  evidence_type TEXT NOT NULL, -- 'document', 'link', 'metric', 'screenshot', 'note'
  source_url    TEXT,
  file_path     TEXT,
  uploaded_by   UUID REFERENCES workspace_members(id),
  reviewed_by   UUID REFERENCES workspace_members(id),
  trust_level   trust_level DEFAULT 'self_reported',
  locked_at     TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Insights (AI-generated by KPI engine / Claude)
CREATE TABLE insights (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id   UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  goal_id        UUID REFERENCES goals(id) ON DELETE SET NULL,
  kpi_id         UUID REFERENCES kpis(id) ON DELETE SET NULL,
  member_id      UUID REFERENCES workspace_members(id) ON DELETE SET NULL,
  insight_type   TEXT NOT NULL, -- 'risk', 'achievement', 'coaching', 'summary'
  audience_role  workspace_role,
  content        TEXT NOT NULL,
  confidence     NUMERIC CHECK (confidence BETWEEN 0 AND 1),
  engine_version TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Action items (from insights)
CREATE TABLE action_items (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  insight_id   UUID REFERENCES insights(id) ON DELETE CASCADE,
  goal_id      UUID REFERENCES goals(id) ON DELETE SET NULL,
  assigned_to  UUID REFERENCES workspace_members(id),
  title        TEXT NOT NULL,
  status       task_status DEFAULT 'todo',
  due_date     DATE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Achievement records (approved, portable-ready)
CREATE TABLE achievement_records (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  member_id    UUID NOT NULL REFERENCES workspace_members(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  outcome_id   UUID REFERENCES outcomes(id) ON DELETE SET NULL,
  kpi_id       UUID REFERENCES kpis(id) ON DELETE SET NULL,
  approved_by  UUID REFERENCES workspace_members(id),
  approved_at  TIMESTAMPTZ,
  trust_level  trust_level DEFAULT 'self_reported',
  is_portable  BOOLEAN DEFAULT FALSE,
  locked_at    TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
```

### Migration 3: Indexes

```sql
CREATE INDEX idx_goals_workspace       ON goals(workspace_id);
CREATE INDEX idx_goals_objective       ON goals(objective_id);
CREATE INDEX idx_goals_parent          ON goals(parent_goal_id);
CREATE INDEX idx_tasks_workspace       ON tasks(workspace_id);
CREATE INDEX idx_tasks_goal            ON tasks(goal_id);
CREATE INDEX idx_kpi_values_kpi        ON kpi_values(kpi_id);
CREATE INDEX idx_kpi_values_recorded   ON kpi_values(kpi_id, recorded_at DESC);
CREATE INDEX idx_evidence_workspace    ON evidence(workspace_id);
CREATE INDEX idx_insights_workspace    ON insights(workspace_id);
CREATE INDEX idx_achievements_member   ON achievement_records(member_id);
CREATE INDEX idx_ws_members_user       ON workspace_members(user_id);
```

### Migration 4: RLS

```sql
-- Enable RLS
ALTER TABLE workspaces          ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members   ENABLE ROW LEVEL SECURITY;
ALTER TABLE objectives          ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals               ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks               ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones          ENABLE ROW LEVEL SECURITY;
ALTER TABLE outcomes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpis                ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_values          ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence            ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights            ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_records ENABLE ROW LEVEL SECURITY;

-- Helper: is current user a member of this workspace?
CREATE OR REPLACE FUNCTION is_workspace_member(ws_id UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = ws_id AND user_id = auth.uid()
  );
$$;

-- Helper: get current user's role in workspace
CREATE OR REPLACE FUNCTION workspace_member_role(ws_id UUID)
RETURNS workspace_role LANGUAGE sql SECURITY DEFINER AS $$
  SELECT role FROM workspace_members
  WHERE workspace_id = ws_id AND user_id = auth.uid()
  LIMIT 1;
$$;

-- Policies
CREATE POLICY "members_read_workspace"   ON workspaces FOR SELECT USING (is_workspace_member(id));
CREATE POLICY "members_read_ws_members"  ON workspace_members FOR SELECT USING (is_workspace_member(workspace_id));

-- Objectives: all read, manager+ write
CREATE POLICY "read_objectives"  ON objectives FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "write_objectives" ON objectives FOR ALL   USING (workspace_member_role(workspace_id) IN ('manager','executive','admin'));

-- Goals: all read, manager+ write
CREATE POLICY "read_goals"  ON goals FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "write_goals" ON goals FOR ALL   USING (workspace_member_role(workspace_id) IN ('manager','executive','admin'));

-- Tasks: all read, assignee or manager write
CREATE POLICY "read_tasks"   ON tasks FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "insert_tasks" ON tasks FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "update_tasks" ON tasks FOR UPDATE USING (
  assignee_id = (SELECT id FROM workspace_members WHERE user_id = auth.uid() AND workspace_id = tasks.workspace_id)
  OR workspace_member_role(workspace_id) IN ('manager','admin')
);

-- Milestones: all read, manager+ write
CREATE POLICY "read_milestones"  ON milestones FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "write_milestones" ON milestones FOR ALL   USING (workspace_member_role(workspace_id) IN ('manager','executive','admin'));

-- Outcomes: all read + write (employees can log outcomes)
CREATE POLICY "read_outcomes"  ON outcomes FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "write_outcomes" ON outcomes FOR ALL   USING (is_workspace_member(workspace_id));

-- KPIs: all read, manager+ define
CREATE POLICY "read_kpis"  ON kpis FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "write_kpis" ON kpis FOR ALL   USING (workspace_member_role(workspace_id) IN ('manager','executive','admin'));

-- KPI values: all read + write (any member can record a value)
CREATE POLICY "read_kpi_values"  ON kpi_values FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "write_kpi_values" ON kpi_values FOR ALL   USING (is_workspace_member(workspace_id));

-- Evidence: all read + write
CREATE POLICY "read_evidence"  ON evidence FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "write_evidence" ON evidence FOR ALL   USING (is_workspace_member(workspace_id));

-- Insights: read only (written by system/AI)
CREATE POLICY "read_insights" ON insights FOR SELECT USING (is_workspace_member(workspace_id));

-- Action items: all read + write
CREATE POLICY "read_action_items"  ON action_items FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "write_action_items" ON action_items FOR ALL   USING (is_workspace_member(workspace_id));

-- Achievement records: member reads own, manager reads all; manager approves
CREATE POLICY "read_achievements" ON achievement_records FOR SELECT USING (
  member_id = (SELECT id FROM workspace_members WHERE user_id = auth.uid() AND workspace_id = achievement_records.workspace_id)
  OR workspace_member_role(workspace_id) IN ('manager','executive','admin')
);
CREATE POLICY "write_achievements" ON achievement_records FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "approve_achievements" ON achievement_records FOR UPDATE USING (
  workspace_member_role(workspace_id) IN ('manager','admin')
);
```

---

## Required Files to Create/Modify

| File | Operation | Description |
|------|-----------|-------------|
| `supabase/migrations/001_enums.sql` | CREATE | Type definitions |
| `supabase/migrations/002_tables.sql` | CREATE | All core tables |
| `supabase/migrations/003_indexes.sql` | CREATE | Performance indexes |
| `supabase/migrations/004_rls.sql` | CREATE | RLS enable + policies |
| `.env.local` | CREATE/MODIFY | SUPABASE_URL + SUPABASE_ANON_KEY |
| `src/lib/supabase.ts` | CREATE | Supabase client for frontend |
| `server/lib/supabase-admin.js` | CREATE | Service role client for Express |

---

## Implementation Steps

1. **Create Supabase project** named "ProofPath" via dashboard (or MCP `create_project`)
2. **Apply migrations** via `mcp__claude_ai_Supabase__apply_migration` (4 migrations in order)
3. **Create migration files** in `supabase/migrations/` for source control
4. **Add env vars** — `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
5. **Create Supabase clients** — browser client in `src/lib/supabase.ts`, admin client in `server/lib/supabase-admin.js`
6. **Verify schema** with `list_tables` MCP call

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| No ProofPath Supabase project exists | Create new project first (free tier available) |
| Supabase project creation takes ~2 min | Plan for wait time during execution |
| `auth.users` reference requires Supabase Auth enabled | Enable Auth in project settings before applying migrations |
| RLS helper functions need `SECURITY DEFINER` to bypass RLS on self-lookup | Already included in migration 4 |
| `insight` writes come from server (service role) not user | Use service role client in `server/` for AI-generated inserts |

---

## SESSION_ID（供 /ccg:execute 使用）
- CODEX_SESSION: N/A (schema designed by Claude from product-foundation.md)
- GEMINI_SESSION: N/A
