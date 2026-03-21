import Link from 'next/link'
import { GoalTypeBadge } from './goal-type-badge'
import { ProgressRing } from './progress-ring'
import { GoalStatusBadge } from '@/components/goal/goal-status-badge'
import type { ObjectiveWithKRs } from '@/lib/objective-data'

export function ObjectiveCard({ objective }: { objective: ObjectiveWithKRs }) {
  return (
    <Link
      href={`/objectives/${objective.id}`}
      className="group block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-900"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          <GoalTypeBadge type={objective.goal_type} />
          {objective.period && (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              {objective.period}
            </span>
          )}
        </div>
        <ProgressRing pct={objective.completion_pct} size={44} strokeWidth={4} />
      </div>

      <p className="mb-2 text-sm font-semibold text-gray-900 group-hover:text-gray-700 dark:text-gray-100 dark:group-hover:text-gray-50 line-clamp-2">
        {objective.title}
      </p>

      {objective.description && (
        <p className="mb-3 text-xs text-gray-500 line-clamp-2 dark:text-gray-400">
          {objective.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <GoalStatusBadge status={objective.status} />
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {objective.kr_count} KR{objective.kr_count !== 1 ? 's' : ''}
        </span>
      </div>
    </Link>
  )
}
