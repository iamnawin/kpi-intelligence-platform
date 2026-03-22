import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { GoalForm } from '@/components/forms/goal-form'
import { createAchievement } from '@/app/actions/achievement-actions'

export default async function NewAchievementPage() {
  return (
    <div>
      <Link
        href="/achievements"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Achievements
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-50">New Achievement</h1>
        <p className="mt-1 text-sm text-gray-500">
          Define what you delivered or led. Add evidence later to build verifiable proof.
        </p>
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <GoalForm mode="create" action={createAchievement} />
      </div>
    </div>
  )
}
