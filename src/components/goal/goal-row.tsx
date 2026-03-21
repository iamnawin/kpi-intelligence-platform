import Link from "next/link"
import { BarChart2, CheckSquare, User, Calendar, ChevronRight } from "lucide-react"
import { GoalStatusBadge } from "./goal-status-badge"
import { TrustBadge } from "./trust-badge"
import type { GoalWithCounts, GoalStatus } from "@/lib/goal-data"

const STATUS_DOT: Record<GoalStatus, string> = {
  not_started: 'bg-gray-300',
  in_progress:  'bg-blue-400',
  at_risk:      'bg-red-400',
  completed:    'bg-green-400',
  cancelled:    'bg-gray-200',
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

type Props = {
  goal: GoalWithCounts
  depth?: number
}

export function GoalRow({ goal, depth = 0 }: Props) {
  const dueDate = formatDate(goal.end_date)
  const hasMeta = goal.owner_name || dueDate || goal.sub_goal_count > 0 || goal.task_count > 0 || goal.kpi_count > 0

  return (
    <Link
      href={`/goals/${goal.id}`}
      className={`group flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:hover:bg-gray-800 ${
        depth > 0 ? 'pl-10 border-l-2 border-gray-100 dark:border-gray-800' : ''
      }`}
    >
      {/* Status dot */}
      <div className="mt-1.5 shrink-0">
        <span className={`block h-2 w-2 rounded-full ${STATUS_DOT[goal.status]}`} aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        {/* Title + badges */}
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-gray-800 group-hover:text-gray-900 dark:text-gray-200 dark:group-hover:text-gray-50">
            {goal.title}
          </p>
          <div className="flex shrink-0 items-center gap-1.5">
            <GoalStatusBadge status={goal.status} />
            <TrustBadge level={goal.trust_level} />
            <ChevronRight className="h-3.5 w-3.5 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
          </div>
        </div>

        {/* Meta row: owner · due date · counts */}
        {hasMeta && (
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-400 dark:text-gray-500">
            {goal.owner_name && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" aria-hidden="true" />
                {goal.owner_name}
              </span>
            )}
            {dueDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" aria-hidden="true" />
                {dueDate}
              </span>
            )}
            {goal.sub_goal_count > 0 && (
              <span>{goal.sub_goal_count} sub-goal{goal.sub_goal_count !== 1 ? 's' : ''}</span>
            )}
            {goal.task_count > 0 && (
              <span className="flex items-center gap-1">
                <CheckSquare className="h-3 w-3" aria-hidden="true" />
                {goal.task_done_count}/{goal.task_count} tasks
              </span>
            )}
            {goal.kpi_count > 0 && (
              <span className="flex items-center gap-1">
                <BarChart2 className="h-3 w-3" aria-hidden="true" />
                {goal.kpi_count} KPI{goal.kpi_count !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}

        {/* Progress bar — secondary, only shown when non-zero */}
        {goal.progress_pct > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1 w-24 rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className="h-1 rounded-full bg-blue-300"
                style={{ width: `${goal.progress_pct}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500">{goal.progress_pct}%</span>
          </div>
        )}
      </div>
    </Link>
  )
}
