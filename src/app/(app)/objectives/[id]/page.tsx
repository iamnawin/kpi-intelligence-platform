import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Pencil, Target } from 'lucide-react'
import { fetchObjectiveById } from '@/lib/objective-data'
import { GoalStatusBadge } from '@/components/goal/goal-status-badge'
import { GoalTypeBadge } from '@/components/okr/goal-type-badge'
import { ProgressRing } from '@/components/okr/progress-ring'
import { KeyResultRow } from '@/components/okr/key-result-row'

type Props = { params: Promise<{ id: string }> }

export default async function ObjectiveDetailPage({ params }: Props) {
  const { id } = await params
  const data = await fetchObjectiveById(id)
  if (!data) notFound()

  const { objective, keyResults } = data

  return (
    <div>
      <Link
        href="/objectives"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Objectives
      </Link>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <GoalTypeBadge type={objective.goal_type} />
            {objective.period && (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                {objective.period}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">{objective.title}</h1>
          {objective.description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{objective.description}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div className="flex flex-col items-end gap-2">
            <GoalStatusBadge status={objective.status} />
          </div>
          <Link
            href={`/objectives/${objective.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
        </div>
      </div>

      {/* Progress card */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-6">
          <ProgressRing pct={objective.completion_pct} size={72} strokeWidth={6} />
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Progress</p>
            <p className="mt-0.5 text-3xl font-bold text-gray-900 dark:text-gray-50">{objective.completion_pct}%</p>
            <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
              {objective.kr_count} Key Result{objective.kr_count !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Key Results */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            Key Results ({keyResults.length})
          </h2>
          <Link
            href={`/goals/new?objective_id=${objective.id}`}
            className="text-xs text-blue-600 hover:underline dark:text-blue-400"
          >
            + Add Key Result
          </Link>
        </div>

        {keyResults.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
            <Target className="mx-auto mb-2 h-6 w-6 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-400 dark:text-gray-500">
              No Key Results yet. Add goals and link them to this objective.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {keyResults.map(kr => (
                <KeyResultRow key={kr.id} kr={kr} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
