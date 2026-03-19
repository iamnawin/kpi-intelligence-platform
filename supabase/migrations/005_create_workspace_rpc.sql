-- Postgres RPC called from browser with user's JWT
-- SECURITY DEFINER runs as DB owner, bypasses RLS for atomic workspace bootstrap
CREATE OR REPLACE FUNCTION create_workspace(p_name TEXT, p_slug TEXT)
RETURNS workspaces
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_workspace workspaces;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF EXISTS (SELECT 1 FROM workspaces WHERE slug = p_slug) THEN
    RAISE EXCEPTION 'Workspace slug already taken';
  END IF;

  INSERT INTO workspaces (name, slug)
  VALUES (p_name, p_slug)
  RETURNING * INTO v_workspace;

  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (v_workspace.id, auth.uid(), 'admin');

  RETURN v_workspace;
END;
$$;
