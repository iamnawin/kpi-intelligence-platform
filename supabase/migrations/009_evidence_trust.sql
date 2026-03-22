-- ProofPath Phase 2: Evidence & Trust

-- Add source_type to evidence (tracks where this evidence came from)
ALTER TABLE evidence
  ADD COLUMN IF NOT EXISTS source_type TEXT NOT NULL DEFAULT 'manual'
    CHECK (source_type IN ('manual', 'import', 'github', 'jira', 'linear', 'asana'));

-- Extend achievement_records with ProofPath snapshot columns
ALTER TABLE achievement_records
  ADD COLUMN IF NOT EXISTS achievement_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS snapshot_data  JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS export_token   TEXT UNIQUE;

-- Index for fast evidence lookups per achievement
CREATE INDEX IF NOT EXISTS evidence_goal_id_idx ON evidence (goal_id);
CREATE INDEX IF NOT EXISTS evidence_source_type_idx ON evidence (source_type);
