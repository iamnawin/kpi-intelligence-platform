[Root](../../CLAUDE.md) > **supabase/migrations**

# Module: Database Migrations

Append-only SQL migrations for the ProofPath Supabase PostgreSQL database.
Migrations 001-007 are the original KPI platform schema. Migrations 008-009 add ProofPath extensions.

---

## Module Responsibility

- Define all database tables, enums, indexes, and RLS policies
- Extend the schema incrementally — never alter earlier migrations
- All tables use UUID primary keys (`uuid_generate_v4()`) and RLS via `is_workspace_member(workspace_id)`

---

## Migration Index

| File | Description | Phase |
|------|-------------|-------|
| `001_enums.sql` | Core enum types (status, trust_level, etc.) | Legacy |
| `002_tables.sql` | Core tables: workspaces, workspace_members, goals, kpis, kpi_values, tasks, evidence | Legacy |
| `003_indexes.sql` | Performance indexes on core tables | Legacy |
| `004_rls.sql` | Row Level Security policies — workspace isolation | Legacy |
| `005_create_workspace_rpc.sql` | `create_workspace()` RPC function | Legacy |
| `006_okr_extensions.sql` | OKR tables: objectives, key_results | Legacy — superseded by ProofPath model |
| `007_integrations.sql` | `workspace_integrations` table for OAuth tokens | Active |
| `008_proofpath_schema.sql` | ProofPath Phase 1 extensions + `achievement_records` | ProofPath Phase 1 |
| `009_evidence_trust.sql` | `evidence.source_type` column + trust indexes | ProofPath Phase 2 |

---

## Core Tables (from 002)

| Table | Description |
|-------|-------------|
| `workspaces` | Multi-tenant workspace root |
| `workspace_members` | Users within a workspace (id, user_id, workspace_id, display_name, role) |
| `goals` | Core entity — now used as "Achievements" in ProofPath |
| `kpis` | KPI definitions linked to goals |
| `kpi_values` | Time-series KPI values |
| `tasks` | Tasks linked to goals; supports external_id + source for integration sync |
| `evidence` | Evidence records linked to goals |

---

## ProofPath Additions

### Migration 008: `008_proofpath_schema.sql`

**Columns added to `goals`:**
```sql
outcome_summary  TEXT                          -- What actually happened (free text)
period_label     TEXT                          -- e.g. "Q1 2026", "H1 2026"
achievement_type TEXT CHECK IN ('delivered', 'led', 'contributed', 'improved')
```

**New table: `achievement_records`**
```sql
id              UUID PK
achievement_id  UUID -> goals(id) CASCADE
member_id       UUID -> workspace_members(id)
workspace_id    UUID -> workspaces(id)
snapshot_data   JSONB DEFAULT '{}'   -- Frozen proof state at approval time
approved_by     UUID -> workspace_members(id) nullable
approved_at     TIMESTAMPTZ nullable
is_portable     BOOLEAN DEFAULT false
export_token    TEXT UNIQUE          -- Shareable link token
created_at      TIMESTAMPTZ
UNIQUE(achievement_id)              -- One record per achievement
```

RLS policies: workspace members can SELECT/INSERT/UPDATE their workspace's records.
Indexes: `achievement_records_member_id_idx`, `achievement_records_workspace_id_idx`

---

### Migration 009: `009_evidence_trust.sql`

**Column added to `evidence`:**
```sql
source_type TEXT NOT NULL DEFAULT 'manual'
  CHECK IN ('manual', 'import', 'github', 'jira', 'linear', 'asana')
```

**Indexes added:**
```sql
evidence_goal_id_idx     ON evidence(goal_id)
evidence_source_type_idx ON evidence(source_type)
```

Note: migration 009 also has `ADD COLUMN IF NOT EXISTS achievement_id` and `snapshot_data` on `achievement_records` — this appears to be a duplicate of 008 columns added idempotently.

---

## Trust Level Enum

Defined in `001_enums.sql` (exact name may be `trust_level` or inline CHECK):
```
draft -> self_reported -> imported -> reviewer_approved -> system_verified -> locked_proof
```

---

## RLS Pattern

All tables use a helper function `is_workspace_member(workspace_id UUID) RETURNS BOOLEAN`
defined in the RLS migration. Example policy:
```sql
CREATE POLICY "..." ON table_name
  USING (is_workspace_member(workspace_id));
```

This means all queries must be made with an authenticated Supabase session.
The `createServerSupabaseClient()` factory in `src/lib/supabase-server.ts` handles session cookies.

---

## Migration Rules

- Do NOT alter migrations 001-007 — they define the base schema
- Always use `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` for additive changes
- Always use `CREATE TABLE IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS`
- New migrations should be numbered sequentially (next: `010_...sql`)
- Each migration file should have a header comment stating its ProofPath phase and description

---

## Next Migrations Needed

| Migration | Phase | Description |
|-----------|-------|-------------|
| `010_manager_review.sql` | Phase 3 | Add `review_notes`, `reviewed_by`, `reviewed_at` to `achievement_records`; add review request tracking |
| `011_export.sql` | Phase 5 | Finalize `export_token` generation; add `exported_at` timestamp |

---

## Related Files

- `src/lib/goal-data.ts` — queries all tables defined here
- `src/app/actions/evidence-actions.ts` — uses `evidence.source_type`
- `src/app/api/integrations/[provider]/sync/route.ts` — upserts into `tasks` with `source` and `external_id`
- `docs/PROOFPATH_ARCHITECTURE.md` — data model specification
