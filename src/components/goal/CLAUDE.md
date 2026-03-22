[Root](../../../CLAUDE.md) > [src/components](../) > **goal**

# Module: Goal / Achievement Components

The UI primitives for rendering achievements, trust levels, evidence, and tasks.
These are the core visual building blocks of ProofPath's proof layer.

---

## Module Responsibility

- Render individual achievement rows, cards, and detail sub-sections
- Display trust level badges and the trust ladder progression
- Render evidence cards and evidence delete actions
- Render task rows with status indicators

---

## Component Inventory

### `GoalRow` (`goal-row.tsx`)

A list-row component for the achievements list.

- Props: `{ goal: GoalWithCounts; depth?: number }`
- Renders: status dot, title, `GoalStatusBadge`, `TrustBadge`, meta (owner, due date, sub-goals, task counts, KPI count), mini progress bar
- Links to: `/achievements/[goal.id]`
- `depth > 0`: indents with left border for sub-goal nesting

---

### `TrustBadge` (`trust-badge.tsx`)

Displays a colored pill for each trust level.

- Props: `{ level: TrustLevel }`
- 6 levels: `draft | self_reported | imported | reviewer_approved | system_verified | locked_proof`
- Falls back to `draft` config for unknown levels
- Fully dark-mode aware (uses `dark:bg-*` Tailwind classes)
- Tested in `__tests__/trust-badge.test.tsx`

---

### `TrustLadder` (`trust-ladder.tsx`)

Sticky sidebar component showing the 6-step trust progression for an achievement.

- Props: `{ current: TrustLevel }`
- Renders: vertical step list with done/active/future states
- Active step shows its hint text explaining how to advance
- `locked_proof` step uses a Lock icon when future

---

### `EvidenceCard` (`evidence-card.tsx`)

Displays a single evidence record.

- Props: `{ record: EvidenceRecord }`
- Evidence types: `note | link | file | metric` — each has icon + color config
- Source tags: `GitHub | Jira | Linear | Asana | Imported` (shown when non-manual)
- Link type: renders `<a>` with `target="_blank" rel="noopener noreferrer"`
- Shows: TrustBadge, type pill, source tag, title, description, uploader name, formatted date
- Tested in `__tests__/evidence-card.test.tsx`

---

### `EvidenceDeleteButton` (`evidence-delete-button.tsx`)

Overlay delete button on evidence cards.

- Props: `{ evidenceId: string; achievementId: string }`
- Client component — calls `deleteEvidence` Server Action on click
- Shown on hover (`group-hover:opacity-100`)

---

### `GoalStatusBadge` (`goal-status-badge.tsx`)

Status pill for achievement status.

- Props: `{ status: GoalStatus }`
- Values: `not_started | in_progress | at_risk | completed | cancelled`
- Tested in `__tests__/goal-status-badge.test.tsx`

---

### `GoalCard` (`goal-card.tsx`)

Card variant for grid layouts (used in dashboard).

- Tested in `__tests__/goal-card.test.tsx`

---

### `TaskRow` (`task-row.tsx`)

Single task row with status indicator.

- Props: `{ task: TaskRecord }`
- Tested in `__tests__/task-row.test.tsx`

---

## Type Dependencies

All components import types from `src/lib/goal-data.ts`:
- `TrustLevel` — used by `TrustBadge`, `TrustLadder`
- `EvidenceRecord`, `EvidenceType` — used by `EvidenceCard`
- `GoalWithCounts`, `GoalStatus` — used by `GoalRow`, `GoalCard`, `GoalStatusBadge`
- `TaskRecord`, `TaskStatus` — used by `TaskRow`

---

## Tests

| Test File | Component | Coverage |
|-----------|-----------|---------|
| `__tests__/trust-badge.test.tsx` | TrustBadge | All 6 levels + fallback + DOM element |
| `__tests__/evidence-card.test.tsx` | EvidenceCard | All 4 types, link behavior, null handling |
| `__tests__/goal-status-badge.test.tsx` | GoalStatusBadge | All statuses |
| `__tests__/task-row.test.tsx` | TaskRow | Basic rendering |
| `__tests__/goal-row.test.tsx` | GoalRow | Rendering + link |
| `__tests__/goal-card.test.tsx` | GoalCard | Rendering |

---

## Styling Conventions

All components use dark-mode-first Tailwind classes:
- Background: `bg-gray-900`, `bg-gray-800`
- Text: `text-gray-50`, `text-gray-200`, `text-gray-400`, `text-gray-600`
- Borders: `border-gray-800`, `border-gray-700`
- Status colors: blue=in_progress, red=at_risk, emerald=completed, gray=not_started/cancelled
- Trust colors: yellow=self_reported, blue=imported, green=reviewer_approved, emerald=system_verified, purple=locked_proof

---

## Known Gaps / Next Steps

- Phase 3: Add `ReviewPanel` component for manager approval UI
- Phase 4: Add `AchievementRecordCard` — read-only locked-proof view for the Profile page
- `GoalCard` is used in the legacy dashboard — may need a ProofPath-specific variant
- No component for the `outcome_summary` / `period_label` fields (currently rendered inline in `[id]/page.tsx`)

---

## Related Files

- `src/lib/goal-data.ts` — all type definitions
- `src/app/(app)/achievements/[id]/page.tsx` — main consumer of this module
- `src/app/(app)/achievements/page.tsx` — uses `GoalRow`
