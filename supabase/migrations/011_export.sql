-- ProofPath Phase 5: Export & Portability
-- Enables public shareable proof links for locked_proof achievement records

-- Track when portability was enabled
ALTER TABLE achievement_records
  ADD COLUMN IF NOT EXISTS exported_at TIMESTAMPTZ;

-- Public read policy: anyone can view achievement records that the owner has made portable
-- This supplements the existing workspace-member policy (Supabase evaluates OR across policies)
CREATE POLICY "public can view portable proof records"
  ON achievement_records FOR SELECT
  USING (is_portable = true AND export_token IS NOT NULL);
