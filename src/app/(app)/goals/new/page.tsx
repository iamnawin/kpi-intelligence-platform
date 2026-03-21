import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { GoalForm } from "@/components/forms/goal-form"
import { createGoal } from "@/app/actions/goal-actions"

export default function NewGoalPage() {
  return (
    <div>
      <Link
        href="/goals"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Goals
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">New Goal</h1>
        <p className="mt-1 text-sm text-gray-500">
          Define a business objective and link it to KPIs and tasks.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <GoalForm mode="create" action={createGoal} />
      </div>
    </div>
  )
}
