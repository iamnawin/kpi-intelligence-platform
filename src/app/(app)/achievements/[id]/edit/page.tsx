import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { fetchAchievementById } from "@/lib/achievement-data"
import { GoalForm } from "@/components/forms/goal-form"
import { updateAchievement } from "@/app/actions/achievement-actions"

type Props = { params: Promise<{ id: string }> }

export default async function EditAchievementPage({ params }: Props) {
  const { id } = await params
  const data = await fetchAchievementById(id)
  if (!data) notFound()

  const boundUpdate = updateAchievement.bind(null, id)

  return (
    <div>
      <Link
        href={`/achievements/${id}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Achievement
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-50">Edit Achievement</h1>
        <p className="mt-1 text-sm text-gray-500 line-clamp-1">{data.goal.title}</p>
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <GoalForm mode="edit" goal={data.goal} action={boundUpdate} />
      </div>
    </div>
  )
}
