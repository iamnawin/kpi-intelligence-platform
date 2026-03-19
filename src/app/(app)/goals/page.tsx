import { Target } from "lucide-react"
import { fetchWorkspaceGoals } from "@/lib/goal-data"
import { GoalCard } from "@/components/goal/goal-card"

export default async function GoalsPage() {
  const goals = await fetchWorkspaceGoals()

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Goals</h1>
        <p className="mt-1 text-sm text-gray-500">
          Workspace goals linked to KPIs and outcomes.
        </p>
      </div>

      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-16 text-center">
          <Target className="mb-3 h-8 w-8 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">No goals yet</p>
          <p className="mt-1 text-xs text-gray-400">
            Add goals in Supabase to see them here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map(goal => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}
    </div>
  )
}
