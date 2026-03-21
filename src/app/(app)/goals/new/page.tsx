import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { GoalForm } from '@/components/forms/goal-form'
import { createGoal } from '@/app/actions/goal-actions'

type Props = { searchParams: Promise<{ objective_id?: string }> }

export default async function NewGoalPage({ searchParams }: Props) {
  const { objective_id } = await searchParams

  return (
    <div>
      <Link
        href={objective_id ? `/objectives/${objective_id}` : '/goals'}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <ArrowLeft className="h-4 w-4" />
        {objective_id ? 'Back to Objective' : 'Back to Goals'}
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
          {objective_id ? 'New Key Result' : 'New Goal'}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {objective_id
            ? 'Define a measurable Key Result linked to this objective.'
            : 'Define a business objective and link it to KPIs and tasks.'}
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <GoalForm mode="create" action={createGoal} objectiveId={objective_id} />
      </div>
    </div>
  )
}
