[Root](../../../CLAUDE.md) > [src/components](../) > **forms**

# Module: Form Components

Client-side form components. All forms accept a Server Action as the `action` prop,
keeping mutations server-side while the interaction layer stays client-side.

---

## Module Responsibility

- Provide controlled form UIs for creating/editing achievements, evidence, tasks, and bulk imports
- Manage local form state (open/closed, pending, step navigation) on the client
- Delegate all data mutations to Server Actions passed in via props
- Never call Supabase directly

---

## Component Inventory

### `GoalForm` (`goal-form.tsx`)

General-purpose create/edit form for goals (used as achievement form).

- Props: `{ mode: 'create' | 'edit'; goal?: GoalWithCounts; action: (formData: FormData) => Promise<void>; objectiveId?: string }`
- Fields: title, description, goal_type, status, progress_pct, start_date, end_date
- Optional OKR section: link to objective (objective_id, kr_type, target_value, current_value, unit) — shown when `isKR` checkbox is checked
- Note: Button labels still say "Create Goal" / "Save Changes" — should be updated to "Create Achievement" / "Save Achievement"
- Note: Cancel link points to `/goals/[id]` in edit mode — should point to `/achievements/[id]`

---

### `EvidenceForm` (`evidence-form.tsx`)

Inline toggle-form for attaching evidence to an achievement.

- Props: `{ action: (formData: FormData) => Promise<void> }`
- Collapsed to a "Add Evidence" button by default; expands on click
- Type selector: `note | link | file | metric` — controls which fields are shown
- `link` type: shows URL input (`source_url`)
- Hidden fields: `evidence_type`, `source_type` (always `'manual'`)
- Optimistic UX: resets and closes on successful submit
- Violet color scheme (vs blue for task form)

---

### `TaskForm` (`task-form.tsx`)

Inline toggle-form for adding tasks to an achievement.

- Props: `{ action: (formData: FormData) => Promise<void>` }
- Collapsed to "Add Task" button; expands on click
- Fields: `title` (required), `due_date` (optional)
- Blue color scheme

---

### `ImportForm` (`import-form.tsx`)

3-step wizard for bulk importing achievements from CSV or JSON.

- Step 1 (Upload): File drop zone or paste textarea; supports `.csv` and `.json`
- Step 2 (Preview): Shows parsed rows in a table (max 20 visible, 100 max import); shows validation warnings
- Step 3 (Done): Success/error result display

Client-side parsing via `src/lib/import-parser.ts`:
- `parseCSV(text)` — handles quoted fields with commas/newlines
- `parseJSON(text)` — supports array root or `{ goals: [...] }` wrapper
- `validateImportRows(rows)` — validates status, goal_type, progress_pct

Calls `importGoals(rows)` Server Action at step 3.

Note: Success redirect goes to `/goals` — should be updated to `/achievements`.

---

### `ObjectiveForm` (`objective-form.tsx`)

OKR-era form. Not part of ProofPath core flow.

---

## Common Patterns

**Action binding pattern** (used in Server Components):
```typescript
// Bind achievementId into a curried Server Action:
const boundAction = createEvidence.bind(null, goal.id)
// Pass to Client Component:
<EvidenceForm action={boundAction} />
```

**Pending state:**
All forms track `pending` state locally and disable the submit button while the action is running.

**Form reset:**
Forms use `useRef<HTMLFormElement>` to call `formRef.current?.reset()` after a successful submit.

---

## Tests

No tests currently exist for form components. Recommended additions:

| Component | Test Scenarios |
|-----------|---------------|
| `EvidenceForm` | Toggle open/close, type selector, submit with each type |
| `TaskForm` | Toggle open/close, required title validation |
| `ImportForm` | CSV parse, JSON parse, validation errors, step navigation |
| `GoalForm` | Field rendering in create vs edit mode |

---

## Known Gaps / Next Steps

- `GoalForm` button labels need updating from "Goal" to "Achievement"
- `GoalForm` cancel URL in edit mode points to `/goals/[id]` — should be `/achievements/[id]`
- `ImportForm` success redirect points to `/goals` — should be `/achievements`
- Need a `ReviewForm` component for Phase 3 manager approval (approve/request-changes + note)

---

## Related Files

- `src/lib/import-parser.ts` — parser used by ImportForm
- `src/app/actions/achievement-actions.ts` — action for GoalForm (achievement context)
- `src/app/actions/evidence-actions.ts` — action for EvidenceForm
- `src/app/actions/task-actions.ts` — action for TaskForm
- `src/app/actions/import-actions.ts` — action for ImportForm
