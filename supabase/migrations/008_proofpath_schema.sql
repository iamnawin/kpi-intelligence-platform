-- ProofPath Phase 1: Schema extensions
-- Adds ProofPath-specific columns to goals table and creates achievement_records stub

-- Add ProofPath columns to goals (non-breaking, nullable)
ALTER TABLE goals
  ADD COLUMN IF NOT EXISTS outcome_summary     TEXT,
  ADD COLUMN IF NOT EXISTS period_label        TEXT,          -- e.g. "Q1 2026", "H1 2026"
  ADD COLUMN IF NOT EXISTS achievement_type    TEXT           -- 'delivered' | 'led' | 'contributed' | 'improved'
    CHECK (achievement_type IN ('delivered', 'led', 'contributed', 'improved'));

-- Achievement records: frozen proof snapshots created on manager approval
CREATE TABLE IF NOT EXISTS achievement_records (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  achievement_id  UUID        NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  member_id       UUID        NOT NULL REFERENCES workspace_members(id) ON DELETE CASCADE,
  workspace_id    UUID        NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  snapshot_data   JSONB       NOT NULL DEFAULT '{}',    -- frozen state at approval time
  approved_by     UUID        REFERENCES workspace_members(id),
  approved_at     TIMESTAMPTZ,
  is_portable     BOOLEAN     NOT NULL DEFAULT false,
  export_token    TEXT        UNIQUE,                   -- for shareable links
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (achievement_id)                               -- one record per achievement
);

-- RLS: members can only see their own workspace's achievement records
ALTER TABLE achievement_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace members can view achievement records"
  ON achievement_records FOR SELECT
  USING (is_workspace_member(workspace_id));

CREATE POLICY "workspace members can insert achievement records"
  ON achievement_records FOR INSERT
  WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "workspace members can update achievement records"
  ON achievement_records FOR UPDATE
  USING (is_workspace_member(workspace_id));

-- Index for fast member lookups
CREATE INDEX IF NOT EXISTS achievement_records_member_id_idx
  ON achievement_records (member_id);

CREATE INDEX IF NOT EXISTS achievement_records_workspace_id_idx
  ON achievement_records (workspace_id);
