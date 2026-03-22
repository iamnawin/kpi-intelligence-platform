import Link from "next/link"
import { BarChart2, CheckSquare, User, Calendar, ChevronRight } from "lucide-react"
import { GoalStatusBadge } from "./goal-status-badge"
import { TrustBadge } from "./trust-badge"
import type { GoalWithCounts, GoalStatus } from "@/lib/goal-data"

const STATUS_DOT: Record<GoalStatus, string> = {
  not_started: 'bg-gray-600',
  in_progress:  'bg-blue-400',
  at_risk:      'bg-red-400',
  completed:    'bg-emerald-400',
  cancelled:    'bg-gray-700',
}

const PROGRESS_BAR: Record<GoalStatus, string> = {
  not_started: 'bg-gray-600',
  in_progress:  'bg-blue-500',
  at_risk:      'bg-red-500',
  completed:    'bg-emerald-500',
  cancelled:    'bg-gray-700',
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

type Props = { goal: GoalWithCounts; depth?: number }

export function GoalRow({ goal, depth = 0 }: Props) {
  const dueDate = formatDate(goal.end_date)
  const hasMeta = goal.owner_name || dueDate || goal.sub_goal_count > 0 || goal.task_count > 0 || goal.kpi_count > 0

  return (
    <Link
      href={`/achievements/${goal.id}`}
      className={`group flex items-start gap-3 px-5 py-4 transition-colors hover:bg-gray-800/40 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 ${
        depth > 0 ? 'pl-12 border-l-2 border-gray-800' : ''
      }`}
    >
      {/* Status dot */}
      <div className="mt-2 shrink-0">
        <span className={`block h-2 w-2 rounded-full ${STATUS_DOT[goal.status]}`} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors">
            {goal.title}
          </p>
          <div className="flex shrink-0 items-center gap-1.5">
            <GoalStatusBadge status={goal.status} />
            <TrustBadge level={goal.trust_level} />
            <ChevronRight className="h-3.5 w-3.5 text-gray-600 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </div>

        {hasMeta && (
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-600">
            {goal.owner_name && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {goal.owner_name}
              </span>
            )}
            {dueDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {dueDate}
              </span>
            )}
            {goal.sub_goal_count > 0 && (
              <span>{goal.sub_goal_count} sub-goal{goal.sub_goal_count !== 1 ? 's' : ''}</span>
            )}
            {goal.task_count > 0 && (
              <span className="flex items-center gap-1">
                <CheckSquare className="h-3 w-3" />
                {goal.task_done_count}/{goal.task_count} tasks
              </span>
            )}
            {goal.kpi_count > 0 && (
              <span className="flex items-center gap-1">
                <BarChart2 className="h-3 w-3" />
                {goal.kpi_count} KPI{goal.kpi_count !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}

        {goal.progress_pct > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1 w-28 overflow-hidden rounded-full bg-gray-800">
              <div
                className={`h-full rounded-full ${PROGRESS_BAR[goal.status]}`}
                style={{ width: `${goal.progress_pct}%` }}
              />
            </div>
            <span className="text-[11px] text-gray-600">{goal.progress_pct}%</span>
          </div>
        )}
      </div>
    </Link>
  )
}
