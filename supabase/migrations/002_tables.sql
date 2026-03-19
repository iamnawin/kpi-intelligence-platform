CREATE TABLE workspaces (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workspace_members (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role         workspace_role NOT NULL DEFAULT 'employee',
  display_name TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

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

CREATE TABLE kpis (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  goal_id      UUID REFERENCES goals(id) ON DELETE SET NULL,
  outcome_id   UUID REFERENCES outcomes(id) ON DELETE SET NULL,
  name         TEXT NOT NULL,
  unit         TEXT,
  category     TEXT,
  threshold    NUMERIC,
  owner_id     UUID REFERENCES workspace_members(id),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE kpi_values (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  kpi_id       UUID NOT NULL REFERENCES kpis(id) ON DELETE CASCADE,
  value        NUMERIC NOT NULL,
  recorded_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  period_label TEXT,
  trust_level  trust_level DEFAULT 'self_reported',
  recorded_by  UUID REFERENCES workspace_members(id),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE evidence (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  goal_id       UUID REFERENCES goals(id) ON DELETE SET NULL,
  task_id       UUID REFERENCES tasks(id) ON DELETE SET NULL,
  outcome_id    UUID REFERENCES outcomes(id) ON DELETE SET NULL,
  kpi_id        UUID REFERENCES kpis(id) ON DELETE SET NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  evidence_type TEXT NOT NULL,
  source_url    TEXT,
  file_path     TEXT,
  uploaded_by   UUID REFERENCES workspace_members(id),
  reviewed_by   UUID REFERENCES workspace_members(id),
  trust_level   trust_level DEFAULT 'self_reported',
  locked_at     TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE insights (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id   UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  goal_id        UUID REFERENCES goals(id) ON DELETE SET NULL,
  kpi_id         UUID REFERENCES kpis(id) ON DELETE SET NULL,
  member_id      UUID REFERENCES workspace_members(id) ON DELETE SET NULL,
  insight_type   TEXT NOT NULL,
  audience_role  workspace_role,
  content        TEXT NOT NULL,
  confidence     NUMERIC CHECK (confidence BETWEEN 0 AND 1),
  engine_version TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

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
