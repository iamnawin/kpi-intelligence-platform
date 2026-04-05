# ProofPath Realignment Plan

Date: 2026-04-05
Status: Draft approved for execution planning

## Requirements Summary

- Treat `ProofPath` as the canonical product surface and `KPI Intelligence Platform` as the repo/app context.
- Preserve the working ProofPath flows already present in the repo:
  - achievements list/detail/review at `src/app/(app)/achievements/*`
  - profile and export at `src/app/(app)/profile/page.tsx` and `src/app/proof/[token]/page.tsx`
  - connections and evidence import at `src/app/(app)/connections/page.tsx` and `src/app/actions/integration-actions.ts`
- Remove or isolate duplicated legacy KPI/goal product surfaces that conflict with the ProofPath direction.
- Keep the current schema stable for now. Do not rename database tables yet if aliases can preserve momentum.
- Fix toolchain reliability so repo health checks are trustworthy outside a warm Next build cache.

## Current Facts

- The root app page is already positioned as `Proof Feed`, but still pulls KPI data and legacy KPI widgets through `src/app/(app)/page.tsx:2`, `src/app/(app)/page.tsx:59`, and `src/app/(app)/page.tsx:82`.
- The active achievements surface is backed by goal storage via `src/app/(app)/achievements/page.tsx:8` and `src/lib/goal-data.ts:109`.
- The semantic achievement layer is only an alias facade over the goal loader at `src/lib/achievement-data.ts:5`.
- The profile and public proof flows are real and already rely on `achievement_records` via `src/app/(app)/profile/page.tsx:22`, `src/lib/goal-data.ts:302`, and `src/app/proof/[token]/page.tsx:17`.
- Review and locking are real, but they still mutate `goals.trust_level` and snapshot into `achievement_records` via `src/app/actions/review-actions.ts:9`.
- Export portability is implemented via `src/app/actions/export-actions.ts:7` and the public export policy added in `supabase/migrations/011_export.sql:10`.
- Legacy duplicate `/goals` pages still ship beside `/achievements` through `src/app/(app)/goals/page.tsx:7`.
- Alerts and Insights are not production-grade yet; Alerts is mock-backed at `src/app/(app)/alerts/page.tsx:2`, and Insights is still a placeholder at `src/app/(app)/insights/page.tsx:14`.
- The old KPI engine remains active through `src/lib/kpi-data.ts:69` and `server/routes/kpi.js:54`.
- `npm run build` passes, but `npm run typecheck` fails because `tsconfig.json:19` includes stale `.next/types/**/*.ts`.
- `src/app/actions/task-actions.ts:36` revalidates `/goals/[id]`, even though tasks are created from achievement detail pages too.

## Acceptance Criteria

1. ProofPath is the only primary product vocabulary exposed in the main app navigation and core user journeys.
2. `/achievements` is the canonical CRUD/review surface; `/goals` is either redirected, hidden, or clearly marked legacy.
3. The achievement workflow is internally consistent:
   - create/update
   - evidence attach/delete/import
   - submit for review
   - approve/request changes
   - lock proof
   - enable/disable export
4. The repo has a stable typecheck path that does not depend on stale `.next` artifacts.
5. Build still passes after cleanup.
6. At least one automated test covers each high-value ProofPath workflow layer:
   - data/action trust progression
   - manager review and lock flow
   - export/public proof flow
7. KPI-era placeholder surfaces are either removed from primary navigation or explicitly downgraded so they do not misrepresent product maturity.

## Recommended Decision

Use a two-track approach:

- Track A: make ProofPath the product users see now.
- Track B: keep the KPI engine and related analytics code isolated until we either repurpose it for manager/executive analytics or delete it later.

Why this decision:

- It preserves working functionality in the achievement/proof workflow.
- It avoids a risky table rename or deep backend rewrite before the product boundary is stable.
- It reduces product confusion quickly without forcing immediate removal of reusable analytics code.

## Implementation Steps

### Phase 1: Product Boundary Cleanup

Objective: stop shipping conflicting product stories.

Work:
- Update navigation in `src/components/layout/sidebar.tsx:13`, `src/components/layout/sidebar.tsx:19`, and `src/components/layout/sidebar.tsx:24`.
- Remove `Alerts` and `AI Insights` from primary nav until they are real, or move them under an explicit beta/legacy section.
- Decide the fate of `/goals`:
  - preferred: replace `/goals`, `/goals/[id]`, `/goals/new`, `/goals/import`, and `/goals/[id]/edit` with redirects to the equivalent `/achievements` routes
  - fallback: keep them but mark them legacy and remove them from all user-facing navigation
- Align dashboard language so the non-admin experience is purely ProofPath-oriented in `src/app/(app)/page.tsx:20` and `src/app/(app)/page.tsx:82`.

Files:
- `src/components/layout/sidebar.tsx`
- `src/app/(app)/page.tsx`
- `src/app/(app)/goals/page.tsx`
- `src/app/(app)/goals/[id]/page.tsx`
- sibling `/goals` route files

### Phase 2: Semantic Data Layer Cleanup

Objective: reduce “goal vs achievement” confusion in code without breaking schema.

Work:
- Make `src/lib/achievement-data.ts` the default import surface for ProofPath pages instead of calling `goal-data` directly.
- Keep `src/lib/goal-data.ts` as the storage-oriented implementation layer temporarily.
- Introduce a dedicated `proof-data.ts` or equivalent query layer for profile/export aggregation instead of keeping proof-specific logic in the goal loader.
- Audit all ProofPath pages and actions to use achievement terminology consistently at the call sites.

