import Link from "next/link"
import { ArrowUpRight, BarChart2 } from "lucide-react"
import { GoalStatusBadge } from "./goal-status-badge"
import { TrustBadge } from "./trust-badge"
import type { GoalWithCounts } from "@/lib/goal-data"

export function GoalCard({ goal }: { goal: GoalWithCounts }) {
  return (
    <Link
      href={`/goals/${goal.id}`}
      className="group block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-900"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <p className="line-clamp-2 text-sm font-medium text-gray-800 group-hover:text-gray-900 dark:text-gray-200 dark:group-hover:text-gray-50">
          {goal.title}
        </p>
        <ArrowUpRight
          className="h-3.5 w-3.5 shrink-0 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden="true"
        />
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        <GoalStatusBadge status={goal.status} />
        <TrustBadge level={goal.trust_level} />
      </div>

      <div className="mb-3">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs text-gray-400 dark:text-gray-500">Progress</span>
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{goal.progress_pct}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800">
          <div
            className="h-1.5 rounded-full bg-blue-400 transition-all"
            style={{ width: `${goal.progress_pct}%` }}
          />
        </div>
      </div>

      {goal.kpi_count > 0 && (
        <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
          <BarChart2 className="h-3 w-3" />
          <span>
            {goal.kpi_count} KPI{goal.kpi_count !== 1 ? 's' : ''} linked
          </span>
        </div>
      )}
    </Link>
  )
}
