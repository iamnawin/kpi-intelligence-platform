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
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = ws_id AND user_id = auth.uid()
  );
$$;

-- Helper: get current user's role in workspace
CREATE OR REPLACE FUNCTION workspace_member_role(ws_id UUID)
RETURNS workspace_role LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT role FROM workspace_members
  WHERE workspace_id = ws_id AND user_id = auth.uid()
  LIMIT 1;
$$;

-- Policies
CREATE POLICY "members_read_workspace" ON workspaces
  FOR SELECT USING (is_workspace_member(id));

CREATE POLICY "members_read_ws_members" ON workspace_members
  FOR SELECT USING (is_workspace_member(workspace_id));

CREATE POLICY "read_objectives"  ON objectives FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "write_objectives" ON objectives FOR ALL   USING (workspace_member_role(workspace_id) IN ('manager','executive','admin'));

CREATE POLICY "read_goals"  ON goals FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "write_goals" ON goals FOR ALL   USING (workspace_member_role(workspace_id) IN ('manager','executive','admin'));

CREATE POLICY "read_tasks"   ON tasks FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "insert_tasks" ON tasks FOR INSERT WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "update_tasks" ON tasks FOR UPDATE USING (
  assignee_id = (SELECT id FROM workspace_members WHERE user_id = auth.uid() AND workspace_id = tasks.workspace_id)
  OR workspace_member_role(workspace_id) IN ('manager','admin')
);

CREATE POLICY "read_milestones"  ON milestones FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "write_milestones" ON milestones FOR ALL   USING (workspace_member_role(workspace_id) IN ('manager','executive','admin'));

CREATE POLICY "read_outcomes"  ON outcomes FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "write_outcomes" ON outcomes FOR ALL   USING (is_workspace_member(workspace_id));

CREATE POLICY "read_kpis"  ON kpis FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "write_kpis" ON kpis FOR ALL   USING (workspace_member_role(workspace_id) IN ('manager','executive','admin'));

CREATE POLICY "read_kpi_values"  ON kpi_values FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "write_kpi_values" ON kpi_values FOR ALL   USING (is_workspace_member(workspace_id));

CREATE POLICY "read_evidence"  ON evidence FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "write_evidence" ON evidence FOR ALL   USING (is_workspace_member(workspace_id));

CREATE POLICY "read_insights" ON insights FOR SELECT USING (is_workspace_member(workspace_id));

CREATE POLICY "read_action_items"  ON action_items FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "write_action_items" ON action_items FOR ALL   USING (is_workspace_member(workspace_id));

CREATE POLICY "read_achievements" ON achievement_records FOR SELECT USING (
  member_id = (SELECT id FROM workspace_members WHERE user_id = auth.uid() AND workspace_id = achievement_records.workspace_id)
  OR workspace_member_role(workspace_id) IN ('manager','executive','admin')
);
CREATE POLICY "insert_achievements" ON achievement_records FOR INSERT
  WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "approve_achievements" ON achievement_records FOR UPDATE
  USING (workspace_member_role(workspace_id) IN ('manager','admin'));
