import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { fetchGoalById } from "@/lib/goal-data"
import { GoalForm } from "@/components/forms/goal-form"
import { updateGoal } from "@/app/actions/goal-actions"

type Props = { params: Promise<{ id: string }> }

export default async function EditGoalPage({ params }: Props) {
  const { id } = await params
  const data = await fetchGoalById(id)
  if (!data) notFound()

  const boundUpdateGoal = updateGoal.bind(null, id)

  return (
    <div>
      <Link
        href={`/goals/${id}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Goal
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Edit Goal</h1>
        <p className="mt-1 text-sm text-gray-500 line-clamp-1">{data.goal.title}</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <GoalForm mode="edit" goal={data.goal} action={boundUpdateGoal} />
      </div>
    </div>
  )
}
