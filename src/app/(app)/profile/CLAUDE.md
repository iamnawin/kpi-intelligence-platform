[Root](../../../../CLAUDE.md) > [src/app/(app)](../) > **profile**

# Module: Proof Profile

The employee's portable achievement record — a single-page summary of all achievements,
trust scores, and manager-verified proof.

---

## Module Responsibility

- Display aggregated achievement stats: total, completed, verified, trust score
- List all achievements with their trust level and status
- Serve as the "carry-forward" proof view — what an employee would show to a new employer or HR
- Empty state guides users to create their first achievement

---

## Key Files

| File | Entry | Responsibility |
|------|-------|----------------|
| `page.tsx` | line 7 `ProofProfilePage` | Async Server Component — fetches all achievements, computes trust score |

---

## Trust Score Computation

Trust score is computed in `ProofProfilePage` (client-side calculation at render time):

```
TRUST_WEIGHT = {
  draft: 0, self_reported: 20, imported: 40,
  reviewer_approved: 70, system_verified: 85, locked_proof: 100
}
trustScore = average of TRUST_WEIGHT[trust_level] for all achievements (0–100)
```

This is a display-only computation. The authoritative trust level per achievement
is stored in the `goals.trust_level` column and managed by `recomputeAchievementTrust()`
in `evidence-actions.ts`.

---

## "Approved" Definition

An achievement counts as "approved" (Verified count) when `trust_level` is one of:
- `reviewer_approved`
- `system_verified`
- `locked_proof`

---

## Data Flow

```
ProofProfilePage
  └── fetchWorkspaceGoals()   (src/lib/goal-data.ts)
        └── Supabase: goals table for current workspace
  └── Computes: completed, approved, trustScore (in-memory)
  └── Renders: summary stats grid + achievement list rows
```

---

## Components Used

| Component | Purpose |
|-----------|---------|
| `TrustBadge` | Shows trust level per achievement |
| `GoalStatusBadge` | Shows achievement status |
| `Link` (Next.js) | Achievement rows link to `/achievements/[id]` |

---

## Known Gaps / Next Steps

- Phase 4: Replace the simple achievement list with `AchievementRecordCard` — a read-only locked-proof view
- Phase 4: Add `ProofProfileCard` showing role title, profile metadata
- Phase 5: Add export button gated on `trust_level === 'locked_proof'` + `is_portable === true`
- The profile page does not yet distinguish between workspace-visible and portable achievements
- No tests exist for this page

---

## Related Files

- `src/lib/goal-data.ts` — `fetchWorkspaceGoals()`
- `src/lib/achievement-data.ts` — re-export aliases
- `supabase/migrations/008_proofpath_schema.sql` — `achievement_records` table (for Phase 4)
- `docs/PROOFPATH_ARCHITECTURE.md` — Phase 4 build plan
