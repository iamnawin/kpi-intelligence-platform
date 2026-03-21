-- Migration 006: OKR Extensions
-- Adds goal_type enum, Key Result fields, and extends objectives with period + type

-- Goal type enum
CREATE TYPE goal_type AS ENUM (
  'standard',
  'strategic',
  'operational',
  'personal',
  'team'
);

-- Key result type: how progress is measured
-- metric = numeric target, milestone = binary done/not done, activity = effort-based
CREATE TYPE key_result_type AS ENUM (
  'metric',
  'milestone',
  'activity'
);

-- Extend goals table with OKR fields
ALTER TABLE goals
  ADD COLUMN IF NOT EXISTS goal_type      goal_type       NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS objective_id   UUID            REFERENCES objectives(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS kr_type        key_result_type,
  ADD COLUMN IF NOT EXISTS target_value   NUMERIC,
  ADD COLUMN IF NOT EXISTS current_value  NUMERIC,
  ADD COLUMN IF NOT EXISTS unit           TEXT;

-- Extend objectives table with OKR period and type
ALTER TABLE objectives
  ADD COLUMN IF NOT EXISTS period         TEXT,           -- e.g. 'Q1 2026', 'H1 2026', 'FY2026'
  ADD COLUMN IF NOT EXISTS goal_type      goal_type       NOT NULL DEFAULT 'strategic';

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_goals_type        ON goals(workspace_id, goal_type);
CREATE INDEX IF NOT EXISTS idx_goals_objective   ON goals(objective_id);
