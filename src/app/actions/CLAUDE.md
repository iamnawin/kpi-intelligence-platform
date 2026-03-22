[Root](../../../CLAUDE.md) > [src/app](../) > **actions**

# Module: Server Actions

All authenticated data mutations in ProofPath flow through this directory.
Every file uses `'use server'` and calls `createServerSupabaseClient()` for DB access.

---

## Module Responsibility

- Encapsulate all create/update/delete operations as Next.js Server Actions
- Validate input, resolve workspace context, call Supabase, then revalidate affected paths
- Keep business logic out of UI components
- Never call these from client components directly — bind with `.bind(null, ...)` for parameterization

---

## Action Files

### `achievement-actions.ts`

ProofPath primary mutations for the `goals` table (Achievement semantic layer).

| Export | Signature | Description |
|--------|-----------|-------------|
| `createAchievement` | `(formData: FormData) => Promise<void>` | Insert new goal row with ProofPath fields; redirects to `/achievements` |
| `updateAchievement` | `(id: string, formData: FormData) => Promise<void>` | Update goal row; redirects to `/achievements/[id]` |

Fields handled: `title`, `description`, `outcome_summary`, `period_label`, `achievement_type`,
`status`, `progress_pct`, `start_date`, `end_date`, `goal_type`

After success: `revalidatePath('/achievements')` and `revalidatePath('/achievements/[id]')`

---

### `evidence-actions.ts`

Evidence attachment and trust recomputation.

| Export | Signature | Description |
|--------|-----------|-------------|
| `createEvidence` | `(achievementId: string, formData: FormData) => Promise<void>` | Insert evidence row; recomputes achievement trust |
| `deleteEvidence` | `(evidenceId: string, achievementId: string) => Promise<void>` | Delete evidence; recomputes achievement trust |

**Trust recomputation logic (internal `recomputeAchievementTrust`):**
```
if (systemSources >= 2)  -> system_verified
if (systemSources >= 1 || importCount >= 1) -> imported
if (total >= 3) -> imported
else -> self_reported
if (no evidence) -> draft
```
Protected levels (never auto-downgraded): `reviewer_approved`, `system_verified`, `locked_proof`

System sources: `github`, `jira`, `linear`, `asana`

---

### `task-actions.ts`

| Export | Signature | Description |
|--------|-----------|-------------|
| `createTask` | `(goalId: string, formData: FormData) => Promise<void>` | Insert task row for a goal |

Note: currently calls `revalidatePath('/goals/${goalId}')` — should be updated to `/achievements/${goalId}`.

---

### `goal-actions.ts`

Legacy action for the `/goals/*` routes (OKR-era). Still active but not part of ProofPath core flow.

| Export | Signature | Description |
|--------|-----------|-------------|
| `createGoal` | `(formData: FormData) => Promise<void>` | Insert goal; redirects to `/goals` |
| `updateGoal` | `(id: string, formData: FormData) => Promise<void>` | Update goal; redirects to `/goals/[id]` |

Handles additional OKR fields: `objective_id`, `kr_type`, `target_value`, `current_value`, `unit`

---

### `import-actions.ts`

| Export | Signature | Return |
|--------|-----------|--------|
| `importGoals` | `(rows: ImportRow[]) => Promise<ImportResult>` | `{ inserted: number; errors: string[] }` |

- Caps at 100 rows per import
- Batch inserts all rows in a single Supabase call
- Calls `revalidatePath('/goals')` on success — should be updated to `/achievements`

---

### `objective-actions.ts`

OKR-era actions. Not part of ProofPath core product.

---

## Common Patterns

**Workspace resolution** — All actions resolve workspace ID before inserting:
```typescript
const { data } = await supabase
  .from('workspace_members')
  .select('workspace_id')
  .limit(1)
  .single()
```

**Binding for parameterized actions:**
```typescript
// In a Server Component:
const boundCreate = createEvidence.bind(null, goal.id)
// Passed to a Client Component:
<EvidenceForm action={boundCreate} />
```

---

## Missing Actions (Phase 3+)

| Action | Phase | Description |
|--------|-------|-------------|
| `review-actions.ts` | Phase 3 | `approveAchievement`, `requestChanges` — creates `achievement_records` frozen snapshot |
| `export-actions.ts` | Phase 5 | Generate `export_token` for portable proof link |

---

## Tests

No unit tests exist for Server Actions yet. Integration tests with a test Supabase instance are recommended for Phase 3.

---

## Related Files

- `src/lib/goal-data.ts` — type definitions used by actions
- `src/lib/supabase-server.ts` — `createServerSupabaseClient()`
- `src/lib/import-parser.ts` — `ImportRow` type used by `import-actions.ts`
- `supabase/migrations/008_proofpath_schema.sql` — `achievement_records` table for future review actions
