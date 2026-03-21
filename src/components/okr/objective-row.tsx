import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { GoalTypeBadge } from './goal-type-badge'
import { GoalStatusBadge } from '@/components/goal/goal-status-badge'
import type { ObjectiveWithKRs } from '@/lib/objective-data'

export function ObjectiveRow({ objective }: { objective: ObjectiveWithKRs }) {
  return (
    <Link
      href={`/objectives/${objective.id}`}
      className="group flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:hover:bg-gray-800"
    >
      {/* Progress circle (simple) */}
      <div className="relative shrink-0 h-10 w-10">
        <svg viewBox="0 0 40 40" className="h-10 w-10 -rotate-90">
          <circle cx="20" cy="20" r="16" fill="none" strokeWidth="3" className="stroke-gray-200 dark:stroke-gray-700" />
          <circle
            cx="20" cy="20" r="16" fill="none" strokeWidth="3"
            strokeDasharray={`${(objective.completion_pct / 100) * 100.53} 100.53`}
            strokeLinecap="round"
            className="stroke-blue-500"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-700 dark:text-gray-200" style={{ transform: 'rotate(0deg)' }}>
          {objective.completion_pct}%
        </span>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-800 group-hover:text-gray-900 dark:text-gray-200 dark:group-hover:text-gray-50 truncate">
          {objective.title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-400 dark:text-gray-500">
          <GoalTypeBadge type={objective.goal_type} />
          {objective.period && <span>{objective.period}</span>}
          <span>{objective.kr_count} KR{objective.kr_count !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <GoalStatusBadge status={objective.status} />
        <ChevronRight className="h-3.5 w-3.5 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-gray-600" aria-hidden="true" />
      </div>
    </Link>
  )
}
