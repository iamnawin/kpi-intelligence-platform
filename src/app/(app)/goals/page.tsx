import Link from "next/link"
import { Target, Plus } from "lucide-react"
import { fetchWorkspaceGoals } from "@/lib/goal-data"
import { GoalRow } from "@/components/goal/goal-row"
import type { GoalWithCounts } from "@/lib/goal-data"

export default async function GoalsPage() {
  const goals = await fetchWorkspaceGoals()

  // Build hierarchy tree in one pass
  const goalSet = new Set(goals.map(g => g.id))
  const topLevel: GoalWithCounts[] = []
  const byParent: Record<string, GoalWithCounts[]> = {}

  for (const goal of goals) {
    const parentInSet = goal.parent_goal_id && goalSet.has(goal.parent_goal_id)
    if (parentInSet) {
      ;(byParent[goal.parent_goal_id!] ??= []).push(goal)
    } else {
      topLevel.push(goal)
    }
  }

  // Sort: in_progress and at_risk first
  const STATUS_ORDER: Record<string, number> = {
    in_progress: 0, at_risk: 1, not_started: 2, completed: 3, cancelled: 4,
  }
  const sortByStatus = (a: GoalWithCounts, b: GoalWithCounts) =>
    (STATUS_ORDER[a.status] ?? 5) - (STATUS_ORDER[b.status] ?? 5)

  topLevel.sort(sortByStatus)
  for (const children of Object.values(byParent)) children.sort(sortByStatus)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">Goals</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Business objectives and outcomes across your workspace.
          </p>
        </div>
        <Link
          href="/goals/new"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          New Goal
        </Link>
      </div>

      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-16 text-center">
          <Target className="mb-3 h-8 w-8 text-gray-300 dark:text-gray-600" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No goals yet</p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Add goals in Supabase to see them here.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {topLevel.map(goal => (
              <div key={goal.id}>
                <GoalRow goal={goal} depth={0} />
                {byParent[goal.id]?.map(sub => (
                  <GoalRow key={sub.id} goal={sub} depth={1} />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