Files:
- `src/lib/achievement-data.ts:5`
- `src/lib/goal-data.ts:109`
- `src/lib/goal-data.ts:194`
- `src/lib/goal-data.ts:302`
- `src/app/(app)/achievements/page.tsx:8`
- `src/app/(app)/profile/page.tsx:21`

### Phase 3: Workflow Correctness Pass

Objective: make the core proof workflow mechanically correct.

Work:
- Fix route revalidation in `src/app/actions/task-actions.ts:36` so achievement detail pages refresh correctly.
- Audit `revalidatePath` usage across achievement, evidence, review, and export actions:
  - `src/app/actions/achievement-actions.ts:51`
  - `src/app/actions/review-actions.ts:81`
  - `src/app/actions/export-actions.ts:35`
- Verify trust-state progression rules are coherent:
  - `draft -> self_reported/imported -> reviewer_approved -> locked_proof`
- Recheck `requestChanges` logic in `src/app/actions/review-actions.ts:86` because the current protected-state branch is easy to misread and should be made explicit.
- Confirm public proof visibility only works when `is_portable = true` and `export_token` is present, per `supabase/migrations/011_export.sql:10`.

Files:
- `src/app/actions/task-actions.ts`
- `src/app/actions/evidence-actions.ts`
- `src/app/actions/review-actions.ts`
- `src/app/actions/export-actions.ts`
- `src/app/proof/[token]/page.tsx`

### Phase 4: Toolchain and Verification Repair

Objective: make engineering feedback loops trustworthy.

Work:
- Fix `tsconfig.json:19` so `npm run typecheck` does not fail on missing `.next/types`.
- Decide whether type generation should be an explicit prerequisite or whether `tsc` should stop reading ephemeral generated files directly.
- Investigate the Vitest startup failure from `vitest.config.ts` in the local Windows environment and verify whether it is sandbox-only or a repo issue.
- Add a narrow test set around the business-critical ProofPath flows before broadening UI coverage.

Files:
- `tsconfig.json:19`
- `vitest.config.ts`
- `package.json`

### Phase 5: Test the ProofPath Core

Objective: cover the real product value, not just presentational components.

Work:
- Add unit tests for trust computation in `src/app/actions/evidence-actions.ts`.
- Add action-level tests for:
  - achievement creation/update
  - review submit/approve/request changes
  - export enable/disable
- Add one integration-style test for the public proof record path using `src/app/proof/[token]/page.tsx:17`.
- Keep existing component tests, but shift new coverage toward data/action correctness.

Files:
- `src/app/actions/evidence-actions.ts`
- `src/app/actions/achievement-actions.ts`
- `src/app/actions/review-actions.ts`
- `src/app/actions/export-actions.ts`
- `src/app/proof/[token]/page.tsx`
- `src/components/goal/__tests__/*`

### Phase 6: KPI Legacy Containment

Objective: stop KPI-era code from distorting current execution priorities.

Work:
- Keep the KPI engine isolated behind admin/company analytics for now rather than letting it drive the main product story.
- Decide whether `src/app/(app)/page.tsx` should keep the admin company KPI block or move that work to a separate analytics route.
- Mark `src/app/(app)/alerts/page.tsx` and `src/app/(app)/insights/page.tsx` as legacy/beta or remove them until backed by real data.
- Leave `server/routes/kpi.js:54` and `src/lib/kpi-data.ts:69` intact unless they block the ProofPath roadmap.

Files:
- `src/app/(app)/page.tsx`
- `src/app/(app)/alerts/page.tsx`
- `src/app/(app)/insights/page.tsx`
- `src/lib/kpi-data.ts`
- `server/routes/kpi.js`

## Execution Order

1. Product boundary cleanup
2. Semantic data layer cleanup
3. Workflow correctness pass
4. Toolchain and verification repair
5. ProofPath core tests
6. KPI legacy containment

## Risks And Mitigations

- Risk: redirecting or removing `/goals` breaks existing deep links.
  - Mitigation: use redirects first, then remove only after navigation and internal links are updated.

- Risk: renaming storage tables too early creates migration churn.
  - Mitigation: keep the table as `goals` for now and migrate semantics at the app/service layer first.

- Risk: removing KPI surfaces too aggressively discards reusable manager analytics work.
  - Mitigation: isolate them behind admin/company routes instead of deleting immediately.

- Risk: test work balloons in scope.
  - Mitigation: target high-value action/data flows first, then expand only if defects justify it.

- Risk: typecheck fixes become coupled to Next build behavior.
  - Mitigation: choose a typecheck path that is explicit and reproducible in CI and local dev.

## Verification Steps

- `npm run build`
- `npm run typecheck`
- `npm run test`
- Manual check as member:
  - create achievement
  - add evidence
  - submit for review
- Manual check as admin:
  - review achievement
  - approve and verify locked proof state
- Manual check on profile:
  - enable export
  - open `/proof/[token]`
  - disable export and confirm access is revoked

## First Slice Recommendation

Start with a compact, high-leverage cleanup slice:

1. Remove `/goals` from the primary product surface.
2. Fix sidebar/nav to reflect only the real ProofPath experience.
3. Correct `task-actions` revalidation and related workflow inconsistencies.
4. Repair `typecheck`.

That slice reduces user confusion, tightens the core workflow, and makes the repo safer to evolve before deeper rewrites.
