-- Migration 007: Workspace integrations (Jira, Linear, Asana, GitHub)

CREATE TABLE IF NOT EXISTS workspace_integrations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  provider      TEXT NOT NULL CHECK (provider IN ('jira', 'linear', 'asana', 'github')),
  access_token  TEXT,
  refresh_token TEXT,
  settings      JSONB NOT NULL DEFAULT '{}',
  synced_at     TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workspace_id, provider)
);

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS external_id  TEXT,
  ADD COLUMN IF NOT EXISTS source       TEXT CHECK (source IN ('jira', 'linear', 'asana', 'github')),
  ADD COLUMN IF NOT EXISTS external_url TEXT;

CREATE INDEX IF NOT EXISTS idx_integrations_workspace
  ON workspace_integrations(workspace_id);

CREATE INDEX IF NOT EXISTS idx_tasks_external
  ON tasks(workspace_id, source, external_id)
  WHERE external_id IS NOT NULL;

-- RLS: workspace members can read/write their workspace's integrations
ALTER TABLE workspace_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace members can manage integrations"
  ON workspace_integrations
  USING (is_workspace_member(workspace_id));
