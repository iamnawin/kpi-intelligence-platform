import Link from 'next/link'
import { TrendingUp, CheckSquare, Activity, ChevronRight } from 'lucide-react'
import { GoalStatusBadge } from '@/components/goal/goal-status-badge'
import { formatNumber } from '@/lib/utils'
import type { GoalWithCounts, KRType } from '@/lib/goal-data'

const KR_ICON: Record<KRType, React.ElementType> = {
  metric:    TrendingUp,
  milestone: CheckSquare,
  activity:  Activity,
}

const KR_LABEL: Record<KRType, string> = {
  metric:    'Metric',
  milestone: 'Milestone',
  activity:  'Activity',
}

export function KeyResultRow({ kr }: { kr: GoalWithCounts }) {
  const KRIcon = kr.kr_type ? KR_ICON[kr.kr_type] : TrendingUp
  const krLabel = kr.kr_type ? KR_LABEL[kr.kr_type] : 'KR'

  return (
    <Link
      href={`/goals/${kr.id}`}
      className="group flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:hover:bg-gray-800"
    >
      {/* Type icon */}
      <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950">
        <KRIcon className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" aria-label={krLabel} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-800 group-hover:text-gray-900 dark:text-gray-200 dark:group-hover:text-gray-50 truncate">
          {kr.title}
        </p>

        {/* Progress bar */}
        <div className="mt-1.5 flex items-center gap-2">
          <div className="h-1.5 flex-1 max-w-[160px] rounded-full bg-gray-100 dark:bg-gray-800">
            <div
              className="h-1.5 rounded-full bg-blue-400 transition-all"
              style={{ width: `${kr.progress_pct}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500">{kr.progress_pct}%</span>
        </div>

        {/* Metric target */}
        {kr.kr_type === 'metric' && kr.target_value != null && (
          <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
            {kr.current_value != null
              ? `${formatNumber(kr.current_value, kr.unit ?? '')} / ${formatNumber(kr.target_value, kr.unit ?? '')}`
              : `Target: ${formatNumber(kr.target_value, kr.unit ?? '')}`}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <GoalStatusBadge status={kr.status} />
        <ChevronRight className="h-3.5 w-3.5 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-gray-600" aria-hidden="true" />
      </div>
    </Link>
  )
}
