import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { fetchObjectiveById } from '@/lib/objective-data'
import { ObjectiveForm } from '@/components/forms/objective-form'
import { updateObjective } from '@/app/actions/objective-actions'

type Props = { params: Promise<{ id: string }> }

export default async function EditObjectivePage({ params }: Props) {
  const { id } = await params
  const data = await fetchObjectiveById(id)
  if (!data) notFound()

  const boundUpdate = updateObjective.bind(null, id)

  return (
    <div>
      <Link
        href={`/objectives/${id}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Objective
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">Edit Objective</h1>
        <p className="mt-1 text-sm text-gray-500 line-clamp-1 dark:text-gray-400">{data.objective.title}</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <ObjectiveForm mode="edit" objective={data.objective} action={boundUpdate} />
      </div>
    </div>
  )
}
