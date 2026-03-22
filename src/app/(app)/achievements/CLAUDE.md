[Root](../../../../CLAUDE.md) > [src/app/(app)](../) > **achievements**

# Module: Achievements Routes

The primary ProofPath route group. Handles the full CRUD lifecycle of Achievement records —
list, detail, create, edit, and bulk import.

---

## Module Responsibility

- Render the authenticated achievement list with hierarchy (parent/sub-goal tree)
- Show per-achievement detail: progress, outcome, evidence, tasks, trust ladder
- Provide create and edit forms (via GoalForm + achievement-actions)
- Provide bulk import via CSV/JSON (ImportForm + import-actions)
- All pages are **Server Components** — data is fetched at render time via `goal-data.ts`

---

## Key Files

| File | Entry | Responsibility |
|------|-------|----------------|
| `page.tsx` | line 7 `AchievementsPage` | List all achievements, hierarchy tree, status stats |
| `[id]/page.tsx` | line 18 `AchievementDetailPage` | Detail view: progress, evidence, tasks, TrustLadder |
| `[id]/edit/page.tsx` | line 10 `EditAchievementPage` | Edit form pre-filled with existing data |
| `new/page.tsx` | line 6 `NewAchievementPage` | Create form (empty GoalForm) |
| `import/page.tsx` | line 5 `ImportAchievementsPage` | 3-step ImportForm (upload → preview → done) |

---

## Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/achievements` | GET | Authenticated list page with hierarchy |
| `/achievements/new` | GET | Create form |
| `/achievements/import` | GET | Bulk import form |
| `/achievements/[id]` | GET | Achievement detail |
| `/achievements/[id]/edit` | GET | Edit form |

---

## Data Flow

```
AchievementsPage
  └── fetchWorkspaceGoals()        (goal-data.ts)
        └── Supabase: goals + counts (kpis, sub_goals, tasks)

AchievementDetailPage
  └── fetchGoalById(id)            (goal-data.ts)
        └── Supabase: goal + kpis + kpi_values + evidence + tasks
  └── createEvidence.bind(null, goal.id)  (evidence-actions.ts)
  └── createTask.bind(null, goal.id)      (task-actions.ts)
```

---

## Key Components Used

| Component | Source |
|-----------|--------|
| `GoalRow` | `src/components/goal/goal-row.tsx` — list row with status dot, trust badge, progress bar |
| `GoalStatusBadge` | `src/components/goal/goal-status-badge.tsx` |
| `TrustBadge` | `src/components/goal/trust-badge.tsx` |
| `TrustLadder` | `src/components/goal/trust-ladder.tsx` — sticky sidebar in detail view |
| `EvidenceCard` | `src/components/goal/evidence-card.tsx` |
| `EvidenceDeleteButton` | `src/components/goal/evidence-delete-button.tsx` |
| `EvidenceForm` | `src/components/forms/evidence-form.tsx` — inline add evidence |
| `TaskRow` | `src/components/goal/task-row.tsx` |
| `TaskForm` | `src/components/forms/task-form.tsx` |
| `GoalForm` | `src/components/forms/goal-form.tsx` — create/edit |
| `ImportForm` | `src/components/forms/import-form.tsx` — 3-step import |

---

## Server Actions Used

| Action | File | When |
|--------|------|------|
| `createAchievement` | `achievement-actions.ts` | New achievement form submit |
| `updateAchievement` | `achievement-actions.ts` | Edit achievement form submit |
| `createEvidence` | `evidence-actions.ts` | Inline evidence form submit |
| `deleteEvidence` | `evidence-actions.ts` | Evidence delete button |
| `createTask` | `task-actions.ts` | Inline task form submit |
| `importGoals` | `import-actions.ts` | Import form step 3 |

---

## Status Ordering

The list page sorts achievements by this priority order:
`in_progress (0) -> at_risk (1) -> not_started (2) -> completed (3) -> cancelled (4)`

---

## Hierarchy Model

`AchievementsPage` builds a parent/child tree in a single O(n) pass:
- Goals with `parent_goal_id` not in the current workspace set become top-level
- Sub-goals are grouped by `parent_goal_id` and rendered at `depth=1`
- `GoalRow` accepts `depth` prop for indent styling

---

## Tests

| Test file | Covers |
|-----------|--------|
| `src/components/goal/__tests__/goal-row.test.tsx` | GoalRow rendering |
| `src/components/goal/__tests__/trust-badge.test.tsx` | TrustBadge all levels |
| `src/components/goal/__tests__/evidence-card.test.tsx` | EvidenceCard all evidence types |
| `src/components/goal/__tests__/task-row.test.tsx` | TaskRow |
| `src/components/goal/__tests__/goal-card.test.tsx` | GoalCard |

No tests exist yet for the page Server Components themselves.

---

## Known Gaps / Next Steps

- Phase 3: Add `/achievements/[id]/review` route for manager approval flow
- `GoalForm` still renders "Create Goal" / "Save Changes" buttons — should be renamed to "Create Achievement" / "Save Achievement"
- `import-actions.ts` calls `revalidatePath('/goals')` — should be updated to `/achievements`
- `task-actions.ts` calls `revalidatePath('/goals/${goalId}')` — should be updated to `/achievements/${goalId}`

---

## Related Files

- `src/lib/goal-data.ts` — all Supabase queries
- `src/lib/achievement-data.ts` — semantic re-export layer
- `src/app/actions/achievement-actions.ts`
- `src/app/actions/evidence-actions.ts`
- `src/app/actions/task-actions.ts`
- `src/app/actions/import-actions.ts`
- `docs/PROOFPATH_ARCHITECTURE.md` — build sequence + data model
