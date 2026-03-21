import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ObjectiveForm } from '@/components/forms/objective-form'
import { createObjective } from '@/app/actions/objective-actions'

export default function NewObjectivePage() {
  return (
    <div>
      <Link
        href="/objectives"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Objectives
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">New Objective</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Define a high-level goal. Add Key Results by linking goals to this objective.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <ObjectiveForm mode="create" action={createObjective} />
      </div>
    </div>
  )
}
