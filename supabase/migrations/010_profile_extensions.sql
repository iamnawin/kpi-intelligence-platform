-- ProofPath Phase 4: Profile extensions
-- Adds role_title and bio to workspace_members for the Proof Profile card

ALTER TABLE workspace_members
  ADD COLUMN IF NOT EXISTS role_title TEXT,    -- e.g. "Senior Engineer", "Product Manager"
  ADD COLUMN IF NOT EXISTS bio        TEXT;    -- short profile bio (optional)

-- Index for fast member profile lookups
CREATE INDEX IF NOT EXISTS workspace_members_user_id_idx
  ON workspace_members (user_id);
